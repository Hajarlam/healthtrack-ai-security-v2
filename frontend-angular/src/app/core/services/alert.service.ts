import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alert } from '../models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly API = `${environment.apiUrl}/alerts`;
  private readonly STORAGE_KEY = 'sihati_user_alerts';

  constructor(private http: HttpClient) {}

  public getLocalAlerts(role?: string): Alert[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}

    const now = Date.now();
    let initial: Alert[] = [];

    if (role === 'PATIENT') {
      initial = [
        {
          id: 310,
          message: 'Tension artérielle systolique légèrement élevée (145 mmHg) mesurée lors de votre dernier relevé.',
          severity: 'HIGH',
          type: 'BP',
          acknowledged: false,
          createdAt: new Date(now - 3600000).toISOString()
        },
        {
          id: 311,
          message: 'Rappel médical : N\'oubliez pas votre prise médicamenteuse prévue à midi.',
          severity: 'MEDIUM',
          type: 'MED',
          acknowledged: false,
          createdAt: new Date(now - 7200000).toISOString()
        },
        {
          id: 312,
          message: 'Conseil de santé : Pensez à enregistrer vos constantes de repos avant le dîner.',
          severity: 'LOW',
          type: 'REMINDER',
          acknowledged: true,
          createdAt: new Date(now - 14400000).toISOString()
        }
      ];
    } else if (role === 'DOCTOR') {
      initial = [
        {
          id: 301,
          message: 'Urgence métabolique : Jean Martin — Glycémie critique détectée à 240 mg/dL (Ajustement requis)',
          severity: 'CRITICAL',
          type: 'GLUCOSE',
          acknowledged: false,
          createdAt: new Date(now - 1800000).toISOString()
        },
        {
          id: 302,
          message: 'Alerte cardiologique : Mohammed Alami — Saturation O2 basse (89%) et tachycardie à 118 bpm',
          severity: 'CRITICAL',
          type: 'SPO2',
          acknowledged: false,
          createdAt: new Date(now - 3600000).toISOString()
        },
        {
          id: 303,
          message: 'Surveillance tension : Sara El Amrani — Pression artérielle élevée à 148/95 mmHg',
          severity: 'HIGH',
          type: 'BP',
          acknowledged: false,
          createdAt: new Date(now - 7200000).toISOString()
        },
        {
          id: 304,
          message: 'Suivi diabète : Karim Tazi — Écart de glycémie post-prandiale à 165 mg/dL',
          severity: 'MEDIUM',
          type: 'GLUCOSE',
          acknowledged: false,
          createdAt: new Date(now - 14400000).toISOString()
        }
      ];
    } else {
      // ADMIN or system supervisor: platform-wide monitoring alerts
      initial = [
        {
          id: 301,
          message: 'Urgence clinique : Jean Martin — Glycémie critique détectée à 240 mg/dL (Seuil 180 dépassé)',
          severity: 'CRITICAL',
          type: 'GLUCOSE',
          acknowledged: false,
          createdAt: new Date(now - 1800000).toISOString()
        },
        {
          id: 302,
          message: 'Alerte vitale : Mohammed Alami — SpO2 89% et tachycardie 118 bpm transmises au cardiologue',
          severity: 'CRITICAL',
          type: 'SPO2',
          acknowledged: false,
          createdAt: new Date(now - 3600000).toISOString()
        },
        {
          id: 303,
          message: 'Anomalie cardiovasculaire : Sara El Amrani — Tension 148/95 mmHg enregistrée',
          severity: 'HIGH',
          type: 'BP',
          acknowledged: false,
          createdAt: new Date(now - 7200000).toISOString()
        },
        {
          id: 304,
          message: 'Cybersécurité : 3 tentatives d\'authentification infructueuses bloquées par le pare-feu applicatif',
          severity: 'HIGH',
          type: 'SECURITY',
          acknowledged: false,
          createdAt: new Date(now - 10800000).toISOString()
        },
        {
          id: 305,
          message: 'Régulation glycémique : Karim Tazi — Écart modéré 165 mg/dL sous surveillance télémétrique',
          severity: 'MEDIUM',
          type: 'GLUCOSE',
          acknowledged: false,
          createdAt: new Date(now - 14400000).toISOString()
        },
        {
          id: 306,
          message: 'Observance globale : 4 patients chroniques n\'ont pas encore consigné leurs constantes du jour',
          severity: 'LOW',
          type: 'REMINDER',
          acknowledged: true,
          createdAt: new Date(now - 28800000).toISOString()
        }
      ];
    }

    this.saveLocalAlerts(initial);
    return initial;
  }

  public saveLocalAlerts(alerts: Alert[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(alerts));
    } catch(e) {}
  }

  getMyAlerts(role?: string): Observable<Alert[]> {
    return this.http.get<Alert[]>(this.API).pipe(
      tap(remote => {
        if (remote && remote.length > 0) {
          this.saveLocalAlerts(remote);
        }
      }),
      catchError(() => of(this.getLocalAlerts(role)))
    );
  }

  getCount(role?: string): Observable<number> {
    return this.http.get<number>(`${this.API}/count`).pipe(
      catchError(() => {
        const unread = this.getLocalAlerts(role).filter(a => !a.acknowledged).length;
        return of(unread);
      })
    );
  }

  acknowledge(id: number): Observable<Alert> {
    const list = this.getLocalAlerts();
    const target = list.find(a => a.id === id);
    if (target) {
      target.acknowledged = true;
      target.acknowledgedAt = new Date().toISOString();
      this.saveLocalAlerts(list);
    }
    return this.http.patch<Alert>(`${this.API}/${id}/acknowledge`, {}).pipe(
      catchError(() => of(target || { id, acknowledged: true } as Alert))
    );
  }
}
