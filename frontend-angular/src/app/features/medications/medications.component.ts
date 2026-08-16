import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MedicationService } from '../../core/services/medication.service';
import { Medication } from '../../core/models/medication.model';

@Component({
  selector: 'app-medications',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  template: `
  <div class="page-container">
    <h1 class="page-title">💊 Gestion des Médicaments</h1>

    <div class="grid-2">
      <!-- Add Medication Form -->
      <div class="card">
        <h3 class="section-title"><span class="material-icons">add_circle</span> Ajouter un Médicament</h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>Nom du Médicament</mat-label>
            <input matInput formControlName="name" placeholder="Ex: Paracétamol, Doliprane...">
            <mat-icon matPrefix>medication</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Dosage</mat-label>
            <input matInput formControlName="dosage" placeholder="Ex: 500mg, 1 comprimé...">
            <mat-icon matPrefix>scale</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fréquence</mat-label>
            <input matInput formControlName="frequency" placeholder="Ex: 3 fois par jour, Matin et Soir...">
            <mat-icon matPrefix>schedule</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Instructions de prise</mat-label>
            <textarea matInput formControlName="instructions" placeholder="Ex: Pendant le repas, avec un grand verre d'eau..."></textarea>
            <mat-icon matPrefix>description</mat-icon>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="loading() || form.invalid">
              <mat-icon>save</mat-icon> Ajouter
            </button>
          </div>
        </form>
      </div>

      <!-- Medications List -->
      <div class="card">
        <h3 class="section-title"><span class="material-icons">list</span> Liste de mes Médicaments</h3>
        @if (medications().length > 0) {
          <div class="meds-list" style="display:flex; flex-direction:column; gap:16px;">
            @for (med of medications(); track med.id) {
              <div class="med-item" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; display:flex; justify-content:space-between; align-items:center; background:#f9f9f9;">
                <div>
                  <h4 style="margin:0 0 4px; font-size:16px; color:#1565c0;">{{med.name}}</h4>
                  <p style="margin:0 0 2px; font-size:13px; color:#424242;"><strong>Dosage :</strong> {{med.dosage}}</p>
                  <p style="margin:0 0 2px; font-size:13px; color:#424242;"><strong>Fréquence :</strong> {{med.frequency}}</p>
                  @if (med.instructions) {
                    <p style="margin:4px 0 0; font-size:12px; color:#757575; font-style:italic;"><strong>Note :</strong> {{med.instructions}}</p>
                  }
                </div>
                <button mat-icon-button color="warn" (click)="deleteMedication(med)" title="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state" style="padding: 40px 0;">
            <span class="material-icons" style="font-size:48px;">medication</span>
            <p>Aucun médicament enregistré pour le moment.</p>
          </div>
        }
      </div>
    </div>
  </div>
  `
})
export class MedicationsComponent implements OnInit {
  form: FormGroup;
  medications = signal<Medication[]>([]);
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private medService: MedicationService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      instructions: ['']
    });
  }

  ngOnInit() {
    this.loadMedications();
  }

  loadMedications() {
    this.medService.getMedications().subscribe({
      next: data => this.medications.set(data),
      error: () => {}
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.medService.addMedication(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.form.reset();
        this.snack.open('Médicament ajouté avec succès !', 'OK', { duration: 3000, panelClass: 'snackbar-success' });
        this.loadMedications();
      },
      error: () => {
        this.loading.set(false);
        this.snack.open("Erreur lors de l'ajout du médicament.", 'OK', { duration: 3000, panelClass: 'snackbar-error' });
      }
    });
  }

  deleteMedication(med: Medication) {
    if (!med.id) return;
    if (confirm(`Voulez-vous vraiment supprimer ${med.name} ?`)) {
      this.medService.deleteMedication(med.id).subscribe({
        next: () => {
          this.snack.open('Médicament supprimé !', 'OK', { duration: 3000, panelClass: 'snackbar-success' });
          this.loadMedications();
        },
        error: () => {
          this.snack.open("Erreur lors de la suppression.", 'OK', { duration: 3000, panelClass: 'snackbar-error' });
        }
      });
    }
  }
}
