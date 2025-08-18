package com.ekommerce.controller;

import com.ekommerce.dto.OrderDto;
import com.ekommerce.entity.OrderStatus;
import com.ekommerce.entity.ShippingStatus;
import com.ekommerce.service.OrderService;
import com.ekommerce.repository.UserRepository;
import com.ekommerce.entity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired private OrderService orderService;
    @Autowired private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> createOrder(@RequestBody OrderDto orderDto, Authentication auth) {
        try {
            Long userId = getUserIdFromAuthentication(auth);
            OrderDto createdOrder = orderService.createOrder(orderDto, userId);
            return ResponseEntity.ok(createdOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserOrders(Authentication auth) {
        try {
            Long userId = getUserIdFromAuthentication(auth);
            List<OrderDto> orders = orderService.getUserOrders(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getSellerOrders(Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            List<OrderDto> orders = orderService.getSellerOrders(sellerId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<OrderDto> getOrder(@PathVariable Long orderId, Authentication auth) {
        try {
            Long userId = getUserIdFromAuthentication(auth);
            OrderDto order = orderService.getOrderById(orderId, userId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId, Authentication auth) {
        try {
            String username = auth.getName();
            orderService.cancelOrder(orderId, username);
            return ResponseEntity.ok(Map.of("message", "Sipariş başarıyla iptal edildi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            OrderStatus status = OrderStatus.valueOf(request.get("status"));
            orderService.updateOrderStatus(orderId, status, sellerId);
            return ResponseEntity.ok(Map.of("message", "Sipariş durumu güncellendi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Satıcı ödeme onayı verdiğinde tek adımda CONFIRMED durumuna çeker
    @PutMapping("/{orderId}/approve")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> approveOrder(@PathVariable Long orderId, Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            orderService.updateOrderStatus(orderId, OrderStatus.CONFIRMED, sellerId);
            return ResponseEntity.ok(Map.of("message", "Sipariş onaylandı"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/shipping")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateShippingStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            Long sellerId = getUserIdFromAuthentication(auth);
            ShippingStatus shippingStatus = ShippingStatus.valueOf(request.get("shippingStatus"));
            orderService.updateShippingStatus(orderId, shippingStatus, sellerId);
            return ResponseEntity.ok(Map.of("message", "Kargo durumu güncellendi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Authentication missing");
        }
        Object principal = authentication.getPrincipal();
    if (principal instanceof com.ekommerce.entity.User u) {
            return u.getId();
        }
    if (principal instanceof UserDetails ud) {
        String username = ud.getUsername();
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        return user.getId();
    }
    // Fallback: use auth name
    String username = authentication.getName();
    User user = userRepository.findByEmail(username)
        .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    return user.getId();
    }
}