package com.startuphub.service;

import com.startuphub.dto.AuthorSummaryResponse;
import com.startuphub.dto.PostResponse;
import com.startuphub.dto.SearchUserResponse;
import com.startuphub.dto.SuggestedConnectionResponse;
import com.startuphub.entity.Post;
import com.startuphub.entity.User;
import com.startuphub.repository.CommentRepository;
import com.startuphub.repository.PostLikeRepository;
import com.startuphub.repository.PostRepository;
import com.startuphub.repository.UserFollowRepository;
import com.startuphub.repository.UserRepository;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DiscoveryService {

    private final UserRepository userRepository;
    private final UserFollowRepository userFollowRepository;
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final AuthService authService;

    public List<SearchUserResponse> searchUsers(String query) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.isEmpty()) {
            return List.of();
        }

        return userRepository.searchTop10ByNameOrEmail(normalizedQuery).stream()
            .limit(10)
            .map(user -> new SearchUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getBio(),
                user.getProfilePhoto(),
                user.getRole().name(),
                userFollowRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), user.getId())
            ))
            .toList();
    }

    public List<SuggestedConnectionResponse> getSuggestions() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Set<Long> excludedUserIds = new LinkedHashSet<>();
        excludedUserIds.add(currentUser.getId());
        userFollowRepository.findByFollowerId(currentUser.getId()).stream()
            .map(userFollow -> userFollow.getFollowing().getId())
            .forEach(excludedUserIds::add);

        return userRepository.findAll().stream()
            .filter(user -> !excludedUserIds.contains(user.getId()))
            .map(user -> new SuggestedConnectionResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getBio(),
                user.getProfilePhoto(),
                user.getRole().name(),
                userFollowRepository.countByFollowingId(user.getId())
            ))
            .sorted(Comparator.comparingLong(SuggestedConnectionResponse::followerCount).reversed()
                .thenComparing(SuggestedConnectionResponse::name))
            .limit(10)
            .toList();
    }

    public List<PostResponse> getDiscoveryFeed() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<Long> authorIds = userFollowRepository.findByFollowerId(currentUser.getId()).stream()
            .map(userFollow -> userFollow.getFollowing().getId())
            .collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new));
        authorIds.add(0, currentUser.getId());

        return postRepository.findByAuthorIdInOrderByCreatedAtDesc(authorIds).stream()
            .map(post -> mapPost(post, currentUser))
            .toList();
    }

    private PostResponse mapPost(Post post, User currentUser) {
        return new PostResponse(
            post.getId(),
            post.getContent(),
            post.getImageUrl(),
            post.getCreatedAt(),
            new AuthorSummaryResponse(
                post.getAuthor().getId(),
                post.getAuthor().getName(),
                post.getAuthor().getEmail(),
                post.getAuthor().getProfilePhoto(),
                post.getAuthor().getRole().name()
            ),
            postLikeRepository.countByPostId(post.getId()),
            commentRepository.countByPostId(post.getId()),
            postLikeRepository.existsByPostIdAndUserId(post.getId(), currentUser.getId())
        );
    }
}
