import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthRequest, AuthResponse, RegisterRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    if (token) {
      const user = localStorage.getItem('user');
      if (user) this.currentUser.set(JSON.parse(user));
    }
  }

  login(req: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, req).pipe(
      tap(res => {
        if (!res.twoFactorRequired) {
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

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null { return localStorage.getItem('token'); }
  isLoggedIn(): boolean { return !!this.getToken(); }
  getRole(): string { return this.currentUser()?.role || ''; }
  isDoctor(): boolean { return this.getRole() === 'DOCTOR'; }
  isAdmin(): boolean  { return this.getRole() === 'ADMIN'; }
  isPatient(): boolean{ return this.getRole() === 'PATIENT'; }
  isEmergency(): boolean { return this.getRole() === 'EMERGENCY'; }
}
