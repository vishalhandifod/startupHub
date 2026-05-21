package com.startuphub.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.startuphub.dto.ProfileResponse;
import com.startuphub.dto.ProfileSummaryResponse;
import com.startuphub.dto.UpdateProfileRequest;
import com.startuphub.entity.Role;
import com.startuphub.entity.User;
import com.startuphub.entity.UserFollow;
import com.startuphub.repository.UserFollowRepository;
import com.startuphub.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserFollowRepository userFollowRepository;

    @Mock
    private AuthService authService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ProfileService profileService;

    @Test
    void updateProfileAppliesOnlyProvidedFields() {
        User currentUser = user(1L, "Alice", "Old bio", null);
        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userFollowRepository.countByFollowingId(1L)).thenReturn(0L);
        when(userFollowRepository.countByFollowerId(1L)).thenReturn(0L);
        when(userFollowRepository.existsByFollowerIdAndFollowingId(1L, 1L)).thenReturn(false);

        ProfileResponse response = profileService.updateMyProfile(
            new UpdateProfileRequest(null, "Founder building in public", "https://example.com/alice.png")
        );

        assertThat(response.name()).isEqualTo("Alice");
        assertThat(response.bio()).isEqualTo("Founder building in public");
        assertThat(response.profilePhoto()).isEqualTo("https://example.com/alice.png");
    }

    @Test
    void followUserReturnsCurrentProfileState() {
        User currentUser = user(1L, "Alice", null, null);
        User targetUser = user(2L, "Bob", null, null);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(userRepository.findById(2L)).thenReturn(Optional.of(targetUser));
        when(userFollowRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(false, true);
        when(userFollowRepository.save(any(UserFollow.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userFollowRepository.countByFollowingId(2L)).thenReturn(1L);
        when(userFollowRepository.countByFollowerId(2L)).thenReturn(0L);

        ProfileResponse response = profileService.followUser(2L);

        assertThat(response.id()).isEqualTo(2L);
        assertThat(response.followedByCurrentUser()).isTrue();
        verify(notificationService).createFollowNotification(currentUser, targetUser);
    }

    @Test
    void followUserDoesNothingWhenAlreadyFollowing() {
        User currentUser = user(1L, "Alice", null, null);
        User targetUser = user(2L, "Bob", null, null);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(userRepository.findById(2L)).thenReturn(Optional.of(targetUser));
        when(userFollowRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(true);
        when(userFollowRepository.countByFollowingId(2L)).thenReturn(1L);
        when(userFollowRepository.countByFollowerId(2L)).thenReturn(0L);

        ProfileResponse response = profileService.followUser(2L);

        assertThat(response.followedByCurrentUser()).isTrue();
        verify(userFollowRepository, never()).save(any(UserFollow.class));
    }

    @Test
    void listFollowersReturnsProfileSummaries() {
        User alice = user(1L, "Alice", "Builder", null);
        User bob = user(2L, "Bob", "Investor", null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(userFollowRepository.findByFollowingId(1L)).thenReturn(List.of(UserFollow.builder()
            .follower(bob)
            .following(alice)
            .build()));

        List<ProfileSummaryResponse> followers = profileService.getFollowers(1L);

        assertThat(followers).hasSize(1);
        assertThat(followers.get(0).email()).isEqualTo("bob@example.com");
    }

    @Test
    void followUserRejectsSelfFollow() {
        User currentUser = user(1L, "Alice", null, null);
        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(userRepository.findById(1L)).thenReturn(Optional.of(currentUser));

        assertThatThrownBy(() -> profileService.followUser(1L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("You cannot follow yourself");
    }

    private User user(Long id, String name, String bio, String profilePhoto) {
        return User.builder()
            .id(id)
            .name(name)
            .email(name.toLowerCase() + "@example.com")
            .password("encoded")
            .bio(bio)
            .profilePhoto(profilePhoto)
            .role(Role.USER)
            .createdAt(LocalDateTime.of(2026, 5, 20, 12, 0))
            .build();
    }
}
