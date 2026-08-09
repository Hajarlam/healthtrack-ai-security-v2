package com.healthtrack.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthtrack.entity.HealthRecord;
import com.healthtrack.entity.User;
import com.healthtrack.repository.HealthRecordRepository;
import com.healthtrack.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import java.net.HttpURLConnection;
import javax.net.ssl.HttpsURLConnection;

@Service
public class MedicalChatbotService {

    private final UserService userService;
    private final HealthRecordRepository hrRepo;
    private final RestTemplate restTemplate = createTrustAllRestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${ai.demo-mode:true}")
    private boolean demoMode;

    @Value("${ai.ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${ai.ollama.model:mistral}")
    private String ollamaModel;

    @Value("${ai.ollama.enabled:false}")
    private boolean ollamaEnabled;

    @Value("${ai.openai.api-key:demo-key}")
    private String openAiApiKey;

    @Value("${ai.openai.model:gpt-3.5-turbo}")
    private String openAiModel;

    @Value("${ai.openai.enabled:false}")
    private boolean openAiEnabled;

    // Base de connaissances medicales (RAG simplifie)
    private static final Map<String, String> MEDICAL_KB = new LinkedHashMap<>();
    static {
        MEDICAL_KB.put("tension", "La tension normale est inferieure a 120/80 mmHg. " +
            "L hypertension (> 140/90) augmente le risque cardiovasculaire. " +
            "Facteurs de risque: sel, obésité, stress, sedentarite.");
        MEDICAL_KB.put("glycemie", "La glycemie normale a jeun est entre 70 et 100 mg/dL. " +
            "Un taux > 126 mg/dL indique un diabete. Entre 100-125 = predbete. " +
            "Le diabete de type 2 est souvent lie a l obesite et au manque d activite physique.");
        MEDICAL_KB.put("spo2", "La saturation en oxygene normale est > 95%. " +
            "En dessous de 90% c est une urgence medicale. " +
            "Une SpO2 basse peut indiquer une pneumonie, une insuffisance cardiaque ou une BPCO.");
        MEDICAL_KB.put("coeur", "La frequence cardiaque normale est 60-100 bpm. " +
            "La tachycardie (> 100 bpm) peut etre due au stress, la fievre ou une arythmie. " +
            "La bradycardie (< 60 bpm) peut etre normale chez les sportifs ou indiquer un probleme cardiaque.");
        MEDICAL_KB.put("fievre", "La fievre est > 38C. Une fievre > 39.5C necessite une attention medicale. " +
            "Traitement: paracetamol, hydratation. Consultez si > 72h ou > 40C.");
        MEDICAL_KB.put("diabete", "Le diabete de type 1 necessite de l insuline. Le type 2 peut etre controle " +
            "par le regime, l exercice et les medicaments. Surveillance: HbA1c < 7% recommande.");
        MEDICAL_KB.put("medicament", "Ne modifiez jamais votre traitement sans avis medical. " +
            "Respectez les posologies et horaires prescrits. Signalez tout effet indesirable.");
        MEDICAL_KB.put("urgence", "Urgences vitales: douleur thoracique, AVC (FAST), difficulte respiratoire severe. " +
            "Appelez le 15 (SAMU) ou le 18 (pompiers) immediatement.");
    }

    public MedicalChatbotService(UserService u, HealthRecordRepository h) {
        userService = u; hrRepo = h;
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        System.out.println("====== MedicalChatbotService Configuration ======");
        System.out.println("OpenAI Enabled: " + openAiEnabled);
        System.out.println("OpenAI Model: " + openAiModel);
        System.out.println("OpenAI API Key: " + (openAiApiKey != null && openAiApiKey.length() > 10 ? openAiApiKey.substring(0, 10) + "..." : "null/empty"));
        System.out.println("=================================================");
    }

    public ChatbotResponse answer(String question) {
        User patient = userService.getCurrentUser();

        // 1. Contexte patient (RAG - Retrieval)
        String patientContext = buildPatientContext(patient);

        // 2. Recherche dans la base de connaissances (RAG - Augmentation)
        String medicalContext = retrieveRelevantKnowledge(question);

        // 3. Generation de la réponse
        String answer;
        String model;

        if (openAiEnabled) {
            answer = callOpenAi(question, patientContext, medicalContext);
            model  = "openai/" + openAiModel;
        } else if (ollamaEnabled) {
            answer = callOllama(question, patientContext, medicalContext);
            model  = "ollama/" + ollamaModel;
        } else {
            // Mode demo avec logique medicale codee
            answer = generateDemoAnswer(question, patientContext, medicalContext);
            model  = "sihati-ai-demo";
        }

        return new ChatbotResponse(answer, model);
    }

    private String buildPatientContext(User patient) {
        StringBuilder ctx = new StringBuilder("Informations du patient: ");
        ctx.append("Nom: ").append(patient.getFirstName()).append(" ").append(patient.getLastName()).append(". ");
        if (patient.getChronicDiseases() != null && !patient.getChronicDiseases().isEmpty())
            ctx.append("Maladies chroniques: ").append(patient.getChronicDiseases()).append(". ");
        if (patient.getAllergies() != null && !patient.getAllergies().isEmpty())
            ctx.append("Allergies: ").append(patient.getAllergies()).append(". ");
        if (patient.getBloodType() != null)
            ctx.append("Groupe sanguin: ").append(patient.getBloodType()).append(". ");

        // Derniere mesure
        var records = hrRepo.findLatestByPatient(patient.getId(), PageRequest.of(0, 1));
        if (!records.isEmpty()) {
            HealthRecord r = records.get(0);
            ctx.append("Dernieres constantes: ");
            if (r.getSystolicBP() != null) ctx.append("Tension ").append(r.getSystolicBP()).append("/").append(r.getDiastolicBP()).append(" mmHg, ");
            if (r.getBloodGlucose() != null) ctx.append("Glycemie ").append(r.getBloodGlucose()).append(" mg/dL, ");
            if (r.getOxygenSaturation() != null) ctx.append("SpO2 ").append(r.getOxygenSaturation()).append("%, ");
            if (r.getHeartRate() != null) ctx.append("FC ").append(r.getHeartRate()).append(" bpm. ");
        }
        return ctx.toString();
    }

