package com.startuphub.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @Size(min = 1, message = "Name must not be blank")
    String name,
    @Size(max = 500, message = "Bio must be at most 500 characters")
    String bio,
    String profilePhoto
) {
}
