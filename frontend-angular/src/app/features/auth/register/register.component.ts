import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatSnackBarModule],
  template: `
  <div class="reg-wrap">
    <div class="reg-box">
      <div class="reg-header" style="text-align: center; margin-bottom: 24px;">
        <span class="material-icons hicon" style="background: linear-gradient(135deg, #0077B6, #00B4D8); color: white; border-radius: 12px; padding: 10px; font-size: 28px; box-shadow: 0 4px 12px rgba(0, 119, 182, 0.2); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">monitor_heart</span>
        <h2 style="font-size: 24px; font-weight: 800; color: #023E58; margin: 0 0 4px;">Créer un compte</h2>
        <div style="display: inline-flex; align-items: center; gap: 6px; justify-content: center;">
          <span style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 15px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, #023E58 30%, #0077B6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Sihati</span>
          <span style="background: linear-gradient(135deg, #0077B6, #0096C7); color: white; border-radius: 5px; font-size: 8px; font-weight: 900; padding: 1px 4px; letter-spacing: 0.5px;">Ai</span>
          <span style="color: #90a4ae; font-size: 13px; margin-left: 2px;">— Inscription</span>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="firstName">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="lastName">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Adresse email</mat-label>
          <input matInput formControlName="email" type="email">
          <mat-icon matSuffix style="color:#0077B6">email</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Mot de passe (min. 8 caractères)</mat-label>
          <input matInput formControlName="password" type="password">
          <mat-icon matSuffix style="color:#0077B6">lock</mat-icon>
        </mat-form-field>

        <!-- Rôle avec description visuelle -->
        <div class="role-section">
          <label class="role-label">Je suis :</label>
          <div class="role-grid">
            @for (r of roles; track r.value) {
              <div class="role-card" [class.selected]="form.get('role')?.value === r.value"
                   (click)="form.get('role')?.setValue(r.value)">
                <span class="material-icons">{{r.icon}}</span>
                <strong>{{r.label}}</strong>
                <small>{{r.desc}}</small>
              </div>
            }
          </div>
        </div>

        @if (form.get('role')?.value === 'DOCTOR') {
          <mat-form-field appearance="outline">
            <mat-label>Spécialisation</mat-label>
            <input matInput formControlName="specialization" placeholder="Ex: Cardiologie">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Hôpital / Clinique</mat-label>
            <input matInput formControlName="hospital">
          </mat-form-field>
        }

        <button class="btn-register" type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Inscription...' : "S'inscrire" }}
        </button>
      </form>

      <p class="link-row">Déjà inscrit ? <a routerLink="/auth/login">Se connecter</a></p>
    </div>
  </div>
  `,
  styles: [`
  .reg-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#005F8E,#0077B6,#0096C7);padding:24px;}
  .reg-box{background:white;border-radius:20px;padding:32px;width:100%;max-width:540px;box-shadow:0 20px 60px rgba(0,95,142,.3);}
  .reg-header{text-align:center;margin-bottom:24px;}
  .hicon{font-size:44px;color:#0077B6;display:block;margin-bottom:8px;}
  .reg-header h2{font-size:24px;font-weight:800;color:#023E58;margin:0;}
  .reg-header p{color:#4A7C94;font-size:13px;margin-top:4px;}
  mat-form-field{width:100%;margin-bottom:4px;}
  .role-section{margin:12px 0 16px;}
  .role-label{font-size:13px;font-weight:600;color:#023E58;display:block;margin-bottom:10px;}
  .role-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  .role-card{border:2px solid #C0DEE9;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer;transition:all .2s;}
  .role-card:hover{border-color:#0077B6;background:#CAF0F8;}
  .role-card.selected{border-color:#0077B6;background:#CAF0F8;}
  .role-card .material-icons{font-size:28px;color:#0077B6;display:block;margin-bottom:4px;}
  .role-card strong{font-size:12px;color:#023E58;display:block;}
  .role-card small{font-size:10px;color:#4A7C94;display:block;margin-top:2px;}
  .btn-register{width:100%;height:50px;border-radius:12px;background:linear-gradient(135deg,#0077B6,#005F8E);color:white;border:none;font-size:15px;font-weight:700;cursor:pointer;margin-top:8px;transition:opacity .2s;text-shadow:0 1px 2px rgba(0,0,0,.1);}
  .btn-register:hover:not(:disabled){opacity:.9;} .btn-register:disabled{opacity:.6;cursor:not-allowed;}
  .link-row{text-align:center;margin-top:16px;font-size:14px;color:#4A7C94;}
  .link-row a{color:#0077B6;font-weight:600;text-decoration:none;}
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);

  roles = [
    {value:'PATIENT',  icon:'person',          label:'Patient',   desc:'Suivi santé'},
    {value:'DOCTOR',   icon:'local_hospital',  label:'Médecin',   desc:'Gestion patients'},
    {value:'EMERGENCY',icon:'emergency',        label:'Urgentiste',desc:'Accès urgences'},
  ];

  constructor(private fb: FormBuilder, private auth: AuthService,
              private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      firstName:      ['', Validators.required],
      lastName:       ['', Validators.required],
      email:          ['', [Validators.required, Validators.email]],
      password:       ['', [Validators.required, Validators.minLength(8)]],
      role:           ['PATIENT', Validators.required],
      specialization: [''],
      hospital:       ['']
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.snack.open('✅ Inscription réussie ! Connectez-vous.', 'OK',
          {duration:3000, panelClass:'snack-ok'});
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snack.open(err.error?.error || "Erreur d'inscription", '✕',
          {duration:3500, panelClass:'snack-err'});
      }
    });
  }
}
