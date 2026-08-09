import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HealthRecord, PageResponse } from '../models/health-record.model';

@Injectable({ providedIn: 'root' })
export class HealthRecordService {
  private readonly API = `${environment.apiUrl}/health-records`;

  constructor(private http: HttpClient) {}

  addRecord(record: HealthRecord): Observable<HealthRecord> {
    return this.http.post<HealthRecord>(this.API, record);
  }

  getMyRecords(page = 0, size = 20): Observable<PageResponse<HealthRecord>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<HealthRecord>>(this.API, { params });
  }

  getLatest(): Observable<HealthRecord> {
    return this.http.get<HealthRecord>(`${this.API}/latest`);
  }

  getPatientRecords(patientId: number, page = 0, size = 20): Observable<PageResponse<HealthRecord>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<HealthRecord>>(`${this.API}/patient/${patientId}`, { params });
  }
}
