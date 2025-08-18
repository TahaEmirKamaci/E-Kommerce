package com.ekommerce.service;

import com.ekommerce.dto.OrderDto;
import com.ekommerce.entity.*;
import com.ekommerce.repository.OrderItemRepository;
import com.ekommerce.repository.OrderRepository;
import com.ekommerce.repository.ProductRepository;
import com.ekommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;

    public OrderDto createOrder(OrderDto orderDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (orderDto.getItems() == null || orderDto.getItems().isEmpty()) {
            throw new RuntimeException("Sipariş kalemi bulunamadı");
        }
        if (orderDto.getShippingAddress() == null || orderDto.getShippingAddress().isBlank()) {
            throw new RuntimeException("Teslimat adresi zorunludur");
        }
        if (orderDto.getPaymentMethod() == null) {
            orderDto.setPaymentMethod(PaymentMethod.CARD);
        }

        // Tek satıcı kuralı ve toplam tutar hesaplama
        User singleSeller = null;
        BigDecimal total = BigDecimal.ZERO;

        List<OrderItem> preparedItems = new ArrayList<>();
        for (OrderItem itemDto : orderDto.getItems()) {
            Long productId = Optional.ofNullable(itemDto.getProduct())
                    .map(Product::getId)
                    .orElseThrow(() -> new RuntimeException("Ürün bilgisi eksik"));

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));

            if (product.getStock() < itemDto.getQuantity()) {
                throw new RuntimeException("Yetersiz stok: " + product.getName());
            }

            User pSeller = product.getSeller();
            if (singleSeller == null) {
                singleSeller = pSeller;
            } else if (!singleSeller.getId().equals(pSeller.getId())) {
                throw new RuntimeException("Tüm sipariş kalemleri aynı satıcıya ait olmalıdır");
            }

            BigDecimal linePrice = product.getPrice();
            total = total.add(linePrice.multiply(BigDecimal.valueOf(itemDto.getQuantity())));

            OrderItem oi = new OrderItem();
            oi.setProduct(product);
            oi.setSeller(pSeller);
            oi.setQuantity(itemDto.getQuantity());
            oi.setPrice(linePrice);
            preparedItems.add(oi);
        }

        Orders order = new Orders();
        order.setUser(user);
        order.setSeller(singleSeller);
        order.setTotalAmount(total);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(orderDto.getPaymentMethod());
        order.setShippingStatus(ShippingStatus.PREPARING);
        order.setShippingAddress(orderDto.getShippingAddress());
        order.setTrackingNumber(generateTrackingNumber());
        order.setCreatedAt(LocalDateTime.now());

        order = orderRepository.save(order);

        for (OrderItem oi : preparedItems) {
            oi.setOrder(order);
            oi.setCreatedAt(LocalDateTime.now());
            orderItemRepository.save(oi);

            // Stok güncelle
            Product p = oi.getProduct();
            p.setStock(p.getStock() - oi.getQuantity());
            productRepository.save(p);
        }

        return convertToDto(order);
    }

    public void cancelOrder(Long orderId, String username) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı"));

        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        boolean isOwner = order.getUser() != null && order.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() != null && user.getRole().equals(UserRole.ADMIN);
        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Bu siparişi iptal etme yetkiniz yok");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new RuntimeException("Bu sipariş iptal edilemez");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setShippingStatus(ShippingStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Stokları iade et
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : orderItems) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
    }

    public void updateOrderStatus(Long orderId, OrderStatus status, Long sellerId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı"));

        // Satıcı yetki kontrolü
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        boolean hasPermission = orderItems.stream()
                .anyMatch(item -> item.getSeller() != null && item.getSeller().getId().equals(sellerId));
        if (!hasPermission) throw new RuntimeException("Bu siparişi güncelleme yetkiniz yok");

        order.setStatus(status);
        switch (status) {
            case CONFIRMED -> order.setShippingStatus(ShippingStatus.PREPARING);
            case SHIPPED -> order.setShippingStatus(ShippingStatus.SHIPPED);
            case DELIVERED -> order.setShippingStatus(ShippingStatus.DELIVERED);
            case CANCELLED, REFUNDED -> order.setShippingStatus(ShippingStatus.CANCELLED);
            default -> { }
        }
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    public void updateShippingStatus(Long orderId, ShippingStatus shippingStatus, Long sellerId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı"));

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        boolean hasPermission = orderItems.stream()
                .anyMatch(item -> item.getSeller() != null && item.getSeller().getId().equals(sellerId));
        if (!hasPermission) throw new RuntimeException("Bu siparişi güncelleme yetkiniz yok");

        order.setShippingStatus(shippingStatus);
        // Durum senkronu (opsiyonel)
        switch (shippingStatus) {
            case PREPARING -> order.setStatus(OrderStatus.CONFIRMED);
            case SHIPPED -> order.setStatus(OrderStatus.SHIPPED);
            case DELIVERED -> order.setStatus(OrderStatus.DELIVERED);
            case CANCELLED -> order.setStatus(OrderStatus.CANCELLED);
        }
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    public List<OrderDto> getUserOrders(Long userId) {
        List<Orders> orders = orderRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        return orders.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<OrderDto> getSellerOrders(Long sellerId) {
        List<Orders> orders = orderRepository.findBySeller_IdOrderByCreatedAtDesc(sellerId);
        return orders.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public OrderDto getOrderById(Long orderId, Long userId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Sipariş bulunamadı"));

        boolean isOwner = order.getUser() != null && order.getUser().getId().equals(userId);
        if (!isOwner) throw new RuntimeException("Bu siparişi görüntüleme yetkiniz yok");

        return convertToDto(order);
    }

    private String generateTrackingNumber() {
        return "TRK" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private OrderDto convertToDto(Orders order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setSellerId(order.getSellerId());
    if (order.getUser() != null) {
        String fullName = String.format("%s %s",
            Optional.ofNullable(order.getUser().getFirstName()).orElse(""),
            Optional.ofNullable(order.getUser().getLastName()).orElse("")).trim();
        dto.setBuyerName(fullName.isBlank() ? order.getUser().getEmail() : fullName);
        dto.setBuyerEmail(order.getUser().getEmail());
    }
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setShippingStatus(order.getShippingStatus());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setTrackingNumber(order.getTrackingNumber());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        dto.setItems(items);

        return dto;
    }
}
