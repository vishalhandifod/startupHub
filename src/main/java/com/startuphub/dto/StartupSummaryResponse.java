package com.startuphub.dto;

import java.time.LocalDateTime;

public record StartupSummaryResponse(
    Long id,
    String name,
    String slug,
    String logoUrl,
    String industry,
    String location,
    LocalDateTime createdAt,
    long followerCount
) {
}
