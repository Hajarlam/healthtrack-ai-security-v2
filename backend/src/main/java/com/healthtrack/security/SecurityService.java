package com.healthtrack.security;

import com.healthtrack.entity.AuditLog;
import com.healthtrack.entity.LoginAttempt;
import com.healthtrack.repository.AuditLogRepository;
import com.healthtrack.repository.LoginAttemptRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class SecurityService {

    private final LoginAttemptRepository loginRepo;
    private final AuditLogRepository auditRepo;

    @Value("${security.rate-limit.login-attempts:5}")
    private int maxAttempts;

    @Value("${security.rate-limit.window-minutes:15}")
    private int windowMinutes;

    public SecurityService(LoginAttemptRepository l, AuditLogRepository a) {
        loginRepo=l; auditRepo=a;
    }

    public boolean isBlocked(String email, String ip) {
        LocalDateTime since = LocalDateTime.now().minusMinutes(windowMinutes);
        long byEmail = loginRepo.countFailedAttempts(email, since);
        long byIp    = loginRepo.countFailedByIp(ip, since);
        return byEmail >= maxAttempts || byIp >= (maxAttempts * 3);
    }

    @Transactional
    public void recordLoginAttempt(String email, String ip, boolean success, String userAgent) {
        LoginAttempt a = new LoginAttempt();
        a.setEmail(email); a.setIpAddress(ip);
        a.setSuccess(success); a.setUserAgent(userAgent);
        loginRepo.save(a);
    }

    @Transactional
    public void audit(String userEmail, AuditLog.AuditAction action,
                      String resource, String resourceId, String ip,
                      boolean success, String details) {
        AuditLog log = new AuditLog();
        log.setUserEmail(userEmail);
        log.setActionType(action);
        log.setAction(action.name());
        log.setResource(resource);
        log.setResourceId(resourceId);
        log.setIpAddress(ip);
        log.setSuccess(success);
        log.setDetails(details);
        auditRepo.save(log);
    }

    public String getClientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return req.getRemoteAddr();
    }
}
