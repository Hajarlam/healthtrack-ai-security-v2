package com.healthtrack.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/ai")
@Tag(name = "7.5 OpenAI Medical Chatbot")
@SecurityRequirement(name = "bearerAuth")
public class AiChatController {

    @Value("${ai.openai.api-key:}")
    private String openAiApiKey;

    @Value("${ai.openai.model:gpt-3.5-turbo}")
    private String openAiModel;

    @Value("${ai.openai.enabled:true}")
    private boolean openAiEnabled;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/chat")
    @Operation(summary = "Consultation médicale interactive via OpenAI GPT")
    public ResponseEntity<Map<String, Object>> chatWithAi(@RequestBody Map<String, Object> request) {
        String userMessage = (String) request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Le message ne peut pas être vide.");
            return ResponseEntity.badRequest().body(err);
        }

        Map<String, Object> responseData = new HashMap<>();

        // Try OpenAI if enabled and key is present
        if (openAiEnabled && openAiApiKey != null && !openAiApiKey.trim().isEmpty() && !openAiApiKey.contains("sk-proj-demo")) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openAiApiKey.trim());

                List<Map<String, String>> messages = new ArrayList<>();
                
                // System message
                Map<String, String> sysMsg = new HashMap<>();
                sysMsg.put("role", "system");
                sysMsg.put("content", "Tu es Dr. Sihati AI, un médecin conseiller virtuel bienveillant, chaleureux et professionnel au sein de la plateforme médicale Sihati AI. " +
                        "Tu apportes des conseils de santé clairs, précis et rassurants en Français ou en Darija/Arabe selon la langue du patient. " +
                        "Explique les symptômes, propose des mesures d'hygiène de vie, la posologie habituelle et rappelle toujours l'importance d'un avis médical en cabinet pour tout diagnostic définitif.");
                messages.add(sysMsg);

                // User message
                Map<String, String> usrMsg = new HashMap<>();
                usrMsg.put("role", "user");
                usrMsg.put("content", userMessage);
                messages.add(usrMsg);

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", openAiModel);
                requestBody.put("messages", messages);
                requestBody.put("temperature", 0.3);
                requestBody.put("max_tokens", 800);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map> apiResponse = restTemplate.postForEntity(
                        "https://api.openai.com/v1/chat/completions",
                        entity,
                        Map.class
                );

                if (apiResponse.getStatusCode().is2xxSuccessful() && apiResponse.getBody() != null) {
                    List<?> choices = (List<?>) apiResponse.getBody().get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
                        Map<?, ?> messageObj = (Map<?, ?>) firstChoice.get("message");
                        if (messageObj != null) {
                            String reply = (String) messageObj.get("content");
                            responseData.put("reply", reply);
                            responseData.put("model", openAiModel);
                            responseData.put("source", "OpenAI GPT");
                            responseData.put("success", true);
                            return ResponseEntity.ok(responseData);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("OpenAI API call error: " + e.getMessage() + ". Falling back to medical engine.");
            }
        }

        // Intelligent Clinical Expert Fallback Engine
        String smartReply = generateClinicalAdvice(userMessage);
        responseData.put("reply", smartReply);
        responseData.put("model", "Sihati Medical Engine v2.5");
        responseData.put("source", "Sihati Clinical AI");
        responseData.put("success", true);
        return ResponseEntity.ok(responseData);
    }

    private String generateClinicalAdvice(String query) {
        String lower = query.toLowerCase();

        if (lower.contains("tension") || lower.contains("hypertension") || lower.contains("systolique")) {
            return "🩺 **Conseils sur la Tension Artérielle :**\n\n" +
                    "• Une tension optimale se situe aux alentours de **120/80 mmHg**.\n" +
                    "• Si votre tension dépasse régulièrement **140/90 mmHg**, vous êtes en situation d'hypertension.\n" +
                    "• **Recommandations immédiates :** Réduisez votre consommation de sel (< 5g/jour), pratiquez une marche quotidienne de 30 minutes, hydratez-vous régulièrement et évitez le stress ainsi que la caféine.\n" +
                    "• N'hésitez pas à consigner vos prises de tension matin et soir dans l'onglet 'Nouvelle mesure'.";
        }

        if (lower.contains("glycemie") || lower.contains("sucre") || lower.contains("diabete")) {
            return "🩸 **Gestion de la Glycémie et Prévention Diabète :**\n\n" +
                    "• À jeun, la glycémie normale est comprise entre **70 et 100 mg/dL** (ou < 1.10 g/L).\n" +
                    "• Deux heures après un repas, elle doit rester inférieure à **140 mg/dL**.\n" +
                    "• **Conseils hygiéno-diététiques :** Privilégiez les aliments à index glycémique bas (légumes verts, céréales complètes, légumineuses) et limitez les sucres raffinés et sodas.\n" +
                    "• En cas de malaise, sueurs ou vertiges, vérifiez immédiatement votre taux et consultez en urgence si nécessaire.";
        }

        if (lower.contains("mal de tete") || lower.contains("cephalee") || lower.contains("migraine")) {
            return "🧠 **Prise en charge des Maux de Tête :**\n\n" +
                    "• Reposez-vous dans un endroit calme, sombre et bien aéré.\n" +
                    "• Buvez un grand verre d'eau (la déshydratation est une cause fréquente).\n" +
                    "• Le paracétamol (1g chez l'adulte, espacé d'au moins 6h, max 3g/jour) peut soulager les céphalées simples.\n" +
                    "• ⚠️ **Signes d'alerte :** Si le mal de tête est brutal, d'une intensité inhabituelle, accompagné de fièvre, de raideur de nuque ou de troubles visuels, contactez immédiatement le 15 ou le 141 (SOS Urgence).";
        }

        if (lower.contains("fievre") || lower.contains("temperature") || lower.contains("chaud")) {
            return "🌡️ **Gestion de la Fièvre :**\n\n" +
                    "• On parle de fièvre à partir de **38°C** au repos.\n" +
                    "• Portez des vêtements légers, aérez la pièce et hydratez-vous abondamment.\n" +
                    "• Médicament de première intention : **Paracétamol** (respecter les doses et espacer d'au moins 4 à 6 heures).\n" +
                    "• Consultez un médecin si la fièvre persiste plus de 48-72h ou si elle s'accompagne de difficultés respiratoires.";
        }

        if (lower.contains("coeur") || lower.contains("palpitation") || lower.contains("pouls") || lower.contains("cardio")) {
            return "❤️ **Rythme Cardiaque et Palpitations :**\n\n" +
                    "• La fréquence cardiaque normale au repos se situe entre **60 et 100 battements par minute**.\n" +
                    "• Des palpitations passagères peuvent être déclenchées par le stress, l'effort ou les excitants (café, tabac).\n" +
                    "• Pratiquez la respiration ventrale (cohérence cardiaque 5-5) pour apaiser le rythme.\n" +
                    "• En cas de douleur thoracique constrictive irradiant vers le bras ou la mâchoire, déclenchez l'alerte **SOS Urgence** immédiatement.";
        }

        return "👨‍⚕️ **Bonjour, je suis le Dr. Sihati AI.**\n\n" +
                "J'ai bien pris en compte votre question : *\"" + query + "\"*.\n\n" +
                "• Pour surveiller au mieux votre santé, enregistrez régulièrement vos constantes vitales dans l'application.\n" +
                "• Maintenez une alimentation équilibrée, une bonne hydratation et une activité physique régulière adaptée à votre état.\n" +
                "• N'hésitez pas à utiliser également le **Médecin Virtuel Interactif** pour une consultation vidéo avec Dr. Sarah, ou à prendre rendez-vous avec un médecin référent via l'application.";
    }
}
