import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { HealthRecordService } from '../../core/services/health-record.service';
import { User } from '../../core/models/user.model';
import { HealthRecord } from '../../core/models/health-record.model';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatPaginatorModule
  ],
  template: `
  <div class="page-container">
    <h1 class="page-title">👥 Gestion des Patients</h1>

    <div class="grid-2">
      <!-- Patients List Card -->
      <div class="card">
        <h3 class="section-title"><span class="material-icons">people</span> Liste des Patients</h3>
        @if (patients().length > 0) {
          <div class="table-wrapper">
            <table mat-table [dataSource]="patients()" class="patients-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let p" class="clickable-cell" (click)="selectPatient(p)">
                  <strong>{{p.firstName}} {{p.lastName}}</strong>
                </td>
              </ng-container>
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                <td mat-cell *matCellDef="let p">{{p.phone || '--'}}</td>
              </ng-container>
              <ng-container matColumnDef="diseases">
                <th mat-header-cell *matHeaderCellDef>Maladies</th>
                <td mat-cell *matCellDef="let p">
                  @if (p.chronicDiseases) {
                    <span class="disease-tag">{{p.chronicDiseases}}</span>
                  } @else {
                    <span>--</span>
                  }
                </td>
              </ng-container>
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let p">
                  <button mat-icon-button color="primary" (click)="selectPatient(p)" title="Voir l'historique">
                    <mat-icon>analytics</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>
        } @else {
          <div class="empty-state">
            <span class="material-icons">people_outline</span>
            <p>Aucun patient actif affecté.</p>
          </div>
        }
      </div>

      <!-- Patient Health History Details -->
      <div class="card">
        @if (selectedPatient()) {
          <div class="patient-details-header">
            <div class="avatar">{{selectedPatient()?.firstName?.substring(0, 1)}}{{selectedPatient()?.lastName?.substring(0, 1)}}</div>
            <div>
              <h3>{{selectedPatient()?.firstName}} {{selectedPatient()?.lastName}}</h3>
              <p style="margin:0; font-size:13px; color:#757575;">{{selectedPatient()?.email}} | {{selectedPatient()?.phone || 'Pas de téléphone'}}</p>
            </div>
          </div>
          <mat-divider style="margin: 16px 0;"></mat-divider>
          
          <div class="info-badges" style="display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap;">
            <div class="info-badge"><label>Groupe sanguin</label><span>{{selectedPatient()?.bloodType || '--'}}</span></div>
            <div class="info-badge"><label>Taille</label><span>{{selectedPatient()?.height ? selectedPatient()?.height + ' cm' : '--'}}</span></div>
            <div class="info-badge"><label>Poids</label><span>{{selectedPatient()?.weight ? selectedPatient()?.weight + ' kg' : '--'}}</span></div>
          </div>

          <h3 class="section-title"><span class="material-icons">history</span> Historique des Constantes</h3>
          
          @if (records().length > 0) {
            <div class="table-wrapper">
              <table mat-table [dataSource]="records()" class="records-table">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let r">{{r.recordedAt | date:'dd/MM/yyyy HH:mm'}}</td>
                </ng-container>
                <ng-container matColumnDef="bp">
                  <th mat-header-cell *matHeaderCellDef>Tension</th>
                  <td mat-cell *matCellDef="let r">{{r.systolicBP || '--'}}/{{r.diastolicBP || '--'}} mmHg</td>
                </ng-container>
                <ng-container matColumnDef="hr">
                  <th mat-header-cell *matHeaderCellDef>FC</th>
                  <td mat-cell *matCellDef="let r">{{r.heartRate || '--'}} bpm</td>
                </ng-container>
                <ng-container matColumnDef="temp">
                  <th mat-header-cell *matHeaderCellDef>Temp</th>
                  <td mat-cell *matCellDef="let r">{{r.temperature || '--'}} °C</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let r">
                    <span class="badge" [class]="r.status?.toLowerCase()">{{r.status}}</span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="recordColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: recordColumns"></tr>
              </table>
            </div>
            <mat-paginator [length]="totalRecords()" [pageSize]="10" (page)="onPageChange($event)"></mat-paginator>

            <!-- Trend Charts for Patient with Moving Telemetry -->
            <div style="margin-top:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 class="section-title" style="margin:0;"><span class="material-icons">show_chart</span> Tendances Évolutives (Temps Réel)</h3>
                <span class="live-telemetry-badge">
                  <span class="live-dot-pulse"></span>
                  SURVEILLANCE ACTIVE
                </span>
              </div>

              @if (records().length > 1) {
                <div class="trend-grid">
                  @for (type of ['bp', 'glucose', 'hr']; track type) {
                    <div class="trend-chart-card">
                      <div class="chart-header">
                        <div class="chart-title-area">
                          <div class="chart-icon" [style.background]="getIconBg(type)">
                            <span class="material-icons" [style.color]="getColor(type)">{{getIcon(type)}}</span>
                          </div>
                          <div>
                            <h4 class="chart-label">{{getTitle(type)}}</h4>
                            <span class="chart-metric-stat">Min: {{getMin(type)}} &bull; Moy: {{getAvg(type)}} &bull; Max: {{getMax(type)}} {{getUnit(type)}}</span>
                          </div>
                        </div>
                        <div class="chart-live-badge">
                          <span class="trend-indicator" [class]="getTrend(type)">
                            {{getTrendArrow(type)}} {{getLatestVal(type)}} <small>{{getUnit(type)}}</small>
                          </span>
                        </div>
                      </div>

                      <div class="svg-chart-container">
                        <svg viewBox="0 0 500 150" class="telemetry-svg" preserveAspectRatio="none">
                          <defs>
                            <!-- Area Gradient -->
                            <linearGradient [id]="'p-grad-area-' + type" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" [attr.stop-color]="getColor(type)" stop-opacity="0.35"/>
                              <stop offset="70%" [attr.stop-color]="getColor(type)" stop-opacity="0.08"/>
                              <stop offset="100%" [attr.stop-color]="getColor(type)" stop-opacity="0.00"/>
                            </linearGradient>

                            <!-- Scanner Laser Gradient -->
                            <linearGradient [id]="'p-grad-scan-' + type" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" [attr.stop-color]="getColor(type)" stop-opacity="0"/>
                              <stop offset="50%" [attr.stop-color]="getColor(type)" stop-opacity="0.5"/>
                              <stop offset="90%" stop-color="#ffffff" stop-opacity="0.95"/>
                              <stop offset="100%" [attr.stop-color]="getColor(type)" stop-opacity="0"/>
                            </linearGradient>

                            <!-- Glow Filter -->
                            <filter [id]="'p-glow-' + type" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3" result="blur"/>
                              <feMerge>
                                <feMergeNode in="blur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>

                          <!-- Grid Guidelines -->
                          <line x1="30" y1="30" x2="470" y2="30" stroke="rgba(203, 213, 225, 0.45)" stroke-dasharray="4 4" stroke-width="1" />
                          <line x1="30" y1="75" x2="470" y2="75" stroke="rgba(203, 213, 225, 0.45)" stroke-dasharray="4 4" stroke-width="1" />
                          <line x1="30" y1="120" x2="470" y2="120" stroke="rgba(203, 213, 225, 0.45)" stroke-dasharray="4 4" stroke-width="1" />

                          <!-- Translucent Breathing Area Shimmer -->
                          <path [attr.d]="getAreaPath(type)" [attr.fill]="'url(#p-grad-area-' + type + ')'" class="chart-area-fill" />

                          <!-- Base Crisp Line -->
                          <polyline [attr.points]="getChartPath(type)" fill="none" [attr.stroke]="getColor(type)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

                          <!-- Continuous Flowing Neon Pulse Wave (kayt7arko) -->
                          <polyline [attr.points]="getChartPath(type)" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="chart-pulse-flow" [attr.filter]="'url(#p-glow-' + type + ')'" />

                          <!-- Sweeping Laser Telemetry Beam (kayt7arko) -->
                          <rect class="scanner-sweep" x="0" y="10" width="28" height="130" [attr.fill]="'url(#p-grad-scan-' + type + ')'" />

                          <!-- Data Points and Animated Radar Beacons -->
                          @for (pt of getChartPoints(type); track pt.index) {
                            <g class="chart-point-marker">
                              @if (pt.isLatest) {
                                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="5" [attr.stroke]="getColor(type)" fill="none" class="radar-ripple" />
                                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="5" [attr.stroke]="getColor(type)" fill="none" class="radar-ripple delayed" />
                                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="6" [attr.fill]="getColor(type)" class="radar-center" />
                                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="2.5" fill="#ffffff" />
                              } @else {
                                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" fill="#ffffff" [attr.stroke]="getColor(type)" stroke-width="2.5" class="chart-point-dot" />
                              }
                              <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="14" fill="transparent" class="hover-target">
                                <title>{{pt.val}} {{getUnit(type)}} - {{pt.date}}</title>
                              </circle>
                            </g>
                          }
                        </svg>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p style="font-size:12px; color:var(--text-muted);">Enregistrez au moins 2 mesures pour afficher les graphiques.</p>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span class="material-icons">show_chart</span>
              <p>Aucune mesure enregistrée pour ce patient.</p>
            </div>
          }
        } @else {
          <div class="empty-state" style="padding: 60px 0;">
            <span class="material-icons" style="font-size: 64px;">analytics</span>
            <h3>Détails du Patient</h3>
            <p>Sélectionnez un patient dans la liste pour voir ses constantes de santé.</p>
          </div>
        }
      </div>
    </div>
  </div>
  `,
  styles: [`
    .table-wrapper { overflow-x: auto; margin-top: 8px; }
    table { width: 100%; }
    .mat-mdc-header-cell { font-weight: 600; color: #1a237e; background: #f5f7fa; }
    .clickable-cell { cursor: pointer; color: #1976d2; }
    .clickable-cell:hover { text-decoration: underline; }
    .disease-tag { background: #efebe9; color: #5d4037; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
    .patient-details-header { display: flex; align-items: center; gap: 16px; }
    .avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg,#1976d2,#26c6da); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; color: white; }
    .info-badge { background: #f5f7fa; border-radius: 8px; padding: 8px 16px; text-align: center; flex: 1; min-width: 100px; }
    .info-badge label { display: block; font-size: 10px; color: #757575; margin-bottom: 2px; }
    .info-badge span { font-size: 14px; font-weight: 600; color: #1a237e; }

    /* Animated Telemetry Styles (Kayt7arko) */
    .live-telemetry-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ECFDF5;
      color: #065F46;
      border: 1px solid #A7F3D0;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .live-dot-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: livePulse 1.8s infinite;
    }
    @keyframes livePulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 7px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .trend-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 12px;
    }
    @media (max-width: 900px) {
      .trend-grid { grid-template-columns: 1fr; }
    }
    .trend-chart-card {
      background: #ffffff;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 14px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
      position: relative;
      overflow: hidden;
      transition: all 0.25s ease;
    }
    .trend-chart-card:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .chart-title-area {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .chart-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chart-icon .material-icons {
      font-size: 18px;
    }
    .chart-label {
      margin: 0;
      font-size: 12.5px;
      font-weight: 700;
      color: #1E293B;
    }
    .chart-metric-stat {
      font-size: 10.5px;
      color: #64748B;
      display: block;
    }
    .chart-live-badge {
      display: flex;
      align-items: center;
    }
    .trend-indicator {
      font-size: 12px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      background: #F1F5F9;
    }
    .trend-indicator.up { color: #DC2626; background: #FEF2F2; }
    .trend-indicator.down { color: #2563EB; background: #EFF6FF; }
    .trend-indicator.stable { color: #059669; background: #ECFDF5; }

    .svg-chart-container {
      width: 100%;
      position: relative;
      overflow: visible;
    }
    .telemetry-svg {
      width: 100%;
      height: 100px;
      overflow: visible;
    }

    /* Animated Motion Keyframes (Kayt7arko) */
    .chart-pulse-flow {
      stroke-dasharray: 45 200;
      animation: wavePulseMove 2.4s linear infinite;
      opacity: 0.95;
      pointer-events: none;
    }
    @keyframes wavePulseMove {
      from { stroke-dashoffset: 500; }
      to { stroke-dashoffset: 0; }
    }

    .chart-area-fill {
      animation: areaBreathe 3.5s ease-in-out infinite alternate;
    }
    @keyframes areaBreathe {
      0% { opacity: 0.55; }
      100% { opacity: 0.9; }
    }

    .scanner-sweep {
      animation: laserSweep 4s ease-in-out infinite alternate;
      pointer-events: none;
    }
    @keyframes laserSweep {
      0% { transform: translateX(20px); opacity: 0.15; }
      50% { opacity: 0.8; }
      100% { transform: translateX(450px); opacity: 0.15; }
    }

    .radar-ripple {
      animation: rippleExpand 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
      pointer-events: none;
    }
    .radar-ripple.delayed {
      animation-delay: 0.9s;
    }
    @keyframes rippleExpand {
      0% { r: 5px; opacity: 1; stroke-width: 2.5px; }
      100% { r: 22px; opacity: 0; stroke-width: 0.5px; }
    }

    .radar-center {
      animation: beaconFlash 1.2s ease-in-out infinite alternate;
    }
    @keyframes beaconFlash {
      0% { transform: scale(0.9); opacity: 0.9; }
      100% { transform: scale(1.2); opacity: 1; }
    }

    .chart-point-marker:hover .chart-point-dot {
      transform: scale(1.35);
      stroke-width: 3.5px;
    }
    .hover-target {
      cursor: pointer;
    }
  `]
})
export class PatientsComponent implements OnInit {
  patients = signal<User[]>([]);
  selectedPatient = signal<User | null>(null);
  records = signal<HealthRecord[]>([]);
  totalRecords = signal(0);
  currentPage = 0;

