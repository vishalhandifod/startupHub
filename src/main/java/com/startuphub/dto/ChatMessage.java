package com.startuphub.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    private String clientMessageId;
    private Long senderId;
    private Long receiverId;
    private String content;
    private String senderName;
    private String senderAvatar;
    private LocalDateTime timestamp;
}
