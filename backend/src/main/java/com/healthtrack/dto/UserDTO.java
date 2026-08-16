package com.healthtrack.dto;
import com.healthtrack.entity.User;
import java.time.LocalDate; import java.time.LocalDateTime;
public class UserDTO {
    private Long id; private String email,firstName,lastName,phone,gender;
    private LocalDate dateOfBirth; private User.Role role; private boolean enabled;
    private LocalDateTime createdAt; private String bloodType,allergies,chronicDiseases,specialization,hospital;
    private Double height,weight;
    public static UserDTO from(User u){
        UserDTO d=new UserDTO();
        d.id=u.getId();d.email=u.getEmail();d.firstName=u.getFirstName();d.lastName=u.getLastName();
        d.phone=u.getPhone();d.dateOfBirth=u.getDateOfBirth();d.gender=u.getGender();d.role=u.getRole();
        d.enabled=u.isEnabled();d.createdAt=u.getCreatedAt();d.bloodType=u.getBloodType();
        d.height=u.getHeight();d.weight=u.getWeight();d.allergies=u.getAllergies();
        d.chronicDiseases=u.getChronicDiseases();d.specialization=u.getSpecialization();d.hospital=u.getHospital();
        return d;
    }
    public Long getId(){return id;} public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getFirstName(){return firstName;} public void setFirstName(String v){firstName=v;}
    public String getLastName(){return lastName;} public void setLastName(String v){lastName=v;}
    public String getPhone(){return phone;} public void setPhone(String v){phone=v;}
    public String getGender(){return gender;} public void setGender(String v){gender=v;}
    public LocalDate getDateOfBirth(){return dateOfBirth;} public void setDateOfBirth(LocalDate v){dateOfBirth=v;}
    public User.Role getRole(){return role;} public boolean isEnabled(){return enabled;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public String getBloodType(){return bloodType;} public void setBloodType(String v){bloodType=v;}
    public Double getHeight(){return height;} public void setHeight(Double v){height=v;}
    public Double getWeight(){return weight;} public void setWeight(Double v){weight=v;}
    public String getAllergies(){return allergies;} public void setAllergies(String v){allergies=v;}
    public String getChronicDiseases(){return chronicDiseases;} public void setChronicDiseases(String v){chronicDiseases=v;}
    public String getSpecialization(){return specialization;} public void setSpecialization(String v){specialization=v;}
    public String getHospital(){return hospital;} public void setHospital(String v){hospital=v;}
}