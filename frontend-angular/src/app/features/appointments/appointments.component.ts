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
    <h1 class="page-title">📅 Rendez-vous</h1>
    <div class="grid-2">
      <div class="card">
        <h3 class="section-title"><span class="material-icons">event_available</span> Prendre un rendez-vous</h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>Médecin</mat-label>
            <mat-select formControlName="doctorId">
              @for (d of doctors(); track d.id) {
                <mat-option [value]="d.id">Dr. {{d.firstName}} {{d.lastName}} — {{d.specialization}}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Date et heure</mat-label>
            <input matInput formControlName="appointmentDate" type="datetime-local">
            <mat-icon matPrefix>calendar_today</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Motif de consultation</mat-label>
            <textarea matInput formControlName="reason" rows="3"></textarea>
            <mat-icon matPrefix>description</mat-icon>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading()">
            <mat-icon>event_available</mat-icon> Confirmer le rendez-vous
          </button>
        </form>
      </div>
      <div class="card">
        <h3 class="section-title"><span class="material-icons">event_note</span> Mes rendez-vous</h3>
        @for (a of appointments(); track a.id) {
          <div class="appt-card" [class]="'status-' + a.status?.toLowerCase()">
            <div class="appt-info">
              <strong>{{a.appointmentDate | date:'dd/MM/yyyy à HH:mm'}}</strong>
              <p>{{a.reason}}</p>
            </div>
            <span class="badge" [class]="a.status?.toLowerCase()">{{a.status}}</span>
          </div>
        }
        @if (appointments().length === 0) {
          <div class="empty-state"><span class="material-icons">event_busy</span><p>Aucun rendez-vous</p></div>
        }
      </div>
    </div>
  </div>
  `,
  styles: [`
  .appt-card{display:flex;justify-content:space-between;align-items:center;padding:14px;border-radius:10px;background:#f5f7fa;margin-bottom:10px;border-left:4px solid #1976d2;}
  .appt-info strong{font-size:14px;} .appt-info p{font-size:12px;color:#757575;margin:2px 0 0;}
  .status-cancelled{border-left-color:#f44336;opacity:.7;}
  .status-confirmed{border-left-color:#4caf50;}
  `]
})
export class AppointmentsComponent implements OnInit {
  form: FormGroup;
  appointments = signal<Appointment[]>([]);
  doctors = signal<User[]>([]);
  loading = signal(false);

  constructor(private fb: FormBuilder, private service: AppointmentService,
              private userService: UserService, private snack: MatSnackBar) {
    this.form = this.fb.group({
      doctorId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      reason: ['']
    });
  }

  ngOnInit() {
    this.service.getMyAppointments().subscribe({ next: a => this.appointments.set(a), error: () => {} });
    this.userService.getDoctors().subscribe({ next: d => this.doctors.set(d), error: () => {} });
  }

  onSubmit() {
    this.loading.set(true);
    this.service.create(this.form.value).subscribe({
      next: () => {
        this.loading.set(false); this.form.reset();
        this.service.getMyAppointments().subscribe({ next: a => this.appointments.set(a) });
        this.snack.open('Rendez-vous confirmé !', 'OK', { duration: 3000, panelClass: 'snackbar-success' });
      },
      error: () => { this.loading.set(false); this.snack.open('Erreur', 'X', { duration: 3000, panelClass: 'snackbar-error' }); }
    });
  }
}
