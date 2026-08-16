package com.healthtrack.service;

import com.healthtrack.dto.*;
import com.healthtrack.entity.AuditLog;
import com.healthtrack.entity.User;
import com.healthtrack.repository.UserRepository;
import com.healthtrack.security.JwtService;
import com.healthtrack.security.SecurityService;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {
    private final UserRepository ur;
    private final PasswordEncoder pe;
    private final JwtService js;
    private final AuthenticationManager am;
    private final EmailService es;
    private final SecurityService sec;

    public AuthService(UserRepository u, PasswordEncoder p, JwtService j,
                       AuthenticationManager a, EmailService e, SecurityService s) {
        ur=u; pe=p; js=j; am=a; es=e; sec=s;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        // Validation mot de passe
        validatePassword(req.getPassword());
        if (ur.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email deja utilise");
        User user = User.builder()
            .email(req.getEmail()).password(pe.encode(req.getPassword()))
            .firstName(req.getFirstName()).lastName(req.getLastName())
            .phone(req.getPhone()).role(req.getRole() == null ? User.Role.PATIENT : req.getRole())
            .enabled(true).bloodType(req.getBloodType()).height(req.getHeight()).weight(req.getWeight())
            .allergies(req.getAllergies()).chronicDiseases(req.getChronicDiseases())
            .emergencyContact(req.getEmergencyContact()).emergencyPhone(req.getEmergencyPhone())
            .specialization(req.getSpecialization()).licenseNumber(req.getLicenseNumber())
            .hospital(req.getHospital()).build();
        ur.save(user);
        sec.audit(req.getEmail(), AuditLog.AuditAction.REGISTER, "USER", null, "system", true, "Nouvel utilisateur inscrit");
        return AuthResponse.builder()
            .accessToken(js.generateToken(user)).refreshToken(js.generateRefreshToken(user))
            .email(user.getEmail()).firstName(user.getFirstName()).lastName(user.getLastName())
            .role(user.getRole()).userId(user.getId()).message("Inscription reussie").build();
    }

    public AuthResponse login(AuthRequest req, String ip, String userAgent) {
        // Verifier blocage
        if (sec.isBlocked(req.getEmail(), ip)) {
            sec.recordLoginAttempt(req.getEmail(), ip, false, userAgent);
            throw new RuntimeException("Trop de tentatives. Compte temporairement bloque " +
                "pendant 15 minutes. (Securite OWASP A07)");
        }
        try {
            am.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException e) {
            sec.recordLoginAttempt(req.getEmail(), ip, false, userAgent);
            sec.audit(req.getEmail(), AuditLog.AuditAction.LOGIN, "AUTH", null, ip, false, "Mauvais mot de passe");
            throw new RuntimeException("Email ou mot de passe incorrect");
        }
        User user = ur.findByEmail(req.getEmail()).orElseThrow();

        if (user.isTwoFactorEnabled()) {
            if (req.getOtpCode() == null || req.getOtpCode().isBlank()) {
                sendOtp(user);
                return AuthResponse.builder().twoFactorRequired(true)
                    .email(user.getEmail()).message("Code OTP envoye (2FA actif)").build();
            }
            validateOtp(user, req.getOtpCode());
        }

        sec.recordLoginAttempt(req.getEmail(), ip, true, userAgent);
        sec.audit(req.getEmail(), AuditLog.AuditAction.LOGIN, "AUTH", null, ip, true, "Connexion reussie");

        return AuthResponse.builder()
            .accessToken(js.generateToken(user)).refreshToken(js.generateRefreshToken(user))
            .email(user.getEmail()).firstName(user.getFirstName()).lastName(user.getLastName())
            .role(user.getRole()).userId(user.getId()).message("Connexion reussie").build();
    }

    // Login sans securite IP (fallback pour la version existante)
    public AuthResponse login(AuthRequest req) {
        return login(req, "0.0.0.0", "unknown");
    }

    private void validatePassword(String pwd) {
        if (pwd == null || pwd.length() < 8)
            throw new RuntimeException("Le mot de passe doit contenir au moins 8 caracteres");
        if (!pwd.matches(".*[A-Z].*"))
            throw new RuntimeException("Le mot de passe doit contenir au moins une majuscule");
        if (!pwd.matches(".*[0-9].*"))
            throw new RuntimeException("Le mot de passe doit contenir au moins un chiffre");
    }

    private void sendOtp(User u) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        u.setOtpCode(otp); u.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        ur.save(u); es.sendOtpEmail(u.getEmail(), otp);
    }

    private void validateOtp(User u, String otp) {
        if (u.getOtpCode() == null || !u.getOtpCode().equals(otp))
            throw new RuntimeException("Code OTP invalide");
        if (LocalDateTime.now().isAfter(u.getOtpExpiry()))
            throw new RuntimeException("Code OTP expire");
        u.setOtpCode(null); u.setOtpExpiry(null); ur.save(u);
    }
}
