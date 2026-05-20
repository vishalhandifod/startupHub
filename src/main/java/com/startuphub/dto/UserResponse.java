package com.startuphub.dto;

import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String name,
    String email,
    String bio,
    String profilePhoto,
    String role,
    LocalDateTime createdAt
) {
}
