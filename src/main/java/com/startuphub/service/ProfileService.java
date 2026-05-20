package com.startuphub.service;

import com.startuphub.dto.ProfileResponse;
import com.startuphub.dto.ProfileSummaryResponse;
import com.startuphub.dto.UpdateProfileRequest;
import com.startuphub.entity.User;
import com.startuphub.entity.UserFollow;
import com.startuphub.exception.ResourceNotFoundException;
import com.startuphub.repository.UserFollowRepository;
import com.startuphub.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final UserFollowRepository userFollowRepository;
    private final AuthService authService;

    public ProfileResponse getMyProfile() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return mapProfile(currentUser, currentUser);
    }

    public ProfileResponse updateMyProfile(UpdateProfileRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new IllegalArgumentException("Name must not be blank");
            }
            currentUser.setName(request.name());
        }
        if (request.bio() != null) {
            currentUser.setBio(request.bio());
        }
        if (request.profilePhoto() != null) {
            currentUser.setProfilePhoto(request.profilePhoto());
        }

        User savedUser = userRepository.save(currentUser);
        return mapProfile(savedUser, currentUser);
    }

    public ProfileResponse getProfile(Long userId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        User targetUser = findUser(userId);
        return mapProfile(targetUser, currentUser);
    }

    public ProfileResponse followUser(Long userId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        User targetUser = findUser(userId);

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        if (!userFollowRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), userId)) {
            userFollowRepository.save(UserFollow.builder()
                .follower(currentUser)
                .following(targetUser)
                .build());
        }

        return mapProfile(targetUser, currentUser);
    }

    public ProfileResponse unfollowUser(Long userId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        User targetUser = findUser(userId);

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        userFollowRepository.findByFollowerIdAndFollowingId(currentUser.getId(), userId)
            .ifPresent(userFollowRepository::delete);

        return mapProfile(targetUser, currentUser);
    }

    public List<ProfileSummaryResponse> getFollowers(Long userId) {
        findUser(userId);
        return userFollowRepository.findByFollowingId(userId).stream()
            .map(UserFollow::getFollower)
            .map(this::mapSummary)
            .toList();
    }

    public List<ProfileSummaryResponse> getFollowing(Long userId) {
        findUser(userId);
        return userFollowRepository.findByFollowerId(userId).stream()
            .map(UserFollow::getFollowing)
            .map(this::mapSummary)
            .toList();
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ProfileResponse mapProfile(User targetUser, User currentUser) {
        return new ProfileResponse(
            targetUser.getId(),
            targetUser.getName(),
            targetUser.getEmail(),
            targetUser.getBio(),
            targetUser.getProfilePhoto(),
            targetUser.getRole().name(),
            targetUser.getCreatedAt(),
            userFollowRepository.countByFollowingId(targetUser.getId()),
            userFollowRepository.countByFollowerId(targetUser.getId()),
            userFollowRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), targetUser.getId())
        );
    }

    private ProfileSummaryResponse mapSummary(User user) {
        return new ProfileSummaryResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getBio(),
            user.getProfilePhoto(),
            user.getRole().name()
        );
    }
}
