package com.startuphub.repository;

import com.startuphub.entity.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    Optional<Notification> findByIdAndRecipientId(Long notificationId, Long recipientId);
}
