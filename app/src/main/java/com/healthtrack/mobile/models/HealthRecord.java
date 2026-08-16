package com.healthtrack.mobile.models;
public class HealthRecord {
    private int id;
    private Double systolicBP, diastolicBP, heartRate, bloodGlucose;
    private Double weight, temperature, oxygenSaturation, respiratoryRate;
    private String status, notes, source, recordedAt, patientName;
    private int patientId;

    // Setters
    public void setSystolicBP(Double v)     { systolicBP=v; }
    public void setDiastolicBP(Double v)    { diastolicBP=v; }
    public void setHeartRate(Double v)      { heartRate=v; }
    public void setBloodGlucose(Double v)   { bloodGlucose=v; }
    public void setWeight(Double v)         { weight=v; }
    public void setTemperature(Double v)    { temperature=v; }
    public void setOxygenSaturation(Double v){oxygenSaturation=v;}
    public void setRespiratoryRate(Double v){respiratoryRate=v;}
    public void setNotes(String v)          { notes=v; }
    public void setSource(String v)         { source=v; }

    // Getters
    public int getId()                      { return id; }
    public Double getSystolicBP()           { return systolicBP; }
    public Double getDiastolicBP()          { return diastolicBP; }
    public Double getHeartRate()            { return heartRate; }
    public Double getBloodGlucose()         { return bloodGlucose; }
    public Double getWeight()               { return weight; }
    public Double getTemperature()          { return temperature; }
    public Double getOxygenSaturation()     { return oxygenSaturation; }
    public Double getRespiratoryRate()      { return respiratoryRate; }
    public String getStatus()               { return status; }
    public String getNotes()                { return notes; }
    public String getSource()               { return source; }
    public String getRecordedAt()           { return recordedAt; }
    public String getPatientName()          { return patientName; }
    public int getPatientId()               { return patientId; }

    public String getBloodPressure() {
        if(systolicBP!=null && diastolicBP!=null) return systolicBP.intValue()+"/"+diastolicBP.intValue()+" mmHg";
        return "--/-- mmHg";
    }
}
