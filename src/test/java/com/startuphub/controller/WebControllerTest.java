package com.startuphub.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import com.startuphub.config.SecurityConfig;
import com.startuphub.config.WebProperties;
import com.startuphub.exception.GlobalExceptionHandler;
import com.startuphub.security.CustomUserDetailsService;
import com.startuphub.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(WebController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class WebControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private WebProperties webProperties;

    @Test
    void landingPageReturnsOk() throws Exception {
        mockMvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(view().name("index"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void feedPageReturnsOkForAuthenticatedUser() throws Exception {
        mockMvc.perform(get("/app/feed"))
            .andExpect(status().isOk())
            .andExpect(view().name("feed"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void notificationsPageReturnsOkForAuthenticatedUser() throws Exception {
        mockMvc.perform(get("/app/notifications"))
            .andExpect(status().isOk())
            .andExpect(view().name("notifications"));
    }
}
