package com.ruralworkforce.marketplace.service;

import com.ruralworkforce.marketplace.dto.AuthResponse;
import com.ruralworkforce.marketplace.dto.LoginRequest;
import com.ruralworkforce.marketplace.dto.RegisterRequest;
import com.ruralworkforce.marketplace.entity.Role;
import com.ruralworkforce.marketplace.entity.User;
import com.ruralworkforce.marketplace.exception.ApiException;
import com.ruralworkforce.marketplace.repository.UserRepository;
import com.ruralworkforce.marketplace.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@SpringBootTest
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    void register_ValidRequest_ReturnsAuthResponse() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setPhone("1234567890");
        request.setPassword("password");
        request.setRole("WORKER");
        request.setSkills("skill1,skill2");

        when(userRepository.existsByPhone("1234567890")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");

        User savedUser = User.builder()
                .id(1L)
                .name("John Doe")
                .phone("1234567890")
                .password("encodedPassword")
                .role(Role.WORKER)
                .skills("skill1,skill2")
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(1L, "WORKER")).thenReturn("token");

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("token", response.token());
        assertEquals("WORKER", response.role());

        verify(userRepository).existsByPhone("1234567890");
        verify(passwordEncoder).encode("password");
        verify(userRepository).save(any(User.class));
        verify(jwtUtil).generateToken(1L, "WORKER");
    }

    @Test
    void register_InvalidRole_ThrowsException() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setRole("INVALID");

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> authService.register(request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Role must be WORKER or PROVIDER", exception.getMessage());
    }

    @Test
    void register_DuplicatePhone_ThrowsException() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setPhone("1234567890");
        request.setRole("WORKER");

        when(userRepository.existsByPhone("1234567890")).thenReturn(true);

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> authService.register(request));
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("Phone already registered", exception.getMessage());
    }

    @Test
    void login_ValidCredentials_ReturnsAuthResponse() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setPhone("1234567890");
        request.setPassword("password");

        User user = User.builder()
                .id(1L)
                .role(Role.WORKER)
                .password("encodedPassword")
                .build();

        when(userRepository.findByPhone("1234567890")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(1L, "WORKER")).thenReturn("token");

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("token", response.token());
        assertEquals("WORKER", response.role());
    }

    @Test
    void login_InvalidPhone_ThrowsException() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setPhone("1234567890");

        when(userRepository.findByPhone("1234567890")).thenReturn(Optional.empty());

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> authService.login(request));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        assertEquals("Invalid credentials", exception.getMessage());
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setPhone("1234567890");
        request.setPassword("wrongpassword");

        User user = User.builder()
                .password("encodedPassword")
                .build();

        when(userRepository.findByPhone("1234567890")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false);

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> authService.login(request));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        assertEquals("Invalid credentials", exception.getMessage());
    }
}