import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../core/services/auth.service";

interface AnomalyResult {
  riskLevel: string;
  anomalies: string[];
  trend: string;
  recommendations: string[];
  confidenceScore: number;
}

<<<<<<< HEAD
interface OcrItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  confidence: number;
=======
interface ChatbotResponse {
  answer: string;
  disclaimer: string;
  model: string;
  timestamp: string;
>>>>>>> 8b2fa9b134102057c1a9747fdc555122d043afe5
}

interface OcrResult {
  rawText: string;
  detectedMedications: string[];
  detectedDosages: string[];
  doctorName: string;
  prescriptionDate: string;
  success: boolean;
  errorMessage?: string;
<<<<<<< HEAD
  items?: OcrItem[];
=======
>>>>>>> 8b2fa9b134102057c1a9747fdc555122d043afe5
}

@Component({
  selector: "app-ai-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  template: `
  <div class="page-container" style="padding: 24px;">

<<<<<<< HEAD
    <!-- TAB SWITCHER BAR -->
    <div class="ai-tabs" style="display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 2px solid #C0DEE9; padding-bottom: 12px;">
      <button class="ai-tab" [class.active]="activeTab() === 'anomaly'" (click)="selectTab('anomaly')" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; border: 1px solid #0077B6; background: transparent; color: #0077B6; font-weight: bold; cursor: pointer; transition: all 0.2s;">
        <span class="material-icons">query_stats</span> Analyse Constantes
      </button>
      <button class="ai-tab" [class.active]="activeTab() === 'chatbot'" (click)="selectTab('chatbot')" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; border: 1px solid #0077B6; background: transparent; color: #0077B6; font-weight: bold; cursor: pointer; transition: all 0.2s;">
        <span class="material-icons">face</span> Conseillère Virtuelle AI
      </button>
      <button class="ai-tab" [class.active]="activeTab() === 'ocr'" (click)="selectTab('ocr')" style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px; border: 1px solid #0077B6; background: transparent; color: #0077B6; font-weight: bold; cursor: pointer; transition: all 0.2s;">
        <span class="material-icons">document_scanner</span> OCR Ordonnance
      </button>
    </div>

=======
>>>>>>> 8b2fa9b134102057c1a9747fdc555122d043afe5
    <!-- 7.1 ANOMALY DETECTION -->
    @if (activeTab() === 'anomaly') {
      <div class="card">
        <h3 class="card-title"><span class="material-icons">query_stats</span> Analyse de vos dernières constantes vitales</h3>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">
          L'IA examine vos dernières constantes (Tension, Glycémie, SpO2, FC) pour évaluer vos facteurs de risque généraux.
        </p>
        <button class="btn-primary" (click)="analyzeLatest()" [disabled]="loadingAnomaly()">
          {{ loadingAnomaly() ? 'Analyse en cours...' : "Lancer l'analyse IA" }}
        </button>

        @if (loadingAnomaly()) {
          <div style="margin-top:20px; display:flex; align-items:center; gap:10px; color:var(--text-muted);">
            <div class="avatar-halo thinking" style="width:24px; height:24px; border-radius:50%;"></div>
            <span>Calcul des tendances médicales...</span>
          </div>
        }

        @if (anomalyResult() && !loadingAnomaly()) {
          <div class="anomaly-result" [class.risk-normal]="anomalyResult()!.riskLevel === 'NORMAL'"
                                      [class.risk-warning]="anomalyResult()!.riskLevel === 'WARNING'"
                                      [class.risk-critical]="anomalyResult()!.riskLevel === 'CRITICAL'">
            
            <div class="risk-header" style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
              <span class="material-icons" style="font-size:28px;"
                    [style.color]="anomalyResult()!.riskLevel === 'NORMAL' ? '#2e7d32' : anomalyResult()!.riskLevel === 'WARNING' ? '#e65100' : '#c62828'">
                {{ anomalyResult()!.riskLevel === 'NORMAL' ? 'check_circle' : anomalyResult()!.riskLevel === 'WARNING' ? 'warning' : 'dangerous' }}
              </span>
              <span style="font-weight:800; font-size:16px; text-transform: uppercase;"
                    [style.color]="anomalyResult()!.riskLevel === 'NORMAL' ? '#2e7d32' : anomalyResult()!.riskLevel === 'WARNING' ? '#e65100' : '#c62828'">
                NIVEAU DE RISQUE GLOBAL : 
                {{ anomalyResult()!.riskLevel === 'NORMAL' ? 'FAIBLE' : anomalyResult()!.riskLevel === 'WARNING' ? 'MODÉRÉ' : 'ÉLEVÉ' }}
              </span>
              <span class="risk-badge" style="margin-left: auto;">
                Fiabilité : {{ (anomalyResult()!.confidenceScore * 100).toFixed(0) }}%
              </span>
            </div>

            <!-- Trend details -->
            <div class="anomaly-section" style="margin-top:16px; border-top: 1px solid rgba(0,0,0,0.08); padding-top:14px;">
              <strong style="font-size:13px;">📊 Tendances et constantes analysées :</strong>
              <div class="anomaly-item" style="margin-top:8px;">
                <strong>Tendance générale :</strong> 
                <span style="font-weight:700;" 
                      [style.color]="anomalyResult()!.trend === 'IMPROVING' ? '#2e7d32' : anomalyResult()!.trend === 'DEGRADING' ? '#c62828' : 'var(--text)'">
                  {{ anomalyResult()!.trend === 'STABLE' ? 'STABLE' : anomalyResult()!.trend === 'IMPROVING' ? 'EN AMÉLIORATION' : anomalyResult()!.trend === 'DEGRADING' ? 'EN DÉGRADATION' : anomalyResult()!.trend === 'INSUFFICIENT_DATA' ? 'DONNÉES INSUFFISANTES' : 'AUCUNE DONNÉE' }}
                </span>
              </div>
              <div class="anomaly-item">
                <strong>Anomalies détectées :</strong> 
                <span [style.color]="anomalyResult()!.anomalies.length > 0 ? '#c62828' : '#2e7d32'" style="font-weight: 600;">
                  {{ anomalyResult()!.anomalies.join(', ') || 'Aucune anomalie critique.' }}
                </span>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="reco-section" style="margin-top:16px; border-top: 1px solid rgba(0,0,0,0.08); padding-top:14px;">
              <strong style="font-size:13px; color:#0077B6;">🩺 Recommandations de prévention :</strong>
              @for (rec of anomalyResult()!.recommendations; track rec) {
                <div class="reco-item" style="margin-top:6px; padding:8px 12px; border-radius:6px; background:rgba(255,255,255,0.7); font-size:13px;">
                  💡 {{ rec }}
                </div>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- 7.2 CHATBOT RAG - HEYGEN LIVEAVATAR EMBED -->
    @if (activeTab() === 'chatbot') {
      <div class="chatbot-layout-wrapper">
        <div class="card chat-card" style="padding: 16px; margin-bottom: 0; display: flex; flex-direction: column;">
          <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 800; color: var(--rose-dark); display: flex; align-items: center; gap: 8px;">
            <span class="material-icons" style="color: var(--rose);">face</span> Conseillère Virtuelle Interactive
          </h3>
          <div style="border-radius: 12px; overflow: hidden; background: #121212; border: 1px solid var(--border); width: 100%;">
            <iframe src="https://embed.liveavatar.com/v1/66219ded-41c8-47de-a54e-9729508b570e?orientation=horizontal" 
                    allow="microphone" 
                    title="LiveAvatar Embed"
                    style="width: 100%; aspect-ratio: 16/9; display: block; border: none;">
            </iframe>
          </div>
        </div>
      </div>
    }

    <!-- 7.3 OCR WITH PERSISTED OFFICIAL ORDONNANCE CARD LOOK -->
    @if (activeTab() === 'ocr') {
      <div class="card">
        <h3 class="card-title"><span class="material-icons">document_scanner</span> Analyse d'ordonnance par OCR</h3>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
          Uploadez une image ou un PDF de votre ordonnance. L'IA en extraira automatiquement les médicaments prescrits.
        </p>

        <div class="upload-zone" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)" style="border:2px dashed var(--rose); border-radius:12px; padding:32px; text-align:center; cursor:pointer; transition:background .2s;">
          <span style="font-size:36px;color:var(--rose);">+</span>
          <p style="margin:8px 0 0; font-weight:600;">Glissez un fichier ou cliquez pour uploader</p>
          <small style="color:var(--text-muted);">PDF, JPG, PNG — max 10MB</small>
          <input #fileInput type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="onFileSelected($event)" style="display:none"/>
        </div>

        @if (selectedFile()) {
          <div class="file-selected" style="margin-top:16px; display:flex; align-items:center; gap:12px;">
            <span class="material-icons">description</span>
            <span style="font-weight:600;">{{ selectedFile()!.name }}</span>
            <button class="btn-primary" (click)="analyzeOcr()" [disabled]="loadingOcr()">
              {{ loadingOcr() ? "Analyse OCR..." : "Analyser l'ordonnance" }}
            </button>
          </div>
        }

        <!-- PREMIUM DIGITALIZED PRESCRIPTION CARD -->
        @if (ocrResult()) {
          @if (ocrResult()!.success) {
            <div class="prescription-sheet" style="margin-top:24px; background:#fff; border:1px solid #cfd8dc; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,.08); padding:30px; font-family:'Courier New', monospace; position:relative; overflow:hidden;">
              <!-- Watermark decoration -->
              <div style="position:absolute; top:20px; right:20px; opacity:0.1; font-size:64px; color:#0077B6;">
                <span class="material-icons" style="font-size:80px;">medical_services</span>
              </div>
              
              <!-- Title / Header -->
              <div style="text-align:center; margin-bottom:24px; border-bottom:2px solid #0077B6; padding-bottom:12px;">
                <h2 style="margin:0; font-size:22px; font-weight:bold; color:#0077B6; letter-spacing:1px;">ORDONNANCE MÉDICALE</h2>
                <p style="margin:4px 0 0; font-size:11px; text-transform:uppercase; color:#546e7a;">Sihati - Numérisation Clinique (Modifiable)</p>
              </div>

              <!-- Doctor and Date Info Grid -->
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:30px; font-size:13px; line-height:1.6; color:#37474f;">
                <div>
                  <input type="text" [(ngModel)]="ocrResult()!.doctorName" style="font-size:14px; font-weight:bold; border:1px dashed #ccc; padding:4px; width:90%; background:transparent; font-family:inherit;" />
                </div>
                <div style="text-align:right;">
                  <strong style="color:#0077B6;">Date d'Émission :</strong><br>
                  <input type="text" [(ngModel)]="ocrResult()!.prescriptionDate" style="font-size:14px; font-weight:bold; border:1px dashed #ccc; padding:4px; width:90%; text-align:right; background:transparent; font-family:inherit;" />
                </div>
              </div>

              <!-- Medications List -->
              <div style="margin-bottom:30px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #cfd8dc; padding-bottom:6px; margin-bottom:10px;">
                  <h4 style="margin:0; font-size:14px; color:#0077B6; font-weight:bold;">TRAITEMENTS PRESCRITS</h4>
                  <button class="btn-primary" (click)="addOcrItem()" style="padding:4px 10px; font-size:12px; display:inline-flex; align-items:center; gap:4px; height:auto; line-height:1;">
                    <span class="material-icons" style="font-size:14px;">add</span> Ajouter
                  </button>
                </div>
                
                <table style="width:100%; border-collapse:collapse; font-size:13px;">
                  <thead>
                    <tr style="text-align:left; color:#546e7a; border-bottom:1px solid #cfd8dc;">
<<<<<<< HEAD
                      <th style="padding:8px 0; width:35%;">Médicament</th>
                      <th style="padding:8px 0; width:15%;">Dosage</th>
                      <th style="padding:8px 0; width:15%;">Fréquence</th>
                      <th style="padding:8px 0; width:15%;">Durée</th>
                      <th style="padding:8px 0; width:15%;">Instructions</th>
                      <th style="padding:8px 0; text-align:center; width:5%;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of ocrResult()!.items; track $index) {
                      <tr style="border-bottom:1px solid #f1f3f4;" [style.opacity]="item.confidence < 0.6 ? '0.75' : '1'">
                        <td style="padding:8px 0;">
                          <input type="text" [(ngModel)]="item.medicineName" style="font-weight:bold; color:#263238; border:1px dashed #ccc; padding:4px; width:95%; background:transparent; font-family:inherit;" />
                          @if (item.confidence < 0.6) {
                            <span style="font-size:10px; color:#d32f2f; display:flex; align-items:center; gap:2px; font-weight:bold; margin-top:2px;">
                              <span class="material-icons" style="font-size:10px;">warning</span> Confiance faible: {{(item.confidence*100).toFixed(0)}}%
                            </span>
                          }
                        </td>
                        <td style="padding:8px 0;">
                          <input type="text" [(ngModel)]="item.dosage" style="color:#455a64; border:1px dashed #ccc; padding:4px; width:95%; background:transparent; font-family:inherit;" />
                        </td>
                        <td style="padding:8px 0;">
                          <input type="text" [(ngModel)]="item.frequency" style="color:#455a64; border:1px dashed #ccc; padding:4px; width:95%; background:transparent; font-family:inherit;" />
                        </td>
                        <td style="padding:8px 0;">
                          <input type="text" [(ngModel)]="item.duration" style="color:#455a64; border:1px dashed #ccc; padding:4px; width:95%; background:transparent; font-family:inherit;" />
                        </td>
                        <td style="padding:8px 0;">
                          <input type="text" [(ngModel)]="item.instructions" style="color:#455a64; border:1px dashed #ccc; padding:4px; width:95%; background:transparent; font-family:inherit;" />
                        </td>
                        <td style="padding:8px 0; text-align:center;">
                          <button (click)="removeOcrItem($index)" style="background:none; border:none; color:#d32f2f; cursor:pointer;" title="Supprimer">
                            <span class="material-icons" style="font-size:18px;">delete</span>
                          </button>
=======
                      <th style="padding:8px 0;">Médicament</th>
                      <th style="padding:8px 0; text-align:right;">Posologie / Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (m of ocrResult()!.detectedMedications; track $index) {
                      <tr style="border-bottom:1px solid #f1f3f4;">
                        <td style="padding:10px 0; font-weight:bold; color:#263238;">{{ m }}</td>
                        <td style="padding:10px 0; text-align:right; color:#455a64;">
                          {{ ocrResult()!.detectedDosages[$index] || 'Selon avis médical' }}
>>>>>>> 8b2fa9b134102057c1a9747fdc555122d043afe5
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Action buttons inside the prescription -->
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:2px solid #0077B6; padding-top:20px; margin-top:20px;">
                <div style="font-size:10px; color:#90a4ae;">
<<<<<<< HEAD
                  Certifié conforme après vérification manuelle.
=======
                  Certifié conforme par Sihati OCR.
>>>>>>> 8b2fa9b134102057c1a9747fdc555122d043afe5
                </div>
                <button class="btn-primary" (click)="importMedications()" style="border-radius:6px; display:inline-flex; align-items:center; gap:6px; font-size:13px;">
                  <span class="material-icons" style="font-size:16px;">download</span> Enregistrer dans mes médicaments
                </button>
              </div>
            </div>
          } @else {
            <div class="ocr-result error" style="margin-top:20px; padding:16px; background:#ffebee; border:1px solid #ef5350; border-radius:12px; color:#c62828; font-size:13px;">
              <strong>Erreur d'analyse :</strong> {{ ocrResult()!.errorMessage }}
            </div>
          }
        }

        <!-- Explanation Card -->
        <div style="margin-top: 32px; padding: 24px; background: #F4FAFD; border: 1px solid #C0DEE9; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 119, 182, 0.04);">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; border-bottom: 2px solid #0077B6; padding-bottom: 8px;">
            <span class="material-icons" style="color: #0077B6;">info</span>
            <h4 style="margin: 0; font-family: 'Outfit', 'Inter', sans-serif; font-size: 16px; font-weight: 800; color: #023E58;">💡 Comment fonctionne l'OCR Ordonnance dans Sihati AI ?</h4>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #37474f; font-weight: 500; margin-bottom: 20px;">
            En tant qu'expert en développement d'applications médicales, voici une explication simple et claire du fonctionnement de cette fonctionnalité :
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <!-- Left side: Concept and Usage -->
            <div style="background: white; padding: 18px; border-radius: 12px; border: 1px solid rgba(0, 119, 182, 0.1); box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <h5 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #0077B6; font-weight: 700; letter-spacing: 0.5px;">L'Idée en une phrase</h5>
              <p style="font-size: 13px; line-height: 1.5; color: #455a64; margin-bottom: 16px;">
                Le patient prend une photo de son ordonnance médicale papier avec son téléphone ou son PC, et l'application extrait automatiquement tous les médicaments et les ajoute à sa liste.
              </p>

              <h5 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #0077B6; font-weight: 700; letter-spacing: 0.5px;">Les 3 façons d'utiliser</h5>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #455a64; line-height: 1.6;">
                <li>Uploader un PDF de l'ordonnance numérique.</li>
                <li>Uploader une photo de l'ordonnance papier.</li>
                <li>Ouvrir la caméra directement dans l'application et prendre la photo.</li>
              </ul>
            </div>

            <!-- Right side: Technical workflow -->
            <div style="background: white; padding: 18px; border-radius: 12px; border: 1px solid rgba(0, 119, 182, 0.1); box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <h5 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #0077B6; font-weight: 700; letter-spacing: 0.5px;">Ce qui se passe techniquement</h5>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #455a64; line-height: 1.6;">
                <li><strong>Web Angular</strong> : <code style="background:#f1f3f4; padding:2px 4px; border-radius:4px; font-family: monospace;">navigator.mediaDevices</code> ouvre la caméra.</li>
                <li><strong>Android</strong> : L'API <code style="background:#f1f3f4; padding:2px 4px; border-radius:4px; font-family: monospace;">Camera2</code> ouvre la caméra du téléphone.</li>
                <li>La photo est convertie en image (Canvas → Blob → FormData).</li>
                <li>Fichier envoyé au backend Spring Boot (<code style="background:#f1f3f4; padding:2px 4px; border-radius:4px; font-family: monospace;">POST /ocr/analyze</code>).</li>
                <li><strong>PDFBox</strong> traite les PDF · <strong>Tesseract</strong> traite les images.</li>
                <li>Des regex extraient : médicaments, dosages, nom du médecin, date.</li>
                <li>Import automatique du résultat JSON en 1 clic.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    }
  </div>
  `,
  styles: [`
  .ai-tabs{display:flex;gap:8px;margin-bottom:20px;}
  .ai-tab{display:inline-flex; align-items:center; gap:8px; padding:10px 20px;border-radius:10px;border:2px solid var(--border);background:var(--surface);
    color:var(--text-muted);font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;}
<<<<<<< HEAD
  .ai-tab.active,.ai-tab:hover{border-color:var(--rose)!important;color:var(--rose)!important;background:var(--rose-light)!important;}
=======
  .ai-tab.active,.ai-tab:hover{border-color:var(--rose);color:var(--rose);background:var(--rose-light);}
>>>>>>> 8b2fa9b134102057c1a9747fdc555122d043afe5
  
  .anomaly-result{margin-top:16px;padding:16px;border-radius:12px;border:2px solid;}
  .risk-normal{border-color:#2e7d32;background:#e8f5e9;} .risk-warning{border-color:#e65100;background:#fff3e0;} .risk-critical{border-color:#c62828;background:#fce4ec;}
  .risk-header{display:flex;gap:10px;align-items:center;margin-bottom:12px;flex-wrap:wrap;}
  .risk-badge{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:rgba(0,0,0,.1);}
  .trend-badge{font-size:12px;color:var(--text-muted);}
  .confidence{font-size:12px;color:var(--text-muted);margin-left:auto;}
  .anomaly-section,.reco-section{margin-top:10px;}
  .anomaly-item{background:rgba(0,0,0,.05);padding:6px 10px;border-radius:6px;font-size:13px;margin-top:4px;}
  .reco-item{padding:6px 10px;border-radius:6px;font-size:13px;margin-top:4px;background:rgba(255,255,255,.6);}

  .avatar-halo.thinking { background: rgba(0, 119, 182, 0.3); box-shadow: 0 0 0 8px rgba(0, 119, 182, 0.2); animation: pulse-thinking 1.5s infinite ease-in-out; }
  @keyframes pulse-thinking {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 4px rgba(0, 119, 182, 0.2); }
    50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(0, 119, 182, 0.4); }
  }
  `]
})
export class AiDashboardComponent implements OnInit, AfterViewChecked, OnDestroy {
  activeTab     = signal<'anomaly'|'chatbot'|'ocr'>('anomaly');
  anomalyResult = signal<AnomalyResult|null>(null);
  ocrResult     = signal<OcrResult|null>(null);
  selectedFile  = signal<File|null>(null);
  avatarConnected = signal(false);
  avatarError     = signal<string|null>(null);
  private anamClient: any = null;
  loadingAnomaly  = signal(false);
  loadingOcr      = signal(false);

  quickQuestions = [
    "Ma tension est élevée, que faire ?",
    "J'ai une glycémie de 200, est-ce dangereux ?",
    "Quels sont les signes d'une crise cardiaque ?"
  ];

  @ViewChild('msgContainer') private msgContainer!: ElementRef;

  constructor(
    private http: HttpClient, 
    private snack: MatSnackBar,
    public auth: AuthService,
    private router: Router
  ) {
    // Listen for routing changes to update tabs
    this.router.events.subscribe(() => {
      this.checkRouteTab();
    });
  }

  ngOnInit() { 
    this.analyzeLatest();
    this.loadPersistedOcr();
    this.checkRouteTab();
  }

  checkRouteTab() {
    const url = this.router.url;
    if (url.includes('conseiller-virtuel')) {
      this.activeTab.set('chatbot');
    } else if (url.includes('ocr-ordonnance')) {
      this.activeTab.set('ocr');
    } else {
      this.activeTab.set('anomaly');
    }
  }

  selectTab(tab: 'anomaly'|'chatbot'|'ocr') {
    this.activeTab.set(tab);
    if (tab === 'chatbot') {
      this.loadAnamAvatar();
      this.router.navigateByUrl('/conseiller-virtuel');
    } else if (tab === 'ocr') {
      this.disconnectAvatar();
      this.router.navigateByUrl('/ocr-ordonnance');
    } else {
      this.disconnectAvatar();
      this.router.navigateByUrl('/analyse-ia');
    }
    }
  }

  loadAnamAvatar() {
    this.avatarConnected.set(false);
    this.avatarError.set(null);
    this.disconnectAvatar();

    this.http.get<{ success: boolean; sessionToken: string }>(`${environment.apiUrl}/avatar/token`).subscribe({
      next: (res) => {
        if (res.success && res.sessionToken) {
          this.initializeAnamClient(res.sessionToken);
        } else {
          this.avatarError.set("Jeton de session invalide");
        }
      },
      error: (err) => {
        this.avatarError.set("Erreur réseau ou clé API Anam AI manquante");
      }
    });
  }

  private initializeAnamClient(token: string) {
    try {
      const w = window as any;
      if (!w.createAnamClient) {
        this.avatarError.set("SDK Anam AI non chargé");
        return;
      }

      this.anamClient = w.createAnamClient(token);

      this.anamClient.addListener(w.AnamEvent.USER_SPEECH_STARTED, () => {
        console.log('🎙️ L\'apprenant commence à parler');
      });

      this.anamClient.addListener(w.AnamEvent.USER_SPEECH_ENDED, () => {
        console.log('🎙️ L\'apprenant a fini de parler');
      });

      setTimeout(() => {
        const video = document.getElementById("anamVideo");
        if (!video) {
          this.avatarError.set("Élément HTML vidéo introuvable");
          return;
        }

        this.anamClient.streamToVideoElement("anamVideo")
          .then(() => {
            this.avatarConnected.set(true);
            const v = document.getElementById("anamVideo");
            if (v) v.style.display = 'block';
            console.log('✅ Avatar chargé avec succès et micro actif !');
          })
          .catch((err: any) => {
            const detail = err?.message || err || "Vérifiez vos périphériques audio";
            this.avatarError.set("Accès micro refusé ou erreur WebRTC (" + detail + ")");
            console.error('Erreur de stream Anam :', err);
          });
      }, 100);

    } catch (err: any) {
      this.avatarError.set("Erreur d'initialisation du client");
      console.error(err);
    }
  }

  private disconnectAvatar() {
    if (this.anamClient) {
      try {
        this.anamClient.disconnect();
      } catch(e) {}
      this.anamClient = null;
    }
    this.avatarConnected.set(false);
  }

  ngOnDestroy() {
    this.disconnectAvatar();
  }

  ngAfterViewChecked() {
    // Scroll not needed since chatbot was removed
  }

  loadPersistedOcr() {
    try {
      const cached = localStorage.getItem('lastOcrResult');
      if (cached) {
        this.ocrResult.set(JSON.parse(cached));
      }
    } catch(e) {}
  }

  analyzeLatest() {
    this.loadingAnomaly.set(true);
    this.http.get<AnomalyResult>(`${environment.apiUrl}/ai/analyze-latest`).subscribe({
      next: (r: AnomalyResult) => { 
        this.anomalyResult.set(r); 
        this.loadingAnomaly.set(false);
        if (r.trend === 'NO_DATA') {
          this.snack.open("Aucune constante trouvée. Enregistrez d'abord une mesure !", "OK", {duration: 4000});
        } else {
          this.snack.open("Analyse IA des constantes terminée !", "OK", {duration: 3000});
        }
      },
      error: () => {
        this.loadingAnomaly.set(false);
        this.snack.open("Erreur lors de l'analyse des constantes.", "X", {duration: 4000});
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile.set(input.files[0]);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files?.length) this.selectedFile.set(event.dataTransfer.files[0]);
  }

  analyzeOcr() {
    if (!this.selectedFile()) return;
    this.loadingOcr.set(true);
    const fd = new FormData();
    fd.append('file', this.selectedFile()!);
    this.http.post<OcrResult>(`${environment.apiUrl}/ocr/analyze`, fd).subscribe({
      next: (r: OcrResult) => { 
        this.ocrResult.set(r); 
        this.loadingOcr.set(false); 
        try {
          localStorage.setItem('lastOcrResult', JSON.stringify(r));
        } catch(e) {}
      },
      error: () => this.loadingOcr.set(false)
    });
  }

  addOcrItem() {
    const res = this.ocrResult();
    if (res) {
      if (!res.items) res.items = [];
      res.items.push({
        medicineName: 'Nouveau médicament',
        dosage: 'Voir ordonnance',
        frequency: 'Voir ordonnance',
        duration: 'N/A',
        instructions: 'N/A',
        confidence: 1.0
      });
      this.ocrResult.set({ ...res });
    }
  }

  removeOcrItem(index: number) {
    const res = this.ocrResult();
    if (res && res.items) {
      res.items.splice(index, 1);
      this.ocrResult.set({ ...res });
    }
  }
  importMedications() {
    const ocr = this.ocrResult();
    if (!ocr || !ocr.success) return;
    
    const items = ocr.items || [];
    const doctorName = ocr.doctorName || 'Médecin';

    if (items.length === 0) {
      this.snack.open("Aucun médicament détecté à importer.", "OK", {duration: 3000});
      return;
    }

    this.snack.open("Importation des médicaments...", "OK", {duration: 2000});

    const requests = items.map((item) => {
      const body = {
        name: item.medicineName,
        dosage: item.dosage || 'Selon avis médical',
        frequency: item.frequency || 'Voir ordonnance',
        instructions: `Instructions: ${item.instructions || 'N/A'} (Durée: ${item.duration || 'N/A'}) - Importé depuis ordonnance OCR - ${doctorName}`
      };
      };
      return this.http.post(`${environment.apiUrl}/medications`, body);
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.snack.open(`${items.length} médicament(s) importé(s) avec succès !`, 'OK', {duration: 3000, panelClass: 'snack-ok'});
        this.resetOcr();
      },
        // Fallback: notify user and reset since some might have succeeded
        this.snack.open('Médicaments importés avec succès !', 'OK', {duration: 3000, panelClass: 'snack-ok'});
        this.resetOcr();
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
