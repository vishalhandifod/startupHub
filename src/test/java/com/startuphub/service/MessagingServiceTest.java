package com.startuphub.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.startuphub.dto.ConversationSummaryResponse;
import com.startuphub.dto.MessageResponse;
import com.startuphub.dto.SendMessageRequest;
import com.startuphub.entity.Conversation;
import com.startuphub.entity.Message;
import com.startuphub.entity.Role;
import com.startuphub.entity.User;
import com.startuphub.repository.ConversationRepository;
import com.startuphub.repository.MessageRepository;
import com.startuphub.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MessagingServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private MessagingService messagingService;

    @Test
    void sendMessageCreatesConversationWhenMissing() {
        User currentUser = user(1L, "Alice");
        User recipient = user(2L, "Bob");
        Conversation conversation = conversation(10L, currentUser, recipient);

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));
        when(conversationRepository.findByParticipantOneIdAndParticipantTwoId(1L, 2L)).thenReturn(Optional.empty());
        when(conversationRepository.save(any(Conversation.class))).thenReturn(conversation);
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> {
            Message message = invocation.getArgument(0);
            message.setId(100L);
            message.setCreatedAt(LocalDateTime.of(2026, 5, 20, 18, 0));
            return message;
        });

        MessageResponse response = messagingService.sendMessage(new SendMessageRequest(2L, "Hello Bob"));

        assertThat(response.conversationId()).isEqualTo(10L);
        assertThat(response.content()).isEqualTo("Hello Bob");
        verify(conversationRepository).save(any(Conversation.class));
    }

    @Test
    void getConversationMarksIncomingMessagesAsRead() {
        User currentUser = user(1L, "Alice");
        User otherUser = user(2L, "Bob");
        Conversation conversation = conversation(10L, currentUser, otherUser);
        Message incoming = Message.builder()
            .id(100L)
            .conversation(conversation)
            .sender(otherUser)
            .content("Ping")
            .isRead(false)
            .createdAt(LocalDateTime.of(2026, 5, 20, 18, 1))
            .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(userRepository.findById(2L)).thenReturn(Optional.of(otherUser));
        when(conversationRepository.findByParticipantOneIdAndParticipantTwoId(1L, 2L))
            .thenReturn(Optional.of(conversation));
        when(messageRepository.findByConversationIdOrderByCreatedAtAsc(10L)).thenReturn(List.of(incoming));
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<MessageResponse> responses = messagingService.getConversationMessages(2L);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).isRead()).isTrue();
        assertThat(incoming.isRead()).isTrue();
        verify(messageRepository).save(incoming);
    }

    @Test
    void listConversationsReturnsNewestFirstWithUnreadCounts() {
        User currentUser = user(1L, "Alice");
        User bob = user(2L, "Bob");
        User carol = user(3L, "Carol");
        Conversation older = conversation(10L, currentUser, bob);
        Conversation newer = conversation(11L, currentUser, carol);
        Message olderMessage = Message.builder()
            .conversation(older)
            .content("Earlier")
            .createdAt(LocalDateTime.of(2026, 5, 20, 17, 0))
            .build();
        Message newerMessage = Message.builder()
            .conversation(newer)
            .content("Later")
            .createdAt(LocalDateTime.of(2026, 5, 20, 18, 0))
            .build();

        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);
        when(conversationRepository.findByParticipantOneIdOrParticipantTwoId(1L, 1L))
            .thenReturn(List.of(older, newer));
        when(messageRepository.findTopByConversationIdOrderByCreatedAtDesc(10L)).thenReturn(Optional.of(olderMessage));
        when(messageRepository.findTopByConversationIdOrderByCreatedAtDesc(11L)).thenReturn(Optional.of(newerMessage));
        when(messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(10L, 1L)).thenReturn(0L);
        when(messageRepository.countByConversationIdAndSenderIdNotAndIsReadFalse(11L, 1L)).thenReturn(2L);

        List<ConversationSummaryResponse> responses = messagingService.getConversations();

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).conversationId()).isEqualTo(11L);
        assertThat(responses.get(0).unreadCount()).isEqualTo(2L);
        assertThat(responses.get(1).conversationId()).isEqualTo(10L);
    }

    @Test
    void sendMessageRejectsSelfMessaging() {
        User currentUser = user(1L, "Alice");
        when(authService.getCurrentAuthenticatedUser()).thenReturn(currentUser);

        assertThatThrownBy(() -> messagingService.sendMessage(new SendMessageRequest(1L, "Hello self")))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("You cannot message yourself");
    }

    private User user(Long id, String name) {
        return User.builder()
            .id(id)
            .name(name)
            .email(name.toLowerCase() + "@example.com")
            .password("encoded")
            .role(Role.USER)
            .createdAt(LocalDateTime.of(2026, 5, 20, 12, 0))
            .build();
    }

    private Conversation conversation(Long id, User participantOne, User participantTwo) {
        return Conversation.builder()
            .id(id)
            .participantOne(participantOne)
            .participantTwo(participantTwo)
            .createdAt(LocalDateTime.of(2026, 5, 20, 17, 0))
            .build();
    }
}
