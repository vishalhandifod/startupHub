package com.startuphub.dto;

public record SearchUserResponse(
    Long id,
    String name,
    String email,
    String bio,
    String profilePhoto,
    String role,
    boolean followedByCurrentUser
) {
}
