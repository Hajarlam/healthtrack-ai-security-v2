package com.healthtrack.mobile.models;
public class Appointment {
    private int id, doctorId, patientId;
    private String appointmentDate, reason, status;
    public int getId()                  { return id; }
    public int getDoctorId()            { return doctorId; }
    public int getPatientId()           { return patientId; }
    public String getAppointmentDate()  { return appointmentDate; }
    public String getReason()           { return reason; }
    public String getStatus()           { return status; }
    public void setDoctorId(int v)      { doctorId=v; }
    public void setAppointmentDate(String v){ appointmentDate=v; }
    public void setReason(String v)     { reason=v; }
}
