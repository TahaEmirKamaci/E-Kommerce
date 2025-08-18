package com.ekommerce.service;

import com.ekommerce.entity.User;
import com.ekommerce.entity.UserRole.RoleType;
import com.ekommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public List<User> getAdmins() {
        return userRepository.findByRoleType(RoleType.ADMIN);
    }

    public List<User> getSellers() {
        return userRepository.findByRoleType(RoleType.SELLER);
    }

    public List<User> getCustomers() {
        return userRepository.findByRoleType(RoleType.CUSTOMER);
    }

    public UserDetails loadUserByUsername(String principal) throws UsernameNotFoundException {
        // principal is email
        return userRepository.findByEmail(principal)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + principal));
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) return null;

        Object principal = authentication.getPrincipal();
        if (principal instanceof User u) {
            // Entity doğrudan principal ise
            return userRepository.findById(u.getId()).orElse(u);
        }
        if (principal instanceof UserDetails ud) {
            // Username çoğu yapıda email’dir
            String identifier = ud.getUsername();
            return userRepository.findByEmail(identifier).orElseThrow(
                () -> new UsernameNotFoundException("User not found: " + identifier)
            );
        }
        return null;
    }

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User register(User user) {
        user.setEmail(user.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setFirstName(userDetails.getFirstName());
                    user.setLastName(userDetails.getLastName());
                    user.setEmail(userDetails.getEmail());
                    user.setPhone(userDetails.getPhone());
                    user.setAddress(userDetails.getAddress());
                    user.setCity(userDetails.getCity());
                    user.setCountry(userDetails.getCountry());
                    if (user.isSeller()) {
                        user.setShopName(userDetails.getShopName());
                        user.setShopAddress(userDetails.getShopAddress());
                        user.setShopDescription(userDetails.getShopDescription());
                    }
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // Token yardımcıları
    private String normalizeToken(String token) {
        return token == null ? null : token.replace("Bearer ", "").trim();
    }
    private String extractEmailFromToken(String token) {
        String raw = normalizeToken(token);
        return jwtService.extractUsernameFromToken(raw);
    }

    public User getUserProfile(String token) {
        String email = extractEmailFromToken(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    // String role -> RoleType çevirip doğru repository metodunu çağır
    public List<User> getUsersByRole(String role) {
        RoleType roleType = RoleType.valueOf(role.toUpperCase());
        return userRepository.findByRoleType(roleType);
    }

    public Page<User> searchUsers(String search, Pageable pageable) {
        return userRepository.searchUsers(search, pageable);
    }

    // Bu projede username için email kullanılıyorsa mevcut davranışı koru
    public boolean existsByUsername(String username) {
        return userRepository.findByEmail(username).isPresent();
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void activateUser(Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setIsActive(true);
            userRepository.save(user);
        });
    }

    public void deactivateUser(Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setIsActive(false);
            userRepository.save(user);
        });
    }

    public long countUsersByRole(String role) {
        RoleType roleType = RoleType.valueOf(role.toUpperCase());
        return userRepository.countByRoleType(roleType);
    }

    public User getUserByToken(String token) {
        String email = extractEmailFromToken(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUserProfile(String token, User userDetails) {
        String email = extractEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setAddress(userDetails.getAddress());
        user.setCity(userDetails.getCity());
        user.setCountry(userDetails.getCountry());

        if (user.isSeller()) {
            user.setShopName(userDetails.getShopName());
            user.setShopAddress(userDetails.getShopAddress());
            user.setShopDescription(userDetails.getShopDescription());
        }

        return userRepository.save(user);
    }

    public void changePassword(String token, String currentPassword, String newPassword) {
        String email = extractEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Oturumdaki kullanıcının ID’sini döner (username çoğu yapıda email’dir)
    public Long getCurrentUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new UsernameNotFoundException("Authentication not found");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof User u) return u.getId();
        if (principal instanceof UserDetails ud) {
            String email = ud.getUsername(); // bizde username=email
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        }
        throw new UsernameNotFoundException("Unsupported principal");
    }

    
}
