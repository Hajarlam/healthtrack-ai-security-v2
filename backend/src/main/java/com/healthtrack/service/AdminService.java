package com.healthtrack.service;

import com.healthtrack.entity.*;
import com.healthtrack.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AdminService {
    private final UserRepository userRepo;
    private final HealthRecordRepository recordRepo;
    private final AlertRepository alertRepo;
    private final AppointmentRepository appointmentRepo;
    private final MedicationRepository medicationRepo;
    private final AuditLogRepository auditRepo;

    public AdminService(UserRepository ur, HealthRecordRepository hr, AlertRepository al, 
                        AppointmentRepository ap, MedicationRepository mr, AuditLogRepository au) {
        this.userRepo = ur;
        this.recordRepo = hr;
        this.alertRepo = al;
        this.appointmentRepo = ap;
        this.medicationRepo = mr;
        this.auditRepo = au;
    }

    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepo.count();
        long totalPatients = userRepo.findAll().stream().filter(u -> u.getRole() == User.Role.PATIENT).count();
        long totalDoctors = userRepo.findAll().stream().filter(u -> u.getRole() == User.Role.DOCTOR).count();
        long totalAdmins = userRepo.findAll().stream().filter(u -> u.getRole() == User.Role.ADMIN).count();
        
        long totalRecords = recordRepo.count();
        long totalAlerts = alertRepo.count();
        long totalAppointments = appointmentRepo.count();
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalPatients", totalPatients);
        stats.put("totalDoctors", totalDoctors);
        stats.put("totalAdmins", totalAdmins);
        stats.put("totalRecords", totalRecords);
        stats.put("totalAlerts", totalAlerts);
        stats.put("totalAppointments", totalAppointments);
        
        long activeAccounts = userRepo.findAll().stream().filter(User::isEnabled).count();
        long inactiveAccounts = totalUsers - activeAccounts;
        stats.put("activeAccounts", activeAccounts);
        stats.put("inactiveAccounts", inactiveAccounts);
        
        return stats;
    }

    public Map<String, Object> exportGdprData(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> data = new HashMap<>();
        
        // 1. Profile details
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("email", user.getEmail());
        profile.put("firstName", user.getFirstName());
        profile.put("lastName", user.getLastName());
        profile.put("phone", user.getPhone());
        profile.put("role", user.getRole().name());
        profile.put("gender", user.getGender());
        profile.put("dateOfBirth", user.getDateOfBirth());
        profile.put("bloodType", user.getBloodType());
        profile.put("height", user.getHeight());
        profile.put("weight", user.getWeight());
        profile.put("chronicDiseases", user.getChronicDiseases());
        profile.put("enabled", user.isEnabled());
        data.put("profile", profile);
        
        // 2. Health Records (Up to 1000 records)
        List<HealthRecord> records = recordRepo.findByPatientIdOrderByRecordedAtDesc(userId, PageRequest.of(0, 1000)).getContent();
        data.put("healthRecords", records);
        
        // 3. Alerts
        List<Alert> alerts = alertRepo.findByPatientIdOrderByCreatedAtDesc(userId);
        data.put("alerts", alerts);
        
        // 4. Medications
        List<Medication> medications = medicationRepo.findByPatientId(userId);
        data.put("medications", medications);
        
        // 5. Audit Log (Logs involving the user's email)
        List<AuditLog> auditLogs = auditRepo.findByUserEmailOrderByTimestampDesc(user.getEmail(), PageRequest.of(0, 1000)).getContent();
        data.put("auditLogs", auditLogs);
        
        return data;
    }
}