    private String retrieveRelevantKnowledge(String question) {
        String q = question.toLowerCase();
        StringBuilder kb = new StringBuilder();
        for (Map.Entry<String,String> entry : MEDICAL_KB.entrySet()) {
            if (q.contains(entry.getKey()) || entry.getKey().contains(q.split(" ")[0])) {
                kb.append(entry.getValue()).append(" ");
            }
        }
        return kb.length() > 0 ? kb.toString() :
            "Consultez un professionnel de sante pour des informations medicales personnalisees.";
    }

    private String generateDemoAnswer(String q, String patCtx, String kbCtx) {
        String ql = q.toLowerCase();
        StringBuilder ans = new StringBuilder();

        // Reponses contextuelles
        if (ql.contains("tension") || ql.contains("pression") || ql.contains("hypertension")) {
            ans.append("D apres vos dernieres mesures et les donnees medicales: ").append(kbCtx).append("\n\n");
            ans.append("Pour votre cas specifique, je vous recommande de surveiller regulierement votre tension ");
            ans.append("et de discuter des resultats avec votre medecin traitant.");
        } else if (ql.contains("glyc") || ql.contains("sucre") || ql.contains("diabete")) {
            ans.append("Concernant la glycemie: ").append(kbCtx).append("\n\n");
            ans.append("Basé sur votre profil: un suivi regulier et une alimentation equilibree sont essentiels.");
        } else if (ql.contains("medicament") || ql.contains("traitement") || ql.contains("ordonnance")) {
            ans.append(kbCtx).append("\n\n");
            ans.append("Je ne peux pas vous conseiller sur des medicaments specifiques. ");
            ans.append("Votre pharmacien ou medecin sont les mieux places pour cela.");
        } else if (ql.contains("urgence") || ql.contains("douleur") || ql.contains("grave")) {
            ans.append("En cas d urgence medicale: appelez le 15 (SAMU) immediatement. ")
               .append("Ne perdez pas de temps. ").append(kbCtx);
        } else {
            ans.append("Bonjour ! Je suis votre assistant medical Sihati AI. ");
            ans.append(patCtx).append("\n\n");
            ans.append("Pour repondre a votre question: ").append(kbCtx).append("\n\n");
            ans.append("N hesitez pas a poser des questions sur votre tension, glycemie, SpO2, ");
            ans.append("medicaments, ou consultations medicales.");
        }
        return ans.toString();
    }

    private String callOllama(String question, String patCtx, String kbCtx) {
        try {
            String prompt = "Tu es un assistant medical intelligent. " + patCtx +
                " Connaissances medicales pertinentes: " + kbCtx +
                " Question du patient: " + question +
                " Reponds en francais de maniere claire et precise. " +
                " Recommande toujours de consulter un medecin pour un diagnostic definitif.";

            Map<String,Object> body = new HashMap<>();
            body.put("model", ollamaModel);
            body.put("prompt", prompt);
            body.put("stream", false);

            HttpHeaders h = new HttpHeaders();
            h.setContentType(MediaType.APPLICATION_JSON);
            ResponseEntity<Map> resp = restTemplate.postForEntity(
                ollamaUrl + "/api/generate", new HttpEntity<>(body, h), Map.class);

            if (resp.getBody() != null && resp.getBody().containsKey("response")) {
                return resp.getBody().get("response").toString();
            }
        } catch (Exception e) {
            // Fallback to demo mode
        }
        return generateDemoAnswer(question, patCtx, kbCtx);
    }

    private String callOpenAi(String question, String patCtx, String kbCtx) {
        try {
            String systemPrompt = "Tu es un assistant medical intelligent. " + patCtx +
                " Connaissances medicales pertinentes: " + kbCtx +
                " Reponds en francais de maniere claire, precise et professionnelle. " +
                " Recommande toujours de consulter un medecin pour un diagnostic definitif.";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", openAiModel);
            
            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", systemPrompt);
            messages.add(systemMsg);

            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", question);
            messages.add(userMsg);

            requestBody.put("messages", messages);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.openai.com/v1/chat/completions", entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    if (message != null && message.containsKey("content")) {
                        return message.get("content").toString();
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback to demo mode
        }
        return generateDemoAnswer(question, patCtx, kbCtx);
    }

    private RestTemplate createTrustAllRestTemplate() {
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
            
            return new RestTemplate(new SimpleClientHttpRequestFactory() {
                @Override
                protected void prepareConnection(HttpURLConnection connection, String httpMethod) throws java.io.IOException {
                    if (connection instanceof HttpsURLConnection) {
                        ((HttpsURLConnection) connection).setSSLSocketFactory(sc.getSocketFactory());
                        ((HttpsURLConnection) connection).setHostnameVerifier((hostname, session) -> true);
                    }
                    super.prepareConnection(connection, httpMethod);
                }
            });
        } catch (Exception e) {
            return new RestTemplate();
        }
    }
}
