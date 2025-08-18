package com.ekommerce.config;

import com.ekommerce.entity.User;
import com.ekommerce.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("default")
public class PasswordBackfillRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordBackfillRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        userRepository.findAll().forEach(u -> {
            String p = u.getPassword();
            if (p != null && !p.startsWith("$2")) { // not bcrypt
                u.setPassword(passwordEncoder.encode(p));
                userRepository.save(u);
            }
        });
    }
}