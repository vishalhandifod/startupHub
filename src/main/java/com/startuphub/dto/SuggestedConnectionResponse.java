package com.startuphub.dto;

public record SuggestedConnectionResponse(
    Long id,
    String name,
    String email,
    String bio,
    String profilePhoto,
    String role,
    long followerCount
) {
}
