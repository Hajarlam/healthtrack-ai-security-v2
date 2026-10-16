import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly API = `${environment.apiUrl}/appointments`;
  private readonly STORAGE_KEY = 'sihati_appointments_list';

  constructor(private http: HttpClient) {}

  public getLocalAppointments(): Appointment[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400000);
    tomorrow.setHours(10, 30, 0, 0);

    const initial: Appointment[] = [
      {
        id: 1,
        doctorId: 2,
        appointmentDate: tomorrow.toISOString(),
        reason: 'Consultation de suivi cardiologique et ajustement tensionnel',
        status: 'CONFIRMED'
      }
    ];
    this.saveLocalAppointments(initial);
    return initial;
  }

  public saveLocalAppointments(appts: Appointment[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(appts));
    } catch(e) {}
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.API).pipe(
      tap(appts => {
        if (appts && appts.length > 0) {
          this.saveLocalAppointments(appts);
        }
      }),
      catchError(() => of(this.getLocalAppointments()))
    );
  }

  create(a: Appointment): Observable<Appointment> {
    const local = this.getLocalAppointments();
    const newAppt: Appointment = {
      ...a,
      id: a.id || Date.now(),
      status: a.status || 'CONFIRMED'
    };
    local.unshift(newAppt);
    this.saveLocalAppointments(local);

    return this.http.post<Appointment>(this.API, a).pipe(
      catchError(() => of(newAppt))
    );
  }

  cancel(id: number): Observable<Appointment> {
    const local = this.getLocalAppointments();
    const target = local.find(a => a.id === id);
    if (target) {
      target.status = 'CANCELLED';
      this.saveLocalAppointments(local);
    }
    return this.http.patch<Appointment>(`${this.API}/${id}/cancel`, {}).pipe(
      catchError(() => of(target || ({} as Appointment)))
    );
  }
}
