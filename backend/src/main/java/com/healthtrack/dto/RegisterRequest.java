package com.healthtrack.dto;
import com.healthtrack.entity.User;
public class RegisterRequest {
    private String email,password,firstName,lastName,phone;
    private User.Role role=User.Role.PATIENT;
    private String bloodType,allergies,chronicDiseases,emergencyContact,emergencyPhone,specialization,licenseNumber,hospital;
    private Double height,weight;
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPassword(){return password;} public void setPassword(String v){password=v;}
    public String getFirstName(){return firstName;} public void setFirstName(String v){firstName=v;}
    public String getLastName(){return lastName;} public void setLastName(String v){lastName=v;}
    public String getPhone(){return phone;} public void setPhone(String v){phone=v;}
    public User.Role getRole(){return role;} public void setRole(User.Role v){role=v;}
    public String getBloodType(){return bloodType;} public void setBloodType(String v){bloodType=v;}
    public String getAllergies(){return allergies;} public void setAllergies(String v){allergies=v;}
    public String getChronicDiseases(){return chronicDiseases;} public void setChronicDiseases(String v){chronicDiseases=v;}
    public String getEmergencyContact(){return emergencyContact;} public void setEmergencyContact(String v){emergencyContact=v;}
    public String getEmergencyPhone(){return emergencyPhone;} public void setEmergencyPhone(String v){emergencyPhone=v;}
    public Double getHeight(){return height;} public void setHeight(Double v){height=v;}
    public Double getWeight(){return weight;} public void setWeight(Double v){weight=v;}
    public String getSpecialization(){return specialization;} public void setSpecialization(String v){specialization=v;}
    public String getLicenseNumber(){return licenseNumber;} public void setLicenseNumber(String v){licenseNumber=v;}
    public String getHospital(){return hospital;} public void setHospital(String v){hospital=v;}
}