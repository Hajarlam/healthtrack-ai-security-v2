export interface HealthRecord {
  id?: number;
  patientId?: number;
  patientName?: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  bloodGlucose?: number;
  weight?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  status?: 'NORMAL' | 'WARNING' | 'CRITICAL';
  notes?: string;
  source?: string;
  recordedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
