package com.startuphub.repository;

import com.startuphub.entity.Conversation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByParticipantOneIdOrParticipantTwoId(Long participantOneId, Long participantTwoId);

    Optional<Conversation> findByParticipantOneIdAndParticipantTwoId(Long participantOneId, Long participantTwoId);
}
