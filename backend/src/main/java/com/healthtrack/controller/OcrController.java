package com.healthtrack.controller;

import com.healthtrack.ai.OcrResult;
import com.healthtrack.ai.OcrService;
import com.healthtrack.entity.Medication;
import com.healthtrack.repository.MedicationRepository;
import com.healthtrack.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/ocr")
@Tag(name = "7.3 OCR Prescription Analysis")
@SecurityRequirement(name = "bearerAuth")
public class OcrController {

    private final OcrService ocrService;
    private final UserService userService;
    private final MedicationRepository medRepo;

    public OcrController(OcrService o, UserService u, MedicationRepository m) {
        ocrService=o; userService=u; medRepo=m;
    }

    @PostMapping("/analyze")
    @Operation(summary = "Analyser une ordonnance PDF ou image via OCR")
    public ResponseEntity<OcrResult> analyze(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ocrService.analyzeFile(file));
    }

    @PostMapping("/import-medications")
    @Operation(summary = "Importer les medicaments detectes depuis une ordonnance")
    public ResponseEntity<List<Medication>> importMedications(@RequestParam("file") MultipartFile file) {
        OcrResult result = ocrService.analyzeFile(file);
        List<Medication> saved = new ArrayList<>();
        if (result.isSuccess() && result.getDetectedMedications() != null) {
            List<String> meds = result.getDetectedMedications();
            List<String> dosages = result.getDetectedDosages();
            for (int i = 0; i < meds.size(); i++) {
                String medName = meds.get(i);
                if (!medName.contains("Aucun")) {
                    Medication m = new Medication();
                    m.setPatient(userService.getCurrentUser());
                    m.setName(medName);
                    String dosage = (dosages != null && i < dosages.size()) ? dosages.get(i) : "Voir ordonnance";
                    m.setDosage(dosage);
                    m.setFrequency("Voir ordonnance");
                    m.setInstructions("Importe automatiquement depuis ordonnance OCR - " + result.getDoctorName());
                    m.setStartDate(LocalDate.now());
                    m.setActive(true);
                    saved.add(medRepo.save(m));
                }
            }
        }
        return ResponseEntity.ok(saved);
    }
}
