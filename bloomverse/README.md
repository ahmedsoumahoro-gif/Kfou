# BloomVerse - Spiritual Leveling System ⚔️✨

Une Progressive Web App (PWA) 100% Python destinée aux jeunes chrétiens pour les aider à progresser spirituellement, combattre les vices et se rapprocher de Jésus, inspirée de l'univers et du design system de **Solo Leveling**.

---

## 🎮 STACK TECHNIQUE
- **Backend & Frontend** : NiceGUI (Python UI natif, Material Design, PWA)
- **Base de données** : SQLite via SQLAlchemy ORM (`bloomverse.db`)
- **Authentification & Sessions** : Sessions sécurisées NiceGUI (`app.storage.user`)
- **Icônes** : FontAwesome 6 & Material Symbols CDN
- **Polices** : *Rajdhani* (HUD & Stats), *Cinzel* (Versets bibliques), *Inter* (Corps de texte)

---

## 🚀 DÉMARRAGE RAPIDE
```bash
# 1. Installer les dépendances
pip install -r requirements.txt

# 2. Lancer l'application
python main.py
```
L'application démarre sur `http://localhost:3000` (ou port configuré par `$PORT`).
La base de données SQLite est automatiquement initialisée avec des données de démonstration complètes au premier lancement.

---

## 🛡️ COMPTE DE DÉMONSTRATION PRÉ-CONFIGURÉ
- **Email** : `demo@bloomverse.app`
- **Nom du Chasseur** : Sung Jin-Christ
- **Rang** : Rang C (Niveau 5 - Disciple Éveillé)
- **Bouton d'accès direct** disponible sur la page de connexion (`/login`) pour tester immédiatement tous les modules.

---

## 📂 STRUCTURE DU PROJET
```text
bloomverse/
├── main.py              # Point d'entrée NiceGUI + routing complet + PWA
├── database.py          # Modèles SQLAlchemy (User, Quest, Vice, Skill, Badge) & Logique XP
├── auth.py              # Logique d'authentification et gestion de session (à venir)
├── components/          # Composants modulaires (HUD, XP Bar, Cards, Notifications)
├── pages/               # Pages modulaires découpées
├── requirements.txt     # Dépendances Python
└── README.md            # Documentation du projet
```
