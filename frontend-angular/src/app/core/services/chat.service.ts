import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly API = `${environment.apiUrl}/chat`;
  unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {
    this.refreshUnreadCount();
  }

  getContacts(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.API}/contacts`); 
  }
  
  getConversation(id: number): Observable<any[]> { 
    return this.http.get<any[]>(`${this.API}/conversation/${id}`).pipe(
      tap(() => this.refreshUnreadCount())
    ); 
  }

  sendMessage(receiverId: number, content: string): Observable<any> {
    return this.http.post<any>(`${this.API}/send/${receiverId}`, { content });
  }

  public computeLocalUnread(myId: number): number {
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sihati_chat_store_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              for (const m of list) {
                if (m && m.receiver && m.receiver.id === myId && !m.readByReceiver) {
                  total++;
                }
              }
            }
          }
        }
      }
    } catch(e) {}
    return total;
  }

  getUnreadCount(): Observable<number> { 
    let myId = 1;
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed.id) myId = parsed.id;
        else if (parsed.role === 'DOCTOR') myId = 2;
      }
    } catch(e) {}
    const local = this.computeLocalUnread(myId);

    return this.http.get<number>(`${this.API}/unread-count`).pipe(
      tap(n => this.unreadCount.set(Math.max(n || 0, local))),
      catchError(() => {
        this.unreadCount.set(local);
        return of(local);
      })
    ); 
  }

  refreshUnreadCount(): void {
    let myId = 1;
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed.id) myId = parsed.id;
        else if (parsed.role === 'DOCTOR') myId = 2;
      }
    } catch(e) {}

    const localCount = this.computeLocalUnread(myId);
    this.unreadCount.set(localCount);

    this.http.get<number>(`${this.API}/unread-count`).subscribe({
      next: n => {
        if (typeof n === 'number') {
          this.unreadCount.set(Math.max(n, localCount));
        }
      },
      error: () => {
        this.unreadCount.set(localCount);
      }
    });
  }

  resetUnread(): void {
    this.unreadCount.set(0);
  }
}
