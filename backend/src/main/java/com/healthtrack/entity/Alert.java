package com.healthtrack.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="alerts")
public class Alert {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="patient_id",nullable=false) private User patient;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="doctor_id") private User doctor;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="health_record_id") private HealthRecord healthRecord;
    @Enumerated(EnumType.STRING) private AlertType type;
    @Enumerated(EnumType.STRING) private AlertSeverity severity;
    private String message,parameter;
    @Column(name="alert_value") private Double alertValue;
    private Double threshold;
    private boolean acknowledged=false;
    private LocalDateTime createdAt,acknowledgedAt;
    @PrePersist protected void onCreate(){createdAt=LocalDateTime.now();}
    public Long getId(){return id;}
    public User getPatient(){return patient;} public void setPatient(User v){patient=v;}
    public User getDoctor(){return doctor;} public void setDoctor(User v){doctor=v;}
    public HealthRecord getHealthRecord(){return healthRecord;} public void setHealthRecord(HealthRecord v){healthRecord=v;}
    public AlertType getType(){return type;} public void setType(AlertType v){type=v;}
    public AlertSeverity getSeverity(){return severity;} public void setSeverity(AlertSeverity v){severity=v;}
    public String getMessage(){return message;} public void setMessage(String v){message=v;}
    public String getParameter(){return parameter;} public void setParameter(String v){parameter=v;}
    public Double getAlertValue(){return alertValue;} public void setAlertValue(Double v){alertValue=v;}
    public Double getThreshold(){return threshold;} public void setThreshold(Double v){threshold=v;}
    public boolean isAcknowledged(){return acknowledged;} public void setAcknowledged(boolean v){acknowledged=v;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public LocalDateTime getAcknowledgedAt(){return acknowledgedAt;} public void setAcknowledgedAt(LocalDateTime v){acknowledgedAt=v;}
    public static Builder builder(){return new Builder();}
    public static class Builder {
        private final Alert a=new Alert();
        public Builder patient(User v){a.patient=v;return this;} public Builder doctor(User v){a.doctor=v;return this;}
        public Builder healthRecord(HealthRecord v){a.healthRecord=v;return this;} public Builder type(AlertType v){a.type=v;return this;}
        public Builder severity(AlertSeverity v){a.severity=v;return this;} public Builder message(String v){a.message=v;return this;}
        public Alert build(){return a;}
    }
    public enum AlertType{HIGH_BLOOD_PRESSURE,LOW_BLOOD_PRESSURE,HIGH_GLUCOSE,LOW_GLUCOSE,LOW_OXYGEN,IRREGULAR_HEARTRATE,HIGH_TEMPERATURE,SOS}
    public enum AlertSeverity{LOW,MEDIUM,HIGH,CRITICAL}
}
