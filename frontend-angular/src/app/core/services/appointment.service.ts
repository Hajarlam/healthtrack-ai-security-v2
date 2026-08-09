import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly API = `${environment.apiUrl}/appointments`;
  constructor(private http: HttpClient) {}
  getMyAppointments(): Observable<Appointment[]>           { return this.http.get<Appointment[]>(this.API); }
  create(a: Appointment): Observable<Appointment>         { return this.http.post<Appointment>(this.API, a); }
  cancel(id: number): Observable<Appointment>             { return this.http.patch<Appointment>(`${this.API}/${id}/cancel`, {}); }
}
