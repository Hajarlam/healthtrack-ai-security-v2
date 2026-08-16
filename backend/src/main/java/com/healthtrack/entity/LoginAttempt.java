package com.healthtrack.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="login_attempts")
public class LoginAttempt {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String email;
    @Column(nullable=false) private String ipAddress;
    private boolean success;
    private LocalDateTime attemptTime;
    private String userAgent;
    @PrePersist void onCreate(){attemptTime=LocalDateTime.now();}
    public Long getId(){return id;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;}
    public String getIpAddress(){return ipAddress;} public void setIpAddress(String v){ipAddress=v;}
    public boolean isSuccess(){return success;} public void setSuccess(boolean v){success=v;}
    public LocalDateTime getAttemptTime(){return attemptTime;}
    public String getUserAgent(){return userAgent;} public void setUserAgent(String v){userAgent=v;}
}
