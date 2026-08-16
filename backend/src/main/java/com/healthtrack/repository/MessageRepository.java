package com.healthtrack.repository;
import com.healthtrack.entity.Message;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface MessageRepository extends JpaRepository<Message,Long> {
    @Query("SELECT m FROM Message m WHERE (m.sender.id=:uid AND m.receiver.id=:oid) OR (m.sender.id=:oid AND m.receiver.id=:uid) ORDER BY m.sentAt ASC")
    List<Message> findConversation(Long uid, Long oid);
    long countByReceiverIdAndReadFalse(Long rid);
    List<Message> findByReceiverIdAndReadFalseOrderBySentAtDesc(Long rid);
}
