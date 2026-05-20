package com.startuphub.dto;

public record ProfileSummaryResponse(
    Long id,
    String name,
    String email,
    String bio,
    String profilePhoto,
    String role
) {
}
