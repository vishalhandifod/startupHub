package com.startuphub.dto;

import java.time.LocalDateTime;

public record MessageResponse(
    Long id,
    Long conversationId,
    AuthorSummaryResponse sender,
    String content,
    boolean isRead,
    LocalDateTime createdAt
) {
}
