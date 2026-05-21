package com.startuphub.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.startuphub.config.SecurityConfig;
import com.startuphub.config.WebProperties;
import com.startuphub.dto.AuthResponse;
import com.startuphub.dto.RegisterRequest;
import com.startuphub.dto.UserResponse;
import com.startuphub.entity.Role;
import com.startuphub.exception.DuplicateResourceException;
import com.startuphub.exception.GlobalExceptionHandler;
import com.startuphub.security.CustomUserDetailsService;
import com.startuphub.security.JwtTokenProvider;
import com.startuphub.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private WebProperties webProperties;

    @Test
    void meEndpointRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void registerReturnsCreatedAuthResponse() throws Exception {
        AuthResponse authResponse = new AuthResponse(
            "jwt-token",
            "Bearer",
            86400000L,
            new UserResponse(1L, "Alice", "alice@example.com", null, null, Role.USER.name(), null)
        );

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/register")
                .contentType(APPLICATION_JSON)
                .content("""
                    {"name":"Alice","email":"alice@example.com","password":"password123"}
                    """))
            .andExpect(status().isCreated())
            .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("startuphub_auth=jwt-token")))
            .andExpect(jsonPath("$.token").value("jwt-token"))
            .andExpect(jsonPath("$.user.email").value("alice@example.com"));
    }

    @Test
    void duplicateRegistrationReturnsConflict() throws Exception {
        when(authService.register(any(RegisterRequest.class)))
            .thenThrow(new DuplicateResourceException("Email already registered"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(APPLICATION_JSON)
                .content("""
                    {"name":"Alice","email":"alice@example.com","password":"password123"}
                    """))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("Email already registered"));
    }
}
