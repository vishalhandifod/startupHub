package com.startuphub.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.startuphub.config.SecurityConfig;
import com.startuphub.config.WebProperties;
import com.startuphub.dto.AuthorSummaryResponse;
import com.startuphub.dto.CreateStartupRequest;
import com.startuphub.dto.StartupResponse;
import com.startuphub.dto.StartupSummaryResponse;
import com.startuphub.dto.UpdateStartupRequest;
import com.startuphub.exception.GlobalExceptionHandler;
import com.startuphub.security.CustomUserDetailsService;
import com.startuphub.security.JwtTokenProvider;
import com.startuphub.service.StartupService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(StartupController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class StartupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StartupService startupService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private WebProperties webProperties;

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void createStartupReturnsCreated() throws Exception {
        when(startupService.createStartup(any(CreateStartupRequest.class))).thenReturn(startupResponse());

        mockMvc.perform(post("/api/startups")
                .contentType(APPLICATION_JSON)
                .content("""
                    {"name":"Launch Labs","slug":"launch-labs","description":"Building tools for founders","website":"https://launchlabs.example.com","industry":"SaaS","location":"Pune"}
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.slug").value("launch-labs"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void updateStartupReturnsOk() throws Exception {
        when(startupService.updateStartup(any(Long.class), any(UpdateStartupRequest.class))).thenReturn(startupResponse());

        mockMvc.perform(put("/api/startups/10")
                .contentType(APPLICATION_JSON)
                .content("""
                    {"description":"Updated description","industry":"Fintech"}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.industry").value("SaaS"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void listStartupsReturnsOk() throws Exception {
        when(startupService.listStartups()).thenReturn(List.of(
            new StartupSummaryResponse(10L, "Launch Labs", "launch-labs", null, "SaaS", "Pune",
                LocalDateTime.of(2026, 5, 20, 16, 0), 3L)
        ));

        mockMvc.perform(get("/api/startups"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Launch Labs"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void getStartupReturnsOk() throws Exception {
        when(startupService.getStartup(10L)).thenReturn(startupResponse());

        mockMvc.perform(get("/api/startups/10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Launch Labs"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void followStartupReturnsOk() throws Exception {
        when(startupService.followStartup(10L)).thenReturn(startupResponse());

        mockMvc.perform(post("/api/startups/10/follow"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.followerCount").value(3));
    }

    @Test
    @WithMockUser(username = "bob@example.com", roles = "USER")
    void nonOwnerUpdateReturnsForbidden() throws Exception {
        when(startupService.updateStartup(any(Long.class), any(UpdateStartupRequest.class)))
            .thenThrow(new AccessDeniedException("You are not allowed to update this startup"));

        mockMvc.perform(put("/api/startups/10")
                .contentType(APPLICATION_JSON)
                .content("""
                    {"description":"Updated description"}
                    """))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value("You are not allowed to update this startup"));
    }

    private StartupResponse startupResponse() {
        return new StartupResponse(
            10L,
            "Launch Labs",
            "launch-labs",
            "Building tools for founders",
            null,
            "https://launchlabs.example.com",
            "SaaS",
            "Pune",
            LocalDateTime.of(2026, 5, 20, 16, 0),
            new AuthorSummaryResponse(1L, "Alice", "alice@example.com", null, "USER"),
            3L,
            true
        );
    }
}
