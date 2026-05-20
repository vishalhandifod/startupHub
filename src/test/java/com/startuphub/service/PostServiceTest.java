package com.startuphub.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.startuphub.dto.CommentResponse;
import com.startuphub.dto.CreateCommentRequest;
import com.startuphub.dto.CreatePostRequest;
import com.startuphub.dto.PostResponse;
import com.startuphub.entity.Comment;
import com.startuphub.entity.Post;
import com.startuphub.entity.PostLike;
import com.startuphub.entity.Role;
import com.startuphub.entity.User;
import com.startuphub.repository.CommentRepository;
import com.startuphub.repository.PostLikeRepository;
import com.startuphub.repository.PostRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private PostService postService;

    @Test
    void createPostCreatesPostForCurrentUser() {
        User user = user(1L, "Alice");
        when(authService.getCurrentAuthenticatedUser()).thenReturn(user);
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post post = invocation.getArgument(0);
            post.setId(11L);
            post.setCreatedAt(LocalDateTime.of(2026, 5, 20, 15, 0));
            return post;
        });
        when(postLikeRepository.countByPostId(11L)).thenReturn(0L);
        when(commentRepository.countByPostId(11L)).thenReturn(0L);
        when(postLikeRepository.existsByPostIdAndUserId(11L, 1L)).thenReturn(false);

        PostResponse response = postService.createPost(
            new CreatePostRequest("First startup update", null)
        );

        assertThat(response.id()).isEqualTo(11L);
        assertThat(response.author().email()).isEqualTo("alice@example.com");
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void likePostReturnsCurrentStateWhenAlreadyLiked() {
        User user = user(1L, "Alice");
        Post post = post(10L, "Update", user, LocalDateTime.of(2026, 5, 20, 14, 0));

        when(authService.getCurrentAuthenticatedUser()).thenReturn(user);
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(postLikeRepository.existsByPostIdAndUserId(10L, 1L)).thenReturn(true);
        when(postLikeRepository.countByPostId(10L)).thenReturn(1L);
        when(commentRepository.countByPostId(10L)).thenReturn(0L);

        PostResponse response = postService.likePost(10L);

        assertThat(response.likedByCurrentUser()).isTrue();
        verify(postLikeRepository, never()).save(any(PostLike.class));
    }

    @Test
    void addCommentCreatesCommentForCurrentUser() {
        User user = user(1L, "Alice");
        Post post = post(10L, "Update", user, LocalDateTime.of(2026, 5, 20, 14, 0));

        when(authService.getCurrentAuthenticatedUser()).thenReturn(user);
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> {
            Comment comment = invocation.getArgument(0);
            comment.setId(99L);
            comment.setCreatedAt(LocalDateTime.of(2026, 5, 20, 15, 5));
            return comment;
        });

        CommentResponse response = postService.addComment(
            10L,
            new CreateCommentRequest("Looks good")
        );

        assertThat(response.postId()).isEqualTo(10L);
        assertThat(response.author().email()).isEqualTo("alice@example.com");
        assertThat(response.content()).isEqualTo("Looks good");
    }

    @Test
    void getFeedReturnsNewestFirst() {
        User alice = user(1L, "Alice");
        User bob = user(2L, "Bob");
        Post older = post(1L, "Older", alice, LocalDateTime.of(2026, 5, 20, 10, 0));
        Post newer = post(2L, "Newer", bob, LocalDateTime.of(2026, 5, 20, 12, 0));

        when(authService.getCurrentAuthenticatedUser()).thenReturn(alice);
        when(postRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(newer, older));
        when(postLikeRepository.countByPostId(2L)).thenReturn(2L);
        when(postLikeRepository.countByPostId(1L)).thenReturn(0L);
        when(commentRepository.countByPostId(2L)).thenReturn(1L);
        when(commentRepository.countByPostId(1L)).thenReturn(0L);
        when(postLikeRepository.existsByPostIdAndUserId(2L, 1L)).thenReturn(true);
        when(postLikeRepository.existsByPostIdAndUserId(1L, 1L)).thenReturn(false);

        List<PostResponse> response = postService.getFeed();

        assertThat(response).hasSize(2);
        assertThat(response.get(0).content()).isEqualTo("Newer");
        assertThat(response.get(1).content()).isEqualTo("Older");
    }

    private User user(Long id, String name) {
        return User.builder()
            .id(id)
            .name(name)
            .email(name.toLowerCase() + "@example.com")
            .password("encoded")
            .role(Role.USER)
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
