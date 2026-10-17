import os
from PIL import Image, ImageDraw, ImageFont

def get_font(size, bold=False):
    f_name = 'arialbd.ttf' if bold else 'arial.ttf'
    path = os.path.join(r'C:\Windows\Fonts', f_name)
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()

os.makedirs('report_assets', exist_ok=True)

# ==========================================
# 1. FIG 11: OCR PRESCRIPTION SCREEN
# ==========================================
def make_ocr_screen(out_path):
    w, h = 1280, 720
    im = Image.new('RGB', (w, h), (248, 250, 252))
    d = ImageDraw.Draw(im)

    # Navbar
    d.rectangle([0, 0, w, 56], fill=(2, 62, 88))
    d.text((24, 16), 'Sihati AI', fill=(255, 255, 255), font=get_font(20, True))
    d.text((130, 18), 'Plateforme Médicale Intelligente • IA V2.0 Multimodale', fill=(186, 230, 253), font=get_font(14))
    d.text((w - 240, 18), 'Patient : Sara El Amrani', fill=(255, 255, 255), font=get_font(14, True))

    # Subnav
    d.rectangle([24, 72, w - 24, 118], fill=(255, 255, 255), outline=(226, 232, 240))
    d.text((40, 86), 'MODULE 7.3 — EXTRACTION D\'ORDONNANCES & NUMÉRISATION CERTIFIÉE', fill=(2, 62, 88), font=get_font(13, True))
    d.rounded_rectangle([w - 240, 80, w - 40, 110], radius=8, fill=(224, 242, 254), outline=(186, 230, 253))
    d.text((w - 225, 87), 'EXTRACTION CERTIFIÉE ✓', fill=(3, 105, 161), font=get_font(12, True))

    # Paper Card
    d.rounded_rectangle([24, 134, w - 24, h - 18], radius=16, fill=(255, 255, 255), outline=(203, 213, 225), width=2)

    # Header in card
    d.rectangle([26, 136, w - 26, 190], fill=(240, 249, 255))
    d.text((44, 148), 'ORDONNANCE NUMÉRISÉE SIHATI AI • RÉPUBLIQUE CLINIQUE', fill=(2, 132, 199), font=get_font(17, True))
    d.text((44, 170), 'Déchiffrement IA Multimodal (Gemini 2.5 Flash + Tesseract HD + Classificateur Visuel Canvas)', fill=(100, 116, 139), font=get_font(12))

    # Quick selector buttons
    d.rounded_rectangle([44, 202, 350, 234], radius=8, fill=(2, 132, 199))
    d.text((54, 210), '📄 Profil Imprimée (Kardégic, Triatec...)', fill=(255, 255, 255), font=get_font(12, True))

    d.rounded_rectangle([360, 202, 680, 234], radius=8, fill=(241, 245, 249), outline=(203, 213, 225))
    d.text((370, 210), '✍️ Profil Manuscrite (Doliprane, Augmentin...)', fill=(51, 65, 85), font=get_font(12, True))

    d.rounded_rectangle([690, 202, 970, 234], radius=8, fill=(241, 245, 249), outline=(203, 213, 225))
    d.text((700, 210), '💊 Douleurs & Fièvre (Doliprane + Spasfon)', fill=(51, 65, 85), font=get_font(12, True))

    # Doctor and Patient Boxes
    d.rounded_rectangle([44, 246, 580, 316], radius=10, fill=(248, 250, 252), outline=(226, 232, 240))
    d.text((56, 254), 'MÉDECIN PRESCRIPTEUR', fill=(100, 116, 139), font=get_font(11, True))
    d.text((56, 272), 'Dr Julien G. (Médecin généraliste)', fill=(15, 23, 42), font=get_font(15, True))
    d.text((56, 296), 'Praticien conventionné • Consultation Médicale', fill=(71, 85, 105), font=get_font(12))

    d.rounded_rectangle([600, 246, w - 44, 316], radius=10, fill=(248, 250, 252), outline=(226, 232, 240))
    d.text((612, 254), 'PATIENT(E) IDENTIFIÉ(E)', fill=(100, 116, 139), font=get_font(11, True))
    d.text((612, 272), 'Éric R. (né le 25 juillet 1963, 92 kg, 1,76 m)', fill=(15, 23, 42), font=get_font(15, True))
    d.text((612, 296), 'Date d\'émission : 01/10/2024 • Traitement pour 3 mois', fill=(71, 85, 105), font=get_font(12))

    # Table Header
    d.rounded_rectangle([44, 330, w - 44, 362], radius=6, fill=(241, 245, 249))
    d.text((56, 338), 'MÉDICAMENT & FORME PHARMACEUTIQUE', fill=(71, 85, 105), font=get_font(12, True))
    d.text((550, 338), 'POSOLOGIE & FRÉQUENCE JOURNALIÈRE', fill=(71, 85, 105), font=get_font(12, True))
    d.text((w - 120, 338), 'VALIDATION', fill=(71, 85, 105), font=get_font(12, True))

    # Med rows
    meds = [
        ('Acétylsalicylate de lysine (Kardégic) 75 mg', '1 sachet à 12 h au déjeuner (Antiagrégant plaquettaire)'),
        ('Ramipril (Triatec) 10 mg', '1 comprimé par jour le matin (Antihypertenseur IEC)'),
        ('Sitagliptine-metformine (Velmetia) 50 mg/1000 mg', '1 comprimé matin et soir au cours des repas (Antidiabétique)'),
        ('Atorvastatine (Tahor) 10 mg', '1 comprimé par jour le soir (Hypolipémiant - Cholestérol)'),
        ('Amoxicilline 1 g', '1 comprimé 2 fois par jour pendant 10 jours (Antibiotique)')
    ]
    y = 370
    for i, (m_name, m_dose) in enumerate(meds):
        bg = (255, 255, 255) if i % 2 == 0 else (248, 250, 252)
        d.rectangle([44, y, w - 44, y + 36], fill=bg, outline=(241, 245, 249))
        d.text((56, y + 8), f'💊 {m_name}', fill=(15, 23, 42), font=get_font(13, True))
        d.text((550, y + 8), f'⏱️ {m_dose}', fill=(51, 65, 85), font=get_font(13))
        d.text((w - 120, y + 8), '✓ Certifié', fill=(16, 185, 129), font=get_font(12, True))
        y += 37

    # Footer Actions
    d.rounded_rectangle([44, y + 20, 260, y + 60], radius=10, fill=(2, 132, 199))
    d.text((64, y + 32), '📄 Exporter PDF Certifié', fill=(255, 255, 255), font=get_font(13, True))

    d.rounded_rectangle([280, y + 20, 600, y + 60], radius=10, fill=(16, 185, 129))
    d.text((298, y + 32), '💾 Enregistrer dans mes médicaments (Sync Pilulier)', fill=(255, 255, 255), font=get_font(13, True))

    d.text((630, y + 33), '🔒 Conforme HDS & RGPD • Sceau numérique SHA-256 garanti', fill=(100, 116, 139), font=get_font(12))

    im.save(out_path, quality=95)
    print('Created:', out_path)

