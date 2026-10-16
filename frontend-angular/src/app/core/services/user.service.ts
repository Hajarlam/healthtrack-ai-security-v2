import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/users`;
  private readonly DOCTORS_STORAGE_KEY = 'sihati_registered_doctors';
  private readonly USERS_STORAGE_KEY = 'sihati_all_registered_users';

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

  public getLocalUsers(): User[] {
    const defaultPatientDetails: Record<string, Partial<User>> = {
      'patient@healthtrack.ai': {
        phone: '+212 6 12 34 56 78',
        chronicDiseases: 'Hypertension artérielle modérée',
        bloodType: 'A+',
        height: 165,
        weight: 62,
        allergies: 'Pénicilline'
      },
      'jean.martin@gmail.com': {
        phone: '+33 6 45 78 90 12',
        chronicDiseases: 'Diabète Type 2 sous insuline',
        bloodType: 'O-',
        height: 180,
        weight: 75,
        allergies: 'Sulfamides'
      },
      'karim.tazi@gmail.com': {
        phone: '+212 6 88 99 00 11',
        chronicDiseases: 'Arythmie sinusale & Tachycardie',
        bloodType: 'B+',
        height: 174,
        weight: 69,
        allergies: 'Aucune'
      }
    };

    try {
      const data = localStorage.getItem(this.USERS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sync with any local doctors
          const doctors = this.getLocalDoctors();
          const merged = [...parsed];
          for (const d of doctors) {
            if (!merged.some(u => u.email?.toLowerCase() === d.email?.toLowerCase())) {
              merged.push(d);
            }
          }

          // Backfill missing phone and chronicDiseases for known patients
          let modified = false;
          for (const u of merged) {
            const key = u.email?.toLowerCase();
            if (key && defaultPatientDetails[key]) {
              const def = defaultPatientDetails[key];
              if (!u.phone) { u.phone = def.phone; modified = true; }
              if (!u.chronicDiseases) { u.chronicDiseases = def.chronicDiseases; modified = true; }
              if (!u.bloodType) { u.bloodType = def.bloodType; modified = true; }
              if (!u.height) { u.height = def.height; modified = true; }
              if (!u.weight) { u.weight = def.weight; modified = true; }
              if (!u.allergies) { u.allergies = def.allergies; modified = true; }
            }
          }
          if (modified) {
            this.saveLocalUsers(merged);
          }

          return merged;
        }
      }
    } catch(e) {}

    const initialUsers: User[] = [
      {
        id: 1,
        firstName: 'Sara',
        lastName: 'El Amrani',
        email: 'patient@healthtrack.ai',
        role: 'PATIENT' as any,
        phone: '+212 6 12 34 56 78',
        chronicDiseases: 'Hypertension artérielle modérée',
        bloodType: 'A+',
        height: 165,
        weight: 62,
        allergies: 'Pénicilline',
        enabled: true
      },
      {
        id: 2,
        firstName: 'Dr. Ahmed',
        lastName: 'Bennani',
        email: 'doctor@healthtrack.ai',
        role: 'DOCTOR' as any,
        phone: '+212 5 37 77 00 11',
        specialization: 'Cardiologie & Hypertension Artérielle',
        hospital: 'CHU Ibn Sina - Rabat',
        enabled: true
      },
      {
        id: 3,
        firstName: 'Admin',
        lastName: 'HealthTrack',
        email: 'admin@healthtrack.ai',
        role: 'ADMIN' as any,
        phone: '+212 5 37 60 00 00',
        enabled: true
      },
      {
        id: 4,
        firstName: 'Dr. Secours',
        lastName: 'Urgentiste',
        email: 'emergency@healthtrack.ai',
        role: 'EMERGENCY' as any,
        phone: '+212 5 37 15 15 15',
        hospital: 'SAMU Urgences Métropolitain',
        enabled: true
      },
      {
        id: 5,
        firstName: 'Dr. Leila',
        lastName: 'Alaoui',
        email: 'leila.alaoui@healthtrack.ai',
        role: 'DOCTOR' as any,
        phone: '+212 5 22 45 67 89',
        specialization: 'Médecine Générale & Suivi Chronique',
        hospital: 'Clinique Internationale - Casablanca',
        enabled: true
      },
      {
        id: 6,
        firstName: 'Jean',
        lastName: 'Martin',
        email: 'jean.martin@gmail.com',
        role: 'PATIENT' as any,
        phone: '+33 6 45 78 90 12',
        chronicDiseases: 'Diabète Type 2 sous insuline',
        bloodType: 'O-',
        height: 180,
        weight: 75,
        allergies: 'Sulfamides',
        enabled: true
      },
      {
        id: 7,
        firstName: 'Dr. Youssef',
        lastName: 'Amrani',
        email: 'youssef.amrani@healthtrack.ai',
        role: 'DOCTOR' as any,
        phone: '+212 5 37 71 22 33',
        specialization: 'Endocrinologie & Diabétologie',
        hospital: 'Hôpital Militaire - Rabat',
        enabled: true
      },
      {
        id: 8,
        firstName: 'Dr. Fatima-Zahra',
        lastName: 'El Idrissi',
        email: 'fz.idrissi@healthtrack.ai',
        role: 'DOCTOR' as any,
        phone: '+212 5 35 61 88 99',
        specialization: 'Pneumologie & Allergologie',
        hospital: 'CHU Hassan II - Fès',
        enabled: true
      },
      {
        id: 9,
        firstName: 'Karim',
        lastName: 'Tazi',
        email: 'karim.tazi@gmail.com',
        role: 'PATIENT' as any,
        phone: '+212 6 88 99 00 11',
        chronicDiseases: 'Arythmie sinusale & Tachycardie',
        bloodType: 'B+',
        height: 174,
        weight: 69,
        allergies: 'Aucune',
        enabled: true
      }
    ];

    this.saveLocalUsers(initialUsers);
    return initialUsers;
  }

  public saveLocalUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    } catch(e) {}
  }

  public addUser(user: Partial<User>): User {
    const list = this.getLocalUsers();
    const existingIndex = list.findIndex(u => (user.id && u.id === user.id) || (user.email && u.email?.toLowerCase() === user.email?.toLowerCase()));

    const newUser: User = {
      id: user.id || (100 + list.length + 1),
      firstName: user.firstName || 'Nouvel',
      lastName: user.lastName || 'Utilisateur',
      email: user.email || '',
      phone: user.phone || '',
      role: (user.role || 'PATIENT') as any,
      bloodType: user.bloodType,
      height: user.height,
      weight: user.weight,
      allergies: user.allergies,
      chronicDiseases: user.chronicDiseases,
      specialization: user.specialization,
      hospital: user.hospital,
      emergencyContact: user.emergencyContact,
      emergencyPhone: user.emergencyPhone,
      enabled: user.enabled !== undefined ? user.enabled : true
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...newUser };
    } else {
      list.unshift(newUser);
    }

    this.saveLocalUsers(list);

    if (newUser.role === 'DOCTOR') {
      this.addDoctor(newUser);
    }

    return newUser;
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
    return this.http.get<User[]>(`${this.API}/patients`).pipe(
      catchError(() => of(this.getLocalUsers().filter(u => u.role === 'PATIENT')))
    ); 
  }

  getById(id: number): Observable<User> { 
    const local = this.getLocalUsers().find(u => u.id === id);
    return this.http.get<User>(`${this.API}/${id}`).pipe(
      catchError(() => local ? of(local) : of({} as User))
    ); 
  }

  getAll(): Observable<User[]> { 
    return this.http.get<User[]>(this.API).pipe(
      tap(remote => {
        if (remote && remote.length > 0) {
          const local = this.getLocalUsers();
          for (const r of remote) {
            const idx = local.findIndex(l => l.id === r.id || (l.email && r.email && l.email.toLowerCase() === r.email.toLowerCase()));
            if (idx >= 0) {
              local[idx] = { ...local[idx], ...r };
            } else {
              local.push(r);
            }
          }
          this.saveLocalUsers(local);
        }
      }),
      catchError(() => of(this.getLocalUsers()))
    ); 
  }

  toggleStatus(id: number): Observable<void> { 
    const users = this.getLocalUsers();
    const target = users.find(u => u.id === id);
    if (target) {
      target.enabled = !target.enabled;
      this.saveLocalUsers(users);
    }
    return this.http.patch<void>(`${this.API}/${id}/toggle-status`, {}).pipe(
      catchError(() => of(void 0))
    ); 
  }

  exportGdpr(id: number): Observable<any> { 
    const users = this.getLocalUsers();
    const target = users.find(u => u.id === id) || { id, firstName: 'Utilisateur', lastName: 'Sihati', email: 'user@healthtrack.ai', role: 'PATIENT' };
    const dummyGdpr = {
      user: target,
      exportDate: new Date().toISOString(),
      platform: 'Sihati.ai / HealthTrack Security (Norme HDS & CNDP Loi 09-08)',
      gdprCompliance: {
        rightOfAccess: true,
        rightToRectification: true,
        rightToErasure: true,
        dataPortability: true
      },
      healthRecords: [
        { date: '2026-10-15', type: 'Constantes vitales', bloodPressure: '120/80 mmHg', heartRate: 72, glucose: 95 }
      ],
      auditTrail: [
        { action: 'LOGIN_SUCCESS', timestamp: new Date(Date.now() - 3600000).toISOString(), ip: '196.200.145.22' }
      ]
    };

    return this.http.get<any>(`${environment.apiUrl}/admin/export/${id}`).pipe(
      catchError(() => of(dummyGdpr))
    ); 
  }
}
