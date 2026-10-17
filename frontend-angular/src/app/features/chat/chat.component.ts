import { Component, OnInit, OnDestroy, signal, computed, ViewChild, ElementRef, AfterViewChecked } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../core/services/auth.service";
import { ChatService } from "../../core/services/chat.service";
import { UserService } from "../../core/services/user.service";
import { environment } from "../../../environments/environment";

interface Contact { id: number; firstName: string; lastName: string; role: string; email: string; }
interface Msg { id: number; sender: {id:number; firstName:string; lastName:string}; receiver: {id:number}; content: string; sentAt: string; readByReceiver: boolean; photoUrl?: string; }

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
                @if (m.photoUrl) {
                  <div class="bubble-photo-wrapper">
                    <img [src]="m.photoUrl" alt="Document médical" class="chat-photo-img" (click)="activePhotoModal.set(m.photoUrl)">
                  </div>
                }
                @if (m.content) {
                  <p class="bubble-content">{{ m.content }}</p>
                }
                <div class="bubble-footer">
                  <span class="bubble-time">{{ formatTime(m.sentAt) }}</span>
                  @if (m.sender.id === myId()) {
                    <span class="read-status" [class.is-read]="m.readByReceiver" [title]="m.readByReceiver ? 'Message vu par votre destinataire' : 'Message distribué'">
                      <span class="material-icons read-icon">{{ m.readByReceiver ? 'done_all' : 'check' }}</span>
                      <span class="read-label">{{ m.readByReceiver ? 'Vu' : 'Envoyé' }}</span>
                    </span>
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
              <p>Envoyez votre premier message médical ou une photo à <strong>{{ selectedContact()!.firstName }} {{ selectedContact()!.lastName }}</strong>.</p>
            </div>
          }
        </div>

        <!-- Chat Input Capsule with Photo & Emoji Support -->
        <div class="chat-composer">
          <!-- Photo Preview Bar (Shown when an image is selected) -->
          @if (selectedPhoto()) {
            <div class="photo-preview-bar">
              <div class="preview-thumb-box">
                <img [src]="selectedPhoto()" alt="Aperçu photo" class="preview-thumb">
                <span class="preview-tag">Photo médicale prête à être envoyée</span>
              </div>
              <button type="button" class="btn-clear-photo" (click)="clearPhoto()" title="Supprimer la photo">
                <span class="material-icons">close</span>
              </button>
            </div>
          }

          <!-- Emoji Picker Popover -->
          @if (showEmojiPicker()) {
            <div class="emoji-picker-container">
              <div class="emoji-header">
                <span>🩺 Santé & Médecine</span>
                <button type="button" class="close-emoji" (click)="showEmojiPicker.set(false)"><span class="material-icons">close</span></button>
              </div>
              <div class="emoji-row">
                @for (e of medicalEmojis; track e) {
                  <button type="button" class="emoji-btn" (click)="addEmoji(e)">{{e}}</button>
                }
              </div>
              <div class="emoji-header">
                <span>💬 Échanges Quotidiens</span>
              </div>
              <div class="emoji-row">
                @for (e of convoEmojis; track e) {
                  <button type="button" class="emoji-btn" (click)="addEmoji(e)">{{e}}</button>
                }
              </div>
            </div>
          }

          <div class="composer-container">
            <!-- Hidden photo input -->
            <input type="file" #photoInput accept="image/*" (change)="onPhotoSelected($event)" style="display:none">

            <button type="button" class="tool-btn" (click)="photoInput.click()" title="Joindre une photo, ordonnance ou document">
              <span class="material-icons">add_a_photo</span>
            </button>

            <button type="button" class="tool-btn" (click)="showEmojiPicker.set(!showEmojiPicker())" title="Insérer un émoji médical">
              <span class="material-icons">mood</span>
            </button>

            <input type="text" [(ngModel)]="newMessage" (keydown.enter)="send()"
                   placeholder="Écrivez votre message sécurisé... (Entrée pour envoyer)"
                   class="composer-input">

            <button class="send-btn" (click)="send()" [disabled]="!newMessage.trim() && !selectedPhoto()" title="Envoyer le message">
              <span class="material-icons">send</span>
            </button>
          </div>
        </div>

        <!-- Fullscreen Photo Modal -->
        @if (activePhotoModal()) {
          <div class="photo-modal-backdrop" (click)="activePhotoModal.set(null)">
            <div class="photo-modal-dialog" (click)="$event.stopPropagation()">
              <button class="modal-close-btn" (click)="activePhotoModal.set(null)" title="Fermer">
                <span class="material-icons">close</span>
              </button>
              <img [src]="activePhotoModal()" alt="Photo médicale agrandie" class="modal-full-img">
            </div>
          </div>
        }

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
    background: linear-gradient(135deg, #EF4444, #DC2626);
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 800;
    border-radius: 12px;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.45);
    animation: pulseBadge 2s infinite;
  }

  @keyframes pulseBadge {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
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

  .read-status {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    margin-left: 4px;
    user-select: none;
  }

  .read-status.is-read {
    color: #90E0EF;
    font-weight: 700;
  }

  .read-icon {
    font-size: 13px;
  }

  .read-label {
    font-size: 10px;
    letter-spacing: 0.2px;
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
      min-width: 0;
    }
    .bubble {
      max-width: 85%;
      padding: 10px 14px;
    }
    .chat-topbar {
      padding: 10px 14px;
      gap: 8px;
    }
    .chat-composer {
      padding: 8px 12px;
    }
  }

  @media(max-width: 480px) {
    .contacts-panel {
      width: 100%;
      max-width: none;
      min-width: 0;
    }
    .panel-header {
      padding: 14px 12px 10px;
    }
    .contact-card {
      padding: 10px 8px;
      gap: 10px;
    }
    .chat-topbar {
      padding: 8px 10px;
      gap: 6px;
    }
    .chat-user-meta h3 {
      font-size: 14px;
    }
    .role-chip {
      display: none;
    }
    .security-badge {
      display: none;
    }
    .bubble {
      max-width: 90%;
    }
    .composer-container {
      padding: 4px 6px;
      gap: 4px;
    }
    .tool-btn {
      padding: 6px;
    }
    .tool-btn .material-icons {
      font-size: 20px;
    }
    .send-btn {
      width: 36px;
      height: 36px;
    }
  }


  /* Photo Attachment and Emoji Picker Styles */
  .bubble-photo-wrapper {
    margin-bottom: 8px;
    border-radius: 12px;
    overflow: hidden;
    max-width: 280px;
    cursor: pointer;
  }
  .chat-photo-img {
    width: 100%;
    max-height: 240px;
    object-fit: cover;
    display: block;
    border-radius: 12px;
    transition: transform 0.2s ease;
  }
  .chat-photo-img:hover {
    transform: scale(1.02);
  }

  .photo-preview-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 12px;
    padding: 8px 14px;
    margin-bottom: 8px;
  }
  .preview-thumb-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .preview-thumb {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #86EFAC;
  }
  .preview-tag {
    font-size: 13px;
    font-weight: 600;
    color: #166534;
  }
  .btn-clear-photo {
    background: #DC2626;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .btn-clear-photo .material-icons {
    font-size: 16px;
  }

  .tool-btn {
    background: transparent;
    border: none;
    color: #0077B6;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .tool-btn:hover {
    background: #E0F2FE;
    transform: scale(1.08);
  }
  .tool-btn .material-icons {
    font-size: 22px;
  }

  .emoji-picker-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
    border: 1px solid #E2E8F0;
    padding: 12px;
    margin-bottom: 8px;
    animation: popUp 0.15s ease-out;
  }
  .emoji-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    margin: 6px 0 4px;
  }
  .close-emoji {
    background: none;
    border: none;
    cursor: pointer;
    color: #94A3B8;
  }
  .close-emoji .material-icons { font-size: 16px; }
  .emoji-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .emoji-btn {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    font-size: 20px;
    padding: 6px 8px;
    cursor: pointer;
    transition: transform 0.1s, background 0.1s;
  }
  .emoji-btn:hover {
    background: #E0F2FE;
    transform: scale(1.2);
  }

  .photo-modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.85);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(4px);
  }
  .photo-modal-dialog {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
  }
  .modal-full-img {
    max-width: 100%;
    max-height: 85vh;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }
  .modal-close-btn {
    position: absolute;
    top: -16px;
    right: -16px;
    background: white;
    color: #1E293B;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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

  selectedPhoto = signal<string | null>(null);
  showEmojiPicker = signal<boolean>(false);
  activePhotoModal = signal<string | null>(null);

  medicalEmojis = ['🩺', '💊', '🩹', '🏥', '🌡️', '💉', '📋', '🧬', '⚠️', '❤️', '🫀', '🫁', '🦷', '🩸', '🚑', '🚨'];
  convoEmojis = ['😊', '👍', '👋', '🙏', '🤝', '💬', '🙋‍♂️', '🙋‍♀️', '🕒', '✅', '❌', '📞', '😷', '🤒', '🤕', '💡'];

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

  constructor(
    private http: HttpClient, 
    public auth: AuthService, 
    public chatService: ChatService,
    private userService: UserService
  ) {}

  private unreadInterval: any = null;
  private convoInterval: any = null;

  ngOnInit() {
    this.myId.set(this.auth.currentUser()?.id || (this.auth.getRole() === 'DOCTOR' ? 2 : 1));
    this.loadContacts();
    this.chatService.refreshUnreadCount();
    
    this.unreadInterval = setInterval(() => this.loadUnreadCounts(), 2500);
  }

  ngOnDestroy() {
    if (this.convoInterval) clearInterval(this.convoInterval);
    if (this.unreadInterval) clearInterval(this.unreadInterval);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) { this.scrollBottom(); this.shouldScroll = false; }
  }

  addEmoji(emoji: string) {
    this.newMessage += emoji;
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedPhoto.set(reader.result as string);
        input.value = '';
      };
      reader.readAsDataURL(file);
    }
  }

  clearPhoto() {
    this.selectedPhoto.set(null);
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
    const regDocs = this.userService.getLocalDoctors();

    if (role === 'PATIENT') {
      defaultContacts = regDocs.map(d => ({
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        role: 'DOCTOR',
        email: d.email
      }));
      defaultContacts.push(
        { id: 4, firstName: 'Dr. Secours', lastName: 'Urgentiste SAMU', role: 'EMERGENCY', email: 'emergency@healthtrack.ai' }
      );
    } else if (role === 'DOCTOR') {
      defaultContacts = [
        { id: 1, firstName: 'Sara', lastName: 'El Amrani', role: 'PATIENT', email: 'patient@healthtrack.ai' },
        { id: 6, firstName: 'Jean', lastName: 'Martin', role: 'PATIENT', email: 'jean.martin@healthtrack.ai' },
        { id: 4, firstName: 'Dr. Secours', lastName: 'Urgentiste SAMU', role: 'EMERGENCY', email: 'emergency@healthtrack.ai' }
      ];
    } else {
      defaultContacts = [
        { id: 2, firstName: 'Dr. Ahmed', lastName: 'Bennani', role: 'DOCTOR', email: 'doctor@healthtrack.ai' },
        { id: 1, firstName: 'Sara', lastName: 'El Amrani', role: 'PATIENT', email: 'patient@healthtrack.ai' },
        { id: 4, firstName: 'Dr. Secours', lastName: 'Urgentiste SAMU', role: 'EMERGENCY', email: 'emergency@healthtrack.ai' }
      ];
    }
    this.contacts.set(defaultContacts);
    this.loadUnreadCounts();

    if (!this.selectedContact() && defaultContacts.length > 0) {
      this.selectContact(defaultContacts[0]);
    }
  }

  loadUnreadCounts() {
    const myId = this.myId();
    const contacts = this.contacts();
    const counts: {[key: number]: number} = {};
    let totalUnread = 0;

    for (const c of contacts) {
      if (this.selectedContact()?.id === c.id) {
        counts[c.id] = 0;
        continue;
      }
      const min = Math.min(myId, c.id);
      const max = Math.max(myId, c.id);
      const key = `sihati_chat_store_${min}_${max}`;
      let cUnread = 0;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const msgs: Msg[] = JSON.parse(raw);
          if (Array.isArray(msgs)) {
            cUnread = msgs.filter(m => m && m.receiver && m.receiver.id === myId && !m.readByReceiver).length;
          }
        }
      } catch(e) {}
      counts[c.id] = cUnread;
      totalUnread += cUnread;
    }

    this.unreadCounts.set(counts);
    this.chatService.unreadCount.set(totalUnread);

    this.http.get<{[key: number]: number}>(`${environment.apiUrl}/chat/unread-per-contact`).subscribe({
      next: serverCounts => {
        if (serverCounts && Object.keys(serverCounts).length > 0) {
          const merged = { ...counts };
          for (const k of Object.keys(serverCounts)) {
            const id = +k;
            if (this.selectedContact()?.id !== id) {
              merged[id] = Math.max(merged[id] || 0, serverCounts[id]);
            }
          }
          this.unreadCounts.set(merged);
        }
      },
      error: () => {}
    });
  }

  private getStorageKey(userA: number, userB: number): string {
    const min = Math.min(userA, userB);
    const max = Math.max(userA, userB);
    return `sihati_chat_store_${min}_${max}`;
  }

  private getStoredConvo(userA: number, userB: number): Msg[] {
    const key = this.getStorageKey(userA, userB);
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // Default initial seeded discussion between Sara (1) and Dr. Bennani (2)
    if ((userA === 1 && userB === 2) || (userA === 2 && userB === 1)) {
      const now = new Date();
      const initial: Msg[] = [
        {
          id: 101,
          sender: { id: 1, firstName: 'Sara', lastName: 'El Amrani' },
          receiver: { id: 2 },
          content: "Bonjour Dr. Bennani, j'ai enregistré mes constantes de santé ce matin (tension 142/88 mmHg).",
          sentAt: new Date(now.getTime() - 7200000).toISOString(),
          readByReceiver: true
        },
        {
          id: 102,
          sender: { id: 2, firstName: 'Dr. Ahmed', lastName: 'Bennani' },
          receiver: { id: 1 },
          content: "Bonjour Sara. Bien reçu. Poursuivez votre Kardégic à midi et prévoyez une mesure de repos ce soir.",
          sentAt: new Date(now.getTime() - 3600000).toISOString(),
          readByReceiver: true
        },
        {
          id: 103,
          sender: { id: 1, firstName: 'Sara', lastName: 'El Amrani' },
          receiver: { id: 2 },
          content: "Parfait Docteur, merci pour votre réactivité !",
          sentAt: new Date(now.getTime() - 1800000).toISOString(),
          readByReceiver: true
        }
      ];
      this.saveStoredConvo(userA, userB, initial);
      return initial;
    }

    return [];
  }

  private saveStoredConvo(userA: number, userB: number, msgs: Msg[]): void {
    const key = this.getStorageKey(userA, userB);
    try {
      localStorage.setItem(key, JSON.stringify(msgs));
    } catch (e) {}
  }

  selectContact(c: Contact) {
    this.selectedContact.set(c);

    const myId = this.myId();

    // 1. Mark all messages from this contact as READ in localStorage
    const min = Math.min(myId, c.id);
    const max = Math.max(myId, c.id);
    const key = `sihati_chat_store_${min}_${max}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const msgs: Msg[] = JSON.parse(raw);
        if (Array.isArray(msgs)) {
          let updated = false;
          for (const m of msgs) {
            if (m.receiver && m.receiver.id === myId && !m.readByReceiver) {
              m.readByReceiver = true;
              updated = true;
            }
          }
          if (updated) {
            localStorage.setItem(key, JSON.stringify(msgs));
          }
        }
      }
    } catch(e) {}

    // 2. Clear unread badge for this contact IMMEDIATELY!
    this.unreadCounts.update(counts => {
      const updated = { ...counts };
      updated[c.id] = 0;
      return updated;
    });

    // 3. Recalculate total unread count for navbar and sidebar
    this.chatService.refreshUnreadCount();

    // 4. Load messages into UI
    this.loadMessages(c.id);

    if (this.convoInterval) {
      clearInterval(this.convoInterval);
    }
    // Poll for new incoming messages from this contact every 2s
    this.convoInterval = setInterval(() => {
      if (this.selectedContact()?.id === c.id) {
        this.syncMessagesFromStorage(c.id);
      }
    }, 2000);
  }

  syncMessagesFromStorage(contactId: number) {
    const myId = this.myId();
    const stored = this.getStoredConvo(myId, contactId);
    if (stored.length !== this.messages().length || (stored.length > 0 && stored[stored.length - 1].id !== this.messages()[this.messages().length - 1]?.id)) {
      // User is currently viewing this conversation, mark any new incoming message as read ("vu")!
      let updated = false;
      for (const m of stored) {
        if (m.receiver && m.receiver.id === myId && !m.readByReceiver) {
          m.readByReceiver = true;
          updated = true;
        }
      }
      if (updated) {
        this.saveStoredConvo(myId, contactId, stored);
      }
      this.messages.set(stored);
      this.shouldScroll = true;
      this.unreadCounts.update(counts => ({ ...counts, [contactId]: 0 }));
      this.chatService.refreshUnreadCount();
    }
  }

  loadMessages(contactId: number) {
    const myId = this.myId();
    const localMsgs = this.getStoredConvo(myId, contactId);

    // Mark as read in local store
    let updated = false;
    for (const m of localMsgs) {
      if (m.receiver.id === myId && !m.readByReceiver) {
        m.readByReceiver = true;
        updated = true;
      }
    }
    if (updated) this.saveStoredConvo(myId, contactId, localMsgs);

    this.messages.set(localMsgs);
    this.shouldScroll = true;

    // Also sync with server if available
    this.http.get<Msg[]>(`${environment.apiUrl}/chat/conversation/${contactId}`).subscribe({
      next: (serverMsgs) => {
        if (serverMsgs && serverMsgs.length > 0) {
          const merged = [...localMsgs];
          for (const sm of serverMsgs) {
            if (!merged.some(lm => lm.id === sm.id)) merged.push(sm);
          }
          this.messages.set(merged);
          this.saveStoredConvo(myId, contactId, merged);
          this.shouldScroll = true;
        }
      },
      error: () => {}
    });
  }

  send() {
    const content = this.newMessage.trim();
    const photo = this.selectedPhoto();
    if ((!content && !photo) || !this.selectedContact()) return;

    const contact = this.selectedContact()!;
    const myId = this.myId();
    const me = this.auth.currentUser();

    const senderFirst = me?.firstName || (this.auth.getRole() === 'DOCTOR' ? 'Dr. Ahmed' : 'Sara');
    const senderLast = me?.lastName || (this.auth.getRole() === 'DOCTOR' ? 'Bennani' : 'El Amrani');

    const newMsg: Msg = {
      id: Date.now(),
      sender: {
        id: myId,
        firstName: senderFirst,
        lastName: senderLast
      },
      receiver: { id: contact.id },
      content: content || (photo ? 'Photo médicale transmise' : ''),
      photoUrl: photo || undefined,
      sentAt: new Date().toISOString(),
      readByReceiver: false
    };

    // Save to shared localStorage store immediately so it never disappears!
    const currentList = this.getStoredConvo(myId, contact.id);
    currentList.push(newMsg);
    this.saveStoredConvo(myId, contact.id, currentList);

    // Update UI immediately
    this.messages.set([...currentList]);
    this.newMessage = '';
    this.selectedPhoto.set(null);
    this.showEmojiPicker.set(false);
    this.shouldScroll = true;

    // Send to backend if available
    this.http.post<Msg>(`${environment.apiUrl}/chat/send/${contact.id}`, { content: newMsg.content }).subscribe({
      next: () => {},
      error: () => {}
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
