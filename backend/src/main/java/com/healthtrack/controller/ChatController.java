package com.healthtrack.controller;
import com.healthtrack.entity.ChatMessage;
import com.healthtrack.entity.User;
import com.healthtrack.repository.ChatMessageRepository;
import com.healthtrack.repository.UserRepository;
import com.healthtrack.service.UserService;
import com.healthtrack.service.WebSocketService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/chat")
@Tag(name = "Chat")
@SecurityRequirement(name = "bearerAuth")
public class ChatController {

    private final ChatMessageRepository chatRepo;
    private final UserRepository userRepo;
    private final UserService userService;
    private final WebSocketService wsService;

    public ChatController(ChatMessageRepository c, UserRepository u, UserService us, WebSocketService ws) {
        chatRepo = c; userRepo = u; userService = us; wsService = ws;
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<User>> getContacts() {
        User me = userService.getCurrentUser();
        // Return doctors if patient, return patients+admins if doctor/admin
        if (me.getRole() == User.Role.PATIENT) {
            return ResponseEntity.ok(userRepo.findActiveDoctors());
        }
        return ResponseEntity.ok(userRepo.findActivePatients());
    }

    @GetMapping("/conversation/{otherId}")
    public ResponseEntity<List<ChatMessage>> getConversation(@PathVariable Long otherId) {
        User me = userService.getCurrentUser();
        List<ChatMessage> msgs = chatRepo.findConversation(me.getId(), otherId);
        // Mark as read
        msgs.stream().filter(m -> m.getReceiver().getId().equals(me.getId()) && !m.isReadByReceiver())
            .forEach(m -> { m.setReadByReceiver(true); chatRepo.save(m); });
        return ResponseEntity.ok(msgs);
    }

    @PostMapping("/send/{receiverId}")
    public ResponseEntity<ChatMessage> sendMessage(@PathVariable Long receiverId, @RequestBody Map<String, String> body) {
        User sender = userService.getCurrentUser();
        User receiver = userRepo.findById(receiverId).orElseThrow(() -> new RuntimeException("User not found"));
        ChatMessage msg = new ChatMessage();
        msg.setSender(sender);
        msg.setReceiver(receiver);
        msg.setContent(body.get("content"));
        ChatMessage saved = chatRepo.save(msg);
        // Real-time notification via WebSocket
        wsService.sendAlert(receiverId, Map.of(
            "type", "NEW_MESSAGE",
            "senderId", sender.getId(),
            "senderName", sender.getFirstName() + " " + sender.getLastName(),
            "preview", saved.getContent().length() > 50 ? saved.getContent().substring(0, 50) + "..." : saved.getContent()
        ));
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        User me = userService.getCurrentUser();
        // Count messages where I am receiver and not read
        long count = chatRepo.countBySenderIdNotAndReceiverIdAndReadByReceiverFalse(me.getId(), me.getId());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/unread-per-contact")
    public ResponseEntity<Map<Long, Long>> getUnreadCountsPerContact() {
        User me = userService.getCurrentUser();
        List<User> contacts;
        if (me.getRole() == User.Role.PATIENT) {
            contacts = userRepo.findActiveDoctors();
        } else {
            contacts = userRepo.findActivePatients();
        }
        Map<Long, Long> counts = new HashMap<>();
        for (User c : contacts) {
            long count = chatRepo.countBySenderIdAndReceiverIdAndReadByReceiverFalse(c.getId(), me.getId());
            counts.put(c.getId(), count);
        }
        return ResponseEntity.ok(counts);
    }
}
