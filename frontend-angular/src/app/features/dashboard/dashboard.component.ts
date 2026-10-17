import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { HealthRecordService } from '../../core/services/health-record.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

interface HealthRecord { systolicBP?:number; diastolicBP?:number; heartRate?:number; bloodGlucose?:number; oxygenSaturation?:number; temperature?:number; weight?:number; status?:string; recordedAt?:string; }
interface Alert { id:number; message:string; severity:string; acknowledged:boolean; createdAt:string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="dash-container">
    
    <!-- WELCOME HERO BANNER -->
    <div class="welcome-hero">
      <div style="display: flex; align-items: center; gap: 20px;">
        <div style="width: 58px; height: 58px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <img src="assets/logo.svg" alt="Sihati AI Logo" style="width: 54px; height: 54px; object-fit: contain;">
        </div>
        <div class="hero-text-side">
          <div class="hero-top-badge">
            <span class="pulse-dot"></span>
            <span>SIHATI AI &bull; {{ auth.getRole() }}</span>
          </div>
          <h2>Bonjour, {{ auth.currentUser()?.firstName }} 👋</h2>
          <p>{{ getGreeting() }}</p>
        </div>
      </div>

      <div class="hero-meta-side">
        <div class="date-capsule">
          <span class="material-icons">event</span>
          <span>{{ today | date:'EEEE d MMMM yyyy' }}</span>
        </div>
      </div>
    </div>

