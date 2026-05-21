package com.startuphub.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.startuphub.config.SecurityConfig;
import com.startuphub.config.WebProperties;
import com.startuphub.dto.AuthorSummaryResponse;
import com.startuphub.dto.CommentResponse;
import com.startuphub.dto.CreateCommentRequest;
import com.startuphub.dto.CreatePostRequest;
import com.startuphub.dto.PostResponse;
import com.startuphub.exception.GlobalExceptionHandler;
import com.startuphub.exception.ResourceNotFoundException;
import com.startuphub.security.CustomUserDetailsService;
import com.startuphub.security.JwtTokenProvider;
import com.startuphub.service.PostService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PostController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostService postService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private WebProperties webProperties;

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void createPostReturnsCreatedResponse() throws Exception {
        when(postService.createPost(any(CreatePostRequest.class))).thenReturn(postResponse());

        mockMvc.perform(post("/api/posts")
                .contentType(APPLICATION_JSON)
                .content("""
                    {"content":"First startup update","imageUrl":null}
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.content").value("First startup update"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void getFeedReturnsOk() throws Exception {
        when(postService.getFeed()).thenReturn(List.of(postResponse()));

        mockMvc.perform(get("/api/posts"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].likeCount").value(2));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void likePostReturnsOk() throws Exception {
        when(postService.likePost(10L)).thenReturn(postResponse());

        mockMvc.perform(post("/api/posts/10/likes"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.likedByCurrentUser").value(true));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void createCommentReturnsCreatedResponse() throws Exception {
        when(postService.addComment(eq(10L), any(CreateCommentRequest.class))).thenReturn(commentResponse());

        mockMvc.perform(post("/api/posts/10/comments")
                .contentType(APPLICATION_JSON)
                .content("""
                    {"content":"Looks good"}
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.postId").value(10));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void missingPostReturnsNotFound() throws Exception {
        when(postService.getPost(99L)).thenThrow(new ResourceNotFoundException("Post not found"));

        mockMvc.perform(get("/api/posts/99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("Post not found"));
    }

    private PostResponse postResponse() {
        return new PostResponse(
            10L,
            "First startup update",
            null,
            LocalDateTime.of(2026, 5, 20, 15, 0),
            new AuthorSummaryResponse(1L, "Alice", "alice@example.com", null, "USER"),
            2L,
            1L,
            true
        );
    }

    private CommentResponse commentResponse() {
        return new CommentResponse(
            20L,
            "Looks good",
            LocalDateTime.of(2026, 5, 20, 15, 5),
            new AuthorSummaryResponse(1L, "Alice", "alice@example.com", null, "USER"),
            10L
        );
    }
}
