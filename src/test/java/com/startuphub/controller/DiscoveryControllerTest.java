package com.startuphub.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.startuphub.config.SecurityConfig;
import com.startuphub.config.WebProperties;
import com.startuphub.dto.AuthorSummaryResponse;
import com.startuphub.dto.NotificationResponse;
import com.startuphub.dto.PostResponse;
import com.startuphub.dto.SearchUserResponse;
import com.startuphub.dto.SuggestedConnectionResponse;
import com.startuphub.exception.GlobalExceptionHandler;
import com.startuphub.security.CustomUserDetailsService;
import com.startuphub.security.JwtTokenProvider;
import com.startuphub.service.DiscoveryService;
import com.startuphub.service.NotificationService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DiscoveryController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class DiscoveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DiscoveryService discoveryService;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private WebProperties webProperties;

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void searchUsersReturnsOk() throws Exception {
        when(discoveryService.searchUsers("bob")).thenReturn(List.of(
            new SearchUserResponse(2L, "Bob", "bob@example.com", "Investor", null, "USER", true)
        ));

        mockMvc.perform(get("/api/discovery/search/users").param("q", "bob"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].followedByCurrentUser").value(true));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void suggestionsReturnsOk() throws Exception {
        when(discoveryService.getSuggestions()).thenReturn(List.of(
            new SuggestedConnectionResponse(3L, "Carol", "carol@example.com", "Builder", null, "USER", 9L)
        ));

        mockMvc.perform(get("/api/discovery/suggestions"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].followerCount").value(9));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void discoveryFeedReturnsOk() throws Exception {
        when(discoveryService.getDiscoveryFeed()).thenReturn(List.of(
            new PostResponse(
                10L,
                "Founder update",
                null,
                LocalDateTime.of(2026, 5, 20, 15, 0),
                new AuthorSummaryResponse(1L, "Alice", "alice@example.com", null, "USER"),
                2L,
                1L,
                true
            )
        ));

        mockMvc.perform(get("/api/discovery/feed"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].content").value("Founder update"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void notificationsReturnsOk() throws Exception {
        when(notificationService.getNotifications()).thenReturn(List.of(notificationResponse(false)));

        mockMvc.perform(get("/api/notifications"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].type").value("FOLLOW"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void markNotificationReadReturnsOk() throws Exception {
        when(notificationService.markAsRead(20L)).thenReturn(notificationResponse(true));

        mockMvc.perform(put("/api/notifications/20/read"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.read").value(true));
    }

    private NotificationResponse notificationResponse(boolean isRead) {
        return new NotificationResponse(
            20L,
            "FOLLOW",
            "Bob started following you",
            isRead,
            LocalDateTime.of(2026, 5, 20, 16, 0),
            new AuthorSummaryResponse(2L, "Bob", "bob@example.com", null, "USER"),
            null
        );
    }
}
