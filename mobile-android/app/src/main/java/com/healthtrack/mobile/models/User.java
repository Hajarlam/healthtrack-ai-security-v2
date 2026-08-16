package com.healthtrack.mobile.models;
public class User {
    private int id;
    private String email, firstName, lastName, phone, role;
    private String bloodType, allergies, chronicDiseases, specialization, hospital;
    private Double height, weight;
    public int getId()               { return id; }
    public String getEmail()         { return email; }
    public String getFirstName()     { return firstName; }
    public String getLastName()      { return lastName; }
    public String getPhone()         { return phone; }
    public String getRole()          { return role; }
    public String getBloodType()     { return bloodType; }
    public String getAllergies()     { return allergies; }
    public String getChronicDiseases(){ return chronicDiseases; }
    public String getSpecialization(){ return specialization; }
    public String getHospital()      { return hospital; }
    public Double getHeight()        { return height; }
    public Double getWeight()        { return weight; }
    public String getFullName()      { return firstName + " " + lastName; }
}
