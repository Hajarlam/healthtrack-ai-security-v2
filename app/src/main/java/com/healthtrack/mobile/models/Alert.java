package com.healthtrack.mobile.models;
public class Alert {
    private int id;
    private String message, severity, type, createdAt;
    private boolean acknowledged;
    private User patient;
    public int getId()              { return id; }
    public String getMessage()      { return message; }
    public String getSeverity()     { return severity; }
    public String getType()         { return type; }
    public String getCreatedAt()    { return createdAt; }
    public boolean isAcknowledged() { return acknowledged; }
    public void setAcknowledged(boolean v){ acknowledged=v; }
    public User getPatient()        { return patient; }
}
