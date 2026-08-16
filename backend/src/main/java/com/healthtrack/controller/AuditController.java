package com.healthtrack.controller;

import com.healthtrack.entity.AuditLog;
import com.healthtrack.repository.AuditLogRepository;
import com.healthtrack.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/audit")
@Tag(name = "8.3 Security Audit")
@SecurityRequirement(name = "bearerAuth")
public class AuditController {

    private final AuditLogRepository auditRepo;
    private final UserService userService;

    public AuditController(AuditLogRepository a, UserService u) { auditRepo=a; userService=u; }

    @GetMapping("/my-activity")
    @Operation(summary = "Voir mon historique d activite")
    public ResponseEntity<List<AuditLog>> myActivity() {
        return ResponseEntity.ok(auditRepo.findByUserEmailOrderByTimestampDesc(
            userService.getCurrentUser().getEmail(), PageRequest.of(0, 50)).getContent());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: voir tous les logs de securite")
    public ResponseEntity<List<AuditLog>> allLogs() {
        return ResponseEntity.ok(auditRepo.findTop50ByOrderByTimestampDesc());
    }
}
