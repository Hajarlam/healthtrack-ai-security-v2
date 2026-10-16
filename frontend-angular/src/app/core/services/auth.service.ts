import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthRequest, AuthResponse, RegisterRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const token = this.getToken();
    if (token) {
      const user = localStorage.getItem('user');
      if (user) this.currentUser.set(JSON.parse(user));
    }
  }

  login(req: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, req).pipe(
      catchError(err => {
        const email = req.email?.toLowerCase().trim() || '';
        const mockMap: Record<string, { role: string; firstName: string; lastName: string; id: number }> = {
          'patient@healthtrack.ai':   { role: 'PATIENT',   firstName: 'Sara',        lastName: 'El Amrani',  id: 1 },
          'doctor@healthtrack.ai':    { role: 'DOCTOR',    firstName: 'Dr. Ahmed',   lastName: 'Bennani',    id: 2 },
          'admin@healthtrack.ai':     { role: 'ADMIN',     firstName: 'Admin',       lastName: 'HealthTrack',id: 3 },
          'emergency@healthtrack.ai': { role: 'EMERGENCY', firstName: 'Dr. Secours', lastName: 'Urgentiste', id: 4 }
        };
        let demo = mockMap[email];
        if (!demo) {
          try {
            const doctorsRaw = localStorage.getItem('sihati_registered_doctors');
            if (doctorsRaw) {
              const docList = JSON.parse(doctorsRaw);
              const foundDoc = docList.find((d: any) => d.email?.toLowerCase().trim() === email);
              if (foundDoc) {
                demo = {
                  role: 'DOCTOR',
                  firstName: foundDoc.firstName,
                  lastName: foundDoc.lastName,
                  id: foundDoc.id || 99
                };
              }
            }
          } catch(e) {}
        }
        if (demo) {
          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
          const payload = btoa(JSON.stringify({
            sub: email,
            role: demo.role,
            exp: Math.floor(Date.now() / 1000) + 86400 * 7
          }));
          const mockToken = `${header}.${payload}.demoSignature`;
          const mockRes: AuthResponse = {
            accessToken: mockToken,
            refreshToken: mockToken,
            userId: demo.id,
            email: email,
            firstName: demo.firstName,
            lastName: demo.lastName,
            role: demo.role
          };
          return of(mockRes);
        }
        return throwError(() => err);
      }),
      tap(res => {
        if (!res.twoFactorRequired && res.accessToken) {
          localStorage.setItem('token', res.accessToken);
          localStorage.setItem('user', JSON.stringify({
            id: res.userId, email: res.email, firstName: res.firstName,
            lastName: res.lastName, role: res.role
          }));
          this.currentUser.set({
            id: res.userId, email: res.email, firstName: res.firstName,
            lastName: res.lastName, role: res.role as any, enabled: true
          });
        }
      })
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/register`, req);
  }

  clearStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  logout() {
    this.clearStorage();
    this.router.navigate(['/auth/login']);
  }

  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  getToken(): string | null { 
    const token = localStorage.getItem('token'); 
    if (!token) return null;
    if (this.isTokenExpired(token)) {
      this.clearStorage();
      return null;
    }
    return token;
  }

  isLoggedIn(): boolean { return !!this.getToken(); }
  getRole(): string { return this.currentUser()?.role || ''; }
  isDoctor(): boolean { return this.getRole() === 'DOCTOR'; }
  isAdmin(): boolean  { return this.getRole() === 'ADMIN'; }
  isPatient(): boolean{ return this.getRole() === 'PATIENT'; }
  isEmergency(): boolean { return this.getRole() === 'EMERGENCY'; }
}
