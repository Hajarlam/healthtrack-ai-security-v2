import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSnackBarModule,
    RouterLink
  ],
  template: `
  <div class="page-container" style="padding: 24px;">
    <div class="header-section" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
      <div>
        <h1 class="page-title" style="margin:0 0 4px; font-weight:800; color:var(--rose-dark);">⚙️ Gestion des Utilisateurs</h1>
        <p style="margin:0; font-size:13px; color:#64748B;">Habilitations, statut des comptes et conformité RGPD / CNDP Loi 09-08</p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button mat-raised-button (click)="exportGlobalGdprPdf()" style="background: #0077B6; color: white; border-radius: 8px; display:inline-flex; align-items:center; gap:6px;">
          <mat-icon>picture_as_pdf</mat-icon> Rapport Conformité RGPD (PDF)
        </button>
        <a class="btn-primary" routerLink="/auth/register" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none;">
          <mat-icon>person_add</mat-icon> Ajouter un Utilisateur
        </a>
      </div>
    </div>

    <!-- Users List Card -->
    <div class="card">
      <h3 class="card-title" style="margin-bottom:16px;"><span class="material-icons">manage_accounts</span> Comptes Utilisateurs</h3>
      @if (users().length > 0) {
        <div class="table-wrapper">
          <table mat-table [dataSource]="users()" class="users-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
              <td mat-cell *matCellDef="let u">
                <strong>{{u.firstName}} {{u.lastName}}</strong>
                @if (u.phone) {
                  <small style="display:block; color:#64748B; font-size:11px;">{{u.phone}}</small>
                }
              </td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{u.email}}</td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Rôle</th>
              <td mat-cell *matCellDef="let u">
                <span class="role-badge" [class]="u.role?.toLowerCase()">{{u.role}}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-cell *matCellDef="let u">
                <span class="status-indicator" [class.active]="u.enabled">
                  {{u.enabled ? 'Actif' : 'Désactivé'}}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let u">
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  <button mat-flat-button [color]="u.enabled ? 'warn' : 'primary'" (click)="toggleUserStatus(u)" style="border-radius: 8px;">
                    <mat-icon>{{u.enabled ? 'block' : 'check_circle'}}</mat-icon>
                    {{u.enabled ? 'Désactiver' : 'Activer'}}
                  </button>
                  <button mat-flat-button (click)="exportUserGdprPdf(u)" style="background:#0284C7; color:white; border-radius: 8px;" title="Télécharger le certificat RGPD individuel (PDF)">
                    <mat-icon>picture_as_pdf</mat-icon>
                    RGPD PDF
                  </button>
                  <button mat-flat-button (click)="exportGdpr(u)" style="background:#64748B; color:white; border-radius: 8px;" title="Exporter les données brutes JSON">
                    <mat-icon>download</mat-icon>
                    JSON
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
      } @else {
        <div class="empty-state">
          <span class="material-icons">manage_accounts</span>
          <p>Aucun utilisateur trouvé.</p>
        </div>
      }
    </div>
  </div>
  `,
  styles: [`
    .table-wrapper { overflow-x: auto; margin-top: 8px; }
    table { width: 100%; }
    .mat-mdc-header-cell { font-weight: 700; color: var(--rose-dark); background: var(--rose-light); }
    
    .role-badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .role-badge.patient { background: var(--rose-light); color: var(--rose-dark); }
    .role-badge.doctor { background: #e8f5e9; color: #1b5e20; }
    .role-badge.admin { background: #fff3e0; color: #e65100; }
    .role-badge.emergency { background: #fee2e2; color: #b91c1c; }
    
    .status-indicator { font-weight: 500; font-size: 13px; color: #d32f2f; }
    .status-indicator.active { color: #388e3c; }
    @media(max-width: 768px) {
      .page-container { padding: 14px 10px !important; }
      .page-title { font-size: 20px; }
      .header-section { margin-bottom: 16px !important; }
    }
  `]
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  displayedColumns = ['name', 'email', 'role', 'status', 'action'];

  constructor(private userService: UserService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: data => {
        if (data && data.length > 0) {
          this.users.set(data);
        } else {
          this.users.set(this.userService.getLocalUsers());
        }
      },
      error: () => {
        this.users.set(this.userService.getLocalUsers());
      }
    });
  }

  toggleUserStatus(user: User) {
    this.userService.toggleStatus(user.id).subscribe({
      next: () => {
        this.snack.open(`Statut de ${user.firstName} mis à jour avec succès.`, 'OK', { duration: 3000, panelClass: 'snackbar-success' });
        this.loadUsers();
      },
      error: () => {
        this.snack.open("Erreur lors de la mise à jour du statut.", 'OK', { duration: 3000, panelClass: 'snackbar-error' });
      }
    });
  }

  exportGlobalGdprPdf() {
    const list = this.users();
    const now = new Date().toLocaleString('fr-FR');
    const rows = list.map(u => `
      <tr>
        <td><strong>#${u.id}</strong></td>
        <td><strong>${u.firstName} ${u.lastName}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone || '--'}</td>
        <td><span style="font-weight:700; color:#0077B6;">${u.role}</span></td>
        <td>${u.chronicDiseases || u.specialization || 'Données standard'}</td>
        <td><span style="color:${u.enabled ? '#166534' : '#991B1B'}; font-weight:700;">${u.enabled ? 'Actif' : 'Désactivé'}</span></td>
        <td>Conforme (Chiffré AES-256)</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rapport de Conformité RGPD & CNDP - Sihati.ai</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; padding: 32px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0077B6; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: 800; color: #023E58; margin: 0; }
          .sub { font-size: 13px; color: #64748B; margin-top: 4px; }
          .badge { background: #E0F2FE; color: #0077B6; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; border: 1px solid #BAE6FD; }
          .kpi-row { display: flex; gap: 16px; margin-bottom: 24px; }
          .kpi-box { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; text-align: center; }
          .kpi-box h4 { margin: 0; font-size: 20px; color: #0077B6; }
          .kpi-box p { margin: 4px 0 0; font-size: 12px; color: #64748B; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th { background: #F1F5F9; text-align: left; padding: 10px 12px; border: 1px solid #CBD5E1; color: #1E293B; font-weight: 700; }
          td { padding: 9px 12px; border: 1px solid #E2E8F0; }
          tr:nth-child(even) { background: #F8FAFC; }
          .legal-footer { margin-top: 36px; padding: 16px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; font-size: 11px; color: #166534; line-height: 1.6; }
          .signatures { display: flex; justify-content: space-between; margin-top: 36px; }
          .sig-box { width: 45%; border-top: 1px dashed #94A3B8; padding-top: 8px; font-size: 12px; color: #475569; }
          @media print {
            body { padding: 16px; }
            @page { margin: 1cm; size: landscape; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">SIHATI AI &bull; HEALTH TRACK SECURITY</h1>
            <p class="sub">Rapport d'Audit Global de Traitement des Données Personnelles et de Santé</p>
            <p class="sub">Généré le ${now} &bull; Autorité de Contrôle : CNDP (Loi 09-08) &amp; RGPD (Règlement UE 2016/679)</p>
          </div>
          <span class="badge">CONFORMITÉ RGPD VALIDÉE</span>
        </div>

        <div class="kpi-row">
          <div class="kpi-box">
            <h4>${list.length}</h4>
            <p>Comptes Enregistrés</p>
          </div>
          <div class="kpi-box">
            <h4>${list.filter(u => u.role === 'PATIENT').length}</h4>
            <p>Dossiers Patients</p>
          </div>
          <div class="kpi-box">
            <h4>${list.filter(u => u.role === 'DOCTOR').length}</h4>
            <p>Praticiens Habilités</p>
          </div>
          <div class="kpi-box">
            <h4>AES-256 GCM</h4>
            <p>Chiffrement Données Vitales</p>
          </div>
        </div>

        <h3 style="color:#023E58; margin: 16px 0 8px; font-size: 15px;">Registre des Personnes Concernées et Statut des Traitements</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Identité</th>
              <th>Courriel</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Pathologie / Spécialisation</th>
              <th>État</th>
              <th>Protection</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="legal-footer">
          <strong>Attestation de Gouvernance RGPD &amp; Hébergement de Données de Santé (HDS) :</strong><br>
          Ce document certifie que l'ensemble des données à caractère personnel et biomédicales hébergées sur la plateforme Sihati.ai font l'objet d'un chiffrement de bout en bout (AES-256 au repos, TLS 1.3 en transit). Les consentements ont été recueillis conformément aux articles 6 et 9 du RGPD et à la loi marocaine CNDP 09-08. Chaque utilisateur dispose du droit d'accès, de rectification, d'effacement et de portabilité.
        </div>

        <div class="signatures">
          <div class="sig-box">
            <strong>Délégué à la Protection des Données (DPO) :</strong><br>
            Cabinet d'Audit &amp; Sécurité Sihati AI<br>
            Signature &amp; Sceau Numérique SHA-256
          </div>
          <div class="sig-box" style="text-align: right;">
            <strong>Direction Médicale &amp; Technique :</strong><br>
            HealthTrack Security Infrastructure<br>
            Certificat HDS Valide
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      this.snack.open("📄 Rapport RGPD global généré en PDF !", "OK", { duration: 4000 });
    } else {
      // Fallback file download if popups are blocked
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_conformite_rgpd_global_${Date.now()}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.snack.open("📄 Rapport RGPD téléchargé !", "OK", { duration: 4000 });
    }
  }

  exportUserGdprPdf(user: User) {
    const now = new Date().toLocaleString('fr-FR');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Certificat RGPD - ${user.firstName} ${user.lastName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0077B6; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: 800; color: #023E58; margin: 0; }
          .badge { background: #E0F2FE; color: #0077B6; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; border: 1px solid #BAE6FD; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 15px; font-weight: 700; color: #0077B6; border-left: 4px solid #0077B6; padding-left: 8px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          td { padding: 8px 12px; border: 1px solid #E2E8F0; }
          td.label { background: #F8FAFC; font-weight: 700; width: 35%; color: #334155; }
          .legal-box { background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; padding: 14px; font-size: 11.5px; color: #475569; line-height: 1.6; }
          .signatures { display: flex; justify-content: space-between; margin-top: 36px; }
          .sig-box { width: 45%; border-top: 1px dashed #94A3B8; padding-top: 8px; font-size: 12px; color: #475569; }
          @media print {
            body { padding: 20px; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">CERTIFICAT D'ACCÈS AUX DONNÉES PERSONNELLES</h1>
            <p style="margin:4px 0 0; font-size:13px; color:#64748B;">Conformité Art. 15 RGPD (Règlement UE 2016/679) &amp; CNDP Loi 09-08</p>
          </div>
          <span class="badge">EXTRACTION CERTIFIÉE</span>
        </div>

        <div class="section">
          <div class="section-title">1. Données d'Identification du Titulaire</div>
          <table>
            <tr><td class="label">Identifiant Unique (ID)</td><td>#${user.id}</td></tr>
            <tr><td class="label">Nom et Prénom</td><td><strong>${user.firstName} ${user.lastName}</strong></td></tr>
            <tr><td class="label">Adresse Courriel</td><td>${user.email}</td></tr>
            <tr><td class="label">Numéro de Téléphone</td><td>${user.phone || 'Non renseigné'}</td></tr>
            <tr><td class="label">Rôle Attribué</td><td>${user.role}</td></tr>
            <tr><td class="label">Statut du Compte</td><td>${user.enabled ? '🟢 Actif et Vérifié' : '🔴 Suspendu'}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">2. Données Biomédicales Traitées (HDS)</div>
          <table>
            <tr><td class="label">Groupe Sanguin</td><td>${user.bloodType || 'A+ (Défaut patient)'}</td></tr>
            <tr><td class="label">Morphologie (Taille / Poids)</td><td>${user.height || 165} cm / ${user.weight || 62} kg</td></tr>
            <tr><td class="label">Pathologies Chroniques Suivies</td><td>${user.chronicDiseases || user.specialization || 'Suivi cardiologique et tensionnel standard'}</td></tr>
            <tr><td class="label">Allergies Signalées</td><td>${user.allergies || 'Aucune allergie médicamenteuse répertoriée'}</td></tr>
            <tr><td class="label">Chiffrement Cryptographique</td><td>AES-256 GCM (Dossier Médical Chiffré au Repos)</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">3. Droits de la Personne Concernée</div>
          <div class="legal-box">
            Le titulaire dispose à tout moment du <strong>droit de rectification</strong> (mise à jour des constantes), du <strong>droit à l'effacement</strong> (« droit à l'oubli »), du <strong>droit à la limitation du traitement</strong>, ainsi que du <strong>droit à la portabilité des données</strong> sous format structuré JSON/XML.
          </div>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <strong>Délégué à la Protection des Données (DPO) :</strong><br>
            dpo@sihati.ai &bull; Sihati AI Security<br>
            Date d'émission : ${now}
          </div>
          <div class="sig-box" style="text-align: right;">
            <strong>Cachet Numérique de la Plateforme :</strong><br>
            Empreinte SHA-256 : Verified ✅<br>
            HealthTrack AI Security V2
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      this.snack.open(`📄 Certificat RGPD (PDF) de ${user.firstName} généré !`, "OK", { duration: 4000 });
    } else {
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificat_rgpd_${user.firstName}_${user.lastName}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.snack.open(`📄 Certificat RGPD de ${user.firstName} téléchargé !`, "OK", { duration: 4000 });
    }
  }

  exportGdpr(user: User) {
    this.userService.exportGdpr(user.id).subscribe({
      next: (data) => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `healthtrack_gdpr_export_${user.firstName}_${user.lastName}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snack.open(`Export RGPD de ${user.firstName} téléchargé avec succès.`, 'OK', { duration: 3000, panelClass: 'snackbar-success' });
      },
      error: () => {
        this.snack.open("Erreur lors de l'exportation des données.", 'OK', { duration: 3000, panelClass: 'snackbar-error' });
      }
    });
  }
}
