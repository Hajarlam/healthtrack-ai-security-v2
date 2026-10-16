import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LIP_SYNC_ENGINE, LipSyncEngine } from '../../../core/avatar/lip-sync-engine';
import { BasicMotionLipSyncEngine } from '../../../core/avatar/basic-motion-lip-sync.engine';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

/**
 * Dr. Virtuel avatar stage.
 *
 * Renders the **existing avatar image unchanged** (the caller passes its URL) and
 * animates it while the AI is speaking. The animation strategy is delegated to a
 * pluggable {@link LipSyncEngine}:
 *
 *  - default (`BasicMotionLipSyncEngine`): a purely cosmetic bob / glow / equaliser
 *    driven by a simulated amplitude — **not** a phoneme-accurate lip-sync.
 *  - a future open-source model: provide `LIP_SYNC_ENGINE` once in `app.config.ts`
 *    and, if it is `phonemeSynced`, this component exposes a viseme canvas hook.
 *
 * No paid service, iframe, API key or GPU is required for the default stage.
 */
@Component({
  selector: 'app-virtual-avatar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="avatar-frame-box"
         #stage
         [class.is-speaking]="state === 'speaking'"
         [class.is-listening]="state === 'listening'"
         [class.is-thinking]="state === 'thinking'"
         [class.lipsync-accurate]="engine.phonemeSynced">

      <div class="native-avatar-bg"></div>

      <div class="native-avatar-inner">
        <div class="doctor-avatar-circle">
          <div class="pulse-ring ring-1"></div>
          <div class="pulse-ring ring-2"></div>
          <div class="voice-halo" aria-hidden="true"></div>

          <!--
            PRESERVED AVATAR IMAGE — do not regenerate/replace/redesign.
            Its source is supplied verbatim by the caller.
          -->
          @if (!imgFailed) {
            <img class="doctor-portrait-img"
                 [src]="imageSrc"
                 [alt]="name"
                 loading="eager"
                 decoding="async"
                 (error)="imgFailed = true" />
          } @else {
            <span class="material-icons doctor-big-avatar fallback-avatar">support_agent</span>
          }

          <!--
            Viseme canvas hook: only meaningful when a real phoneme engine is
            plugged in. It stays empty for the default basic engine.
          -->
          @if (engine.phonemeSynced) {
            <canvas class="viseme-canvas" width="256" height="256" aria-hidden="true"></canvas>
          }
        </div>

        <div class="avatar-name-badge"><span class="avatar-dot"></span> {{ name }}</div>
        <div class="avatar-live-status">{{ statusText }}</div>

        <!-- Honest indicator: basic animation vs real phoneme lip-sync -->
        <div class="lip-badge" [class.synced]="engine.phonemeSynced"
             [title]="engine.phonemeSynced
               ? 'Lip-sync phonétique (synchronisation réelle des lèvres)'
               : 'Animation de parole basique : mouvement et halo, sans synchronisation phonème des lèvres'">
          <span class="material-icons">{{ engine.phonemeSynced ? 'graphic_eq' : 'auto_awesome_motion' }}</span>
          <span>{{ engine.label }}</span>
        </div>
      </div>

      <div class="avatar-eq" [class.active]="state === 'speaking'" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .avatar-frame-box {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      background: radial-gradient(circle at 50% 32%, #10314F 0%, #0B1120 72%);
      width: 100%;
      aspect-ratio: 16/9;
      min-height: 300px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.16);
      border: 1px solid rgba(0, 119, 182, 0.2);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      --talk-amp: 0;
    }

    .avatar-frame-box:fullscreen,
    .avatar-frame-box:-webkit-full-screen {
      aspect-ratio: auto;
      height: 100vh;
      min-height: 100vh;
      border-radius: 0;
    }

    .native-avatar-bg {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(72, 202, 228, 0.12) 1px, transparent 1px);
      background-size: 22px 22px;
      opacity: 0.7;
    }

    .native-avatar-inner {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 24px;
    }

    .doctor-avatar-circle {
      position: relative;
      width: clamp(120px, 24vh, 190px);
      aspect-ratio: 1;
      border-radius: 50%;
      background: linear-gradient(135deg, #0077B6, #00B4D8);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: 0 0 0 8px rgba(72, 202, 228, 0.12), 0 18px 42px rgba(0, 180, 216, 0.35);
      animation: avatarFloat 4.5s ease-in-out infinite;
    }

    /* The preserved portrait image fills the circle without altering the face. */
    .doctor-portrait-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 22%;
      display: block;
      border-radius: 50%;
      position: relative;
      z-index: 1;
      user-select: none;
      -webkit-user-drag: none;
    }

    .fallback-avatar {
      font-size: clamp(56px, 12vh, 90px);
      color: #FFFFFF;
      position: relative;
      z-index: 1;
    }

    .viseme-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 3;
      pointer-events: none;
    }

    @keyframes avatarFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    /* Speaking → amplitude-driven motion (cosmetic; not lip-sync) */
    .avatar-frame-box.is-speaking .doctor-avatar-circle {
      animation: avatarSpeak 1.05s ease-in-out infinite;
    }

    @keyframes avatarSpeak {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-4px) scale(calc(1 + var(--talk-amp, 0) * 0.025)); }
    }

    .voice-halo {
      position: absolute;
      inset: -6%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(144, 224, 239, 0.55) 0%, rgba(144, 224, 239, 0) 62%);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 0;
      pointer-events: none;
    }

    .avatar-frame-box.is-speaking .voice-halo {
      opacity: calc(0.25 + var(--talk-amp, 0) * 0.65);
    }

    .pulse-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      width: clamp(120px, 24vh, 190px);
      height: clamp(120px, 24vh, 190px);
      border-radius: 50%;
      border: 2px solid rgba(72, 202, 228, 0.55);
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
      pointer-events: none;
      z-index: 2;
    }

    .avatar-frame-box.is-speaking .ring-1,
    .avatar-frame-box.is-speaking .ring-2 { animation: pulseRing 1.8s ease-out infinite; }
    .avatar-frame-box.is-speaking .ring-2 { animation-delay: 0.6s; }
    .avatar-frame-box.is-listening .ring-1,
    .avatar-frame-box.is-listening .ring-2 { border-color: rgba(248, 113, 113, 0.6); animation: pulseRing 1.8s ease-out infinite; }
    .avatar-frame-box.is-listening .ring-2 { animation-delay: 0.6s; }
    .avatar-frame-box.is-thinking .ring-1 { border-color: rgba(253, 224, 71, 0.6); animation: pulseRing 1.8s ease-out infinite; }

    @keyframes pulseRing {
      0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.6); }
    }

    .avatar-name-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(144, 224, 239, 0.35);
      color: #E6F7FF;
      font-size: 13px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 999px;
      backdrop-filter: blur(6px);
    }

    .avatar-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #34D399;
      animation: liveDot 1.8s ease-in-out infinite;
    }

    @keyframes liveDot {
      0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.55); }
      50% { box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
    }

    .avatar-live-status {
      color: #BFE7F5;
      font-size: 12.5px;
      letter-spacing: 0.2px;
      min-height: 18px;
    }

    .lip-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      color: #7FB3C8;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(127, 179, 200, 0.28);
      padding: 4px 10px;
      border-radius: 999px;
    }
    .lip-badge .material-icons { font-size: 13px; }
    .lip-badge.synced {
      color: #6EE7B7;
      border-color: rgba(110, 231, 183, 0.45);
      background: rgba(16, 185, 129, 0.12);
    }

    .avatar-eq {
      position: absolute;
      bottom: 18px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 26px;
      opacity: 0.25;
      transition: opacity 0.25s ease;
      z-index: 3;
    }

    .avatar-eq.active { opacity: 1; }

    .avatar-eq span {
      width: 4px;
      height: 8px;
      border-radius: 3px;
      background: linear-gradient(180deg, #90E0EF, #00B4D8);
    }

    .avatar-eq.active span { animation: eqBar 0.9s ease-in-out infinite; }

    .avatar-eq span:nth-child(1) { animation-delay: 0.05s; }
    .avatar-eq span:nth-child(2) { animation-delay: 0.2s; }
    .avatar-eq span:nth-child(3) { animation-delay: 0.35s; }
    .avatar-eq span:nth-child(4) { animation-delay: 0.5s; }
    .avatar-eq span:nth-child(5) { animation-delay: 0.3s; }
    .avatar-eq span:nth-child(6) { animation-delay: 0.15s; }
    .avatar-eq span:nth-child(7) { animation-delay: 0.45s; }

    @keyframes eqBar {
      0%, 100% { height: 8px; }
      50% { height: 24px; }
    }

    @media (max-width: 640px) {
      .avatar-frame-box { min-height: 240px; }
      .native-avatar-inner { gap: 8px; padding: 16px; }
      .avatar-live-status { font-size: 11.5px; }
      .lip-badge { font-size: 9.5px; }
    }

    @media (prefers-reduced-motion: reduce) {
      .doctor-avatar-circle,
      .avatar-frame-box.is-speaking .doctor-avatar-circle,
      .avatar-eq.active span { animation: none !important; }
    }
  `],
})
export class VirtualAvatarComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) imageSrc!: string;
  @Input() name = 'Dr. Virtuel';
  @Input() state: AvatarState = 'idle';

  @ViewChild('stage', { static: true }) private stage?: ElementRef<HTMLElement>;

  /** Injected engine if a real model is provided at the app root; else the basic one. */
  private readonly injected = inject(LIP_SYNC_ENGINE, { optional: true });
  readonly engine: LipSyncEngine = this.injected ?? new BasicMotionLipSyncEngine();

  imgFailed = false;
  private raf = 0;

  get statusText(): string {
    switch (this.state) {
      case 'thinking': return 'Réflexion clinique en cours…';
      case 'speaking': return 'Réponse vocale en cours…';
      case 'listening': return 'Je vous écoute…';
      default: return 'En ligne — prêt à vous conseiller';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state']) {
      if (this.state === 'speaking') {
        this.engine.start('', '');
        this.startLoop();
      } else {
        this.engine.stop();
        this.stopLoop();
      }
    }
  }

  ngOnDestroy(): void {
    this.engine.stop();
    this.stopLoop();
  }

  private startLoop(): void {
    this.stopLoop();
    const tick = (now: number) => {
      const el = this.stage?.nativeElement;
      if (el) {
        el.style.setProperty('--talk-amp', this.engine.frame(now).amplitude.toFixed(3));
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.stage?.nativeElement?.style.setProperty('--talk-amp', '0');
  }
}
