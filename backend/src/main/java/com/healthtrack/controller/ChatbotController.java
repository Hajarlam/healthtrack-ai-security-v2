package com.healthtrack.controller;

import com.healthtrack.ai.ChatbotRequest;
import com.healthtrack.ai.ChatbotResponse;
import com.healthtrack.ai.MedicalChatbotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chatbot")
@Tag(name = "7.2 Medical Chatbot RAG")
@SecurityRequirement(name = "bearerAuth")
public class ChatbotController {

    private final MedicalChatbotService chatbot;

    public ChatbotController(MedicalChatbotService c) { chatbot = c; }

    @PostMapping("/ask")
    @Operation(summary = "Poser une question medicale au chatbot IA")
    public ResponseEntity<ChatbotResponse> ask(@RequestBody ChatbotRequest req) {
        return ResponseEntity.ok(chatbot.answer(req.getQuestion()));
    }
}
