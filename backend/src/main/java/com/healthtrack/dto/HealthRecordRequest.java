package com.healthtrack.dto;
public class HealthRecordRequest {
    private Double systolicBP,diastolicBP,heartRate,bloodGlucose,weight,temperature,oxygenSaturation,respiratoryRate;
    private String notes,source;
    public Double getSystolicBP(){return systolicBP;} public void setSystolicBP(Double v){systolicBP=v;}
    public Double getDiastolicBP(){return diastolicBP;} public void setDiastolicBP(Double v){diastolicBP=v;}
    public Double getHeartRate(){return heartRate;} public void setHeartRate(Double v){heartRate=v;}
    public Double getBloodGlucose(){return bloodGlucose;} public void setBloodGlucose(Double v){bloodGlucose=v;}
    public Double getWeight(){return weight;} public void setWeight(Double v){weight=v;}
    public Double getTemperature(){return temperature;} public void setTemperature(Double v){temperature=v;}
    public Double getOxygenSaturation(){return oxygenSaturation;} public void setOxygenSaturation(Double v){oxygenSaturation=v;}
    public Double getRespiratoryRate(){return respiratoryRate;} public void setRespiratoryRate(Double v){respiratoryRate=v;}
    public String getNotes(){return notes;} public void setNotes(String v){notes=v;}
    public String getSource(){return source;} public void setSource(String v){source=v;}
}