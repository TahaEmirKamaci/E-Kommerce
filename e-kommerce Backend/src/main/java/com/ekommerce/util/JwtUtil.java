package com.ekommerce.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    // application.properties: jwt.secret, jwt.expirationMs
    @Value("${jwt.secret:SuperSecretKeyForJWTGeneration12345SuperSecretKeyForJWTGeneration12345}")
    private String secret;

    @Value("${jwt.expirationMs:3600000}")
    private long expirationMs;

    private Key getSigningKey() {
        // HS256 için yeterli uzunlukta key
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String subject) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateTokenForUsername(String token, String username) {
        try {
            String sub = extractUsername(token);
            return sub != null && sub.equals(username) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public boolean isTokenExpired(String token) {
        Date exp = extractExpiration(token);
        return exp.before(new Date());
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Geriye dönük uyumluluk isimleri
    public String getUsernameFromToken(String token) { return extractUsername(token); }
    public String getEmailFromToken(String token) { return extractUsername(token); }

    public Long getUserIdFromUsername(String username) {
        // This method would typically require a database lookup
        // You'll need to inject a UserService or UserRepository here
        // Example implementation would be:
        // return userRepository.findByUsername(username).map(User::getId).orElse(null);
        
        // For now, returning null as this requires database integration
        return null;
    }
}