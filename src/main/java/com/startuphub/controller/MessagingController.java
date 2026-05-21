package com.startuphub.controller;

import com.startuphub.dto.ConversationSummaryResponse;
import com.startuphub.dto.MessageResponse;
import com.startuphub.dto.SendMessageRequest;
import com.startuphub.service.MessagingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationSummaryResponse>> getConversations() {
        return ResponseEntity.ok(messagingService.getConversations());
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<MessageResponse>> getConversation(@PathVariable Long userId) {
        return ResponseEntity.ok(messagingService.getConversationMessages(userId));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messagingService.sendMessage(request));
    }
}
