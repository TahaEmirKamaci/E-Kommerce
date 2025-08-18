package com.ekommerce.service;

import com.ekommerce.dto.LoginDto;
import com.ekommerce.dto.RegisterDto;
import com.ekommerce.entity.User;
import com.ekommerce.entity.UserRole;
import com.ekommerce.entity.UserRole.RoleType;
import com.ekommerce.repository.UserRepository;
import com.ekommerce.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    private RoleType resolveRole(RegisterDto dto) {
        if (dto.getRole_type() != null) {
            return switch (dto.getRole_type()) {
                case 1 -> RoleType.ADMIN;
                case 3 -> RoleType.SELLER;
                case 2 -> RoleType.CUSTOMER;
                default -> RoleType.CUSTOMER;
            };
        }
        if (dto.getRole() != null) {
            try { return RoleType.valueOf(dto.getRole().trim().toUpperCase()); }
            catch (IllegalArgumentException ignored) { }
        }
        return RoleType.CUSTOMER;
    }

    public Map<String, Object> register(RegisterDto registerDto) {
        try {
            System.out.println("=== AUTH SERVICE REGISTER START ===");
            
            // Null kontrolleri
            if (registerDto.getFirstName() == null || registerDto.getFirstName().trim().isEmpty()) {
                throw new IllegalArgumentException("Ad alanı boş olamaz");
            }
            if (registerDto.getLastName() == null || registerDto.getLastName().trim().isEmpty()) {
                throw new IllegalArgumentException("Soyad alanı boş olamaz");
            }
            if (registerDto.getEmail() == null || registerDto.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("E-posta alanı boş olamaz");
            }
            if (registerDto.getPassword() == null || registerDto.getPassword().trim().isEmpty()) {
                throw new IllegalArgumentException("Şifre alanı boş olamaz");
            }

            System.out.println("Validation passed");

            // E-posta kontrolü
            Optional<User> existingUser = userRepository.findByEmail(registerDto.getEmail());
            if (existingUser.isPresent()) {
                throw new RuntimeException("Bu e-posta adresi zaten kullanılıyor");
            }

            System.out.println("Email check passed");

            // Role belirleme
            RoleType roleType = resolveRole(registerDto);
            System.out.println("Determined role: " + roleType);

            // Yeni kullanıcı oluştur
            User user = new User();
            user.setFirstName(registerDto.getFirstName().trim());
            user.setLastName(registerDto.getLastName().trim());
            user.setEmail(registerDto.getEmail().trim().toLowerCase());
            user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
            
            // UserRole oluştur
            UserRole userRole = new UserRole();
            userRole.setRoleType(roleType);
            user.setRole(userRole);
            user.setPhone(registerDto.getPhone() != null ? registerDto.getPhone().trim() : "");
            user.setCity(registerDto.getCity() != null ? registerDto.getCity().trim() : "");
            user.setAddress(registerDto.getAddress() != null ? registerDto.getAddress().trim() : "");
            user.setCountry(registerDto.getCountry() != null ? registerDto.getCountry().trim() : "Türkiye");
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            System.out.println("User object created, saving to database...");

            // Kullanıcıyı kaydet
            User savedUser = userRepository.save(user);
            System.out.println("User saved with ID: " + savedUser.getId());

            // JWT token oluştur
            String token = jwtUtil.generateToken(savedUser.getEmail());
            System.out.println("JWT token generated");

            // Response oluştur
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", savedUser.getId());
            userResponse.put("firstName", savedUser.getFirstName());
            userResponse.put("lastName", savedUser.getLastName());
            userResponse.put("email", savedUser.getEmail());
            userResponse.put("role", savedUser.getRole().toString());
            userResponse.put("phone", savedUser.getPhone());
            userResponse.put("city", savedUser.getCity());
            userResponse.put("address", savedUser.getAddress());
            userResponse.put("country", savedUser.getCountry());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Kayıt başarılı");
            response.put("token", token);
            response.put("user", userResponse);

            System.out.println("Registration completed successfully");
            return response;

        } catch (Exception e) {
            System.err.println("Registration failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Kayıt işlemi başarısız: " + e.getMessage());
        }
    }

    public Map<String, Object> login(LoginDto loginDto) {
        try {
            System.out.println("=== AUTH SERVICE LOGIN START ===");
            System.out.println("Login attempt for: " + loginDto.getIdentifier());

            // email veya username gönderilmiş olabilir
            String id = (loginDto.getEmail() != null && !loginDto.getEmail().isBlank())
                    ? loginDto.getEmail().trim()
                    : (loginDto.getUsername() != null ? ((String) loginDto.getUsername()).trim() : null);

            if (id == null || loginDto.getPassword() == null) {
                throw new RuntimeException("Email/Username ve şifre gerekli");
            }

            // Authentication
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    id, 
                    loginDto.getPassword()
                )
            );

            System.out.println("Authentication successful");

            // Kullanıcıyı bul
            User user = userRepository.findByEmail(id)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

            System.out.println("User found: " + user.getEmail());

            // JWT token oluştur
            String token = jwtUtil.generateToken(user.getEmail());

            // Response oluştur
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", user.getId());
            userResponse.put("firstName", user.getFirstName());
            userResponse.put("lastName", user.getLastName());
            userResponse.put("email", user.getEmail());
            userResponse.put("role", user.getRole().toString());
            userResponse.put("phone", user.getPhone());
            userResponse.put("city", user.getCity());
            userResponse.put("address", user.getAddress());
            userResponse.put("country", user.getCountry());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Giriş başarılı");
            response.put("token", token);
            response.put("user", userResponse);

            System.out.println("Login completed successfully");
            return response;

        } catch (Exception e) {
            System.err.println("Login failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            throw new RuntimeException("Giriş başarısız: " + e.getMessage());
        }
    }

    public Map<String, Object> login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Bad credentials"));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Bad credentials");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        Map<String, Object> payload = new HashMap<>();
        payload.put("token", token);
        payload.put("user", user);
        return payload;
    }

    public User getCurrentUser(String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.getEmailFromToken(token);
            
            return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
                
        } catch (Exception e) {
            throw new RuntimeException("Token geçersiz: " + e.getMessage());
        }
    }
}