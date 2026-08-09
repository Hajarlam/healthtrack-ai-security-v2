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
    <div class="header-section" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
      <h1 class="page-title" style="margin:0; font-weight:800; color:var(--rose-dark);">⚙️ Gestion des Utilisateurs</h1>
      <a class="btn-primary" routerLink="/auth/register" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none;">
        <mat-icon>person_add</mat-icon> Ajouter un Utilisateur
      </a>
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
                <div style="display:flex; gap:8px;">
                  <button mat-flat-button [color]="u.enabled ? 'warn' : 'primary'" (click)="toggleUserStatus(u)" style="border-radius: 8px;">
                    <mat-icon>{{u.enabled ? 'block' : 'check_circle'}}</mat-icon>
                    {{u.enabled ? 'Désactiver' : 'Activer'}}
                  </button>
                  <button mat-flat-button (click)="exportGdpr(u)" style="background:var(--beige-dark); color:white; border-radius: 8px;" title="Exporter toutes les données (RGPD)">
                    <mat-icon>download</mat-icon>
                    RGPD
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
    
    .status-indicator { font-weight: 500; font-size: 13px; color: #d32f2f; }
    .status-indicator.active { color: #388e3c; }
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
      next: data => this.users.set(data),
      error: () => {}
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