# ==========================================
# 2. FIG 13: CHAT WITH PHOTOS & EMOJIS
# ==========================================
def make_chat_screen(out_path):
    w, h = 1280, 720
    im = Image.new('RGB', (w, h), (248, 250, 252))
    d = ImageDraw.Draw(im)

    # Navbar
    d.rectangle([0, 0, w, 56], fill=(2, 62, 88))
    d.text((24, 16), 'Sihati AI', fill=(255, 255, 255), font=get_font(20, True))
    d.text((130, 18), 'Messagerie Sécurisée • Chiffrement de bout en bout', fill=(186, 230, 253), font=get_font(14))

    # Chat layout
    # Left sidebar contacts
    d.rectangle([24, 76, 320, h - 20], fill=(255, 255, 255), outline=(226, 232, 240))
    d.text((40, 96), 'Discussions Médicales', fill=(2, 62, 88), font=get_font(15, True))

    # Active contact Dr Bennani
    d.rounded_rectangle([34, 130, 310, 190], radius=10, fill=(224, 242, 254), outline=(186, 230, 253))
    d.ellipse([44, 140, 84, 180], fill=(2, 132, 199))
    d.text((54, 150), 'AB', fill=(255, 255, 255), font=get_font(14, True))
    d.text((94, 144), 'Dr. Ahmed Bennani', fill=(15, 23, 42), font=get_font(13, True))
    d.text((94, 164), 'Cardiologue • CHU Ibn Sina', fill=(71, 85, 105), font=get_font(11))

    # Second contact Dr Alaoui
    d.rounded_rectangle([34, 200, 310, 260], radius=10, fill=(248, 250, 252), outline=(226, 232, 240))
    d.ellipse([44, 210, 84, 250], fill=(16, 185, 129))
    d.text((54, 220), 'LA', fill=(255, 255, 255), font=get_font(14, True))
    d.text((94, 214), 'Dr. Leila Alaoui', fill=(15, 23, 42), font=get_font(13, True))
    d.text((94, 234), 'Médecine Générale', fill=(71, 85, 105), font=get_font(11))

    # Main Chat Area
    d.rectangle([336, 76, w - 24, h - 20], fill=(255, 255, 255), outline=(226, 232, 240))

    # Chat Header
    d.rectangle([337, 77, w - 25, 135], fill=(248, 250, 252))
    d.text((360, 92), 'Dr. Ahmed Bennani (Cardiologue Traitant)', fill=(15, 23, 42), font=get_font(16, True))
    d.text((360, 114), '🟢 En ligne • Canal sécurisé WebSocket STOMP • Données HDS chiffrées', fill=(16, 185, 129), font=get_font(12))

    # Messages
    # Msg 1 from Dr
    d.rounded_rectangle([360, 160, 720, 210], radius=12, fill=(241, 245, 249))
    d.text((375, 172), 'Bonjour Sara, comment évolue votre tension cette semaine ?', fill=(15, 23, 42), font=get_font(13))
    d.text((375, 192), '10:14 • Dr. Bennani', fill=(148, 163, 184), font=get_font(10))

    # Msg 2 from Patient with attached photo
    d.rounded_rectangle([w - 480, 230, w - 50, 380], radius=12, fill=(2, 132, 199))
    d.text((w - 465, 242), 'Bonjour Docteur, ma tension est stable (125/82).', fill=(255, 255, 255), font=get_font(13))
    d.text((w - 465, 260), 'Voici la photo de mon tensiomètre et de l\'ordonnance :', fill=(255, 255, 255), font=get_font(13))

    # Photo thumbnail inside bubble
    d.rounded_rectangle([w - 465, 285, w - 180, 355], radius=8, fill=(15, 23, 42))
    d.text((w - 450, 310), '📷 [Photo_Tension_125_82.jpg - 1.2 MB]', fill=(255, 255, 255), font=get_font(11, True))
    d.text((w - 465, 362), '10:18 • Vous ✓✓', fill=(186, 230, 253), font=get_font(10))

    # Msg 3 from Dr with emoji
    d.rounded_rectangle([360, 400, 750, 460], radius=12, fill=(241, 245, 249))
    d.text((375, 412), 'Parfait ! Vos constantes sont excellentes. Continuez le traitement. 👍 💊', fill=(15, 23, 42), font=get_font(13))
    d.text((375, 434), '10:20 • Dr. Bennani', fill=(148, 163, 184), font=get_font(10))

    # EMOJI BAR
    d.rounded_rectangle([360, 520, 750, 560], radius=8, fill=(248, 250, 252), outline=(226, 232, 240))
    emojis = 'Émojis Médicaux :  💊   🩺   🩸   💓   🩹   👍   ✅   🏥   ⚠️'
    d.text((375, 532), emojis, fill=(15, 23, 42), font=get_font(13, True))

    # Input Box Row
    d.rounded_rectangle([360, 580, w - 160, 640], radius=12, fill=(248, 250, 252), outline=(203, 213, 225))
    d.text((380, 602), 'Écrivez votre message pour le Dr. Bennani... (Entrée pour envoyer)', fill=(148, 163, 184), font=get_font(13))

    # Attachment button
    d.rounded_rectangle([w - 280, 590, w - 180, 630], radius=8, fill=(241, 245, 249), outline=(203, 213, 225))
    d.text((w - 268, 600), '📷 Photo', fill=(51, 65, 85), font=get_font(12, True))

    # Send button
    d.rounded_rectangle([w - 140, 580, w - 50, 640], radius=12, fill=(2, 132, 199))
    d.text((w - 120, 602), 'Envoyer', fill=(255, 255, 255), font=get_font(13, True))

    im.save(out_path, quality=95)
    print('Created:', out_path)

