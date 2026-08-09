import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';

interface AuditLog {
  id: number;
  userEmail: string;
  action: string;
  ipAddress: string;
  status: string;
  timestamp: string;
}

@Component({
  selector: 'app-security-audit',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-container" style="padding: 24px;">
      <h1 class="page-title" style="margin-bottom:24px; font-weight:800; color:var(--rose-dark);">🛡️ Audit de Sécurité</h1>
      
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px;">
          <span class="material-icons">history</span> Événements de Sécurité Récents
        </h3>
        
        @if (logs().length > 0) {
          <div class="table-wrapper">
            <table mat-table [dataSource]="logs()" class="audit-table">
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef>Horodatage</th>
                <td mat-cell *matCellDef="let log">
                  {{log.timestamp | date:'dd/MM/yyyy HH:mm:ss'}}
                </td>
              </ng-container>
              
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>Utilisateur / Email</th>
                <td mat-cell *matCellDef="let log">
                  <strong>{{log.userEmail}}</strong>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let log">
                  {{log.action}}
                </td>
              </ng-container>
              
              <ng-container matColumnDef="ip">
                <th mat-header-cell *matHeaderCellDef>Adresse IP</th>
                <td mat-cell *matCellDef="let log">
                  <code>{{log.ipAddress}}</code>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Résultat</th>
                <td mat-cell *matCellDef="let log">
                  <span class="status-badge" [class.success]="log.status === 'SUCCESS'" [class.failed]="log.status === 'FAILED'">
                    {{log.status}}
                  </span>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>
        } @else {
          <div class="empty-state" style="text-align:center; padding: 48px 0;">
            <span class="material-icons" style="font-size: 48px; color: var(--border);">gavel</span>
            <p>Aucun log d'audit trouvé.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; }
    .mat-mdc-header-cell { font-weight: 700; color: var(--rose-dark); background: var(--rose-light); }
    
    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .status-badge.success { background: #e8f5e9; color: #2e7d32; }
    .status-badge.failed { background: #ffebee; color: #c62828; }
    
    code { font-family: monospace; background: var(--bg); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
  `]
})
export class SecurityAuditComponent implements OnInit {
  logs = signal<AuditLog[]>([]);
  displayedColumns = ['timestamp', 'user', 'action', 'ip', 'status'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.http.get<AuditLog[]>(`${environment.apiUrl}/audit/all`).subscribe({
      next: data => this.logs.set(data),
      error: () => {}
    });
  }
}
