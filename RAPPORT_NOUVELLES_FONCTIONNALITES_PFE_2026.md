# 🏥 RAPPORT DES NOUVELLES FONCTIONNALITÉS & INNOVATIONS 2026
## Plateforme Clinique Intelligente & Sécurisée Sihati AI (HealthTrack)
**Projet de Fin d’Année — 2ème Année Cycle d'Ingénierie en Système d'Informatique**  
**Auteurs :** OUKMI Fatima zahra • MOUJTAHID Chaimae • LAMHARZI Hajar  
**Encadrant :** M. TABII Younes  
**Année Universitaire :** 2025 – 2026  

---

## 📑 TABLE DES MATIÈRES
1. [Introduction & Contexte Académique](#1-introduction--contexte-académique)
2. [Module 1 : Tableaux de Bord Enrichis Multi-Rôles](#2-module-1--tableaux-de-bord-enrichis-multi-rôles)
3. [Module 2 : Téléchargements et Exports Certifiés (RGPD & Sécurité)](#3-module-2--téléchargements-et-exports-certifiés-rgpd--sécurité)
4. [Module 3 : Messagerie Clinique Instantanée Multimodale (Photos & Émojis)](#4-module-3--messagerie-clinique-instantanée-multimodale-photos--émojis)
5. [Module 4 : Module OCR Multimodal d'Ordonnances Médicales Certifiées](#5-module-4--module-ocr-multimodal-dordonnances-médicales-certifiées)
6. [Module 5 : Espace Secours Urgentiste & Consultation Avatar WebRTC](#6-module-5--espace-secours-urgentiste--consultation-avatar-webrtc)
7. [Synthèse des Nouveaux Écrans & Figures pour le Rapport PFE](#7-synthèse-des-nouveaux-écrans--figures-pour-le-rapport-pfe)

---

## 1. Introduction & Contexte Académique

Dans le cadre de l'évolution de notre projet de fin d'année (PFE) portant sur la **conception et le développement d'une plateforme de santé connectée sécurisée intégrant l'intelligence artificielle**, de substantielles améliorations ergonomiques, fonctionnelles et sécuritaires ont été intégrées à l'architecture applicative (Front-End Angular 17+ et Back-End Spring Boot 3.3).

Ces nouvelles fonctionnalités répondent aux exigences formulées dans le cahier des charges initial tout en modernisant l'expérience utilisateur et en renforçant la conformité aux normes **RGPD** et de **sécurité des données de santé (HDS / OWASP ASVS)**.

---

## 2. Module 1 : Tableaux de Bord Enrichis Multi-Rôles

L'architecture Role-Based Access Control (RBAC) a été enrichie pour proposer des tableaux de bord spécifiques, dynamiques et interconnectés pour chaque acteur de la santé :

### 2.1. Tableau de Bord Patient (`/dashboard`)
* **Quatre indicateurs vitaux temps réel** :
  * 🩸 **Tension Artérielle** (Systolique/Diastolique, cible clinique 120/80 mmHg).
  * 💧 **Glycémie à jeun** (mg/dL, plage normale 70-110 mg/dL).
  * 🫁 **Saturation en O₂** (SpO₂ %, seuil optimal ≥ 95%).
  * 💓 **Fréquence Cardiaque** (BPM, repos 60-90 BPM).
* **Bilan Récent & Constantes Complémentaires** : Température corporelle (°C) et suivi du poids (kg).
* **Accès Rapide aux Services Sihati AI** : Raccourcis ergonomiques vers les mesures vitales, le pilulier, la messagerie, l'analyse prédictive et la téléconsultation.

### 2.2. Tableau de Bord Médecin Traitant (`/dashboard`)
* **Métriques de supervision** : Compteur de patients suivis, alertes critiques en attente d'examen et rendez-vous programmés.
* **Supervision des Patients Affectés** (`/patients`) :
  * Affichage exhaustif du dossier patient : **Nom & Prénom**, **Numéro de téléphone direct**, **Pathologies chroniques suivies** (ex: *Sara El Amrani - Hypertension modérée*, *Jean Martin - Diabète Type 2*, *Karim Tazi - Arythmie sinusale*).
  * Accès direct en un clic à l'historique complet des constantes et des bilans antérieurs.
* **Gestion des Demandes de Rendez-vous** : Validation ou annulation directe des consultations avec mise à jour synchrone de l'état.

### 2.3. Tableau de Bord Administrateur (`/dashboard`)
* **KPIs Globaux de la Plateforme** :
  * Utilisateurs inscrits dans le système.
  * Alertes générées par le moteur clinique.
  * Mesures de santé consolidées.
  * Rendez-vous médicaux globaux.
* **Supervision de l'état des comptes** : Répartition dynamique entre comptes actifs et comptes inactifs/suspendus.

---

## 3. Module 2 : Téléchargements et Exports Certifiés (RGPD & Sécurité)

### 3.1. Téléchargement du Journal d'Audit de Sécurité (`/security-audit`)
* **Conformité OWASP ASVS & RGPD** : Permet à l'administrateur et au délégué à la protection des données (DPO) d'exporter l'intégralité des traces d'audit de sécurité au format **JSON officiel certifié**.
* **Empreinte Cryptographique** : Horodatage universel ISO-8601 et signature d'intégrité logicielle garantissant l'inviolabilité des logs de connexion et d'accès aux données médicales.

### 3.2. Exportation des Données Personnelles Patient (Article 15 RGPD)
* Bouton d'exportation dédié permettant aux patients de récupérer l'ensemble de leurs informations de profil, de constantes et d'historique médical sous forme de document structuré, respectant le principe de portabilité des données.

---

## 4. Module 3 : Messagerie Clinique Instantanée Multimodale (Photos & Émojis)

Accessible via le menu **Messagerie** (`/chat`) :
* **Sélecteur d'Émojis Médicaux & Cliniques** : Interface intuitive permettant d'insérer des réactions rapides et des émojis adaptés à la communication soignant-soigné (💊, 🩺, 🩸, 👍, ✅...).
* **Partage Sécurisé de Photos & Documents** :
  * Possibilité de joindre des photographies médicales (lésions, documents de laboratoire, clichés) avec prévisualisation immédiate avant envoi.
  * Indicateur de taille et validation des formats acceptés (JPG, PNG).
* **Indicateurs d'Envoi et de Sécurité** : Horodatage précis, accusé de réception et chiffrement de bout en bout des échanges textuels et multimédias.

---

## 5. Module 4 : Module OCR Multimodal d'Ordonnances Médicales Certifiées

Situé dans l'espace **IA & Innovations** (`/analyse-ia` -> Onglet **Module 7.3 OCR**) :

### 5.1. Pipeline de Reconnaissance Optique & Multimodale Réelle
1. **Extraction Directe PDF (PDF.js / Mozilla pdfjs-dist)** :
   * Analyse native des flux textuels et coordonnées géométriques (Y-coordinate tracking) pour tous les fichiers PDF d'ordonnances (ordonnances informatisées de cabinets, cliniques ou hôpitaux).
   * Rendu graphique instantané de la première page en `<canvas>` pour prévisualisation visuelle haute fidélité avec effet de balayage laser vert en temps réel.
2. **Intelligence Multimodale Cloud (Google Gemini 2.5 / 1.5 Flash Vision)** :
   * Déchiffrement sémantique des manuscrits difficiles et ordonnances manuscrites complexes par analyse visuelle multimodale.
3. **Moteur OCR Client & Hybride (Tesseract.js fra+eng)** :
   * Analyse binarisée sur canvas haute définition pour les images ou les scans PDF sans couche texte numérique.
   * Analyseur contextuel pharmacologique intelligent : détection des noms de médicaments, dosages (`mg`, `g`, `ml`, `µg`...), formes galéniques et posologies associées (matin, midi, soir, fréquence journalière).

### 5.2. Fiche d'Extraction Médicale 100% Modifiable en Direct
* **Champs Éditables en Two-Way Binding** :
  * Nom réel du Médecin Prescripteur extrait du document.
  * Nom du Patient Identifié dans l'ordonnance.
  * Date d'émission exacte de l'ordonnance.
  * Liste complète des Médicaments et Posologies journalières individuelles.
* **Ajout & Suppression Dynamique** : Bouton `+ Ajouter un médicament` et icône de suppression par ligne pour ajustement direct avant enregistrement.

### 5.4. Export PDF Certifié & Enregistrement dans le Pilulier
* **Bouton « Exporter PDF Certifié »** : Génère un document médical officiel prêt à l'impression avec sceau numérique, identifiant d'intégrité et mise en page soignée.
* **Bouton « Enregistrer dans mes médicaments »** :
  * Sauvegarde instantanée de tous les médicaments extraits dans le service de gestion thérapeutique (`MedicationService`).
  * Redirection automatique immédiate vers la page **Gestion des Médicaments** (`/medications`), où tous les traitements numérisés s'affichent instantanément dans le pilulier du patient.

---

## 6. Module 5 : Espace Secours Urgentiste & Consultation Avatar WebRTC

### 6.1. Rôle et Espace Dédié Urgentiste (`/emergency`)
* Conçu pour les services de premiers secours (SAMU, Protection Civile).
* Consultation immédiate en **lecture seule sécurisée** : groupe sanguin, allergies critiques, constantes en temps réel et contacts d'urgence.

### 6.2. Téléconsultation Interactive par Avatar Médical IA
* Intégration fluide de l'avatar médical interactif en WebRTC temps réel (`https://app.liveavatar.com/fc9c1f9f-bc99-4fd9-a6b2-8b4b5669a046`).
* Interface d'accueil visuelle et rassurante permettant de poser des questions de santé et de recevoir des conseils de prévention personnalisés.

---

## 7. Synthèse des Nouveaux Écrans & Figures pour le Rapport PFE

Pour intégration directe dans les chapitres du rapport académique de 57 pages :

| N° Figure | Titre de l'Écran / Illustration | Chapitre PFE Correspondant |
|---|---|---|
| **Fig. 4.1** | Tableau de bord patient enrichi avec 4 constantes vitales temps réel | Chapitre 4 : Réalisation & Interfaces Utilisateur |
| **Fig. 4.2** | Tableau de bord médecin : suivi des patients et validation des RDV | Chapitre 4 : Espace Professionnel de Santé |
| **Fig. 4.3** | Portail de gestion des patients avec pathologies chroniques et téléphones | Chapitre 4 : Gestion Dossier Médical Électronique |
| **Fig. 4.4** | Tableau de bord Administrateur & Audit de sécurité conforme RGPD | Chapitre 5 : Sécurité, Confidentialité & RGPD |
| **Fig. 4.5** | Messagerie clinique enrichie avec partage de photos et émojis | Chapitre 4 : Télémédecine & Messagerie Sécurisée |
| **Fig. 4.6** | Module OCR Multimodal : Extraction, édition en direct et certification PDF | Chapitre 4 : Intelligence Artificielle & OCR d'Ordonnances |
| **Fig. 4.7** | Synchronisation automatique de l'ordonnance vers le pilulier patient | Chapitre 4 : Module Thérapeutique & Rappels Médicamenteux |
| **Fig. 4.8** | Portail Secours Urgentiste et Téléconsultation Avatar WebRTC | Chapitre 4 : Module Urgences & Innovations WebRTC |

---
*Document certifié conforme à la version finale 2026 du projet Sihati AI (HealthTrack).*
