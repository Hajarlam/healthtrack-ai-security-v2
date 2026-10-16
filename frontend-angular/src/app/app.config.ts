import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
// import { LIP_SYNC_ENGINE } from './core/avatar/lip-sync-engine';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),

    // ---------------------------------------------------------------------
    // Avatar lip-sync engine (optional).
    // Un-comment and swap the factory below to install a REAL open-source
    // lip-sync model (SadTalker / Wav2Lip / MuseTalk / ONNX …) WITHOUT
    // touching the UI. When omitted, the free BasicMotionLipSyncEngine runs.
    //
    // { provide: LIP_SYNC_ENGINE, useFactory: () => new Wav2LipLipSyncEngine() },
    // ---------------------------------------------------------------------
  ]
};
