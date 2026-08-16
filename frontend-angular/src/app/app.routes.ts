import { Routes } from "@angular/router";
import { authGuard, adminGuard, doctorGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  { path: "", loadComponent: () => import("./features/landing/landing.component").then(m => m.LandingComponent), pathMatch: "full" },
  { path: "auth", loadChildren: () => import("./features/auth/auth.routes").then(m => m.authRoutes) },
  {
    path: "",
    loadComponent: () => import("./shared/components/layout/layout.component").then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: "dashboard",      loadComponent: () => import("./features/dashboard/dashboard.component").then(m => m.DashboardComponent) },
      { path: "health-records", loadComponent: () => import("./features/health-records/health-records.component").then(m => m.HealthRecordsComponent) },
      { path: "alerts",         loadComponent: () => import("./features/alerts/alerts.component").then(m => m.AlertsComponent) },
      { path: "chat",           loadComponent: () => import("./features/chat/chat.component").then(m => m.ChatComponent) },
      { path: "appointments",   loadComponent: () => import("./features/appointments/appointments.component").then(m => m.AppointmentsComponent) },
      { path: "medications",    loadComponent: () => import("./features/medications/medications.component").then(m => m.MedicationsComponent) },
      { path: "profile",        loadComponent: () => import("./features/profile/profile.component").then(m => m.ProfileComponent) },
      { path: "analyse-ia",     loadComponent: () => import("./features/ai-dashboard/ai-dashboard.component").then(m => m.AiDashboardComponent) },
      { path: "conseiller-virtuel", loadComponent: () => import("./features/ai-dashboard/ai-dashboard.component").then(m => m.AiDashboardComponent) },
      { path: "ocr-ordonnance", loadComponent: () => import("./features/ai-dashboard/ai-dashboard.component").then(m => m.AiDashboardComponent) },
      { path: "users",          loadComponent: () => import("./features/users/users.component").then(m => m.UsersComponent), canActivate: [adminGuard] },
      { path: "patients",       loadComponent: () => import("./features/patients/patients.component").then(m => m.PatientsComponent), canActivate: [doctorGuard] },
      { path: "security-audit", loadComponent: () => import("./features/security-audit/security-audit.component").then(m => m.SecurityAuditComponent), canActivate: [adminGuard] },
    ]
  },
  { path: "**", redirectTo: "/dashboard" }
];
