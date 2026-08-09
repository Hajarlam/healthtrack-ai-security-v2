# HealthTrack AI — Frontend Angular 17

## Installation et lancement

```cmd
cd healthtrack-angular
npm install
npm start
```
→ http://localhost:4200

## Pages disponibles
| Page | URL | Description |
|---|---|---|
| Login | /auth/login | Connexion avec comptes démo |
| Register | /auth/register | Inscription |
| Dashboard | /dashboard | Vue d'ensemble + alertes |
| Constantes | /health-records | Saisie et historique |
| Alertes | /alerts | Gestion des alertes |
| Rendez-vous | /appointments | Prise de RDV médecin |
| Médicaments | /medications | Ordonnances |
| Profil | /profile | Informations personnelles |

## Configuration API
Dans `src/environments/environment.ts` :
```typescript
apiUrl: 'http://localhost:8080/api'
```
Le backend Spring Boot doit tourner sur le port 8080.

## Comptes démo (boutons sur la page login)
- Patient : patient@healthtrack.ai / Patient@123
- Médecin : doctor@healthtrack.ai / Doctor@123
- Admin : admin@healthtrack.ai / Admin@123