# ==========================================
# 3. FIG 24: SECURITY AUDIT & GDPR EXPORT
# ==========================================
def make_audit_screen(out_path):
    w, h = 1280, 720
    im = Image.new('RGB', (w, h), (248, 250, 252))
    d = ImageDraw.Draw(im)

    # Navbar
    d.rectangle([0, 0, w, 56], fill=(2, 62, 88))
    d.text((24, 16), 'Sihati AI', fill=(255, 255, 255), font=get_font(20, True))
    d.text((130, 18), 'Administration & Conformité de Sécurité OWASP ASVS / RGPD', fill=(186, 230, 253), font=get_font(14))
    d.text((w - 220, 18), 'Rôle : ADMINISTRATEUR', fill=(255, 255, 255), font=get_font(14, True))

    # KPIs Row
    kpis = [
        ('Utilisateurs inscrits', '9', (2, 132, 199)),
        ('Alertes générées', '4', (217, 119, 6)),
        ('Mesures de santé', '28', (16, 185, 129)),
        ('Rendez-vous globaux', '5', (124, 58, 237))
    ]
    x = 24
    card_w = (w - 48 - 45) // 4
    for label, val, col in kpis:
        d.rounded_rectangle([x, 76, x + card_w, 156], radius=12, fill=(255, 255, 255), outline=(226, 232, 240))
        d.rectangle([x, 76, x + 6, 156], fill=col)
        d.text((x + 20, 92), val, fill=(15, 23, 42), font=get_font(28, True))
        d.text((x + 20, 126), label, fill=(100, 116, 139), font=get_font(12, True))
        x += card_w + 15

    # Main Audit Table Panel
    d.rounded_rectangle([24, 176, w - 24, h - 20], radius=14, fill=(255, 255, 255), outline=(226, 232, 240))

    # Header Bar with Export Button
    d.text((44, 196), 'Journal d\'Audit de Sécurité & Traçabilité des Accès Médicaux', fill=(15, 23, 42), font=get_font(17, True))
    d.text((44, 222), 'Conformité Article 15 RGPD & Norme HDS • Enregistrement horodaté certifié', fill=(100, 116, 139), font=get_font(12))

    # Export RGPD Button
    d.rounded_rectangle([w - 360, 190, w - 44, 236], radius=10, fill=(2, 132, 199))
    d.text((w - 340, 204), '📄 Exporter le Journal RGPD (JSON/PDF)', fill=(255, 255, 255), font=get_font(13, True))

    # Table Header
    d.rounded_rectangle([44, 256, w - 44, 290], radius=6, fill=(241, 245, 249))
    d.text((56, 266), 'HORODATAGE (ISO-8601)', fill=(71, 85, 105), font=get_font(11, True))
    d.text((260, 266), 'UTILISATEUR / COMPTE', fill=(71, 85, 105), font=get_font(11, True))
    d.text((500, 266), 'ACTION SENSIBLE', fill=(71, 85, 105), font=get_font(11, True))
    d.text((720, 266), 'ADRESSE IP SOURCE', fill=(71, 85, 105), font=get_font(11, True))
    d.text((w - 180, 266), 'INTÉGRITÉ SHA-256', fill=(71, 85, 105), font=get_font(11, True))

    rows = [
        ('17/10/2026 02:04:12', 'admin@healthtrack.ai', 'AUDIT_EXPORT_RGPD (Art. 15)', '192.168.1.104', 'VALIDÉE ✓ (SHA: a7f89d)'),
        ('17/10/2026 01:58:30', 'doctor@healthtrack.ai', 'PRESCRIPTION_EMISSION (Kardégic)', '192.168.1.42', 'VALIDÉE ✓ (SHA: c412b9)'),
        ('17/10/2026 01:45:10', 'patient@healthtrack.ai', 'VITALS_INSERT (BP: 125/82 mmHg)', '192.168.1.88', 'VALIDÉE ✓ (SHA: 58e390)'),
        ('17/10/2026 01:30:22', 'emergency@healthtrack.ai', 'EMERGENCY_PORTAL_ACCESS', '10.0.0.15 (SAMU)', 'VALIDÉE ✓ (SHA: 9912ac)'),
        ('17/10/2026 01:15:45', 'patient@healthtrack.ai', 'OCR_PRESCRIPTION_IMPORT (Pilulier)', '192.168.1.88', 'VALIDÉE ✓ (SHA: 34d101)'),
        ('17/10/2026 00:58:14', 'hacker_test@unknown.com', 'FAILED_LOGIN_ATTEMPT (Block RG4)', '45.132.88.12', 'BLOQUÉE ❌ (Alerte)')
    ]
    y = 300
    for i, (date, user, action, ip, sha) in enumerate(rows):
        bg = (255, 255, 255) if i % 2 == 0 else (248, 250, 252)
        d.rectangle([44, y, w - 44, y + 42], fill=bg, outline=(241, 245, 249))
        d.text((56, y + 12), date, fill=(15, 23, 42), font=get_font(12))
        d.text((260, y + 12), user, fill=(2, 132, 199), font=get_font(12, True))
        d.text((500, y + 12), action, fill=(15, 23, 42), font=get_font(12, True))
        d.text((720, y + 12), ip, fill=(71, 85, 105), font=get_font(12))
        col = (16, 185, 129) if 'VALIDÉE' in sha else (239, 68, 68)
        d.text((w - 180, y + 12), sha, fill=col, font=get_font(12, True))
        y += 44

    im.save(out_path, quality=95)
    print('Created:', out_path)