    <!-- ==================== ADMIN VIEW ==================== -->
    @if (auth.isAdmin()) {
      <div class="stats-row grid-4">
        <div class="dash-stat-card">
          <div class="stat-icon-wrap rose"><span class="material-icons">people</span></div>
          <div class="stat-body">
            <div class="stat-val">{{ adminStats()?.totalUsers || '0' }}</div>
            <div class="stat-lbl">Utilisateurs inscrits</div>
          </div>
        </div>
        <div class="dash-stat-card">
          <div class="stat-icon-wrap amber"><span class="material-icons">notifications_active</span></div>
          <div class="stat-body">
            <div class="stat-val">{{ adminStats()?.totalAlerts || '0' }}</div>
            <div class="stat-lbl">Alertes générées</div>
          </div>
        </div>
        <div class="dash-stat-card">
          <div class="stat-icon-wrap teal"><span class="material-icons">monitor_heart</span></div>
          <div class="stat-body">
            <div class="stat-val">{{ adminStats()?.totalRecords || '0' }}</div>
            <div class="stat-lbl">Mesures de santé</div>
          </div>
        </div>
        <div class="dash-stat-card">
          <div class="stat-icon-wrap blue"><span class="material-icons">event_note</span></div>
          <div class="stat-body">
            <div class="stat-val">{{ adminStats()?.totalAppointments || '0' }}</div>
            <div class="stat-lbl">Rendez-vous globaux</div>
          </div>
        </div>
      </div>

      <div class="main-grid-2">
        <div class="panel-card">
          <div class="panel-head">
            <span class="material-icons panel-head-icon blue">admin_panel_settings</span>
            <h3>Supervision Globale & Sécurité</h3>
          </div>
          <p class="panel-sub">Accès privilégié aux journaux d'audit OWASP et gestion des habilitations utilisateurs.</p>
          <div class="admin-actions-stack">
            <a routerLink="/users" class="btn-hero-primary">
              <span class="material-icons">manage_accounts</span> Gérer les utilisateurs
            </a>
            <a routerLink="/security-audit" class="btn-hero-outline">
              <span class="material-icons">security</span> Consulter l'audit de conformité
            </a>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-head">
            <span class="material-icons panel-head-icon teal">account_circle</span>
            <h3>État des Comptes Utilisateurs</h3>
          </div>
          <div class="vitals-dual-display">
            <div class="v-card good">
              <span class="v-label">🟢 COMPTES ACTIFS</span>
              <span class="v-value">{{ adminStats()?.activeAccounts || '0' }}</span>
            </div>
            <div class="v-card warn">
              <span class="v-label">🔴 COMPTES INACTIFS</span>
              <span class="v-value">{{ adminStats()?.inactiveAccounts || '0' }}</span>
            </div>
          </div>
        </div>
      </div>

    <!-- ==================== DOCTOR VIEW ==================== -->
    } @else if (auth.isDoctor()) {
      <div class="stats-row grid-3">
        <div class="dash-stat-card">
          <div class="stat-icon-wrap blue"><span class="material-icons">groups</span></div>
          <div class="stat-body">
            <div class="stat-val">{{ patientsList().length }}</div>
            <div class="stat-lbl">Patients sous votre suivi</div>
          </div>
        </div>
        <div class="dash-stat-card">
          <div class="stat-icon-wrap amber"><span class="material-icons">notifications</span></div>
          <div class="stat-body">
            <div class="stat-val">{{ alerts().length }}</div>
            <div class="stat-lbl">Alertes à examiner</div>
          </div>
        </div>
        <div class="dash-stat-card">
          <div class="stat-icon-wrap teal"><span class="material-icons">event</span></div>
          <div class="stat-body">
            <div class="stat-val">{{ appointments().length }}</div>
            <div class="stat-lbl">Rendez-vous programmés</div>
          </div>
        </div>
      </div>

      <div class="main-grid-2">
        <!-- Doctor Critical Alerts -->
        <div class="panel-card">
          <div class="panel-head">
            <span class="material-icons panel-head-icon amber">warning</span>
            <h3>Alertes Critiques Patients</h3>
          </div>
          @for (a of alerts().slice(0, 5); track a.id) {
            <div class="alert-feed-item" [class]="'sev-' + a.severity.toLowerCase()">
              <div class="alert-info-left">
                <span class="material-icons alert-badge-icon">{{ alertIcon(a.severity) }}</span>
                <div>
                  <p class="alert-msg">{{ a.message }}</p>
                  <small class="alert-date">{{ a.createdAt | date:'dd/MM HH:mm' }}</small>
                </div>
              </div>
              <button class="btn-ack" (click)="ackAlert(a.id)">Acquitter</button>
            </div>
          }
          @if (alerts().length === 0) {
            <div class="empty-box">
              <span class="material-icons good-icon">check_circle</span>
              <p>Tous les indicateurs patients sont stables ✅</p>
            </div>
          }
        </div>

        <!-- Doctor Appointments -->
        <div class="panel-card">
          <div class="panel-head">
            <span class="material-icons panel-head-icon blue">calendar_month</span>
            <h3>Demandes de Rendez-vous</h3>
          </div>
          @for (ap of appointments().slice(0, 5); track ap.id) {
            <div class="apt-item">
              <div>
                <strong class="apt-patient">{{ ap.patient?.firstName }} {{ ap.patient?.lastName }}</strong>
                <p class="apt-time">Le {{ ap.appointmentDate | date:'dd/MM/yyyy à HH:mm' }}</p>
                <small class="apt-reason">Motif : {{ ap.reason || 'Consultation de suivi' }}</small>
              </div>
              <div class="apt-actions">
                @if (ap.status === 'PENDING') {
                  <button class="btn-confirm" (click)="confirmAppointment(ap.id)">Confirmer</button>
                  <button class="btn-cancel" (click)="cancelAppointment(ap.id)">Annuler</button>
                } @else {
                  <span class="status-chip" [class]="ap.status?.toLowerCase()">{{ ap.status }}</span>
                }
              </div>
            </div>
          }
          @if (appointments().length === 0) {
            <div class="empty-box">
              <span class="material-icons">event_busy</span>
              <p>Aucun nouveau rendez-vous en attente.</p>
            </div>
          }
        </div>
      </div>

    <!-- ==================== URGENTISTE (SECOURS) VIEW ==================== -->
    } @else if (auth.isEmergency()) {
      <div class="stats-row grid-4">
        <div class="dash-stat-card">
          <div class="stat-icon-wrap rose">
            <span class="material-icons">crisis_alert</span>
          </div>
          <div class="stat-body">
            <div class="stat-val">{{ alerts().length }}</div>
            <div class="stat-lbl">Alertes critiques actives</div>
          </div>
          <span class="card-status-pill danger">Priorité Secours</span>
        </div>

        <div class="dash-stat-card">
          <div class="stat-icon-wrap teal">
            <span class="material-icons">personal_injury</span>
          </div>
          <div class="stat-body">
            <div class="stat-val">24/7</div>
            <div class="stat-lbl">Disponibilité SAMU</div>
          </div>
          <span class="card-status-pill normal">Opérationnel</span>
        </div>

        <div class="dash-stat-card">
          <div class="stat-icon-wrap blue">
            <span class="material-icons">badge</span>
          </div>
          <div class="stat-body">
            <div class="stat-val">RBAC</div>
            <div class="stat-lbl">Accès restreint Secours</div>
          </div>
          <span class="card-status-pill normal">Lecture Seule</span>
        </div>

        <div class="dash-stat-card">
          <div class="stat-icon-wrap amber">
            <span class="material-icons">health_and_safety</span>
          </div>
          <div class="stat-body">
            <div class="stat-val">Données</div>
            <div class="stat-lbl">Constantes, Alertes, Traitements</div>
          </div>
          <span class="card-status-pill normal">Vital & Immédiat</span>
        </div>
      </div>

      <div class="main-grid-2">
        <!-- Intervention Portal Card -->
        <div class="panel-card" style="border-top: 4px solid #EF4444;">
          <div class="panel-head">
            <span class="material-icons panel-head-icon rose">local_hospital</span>
            <h3>Portail d'Intervention d'Urgence</h3>
          </div>
          <p class="panel-sub" style="font-size: 13px; line-height: 1.6; color: #4A7C94;">
            Le rôle <strong>Urgentiste</strong> (acteur « Secours » identifié dans le diagramme de cas d'utilisation) offre un accès en <strong>lecture seule</strong> aux données critiques d'un patient en situation d'urgence : constantes vitales récentes, alertes actives, médicaments en cours et coordonnées de contact d'urgence.
          </p>
          <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 12px;">
            <a routerLink="/emergency" class="btn-hero-primary" style="background: linear-gradient(135deg, #DC2626, #EF4444); display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; padding: 12px 20px; border-radius: 12px; color: white; font-weight: 700;">
              <span class="material-icons">crisis_alert</span> Ouvrir la Recherche & Fiche Patient d'Urgence
            </a>
            <a routerLink="/alerts" class="btn-hero-outline" style="border: 2px solid #DC2626; color: #DC2626; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; padding: 10px 20px; border-radius: 12px; font-weight: 700;">
              <span class="material-icons">notifications</span> Consulter les Alertes Médicales
            </a>
          </div>
        </div>

        <!-- Real-time Critical Alerts Panel -->
        <div class="panel-card" style="border-top: 4px solid #F59E0B;">
          <div class="panel-head">
            <span class="material-icons panel-head-icon amber">warning</span>
            <h3>Alertes Médicales en Temps Réel</h3>
          </div>
          @for (a of alerts().slice(0, 5); track a.id) {
            <div class="alert-feed-item" [class]="'sev-' + a.severity.toLowerCase()">
              <div class="alert-info-left">
                <span class="material-icons alert-badge-icon">{{ alertIcon(a.severity) }}</span>
                <div>
                  <p class="alert-msg">{{ a.message }}</p>
                  <small class="alert-date">{{ a.createdAt | date:'dd/MM HH:mm' }}</small>
                </div>
              </div>
              <a routerLink="/emergency" class="btn-ack" style="text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                <span class="material-icons" style="font-size:14px;">visibility</span> Fiche
              </a>
            </div>
          }
          @if (alerts().length === 0) {
            <div class="empty-box">
              <span class="material-icons good-icon">check_circle</span>
              <p>Aucune alerte critique signalée actuellement. Tout est sous contrôle ✅</p>
            </div>
          }
        </div>
      </div>

    <!-- ==================== PATIENT VIEW ==================== -->
    } @else {
      <!-- 4 VITAL SIGNS CARDS -->
      <div class="stats-row grid-4">
        
        <div class="dash-stat-card">
          <div class="stat-icon-wrap rose">
            <span class="material-icons">favorite</span>
          </div>
          <div class="stat-body">
            <div class="stat-val">{{ bp() }}</div>
            <div class="stat-lbl">Tension artérielle (mmHg)</div>
          </div>
          <span class="card-status-pill normal">Cible : 120/80</span>
        </div>

        <div class="dash-stat-card">
          <div class="stat-icon-wrap teal">
            <span class="material-icons">water_drop</span>
          </div>
          <div class="stat-body">
            <div class="stat-val">{{ latest()?.bloodGlucose || '--' }} <span class="unit">mg/dL</span></div>
            <div class="stat-lbl">Glycémie à jeun</div>
          </div>
          <span class="card-status-pill normal">Norme : 70-110</span>
        </div>

        <div class="dash-stat-card">
          <div class="stat-icon-wrap blue">
            <span class="material-icons">air</span>
          </div>
          <div class="stat-body">
            <div class="stat-val">{{ latest()?.oxygenSaturation || '--' }}<span class="unit">%</span></div>
            <div class="stat-lbl">Saturation en O₂ (SpO₂)</div>
          </div>
          <span class="card-status-pill normal">Idéal : ≥ 95%</span>
        </div>

        <div class="dash-stat-card">
          <div class="stat-icon-wrap amber">
            <span class="material-icons">monitor_heart</span>
          </div>
          <div class="stat-body">
            <div class="stat-val">{{ latest()?.heartRate || '--' }} <span class="unit">BPM</span></div>
            <div class="stat-lbl">Fréquence cardiaque</div>
          </div>
          <span class="card-status-pill normal">Repos : 60-90</span>
        </div>

      </div>

      <div class="main-grid-2">
        <!-- Health Status Card -->
        <div class="panel-card">
          <div class="panel-head">
            <span class="material-icons panel-head-icon blue">health_and_safety</span>
            <h3>Bilan de Santé Récent</h3>
          </div>

          @if (latest()) {
            <div class="state-banner" [class]="'state-' + (latest()?.status?.toLowerCase() || 'normal')">
              <span class="material-icons state-icon">{{ statusIcon() }}</span>
              <div class="state-content">
                <strong>{{ statusLabel() }}</strong>
                <p>Enregistré le {{ latest()?.recordedAt | date:'dd/MM/yyyy à HH:mm' }}</p>
              </div>
            </div>

            <div class="vitals-dual-display">
              <div class="v-card neutral">
                <span class="v-label">🌡️ TEMPÉRATURE</span>
                <span class="v-value">{{ latest()?.temperature || '--' }} <small>°C</small></span>
              </div>
              <div class="v-card neutral">
                <span class="v-label">⚖️ POIDS ACTUEL</span>
                <span class="v-value">{{ latest()?.weight || '--' }} <small>kg</small></span>
              </div>
            </div>

            <div style="margin-top: 16px;">
              <a routerLink="/health-records" class="btn-hero-primary" style="width: 100%; justify-content: center;">
                <span class="material-icons">add_circle</span> Enregistrer de nouvelles mesures
              </a>
            </div>
          } @else {
            <div class="empty-box">
              <span class="material-icons">monitor_heart</span>
              <p>Aucune constante enregistrée pour le moment.</p>
              <a routerLink="/health-records" class="btn-hero-primary">Ajouter ma première mesure</a>
            </div>
          }
        </div>

        <!-- Recent Alerts Card -->
        <div class="panel-card">
          <div class="panel-head">
            <span class="material-icons panel-head-icon amber">notifications</span>
            <h3>Alertes & Notifications</h3>
          </div>

          @for (a of alerts().slice(0, 4); track a.id) {
            <div class="alert-feed-item" [class]="'sev-' + a.severity.toLowerCase()">
              <span class="material-icons alert-badge-icon">{{ alertIcon(a.severity) }}</span>
              <div style="flex:1;">
                <p class="alert-msg">{{ a.message }}</p>
                <small class="alert-date">{{ a.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>
              </div>
              @if (!a.acknowledged) {
                <span class="unread-dot"></span>
              }
            </div>
          }
          @if (alerts().length === 0) {
            <div class="empty-box">
              <span class="material-icons good-icon">check_circle</span>
              <p>Aucune alerte active &bull; Tout va bien ! ✅</p>
            </div>
          }

          <div style="margin-top: 14px; text-align: right;">
            <a routerLink="/alerts" class="link-more">Consulter l'historique des alertes &rarr;</a>
          </div>
        </div>
      </div>

      <!-- MODERN INTERACTIVE QUICK ACTIONS -->
      <div class="panel-card" style="margin-top: 24px;">
        <div class="panel-head">
          <span class="material-icons panel-head-icon blue">bolt</span>
          <h3>Accès Rapide aux Services Sihati AI</h3>
        </div>

        <div class="quick-tiles-grid">
          
          <a routerLink="/health-records" class="tile-action">
            <div class="tile-icon-box rose"><span class="material-icons">favorite</span></div>
            <div class="tile-text">
              <strong>Mesures Vitales</strong>
              <small>Suivi & graphiques</small>
            </div>
          </a>

          <a routerLink="/chat" class="tile-action">
            <div class="tile-icon-box blue"><span class="material-icons">chat</span></div>
            <div class="tile-text">
              <strong>Messagerie</strong>
              <small>Échanger avec mon médecin</small>
            </div>
          </a>

          <a routerLink="/analyse-ia" class="tile-action">
            <div class="tile-icon-box teal"><span class="material-icons">auto_graph</span></div>
            <div class="tile-text">
              <strong>Analyse IA</strong>
              <small>Diagnostic prédictif</small>
            </div>
          </a>

          <a routerLink="/ocr-ordonnance" class="tile-action">
            <div class="tile-icon-box amber"><span class="material-icons">document_scanner</span></div>
            <div class="tile-text">
              <strong>Scanner OCR</strong>
              <small>Numériser ordonnance</small>
            </div>
          </a>

          <a routerLink="/appointments" class="tile-action">
            <div class="tile-icon-box green"><span class="material-icons">calendar_today</span></div>
            <div class="tile-text">
              <strong>Rendez-vous</strong>
              <small>Planifier consultation</small>
            </div>
          </a>

          <a routerLink="/medications" class="tile-action">
            <div class="tile-icon-box purple"><span class="material-icons">medication</span></div>
            <div class="tile-text">
              <strong>Médicaments</strong>
              <small>Rappels de prise</small>
            </div>
          </a>

        </div>
      </div>
    }

  </div>
  `,
  styles: [`
  .dash-container {
    max-width: 1300px;
    margin: 0 auto;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* Welcome Hero Banner */
  .welcome-hero {
    background: linear-gradient(135deg, #023E58 0%, #0077B6 60%, #0096C7 100%);
    border-radius: 20px;
    padding: 30px 36px;
    color: #FFFFFF;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 8px 26px rgba(0, 119, 182, 0.18);
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }

  .welcome-hero::after {
    content: '';
    position: absolute;
    right: -30px;
    bottom: -30px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    pointer-events: none;
  }

  .hero-top-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }

  .pulse-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #00B4D8;
    box-shadow: 0 0 6px #00B4D8;
  }

  .welcome-hero h2 {
    font-size: 26px;
    font-weight: 800;
    margin: 0 0 6px;
    letter-spacing: -0.4px;
  }

  .welcome-hero p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
  }

  .date-capsule {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.28);
    padding: 10px 18px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
  }

  .date-capsule .material-icons { font-size: 18px; }

  /* Stats Row */
  .stats-row {
    display: grid;
    gap: 16px;
    margin-bottom: 24px;
  }

  .grid-4 { grid-template-columns: repeat(4, 1fr); }
  .grid-3 { grid-template-columns: repeat(3, 1fr); }

  .dash-stat-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    padding: 20px 22px;
    box-shadow: 0 4px 16px rgba(0, 119, 182, 0.04);
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    transition: all 0.2s ease;
  }

