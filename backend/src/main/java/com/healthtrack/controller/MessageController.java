package com.healthtrack.controller;
import com.healthtrack.entity.*; import com.healthtrack.repository.*;
import com.healthtrack.service.*; import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
import java.util.*; import com.healthtrack.entity.User;
@RestController @RequestMapping("/messages") @Tag(name="Messages") @SecurityRequirement(name="bearerAuth")
public class MessageController {
    private final MessageRepository mr; private final UserRepository ur;
    private final UserService us; private final WebSocketService ws;
    public MessageController(MessageRepository m,UserRepository u,UserService us,WebSocketService w){mr=m;ur=u;this.us=us;ws=w;}
    @GetMapping("/{otherId}") public ResponseEntity<List<Message>> getConversation(@PathVariable Long otherId){
        return ResponseEntity.ok(mr.findConversation(us.getCurrentUser().getId(),otherId));
    }
    @PostMapping("/{receiverId}") public ResponseEntity<Message> send(@PathVariable Long receiverId,@RequestBody Map<String,String> body){
        User sender=us.getCurrentUser();
        User receiver=ur.findById(receiverId).orElseThrow(()->new RuntimeException("Receiver not found"));
        Message msg=new Message();msg.setSender(sender);msg.setReceiver(receiver);msg.setContent(body.get("content"));
        Message saved=mr.save(msg);
        ws.sendAlert(receiverId,saved);
        return ResponseEntity.ok(saved);
    }
    @GetMapping("/unread-count") public ResponseEntity<Long> unread(){return ResponseEntity.ok(mr.countByReceiverIdAndReadFalse(us.getCurrentUser().getId()));}
}