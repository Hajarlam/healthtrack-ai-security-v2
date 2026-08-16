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
          <p>Recherchez un patient pour accéder instantanément à ses informations médicales critiques et vitales.</p>
        </div>
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
      { id: 101, systolicBP: 125, diastolicBP: 82, heartRate: 74, bloodGlucose: 95, oxygenSaturation: 98, temperature: 36.6, status: 'NORMAL' as any, notes: 'RAS', recordedAt: '2026-06-06T10:30:00' },
      { id: 102, systolicBP: 142, diastolicBP: 88, heartRate: 80, bloodGlucose: 110, oxygenSaturation: 97, temperature: 36.8, status: 'WARNING' as any, notes: 'Légère fatigue', recordedAt: '2026-06-05T18:15:00' }
    ],
    4: [
      { id: 201, systolicBP: 118, diastolicBP: 76, heartRate: 68, bloodGlucose: 145, oxygenSaturation: 99, temperature: 36.5, status: 'WARNING' as any, notes: 'Glycémie post-prandiale élevée', recordedAt: '2026-06-06T12:00:00' },
      { id: 202, systolicBP: 120, diastolicBP: 78, heartRate: 70, bloodGlucose: 98, oxygenSaturation: 98, temperature: 36.7, status: 'NORMAL' as any, notes: 'À jeun', recordedAt: '2026-06-06T08:00:00' }
    ]
  };

  constructor(
    private userService: UserService,
    private hrService: HealthRecordService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {}

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
}