  displayedColumns = ['name', 'phone', 'diseases', 'action'];
  recordColumns = ['date', 'bp', 'hr', 'temp', 'status'];

  mockPatients: User[] = [
    {
      id: 1,
      firstName: 'Sara',
      lastName: 'El Amrani',
      email: 'patient@healthtrack.ai',
      phone: '+212 6 12 34 56 78',
      role: 'PATIENT' as any,
      enabled: true,
      bloodType: 'A+',
      height: 165,
      weight: 62,
      chronicDiseases: 'Hypertension artérielle modérée',
      allergies: 'Pénicilline'
    },
    {
      id: 6,
      firstName: 'Jean',
      lastName: 'Martin',
      email: 'jean.martin@gmail.com',
      phone: '+33 6 45 78 90 12',
      role: 'PATIENT' as any,
      enabled: true,
      bloodType: 'O-',
      height: 180,
      weight: 75,
      chronicDiseases: 'Diabète Type 2 sous insuline',
      allergies: 'Sulfamides'
    },
    {
      id: 9,
      firstName: 'Karim',
      lastName: 'Tazi',
      email: 'karim.tazi@gmail.com',
      phone: '+212 6 88 99 00 11',
      role: 'PATIENT' as any,
      enabled: true,
      bloodType: 'B+',
      height: 174,
      weight: 69,
      chronicDiseases: 'Arythmie sinusale & Tachycardie',
      allergies: 'Aucune'
    }
  ];

