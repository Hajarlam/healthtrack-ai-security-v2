import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule],
  template: `
  <div class="auth-wrap">
    <div class="auth-left">
      <div class="brand">
        <div class="brand-icon" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 8px 32px rgba(0,0,0,0.1); backdrop-filter: blur(4px);">
          <span class="material-icons" style="text-shadow: 0 0 10px rgba(255,255,255,0.5);">monitor_heart</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 10px;">
          <h1 style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 38px; font-weight: 800; letter-spacing: -1px; background: linear-gradient(135deg, #FFFFFF 40%, #90E0EF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">Sihati</h1>
          <span style="background: linear-gradient(135deg, #48CAE4, #00B4D8); color: #003049; border-radius: 8px; font-size: 11px; font-weight: 900; padding: 3px 8px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(72, 202, 228, 0.4); border: 1px solid rgba(255,255,255,0.3);">AI</span>
        </div>
        <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 8px;">Plateforme intelligente de suivi de santé</p>
      </div>
      <div class="features">
        <div class="feat"><span class="material-icons">favorite</span><span>Suivi des constantes vitales en temps réel</span></div>
        <div class="feat"><span class="material-icons">notifications_active</span><span>Alertes automatiques critiques</span></div>
        <div class="feat"><span class="material-icons">chat</span><span>Messagerie sécurisée médecin/patient</span></div>
        <div class="feat"><span class="material-icons">psychology</span><span>Intelligence Artificielle intégrée</span></div>
      </div>
      <div class="deco-c1"></div><div class="deco-c2"></div>
    </div>

    <div class="auth-right">
      <div class="form-box">
        <h2>Accès</h2>
        <p class="sub">Espace sécurisé</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>Adresse email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="votre@email.com">
            <mat-icon matSuffix style="color:#0077B6">email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mot de passe</mat-label>
            <input matInput formControlName="password" [type]="showPwd() ? 'text' : 'password'">
            <button mat-icon-button matSuffix type="button" (click)="showPwd.set(!showPwd())">
              <mat-icon style="color:#0077B6">{{showPwd() ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>

          <button class="btn-login" type="submit" [disabled]="loading() || form.invalid">
            @if (loading()) { <mat-spinner diameter="18" style="margin:0 auto"></mat-spinner> }
            @else { <span class="material-icons">login</span> Continuer }
          </button>
        </form>

        <div class="demo-box">
          <p>▸ Comptes de démo</p>
          <div class="demo-row">
            <button class="demo-btn" (click)="fill('patient')">🏥 Patient</button>
            <button class="demo-btn" (click)="fill('doctor')">👨‍⚕️ Médecin</button>
            <button class="demo-btn" (click)="fill('admin')">⚙️ Admin</button>
          </div>
        </div>
        <p class="link-row">Pas encore inscrit ? <a routerLink="/auth/register">Créer un compte</a></p>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .auth-wrap{display:flex;min-height:100vh;background:linear-gradient(145deg,#005F8E 0%,#0077B6 55%,#0096C7 100%);}
  .auth-left{flex:1;background:linear-gradient(145deg,#005F8E 0%,#0077B6 60%,#0096C7 100%);display:flex;flex-direction:column;justify-content:center;padding:48px 40px;position:relative;overflow:hidden;}
  .brand{z-index:2;position:relative;margin-bottom:40px;}
  .brand-icon{width:60px;height:60px;border-radius:16px;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
  .brand-icon .material-icons{font-size:34px;color:white;}
  .brand h1{font-size:34px;font-weight:800;color:white;margin:0;text-shadow:0 1px 3px rgba(0,0,0,.1);} .brand h1 em{font-style:normal;color:#48CAE4;}
  .brand p{color:rgba(255,255,255,.9);font-size:15px;margin-top:6px;}
  .features{z-index:2;position:relative;display:flex;flex-direction:column;gap:16px;}
  .feat{display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.95);font-size:14px;}
  .feat .material-icons{background:rgba(255,255,255,.2);border-radius:10px;padding:8px;font-size:20px;flex-shrink:0;}
  .deco-c1{position:absolute;width:320px;height:320px;border-radius:50%;background:rgba(255,255,255,.06);top:-100px;right:-100px;}
  .deco-c2{position:absolute;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.06);bottom:-60px;left:-60px;}
  .auth-right{flex:1;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);padding:40px;}
  .form-box{width:100%;max-width:420px;background:rgba(255,255,255,.97);border-radius:20px;padding:32px;box-shadow:0 20px 60px rgba(0,95,142,.3);}
  .form-box h2{font-size:28px;font-weight:800;color:#023E58;margin-bottom:4px;}
  .sub{color:#4A7C94;font-size:14px;margin-bottom:28px;}
  mat-form-field{width:100%;margin-bottom:4px;}
  .btn-login{width:100%;height:50px;border-radius:12px;background:linear-gradient(135deg,#0077B6,#005F8E);color:white;border:none;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s;margin-top:8px;text-shadow:0 1px 2px rgba(0,0,0,.1);}
  .btn-login:hover:not(:disabled){opacity:.9;} .btn-login:disabled{opacity:.6;cursor:not-allowed;}
  .demo-box{margin-top:24px;background:#CAF0F8;border-radius:12px;padding:14px;}
  .demo-box p{font-size:12px;color:#023E58;font-weight:700;margin-bottom:8px;}
  .demo-row{display:flex;gap:8px;}
  .demo-btn{flex:1;padding:8px 0;border-radius:8px;border:2px solid #0077B6;background:white;color:#023E58;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;}
  .demo-btn:hover{background:#0077B6;color:white;}
  .link-row{text-align:center;margin-top:16px;font-size:14px;color:#4A7C94;}
  .link-row a{color:#0077B6;font-weight:600;text-decoration:none;}
  .link-row a:hover{text-decoration:underline;}
  @media(max-width:768px){.auth-left{display:none;}.auth-right{padding:24px;}}
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  showPwd = signal(false);

  constructor(private fb: FormBuilder, private auth: AuthService,
              private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    if (this.auth.isLoggedIn()) this.router.navigate(['/dashboard']);
  }

  fill(role: string) {
    const acc: Record<string,{email:string;password:string}> = {
      patient: {email:'patient@healthtrack.ai', password:'Patient@123'},
      doctor:  {email:'doctor@healthtrack.ai',  password:'Doctor@123'},
      admin:   {email:'admin@healthtrack.ai',   password:'Admin@123'}
    };
    this.form.patchValue(acc[role]);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
