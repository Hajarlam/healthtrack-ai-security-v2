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
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any legacy dummy mock meds
          const cleaned = parsed.filter(m => 
            m && m.name &&
            !m.name.includes('Kardégic 75 mg (Acétylsalicylate de lysine)') &&
            !m.name.includes('Triatec 10 mg (Ramipril)') &&
            !m.name.includes('Tahor 10 mg (Atorvastatine)')
          );
          if (cleaned.length !== parsed.length) {
            this.saveLocalMeds(cleaned);
          }
          return cleaned;
        }
      }
    } catch(e) {}

    // Par défaut : liste complètement vide !
    return [];
  }

  public saveLocalMeds(meds: Medication[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(meds));
    } catch(e) {}
  }

  getMedications(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.API).pipe(
      tap(meds => {
        if (Array.isArray(meds)) {
          // If backend returns a list, sync it to local storage
          const cleaned = meds.filter(m => 
            m && m.name &&
            !m.name.includes('Kardégic 75 mg (Acétylsalicylate de lysine)') &&
            !m.name.includes('Triatec 10 mg (Ramipril)') &&
            !m.name.includes('Tahor 10 mg (Atorvastatine)')
          );
          this.saveLocalMeds(cleaned);
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
