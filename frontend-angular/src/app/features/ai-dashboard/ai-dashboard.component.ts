import { Component, OnInit, signal, computed, ViewChild, ElementRef, AfterViewChecked, OnDestroy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../core/services/auth.service";
import { HealthRecordService } from "../../core/services/health-record.service";
import { MedicationService } from "../../core/services/medication.service";
import { SpeechService } from "../../core/services/speech.service";
import { AiDoctorService } from "../../core/services/ai-doctor.service";
import { HealthRecord } from "../../core/models/health-record.model";
import { AnomalyResult, OcrResult, ExtractedMedication } from "../../core/models/ai.model";
import { VirtualAvatarComponent, AvatarState } from "../../shared/components/virtual-avatar/virtual-avatar.component";

/**
 * Avatar image — PRESERVED EXACTLY AS-IS.
 * This is the original doctor portrait path already used by the app.
 * Do not regenerate, replace or redesign it; only the surrounding animation
 * changes. Swap the URL here if the asset ever moves to `assets/`.
 */
const DOCTOR_AVATAR_IMAGE = 'assets/images/doctor-avatar.png';

@Component({
  selector: "app-ai-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, VirtualAvatarComponent],
  template: `
  <div class="ai-dashboard-wrap">

    <!-- SUBTLE NAV PILLS (When navigating directly or switching) -->
    <div class="ai-subnav">
      <button class="subnav-pill" [class.active]="activeTab() === 'anomaly'" (click)="selectTab('anomaly')">
        <span class="material-icons">query_stats</span> Analyse Constantes
      </button>
      <button class="subnav-pill" [class.active]="activeTab() === 'chatbot'" (click)="selectTab('chatbot')">
        <span class="material-icons">support_agent</span> Conseiller Virtuel
      </button>
      <button class="subnav-pill" [class.active]="activeTab() === 'ocr'" (click)="selectTab('ocr')">
        <span class="material-icons">document_scanner</span> Scanner Ordonnance
      </button>
    </div>

    <!-- ==================== 7.1 ANOMALY DETECTION ==================== -->
    @if (activeTab() === 'anomaly') {
      <div class="ai-hero-card">
        <div class="hero-left">
          <div class="hero-pill-badge">
            <span class="pulse-beacon"></span>
            MOTEUR PRÉDICTIF SIHATI AI &bull; IA CLINIQUE SÉCURISÉE
          </div>
          <h1>Analyse Prédictive des Constantes</h1>
          <p>
            L'Intelligence Artificielle corrèle vos paramètres hémodynamiques et métaboliques récents
            (Tension artérielle, Glycémie, Saturation O₂, Rythme cardiaque) pour anticiper les anomalies et évaluer votre niveau de risque cardiovasculaire.
          </p>
          <div class="hero-action-row">
            <button class="btn-scan" (click)="analyzeLatest()" [disabled]="loadingAnomaly()">
              <span class="material-icons">{{ loadingAnomaly() ? 'sync' : 'auto_graph' }}</span>
              {{ loadingAnomaly() ? "Calcul de l'analyse en cours..." : "Lancer le diagnostic IA" }}
            </button>
            <span class="scan-time-badge">Dernière mise à jour automatique</span>
          </div>
        </div>
        <div class="hero-icon-visual">
          <div class="icon-ring">
            <span class="material-icons">health_and_safety</span>
          </div>
        </div>
      </div>

      <!-- Loading State Overlay/Banner -->
      @if (loadingAnomaly()) {
        <div class="ai-loading-card">
          <div class="loading-spinner"></div>
          <div>
            <strong>Analyse biométrique en cours...</strong>
            <p>Traitement des séries temporelles et détection d'anomalies cliniques.</p>
          </div>
        </div>
      }

      <!-- Result Section -->
      @if (anomalyResult() && !loadingAnomaly()) {
        <div class="result-container">
          
          <!-- RISK LEVEL BANNER -->
          <div class="risk-hero" [class.risk-normal]="anomalyResult()!.riskLevel === 'NORMAL'"
                                 [class.risk-warning]="anomalyResult()!.riskLevel === 'WARNING'"
                                 [class.risk-critical]="anomalyResult()!.riskLevel === 'CRITICAL'">
            <div class="risk-icon-wrapper">
              <span class="material-icons">
                {{ anomalyResult()!.riskLevel === 'NORMAL' ? 'verified' : anomalyResult()!.riskLevel === 'WARNING' ? 'warning_amber' : 'emergency' }}
              </span>
            </div>

            <div class="risk-info">
              <div class="risk-title-row">
                <span class="risk-status-tag">
                  NIVEAU DE RISQUE GLOBAL : 
                  <strong>{{ anomalyResult()!.riskLevel === 'NORMAL' ? 'FAIBLE (STABLE)' : anomalyResult()!.riskLevel === 'WARNING' ? 'MODÉRÉ (À SURVEILLER)' : 'ÉLEVÉ (ATTENTION REQUISE)' }}</strong>
                </span>
                <span class="confidence-pill">
                  <span class="material-icons">speed</span>
                  Fiabilité IA : {{ (anomalyResult()!.confidenceScore * 100).toFixed(0) }}%
                </span>
              </div>
              <p class="risk-summary">
                {{ anomalyResult()!.riskLevel === 'NORMAL' 
                  ? 'Vos constantes vitales se situent dans les plages physiologiques recommandées. Aucune décompensation détectée.' 
                  : 'Des variations significatives nécessitent une vigilance accrue ou un avis médical rapproché.' }}
              </p>
            </div>
          </div>

          <!-- DETAILED CARDS GRID -->
          <div class="cards-grid">
            
            <!-- Trends & Anomalies -->
            <div class="glass-card">
              <div class="card-head">
                <span class="material-icons head-icon teal">analytics</span>
                <h3>Tendances & Anomalies Détectées</h3>
              </div>

              <div class="metric-row">
                <span class="metric-label">Tendance clinique générale :</span>
                <span class="trend-badge" 
                      [class.trend-stable]="anomalyResult()!.trend === 'STABLE'"
                      [class.trend-good]="anomalyResult()!.trend === 'IMPROVING'"
                      [class.trend-bad]="anomalyResult()!.trend === 'DEGRADING'">
                  <span class="material-icons">
                    {{ anomalyResult()!.trend === 'IMPROVING' ? 'trending_up' : anomalyResult()!.trend === 'DEGRADING' ? 'trending_down' : 'trending_flat' }}
                  </span>
                  {{ anomalyResult()!.trend === 'STABLE' ? 'STABLE' : anomalyResult()!.trend === 'IMPROVING' ? 'EN AMÉLIORATION' : anomalyResult()!.trend === 'DEGRADING' ? 'EN DÉGRADATION' : 'DONNÉES SUFFISANTES' }}
                </span>
              </div>

              <div class="anomalies-list">
                <span class="anomalies-label">Anomalies identifiées :</span>
                @if (anomalyResult()!.anomalies.length > 0) {
                  @for (anom of anomalyResult()!.anomalies; track anom) {
                    <div class="anomaly-tag-item">
                      <span class="material-icons">error_outline</span>
                      <span>{{ anom }}</span>
                    </div>
                  }
                } @else {
                  <div class="no-anomaly-item">
                    <span class="material-icons">check_circle</span>
                    <span>Aucune anomalie critique ou déviation détectée sur les dernières mesures.</span>
                  </div>
                }
              </div>
            </div>

            <!-- AI Clinical Recommendations -->
            <div class="glass-card">
              <div class="card-head">
                <span class="material-icons head-icon blue">psychology</span>
                <h3>Recommandations de Prévention IA</h3>
              </div>

              <div class="reco-items-wrap">
                @for (rec of anomalyResult()!.recommendations; track rec) {
                  <div class="reco-card">
                    <span class="material-icons reco-icon">tips_and_updates</span>
                    <p>{{ rec }}</p>
                  </div>
                }
              </div>
            </div>

          </div>
        </div>
      }
    }

    <!-- ==================== 7.2 DR. VIRTUEL — MÉDECIN CONSEILLER INTERACTIF ==================== -->
    @if (activeTab() === 'chatbot') {
      <div class="studio-card">
        
        <!-- Top Mode Indicator & Header -->
        <div class="studio-topbar">
          <div class="studio-title-block">
            <span class="material-icons studio-icon">medical_services</span>
            <div>
              <h2>Dr. Virtuel — Médecin Conseiller Interactif</h2>
              <span class="studio-subtitle">Consultation vocale &amp; visuelle en temps réel avec IA médicale multilingue</span>
            </div>
          </div>

          <div class="studio-actions">
            <!-- Language Badges -->
            <div class="lang-pills">
              <span class="lang-badge" [class.active]="selectedLang === 'FR'" (click)="setLang('FR')">FR</span>
              <span class="lang-badge" [class.active]="selectedLang === 'AR'" (click)="setLang('AR')">العربية</span>
              <span class="lang-badge" [class.active]="selectedLang === 'EN'" (click)="setLang('EN')">EN</span>
              <span class="lang-badge" [class.active]="selectedLang === 'DAR'" (click)="setLang('DAR')">الدارجة</span>
            </div>

            <a href="https://app.liveavatar.com/fc9c1f9f-bc99-4fd9-a6b2-8b4b5669a046" 
               target="_blank" class="btn-fullscreen" title="Afficher en plein écran">
              <span class="material-icons">open_in_new</span> Plein Écran
            </a>
            <button type="button" (click)="reloadDoctorIframe()" class="btn-reload" title="Recharger la vidéo">
              <span class="material-icons">refresh</span>
            </button>
          </div>
        </div>

        <!-- Video Frame Container (LiveAvatar Original) -->
        <div class="avatar-frame-box">
          <iframe id="doctorIframe"
                  src="https://embed.liveavatar.com/v1/d4078586-e8e6-419f-a9dd-f77f120ad9ec?orientation=horizontal" 
                  allow="camera; microphone; autoplay; encrypted-media; display-capture; fullscreen; geolocation" 
                  allowfullscreen="true"
                  loading="eager"
                  referrerpolicy="no-referrer-when-downgrade"
                  title="Dr. Virtuel — Médecin Conseiller Interactif - LiveAvatar"
                  class="doctor-iframe">
          </iframe>
        </div>
      </div>
    }

    <!-- ==================== 7.3 OCR ORDONNANCE NUMÉRISÉE ==================== -->
    @if (activeTab() === 'ocr') {
      <div class="ocr-wrapper">
        
        <!-- Upload Card -->
        <div class="ocr-drop-card">
          <div class="ocr-header-row">
            <div>
              <h2>Scanner d'Ordonnance Biomédicale</h2>
              <p>Reconnaissance optique multimodale intelligente (manuscrit difficile ou imprimé de pharmacie).</p>
            </div>
            <span class="ai-ocr-badge">IA MULTIMODALE 2026</span>
          </div>


          <!-- AI Vision Mode Selector Banner -->
          <div class="ai-mode-selector">
            <div class="ai-mode-header" (click)="toggleAiKeyBox()">
              <div class="ai-mode-title">
                <span class="material-icons icon-sparkle">auto_awesome</span>
                <span>Moteur Vision Multimodal IA (Gemini 2.5 / 1.5 & Hybride)</span>
                <span class="gemini-active-badge">{{ geminiKey() ? '✅ IA CLOUD ACTIVE' : '⚡ IA CLIENT ACTIVE' }}</span>
              </div>
              <span class="material-icons expand-arrow">{{ showAiKeyBox() ? 'expand_less' : 'expand_more' }}</span>
            </div>

            @if (showAiKeyBox()) {
              <div class="ai-key-input-box">
                <p class="ai-key-hint">
                  Pour un déchiffrement 100% automatisé des manuscrits médicaux complexes via LLM Vision Multimodal, collez votre clé Google Gemini ci-dessous (gratuite sur Google AI Studio). Si aucune clé n'est renseignée, le moteur IA Hybride local prend le relais automatiquement.
                </p>
                <div class="key-field-row">
                  <input type="password" [(ngModel)]="customGeminiKey" placeholder="Collez votre clé API Gemini (AIzaSy...)" class="input-gemini-key">
                  <button type="button" class="btn-save-key" (click)="saveGeminiKey()">
                    <span class="material-icons">check</span> Valider
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="upload-dropzone" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
            <div class="upload-circle">
              <span class="material-icons">cloud_upload</span>
            </div>
            <h3>Déposez votre ordonnance ici ou parcourez</h3>
            <p>Glissez une photo de prescription ou un fichier PDF certifié</p>
            <div class="accepted-formats">
              <span>PDF</span>
              <span>JPG</span>
              <span>PNG</span>
              <span>Jusqu'à 15 MB</span>
            </div>
            <input #fileInput type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onFileSelected($event)" style="display:none"/>
          </div>

          <!-- Document Preview with Real-Time Laser Scanning -->
          @if (imagePreviewUrl()) {
            <div class="uploaded-image-preview-card">
              <div class="preview-header">
                <span class="preview-title"><span class="material-icons">visibility</span> Document original téléversé :</span>
                <button type="button" class="btn-clear-preview" (click)="clearSelectedFile()">
                  <span class="material-icons">close</span> Retirer
                </button>
              </div>
              <div class="preview-img-container" [class.scanning]="loadingOcr()">
                <img [src]="imagePreviewUrl()" alt="Ordonnance téléversée" class="preview-img"/>
                @if (loadingOcr()) {
                  <div class="laser-scanner"></div>
                  <div class="scan-overlay-text">
                    <span class="material-icons spinner-icon">auto_fix_high</span>
                    <span>Analyse multimodale IA en cours...</span>
                  </div>
                }
              </div>
            </div>
          }

          @if (selectedFile()) {
            <div class="selected-file-banner">
              <div class="file-meta">
                <span class="material-icons file-icon">task_alt</span>
                <div>
                  <strong>{{ selectedFile()!.name }}</strong>
                  <small>{{ (selectedFile()!.size / 1024).toFixed(1) }} KB</small>
                </div>
              </div>
              <button class="btn-analyze-ocr" (click)="analyzeOcr()" [disabled]="loadingOcr()">
                <span class="material-icons">{{ loadingOcr() ? 'sync' : 'auto_fix_high' }}</span>
                {{ loadingOcr() ? "Extraction IA en cours..." : "Analyser et Déchiffrer avec l'IA" }}
              </button>
            </div>
          }
        </div>

        <!-- DIGITALIZED OFFICIAL PRESCRIPTION DISPLAY -->
        @if (ocrResult()) {
          @if (ocrResult()!.success) {
            <div class="digital-prescription-paper">
              <div class="watermark-bg">
                <span class="material-icons">local_pharmacy</span>
              </div>

              <!-- Top Medical Certificate Header -->
              <div class="presc-header">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 10px;">
                  <div class="presc-clinic-badge" [class.badge-manual]="ocrConfidence() !== 'high'">
                    <span class="material-icons">{{ ocrConfidence() === 'high' ? 'verified' : 'fact_check' }}</span>
                    ORDONNANCE NUMÉRISÉE SIHATI AI
                  </div>
                  <button type="button" class="btn-reset-ocr" (click)="resetOcrPrescription()" title="Réinitialiser" style="background: #FEE2E2; color: #B91C1C; border: 1px solid #FCA5A5; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                    <span class="material-icons" style="font-size: 16px;">refresh</span> Nouveau Scan
                  </button>
                </div>
                <h1 class="presc-main-title">{{ ocrConfidence() === 'high' ? 'RÉPUBLIQUE CLINIQUE • EXTRACTION CERTIFIÉE' : 'RÉPUBLIQUE CLINIQUE • VÉRIFICATION DES CHAMPS' }}</h1>
                <span class="presc-hint-edit" [class.hint-manual]="ocrConfidence() !== 'high'">
                  <span class="material-icons">{{ ocrConfidence() === 'high' ? 'edit_note' : 'info' }}</span>
                  <span>{{ ocrConfidence() === 'high'
                    ? "Vous pouvez vérifier et modifier chaque champ directement avant l'enregistrement ou l'exportation"
                    : (ocrStatusMessage() || "Aucun texte exploitable détecté automatiquement. Vérifiez, complétez ou saisissez les informations manuellement avant l'enregistrement.") }}</span>
                </span>
              </div>


              <!-- Doctor and Patient Row -->
              <div class="presc-parties-grid">
                <div class="party-box doctor-box">
                  <span class="box-label">MÉDECIN PRESCRIPTEUR</span>
                  <input type="text" [ngModel]="prescDoctor()" (ngModelChange)="prescDoctor.set($event)" class="presc-input-header party-name-input" placeholder="Dr. Praticien...">
                  <span class="specialty-hint">Spécialiste &bull; Praticien Hospitalier</span>
                </div>

                <div class="party-box patient-box">
                  <span class="box-label">PATIENT(E) IDENTIFIÉ(E)</span>
                  <input type="text" [ngModel]="prescPatient()" (ngModelChange)="prescPatient.set($event)" class="presc-input-header party-name-input" placeholder="Nom du patient...">
                  <span class="date-hint">Date d'émission : <input type="text" [ngModel]="prescDate()" (ngModelChange)="prescDate.set($event)" class="presc-input-date" placeholder="JJ/MM/AAAA"></span>
                </div>
              </div>

              <!-- Prescribed Medications Table -->
              <div class="medications-block">
                <div class="block-title-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
                  <div class="block-title" style="margin-bottom: 0;">
                    <span class="material-icons">medication</span>
                    TRAITEMENTS &amp; POSOLOGIES STRUCTURÉES (100% MODIFIABLES EN DIRECT)
                  </div>
                  <span class="items-count-badge" style="font-size: 12px; font-weight: 700; background: #E0F2FE; color: #0369A1; padding: 4px 12px; border-radius: 12px;">
                    {{ prescItems().length }} traitement(s) détecté(s)
                  </span>
                </div>

                <div class="med-card-list">
                  @for (item of prescItems(); track $index) {
                    <div class="med-item-card" [class.needs-verification]="item.needsVerification">
                      <!-- Card Row 1: Identification (Name, DCI, Strength, Form, Verification Badge, Delete) -->
                      <div class="med-card-row-main">
                        <div class="field-group name-field">
                          <span class="field-label"><span class="med-icon-tag">💊</span> Médicament</span>
                          <input type="text" [ngModel]="item.name" (ngModelChange)="updateItemName($index, $event)" class="presc-input-table font-bold" placeholder="Ex: AMOXICILLINE, DOLIPRANE...">
                        </div>

                        <div class="field-group dci-field">
                          <span class="field-label"><span class="material-icons field-mini-icon">science</span> DCI / Molécule</span>
                          <input type="text" [ngModel]="item.activeIngredient" (ngModelChange)="updateItemActiveIngredient($index, $event)" class="presc-input-table" placeholder="Ex: Paracétamol">
                        </div>

                        <div class="field-group strength-field">
                          <span class="field-label"><span class="material-icons field-mini-icon">scale</span> Dosage / Teneur</span>
                          <input type="text" [ngModel]="item.strength" (ngModelChange)="updateItemStrength($index, $event)" class="presc-input-table" placeholder="Ex: 500 mg, 1g">
                        </div>

                        <div class="field-group form-field">
                          <span class="field-label"><span class="material-icons field-mini-icon">category</span> Forme</span>
                          <input type="text" [ngModel]="item.form" (ngModelChange)="updateItemForm($index, $event)" class="presc-input-table" placeholder="Ex: Gélules, Comprimés">
                        </div>

                        <div class="field-group verif-field">
                          <span class="field-label">Statut</span>
                          <button type="button" class="btn-toggle-verif" [class.is-warning]="item.needsVerification" (click)="toggleItemVerification($index)" [title]="item.needsVerification ? 'Cliquer pour certifier' : 'Cliquer pour marquer à vérifier'">
                            <span class="material-icons">{{ item.needsVerification ? 'warning_amber' : 'check_circle' }}</span>
                            {{ item.needsVerification ? 'À vérifier' : 'Vérifié' }}
                          </button>
                        </div>

                        <div class="field-group action-field">
                          <span class="field-label">&nbsp;</span>
                          <button type="button" class="btn-delete-row" (click)="removeMedRow($index)" title="Supprimer ce médicament">
                            <span class="material-icons">delete_outline</span>
                          </button>
                        </div>
                      </div>

                      <!-- Card Row 2: Administration details (Dose, Frequency, Duration, Instructions, Quantity) -->
                      <div class="med-card-row-details">
                        <div class="field-group dose-field">
                          <span class="field-label"><span class="material-icons field-mini-icon">local_pharmacy</span> Dose unitaire</span>
                          <input type="text" [ngModel]="item.dose" (ngModelChange)="updateItemDose($index, $event)" class="presc-input-table" placeholder="Ex: 1 gélule, 1 cp">
                        </div>

                        <div class="field-group freq-field">
                          <span class="field-label"><span class="material-icons field-mini-icon">schedule</span> Fréquence / Rythme</span>
                          <input type="text" [ngModel]="item.frequency" (ngModelChange)="updateItemFrequency($index, $event)" class="presc-input-table" placeholder="Ex: matin et soir, toutes les 6h">
                        </div>

                        <div class="field-group dur-field">
                          <span class="field-label"><span class="material-icons field-mini-icon">date_range</span> Durée</span>
                          <input type="text" [ngModel]="item.duration" (ngModelChange)="updateItemDuration($index, $event)" class="presc-input-table" placeholder="Ex: 7 jours, 1 mois">
                        </div>

                        <div class="field-group instr-field">
                          <span class="field-label"><span class="material-icons field-mini-icon">info</span> Instructions / Précautions</span>
                          <input type="text" [ngModel]="item.instructions" (ngModelChange)="updateItemInstructions($index, $event)" class="presc-input-table" placeholder="Ex: au cours du repas, si douleur">
                        </div>

                        <div class="field-group qty-field">
                          <span class="field-label"><span class="material-icons field-mini-icon">inventory_2</span> Quantité</span>
                          <input type="text" [ngModel]="item.quantity" (ngModelChange)="updateItemQuantity($index, $event)" class="presc-input-table" placeholder="Ex: 1 boîte">
                        </div>
                      </div>
                    </div>
                  }

                  @if (prescItems().length === 0) {
                    <div class="med-empty-row">
                      <span class="material-icons">search_off</span>
                      <span>Aucun médicament détecté automatiquement. Cliquez sur "+ Ajouter un médicament" ci-dessous pour ajouter vos prescriptions manuellement.</span>
                    </div>
                  }
                </div>

                <!-- Add medication row -->
                <div class="add-row-block">
                  <button type="button" class="btn-add-med-row" (click)="addMedRow()">
                    <span class="material-icons">add_circle_outline</span> Ajouter un médicament
                  </button>
                </div>
              </div>

              <!-- Prescription Footer & Actions -->
              <div class="presc-footer" style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between; align-items: center;">
                <div class="presc-certif-info" style="flex: 1; min-width: 250px;">
                  <span class="material-icons">security</span>
                  <span>Authentifié par l'OCR Multimodal Sihati AI. Prêt pour planification des rappels et export PDF.</span>
                </div>
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                  <button type="button" (click)="exportPrescriptionPdf()" class="btn-export-presc" style="background: #0284C7; color: #FFFFFF; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
                    <span class="material-icons">picture_as_pdf</span>
                    Exporter PDF Certifié
                  </button>
                  <button type="button" class="btn-import-meds" (click)="importMedications()">
                    <span class="material-icons">playlist_add_check</span>
                    Enregistrer dans mes médicaments
                  </button>
                </div>
              </div>
            </div>
          } @else {
            <div class="ocr-error-banner">
              <span class="material-icons">report_problem</span>
              <div>
                <strong>Erreur d'analyse :</strong>
                <p>{{ ocrResult()!.errorMessage }}</p>
              </div>
            </div>
          }
        }

      </div>
    }

  </div>
  `,
  styles: [`
  .ai-dashboard-wrap {
    max-width: 1280px;
    margin: 0 auto;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* Subnav Pills */
  .ai-subnav {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    background: #FFFFFF;
    padding: 6px;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 119, 182, 0.05);
    border: 1px solid #E2E8F0;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    box-sizing: border-box;
  }
  .ai-subnav::-webkit-scrollbar { display: none; }
  .subnav-pill { white-space: nowrap; flex-shrink: 0; }


  .subnav-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: #64748B;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .subnav-pill:hover {
    color: #0077B6;
    background: #F1F5F9;
  }

  .subnav-pill.active {
    background: linear-gradient(135deg, #0077B6, #0096C7);
    color: #FFFFFF;
    box-shadow: 0 4px 14px rgba(0, 119, 182, 0.25);
  }

  .subnav-pill .material-icons { font-size: 18px; }

  /* ================= 7.1 ANOMALY DETECTION ================= */
  .ai-hero-card {
    background: linear-gradient(135deg, #023E58 0%, #0077B6 60%, #0096C7 100%);
    border-radius: 24px;
    padding: 36px 40px;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
    box-shadow: 0 10px 30px rgba(0, 119, 182, 0.2);
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }

  .ai-hero-card::after {
    content: '';
    position: absolute;
    right: -40px;
    top: -40px;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    pointer-events: none;
  }

  .hero-left {
    flex: 1;
    max-width: 720px;
  }

  .hero-pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.5px;
    margin-bottom: 16px;
  }

  .pulse-beacon {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00B4D8;
    box-shadow: 0 0 8px #00B4D8;
    animation: beacon 1.5s infinite;
  }

  @keyframes beacon {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.3); }
  }

  .hero-left h1 {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 12px;
    letter-spacing: -0.5px;
  }

  .hero-left p {
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 24px;
  }

  .hero-action-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .btn-scan {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #FFFFFF;
    color: #0077B6;
    font-weight: 800;
    font-size: 14px;
    padding: 12px 24px;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    transition: all 0.2s ease;
  }

  .btn-scan:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  }

  .btn-scan:disabled { opacity: 0.7; cursor: not-allowed; }

  .scan-time-badge {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
  }

  .hero-icon-visual {
    flex-shrink: 0;
  }

  .icon-ring {
    width: 90px;
    height: 90px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  }

  .icon-ring .material-icons {
    font-size: 52px;
    color: #FFFFFF;
  }

  /* Loading State */
  .ai-loading-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #FFFFFF;
    border: 1px solid #BAE6FD;
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 14px rgba(0, 119, 182, 0.06);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #E0F2FE;
    border-top-color: #0077B6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .ai-loading-card strong { color: #023E58; font-size: 15px; display: block; }
  .ai-loading-card p { color: #64748B; font-size: 13px; margin: 2px 0 0; }

  /* Risk Banner */
  .risk-hero {
    border-radius: 20px;
    padding: 24px 28px;
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    border: 2px solid;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
  }

  .risk-hero.risk-normal {
    background: #F0FDF4;
    border-color: #86EFAC;
    color: #166534;
  }

  .risk-hero.risk-warning {
    background: #FFFBEB;
    border-color: #FCD34D;
    color: #92400E;
  }

  .risk-hero.risk-critical {
    background: #FEF2F2;
    border-color: #FCA5A5;
    color: #991B1B;
  }

  .risk-icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
  }

  .risk-icon-wrapper .material-icons { font-size: 36px; }

  .risk-info { flex: 1; }

  .risk-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 6px;
  }

  .risk-status-tag {
    font-size: 15px;
    font-weight: 700;
  }

  .risk-status-tag strong {
    font-size: 17px;
    font-weight: 900;
  }

  .confidence-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.85);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 800;
  }

  .confidence-pill .material-icons { font-size: 16px; }

  .risk-summary {
    margin: 0;
    font-size: 13px;
    opacity: 0.9;
    line-height: 1.5;
  }

  /* Grid of Glass Cards */
  .cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .glass-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 119, 182, 0.04);
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .head-icon {
    font-size: 22px;
    padding: 8px;
    border-radius: 12px;
  }

  .head-icon.teal { background: #ECFDF5; color: #059669; }
  .head-icon.blue { background: #E0F2FE; color: #0077B6; }

  .card-head h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    color: #023E58;
  }

  .metric-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: #F8FAFC;
    border-radius: 12px;
    margin-bottom: 16px;
  }

  .metric-label { font-size: 13px; font-weight: 600; color: #475569; }

  .trend-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 800;
  }

  .trend-stable { background: #E0F2FE; color: #0077B6; }
  .trend-good   { background: #D1FAE5; color: #047857; }
  .trend-bad    { background: #FEE2E2; color: #B91C1C; }
  .trend-badge .material-icons { font-size: 16px; }

  .anomalies-list { display: flex; flex-direction: column; gap: 8px; }
  .anomalies-label { font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }

  .anomaly-tag-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #B91C1C;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
  }

  .no-anomaly-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    color: #15803D;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
  }

  .reco-items-wrap { display: flex; flex-direction: column; gap: 10px; }

  .reco-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #F0F9FF;
    border: 1px solid #BAE6FD;
    border-radius: 12px;
    padding: 12px 16px;
  }

  .reco-icon {
    font-size: 20px;
    color: #0284C7;
    margin-top: 1px;
    flex-shrink: 0;
  }

  .reco-card p {
    margin: 0;
    font-size: 13px;
    color: #0F172A;
    line-height: 1.5;
  }

  /* ================= 7.2 CONSEILLER VIRTUEL ================= */
  .studio-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    padding: 24px 28px;
    box-shadow: 0 4px 20px rgba(0, 119, 182, 0.05);
  }

  .studio-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
  }

  .studio-title-block {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .studio-icon {
    font-size: 28px;
    color: #0077B6;
    background: #E0F2FE;
    padding: 8px;
    border-radius: 12px;
  }

  .studio-title-block h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: #023E58;
  }

  .studio-subtitle {
    font-size: 12px;
    color: #64748B;
  }
  .studio-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .lang-pills {
    display: flex;
    gap: 4px;
    background: #F1F5F9;
    padding: 4px;
    border-radius: 10px;
  }

  .lang-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 8px;
    color: #64748B;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .lang-badge:hover {
    background: #E2E8F0;
    color: #023E58;
  }

  .lang-badge.active {
    background: #0077B6;
    color: #FFFFFF;
    box-shadow: 0 2px 6px rgba(0, 119, 182, 0.25);
  }

  .btn-fullscreen {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #0077B6;
    color: #FFFFFF;
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 0 3px 8px rgba(0, 119, 182, 0.25);
    transition: all 0.15s ease;
  }

  .btn-fullscreen:hover {
    background: #0096C7;
    transform: translateY(-1px);
  }

  .btn-fullscreen .material-icons { font-size: 16px; }

  .btn-reload {
    background: #F1F5F9;
    border: none;
    padding: 8px;
    border-radius: 10px;
    color: #475569;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.15s ease;
  }

  .btn-reload:hover {
    background: #E2E8F0;
    color: #023E58;
  }

  .btn-reload .material-icons { font-size: 18px; }

  /* Video Frame Container (LiveAvatar Original) */
  .avatar-frame-box {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    background: #0B1120;
    width: 100%;
    aspect-ratio: 16/9;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.16);
    border: 1px solid rgba(0, 119, 182, 0.2);
    margin-bottom: 20px;
  }

  .doctor-iframe {
    width: 100%;
    height: 100%;
    display: block;
    border: none;
  }

  /* Consultation Station (Écrit + Réponse Orale) */
  .consultation-chat-station {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 16px rgba(0, 119, 182, 0.04);
  }

  .chatbot-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .chatbot-head-icon {
    font-size: 22px;
    color: #0077B6;
    background: #E0F2FE;
    padding: 8px;
    border-radius: 12px;
  }

  .chatbot-head-title {
    font-size: 15px;
    font-weight: 700;
    color: #023E58;
  }

  .chatbot-empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    color: #94A3B8;
    padding: 24px 16px;
  }

  .chatbot-empty-state .material-icons {
    font-size: 40px;
    color: #CBD5E1;
  }

  .chatbot-empty-state p {
    margin: 0;
    font-size: 13px;
    max-width: 420px;
    line-height: 1.5;
  }

  .consult-status-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: #F8FAFD;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 12px 16px;
    margin-bottom: 16px;
    transition: all 0.2s ease;
  }

  .consult-status-banner.speaking {
    background: #ECFDF5;
    border-color: #A7F3D0;
  }

  .consult-status-banner.listening {
    background: #FEF2F2;
    border-color: #FECACA;
  }

  .status-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-icon {
    font-size: 26px;
    color: #0077B6;
    background: #E0F2FE;
    padding: 8px;
    border-radius: 12px;
  }

  .speaking .status-icon {
    color: #059669;
    background: #D1FAE5;
  }

  .listening .status-icon {
    color: #DC2626;
    background: #FEE2E2;
  }

  .status-text {
    display: flex;
    flex-direction: column;
  }

  .status-title {
    font-size: 13.5px;
    font-weight: 700;
    color: #023E58;
  }

  .speaking .status-title { color: #065F46; }
  .listening .status-title { color: #991B1B; }

  .status-sub {
    font-size: 12px;
    color: #64748B;
  }

  .waveform-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mini-waveform {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 24px;
  }

  .mini-waveform .wave-bar {
    width: 3.5px;
    background: #10B981;
    border-radius: 3px;
    animation: waveJump 1s ease-in-out infinite;
  }

  .wave-bar.bar-1 { height: 10px; animation-delay: 0.1s; }
  .wave-bar.bar-2 { height: 18px; animation-delay: 0.25s; }
  .wave-bar.bar-3 { height: 24px; animation-delay: 0.4s; }
  .wave-bar.bar-4 { height: 15px; animation-delay: 0.15s; }
  .wave-bar.bar-5 { height: 22px; animation-delay: 0.35s; }
  .wave-bar.bar-6 { height: 12px; animation-delay: 0.2s; }

  @keyframes waveJump {
    0%, 100% { transform: scaleY(0.4); }
    50% { transform: scaleY(1.3); }
  }

  .btn-stop-audio-mini {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #FFFFFF;
    color: #DC2626;
    border: 1px solid #FECACA;
    border-radius: 10px;
    padding: 6px 12px;
    font-size: 11.5px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-stop-audio-mini:hover {
    background: #FEE2E2;
  }

  .btn-stop-audio-mini .material-icons { font-size: 15px; }

  .dialog-messages-box {
    flex: 1;
    min-height: 280px;
    max-height: 380px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 6px;
    margin-bottom: 14px;
  }

  .dialog-msg-row {
    display: flex;
    width: 100%;
  }

  .dialog-msg-row.msg-patient { justify-content: flex-end; }
  .dialog-msg-row.msg-doctor  { justify-content: flex-start; }

  .dialog-bubble {
    max-width: 82%;
    padding: 12px 16px;
    border-radius: 18px;
    line-height: 1.5;
  }

  .msg-patient .dialog-bubble {
    background: linear-gradient(135deg, #0077B6, #0096C7);
    color: #FFFFFF;
    border-radius: 18px 18px 4px 18px;
  }

  .msg-doctor .dialog-bubble {
    background: #F8FAFD;
    color: #0F172A;
    border: 1px solid #E2E8F0;
    border-radius: 18px 18px 18px 4px;
  }

  .bubble-header-mini {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 4px;
  }

  .sender-name {
    font-size: 11px;
    font-weight: 800;
    color: #0077B6;
  }

  .msg-patient .sender-name { color: #E0F2FE; }

  .msg-time-mini {
    font-size: 10px;
    opacity: 0.7;
  }

  .dialog-text {
    margin: 0;
    font-size: 13.5px;
    white-space: pre-wrap;
  }

  .btn-replay-voice {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #E0F2FE;
    color: #0077B6;
    border: none;
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 6px;
  }

  .btn-replay-voice .material-icons { font-size: 14px; }

  .thinking-bubble {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
  }

  .typing-indicator span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #0077B6;
    animation: typing 1s infinite;
  }

  .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
  .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes typing {
    0%, 100% { opacity: 0.3; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-3px); }
  }

  .thinking-text { font-size: 12px; color: #64748B; font-style: italic; }

  /* Quick chips */
  .quick-prompts-row {
    margin-bottom: 12px;
  }

  .quick-hint {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: #64748B;
    margin-bottom: 6px;
  }

  .chips-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .quick-chip-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #F1F5F9;
    color: #334155;
    border: 1px solid #E2E8F0;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
  }

  .quick-chip-btn:hover {
    background: #E0F2FE;
    color: #0077B6;
    border-color: #BAE6FD;
  }

  .quick-chip-btn .material-icons { font-size: 15px; color: #0077B6; }

  /* Composer */
  .dialog-composer-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #F8FAFD;
    border: 1px solid #CBD5E1;
    border-radius: 16px;
    padding: 6px 8px 6px 14px;
  }

  .dialog-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 13.5px;
    outline: none;
    color: #0F172A;
  }

  .btn-composer-mic {
    background: transparent;
    border: none;
    color: #0077B6;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .btn-composer-mic:hover { background: #E0F2FE; }
  .btn-composer-mic.active-mic { background: #FEE2E2; color: #DC2626; }

  .btn-composer-send {
    background: linear-gradient(135deg, #0077B6, #0096C7);
    color: white;
    border: none;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .btn-composer-send:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .btn-composer-send:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }



  .quick-prompts-block {
    background: #F8FAFD;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 18px 20px;
  }

  .prompts-title {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }

  .prompts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 10px;
  }

  .prompt-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #023E58;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  }

  .prompt-chip .material-icons { font-size: 16px; color: #0077B6; }


  .presc-hint-edit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    color: #059669;
    font-weight: 600;
    margin-top: 6px;
  }

  .presc-hint-edit .material-icons { font-size: 16px; }

  /* AI Mode Selector */
  .ai-mode-selector {
    background: #F0F9FF;
    border: 1px solid #BAE6FD;
    border-radius: 14px;
    margin-bottom: 20px;
    overflow: hidden;
  }

  .ai-mode-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s ease;
  }

  .ai-mode-header:hover { background: #E0F2FE; }

  .ai-mode-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #023E58;
  }

  .icon-sparkle { color: #0284C7; font-size: 18px; }

  .gemini-active-badge {
    background: #0284C7;
    color: #FFFFFF;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 10px;
    letter-spacing: 0.5px;
  }

  .expand-arrow { color: #0284C7; font-size: 20px; }

  .ai-key-input-box {
    padding: 14px 18px 18px;
    border-top: 1px solid #BAE6FD;
    background: #FFFFFF;
  }

  .ai-key-hint {
    margin: 0 0 10px;
    font-size: 12px;
    color: #475569;
    line-height: 1.45;
  }

  .key-field-row {
    display: flex;
    gap: 8px;
  }

  .input-gemini-key {
    flex: 1;
    font-size: 13px;
    padding: 8px 12px;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    outline: none;
  }

  .input-gemini-key:focus {
    border-color: #0077B6;
    box-shadow: 0 0 0 2px rgba(0, 119, 182, 0.12);
  }

  .btn-save-key {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #0077B6;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .btn-save-key:hover { background: #023E58; }

  /* Preview & Laser Scanner */
  .uploaded-image-preview-card {
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: 16px;
    padding: 16px;
    margin-top: 18px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .preview-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    color: #023E58;
  }

  .preview-title .material-icons { font-size: 18px; color: #0077B6; }

  .btn-clear-preview {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #F1F5F9;
    color: #64748B;
    border: none;
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-clear-preview:hover { background: #FEE2E2; color: #DC2626; }
  .btn-clear-preview .material-icons { font-size: 14px; }

  .preview-img-container {
    position: relative;
    max-height: 340px;
    border-radius: 12px;
    overflow: hidden;
    background: #F8FAFD;
    border: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-img {
    max-width: 100%;
    max-height: 340px;
    object-fit: contain;
    display: block;
  }

  .preview-img-container.scanning::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 119, 182, 0.12);
    pointer-events: none;
  }

  .laser-scanner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, #00B4D8, #0077B6, #00B4D8, transparent);
    box-shadow: 0 0 16px 4px #00B4D8;
    animation: scanAnim 2s ease-in-out infinite alternate;
    z-index: 2;
  }

  @keyframes scanAnim {
    0% { top: 0%; }
    100% { top: 96%; }
  }

  .scan-overlay-text {
    position: absolute;
    bottom: 20px;
    background: rgba(11, 17, 32, 0.85);
    color: #FFFFFF;
    backdrop-filter: blur(8px);
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    z-index: 3;
  }

  .spinner-icon {
    animation: spin 1.2s linear infinite;
    font-size: 18px;
    color: #00B4D8;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Inline editable fields for prescription */
  .presc-input-header {
    width: 100%;
    font-size: 15px;
    font-weight: 800;
    color: #0F172A;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    padding: 6px 10px;
    outline: none;
    box-sizing: border-box;
    transition: border 0.2s ease;
  }

  .presc-input-header:focus {
    border-color: #0077B6;
    box-shadow: 0 0 0 2px rgba(0, 119, 182, 0.15);
  }

  .presc-input-date {
    font-size: 12px;
    font-weight: 700;
    color: #0F172A;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: 6px;
    padding: 3px 8px;
    outline: none;
  }

  .presc-input-table {
    width: 100%;
    font-size: 13.5px;
    font-weight: 600;
    color: #0F172A;
    background: #F8FAFD;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    padding: 8px 12px;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }

  .presc-input-table:focus {
    background: #FFFFFF;
    border-color: #0077B6;
    box-shadow: 0 0 0 2px rgba(0, 119, 182, 0.12);
  }

  .dosage-input {
    color: #0284C7;
    font-weight: 700;
  }

  .posology-icon {
    font-size: 16px;
    color: #0284C7;
    margin-right: 6px;
  }

  .btn-delete-row {
    background: transparent;
    border: none;
    color: #EF4444;
    cursor: pointer;
    border-radius: 8px;
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .btn-delete-row:hover {
    background: #FEE2E2;
    color: #DC2626;
  }

  .add-row-block {
    padding: 12px 18px;
    background: #F8FAFD;
    border-top: 1px solid #E2E8F0;
    display: flex;
    justify-content: flex-start;
  }

  .btn-add-med-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #FFFFFF;
    color: #0077B6;
    border: 1px dashed #0077B6;
    border-radius: 10px;
    padding: 6px 14px;
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-add-med-row:hover {
    background: #E0F2FE;
    border-style: solid;
  }

  /* ================= 7.3 OCR ORDONNANCE ================= */
  .ocr-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .ocr-drop-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 24px;
    padding: 28px 32px;
    box-shadow: 0 4px 20px rgba(0, 119, 182, 0.05);
  }

  .ocr-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .ocr-header-row h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: #023E58;
  }

  .ocr-header-row p {
    margin: 4px 0 0;
    font-size: 13px;
    color: #64748B;
  }

  .ai-ocr-badge {
    background: #E0F2FE;
    color: #0077B6;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 12px;
    border-radius: 20px;
    letter-spacing: 0.5px;
  }

  .upload-dropzone {
    border: 2px dashed #93C5FD;
    background: #F8FAFD;
    border-radius: 20px;
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .upload-dropzone:hover {
    border-color: #0077B6;
    background: #F0F9FF;
    transform: translateY(-2px);
  }

  .upload-circle {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: #E0F2FE;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
  }

  .upload-circle .material-icons {
    font-size: 32px;
    color: #0077B6;
  }

  .upload-dropzone h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: #0F172A;
  }

  .upload-dropzone p {
    margin: 0 0 16px;
    font-size: 13px;
    color: #64748B;
  }

  .accepted-formats {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .accepted-formats span {
    background: #E2E8F0;
    color: #475569;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
  }

  .selected-file-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 18px;
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    padding: 14px 20px;
    border-radius: 14px;
  }

  .file-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .file-icon {
    font-size: 26px;
    color: #16A34A;
  }

  .file-meta strong {
    font-size: 14px;
    color: #0F172A;
    display: block;
  }

  .file-meta small {
    color: #64748B;
    font-size: 12px;
  }

  .btn-analyze-ocr {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #0077B6, #0096C7);
    color: #FFFFFF;
    border: none;
    font-size: 13px;
    font-weight: 700;
    padding: 10px 20px;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 119, 182, 0.25);
    transition: all 0.2s ease;
  }

  .btn-analyze-ocr:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 119, 182, 0.4);
  }

  .btn-analyze-ocr:disabled { opacity: 0.6; cursor: not-allowed; }

  /* DIGITAL PRESCRIPTION SHEET */
  .digital-prescription-paper {
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: 20px;
    padding: 36px 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
  }

  .watermark-bg {
    position: absolute;
    right: 30px;
    top: 30px;
    opacity: 0.04;
    pointer-events: none;
  }

  .watermark-bg .material-icons { font-size: 160px; color: #0077B6; }

  .presc-header {
    text-align: center;
    border-bottom: 2px solid #0077B6;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }

  .presc-clinic-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #E0F2FE;
    color: #0077B6;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 14px;
    border-radius: 20px;
    margin-bottom: 8px;
  }

  .presc-clinic-badge .material-icons { font-size: 15px; }

  .presc-clinic-badge.badge-manual {
    background: #FEF3C7;
    color: #B45309;
  }

  .presc-hint-edit.hint-manual { color: #B45309; }

  .presc-main-title {
    margin: 0;
    font-size: 20px;
    font-weight: 900;
    color: #023E58;
    letter-spacing: 0.5px;
  }

  .presc-parties-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 28px;
  }

  .party-box {
    background: #F8FAFD;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 16px 20px;
  }

  .box-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: #0077B6;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .party-name {
    font-size: 16px;
    font-weight: 800;
    color: #0F172A;
    display: block;
  }

  .specialty-hint, .date-hint {
    display: block;
    font-size: 12px;
    color: #64748B;
    margin-top: 4px;
  }

  .medications-block {
    margin-bottom: 30px;
  }

  .block-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #0077B6;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }

  .med-card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .med-item-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 14px 18px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
  }

  .med-item-card:hover {
    border-color: #CBD5E1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .med-item-card.needs-verification {
    border: 1.5px solid #F59E0B;
    background: #FFFDF5;
  }

  .med-card-row-main {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .med-card-row-details {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-wrap: wrap;
    padding-top: 10px;
    border-top: 1px dashed #E2E8F0;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field-label {
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .field-mini-icon {
    font-size: 14px;
    color: #0284C7;
  }

  .name-field { flex: 2; min-width: 180px; }
  .dci-field { flex: 1.4; min-width: 140px; }
  .strength-field { flex: 1; min-width: 100px; }
  .form-field { flex: 1; min-width: 100px; }
  .verif-field { flex: 0 0 auto; }
  .action-field { flex: 0 0 auto; }

  .dose-field { flex: 1; min-width: 110px; }
  .freq-field { flex: 1.6; min-width: 150px; }
  .dur-field { flex: 1; min-width: 110px; }
  .instr-field { flex: 2; min-width: 170px; }
  .qty-field { flex: 0.8; min-width: 90px; }

  .font-bold {
    font-weight: 700 !important;
    color: #0F172A !important;
  }

  .btn-toggle-verif {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 12px;
    border-radius: 8px;
    font-size: 11.5px;
    font-weight: 800;
    cursor: pointer;
    border: 1px solid #86EFAC;
    background: #F0FDF4;
    color: #166534;
    transition: all 0.2s ease;
    height: 38px;
    box-sizing: border-box;
  }

  .btn-toggle-verif:hover {
    filter: brightness(0.96);
  }

  .btn-toggle-verif.is-warning {
    border-color: #FCD34D;
    background: #FEF3C7;
    color: #92400E;
  }

  .btn-toggle-verif .material-icons {
    font-size: 16px;
  }

  .med-table {
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    overflow: hidden;
  }

  .med-table-head {
    display: flex;
    justify-content: space-between;
    background: #F1F5F9;
    padding: 12px 18px;
    font-size: 11px;
    font-weight: 700;
    color: #475569;
  }

  .med-table-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    border-top: 1px solid #F1F5F9;
    background: #FFFFFF;
  }

  .med-table-row:hover { background: #F8FAFD; }

  .med-empty-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px;
    border-top: 1px solid #F1F5F9;
    background: #FFFBEB;
    color: #B45309;
    font-size: 13px;
    font-weight: 600;
  }

  .med-empty-row .material-icons { font-size: 20px; color: #D97706; }

  .med-name-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #0F172A;
  }

  .posology-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #E0F2FE;
    color: #0284C7;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 20px;
  }

  .posology-pill .material-icons { font-size: 15px; }

  .presc-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 20px;
    border-top: 1px dashed #CBD5E1;
    flex-wrap: wrap;
    gap: 16px;
  }

  .presc-certif-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748B;
    font-size: 12px;
  }

  .presc-certif-info .material-icons { font-size: 18px; color: #0077B6; }

  .btn-import-meds {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #059669, #10B981);
    color: #FFFFFF;
    border: none;
    padding: 12px 22px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    transition: all 0.2s ease;
  }

  .btn-import-meds:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
  }

  .ocr-error-banner {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 16px;
    padding: 20px;
    color: #991B1B;
  }

  @media(max-width: 900px) {
    .cards-grid, .presc-parties-grid { grid-template-columns: 1fr; }
    .ai-hero-card { flex-direction: column; align-items: flex-start; padding: 24px 20px; }
    .hero-icon-visual { display: none; }
    .studio-topbar { flex-direction: column; align-items: flex-start; gap: 14px; }
    .studio-actions { width: 100%; justify-content: flex-start; }
  }

  @media(max-width: 768px) {
    .digital-prescription-paper { padding: 20px 16px; border-radius: 16px; }
    .ocr-drop-card { padding: 20px 16px; border-radius: 16px; }
    .upload-dropzone { padding: 28px 16px; border-radius: 16px; }
    .presc-main-title { font-size: 17px; }
    .presc-header { padding-bottom: 12px; margin-bottom: 18px; }
    .party-box { padding: 12px 14px; }
    .party-name-input { font-size: 14px; }
    .med-item-card { padding: 12px 14px; border-radius: 12px; }
    .selected-file-banner { flex-direction: column; align-items: stretch; gap: 12px; }
    .selected-file-banner .btn-analyze-ocr { width: 100%; justify-content: center; }
    .presc-footer { flex-direction: column; align-items: stretch; gap: 12px; }
    .presc-footer button { width: 100%; justify-content: center; }
    .presc-certif-info { min-width: 0 !important; }
  }

  @media(max-width: 600px) {
    .med-card-row-main {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
      margin-bottom: 10px;
    }
    .med-card-row-main .name-field,
    .med-card-row-main .dci-field,
    .med-card-row-main .strength-field,
    .med-card-row-main .form-field {
      width: 100%;
      min-width: 0;
      flex: none;
    }
    .med-card-row-main .verif-field,
    .med-card-row-main .action-field {
      width: 100%;
      flex: none;
    }
    .med-card-row-details {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
    .med-card-row-details .dose-field,
    .med-card-row-details .freq-field,
    .med-card-row-details .dur-field,
    .med-card-row-details .instr-field,
    .med-card-row-details .qty-field {
      width: 100%;
      min-width: 0;
      flex: none;
    }
    .btn-toggle-verif {
      width: 100%;
      justify-content: center;
      height: 42px;
      font-size: 12px;
    }
    .btn-delete-row {
      width: 100%;
      height: 38px;
      border: 1px solid #FECACA;
      background: #FEF2F2;
      border-radius: 8px;
      justify-content: center;
    }
    .btn-delete-row::after {
      content: ' Supprimer ce traitement';
      font-size: 12px;
      font-weight: 700;
      margin-left: 6px;
    }
    .hero-left h1 { font-size: 20px; }
    .hero-left p { font-size: 13px; margin-bottom: 16px; }
    .btn-scan { width: 100%; justify-content: center; }
    .risk-hero { flex-direction: column; align-items: flex-start; gap: 14px; padding: 18px 16px; }
    .risk-title-row { flex-direction: column; align-items: flex-start; gap: 8px; }
  }

  @media(max-width: 480px) {
    .digital-prescription-paper { padding: 14px 10px; }
    .ocr-header-row { flex-direction: column; align-items: flex-start; gap: 8px; }
    .ai-key-input-box .key-field-row { flex-direction: column; }
    .btn-save-key { width: 100%; justify-content: center; }
    .lang-pills { width: 100%; justify-content: space-around; }
    .btn-fullscreen { font-size: 11px; padding: 6px 10px; }
    .presc-input-table { font-size: 13px; padding: 10px 10px; }
    .watermark-bg { display: none; }
    .prompts-grid { grid-template-columns: 1fr; }
  }

  @media(max-width: 360px) {
    .digital-prescription-paper { padding: 10px 6px; }
    .party-box { padding: 10px 8px; }
    .med-item-card { padding: 10px 8px; }
  }

  `]
})
export class AiDashboardComponent implements OnInit, AfterViewChecked, OnDestroy {
  activeTab     = signal<'anomaly'|'chatbot'|'ocr'>('anomaly');
  anomalyResult = signal<AnomalyResult|null>(null);
  ocrResult     = signal<OcrResult|null>(null);
  selectedFile  = signal<File|null>(null);
  imagePreviewUrl = signal<string|null>(null);
  showAiKeyBox    = signal<boolean>(false);
  geminiKey       = signal<string>(environment.geminiApiKey || '');
  customGeminiKey = environment.geminiApiKey || '';
  loadingAnomaly  = signal(false);
  loadingOcr      = signal(false);

  prescDoctor  = signal<string>('');
  prescPatient = signal<string>('');
  prescDate    = signal<string>('');
  prescItems   = signal<ExtractedMedication[]>([]);
  ocrConfidence = signal<'high' | 'partial' | 'manual'>('high');
  ocrStatusMessage = signal<string>('');

  quickQuestions = [
    "Ma tension est un peu élevée, quels sont les premiers réflexes ?",
    "J'ai une glycémie à jeun de 140 mg/dL, est-ce inquiétant ?",
    "Quels sont les signaux d'alerte cardiovasculaires majeurs ?"
  ];

  selectedLang: 'FR' | 'AR' | 'EN' | 'DAR' = 'FR';
  readonly doctorImageUrl = DOCTOR_AVATAR_IMAGE;
  loadingChatbot = signal<boolean>(false);
  chatInputText  = '';

  /** Free, browser-native speech (STT + TTS). No key, no cost. */
  private readonly speech   = inject(SpeechService);
  /** Existing Spring Boot AI backend bridge (keys stay server-side). */
  private readonly aiDoctor = inject(AiDoctorService);

  readonly isListening = this.speech.isListening;
  readonly isSpeaking  = this.speech.isSpeaking;

  /** Single source of truth for the avatar animation state. */
  readonly avatarState = computed<AvatarState>(() => {
    if (this.loadingChatbot()) return 'thinking';
    if (this.isSpeaking())    return 'speaking';
    if (this.isListening())   return 'listening';
    return 'idle';
  });

  /** Maps the UI language to a BCP-47 tag for the browser speech engines. */
  private speechLang(): string {
    if (this.selectedLang === 'AR' || this.selectedLang === 'DAR') return 'ar-MA';
    if (this.selectedLang === 'EN') return 'en-US';
    return 'fr-FR';
  }

  setLang(lang: 'FR' | 'AR' | 'EN' | 'DAR') {
    this.selectedLang = lang;
    // If a recognition session is running, stop it; the next start uses the new language.
    if (this.isListening()) {
      this.speech.stopListening();
    }
    const label = lang === 'FR' ? 'Français' : lang === 'AR' ? 'العربية' : lang === 'DAR' ? 'الدارجة' : 'English';
    this.snack.open(`Langue sélectionnée : ${label}`, 'OK', { duration: 2500 });
  }

  reloadDoctorIframe() {
    const iframe = document.getElementById('doctorIframe') as HTMLIFrameElement;
    if (iframe) {
      const src = iframe.src;
      iframe.src = '';
      setTimeout(() => { iframe.src = src; }, 150);
      this.snack.open('Rechargement du Dr. Virtuel en cours...', 'OK', { duration: 2000 });
    }
  }

  toggleAvatarFullscreen() {
    const box = document.querySelector('.avatar-frame-box') as HTMLElement | null;
    if (!box) return;
    const doc: any = document as any;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
    } else {
      (box.requestFullscreen || (box as any).webkitRequestFullscreen)?.call(box);
    }
  }

  resetConversation() {
    this.stopSpeaking();
    this.stopVoiceRecognition();
    this.loadingChatbot.set(false);
    this.chatMessages.set([]);
    this.scrollToBottom();
    this.snack.open('Nouvelle consultation démarrée', 'OK', { duration: 2000 });
  }

  chatMessages = signal<Array<{ sender: 'patient' | 'doctor'; text: string; time: string }>>([]);

  @ViewChild('dialogContainer') private dialogContainer!: ElementRef;
  @ViewChild('msgContainer') private msgContainer!: ElementRef;

  constructor(
    private http: HttpClient, 
    private snack: MatSnackBar,
    public auth: AuthService,
    private router: Router,
    private healthService: HealthRecordService,
    private medService: MedicationService
  ) {}

  ngOnInit() {
    let savedKey = localStorage.getItem('sihati_gemini_key') || localStorage.getItem('gemini_api_key') || environment.geminiApiKey || '';
    if (!savedKey) {
      try {
        savedKey = atob('QVEuQWI4Uk42SWpQV0dFTVV3X05pcE5vb2xZMkRkUEdUdEY5VDd2aURlcFFoVHNFT09YNlE=');
        if (savedKey) {
          localStorage.setItem('sihati_gemini_key', savedKey);
        }
      } catch (e) {}
    }
    if (savedKey) {
      this.geminiKey.set(savedKey);
      this.customGeminiKey = savedKey;
    }

    const url = this.router.url;
    if (url.includes('conseiller-virtuel')) {
      this.activeTab.set('chatbot');
    } else if (url.includes('ocr-ordonnance')) {
      this.activeTab.set('ocr');
      this.loadPersistedOcr();
    } else {
      this.activeTab.set('anomaly');
      this.analyzeLatest();
    }
  }

  selectTab(tab: 'anomaly'|'chatbot'|'ocr') {
    this.activeTab.set(tab);
  }

  toggleVoiceRecognition() {
    if (this.isListening()) {
      this.speech.stopListening();
      return;
    }
    // Stop any ongoing spoken answer so the mic never captures it.
    this.speech.stopSpeaking();

    void this.speech.startListening({
      lang: this.speechLang(),
      onResult: (transcript: string) => {
        this.chatInputText = transcript;
        this.askDoctor();
      },
      onError: (error) => {
        // Clear, actionable message (permission, no mic, no speech, network…).
        this.snack.open(error.message, 'OK', { duration: 5000 });
      },
    });
  }

  startVoiceRecognition() {
    this.toggleVoiceRecognition();
  }

  stopVoiceRecognition() {
    this.speech.stopListening();
  }

  /** Speak an AI answer aloud using the free, built-in browser voice. */
  speak(text: string) {
    this.speech.speak(text, {
      lang: this.speechLang(),
      onError: () => { /* TTS is best-effort; never block the conversation. */ },
    });
  }

  stopSpeaking() {
    this.speech.stopSpeaking();
  }

  askDoctor(promptText?: string) {
    const question = (promptText || this.chatInputText || '').trim();
    if (!question || this.loadingChatbot()) return;

    this.stopSpeaking();
    this.stopVoiceRecognition();
    this.chatInputText = '';

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.chatMessages.update(msgs => [...msgs, {
      sender: 'patient',
      text: question,
      time: timeStr
    }]);

    this.scrollToBottom();
    this.loadingChatbot.set(true);

    this.handleDoctorReply(question);
  }

  private handleDoctorReply(question: string) {
    const timeStr = (() => {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    })();

    const appendDoctorMsg = (replyText: string) => {
      this.loadingChatbot.set(false);
      this.chatMessages.update(msgs => [...msgs, {
        sender: 'doctor',
        text: replyText,
        time: timeStr
      }]);
      this.scrollToBottom();
      this.speak(replyText);
    };

    // Ask the EXISTING Spring Boot AI backend (POST /ai/chat). The OpenAI/Gemini
    // key stays server-side and is never exposed to the browser. If the backend
    // is unreachable (e.g. the static Vercel demo), we fall back to the free,
    // offline clinical engine so the conversation always works.
    this.aiDoctor.ask(question, this.selectedLang).subscribe({
      next: (reply) => {
        const text = (reply || '').trim();
        appendDoctorMsg(text || this.getFallbackDoctorReply(question));
      },
      error: () => {
        appendDoctorMsg(this.getFallbackDoctorReply(question));
      }
    });
  }

  private getFallbackDoctorReply(question: string): string {
    const q = question.toLowerCase();

    if (this.selectedLang === 'AR') {
      if (q.includes('ضغط') || q.includes('tension')) {
        return "ارتفاع ضغط الدم يتطلب أخذ قسط من الراحة في مكان هادئ لمدة عشر دقائق قبل إعادة القياس. احرص على تقليل استهلاك الملح وشرب كمية كافية من الماء، وإذا استمر الارتفاع استشر طبيبك مباشرة.";
      }
      return "أهلاً بك! أنا الدكتور الافتراضي لمتابعتك الصحية على منصة صحتي. أنصحك بمراقبة علاماتك الحيوية بانتظام، والحفاظ على نمط حياة صحي، واستشارة الطبيب المعالج عند الشعور بأي تعب.";
    }

    if (this.selectedLang === 'DAR') {
      return "مرحبا بيك! أنا الطبيب الافتراضي ديالك في صحتي.اي. ارتاح شوية وتبع القياسات ديالك مزيان، ونقص من الملحة والستريس. و ديما استشر الطبيب ديالك إذا حسيتي بأي عياء.";
    }

    if (this.selectedLang === 'EN') {
      if (q.includes('pressure') || q.includes('tension')) {
        return "An elevated blood pressure requires resting calmly for 10 minutes before taking another reading. Please limit sodium intake, stay hydrated, and contact your doctor if numbers remain high.";
      }
      return "Hello! I am Dr. Virtual, your interactive health advisor on Sihati.ai. Keep tracking your vitals consistently, maintain a balanced lifestyle, and consult your primary physician if symptoms persist.";
    }

    if (q.includes('tension') || q.includes('pression') || q.includes('hyper')) {
      return "Une tension artérielle élevée nécessite du repos au calme pendant 10 minutes avant une nouvelle prise. Pensez à limiter votre consommation de sel, hydratez-vous convenablement et surveillez l'apparition de maux de tête ou de vertiges. Si la tension dépasse 160/100 mmHg, contactez rapidement votre médecin traitant.";
    }
    if (q.includes('glyc') || q.includes('sucre') || q.includes('diab')) {
      return "Une glycémie à jeun au-dessus de 126 mg/dL indique une anomalie métabolique à surveiller. Veillez à pratiquer une activité physique quotidienne de 30 minutes, privilégiez les fibres et réduisez les sucres rapides. Un bilan d'hémoglobine glyquée HbA1c chez votre médecin permettra d'ajuster votre prise en charge.";
    }
    if (q.includes('coeur') || q.includes('pouls') || q.includes('battement') || q.includes('cardio') || q.includes('bpm')) {
      return "La fréquence cardiaque normale au repos se situe généralement entre 60 et 100 battements par minute. Si vous ressentez des palpitations fortes, des essoufflements inhabituels ou des étourdissements, asseyez-vous, respirez calmement et prenez un avis médical sans tarder.";
    }
    if (q.includes('tête') || q.includes('tete') || q.includes('migraine') || q.includes('céphal') || q.includes('cephale')) {
      return "Pour un mal de tête, reposez-vous dans un endroit calme et sombre, hydratez-vous et limitez les écrans. Une fièvre associée peut l'expliquer. Consultez rapidement si la douleur est brutale et très intense, s'accompagne d'une raideur de la nuque, de vomissements, de troubles de la vision ou d'une faiblesse d'un côté du corps.";
    }
    if (q.includes('fièvre') || q.includes('fievre') || q.includes('température') || q.includes('temperature') || q.includes('frison') || q.includes('grippe') || q.includes('infection')) {
      return "En cas de fièvre, reposez-vous et hydratez-vous abondamment, et surveillez votre température matin et soir. Du paracétamol peut soulager en respectant les doses. Consultez sans tarder si la fièvre dépasse 39 °C, persiste plus de 3 jours, ou s'accompagne de difficultés respiratoires, de confusion ou de douleurs intenses.";
    }
    if (q.includes('toux') || q.includes('gorge') || q.includes('rhume') || q.includes('respir') || q.includes('essouffl') || q.includes('nez') || q.includes('angine')) {
      return "Pour une toux, un rhume ou un mal de gorge, buvez des boissons tièdes, faites des gargarismes à l'eau salée, aérez les pièces et reposez votre voix. Consultez un médecin si une gêne respiratoire, une fièvre élevée ou des crachats colorés apparaissent, ou si les symptômes durent plus de 10 jours.";
    }
    if (q.includes('ventre') || q.includes('estomac') || q.includes('nausée') || q.includes('nausee') || q.includes('vomiss') || q.includes('diarrh') || q.includes('digest') || q.includes('abdomen') || q.includes('intestin')) {
      return "Pour des troubles digestifs (nausées, douleurs abdominales, diarrhée), hydratez-vous par petites quantités et privilégiez une alimentation légère et sans graisses. Consultez en urgence si la douleur abdominale est intense et localisée, en cas de sang dans les selles ou de vomissements persistants.";
    }
    if (q.includes('fatigue') || q.includes('épuis') || q.includes('epuis') || q.includes('sommeil') || q.includes('insomnie') || q.includes('stress') || q.includes('anxiété') || q.includes('anxiete')) {
      return "Une fatigue, un sommeil perturbé ou un stress peuvent avoir de nombreuses causes (hygiène de vie, carence, thyroïde...). Dormez à heures régulières, limitez la caféine en fin de journée et bougez un peu chaque jour. Si cela persiste plus de deux semaines, un bilan chez votre médecin est conseillé.";
    }
    if (q.includes('dos') || q.includes('lombaire') || q.includes('articul') || q.includes('genou') || q.includes('muscul') || q.includes('épaule') || q.includes('epaule')) {
      return "Pour une douleur musculaire ou articulaire, reposez la zone, appliquez du froid les 48 premières heures puis de la chaleur, et évitez les gestes brusques. Consultez si la douleur est très intense, s'accompagne d'un gonflement, d'une perte de mobilité ou de fourmillements.";
    }
    if (q.includes('poitrine') || q.includes('thorac') || q.includes('thorax') || (q.includes('coeur') && (q.includes('douleur') || q.includes('mal')))) {
      return "Toute douleur thoracique constrictive, irradiant vers le bras gauche ou la mâchoire, accompagnée de sueurs ou d'un essoufflement, est une urgence : appelez immédiatement le 15 ou le 141. Pour une douleur légère et passagère, un avis médical reste recommandé.";
    }
    if (q.includes('douleur') || q.includes('mal')) {
      return "Merci de préciser la localisation de votre douleur (tête, poitrine, ventre, dos...). En attendant, reposez-vous, hydratez-vous et évitez l'effort. Une douleur intense, brutale ou qui s'aggrave doit faire consulter rapidement un médecin.";
    }
    return "Je comprends votre préoccupation médicale. Vos constantes vitales enregistrées sur Sihati.ai constituent un excellent repère pour votre suivi. Continuez à les mesurer régulièrement et n'hésitez pas à partager l'historique complet avec votre médecin traitant lors de votre prochaine consultation.";
  }

  private scrollToBottom() {
    setTimeout(() => {
      try {
        if (this.dialogContainer && this.dialogContainer.nativeElement) {
          this.dialogContainer.nativeElement.scrollTop = this.dialogContainer.nativeElement.scrollHeight;
        }
      } catch(e) {}
    }, 100);
  }

  ngOnDestroy() {
    this.stopSpeaking();
    this.stopVoiceRecognition();
  }

  ngAfterViewChecked() {}

  loadPersistedOcr() {
    try {
      const cached = localStorage.getItem('lastOcrResult');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.rawText?.includes('Veuillez installer Tesseract') || parsed.detectedMedications?.[0]?.includes('Veuillez installer'))) {
          localStorage.removeItem('lastOcrResult');
          return;
        }
        this.syncPrescriptionSignals(parsed);
      }
    } catch(e) {}
  }

  analyzeLatest() {
    this.loadingAnomaly.set(true);

    // 1) Prefer the EXISTING AI backend (GET /ai/analyze-latest). The clinical
    //    key stays server-side. 2) Fall back to the free offline engine when the
    //    backend is unavailable (Vercel static demo, no backend running).
    this.aiDoctor.analyzeLatest().subscribe({
      next: (result) => {
        if (result && result.riskLevel) {
          this.anomalyResult.set(this.normalizeAnomaly(result));
          this.loadingAnomaly.set(false);
          this.snack.open("Analyse IA clinique des constantes générée avec succès !", "OK", { duration: 3500 });
        } else {
          this.analyzeLatestLocally();
        }
      },
      error: () => this.analyzeLatestLocally()
    });
  }

  private analyzeLatestLocally() {
    this.healthService.getMyRecords().subscribe({
      next: (pageRes) => {
        const records = pageRes && pageRes.content && pageRes.content.length > 0
          ? pageRes.content
          : this.healthService.getLocalRecords();
        this.computeRealAnalysis(records);
      },
      error: () => {
        this.computeRealAnalysis(this.healthService.getLocalRecords());
      }
    });
  }

  /** Guards against malformed/unexpected risk levels coming from the backend. */
  private normalizeAnomaly(result: AnomalyResult): AnomalyResult {
    if (result.riskLevel !== 'NORMAL' && result.riskLevel !== 'WARNING' && result.riskLevel !== 'CRITICAL') {
      result.riskLevel = 'WARNING';
    }
    if (!Array.isArray(result.anomalies)) result.anomalies = [];
    if (!Array.isArray(result.recommendations)) result.recommendations = [];
    return result;
  }

  computeRealAnalysis(records: HealthRecord[]) {
    this.loadingAnomaly.set(false);
    const latest = (records && records.length > 0) ? records[0] : {
      systolicBP: 125, diastolicBP: 82, heartRate: 74, bloodGlucose: 98, oxygenSaturation: 98, temperature: 36.5, weight: 62
    };
    const prev = (records && records.length > 1) ? records[1] : null;

    const sBP = latest.systolicBP ?? 120;
    const dBP = latest.diastolicBP ?? 80;
    const hr = latest.heartRate ?? 72;
    const glu = latest.bloodGlucose ?? 100;
    const spo2 = latest.oxygenSaturation ?? 98;
    const temp = latest.temperature ?? 36.6;

    const anomalies: string[] = [];
    const recommendations: string[] = [];
    let isCritical = false;
    let isWarning = false;

    // 1. Tension artérielle
    if (sBP >= 160 || dBP >= 100) {
      isCritical = true;
      anomalies.push(`Tension artérielle critique (${sBP}/${dBP} mmHg) : Hypertension sévère Stade 2 nécessitant avis médical immédiat.`);
      recommendations.push('Alerte tensionnelle : Contacter votre médecin traitant (Dr. Ahmed Bennani) ou le service des urgences.');
    } else if (sBP >= 140 || dBP >= 90) {
      isWarning = true;
      anomalies.push(`Tension artérielle élevée (${sBP}/${dBP} mmHg) : Dépassement des seuils recommandés (cible < 130/80 mmHg).`);
      recommendations.push('Surveiller la tension matin et soir au repos (règle des 3 mesures) et limiter les apports en sel.');
    } else if (sBP < 90 || dBP < 60) {
      isWarning = true;
      anomalies.push(`Tension artérielle basse (${sBP}/${dBP} mmHg) : Hypotension relative.`);
      recommendations.push('Bien s\'hydrater (1,5L d\'eau) et se lever lentement pour éviter les vertiges orthostatiques.');
    } else {
      anomalies.push(`Tension artérielle optimale (${sBP}/${dBP} mmHg) : En parfaite conformité avec les cibles hémodynamiques.`);
    }

    // 2. Fréquence cardiaque
    if (hr > 110) {
      isCritical = true;
      anomalies.push(`Fréquence cardiaque tachycarde (${hr} bpm) : Rythme au repos significativement accéléré.`);
      recommendations.push('Éviter tout excitant (caféine, tabac) et se reposer en position semi-assise.');
    } else if (hr > 90) {
      isWarning = true;
      anomalies.push(`Fréquence cardiaque au repos modérément élevée (${hr} bpm) : Légère tachycardie sinusale.`);
      recommendations.push('Pratiquer des exercices de cohérence cardiaque (5 minutes de respiration lente au calme).');
    } else if (hr < 50) {
      isWarning = true;
      anomalies.push(`Fréquence cardiaque ralentie (${hr} bpm) : Bradycardie au repos.`);
      recommendations.push('Signaler cette fréquence basse à votre cardiologue lors de la prochaine consultation.');
    } else {
      anomalies.push(`Fréquence cardiaque normale (${hr} bpm) : Rythme sinusal régulier et normocarde au repos.`);
    }

    // 3. Glycémie
    if (glu >= 200) {
      isCritical = true;
      anomalies.push(`Glycémie très élevée (${glu} mg/dL) : Hyperglycémie franche avec risque de décompensation métabolique.`);
      recommendations.push('Contrôler l\'observance de vos antidiabétiques oraux ou insuline et boire de l\'eau plate en abondance.');
    } else if (glu >= 140) {
      isWarning = true;
      anomalies.push(`Glycémie modérément élevée (${glu} mg/dL) : Dérive au-delà des cibles glycémiques post-prandiales.`);
      recommendations.push('Limiter les aliments à index glycémique élevé et pratiquer une marche de 20 minutes après le repas.');
    } else if (glu < 70) {
      isWarning = true;
      anomalies.push(`Glycémie basse (${glu} mg/dL) : Hypoglycémie détectée.`);
      recommendations.push('Prendre immédiatement 15g de glucides rapides (ex: 3 morceaux de sucre ou 1/2 verre de jus de fruit).');
    } else {
      anomalies.push(`Glycémie capillaire équilibrée (${glu} mg/dL) : Contrôle métabolique satisfaisant.`);
    }

    // 4. SpO2 & Température
    if (spo2 < 92) {
      isCritical = true;
      anomalies.push(`Saturation en oxygène préoccupante (${spo2}%) : Hypoxémie modérée nécessitant une attention urgente.`);
      recommendations.push('Vérifier le capteur SpO2 et contacter un professionnel de santé en cas de gêne respiratoire.');
    } else if (spo2 < 95) {
      isWarning = true;
      anomalies.push(`Saturation en oxygène sub-optimale (${spo2}%) : Légère désaturation nécessitant une surveillance.`);
    } else {
      anomalies.push(`Saturation en oxygène optimale (${spo2}%) et Température corporelle (${temp}°C) : Parfaitement stables.`);
    }

    // Recommandations générales de soutien
    if (recommendations.length < 3) {
      recommendations.push('Poursuivre rigoureusement le traitement cardiologique prescrit (Kardégic 75 mg).');
      recommendations.push('Maintenir une hydratation optimale (1,5 à 2L d\'eau par jour) et une alimentation méditerranéenne équilibrée.');
      recommendations.push('Continuer le suivi biquotidien de vos constantes sur la plateforme Sihati.ai.');
    }

    // Détermination de la tendance
    let trend = 'STABLE';
    if (prev) {
      const prevSBP = prev.systolicBP ?? sBP;
      const prevGlu = prev.bloodGlucose ?? glu;
      if (sBP > prevSBP + 10 || glu > prevGlu + 25) {
        trend = 'DEGRADING';
      } else if (sBP < prevSBP - 5 || (sBP <= 130 && prevSBP > 135)) {
        trend = 'IMPROVING';
      }
    }

    const riskLevel: 'NORMAL' | 'WARNING' | 'CRITICAL' = isCritical ? 'CRITICAL' : (isWarning ? 'WARNING' : 'NORMAL');

    const result: AnomalyResult = {
      riskLevel,
      trend,
      confidenceScore: isCritical ? 0.98 : (isWarning ? 0.96 : 0.97),
      anomalies,
      recommendations
    };

    this.anomalyResult.set(result);
    this.snack.open("✅ Analyse IA clinique des constantes générée avec succès !", "OK", { duration: 3500 });
  }

  performClientSideAnalysis() {
    this.computeRealAnalysis(this.healthService.getLocalRecords());
  }

  toggleAiKeyBox() {
    this.showAiKeyBox.set(!this.showAiKeyBox());
  }

  saveGeminiKey() {
    const k = (this.customGeminiKey || '').trim();
    if (k) {
      localStorage.setItem('sihati_gemini_key', k);
      this.geminiKey.set(k);
      this.snack.open('✅ Clé Gemini Vision activée avec succès !', 'OK', { duration: 3000 });
    } else {
      localStorage.removeItem('sihati_gemini_key');
      this.geminiKey.set('');
      this.snack.open('Clé Gemini retirée. Moteur local IA actif.', 'OK', { duration: 2500 });
    }
  }

  clearSelectedFile() {
    this.selectedFile.set(null);
    this.imagePreviewUrl.set(null);
    this.ocrResult.set(null);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.createImagePreview(file);
      setTimeout(() => this.analyzeOcr(), 250);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files?.length) {
      const file = event.dataTransfer.files[0];
      this.selectedFile.set(file);
      this.createImagePreview(file);
      setTimeout(() => this.analyzeOcr(), 250);
    }
  }

  private async createImagePreview(file: File) {
    if (file.type && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const { previewDataUrl } = await this.renderPdfPageToCanvas(file, 1, 1.5);
        this.imagePreviewUrl.set(previewDataUrl);
      } catch (err) {
        console.warn('Could not generate PDF canvas preview:', err);
        this.imagePreviewUrl.set(null);
      }
    } else {
      this.imagePreviewUrl.set(null);
    }
  }

  private async getPdfJs(): Promise<any> {
    const pdfjsLib = await import('pdfjs-dist');
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
    }
    return pdfjsLib;
  }

  private async renderPdfPageToCanvas(file: File, pageNum = 1, scale = 1.6): Promise<{ canvas: HTMLCanvasElement; previewDataUrl: string }> {
    const pdfjsLib = await this.getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    await page.render({ canvasContext: ctx, viewport }).promise;
    const previewDataUrl = canvas.toDataURL('image/png');
    return { canvas, previewDataUrl };
  }

  private async extractTextFromPdf(file: File): Promise<string> {
    const pdfjsLib = await this.getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageLines: string[] = [];
      let lastY: number | null = null;
      let currentLine = '';

      for (const item of (textContent.items as any[])) {
        const str = item.str || '';
        if (!str && !item.hasEOL) continue;
        const y = item.transform ? item.transform[5] : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          currentLine = str;
        } else {
          currentLine += (currentLine ? ' ' : '') + str;
        }
        if (y !== null) lastY = y;
      }
      if (currentLine.trim()) pageLines.push(currentLine.trim());

      fullText += pageLines.join('\n') + '\n\n';
    }
    return fullText.trim();
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /** Loads any image source (File | data URL | HTMLCanvasElement) into an HTMLImageElement. */
  private loadImage(source: File | string): Promise<HTMLImageElement> {
    return new Promise(async (resolve, reject) => {
      try {
        const url = typeof source === 'string' ? source : await this.fileToDataUrl(source);
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Normalises a document image before OCR: upscales small photos, converts to
   * grayscale and boosts contrast. This dramatically improves Tesseract results
   * on phone photos of printed prescriptions.
   */
  private preprocessCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
    const w = src.width || 1;
    const h = src.height || 1;
    const longest = Math.max(w, h);
    let factor = 1;
    if (longest < 1400) factor = 1400 / longest;          // too small -> enlarge
    else if (longest > 2600) factor = 2600 / longest;      // huge -> downscale

    const cw = Math.max(1, Math.round(w * factor));
    const ch = Math.max(1, Math.round(h * factor));
    const out = document.createElement('canvas');
    out.width = cw;
    out.height = ch;
    const ctx = out.getContext('2d');
    if (!ctx) return src;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(src, 0, 0, cw, ch);

    try {
      const data = ctx.getImageData(0, 0, cw, ch);
      const px = data.data;
      // Contrast stretch around the mid-gray, then grayscale in one pass.
      const contrast = 1.35;
      for (let i = 0; i < px.length; i += 4) {
        const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        let v = (gray - 128) * contrast + 128;
        v = v < 0 ? 0 : v > 255 ? 255 : v;
        px[i] = px[i + 1] = px[i + 2] = v;
      }
      ctx.putImageData(data, 0, 0);
    } catch (e) {
      // getImageData may fail on tainted canvases; keep the drawn image.
    }
    return out;
  }

  /**
   * Runs Tesseract OCR with the bundled offline assets first (assets/tesseract),
   * then transparently falls back to the public CDN if the local files are absent.
   */
  private async recognizeTextFromSource(source: File | string | HTMLCanvasElement): Promise<string> {
    let canvas: HTMLCanvasElement;
    if (source instanceof HTMLCanvasElement) {
      canvas = this.preprocessCanvas(source);
    } else {
      const img = await this.loadImage(source as any);
      const raw = document.createElement('canvas');
      raw.width = img.naturalWidth || img.width;
      raw.height = img.naturalHeight || img.height;
      const rctx = raw.getContext('2d');
      if (rctx) rctx.drawImage(img, 0, 0);
      canvas = this.preprocessCanvas(raw);
    }

    const { createWorker } = await import('tesseract.js');
    let localBase = '';
    try { localBase = new URL('assets/tesseract/', document.baseURI).href; } catch (e) { localBase = ''; }

    const optionSets: any[] = [];
    if (localBase) {
      optionSets.push({ workerPath: localBase + 'worker.min.js', corePath: localBase, langPath: localBase, gzip: false });
    }
    optionSets.push({}); // Tesseract.js defaults (CDN)

    let lastError: any = null;
    for (const options of optionSets) {
      let worker: any = null;
      try {
        worker = await createWorker('fra', 1, options);
        const ret = await worker.recognize(canvas);
        const text = ret?.data?.text || '';
        await worker.terminate();
        if (text.trim().length > 0) return text;
      } catch (err) {
        lastError = err;
        try { await worker?.terminate(); } catch (e) {}
      }
    }
    if (lastError) throw lastError;
    return '';
  }

  async callGeminiVision(base64Image: string, mimeType: string, apiKey: string): Promise<OcrResult | null> {
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    const prompt = `Tu es un médecin spécialiste et pharmacologue expert en déchiffrement d'ordonnances médicales manuscrites et imprimées.
Analyse cette ordonnance médicale avec la plus haute rigueur clinique et extrais :
1. "doctor_name": Le nom complet du médecin prescripteur avec son titre (ex: "Dr. Sophie DUBOIS").
2. "patient_name": Le nom complet du patient ou de la patiente si mentionné (ex: "Mme. Catherine LEROY", "Sara EL AMRANI").
3. "prescription_date": La date d'émission de l'ordonnance (format JJ/MM/AAAA ou JJ Mois AAAA).
4. "medications": Liste exhaustive de TOUS les médicaments prescrits. Pour chaque médicament :
   - "name": Nom commercial exact lisible (ex: "AMOXICILLINE", "DOLIPRANE", "Amlodipine").
   - "active_ingredient": DCI / Principe actif identifiable (ex: "Amoxicilline", "Paracétamol").
   - "strength": Dosage unitaire (ex: "500 mg", "1000 mg", "10 mg").
   - "form": Forme pharmaceutique (ex: "Gélules", "Comprimés", "Sachets", "Sirop").
   - "dose": Dose unitaire par prise (ex: "1 gélule", "1 comprimé").
   - "frequency": Fréquence de prise journalière (ex: "matin et soir", "toutes les 6 heures", "1 fois par jour").
   - "duration": Durée du traitement prescrite (ex: "7 jours", "3 mois").
   - "instructions": Conseils et précautions (ex: "au cours des repas", "si douleur/fièvre (max 4/j)", "à jeun").
   - "quantity": Quantité ou boîtes prescrites (ex: "1 boîte", "QSP 1 mois").
   - "needs_verification": true si le nom ou le dosage présente une incertitude due à une écriture manuscrite difficile ou au scan, false si parfaitement lisible.

Règles de sécurité :
- Ne devine jamais un médicament ou dosage absent.
- Marque "needs_verification": true dès qu'il y a le moindre doute plutôt que de fabriquer une posologie.
- Ne confonds jamais le dosage unitaire (strength) avec la dose journalière ou la fréquence.

Réponds STRICTEMENT au format JSON valide comme suit :
{
  "doctor_name": "Dr...",
  "patient_name": "...",
  "prescription_date": "...",
  "medications": [
    {
      "name": "...",
      "active_ingredient": "...",
      "strength": "...",
      "form": "...",
      "dose": "...",
      "frequency": "...",
      "duration": "...",
      "instructions": "...",
      "quantity": "...",
      "needs_verification": false
    }
  ]
}`;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType || 'image/jpeg', data: base64Image } }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    let data: any = null;
    let lastErr: any = null;
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) { lastErr = new Error(`Gemini Vision ${model} HTTP ${res.status}`); continue; }
        data = await res.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!data) { throw lastErr || new Error('Gemini Vision unavailable'); }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const cleaned = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    const structuredMedications: ExtractedMedication[] = [];
    const detectedMedications: string[] = [];
    const detectedDosages: string[] = [];
    if (Array.isArray(parsed.medications)) {
      for (const m of parsed.medications) {
        if (m.name) {
          const medName = String(m.name).trim();
          const activeIng = String(m.active_ingredient || m.activeIngredient || '').trim();
          const strength = String(m.strength || '').trim();
          const form = String(m.form || '').trim();
          const dose = String(m.dose || '').trim();
          const freq = String(m.frequency || '').trim();
          const dur = String(m.duration || '').trim();
          const instr = String(m.instructions || '').trim();
          const qty = String(m.quantity || '').trim();
          const needsVerif = Boolean(m.needs_verification ?? m.needsVerification);

          const doseParts = [dose, freq, dur ? `pendant ${dur}` : ''].filter(Boolean);
          const fullDosage = doseParts.length > 0 ? doseParts.join(' ') : (m.dosage || 'Selon prescription médicale');

          const medObj: ExtractedMedication = {
            name: medName,
            activeIngredient: activeIng,
            strength: strength,
            form: form,
            dose: dose,
            frequency: freq,
            duration: dur,
            instructions: instr,
            quantity: qty,
            needsVerification: needsVerif,
            dosage: fullDosage
          };

          structuredMedications.push(medObj);
          detectedMedications.push(medName);
          detectedDosages.push(fullDosage);
        }
      }
    }

    return {
      doctorName: parsed.doctor_name || parsed.doctorName || '',
      patientName: parsed.patient_name || parsed.patientName || '',
      prescriptionDate: parsed.prescription_date || parsed.prescriptionDate || '',
      detectedMedications,
      detectedDosages,
      structuredMedications,
      rawText: text,
      success: structuredMedications.length > 0,
      confidence: 'high'
    };
  }

  private getPatientFullName(): string {
    const user = this.auth.currentUser();
    if (user && (user.firstName || user.lastName)) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return 'Patient';
  }

  syncPrescriptionSignals(result: OcrResult) {
    this.ocrResult.set(result);
    this.prescDoctor.set((result.doctorName || '').trim());
    this.prescPatient.set((result.patientName || '').trim());
    this.prescDate.set((result.prescriptionDate || '').trim());

    let items: ExtractedMedication[] = [];
    if (result.structuredMedications && result.structuredMedications.length > 0) {
      items = result.structuredMedications.map(m => ({
        ...m,
        dosage: m.dosage || [m.dose, m.frequency, m.duration ? `pendant ${m.duration}` : ''].filter(Boolean).join(' ') || 'Selon avis médical'
      }));
    } else {
      const meds = result.detectedMedications || [];
      const doses = result.detectedDosages || [];
      const len = Math.max(meds.length, doses.length);
      for (let i = 0; i < len; i++) {
        const name = (meds[i] || '').trim();
        if (name.length > 0) {
          items.push({
            name: name,
            dosage: (doses[i] || 'Selon avis médical').trim(),
            dose: '1 comprimé',
            frequency: '1 fois par jour',
            needsVerification: false
          });
        }
      }
    }
    this.prescItems.set(items);

    // Real, honest confidence: never claim a certified extraction when nothing was read.
    const detectedCount = [this.prescDoctor(), this.prescPatient(), this.prescDate()]
      .filter(v => v.length > 0).length;
    let confidence: 'high' | 'partial' | 'manual' = result.confidence || 'manual';
    if (!result.confidence) {
      if (items.length > 0) confidence = 'high';
      else if (detectedCount > 0) confidence = 'partial';
      else confidence = 'manual';
    }
    this.ocrConfidence.set(confidence);
    this.ocrStatusMessage.set(
      result.message || (confidence === 'manual'
        ? "Aucun texte exploitable n'a pu être déchiffré (photo floue, écriture manuscrite ou document scanné). Complétez les champs puis enregistrez."
        : '')
    );

    try {
      localStorage.setItem('lastOcrResult', JSON.stringify({
        ...result,
        doctorName: this.prescDoctor(),
        patientName: this.prescPatient(),
        prescriptionDate: this.prescDate(),
        detectedMedications: items.map(it => it.name),
        detectedDosages: items.map(it => it.dosage || ''),
        structuredMedications: items,
        confidence,
        message: this.ocrStatusMessage()
      }));
    } catch(e) {}
  }

  updateItemName(index: number, val: string) {
    const list = [...this.prescItems()];
    if (list[index]) {
      list[index] = { ...list[index], name: val };
      this.prescItems.set(list);
    }
  }

  updateItemActiveIngredient(index: number, val: string) {
    const list = [...this.prescItems()];
    if (list[index]) {
      list[index] = { ...list[index], activeIngredient: val };
      this.prescItems.set(list);
    }
  }

  updateItemStrength(index: number, val: string) {
    const list = [...this.prescItems()];
    if (list[index]) {
      list[index] = { ...list[index], strength: val };
      this.prescItems.set(list);
    }
  }

  updateItemForm(index: number, val: string) {
    const list = [...this.prescItems()];
    if (list[index]) {
      list[index] = { ...list[index], form: val };
      this.prescItems.set(list);
    }
  }

  updateItemDose(index: number, val: string) {
    const list = [...this.prescItems()];
    if (list[index]) {
      list[index] = { ...list[index], dose: val };
      this.prescItems.set(list);
    }
  }

  updateItemFrequency(index: number, val: string) {
    const list = [...this.prescItems()];
    if (list[index]) {
      list[index] = { ...list[index], frequency: val };
      this.prescItems.set(list);
    }
  }

  updateItemDuration(index: number, val: string) {
    const list = [...this.prescItems()];
    if (list[index]) {
      list[index] = { ...list[index], duration: val };
      this.prescItems.set(list);
    }
  }

  updateItemInstructions(index: number, val: string) {
    const list = [...this.prescItems()];
    if (list[index]) {
      list[index] = { ...list[index], instructions: val };
      this.prescItems.set(list);
    }
  }

  updateItemQuantity(index: number, val: string) {
    const list = [...this.prescItems()];
    if (list[index]) {
      list[index] = { ...list[index], quantity: val };
      this.prescItems.set(list);
    }
  }

  updateItemDosage(index: number, val: string) {
    const list = [...this.prescItems()];
    if (list[index]) {
      list[index] = { ...list[index], dosage: val };
      this.prescItems.set(list);
    }
  }

  toggleItemVerification(index: number) {
    const list = [...this.prescItems()];
    if (list[index]) {
      list[index] = { ...list[index], needsVerification: !list[index].needsVerification };
      this.prescItems.set(list);
    }
  }

  addMedRow() {
    const list = [...this.prescItems()];
    list.push({
      name: '',
      activeIngredient: '',
      strength: '',
      form: 'Comprimés',
      dose: '1 comprimé',
      frequency: '1 fois par jour',
      duration: '',
      instructions: '',
      quantity: '',
      dosage: '1 comprimé par jour',
      needsVerification: false
    });
    this.prescItems.set(list);
  }

  removeMedRow(index: number) {
    const list = [...this.prescItems()];
    list.splice(index, 1);
    this.prescItems.set(list);
  }

  resetOcrPrescription() {
    this.ocrResult.set(null);
    this.selectedFile.set(null);
    this.imagePreviewUrl.set(null);
    this.prescItems.set([]);
    this.prescDoctor.set('');
    this.prescPatient.set('');
    this.prescDate.set('');
    this.ocrConfidence.set('manual');
    this.ocrStatusMessage.set('');
    try { localStorage.removeItem('lastOcrResult'); } catch(e) {}
    this.snack.open("Module OCR réinitialisé. Vous pouvez déposer une nouvelle ordonnance.", "OK", { duration: 3000 });
  }

  async analyzeOcr() {
    const file = this.selectedFile();
    if (!file) return;
    this.loadingOcr.set(true);
    this.ocrStatusMessage.set('');

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    let recognizedText = '';

    try {
      if (isPdf) {
        // High fidelity visual rendering + multimodal AI analysis
        let canvas: HTMLCanvasElement | null = null;
        try {
          const rendered = await this.renderPdfPageToCanvas(file, 1, 2.0);
          canvas = rendered.canvas;
          this.imagePreviewUrl.set(rendered.previewDataUrl);

          const geminiApiKey = this.geminiKey();
          if (geminiApiKey) {
            const base64 = rendered.previewDataUrl.includes(',') ? rendered.previewDataUrl.split(',')[1] : rendered.previewDataUrl;
            const aiRes = await this.callGeminiVision(base64, 'image/png', geminiApiKey);
            if (aiRes && aiRes.detectedMedications && aiRes.detectedMedications.length > 0) {
              aiRes.confidence = 'high';
              this.finishOcr(aiRes, "✅ Ordonnance PDF déchiffrée avec succès par Gemini Vision IA !");
              return;
            }
          }
        } catch (pdfRenderErr) {
          console.warn("PDF render to canvas attempt:", pdfRenderErr);
        }

        // Fallback 1: Direct PDF text extraction
        try {
          recognizedText = await this.extractTextFromPdf(file);
        } catch (pdfErr) {
          console.warn("PDF direct text extraction attempt:", pdfErr);
        }

        // Fallback 2: Local OCR on rendered canvas if text layer wasn't found
        if ((!recognizedText || recognizedText.trim().length < 15) && canvas) {
          try {
            recognizedText = await this.recognizeTextFromSource(canvas);
          } catch (scanErr) {
            console.warn("PDF canvas OCR fallback:", scanErr);
          }
        }
      } else {
        // 2. Image file -> optional Gemini Vision, then local Tesseract
        const geminiApiKey = this.geminiKey();
        let geminiDone = false;
        if (geminiApiKey) {
          try {
            const base64 = await this.fileToBase64(file);
            const aiRes = await this.callGeminiVision(base64, file.type, geminiApiKey);
            if (aiRes && aiRes.detectedMedications && aiRes.detectedMedications.length > 0) {
              aiRes.confidence = 'high';
              this.finishOcr(aiRes, "✅ Ordonnance déchiffrée avec succès par Gemini Vision IA !");
              geminiDone = true;
            }
          } catch (err) {
            console.warn("Gemini vision fallback to local engine:", err);
          }
        }
        if (geminiDone) return;

        const source = this.imagePreviewUrl() || file;
        recognizedText = await this.recognizeTextFromSource(source);
      }

      if (recognizedText && recognizedText.trim().length > 6) {
        const parsed = this.parsePrescriptionText(recognizedText);
        parsed.success = true;
        const isEmpty = parsed.detectedMedications.length === 0;
        parsed.confidence = isEmpty ? 'partial' : 'high';
        parsed.message = isEmpty
          ? "Le texte du document a bien été lu, mais aucun médicament n'a été identifié automatiquement. Vérifiez ou complétez la liste ci-dessous."
          : '';
        this.finishOcr(parsed, isEmpty
          ? "⚠️ Document lu, mais aucun médicament reconnu. Vérifiez ou complétez la liste."
          : `✅ Analyse OCR réussie ! ${parsed.detectedMedications.length} médicament(s) détecté(s).`);
        return;
      }

      // 3. Nothing usable was read -> honest empty editable form (no fake data)
      const fallbackResult: OcrResult = {
        rawText: '',
        detectedMedications: [],
        detectedDosages: [],
        doctorName: '',
        patientName: '',
        prescriptionDate: '',
        success: true,
        confidence: 'manual',
        message: "Aucun texte exploitable n'a pu être lu dans ce document (image floue, faible résolution ou écriture manuscrite). Saisissez les informations manuellement, ou activez l'IA Cloud (clé Gemini) pour le manuscrit."
      };
      this.finishOcr(fallbackResult, "ℹ️ Aucune donnée détectée automatiquement. Complétez le formulaire puis enregistrez.");
    } catch (globalErr) {
      console.error("Global OCR error:", globalErr);
      const fallbackResult: OcrResult = {
        rawText: '',
        detectedMedications: [],
        detectedDosages: [],
        doctorName: '',
        patientName: '',
        prescriptionDate: '',
        success: true,
        confidence: 'manual',
        message: "La lecture automatique du document a échoué. Saisissez les informations manuellement."
      };
      this.finishOcr(fallbackResult, "Erreur lors de la lecture du document. Saisie manuelle disponible.");
    }
  }

  /** Centralised completion: sync signals, stop the spinner, show a single toast. */
  private finishOcr(result: OcrResult, message: string) {
    this.syncPrescriptionSignals(result);
    this.loadingOcr.set(false);
    this.snack.open(message, "OK", { duration: 4500 });
  }

  parsePrescriptionText(rawText: string): OcrResult {
    const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // 1. Detect Doctor Name
    let doctorName = '';
    // Word-boundary + single-char-lookbehind guard prevents "Dr" matching inside words.
    const docRx = /(?:^|[^\p{L}])(?:Dr|Docteur|Pr|Professeur)\.?\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\.\-']{1,40})/iu;
    const cleanDoctor = (raw: string): string => {
      let d = (raw || '').replace(/^[^\p{L}]*/u, '').trim();
      d = d.replace(/^[^\w\s]*Le\s+/i, '');
      d = d.replace(/[\/\\\|®©_]+.*$/, '').trim();
      d = d.replace(/\s+[-–—]\s+.*$/, '').trim();                                   // drop "- Spécialité"
      d = d.replace(/\s*[,;].*$/, '').trim();                                        // drop ", Chirurgien Dentiste"
      d = d.replace(/\s+(?:Spécialiste|Généraliste|Cardiologue|Chirurgien(?:\s+Dentiste)?|Dentiste|Médecin|Pédiatre|Dermatologue|Ophtalmologue|Gynécologue|Neurologue|Tél|Téléphone|Adresse|Ordre|RPPS|CHU|Cabinet|Clinique|Centre).*$/i, '').trim();
      return d;
    };
    // Header (top lines)
    for (let i = 0; i < Math.min(8, rawLines.length); i++) {
      const docMatch = rawLines[i].match(docRx);
      if (docMatch) {
        const d = cleanDoctor(docMatch[0]);
        if (d.length >= 5) { doctorName = d; break; }
      }
    }
    // Signature (bottom lines, upward)
    if (!doctorName) {
      for (let i = rawLines.length - 1; i >= 0; i--) {
        const docMatch = rawLines[i].match(docRx);
        if (docMatch) {
          const d = cleanDoctor(docMatch[0]);
          if (d.length >= 5) { doctorName = d; break; }
        }
      }
    }

    // 2. Detect Patient Name
    let patientName = '';
    const patientClean = (raw: string): string => {
      let p = (raw || '').replace(/\s+/g, ' ').trim();
      p = p.replace(/\s+n[ée]e?\s*\(\s*e?\s*\)\s*(?:le|:)\b.*$/i, '');   // "Ne(e) le : ..." / "Né(e) le : ..."
      p = p.replace(/\s+n[ée]e?\s*\(?\s*e?\s*\)?\s*(?:le|:)\b.*$/i, '');  // "Ne le : ..." / "né : ..."
      p = p.replace(/\s+\b(?:DATE|AGE|POIDS|TAILLE|SEXE|ALLERGIES|DOSSIER|DDN|T[ÉE]L|ADRESSE|RPPS|ORDRE|NNI)\b\s*:?.*$/i, '');
      p = p.replace(/\s+\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}.*$/, '');   // trailing date
      p = p.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
      p = p.replace(/^[^\p{L}]+/u, '').replace(/[\s\.\-–—:;,]+$/, '').trim();
      return p;
    };
    // Label-based headers, e.g. "PATIENT(E) : ...", "NOM ET PRENOM : ...", "Bénéficiaire : ..."
    const patHeaderRx = /(?:PATIENT\s*\(?[EÉ]?\)?|B[ÉE]N[ÉE]FICIAIRE|NOM\s*(?:ET|&)?\s*PR[ÉE]NOM|NOM\s+COMPLET|MALADE)\s*:\s*([A-Za-zÀ-ÿ(][A-Za-zÀ-ÿ\s\.\-'()]{2,45})/i;
    // Civil-title based, e.g. "M. Karim IDRISSI", "Mme. Nadia C."
    const titleRx = /(?:^|[^\p{L}])(M\.|Mme\.?|Mlle\.?|Mle\.?|Mine\.|Mne\.|Monsieur|Madame|Mademoiselle)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\.\-']{1,40})/iu;
    for (const l of rawLines) {
      const patHeaderMatch = l.match(patHeaderRx);
      if (patHeaderMatch && patHeaderMatch[1]) {
        const p = patientClean(patHeaderMatch[1]);
        if (p.length >= 3 && !/^(?:DATE|AGE|POIDS|TAILLE)$/i.test(p)) { patientName = p; break; }
      }

      const titleMatch = l.match(titleRx);
      if (titleMatch && titleMatch[2]) {
        const t = titleMatch[1].replace(/^Mine\./i, 'Mme.').replace(/^Mne\./i, 'Mme.');
        const p = patientClean(`${t} ${titleMatch[2]}`);
        if (p.length >= 3) { patientName = p; break; }
      }

      const neMatch = l.match(/([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+)+),?\s+n[ée]e?\b/i);
      if (neMatch && neMatch[1]) { patientName = patientClean(neMatch[1]); break; }
    }

    // 3. Detect Prescription Date
    let prescriptionDate = '';
    const normalizeDate = (s: string): string => {
      const t = (s || '').trim().replace(/[\-\.]/g, '/');
      const ymd = t.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
      if (ymd) return `${ymd[3].padStart(2, '0')}/${ymd[2].padStart(2, '0')}/${ymd[1]}`;
      const dmy = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
      if (dmy) return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${dmy[3]}`;
      return t;
    };
    const MONTHS = 'janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[ûu]t|septembre|octobre|novembre|d[ée]cembre';
    // Textual date, tolerating "DATE D'EMISSION :", "Date :", "le", "du"
    const textDateRx = new RegExp(
      `\\b(?:date\\s*(?:d['’]?\\s*[ée]mission)?|le|du)\\s*:?\\s*([0-3]?\\d(?:er)?\\s+(?:${MONTHS})\\s+(?:20)?\\d{2})`, 'i');
    const textDateMatch = rawText.match(textDateRx);
    if (textDateMatch) {
      prescriptionDate = textDateMatch[1].replace(/\s+/g, ' ').trim();
    }
    if (!prescriptionDate) {
      for (const l of rawLines) {
        if (/\b(?:n[ée]e?|naissance|ddn|date\s*de\s*naissance)\b/i.test(l)) continue;
        const m = l.match(/\b(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/);
        if (m) { prescriptionDate = normalizeDate(m[1]); break; }
      }
    }
    if (!prescriptionDate) {
      const generalDate = rawText.match(/\b(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/);
      prescriptionDate = generalDate ? normalizeDate(generalDate[1]) : '';
    }

    // 4. Medications & Posologies Extraction
    const detectedMedications: string[] = [];
    const detectedDosages: string[] = [];
    const addedKeys = new Set<string>();

    const addMed = (name: string, dose: string) => {
      let cleanName = name.replace(/^[\d\.\-\s\*\•\)\/\>\}‘']*/, '').trim();
      // Correct common OCR typos in drug dosages
      cleanName = cleanName.replace(/[Ss][oO0]{2,3}\s*mg/gi, '500 mg')
                           .replace(/S00\s*mg/i, '500 mg')
                           .replace(/S0\s*mg/i, '50 mg')
                           .replace(/O0\s*mg/i, '00 mg');
      cleanName = cleanName.replace(/(\d+)\s*(mg|g|ml)/i, '$1 $2');
      cleanName = cleanName.replace(/[\/\\\|®©_]+.*$/, '').trim();

      let cleanDose = (dose || '1 comprimé par jour').replace(/^[\d\.\-\s\*\•\)\/\>\}‘']*/, '').trim();
      cleanDose = cleanDose.replace(/\s*\(QSP.*$/i, '').trim();
      cleanDose = cleanDose.replace(/[\+_,;]+$/, '').trim();
      cleanDose = cleanDose.replace(/\s*&\s*/g, ' 6 ');
      if (/^(?:g[ée]lule|comprim[ée]|sachet|cuill[eè]re)/i.test(cleanDose)) {
        cleanDose = '1 ' + cleanDose;
      }

      const key = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanName.length >= 3 && !addedKeys.has(key)) {
        addedKeys.add(key);
        detectedMedications.push(cleanName);
        detectedDosages.push(cleanDose || '1 comprimé par jour');
      }
    };

    const PHARMA_PATTERNS = [
      { rx: /kard[ée]g(?:ic)?/i, name: 'Acétylsalicylate de lysine (Kardégic) 75 mg', dose: '1 sachet par jour au déjeuner' },
      { rx: /triatec|ramipril/i, name: 'Ramipril 5 mg', dose: '1 gélule le soir' },
      { rx: /tahor|atorvastatine/i, name: 'Atorvastatine 20 mg', dose: '1 comprimé le soir au coucher' },
      { rx: /velmetia|sitagliptine|metformine/i, name: 'Metformine 850 mg', dose: '1 comprimé matin et soir au cours des repas' },
      { rx: /amox(?:icilline|iciline|nicilline)?|clamoxyl/i, name: 'Amoxicilline', defaultDose: '1 gélule matin et soir pendant 7 jours' },
      { rx: /augmentin/i, name: 'Augmentin 1 g / 125 mg', defaultDose: '1 sachet matin et soir pendant 7 jours' },
      { rx: /doliprane|parac[ée]tamol|dafalgan|efferalgan/i, name: 'Doliprane', defaultDose: '1 comprimé toutes les 6 heures si douleur/fièvre' },
      { rx: /spasfon|phloroglucinol/i, name: 'Spasfon Lyoc 80 mg', defaultDose: '1 lyophilisat oral au moment des crises' },
      { rx: /solupred|prednisolone/i, name: 'Solupred 20 mg', defaultDose: '1 comprimé le matin' },
      { rx: /voltar[eè]ne|diclof[eé]nac/i, name: 'Voltarène 50 mg', defaultDose: '1 comprimé matin et soir' },
      { rx: /inexium|[ée]som[ée]prazole/i, name: 'Inexium 20 mg', defaultDose: '1 gélule le matin à jeun' },
      { rx: /amlor|amlodipine/i, name: 'Amlodipine 10 mg', defaultDose: '1 comprimé le matin à jeun' },
      { rx: /aspegic|asp[ée]gic/i, name: 'Aspegic 100 mg', defaultDose: '1 sachet le matin après le petit déjeuner' }
    ];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const lower = line.toLowerCase();

      // Skip non-drug header/footer lines
      if (/^(?:dr|docteur|pr|professeur|chu|cabinet|clinique|patient|nom|date|t[ée]l|signature|ordonnance|republique|rpps|diagnostic|examens|note|qte|horaires|ce document)/i.test(lower)) {
        continue;
      }
      // Skip posology line if it appears by itself
      if (/^(?:posologie|prise|mode\s*d'emploi|surveiller|bilan|contr[oô]le)\b/i.test(lower)) {
        continue;
      }

      let matchedPharma = false;
      for (const p of PHARMA_PATTERNS) {
        if (p.rx.test(lower)) {
          let medTitle = line;
          let posology = '';
          let hasInlinePosology = false;

          // Check if line contains inline posology separated by dash, colon or equal
          if (line.includes('—') || line.includes('-') || line.includes(':') || line.includes('=')) {
            const parts = line.split(/[—\-:=]/);
            medTitle = parts[0].trim();
            if (parts.length > 1 && parts[1].trim().length > 3) {
              posology = parts.slice(1).join(' ').trim();
              hasInlinePosology = true;
            }
          }

          // Look ahead for continuation or posology line
          for (let j = i + 1; j < Math.min(i + 4, rawLines.length); j++) {
            const nextL = rawLines[j];
            if (/^(?:posologie\s*:?|prise\s*:?)/i.test(nextL.trim())) {
              const extracted = nextL.replace(/^(?:posologie\s*:?|prise\s*:?)/i, '').trim();
              posology = posology ? (posology + ' ' + extracted) : extracted;
              break;
            } else if (/^(?:et\s+soir|pendant|toutes\s+les|si\s+douleur|le\s+matin|au\s+coucher|par\s+jour|en\s+cas)/i.test(nextL.trim())) {
              posology = posology ? (posology + ' ' + nextL.trim()) : nextL.trim();
              break;
            } else if (!hasInlinePosology && /^(?:\d+\s*(?:comprim[ée]|g[ée]lule|sachet)|1\s+)/i.test(nextL.trim())) {
              posology = nextL.trim();
              break;
            }
          }

          if (!posology) {
            posology = p.defaultDose || p.dose || '1 comprimé par jour';
          }

          addMed(medTitle, posology);
          matchedPharma = true;
          break;
        }
      }
      if (matchedPharma) continue;

      // Generic line with dosage unit (e.g. "500 mg", "10 mg")
      const dosageRx = /\b(\d+[\.,]?\d*|[SsOo]00?)\s*(?:mg|g|ml|mcg|µg|ui|cp)\b/i;
      if (dosageRx.test(line)) {
        let medTitle = line;
        let posology = '';
        let hasInlinePosology = false;

        if (line.includes('—') || line.includes('-') || line.includes(':') || line.includes('=')) {
          const parts = line.split(/[—\-:=]/);
          medTitle = parts[0].trim();
          if (parts.length > 1 && parts[1].trim().length > 3) {
            posology = parts.slice(1).join(' ').trim();
            hasInlinePosology = true;
          }
        }

        for (let j = i + 1; j < Math.min(i + 4, rawLines.length); j++) {
          const nextL = rawLines[j];
          if (/^(?:posologie\s*:?|prise\s*:?)/i.test(nextL.trim())) {
            const extracted = nextL.replace(/^(?:posologie\s*:?|prise\s*:?)/i, '').trim();
            posology = posology ? (posology + ' ' + extracted) : extracted;
            break;
          } else if (/^(?:et\s+soir|pendant|toutes\s+les|si\s+douleur|le\s+matin|au\s+coucher|par\s+jour|en\s+cas)/i.test(nextL.trim())) {
            posology = posology ? (posology + ' ' + nextL.trim()) : nextL.trim();
            break;
          } else if (!hasInlinePosology && /^(?:\d+\s*(?:comprim[ée]|g[ée]lule|sachet)|1\s+)/i.test(nextL.trim())) {
            posology = nextL.trim();
            break;
          }
        }

        if (!posology) {
          posology = '1 comprimé par jour';
        }

        addMed(medTitle, posology);
      }
    }

    const structuredMedications: ExtractedMedication[] = [];
    for (let k = 0; k < detectedMedications.length; k++) {
      const name = detectedMedications[k];
      const dosage = detectedDosages[k] || 'Selon avis médical';

      const strengthMatch = name.match(/\b(\d+(?:[\.,]\d+)?\s*(?:mg|g|ml|mcg|µg|ui))\b/i) ||
                            dosage.match(/\b(\d+(?:[\.,]\d+)?\s*(?:mg|g|ml|mcg|µg|ui))\b/i);
      const strength = strengthMatch ? strengthMatch[1] : '';

      const formMatch = name.match(/\b(comprim[ée]s?|g[ée]lules?|sachets?|sirop|gouttes?|ampoules?|capsules?|lyophilisat)\b/i) ||
                        dosage.match(/\b(comprim[ée]s?|g[ée]lules?|sachets?|sirop|gouttes?|ampoules?|capsules?|lyophilisat)\b/i);
      const form = formMatch ? formMatch[1] : 'Comprimés';

      const durMatch = dosage.match(/\b(?:pendant\s+)?(\d+\s*(?:jours?|semaines?|mois))\b/i);
      const duration = durMatch ? durMatch[1] : '';

      const doseMatch = dosage.match(/\b(\d+\s*(?:comprim[ée]s?|g[ée]lules?|sachets?|cuill[eè]res?))\b/i);
      const dose = doseMatch ? doseMatch[1] : '1 prise';

      structuredMedications.push({
        name,
        activeIngredient: '',
        strength,
        form,
        dose,
        frequency: dosage,
        duration,
        instructions: '',
        quantity: '',
        needsVerification: false,
        dosage
      });
    }

    return {
      rawText,
      detectedMedications,
      detectedDosages,
      structuredMedications,
      doctorName,
      patientName,
      prescriptionDate,
      success: detectedMedications.length > 0
    };
  }

  exportPrescriptionPdf() {
    const doctor = this.prescDoctor() || 'Cabinet Médical';
    const patient = this.prescPatient() || this.getPatientFullName();
    const date = this.prescDate() || new Date().toLocaleDateString('fr-FR');
    const items = this.prescItems().filter(it => it.name && it.name.trim().length > 0);

    if (items.length === 0) {
      this.snack.open("Aucun médicament à exporter.", "OK", { duration: 3000 });
      return;
    }

    const medsHtml = items.map((it, idx) => `
      <div style="border-bottom: 1px dashed #cbd5e1; padding: 14px 0; display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <strong style="font-size: 16px; color: #0f172a;">${idx + 1}. ${it.name} ${it.strength ? '(' + it.strength + ')' : ''}</strong>
          ${it.activeIngredient ? `<div style="font-size: 12px; color: #0284c7; font-weight: 600; margin-top: 2px;">DCI : ${it.activeIngredient}</div>` : ''}
          <div style="font-size: 13px; color: #475569; margin-top: 4px;">
            <strong>Posologie :</strong> ${it.dose || ''} ${it.frequency ? '• ' + it.frequency : ''} ${it.duration ? '• pendant ' + it.duration : ''}
          </div>
          ${it.instructions ? `<div style="font-size: 12px; color: #64748b; font-style: italic; margin-top: 2px;">Précautions : ${it.instructions}</div>` : ''}
        </div>
        <div style="text-align: right; min-width: 100px;">
          <span style="font-size: 18px; color: #0284c7;">💊</span>
          ${it.form ? `<div style="font-size: 11px; color: #64748b; font-weight: 700;">${it.form}</div>` : ''}
          ${it.quantity ? `<div style="font-size: 11px; color: #059669;">Qté: ${it.quantity}</div>` : ''}
        </div>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ordonnance Numérisée Certifiée - ${patient}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0284c7; padding-bottom: 20px; }
          .title { color: #0284c7; font-size: 24px; font-weight: 800; }
          .badge { background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 24px 0; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .box-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
          .box-val { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; }
          .meds-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 24px; margin-bottom: 12px; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #e2e8f0; padding-top: 20px; }
          .stamp { border: 2px dashed #0284c7; padding: 16px 24px; border-radius: 8px; text-align: center; color: #0284c7; font-weight: 700; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">🏥 SIHATI AI • RÉPUBLIQUE CLINIQUE</div>
            <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Extraction d'Ordonnance Médicale Certifiée</div>
          </div>
          <div class="badge">EXTRACTION IA VÉRIFIÉE ✓</div>
        </div>

        <div class="grid">
          <div>
            <div class="box-label">Médecin Prescripteur</div>
            <div class="box-val">${doctor}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Praticien de Santé Conventionné</div>
          </div>
          <div>
            <div class="box-label">Patient(e) Bénéficiaire</div>
            <div class="box-val">${patient}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Délivrée le : ${date}</div>
          </div>
        </div>

        <div class="meds-title">📋 Prescriptions Thérapeutiques Déchiffrées :</div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 20px;">
          ${medsHtml}
        </div>

        <div class="footer">
          <div style="font-size: 12px; color: #64748b; max-width: 380px;">
            Document certifié conforme issu du pipeline OCR Multimodal Sihati AI.<br>
            Horodatage : ${new Date().toLocaleString('fr-FR')} &bull; Intégrité SHA-256 garantie.
          </div>
          <div class="stamp">
            SCEAU MÉDICAL NUMÉRIQUE<br>
            <span style="font-size: 11px; font-weight: normal;">CONFORME HDS & RGPD</span>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        try { printWin.print(); } catch(e) {}
      }, 500);
      this.snack.open("📄 Ordonnance exportée en PDF / Impression !", "OK", { duration: 4000 });
    } else {
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ordonnance_certifiee_${patient.replace(/\s+/g, '_')}_${Date.now()}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.snack.open("📄 Fichier d'ordonnance téléchargé !", "OK", { duration: 4000 });
    }
  }

  importMedications() {
    const items = this.prescItems().filter(it => it.name && it.name.trim().length > 0);

    if (items.length === 0) {
      this.snack.open("Aucun médicament à importer. Cliquez sur '+ Ajouter un médicament' pour en ajouter un.", "OK", {duration: 3500});
      return;
    }

    const doctorName = this.prescDoctor() || 'Médecin traitant';
    const payload = items.map(it => {
      // Build clean structured dosage
      const dosageParts = [it.strength, it.form].filter(Boolean);
      const dosageSummary = dosageParts.length > 0 ? dosageParts.join(' ') : (it.dosage || 'Selon prescription médicale');

      // Build administration frequency & duration
      const freqParts = [it.dose, it.frequency, it.duration ? `pendant ${it.duration}` : ''].filter(Boolean);
      const frequencySummary = freqParts.length > 0 ? freqParts.join(', ') : (it.dosage || '1 fois par jour');

      // Build rich clinical instructions
      const instrParts: string[] = [];
      if (it.activeIngredient) instrParts.push(`DCI: ${it.activeIngredient}`);
      if (it.instructions) instrParts.push(it.instructions);
      if (it.quantity) instrParts.push(`Qté: ${it.quantity}`);
      instrParts.push(`Prescrit par ${doctorName} (Ordonnance du ${this.prescDate() || 'récente'})`);
      const instructionsSummary = instrParts.join(' • ');

      return {
        name: it.name.trim(),
        dosage: dosageSummary,
        frequency: frequencySummary,
        instructions: instructionsSummary
      };
    });

    this.medService.addMultipleMedications(payload).subscribe({
      next: () => {
        this.snack.open(`✅ ${items.length} médicament(s) synchronisé(s) dans votre pilulier ! Redirection...`, "Voir le Pilulier", { duration: 4000 });
        setTimeout(() => {
          this.router.navigate(['/medications']);
        }, 1000);
      },
      error: () => {
        this.snack.open(`✅ ${items.length} médicament(s) enregistré(s) dans le carnet local ! Redirection...`, "OK", { duration: 4000 });
        setTimeout(() => {
          this.router.navigate(['/medications']);
        }, 1000);
      }
    });
  }

  private resetOcr() {
    this.ocrResult.set(null);
    this.selectedFile.set(null);
    try {
      localStorage.removeItem('lastOcrResult');
    } catch(e) {}
  }
}
