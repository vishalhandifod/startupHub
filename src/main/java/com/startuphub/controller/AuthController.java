package com.startuphub.controller;

import com.startuphub.dto.AuthResponse;
import com.startuphub.dto.LoginRequest;
import com.startuphub.dto.RegisterRequest;
import com.startuphub.dto.UserResponse;
import com.startuphub.security.JwtAuthenticationFilter;
import com.startuphub.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
        @Valid @RequestBody RegisterRequest request,
        HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.register(request);
        return withAuthCookie(ResponseEntity.status(HttpStatus.CREATED), authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.login(request);
        return withAuthCookie(ResponseEntity.ok(), authResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, clearAuthCookie().toString())
            .body(Map.of("message", "Logged out successfully"));
    }

    private ResponseEntity<AuthResponse> withAuthCookie(
        ResponseEntity.BodyBuilder builder,
        AuthResponse authResponse
    ) {
        return builder
            .header(HttpHeaders.SET_COOKIE, authCookie(authResponse.token()).toString())
            .body(authResponse);
    }

    private ResponseCookie authCookie(String token) {
        return ResponseCookie.from(JwtAuthenticationFilter.AUTH_COOKIE_NAME, token)
            .httpOnly(true)
            .path("/")
            .maxAge(Duration.ofDays(1))
            .sameSite("Lax")
            .build();
    }

    private ResponseCookie clearAuthCookie() {
        return ResponseCookie.from(JwtAuthenticationFilter.AUTH_COOKIE_NAME, "")
            .httpOnly(true)
            .path("/")
            .maxAge(Duration.ZERO)
            .sameSite("Lax")
            .build();
    }
}
