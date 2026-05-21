package com.startuphub.dto;

import jakarta.validation.constraints.Size;

public record UpdateStartupRequest(
    @Size(min = 1, message = "Startup name must not be blank")
    String name,
    @Size(max = 2000, message = "Startup description must be at most 2000 characters")
    String description,
    String logoUrl,
    String website,
    String industry,
    String location
) {
}
