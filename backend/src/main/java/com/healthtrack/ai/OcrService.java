package com.healthtrack.ai;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import java.util.regex.*;

@Service
public class OcrService {

    @Value("${ocr.tesseract.enabled:true}")
    private boolean tesseractEnabled;

    // Liste de medicaments courants pour detection
    private static final List<String> COMMON_MEDS = Arrays.asList(
        "amoxicilline","paracetamol","ibuprofene","aspirine","metformine","amlodipine",
        "atorvastatine","omeprazole","lisinopril","levothyroxine","atenolol","furosemide",
        "prednisolone","doxycycline","azithromycine","ciprofloxacine","ranitidine",
        "salbutamol","insuline","metoprolol","ramipril","simvastatine","bisoprolol"
    );

    public OcrResult analyzeFile(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            String extractedText;

            if (contentType != null && contentType.equals("application/pdf")) {
                extractedText = extractFromPdf(file);
            } else if (contentType != null && contentType.startsWith("image/")) {
                extractedText = extractFromImage(file);
            } else {
                return new OcrResult("Type de fichier non supporte. Utilisez PDF, JPG ou PNG.");
            }

            if (extractedText == null || extractedText.isBlank()) {
                return new OcrResult("Impossible d extraire le texte. Verifiez la qualite du fichier.");
            }

            return parsePrescription(extractedText);

        } catch (Exception e) {
            return new OcrResult("Erreur analyse: " + e.getMessage());
        }
    }

    private String extractFromPdf(MultipartFile file) throws Exception {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private String extractFromImage(MultipartFile file) {
        // Sans Tesseract installe: simulation pour demo
        // En production: installer tessdata et activer Tesseract
        return "OCR IMAGE: Veuillez installer Tesseract pour l analyse d images. " +
               "Uploadeez un PDF pour un meilleur resultat. " +
               "Medicament: Paracetamol 500mg, 3 fois par jour. Dr Martin. 06/06/2025.";
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
                
                String posologie = "Voir ordonnance";
                for (int j = i + 1; j < Math.min(lines.length, i + 5); j++) {
                    String nextLine = lines[j].trim();
                    if (nextLine.toLowerCase().startsWith("posologie")) {
                        int colonIndex = nextLine.indexOf(":");
                        if (colonIndex != -1) {
                            posologie = nextLine.substring(colonIndex + 1).trim();
                        } else {
                            posologie = nextLine.substring(9).trim();
                        }
                        break;
                    }
                }
                
                medications.add(detectedMedName);
                dosages.add(posologie);
            }
        }
        
        if (medications.isEmpty()) {
            medications.add("Aucun medicament detecte automatiquement");
            dosages.add("Voir ordonnance");
        }
        
        String doctor = detectDoctor(text);
        String date = detectDate(text);
        
        return new OcrResult(text, medications, dosages, doctor, date);
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
        return "Non detecte";
    }

    private String detectDate(String text) {
        Pattern p = Pattern.compile("date\\s*:?\\s*(\\d{2}[/\\-]\\d{2}[/\\-]\\d{4}|\\d{4}[/\\-]\\d{2}[/\\-]\\d{2})", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1);
        }
        Pattern p2 = Pattern.compile("(\\d{2}[/\\-]\\d{2}[/\\-]\\d{4}|\\d{4}[/\\-]\\d{2}[/\\-]\\d{2})");
        Matcher m2 = p2.matcher(text);
        while (m2.find()) {
            String dt = m2.group(1);
            if (!dt.startsWith("053") && !dt.startsWith("06") && !dt.startsWith("07")) {
                return dt;
            }
        }
        return "Non detectee";
    }
}
