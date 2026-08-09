export interface Alert {
  id: number;
  patientId?: number;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  acknowledged: boolean;
  createdAt: string;
  acknowledgedAt?: string;
}
