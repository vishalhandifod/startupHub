package com.startuphub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateStartupRequest(
    @NotBlank(message = "Startup name is required")
    String name,
    @NotBlank(message = "Startup slug is required")
    String slug,
    @Size(max = 2000, message = "Startup description must be at most 2000 characters")
    String description,
    String logoUrl,
    String website,
    String industry,
    String location
) {
}
