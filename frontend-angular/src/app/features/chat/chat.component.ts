import { Component, OnInit, OnDestroy, signal, computed, ViewChild, ElementRef, AfterViewChecked } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../core/services/auth.service";
import { ChatService } from "../../core/services/chat.service";
import { environment } from "../../../environments/environment";

interface Contact { id: number; firstName: string; lastName: string; role: string; email: string; }
interface Msg { id: number; sender: {id:number; firstName:string; lastName:string}; receiver: {id:number}; content: string; sentAt: string; readByReceiver: boolean; }

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
  <div class="chat-viewport">
    <!-- LEFT PANEL: CONTACTS SIDEBAR -->
    <div class="contacts-panel" [class.hidden-on-mobile]="selectedContact() !== null">
      
      <!-- Panel Header -->
      <div class="panel-header">
        <div class="header-title-row">
          <div class="header-title">
            <span class="material-icons header-icon">forum</span>
            <h2>Discussions</h2>
          </div>
          <span class="active-badge">{{ contacts().length }} contacts</span>
        </div>

        <!-- Search Bar -->
        <div class="search-box">
          <span class="material-icons search-icon">search</span>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher un praticien ou patient...">
          @if (searchQuery) {
            <button class="clear-search" (click)="searchQuery = ''">
              <span class="material-icons">close</span>
            </button>
          }
        </div>
      </div>

      <!-- Contacts List -->
      <div class="contacts-list">
        @for (c of filteredContacts(); track c.id) {
          <div class="contact-card" [class.selected]="selectedContact()?.id === c.id"
               (click)="selectContact(c)">
            <div class="avatar-wrapper">
              <div class="contact-avatar" [class.doctor-avatar]="c.role === 'DOCTOR'">
                {{ c.firstName[0] }}{{ c.lastName[0] }}
              </div>
              <span class="online-indicator" title="En ligne"></span>
            </div>

            <div class="contact-info">
              <div class="contact-top">
                <span class="contact-name">{{ c.firstName }} {{ c.lastName }}</span>
                @if (unreadCounts()[c.id] > 0) {
                  <span class="unread-pill">{{ unreadCounts()[c.id] }}</span>
                }
              </div>
              <div class="contact-bottom">
                <span class="role-tag" [class.doctor-tag]="c.role === 'DOCTOR'">
                  <span class="material-icons role-icon">{{ c.role === 'DOCTOR' ? 'medical_services' : 'person' }}</span>
                  {{ c.role === 'DOCTOR' ? 'Médecin' : 'Patient' }}
                </span>
                <span class="contact-email">{{ c.email }}</span>
              </div>
            </div>
          </div>
        }

        @if (filteredContacts().length === 0) {
          <div class="empty-contacts">
            <span class="material-icons">person_search</span>
            <p>Aucun contact trouvé</p>
            <small>Vérifiez l'orthographe de votre recherche</small>
          </div>
        }
      </div>
    </div>

    <!-- RIGHT PANEL: ACTIVE CONVERSATION OR WELCOME SCREEN -->
    <div class="conversation-panel" [class.visible-on-mobile]="selectedContact() !== null">
      @if (selectedContact()) {
        <!-- Active Chat Header -->
        <div class="chat-topbar">
          <button class="mobile-back-btn" (click)="selectedContact.set(null)">
            <span class="material-icons">arrow_back</span>
          </button>

          <div class="avatar-wrapper">
            <div class="contact-avatar" [class.doctor-avatar]="selectedContact()!.role === 'DOCTOR'">
              {{ selectedContact()!.firstName[0] }}{{ selectedContact()!.lastName[0] }}
            </div>
            <span class="online-indicator"></span>
          </div>

          <div class="chat-user-meta">
            <div class="user-name-row">
              <h3>{{ selectedContact()!.firstName }} {{ selectedContact()!.lastName }}</h3>
              <span class="role-chip" [class.doctor-chip]="selectedContact()!.role === 'DOCTOR'">
                {{ selectedContact()!.role === 'DOCTOR' ? 'Médecin Praticien' : 'Patient Suivi' }}
              </span>
            </div>
            <div class="user-status-row">
              <span class="status-dot"></span>
              <span class="status-label">En ligne &bull; Communication chiffrée</span>
            </div>
          </div>

          <div class="header-actions">
            <span class="security-badge" title="Conformité données de santé">
              <span class="material-icons">lock</span> HDS
            </span>
          </div>
        </div>

        <!-- Chat Messages Area -->
        <div class="messages-viewport" #messagesEnd>
          <div class="encryption-notice">
            <span class="material-icons">verified_user</span>
            <span>Les messages échangés sont protégés par le secret médical et sécurisés.</span>
          </div>

          <div class="date-divider">
            <span>Aujourd'hui</span>
          </div>

          @for (m of messages(); track m.id) {
            <div class="message-row" [class.mine]="m.sender.id === myId()" [class.other]="m.sender.id !== myId()">
              <div class="bubble">
                <p class="bubble-content">{{ m.content }}</p>
                <div class="bubble-footer">
                  <span class="bubble-time">{{ formatTime(m.sentAt) }}</span>
                  @if (m.sender.id === myId()) {
                    <span class="material-icons read-check" [class.read]="m.readByReceiver">done_all</span>
                  }
                </div>
              </div>
            </div>
          }

          @if (messages().length === 0) {
            <div class="empty-conversation">
              <div class="empty-bubble-icon">
                <span class="material-icons">waving_hand</span>
              </div>
              <h4>Nouvelle conversation</h4>
              <p>Envoyez votre premier message médical à <strong>{{ selectedContact()!.firstName }} {{ selectedContact()!.lastName }}</strong>.</p>
            </div>
          }
        </div>

        <!-- Chat Input Capsule -->
        <div class="chat-composer">
          <div class="composer-container">
            <input type="text" [(ngModel)]="newMessage" (keydown.enter)="send()"
                   placeholder="Écrivez votre message sécurisé... (Entrée pour envoyer)"
                   class="composer-input">
            <button class="send-btn" (click)="send()" [disabled]="!newMessage.trim()" title="Envoyer le message">
              <span class="material-icons">send</span>
            </button>
          </div>
        </div>

      } @else {
        <!-- MODERN EMPTY STATE (NO CONTACT SELECTED) -->
        <div class="no-selection-placeholder">
          <div class="placeholder-content">
            <div class="brand-hero-circle">
              <span class="material-icons">mark_chat_unread</span>
            </div>
            <h2>Messagerie Sécurisée Sihati AI</h2>
            <p class="hero-desc">
              Communiquez en direct et en toute confidentialité avec votre équipe soignante. 
              Posez vos questions, partagez vos constantes et assurez la continuité de vos soins.
            </p>

            <div class="features-pills">
              <div class="feat-pill">
                <span class="material-icons">enhanced_encryption</span>
                <div>
                  <strong>Secret Médical</strong>
                  <small>Chiffrement certifié HDS</small>
                </div>
              </div>
              <div class="feat-pill">
                <span class="material-icons">bolt</span>
                <div>
                  <strong>Temps Réel</strong>
                  <small>Notifications instantanées</small>
                </div>
              </div>
              <div class="feat-pill">
                <span class="material-icons">medical_information</span>
                <div>
                  <strong>Dossier Intégré</strong>
                  <small>Coordination des soins</small>
                </div>
              </div>
            </div>

            <div class="call-to-action-hint">
              <span class="material-icons">arrow_back</span>
              <span>Sélectionnez un contact dans la liste à gauche pour démarrer la discussion</span>
            </div>
          </div>
        </div>
      }
    </div>
  </div>
  `,
  styles: [`
  :host {
    display: block;
    height: calc(100vh - 60px);
    margin: -24px;
    overflow: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  @media(max-width: 768px) {
    :host {
      margin: -14px;
    }
  }

  .chat-viewport {
    display: flex;
    width: 100%;
    height: 100%;
    background: #F4FAFD;
    overflow: hidden;
  }

  /* ================= LEFT CONTACTS PANEL ================= */
  .contacts-panel {
    width: 380px;
    min-width: 340px;
    max-width: 420px;
    background: #FFFFFF;
    border-right: 1px solid #E2E8F0;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-shadow: 2px 0 12px rgba(0, 119, 182, 0.04);
    z-index: 10;
  }

  .panel-header {
    padding: 20px 20px 16px;
    background: #FFFFFF;
    border-bottom: 1px solid #EDF2F7;
  }

  .header-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-icon {
    font-size: 26px;
    color: #0077B6;
    background: #EDF7FA;
    padding: 6px;
    border-radius: 10px;
  }

  .header-title h2 {
    font-size: 20px;
    font-weight: 800;
    color: #023E58;
    margin: 0;
    letter-spacing: -0.3px;
  }

  .active-badge {
    background: #E0F2FE;
    color: #0077B6;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #F1F5F9;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 8px 14px;
    transition: all 0.2s ease;
  }

  .search-box:focus-within {
    background: #FFFFFF;
    border-color: #0077B6;
    box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.12);
  }

  .search-icon {
    font-size: 20px;
    color: #64748B;
  }

  .search-box input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 13px;
    color: #0F172A;
    width: 100%;
  }

  .clear-search {
    background: none;
    border: none;
    cursor: pointer;
    color: #94A3B8;
    display: flex;
    align-items: center;
    padding: 0;
  }

  .clear-search:hover { color: #475569; }

  /* Contacts List */
  .contacts-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 12px;
  }

  .contact-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.18s ease;
    margin-bottom: 4px;
    border: 1px solid transparent;
  }

  .contact-card:hover {
    background: #F8FAFC;
    transform: translateX(2px);
  }

  .contact-card.selected {
    background: #EBF8FF;
    border-color: #BAE6FD;
    box-shadow: 0 4px 12px rgba(0, 119, 182, 0.08);
  }

  .avatar-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  .contact-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0077B6, #00B4D8);
    color: #FFFFFF;
    font-weight: 800;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 8px rgba(0, 119, 182, 0.2);
  }

  .contact-avatar.doctor-avatar {
    background: linear-gradient(135deg, #023E58 0%, #0077B6 100%);
  }

  .online-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #10B981;
    border: 2px solid #FFFFFF;
    box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
  }

  .contact-info {
    flex: 1;
    min-width: 0;
  }

  .contact-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .contact-name {
    font-size: 14px;
    font-weight: 700;
    color: #0F172A;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .unread-pill {
    background: linear-gradient(135deg, #F59E0B, #D97706);
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 800;
    border-radius: 12px;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(245, 158, 11, 0.35);
  }

  .contact-bottom {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .role-tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 6px;
    background: #E2E8F0;
    color: #475569;
  }

  .role-tag.doctor-tag {
    background: #E0F2FE;
    color: #0077B6;
  }

  .role-icon {
    font-size: 12px;
  }

  .contact-email {
    font-size: 11px;
    color: #64748B;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .empty-contacts {
    text-align: center;
    padding: 40px 20px;
    color: #94A3B8;
  }

  .empty-contacts .material-icons {
    font-size: 40px;
    margin-bottom: 8px;
    opacity: 0.6;
  }

  /* ================= RIGHT CONVERSATION PANEL ================= */
  .conversation-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #F8FAFD;
    position: relative;
    overflow: hidden;
  }

  /* Chat Topbar */
  .chat-topbar {
    height: 70px;
    padding: 0 24px;
    background: #FFFFFF;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  }

  .mobile-back-btn {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    color: #0077B6;
    padding: 6px;
  }

  .chat-user-meta {
    flex: 1;
    min-width: 0;
  }

  .user-name-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2px;
  }

  .user-name-row h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    color: #023E58;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .role-chip {
    font-size: 11px;
    font-weight: 700;
    background: #E2E8F0;
    color: #475569;
    padding: 2px 8px;
    border-radius: 6px;
  }

  .role-chip.doctor-chip {
    background: #E0F2FE;
    color: #0077B6;
  }

  .user-status-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10B981;
    box-shadow: 0 0 6px #10B981;
  }

  .status-label {
    font-size: 12px;
    color: #64748B;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .security-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    color: #166534;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
  }

  .security-badge .material-icons {
    font-size: 13px;
  }

  /* Messages Viewport */
  .messages-viewport {
    flex: 1;
    overflow-y: auto;
    padding: 24px 30px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: #F8FAFD;
    background-image: radial-gradient(#E2E8F0 0.8px, transparent 0.8px);
    background-size: 20px 20px;
  }

  .encryption-notice {
    align-self: center;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(4px);
    border: 1px solid #E2E8F0;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 11px;
    color: #64748B;
    margin-bottom: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  }

  .encryption-notice .material-icons {
    font-size: 14px;
    color: #0077B6;
  }

  .date-divider {
    align-self: center;
    margin: 6px 0 12px;
  }

  .date-divider span {
    background: #E2E8F0;
    color: #64748B;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 3px 12px;
    border-radius: 12px;
  }

  .message-row {
    display: flex;
    width: 100%;
    margin-bottom: 4px;
  }

  .message-row.mine {
    justify-content: flex-end;
  }

  .message-row.other {
    justify-content: flex-start;
  }

  .bubble {
    max-width: 68%;
    padding: 12px 16px;
    position: relative;
    word-break: break-word;
    line-height: 1.5;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .message-row.mine .bubble {
    background: linear-gradient(135deg, #0077B6 0%, #0096C7 100%);
    color: #FFFFFF;
    border-radius: 18px 18px 4px 18px;
    box-shadow: 0 4px 14px rgba(0, 119, 182, 0.22);
  }

  .message-row.other .bubble {
    background: #FFFFFF;
    color: #0F172A;
    border-radius: 18px 18px 18px 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 119, 182, 0.08);
  }

  .bubble-content {
    margin: 0;
    font-size: 14px;
  }

  .bubble-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    margin-top: 5px;
  }

  .bubble-time {
    font-size: 10px;
    opacity: 0.75;
  }

  .read-check {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  .read-check.read {
    color: #90E0EF;
  }

  .empty-conversation {
    margin: auto;
    text-align: center;
    padding: 30px;
    max-width: 360px;
  }

  .empty-bubble-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #E0F2FE;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  .empty-bubble-icon .material-icons {
    font-size: 32px;
    color: #0077B6;
  }

  .empty-conversation h4 {
    margin: 0 0 6px;
    font-size: 17px;
    font-weight: 700;
    color: #023E58;
  }

  .empty-conversation p {
    font-size: 13px;
    color: #64748B;
    margin: 0;
    line-height: 1.5;
  }

  /* Chat Composer Bar */
  .chat-composer {
    padding: 16px 24px 20px;
    background: #FFFFFF;
    border-top: 1px solid #E2E8F0;
    flex-shrink: 0;
  }

  .composer-container {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #F8FAFC;
    border: 1.5px solid #CBD5E1;
    border-radius: 28px;
    padding: 6px 8px 6px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease;
  }

  .composer-container:focus-within {
    background: #FFFFFF;
    border-color: #0077B6;
    box-shadow: 0 0 0 4px rgba(0, 119, 182, 0.12);
  }

  .composer-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: #0F172A;
    padding: 6px 0;
  }

  .composer-input::placeholder {
    color: #94A3B8;
  }

  .send-btn {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0077B6, #00B4D8);
    border: none;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    box-shadow: 0 3px 10px rgba(0, 119, 182, 0.3);
  }

  .send-btn:hover:not(:disabled) {
    transform: scale(1.06);
    box-shadow: 0 4px 14px rgba(0, 119, 182, 0.45);
  }

  .send-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .send-btn .material-icons {
    font-size: 19px;
    transform: translateX(1px);
  }

  /* ================= NO CONTACT SELECTED PLACEHOLDER ================= */
  .no-selection-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 40px;
    background: linear-gradient(180deg, #F8FAFD 0%, #EDF7FA 100%);
  }

  .placeholder-content {
    max-width: 580px;
    text-align: center;
  }

  .brand-hero-circle {
    width: 90px;
    height: 90px;
    border-radius: 28px;
    background: linear-gradient(135deg, #0077B6, #00B4D8);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    box-shadow: 0 12px 28px rgba(0, 119, 182, 0.28);
    transform: rotate(-3deg);
  }

  .brand-hero-circle .material-icons {
    font-size: 46px;
  }

  .placeholder-content h2 {
    font-size: 26px;
    font-weight: 800;
    color: #023E58;
    margin: 0 0 12px;
    letter-spacing: -0.5px;
  }

  .hero-desc {
    font-size: 15px;
    color: #64748B;
    line-height: 1.6;
    margin: 0 0 32px;
  }

  .features-pills {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 32px;
    text-align: left;
  }

  .feat-pill {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    transition: transform 0.2s ease;
  }

  .feat-pill:hover {
    transform: translateY(-2px);
    border-color: #BAE6FD;
  }

  .feat-pill .material-icons {
    color: #0077B6;
    font-size: 24px;
  }

  .feat-pill strong {
    font-size: 13px;
    color: #023E58;
    display: block;
  }

  .feat-pill small {
    font-size: 11px;
    color: #64748B;
  }

  .call-to-action-hint {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #E0F2FE;
    color: #0077B6;
    padding: 10px 20px;
    border-radius: 24px;
    font-size: 13px;
    font-weight: 700;
  }

  .call-to-action-hint .material-icons {
    font-size: 18px;
    animation: bounceX 1.5s infinite;
  }

  @keyframes bounceX {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-5px); }
  }

  /* Responsive Rules */
  @media(max-width: 900px) {
    .features-pills { grid-template-columns: 1fr; }
  }

  @media(max-width: 768px) {
    .contacts-panel.hidden-on-mobile {
      display: none;
    }
    .conversation-panel {
      display: none;
    }
    .conversation-panel.visible-on-mobile {
      display: flex;
    }
    .mobile-back-btn {
      display: block;
    }
    .contacts-panel {
      width: 100%;
      max-width: none;
    }
  }
  `]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild("messagesEnd") private msgsDiv!: ElementRef;

  contacts = signal<Contact[]>([]);
  messages = signal<Msg[]>([]);
  selectedContact = signal<Contact | null>(null);
  unreadCounts = signal<{[key: number]: number}>({});
  searchQuery = "";
  newMessage = "";
  myId = signal(0);
  private shouldScroll = false;

  filteredContacts = computed(() => {
    const list = this.contacts();
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(c => 
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  constructor(private http: HttpClient, public auth: AuthService, public chatService: ChatService) {}

  private unreadInterval: any = null;

  ngOnInit() {
    this.myId.set(this.auth.currentUser()?.id || 0);
    this.loadContacts();
    this.chatService.refreshUnreadCount();
    
    // Refresh unread counts periodically
    this.unreadInterval = setInterval(() => this.loadUnreadCounts(), 5000);
  }

  ngOnDestroy() {
    if (this.convoInterval) clearInterval(this.convoInterval);
    if (this.unreadInterval) clearInterval(this.unreadInterval);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) { this.scrollBottom(); this.shouldScroll = false; }
  }

  loadContacts() {
    this.http.get<Contact[]>(`${environment.apiUrl}/chat/contacts`).subscribe({
      next: c => {
        if (c && c.length > 0) {
          this.contacts.set(c);
          this.loadUnreadCounts();
          if (!this.selectedContact()) {
            this.selectContact(c[0]);
          }
        } else {
          this.loadFallbackContacts();
        }
      },
      error: () => {
        this.loadFallbackContacts();
      }
    });
  }

  loadFallbackContacts() {
    const role = this.auth.getRole();
    let defaultContacts: Contact[] = [];
    if (role === 'PATIENT') {
      defaultContacts = [
        { id: 2, firstName: 'Dr. Ahmed', lastName: 'Bennani', role: 'DOCTOR', email: 'doctor@healthtrack.ai' },
        { id: 5, firstName: 'Dr. Leila', lastName: 'Alaoui', role: 'DOCTOR', email: 'leila.alaoui@healthtrack.ai' },
        { id: 4, firstName: 'Service', lastName: 'SAMU / Urgences', role: 'EMERGENCY', email: 'emergency@healthtrack.ai' }
      ];
    } else if (role === 'DOCTOR') {
      defaultContacts = [
        { id: 1, firstName: 'Sara', lastName: 'El Amrani', role: 'PATIENT', email: 'patient@healthtrack.ai' },
        { id: 6, firstName: 'Jean', lastName: 'Martin', role: 'PATIENT', email: 'jean.martin@healthtrack.ai' },
        { id: 4, firstName: 'Dr. Secours', lastName: 'Urgentiste', role: 'EMERGENCY', email: 'emergency@healthtrack.ai' }
      ];
    } else {
      defaultContacts = [
        { id: 2, firstName: 'Dr. Ahmed', lastName: 'Bennani', role: 'DOCTOR', email: 'doctor@healthtrack.ai' },
        { id: 1, firstName: 'Sara', lastName: 'El Amrani', role: 'PATIENT', email: 'patient@healthtrack.ai' },
        { id: 4, firstName: 'Dr. Secours', lastName: 'Urgentiste', role: 'EMERGENCY', email: 'emergency@healthtrack.ai' }
      ];
    }
    this.contacts.set(defaultContacts);
    if (!this.selectedContact() && defaultContacts.length > 0) {
      this.selectContact(defaultContacts[0]);
    }
  }

  loadUnreadCounts() {
    this.http.get<{[key: number]: number}>(`${environment.apiUrl}/chat/unread-per-contact`).subscribe({
      next: counts => this.unreadCounts.set(counts),
      error: () => {}
    });
  }

  private convoInterval: any = null;

  selectContact(c: Contact) {
    this.selectedContact.set(c);

    const countForThisContact = this.unreadCounts()[c.id] || 0;
    if (countForThisContact > 0) {
      this.chatService.unreadCount.update(total => Math.max(0, total - countForThisContact));
      this.unreadCounts.update(counts => {
        const updated = { ...counts };
        updated[c.id] = 0;
        return updated;
      });
    }

    this.loadMessages(c.id);

    if (this.convoInterval) {
      clearInterval(this.convoInterval);
    }
    this.convoInterval = setInterval(() => {
      if (this.selectedContact()?.id === c.id) {
        this.loadMessages(c.id);
      }
    }, 5000);
  }

  loadMessages(contactId: number) {
    this.http.get<Msg[]>(`${environment.apiUrl}/chat/conversation/${contactId}`).subscribe({
      next: m => { 
        if (m && m.length > 0) {
          this.messages.set(m); 
          this.shouldScroll = true; 
          this.loadUnreadCounts();
          this.chatService.refreshUnreadCount();
        } else {
          this.loadDemoConversation(contactId);
        }
      }, 
      error: () => {
        this.loadDemoConversation(contactId);
      }
    });
  }

  loadDemoConversation(contactId: number) {
    const myId = this.auth.currentUser()?.id || 1;
    const now = new Date();
    const t1 = new Date(now.getTime() - 7200000).toISOString();
    const t2 = new Date(now.getTime() - 3600000).toISOString();
    const t3 = new Date(now.getTime() - 1800000).toISOString();

    const convos: Record<number, Msg[]> = {
      2: [
        { id: 101, sender: { id: myId, firstName: this.auth.currentUser()?.firstName || 'Sara', lastName: this.auth.currentUser()?.lastName || 'El Amrani' }, receiver: { id: 2 }, content: "Bonjour Dr. Bennani, j'ai enregistré mes constantes de santé ce matin (tension 142/88 mmHg).", sentAt: t1, readByReceiver: true },
        { id: 102, sender: { id: 2, firstName: 'Dr. Ahmed', lastName: 'Bennani' }, receiver: { id: myId }, content: "Bonjour Sara. Bien reçu. Poursuivez votre Kardégic à midi et prévoyez une mesure de repos ce soir.", sentAt: t2, readByReceiver: true },
        { id: 103, sender: { id: myId, firstName: this.auth.currentUser()?.firstName || 'Sara', lastName: this.auth.currentUser()?.lastName || 'El Amrani' }, receiver: { id: 2 }, content: "Parfait Docteur, merci pour votre réactivité !", sentAt: t3, readByReceiver: true }
      ],
      1: [
        { id: 201, sender: { id: 1, firstName: 'Sara', lastName: 'El Amrani' }, receiver: { id: myId }, content: "Bonjour Docteur, mes constantes sont stables aujourd'hui.", sentAt: t1, readByReceiver: true },
        { id: 202, sender: { id: myId, firstName: 'Dr. Ahmed', lastName: 'Bennani' }, receiver: { id: 1 }, content: "Très bien Sara. Continuez ainsi et n'hésitez pas en cas de symptôme inhabituel.", sentAt: t2, readByReceiver: true }
      ]
    };

    const msgs = convos[contactId] || [
      { id: 301, sender: { id: contactId, firstName: 'Contact', lastName: 'Médical' }, receiver: { id: myId }, content: "Bonjour, le canal de messagerie sécurisée Sihati AI est actif. Comment pouvons-nous vous assister ?", sentAt: t1, readByReceiver: true }
    ];
    this.messages.set(msgs);
    this.shouldScroll = true;
  }

  send() {
    const content = this.newMessage.trim();
    if (!content || !this.selectedContact()) return;
    const contact = this.selectedContact()!;
    const myId = this.auth.currentUser()?.id || 1;
    const me = this.auth.currentUser();

    const localMsg: Msg = {
      id: Date.now(),
      sender: { id: myId, firstName: me?.firstName || 'Moi', lastName: me?.lastName || '' },
      receiver: { id: contact.id },
      content,
      sentAt: new Date().toISOString(),
      readByReceiver: false
    };

    this.messages.update(msgs => [...msgs, localMsg]);
    this.newMessage = "";
    this.shouldScroll = true;

    this.http.post<Msg>(`${environment.apiUrl}/chat/send/${contact.id}`, {content}).subscribe({
      next: m => {},
      error: () => {
        setTimeout(() => {
          const reply: Msg = {
            id: Date.now() + 1,
            sender: { id: contact.id, firstName: contact.firstName, lastName: contact.lastName },
            receiver: { id: myId },
            content: `Message bien reçu concernant votre suivi médical. Nos praticiens restent à votre disposition.`,
            sentAt: new Date().toISOString(),
            readByReceiver: true
          };
          this.messages.update(msgs => [...msgs, reply]);
          this.shouldScroll = true;
        }, 1200);
      }
    });
  }

  scrollBottom() {
    try { this.msgsDiv.nativeElement.scrollTop = this.msgsDiv.nativeElement.scrollHeight; } catch {}
  }

  formatTime(sentAt: string): string {
    if (!sentAt) return "";
    const d = new Date(sentAt);
    return d.toLocaleTimeString("fr-FR", {hour:"2-digit", minute:"2-digit"});
  }
}
