package com.ekommerce.controller;

import com.ekommerce.entity.User;
import com.ekommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // "Bearer " kısmını çıkar
            User user = userService.getUserProfile(token);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateUserProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody User userDetails) {
        try {
            String token = authHeader.substring(7);
            User updatedUser = userService.updateUserProfile(token, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> passwordData) {
        try {
            String token = authHeader.substring(7);
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            userService.changePassword(token, currentPassword, newPassword);

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
