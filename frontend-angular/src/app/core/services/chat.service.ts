import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly API = `${environment.apiUrl}/chat`;
  unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  getContacts(): Observable<any[]>                 { return this.http.get<any[]>(`${this.API}/contacts`); }
  
  getConversation(id: number): Observable<any[]>  { 
    return this.http.get<any[]>(`${this.API}/conversation/${id}`).pipe(
      tap(() => this.refreshUnreadCount())
    ); 
  }

  sendMessage(receiverId: number, content: string): Observable<any> {
    return this.http.post<any>(`${this.API}/send/${receiverId}`, { content });
  }

  getUnreadCount(): Observable<number> { 
    return this.http.get<number>(`${this.API}/unread-count`).pipe(
      tap(n => this.unreadCount.set(n))
    ); 
  }

  refreshUnreadCount(): void {
    this.http.get<number>(`${this.API}/unread-count`).subscribe({
      next: n => this.unreadCount.set(n),
      error: () => {}
    });
  }

  resetUnread(): void {
    this.unreadCount.set(0);
  }
}
