/**
 * Shared AI contracts used by the avatar / chat / OCR features.
 */

export interface AnomalyResult {
  riskLevel: string;
  anomalies: string[];
  trend: string;
  recommendations: string[];
  confidenceScore: number;
}

export interface OcrResult {
  rawText: string;
  detectedMedications: string[];
  detectedDosages: string[];
  doctorName: string;
  prescriptionDate: string;
  patientName?: string;
  success: boolean;
  errorMessage?: string;
}
