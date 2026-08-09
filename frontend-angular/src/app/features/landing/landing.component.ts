import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-wrap">
      <!-- Navigation Header -->
      <header class="landing-header">
        <div class="logo" style="display: flex; align-items: center; gap: 8px;">
          <span class="material-icons logo-icon" style="background: linear-gradient(135deg, #0077B6, #00B4D8); color: white; border-radius: 12px; padding: 6px; font-size: 22px; box-shadow: 0 4px 12px rgba(0, 119, 182, 0.25);">monitor_heart</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -0.8px; background: linear-gradient(135deg, #023E58 30%, #0077B6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Sihati</span>
            <span style="background: linear-gradient(135deg, #00B4D8, #0077B6); color: white; border-radius: 6px; font-size: 9px; font-weight: 900; padding: 2px 6px; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0, 180, 216, 0.3);">Ai</span>
          </div>
        </div>
        <nav class="nav-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#ia">Intelligence Artificielle</a>
          <a href="#stats">Statistiques</a>
        </nav>
        <div class="nav-actions">
          @if (auth.isLoggedIn()) {
            <a routerLink="/dashboard" class="btn-primary">Tableau de bord</a>
          } @else {
            <a routerLink="/auth/login" class="btn-outline">Se connecter</a>
            <a routerLink="/auth/register" class="btn-primary">S'inscrire</a>
          }
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <span class="hero-badge">✨ Plateforme de santé intelligente v2.0</span>
          <h1>Votre santé, assistée par l'Intelligence Artificielle</h1>
          <p>
            Analysez vos constantes vitales, gérez vos prescriptions par scanner OCR intelligent, 
            et chattez en temps réel de manière sécurisée avec vos professionnels de santé.
          </p>
          <div class="hero-actions">
            @if (auth.isLoggedIn()) {
              <a routerLink="/dashboard" class="btn-primary lg">Accéder à mon espace</a>
            } @else {
              <a routerLink="/auth/register" class="btn-primary lg">Démarrer gratuitement</a>
              <a routerLink="/auth/login" class="btn-outline lg">Découvrir la démo</a>
            }
          </div>
        </div>
        
        <!-- Interactive Visual Widget (Wow factor) -->
        <div class="hero-visual">
          <div class="vital-widget-card">
            <div class="widget-header">
              <span class="material-icons pulse">favorite</span>
              <div>
                <strong>Moniteur Cardiaque</strong>
                <small>Suivi en temps réel</small>
              </div>
            </div>
            <div class="widget-body">
              <div class="bpm-value">72 <span>BPM</span></div>
              <div class="pulse-wave">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
              </div>
            </div>
          </div>
          
          <div class="ai-widget-card">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=3fb80337-f737-406c-9571-de918e962b68" alt="AI" class="ai-avatar"/>
            <div class="ai-bubble">
              <strong>Assistant Sihati AI</strong>
              <p>Votre glycémie est stable aujourd'hui. N'oubliez pas vos mesures de ce soir !</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="section-features">
        <div class="section-header">
          <h2>Fonctionnalités avancées</h2>
          <p>Un ensemble d'outils professionnels pour un suivi médical de pointe.</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <span class="material-icons f-icon">favorite_border</span>
            <h3>Suivi des Constantes</h3>
            <p>Enregistrez et visualisez vos courbes de tension, glycémie, SpO2 et température en temps réel.</p>
          </div>
          
          <div class="feature-card">
            <span class="material-icons f-icon">psychology</span>
            <h3>Analyse par IA (RAG)</h3>
            <p>Un assistant médical intelligent répond instantanément à toutes vos questions en se basant sur votre profil de santé.</p>
          </div>
          
          <div class="feature-card">
            <span class="material-icons f-icon">document_scanner</span>
            <h3>OCR d'Ordonnances</h3>
            <p>Scannez et importez automatiquement vos médicaments et posologies depuis vos ordonnances PDF ou photos.</p>
          </div>
          
          <div class="feature-card">
            <span class="material-icons f-icon">chat</span>
            <h3>Messagerie Sécurisée</h3>
            <p>Échangez des conseils et des prescriptions directement avec votre médecin traitant par chat chiffré.</p>
          </div>
        </div>
      </section>

      <!-- AI Interactive Section -->
      <section id="ia" class="section-ai">
        <div class="section-header">
          <span class="badge-ai">🤖 IA Interactive</span>
          <h2>Découvrez l'Assistant Santé Virtuel</h2>
          <p>Testez notre modèle d'intelligence artificielle conçu pour vous guider au quotidien.</p>
        </div>
        
        <div class="ai-demo-container">
          <div class="ai-chat-window">
            <div class="chat-header">
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=3fb80337-f737-406c-9571-de918e962b68" alt="AI" class="chat-avatar"/>
              <div class="chat-info">
                <h4>Sihati AI Bot</h4>
                <span class="status-indicator">● En ligne</span>
              </div>
            </div>
            <div class="chat-messages">
              @for (msg of chatMessages(); track msg.text) {
                <div class="message-bubble" [ngClass]="msg.sender">
                  <div class="message-sender">{{ msg.sender === 'ai' ? 'Sihati AI' : 'Vous' }}</div>
                  <p>{{ msg.text }}</p>
                </div>
              }
            </div>
            <div class="chat-input-area">
              <input type="text" #msgInput placeholder="Posez une question sur votre santé (ex: tension, glycémie)..." (keyup.enter)="sendDemoMessage(msgInput)" />
              <button (click)="sendDemoMessage(msgInput)">
                <span class="material-icons">send</span>
              </button>
            </div>
          </div>
          
          <div class="ai-features-demo">
            <h3>Capacités de notre IA de Santé</h3>
            <ul class="demo-features-list">
              <li>
                <span class="material-icons check-icon">check_circle</span>
                <div>
                  <strong>Analyse RAG Personnalisée</strong>
                  <p>L'IA étudie vos historiques de santé de manière sécurisée pour générer des résumés pertinents.</p>
                </div>
              </li>
              <li>
                <span class="material-icons check-icon">check_circle</span>
                <div>
                  <strong>Scan OCR d'Ordonnance</strong>
                  <p>Extrayez automatiquement les médicaments, les dosages et les instructions depuis une simple photo.</p>
                </div>
              </li>
              <li>
                <span class="material-icons check-icon">check_circle</span>
                <div>
                  <strong>Suivi Automatique</strong>
                  <p>Recevez des alertes intelligentes en cas d'anomalie détectée dans vos rapports médicaux.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section id="stats" class="section-stats-dashboard">
        <div class="section-header">
          <span class="badge-stats">📊 Statistiques & Analyses</span>
          <h2>Visualisez vos données de santé</h2>
          <p>Suivez vos constantes et auditez la sécurité de vos données en temps réel.</p>
        </div>

        <div class="stats-dashboard-container">
          <!-- Left side: Interactive Chart Widget -->
          <div class="dashboard-card main-chart-card">
            <div class="card-header">
              <div class="title-area">
                <h4>Évolution Cardiaque & Tension</h4>
                <small>Données hebdomadaires simulées</small>
              </div>
              <div class="tabs-area">
                <button [class.active]="activeStatTab() === 'bpm'" (click)="setStatTab('bpm')">BPM</button>
                <button [class.active]="activeStatTab() === 'tension'" (click)="setStatTab('tension')">Tension (mmHg)</button>
              </div>
            </div>
            
            <div class="card-body">
              <div class="chart-wrapper">
                <!-- SVG Chart for BPM -->
                @if (activeStatTab() === 'bpm') {
                  <svg viewBox="0 0 500 200" class="svg-chart">
                    <!-- Grid Lines -->
                    <line x1="50" y1="30" x2="480" y2="30" stroke="#E2EDF3" stroke-width="1" />
                    <line x1="50" y1="80" x2="480" y2="80" stroke="#E2EDF3" stroke-width="1" />
                    <line x1="50" y1="130" x2="480" y2="130" stroke="#E2EDF3" stroke-width="1" />
                    <line x1="50" y1="180" x2="480" y2="180" stroke="#E2EDF3" stroke-width="2" />
                    
                    <!-- Labels -->
                    <text x="15" y="35" class="chart-text">100</text>
                    <text x="15" y="85" class="chart-text">80</text>
                    <text x="15" y="135" class="chart-text">60</text>
                    <text x="15" y="185" class="chart-text">40</text>
                    
                    <!-- Line Path -->
                    <path d="M 50 130 L 120 100 L 190 120 L 260 70 L 330 90 L 400 80 L 480 60" 
                          fill="none" stroke="url(#bpmGradient)" stroke-width="4" stroke-linecap="round" class="chart-line" />
                    
                    <!-- Circles on Data Points -->
                    <circle cx="50" cy="130" r="6" fill="#00B4D8" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="120" cy="100" r="6" fill="#00B4D8" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="190" cy="120" r="6" fill="#00B4D8" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="260" cy="70" r="6" fill="#00B4D8" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="330" cy="90" r="6" fill="#00B4D8" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="400" cy="80" r="6" fill="#00B4D8" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="480" cy="60" r="6" fill="#00B4D8" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />

                    <defs>
                      <linearGradient id="bpmGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#0077B6" />
                        <stop offset="100%" stop-color="#48CAE4" />
                      </linearGradient>
                    </defs>
                  </svg>
                }
                
                <!-- SVG Chart for Tension -->
                @if (activeStatTab() === 'tension') {
                  <svg viewBox="0 0 500 200" class="svg-chart">
                    <!-- Grid Lines -->
                    <line x1="50" y1="30" x2="480" y2="30" stroke="#E2EDF3" stroke-width="1" />
                    <line x1="50" y1="80" x2="480" y2="80" stroke="#E2EDF3" stroke-width="1" />
                    <line x1="50" y1="130" x2="480" y2="130" stroke="#E2EDF3" stroke-width="1" />
                    <line x1="50" y1="180" x2="480" y2="180" stroke="#E2EDF3" stroke-width="2" />
                    
                    <!-- Labels -->
                    <text x="15" y="35" class="chart-text">140</text>
                    <text x="15" y="85" class="chart-text">120</text>
                    <text x="15" y="135" class="chart-text">100</text>
                    <text x="15" y="185" class="chart-text">80</text>
                    
                    <!-- Line Path -->
                    <path d="M 50 80 L 120 75 L 190 90 L 260 82 L 330 78 L 400 85 L 480 76" 
                          fill="none" stroke="url(#tensionGradient)" stroke-width="4" stroke-linecap="round" class="chart-line" />
                    
                    <circle cx="50" cy="80" r="6" fill="#0077B6" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="120" cy="75" r="6" fill="#0077B6" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="190" cy="90" r="6" fill="#0077B6" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="260" cy="82" r="6" fill="#0077B6" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="330" cy="78" r="6" fill="#0077B6" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="400" cy="85" r="6" fill="#0077B6" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />
                    <circle cx="480" cy="76" r="6" fill="#0077B6" stroke="#FFFFFF" stroke-width="2" class="chart-dot" />

                    <defs>
                      <linearGradient id="tensionGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#005F8E" />
                        <stop offset="100%" stop-color="#0077B6" />
                      </linearGradient>
                    </defs>
                  </svg>
                }
              </div>
              <div class="chart-x-labels">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mer</span>
                <span>Jeu</span>
                <span>Ven</span>
                <span>Sam</span>
                <span>Dim</span>
              </div>
            </div>
          </div>
          
          <!-- Right side: Realtime Stats Widget Grid -->
          <div class="dashboard-side-grid">
            <div class="dashboard-card mini-card">
              <span class="material-icons mini-icon pink">local_fire_department</span>
              <div>
                <strong>3 420 Kcal</strong>
                <small>Brûlées cette semaine</small>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar pink" style="width: 82%"></div>
              </div>
            </div>
            
            <div class="dashboard-card mini-card">
              <span class="material-icons mini-icon blue">directions_run</span>
              <div>
                <strong>42.5 Km</strong>
                <small>Distance parcourue</small>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar blue" style="width: 65%"></div>
              </div>
            </div>

            <div class="dashboard-card mini-card security">
              <span class="material-icons mini-icon green">shield</span>
              <div>
                <strong>Sécurité & HDS</strong>
                <small>Audit de cryptage en cours</small>
              </div>
              <span class="shield-badge">Protégé</span>
            </div>
          </div>
        </div>
        
        <!-- Classic Stats Counters (re-designed to look gorgeous) -->
        <div class="stats-counter-banner">
          <div class="stat-counter-item">
            <strong>99.8%</strong>
            <span>Précision d'OCR</span>
          </div>
          <div class="stat-counter-item">
            <strong>24h/7</strong>
            <span>Disponibilité IA</span>
          </div>
          <div class="stat-counter-item">
            <strong>100%</strong>
            <span>Cryptage Bout-en-Bout</span>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <p>&copy; 2026 Sihati AI. Tous droits réservés. Données médicales chiffrées HDS.</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing-wrap {
      background: #F8FBFF;
      color: #023E58;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
    }
    
    /* Header */
    .landing-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 8%;
      background: #FFFFFF;
      box-shadow: 0 2px 12px rgba(26, 138, 212, 0.08);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid #C0DEE9;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 800;
      color: #0077B6;
    }
    .logo-icon {
      font-size: 28px;
      color: #00B4D8;
    }
    .nav-links {
      display: flex;
      gap: 30px;
    }
    .nav-links a {
      text-decoration: none;
      color: #4A7C94;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover {
      color: #0077B6;
    }
    .nav-actions {
      display: flex;
      gap: 12px;
    }

    /* Buttons */
    .btn-primary {
      background: linear-gradient(135deg, #0077B6, #1574B3);
      color: white;
      text-decoration: none;
      padding: 10px 22px;
      border-radius: 10px;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
      border: none;
      cursor: pointer;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(26, 138, 212, 0.35);
    }
    .btn-primary.lg {
      padding: 14px 30px;
      font-size: 16px;
    }
    .btn-outline {
      background: transparent;
      color: #0077B6;
      border: 2px solid #0077B6;
      text-decoration: none;
      padding: 8px 20px;
      border-radius: 10px;
      font-weight: 600;
      transition: all 0.2s;
      cursor: pointer;
    }
    .btn-outline:hover {
      background: #CAF0F8;
    }
    .btn-outline.lg {
      padding: 12px 28px;
      font-size: 16px;
    }

    /* Hero */
    .hero-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 80px 8%;
      gap: 50px;
      background: linear-gradient(135deg, #CAF0F8 0%, #F4FAFD 50%, #EDF7FA 100%);
    }
    .hero-content {
      flex: 1;
      max-width: 600px;
    }
    .hero-badge {
      background: rgba(26, 138, 212, 0.12);
      color: #0077B6;
      font-weight: 700;
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 20px;
      border: 1px solid rgba(26, 138, 212, 0.3);
    }
    .hero-content h1 {
      font-size: 48px;
      font-weight: 900;
      line-height: 1.2;
      color: #005F8E;
      margin-bottom: 20px;
    }
    .hero-content p {
      font-size: 16px;
      color: #4A7C94;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .hero-actions {
      display: flex;
      gap: 15px;
    }
    
    /* Hero Visual Widgets */
    .hero-visual {
      flex: 1;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 25px;
    }
    .vital-widget-card {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(26, 138, 212, 0.12);
      border: 1px solid #C0DEE9;
      width: 340px;
      transform: rotate(-2deg);
      transition: transform 0.3s;
    }
    .vital-widget-card:hover {
      transform: rotate(0deg) scale(1.02);
    }
    .widget-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
    }
    .pulse {
      color: #48CAE4;
      animation: pulse 1.5s infinite;
      font-size: 32px;
    }
    .widget-header strong {
      display: block;
      font-size: 14px;
      color: #0077B6;
    }
    .widget-header small {
      color: #4A7C94;
      font-size: 11px;
    }
    .bpm-value {
      font-size: 42px;
      font-weight: 900;
      color: #0077B6;
    }
    .bpm-value span {
      font-size: 14px;
      color: #4A7C94;
    }
    .pulse-wave {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 30px;
      margin-top: 10px;
    }
    .pulse-wave .bar {
      width: 100%;
      background: linear-gradient(to top, #0077B6, #00B4D8);
      border-radius: 2px;
      animation: bounce 1.2s infinite ease-in-out;
    }
    .pulse-wave .bar:nth-child(2) { height: 60%; animation-delay: 0.1s; }
    .pulse-wave .bar:nth-child(3) { height: 30%; animation-delay: 0.2s; }
    .pulse-wave .bar:nth-child(4) { height: 90%; animation-delay: 0.3s; }
    .pulse-wave .bar:nth-child(5) { height: 50%; animation-delay: 0.4s; }
    .pulse-wave .bar:nth-child(6) { height: 75%; animation-delay: 0.5s; }
    .pulse-wave .bar:nth-child(7) { height: 40%; animation-delay: 0.6s; }
    .pulse-wave .bar:nth-child(8) { height: 85%; animation-delay: 0.7s; }

    .ai-widget-card {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(26, 138, 212, 0.12);
      border: 1px solid #C0DEE9;
      width: 340px;
      display: flex;
      gap: 14px;
      transform: rotate(2deg);
      transition: transform 0.3s;
    }
    .ai-widget-card:hover {
      transform: rotate(0deg) scale(1.02);
    }
    .ai-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0077B6, #00B4D8);
      padding: 2px;
      border: 2px solid #C0DEE9;
    }
    .ai-bubble strong {
      font-size: 13px;
      color: #0077B6;
      display: block;
      margin-bottom: 4px;
    }
    .ai-bubble p {
      font-size: 12px;
      color: #4A7C94;
      margin: 0;
      line-height: 1.4;
    }

    /* AI Section */
    .section-ai {
      padding: 80px 8%;
      background: linear-gradient(180deg, #FFFFFF 0%, #F0F6FA 100%);
      border-top: 1px solid #C0DEE9;
    }
    .badge-ai {
      background: linear-gradient(135deg, #0077B6, #00B4D8);
      color: white;
      font-weight: 800;
      font-size: 11px;
      padding: 6px 14px;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 20px;
      box-shadow: 0 4px 10px rgba(0, 180, 216, 0.2);
    }
    .ai-demo-container {
      display: flex;
      gap: 50px;
      margin-top: 40px;
      align-items: center;
    }
    .ai-chat-window {
      flex: 1.2;
      background: #FFFFFF;
      border-radius: 20px;
      border: 1px solid #C0DEE9;
      box-shadow: 0 15px 40px rgba(26, 138, 212, 0.12);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 450px;
      min-width: 320px;
    }
    .chat-header {
      background: linear-gradient(135deg, #023E58 0%, #0077B6 100%);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }
    .chat-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      padding: 2px;
    }
    .chat-info h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }
    .status-indicator {
      font-size: 11px;
      color: #52B788;
      font-weight: 600;
    }
    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
      background: #F8FBFF;
    }
    .message-bubble {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.5;
      animation: popIn 0.3s ease-out;
    }
    .message-bubble.ai {
      background: #FFFFFF;
      color: #023E58;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      border: 1px solid #E2EDF3;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }
    .message-bubble.user {
      background: linear-gradient(135deg, #0077B6, #00B4D8);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 119, 182, 0.15);
    }
    .message-sender {
      font-size: 10px;
      font-weight: 700;
      opacity: 0.8;
      margin-bottom: 4px;
    }
    .message-bubble p {
      margin: 0;
    }
    .chat-input-area {
      padding: 12px 20px;
      background: #FFFFFF;
      border-top: 1px solid #E2EDF3;
      display: flex;
      gap: 10px;
    }
    .chat-input-area input {
      flex: 1;
      border: 1px solid #C0DEE9;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      color: #023E58;
      outline: none;
      transition: border-color 0.2s;
    }
    .chat-input-area input:focus {
      border-color: #0077B6;
    }
    .chat-input-area button {
      background: #0077B6;
      color: white;
      border: none;
      border-radius: 10px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    .chat-input-area button:hover {
      background: #005F8E;
      transform: scale(1.05);
    }
    .chat-input-area button:active {
      transform: scale(0.95);
    }
    .ai-features-demo {
      flex: 0.8;
    }
    .ai-features-demo h3 {
      font-size: 24px;
      color: #005F8E;
      font-weight: 800;
      margin-bottom: 24px;
    }
    .demo-features-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .demo-features-list li {
      display: flex;
      gap: 15px;
      align-items: flex-start;
    }
    .check-icon {
      color: #00B4D8;
      font-size: 24px;
    }
    .demo-features-list strong {
      font-size: 16px;
      color: #023E58;
      display: block;
      margin-bottom: 4px;
    }
    .demo-features-list p {
      margin: 0;
      font-size: 13px;
      color: #4A7C94;
      line-height: 1.5;
    }
    @keyframes popIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    /* Features Section */
    .section-features {
      padding: 80px 8%;
      background: #FFFFFF;
    }
    .section-header {
      text-align: center;
      margin-bottom: 50px;
    }
    .section-header h2 {
      font-size: 36px;
      color: #005F8E;
      font-weight: 900;
    }
    .section-header p {
      color: #4A7C94;
      margin-top: 8px;
      font-size: 16px;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    .feature-card {
      background: linear-gradient(135deg, rgba(26, 138, 212, 0.04), rgba(0, 119, 182, 0.04));
      border-radius: 16px;
      padding: 30px 24px;
      border: 2px solid #C0DEE9;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .feature-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(26, 138, 212, 0.15);
      border-color: #0077B6;
    }
    .f-icon {
      font-size: 40px;
      color: #0077B6;
      margin-bottom: 18px;
    }
    .feature-card h3 {
      font-size: 18px;
      font-weight: 800;
      color: #023E58;
      margin-bottom: 10px;
    }
    .feature-card p {
      font-size: 13px;
      color: #4A7C94;
      line-height: 1.6;
    }

    /* Stats Dashboard Section */
    .section-stats-dashboard {
      padding: 80px 8%;
      background: #FFFFFF;
      border-top: 1px solid #C0DEE9;
    }
    .badge-stats {
      background: rgba(0, 119, 182, 0.1);
      color: #0077B6;
      font-weight: 800;
      font-size: 11px;
      padding: 6px 14px;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 20px;
      border: 1px solid rgba(0, 119, 182, 0.2);
    }
    .stats-dashboard-container {
      display: flex;
      gap: 30px;
      margin-top: 40px;
    }
    .dashboard-card {
      background: #FFFFFF;
      border-radius: 20px;
      border: 1px solid #C0DEE9;
      box-shadow: 0 10px 30px rgba(26, 138, 212, 0.08);
      padding: 24px;
    }
    .main-chart-card {
      flex: 2;
      display: flex;
      flex-direction: column;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #E2EDF3;
      padding-bottom: 15px;
    }
    .title-area h4 {
      margin: 0;
      font-size: 18px;
      color: #023E58;
      font-weight: 800;
    }
    .title-area small {
      color: #4A7C94;
      font-size: 12px;
    }
    .tabs-area {
      display: flex;
      gap: 8px;
      background: #F0F6FA;
      padding: 4px;
      border-radius: 10px;
    }
    .tabs-area button {
      border: none;
      background: transparent;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #4A7C94;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tabs-area button.active {
      background: #FFFFFF;
      color: #0077B6;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
    .chart-wrapper {
      position: relative;
      height: 200px;
      width: 100%;
    }
    .svg-chart {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .chart-text {
      font-size: 10px;
      fill: #4A7C94;
      font-weight: 600;
    }
    .chart-line {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: drawLine 2s forwards ease-in-out;
    }
    .chart-dot {
      opacity: 0;
      animation: fadeInDot 0.5s 1.5s forwards ease-out;
    }
    .chart-x-labels {
      display: flex;
      justify-content: space-between;
      padding: 10px 10px 0 50px;
      font-size: 11px;
      font-weight: 700;
      color: #4A7C94;
    }
    .dashboard-side-grid {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 280px;
    }
    .mini-card {
      display: flex;
      align-items: center;
      gap: 15px;
      position: relative;
      padding: 20px;
    }
    .mini-icon {
      padding: 10px;
      border-radius: 12px;
      font-size: 24px;
    }
    .mini-icon.pink {
      background: rgba(230, 57, 70, 0.1);
      color: #E63946;
    }
    .mini-icon.blue {
      background: rgba(0, 119, 182, 0.1);
      color: #0077B6;
    }
    .mini-icon.green {
      background: rgba(82, 183, 136, 0.1);
      color: #52B788;
    }
    .mini-card strong {
      font-size: 18px;
      color: #023E58;
      display: block;
    }
    .mini-card small {
      color: #4A7C94;
      font-size: 12px;
    }
    .progress-bar-container {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: #E2EDF3;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
    }
    .progress-bar.pink {
      background: #E63946;
    }
    .progress-bar.blue {
      background: #0077B6;
    }
    .shield-badge {
      margin-left: auto;
      background: #D8F3DC;
      color: #2D6A4F;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
    }
    .stats-counter-banner {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 50px;
      background: linear-gradient(135deg, #023E58 0%, #0077B6 100%);
      border-radius: 20px;
      padding: 30px;
      color: white;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,119,182,0.2);
    }
    .stat-counter-item strong {
      font-size: 40px;
      font-weight: 900;
      display: block;
      margin-bottom: 8px;
      color: #FFFFFF;
      text-shadow: 0 2px 10px rgba(0, 119, 182, 0.3);
      line-height: 1.2;
      padding-bottom: 4px;
    }
    .stat-counter-item span {
      font-size: 15px;
      color: #CAF0F8;
      font-weight: 600;
      display: block;
      opacity: 0.95;
    }
    @keyframes drawLine {
      to { stroke-dashoffset: 0; }
    }
    @keyframes fadeInDot {
      to { opacity: 1; }
    }

    /* Footer */
    .landing-footer {
      background: #023E58;
      color: rgba(255,255,255,0.85);
      text-align: center;
      padding: 30px;
      font-size: 13px;
      border-top: 2px solid #C0DEE9;
    }

    /* Animations */
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @keyframes bounce {
      0%, 100% { transform: scaleY(0.3); }
      50% { transform: scaleY(1); }
    }

    @media(max-width: 992px) {
      .hero-section {
        flex-direction: column;
        text-align: center;
        padding: 50px 24px;
      }
      .hero-actions {
        justify-content: center;
      }
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media(max-width: 600px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
      .stats-grid {
        flex-direction: column;
        gap: 30px;
      }
      .hero-content h1 {
        font-size: 36px;
      }
    }
  `]
})
export class LandingComponent {
  constructor(public auth: AuthService) {}

  chatMessages = signal([
    { sender: 'ai', text: 'Bonjour ! Je suis votre assistant virtuel Sihati AI. Posez-moi une question sur votre suivi médical ou vos constantes vitales.' }
  ]);

  activeStatTab = signal('bpm');

  setStatTab(tab: string) {
    this.activeStatTab.set(tab);
  }

  sendDemoMessage(input: HTMLInputElement) {
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    this.chatMessages.update(prev => [...prev, { sender: 'user', text }]);
    input.value = '';

    // Simulate AI response after delay
    setTimeout(() => {
      let reply = "Je comprends votre question. Pour analyser précisément votre état, n'hésitez pas à vous connecter et à enregistrer vos constantes (tension, glycémie).";
      const query = text.toLowerCase();
      if (query.includes('tension') || query.includes('cardiaque')) {
        reply = "Une tension normale se situe généralement autour de 120/80 mmHg. Votre moniteur montre 72 BPM à l'accueil, ce qui est excellent au repos.";
      } else if (query.includes('glycémie') || query.includes('diabète')) {
        reply = "Pour un adulte à jeun, la glycémie normale est comprise entre 0.70 et 1.10 g/L. Sihati AI peut générer des alertes en cas de dépassement.";
      } else if (query.includes('ordonnance') || query.includes('médicament')) {
        reply = "Grâce à notre module OCR intelligent, vous pouvez scanner une ordonnance pour ajouter automatiquement vos rappels de médicaments.";
      } else if (query.includes('bonjour') || query.includes('salut')) {
        reply = "Bonjour ! Comment puis-je vous aider dans votre suivi santé aujourd'hui ?";
      }
      
      this.chatMessages.update(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  }
}
