package com.healthtrack.ai;
import java.util.List;
import java.util.ArrayList;

public class OcrResult {
    private String rawText;
    private List<String> detectedMedications = new ArrayList<>();
    private List<String> detectedDosages = new ArrayList<>();
    private String doctorName;
    private String prescriptionDate;
    private String patientName;
    private boolean success;
    private String errorMessage;
    private List<java.util.Map<String, Object>> structuredMedications = new ArrayList<>();

    public OcrResult() {}

    public OcrResult(String t, List<String> m, List<String> d, String doc, String date) {
        rawText = t; detectedMedications = m; detectedDosages = d; doctorName = doc; prescriptionDate = date; success = true;
    }

    public OcrResult(String t, List<String> m, List<String> d, String doc, String date, String pat) {
        rawText = t; detectedMedications = m; detectedDosages = d; doctorName = doc; prescriptionDate = date; patientName = pat; success = true;
    }

    public OcrResult(String err) {
        success = false; errorMessage = err; detectedMedications = new ArrayList<>(); detectedDosages = new ArrayList<>();
    }

    public String getRawText()                  { return rawText; }
    public void setRawText(String v)            { rawText = v; }
    public List<String> getDetectedMedications(){ return detectedMedications; }
    public void setDetectedMedications(List<String> v) { detectedMedications = v; }
    public List<String> getDetectedDosages()    { return detectedDosages; }
    public void setDetectedDosages(List<String> v) { detectedDosages = v; }
    public List<java.util.Map<String, Object>> getStructuredMedications() { return structuredMedications; }
    public void setStructuredMedications(List<java.util.Map<String, Object>> v) { structuredMedications = v; }
    public String getDoctorName()               { return doctorName; }
    public void setDoctorName(String v)         { doctorName = v; }
    public String getPrescriptionDate()         { return prescriptionDate; }
    public void setPrescriptionDate(String v)   { prescriptionDate = v; }
    public String getPatientName()              { return patientName; }
    public void setPatientName(String v)        { patientName = v; }
    public boolean isSuccess()                  { return success; }
    public void setSuccess(boolean v)           { success = v; }
    public String getErrorMessage()             { return errorMessage; }
    public void setErrorMessage(String v)       { errorMessage = v; }
}
