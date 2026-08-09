package com.healthtrack.entity;
import jakarta.persistence.*;
import java.time.LocalDate; import java.time.LocalDateTime;
@Entity @Table(name="medications")
public class Medication {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="patient_id",nullable=false) private User patient;
    @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="prescribed_by") private User prescribedBy;
    private String name,dosage,frequency,instructions;
    private LocalDate startDate,endDate;
    private boolean active=true;
    private LocalDateTime createdAt;
    @PrePersist protected void onCreate(){createdAt=LocalDateTime.now();}
    public Long getId(){return id;}
    public User getPatient(){return patient;} public void setPatient(User v){patient=v;}
    public User getPrescribedBy(){return prescribedBy;} public void setPrescribedBy(User v){prescribedBy=v;}
    public String getName(){return name;} public void setName(String v){name=v;}
    public String getDosage(){return dosage;} public void setDosage(String v){dosage=v;}
    public String getFrequency(){return frequency;} public void setFrequency(String v){frequency=v;}
    public String getInstructions(){return instructions;} public void setInstructions(String v){instructions=v;}
    public LocalDate getStartDate(){return startDate;} public void setStartDate(LocalDate v){startDate=v;}
    public LocalDate getEndDate(){return endDate;} public void setEndDate(LocalDate v){endDate=v;}
    public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public static Builder builder(){return new Builder();}
    public static class Builder {
        private final Medication m=new Medication();
        public Builder patient(User v){m.patient=v;return this;} public Builder name(String v){m.name=v;return this;}
        public Builder dosage(String v){m.dosage=v;return this;} public Builder frequency(String v){m.frequency=v;return this;}
        public Builder instructions(String v){m.instructions=v;return this;}
        public Builder startDate(LocalDate v){m.startDate=v;return this;} public Medication build(){return m;}
    }
}
