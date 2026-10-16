import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/users`;
  private readonly DOCTORS_STORAGE_KEY = 'sihati_registered_doctors';

  constructor(private http: HttpClient) {}

  public getLocalDoctors(): User[] {
    try {
      const data = localStorage.getItem(this.DOCTORS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}

    const initialDoctors: User[] = [
      {
        id: 2,
        firstName: 'Dr. Ahmed',
        lastName: 'Bennani',
        role: 'DOCTOR' as any,
        email: 'doctor@healthtrack.ai',
        specialization: 'Cardiologie & Hypertension Artérielle',
        hospital: 'CHU Ibn Sina - Rabat',
        enabled: true
      },
      {
        id: 5,
        firstName: 'Dr. Leila',
        lastName: 'Alaoui',
        role: 'DOCTOR' as any,
        email: 'leila.alaoui@healthtrack.ai',
        specialization: 'Médecine Générale & Suivi Chronique',
        hospital: 'Clinique Internationale - Casablanca',
        enabled: true
      },
      {
        id: 7,
        firstName: 'Dr. Youssef',
        lastName: 'Amrani',
        role: 'DOCTOR' as any,
        email: 'youssef.amrani@healthtrack.ai',
        specialization: 'Endocrinologie & Diabétologie',
        hospital: 'Hôpital Militaire - Rabat',
        enabled: true
      },
      {
        id: 8,
        firstName: 'Dr. Fatima-Zahra',
        lastName: 'El Idrissi',
        role: 'DOCTOR' as any,
        email: 'fz.idrissi@healthtrack.ai',
        specialization: 'Pneumologie & Allergologie',
        hospital: 'CHU Hassan II - Fès',
        enabled: true
      }
    ];

    this.saveLocalDoctors(initialDoctors);
    return initialDoctors;
  }

  public saveLocalDoctors(doctors: User[]): void {
    try {
      localStorage.setItem(this.DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
    } catch(e) {}
  }

  public addDoctor(doc: Partial<User>): User {
    const list = this.getLocalDoctors();
    const existingIndex = list.findIndex(d => (doc.id && d.id === doc.id) || (doc.email && d.email?.toLowerCase() === doc.email?.toLowerCase()));
    
    const newDoc: User = {
      id: doc.id || (100 + list.length + 1),
      firstName: doc.firstName || 'Médecin',
      lastName: doc.lastName || 'Spécialiste',
      email: doc.email || '',
      role: 'DOCTOR' as any,
      specialization: doc.specialization || 'Médecine Générale',
      hospital: doc.hospital || 'Cabinet Privé',
      enabled: true
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...newDoc };
    } else {
      list.push(newDoc);
    }

    this.saveLocalDoctors(list);
    return newDoc;
  }

  public mergeDoctors(remote: User[]): void {
    const local = this.getLocalDoctors();
    for (const r of remote) {
      const idx = local.findIndex(l => l.id === r.id || (l.email && r.email && l.email.toLowerCase() === r.email.toLowerCase()));
      if (idx >= 0) {
        local[idx] = { ...local[idx], ...r };
      } else {
        local.push(r);
      }
    }
    this.saveLocalDoctors(local);
  }

  getMe(): Observable<User> { 
    return this.http.get<User>(`${this.API}/me`); 
  }

  updateMe(user: Partial<User>): Observable<User> { 
    return this.http.put<User>(`${this.API}/me`, user); 
  }

  getDoctors(): Observable<User[]> { 
    return this.http.get<User[]>(`${this.API}/doctors`).pipe(
      tap(remote => {
        if (remote && remote.length > 0) {
          this.mergeDoctors(remote);
        }
      }),
      catchError(() => of(this.getLocalDoctors()))
    ); 
  }

  getPatients(): Observable<User[]> { 
    return this.http.get<User[]>(`${this.API}/patients`); 
  }

  getById(id: number): Observable<User> { 
    return this.http.get<User>(`${this.API}/${id}`); 
  }

  getAll(): Observable<User[]> { 
    return this.http.get<User[]>(this.API); 
  }

  toggleStatus(id: number): Observable<void> { 
    return this.http.patch<void>(`${this.API}/${id}/toggle-status`, {}); 
  }

  exportGdpr(id: number): Observable<any> { 
    return this.http.get<any>(`${environment.apiUrl}/admin/export/${id}`); 
  }
}
