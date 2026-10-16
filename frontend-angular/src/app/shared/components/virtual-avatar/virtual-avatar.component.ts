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
 * Renders the clinical office avatar image in full 16:9 view and animates it
 * naturally while the AI speaks out loud.
 * 100% free, no external iframe or credits required.
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

      <!-- Full Clinic Doctor Photo -->
      <div class="clinic-stage-bg">
        @if (!imgFailed) {
          <img class="clinic-doctor-photo"
               [src]="imageSrc"
               [alt]="name"
               loading="eager"
               decoding="async"
               (error)="imgFailed = true" />
        } @else {
          <div class="fallback-stage">
            <span class="material-icons fallback-icon">support_agent</span>
            <p>{{ name }} &bull; Conseillère Médicale IA</p>
          </div>
        }
      </div>

      <!-- Speaking Waves & Halo Overlay on Doctor -->
      @if (state === 'speaking') {
        <div class="sound-halo-container" aria-hidden="true">
          <span class="sound-ring ring-1"></span>
          <span class="sound-ring ring-2"></span>
          <span class="sound-ring ring-3"></span>
        </div>
      }

      <!-- Overlay Badges at the bottom of the stage -->
      <div class="stage-overlay-bottom">
        <div class="avatar-status-pill" [class.speaking]="state === 'speaking'" [class.listening]="state === 'listening'">
          <span class="status-dot"></span>
          <span class="status-txt">{{ statusText }}</span>
        </div>

        <div class="avatar-eq" [class.active]="state === 'speaking'" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .avatar-frame-box {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      background: #0B1120;
      width: 100%;
      aspect-ratio: 16/9;
      min-height: 280px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.16);
      border: 2px solid rgba(0, 119, 182, 0.2);
      margin-bottom: 20px;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      --talk-amp: 0;
    }

    .avatar-frame-box:fullscreen,
    .avatar-frame-box:-webkit-full-screen {
      aspect-ratio: auto;
      height: 100vh;
      min-height: 100vh;
      border-radius: 0;
      border: none;
    }

    .avatar-frame-box.is-speaking {
      border-color: #10B981;
      box-shadow: 0 12px 40px rgba(16, 185, 129, 0.25);
    }

    .avatar-frame-box.is-listening {
      border-color: #EF4444;
      box-shadow: 0 12px 40px rgba(239, 68, 68, 0.25);
    }

    .clinic-stage-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .clinic-doctor-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
      display: block;
      user-select: none;
      -webkit-user-drag: none;
      transition: transform 0.25s ease, filter 0.25s ease;
    }

    .avatar-frame-box.is-speaking .clinic-doctor-photo {
      transform: scale(calc(1 + var(--talk-amp, 0) * 0.02));
      filter: brightness(1.04);
    }

    .fallback-stage {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 32%, #10314F 0%, #0B1120 72%);
      color: #FFFFFF;
      gap: 12px;
    }

    .fallback-icon {
      font-size: 72px;
      color: #38BDF8;
    }

    .sound-halo-container {
      position: absolute;
      top: 40%;
      left: 47%;
      transform: translate(-50%, -50%);
      width: 140px;
      height: 140px;
      pointer-events: none;
      z-index: 2;
    }

    .sound-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid rgba(16, 185, 129, 0.65);
      animation: soundRingExpand 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }
    .sound-ring.ring-2 { animation-delay: 0.6s; }
    .sound-ring.ring-3 { animation-delay: 1.2s; }

    @keyframes soundRingExpand {
      0% { transform: scale(0.6); opacity: 0.85; }
      100% { transform: scale(2.4); opacity: 0; }
    }

    .stage-overlay-bottom {
      position: absolute;
      bottom: 14px;
      left: 18px;
      right: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      z-index: 5;
      pointer-events: none;
    }

    .avatar-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #FFFFFF;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      transition: all 0.2s ease;
    }

    .avatar-status-pill.speaking {
      background: rgba(5, 150, 105, 0.92);
      border-color: rgba(52, 211, 153, 0.6);
    }

    .avatar-status-pill.listening {
      background: rgba(220, 38, 38, 0.92);
      border-color: rgba(248, 113, 113, 0.6);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 6px #10B981;
    }
    .speaking .status-dot { background: #34D399; box-shadow: 0 0 8px #34D399; }
    .listening .status-dot { background: #F87171; box-shadow: 0 0 8px #F87171; }

    .avatar-eq {
      display: inline-flex;
      align-items: flex-end;
      gap: 3px;
      height: 22px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      padding: 4px 10px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .avatar-eq span {
      width: 3px;
      height: 6px;
      background: #94A3B8;
      border-radius: 2px;
      transition: height 0.15s ease;
    }

    .avatar-eq.active span {
      background: #10B981;
      animation: eqBar 0.8s ease-in-out infinite alternate;
    }
    .avatar-eq.active span:nth-child(1) { animation-delay: 0.1s; }
    .avatar-eq.active span:nth-child(2) { animation-delay: 0.25s; }
    .avatar-eq.active span:nth-child(3) { animation-delay: 0.4s; }
    .avatar-eq.active span:nth-child(4) { animation-delay: 0.15s; }
    .avatar-eq.active span:nth-child(5) { animation-delay: 0.35s; }
    .avatar-eq.active span:nth-child(6) { animation-delay: 0.2s; }
    .avatar-eq.active span:nth-child(7) { animation-delay: 0.3s; }

    @keyframes eqBar {
      0% { height: 4px; }
      100% { height: 18px; }
    }

    @media (prefers-reduced-motion: reduce) {
      .clinic-doctor-photo,
      .avatar-eq.active span,
      .sound-ring { animation: none !important; }
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
      case 'speaking': return `${this.name} s'exprime à voix haute…`;
      case 'listening': return `${this.name} écoute votre voix…`;
      default: return `${this.name} • Cabinet Médical Ouvert`;
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
