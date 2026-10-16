import { Injectable, signal } from '@angular/core';

export type SpeechErrorCode =
  | 'not-supported'
  | 'insecure-context'
  | 'permission-denied'
  | 'no-microphone'
  | 'microphone-busy'
  | 'audio-capture'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'busy'
  | 'unknown';

export interface SpeechError {
  code: SpeechErrorCode;
  message: string;
}

export interface ListenOptions {
  /** BCP-47 language tag, e.g. `fr-FR`. */
  lang: string;
  onResult: (transcript: string) => void;
  onError?: (error: SpeechError) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface SpeakOptions {
  lang: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * Thin, self-contained wrapper around the free, built-in Web Speech APIs:
 *
 *  - Speech-to-text   → `SpeechRecognition` / `webkitSpeechRecognition`
 *  - Text-to-speech   → `speechSynthesis`
 *
 * Everything here runs locally in the browser: **no API key, no cost, no backend**.
 * Microphone permission is requested explicitly so we can surface precise,
 * user-friendly French error messages instead of silent failures.
 */
@Injectable({ providedIn: 'root' })
export class SpeechService {
  /** True when the browser exposes the SpeechRecognition API. */
  readonly recognitionSupported: boolean;
  /** True when the browser exposes speechSynthesis. */
  readonly synthesisSupported: boolean;

  readonly isListening = signal(false);
  readonly isSpeaking = signal(false);

  private recognition: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    const w = typeof window !== 'undefined' ? (window as any) : {};
    this.recognitionSupported = !!(w.SpeechRecognition || w.webkitSpeechRecognition);
    this.synthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    if (this.synthesisSupported) {
      this.refreshVoices();
      // Voices load asynchronously in most browsers.
      try { window.speechSynthesis.onvoiceschanged = () => this.refreshVoices(); } catch { /* noop */ }
    }
  }

  // ---------------------------------------------------------------------------
  // Speech recognition (microphone)
  // ---------------------------------------------------------------------------

  /**
   * Request the microphone (with explicit permission handling) and start
   * recognising a single utterance. The result is delivered through `onResult`.
   */
  async startListening(options: ListenOptions): Promise<void> {
    if (this.isListening()) {
      this.stopListening();
      return;
    }

    const w = typeof window !== 'undefined' ? (window as any) : {};
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      options.onError?.({
        code: 'not-supported',
        message:
          "La reconnaissance vocale n'est pas supportée par ce navigateur. Utilisez Chrome, Edge ou la version Android.",
      });
      return;
    }

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      options.onError?.({
        code: 'insecure-context',
        message:
          "Le micro nécessite une connexion sécurisée (HTTPS). Ouvrez l'application via son adresse https://.",
      });
      return;
    }

