import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medication } from '../models/medication.model';

@Injectable({ providedIn: 'root' })
export class MedicationService {
  private readonly API = `${environment.apiUrl}/medications`;

  constructor(private http: HttpClient) {}

  getMedications(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.API);
  }

  addMedication(medication: Partial<Medication>): Observable<Medication> {
    return this.http.post<Medication>(this.API, medication);
  }

  deleteMedication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
