package com.startuphub.dto;

import java.time.LocalDateTime;

public record ConversationSummaryResponse(
    Long conversationId,
    AuthorSummaryResponse otherParticipant,
    String lastMessagePreview,
    LocalDateTime lastMessageTime,
    long unreadCount
) {
}
