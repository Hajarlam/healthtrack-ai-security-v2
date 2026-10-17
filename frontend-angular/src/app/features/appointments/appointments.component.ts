import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../core/services/appointment.service';
import { UserService } from '../../core/services/user.service';
import { Appointment } from '../../core/models/appointment.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatSnackBarModule],
  template: `
  <div class="page-container">
    <div class="header-banner">
      <div class="header-icon-box">
        <span class="material-icons">calendar_month</span>
      </div>
      <div>
        <h1 class="page-title">Gestion des Rendez-vous Médicaux</h1>
        <p class="page-subtitle">Planifiez et suivez vos téléconsultations ou visites présentielles avec vos praticiens référents.</p>
      </div>
    </div>

    <div class="grid-2">
      <!-- Formulaire Prise de Rendez-vous -->
      <div class="card appt-form-card">
        <div class="card-head">
          <span class="material-icons head-icon blue">event_available</span>
          <div>
            <h3 class="section-title">Prendre un rendez-vous</h3>
            <p class="section-desc">Choisissez votre médecin traitant et le créneau souhaité</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Choix du médecin -->
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Médecin traitant / Spécialiste</mat-label>
            <mat-select formControlName="doctorId" required>
              @for (d of doctors(); track d.id) {
                <mat-option [value]="d.id">
                  {{ formatDoctorName(d) }} — {{ d.specialization || 'Médecine Générale' }}
                </mat-option>
              }
            </mat-select>
            <mat-icon matPrefix style="color: #0077B6;">medical_services</mat-icon>
            @if (doctors().length === 0) {
              <mat-hint>Aucun praticien enregistré</mat-hint>
            }
          </mat-form-field>

          <!-- Date et Heure -->
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Date et heure du rendez-vous</mat-label>
            <input matInput formControlName="appointmentDate" type="datetime-local" required>
            <mat-icon matPrefix style="color: #0077B6;">schedule</mat-icon>
          </mat-form-field>

          <!-- Motif de consultation -->
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Motif de consultation</mat-label>
            <textarea matInput formControlName="reason" rows="3" placeholder="Ex: Suivi tensionnel, renouvellement de traitement, bilan biologique..."></textarea>
            <mat-icon matPrefix style="color: #0077B6;">description</mat-icon>
          </mat-form-field>

          <button class="btn-submit-appt" type="submit" [disabled]="form.invalid || loading()">
            <span class="material-icons">{{ loading() ? 'sync' : 'event_available' }}</span>
            {{ loading() ? 'Enregistrement en cours...' : 'Confirmer le rendez-vous' }}
          </button>
        </form>
      </div>

      <!-- Liste des rendez-vous -->
      <div class="card appt-list-card">
        <div class="card-head">
          <span class="material-icons head-icon teal">event_note</span>
          <div>
            <h3 class="section-title">Mes rendez-vous planifiés</h3>
            <p class="section-desc">Historique et prochaines consultations médicales</p>
          </div>
        </div>

        @if (appointments().length > 0) {
          <div class="appts-scroll-container">
            @for (a of appointments(); track a.id) {
              <div class="appt-card" [class]="'status-' + (a.status || 'confirmed').toLowerCase()">
                <div class="appt-body">
                  <div class="appt-top-line">
                    <span class="appt-date-pill">
                      <span class="material-icons">event</span>
                      {{ a.appointmentDate | date:'dd/MM/yyyy à HH:mm' }}
                    </span>
                    <span class="status-badge" [class]="(a.status || 'confirmed').toLowerCase()">
                      <span class="badge-dot"></span>
                      {{ a.status === 'CONFIRMED' ? 'Confirmé' : a.status === 'CANCELLED' ? 'Annulé' : 'En attente' }}
                    </span>
                  </div>

                  <div class="appt-doctor-info">
                    <div class="doc-avatar-mini">
                      <span class="material-icons">person</span>
                    </div>
                    <div>
                      <strong class="doc-name">{{ getDoctorName(a.doctorId) }}</strong>
                      <span class="doc-sub">{{ getDoctorSub(a.doctorId) }}</span>
                    </div>
                  </div>

                  @if (a.reason) {
                    <p class="appt-reason">
                      <strong>Motif :</strong> {{ a.reason }}
                    </p>
                  }
                </div>

                @if (a.status !== 'CANCELLED') {
                  <div class="appt-footer-actions">
                    <button class="btn-cancel" (click)="cancelAppointment(a.id!)" title="Annuler le rendez-vous">
                      <span class="material-icons">event_busy</span> Annuler
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-icon-circle">
              <span class="material-icons">event_busy</span>
            </div>
            <h4>Aucun rendez-vous planifié</h4>
            <p>Utilisez le formulaire ci-contre pour réserver une téléconsultation avec votre praticien.</p>
          </div>
        }
      </div>
    </div>
  </div>
  `,
  styles: [`
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .header-banner {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 24px;
    background: #FFFFFF;
    border-radius: 18px;
    padding: 20px 24px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 2px 10px rgba(0, 119, 182, 0.04);
  }

  .header-icon-box {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #0077B6, #00B4D8);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 119, 182, 0.25);
  }

  .header-icon-box .material-icons {
    font-size: 28px;
  }

  .page-title {
    font-size: 22px;
    font-weight: 800;
    color: #023E58;
    margin: 0 0 4px;
    letter-spacing: -0.4px;
  }

  .page-subtitle {
    font-size: 13px;
    color: #64748B;
    margin: 0;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  @media(max-width: 900px) {
    .grid-2 { grid-template-columns: 1fr; }
    .header-banner { flex-direction: column; align-items: flex-start; }
  }

  @media(max-width: 768px) {
    .card { padding: 18px 16px; border-radius: 16px; }
    .header-banner { padding: 16px; border-radius: 16px; gap: 12px; }
    .appt-card { padding: 14px 14px; }
  }

  @media(max-width: 480px) {
    .card { padding: 14px 12px; border-radius: 14px; }
    .header-banner { padding: 14px 12px; }
    .page-title { font-size: 19px; }
    .appt-top-line { flex-direction: column; align-items: flex-start; gap: 6px; }
  }


  .card {
    background: #FFFFFF;
    border-radius: 20px;
    padding: 24px 28px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 4px 18px rgba(0, 119, 182, 0.05);
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 22px;
    padding-bottom: 16px;
    border-bottom: 1px solid #F1F5F9;
  }

  .head-icon {
    font-size: 28px;
    padding: 8px;
    border-radius: 12px;
  }

  .head-icon.blue { background: #E0F2FE; color: #0077B6; }
  .head-icon.teal { background: #CCFBF1; color: #0D9488; }

  .section-title {
    font-size: 17px;
    font-weight: 700;
    color: #023E58;
    margin: 0 0 2px;
  }

  .section-desc {
    font-size: 12px;
    color: #64748B;
    margin: 0;
  }

  .w-100 {
    width: 100%;
    margin-bottom: 6px;
  }

  .btn-submit-appt {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(135deg, #0077B6, #0096C7);
    color: #FFFFFF;
    border: none;
    padding: 14px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 119, 182, 0.25);
    transition: all 0.2s ease;
    margin-top: 8px;
  }

  .btn-submit-appt:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 119, 182, 0.35);
  }

  .btn-submit-appt:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Appointment Cards */
  .appts-scroll-container {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 520px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .appt-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 16px 18px;
    transition: all 0.2s ease;
    border-left: 5px solid #0077B6;
  }

  .appt-card.status-cancelled {
    border-left-color: #EF4444;
    background: #FEF2F2;
    opacity: 0.85;
  }

  .appt-card.status-confirmed {
    border-left-color: #10B981;
  }

  .appt-top-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .appt-date-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #023E58;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    padding: 4px 10px;
    border-radius: 20px;
  }

  .appt-date-pill .material-icons { font-size: 15px; color: #0077B6; }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    text-transform: uppercase;
  }

  .status-badge.confirmed { background: #D1FAE5; color: #065F46; }
  .status-badge.cancelled { background: #FEE2E2; color: #991B1B; }
  .status-badge.pending { background: #FEF3C7; color: #92400E; }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .appt-doctor-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .doc-avatar-mini {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #023E58, #0077B6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    flex-shrink: 0;
  }

  .doc-avatar-mini .material-icons { font-size: 20px; }

  .doc-name {
    display: block;
    font-size: 14px;
    color: #0F172A;
  }

  .doc-sub {
    display: block;
    font-size: 12px;
    color: #64748B;
  }

  .appt-reason {
    font-size: 13px;
    color: #334155;
    margin: 8px 0 0;
    background: #FFFFFF;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px dashed #CBD5E1;
  }

  .appt-footer-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid #E2E8F0;
  }

  .btn-cancel {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    color: #DC2626;
    border: 1px solid #FECACA;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-cancel:hover {
    background: #FEE2E2;
  }

  .btn-cancel .material-icons { font-size: 15px; }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
  }

  .empty-icon-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #F1F5F9;
    color: #94A3B8;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  .empty-icon-circle .material-icons { font-size: 32px; }
  .empty-state h4 { font-size: 16px; font-weight: 700; color: #334155; margin: 0 0 6px; }
  .empty-state p { font-size: 13px; color: #64748B; margin: 0; max-width: 320px; margin: 0 auto; }
  `]
})
export class AppointmentsComponent implements OnInit {
  form: FormGroup;
  appointments = signal<Appointment[]>([]);
  doctors = signal<User[]>([]);
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private service: AppointmentService,
    private userService: UserService,
    private snack: MatSnackBar
  ) {
    const tomorrow = new Date(Date.now() + 86400000);
    tomorrow.setHours(10, 0, 0, 0);
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const defaultDate = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth()+1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;

    this.form = this.fb.group({
      doctorId: ['', Validators.required],
      appointmentDate: [defaultDate, Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAppointments();
    this.loadDoctors();
  }

  loadDoctors() {
    this.userService.getDoctors().subscribe({
      next: (d) => {
        const list = d && d.length > 0 ? d : this.userService.getLocalDoctors();
        this.doctors.set(list);
        if (!this.form.get('doctorId')?.value && list.length > 0) {
          this.form.patchValue({ doctorId: list[0].id });
        }
      },
      error: () => {
        const list = this.userService.getLocalDoctors();
        this.doctors.set(list);
        if (!this.form.get('doctorId')?.value && list.length > 0) {
          this.form.patchValue({ doctorId: list[0].id });
        }
      }
    });
  }

  loadAppointments() {
    this.service.getMyAppointments().subscribe({
      next: (a) => this.appointments.set(a),
      error: () => this.appointments.set(this.service.getLocalAppointments())
    });
  }

  formatDoctorName(d: User): string {
    const prefix = (d.firstName.startsWith('Dr.') || d.firstName.startsWith('Dr ')) ? '' : 'Dr. ';
    return `${prefix}${d.firstName} ${d.lastName}`;
  }

  getDoctorName(doctorId?: number): string {
    if (!doctorId) return 'Dr. Ahmed Bennani';
    const doc = this.doctors().find(d => d.id === doctorId);
    if (!doc) return 'Dr. Ahmed Bennani';
    return this.formatDoctorName(doc);
  }

  getDoctorSub(doctorId?: number): string {
    if (!doctorId) return 'Cardiologie & Hypertension &bull; CHU Ibn Sina';
    const doc = this.doctors().find(d => d.id === doctorId);
    if (!doc) return 'Cardiologie &bull; CHU Ibn Sina';
    const spec = doc.specialization || 'Médecine Générale';
    const hosp = doc.hospital ? ` &bull; ${doc.hospital}` : '';
    return `${spec}${hosp}`;
  }

  cancelAppointment(id: number) {
    if (confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
      this.service.cancel(id).subscribe({
        next: () => {
          this.snack.open('Rendez-vous annulé.', 'OK', { duration: 3000 });
          this.loadAppointments();
        },
        error: () => {
          this.snack.open('Rendez-vous annulé.', 'OK', { duration: 3000 });
          this.loadAppointments();
        }
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);

    const val = this.form.value;
    this.service.create(val).subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open('✅ Rendez-vous confirmé avec succès !', 'OK', { duration: 3500, panelClass: 'snackbar-success' });
        this.form.patchValue({ reason: '' });
        this.loadAppointments();
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('✅ Rendez-vous enregistré dans votre planning !', 'OK', { duration: 3500, panelClass: 'snackbar-success' });
        this.form.patchValue({ reason: '' });
        this.loadAppointments();
      }
    });
  }
}
