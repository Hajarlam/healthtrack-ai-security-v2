package com.healthtrack.ai;

import java.util.ArrayList;
import java.util.List;

public class OcrResult {
    private String rawText;
    private List<String> detectedMedications;
    private List<String> detectedDosages;
    private String doctorName;
    private String prescriptionDate;
    private boolean success;
    private String errorMessage;
    private List<PrescriptionItem> items = new ArrayList<>();

    public static class PrescriptionItem {
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
        private double confidence;

        public PrescriptionItem() {}
        public PrescriptionItem(String name, String dosage, String freq, String dur, String inst, double conf) {
            this.medicineName = name;
            this.dosage = dosage;
            this.frequency = freq;
            this.duration = dur;
            this.instructions = inst;
            this.confidence = conf;
        }

        public String getMedicineName() { return medicineName; }
        public void setMedicineName(String n) { medicineName = n; }
        public String getDosage() { return dosage; }
        public void setDosage(String d) { dosage = d; }
        public String getFrequency() { return frequency; }
        public void setFrequency(String f) { frequency = f; }
        public String getDuration() { return duration; }
        public void setDuration(String d) { duration = d; }
        public String getInstructions() { return instructions; }
        public void setInstructions(String i) { instructions = i; }
        public double getConfidence() { return confidence; }
        public void setConfidence(double c) { confidence = c; }
    }

    public OcrResult() {}

    public OcrResult(String t, List<String> m, List<String> d, String doc, String date) {
        rawText = t; 
        detectedMedications = m; 
        detectedDosages = d; 
        doctorName = doc; 
        prescriptionDate = date; 
        success = true;
        
        // Populate items list for compatibility
        if (m != null) {
            for (int i = 0; i < m.size(); i++) {
                String dosageVal = (d != null && i < d.size()) ? d.get(i) : "Selon avis médical";
                items.add(new PrescriptionItem(m.get(i), dosageVal, "Voir ordonnance", "N/A", "N/A", 0.85));
            }
        }
    }

    public OcrResult(String t, List<PrescriptionItem> items, String doc, String date) {
        this.rawText = t;
        this.items = items != null ? items : new ArrayList<>();
        this.doctorName = doc;
        this.prescriptionDate = date;
        this.success = true;
        
        this.detectedMedications = new ArrayList<>();
        this.detectedDosages = new ArrayList<>();
        for (PrescriptionItem item : this.items) {
            this.detectedMedications.add(item.getMedicineName());
            this.detectedDosages.add(item.getDosage() + " (" + item.getFrequency() + ")");
        }
    }

    public OcrResult(String err) { 
        success = false; 
        errorMessage = err; 
        detectedMedications = new ArrayList<>(); 
        detectedDosages = new ArrayList<>();
    }

    public String getRawText()                 { return rawText; }
    public List<String> getDetectedMedications(){ return detectedMedications; }
    public List<String> getDetectedDosages()   { return detectedDosages; }
    public String getDoctorName()              { return doctorName; }
    public String getPrescriptionDate()        { return prescriptionDate; }
    public boolean isSuccess()                 { return success; }
    public String getErrorMessage()            { return errorMessage; }
    public List<PrescriptionItem> getItems()   { return items; }
    
    public void setRawText(String r) { this.rawText = r; }
    public void setDoctorName(String d) { this.doctorName = d; }
    public void setPrescriptionDate(String p) { this.prescriptionDate = p; }
    public void setSuccess(boolean s) { this.success = s; }
    public void setErrorMessage(String e) { this.errorMessage = e; }
    public void setItems(List<PrescriptionItem> i) { this.items = i; }
}
