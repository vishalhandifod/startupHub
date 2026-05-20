package com.startuphub.dto;

import java.time.LocalDateTime;

public record CommentResponse(
    Long id,
    String content,
    LocalDateTime createdAt,
    AuthorSummaryResponse author,
    Long postId
) {
}
