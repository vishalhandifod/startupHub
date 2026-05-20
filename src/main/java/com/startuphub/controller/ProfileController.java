package com.startuphub.controller;

import com.startuphub.dto.ProfileResponse;
import com.startuphub.dto.ProfileSummaryResponse;
import com.startuphub.dto.UpdateProfileRequest;
import com.startuphub.service.ProfileService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<ProfileResponse> followUser(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.followUser(userId));
    }

    @DeleteMapping("/{userId}/follow")
    public ResponseEntity<ProfileResponse> unfollowUser(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.unfollowUser(userId));
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<ProfileSummaryResponse>> getFollowers(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getFollowers(userId));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<ProfileSummaryResponse>> getFollowing(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getFollowing(userId));
    }
}
