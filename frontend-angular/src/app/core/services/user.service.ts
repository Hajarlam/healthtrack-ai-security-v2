import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}
  getMe(): Observable<User>               { return this.http.get<User>(`${this.API}/me`); }
  updateMe(user: Partial<User>): Observable<User> { return this.http.put<User>(`${this.API}/me`, user); }
  getDoctors(): Observable<User[]>        { return this.http.get<User[]>(`${this.API}/doctors`); }
  getPatients(): Observable<User[]>       { return this.http.get<User[]>(`${this.API}/patients`); }
  getById(id: number): Observable<User>   { return this.http.get<User>(`${this.API}/${id}`); }
  getAll(): Observable<User[]>            { return this.http.get<User[]>(this.API); }
  toggleStatus(id: number): Observable<void> { return this.http.patch<void>(`${this.API}/${id}/toggle-status`, {}); }
  exportGdpr(id: number): Observable<any> { return this.http.get<any>(`${environment.apiUrl}/admin/export/${id}`); }
}
