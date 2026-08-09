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
  <div class="page-container">
    <h1 class="page-title">👤 Mon Profil</h1>
    <div class="card">
      <div class="profile-header">
        <div class="avatar-large">{{getInitials()}}</div>
        <div>
          <h2>{{user()?.firstName}} {{user()?.lastName}}</h2>
          <span class="role-badge">{{user()?.role}}</span>
          <p style="color:#757575;font-size:13px;margin-top:4px">{{user()?.email}}</p>
        </div>
      </div>
      @if (form) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Prénom</mat-label><input matInput formControlName="firstName"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Nom</mat-label><input matInput formControlName="lastName"></mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Téléphone</mat-label><input matInput formControlName="phone"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Groupe sanguin</mat-label><input matInput formControlName="bloodType"></mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Taille (cm)</mat-label><input matInput formControlName="height" type="number"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Poids (kg)</mat-label><input matInput formControlName="weight" type="number"></mat-form-field>
          </div>
          <mat-form-field appearance="outline"><mat-label>Maladies chroniques</mat-label><textarea matInput formControlName="chronicDiseases" rows="2"></textarea></mat-form-field>
          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit"><mat-icon>save</mat-icon> Sauvegarder</button>
          </div>
        </form>
      }
    </div>
  </div>
  `,
  styles: [`
  .profile-header{display:flex;align-items:center;gap:20px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid #e0e0e0;}
  .avatar-large{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#1976d2,#26c6da);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:white;}
  .role-badge{background:#e3f2fd;color:#1565c0;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600;}
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  form!: FormGroup;

  constructor(private userService: UserService, public auth: AuthService,
              private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit() {
    this.userService.getMe().subscribe({ next: u => {
      this.user.set(u);
      this.form = this.fb.group({
        firstName: [u.firstName], lastName: [u.lastName], phone: [u.phone],
        bloodType: [u.bloodType], height: [u.height], weight: [u.weight],
        chronicDiseases: [u.chronicDiseases]
      });
    }, error: () => {} });
  }

  getInitials(): string {
    const u = this.user();
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : 'HT';
  }

  onSubmit() {
    this.userService.updateMe(this.form.value).subscribe({
      next: () => this.snack.open('Profil mis à jour !', 'OK', { duration: 3000, panelClass: 'snackbar-success' }),
      error: () => this.snack.open('Erreur', 'X', { duration: 3000, panelClass: 'snackbar-error' })
    });
  }
}
