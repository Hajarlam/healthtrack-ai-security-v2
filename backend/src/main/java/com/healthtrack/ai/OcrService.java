package com.healthtrack.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.net.ssl.*;
import java.net.HttpURLConnection;
import java.security.cert.X509Certificate;
import java.util.*;
import java.util.regex.*;

@Service
public class OcrService {

    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${ai.gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${ai.gemini.enabled:true}")
    private boolean geminiEnabled;

    @Value("${ocr.tesseract.enabled:true}")
    private boolean tesseractEnabled;

    private final ObjectMapper mapper = new ObjectMapper();
    private final RestTemplate restTemplate = createTrustAllRestTemplate();

    // Liste de medicaments courants pour fallback
    private static final List<String> COMMON_MEDS = Arrays.asList(
        "amoxicilline","paracetamol","ibuprofene","aspirine","metformine","amlodipine",
        "atorvastatine","omeprazole","lisinopril","levothyroxine","atenolol","furosemide",
        "prednisolone","doxycycline","azithromycine","ciprofloxacine","ranitidine",
        "salbutamol","insuline","metoprolol","ramipril","simvastatine","bisoprolol",
        "chlorhexidine","doliprane","augmentin","kardegic","spasfon","spafon","triatec",
        "tahor","velmetia","solupred","voltarene","inexium","coversyl","aprovel","amlor",
        "lasilix","aerius","flagyl","ventoline","advil","plavix","crestor","glucophage",
        "tramadol","lyrica","xanax","lexomil"
    );

    public OcrResult analyzeFile(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return new OcrResult("Fichier vide ou manquant.");
            }

            // 1. Priorité à l'analyse avancée par IA multimodale (Gemini Vision)
            if (geminiEnabled && geminiApiKey != null && !geminiApiKey.isBlank()) {
                OcrResult aiResult = callGeminiVision(file);
                if (aiResult != null && aiResult.isSuccess() && !aiResult.getDetectedMedications().isEmpty()) {
                    return aiResult;
                }
            }

            // 2. Fallback pour fichier PDF
            String contentType = file.getContentType();
            String extractedText = "";

            if (contentType != null && contentType.equals("application/pdf")) {
                extractedText = extractFromPdf(file);
                if (extractedText != null && !extractedText.isBlank()) {
                    return parsePrescription(extractedText);
                }
            }

            // 3. Fallback: Si aucune IA Cloud disponible et pas de PDF
            return new OcrResult("Aucun texte exploitable n'a pu être extrait automatiquement. Vous pouvez compléter ou vérifier les informations manuellement.");

        } catch (Exception e) {
            return new OcrResult("Erreur lors de l'analyse : " + e.getMessage());
        }
    }

    private OcrResult callGeminiVision(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String mimeType = file.getContentType();
            if (mimeType == null || mimeType.isBlank()) {
                String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
                if (filename.endsWith(".pdf")) mimeType = "application/pdf";
                else if (filename.endsWith(".png")) mimeType = "image/png";
                else mimeType = "image/jpeg";
            }

            String prompt = "Tu es un médecin spécialiste et pharmacologue expert en déchiffrement d'ordonnances médicales cliniques, imprimées et manuscrites (y compris les écritures complexes). " +
                "Analyse avec la plus grande précision l'ordonnance médicale présente dans le document. " +
                "Déchiffre chaque ligne avec soin et réponds STRICTEMENT sous forme d'objet JSON valide avec les clés suivantes : " +
                "1. 'doctor_name': Le nom complet du médecin prescripteur (avec Dr., ex: 'Dr. Sophie DUBOIS'). " +
                "2. 'patient_name': Le nom complet du patient ou de la patiente s'il est mentionné (ex: 'Mme. Catherine LEROY'). " +
                "3. 'prescription_date': La date d'émission de l'ordonnance (format JJ/MM/AAAA ou JJ Mois AAAA). " +
                "4. 'medications': Liste de TOUS les médicaments prescrits. Pour chaque médicament : " +
                "   - 'name': Nom commercial exact (ex: 'AMOXICILLINE', 'DOLIPRANE', 'Amlodipine'). " +
                "   - 'active_ingredient': DCI ou principe actif si identifiable (ex: 'Amoxicilline', 'Paracétamol'). " +
                "   - 'strength': Dosage ou teneur unitaire (ex: '500 mg', '1000 mg', '10 mg'). " +
                "   - 'form': Forme pharmaceutique (ex: 'Gélules', 'Comprimés', 'Sachets', 'Sirop'). " +
                "   - 'dose': Dose unitaire par prise (ex: '1 gélule', '1 comprimé'). " +
                "   - 'frequency': Fréquence d'administration journalière (ex: 'matin et soir', 'toutes les 6 heures', '1 fois par jour'). " +
                "   - 'duration': Durée du traitement (ex: '7 jours', '3 mois', 'pendant 5 jours'). " +
                "   - 'instructions': Conseils de prise (ex: 'au cours des repas', 'si douleur/fièvre (max 4/j)', 'à jeun'). " +
                "   - 'quantity': Quantité totale (ex: '1 boîte', 'QSP 1 boîte', '3 boîtes'). " +
                "   - 'needs_verification': true si le nom ou le dosage est difficilement lisible ou incertain, false si lisible avec certitude. " +
                "Ne devine rien d'inexistant. Si une information est illisible ou absente, mets 'needs_verification': true plutôt que d'inventer.";

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mime_type", mimeType);
            inlineData.put("data", base64);

            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("inline_data", inlineData);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(textPart, imagePart));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.1);
            generationConfig.put("responseMimeType", "application/json");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));
            requestBody.put("generationConfig", generationConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            List<String> modelsToTry = List.of(geminiModel, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash");
            for (String currentModel : modelsToTry) {
                try {
                    String url = "https://generativelanguage.googleapis.com/v1beta/models/" + currentModel + ":generateContent?key=" + geminiApiKey;
                    ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        JsonNode root = mapper.readTree(response.getBody());
                        JsonNode candidates = root.path("candidates");
                        if (candidates.isArray() && !candidates.isEmpty()) {
                            JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                            String jsonText = textNode.asText();
                            if (jsonText.startsWith("```json")) jsonText = jsonText.substring(7);
                            if (jsonText.startsWith("```")) jsonText = jsonText.substring(3);
                            if (jsonText.endsWith("```")) jsonText = jsonText.substring(0, jsonText.length() - 3);
                            jsonText = jsonText.trim();

                            JsonNode parsed = mapper.readTree(jsonText);
                            String doctor = parsed.has("doctor_name") ? parsed.get("doctor_name").asText() :
                                           parsed.has("doctorName") ? parsed.get("doctorName").asText() : "Dr. Non Détecté";
                            if (!doctor.toLowerCase().startsWith("dr") && !doctor.toLowerCase().startsWith("pr") && !doctor.equalsIgnoreCase("Unknown") && !doctor.equalsIgnoreCase("Non Détecté")) {
                                doctor = "Dr. " + doctor;
                            }
                            String patient = parsed.has("patient_name") ? parsed.get("patient_name").asText() :
                                            parsed.has("patientName") ? parsed.get("patientName").asText() : "";
                            String date = parsed.has("prescription_date") ? parsed.get("prescription_date").asText() :
                                          parsed.has("prescriptionDate") ? parsed.get("prescriptionDate").asText() : "Non précisée";

                            List<String> meds = new ArrayList<>();
                            List<String> dosages = new ArrayList<>();
                            List<Map<String, Object>> structuredList = new ArrayList<>();

                            JsonNode medsNode = parsed.get("medications");
                            if (medsNode != null && medsNode.isArray()) {
                                for (JsonNode m : medsNode) {
                                    String name = m.has("name") ? m.get("name").asText().trim() : "";
                                    String activeIngredient = m.has("active_ingredient") ? m.get("active_ingredient").asText().trim() : "";
                                    String strength = m.has("strength") ? m.get("strength").asText().trim() : "";
                                    String form = m.has("form") ? m.get("form").asText().trim() : "";
                                    String dose = m.has("dose") ? m.get("dose").asText().trim() : "";
                                    String freq = m.has("frequency") ? m.get("frequency").asText().trim() : "";
                                    String duration = m.has("duration") ? m.get("duration").asText().trim() : "";
                                    String instructions = m.has("instructions") ? m.get("instructions").asText().trim() : "";
                                    String quantity = m.has("quantity") ? m.get("quantity").asText().trim() : "";
                                    boolean needsVerification = m.has("needs_verification") && m.get("needs_verification").asBoolean();

                                    String fullMedName = name;
                                    if (!strength.isBlank() && !fullMedName.toLowerCase().contains(strength.toLowerCase())) {
                                        fullMedName += " " + strength;
                                    }
                                    if (!form.isBlank() && !fullMedName.toLowerCase().contains(form.toLowerCase())) {
                                        fullMedName += " (" + form + ")";
                                    }

                                    String fullPosologie = !dose.isBlank() ? dose : "";
                                    if (!freq.isBlank()) fullPosologie += (fullPosologie.isBlank() ? "" : " ") + freq;
                                    if (!duration.isBlank()) fullPosologie += (fullPosologie.isBlank() ? "" : " ") + (duration.toLowerCase().startsWith("pendant") ? duration : "pendant " + duration);
                                    if (!instructions.isBlank()) fullPosologie += (fullPosologie.isBlank() ? "" : " ") + "(" + instructions + ")";
                                    if (fullPosologie.isBlank()) fullPosologie = "Selon avis médical";

                                    if (!name.isBlank()) {
                                        meds.add(fullMedName);
                                        dosages.add(fullPosologie);

                                        Map<String, Object> itemMap = new HashMap<>();
                                        itemMap.put("name", name);
                                        itemMap.put("activeIngredient", activeIngredient);
                                        itemMap.put("strength", strength);
                                        itemMap.put("form", form);
                                        itemMap.put("dose", dose);
                                        itemMap.put("frequency", freq);
                                        itemMap.put("duration", duration);
                                        itemMap.put("instructions", instructions);
                                        itemMap.put("quantity", quantity);
                                        itemMap.put("needsVerification", needsVerification);
                                        itemMap.put("dosage", fullPosologie);
                                        structuredList.add(itemMap);
                                    }
                                }
                            }

                            if (!meds.isEmpty()) {
                                OcrResult aiRes = new OcrResult(jsonText, meds, dosages, doctor, date, patient);
                                aiRes.setStructuredMedications(structuredList);
                                return aiRes;
                            }
                        }
                    }
                } catch (Exception modelEx) {
                    System.err.println("Gemini model " + currentModel + " failed (" + modelEx.getMessage() + "), trying fallback model...");
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini Vision OCR error: " + e.getMessage());
        }
        return null;
    }

    private String extractFromPdf(MultipartFile file) throws Exception {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private OcrResult parsePrescription(String text) {
        List<String> medications = new ArrayList<>();
        List<String> dosages = new ArrayList<>();
        Set<String> normalizedMeds = new HashSet<>();
        
        String[] lines = text.split("\n");
        Pattern medPattern = Pattern.compile("^\\s*([A-Za-z\\-]+)\\s+(\\d+)\\s*mg", Pattern.CASE_INSENSITIVE);
        
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty() || line.toLowerCase().startsWith("note")) continue;
            
            boolean isMed = false;
            String detectedMedName = "";
            
            Matcher m = medPattern.matcher(line);
            if (m.find()) {
                String med = m.group(1);
                detectedMedName = med.substring(0, 1).toUpperCase() + med.substring(1).toLowerCase() + " " + m.group(2) + "mg";
                isMed = true;
            } else {
                for (String commonMed : COMMON_MEDS) {
                    if (line.toLowerCase().startsWith(commonMed) || line.toLowerCase().contains(" " + commonMed)) {
                        String cleanedLine = line;
                        int qteIndex = cleanedLine.toLowerCase().indexOf("qte:");
                        if (qteIndex != -1) {
                            cleanedLine = cleanedLine.substring(0, qteIndex).trim();
                        }
                        detectedMedName = cleanedLine;
                        isMed = true;
                        break;
                    }
                }
            }
            
            if (isMed && !detectedMedName.isEmpty()) {
                String norm = detectedMedName.toLowerCase().replaceAll("\\s+", "");
                if (normalizedMeds.contains(norm)) {
                    continue;
                }
                normalizedMeds.add(norm);
                
                String posologie = "Selon avis médical";
                for (int j = i + 1; j < Math.min(lines.length, i + 5); j++) {
                    String nextLine = lines[j].trim();
                    if (nextLine.toLowerCase().startsWith("posologie") || nextLine.toLowerCase().contains("fois par jour") || nextLine.toLowerCase().contains("gélule") || nextLine.toLowerCase().contains("comprimé")) {
                        int colonIndex = nextLine.indexOf(":");
                        if (colonIndex != -1) {
                            posologie = nextLine.substring(colonIndex + 1).trim();
                        } else {
                            posologie = nextLine.trim();
                        }
                        break;
                    }
                }
                
                medications.add(detectedMedName);
                dosages.add(posologie);
            }
        }
        
        if (medications.isEmpty()) {
            medications.add("Aucun médicament détecté automatiquement");
            dosages.add("Voir ordonnance");
        }
        
        String doctor = detectDoctor(text);
        String date = detectDate(text);
        String patient = detectPatient(text);
        
        return new OcrResult(text, medications, dosages, doctor, date, patient);
    }

    private String detectPatient(String text) {
        Pattern p = Pattern.compile("(?:Patient(?:e)?|Nom\\s*(?:et\\s*Prénom)?|Pour)\\s*:\\s*([A-Za-zÀ-ÿ\\s\\.\\-]{2,40})", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1).trim();
        }
        Pattern p2 = Pattern.compile("(?:M\\.|Mme|Mlle)\\s+([A-Za-zÀ-ÿ\\s\\.\\-]{2,35})", Pattern.CASE_INSENSITIVE);
        Matcher m2 = p2.matcher(text);
        if (m2.find()) {
            return m2.group(0).trim();
        }
        return "Patient(e)";
    }

    private String detectDoctor(String text) {
        Pattern p = Pattern.compile("Dr\\.?\\s+([A-Za-z\\-\\s]+)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) {
            String name = m.group(1).trim();
            int nlIndex = name.indexOf("\n");
            if (nlIndex != -1) name = name.substring(0, nlIndex);
            int pipeIndex = name.indexOf("|");
            if (pipeIndex != -1) name = name.substring(0, pipeIndex);
            int dashIndex = name.indexOf("—");
            if (dashIndex != -1) name = name.substring(0, dashIndex);
            return "Dr. " + name.trim();
        }
        return "Dr. Non Détecté";
    }

    private String detectDate(String text) {
        Pattern p = Pattern.compile("date\\s*:?\\s*(\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{2,4}|\\d{4}[/\\-]\\d{2}[/\\-]\\d{2})", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1);
        }
        Pattern p2 = Pattern.compile("(\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{2,4}|\\d{4}[/\\-]\\d{2}[/\\-]\\d{2})");
        Matcher m2 = p2.matcher(text);
        while (m2.find()) {
            String dt = m2.group(1);
            if (!dt.startsWith("053") && !dt.startsWith("06") && !dt.startsWith("07")) {
                return dt;
            }
        }
        return "Non précisée";
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
