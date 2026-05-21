package com.startuphub.controller;

import com.startuphub.dto.NotificationResponse;
import com.startuphub.dto.PostResponse;
import com.startuphub.dto.SearchUserResponse;
import com.startuphub.dto.SuggestedConnectionResponse;
import com.startuphub.service.DiscoveryService;
import com.startuphub.service.NotificationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class DiscoveryController {

    private final DiscoveryService discoveryService;
    private final NotificationService notificationService;

    @GetMapping("/discovery/search/users")
    public List<SearchUserResponse> searchUsers(@RequestParam("q") String query) {
        return discoveryService.searchUsers(query);
    }

    @GetMapping("/discovery/suggestions")
    public List<SuggestedConnectionResponse> getSuggestions() {
        return discoveryService.getSuggestions();
    }

    @GetMapping("/discovery/feed")
    public List<PostResponse> getDiscoveryFeed() {
        return discoveryService.getDiscoveryFeed();
    }

    @GetMapping("/notifications")
    public List<NotificationResponse> getNotifications() {
        return notificationService.getNotifications();
    }

    @PutMapping("/notifications/{notificationId}/read")
    public NotificationResponse markNotificationRead(@PathVariable Long notificationId) {
        return notificationService.markAsRead(notificationId);
    }
}
