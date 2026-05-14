package com.ruralworkforce.marketplace.service;

import com.ruralworkforce.marketplace.dto.AuthResponse;
import com.ruralworkforce.marketplace.dto.LoginRequest;
import com.ruralworkforce.marketplace.dto.RegisterRequest;
import com.ruralworkforce.marketplace.entity.Role;
import com.ruralworkforce.marketplace.entity.User;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.UserRepository;
import com.ruralworkforce.marketplace.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        // Validate role
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Role must be WORKER or PROVIDER");
        }
        if (role != Role.WORKER && role != Role.PROVIDER) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Role must be WORKER or PROVIDER");
        }

        // Check duplicate phone
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ApiException(HttpStatus.CONFLICT, "Phone already registered");
        }

        // Build and save user
        User user = User.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .skills(request.getSkills())
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name());
    }
}
