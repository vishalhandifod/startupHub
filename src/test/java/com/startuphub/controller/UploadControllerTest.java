package com.startuphub.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.startuphub.config.SecurityConfig;
import com.startuphub.config.WebProperties;
import com.startuphub.dto.UploadResponse;
import com.startuphub.exception.GlobalExceptionHandler;
import com.startuphub.security.CustomUserDetailsService;
import com.startuphub.security.JwtTokenProvider;
import com.startuphub.service.FileStorageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UploadController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class UploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FileStorageService fileStorageService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private WebProperties webProperties;

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void uploadProfilePhotoReturnsPublicPath() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "avatar.png",
            "image/png",
            "image-bytes".getBytes()
        );

        when(fileStorageService.store(any(), eq("profile-photo")))
            .thenReturn(new UploadResponse("/uploads/profile-photo/avatar.png"));

        mockMvc.perform(multipart("/api/uploads/profile-photo").file(file))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.path").value("/uploads/profile-photo/avatar.png"));
    }

    @Test
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void uploadWithoutFileReturnsBadRequest() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
            "file",
            "",
            "application/octet-stream",
            new byte[0]
        );

        mockMvc.perform(multipart("/api/uploads/profile-photo").file(emptyFile))
            .andExpect(status().isBadRequest());
    }
}
