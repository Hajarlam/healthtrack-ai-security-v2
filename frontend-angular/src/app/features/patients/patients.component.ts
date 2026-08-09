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

            <!-- Trend Charts for Patient -->
            <div style="margin-top:24px;">
              <h3 class="section-title"><span class="material-icons">show_chart</span> Tendances (10 dernières mesures)</h3>
              @if (records().length > 1) {
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top:10px;">
                  <!-- Tension -->
                  <div style="background:var(--bg); border:1px solid var(--border); padding:12px; border-radius:10px;">
                    <h4 style="margin:0 0 8px; color:var(--rose-dark); font-size:12px; font-weight:700;">Tension (mmHg)</h4>
                    <svg viewBox="0 0 500 150" style="width:100%; height:90px; overflow:visible;">
                      <polyline fill="none" stroke="var(--rose)" stroke-width="3" [attr.points]="getChartPath('bp')"></polyline>
                    </svg>
                  </div>
                  
                  <!-- Glycémie -->
                  <div style="background:var(--bg); border:1px solid var(--border); padding:12px; border-radius:10px;">
                    <h4 style="margin:0 0 8px; color:var(--rose-dark); font-size:12px; font-weight:700;">Glycémie (mg/dL)</h4>
                    <svg viewBox="0 0 500 150" style="width:100%; height:90px; overflow:visible;">
                      <polyline fill="none" stroke="#2e7d32" stroke-width="3" [attr.points]="getChartPath('glucose')"></polyline>
                    </svg>
                  </div>
                  
                  <!-- FC -->
                  <div style="background:var(--bg); border:1px solid var(--border); padding:12px; border-radius:10px;">
                    <h4 style="margin:0 0 8px; color:var(--rose-dark); font-size:12px; font-weight:700;">FC (bpm)</h4>
                    <svg viewBox="0 0 500 150" style="width:100%; height:90px; overflow:visible;">
                      <polyline fill="none" stroke="#0288d1" stroke-width="3" [attr.points]="getChartPath('hr')"></polyline>
                    </svg>
                  </div>
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
    { id: 3, firstName: 'Sara', lastName: 'El Amrani', email: 'patient@healthtrack.ai', phone: '0612345678', role: 'PATIENT' as any, enabled: true, bloodType: 'A+', height: 165, weight: 62, chronicDiseases: 'Hypertension' },
    { id: 4, firstName: 'Jean', lastName: 'Martin', email: 'patient2@healthtrack.ai', phone: '0687654321', role: 'PATIENT' as any, enabled: true, bloodType: 'O-', height: 180, weight: 75, chronicDiseases: 'Diabète' }
  ];

  mockRecords: Record<number, HealthRecord[]> = {
    3: [
      { id: 101, systolicBP: 125, diastolicBP: 82, heartRate: 74, bloodGlucose: 95, oxygenSaturation: 98, temperature: 36.6, status: 'NORMAL' as any, notes: 'RAS', recordedAt: '2026-06-06T10:30:00' },
      { id: 102, systolicBP: 142, diastolicBP: 88, heartRate: 80, bloodGlucose: 110, oxygenSaturation: 97, temperature: 36.8, status: 'WARNING' as any, notes: 'Légère fatigue', recordedAt: '2026-06-05T18:15:00' }
    ],
    4: [
      { id: 201, systolicBP: 118, diastolicBP: 76, heartRate: 68, bloodGlucose: 145, oxygenSaturation: 99, temperature: 36.5, status: 'WARNING' as any, notes: 'Glycémie post-prandiale élevée', recordedAt: '2026-06-06T12:00:00' },
      { id: 202, systolicBP: 120, diastolicBP: 78, heartRate: 70, bloodGlucose: 98, oxygenSaturation: 98, temperature: 36.7, status: 'NORMAL' as any, notes: 'À jeun', recordedAt: '2026-06-06T08:00:00' }
    ]
  };

  constructor(private userService: UserService, private hrService: HealthRecordService) {}

  ngOnInit() {
    this.userService.getPatients().subscribe({
      next: data => {
        if (data && data.length > 0) {
          this.patients.set(data);
        } else {
          this.patients.set(this.mockPatients);
        }
      },
      error: () => {
        this.patients.set(this.mockPatients);
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