# ==========================================
# 4. FIG 21: DOCTOR PATIENTS LIST SCREEN
# ==========================================
def make_patients_screen(out_path):
    w, h = 1280, 720
    im = Image.new('RGB', (w, h), (248, 250, 252))
    d = ImageDraw.Draw(im)

    # Navbar
    d.rectangle([0, 0, w, 56], fill=(2, 62, 88))
    d.text((24, 16), 'Sihati AI', fill=(255, 255, 255), font=get_font(20, True))
    d.text((130, 18), 'Espace Médecin Traitant • Suivi des Patients Chroniques', fill=(186, 230, 253), font=get_font(14))
    d.text((w - 240, 18), 'Dr. Ahmed Bennani', fill=(255, 255, 255), font=get_font(14, True))

    # Main Grid
    # Left table (Patients list)
    d.rounded_rectangle([24, 76, 720, h - 20], radius=14, fill=(255, 255, 255), outline=(226, 232, 240))
    d.text((44, 96), '👥 Patients sous votre suivi médical', fill=(15, 23, 42), font=get_font(16, True))

    # Table Header
    d.rounded_rectangle([44, 136, 700, 170], radius=6, fill=(241, 245, 249))
    d.text((56, 146), 'PATIENT', fill=(71, 85, 105), font=get_font(11, True))
    d.text((230, 146), 'TÉLÉPHONE', fill=(71, 85, 105), font=get_font(11, True))
    d.text((420, 146), 'PATHOLOGIE SUIVIE', fill=(71, 85, 105), font=get_font(11, True))
    d.text((640, 146), 'ACTION', fill=(71, 85, 105), font=get_font(11, True))

    patients = [
        ('Sara El Amrani', '+212 6 12 34 56 78', 'Hypertension artérielle modérée', (219, 234, 254), (30, 64, 175)),
        ('Jean Martin', '+33 6 45 78 90 12', 'Diabète Type 2 sous insuline', (254, 243, 199), (146, 64, 14)),
        ('Karim Tazi', '+212 6 88 99 00 11', 'Arythmie sinusale & Tachycardie', (254, 226, 226), (153, 27, 27))
    ]
    y = 180
    for name, tel, dis, tag_bg, tag_fg in patients:
        d.rectangle([44, y, 700, y + 60], fill=(255, 255, 255), outline=(241, 245, 249))
        d.text((56, y + 16), name, fill=(15, 23, 42), font=get_font(14, True))
        d.text((56, y + 36), 'Patient régulier', fill=(148, 163, 184), font=get_font(10))
        d.text((230, y + 22), tel, fill=(51, 65, 85), font=get_font(13))
        # Tag
        d.rounded_rectangle([420, y + 14, 620, y + 46], radius=8, fill=tag_bg)
        d.text((430, y + 22), dis[:24] + '...', fill=tag_fg, font=get_font(11, True))
        # Button
        d.rounded_rectangle([640, y + 16, 690, y + 44], radius=6, fill=(2, 132, 199))
        d.text((650, y + 22), 'Voir', fill=(255, 255, 255), font=get_font(11, True))
        y += 66

    # Right detail card (Sara El Amrani)
    d.rounded_rectangle([736, 76, w - 24, h - 20], radius=14, fill=(255, 255, 255), outline=(226, 232, 240))
    d.text((756, 96), 'Dossier Clinique : Sara El Amrani', fill=(15, 23, 42), font=get_font(16, True))
    d.text((756, 120), 'patient@healthtrack.ai • +212 6 12 34 56 78', fill=(100, 116, 139), font=get_font(12))

    # Badges
    d.rounded_rectangle([756, 146, 880, 206], radius=8, fill=(248, 250, 252), outline=(226, 232, 240))
    d.text((766, 156), 'GROUPE', fill=(100, 116, 139), font=get_font(10, True))
    d.text((766, 174), 'A+', fill=(2, 132, 199), font=get_font(18, True))

    d.rounded_rectangle([895, 146, 1020, 206], radius=8, fill=(248, 250, 252), outline=(226, 232, 240))
    d.text((905, 156), 'TAILLE', fill=(100, 116, 139), font=get_font(10, True))
    d.text((905, 174), '165 cm', fill=(15, 23, 42), font=get_font(18, True))

    d.rounded_rectangle([1035, 146, 1160, 206], radius=8, fill=(248, 250, 252), outline=(226, 232, 240))
    d.text((1045, 156), 'POIDS', fill=(100, 116, 139), font=get_font(10, True))
    d.text((1045, 174), '62 kg', fill=(15, 23, 42), font=get_font(18, True))

    # History Table
    d.text((756, 230), 'Historique Récent des Constantes', fill=(15, 23, 42), font=get_font(13, True))
    d.rounded_rectangle([756, 256, w - 44, 286], radius=6, fill=(241, 245, 249))
    d.text((766, 264), 'DATE', fill=(71, 85, 105), font=get_font(10, True))
    d.text((890, 264), 'TENSION', fill=(71, 85, 105), font=get_font(10, True))
    d.text((990, 264), 'GLYCÉMIE', fill=(71, 85, 105), font=get_font(10, True))
    d.text((1100, 264), 'STATUT', fill=(71, 85, 105), font=get_font(10, True))

    c_rows = [
        ('17/10 01:45', '125/82 mmHg', '98 mg/dL', 'NORMAL', (16, 185, 129)),
        ('16/10 14:30', '130/84 mmHg', '105 mg/dL', 'NORMAL', (16, 185, 129)),
        ('15/10 09:15', '142/88 mmHg', '110 mg/dL', 'WARNING', (217, 119, 6))
    ]
    cy = 294
    for dt, bp, gl, st, col in c_rows:
        d.rectangle([756, cy, w - 44, cy + 32], fill=(255, 255, 255), outline=(241, 245, 249))
        d.text((766, cy + 8), dt, fill=(15, 23, 42), font=get_font(11))
        d.text((890, cy + 8), bp, fill=(15, 23, 42), font=get_font(11, True))
        d.text((990, cy + 8), gl, fill=(15, 23, 42), font=get_font(11))
        d.text((1100, cy + 8), st, fill=col, font=get_font(11, True))
        cy += 34

    im.save(out_path, quality=95)
    print('Created:', out_path)

make_ocr_screen('report_assets/fig11_ocr.png')
make_chat_screen('report_assets/fig13_chat.png')
make_audit_screen('report_assets/fig24_audit.png')
make_patients_screen('report_assets/fig21_patients.png')
print('All 4 core mockups generated successfully!')
