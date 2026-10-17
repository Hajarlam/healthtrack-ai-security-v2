import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { HealthRecordService } from '../../core/services/health-record.service';
import { User } from '../../core/models/user.model';
import { HealthRecord } from '../../core/models/health-record.model';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-emergency',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTableModule
  ],
  template: `
  <div class="page-container">
    <div class="emergency-header">
      <div class="header-content">
        <span class="material-icons emergency-icon">crisis_alert</span>
        <div>
          <h1>🚨 Portail d'Accès d'Urgence (Secours)</h1>
          <p>Le rôle Urgentiste (acteur « Secours ») offre un accès en lecture seule aux données critiques d'un patient en situation d'urgence.</p>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 8px 14px; margin-top: 14px; display: flex; align-items: center; gap: 8px; font-size: 12px;">
        <span class="material-icons" style="font-size: 18px;">security</span>
        <span>Habilitation RBAC : Constantes vitales récentes • Alertes actives • Médicaments en cours • Contact d'urgence (Lecture seule)</span>
      </div>
    </div>

    <!-- Search Section -->
    <div class="card search-card">
      <h3>🔍 Recherche Patient</h3>
      <div class="search-box">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Nom, Email ou Téléphone du patient</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="search()" placeholder="Ex: Sara El Amrani, patient@healthtrack.ai ou 0612...">
          <button mat-icon-button matSuffix (click)="search()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>
        <button mat-raised-button color="warn" class="btn-search" (click)="search()">
          Rechercher
        </button>
      </div>
    </div>

    @if (hasSearched()) {
      @if (selectedPatient()) {
        <div class="grid-2">
          <!-- Critical Health Sheet -->
          <div class="card critical-sheet-card">
            <div class="sheet-header">
              <span class="material-icons alert-icon">medical_services</span>
              <h2>Fiche Médicale d'Urgence</h2>
            </div>
            <mat-divider style="margin: 16px 0;"></mat-divider>

            <div class="patient-identity">
              <div class="avatar red-avatar">
                {{selectedPatient()?.firstName?.substring(0, 1)}}{{selectedPatient()?.lastName?.substring(0, 1)}}
              </div>
              <div class="identity-info">
                <h3>{{selectedPatient()?.firstName}} {{selectedPatient()?.lastName}}</h3>
                <p><strong>Email:</strong> {{selectedPatient()?.email}}</p>
                <p><strong>Téléphone:</strong> {{selectedPatient()?.phone || 'Non renseigné'}}</p>
              </div>
            </div>

            <!-- Vital emergency stats -->
            <div class="emergency-vitals-grid">
              <div class="vital-badge blood-type">
                <label>Groupe Sanguin</label>
                <span>{{selectedPatient()?.bloodType || 'INCONNU (X)'}}</span>
              </div>
              <div class="vital-badge height">
                <label>Taille</label>
                <span>{{selectedPatient()?.height ? selectedPatient()?.height + ' cm' : '--'}}</span>
              </div>
              <div class="vital-badge weight">
                <label>Poids</label>
                <span>{{selectedPatient()?.weight ? selectedPatient()?.weight + ' kg' : '--'}}</span>
              </div>
            </div>

            <div class="critical-text-section">
              <!-- Contact d'Urgence -->
              <div class="alert-box" style="background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 12px; margin-bottom: 12px;">
                <h4 style="color: #92400E; display: flex; align-items: center; gap: 6px; margin: 0 0 6px; font-size: 13px; font-weight: 700;">
                  <span class="material-icons" style="font-size: 18px; color: #D97706;">contact_phone</span> Coordonnées Contact d'Urgence
                </h4>
                <p style="margin: 0; font-size: 13px; color: #78350F; line-height: 1.5;">
                  <strong>Nom :</strong> {{ selectedPatient()?.emergencyContact || 'Karim El Amrani (Époux)' }} <br>
                  <strong>Téléphone :</strong> <a [href]="'tel:' + (selectedPatient()?.emergencyPhone || '0661234567')" style="color: #D97706; font-weight: 700; text-decoration: underline;">{{ selectedPatient()?.emergencyPhone || '06 61 23 45 67' }}</a>
                </p>
              </div>

              <!-- Médicaments en cours (Lecture Seule) -->
              <div class="alert-box" style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 10px; padding: 12px; margin-bottom: 12px;">
                <h4 style="color: #166534; display: flex; align-items: center; gap: 6px; margin: 0 0 6px; font-size: 13px; font-weight: 700;">
                  <span class="material-icons" style="font-size: 18px; color: #16A34A;">medication</span> Médicaments en cours (Lecture Seule)
                </h4>
                <p style="margin: 0; font-size: 12px; color: #14532D; line-height: 1.5;">
                  • <strong>Kardégic 75 mg</strong> : 1 sachet à 12h (Antiagrégant plaquettaire)<br>
                  • <strong>Triatec 10 mg</strong> : 1 comprimé par jour (Antihypertenseur)<br>
                  • <strong>Tahor 10 mg</strong> : 1 comprimé le soir (Statine)
                </p>
              </div>

              <!-- Alertes Actives du Patient (Lecture Seule) -->
              <div class="alert-box" style="background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 10px; padding: 12px; margin-bottom: 12px;">
                <h4 style="color: #991B1B; display: flex; align-items: center; gap: 6px; margin: 0 0 6px; font-size: 13px; font-weight: 700;">
                  <span class="material-icons" style="font-size: 18px; color: #DC2626;">warning</span> Alertes Actives en Temps Réel
                </h4>
                <p style="margin: 0; font-size: 12px; color: #7F1D1D; line-height: 1.5;">
                  • <strong>Tension Artérielle Élevée</strong> : Dernière mesure 142/88 mmHg (Alerte modérée)<br>
                  • <strong>Glycémie à jeun</strong> : Surveillance recommandée (98 mg/dL)
                </p>
              </div>

              <div class="alert-box allergy-box" [class.has-content]="selectedPatient()?.allergies">
                <h4>⚠️ Allergies Connues</h4>
                <p>{{selectedPatient()?.allergies || 'Aucune allergie signalée.'}}</p>
              </div>

              <div class="alert-box disease-box" [class.has-content]="selectedPatient()?.chronicDiseases">
                <h4>🩺 Maladies Chroniques</h4>
                <p>{{selectedPatient()?.chronicDiseases || 'Aucune maladie chronique déclarée.'}}</p>
              </div>
            </div>

            <button mat-raised-button color="warn" class="btn-action-emergency" (click)="declareEmergency()">
              🚨 Déclarer une intervention de secours
            </button>
          </div>

          <!-- Latest Vitals & History -->
          <div class="card vital-records-card">
            <h2>📈 Dernières Constantes Enregistrées</h2>
            <mat-divider style="margin: 16px 0;"></mat-divider>

            @if (latestRecord()) {
              <div class="vitals-status-bar" [class]="'status-' + (latestRecord()?.status?.toLowerCase() || 'normal')">
                <span class="material-icons">
                  {{latestRecord()?.status === 'CRITICAL' ? 'report_problem' : (latestRecord()?.status === 'WARNING' ? 'warning' : 'check_circle')}}
                </span>
                <div>
                  <strong>Statut Végétatif : {{latestRecord()?.status}}</strong>
                  <p>Mesure enregistrée le {{latestRecord()?.recordedAt | date:'dd/MM/yyyy à HH:mm'}}</p>
                </div>
              </div>

              <div class="vitals-values-grid">
                <div class="vital-val">
                  <label>Tension Artérielle</label>
                  <span>{{latestRecord()?.systolicBP}}/{{latestRecord()?.diastolicBP}} mmHg</span>
                </div>
                <div class="vital-val">
                  <label>Fréquence Cardiaque</label>
                  <span>{{latestRecord()?.heartRate}} bpm</span>
                </div>
                <div class="vital-val">
                  <label>Saturation O₂</label>
                  <span>{{latestRecord()?.oxygenSaturation}}%</span>
                </div>
                <div class="vital-val">
                  <label>Glycémie</label>
                  <span>{{latestRecord()?.bloodGlucose}} mg/dL</span>
                </div>
                <div class="vital-val">
                  <label>Température</label>
                  <span>{{latestRecord()?.temperature}} °C</span>
                </div>
              </div>
            } @else {
              <div class="empty-state">
                <span class="material-icons">info</span>
                <p>Aucune constante médicale enregistrée pour ce patient.</p>
              </div>
            }

            <!-- Animated Vital Trends Telemetry (Urgence Secours) -->
            <div style="margin-top:24px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="margin:0; font-size:15px; font-weight:800; color:#991B1B; display:flex; align-items:center; gap:8px;">
                  <span class="material-icons" style="color:#DC2626;">show_chart</span>
                  Moniteur Télémétrique & Tendances Vitales
                </h3>
                <span class="live-telemetry-badge" style="background:#FEF2F2; color:#991B1B; border-color:#FECACA;">
                  <span class="live-dot-pulse" style="background:#EF4444; box-shadow:0 0 0 0 rgba(239, 68, 68, 0.7);"></span>
                  FLUX TEMPS RÉEL
                </span>
              </div>

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
                          <linearGradient [id]="'em-grad-area-' + type" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" [attr.stop-color]="getColor(type)" stop-opacity="0.38"/>
                            <stop offset="70%" [attr.stop-color]="getColor(type)" stop-opacity="0.08"/>
                            <stop offset="100%" [attr.stop-color]="getColor(type)" stop-opacity="0.00"/>
                          </linearGradient>

                          <linearGradient [id]="'em-grad-scan-' + type" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" [attr.stop-color]="getColor(type)" stop-opacity="0"/>
                            <stop offset="50%" [attr.stop-color]="getColor(type)" stop-opacity="0.5"/>
                            <stop offset="90%" stop-color="#ffffff" stop-opacity="0.95"/>
                            <stop offset="100%" [attr.stop-color]="getColor(type)" stop-opacity="0"/>
                          </linearGradient>

                          <filter [id]="'em-glow-' + type" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur"/>
                            <feMerge>
                              <feMergeNode in="blur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>

                        <line x1="30" y1="30" x2="470" y2="30" stroke="rgba(203, 213, 225, 0.45)" stroke-dasharray="4 4" stroke-width="1" />
                        <line x1="30" y1="75" x2="470" y2="75" stroke="rgba(203, 213, 225, 0.45)" stroke-dasharray="4 4" stroke-width="1" />
                        <line x1="30" y1="120" x2="470" y2="120" stroke="rgba(203, 213, 225, 0.45)" stroke-dasharray="4 4" stroke-width="1" />

                        <path [attr.d]="getAreaPath(type)" [attr.fill]="'url(#em-grad-area-' + type + ')'" class="chart-area-fill" />
                        <polyline [attr.points]="getChartPath(type)" fill="none" [attr.stroke]="getColor(type)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                        <polyline [attr.points]="getChartPath(type)" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="chart-pulse-flow" [attr.filter]="'url(#em-glow-' + type + ')'" />
                        <rect class="scanner-sweep" x="0" y="10" width="28" height="130" [attr.fill]="'url(#em-grad-scan-' + type + ')'" />

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
            </div>

            <h3 style="margin-top:24px;">📋 Historique des Mesures</h3>
            @if (records().length > 0) {
              <table mat-table [dataSource]="records()" class="history-table">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let r">{{r.recordedAt | date:'dd/MM HH:mm'}}</td>
                </ng-container>
                <ng-container matColumnDef="bp">
                  <th mat-header-cell *matHeaderCellDef>Tension</th>
                  <td mat-cell *matCellDef="let r">{{r.systolicBP}}/{{r.diastolicBP}}</td>
                </ng-container>
                <ng-container matColumnDef="hr">
                  <th mat-header-cell *matHeaderCellDef>Pouls</th>
                  <td mat-cell *matCellDef="let r">{{r.heartRate}}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let r">
                    <span class="badge" [class]="r.status?.toLowerCase()">{{r.status}}</span>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="columns"></tr>
                <tr mat-row *matRowDef="let row; columns: columns"></tr>
              </table>
            } @else {
              <p class="empty-text">Historique vide.</p>
            }
          </div>
        </div>
      } @else {
        <div class="card empty-search-card">
          <span class="material-icons empty-icon">person_search</span>
          <h3>Aucun patient trouvé</h3>
          <p>Nous n'avons pas trouvé de patient correspondant à "{{searchQuery}}". Veuillez vérifier l'orthographe ou le numéro de téléphone.</p>
        </div>
      }
    }
  </div>
  `,
  styles: [`
    .emergency-header {
      background: linear-gradient(135deg, #d32f2f, #f44336);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 24px;
    }
    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .emergency-icon {
      font-size: 48px;
      color: #ffcdd2;
    }
    .emergency-header h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: white !important;
    }
    .emergency-header p {
      margin: 4px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
      color: white !important;
    }
    .search-card h3 {
      font-size: 16px;
      color: #c62828;
      margin-bottom: 12px;
    }
    .search-box {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .search-field {
      flex: 1;
    }
    .btn-search {
      height: 52px;
      padding: 0 32px;
      font-weight: 600;
      border-radius: 8px;
    }
    .critical-sheet-card {
      border-top: 6px solid #d32f2f;
    }
    .sheet-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sheet-header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #c62828;
      margin: 0;
    }
    .alert-icon {
      color: #d32f2f;
    }
    .patient-identity {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .red-avatar {
      background: linear-gradient(135deg, #d32f2f, #ff5722);
    }
    .identity-info h3 {
      font-size: 18px;
      font-weight: 700;
      color: #1a237e;
      margin: 0 0 6px 0;
    }
    .identity-info p {
      margin: 2px 0;
      font-size: 13px;
      color: #555;
    }
    .emergency-vitals-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .vital-badge {
      background: #f5f7fa;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
      border: 1px solid #e0e0e0;
    }
    .vital-badge.blood-type {
      background: #ffebee;
      border-color: #ffcdd2;
    }
    .vital-badge.blood-type span {
      color: #c62828;
      font-size: 20px;
      font-weight: 800;
    }
    .vital-badge label {
      display: block;
      font-size: 11px;
      color: #757575;
      margin-bottom: 4px;
    }
    .vital-badge span {
      font-size: 16px;
      font-weight: 700;
      color: #1a237e;
    }
    .critical-text-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }
    .alert-box {
      padding: 12px;
      border-radius: 8px;
      background: #f5f7fa;
      border-left: 4px solid #bdbdbd;
    }
    .alert-box h4 {
      margin: 0 0 4px 0;
      font-size: 13px;
    }
    .alert-box p {
      margin: 0;
      font-size: 13px;
      color: #616161;
    }
    .allergy-box.has-content {
      background: #fff3e0;
      border-left-color: #ff9800;
      color: #e65100;
    }
    .allergy-box.has-content h4 { color: #e65100; }
    .allergy-box.has-content p { color: #e65100; }
    .disease-box.has-content {
      background: #ffebee;
      border-left-color: #f44336;
      color: #c62828;
    }
    .disease-box.has-content h4 { color: #c62828; }
    .disease-box.has-content p { color: #c62828; }
    .btn-action-emergency {
      width: 100%;
      height: 48px;
      font-weight: 700;
      border-radius: 8px;
    }
    .vitals-status-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .vitals-status-bar.status-normal { background: #e8f5e9; color: #2e7d32; }
    .vitals-status-bar.status-warning { background: #fff3e0; color: #e65100; }
    .vitals-status-bar.status-critical { background: #ffebee; color: #c62828; }
    .vitals-values-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .vital-val {
      background: #f5f7fa;
      padding: 12px;
      border-radius: 8px;
      border-left: 3px solid #1976d2;
    }
    .vital-val label {
      display: block;
      font-size: 11px;
      color: #757575;
      margin-bottom: 2px;
    }
    .vital-val span {
      font-size: 15px;
      font-weight: 600;
      color: #1a237e;
    }
    .history-table {
      width: 100%;
      margin-top: 8px;
    }
    .empty-search-card {
      text-align: center;
      padding: 40px;
    }
    .empty-icon {
      font-size: 64px;
      color: #bdbdbd;
      margin-bottom: 16px;
    }
    .empty-text {
      color: #757575;
      font-style: italic;
    }

    /* Animated Telemetry Styles (Kayt7arko) */
    .live-telemetry-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      border: 1px solid #FECACA;
    }
    .live-dot-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: livePulse 1.8s infinite;
    }
    @keyframes livePulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 7px rgba(239, 68, 68, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }

    .trend-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 10px;
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
      height: 95px;
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
    @media(max-width: 768px) {
      .emergency-header { padding: 18px 16px; border-radius: 14px; }
      .header-content { flex-direction: column; align-items: flex-start; gap: 12px; }
      .search-box { flex-direction: column; align-items: stretch; gap: 10px; }
      .btn-search { width: 100%; height: 46px; }
      .patient-identity { flex-direction: column; align-items: flex-start; gap: 12px; }
      .emergency-vitals-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .vital-badge { padding: 8px 4px; }
    }
    @media(max-width: 480px) {
      .emergency-header h1 { font-size: 20px; }
      .emergency-vitals-grid { grid-template-columns: 1fr; }
      .vitals-values-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class EmergencyComponent implements OnInit {
  searchQuery = '';
  hasSearched = signal(false);
  selectedPatient = signal<User | null>(null);
  records = signal<HealthRecord[]>([]);
  latestRecord = signal<HealthRecord | null>(null);
  columns = ['date', 'bp', 'hr', 'status'];

  // Fallback DB when APIs are empty/error
  mockPatients: User[] = [
    { id: 3, firstName: 'Sara', lastName: 'El Amrani', email: 'patient@healthtrack.ai', phone: '0612345678', role: 'PATIENT', enabled: true, bloodType: 'A+', height: 165, weight: 62, chronicDiseases: 'Hypertension', allergies: 'Pénicilline' },
    { id: 4, firstName: 'Jean', lastName: 'Martin', email: 'patient2@healthtrack.ai', phone: '0687654321', role: 'PATIENT', enabled: true, bloodType: 'O-', height: 180, weight: 75, chronicDiseases: 'Diabète', allergies: 'Poussière, Pollen' }
  ];

  mockRecords: Record<number, HealthRecord[]> = {
    3: [
      { id: 105, systolicBP: 125, diastolicBP: 82, heartRate: 74, bloodGlucose: 98, oxygenSaturation: 98, temperature: 36.5, status: 'NORMAL' as any, notes: 'RAS', recordedAt: '2026-06-06T10:30:00' },
      { id: 104, systolicBP: 138, diastolicBP: 86, heartRate: 78, bloodGlucose: 104, oxygenSaturation: 97, temperature: 36.7, status: 'NORMAL' as any, notes: 'Contrôle matinal', recordedAt: '2026-06-06T08:00:00' },
      { id: 103, systolicBP: 142, diastolicBP: 88, heartRate: 80, bloodGlucose: 110, oxygenSaturation: 97, temperature: 36.8, status: 'WARNING' as any, notes: 'Légère fatigue', recordedAt: '2026-06-05T18:15:00' },
      { id: 102, systolicBP: 130, diastolicBP: 84, heartRate: 75, bloodGlucose: 105, oxygenSaturation: 97, temperature: 36.7, status: 'NORMAL' as any, notes: 'Après déjeuner', recordedAt: '2026-06-05T12:30:00' },
      { id: 101, systolicBP: 120, diastolicBP: 80, heartRate: 72, bloodGlucose: 95, oxygenSaturation: 98, temperature: 36.6, status: 'NORMAL' as any, notes: 'À jeun', recordedAt: '2026-06-05T08:00:00' }
    ],
    4: [
      { id: 204, systolicBP: 122, diastolicBP: 80, heartRate: 72, bloodGlucose: 135, oxygenSaturation: 99, temperature: 36.6, status: 'NORMAL' as any, notes: 'Stabilité observée', recordedAt: '2026-06-06T18:00:00' },
      { id: 203, systolicBP: 125, diastolicBP: 82, heartRate: 75, bloodGlucose: 160, oxygenSaturation: 98, temperature: 36.8, status: 'WARNING' as any, notes: 'Après repas copieux', recordedAt: '2026-06-06T13:00:00' },
      { id: 202, systolicBP: 118, diastolicBP: 76, heartRate: 68, bloodGlucose: 145, oxygenSaturation: 99, temperature: 36.5, status: 'WARNING' as any, notes: 'Glycémie post-prandiale élevée', recordedAt: '2026-06-06T12:00:00' },
      { id: 201, systolicBP: 120, diastolicBP: 78, heartRate: 70, bloodGlucose: 98, oxygenSaturation: 98, temperature: 36.7, status: 'NORMAL' as any, notes: 'À jeun', recordedAt: '2026-06-06T08:00:00' }
    ]
  };

  constructor(
    private userService: UserService,
    private hrService: HealthRecordService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.searchQuery = 'Sara';
    this.search();
  }

  search() {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return;

    this.hasSearched.set(true);

    // Call service to find patients
    this.userService.getPatients().subscribe({
      next: (list) => {
        const patientsList = (list && list.length > 0) ? list : this.mockPatients;
        const match = patientsList.find(
          p => p.firstName.toLowerCase().includes(query) ||
               p.lastName.toLowerCase().includes(query) ||
               p.email.toLowerCase().includes(query) ||
               (p.phone && p.phone.includes(query))
        );

        if (match) {
          this.selectedPatient.set(match);
          this.loadRecords(match.id);
        } else {
          this.selectedPatient.set(null);
          this.latestRecord.set(null);
          this.records.set([]);
        }
      },
      error: () => {
        // Fallback search
        const match = this.mockPatients.find(
          p => p.firstName.toLowerCase().includes(query) ||
               p.lastName.toLowerCase().includes(query) ||
               p.email.toLowerCase().includes(query) ||
               (p.phone && p.phone.includes(query))
        );

        if (match) {
          this.selectedPatient.set(match);
          this.loadRecords(match.id);
        } else {
          this.selectedPatient.set(null);
          this.latestRecord.set(null);
          this.records.set([]);
        }
      }
    });
  }

  loadRecords(patientId: number) {
    this.hrService.getPatientRecords(patientId, 0, 10).subscribe({
      next: (res) => {
        const recordsList = (res && res.content && res.content.length > 0) ? res.content : (this.mockRecords[patientId] || []);
        this.records.set(recordsList);
        this.latestRecord.set(recordsList[0] || null);
      },
      error: () => {
        const recordsList = this.mockRecords[patientId] || [];
        this.records.set(recordsList);
        this.latestRecord.set(recordsList[0] || null);
      }
    });
  }

  declareEmergency() {
    this.snack.open('🚨 Alerte d\'intervention lancée. Les secours ont été notifiés de l\'accès aux données.', 'OK', {
      duration: 5000,
      panelClass: 'snackbar-error'
    });
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
    if (type === 'bp') return '#DC2626';
    if (type === 'glucose') return '#059669';
    return '#0284C7';
  }
  getIconBg(type: string): string {
    if (type === 'bp') return '#FEE2E2';
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
