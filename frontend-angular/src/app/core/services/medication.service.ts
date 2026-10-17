import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
          return parsed;
        }
      }
    } catch(e) {}

    // Par défaut si la liste n'a jamais été initialisée : liste vide
    return [];
  }

  public saveLocalMeds(meds: Medication[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(meds));
    } catch(e) {}
  }

  getMedications(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.API).pipe(
      map(remoteMeds => {
        const local = this.getLocalMeds();
        if (Array.isArray(remoteMeds) && remoteMeds.length > 0) {
          // Fusionner les données distantes avec la liste locale pour ne rien perdre
          const merged = [...local];
          for (const rm of remoteMeds) {
            if (rm && rm.name && !merged.some(m => m.id === rm.id || m.name.toLowerCase() === rm.name.toLowerCase())) {
              merged.push(rm);
            }
          }
          this.saveLocalMeds(merged);
          return merged;
        }
        return local;
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
    
    // Éviter les doublons exacts par nom
    const idx = localList.findIndex(m => m.name.trim().toLowerCase() === newMed.name.trim().toLowerCase());
    if (idx >= 0) {
      localList[idx] = { ...localList[idx], ...newMed };
    } else {
      localList.unshift(newMed);
    }
    this.saveLocalMeds(localList);

    return this.http.post<Medication>(this.API, newMed).pipe(
      catchError(() => of(newMed))
    );
  }

  addMultipleMedications(medications: Partial<Medication>[]): Observable<Medication[]> {
    const localList = this.getLocalMeds();
    const addedList: Medication[] = [];
    let baseId = Date.now();

    for (let i = 0; i < medications.length; i++) {
      const m = medications[i];
      baseId++;
      const newMed: Medication = {
        id: m.id || baseId,
        name: (m.name || '').trim(),
        dosage: m.dosage || 'Selon avis médical',
        frequency: m.frequency || '1 fois par jour',
        instructions: m.instructions || ''
      };

      if (newMed.name) {
        const existingIdx = localList.findIndex(x => x.name.trim().toLowerCase() === newMed.name.toLowerCase());
        if (existingIdx >= 0) {
          localList[existingIdx] = { ...localList[existingIdx], ...newMed };
        } else {
          localList.unshift(newMed);
        }
        addedList.push(newMed);
      }
    }

    this.saveLocalMeds(localList);

    // Sync in background without blocking caller UI
    addedList.forEach(item => {
      this.http.post<Medication>(this.API, item).pipe(catchError(() => of(item))).subscribe();
    });

    return of(addedList);
  }

  deleteMedication(id: number): Observable<void> {
    const filtered = this.getLocalMeds().filter(m => m.id !== id);
    this.saveLocalMeds(filtered);

    return this.http.delete<void>(`${this.API}/${id}`).pipe(
      catchError(() => of(void 0))
    );
  }
}
