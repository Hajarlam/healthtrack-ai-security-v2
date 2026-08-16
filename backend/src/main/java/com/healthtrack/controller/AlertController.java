package com.healthtrack.controller;
import com.healthtrack.entity.Alert;
import com.healthtrack.entity.User;
import com.healthtrack.service.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement; import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/alerts") @Tag(name="Alerts") @SecurityRequirement(name="bearerAuth")
public class AlertController {
    private final AlertService as; private final UserService us;
    public AlertController(AlertService a,UserService u){as=a;us=u;}
    @GetMapping
    public ResponseEntity<List<Alert>> getAll() {
        User cur = us.getCurrentUser();
        if ("DOCTOR".equals(cur.getRole().name()) || "ADMIN".equals(cur.getRole().name())) {
            return ResponseEntity.ok(as.getDoctorAlerts(cur.getId()));
        }
        return ResponseEntity.ok(as.getPatientAlerts(cur.getId()));
    }
    @PatchMapping("/{id}/acknowledge") public ResponseEntity<Alert> ack(@PathVariable Long id){return ResponseEntity.ok(as.acknowledgeAlert(id));}
    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        User cur = us.getCurrentUser();
        if ("DOCTOR".equals(cur.getRole().name()) || "ADMIN".equals(cur.getRole().name())) {
            return ResponseEntity.ok((long) as.getDoctorAlerts(cur.getId()).size());
        }
        return ResponseEntity.ok(as.countUnacknowledged(cur.getId()));
    }
}