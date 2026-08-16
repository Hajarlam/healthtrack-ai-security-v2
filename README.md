# HealthTrack AI — Projet Complet
## Backend + Frontend Angular + Mobile Android

---

## Structure du projet
```
healthtrack-final/
├── backend/              → Spring Boot 3 (port 8085)
├── frontend-angular/     → Angular 17 (port 4200)
└── mobile-android/       → Android natif (Java)
```

---

## LANCEMENT RAPIDE

### Étape 1 — Backend Spring Boot
```cmd
cd backend
mvn clean spring-boot:run
```
✅ Démarre sur http://localhost:8085/api
📋 Swagger UI → http://localhost:8085/api/swagger-ui.html
🗄️ H2 Console → http://localhost:8085/api/h2-console

### Étape 2 — Frontend Angular
```cmd
cd frontend-angular
npm install
npm start
```
✅ Démarre sur http://localhost:4200

### Étape 3 — Mobile Android
1. Ouvrir Android Studio
2. File → Open → sélectionner le dossier `mobile-android`
3. Attendre la synchronisation Gradle
4. Run → Run 'app' (Shift+F10)

---

## Comptes de test (créés automatiquement)
| Rôle    | Email                     | Mot de passe |
|---------|---------------------------|--------------|
| Admin   | admin@healthtrack.ai      | Admin@123    |
| Médecin | doctor@healthtrack.ai     | Doctor@123   |
| Patient | patient@healthtrack.ai    | Patient@123  |

---

## Communication Backend ↔ Frontend
Le frontend Angular communique avec le backend via :
- **REST API** : http://localhost:8085/api
- **WebSocket** : ws://localhost:8085/api/ws
- **JWT Token** dans le header `Authorization: Bearer <token>`

## Communication Backend ↔ Mobile Android
```java
// Émulateur Android → 10.0.2.2 = localhost du PC
BASE_URL = "http://10.0.2.2:8085/api/"

// Téléphone physique → IP de votre PC
BASE_URL = "http://192.168.X.X:8085/api/"
```

---

## Mode MySQL (optionnel)
Si vous avez WAMP/XAMPP, créez la base `healthtrack_db` dans PhpMyAdmin puis :
```cmd
cd backend
mvn spring-boot:run -Dspring.profiles.active=mysql
```

---

## APIs principales
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/auth/login | Connexion |
| POST | /api/auth/register | Inscription |
| GET | /api/health-records | Constantes de santé |
| POST | /api/health-records | Ajouter une mesure |
| GET | /api/health-records/latest | Dernière mesure |
| GET | /api/alerts | Alertes |
| PATCH | /api/alerts/{id}/acknowledge | Acquitter alerte |
| GET | /api/alerts/count | Nb alertes actives |
| GET | /api/appointments | Rendez-vous |
| POST | /api/appointments | Prendre RDV |
| GET | /api/medications | Médicaments |
| POST | /api/medications | Ajouter médicament |
| GET | /api/users/me | Mon profil |
| GET | /api/users/doctors | Liste médecins |
| GET | /api/messages/{userId} | Conversation |
| POST | /api/messages/{userId} | Envoyer message |

---

## Test rapide API (cmd Windows)
```cmd
curl -X POST http://localhost:8085/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"patient@healthtrack.ai\",\"password\":\"Patient@123\"}"
```
