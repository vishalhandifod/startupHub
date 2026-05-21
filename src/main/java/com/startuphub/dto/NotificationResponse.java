package com.startuphub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    String type,
    String message,
    @JsonProperty("read") boolean isRead,
    LocalDateTime createdAt,
    AuthorSummaryResponse actor,
    Long postId
) {
}
