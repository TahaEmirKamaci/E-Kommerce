package com.ekommerce.controller;

import com.ekommerce.dto.CartDto;
import com.ekommerce.service.CartService;
import com.ekommerce.service.JwtService;
import com.ekommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    private Long getUserIdFromToken(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token != null) {
                String username = jwtService.extractUsername(token);
                if (username != null && !jwtService.isTokenExpired(token)) {
                    return userRepository.findByEmail(username)
                            .map(u -> u.getId())
                            .orElse(null);
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private String ensureSessionId(String sessionId, HttpServletRequest request) {
        if (sessionId == null || sessionId.isBlank()) {
            // Tarayıcı session id kullan (misafir sepetleri için)
            return request.getSession(true).getId();
        }
        return sessionId;
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart(
            @RequestParam(required = false) String sessionId,
            HttpServletRequest request) {

        Long userId = getUserIdFromToken(request);
        String sid = ensureSessionId(sessionId, request);
        CartDto cart = cartService.getCartDto(sid, userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<CartDto> addToCart(
            @RequestParam(required = false) String sessionId,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity,
            HttpServletRequest httpRequest) {

        Long userId = getUserIdFromToken(httpRequest);
        String sid = ensureSessionId(sessionId, httpRequest);
        CartDto cart = cartService.addToCart(sid, userId, productId, quantity);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<CartDto> updateCartItem(
            @PathVariable Long itemId,
            @RequestParam(required = false) String sessionId,
            @RequestParam Integer quantity,
            HttpServletRequest httpRequest) {

        Long userId = getUserIdFromToken(httpRequest);
        String sid = ensureSessionId(sessionId, httpRequest);
        CartDto cart = cartService.updateCartItem(sid, userId, itemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<CartDto> removeFromCart(
            @PathVariable Long itemId,
            @RequestParam(required = false) String sessionId,
            HttpServletRequest httpRequest) {

        Long userId = getUserIdFromToken(httpRequest);
        String sid = ensureSessionId(sessionId, httpRequest);
        CartDto cart = cartService.removeFromCart(sid, userId, itemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(
            @RequestParam(required = false) String sessionId,
            HttpServletRequest request) {

        Long userId = getUserIdFromToken(request);
        String sid = ensureSessionId(sessionId, request);
        cartService.clearCart(sid, userId);
        return ResponseEntity.ok().build();
    }
}