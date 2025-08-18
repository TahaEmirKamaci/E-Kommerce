package com.ekommerce.service;

import com.ekommerce.repository.UserRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String principal) throws UsernameNotFoundException {
        return userRepository.findByEmail(principal)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + principal));
    }

}