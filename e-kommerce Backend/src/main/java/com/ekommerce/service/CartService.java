package com.ekommerce.service;

import com.ekommerce.dto.CartDto;
import com.ekommerce.entity.Cart;
import com.ekommerce.entity.CartItem;
import com.ekommerce.entity.Product;
import com.ekommerce.entity.User;
import com.ekommerce.repository.CartItemRepository;
import com.ekommerce.repository.CartRepository;
import com.ekommerce.repository.ProductRepository;
import com.ekommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;

    // Sepeti getir veya oluştur (userId varsa kullanıcıya ait, yoksa sessionId'ye ait)
    public Cart getOrCreateCart(String sessionId, Long userId) {
        Cart cart;

        if (userId != null) {
            // Kullanıcıya ait sepet
            cart = cartRepository.findByUser_Id(userId).orElseGet(Cart::new);

            if (cart.getUser() == null || cart.getUser().getId() == null) {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
                cart.setUser(user);
            }

            // Session sepetini kullanıcı sepetine birleştir
            if (sessionId != null && !sessionId.isBlank()) {
                Optional<Cart> sessionCart = cartRepository.findBySessionId(sessionId);
                if (sessionCart.isPresent()) {
                    mergeSessionCartToUserCart(sessionCart.get(), cart);
                    cartRepository.delete(sessionCart.get());
                }
            }
        } else {
            // Misafir sepeti
            cart = cartRepository.findBySessionId(sessionId).orElseGet(Cart::new);
            cart.setSessionId(sessionId);
        }

        if (cart.getCartItems() == null) {
            cart.setCartItems(new ArrayList<>());
        }

        return cartRepository.save(cart);
    }

    private void mergeSessionCartToUserCart(Cart sessionCart, Cart userCart) {
        if (sessionCart.getCartItems() == null) return;
        if (userCart.getCartItems() == null) userCart.setCartItems(new ArrayList<>());

        for (CartItem sessionItem : sessionCart.getCartItems()) {
            Optional<CartItem> existingItem = userCart.getCartItems().stream()
                    .filter(item -> item.getProduct().getId().equals(sessionItem.getProduct().getId()))
                    .findFirst();

            if (existingItem.isPresent()) {
                CartItem item = existingItem.get();
                item.setQuantity(item.getQuantity() + sessionItem.getQuantity());
                cartItemRepository.save(item);
            } else {
                CartItem newItem = new CartItem();
                newItem.setCart(userCart);
                newItem.setProduct(sessionItem.getProduct());
                newItem.setQuantity(sessionItem.getQuantity());
                newItem.setPrice(sessionItem.getPrice());
                userCart.getCartItems().add(cartItemRepository.save(newItem));
            }
        }
    }

    public CartDto getCartDto(String sessionId, Long userId) {
        Cart cart = getOrCreateCart(sessionId, userId);
        return toDto(cart);
    }

    public CartDto addToCart(String sessionId, Long userId, Long productId, int quantity) {
        if (quantity <= 0) throw new RuntimeException("Adet 1 veya daha büyük olmalıdır");

        Cart cart = getOrCreateCart(sessionId, userId);
        if (cart.getCartItems() == null) cart.setCartItems(new ArrayList<>());

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));

        // Var olan kalemi bul
        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;
            if (product.getStock() < newQuantity) throw new RuntimeException("Yetersiz stok");
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            if (product.getStock() < quantity) throw new RuntimeException("Yetersiz stok");
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setPrice(product.getPrice());
            cart.getCartItems().add(cartItemRepository.save(newItem));
        }

        cart = cartRepository.save(cart);
        return toDto(cart);
    }

    public CartDto updateCartItem(String sessionId, Long userId, Long cartItemId, int quantity) {
        if (quantity < 0) throw new RuntimeException("Adet 0 veya daha büyük olmalıdır");

        Cart cart = getOrCreateCart(sessionId, userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Sepet ürünü bulunamadı"));

        if (item.getCart() == null || !item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Bu ürün sizin sepetinizde değil");
        }

        if (quantity == 0) {
            cartItemRepository.delete(item);
            cart.getCartItems().removeIf(ci -> ci.getId().equals(item.getId()));
        } else {
            if (item.getProduct().getStock() < quantity) throw new RuntimeException("Yetersiz stok");
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        cart = cartRepository.save(cart);
        return toDto(cart);
    }

    public CartDto removeFromCart(String sessionId, Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(sessionId, userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Sepet ürünü bulunamadı"));

        if (item.getCart() == null || !item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Bu ürün sizin sepetinizde değil");
        }

        cartItemRepository.delete(item);
        cart.getCartItems().removeIf(ci -> ci.getId().equals(item.getId()));

        cart = cartRepository.save(cart);
        return toDto(cart);
    }

    public void clearCart(String sessionId, Long userId) {
        Cart cart = getOrCreateCart(sessionId, userId);
        if (cart.getCartItems() != null && !cart.getCartItems().isEmpty()) {
            cartItemRepository.deleteAll(cart.getCartItems());
            cart.getCartItems().clear();
            cartRepository.save(cart);
        }
    }

    private CartDto toDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser() != null ? cart.getUser().getId() : null);
        dto.setSessionId(cart.getSessionId());
        dto.setCreatedAt(cart.getCreatedAt());
        dto.setUpdatedAt(cart.getUpdatedAt());

        var items = (cart.getCartItems() == null ? new ArrayList<CartItem>() : cart.getCartItems())
                .stream()
                .map(ci -> {
                    CartDto.Item it = new CartDto.Item();
                    it.setId(ci.getId());
                    it.setProductId(ci.getProduct() != null ? ci.getProduct().getId() : null);
                    it.setProductName(ci.getProduct() != null ? ci.getProduct().getName() : null);
                    it.setImageUrl(ci.getProduct() != null ? ci.getProduct().getImageUrl() : null);
                    it.setUnitPrice(ci.getPrice());
                    it.setQuantity(ci.getQuantity());
                    it.setLineTotal(ci.getTotalPrice());
                    return it;
                })
                .collect(Collectors.toList());

        dto.setItems(items);

        int totalQty = items.stream().mapToInt(CartDto.Item::getQuantity).sum();
        BigDecimal totalAmount = items.stream()
                .map(CartDto.Item::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setTotalQuantity(totalQty);
        dto.setTotalAmount(totalAmount);

        return dto;
    }
}