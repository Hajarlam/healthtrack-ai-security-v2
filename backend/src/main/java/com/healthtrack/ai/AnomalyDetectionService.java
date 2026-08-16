package com.healthtrack.ai;

import com.healthtrack.entity.HealthRecord;
import com.healthtrack.repository.HealthRecordRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AnomalyDetectionService {

    private final HealthRecordRepository hrRepo;

    public AnomalyDetectionService(HealthRecordRepository r) { hrRepo = r; }

    public AnomalyResult analyze(HealthRecord rec) {
        List<String> anomalies   = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        AnomalyResult.RiskLevel risk = AnomalyResult.RiskLevel.NORMAL;

        // --- Tension arterielle ---
        if (rec.getSystolicBP() != null) {
            double sbp = rec.getSystolicBP();
            if (sbp > 180) {
                anomalies.add("Hypertension critique: " + sbp + " mmHg (normal < 140)");
                recommendations.add("Consultez un medecin d urgence immediatement.");
                risk = AnomalyResult.RiskLevel.CRITICAL;
            } else if (sbp > 140) {
                anomalies.add("Hypertension legere: " + sbp + " mmHg");
                recommendations.add("Reduisez la consommation de sel et consultez votre medecin.");
                risk = AnomalyResult.RiskLevel.WARNING;
            } else if (sbp < 90) {
                anomalies.add("Hypotension: " + sbp + " mmHg (normal > 90)");
                recommendations.add("Hydratez-vous et reposez-vous. Consultez si persistant.");
                risk = AnomalyResult.RiskLevel.WARNING;
            }
        }
        // --- Glycemie ---
        if (rec.getBloodGlucose() != null) {
            double bg = rec.getBloodGlucose();
            if (bg > 300) {
                anomalies.add("Hyperglycemie critique: " + bg + " mg/dL (normal < 126 a jeun)");
                recommendations.add("Injection d insuline urgente si diabetique. Appelez le 15.");
                risk = AnomalyResult.RiskLevel.CRITICAL;
            } else if (bg > 180) {
                anomalies.add("Hyperglycemie: " + bg + " mg/dL");
                recommendations.add("Verifiez votre alimentation et votre traitement antidiabetique.");
                if (risk == AnomalyResult.RiskLevel.NORMAL) risk = AnomalyResult.RiskLevel.WARNING;
            } else if (bg < 70) {
                anomalies.add("Hypoglycemie: " + bg + " mg/dL (normal > 70)");
                recommendations.add("Consommez du sucre rapidement (jus, sucre). Consultez si recidive.");
                risk = AnomalyResult.RiskLevel.CRITICAL;
            }
        }
        // --- SpO2 ---
        if (rec.getOxygenSaturation() != null) {
            double spo2 = rec.getOxygenSaturation();
            if (spo2 < 90) {
                anomalies.add("SpO2 critique: " + spo2 + "% (normal > 95%)");
                recommendations.add("Oxygene supplementaire requis. Appelez le 15 en urgence.");
                risk = AnomalyResult.RiskLevel.CRITICAL;
            } else if (spo2 < 95) {
                anomalies.add("SpO2 faible: " + spo2 + "%");
                recommendations.add("Respirez lentement et profondement. Consultez si < 92%.");
                if (risk == AnomalyResult.RiskLevel.NORMAL) risk = AnomalyResult.RiskLevel.WARNING;
            }
        }
        // --- Frequence cardiaque ---
        if (rec.getHeartRate() != null) {
            double hr = rec.getHeartRate();
            if (hr > 150) {
                anomalies.add("Tachycardie severe: " + hr + " bpm (normal 60-100)");
                recommendations.add("Repos immediat. ECG urgent recommande.");
                risk = AnomalyResult.RiskLevel.CRITICAL;
            } else if (hr > 100) {
                anomalies.add("Tachycardie: " + hr + " bpm");
                recommendations.add("Evitez la cafeine et le stress. Surveillez.");
                if (risk == AnomalyResult.RiskLevel.NORMAL) risk = AnomalyResult.RiskLevel.WARNING;
            } else if (hr < 50) {
                anomalies.add("Bradycardie: " + hr + " bpm");
                recommendations.add("Consultez un cardiologue si symptomes (vertiges, fatigue).");
                if (risk == AnomalyResult.RiskLevel.NORMAL) risk = AnomalyResult.RiskLevel.WARNING;
            }
        }
        // --- Temperature ---
        if (rec.getTemperature() != null) {
            double t = rec.getTemperature();
            if (t > 39.5) {
                anomalies.add("Hyperthermie severe: " + t + " C");
                recommendations.add("Antipyretique (paracetamol) et consultation medicale urgente.");
                if (risk == AnomalyResult.RiskLevel.NORMAL) risk = AnomalyResult.RiskLevel.WARNING;
            } else if (t > 38.0) {
                anomalies.add("Fievre: " + t + " C");
                recommendations.add("Hydratation++, antipyretique si inconfort. Consultez si > 48h.");
                if (risk == AnomalyResult.RiskLevel.NORMAL) risk = AnomalyResult.RiskLevel.WARNING;
            } else if (t < 35.0) {
                anomalies.add("Hypothermie: " + t + " C");
                recommendations.add("Rechauffement progressif. Urgences si < 34C.");
                risk = AnomalyResult.RiskLevel.CRITICAL;
            }
        }

        // Tendance sur 5 dernières mesures
        String trend = computeTrend(rec.getPatient().getId());
        double confidence = computeConfidence(rec);

        if (anomalies.isEmpty()) {
            recommendations.add("Toutes les constantes vitales sont dans les normes. Continuez votre suivi regulier.");
        }

        return new AnomalyResult(risk, anomalies, trend, recommendations, confidence);
    }

    private String computeTrend(Long patientId) {
        try {
            var records = hrRepo.findLatestByPatient(patientId, PageRequest.of(0, 5));
            if (records.size() < 2) return "INSUFFICIENT_DATA";
            // Calcul tendance tension systolique
            double first = records.get(records.size()-1).getSystolicBP() != null ? records.get(records.size()-1).getSystolicBP() : 120;
            double last  = records.get(0).getSystolicBP() != null ? records.get(0).getSystolicBP() : 120;
            double delta = last - first;
            if (delta > 15)       return "DEGRADING";
            else if (delta < -15) return "IMPROVING";
            else                  return "STABLE";
        } catch (Exception e) {
            return "STABLE";
        }
    }

    private double computeConfidence(HealthRecord rec) {
        int measured = 0;
        if (rec.getSystolicBP()    != null) measured++;
        if (rec.getBloodGlucose()  != null) measured++;
        if (rec.getOxygenSaturation() != null) measured++;
        if (rec.getHeartRate()     != null) measured++;
        if (rec.getTemperature()   != null) measured++;
        return Math.min(1.0, measured * 0.2);
    }
}
