package com.startuphub.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.startuphub.dto.NotificationResponse;
import com.startuphub.dto.PostResponse;
import com.startuphub.dto.SearchUserResponse;
import com.startuphub.dto.SuggestedConnectionResponse;
import com.startuphub.entity.Notification;
import com.startuphub.entity.NotificationType;
import com.startuphub.entity.Post;
import com.startuphub.entity.Role;
import com.startuphub.entity.User;
import com.startuphub.entity.UserFollow;
import com.startuphub.repository.CommentRepository;
import com.startuphub.repository.NotificationRepository;
import com.startuphub.repository.PostLikeRepository;
import com.startuphub.repository.PostRepository;
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
class DiscoveryServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserFollowRepository userFollowRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private DiscoveryService discoveryService;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void searchUsersReturnsCaseInsensitiveMatches() {
        User currentUser = user(1L, "Alice");
        User bob = user(2L, "Bob Builder");
        User bobby = user(3L, "Bobby");

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(userRepository.searchTop10ByNameOrEmail("Bo")).thenReturn(List.of(bob, bobby));
        when(userFollowRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(true);
        when(userFollowRepository.existsByFollowerIdAndFollowingId(1L, 3L)).thenReturn(false);

        List<SearchUserResponse> responses = discoveryService.searchUsers("Bo");

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).name()).isEqualTo("Bob Builder");
        assertThat(responses.get(0).followedByCurrentUser()).isTrue();
        assertThat(responses.get(1).email()).isEqualTo("bobby@example.com");
        assertThat(responses.get(1).followedByCurrentUser()).isFalse();
    }

    @Test
    void suggestionsExcludeCurrentAndFollowedUsers() {
        User currentUser = user(1L, "Alice");
        User followedUser = user(2L, "Bob");
        User suggestedOne = user(3L, "Carol");
        User suggestedTwo = user(4L, "Dave");

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(userRepository.findAll()).thenReturn(List.of(currentUser, followedUser, suggestedOne, suggestedTwo));
        when(userFollowRepository.findByFollowerId(1L)).thenReturn(List.of(UserFollow.builder()
            .follower(currentUser)
            .following(followedUser)
            .build()));
        when(userFollowRepository.countByFollowingId(3L)).thenReturn(12L);
        when(userFollowRepository.countByFollowingId(4L)).thenReturn(5L);

        List<SuggestedConnectionResponse> responses = discoveryService.getSuggestions();

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).id()).isEqualTo(3L);
        assertThat(responses.get(0).followerCount()).isEqualTo(12L);
        assertThat(responses.get(1).id()).isEqualTo(4L);
        assertThat(responses).extracting(SuggestedConnectionResponse::id)
            .doesNotContain(1L, 2L);
    }

    @Test
    void discoveryFeedReturnsOwnAndFollowedPostsNewestFirst() {
        User currentUser = user(1L, "Alice");
        User followedUser = user(2L, "Bob");
        Post newer = post(11L, "Bob update", followedUser, LocalDateTime.of(2026, 5, 20, 15, 0));
        Post older = post(10L, "Alice update", currentUser, LocalDateTime.of(2026, 5, 20, 14, 0));

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(userFollowRepository.findByFollowerId(1L)).thenReturn(List.of(UserFollow.builder()
            .follower(currentUser)
            .following(followedUser)
            .build()));
        when(postRepository.findByAuthorIdInOrderByCreatedAtDesc(List.of(1L, 2L))).thenReturn(List.of(newer, older));
        when(postLikeRepository.countByPostId(11L)).thenReturn(4L);
        when(postLikeRepository.countByPostId(10L)).thenReturn(1L);
        when(commentRepository.countByPostId(11L)).thenReturn(2L);
        when(commentRepository.countByPostId(10L)).thenReturn(0L);
        when(postLikeRepository.existsByPostIdAndUserId(11L, 1L)).thenReturn(true);
        when(postLikeRepository.existsByPostIdAndUserId(10L, 1L)).thenReturn(false);

        List<PostResponse> responses = discoveryService.getDiscoveryFeed();

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).id()).isEqualTo(11L);
        assertThat(responses.get(0).author().email()).isEqualTo("bob@example.com");
        assertThat(responses.get(1).id()).isEqualTo(10L);
        verify(postRepository).findByAuthorIdInOrderByCreatedAtDesc(List.of(1L, 2L));
    }

    @Test
    void markNotificationReadReturnsUpdatedNotification() {
        User currentUser = user(1L, "Alice");
        User actor = user(2L, "Bob");
        Notification notification = Notification.builder()
            .id(20L)
            .recipient(currentUser)
            .actor(actor)
            .type(NotificationType.FOLLOW)
            .message("Bob started following you")
            .isRead(false)
            .createdAt(LocalDateTime.of(2026, 5, 20, 16, 0))
            .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(notificationRepository.findByIdAndRecipientId(20L, 1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(20L);

        assertThat(response.id()).isEqualTo(20L);
        assertThat(response.isRead()).isTrue();
        assertThat(notification.isRead()).isTrue();
        verify(notificationRepository).save(notification);
    }

    private User user(Long id, String name) {
        return User.builder()
            .id(id)
            .name(name)
            .email(name.toLowerCase().replace(" ", "") + "@example.com")
            .password("encoded")
            .role(Role.USER)
            .createdAt(LocalDateTime.of(2026, 5, 20, 12, 0))
            .build();
    }

    private Post post(Long id, String content, User user, LocalDateTime createdAt) {
        return Post.builder()
            .id(id)
            .content(content)
            .author(user)
            .createdAt(createdAt)
            .build();
    }
}
