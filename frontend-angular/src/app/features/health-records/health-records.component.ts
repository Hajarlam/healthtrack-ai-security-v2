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

    <!-- Trend Charts -->
    <div class="card" style="margin-top:20px;">
      <h3 class="card-title" style="color:var(--rose-dark); font-weight:800; font-size:16px; margin-bottom:16px;">
        <span class="material-icons">show_chart</span> Graphiques de Tendances (10 dernières mesures)
      </h3>
      @if (records().length > 1) {
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
          <!-- Tension -->
          <div style="background:var(--bg); border:1px solid var(--border); padding:16px; border-radius:10px;">
            <h4 style="margin:0 0 10px; color:var(--rose-dark); font-size:13px; font-weight:700;">Tension Systolique (mmHg)</h4>
            <svg viewBox="0 0 500 150" style="width:100%; height:120px; overflow:visible;">
              <polyline fill="none" stroke="var(--rose)" stroke-width="3" [attr.points]="getChartPath('bp')"></polyline>
            </svg>
          </div>
          
          <!-- Glycémie -->
          <div style="background:var(--bg); border:1px solid var(--border); padding:16px; border-radius:10px;">
            <h4 style="margin:0 0 10px; color:var(--rose-dark); font-size:13px; font-weight:700;">Glycémie (mg/dL)</h4>
            <svg viewBox="0 0 500 150" style="width:100%; height:120px; overflow:visible;">
              <polyline fill="none" stroke="#2e7d32" stroke-width="3" [attr.points]="getChartPath('glucose')"></polyline>
            </svg>
          </div>
          
          <!-- Fréquence cardiaque -->
          <div style="background:var(--bg); border:1px solid var(--border); padding:16px; border-radius:10px;">
            <h4 style="margin:0 0 10px; color:var(--rose-dark); font-size:13px; font-weight:700;">Fréquence Cardiaque (bpm)</h4>
            <svg viewBox="0 0 500 150" style="width:100%; height:120px; overflow:visible;">
              <polyline fill="none" stroke="#0288d1" stroke-width="3" [attr.points]="getChartPath('hr')"></polyline>
            </svg>
          </div>
        </div>
      } @else {
        <div style="padding:16px; text-align:center; color:var(--text-muted); font-size:13px;">
          Enregistrez au moins 2 mesures pour générer les graphiques de tendances.
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
      next: p => { this.records.set(p.content); this.totalElements.set(p.totalElements); }
    });
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

  getChartPath(type: string): string {
    const data = [...this.records()].slice(0, 10).reverse();
    if (data.length < 2) return '';
    
    let values: number[] = [];
    if (type === 'bp') {
      values = data.map(r => r.systolicBP || 120);
    } else if (type === 'glucose') {
      values = data.map(r => r.bloodGlucose || 100);
    } else if (type === 'hr') {
      values = data.map(r => r.heartRate || 70);
    }
    
    const maxVal = Math.max(...values, 150);
    const minVal = Math.min(...values, 50);
    const range = maxVal - minVal || 1;
    
    const width = 500;
    const height = 150;
    
    const points = values.map((val, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((val - minVal) / range) * height;
      return `${x},${y}`;
    });
    
    return points.join(' ');
  }
}
