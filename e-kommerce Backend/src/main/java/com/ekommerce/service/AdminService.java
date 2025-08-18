package com.ekommerce.service;

import com.ekommerce.entity.User;
import com.ekommerce.entity.UserRole.RoleType;
import com.ekommerce.entity.Orders;
import com.ekommerce.repository.OrderRepository;
import com.ekommerce.repository.ProductRepository;
import com.ekommerce.repository.UserRepository;
import com.ekommerce.util.JwtUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final JwtUtil jwtUtil;

    public AdminService(UserRepository userRepository, ProductRepository productRepository, OrderRepository orderRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.jwtUtil = jwtUtil;
    }

    public List<User> getAllUsers(String token) {
        validateAdminToken(token);
        return userRepository.findAll();
    }

    public User updateUserRole(String token, Long userId, RoleType newRole) {
        validateAdminToken(token);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        user.setRoleType(newRole);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    public User updateUserStatus(String token, Long userId, Boolean isActive) {
        validateAdminToken(token);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        user.setIsActive(isActive);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }

    public Map<String, Object> getAdminStats(String token) {
        validateAdminToken(token);
    long totalUsers = userRepository.count();
    long customerCount = userRepository.countByRoleType(RoleType.CUSTOMER);
    long sellerCount = userRepository.countByRoleType(RoleType.SELLER);
    long adminCount = userRepository.countByRoleType(RoleType.ADMIN);
    long activeUsers = userRepository.countByIsActive(true);

    long totalProducts = productRepository.count();
    long activeProducts = productRepository.countByStatus(com.ekommerce.entity.Product.Status.ACTIVE);
    long inactiveProducts = productRepository.countByStatus(com.ekommerce.entity.Product.Status.INACTIVE);
    long oosProducts = productRepository.countByStatus(com.ekommerce.entity.Product.Status.OUT_OF_STOCK);

    // Live orders and revenue stats
    java.util.List<Orders> allOrders = orderRepository.findAll();
    long totalOrders = allOrders.size();
    java.math.BigDecimal totalRevenue = allOrders.stream()
        .map(o -> o.getTotalAmount() == null ? java.math.BigDecimal.ZERO : o.getTotalAmount())
        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

    // Simple “today” calculations
    java.time.LocalDate today = java.time.LocalDate.now();
    long todayOrders = allOrders.stream()
        .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().isEqual(today))
        .count();
    java.time.LocalDateTime startOfDay = today.atStartOfDay();
    java.time.LocalDateTime endOfDay = today.atTime(23,59,59);
    long todayUsers = userRepository.countByCreatedAtBetween(startOfDay, endOfDay);
    long lowStockProducts = productRepository.countByStockLessThanEqual(5);

    Map<String, Object> stats = new HashMap<>();
    stats.put("totalUsers", totalUsers);
    stats.put("customerCount", customerCount);
    stats.put("sellerCount", sellerCount);
    stats.put("adminCount", adminCount);
    stats.put("activeUsers", activeUsers);
    stats.put("totalProducts", totalProducts);
    stats.put("totalOrders", totalOrders);
    stats.put("totalRevenue", totalRevenue);
    stats.put("todayOrders", todayOrders);
    stats.put("activeProducts", activeProducts);
    stats.put("inactiveProducts", inactiveProducts);
    stats.put("outOfStockProducts", oosProducts);
    stats.put("todayUsers", todayUsers);
    stats.put("lowStockProducts", lowStockProducts);
    return stats;
    }

    public void validateAdminToken(String authHeader) {
        try {
            String token = authHeader == null ? null : authHeader.replace("Bearer ", "").trim();
            String email = jwtUtil.getEmailFromToken(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
            if (user.getRoleType() != RoleType.ADMIN) {
                throw new RuntimeException("Bu işlem için admin yetkisi gerekli");
            }
        } catch (Exception e) {
            throw new RuntimeException("Yetkisiz erişim: " + e.getMessage());
        }
    }

    public void deleteUser(String token, Long userId) {
        validateAdminToken(token);
        if (userId == null) throw new RuntimeException("Geçersiz kullanıcı id");
        userRepository.deleteById(userId);
    }
}
