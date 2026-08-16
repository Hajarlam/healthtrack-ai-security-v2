package com.healthtrack.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="health_records")
public class HealthRecord {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="patient_id",nullable=false) private User patient;
    private Double systolicBP,diastolicBP,heartRate,bloodGlucose,weight,temperature,oxygenSaturation,respiratoryRate;
    @Enumerated(EnumType.STRING) private RecordStatus status;
    private String notes,source;
    private LocalDateTime recordedAt;
    @PrePersist protected void onCreate(){
        if(recordedAt==null)recordedAt=LocalDateTime.now();
        if((systolicBP!=null&&(systolicBP>180||systolicBP<90))||(bloodGlucose!=null&&(bloodGlucose>300||bloodGlucose<70))||(oxygenSaturation!=null&&oxygenSaturation<90))status=RecordStatus.CRITICAL;
        else if(systolicBP!=null&&systolicBP>140)status=RecordStatus.WARNING;
        else status=RecordStatus.NORMAL;
    }
    public Long getId(){return id;}
    public User getPatient(){return patient;} public void setPatient(User v){patient=v;}
    public Double getSystolicBP(){return systolicBP;} public void setSystolicBP(Double v){systolicBP=v;}
    public Double getDiastolicBP(){return diastolicBP;} public void setDiastolicBP(Double v){diastolicBP=v;}
    public Double getHeartRate(){return heartRate;} public void setHeartRate(Double v){heartRate=v;}
    public Double getBloodGlucose(){return bloodGlucose;} public void setBloodGlucose(Double v){bloodGlucose=v;}
    public Double getWeight(){return weight;} public void setWeight(Double v){weight=v;}
    public Double getTemperature(){return temperature;} public void setTemperature(Double v){temperature=v;}
    public Double getOxygenSaturation(){return oxygenSaturation;} public void setOxygenSaturation(Double v){oxygenSaturation=v;}
    public Double getRespiratoryRate(){return respiratoryRate;} public void setRespiratoryRate(Double v){respiratoryRate=v;}
    public RecordStatus getStatus(){return status;} public void setStatus(RecordStatus v){status=v;}
    public String getNotes(){return notes;} public void setNotes(String v){notes=v;}
    public String getSource(){return source;} public void setSource(String v){source=v;}
    public LocalDateTime getRecordedAt(){return recordedAt;}
    public static Builder builder(){return new Builder();}
    public static class Builder {
        private final HealthRecord r=new HealthRecord();
        public Builder patient(User v){r.patient=v;return this;} public Builder systolicBP(Double v){r.systolicBP=v;return this;}
        public Builder diastolicBP(Double v){r.diastolicBP=v;return this;} public Builder heartRate(Double v){r.heartRate=v;return this;}
        public Builder bloodGlucose(Double v){r.bloodGlucose=v;return this;} public Builder weight(Double v){r.weight=v;return this;}
        public Builder temperature(Double v){r.temperature=v;return this;} public Builder oxygenSaturation(Double v){r.oxygenSaturation=v;return this;}
        public Builder respiratoryRate(Double v){r.respiratoryRate=v;return this;}
        public Builder notes(String v){r.notes=v;return this;} public Builder source(String v){r.source=v;return this;}
        public HealthRecord build(){return r;}
    }
    public enum RecordStatus{NORMAL,WARNING,CRITICAL}
}
