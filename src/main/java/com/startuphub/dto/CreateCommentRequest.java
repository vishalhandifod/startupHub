package com.startuphub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(
    @NotBlank(message = "Comment content is required")
    @Size(max = 500, message = "Comment content must be at most 500 characters")
    String content
) {
}
