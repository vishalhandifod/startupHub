package com.startuphub.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.startuphub.config.SecurityConfig;
import com.startuphub.config.WebProperties;
import com.startuphub.dto.AuthorSummaryResponse;
import com.startuphub.dto.ConversationSummaryResponse;
import com.startuphub.dto.MessageResponse;
import com.startuphub.dto.SendMessageRequest;
import com.startuphub.exception.GlobalExceptionHandler;
import com.startuphub.security.CustomUserDetailsService;
import com.startuphub.security.JwtTokenProvider;
import com.startuphub.service.MessagingService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(MessagingController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class MessagingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MessagingService messagingService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private WebProperties webProperties;

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void listConversationsReturnsOk() throws Exception {
        when(messagingService.getConversations()).thenReturn(List.of(
            new ConversationSummaryResponse(
                10L,
                new AuthorSummaryResponse(2L, "Bob", "bob@example.com", null, "USER"),
                "Latest message",
                LocalDateTime.of(2026, 5, 20, 18, 0),
                2L
            )
        ));

        mockMvc.perform(get("/api/messages/conversations"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].unreadCount").value(2));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void getConversationReturnsOk() throws Exception {
        when(messagingService.getConversationMessages(2L)).thenReturn(List.of(messageResponse()));

        mockMvc.perform(get("/api/messages/conversations/2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].content").value("Hello Bob"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void sendMessageReturnsCreated() throws Exception {
        when(messagingService.sendMessage(any(SendMessageRequest.class))).thenReturn(messageResponse());

        mockMvc.perform(post("/api/messages")
                .contentType(APPLICATION_JSON)
                .content("""
                    {"recipientId":2,"content":"Hello Bob"}
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.conversationId").value(10));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void selfMessageReturnsBadRequest() throws Exception {
        when(messagingService.sendMessage(any(SendMessageRequest.class)))
            .thenThrow(new IllegalArgumentException("You cannot message yourself"));

        mockMvc.perform(post("/api/messages")
                .contentType(APPLICATION_JSON)
                .content("""
                    {"recipientId":1,"content":"Hello self"}
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("You cannot message yourself"));
    }

    private MessageResponse messageResponse() {
        return new MessageResponse(
            100L,
            10L,
            new AuthorSummaryResponse(1L, "Alice", "alice@example.com", null, "USER"),
            "Hello Bob",
            false,
            LocalDateTime.of(2026, 5, 20, 18, 0)
        );
    }
}
