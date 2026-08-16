package com.healthtrack.repository;
import com.healthtrack.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    @Query("SELECT m FROM ChatMessage m WHERE (m.sender.id=:uid AND m.receiver.id=:oid) OR (m.sender.id=:oid AND m.receiver.id=:uid) ORDER BY m.sentAt ASC")
    List<ChatMessage> findConversation(Long uid, Long oid);

    @Query("SELECT DISTINCT CASE WHEN m.sender.id=:uid THEN m.receiver ELSE m.sender END FROM ChatMessage m WHERE m.sender.id=:uid OR m.receiver.id=:uid")
    List<com.healthtrack.entity.User> findContacts(Long uid);

    long countBySenderIdNotAndReceiverIdAndReadByReceiverFalse(Long senderId, Long receiverId);

    long countBySenderIdAndReceiverIdAndReadByReceiverFalse(Long senderId, Long receiverId);
}
