package com.startuphub.service;

import com.startuphub.dto.AuthorSummaryResponse;
import com.startuphub.dto.CreateStartupRequest;
import com.startuphub.dto.StartupResponse;
import com.startuphub.dto.StartupSummaryResponse;
import com.startuphub.dto.UpdateStartupRequest;
import com.startuphub.entity.Startup;
import com.startuphub.entity.StartupFollow;
import com.startuphub.entity.User;
import com.startuphub.exception.DuplicateResourceException;
import com.startuphub.exception.ResourceNotFoundException;
import com.startuphub.repository.StartupFollowRepository;
import com.startuphub.repository.StartupRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StartupService {

    private final StartupRepository startupRepository;
    private final StartupFollowRepository startupFollowRepository;
    private final AuthService authService;

    public StartupResponse createStartup(CreateStartupRequest request) {
        if (startupRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Startup slug already exists");
        }

        User currentUser = authService.getCurrentAuthenticatedUser();
        Startup startup = startupRepository.save(Startup.builder()
            .name(request.name())
            .slug(request.slug())
            .description(request.description())
            .logoUrl(request.logoUrl())
            .website(request.website())
            .industry(request.industry())
            .location(request.location())
            .owner(currentUser)
            .build());

        return mapResponse(startup, currentUser);
    }

    public StartupResponse updateStartup(Long startupId, UpdateStartupRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Startup startup = findStartup(startupId);
        validateOwner(startup, currentUser);

        if (request.name() != null) {
            startup.setName(request.name());
        }
        if (request.description() != null) {
            startup.setDescription(request.description());
        }
        if (request.logoUrl() != null) {
            startup.setLogoUrl(request.logoUrl());
        }
        if (request.website() != null) {
            startup.setWebsite(request.website());
        }
        if (request.industry() != null) {
            startup.setIndustry(request.industry());
        }
        if (request.location() != null) {
            startup.setLocation(request.location());
        }

        return mapResponse(startupRepository.save(startup), currentUser);
    }

    public StartupResponse getStartup(Long startupId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return mapResponse(findStartup(startupId), currentUser);
    }

    public List<StartupSummaryResponse> listStartups() {
        return startupRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::mapSummary)
            .toList();
    }

    public StartupResponse followStartup(Long startupId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Startup startup = findStartup(startupId);

        if (!startupFollowRepository.existsByUserIdAndStartupId(currentUser.getId(), startupId)) {
            startupFollowRepository.save(StartupFollow.builder()
                .user(currentUser)
                .startup(startup)
                .build());
        }

        return mapResponse(startup, currentUser);
    }

    public StartupResponse unfollowStartup(Long startupId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Startup startup = findStartup(startupId);

        startupFollowRepository.findByUserIdAndStartupId(currentUser.getId(), startupId)
            .ifPresent(startupFollowRepository::delete);

        return mapResponse(startup, currentUser);
    }

    private Startup findStartup(Long startupId) {
        return startupRepository.findById(startupId)
            .orElseThrow(() -> new ResourceNotFoundException("Startup not found"));
    }

    private void validateOwner(Startup startup, User currentUser) {
        if (!startup.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not allowed to update this startup");
        }
    }

    private StartupResponse mapResponse(Startup startup, User currentUser) {
        return new StartupResponse(
            startup.getId(),
            startup.getName(),
            startup.getSlug(),
            startup.getDescription(),
            startup.getLogoUrl(),
            startup.getWebsite(),
            startup.getIndustry(),
            startup.getLocation(),
            startup.getCreatedAt(),
            mapOwner(startup.getOwner()),
            startupFollowRepository.countByStartupId(startup.getId()),
            startupFollowRepository.existsByUserIdAndStartupId(currentUser.getId(), startup.getId())
        );
    }

    private StartupSummaryResponse mapSummary(Startup startup) {
        return new StartupSummaryResponse(
            startup.getId(),
            startup.getName(),
            startup.getSlug(),
            startup.getLogoUrl(),
            startup.getIndustry(),
            startup.getLocation(),
            startup.getCreatedAt(),
            startupFollowRepository.countByStartupId(startup.getId())
        );
    }

    private AuthorSummaryResponse mapOwner(User owner) {
        return new AuthorSummaryResponse(
            owner.getId(),
            owner.getName(),
            owner.getEmail(),
            owner.getProfilePhoto(),
            owner.getRole().name()
        );
    }
}
