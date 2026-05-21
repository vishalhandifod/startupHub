package com.startuphub.dto;

import java.time.LocalDateTime;

public record StartupResponse(
    Long id,
    String name,
    String slug,
    String description,
    String logoUrl,
    String website,
    String industry,
    String location,
    LocalDateTime createdAt,
    AuthorSummaryResponse owner,
    long followerCount,
    boolean followedByCurrentUser
) {
}
