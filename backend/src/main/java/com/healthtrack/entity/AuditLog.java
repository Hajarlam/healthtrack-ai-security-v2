package com.healthtrack.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private String userEmail;
    private String action;
    private String resource;
    private String resourceId;
    private String ipAddress;
    private String details;
    @Enumerated(EnumType.STRING) private AuditAction actionType;
    private boolean success;
    private LocalDateTime timestamp;
    @PrePersist void onCreate(){timestamp=LocalDateTime.now();}
    public Long getId(){return id;}
    public String getUserEmail(){return userEmail;} public void setUserEmail(String v){userEmail=v;}
    public String getAction(){return action;} public void setAction(String v){action=v;}
    public String getResource(){return resource;} public void setResource(String v){resource=v;}
    public String getResourceId(){return resourceId;} public void setResourceId(String v){resourceId=v;}
    public String getIpAddress(){return ipAddress;} public void setIpAddress(String v){ipAddress=v;}
    public String getDetails(){return details;} public void setDetails(String v){details=v;}
    public AuditAction getActionType(){return actionType;} public void setActionType(AuditAction v){actionType=v;}
    public boolean isSuccess(){return success;} public void setSuccess(boolean v){success=v;}
    public LocalDateTime getTimestamp(){return timestamp;}
    public enum AuditAction {LOGIN,LOGOUT,REGISTER,DATA_ACCESS,DATA_MODIFY,DATA_DELETE,SECURITY_EVENT,OCR_UPLOAD,AI_QUERY}
}
