package com.ekommerce.dto;

import com.ekommerce.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDto {
    
    @NotBlank(message = "Ad alanı zorunludur")
    private String firstName;
    
    @NotBlank(message = "Soyad alanı zorunludur")
    private String lastName;
    
    @NotBlank(message = "E-posta alanı zorunludur")
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;
    
    @NotBlank(message = "Şifre alanı zorunludur")
    @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır")
    private String password;
    
    private String role; // "CUSTOMER", "SELLER", "ADMIN"
    private Integer role_type; // 1=ADMIN, 2=CUSTOMER, 3=SELLER
    private String phone;
    private String city;
    private String address;
    private String country;

    public String getUserRole() {
        // Önce role_type'a bak
        if (role_type != null) {
            switch (role_type) {
                case 1: return UserRole.ADMIN;
                case 3: return UserRole.SELLER;
                case 2:
                default: return UserRole.CUSTOMER;
            }
        }
        
        // Sonra role string'ine bak
        if (role != null) {
            switch (role.toUpperCase()) {
                case "ADMIN": return UserRole.ADMIN;
                case "SELLER": return UserRole.SELLER;
                case "CUSTOMER": return UserRole.CUSTOMER;
                default: return UserRole.CUSTOMER;
            }
        }
        
        // Default olarak CUSTOMER
        return UserRole.CUSTOMER;
    }
}