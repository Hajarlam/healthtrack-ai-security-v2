import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly API = `${environment.apiUrl}/chat`;
  constructor(private http: HttpClient) {}
  getContacts(): Observable<any[]>                 { return this.http.get<any[]>(`${this.API}/contacts`); }
  getConversation(id: number): Observable<any[]>  { return this.http.get<any[]>(`${this.API}/conversation/${id}`); }
  sendMessage(receiverId: number, content: string): Observable<any> {
    return this.http.post<any>(`${this.API}/send/${receiverId}`, { content });
  }
  getUnreadCount(): Observable<number> { return this.http.get<number>(`${this.API}/unread-count`); }
}
