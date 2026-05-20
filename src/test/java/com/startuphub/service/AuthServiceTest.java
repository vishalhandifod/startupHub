package com.startuphub.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.startuphub.config.JwtConfig;
import com.startuphub.dto.AuthResponse;
import com.startuphub.dto.LoginRequest;
import com.startuphub.dto.RegisterRequest;
import com.startuphub.entity.Role;
import com.startuphub.entity.User;
import com.startuphub.exception.DuplicateResourceException;
import com.startuphub.exception.InvalidCredentialsException;
import com.startuphub.repository.UserRepository;
import com.startuphub.security.CustomUserDetails;
import com.startuphub.security.JwtTokenProvider;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private JwtConfig jwtConfig;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        lenient().when(jwtConfig.getExpiration()).thenReturn(86400000L);
    }

    @Test
    void registerCreatesUserWithEncodedPasswordAndUserRole() {
        RegisterRequest request = new RegisterRequest("Alice", "alice@example.com", "password123");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtTokenProvider.generateToken(any(CustomUserDetails.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo("alice@example.com");
        assertThat(response.user().role()).isEqualTo("USER");
        verify(userRepository).save(argThat(user ->
            user.getRole() == Role.USER && "encoded-password".equals(user.getPassword())));
    }

    @Test
    void registerRejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("Alice", "alice@example.com", "password123");
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
            .isInstanceOf(DuplicateResourceException.class)
            .hasMessage("Email already registered");
    }

    @Test
    void loginRejectsInvalidPassword() {
        User user = User.builder()
            .email("alice@example.com")
            .password("encoded")
            .role(Role.USER)
            .build();

        LoginRequest request = new LoginRequest("alice@example.com", "wrongpass");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "encoded")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(InvalidCredentialsException.class)
            .hasMessage("Invalid email or password");
    }

    @Test
    void loginReturnsTokenGeneratedFromCustomUserDetails() {
        User user = User.builder()
            .id(1L)
            .name("Alice")
            .email("alice@example.com")
            .password("encoded")
            .role(Role.USER)
            .build();

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encoded")).thenReturn(true);
        when(jwtTokenProvider.generateToken(any(CustomUserDetails.class))).thenReturn("jwt-token");

        AuthResponse response = authService.login(new LoginRequest("alice@example.com", "password123"));

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().role()).isEqualTo("USER");
    }

    @Test
    void getCurrentUserReturnsSanitizedUserFromSecurityContext() {
        User user = User.builder()
            .id(10L)
            .name("Alice")
            .email("alice@example.com")
            .password("encoded")
            .role(Role.USER)
            .build();

        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(new CustomUserDetails(user), null)
        );

        try {
            assertThat(authService.getCurrentUser().email()).isEqualTo("alice@example.com");
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
