import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface HealthRecord { systolicBP?:number; diastolicBP?:number; heartRate?:number; bloodGlucose?:number; oxygenSaturation?:number; temperature?:number; weight?:number; status?:string; recordedAt?:string; }
interface Alert { id:number; message:string; severity:string; acknowledged:boolean; createdAt:string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="page">
    <!-- Welcome banner -->
    <div class="welcome-banner">
      <div>
        <h2>Bonjour, {{auth.currentUser()?.firstName}} 👋</h2>
        <p>{{getGreeting()}}</p>
      </div>
      <div class="banner-date">
        <span class="material-icons">calendar_today</span>
        <span>{{today | date:'EEEE d MMMM yyyy'}}</span>
      </div>
    </div>

    <!-- ==================== ADMIN DASHBOARD ==================== -->
    @if (auth.isAdmin()) {
      <div class="grid-4" style="margin-bottom:24px">
        <div class="stat-card">
          <div class="stat-icon si-rose"><span class="material-icons">people</span></div>
          <div><div class="stat-val">{{adminStats()?.totalUsers || '0'}}</div><div class="stat-lbl">Utilisateurs inscrits</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon si-teal"><span class="material-icons">warning</span></div>
          <div><div class="stat-val">{{adminStats()?.totalAlerts || '0'}}</div><div class="stat-lbl">Alertes générées</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon si-mauve"><span class="material-icons">favorite</span></div>
          <div><div class="stat-val">{{adminStats()?.totalRecords || '0'}}</div><div class="stat-lbl">Mesures de santé</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon si-peach"><span class="material-icons">calendar_today</span></div>
          <div><div class="stat-val">{{adminStats()?.totalAppointments || '0'}}</div><div class="stat-lbl">Rendez-vous</div></div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span class="material-icons">manage_accounts</span> Gestion Globale</div>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
            En tant qu'administrateur, vous disposez d'un accès total pour superviser la sécurité et les comptes utilisateurs.
          </p>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <a routerLink="/users" class="btn-primary" style="display:inline-flex;justify-content:center;align-items:center;gap:6px;">
              <span class="material-icons">manage_accounts</span> Gérer les utilisateurs
            </a>
            <a routerLink="/security-audit" class="btn-outline" style="display:inline-flex;justify-content:center;align-items:center;gap:6px;">
              <span class="material-icons">security</span> Consulter l'audit de sécurité
            </a>
          </div>
        </div>

        <div class="card">
          <div class="card-title"><span class="material-icons">security</span> Statut des Comptes</div>
          <div class="vitals-mini">
            <div class="vitem"><label>🟢 Comptes Actifs</label>            <span style="color:#234E52; font-weight:700;">{{adminStats()?.activeAccounts || '0'}}</span></div>
            <div class="vitem"><label>🔴 Comptes Inactifs</label>            <span style="color:#C53030; font-weight:700;">{{adminStats()?.inactiveAccounts || '0'}}</span></div>
          </div>
        </div>
      </div>
    } @else if (auth.isDoctor()) {
      <div class="grid-3" style="margin-bottom:24px">
        <div class="stat-card">
          <div class="stat-icon si-rose"><span class="material-icons">people</span></div>
          <div><div class="stat-val">{{patientsList().length}}</div><div class="stat-lbl">Mes patients assignés</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon si-teal"><span class="material-icons">notifications</span></div>
          <div><div class="stat-val">{{alerts().length}}</div><div class="stat-lbl">Alertes en attente</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon si-mauve"><span class="material-icons">event</span></div>
          <div><div class="stat-val">{{appointments().length}}</div><div class="stat-lbl">Rendez-vous programmés</div></div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Doctor Alerts -->
        <div class="card">
          <div class="card-title"><span class="material-icons">notifications_active</span> Alertes critiques de mes patients</div>
          @for (a of alerts().slice(0, 5); track a.id) {
            <div class="alert-item" [class]="'alert-' + a.severity.toLowerCase()" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div style="display:flex; gap:12px; align-items:flex-start;">
                <span class="material-icons" style="flex-shrink:0;font-size:20px;">{{alertIcon(a.severity)}}</span>
                <div>
                  <p style="font-size:13px;font-weight:500;margin:0;">{{a.message}}</p>
                  <small style="color:#4A7C94;">{{a.createdAt | date:'dd/MM HH:mm'}}</small>
                </div>
              </div>
              <button class="btn-primary" style="padding:4px 10px; font-size:11px; border-radius:6px; flex-shrink:0;" (click)="ackAlert(a.id)">Acquitter</button>
            </div>
          }
          @if (alerts().length === 0) {
            <div class="empty" style="padding:24px 0">
              <span class="material-icons" style="color:#0FA958;">check_circle</span>
              <p>Aucune alerte patient active ✅</p>
            </div>
          }
        </div>

        <!-- Doctor Appointments -->
        <div class="card">
          <div class="card-title"><span class="material-icons">event</span> Rendez-vous à valider</div>
          @for (ap of appointments().slice(0, 5); track ap.id) {
            <div class="alert-item" style="display:flex; justify-content:space-between; align-items:center; background:var(--bg); border:1px solid var(--border); padding:10px 14px; border-radius:10px; margin-bottom:8px;">
              <div>
                <strong style="font-size:13px;">{{ap.patient?.firstName}} {{ap.patient?.lastName}}</strong>
                <p style="margin:2px 0 0; font-size:12px; color:#4A7C94;">Le {{ap.appointmentDate | date:'dd/MM/yyyy à HH:mm'}}</p>
                <small style="color:#4A7C94; font-style:italic;">Motif: {{ap.reason || 'Non précisé'}}</small>
              </div>
              <div style="display:flex; gap:6px; flex-shrink:0;">
                @if (ap.status === 'PENDING') {
                  <button class="btn-primary" style="padding:4px 10px; font-size:11px; border-radius:6px;" (click)="confirmAppointment(ap.id)">Confirmer</button>
                  <button class="btn-outline" style="padding:4px 10px; font-size:11px; border-radius:6px;" (click)="cancelAppointment(ap.id)">Annuler</button>
                } @else {
                  <span class="badge" [class]="ap.status?.toLowerCase()">{{ap.status}}</span>
                }
              </div>
            </div>
          }
          @if (appointments().length === 0) {
            <div class="empty" style="padding:24px 0">
              <span class="material-icons" style="color:#0077B6;">calendar_today</span>
              <p>Aucun rendez-vous à traiter.</p>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="grid-4" style="margin-bottom:24px">
        <div class="stat-card">
          <div class="stat-icon si-rose"><span class="material-icons">favorite</span></div>
          <div><div class="stat-val">{{bp()}}</div><div class="stat-lbl">Tension (mmHg)</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon si-teal"><span class="material-icons">water_drop</span></div>
          <div><div class="stat-val">{{latest()?.bloodGlucose || '--'}}</div><div class="stat-lbl">Glycémie (mg/dL)</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon si-mauve"><span class="material-icons">air</span></div>
          <div><div class="stat-val">{{latest()?.oxygenSaturation || '--'}}%</div><div class="stat-lbl">SpO2</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon si-peach"><span class="material-icons">monitor_heart</span></div>
          <div><div class="stat-val">{{latest()?.heartRate || '--'}}</div><div class="stat-lbl">Fréq. cardiaque</div></div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Status -->
        <div class="card">
          <div class="card-title"><span class="material-icons">health_and_safety</span> État de santé</div>
          @if (latest()) {
            <div class="status-pill" [class]="'status-' + (latest()?.status?.toLowerCase() || 'normal')">
              <span class="material-icons">{{statusIcon()}}</span>
              <div>
                <strong>{{statusLabel()}}</strong>
                <p style="font-size:12px;opacity:.8;margin-top:2px;">Mesure du {{latest()?.recordedAt | date:'dd/MM/yyyy HH:mm'}}</p>
              </div>
            </div>
            <div class="vitals-mini">
              <div class="vitem"><label>🌡️ Temp.</label><span>{{latest()?.temperature || '--'}} °C</span></div>
              <div class="vitem"><label>⚖️ Poids</label><span>{{latest()?.weight || '--'}} kg</span></div>
            </div>
          } @else {
            <div class="empty" style="padding:32px 0">
              <span class="material-icons">monitor_heart</span>
              <p>Aucune mesure</p>
              <a routerLink="/health-records" class="btn-primary" style="display:inline-flex;margin-top:10px;">Ajouter une mesure</a>
            </div>
          }
        </div>

        <!-- Alerts -->
        <div class="card">
          <div class="card-title"><span class="material-icons">notifications</span> Alertes récentes</div>
          @for (a of alerts().slice(0, 5); track a.id) {
            <div class="alert-item" [class]="'alert-' + a.severity.toLowerCase()">
              <span class="material-icons" style="flex-shrink:0;font-size:20px;">{{alertIcon(a.severity)}}</span>
              <div style="flex:1;">
                <p style="font-size:13px;font-weight:500;margin:0;">{{a.message}}</p>
                <small style="color:#4A7C94;">{{a.createdAt | date:'dd/MM HH:mm'}}</small>
              </div>
              @if (!a.acknowledged) { <span style="width:8px;height:8px;border-radius:50%;background:#0077B6;flex-shrink:0;margin-top:4px;"></span> }
            </div>
          }
          @if (alerts().length === 0) {
            <div class="empty" style="padding:24px 0">
              <span class="material-icons" style="color:#2F855A;">check_circle</span>
              <p>Aucune alerte active ✅</p>
            </div>
          }
          <a routerLink="/alerts" style="font-size:13px;color:#0077B6;text-decoration:none;display:block;margin-top:8px;font-weight:600;">Voir toutes →</a>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="card" style="margin-top: 20px;">
        <div class="card-title"><span class="material-icons">bolt</span> Actions rapides</div>
        <div class="quick-actions">
          <a routerLink="/health-records" class="qa-btn qa-rose"><span class="material-icons">add_circle</span><span>Nouvelle mesure</span></a>
          <a routerLink="/chat"           class="qa-btn qa-blue"><span class="material-icons">chat</span><span>Messages</span></a>
          <a routerLink="/appointments"   class="qa-btn qa-green"><span class="material-icons">event_available</span><span>Rendez-vous</span></a>
          <a routerLink="/medications"    class="qa-btn qa-orange"><span class="material-icons">medication</span><span>Médicaments</span></a>
          <a routerLink="/health-records" class="qa-btn qa-mauve"><span class="material-icons">bar_chart</span><span>Historique</span></a>
          <a routerLink="/profile"        class="qa-btn qa-peach"><span class="material-icons">person</span><span>Profil</span></a>
        </div>
      </div>
    }
  </div>
  `,
  styles: [`
  .welcome-banner{background:linear-gradient(135deg,#005F8E 0%,#0077B6 55%,#0096C7 100%);border-radius:16px;padding:28px 32px;color:white;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;text-shadow:0 1px 3px rgba(0,0,0,.08);}
  .welcome-banner h2{font-size:24px;font-weight:800;margin:0;}
  .welcome-banner p{font-size:14px;opacity:.9;margin-top:4px;}
  .banner-date{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.2);padding:10px 16px;border-radius:10px;font-size:13px;}
  .status-pill{display:flex;align-items:center;gap:12px;padding:16px;border-radius:12px;margin-bottom:14px;}
  .status-pill .material-icons{font-size:30px;}
  .status-normal{background:#D1FAE5;color:#065F46;} .status-warning{background:#FEF3C7;color:#92400E;} .status-critical{background:#FEE2E2;color:#991B1B;}
  .vitals-mini{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .vitem{background:#CAF0F8;border-radius:10px;padding:12px;text-align:center;}
  .vitem label{display:block;font-size:12px;color:#4A7C94;margin-bottom:4px;}
  .vitem span{font-size:18px;font-weight:700;color:#023E58;}
  .quick-actions{display:flex;flex-wrap:wrap;gap:12px;}
  .qa-btn{display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;text-decoration:none;font-size:14px;font-weight:600;transition:transform .15s,opacity .15s;}
  .qa-btn:hover{transform:translateY(-2px);opacity:.9;}
  .qa-rose{background:#CAF0F8;color:#005F8E;} .qa-blue{background:#E0F2FE;color:#0077B6;}
  .qa-green{background:#D1FAE5;color:#065F46;} .qa-orange{background:#FEF3C7;color:#92400E;}
  .qa-mauve{background:#EDE9FE;color:#5B21B6;} .qa-peach{background:#FEF3C7;color:#92400E;}
  `]
})
export class DashboardComponent implements OnInit {
  latest = signal<HealthRecord|null>(null);
  alerts = signal<Alert[]>([]);
  patientsList = signal<any[]>([]);
  appointments = signal<any[]>([]);
  adminStats = signal<any>(null);
  today = new Date();

  constructor(public auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.auth.isAdmin()) {
      this.http.get<any>(`${environment.apiUrl}/admin/stats`).subscribe({
        next: s => this.adminStats.set(s),
        error: () => {}
      });
      this.http.get<Alert[]>(`${environment.apiUrl}/alerts`).subscribe({next:a=>this.alerts.set(a),error:()=>{}});
    } else if (this.auth.isDoctor()) {
      this.http.get<any[]>(`${environment.apiUrl}/users/patients`).subscribe({next:p=>this.patientsList.set(p),error:()=>{}});
      this.http.get<Alert[]>(`${environment.apiUrl}/alerts`).subscribe({next:a=>this.alerts.set(a),error:()=>{}});
      this.http.get<any[]>(`${environment.apiUrl}/appointments`).subscribe({next:ap=>this.appointments.set(ap),error:()=>{}});
    } else {
      this.http.get<HealthRecord>(`${environment.apiUrl}/health-records/latest`).subscribe({next:r=>this.latest.set(r),error:()=>{}});
      this.http.get<Alert[]>(`${environment.apiUrl}/alerts`).subscribe({next:a=>this.alerts.set(a),error:()=>{}});
    }
  }

  bp() {
    const l = this.latest();
    return l?.systolicBP ? `${l.systolicBP}/${l.diastolicBP}` : '--/--';
  }

  getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bonne matinée — pensez à prendre vos mesures';
    if (h < 18) return 'Bonne après-midi — votre santé est notre priorité';
    return "Bonne soirée — n'oubliez pas vos médicaments";
  }

  statusIcon() {
    switch(this.latest()?.status) {
      case 'CRITICAL': return 'error'; case 'WARNING': return 'warning'; default: return 'check_circle';
    }
  }
  statusLabel() {
    switch(this.latest()?.status) {
      case 'CRITICAL': return '⚠️ État critique — Consultez un médecin !';
      case 'WARNING':  return '⚠️ Valeurs anormales';
      default:         return '✅ État normal';
    }
  }
  alertIcon(s: string) {
    switch(s) { case 'CRITICAL': return 'error'; case 'HIGH': return 'warning'; default: return 'info'; }
  }

  confirmAppointment(id: number) {
    this.http.patch(`${environment.apiUrl}/appointments/${id}/confirm`, {}).subscribe({
      next: () => this.loadData(),
      error: () => {}
    });
  }

  cancelAppointment(id: number) {
    this.http.patch(`${environment.apiUrl}/appointments/${id}/cancel`, {}).subscribe({
      next: () => this.loadData(),
      error: () => {}
    });
  }

  ackAlert(id: number) {
    this.http.patch(`${environment.apiUrl}/alerts/${id}/acknowledge`, {}).subscribe({
      next: () => this.loadData(),
      error: () => {}
    });
  }
}
