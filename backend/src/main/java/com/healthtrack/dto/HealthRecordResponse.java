package com.healthtrack.dto;
import com.healthtrack.entity.HealthRecord;
import java.time.LocalDateTime;
public class HealthRecordResponse {
    private Long id,patientId; private String patientName;
    private Double systolicBP,diastolicBP,heartRate,bloodGlucose,weight,temperature,oxygenSaturation,respiratoryRate;
    private HealthRecord.RecordStatus status; private String notes,source; private LocalDateTime recordedAt;
    public static HealthRecordResponse from(HealthRecord r){
        HealthRecordResponse d=new HealthRecordResponse();
        d.id=r.getId();d.patientId=r.getPatient().getId();
        d.patientName=r.getPatient().getFirstName()+" "+r.getPatient().getLastName();
        d.systolicBP=r.getSystolicBP();d.diastolicBP=r.getDiastolicBP();d.heartRate=r.getHeartRate();
        d.bloodGlucose=r.getBloodGlucose();d.weight=r.getWeight();d.temperature=r.getTemperature();
        d.oxygenSaturation=r.getOxygenSaturation();d.respiratoryRate=r.getRespiratoryRate();
        d.status=r.getStatus();d.notes=r.getNotes();d.source=r.getSource();d.recordedAt=r.getRecordedAt();
        return d;
    }
    public Long getId(){return id;} public Long getPatientId(){return patientId;} public String getPatientName(){return patientName;}
    public Double getSystolicBP(){return systolicBP;} public Double getDiastolicBP(){return diastolicBP;}
    public Double getHeartRate(){return heartRate;} public Double getBloodGlucose(){return bloodGlucose;}
    public Double getWeight(){return weight;} public Double getTemperature(){return temperature;}
    public Double getOxygenSaturation(){return oxygenSaturation;} public Double getRespiratoryRate(){return respiratoryRate;}
    public HealthRecord.RecordStatus getStatus(){return status;} public String getNotes(){return notes;}
    public String getSource(){return source;} public LocalDateTime getRecordedAt(){return recordedAt;}
}