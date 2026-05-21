package com.startuphub.controller;

import com.startuphub.dto.ChatMessage;
import com.startuphub.security.CustomUserDetails;
import com.startuphub.service.MessageService;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage chatMessage, Principal principal) {
        Long senderId = Long.parseLong(principal.getName());
        ChatMessage savedMessage = messageService.saveMessage(chatMessage, senderId);
        messagingTemplate.convertAndSendToUser(
            savedMessage.getReceiverId().toString(),
            "/queue/messages",
            savedMessage
        );
        messagingTemplate.convertAndSendToUser(
            savedMessage.getSenderId().toString(),
            "/queue/messages",
            savedMessage
        );
    }

    @GetMapping("/api/messages/{userId}")
    @ResponseBody
    public ResponseEntity<List<ChatMessage>> getMessageHistory(
        @PathVariable Long userId,
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(messageService.getConversation(userDetails.getId(), userId));
    }
}
