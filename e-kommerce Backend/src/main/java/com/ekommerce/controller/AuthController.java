package com.ekommerce.controller;

import com.ekommerce.dto.LoginDto;
import com.ekommerce.dto.RegisterDto;
import com.ekommerce.entity.User;
import com.ekommerce.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto dto) {
        try {
            Map<String, Object> resp = authService.login(dto);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDto registerDto, BindingResult bindingResult) {
        try {
            System.out.println("=== REGISTER REQUEST START ===");
            System.out.println("Register request received: " + registerDto);
            System.out.println("FirstName: " + registerDto.getFirstName());
            System.out.println("LastName: " + registerDto.getLastName());
            System.out.println("Email: " + registerDto.getEmail());
            System.out.println("Role: " + registerDto.getRole());
            System.out.println("Role_type: " + registerDto.getRole_type());
            System.out.println("Phone: " + registerDto.getPhone());
            System.out.println("City: " + registerDto.getCity());
            System.out.println("Country: " + registerDto.getCountry());
            
            // Validation hatalarını kontrol et
            if (bindingResult.hasErrors()) {
                System.out.println("Validation errors found:");
                Map<String, String> errors = new HashMap<>();
                for (FieldError error : bindingResult.getFieldErrors()) {
                    System.out.println("Field: " + error.getField() + ", Error: " + error.getDefaultMessage());
                    errors.put(error.getField(), error.getDefaultMessage());
                }
                return ResponseEntity.badRequest().body(Map.of("errors", errors));
            }

            Map<String, Object> response = authService.register(registerDto);
            System.out.println("Registration successful");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            User user = authService.getCurrentUser(token);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            System.err.println("Get current user error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
    return ResponseEntity.ok(Map.of("success", true, "message", "Çıkış başarılı"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            return ResponseEntity.ok(Map.of("message", "Şifre sıfırlama e-postası gönderildi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}