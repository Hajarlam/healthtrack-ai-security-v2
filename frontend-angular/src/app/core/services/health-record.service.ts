import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HealthRecord, PageResponse } from '../models/health-record.model';

@Injectable({ providedIn: 'root' })
export class HealthRecordService {
  private readonly API = `${environment.apiUrl}/health-records`;
  private readonly STORAGE_KEY = 'sihati_health_records';

  constructor(private http: HttpClient) {}

  public getLocalRecords(): HealthRecord[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}

    const now = Date.now();
    const initial: HealthRecord[] = [
      { id: 4, systolicBP: 125, diastolicBP: 82, heartRate: 74, bloodGlucose: 98, oxygenSaturation: 98, temperature: 36.5, weight: 62, status: 'NORMAL', recordedAt: new Date(now - 1000 * 60 * 30).toISOString() },
      { id: 3, systolicBP: 142, diastolicBP: 88, heartRate: 80, bloodGlucose: 110, oxygenSaturation: 97, temperature: 36.8, weight: 62, status: 'WARNING', recordedAt: new Date(now - 1000 * 60 * 120).toISOString() },
      { id: 2, systolicBP: 130, diastolicBP: 84, heartRate: 75, bloodGlucose: 105, oxygenSaturation: 97, temperature: 36.7, weight: 62, status: 'NORMAL', recordedAt: new Date(now - 1000 * 60 * 240).toISOString() },
      { id: 1, systolicBP: 120, diastolicBP: 80, heartRate: 72, bloodGlucose: 95, oxygenSaturation: 98, temperature: 36.6, weight: 62, status: 'NORMAL', recordedAt: new Date(now - 1000 * 60 * 480).toISOString() }
    ];
    this.saveLocalRecords(initial);
    return initial;
  }

  public saveLocalRecords(records: HealthRecord[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch(e) {}
  }

  addRecord(record: HealthRecord): Observable<HealthRecord> {
    const list = this.getLocalRecords();
    const isWarning = (record.systolicBP && record.systolicBP >= 140) ||
                      (record.diastolicBP && record.diastolicBP >= 90) ||
                      (record.bloodGlucose && (record.bloodGlucose >= 140 || record.bloodGlucose < 70)) ||
                      (record.heartRate && (record.heartRate > 100 || record.heartRate < 50));
    const isCritical = (record.systolicBP && record.systolicBP >= 160) ||
                       (record.diastolicBP && record.diastolicBP >= 100) ||
                       (record.bloodGlucose && record.bloodGlucose >= 200) ||
                       (record.oxygenSaturation && record.oxygenSaturation < 92);

    const calculatedStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = isCritical ? 'CRITICAL' : (isWarning ? 'WARNING' : 'NORMAL');

    const newRec: HealthRecord = {
      ...record,
      id: record.id || Date.now(),
      recordedAt: record.recordedAt || new Date().toISOString(),
      status: record.status || calculatedStatus
    };
    list.unshift(newRec);
    this.saveLocalRecords(list);

    return this.http.post<HealthRecord>(this.API, record).pipe(
      catchError(() => of(newRec))
    );
  }

  getMyRecords(page = 0, size = 20): Observable<PageResponse<HealthRecord>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<HealthRecord>>(this.API, { params }).pipe(
      tap(res => {
        if (res && res.content && res.content.length > 0) {
          this.saveLocalRecords(res.content);
        }
      }),
      catchError(() => {
        const local = this.getLocalRecords();
        return of({
          content: local,
          totalElements: local.length,
          totalPages: 1,
          size: size,
          number: page
        });
      })
    );
  }

  getLatest(): Observable<HealthRecord> {
    return this.http.get<HealthRecord>(`${this.API}/latest`).pipe(
      catchError(() => {
        const local = this.getLocalRecords();
        return of(local[0]);
      })
    );
  }

  getPatientRecords(patientId: number, page = 0, size = 20): Observable<PageResponse<HealthRecord>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<HealthRecord>>(`${this.API}/patient/${patientId}`, { params }).pipe(
      catchError(() => {
        const local = this.getLocalRecords();
        return of({
          content: local,
          totalElements: local.length,
          totalPages: 1,
          size: size,
          number: page
        });
      })
    );
  }
}
