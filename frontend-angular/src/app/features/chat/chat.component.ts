import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewChecked } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../core/services/auth.service";
import { environment } from "../../../environments/environment";

interface Contact { id: number; firstName: string; lastName: string; role: string; email: string; }
interface Msg { id: number; sender: {id:number; firstName:string; lastName:string}; receiver: {id:number}; content: string; sentAt: string; readByReceiver: boolean; }

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
  <div class="page">
    <div class="page-header">
      <h1>💬 Messagerie</h1>
      <p>Communication sécurisée entre médecin et patient</p>
    </div>

    <div class="chat-container">
      <!-- Contacts sidebar -->
      <div class="chat-sidebar">
        <div class="chat-sidebar-header">
          <span class="material-icons" style="font-size:18px;margin-right:6px;">people</span>
          Contacts
        </div>
        <div style="overflow-y:auto;flex:1;">
          @for (c of contacts(); track c.id) {
            <div class="contact-item" [class.active]="selectedContact()?.id === c.id"
                 (click)="selectContact(c)">
              <div class="contact-avatar">{{c.firstName[0]}}{{c.lastName[0]}}</div>
              <div style="flex:1; display:flex; align-items:center; justify-content:space-between; min-width:0;">
                <div style="min-width:0;">
                  <div class="contact-name" style="text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">{{c.firstName}} {{c.lastName}}</div>
                  <div class="contact-role">{{c.role}}</div>
                </div>
                @if (unreadCounts()[c.id] > 0) {
                  <span class="chat-unread-badge" style="background:#d4af37; color:#0d1b2a; border-radius:12px; min-width:20px; height:20px; padding:0 6px; display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; margin-left:8px; flex-shrink:0;">
                    {{unreadCounts()[c.id]}}
                  </span>
                }
              </div>
            </div>
          }
          @if (contacts().length === 0) {
            <div style="padding:20px;text-align:center;color:#8d6e63;font-size:13px;">Aucun contact</div>
          }
        </div>
      </div>

      <!-- Chat area -->
      <div class="chat-main">
        @if (selectedContact()) {
          <div class="chat-header">
            <div class="contact-avatar">{{selectedContact()!.firstName[0]}}{{selectedContact()!.lastName[0]}}</div>
            <div>
              <div style="font-weight:700;color:#880e4f;">{{selectedContact()!.firstName}} {{selectedContact()!.lastName}}</div>
              <div style="font-size:12px;color:#8d6e63;">{{selectedContact()!.role}}</div>
            </div>
            <span style="flex:1"></span>
            <div style="font-size:12px;color:#4caf50;display:flex;align-items:center;gap:4px;">
              <span style="width:8px;height:8px;border-radius:50%;background:#4caf50;display:inline-block;"></span>
              En ligne
            </div>
          </div>

          <div class="chat-messages" #messagesEnd>
            @for (m of messages(); track m.id) {
              <div>
                <div class="msg" [class.msg-mine]="m.sender.id === myId()" [class.msg-other]="m.sender.id !== myId()">
                  {{m.content}}
                  <div class="msg-time">{{formatTime(m.sentAt)}}</div>
                </div>
              </div>
            }
            @if (messages().length === 0) {
              <div class="empty" style="margin-top:60px;">
                <span class="material-icons">chat_bubble_outline</span>
                <p>Démarrez la conversation</p>
              </div>
            }
          </div>

          <div class="chat-input">
            <input [(ngModel)]="newMessage" (keydown.enter)="send()"
                   placeholder="Écrire un message... (Entrée pour envoyer)">
            <button class="chat-send-btn" (click)="send()" [disabled]="!newMessage.trim()">
              <span class="material-icons">send</span>
            </button>
          </div>
        } @else {
          <div class="empty" style="margin:auto;">
            <span class="material-icons">chat</span>
            <p>Sélectionnez un contact pour commencer</p>
          </div>
        }
      </div>
    </div>
  </div>
  `
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild("messagesEnd") private msgsDiv!: ElementRef;

  contacts  = signal<Contact[]>([]);
  messages  = signal<Msg[]>([]);
  selectedContact = signal<Contact | null>(null);
  unreadCounts = signal<{[key: number]: number}>({});
  newMessage = "";
  myId = signal(0);
  private shouldScroll = false;

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit() {
    this.myId.set(this.auth.currentUser()?.id || 0);
    this.loadContacts();
    
    // Refresh unread counts periodically
    setInterval(() => this.loadUnreadCounts(), 5000);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) { this.scrollBottom(); this.shouldScroll = false; }
  }

  loadContacts() {
    this.http.get<Contact[]>(`${environment.apiUrl}/chat/contacts`).subscribe({
      next: c => {
        this.contacts.set(c);
        this.loadUnreadCounts();
      },
      error: () => {}
    });
  }

  loadUnreadCounts() {
    this.http.get<{[key: number]: number}>(`${environment.apiUrl}/chat/unread-per-contact`).subscribe({
      next: counts => this.unreadCounts.set(counts),
      error: () => {}
    });
  }

  selectContact(c: Contact) {
    this.selectedContact.set(c);
    this.loadMessages(c.id);
    
    // Reset unread count immediately on frontend
    this.unreadCounts.update(counts => {
      const updated = { ...counts };
      updated[c.id] = 0;
      return updated;
    });

    setInterval(() => { if (this.selectedContact()?.id === c.id) this.loadMessages(c.id); }, 5000);
  }

  loadMessages(contactId: number) {
    this.http.get<Msg[]>(`${environment.apiUrl}/chat/conversation/${contactId}`).subscribe({
      next: m => { 
        this.messages.set(m); 
        this.shouldScroll = true; 
        this.loadUnreadCounts(); // Refresh unread count badges!
      }, 
      error: () => {}
    });
  }

  send() {
    const content = this.newMessage.trim();
    if (!content || !this.selectedContact()) return;
    this.http.post<Msg>(`${environment.apiUrl}/chat/send/${this.selectedContact()!.id}`, {content}).subscribe({
      next: m => {
        this.messages.update(msgs => [...msgs, m]);
        this.newMessage = "";
        this.shouldScroll = true;
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