  mockRecords: Record<number, HealthRecord[]> = {
    1: [
      { id: 105, systolicBP: 125, diastolicBP: 82, heartRate: 74, bloodGlucose: 98, oxygenSaturation: 98, temperature: 36.5, status: 'NORMAL' as any, notes: 'Constantes équilibrées', recordedAt: '2026-06-06T10:30:00' },
      { id: 104, systolicBP: 138, diastolicBP: 86, heartRate: 78, bloodGlucose: 104, oxygenSaturation: 97, temperature: 36.7, status: 'NORMAL' as any, notes: 'Contrôle matinal', recordedAt: '2026-06-06T08:00:00' },
      { id: 103, systolicBP: 142, diastolicBP: 88, heartRate: 80, bloodGlucose: 110, oxygenSaturation: 97, temperature: 36.8, status: 'WARNING' as any, notes: 'Légère fatigue', recordedAt: '2026-06-05T18:15:00' },
      { id: 102, systolicBP: 130, diastolicBP: 84, heartRate: 75, bloodGlucose: 105, oxygenSaturation: 97, temperature: 36.7, status: 'NORMAL' as any, notes: 'Après déjeuner', recordedAt: '2026-06-05T12:30:00' },
      { id: 101, systolicBP: 120, diastolicBP: 80, heartRate: 72, bloodGlucose: 95, oxygenSaturation: 98, temperature: 36.6, status: 'NORMAL' as any, notes: 'À jeun', recordedAt: '2026-06-05T08:00:00' }
    ],
    3: [
      { id: 105, systolicBP: 125, diastolicBP: 82, heartRate: 74, bloodGlucose: 98, oxygenSaturation: 98, temperature: 36.5, status: 'NORMAL' as any, notes: 'RAS', recordedAt: '2026-06-06T10:30:00' }
    ],
    6: [
      { id: 204, systolicBP: 122, diastolicBP: 80, heartRate: 72, bloodGlucose: 135, oxygenSaturation: 99, temperature: 36.6, status: 'NORMAL' as any, notes: 'Stabilité observée', recordedAt: '2026-06-06T18:00:00' },
      { id: 203, systolicBP: 125, diastolicBP: 82, heartRate: 75, bloodGlucose: 160, oxygenSaturation: 98, temperature: 36.8, status: 'WARNING' as any, notes: 'Après repas copieux', recordedAt: '2026-06-06T13:00:00' },
      { id: 202, systolicBP: 118, diastolicBP: 76, heartRate: 68, bloodGlucose: 145, oxygenSaturation: 99, temperature: 36.5, status: 'WARNING' as any, notes: 'Glycémie post-prandiale élevée', recordedAt: '2026-06-06T12:00:00' },
      { id: 201, systolicBP: 120, diastolicBP: 78, heartRate: 70, bloodGlucose: 98, oxygenSaturation: 98, temperature: 36.7, status: 'NORMAL' as any, notes: 'À jeun', recordedAt: '2026-06-06T08:00:00' }
    ],
    4: [
      { id: 204, systolicBP: 122, diastolicBP: 80, heartRate: 72, bloodGlucose: 135, oxygenSaturation: 99, temperature: 36.6, status: 'NORMAL' as any, notes: 'Stabilité observée', recordedAt: '2026-06-06T18:00:00' }
    ],
    9: [
      { id: 304, systolicBP: 128, diastolicBP: 82, heartRate: 88, bloodGlucose: 102, oxygenSaturation: 98, temperature: 36.6, status: 'NORMAL' as any, notes: 'Rythme sinusal régularisé', recordedAt: '2026-06-06T19:00:00' },
      { id: 303, systolicBP: 135, diastolicBP: 85, heartRate: 98, bloodGlucose: 108, oxygenSaturation: 97, temperature: 36.8, status: 'WARNING' as any, notes: 'Palpitations modérées après effort', recordedAt: '2026-06-06T14:30:00' },
      { id: 302, systolicBP: 124, diastolicBP: 80, heartRate: 76, bloodGlucose: 99, oxygenSaturation: 98, temperature: 36.6, status: 'NORMAL' as any, notes: 'Repos post-consultation', recordedAt: '2026-06-05T17:00:00' },
      { id: 301, systolicBP: 122, diastolicBP: 78, heartRate: 74, bloodGlucose: 96, oxygenSaturation: 99, temperature: 36.5, status: 'NORMAL' as any, notes: 'Bilan matinal', recordedAt: '2026-06-05T08:30:00' }
    ]
  };

