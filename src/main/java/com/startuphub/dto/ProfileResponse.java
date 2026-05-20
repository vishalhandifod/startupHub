package com.startuphub.dto;

import java.time.LocalDateTime;

public record ProfileResponse(
    Long id,
    String name,
    String email,
    String bio,
    String profilePhoto,
    String role,
    LocalDateTime createdAt,
    long followerCount,
    long followingCount,
    boolean followedByCurrentUser
) {
}
