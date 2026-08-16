export interface Appointment {
  id?: number;
  patientId?: number;
  doctorId?: number;
  appointmentDate: string;
  reason?: string;
  notes?: string;
  durationMinutes?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}
