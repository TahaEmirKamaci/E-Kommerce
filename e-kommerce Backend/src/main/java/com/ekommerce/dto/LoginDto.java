package com.ekommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginDto {
    private String email;
    private String password;
    private String username;
    
    // Getter/Setter methods (Lombok ile otomatik oluşturulur)
    public String getEmail() {
        return email != null ? email : "";
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPassword() {
        return password != null ? password : "";
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getUsername() {
        return username != null ? username : "";
    }
    public String getIdentifier() {
        return email != null ? email : username != null ? username : "";
    }
}
