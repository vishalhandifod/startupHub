package com.startuphub.service;

import com.startuphub.dto.AuthorSummaryResponse;
import com.startuphub.dto.NotificationResponse;
import com.startuphub.entity.Notification;
import com.startuphub.entity.NotificationType;
import com.startuphub.entity.Post;
import com.startuphub.entity.User;
import com.startuphub.exception.ResourceNotFoundException;
import com.startuphub.repository.NotificationRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuthService authService;
    private final SimpMessagingTemplate messagingTemplate;

    public void createFollowNotification(User actor, User recipient) {
        saveNotification(actor, recipient, NotificationType.FOLLOW, null,
            actor.getName() + " started following you");
    }

    public void createPostLikeNotification(User actor, User recipient, Post post) {
        saveNotification(actor, recipient, NotificationType.POST_LIKE, post,
            actor.getName() + " liked your post");
    }

    public void createPostCommentNotification(User actor, User recipient, Post post) {
        saveNotification(actor, recipient, NotificationType.POST_COMMENT, post,
            actor.getName() + " commented on your post");
    }

    public List<NotificationResponse> getNotifications() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId()).stream()
            .map(this::mapNotification)
            .toList();
    }

    public NotificationResponse markAsRead(Long notificationId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setRead(true);
        Notification savedNotification = notificationRepository.save(notification);
        return mapNotification(savedNotification);
    }

    private void saveNotification(
        User actor,
        User recipient,
        NotificationType type,
        Post post,
        String message
    ) {
        if (actor.getId().equals(recipient.getId())) {
            return;
        }

        Notification savedNotification = notificationRepository.save(Notification.builder()
            .recipient(recipient)
            .actor(actor)
            .type(type)
            .post(post)
            .message(message)
            .isRead(false)
            .build());
        messagingTemplate.convertAndSendToUser(
            recipient.getId().toString(),
            "/queue/notifications",
            mapNotification(savedNotification)
        );
    }

    private NotificationResponse mapNotification(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getType().name(),
            notification.getMessage(),
            notification.isRead(),
            notification.getCreatedAt(),
            new AuthorSummaryResponse(
                notification.getActor().getId(),
                notification.getActor().getName(),
                notification.getActor().getEmail(),
                notification.getActor().getProfilePhoto(),
                notification.getActor().getRole().name()
            ),
            notification.getPost() != null ? notification.getPost().getId() : null
        );
    }
}
