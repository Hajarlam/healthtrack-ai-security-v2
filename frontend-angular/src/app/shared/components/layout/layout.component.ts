import { Component, OnInit, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatIconModule, MatButtonModule, MatBadgeModule],
  template: `
  <div class="shell">
    <!-- Backdrop Overlay for Mobile Drawer -->
    @if (!collapsed() && isMobile()) {
      <div class="drawer-backdrop" (click)="collapsed.set(true)"></div>
    }

    <!-- Sidebar -->
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="sb-brand">
        <div class="sb-logo">
          <img src="assets/logo.svg" alt="Sihati AI" style="width: 34px; height: 34px; object-fit: contain;">
        </div>
        @if (!collapsed() || isMobile()) {
          <div style="display: flex; align-items: center; gap: 7px;">
            <span class="sb-name" style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF;">Sihati</span>
            <span class="sb-ai" style="background: #00B4D8; color: #003049; border-radius: 6px; font-size: 10px; font-weight: 900; padding: 2px 7px; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0, 180, 216, 0.4); margin-left: 0;">AI</span>
          </div>
        }
      </div>

      @if (!collapsed() || isMobile()) {
        <div class="sb-user">
          <div class="sb-avatar">{{initials()}}</div>
          <div class="sb-user-info">
            <span class="sb-uname">{{auth.currentUser()?.firstName}} {{auth.currentUser()?.lastName}}</span>
            <span class="sb-urole">{{auth.getRole() === 'EMERGENCY' ? 'URGENTISTE (SECOURS)' : auth.getRole()}}</span>
          </div>
        </div>
      }

      <nav class="sb-nav">
        @for (item of navItemsFiltered; track item.route) {
          <a class="sb-link" [routerLink]="item.route" routerLinkActive="sb-active" [title]="item.label" (click)="onNavClick()">
            <span class="material-icons sb-link-icon">{{item.icon}}</span>
            @if (!collapsed() || isMobile()) { <span>{{item.label}}</span> }
            @if (item.route === '/alerts' && alertCount() > 0) {
              <span class="sb-badge">{{alertCount()}}</span>
            }
            @if (item.route === '/chat' && chatService.unreadCount() > 0) {
              <span class="sb-badge" style="background: #F59E0B; color: #FFFFFF;">{{chatService.unreadCount()}}</span>
            }
          </a>
        }
      </nav>

      <div class="sb-footer">
        <a class="sb-link" routerLink="/profile" routerLinkActive="sb-active" title="Mon Profil" (click)="onNavClick()">
          <span class="material-icons sb-link-icon">manage_accounts</span>
          @if (!collapsed() || isMobile()) { <span>Mon Profil</span> }
        </a>
        <button class="sb-link sb-logout" (click)="auth.logout()" title="Déconnexion">
          <span class="material-icons sb-link-icon">logout</span>
          @if (!collapsed() || isMobile()) { <span>Déconnexion</span> }
        </button>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="main-area">
      <header class="topbar">
        <button class="toggle-btn" (click)="collapsed.set(!collapsed())" title="Basculer le menu">
          <span class="material-icons">{{collapsed() ? 'menu' : (isMobile() ? 'close' : 'menu_open')}}</span>
        </button>

        @if (collapsed() || isMobile()) {
          <div style="display: flex; align-items: center; gap: 8px; margin-left: 4px; overflow: hidden;">
            <img src="assets/logo.svg" alt="Sihati AI" style="width: 26px; height: 26px; object-fit: contain; flex-shrink: 0;">
            <span class="topbar-title" style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 17px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, #023E58 30%, #0077B6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Sihati</span>
            <span style="background: linear-gradient(135deg, #0077B6, #0096C7); color: white; border-radius: 6px; font-size: 9px; font-weight: 900; padding: 2px 6px; letter-spacing: 0.5px; box-shadow: 0 2px 6px rgba(0, 119, 182, 0.2); flex-shrink: 0;">AI</span>
          </div>
        } @else {
          <div style="display: flex; align-items: center; gap: 8px; margin-left: 8px; overflow: hidden;">
            <span class="topbar-title" style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 16px; font-weight: 700; color: #023E58; letter-spacing: -0.3px;">Plateforme Médicale Intelligente</span>
            <span class="topbar-subtitle-badge" style="background: #E0F2FE; color: #0284C7; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; border: 1px solid #BAE6FD; white-space: nowrap;">IA V2.0</span>
          </div>
        }
        <span style="flex:1"></span>
        <button class="icon-btn" routerLink="/chat" title="Messagerie">
          <span class="material-icons">chat</span>
          @if (chatService.unreadCount() > 0) {
            <span class="topbar-badge msg">{{chatService.unreadCount()}}</span>
          }
        </button>
        <button class="icon-btn" routerLink="/alerts" title="Alertes">
          <span class="material-icons">notifications</span>
          @if (alertCount() > 0) {
            <span class="topbar-badge">{{alertCount()}}</span>
          }
        </button>
        <div class="topbar-avatar" routerLink="/profile" title="Mon Profil">{{initials()}}</div>
      </header>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  </div>
  `,
  styles: [`
  :host{display:block;height:100vh;}
  .shell{display:flex;height:100vh;overflow:hidden;position:relative;}

  /* Sidebar */
  .sidebar{
    width:260px;min-width:260px;
    background:linear-gradient(180deg, #005F8E 0%, #0077B6 50%, #0096C7 100%);
    display:flex;flex-direction:column;transition:width .25s cubic-bezier(0.4,0,0.2,1),min-width .25s cubic-bezier(0.4,0,0.2,1);overflow:hidden;
  }
  .sidebar.collapsed{width:64px;min-width:64px;}
  .sb-brand{display:flex;align-items:center;gap:10px;padding:20px 14px 14px;border-bottom:1px solid rgba(255,255,255,.15);}
  .sb-logo{width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:transparent;border:none;}
  .sb-logo .material-icons{font-size:22px;color:#FFF;}
  .sb-name{font-size:16px;font-weight:800;color:white;white-space:nowrap;}
  .sb-ai{background:#00B4D8;color:#003049;border-radius:4px;font-size:10px;font-weight:800;padding:1px 5px;margin-left:4px;}
  .sb-user{display:flex;align-items:center;gap:10px;padding:12px 14px;margin:8px;background:rgba(255,255,255,.1);border-radius:10px;}
  .sb-avatar{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#FFF;flex-shrink:0;border:1px solid rgba(255,255,255,.3);}
  .sb-uname{font-size:12px;font-weight:700;color:white;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;}
  .sb-urole{font-size:10px;color:rgba(255,255,255,.6);}
  .sb-nav{padding:8px;flex:1;overflow-y:auto;}
  .sb-link{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;color:rgba(255,255,255,.8);text-decoration:none;font-size:13px;font-weight:500;transition:all .15s;margin-bottom:2px;white-space:nowrap;background:none;border:none;width:100%;cursor:pointer;font-family:inherit;}
  .sb-link:hover{background:rgba(255,255,255,.12);color:white;}
  .sb-active{background:rgba(255,255,255,.2)!important;color:#FFF!important;font-weight:700;border-left:3px solid #00B4D8;}
  .sb-link-icon{font-size:20px;flex-shrink:0;}
  .sb-badge{margin-left:auto;background:#00B4D8;color:#003049;border-radius:10px;font-size:10px;font-weight:700;padding:1px 6px;flex-shrink:0;}
  .sb-footer{padding:8px;border-top:1px solid rgba(255,255,255,.15);}
  .sb-logout:hover{background:rgba(255,80,80,.2)!important;color:#ff6b6b!important;}

  /* Topbar */
  .main-area{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .topbar{display:flex;align-items:center;gap:10px;padding:0 20px;height:60px;background:white;box-shadow:0 2px 8px rgba(0,119,182,.08);border-bottom:2px solid #C0DEE9;flex-shrink:0;}
  .toggle-btn{background:none;border:none;cursor:pointer;border-radius:8px;padding:8px;display:flex;align-items:center;justify-content:center;color:#023E58;min-width:38px;min-height:38px;}
  .toggle-btn:hover{background:#CAF0F8;}
  .toggle-btn .material-icons{font-size:22px;}
  .topbar-title{font-size:17px;font-weight:800;color:#023E58;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .icon-btn{background:none;border:none;cursor:pointer;border-radius:8px;padding:8px;display:flex;align-items:center;justify-content:center;color:#023E58;position:relative;min-width:38px;min-height:38px;}
  .icon-btn:hover{background:#CAF0F8;}
  .icon-btn .material-icons{font-size:22px;}
  .topbar-badge{position:absolute;top:2px;right:2px;background:#EF4444;color:white;border-radius:10px;font-size:10px;font-weight:800;padding:1px 5px;line-height:1.2;box-shadow:0 2px 6px rgba(239,68,68,.4);border:1.5px solid #FFFFFF;}
  .topbar-badge.msg{background:#F59E0B;box-shadow:0 2px 6px rgba(245,158,11,.4);}
  .topbar-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#0077B6,#00B4D8);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;cursor:pointer;margin-left:4px;flex-shrink:0;}
  .content{flex:1;overflow-y:auto;background:#F4FAFD;padding:24px;}

  /* Mobile & Tablet Off-Canvas Drawer Rules */
  @media(max-width:768px){
    .drawer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(2, 62, 88, 0.45);
      backdrop-filter: blur(2px);
      z-index: 998;
      animation: fadeInBackdrop .2s ease-out;
    }
    @keyframes fadeInBackdrop {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .sidebar {
      position: fixed !important;
      top: 0;
      bottom: 0;
      left: 0;
      width: 280px !important;
      min-width: 280px !important;
      z-index: 999;
      box-shadow: 6px 0 28px rgba(0, 0, 0, 0.3);
      transform: translateX(0);
      transition: transform .25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.collapsed {
      width: 280px !important;
      min-width: 280px !important;
      transform: translateX(-100%);
      pointer-events: none;
    }
    .main-area {
      width: 100vw;
      max-width: 100vw;
    }
    .topbar {
      padding: 0 12px;
      height: 56px;
      gap: 6px;
    }
    .topbar-title {
      font-size: 15px !important;
      max-width: 140px;
    }
    .topbar-subtitle-badge {
      display: none !important;
    }
    .content {
      padding: 14px 10px;
    }
  }

  @media(max-width:360px){
    .topbar {
      padding: 0 8px;
      gap: 4px;
    }
    .topbar-title {
      font-size: 14px !important;
      max-width: 110px;
    }
    .icon-btn, .toggle-btn {
      padding: 6px;
      min-width: 34px;
      min-height: 34px;
    }
    .content {
      padding: 10px 8px;
    }
  }
  `]
})
export class LayoutComponent implements OnInit {
  isMobile = signal(typeof window !== 'undefined' && window.innerWidth <= 768);
  collapsed = signal(typeof window !== 'undefined' && window.innerWidth <= 768);
  alertCount = signal(0);
  private wasMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      const mobile = window.innerWidth <= 768;
      this.isMobile.set(mobile);
      if (mobile && !this.wasMobile) {
        this.collapsed.set(true);
      }
      this.wasMobile = mobile;
    }
  }

  onNavClick() {
    if (this.isMobile()) {
      this.collapsed.set(true);
    }
  }

  get navItemsFiltered() {
    if (this.auth.isAdmin()) {
      return [
        {label:'Tableau de bord', icon:'dashboard',       route:'/dashboard'},
        {label:'Utilisateurs',    icon:'manage_accounts',  route:'/users'},
        {label:'Sécurité & Audit',icon:'security',         route:'/security-audit'},
      ];
    } else if (this.auth.isDoctor()) {
      return [
        {label:'Tableau de bord', icon:'dashboard',       route:'/dashboard'},
        {label:'Mes Patients',    icon:'people',          route:'/patients'},
        {label:'Alertes',         icon:'notifications',   route:'/alerts'},
        {label:'Messages',        icon:'chat',            route:'/chat'},
        {label:'Rendez-vous',     icon:'calendar_today',  route:'/appointments'},
        {label:'Prescriptions',   icon:'medication',      route:'/medications'},
      ];
    } else if (this.auth.isEmergency()) {
      return [
        {label:'Tableau de bord',  icon:'dashboard',     route:'/dashboard'},
        {label:'Portail Urgences', icon:'crisis_alert',  route:'/emergency'},
        {label:'Alertes Actives',  icon:'notifications', route:'/alerts'},
      ];
    } else {
      return [
        {label:'Tableau de bord', icon:'dashboard',       route:'/dashboard'},
        {label:'Mes Constantes',  icon:'favorite',        route:'/health-records'},
        {label:'Alertes',         icon:'notifications',   route:'/alerts'},
        {label:'Messages',        icon:'chat',            route:'/chat'},
        {label:'Rendez-vous',     icon:'calendar_today',  route:'/appointments'},
        {label:'Médicaments',     icon:'medication',      route:'/medications'},
        {label:'Analyse IA',      icon:'analytics',       route:'/analyse-ia'},
        {label:'Conseiller Virtuel AI', icon:'face',      route:'/conseiller-virtuel'},
        {label:'OCR Ordonnance',  icon:'document_scanner', route:'/ocr-ordonnance'},
      ];
    }
  }

  constructor(public auth: AuthService, private http: HttpClient, public chatService: ChatService) {}

  ngOnInit() {
    setInterval(() => this.loadCounts(), 30000);
    this.loadCounts();
  }

  loadCounts() {
    this.http.get<number>(`${environment.apiUrl}/alerts/count`).subscribe({next: n => this.alertCount.set(n), error:()=>{}});
    this.chatService.refreshUnreadCount();
  }

  initials(): string {
    const u = this.auth.currentUser();
    if (!u) return 'S';
    return `${u.firstName?.[0]||''}${u.lastName?.[0]||''}`.toUpperCase();
  }
}

