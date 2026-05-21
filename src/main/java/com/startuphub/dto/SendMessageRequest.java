package com.startuphub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
    @NotNull(message = "Recipient is required")
    Long recipientId,
    @NotBlank(message = "Message content is required")
    @Size(max = 2000, message = "Message content must be at most 2000 characters")
    String content
) {
}
