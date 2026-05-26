package com.startuphub.service;

import com.startuphub.dto.AuthorSummaryResponse;
import com.startuphub.dto.CommentResponse;
import com.startuphub.dto.CreateCommentRequest;
import com.startuphub.dto.CreatePostRequest;
import com.startuphub.dto.PostResponse;
import com.startuphub.entity.Comment;
import com.startuphub.entity.Post;
import com.startuphub.entity.PostLike;
import com.startuphub.entity.User;
import com.startuphub.exception.ResourceNotFoundException;
import com.startuphub.repository.CommentRepository;
import com.startuphub.repository.PostLikeRepository;
import com.startuphub.repository.PostRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final AuthService authService;
    private final NotificationService notificationService;

    public PostResponse createPost(CreatePostRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Post savedPost = postRepository.save(Post.builder()
            .content(request.content().trim())
            .imageUrl(request.imageUrl())
            .author(currentUser)
            .build());
        return mapToPostResponse(savedPost, currentUser);
    }

    public List<PostResponse> getFeed() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(post -> mapToPostResponse(post, currentUser))
            .toList();
    }

    public PostResponse getPost(Long postId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Post post = findPost(postId);
        return mapToPostResponse(post, currentUser);
    }

    public PostResponse likePost(Long postId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Post post = findPost(postId);
        if (!postLikeRepository.existsByPostIdAndUserId(postId, currentUser.getId())) {
            postLikeRepository.save(PostLike.builder()
                .post(post)
                .user(currentUser)
                .build());
            notificationService.createPostLikeNotification(currentUser, post.getAuthor(), post);
        }
        return mapToPostResponse(post, currentUser);
    }

    public PostResponse unlikePost(Long postId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Post post = findPost(postId);
        postLikeRepository.findByPostIdAndUserId(postId, currentUser.getId())
            .ifPresent(postLikeRepository::delete);
        return mapToPostResponse(post, currentUser);
    }

    public CommentResponse addComment(Long postId, CreateCommentRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Post post = findPost(postId);
        Comment comment = commentRepository.save(Comment.builder()
            .content(request.content())
            .post(post)
            .author(currentUser)
            .build());
        notificationService.createPostCommentNotification(currentUser, post.getAuthor(), post);
        return mapToCommentResponse(comment);
    }

    public List<CommentResponse> getComments(Long postId) {
        findPost(postId);
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
            .map(this::mapToCommentResponse)
            .toList();
    }

    private Post findPost(Long postId) {
        return postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
    }

    private PostResponse mapToPostResponse(Post post, User currentUser) {
        long likeCount = postLikeRepository.countByPostId(post.getId());
        long commentCount = commentRepository.countByPostId(post.getId());
        boolean likedByCurrentUser = postLikeRepository.existsByPostIdAndUserId(post.getId(), currentUser.getId());

        return new PostResponse(
            post.getId(),
            post.getContent(),
            post.getImageUrl(),
            post.getCreatedAt(),
            mapAuthor(post.getAuthor()),
            likeCount,
            commentCount,
            likedByCurrentUser
        );
    }

    private CommentResponse mapToCommentResponse(Comment comment) {
        return new CommentResponse(
            comment.getId(),
            comment.getContent(),
            comment.getCreatedAt(),
            mapAuthor(comment.getAuthor()),
            comment.getPost().getId()
        );
    }

    private AuthorSummaryResponse mapAuthor(User user) {
        return new AuthorSummaryResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getProfilePhoto(),
            user.getRole().name()
        );
    }
}
