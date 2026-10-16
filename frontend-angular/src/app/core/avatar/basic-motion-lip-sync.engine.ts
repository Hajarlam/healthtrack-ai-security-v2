import { LipSyncEngine, LipSyncFrame } from './lip-sync-engine';

/**
 * Default, zero-cost speech-animation engine.
 *
 * It does not perform any lip-synchronisation at all: while speech is playing it
 * returns a smooth, organic-looking amplitude (layered sines) that the avatar
 * uses to gently bob, scale and glow. It is deliberately honest about this via
 * `phonemeSynced = false`, so the UI can label it as a *basic* speaking
 * animation rather than a true viseme animation.
 *
 * Because browser `speechSynthesis` output cannot be captured with the Web Audio
 * API, the amplitude is simulated rather than measured. A real engine would
 * instead analyse the audio buffer (or pre-computed viseme frames).
 */
export class BasicMotionLipSyncEngine implements LipSyncEngine {
  readonly id = 'basic-motion';
  readonly label = 'Animation de parole basique';
  readonly phonemeSynced = false;

  private running = false;
  private startedAt = 0;

  start(_text: string, _lang: string): void {
    this.running = true;
    this.startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  stop(): void {
    this.running = false;
  }

  frame(nowMs: number): LipSyncFrame {
    if (!this.running) return { amplitude: 0 };
    const t = (nowMs - this.startedAt) / 1000;

    // Layered sine waves produce an organic, non-repetitive pulsing envelope.
    const wave =
      Math.sin(t * 9.5) * 0.55 +
      Math.sin(t * 4.3 + 1.2) * 0.30 +
      Math.sin(t * 17.1 + 0.4) * 0.15;

    const amplitude = Math.max(0, Math.min(1, 0.5 + wave * 0.5));
    return { amplitude };
  }
}
