package com.ekommerce.controller;

import com.ekommerce.dto.ProductDto;
import com.ekommerce.entity.User;
import com.ekommerce.entity.UserRole;
import com.ekommerce.entity.UserRole.RoleType;
import com.ekommerce.service.AdminService;
import com.ekommerce.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private final AdminService adminService;

    @Autowired
    private ProductService productService;

    public AdminController(AdminService adminService) { this.adminService = adminService; }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        try {
            List<User> users = adminService.getAllUsers(token);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/users/{id}/role")
    public org.springframework.http.ResponseEntity<?> updateUserRole(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> roleRequest) {
        try {
            String roleStr = roleRequest.get("role");
            if (roleStr == null || roleStr.isBlank()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Rol değeri boş olamaz"));
            }
            RoleType newRole = RoleType.valueOf(roleStr.trim().toUpperCase());
            User updated = adminService.updateUserRole(token, id, newRole);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Geçersiz rol"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            adminService.deleteUser(token, id);
            return ResponseEntity.ok(Map.of("message", "Kullanıcı silindi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats(@RequestHeader("Authorization") String token) {
        try {
            Map<String, Object> stats = adminService.getAdminStats(token);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> statusRequest) {
        try {
            Boolean isActive = statusRequest.get("isActive");
            User updatedUser = adminService.updateUserStatus(token, id, isActive);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Products admin endpoints
    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(@RequestHeader("Authorization") String token) {
        try {
            adminService.validateAdminToken(token); // validate
            java.util.List<ProductDto> products = productService.getAllProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestBody ProductDto dto) {
        try {
            adminService.validateAdminToken(token);
            ProductDto updated = productService.updateProductAsAdmin(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {
        try {
            adminService.validateAdminToken(token);
            productService.deleteProductAsAdmin(id);
            return ResponseEntity.ok(Map.of("message", "Ürün silindi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
