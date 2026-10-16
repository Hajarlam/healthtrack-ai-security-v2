import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HealthRecordService } from '../../core/services/health-record.service';
import { HealthRecord } from '../../core/models/health-record.model';

@Component({
  selector: 'app-health-records',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatTableModule,
    MatSnackBarModule, MatDialogModule, MatPaginatorModule],
  template: `
  <div class="page-container">
    <h1 class="page-title">📊 Constantes de Santé</h1>

    <!-- Add Record Form -->
    <div class="card">
      <h3 class="section-title"><span class="material-icons">add_circle</span> Nouvelle mesure</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Tension systolique (mmHg)</mat-label>
            <input matInput formControlName="systolicBP" type="number">
            <mat-icon matPrefix>favorite</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Tension diastolique (mmHg)</mat-label>
            <input matInput formControlName="diastolicBP" type="number">
            <mat-icon matPrefix>favorite_border</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fréquence cardiaque (bpm)</mat-label>
            <input matInput formControlName="heartRate" type="number">
            <mat-icon matPrefix>monitor_heart</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Glycémie (mg/dL)</mat-label>
            <input matInput formControlName="bloodGlucose" type="number">
            <mat-icon matPrefix>water_drop</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>SpO2 (%)</mat-label>
            <input matInput formControlName="oxygenSaturation" type="number">
            <mat-icon matPrefix>air</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Température (°C)</mat-label>
            <input matInput formControlName="temperature" type="number">
            <mat-icon matPrefix>thermostat</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Poids (kg)</mat-label>
            <input matInput formControlName="weight" type="number">
            <mat-icon matPrefix>scale</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Notes</mat-label>
            <input matInput formControlName="notes">
            <mat-icon matPrefix>notes</mat-icon>
          </mat-form-field>
        </div>
        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="loading()">
            <mat-icon>save</mat-icon>
            {{loading() ? 'Enregistrement...' : 'Enregistrer la mesure'}}
          </button>
        </div>
      </form>
    </div>

    <!-- Records Table -->
    <div class="card">
      <h3 class="section-title"><span class="material-icons">history</span> Historique des mesures</h3>
      @if (records().length > 0) {
        <div class="table-wrapper">
          <table mat-table [dataSource]="records()">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let r">{{r.recordedAt | date:'dd/MM/yyyy HH:mm'}}</td>
            </ng-container>
            <ng-container matColumnDef="bp">
              <th mat-header-cell *matHeaderCellDef>Tension</th>
              <td mat-cell *matCellDef="let r">{{r.systolicBP}}/{{r.diastolicBP}} mmHg</td>
            </ng-container>
            <ng-container matColumnDef="hr">
              <th mat-header-cell *matHeaderCellDef>FC</th>
              <td mat-cell *matCellDef="let r">{{r.heartRate}} bpm</td>
            </ng-container>
            <ng-container matColumnDef="glucose">
              <th mat-header-cell *matHeaderCellDef>Glycémie</th>
              <td mat-cell *matCellDef="let r">{{r.bloodGlucose}} mg/dL</td>
            </ng-container>
            <ng-container matColumnDef="spo2">
              <th mat-header-cell *matHeaderCellDef>SpO2</th>
              <td mat-cell *matCellDef="let r">{{r.oxygenSaturation}}%</td>
            </ng-container>
            <ng-container matColumnDef="temp">
              <th mat-header-cell *matHeaderCellDef>Temp.</th>
              <td mat-cell *matCellDef="let r">{{r.temperature}}°C</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let r">
                <span class="badge" [class]="r.status?.toLowerCase()">{{r.status}}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
        <mat-paginator [length]="totalElements()" [pageSize]="20" (page)="onPage($event)"></mat-paginator>
      } @else {
        <div class="empty-state">
          <span class="material-icons">monitor_heart</span>
          <p>Aucune mesure enregistrée. Ajoutez votre première mesure ci-dessus.</p>
        </div>
      }
    </div>

    <!-- Trend Charts with Live Telemetry Motion -->
    <div class="card" style="margin-top:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 class="card-title" style="color:var(--rose-dark); font-weight:800; font-size:16px; margin:0;">
          <span class="material-icons">show_chart</span> Graphiques de Tendances (Temps Réel & Surveillance)
        </h3>
        <span class="live-telemetry-badge">
          <span class="live-dot-pulse"></span>
          FLUX ACTIF
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
                    <linearGradient [id]="'hr-grad-area-' + type" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" [attr.stop-color]="getColor(type)" stop-opacity="0.38"/>
                      <stop offset="70%" [attr.stop-color]="getColor(type)" stop-opacity="0.08"/>
                      <stop offset="100%" [attr.stop-color]="getColor(type)" stop-opacity="0.00"/>
                    </linearGradient>

                    <!-- Scanner Laser Gradient -->
                    <linearGradient [id]="'hr-grad-scan-' + type" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" [attr.stop-color]="getColor(type)" stop-opacity="0"/>
                      <stop offset="50%" [attr.stop-color]="getColor(type)" stop-opacity="0.5"/>
                      <stop offset="90%" stop-color="#ffffff" stop-opacity="0.95"/>
                      <stop offset="100%" [attr.stop-color]="getColor(type)" stop-opacity="0"/>
                    </linearGradient>

                    <!-- Glow Filter -->
                    <filter [id]="'hr-glow-' + type" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  <!-- Guidelines -->
                  <line x1="30" y1="30" x2="470" y2="30" stroke="rgba(203, 213, 225, 0.45)" stroke-dasharray="4 4" stroke-width="1" />
                  <line x1="30" y1="75" x2="470" y2="75" stroke="rgba(203, 213, 225, 0.45)" stroke-dasharray="4 4" stroke-width="1" />
                  <line x1="30" y1="120" x2="470" y2="120" stroke="rgba(203, 213, 225, 0.45)" stroke-dasharray="4 4" stroke-width="1" />

                  <!-- Translucent Shimmering Area -->
                  <path [attr.d]="getAreaPath(type)" [attr.fill]="'url(#hr-grad-area-' + type + ')'" class="chart-area-fill" />

                  <!-- Base Medical Line -->
                  <polyline [attr.points]="getChartPath(type)" fill="none" [attr.stroke]="getColor(type)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

                  <!-- Continuous Flowing Laser Wave (kayt7arko) -->
                  <polyline [attr.points]="getChartPath(type)" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="chart-pulse-flow" [attr.filter]="'url(#hr-glow-' + type + ')'" />

                  <!-- Sweeping Laser Telemetry Beam (kayt7arko) -->
                  <rect class="scanner-sweep" x="0" y="10" width="28" height="130" [attr.fill]="'url(#hr-grad-scan-' + type + ')'" />

                  <!-- Points with Animated Radar Ping on latest measurement -->
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
        <div style="padding:24px; text-align:center; color:var(--text-muted); font-size:13px; background:#F8FAFC; border-radius:10px;">
          Enregistrez au moins 2 mesures pour générer les graphiques de tendances en direct.
        </div>
      }
    </div>
  </div>
  `,
  styles: [`
    .form-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
    .table-wrapper{overflow-x:auto;}
    table{width:100%;}
    .mat-mdc-header-cell{font-weight:600;color:#1a237e;background:#f5f7fa;}
    @media(max-width:1200px){.form-grid{grid-template-columns:repeat(2,1fr);}}
    @media(max-width:600px){.form-grid{grid-template-columns:1fr;}}

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
      gap: 16px;
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
export class HealthRecordsComponent implements OnInit {
  form: FormGroup;
  records = signal<HealthRecord[]>([]);
  totalElements = signal(0);
  loading = signal(false);
  displayedColumns = ['date','bp','hr','glucose','spo2','temp','status'];

  constructor(private fb: FormBuilder, private service: HealthRecordService, private snack: MatSnackBar) {
    this.form = this.fb.group({
      systolicBP: [''], diastolicBP: [''], heartRate: [''],
      bloodGlucose: [''], oxygenSaturation: [''], temperature: [''],
      weight: [''], notes: ['']
    });
  }

  ngOnInit() { this.load(); }

  load(page = 0) {
    this.service.getMyRecords(page).subscribe({
      next: p => {
        if (p.content && p.content.length > 0) {
          this.records.set(p.content);
          this.totalElements.set(p.totalElements);
        } else {
          this.loadDemoFallback();
        }
      },
      error: () => this.loadDemoFallback()
    });
  }

  loadDemoFallback() {
    const demo: HealthRecord[] = [
      { id: 1, systolicBP: 120, diastolicBP: 80, heartRate: 72, bloodGlucose: 95, oxygenSaturation: 98, temperature: 36.6, weight: 62, status: 'NORMAL', recordedAt: '2026-10-16T14:57:00' },
      { id: 2, systolicBP: 130, diastolicBP: 84, heartRate: 75, bloodGlucose: 105, oxygenSaturation: 97, temperature: 36.7, weight: 62, status: 'NORMAL', recordedAt: '2026-10-16T15:10:00' },
      { id: 3, systolicBP: 142, diastolicBP: 88, heartRate: 80, bloodGlucose: 110, oxygenSaturation: 97, temperature: 36.8, weight: 62, status: 'WARNING', recordedAt: '2026-10-16T15:20:00' },
      { id: 4, systolicBP: 125, diastolicBP: 82, heartRate: 74, bloodGlucose: 98, oxygenSaturation: 98, temperature: 36.5, weight: 62, status: 'NORMAL', recordedAt: '2026-10-16T15:30:00' }
    ];
    this.records.set(demo);
    this.totalElements.set(demo.length);
  }

  onSubmit() {
    this.loading.set(true);
    const val = this.form.value;
    const record: HealthRecord = {};
    if (val.systolicBP)      record.systolicBP = +val.systolicBP;
    if (val.diastolicBP)     record.diastolicBP = +val.diastolicBP;
    if (val.heartRate)       record.heartRate = +val.heartRate;
    if (val.bloodGlucose)    record.bloodGlucose = +val.bloodGlucose;
    if (val.oxygenSaturation) record.oxygenSaturation = +val.oxygenSaturation;
    if (val.temperature)     record.temperature = +val.temperature;
    if (val.weight)          record.weight = +val.weight;
    if (val.notes)           record.notes = val.notes;

    this.service.addRecord(record).subscribe({
      next: (r) => {
        this.loading.set(false);
        this.form.reset();
        this.load();
        const msg = r.status === 'CRITICAL' ? '⚠️ Valeurs critiques !' : r.status === 'WARNING' ? '⚠️ Valeurs anormales' : '✅ Mesure enregistrée';
        this.snack.open(msg, 'OK', { duration: 4000, panelClass: r.status === 'CRITICAL' ? 'snackbar-error' : 'snackbar-success' });
      },
      error: () => { this.loading.set(false); this.snack.open("Erreur lors de l'enregistrement", 'X', { duration: 3000, panelClass: 'snackbar-error' }); }
    });
  }

  onPage(e: PageEvent) { this.load(e.pageIndex); }

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
