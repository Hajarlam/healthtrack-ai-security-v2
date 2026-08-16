package com.healthtrack.controller;
import com.healthtrack.entity.Medication; import com.healthtrack.repository.MedicationRepository;
import com.healthtrack.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement; import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
import java.time.LocalDate; import java.util.*; import com.healthtrack.entity.User;
@RestController @RequestMapping("/medications") @Tag(name="Medications") @SecurityRequirement(name="bearerAuth")
public class MedicationController {
    private final MedicationRepository mr; private final UserService us;
    public MedicationController(MedicationRepository m,UserService u){mr=m;us=u;}
    @GetMapping  public ResponseEntity<List<Medication>> getAll(){return ResponseEntity.ok(mr.findByPatientId(us.getCurrentUser().getId()));}
    @PostMapping public ResponseEntity<Medication> add(@RequestBody Map<String,Object> body){
        User p=us.getCurrentUser();
        Medication m=Medication.builder().patient(p).name(body.getOrDefault("name","").toString())
                .dosage(body.getOrDefault("dosage","").toString()).frequency(body.getOrDefault("frequency","").toString())
                .instructions(body.getOrDefault("instructions","").toString()).startDate(LocalDate.now()).build();
        return ResponseEntity.ok(mr.save(m));
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){mr.deleteById(id);return ResponseEntity.ok().build();}
}