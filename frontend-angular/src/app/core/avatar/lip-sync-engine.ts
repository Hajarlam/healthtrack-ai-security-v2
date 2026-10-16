import { InjectionToken } from '@angular/core';

/**
 * A single animation frame produced by a lip-sync engine.
 */
export interface LipSyncFrame {
  /** Normalised "mouth energy" amplitude, 0..1. */
  amplitude: number;
  /**
   * Optional viseme identifier (e.g. "A", "E", "M", "sil").
   * Only a real phoneme-synchronised engine fills this.
   */
  viseme?: string;
}

/**
 * Strategy abstraction over any avatar speech-animation backend.
 *
 * The application ships with {@link BasicMotionLipSyncEngine}, which only
 * produces a smooth pseudo-random amplitude so the avatar can "breathe" and
 * glow while speaking. It is explicitly **NOT** phoneme/viseme accurate.
 *
 * ## Swapping in a real open-source lip-sync model
 * A future model (SadTalker / Wav2Lip / MuseTalk / a WebAssembly ONNX runtime,
 * or even a cloud poller) only has to implement this interface and be provided
 * once, for example in `app.config.ts`:
 *
 * ```ts
 * { provide: LIP_SYNC_ENGINE, useFactory: () => new Wav2LipLipSyncEngine() }
 * ```
 *
 * `VirtualAvatarComponent` renders whatever frame the engine exposes through the
 * CSS custom property `--talk-amp` (and, when `phonemeSynced` is true, an
 * optional viseme canvas). **No application code has to be rewritten** — only
 * this one provider changes.
 *
 * NOTE: GPU inference (a real lip-sync model) cannot run on Vercel's static
 * hosting; such an engine would need a separate compute host. This abstraction
 * keeps that decision isolated from the UI.
 */
export interface LipSyncEngine {
  /** Stable identifier, e.g. `basic-motion`. */
  readonly id: string;
  /** Human-readable label surfaced in the UI badge. */
  readonly label: string;
  /** True only for genuine phoneme/viseme-synchronised engines. */
  readonly phonemeSynced: boolean;
  /** Called when speech playback starts. */
  start(text: string, lang: string): void;
  /** Called when speech playback stops/ends. */
  stop(): void;
  /** Returns the frame for the given high-resolution timestamp (ms). */
  frame(nowMs: number): LipSyncFrame;
}

/**
 * DI token for the active {@link LipSyncEngine}.
 *
 * When not provided, {@link VirtualAvatarComponent} falls back to the built-in
 * basic engine. Provide it at the application root to install a real model.
 */
export const LIP_SYNC_ENGINE = new InjectionToken<LipSyncEngine>('LIP_SYNC_ENGINE');
