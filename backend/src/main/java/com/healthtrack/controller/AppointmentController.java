package com.healthtrack.controller;
import com.healthtrack.entity.Appointment; import com.healthtrack.repository.*;
import com.healthtrack.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement; import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime; import java.util.*; import com.healthtrack.entity.User;
@RestController @RequestMapping("/appointments") @Tag(name="Appointments") @SecurityRequirement(name="bearerAuth")
public class AppointmentController {
    private final AppointmentRepository ar; private final UserRepository ur; private final UserService us;
    public AppointmentController(AppointmentRepository a,UserRepository u,UserService s){ar=a;ur=u;us=s;}
    @GetMapping public ResponseEntity<List<Appointment>> getAll(){
        User cur=us.getCurrentUser();
        if("DOCTOR".equals(cur.getRole().name())||"ADMIN".equals(cur.getRole().name()))return ResponseEntity.ok(ar.findByDoctorIdOrderByAppointmentDateAsc(cur.getId()));
        return ResponseEntity.ok(ar.findByPatientIdOrderByAppointmentDateDesc(cur.getId()));
    }
    @PostMapping public ResponseEntity<?> create(@RequestBody Map<String,Object> body){
        User patient=us.getCurrentUser();
        Long did=Long.valueOf(body.get("doctorId").toString());
        User doctor=ur.findById(did).orElseThrow(()->new RuntimeException("Medecin introuvable"));
        String ds=body.get("appointmentDate").toString();
        Appointment a=Appointment.builder().patient(patient).doctor(doctor)
                .appointmentDate(LocalDateTime.parse(ds.contains("T")?ds:ds+"T00:00"))
                .reason(body.getOrDefault("reason","").toString()).build();
        return ResponseEntity.ok(ar.save(a));
    }
    @PatchMapping("/{id}/cancel") public ResponseEntity<Appointment> cancel(@PathVariable Long id){
        Appointment a=ar.findById(id).orElseThrow(()->new RuntimeException("Not found"));
        a.setStatus(Appointment.AppointmentStatus.CANCELLED);return ResponseEntity.ok(ar.save(a));
    }
    @PatchMapping("/{id}/confirm") public ResponseEntity<Appointment> confirm(@PathVariable Long id){
        Appointment a=ar.findById(id).orElseThrow(()->new RuntimeException("Not found"));
        a.setStatus(Appointment.AppointmentStatus.CONFIRMED);return ResponseEntity.ok(ar.save(a));
    }
}