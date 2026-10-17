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

export interface ExtractedMedication {
  name: string;
  activeIngredient?: string;
  strength?: string;
  form?: string;
  dose?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  quantity?: string;
  needsVerification?: boolean;
  dosage?: string;
}

export interface OcrResult {
  rawText: string;
  detectedMedications: string[];
  detectedDosages: string[];
  structuredMedications?: ExtractedMedication[];
  doctorName: string;
  prescriptionDate: string;
  patientName?: string;
  success: boolean;
  errorMessage?: string;
  /** How trustworthy the extraction is: 'high' = fields + meds detected, 'partial' = some fields, 'manual' = nothing usable. */
  confidence?: 'high' | 'partial' | 'manual';
  /** Human readable status shown to the user (why fields may be empty). */
  message?: string;
}
