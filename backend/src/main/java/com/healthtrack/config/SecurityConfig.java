package com.healthtrack.config;

import com.healthtrack.security.JwtAuthFilter;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtFilter;
    private final AuthenticationProvider authProvider;

    public SecurityConfig(JwtAuthFilter j, AuthenticationProvider a) {
        jwtFilter=j; authProvider=a;
    }

    @Bean
    public SecurityFilterChain chain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(c -> c.configurationSource(corsSource()))
            // 8.3 OWASP A05 — Security Misconfiguration: headers de securite
            .headers(h -> h
                .frameOptions(f -> f.sameOrigin())
                .contentTypeOptions(c -> {})
                .xssProtection(x -> {})
                .referrerPolicy(r -> r.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000))
            )
            .authorizeHttpRequests(a -> a
                // Public
                .requestMatchers(
                    "/auth/**", "/v3/api-docs/**", "/swagger-ui/**",
                    "/swagger-ui.html", "/h2-console/**", "/actuator/health",
                    "/avatar/**"
                ).permitAll()
                .requestMatchers("/users/patients").hasAnyRole("DOCTOR","ADMIN")
                .requestMatchers("/ai/**").hasAnyRole("PATIENT","DOCTOR","ADMIN")
                .requestMatchers("/ocr/**").hasAnyRole("PATIENT","DOCTOR","ADMIN")
                .requestMatchers("/audit/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authProvider)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        // 8.3 OWASP A05 — CORS restreint aux origines connues
        cfg.setAllowedOriginPatterns(List.of(
            "http://localhost:4200",   // Angular dev
            "http://localhost:3000",   // React dev (si besoin)
            "http://10.0.2.2:*",       // Android emulator
            "http://192.168.*.*:*"     // Reseau local
        ));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization","Content-Type","X-Requested-With"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