    // Explicit permission request → precise, actionable errors.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      }
    } catch (err: any) {
      options.onError?.(this.mapMediaError(err));
      return;
    }

    // Fresh instance each time avoids stale-state bugs on Chrome/Android.
    if (this.recognition) {
      try { this.recognition.abort(); } catch { /* noop */ }
      this.recognition = null;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = options.lang || 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      this.isListening.set(true);
      options.onStart?.();
    };

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (transcript && String(transcript).trim()) {
        options.onResult(String(transcript).trim());
      }
    };

    recognition.onerror = (event: any) => {
      const code = this.mapRecognitionError(event?.error);
      this.isListening.set(false);
      // `aborted` is a normal user-initiated stop → stay silent.
      if (code !== 'aborted') {
        options.onError?.(this.describeRecognitionError(code));
      }
    };

    recognition.onend = () => {
      this.isListening.set(false);
      options.onEnd?.();
    };

    this.recognition = recognition;
    try {
      recognition.start();
    } catch {
      this.isListening.set(false);
      options.onError?.({
        code: 'busy',
        message: 'Impossible de démarrer le micro (déjà utilisé). Réessayez dans un instant.',
      });
    }
  }

  stopListening(): void {
    if (this.recognition) {
      try { this.recognition.stop(); } catch { /* noop */ }
    }
    this.isListening.set(false);
  }

  // ---------------------------------------------------------------------------
  // Speech synthesis (spoken answers)
  // ---------------------------------------------------------------------------

  /** Speak `text` aloud using the browser voice that best matches `lang`. */
  speak(text: string, options: SpeakOptions): void {
    if (!this.synthesisSupported) {
      options.onError?.();
      return;
    }

    this.stopSpeaking();

    const clean = this.cleanForSpeech(text);
    if (!clean) {
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = options.lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voice = this.pickVoice(options.lang);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      this.isSpeaking.set(true);
      options.onStart?.();
    };
    utterance.onend = () => {
      this.isSpeaking.set(false);
      this.currentUtterance = null;
      options.onEnd?.();
    };
    utterance.onerror = () => {
      this.isSpeaking.set(false);
      this.currentUtterance = null;
      options.onError?.();
    };

    this.currentUtterance = utterance;
    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking.set(false);
      this.currentUtterance = null;
      options.onError?.();
    }
  }

  stopSpeaking(): void {
    if (this.synthesisSupported) {
      try { window.speechSynthesis.cancel(); } catch { /* noop */ }
    }
    this.isSpeaking.set(false);
    this.currentUtterance = null;
  }

  /** Remove markdown so the spoken output sounds natural. */
  private cleanForSpeech(text: string): string {
    return (text || '')
      .replace(/[*_#`~]/g, ' ')
      .replace(/^\s*[-•]\s*/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private refreshVoices(): void {
    try { this.voices = window.speechSynthesis.getVoices() || []; } catch { this.voices = []; }
  }

  private pickVoice(lang: string): SpeechSynthesisVoice | undefined {
    if (!this.voices.length) this.refreshVoices();
    const prefix = (lang || 'fr').substring(0, 2).toLowerCase();
    const matching = this.voices.filter(v => v.lang?.toLowerCase().startsWith(prefix));
    if (!matching.length) return undefined;

    const preferredNames = ['Google', 'Natural', 'Amelie', 'Amélie', 'Julie', 'Jenny', 'Samantha', 'Maged', 'Zayd', 'Hoda'];
    return (
      matching.find(v => preferredNames.some(n => v.name.includes(n))) ||
      matching.find(v => v.default) ||
      matching[0]
    );
  }

  // ---------------------------------------------------------------------------
  // Error mapping
  // ---------------------------------------------------------------------------

  private mapMediaError(err: any): SpeechError {
    const name = err?.name || '';
    switch (name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return { code: 'permission-denied', message: "Accès au micro refusé. Autorisez le microphone dans les réglages du navigateur puis réessayez." };
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return { code: 'no-microphone', message: 'Aucun microphone détecté. Branchez un micro puis réessayez.' };
      case 'NotReadableError':
      case 'TrackStartError':
        return { code: 'microphone-busy', message: 'Le microphone est déjà utilisé par une autre application. Fermez-la puis réessayez.' };
      default:
        return { code: 'unknown', message: "Impossible d'accéder au microphone. Vérifiez vos réglages audio." };
    }
  }

  private mapRecognitionError(error: string): SpeechErrorCode {
    switch (error) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'permission-denied';
      case 'audio-capture':
        return 'audio-capture';
      case 'no-speech':
        return 'no-speech';
      case 'network':
        return 'network';
      case 'aborted':
        return 'aborted';
      case 'busy':
        return 'busy';
      default:
        return 'unknown';
    }
  }

  private describeRecognitionError(code: SpeechErrorCode): SpeechError {
    switch (code) {
      case 'permission-denied':
        return { code, message: "Accès au micro refusé. Autorisez le microphone puis réessayez." };
      case 'audio-capture':
        return { code, message: 'Aucun microphone disponible.' };
      case 'no-speech':
        return { code, message: "Aucune parole détectée. Parlez plus près du micro." };
      case 'network':
        return { code, message: 'La reconnaissance vocale nécessite une connexion Internet.' };
      case 'busy':
        return { code, message: 'Le micro est occupé. Réessayez dans un instant.' };
      default:
        return { code, message: 'La reconnaissance vocale a échoué. Réessayez.' };
    }
  }
}
