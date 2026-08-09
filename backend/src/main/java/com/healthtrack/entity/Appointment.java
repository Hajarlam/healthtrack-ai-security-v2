package com.healthtrack.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="appointments")
public class Appointment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="patient_id",nullable=false) private User patient;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="doctor_id",nullable=false) private User doctor;
    private LocalDateTime appointmentDate;
    private String reason,notes;
    private Integer durationMinutes;
    @Enumerated(EnumType.STRING) private AppointmentStatus status;
    private LocalDateTime createdAt;
    @PrePersist protected void onCreate(){createdAt=LocalDateTime.now();if(status==null)status=AppointmentStatus.PENDING;}
    public Long getId(){return id;}
    public User getPatient(){return patient;} public void setPatient(User v){patient=v;}
    public User getDoctor(){return doctor;} public void setDoctor(User v){doctor=v;}
    public LocalDateTime getAppointmentDate(){return appointmentDate;} public void setAppointmentDate(LocalDateTime v){appointmentDate=v;}
    public String getReason(){return reason;} public void setReason(String v){reason=v;}
    public String getNotes(){return notes;} public void setNotes(String v){notes=v;}
    public Integer getDurationMinutes(){return durationMinutes;} public void setDurationMinutes(Integer v){durationMinutes=v;}
    public AppointmentStatus getStatus(){return status;} public void setStatus(AppointmentStatus v){status=v;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public static Builder builder(){return new Builder();}
    public static class Builder {
        private final Appointment a=new Appointment();
        public Builder patient(User v){a.patient=v;return this;} public Builder doctor(User v){a.doctor=v;return this;}
        public Builder appointmentDate(LocalDateTime v){a.appointmentDate=v;return this;}
        public Builder reason(String v){a.reason=v;return this;} public Appointment build(){return a;}
    }
    public enum AppointmentStatus{PENDING,CONFIRMED,CANCELLED,COMPLETED}
}
