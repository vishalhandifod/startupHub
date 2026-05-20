package com.startuphub.dto;

import java.time.LocalDateTime;

public record PostResponse(
    Long id,
    String content,
    String imageUrl,
    LocalDateTime createdAt,
    AuthorSummaryResponse author,
    long likeCount,
    long commentCount,
    boolean likedByCurrentUser
) {
}
