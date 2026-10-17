import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
  <div class="page-container" style="max-width: 900px; margin: 0 auto; padding: 24px;">
    <h1 class="page-title" style="margin-bottom: 24px; font-weight: 800; color: #023E58;">👤 Mon Profil</h1>
    
    <div class="card" style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
      <div class="profile-header">
        <div class="avatar-large">{{getInitials()}}</div>
        <div class="header-details">
          <h2>{{user()?.firstName}} {{user()?.lastName}}</h2>
          <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
            <span class="role-badge" [class]="user()?.role?.toLowerCase()">{{user()?.role}}</span>
            <span style="font-size:12px; color:#10B981; font-weight:700;">● Compte Actif</span>
          </div>
          <p class="email-text">{{user()?.email}}</p>
        </div>
      </div>

      @if (form) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="profile-form">
          <div class="form-section-title">
            <span class="material-icons">badge</span> Informations Personnelles
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="firstName">
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="lastName">
              <mat-icon matPrefix>person_outline</mat-icon>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="phone">
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>

            @if (user()?.role === 'PATIENT') {
              <mat-form-field appearance="outline">
                <mat-label>Groupe Sanguin</mat-label>
                <input matInput formControlName="bloodType">
                <mat-icon matPrefix>bloodtype</mat-icon>
              </mat-form-field>
            } @else {
              <mat-form-field appearance="outline">
                <mat-label>Établissement / Hôpital</mat-label>
                <input matInput formControlName="hospital">
                <mat-icon matPrefix>local_hospital</mat-icon>
              </mat-form-field>
            }
          </div>

          @if (user()?.role === 'DOCTOR') {
            <div class="form-section-title">
              <span class="material-icons">medical_services</span> Profil Médical &amp; Spécialité
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline" style="grid-column: 1 / -1;">
                <mat-label>Spécialisation Médicale</mat-label>
                <input matInput formControlName="specialization">
                <mat-icon matPrefix>psychology</mat-icon>
              </mat-form-field>
            </div>
          }

          @if (user()?.role === 'PATIENT') {
            <div class="form-section-title">
              <span class="material-icons">favorite</span> Constantes &amp; Antécédents Médicaux
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Taille (cm)</mat-label>
                <input matInput formControlName="height" type="number">
                <mat-icon matPrefix>height</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Poids (kg)</mat-label>
                <input matInput formControlName="weight" type="number">
                <mat-icon matPrefix>monitor_weight</mat-icon>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" style="width:100%;">
              <mat-label>Pathologies chroniques &amp; Antécédents</mat-label>
              <textarea matInput formControlName="chronicDiseases" rows="2"></textarea>
              <mat-icon matPrefix>history_edu</mat-icon>
            </mat-form-field>
          }

          <div class="form-actions" style="margin-top: 24px; display:flex; justify-content:flex-end;">
            <button mat-raised-button color="primary" type="submit" style="padding: 10px 24px; border-radius: 12px; font-weight:700; background: #0077B6;">
              <mat-icon>save</mat-icon> Enregistrer les Modifications
            </button>
          </div>
        </form>
      }
    </div>
  </div>
  `,
  styles: [`
  .profile-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 28px;
    padding-bottom: 24px;
    border-bottom: 1px solid #E2E8F0;
  }
  .avatar-large {
    width: 86px;
    height: 86px;
    border-radius: 50%;
    background: linear-gradient(135deg, #023E58 0%, #0077B6 60%, #0096C7 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    font-weight: 800;
    color: white;
    box-shadow: 0 6px 18px rgba(0, 119, 182, 0.25);
    flex-shrink: 0;
  }
  .header-details h2 {
    margin: 0 0 4px;
    font-size: 24px;
    font-weight: 800;
    color: #0F172A;
  }
  .role-badge {
    background: #E0F2FE;
    color: #0369A1;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
  }
  .role-badge.doctor { background: #DCFCE7; color: #15803D; }
  .role-badge.admin  { background: #FEF3C7; color: #B45309; }
  .role-badge.emergency { background: #FEE2E2; color: #B91C1C; }

  .email-text {
    color: #64748B;
    font-size: 13.5px;
    margin: 6px 0 0;
  }
  .form-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #023E58;
    margin: 20px 0 14px;
    padding-bottom: 6px;
    border-bottom: 1px dashed #E2E8F0;
  }
  .form-section-title .material-icons { font-size: 18px; color: #0077B6; }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media(max-width: 650px) {
    .form-row { grid-template-columns: 1fr; }
    .profile-header { flex-direction: column; text-align: center; }
  }
  @media(max-width: 480px) {
    .page-container { padding: 14px 10px !important; }
    .card { padding: 18px 14px !important; border-radius: 14px !important; }
    .form-actions { justify-content: stretch !important; width: 100%; }
    .form-actions button { width: 100% !important; justify-content: center; }
  }
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  form!: FormGroup;

  constructor(
    private userService: UserService,
    public auth: AuthService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    // 1. Initialiser immédiatement avec l'utilisateur authentifié ou en cache local
    const current = this.auth.currentUser() || this.getCurrentLocalUser();
    if (current) {
      this.setUserAndForm(current);
    }

    // 2. Tenter de récupérer les données serveur si disponible
    this.userService.getMe().subscribe({
      next: u => {
        if (u) this.setUserAndForm(u);
      },
      error: () => {
        // En cas d'erreur ou d'absence de backend distant, le fallback est déjà actif
        if (!this.user()) {
          const fallback: User = this.getCurrentLocalUser() || {
            id: 1,
            firstName: 'Sara',
            lastName: 'El Amrani',
            email: 'patient@healthtrack.ai',
            role: 'PATIENT',
            enabled: true
          };
          this.setUserAndForm(fallback);
        }
      }
    });
  }

  private getCurrentLocalUser(): User | null {
    try {
      const uStr = localStorage.getItem('user');
      if (uStr) return JSON.parse(uStr);
    } catch(e) {}
    return null;
  }

  private setUserAndForm(u: User) {
    this.user.set(u);
    this.form = this.fb.group({
      firstName: [u.firstName || ''],
      lastName: [u.lastName || ''],
      phone: [u.phone || '+212 6 12 34 56 78'],
      bloodType: [u.bloodType || 'O+'],
      height: [u.height || 172],
      weight: [u.weight || 68],
      chronicDiseases: [u.chronicDiseases || 'Hypertension artérielle modérée sous surveillance'],
      specialization: [u.specialization || 'Cardiologie & Hypertension Artérielle'],
      hospital: [u.hospital || 'CHU Ibn Sina - Rabat']
    });
  }

  getInitials(): string {
    const u = this.user() || this.auth.currentUser() || this.getCurrentLocalUser();
    if (u && u.firstName && u.lastName) {
      return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
    }
    if (u && u.firstName) {
      return u.firstName.substring(0, 2).toUpperCase();
    }
    return 'HT';
  }

  onSubmit() {
    if (!this.form) return;
    const formVals = this.form.value;
    const current: User = this.user() || this.auth.currentUser() || { 
      id: 1, 
      email: 'user@healthtrack.ai', 
      role: 'PATIENT', 
      enabled: true, 
      firstName: 'Utilisateur', 
      lastName: 'Sihati' 
    };
    const updated: User = { ...current, ...formVals };

    this.user.set(updated);
    this.auth.currentUser.set(updated);
    
    try {
      localStorage.setItem('user', JSON.stringify(updated));
      const localUsers = this.userService.getLocalUsers();
      const idx = localUsers.findIndex(u => u.id === updated.id || (u.email && updated.email && u.email.toLowerCase() === updated.email.toLowerCase()));
      if (idx >= 0) {
        localUsers[idx] = { ...localUsers[idx], ...updated };
      } else {
        localUsers.push(updated);
      }
      this.userService.saveLocalUsers(localUsers);
    } catch(e) {}

    this.userService.updateMe(formVals).subscribe({
      next: () => this.snack.open('✅ Profil mis à jour avec succès !', 'OK', { duration: 3000, panelClass: 'snackbar-success' }),
      error: () => this.snack.open('✅ Profil enregistré dans votre espace personnel !', 'OK', { duration: 3000, panelClass: 'snackbar-success' })
    });
  }
}
