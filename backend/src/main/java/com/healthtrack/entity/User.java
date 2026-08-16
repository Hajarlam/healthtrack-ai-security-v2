package com.healthtrack.entity;
import com.healthtrack.security.AttributeEncryptor;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDate; import java.time.LocalDateTime; import java.util.*;

@Entity @Table(name="users")
public class User implements UserDetails {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,unique=true) private String email;
    @Column(nullable=false) private String password;
    @Column(nullable=false) private String firstName;
    @Column(nullable=false) private String lastName;
    private String phone; private LocalDate dateOfBirth; private String gender;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role;
    private boolean enabled=true; private boolean twoFactorEnabled=false;
    private String otpCode; private LocalDateTime otpExpiry;
    @Column(updatable=false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String bloodType; private Double height; private Double weight;
    // 8.2 — Chiffrement AES des donnees medicales sensibles
    @Convert(converter=AttributeEncryptor.class)
    private String allergies;
    @Convert(converter=AttributeEncryptor.class)
    private String chronicDiseases;
    private String emergencyContact; private String emergencyPhone;
    private String specialization; private String licenseNumber; private String hospital;
    // Compteur tentatives echecs login (OWASP A07)
    private int failedLoginAttempts = 0;
    private LocalDateTime accountLockedUntil;

    @PrePersist protected void onCreate(){createdAt=LocalDateTime.now();updatedAt=LocalDateTime.now();}
    @PreUpdate  protected void onUpdate(){updatedAt=LocalDateTime.now();}

    @Override public Collection<? extends GrantedAuthority> getAuthorities(){return List.of(new SimpleGrantedAuthority("ROLE_"+role.name()));}
    @Override public String getUsername(){return email;}
    @Override public boolean isAccountNonExpired(){return true;}
    @Override public boolean isAccountNonLocked(){
        if(accountLockedUntil==null) return true;
        return LocalDateTime.now().isAfter(accountLockedUntil);
    }
    @Override public boolean isCredentialsNonExpired(){return true;}
    @Override public boolean isEnabled(){return enabled;}

    public Long getId(){return id;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getPassword(){return password;} public void setPassword(String v){password=v;}
    public String getFirstName(){return firstName;} public void setFirstName(String v){firstName=v;}
    public String getLastName(){return lastName;} public void setLastName(String v){lastName=v;}
    public String getPhone(){return phone;} public void setPhone(String v){phone=v;}
    public LocalDate getDateOfBirth(){return dateOfBirth;} public void setDateOfBirth(LocalDate v){dateOfBirth=v;}
    public String getGender(){return gender;} public void setGender(String v){gender=v;}
    public Role getRole(){return role;} public void setRole(Role v){role=v;}
    public void setEnabled(boolean v){enabled=v;}
    public boolean isTwoFactorEnabled(){return twoFactorEnabled;} public void setTwoFactorEnabled(boolean v){twoFactorEnabled=v;}
    public String getOtpCode(){return otpCode;} public void setOtpCode(String v){otpCode=v;}
    public LocalDateTime getOtpExpiry(){return otpExpiry;} public void setOtpExpiry(LocalDateTime v){otpExpiry=v;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public String getBloodType(){return bloodType;} public void setBloodType(String v){bloodType=v;}
    public Double getHeight(){return height;} public void setHeight(Double v){height=v;}
    public Double getWeight(){return weight;} public void setWeight(Double v){weight=v;}
    public String getAllergies(){return allergies;} public void setAllergies(String v){allergies=v;}
    public String getChronicDiseases(){return chronicDiseases;} public void setChronicDiseases(String v){chronicDiseases=v;}
    public String getEmergencyContact(){return emergencyContact;} public void setEmergencyContact(String v){emergencyContact=v;}
    public String getEmergencyPhone(){return emergencyPhone;} public void setEmergencyPhone(String v){emergencyPhone=v;}
    public String getSpecialization(){return specialization;} public void setSpecialization(String v){specialization=v;}
    public String getLicenseNumber(){return licenseNumber;} public void setLicenseNumber(String v){licenseNumber=v;}
    public String getHospital(){return hospital;} public void setHospital(String v){hospital=v;}
    public int getFailedLoginAttempts(){return failedLoginAttempts;} public void setFailedLoginAttempts(int v){failedLoginAttempts=v;}
    public LocalDateTime getAccountLockedUntil(){return accountLockedUntil;} public void setAccountLockedUntil(LocalDateTime v){accountLockedUntil=v;}

    public static Builder builder(){return new Builder();}
    public static class Builder {
        private final User u=new User();
        public Builder email(String v){u.email=v;return this;} public Builder password(String v){u.password=v;return this;}
        public Builder firstName(String v){u.firstName=v;return this;} public Builder lastName(String v){u.lastName=v;return this;}
        public Builder phone(String v){u.phone=v;return this;} public Builder role(Role v){u.role=v;return this;}
        public Builder enabled(boolean v){u.enabled=v;return this;} public Builder bloodType(String v){u.bloodType=v;return this;}
        public Builder height(Double v){u.height=v;return this;} public Builder weight(Double v){u.weight=v;return this;}
        public Builder allergies(String v){u.allergies=v;return this;} public Builder chronicDiseases(String v){u.chronicDiseases=v;return this;}
        public Builder emergencyContact(String v){u.emergencyContact=v;return this;} public Builder emergencyPhone(String v){u.emergencyPhone=v;return this;}
        public Builder specialization(String v){u.specialization=v;return this;} public Builder licenseNumber(String v){u.licenseNumber=v;return this;}
        public Builder hospital(String v){u.hospital=v;return this;} public User build(){return u;}
    }
    public enum Role {PATIENT,DOCTOR,ADMIN,EMERGENCY}
}
