package com.startuphub.service;

import com.startuphub.dto.AuthorSummaryResponse;
import com.startuphub.dto.ConversationSummaryResponse;
import com.startuphub.dto.MessageResponse;
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
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public List<ConversationSummaryResponse> getConversations() {
        User currentUser = authService.getCurrentAuthenticatedUser();

        return conversationRepository.findByParticipantOneIdOrParticipantTwoId(currentUser.getId(), currentUser.getId())
            .stream()
            .map(conversation -> mapSummary(conversation, currentUser))
            .filter(summary -> summary.lastMessageTime() != null)
            .sorted(Comparator.comparing(ConversationSummaryResponse::lastMessageTime).reversed())
            .toList();
    }

    public List<MessageResponse> getConversationMessages(Long otherUserId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        User otherUser = findUser(otherUserId);
        Conversation conversation = findOrCreateConversation(currentUser, otherUser);

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId()).stream()
            .peek(message -> markReadIfIncoming(currentUser, message))
            .map(this::mapMessage)
            .toList();
    }

    public MessageResponse sendMessage(SendMessageRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser.getId().equals(request.recipientId())) {
            throw new IllegalArgumentException("You cannot message yourself");
        }

        User recipient = findUser(request.recipientId());
        Conversation conversation = findOrCreateConversation(currentUser, recipient);
        Message savedMessage = messageRepository.save(Message.builder()
            .conversation(conversation)
            .sender(currentUser)
            .content(request.content())
            .isRead(false)
            .build());

        return mapMessage(savedMessage);
    }

    private ConversationSummaryResponse mapSummary(Conversation conversation, User currentUser) {
        User otherParticipant = conversation.getParticipantOne().getId().equals(currentUser.getId())
            ? conversation.getParticipantTwo()
            : conversation.getParticipantOne();

        Message lastMessage = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conversation.getId())
            .orElse(null);

        return new ConversationSummaryResponse(
            conversation.getId(),
            mapUser(otherParticipant),
            lastMessage != null ? lastMessage.getContent() : "",
            lastMessage != null ? lastMessage.getCreatedAt() : null,
            messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(conversation.getId(), currentUser.getId())
        );
    }

    private MessageResponse mapMessage(Message message) {
        return new MessageResponse(
            message.getId(),
            message.getConversation().getId(),
            mapUser(message.getSender()),
            message.getContent(),
            message.isRead(),
            message.getCreatedAt()
        );
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

    private User findUser(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private AuthorSummaryResponse mapUser(User user) {
        return new AuthorSummaryResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getProfilePhoto(),
            user.getRole().name()
        );
    }
}
