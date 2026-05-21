package com.startuphub.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import com.startuphub.dto.ProfileResponse;
import com.startuphub.dto.ProfileSummaryResponse;
import com.startuphub.dto.UpdateProfileRequest;
import com.startuphub.exception.GlobalExceptionHandler;
import com.startuphub.security.CustomUserDetailsService;
import com.startuphub.security.JwtTokenProvider;
import com.startuphub.service.ProfileService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProfileController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProfileService profileService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private WebProperties webProperties;

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void getMyProfileReturnsOk() throws Exception {
        when(profileService.getMyProfile()).thenReturn(profileResponse(1L, "Alice", false));

        mockMvc.perform(get("/api/profile/me"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("alice@example.com"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void updateMyProfileReturnsOk() throws Exception {
        when(profileService.updateMyProfile(any(UpdateProfileRequest.class)))
            .thenReturn(profileResponse(1L, "Alice", false));

        mockMvc.perform(put("/api/profile/me")
                .contentType(APPLICATION_JSON)
                .content("""
                    {"bio":"Founder building in public","profilePhoto":"https://example.com/alice.png"}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.bio").value("Founder building in public"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void getPublicProfileReturnsOk() throws Exception {
        when(profileService.getProfile(2L)).thenReturn(profileResponse(2L, "Bob", true));

        mockMvc.perform(get("/api/profile/2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.followedByCurrentUser").value(true));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void followUserReturnsOk() throws Exception {
        when(profileService.followUser(2L)).thenReturn(profileResponse(2L, "Bob", true));

        mockMvc.perform(post("/api/profile/2/follow"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.followerCount").value(1));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void selfFollowReturnsBadRequest() throws Exception {
        when(profileService.followUser(1L)).thenThrow(new IllegalArgumentException("You cannot follow yourself"));

        mockMvc.perform(post("/api/profile/1/follow"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("You cannot follow yourself"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void getFollowersReturnsOk() throws Exception {
        when(profileService.getFollowers(2L)).thenReturn(List.of(
            new ProfileSummaryResponse(1L, "Alice", "alice@example.com", "Builder", null, "USER")
        ));

        mockMvc.perform(get("/api/profile/2/followers"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Alice"));
    }

    private ProfileResponse profileResponse(Long id, String name, boolean followedByCurrentUser) {
        return new ProfileResponse(
            id,
            name,
            name.toLowerCase() + "@example.com",
            "Founder building in public",
            "https://example.com/" + name.toLowerCase() + ".png",
            "USER",
            LocalDateTime.of(2026, 5, 20, 12, 0),
            1L,
            2L,
            followedByCurrentUser
        );
    }
}
