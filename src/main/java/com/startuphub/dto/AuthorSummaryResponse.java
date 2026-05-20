package com.startuphub.dto;

public record AuthorSummaryResponse(
    Long id,
    String name,
    String email,
    String profilePhoto,
    String role
) {
}