  constructor(private userService: UserService, private hrService: HealthRecordService) {}

  ngOnInit() {
    this.userService.getPatients().subscribe({
      next: data => {
        if (data && data.length > 0) {
          this.patients.set(data);
          this.selectPatient(data[0]);
        } else {
          this.patients.set(this.mockPatients);
          this.selectPatient(this.mockPatients[0]);
        }
      },
      error: () => {
        this.patients.set(this.mockPatients);
        this.selectPatient(this.mockPatients[0]);
      }
    });
  }

  selectPatient(patient: User) {
    this.selectedPatient.set(patient);
    this.currentPage = 0;
    this.loadRecords(patient.id);
  }

  loadRecords(patientId: number) {
    this.hrService.getPatientRecords(patientId, this.currentPage, 10).subscribe({
      next: res => {
        if (res && res.content && res.content.length > 0) {
          this.records.set(res.content);
          this.totalRecords.set(res.totalElements);
        } else {
          const mock = this.mockRecords[patientId] || [];
          this.records.set(mock);
          this.totalRecords.set(mock.length);
        }
      },
      error: () => {
        const mock = this.mockRecords[patientId] || [];
        this.records.set(mock);
        this.totalRecords.set(mock.length);
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    const p = this.selectedPatient();
    if (p) this.loadRecords(p.id);
  }

  getChartData(type: string) {
    const rawData = this.records();
    const data = rawData && rawData.length > 0 ? [...rawData].slice(0, 10).reverse() : [];
    
    let values: number[] = [];
    if (type === 'bp') {
      values = data.length >= 2 ? data.map(r => r.systolicBP || 120) : [120, 125, 130, 142, 138, 125];
    } else if (type === 'glucose') {
      values = data.length >= 2 ? data.map(r => r.bloodGlucose || 100) : [95, 105, 110, 104, 98];
    } else if (type === 'hr') {
      values = data.length >= 2 ? data.map(r => r.heartRate || 72) : [72, 75, 80, 78, 74];
    }

    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const range = (maxVal - minVal) || 10;
    const avgVal = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const latestVal = values[values.length - 1];
    const prevVal = values.length > 1 ? values[values.length - 2] : latestVal;
    const trendDiff = Math.round((latestVal - prevVal) * 10) / 10;
    const trend: 'up' | 'down' | 'stable' = trendDiff > 0 ? 'up' : trendDiff < 0 ? 'down' : 'stable';

    const padLeft = 35;
    const padRight = 35;
    const padTop = 25;
    const padBottom = 25;
    const width = 500 - padLeft - padRight;
    const height = 150 - padTop - padBottom;

    const coords = values.map((val, index) => {
      const x = Math.round((padLeft + (index / (values.length - 1)) * width) * 10) / 10;
      const y = Math.round((padTop + (1 - (val - minVal) / range) * height) * 10) / 10;
      const dateStr = (data.length >= 2 && data[index]?.recordedAt)
        ? new Date(data[index].recordedAt!).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : `T-${values.length - 1 - index}h`;
      return {
        x,
        y,
        val,
        date: dateStr,
        isLatest: index === values.length - 1,
        index
      };
    });

    const pointsStr = coords.map(c => c.x + ',' + c.y).join(' ');
    const first = coords[0];
    const last = coords[coords.length - 1];
    const baseY = 150 - padBottom;
    const areaPath = 'M ' + first.x + ',' + baseY + ' L ' + pointsStr.replace(/ /g, ' L ') + ' L ' + last.x + ',' + baseY + ' Z';

    return {
      points: pointsStr,
      areaPath,
      pointsList: coords,
      latestVal,
      minVal,
      maxVal,
      avgVal,
      trend,
      trendDiff
    };
  }

  getChartPath(type: string): string {
    return this.getChartData(type).points;
  }
  getAreaPath(type: string): string {
    return this.getChartData(type).areaPath;
  }
  getChartPoints(type: string) {
    return this.getChartData(type).pointsList;
  }
  getLatestVal(type: string): number {
    return this.getChartData(type).latestVal;
  }
  getMin(type: string): number {
    return this.getChartData(type).minVal;
  }
  getMax(type: string): number {
    return this.getChartData(type).maxVal;
  }
  getAvg(type: string): number {
    return this.getChartData(type).avgVal;
  }
  getTrend(type: string): string {
    return this.getChartData(type).trend;
  }
  getTrendArrow(type: string): string {
    const d = this.getChartData(type);
    if (d.trend === 'up') return '+' + d.trendDiff;
    if (d.trend === 'down') return '-' + Math.abs(d.trendDiff);
    return 'Stable';
  }
  getColor(type: string): string {
    if (type === 'bp') return '#E11D48';
    if (type === 'glucose') return '#059669';
    return '#0284C7';
  }
  getIconBg(type: string): string {
    if (type === 'bp') return '#FFE4E6';
    if (type === 'glucose') return '#D1FAE5';
    return '#E0F2FE';
  }
  getIcon(type: string): string {
    if (type === 'bp') return 'speed';
    if (type === 'glucose') return 'water_drop';
    return 'favorite';
  }
  getTitle(type: string): string {
    if (type === 'bp') return 'Tension Artérielle';
    if (type === 'glucose') return 'Glycémie Capillaire';
    return 'Fréquence Cardiaque';
  }
  getUnit(type: string): string {
    if (type === 'bp') return 'mmHg';
    if (type === 'glucose') return 'mg/dL';
    return 'bpm';
  }
}
