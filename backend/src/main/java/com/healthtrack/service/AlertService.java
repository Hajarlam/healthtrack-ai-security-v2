package com.healthtrack.service;
import com.healthtrack.entity.*;
import com.healthtrack.repository.AlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime; import java.util.List;
@Service
public class AlertService {
    private final AlertRepository alertRepository;
    private final EmailService emailService;
    public AlertService(AlertRepository a,EmailService e){alertRepository=a;emailService=e;}
    @Transactional
    public Alert createAlert(User patient,HealthRecord record,String msg,Alert.AlertSeverity sev){
        Alert a=Alert.builder().patient(patient).healthRecord(record).severity(sev).message(msg).type(Alert.AlertType.HIGH_BLOOD_PRESSURE).build();
        Alert saved=alertRepository.save(a);
        if(sev==Alert.AlertSeverity.CRITICAL)emailService.sendCriticalAlertEmail(patient,msg);
        return saved;
    }
    public List<Alert> getPatientAlerts(Long pid){return alertRepository.findByPatientIdOrderByCreatedAtDesc(pid);}
    public List<Alert> getDoctorAlerts(Long did){return alertRepository.findByDoctorIdAndAcknowledgedFalseOrderByCreatedAtDesc(did);}
    @Transactional
    public Alert acknowledgeAlert(Long id){
        Alert a=alertRepository.findById(id).orElseThrow(()->new RuntimeException("Alert not found"));
        a.setAcknowledged(true);a.setAcknowledgedAt(LocalDateTime.now());return alertRepository.save(a);
    }
    public long countUnacknowledged(Long pid){return alertRepository.countByPatientIdAndAcknowledgedFalse(pid);}
}