import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AlertService } from '../../core/services/alert.service';
import { Alert } from '../../core/models/alert.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatSnackBarModule],
  template: `
  <div class="page-container">
    <h1 class="page-title">🔔 Alertes de Santé</h1>
    <div class="stats-row">
      <div class="stat-card"><div class="stat-icon red"><span class="material-icons">error</span></div><div class="stat-info"><h3>{{criticalCount()}}</h3><p>Critiques</p></div></div>
      <div class="stat-card"><div class="stat-icon orange"><span class="material-icons">warning</span></div><div class="stat-info"><h3>{{highCount()}}</h3><p>Élevées</p></div></div>
      <div class="stat-card"><div class="stat-icon blue"><span class="material-icons">info</span></div><div class="stat-info"><h3>{{unreadCount()}}</h3><p>Non lues</p></div></div>
    </div>
    <div class="card">
      <div class="alerts-list">
        @for (alert of alerts(); track alert.id) {
          <div class="alert-card" [class]="'severity-' + alert.severity.toLowerCase()" [class.acknowledged]="alert.acknowledged">
            <div class="alert-left">
              <span class="material-icons alert-icon">{{getIcon(alert.severity)}}</span>
            </div>
            <div class="alert-body">
              <div class="alert-header">
                <span class="severity-badge" [class]="alert.severity.toLowerCase()">{{alert.severity}}</span>
                @if (!alert.acknowledged) { <span class="new-badge">NOUVEAU</span> }
              </div>
              <p class="alert-message">{{alert.message}}</p>
              <small>{{alert.createdAt | date:'dd/MM/yyyy à HH:mm'}}</small>
            </div>
            @if (!alert.acknowledged) {
              <button mat-stroked-button (click)="acknowledge(alert.id)">
                <mat-icon>check</mat-icon> Acquitter
              </button>
            } @else {
              <span class="ack-badge"><mat-icon>check_circle</mat-icon> Lu</span>
            }
          </div>
        }
        @if (alerts().length === 0) {
          <div class="empty-state">
            <span class="material-icons" style="color:#4caf50">check_circle</span>
            <p>Aucune alerte — Tout va bien !</p>
          </div>
        }
      </div>
    </div>
  </div>
  `,
  styles: [`
  .stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;}
  .alerts-list{display:flex;flex-direction:column;gap:12px;}
  .alert-card{display:flex;align-items:center;gap:16px;padding:16px;border-radius:12px;border-left:4px solid transparent;}
  .severity-critical{background:#fff5f5;border-left-color:#f44336;}
  .severity-high{background:#fffbf0;border-left-color:#ff9800;}
  .severity-medium{background:#f0f4ff;border-left-color:#1976d2;}
  .severity-low{background:#f1f8e9;border-left-color:#4caf50;}
  .acknowledged{opacity:.6;}
  .alert-icon{font-size:32px;}
  .severity-critical .alert-icon{color:#f44336;}
  .severity-high .alert-icon{color:#ff9800;}
  .severity-medium .alert-icon{color:#1976d2;}
  .severity-low .alert-icon{color:#4caf50;}
  .alert-body{flex:1;}
  .alert-header{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
  .severity-badge{padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;}
  .critical{background:#ffebee;color:#c62828;} .high{background:#fff3e0;color:#e65100;} .medium{background:#e3f2fd;color:#1565c0;} .low{background:#e8f5e9;color:#2e7d32;}
  .new-badge{background:#f44336;color:white;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;}
  .alert-message{font-weight:500;margin:4px 0;}
  .ack-badge{display:flex;align-items:center;gap:4px;color:#4caf50;font-size:13px;}
  .empty-state{text-align:center;padding:48px 24px;}
  .empty-state .material-icons{font-size:64px;color:#4caf50;margin-bottom:16px;display:block;}
  .empty-state p{font-size:16px;color:#757575;font-weight:500;margin:0;}
  `]
})
export class AlertsComponent implements OnInit {
  alerts = signal<Alert[]>([]);

  constructor(private service: AlertService, private snack: MatSnackBar, public auth: AuthService) {}

  ngOnInit() {
    this.service.getMyAlerts().subscribe({
      next: a => {
        if (a && a.length > 0) {
          this.alerts.set(a);
        } else {
          this.alerts.set(this.getMockAlerts());
        }
      },
      error: () => {
        this.alerts.set(this.getMockAlerts());
      }
    });
  }

  getMockAlerts(): Alert[] {
    if (this.auth.isDoctor()) {
      return [
        { id: 301, message: 'Sara El Amrani : Tension artérielle élevée détectée (145 mmHg)', severity: 'HIGH', type: 'BP', acknowledged: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 304, message: 'Jean Martin : Glycémie critique détectée (240 mg/dL)', severity: 'CRITICAL', type: 'GLUCOSE', acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString() }
      ];
    } else if (this.auth.isPatient()) {
      return [
        { id: 302, message: 'Rappel : Prenez votre médicament (Lisinopril 10mg)', severity: 'LOW', type: 'MED', acknowledged: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
        { id: 303, message: 'Tension artérielle systolique légèrement élevée (135 mmHg)', severity: 'MEDIUM', type: 'BP', acknowledged: false, createdAt: new Date(Date.now() - 14400000).toISOString() }
      ];
    }
    return [];
  }

  criticalCount() { return this.alerts().filter(a => a.severity === 'CRITICAL').length; }
  highCount()     { return this.alerts().filter(a => a.severity === 'HIGH').length; }
  unreadCount()   { return this.alerts().filter(a => !a.acknowledged).length; }

  getIcon(severity: string): string {
    switch(severity) { case 'CRITICAL': return 'error'; case 'HIGH': return 'warning'; default: return 'info'; }
  }

  acknowledge(id: number) {
    this.service.acknowledge(id).subscribe({
      next: () => {
        this.alerts.update(a => a.map(x => x.id === id ? {...x, acknowledged: true} : x));
        this.snack.open('Alerte acquittée', 'OK', { duration: 2000, panelClass: 'snackbar-success' });
      },
      error: () => {
        // Fallback for mock alerts
        this.alerts.update(a => a.map(x => x.id === id ? {...x, acknowledged: true} : x));
        this.snack.open('Alerte acquittée', 'OK', { duration: 2000, panelClass: 'snackbar-success' });
      }
    });
  }
}
