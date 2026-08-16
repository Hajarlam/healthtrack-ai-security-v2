package com.healthtrack.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.*;
import java.security.cert.X509Certificate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/avatar")
@Tag(name = "7.4 Anam AI Avatar")
@SecurityRequirement(name = "bearerAuth")
public class AvatarController {

    static {
        disableSslVerification();
    }

    private static void disableSslVerification() {
        try {
            TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return null; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
            };

            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

            HostnameVerifier allHostsValid = new HostnameVerifier() {
                public boolean verify(String hostname, SSLSession session) { return true; }
            };
            HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Value("${anam.api-key}")
    private String anamApiKey;

    @Value("${anam.persona-id}")
    private String personaId;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/token")
    @Operation(summary = "Obtenir un session token WebRTC temporaire depuis Anam AI")
    public ResponseEntity<?> getSessionToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + anamApiKey);

            Map<String, Object> personaConfig = new HashMap<>();
            personaConfig.put("personaId", personaId);
            personaConfig.put("systemPrompt", "Vous êtes Dr. Sarah, une conseillère de santé virtuelle chaleureuse et bienveillante. Répondez toujours en français de manière claire, concise et professionnelle.");

            Map<String, Object> body = new HashMap<>();
            body.put("personaConfig", personaConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.anam.ai/v1/auth/session-token",
                entity,
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String sessionToken = (String) response.getBody().get("sessionToken");
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("sessionToken", sessionToken);
                return ResponseEntity.ok(result);
            }

            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());

        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("error", e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }
}
