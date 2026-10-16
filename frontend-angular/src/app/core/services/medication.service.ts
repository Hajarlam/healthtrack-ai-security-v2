import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medication } from '../models/medication.model';

@Injectable({ providedIn: 'root' })
export class MedicationService {
  private readonly API = `${environment.apiUrl}/medications`;
  private readonly STORAGE_KEY = 'sihati_medications_list';

  constructor(private http: HttpClient) {}

  public getLocalMeds(): Medication[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}

    const initial: Medication[] = [
      { id: 1, name: 'Kardégic 75 mg (Acétylsalicylate de lysine)', dosage: '75 mg', frequency: '1 sachet par jour au déjeuner', instructions: 'Prescription Dr. Julien Guerrier (Antiagrégant plaquettaire)' },
      { id: 2, name: 'Triatec 10 mg (Ramipril)', dosage: '10 mg', frequency: '1 comprimé par jour le matin', instructions: 'Prescription Dr. Julien Guerrier (Antihypertenseur)' },
      { id: 3, name: 'Tahor 10 mg (Atorvastatine)', dosage: '10 mg', frequency: '1 comprimé par jour le soir', instructions: 'Prescription Dr. Julien Guerrier (Statine régulatrice)' }
    ];
    this.saveLocalMeds(initial);
    return initial;
  }

  public saveLocalMeds(meds: Medication[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(meds));
    } catch(e) {}
  }

  getMedications(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.API).pipe(
      tap(meds => {
        if (meds && meds.length > 0) {
          this.saveLocalMeds(meds);
        }
      }),
      catchError(() => of(this.getLocalMeds()))
    );
  }

  addMedication(medication: Partial<Medication>): Observable<Medication> {
    const localList = this.getLocalMeds();
    const newMed: Medication = {
      id: medication.id || Date.now(),
      name: medication.name || '',
      dosage: medication.dosage || '',
      frequency: medication.frequency || '',
      instructions: medication.instructions || ''
    };
    localList.unshift(newMed);
    this.saveLocalMeds(localList);

    return this.http.post<Medication>(this.API, medication).pipe(
      catchError(() => of(newMed))
    );
  }

  deleteMedication(id: number): Observable<void> {
    const filtered = this.getLocalMeds().filter(m => m.id !== id);
    this.saveLocalMeds(filtered);

    return this.http.delete<void>(`${this.API}/${id}`).pipe(
      catchError(() => of(void 0))
    );
  }
}
