package com.healthtrack.controller;

import com.healthtrack.dto.*;
import com.healthtrack.security.SecurityService;
import com.healthtrack.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "8.1 Auth & Security")
public class AuthController {

    private final AuthService authService;
    private final SecurityService sec;

    public AuthController(AuthService a, SecurityService s) { authService=a; sec=s; }

    @PostMapping("/register")
    @Operation(summary = "Inscription avec validation mot de passe (OWASP A07)")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    @Operation(summary = "Connexion avec rate limiting anti-brute force (OWASP A07)")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req, HttpServletRequest httpReq) {
        String ip        = sec.getClientIp(httpReq);
        String userAgent = httpReq.getHeader("User-Agent");
        return ResponseEntity.ok(authService.login(req, ip, userAgent));
    }
}
