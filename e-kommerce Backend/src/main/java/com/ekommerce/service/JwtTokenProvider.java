package com.ekommerce.service;

import com.ekommerce.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    @Autowired
    private JwtUtil jwtUtil;

    public String generateToken(String subject) {
        return jwtUtil.generateToken(subject);
    }

    public String extractUsername(String token) {
        return jwtUtil.extractUsername(token);
    }

    public boolean isValid(String token) {
        return jwtUtil.isTokenValid(token);
    }

    public boolean isValidForUsername(String token, String username) {
        return jwtUtil.validateTokenForUsername(token, username);
    }
}