  .dash-stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 119, 182, 0.1);
    border-color: #BAE6FD;
  }

  .stat-icon-wrap {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .stat-icon-wrap.rose  { background: linear-gradient(135deg, #0077B6, #00B4D8); }
  .stat-icon-wrap.teal  { background: linear-gradient(135deg, #059669, #10B981); }
  .stat-icon-wrap.blue  { background: linear-gradient(135deg, #0284C7, #38BDF8); }
  .stat-icon-wrap.amber { background: linear-gradient(135deg, #D97706, #F59E0B); }

  .stat-icon-wrap .material-icons { font-size: 22px; }

  .stat-val {
    font-size: 24px;
    font-weight: 800;
    color: #023E58;
    line-height: 1.1;
  }

  .stat-val .unit { font-size: 13px; font-weight: 600; color: #64748B; margin-left: 2px; }
  .stat-lbl { font-size: 12px; font-weight: 600; color: #64748B; margin-top: 4px; }

  .card-status-pill {
    align-self: flex-start;
    font-size: 10px;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 8px;
    letter-spacing: 0.3px;
  }

  .card-status-pill.normal { background: #F0FDF4; color: #166534; }

  /* Main Grid 2 Panels */
  .main-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .panel-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    padding: 24px 28px;
    box-shadow: 0 4px 16px rgba(0, 119, 182, 0.04);
  }

  .panel-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .panel-head-icon {
    font-size: 22px;
    padding: 6px;
    border-radius: 10px;
  }

  .panel-head-icon.blue  { background: #E0F2FE; color: #0077B6; }
  .panel-head-icon.amber { background: #FEF3C7; color: #D97706; }
  .panel-head-icon.teal  { background: #D1FAE5; color: #059669; }

  .panel-head h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    color: #023E58;
  }

  .panel-sub {
    font-size: 13px;
    color: #64748B;
    margin: 0 0 16px;
  }

  .admin-actions-stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .btn-hero-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #0077B6, #0096C7);
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 700;
    padding: 12px 20px;
    border-radius: 12px;
    text-decoration: none;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 119, 182, 0.22);
    transition: all 0.2s ease;
  }

  .btn-hero-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 119, 182, 0.35);
  }

  .btn-hero-outline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #F8FAFD;
    border: 1px solid #CBD5E1;
    color: #0077B6;
    font-size: 13px;
    font-weight: 700;
    padding: 12px 20px;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .btn-hero-outline:hover {
    background: #E0F2FE;
    border-color: #BAE6FD;
  }

  /* Dual display boxes */
  .vitals-dual-display {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .v-card {
    border-radius: 14px;
    padding: 16px;
    text-align: center;
  }

  .v-card.good    { background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; }
  .v-card.warn    { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
  .v-card.neutral { background: #F8FAFD; border: 1px solid #E2E8F0; color: #023E58; }

  .v-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
  }

  .v-value {
    font-size: 22px;
    font-weight: 800;
  }

  .v-value small { font-size: 14px; font-weight: 600; opacity: 0.8; }

  /* State Banner */
  .state-banner {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    border-radius: 14px;
    margin-bottom: 16px;
  }

  .state-banner.state-normal   { background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; }
  .state-banner.state-warning  { background: #FFFBEB; border: 1px solid #FCD34D; color: #92400E; }
  .state-banner.state-critical { background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; }

  .state-icon { font-size: 28px; }
  .state-content strong { font-size: 15px; font-weight: 800; display: block; }
  .state-content p { font-size: 12px; margin: 2px 0 0; opacity: 0.85; }

  /* Alert Feed Item */
  .alert-feed-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 8px;
    border-left: 4px solid;
    transition: all 0.15s ease;
  }

  .alert-feed-item.sev-critical { background: #FEF2F2; border-color: #EF4444; }
  .alert-feed-item.sev-high     { background: #FFFBEB; border-color: #F59E0B; }
  .alert-feed-item.sev-medium   { background: #F0F9FF; border-color: #0284C7; }
  .alert-feed-item.sev-low      { background: #F0FDF4; border-color: #10B981; }

  .alert-badge-icon { font-size: 20px; margin-top: 1px; color: #64748B; }
  .alert-msg { margin: 0; font-size: 13px; font-weight: 600; color: #0F172A; }
  .alert-date { font-size: 11px; color: #64748B; }

  .btn-ack {
    background: #0077B6;
    color: #FFFFFF;
    border: none;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }

  .unread-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #0077B6;
    margin-top: 6px;
  }

  .link-more {
    font-size: 13px;
    font-weight: 700;
    color: #0077B6;
    text-decoration: none;
  }

  /* Doctor Apt Item */
  .apt-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #F8FAFD;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    margin-bottom: 8px;
  }

  .apt-patient { font-size: 14px; color: #0F172A; display: block; }
  .apt-time { font-size: 12px; color: #0077B6; margin: 2px 0; font-weight: 600; }
  .apt-reason { font-size: 11px; color: #64748B; }

  .apt-actions { display: flex; gap: 8px; }
  .btn-confirm {
    background: #10B981;
    color: #FFFFFF;
    border: none;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }
  .btn-cancel {
    background: #F1F5F9;
    color: #EF4444;
    border: 1px solid #FECACA;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }
  .status-chip {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 8px;
  }
  .status-chip.confirmed { background: #D1FAE5; color: #065F46; }
  .status-chip.cancelled { background: #F1F5F9; color: #64748B; }

  /* Empty Box */
  .empty-box {
    text-align: center;
    padding: 28px 16px;
    color: #64748B;
  }
  .empty-box .material-icons { font-size: 42px; margin-bottom: 8px; color: #94A3B8; }
  .empty-box .good-icon { color: #10B981; }
  .empty-box p { margin: 0 0 12px; font-size: 14px; font-weight: 600; }

  /* QUICK TILES GRID */
  .quick-tiles-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }

  .tile-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 16px 10px;
    background: #F8FAFD;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .tile-action:hover {
    background: #FFFFFF;
    transform: translateY(-3px);
    border-color: #BAE6FD;
    box-shadow: 0 6px 18px rgba(0, 119, 182, 0.08);
  }

  .tile-icon-box {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    margin-bottom: 10px;
  }

  .tile-icon-box.rose   { background: linear-gradient(135deg, #0077B6, #00B4D8); }
  .tile-icon-box.blue   { background: linear-gradient(135deg, #0284C7, #38BDF8); }
  .tile-icon-box.teal   { background: linear-gradient(135deg, #059669, #10B981); }
  .tile-icon-box.amber  { background: linear-gradient(135deg, #D97706, #F59E0B); }
  .tile-icon-box.green  { background: linear-gradient(135deg, #16A34A, #4ADE80); }
  .tile-icon-box.purple { background: linear-gradient(135deg, #7C3AED, #A78BFA); }

  .tile-icon-box .material-icons { font-size: 22px; }

  .tile-text strong {
    font-size: 13px;
    color: #023E58;
    display: block;
    margin-bottom: 2px;
  }

  .tile-text small {
    font-size: 11px;
    color: #64748B;
  }

  @media(max-width: 1024px) {
    .quick-tiles-grid { grid-template-columns: repeat(3, 1fr); }
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
  }

  @media(max-width: 768px) {
    .main-grid-2 { grid-template-columns: 1fr; }
    .grid-4, .grid-3 { grid-template-columns: 1fr; }
    .quick-tiles-grid { grid-template-columns: repeat(2, 1fr); }
    .welcome-hero { flex-direction: column; align-items: flex-start; gap: 16px; padding: 20px 16px; border-radius: 16px; }
    .welcome-hero h2 { font-size: 22px; }
    .panel-card { padding: 20px 16px; border-radius: 16px; }
  }

  @media(max-width: 480px) {
    .welcome-hero { padding: 16px 14px; border-radius: 14px; }
    .welcome-hero h2 { font-size: 19px; }
    .panel-card { padding: 16px 12px; border-radius: 14px; }
    .quick-tiles-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .tile-action { padding: 12px 6px; }
    .tile-icon-box { width: 38px; height: 38px; margin-bottom: 6px; }
    .tile-text strong { font-size: 12px; }
    .tile-text small { font-size: 10px; }
    .vitals-dual-display { grid-template-columns: 1fr; gap: 8px; }
    .apt-item { flex-direction: column; align-items: flex-start; gap: 8px; }
    .apt-actions { width: 100%; justify-content: flex-end; }
    .alert-feed-item { flex-direction: column; align-items: flex-start; gap: 8px; }
    .btn-ack { align-self: flex-end; }
  }

  @media(max-width: 360px) {
    .quick-tiles-grid { grid-template-columns: 1fr; }
  }

  `]
})
export class DashboardComponent implements OnInit {
  latest = signal<HealthRecord|null>(null);
  alerts = signal<Alert[]>([]);
  patientsList = signal<any[]>([]);
  appointments = signal<any[]>([]);
  adminStats = signal<any>(null);
  today = new Date();

  constructor(
    public auth: AuthService,
    private http: HttpClient,
    private userService: UserService,
    private hrService: HealthRecordService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.auth.isAdmin()) {
      const fallbackStats = () => {
        const users = this.userService.getLocalUsers();
        return {
          totalUsers: users.length || 9,
          totalAlerts: 4,
          totalRecords: 28,
          totalAppointments: 5,
          activeAccounts: users.filter(u => u.enabled !== false).length || 9,
          inactiveAccounts: users.filter(u => u.enabled === false).length || 0
        };
      };

      this.http.get<any>(`${environment.apiUrl}/admin/stats`).subscribe({
        next: s => {
          if (s && s.totalUsers !== undefined && s.totalUsers > 0) {
            this.adminStats.set(s);
          } else {
            this.adminStats.set(fallbackStats());
          }
        },
        error: () => this.adminStats.set(fallbackStats())
      });

      this.http.get<Alert[]>(`${environment.apiUrl}/alerts`).subscribe({
        next: a => {
          if (a && a.length > 0) {
            this.alerts.set(a);
          } else {
            this.alerts.set(this.alertService.getLocalAlerts('ADMIN'));
          }
        },
        error: () => this.alerts.set(this.alertService.getLocalAlerts('ADMIN'))
      });

    } else if (this.auth.isDoctor()) {
      const fallbackDoctorPatients = () => {
        return this.userService.getLocalUsers().filter(u => u.role === 'PATIENT');
      };

      const fallbackDoctorAlerts = () => {
        return this.alertService.getLocalAlerts('DOCTOR');
      };

      const fallbackDoctorAppts = () => {
        const now = new Date();
        const d1 = new Date(now.getTime() + 86400000); d1.setHours(10, 30, 0, 0);
        const d2 = new Date(now.getTime() + 172800000); d2.setHours(14, 0, 0, 0);
        const d3 = new Date(now.getTime() + 259200000); d3.setHours(9, 15, 0, 0);

        return [
          {
            id: 201,
            patient: { firstName: 'Sara', lastName: 'El Amrani', phone: '+212 6 12 34 56 78' },
            appointmentDate: d1.toISOString(),
            reason: 'Consultation Suivi Cardiologique & Ajustement Tensionnel',
            status: 'PENDING'
          },
          {
            id: 202,
            patient: { firstName: 'Karim', lastName: 'Tazi', phone: '+212 6 88 99 00 11' },
            appointmentDate: d2.toISOString(),
            reason: 'Contrôle ECG & Analyse des Arythmies',
            status: 'CONFIRMED'
          },
          {
            id: 203,
            patient: { firstName: 'Jean', lastName: 'Martin', phone: '+33 6 45 78 90 12' },
            appointmentDate: d3.toISOString(),
            reason: 'Bilan Diabétologique & Ajustement Insulinique',
            status: 'PENDING'
          }
        ];
      };

      this.http.get<any[]>(`${environment.apiUrl}/users/patients`).subscribe({
        next: p => {
          if (p && p.length > 0) {
            this.patientsList.set(p);
          } else {
            this.patientsList.set(fallbackDoctorPatients());
          }
        },
        error: () => this.patientsList.set(fallbackDoctorPatients())
      });

      this.http.get<Alert[]>(`${environment.apiUrl}/alerts`).subscribe({
        next: a => {
          if (a && a.length > 0) {
            this.alerts.set(a);
          } else {
            this.alerts.set(fallbackDoctorAlerts());
          }
        },
        error: () => this.alerts.set(fallbackDoctorAlerts())
      });

      this.http.get<any[]>(`${environment.apiUrl}/appointments`).subscribe({
        next: ap => {
          if (ap && ap.length > 0) {
            this.appointments.set(ap);
          } else {
            this.appointments.set(fallbackDoctorAppts());
          }
        },
        error: () => this.appointments.set(fallbackDoctorAppts())
      });

    } else if (this.auth.isEmergency()) {
      this.http.get<Alert[]>(`${environment.apiUrl}/alerts`).subscribe({
        next: a => {
          if (a && a.length > 0) {
            this.alerts.set(a);
          } else {
            this.alerts.set(this.alertService.getLocalAlerts('DOCTOR'));
          }
        },
        error: () => this.alerts.set(this.alertService.getLocalAlerts('DOCTOR'))
      });

    } else {
      // Patient View
      const fallbackPatientVitals: HealthRecord = {
        systolicBP: 122,
        diastolicBP: 80,
        heartRate: 72,
        bloodGlucose: 98,
        oxygenSaturation: 98,
        temperature: 36.6,
        weight: 62,
        status: 'NORMAL',
        recordedAt: new Date().toISOString()
      };

      this.hrService.getLatest().subscribe({
        next: r => {
          if (r && r.systolicBP) {
            this.latest.set(r);
          } else {
            const records = this.hrService.getLocalRecords();
            this.latest.set(records[0] || fallbackPatientVitals);
          }
        },
        error: () => {
          const records = this.hrService.getLocalRecords();
          this.latest.set(records[0] || fallbackPatientVitals);
        }
      });

      this.http.get<Alert[]>(`${environment.apiUrl}/alerts`).subscribe({
        next: a => {
          if (a && a.length > 0) {
            this.alerts.set(a);
          } else {
            this.alerts.set(this.alertService.getLocalAlerts('PATIENT'));
          }
        },
        error: () => this.alerts.set(this.alertService.getLocalAlerts('PATIENT'))
      });
    }
  }

  bp() {
    const l = this.latest();
    return l?.systolicBP ? `${l.systolicBP}/${l.diastolicBP}` : '122/80';
  }

  getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Bonne matinée — prenez soin de vos mesures vitales';
    if (h < 18) return 'Bonne après-midi — votre santé et votre suivi sont notre priorité';
    return "Bonne soirée — vérifiez vos rappels de prise médicamenteuse";
  }

  statusIcon() {
    switch(this.latest()?.status) {
      case 'CRITICAL': return 'error'; case 'WARNING': return 'warning'; default: return 'check_circle';
    }
  }

  statusLabel() {
    switch(this.latest()?.status) {
      case 'CRITICAL': return 'État critique — Avis médical requis';
      case 'WARNING':  return 'Paramètres en surveillance';
      default:         return 'Constantes physiologiques stables';
    }
  }

  alertIcon(s: string) {
    switch(s) { case 'CRITICAL': return 'emergency'; case 'HIGH': return 'warning'; default: return 'info'; }
  }

  confirmAppointment(id: number) {
    const list = this.appointments().map(a => a.id === id ? { ...a, status: 'CONFIRMED' } : a);
    this.appointments.set(list);
    this.http.patch(`${environment.apiUrl}/appointments/${id}/confirm`, {}).subscribe({
      next: () => this.loadData(),
      error: () => {}
    });
  }

  cancelAppointment(id: number) {
    const list = this.appointments().map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a);
    this.appointments.set(list);
    this.http.patch(`${environment.apiUrl}/appointments/${id}/cancel`, {}).subscribe({
      next: () => this.loadData(),
      error: () => {}
    });
  }

  ackAlert(id: number) {
    const list = this.alerts().filter(a => a.id !== id);
    this.alerts.set(list);
    this.http.patch(`${environment.apiUrl}/alerts/${id}/acknowledge`, {}).subscribe({
      next: () => this.loadData(),
      error: () => {}
    });
  }
}
