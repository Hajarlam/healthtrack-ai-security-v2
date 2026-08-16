# HealthTrack AI — Application Mobile Android

## Prérequis
- Android Studio Hedgehog (2023.1.1) ou plus récent
- Android SDK 34
- Java 17+
- Émulateur Android ou téléphone physique Android 7.0+

## Installation

1. Ouvrir **Android Studio**
2. **File → Open** → sélectionner le dossier `healthtrack-mobile`
3. Attendre la synchronisation Gradle
4. Lancer le backend Spring Boot sur le port 8085 (sur votre PC)

## Configuration réseau

Dans `app/src/main/java/com/healthtrack/mobile/api/ApiClient.java` :

```java
// Pour émulateur Android (10.0.2.2 = localhost de votre PC)
public static final String BASE_URL = "http://10.0.2.2:8085/api/";

// Pour téléphone physique (mettez l'IP de votre PC)
public static final String BASE_URL = "http://192.168.1.X:8085/api/";
```

## Lancer l'application

```
Run → Run 'app'  (ou Shift+F10)
```

## Fonctionnalités

| Écran | Description |
|---|---|
| Splash | Écran de démarrage avec redirection automatique |
| Login | Connexion avec boutons démo (Patient/Médecin/Admin) |
| Register | Inscription nouveau compte |
| Dashboard | Vue d'ensemble des constantes vitales + navigation |
| Nouvelle Mesure | Saisie tension, glycémie, SpO2, température... |
| Historique | Liste paginée des mesures passées |
| Alertes | Alertes de santé avec acquittement |
| Rendez-vous | Prise de RDV avec sélection médecin |
| Médicaments | Gestion des prescriptions |
| Profil | Informations du compte |
| SOS | Bouton d'urgence (notifie médecin + secours) |

## Comptes de test
- Patient : patient@healthtrack.ai / Patient@123
- Médecin : doctor@healthtrack.ai / Doctor@123
- Admin : admin@healthtrack.ai / Admin@123
