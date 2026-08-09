import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alert } from '../models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly API = `${environment.apiUrl}/alerts`;
  constructor(private http: HttpClient) {}
  getMyAlerts(): Observable<Alert[]>          { return this.http.get<Alert[]>(this.API); }
  getCount(): Observable<number>              { return this.http.get<number>(`${this.API}/count`); }
  acknowledge(id: number): Observable<Alert> { return this.http.patch<Alert>(`${this.API}/${id}/acknowledge`, {}); }
}
