package com.startuphub.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.startuphub.dto.CreateStartupRequest;
import com.startuphub.dto.StartupResponse;
import com.startuphub.dto.StartupSummaryResponse;
import com.startuphub.dto.UpdateStartupRequest;
import com.startuphub.entity.Role;
import com.startuphub.entity.Startup;
import com.startuphub.entity.StartupFollow;
import com.startuphub.entity.User;
import com.startuphub.repository.StartupFollowRepository;
import com.startuphub.repository.StartupRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class StartupServiceTest {

    @Mock
    private StartupRepository startupRepository;

    @Mock
    private StartupFollowRepository startupFollowRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private StartupService startupService;

    @Test
    void createStartupCreatesOwnedStartup() {
        User owner = user(1L, "Alice");
        when(authService.getCurrentAuthenticatedUser()).thenReturn(owner);
        when(startupRepository.existsBySlug("launch-labs")).thenReturn(false);
        when(startupRepository.save(any(Startup.class))).thenAnswer(invocation -> {
            Startup startup = invocation.getArgument(0);
            startup.setId(10L);
            startup.setCreatedAt(LocalDateTime.of(2026, 5, 20, 16, 0));
            return startup;
        });
        when(startupFollowRepository.countByStartupId(10L)).thenReturn(0L);
        when(startupFollowRepository.existsByUserIdAndStartupId(1L, 10L)).thenReturn(false);

        StartupResponse response = startupService.createStartup(new CreateStartupRequest(
            "Launch Labs",
            "launch-labs",
            "Building tools for founders",
            null,
            "https://launchlabs.example.com",
            "SaaS",
            "Pune"
        ));

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.name()).isEqualTo("Launch Labs");
        assertThat(response.owner().email()).isEqualTo("alice@example.com");
        verify(startupRepository).save(any(Startup.class));
    }

    @Test
    void updateStartupRejectsNonOwner() {
        User owner = user(1L, "Alice");
        User otherUser = user(2L, "Bob");
        Startup startup = startup(10L, "Launch Labs", "launch-labs", owner, LocalDateTime.of(2026, 5, 20, 15, 0));

        when(authService.getCurrentAuthenticatedUser()).thenReturn(otherUser);
        when(startupRepository.findById(10L)).thenReturn(Optional.of(startup));

        assertThatThrownBy(() -> startupService.updateStartup(
            10L,
            new UpdateStartupRequest("New Name", null, null, null, null, null)
        ))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessage("You are not allowed to update this startup");
    }

    @Test
    void listStartupsReturnsNewestFirstSummaries() {
        User owner = user(1L, "Alice");
        Startup newer = startup(11L, "Beta Forge", "beta-forge", owner, LocalDateTime.of(2026, 5, 20, 16, 0));
        newer.setIndustry("Fintech");
        Startup older = startup(10L, "Alpha Labs", "alpha-labs", owner, LocalDateTime.of(2026, 5, 20, 14, 0));
        older.setIndustry("SaaS");

        when(startupRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(newer, older));
        when(startupFollowRepository.countByStartupId(11L)).thenReturn(7L);
        when(startupFollowRepository.countByStartupId(10L)).thenReturn(2L);

        List<StartupSummaryResponse> response = startupService.listStartups();

        assertThat(response).hasSize(2);
        assertThat(response.get(0).name()).isEqualTo("Beta Forge");
        assertThat(response.get(0).followerCount()).isEqualTo(7L);
        assertThat(response.get(1).name()).isEqualTo("Alpha Labs");
    }

    @Test
    void followStartupIsIdempotent() {
        User user = user(2L, "Bob");
        User owner = user(1L, "Alice");
        Startup startup = startup(10L, "Launch Labs", "launch-labs", owner, LocalDateTime.of(2026, 5, 20, 15, 0));

        when(authService.getCurrentAuthenticatedUser()).thenReturn(user);
        when(startupRepository.findById(10L)).thenReturn(Optional.of(startup));
        when(startupFollowRepository.existsByUserIdAndStartupId(2L, 10L)).thenReturn(true);
        when(startupFollowRepository.countByStartupId(10L)).thenReturn(3L);

        StartupResponse response = startupService.followStartup(10L);

        assertThat(response.followedByCurrentUser()).isTrue();
        verify(startupFollowRepository, never()).save(any(StartupFollow.class));
    }

    private User user(Long id, String name) {
        return User.builder()
            .id(id)
            .name(name)
            .email(name.toLowerCase() + "@example.com")
            .password("encoded")
            .role(Role.USER)
            .createdAt(LocalDateTime.of(2026, 5, 20, 12, 0))
            .build();
    }

    private Startup startup(Long id, String name, String slug, User owner, LocalDateTime createdAt) {
        return Startup.builder()
            .id(id)
            .name(name)
            .slug(slug)
            .description("Building tools for founders")
            .logoUrl("https://example.com/logo.png")
            .website("https://example.com")
            .industry("SaaS")
            .location("Pune")
            .owner(owner)
            .createdAt(createdAt)
            .build();
    }
}
