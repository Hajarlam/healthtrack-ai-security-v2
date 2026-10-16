import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AnomalyResult } from '../models/ai.model';

interface ChatReplyResponse {
  reply?: string;
  response?: string;
  message?: string;
  success?: boolean;
}

/**
 * Bridges the Dr. Virtuel assistant to the **existing Spring Boot AI backend**.
 *
 *  - `POST {apiUrl}/ai/chat`            → OpenAI GPT when a key is configured
 *                                         server-side, otherwise the built-in
 *                                         free clinical engine (`AiChatController`).
 *  - `GET  {apiUrl}/ai/analyze-latest`  → server-side anomaly detection.
 *
 * No API key ever touches the browser: keys live in the backend `application.yml`
 * (env vars). When the backend is unreachable (e.g. the Vercel static demo) the
 * caller falls back to the local offline engine — see `AiDashboardComponent`.
 */
@Injectable({ providedIn: 'root' })
export class AiDoctorService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Ask the medical AI backend a question. Never throws keys or secrets. */
  ask(question: string, lang: string): Observable<string> {
    return this.http
      .post<ChatReplyResponse>(`${this.base}/ai/chat`, { message: question, language: lang })
      .pipe(
        timeout(12000),
        map(res => (res?.reply || res?.response || res?.message || '').toString().trim())
      );
  }

  /** Ask the backend to analyse the current user's latest vitals. */
  analyzeLatest(): Observable<AnomalyResult> {
    return this.http
      .get<AnomalyResult>(`${this.base}/ai/analyze-latest`)
      .pipe(timeout(10000));
  }
}
