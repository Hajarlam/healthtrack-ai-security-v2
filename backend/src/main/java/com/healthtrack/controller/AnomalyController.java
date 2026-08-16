package com.healthtrack.controller;

import com.healthtrack.ai.AnomalyDetectionService;
import com.healthtrack.ai.AnomalyResult;
import com.healthtrack.repository.HealthRecordRepository;
import com.healthtrack.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@Tag(name = "7.1 AI Anomaly Detection")
@SecurityRequirement(name = "bearerAuth")
public class AnomalyController {

    private final AnomalyDetectionService detector;
    private final HealthRecordRepository hrRepo;
    private final UserService userService;

    public AnomalyController(AnomalyDetectionService d, HealthRecordRepository h, UserService u) {
        detector=d; hrRepo=h; userService=u;
    }

    @GetMapping("/analyze-latest")
    @Operation(summary = "Analyser la derniere mesure du patient avec IA")
    public ResponseEntity<?> analyzeLatest() {
        var records = hrRepo.findLatestByPatient(userService.getCurrentUser().getId(), PageRequest.of(0,1));
        if (records.isEmpty()) return ResponseEntity.ok(new AnomalyResult(
            AnomalyResult.RiskLevel.NORMAL,
            java.util.List.of("Aucune mesure disponible"),
            "NO_DATA",
            java.util.List.of("Enregistrez votre premiere mesure pour obtenir une analyse IA."),
            0.0
        ));
        return ResponseEntity.ok(detector.analyze(records.get(0)));
    }
}
