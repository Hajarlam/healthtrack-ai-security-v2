package com.healthtrack.mobile.models;
public class Medication {
    private int id;
    private String name, dosage, frequency, instructions;
    private boolean active;
    public int getId()              { return id; }
    public String getName()         { return name; }
    public String getDosage()       { return dosage; }
    public String getFrequency()    { return frequency; }
    public String getInstructions() { return instructions; }
    public boolean isActive()       { return active; }
    public void setName(String v)   { name=v; }
    public void setDosage(String v) { dosage=v; }
    public void setFrequency(String v){ frequency=v; }
    public void setInstructions(String v){ instructions=v; }
}
