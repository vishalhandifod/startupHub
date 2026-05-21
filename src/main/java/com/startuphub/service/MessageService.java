package com.startuphub.service;

import com.startuphub.dto.ChatMessage;
import com.startuphub.dto.ConversationSummary;
import com.startuphub.dto.SendMessageRequest;
import com.startuphub.entity.Conversation;
import com.startuphub.entity.Message;
import com.startuphub.entity.User;
import com.startuphub.exception.ResourceNotFoundException;
import com.startuphub.repository.ConversationRepository;
import com.startuphub.repository.MessageRepository;
import com.startuphub.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatMessage saveMessage(ChatMessage chatMessage, Long senderId) {
        if (senderId.equals(chatMessage.getReceiverId())) {
            throw new IllegalArgumentException("You cannot message yourself");
        }
        if (chatMessage.getContent() == null || chatMessage.getContent().isBlank()) {
            throw new IllegalArgumentException("Message content is required");
        }

        User sender = findUser(senderId);
        User receiver = findUser(chatMessage.getReceiverId());
        Conversation conversation = findOrCreateConversation(sender, receiver);

        Message savedMessage = messageRepository.save(Message.builder()
            .conversation(conversation)
            .sender(sender)
            .content(chatMessage.getContent().trim())
            .isRead(false)
            .build());

        return mapMessage(savedMessage, otherParticipant(conversation, sender).getId(), chatMessage.getClientMessageId());
    }

    public ChatMessage saveMessageFromRequest(SendMessageRequest request, Long senderId) {
        return saveMessage(ChatMessage.builder()
            .receiverId(request.recipientId())
            .content(request.content())
            .build(), senderId);
    }

    public List<ChatMessage> getConversation(Long currentUserId, Long otherUserId) {
        User currentUser = findUser(currentUserId);
        User otherUser = findUser(otherUserId);
        Conversation conversation = findOrCreateConversation(currentUser, otherUser);

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId()).stream()
            .peek(message -> markReadIfIncoming(currentUser, message))
            .map(message -> mapMessage(message, otherParticipant(conversation, message.getSender()).getId(), null))
            .toList();
    }

    public List<ConversationSummary> getConversations(Long currentUserId) {
        User currentUser = findUser(currentUserId);
        return conversationRepository.findByParticipantOneIdOrParticipantTwoId(currentUserId, currentUserId).stream()
            .map(conversation -> mapConversationSummary(conversation, currentUser))
            .filter(summary -> summary.getLastMessageTime() != null)
            .sorted(Comparator.comparing(ConversationSummary::getLastMessageTime).reversed())
            .toList();
    }

    private ConversationSummary mapConversationSummary(Conversation conversation, User currentUser) {
        User otherUser = otherParticipant(conversation, currentUser);
        Message lastMessage = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conversation.getId()).orElse(null);

        return ConversationSummary.builder()
            .otherUserId(otherUser.getId())
            .otherUserName(otherUser.getName())
            .otherUserAvatar(otherUser.getProfilePhoto())
            .lastMessage(lastMessage != null ? lastMessage.getContent() : null)
            .lastMessageTime(lastMessage != null ? lastMessage.getCreatedAt() : null)
            .hasUnread(messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(conversation.getId(), currentUser.getId()) > 0)
            .build();
    }

    private ChatMessage mapMessage(Message message, Long receiverId, String clientMessageId) {
        return ChatMessage.builder()
            .clientMessageId(clientMessageId)
            .senderId(message.getSender().getId())
            .receiverId(receiverId)
            .content(message.getContent())
            .senderName(message.getSender().getName())
            .senderAvatar(message.getSender().getProfilePhoto())
            .timestamp(message.getCreatedAt())
            .build();
    }

    private void markReadIfIncoming(User currentUser, Message message) {
        if (!message.getSender().getId().equals(currentUser.getId()) && !message.isRead()) {
            message.setRead(true);
            messageRepository.save(message);
        }
    }

    private Conversation findOrCreateConversation(User currentUser, User otherUser) {
        long firstId = Math.min(currentUser.getId(), otherUser.getId());
        long secondId = Math.max(currentUser.getId(), otherUser.getId());

        return conversationRepository.findByParticipantOneIdAndParticipantTwoId(firstId, secondId)
            .orElseGet(() -> conversationRepository.save(Conversation.builder()
                .participantOne(firstId == currentUser.getId() ? currentUser : otherUser)
                .participantTwo(secondId == currentUser.getId() ? currentUser : otherUser)
                .build()));
    }

    private User otherParticipant(Conversation conversation, User user) {
        return conversation.getParticipantOne().getId().equals(user.getId())
            ? conversation.getParticipantTwo()
            : conversation.getParticipantOne();
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
