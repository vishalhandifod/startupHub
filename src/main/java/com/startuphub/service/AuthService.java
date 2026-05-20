package com.startuphub.service;

import com.startuphub.config.JwtConfig;
import com.startuphub.dto.AuthResponse;
import com.startuphub.dto.LoginRequest;
import com.startuphub.dto.RegisterRequest;
import com.startuphub.dto.UserResponse;
import com.startuphub.entity.Role;
import com.startuphub.entity.User;
import com.startuphub.exception.DuplicateResourceException;
import com.startuphub.exception.InvalidCredentialsException;
import com.startuphub.repository.UserRepository;
import com.startuphub.security.CustomUserDetails;
import com.startuphub.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already registered");
        }

        User savedUser = userRepository.save(User.builder()
            .name(request.name())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .role(Role.USER)
            .build());

        return buildAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    public UserResponse getCurrentUser() {
        return mapToUserResponse(getCurrentAuthenticatedUser());
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        return userDetails.getUser();
    }

    private AuthResponse buildAuthResponse(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(user);
        return new AuthResponse(
            jwtTokenProvider.generateToken(userDetails),
            "Bearer",
            jwtConfig.getExpiration(),
            mapToUserResponse(user)
        );
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getBio(),
            user.getProfilePhoto(),
            user.getRole().name(),
            user.getCreatedAt()
        );
    }
}
