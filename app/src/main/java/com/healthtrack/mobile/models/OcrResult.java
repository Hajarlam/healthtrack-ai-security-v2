package com.healthtrack.mobile.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

/** Mirrors com.healthtrack.ai.OcrResult on the backend. */
public class OcrResult {

    @SerializedName("rawText")
    private String rawText;

    @SerializedName("detectedMedications")
    private List<String> detectedMedications;

    @SerializedName("detectedDosages")
    private List<String> detectedDosages;

    @SerializedName("doctorName")
    private String doctorName;

    @SerializedName("prescriptionDate")
    private String prescriptionDate;

    @SerializedName("success")
    private boolean success;

    @SerializedName("errorMessage")
    private String errorMessage;

    public String getRawText()                 { return rawText; }
    public List<String> getDetectedMedications(){ return detectedMedications; }
    public List<String> getDetectedDosages()    { return detectedDosages; }
    public String getDoctorName()               { return doctorName; }
    public String getPrescriptionDate()         { return prescriptionDate; }
    public boolean isSuccess()                  { return success; }
    public String getErrorMessage()             { return errorMessage; }
}
