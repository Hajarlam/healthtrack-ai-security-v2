package com.healthtrack.controller;
import com.healthtrack.dto.*; import com.healthtrack.service.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement; import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime; import java.util.List;
@RestController @RequestMapping("/health-records") @Tag(name="Health Records") @SecurityRequirement(name="bearerAuth")
public class HealthRecordController {
    private final HealthRecordService hrs; private final UserService us;
    public HealthRecordController(HealthRecordService h,UserService u){hrs=h;us=u;}
    @PostMapping public ResponseEntity<HealthRecordResponse> add(@RequestBody HealthRecordRequest r){return ResponseEntity.ok(hrs.addRecord(us.getCurrentUser().getId(),r));}
    @GetMapping   public ResponseEntity<Page<HealthRecordResponse>> getAll(@RequestParam(defaultValue="0")int p,@RequestParam(defaultValue="20")int s){return ResponseEntity.ok(hrs.getPatientRecords(us.getCurrentUser().getId(),p,s));}
    @GetMapping("/latest") public ResponseEntity<HealthRecordResponse> getLatest(){return ResponseEntity.ok(hrs.getLatest(us.getCurrentUser().getId()));}
    @GetMapping("/patient/{id}") public ResponseEntity<Page<HealthRecordResponse>> forPatient(@PathVariable Long id,@RequestParam(defaultValue="0")int p,@RequestParam(defaultValue="20")int s){return ResponseEntity.ok(hrs.getPatientRecords(id,p,s));}
    @GetMapping("/range") public ResponseEntity<List<HealthRecordResponse>> range(@RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,@RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) LocalDateTime end){return ResponseEntity.ok(hrs.getByDateRange(us.getCurrentUser().getId(),start,end));}
}