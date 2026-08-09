export interface Medication {
  id?: number;
  patientId?: number;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate?: string;
}
