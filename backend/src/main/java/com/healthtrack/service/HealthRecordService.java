package com.healthtrack.service;
import com.healthtrack.dto.*;
import com.healthtrack.entity.*;
import com.healthtrack.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime; import java.util.List; import java.util.stream.Collectors;
import java.util.logging.Logger;
@Service
public class HealthRecordService {
    private static final Logger log=Logger.getLogger(HealthRecordService.class.getName());
    private final HealthRecordRepository hrr; private final UserRepository ur;
    private final AlertService alertService; private final WebSocketService ws;
    public HealthRecordService(HealthRecordRepository h,UserRepository u,AlertService a,WebSocketService w){hrr=h;ur=u;alertService=a;ws=w;}
    @Transactional
    public HealthRecordResponse addRecord(Long patientId,HealthRecordRequest req){
        User patient=ur.findById(patientId).orElseThrow(()->new RuntimeException("Patient not found"));
        HealthRecord r=HealthRecord.builder().patient(patient).systolicBP(req.getSystolicBP()).diastolicBP(req.getDiastolicBP())
                .heartRate(req.getHeartRate()).bloodGlucose(req.getBloodGlucose()).weight(req.getWeight())
                .temperature(req.getTemperature()).oxygenSaturation(req.getOxygenSaturation())
                .respiratoryRate(req.getRespiratoryRate()).notes(req.getNotes())
                .source(req.getSource()!=null?req.getSource():"MANUAL").build();
        HealthRecord saved=hrr.save(r);
        if(saved.getStatus()==HealthRecord.RecordStatus.CRITICAL||saved.getStatus()==HealthRecord.RecordStatus.WARNING){
            String msg=buildMsg(saved);
            Alert.AlertSeverity sev=saved.getStatus()==HealthRecord.RecordStatus.CRITICAL?Alert.AlertSeverity.CRITICAL:Alert.AlertSeverity.HIGH;
            alertService.createAlert(patient,saved,msg,sev);
            log.warning("HEALTH ALERT patient="+patient.getEmail()+": "+msg);
        }
        HealthRecordResponse resp=HealthRecordResponse.from(saved);
        ws.sendHealthUpdate(patientId,resp);
        return resp;
    }
    public Page<HealthRecordResponse> getPatientRecords(Long pid,int page,int size){return hrr.findByPatientIdOrderByRecordedAtDesc(pid,PageRequest.of(page,size)).map(HealthRecordResponse::from);}
    public List<HealthRecordResponse> getByDateRange(Long pid,LocalDateTime s,LocalDateTime e){return hrr.findByPatientIdAndRecordedAtBetweenOrderByRecordedAtAsc(pid,s,e).stream().map(HealthRecordResponse::from).collect(Collectors.toList());}
    public HealthRecordResponse getLatest(Long pid){return hrr.findLatestByPatient(pid,PageRequest.of(0,1)).stream().findFirst().map(HealthRecordResponse::from).orElse(null);}
    private String buildMsg(HealthRecord r){
        StringBuilder sb=new StringBuilder("Valeurs anormales: ");
        if(r.getSystolicBP()!=null&&r.getSystolicBP()>180)sb.append("Tension critique(").append(r.getSystolicBP()).append("). ");
        if(r.getBloodGlucose()!=null&&r.getBloodGlucose()>300)sb.append("Glycemie critique(").append(r.getBloodGlucose()).append("). ");
        if(r.getOxygenSaturation()!=null&&r.getOxygenSaturation()<90)sb.append("SpO2 critique(").append(r.getOxygenSaturation()).append("). ");
        return sb.toString();
    }
}