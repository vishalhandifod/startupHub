package com.startuphub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
    @NotBlank(message = "Post content is required")
    @Size(max = 2000, message = "Post content must be at most 2000 characters")
    String content,
    String imageUrl
) {
}
