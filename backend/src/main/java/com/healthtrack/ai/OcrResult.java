package com.healthtrack.ai;
import java.util.List;
public class OcrResult {
    private String rawText;
    private List<String> detectedMedications;
    private List<String> detectedDosages;
    private String doctorName;
    private String prescriptionDate;
    private boolean success;
    private String errorMessage;

    public OcrResult(String t, List<String> m, List<String> d, String doc, String date) {
        rawText=t; detectedMedications=m; detectedDosages=d; doctorName=doc; prescriptionDate=date; success=true;
    }
    public OcrResult(String err) { success=false; errorMessage=err; detectedMedications=new java.util.ArrayList<>(); }

    public String getRawText()                 { return rawText; }
    public List<String> getDetectedMedications(){ return detectedMedications; }
    public List<String> getDetectedDosages()   { return detectedDosages; }
    public String getDoctorName()              { return doctorName; }
    public String getPrescriptionDate()        { return prescriptionDate; }
    public boolean isSuccess()                 { return success; }
    public String getErrorMessage()            { return errorMessage; }
}
