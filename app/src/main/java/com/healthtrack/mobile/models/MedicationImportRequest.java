package com.healthtrack.mobile.models;

import java.util.List;

/** Mirrors com.healthtrack.dto.MedicationImportRequest on the backend. */
public class MedicationImportRequest {

    private String doctorName;
    private String prescriptionDate;
    private List<Entry> medications;

    public MedicationImportRequest(String doctorName, String prescriptionDate, List<Entry> medications) {
        this.doctorName = doctorName;
        this.prescriptionDate = prescriptionDate;
        this.medications = medications;
    }

    public static class Entry {
        private String name;
        private String dosage;
        public Entry(String name, String dosage) { this.name = name; this.dosage = dosage; }
    }
}
