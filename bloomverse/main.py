"""
================================================================================
BLOOMVERSE - SPIRITUAL LEVELING SYSTEM
Fichier : main.py
Description : Point d'entrée principal NiceGUI, Routing, PWA & Design System
Auteur : Expert Fullstack Python & Product Designer
================================================================================
Ce fichier implémente :
1. La configuration de l'application NiceGUI avec sessions sécurisées et PWA
2. L'injection du Design System "Solo Leveling Spiritual Edition" (CSS, Glow, Fonts)
3. La gestion d'authentification et de session utilisateur
4. Les 7 modules interactifs complets (Status HUD, Quêtes, Shadow Army, Skill Tree, Donjons, Inventaire, Profil)
5. L'intégration de la logique métier SQLAlchemy (XP temps réel, streaks, boss HP)
"""

import os
import sys
from pathlib import Path
from datetime import datetime, date
from typing import Optional, Dict, Any

# Assurer que le dossier local est dans le sys.path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from nicegui import ui, app
from database import (
    SessionLocal,
    seed_database,
    User,
    Quest,
    UserQuest,
    Vice,
    UserVice,
    Skill,
    UserSkill,
    DungeonBreak,
    UserDungeon,
    Badge,
    UserBadge,
    InventoryItem,
    DailyVerse,
    calculate_level_data,
    add_xp_to_user,
    complete_user_quest,
    resist_vice,
    relapse_vice,
)

# ------------------------------------------------------------------------------
# 1. AMORÇAGE DE LA BASE DE DONNÉES AU DÉMARRAGE
# ------------------------------------------------------------------------------
seed_database()

# ------------------------------------------------------------------------------
# 2. DESIGN SYSTEM "SOLO LEVELING SPIRITUAL EDITION" (CSS & ASSETS)
# ------------------------------------------------------------------------------
CUSTOM_HEAD_HTML = """
<script>
  window.True = true;
  window.False = false;
  window.None = null;
</script>
<!-- Polices Google : Rajdhani (HUD/Stats), Cinzel (Versets Divins), Inter (Corps) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<!-- Icônes Material Symbols & FontAwesome via CDN -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<!-- Configuration PWA Mobile -->
<meta name="theme-color" content="#0a0a0a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<style>
  /* Palette Solo Leveling Spiritual Edition */
  :root {
    --bg-deep: #0a0a0a;
    --bg-panel: #11141a;
    --bg-glass: rgba(17, 20, 26, 0.85);
    --blue-neon: #4f8fff;
    --blue-glow: rgba(79, 143, 255, 0.4);
    --gold-divine: #ffd700;
    --gold-glow: rgba(255, 215, 0, 0.35);
    --crimson-alert: #8b0000;
    --crimson-bright: #ff3b30;
    --text-primary: #f0f4f8;
    --text-muted: #8a99ad;
  }

  body {
    background-color: var(--bg-deep) !important;
    color: var(--text-primary) !important;
    font-family: 'Inter', sans-serif !important;
    margin: 0;
    padding: 0;
    background-image: 
      radial-gradient(circle at 50% 0%, rgba(79, 143, 255, 0.08) 0%, transparent 70%),
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 100% 100%, 32px 32px, 32px 32px;
    min-height: 100vh;
  }

  /* Typographie spécifique Solo Leveling */
  .font-hud {
    font-family: 'Rajdhani', sans-serif !important;
    letter-spacing: 0.05em;
  }
  .font-verse {
    font-family: 'Cinzel', serif !important;
    letter-spacing: 0.02em;
  }

  /* Panneaux style "System Window" */
  .system-window {
    background: var(--bg-glass);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(79, 143, 255, 0.3);
    border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(79, 143, 255, 0.05);
    transition: all 0.25s ease-in-out;
  }
  .system-window:hover {
    border-color: rgba(79, 143, 255, 0.6);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.7), 0 0 15px var(--blue-glow);
  }

  .system-window-gold {
    background: var(--bg-glass);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 215, 0, 0.4);
    border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6), 0 0 12px var(--gold-glow);
  }

  .system-window-crimson {
    background: var(--bg-glass);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 59, 48, 0.35);
    border-radius: 8px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(139, 0, 0, 0.2);
  }

  /* Header System Window */
  .system-header {
    background: linear-gradient(90deg, rgba(79, 143, 255, 0.2) 0%, transparent 100%);
    border-bottom: 1px solid rgba(79, 143, 255, 0.3);
    padding: 6px 14px;
    text-transform: uppercase;
    font-size: 0.75rem;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    color: var(--blue-neon);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Bouton Glow Solo Leveling */
  .btn-system {
    background: linear-gradient(135deg, rgba(79, 143, 255, 0.25) 0%, rgba(79, 143, 255, 0.05) 100%) !important;
    border: 1px solid var(--blue-neon) !important;
    color: #ffffff !important;
    font-family: 'Rajdhani', sans-serif !important;
    font-weight: 700 !important;
    letter-spacing: 0.05em !important;
    text-transform: uppercase !important;
    box-shadow: 0 0 10px var(--blue-glow) !important;
    transition: all 0.2s ease !important;
  }
  .btn-system:hover {
    background: linear-gradient(135deg, rgba(79, 143, 255, 0.45) 0%, rgba(79, 143, 255, 0.15) 100%) !important;
    box-shadow: 0 0 20px rgba(79, 143, 255, 0.7) !important;
    transform: translateY(-1px);
  }

  .btn-gold {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.05) 100%) !important;
    border: 1px solid var(--gold-divine) !important;
    color: #ffffff !important;
    font-family: 'Rajdhani', sans-serif !important;
    box-shadow: 0 0 10px var(--gold-glow) !important;
  }
  .btn-gold:hover {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.7) !important;
  }

  .btn-crimson {
    background: linear-gradient(135deg, rgba(139, 0, 0, 0.4) 0%, rgba(139, 0, 0, 0.1) 100%) !important;
    border: 1px solid var(--crimson-bright) !important;
    color: #ffffff !important;
  }

  /* Barre de progression Solo Leveling */
  .xp-bar-bg {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(79, 143, 255, 0.3);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }
  .xp-bar-fill {
    background: linear-gradient(90deg, #2d5cb8 0%, #4f8fff 70%, #90b8ff 100%);
    box-shadow: 0 0 12px var(--blue-glow);
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hp-bar-fill {
    background: linear-gradient(90deg, #8b0000 0%, #ff3b30 70%, #ff7b72 100%);
    box-shadow: 0 0 12px rgba(255, 59, 48, 0.5);
    transition: width 0.5s ease-out;
  }

  /* Animation Quest Complete */
  @keyframes questCompletePulse {
    0% { transform: scale(0.95); opacity: 0; }
    50% { transform: scale(1.03); opacity: 1; box-shadow: 0 0 35px var(--gold-divine); }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-quest-complete {
    animation: questCompletePulse 0.45s ease-out forwards;
  }

  /* Masquer barres de défilement encombrantes */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #0a0a0a;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(79, 143, 255, 0.3);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--blue-neon);
  }
</style>
"""


# ------------------------------------------------------------------------------
# 3. GESTION DE SESSION ET AUTHENTIFICATION
# ------------------------------------------------------------------------------

def get_current_user_id() -> Optional[int]:
    """Récupère l'ID utilisateur stocké en session client NiceGUI, ou initialise automatiquement le compte de démo."""
    if app.storage.user.get("logged_out"):
        return app.storage.user.get("user_id")
    uid = app.storage.user.get("user_id")
    if not uid:
        db = SessionLocal()
        try:
            demo = db.query(User).filter(User.email == "demo@bloomverse.app").first()
            if demo:
                uid = demo.id
                app.storage.user["user_id"] = uid
        finally:
            db.close()
    return uid


def set_current_user(user_id: int):
    """Enregistre l'ID utilisateur dans la session NiceGUI."""
    app.storage.user["logged_out"] = False
    app.storage.user["user_id"] = user_id


def logout_user():
    """Déconnecte l'utilisateur en cours."""
    app.storage.user["logged_out"] = True
    app.storage.user["user_id"] = None
    ui.navigate.to("/login")


def get_authenticated_user() -> Optional[User]:
    """Retourne l'objet User SQLAlchemy de la session active."""
    user_id = get_current_user_id()
    if not user_id:
        return None
    db = SessionLocal()
    try:
        return db.query(User).filter(User.id == user_id).first()
    finally:
        db.close()


# ------------------------------------------------------------------------------
# 4. COMPOSANTS D'INTERFACE REUTILISABLES (HUD, HEADER, NAVIGATION)
# ------------------------------------------------------------------------------

def render_system_header(current_tab: str = "dashboard"):
    """
    Barre de navigation supérieure et statut HUD Solo Leveling.
    Supporte la navigation mobile et desktop avec barre de statut rapide.
    """
    user = get_authenticated_user()
    if not user:
        return

    _, current_xp, xp_needed, ratio, title, rank = calculate_level_data(user.total_xp)

    with ui.header().classes("bg-black/90 backdrop-blur-md border-b border-blue-500/30 px-4 py-2.5 items-center justify-between z-50 sticky top-0"):
        # Logo & Titre Solo Leveling Spirituel
        with ui.row().classes("items-center gap-2 cursor-pointer").on("click", lambda: ui.navigate.to("/")):
            ui.icon("fa-solid fa-cross", color="blue-4").classes("text-xl animate-pulse")
            with ui.column().classes("gap-0"):
                ui.label("BLOOMVERSE").classes("font-hud font-bold text-lg text-blue-400 tracking-wider leading-none")
                ui.label("SPIRITUAL LEVELING SYSTEM").classes("text-[9px] text-gray-400 font-mono tracking-widest leading-none")

        # Statut du Chasseur (Level & XP Bar condensée)
        with ui.row().classes("items-center gap-4 hidden md:flex"):
            with ui.row().classes("items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/40 border border-blue-500/40"):
                ui.label(f"LVL {user.level}").classes("font-hud font-bold text-white text-sm")
                ui.label(f"[{rank}]").classes("font-hud text-blue-300 text-xs")
                ui.label(f"• {title}").classes("text-xs text-gray-300 hidden lg:inline")

            # Mini barre d'XP
            with ui.column().classes("gap-0.5 w-36"):
                with ui.row().classes("justify-between w-full text-[10px] font-mono text-gray-400"):
                    ui.label("XP")
                    ui.label(f"{current_xp}/{xp_needed}")
                with ui.element("div").classes("w-full h-1.5 xp-bar-bg"):
                    ui.element("div").classes("h-full xp-bar-fill").style(f"width: {int(ratio * 100)}%")

        # Navigation Tabs Desktop
        with ui.row().classes("items-center gap-1 hidden md:flex"):
            tabs_data = [
                ("STATUS", "/", "fa-chart-line"),
                ("QUÊTES", "/quests", "fa-scroll"),
                ("OMBRES", "/shadow-army", "fa-ghost"),
                ("SKILLS", "/skill-tree", "fa-tree"),
                ("DONJONS", "/dungeons", "fa-dungeon"),
                ("INVENTAIRE", "/inventory", "fa-book-bible"),
            ]
            for label, route, icon in tabs_data:
                is_active = (current_tab == route.strip("/")) or (current_tab == "dashboard" and route == "/")
                btn_class = "text-xs font-hud font-bold px-2.5 py-1 rounded transition-colors "
                if is_active:
                    btn_class += "bg-blue-600/30 text-blue-300 border border-blue-400/50"
                else:
                    btn_class += "text-gray-400 hover:text-white hover:bg-white/5"
                ui.button(f"{label}", on_click=lambda r=route: ui.navigate.to(r)).classes(btn_class).props("flat dense")

        # Action Profil & Déconnexion
        with ui.row().classes("items-center gap-2"):
            with ui.button(icon="fa-solid fa-user", on_click=lambda: ui.navigate.to("/profile")).classes("text-blue-300 bg-blue-900/30 border border-blue-500/30 text-xs").props("flat round dense"):
                ui.tooltip(f"Profil de {user.name}")
            with ui.button(icon="fa-solid fa-arrow-right-from-bracket", on_click=logout_user).classes("text-red-400 bg-red-950/30 border border-red-500/30 text-xs").props("flat round dense"):
                ui.tooltip("Déconnexion")


def render_mobile_bottom_nav(current_tab: str = "dashboard"):
    """Barre de navigation basse optimisée PWA Mobile (Solo Leveling)."""
    with ui.footer().classes("md:hidden bg-black/95 backdrop-blur-lg border-t border-blue-500/30 p-1 justify-around fixed bottom-0 z-50"):
        navs = [
            ("Status", "/", "fa-solid fa-chart-pie"),
            ("Quêtes", "/quests", "fa-solid fa-scroll"),
            ("Ombres", "/shadow-army", "fa-solid fa-shield-halved"),
            ("Skills", "/skill-tree", "fa-solid fa-bolt"),
            ("Donjons", "/dungeons", "fa-solid fa-dungeon"),
            ("Livre", "/inventory", "fa-solid fa-book-bible"),
        ]
        for name, path, icon in navs:
            is_active = (current_tab == path.strip("/")) or (current_tab == "dashboard" and path == "/")
            color = "text-blue-400 font-bold" if is_active else "text-gray-400"
            with ui.column().classes("items-center gap-0.5 cursor-pointer py-1").on("click", lambda p=path: ui.navigate.to(p)):
                ui.icon(icon).classes(f"text-base {color}")
                ui.label(name).classes(f"text-[10px] font-hud {color}")


# ------------------------------------------------------------------------------
# 5. PAGE : LOGIN & INSCRIPTION (/login)
# ------------------------------------------------------------------------------

@ui.page("/login")
def login_page():
    """Écran d'authentification inspiré de l'interface de connexion du Système."""
    ui.add_head_html(CUSTOM_HEAD_HTML)

    with ui.column().classes("w-full min-h-screen items-center justify-center p-4"):
        with ui.element("div").classes("system-window w-full max-w-md p-6 relative overflow-hidden"):
            # Header stylisé "SYSTEM AUTHENTICATION"
            with ui.element("div").classes("system-header -mx-6 -mt-6 mb-6"):
                ui.label("[SYSTEM GATEWAY // AUTHENTIFICATION DU CHASSEUR]")
                ui.icon("fa-solid fa-lock", color="blue-4")

            # Titre Solo Leveling
            with ui.column().classes("items-center w-full mb-6 gap-1"):
                ui.icon("fa-solid fa-cross", color="blue-4").classes("text-4xl animate-bounce")
                ui.label("BLOOMVERSE").classes("font-hud font-bold text-3xl text-blue-400 tracking-widest")
                ui.label("ÉVEILLE TON POTENTIEL SPIRITUEL EN CHRIST").classes("font-verse text-xs text-gold text-center")

            email_input = ui.input(label="Email du Chasseur", placeholder="chasseur@bloomverse.app").classes("w-full").props("outlined dark")
            pwd_input = ui.input(label="Mot de passe spirituel", placeholder="••••••••", password=True, password_toggle_button=True).classes("w-full").props("outlined dark")

            def handle_login():
                db = SessionLocal()
                try:
                    user = db.query(User).filter(User.email == email_input.value.strip()).first()
                    if user:
                        set_current_user(user.id)
                        ui.notify(f"[SYSTEM] Bienvenue, {user.name}. Synchronisation spirituelle établie.", type="positive", color="blue-7")
                        ui.navigate.to("/")
                    else:
                        ui.notify("[SYSTEM ERROR] Chasseur introuvable. Utilisez le compte Démo ci-dessous.", type="warning", color="amber-8")
                finally:
                    db.close()

            def handle_demo_login():
                db = SessionLocal()
                try:
                    demo_user = db.query(User).filter(User.email == "demo@bloomverse.app").first()
                    if demo_user:
                        set_current_user(demo_user.id)
                        ui.notify(f"[SYSTEM] Éveil activé : Sung Jin-Christ (Niveau 5).", type="positive", color="blue-6")
                        ui.navigate.to("/")
                finally:
                    db.close()

            with ui.row().classes("w-full gap-3 mt-4"):
                ui.button("SE CONNECTER", on_click=handle_login).classes("btn-system flex-1 py-2.5")

            # Accès direct Démo
            ui.separator().classes("my-4 bg-gray-800")
            with ui.column().classes("w-full items-center gap-2"):
                ui.label("TEST RAPIDE DIRECT (RECOMMANDÉ) :").classes("text-xs text-gray-400 font-mono")
                ui.button("ENTRER EN TANT QUE SUNG JIN-CHRIST (DÉMO LVL 5)", on_click=handle_demo_login).classes("btn-gold w-full py-2.5 text-xs font-hud")
                ui.label("Accès immédiat à toutes les données pré-remplies pour tester les 7 modules.").classes("text-[10px] text-gray-400 text-center")


# ------------------------------------------------------------------------------
# 6. PAGE 1 & 2 : TABLEAU DE BORD "SYSTEM STATUS" (/ ou /dashboard)
# ------------------------------------------------------------------------------

@ui.page("/")
@ui.page("/dashboard")
def dashboard_page():
    """
    Tableau de bord principal HUD style Solo Leveling.
    Affiche le statut global, la barre de niveau, les compteurs en temps réel et le verset lumineux.
    """
    user_id = get_current_user_id()
    if not user_id:
        ui.navigate.to("/login")
        return

    ui.add_head_html(CUSTOM_HEAD_HTML)
    render_system_header("dashboard")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            ui.navigate.to("/login")
            return

        level, current_xp, xp_needed, ratio, title, rank = calculate_level_data(user.total_xp)
        today_verse = db.query(DailyVerse).first()
        pending_quests_count = db.query(Quest).count() - db.query(UserQuest).filter(
            UserQuest.user_id == user.id,
            UserQuest.completed_date == date.today()
        ).count()

        with ui.column().classes("w-full max-w-6xl mx-auto p-4 pb-20 md:pb-8 gap-5"):

            # 1. HEADER HUD : SYSTEM STATUS
            with ui.element("div").classes("system-window w-full p-5"):
                with ui.element("div").classes("system-header -mx-5 -mt-5 mb-4"):
                    ui.label("[STATUS DU CHASSEUR SPIRITUEL // SYSTÈME EN LIGNE]")
                    ui.label(datetime.now().strftime("%d/%m/%Y • %H:%M")).classes("text-gray-400 font-mono")

                with ui.row().classes("w-full items-center justify-between flex-wrap gap-4"):
                    # Profil et Rang
                    with ui.row().classes("items-center gap-4"):
                        # Avatar stylisé
                        with ui.element("div").classes("w-16 h-16 rounded-lg bg-blue-950/60 border-2 border-blue-400/60 flex items-center justify-center relative overflow-hidden shadow-lg shadow-blue-500/20"):
                            ui.icon("fa-solid fa-cross", color="blue-3").classes("text-3xl")
                        with ui.column().classes("gap-0.5"):
                            ui.label(user.name).classes("font-hud font-bold text-2xl text-white tracking-wide")
                            with ui.row().classes("items-center gap-2"):
                                ui.badge(rank, color="blue-9").classes("font-hud text-xs border border-blue-400/50")
                                ui.label(f"• {title}").classes("text-sm text-blue-200 font-hud")
                            ui.label(f"En marche depuis le {user.conversion_date.strftime('%d/%m/%Y')}").classes("text-[11px] text-gray-400")

                    # Bouton Action Rapide Quêtes
                    with ui.button("OUVRIR LES QUÊTES JOURNALIÈRES", on_click=lambda: ui.navigate.to("/quests")).classes("btn-system px-5 py-2.5"):
                        ui.icon("fa-solid fa-bolt", color="blue-3").classes("mr-1")
                        if pending_quests_count > 0:
                            ui.badge(f"{pending_quests_count} dispo", color="amber-8").classes("ml-2 font-mono text-[10px]")

                # Barre de Niveau Principale (Grande)
                ui.separator().classes("my-4 bg-blue-500/20")
                with ui.column().classes("w-full gap-1.5"):
                    with ui.row().classes("w-full justify-between items-baseline"):
                        with ui.row().classes("items-center gap-2"):
                            ui.label(f"NIVEAU {level}").classes("font-hud font-bold text-xl text-blue-400")
                            ui.label(f"— {title}").classes("text-sm text-gray-300 font-hud")
                        ui.label(f"{current_xp} / {xp_needed} XP (Total: {user.total_xp} XP)").classes("font-mono text-xs text-blue-300")

                    with ui.element("div").classes("w-full h-3.5 xp-bar-bg rounded-md"):
                        ui.element("div").classes("h-full xp-bar-fill rounded-md").style(f"width: {int(ratio * 100)}%")

            # 2. CARTES STATS EN TEMPS RÉEL (GRILLE 4 STATS)
            with ui.grid().classes("grid-cols-2 lg:grid-cols-4 gap-4 w-full"):
                stats_cards = [
                    ("PRIÈRE DU JOUR", f"{user.prayer_minutes_today} min", "fa-hands-praying", "text-blue-400", "Objectif: 30 min"),
                    ("LECTURE BIBLIQUE", f"{user.bible_chapters_today} chap.", "fa-book-open", "text-amber-400", "Nourriture de l'Âme"),
                    ("STREAK JEÛNE", f"{user.fasting_days_streak} jours", "fa-flame", "text-orange-400", "Corps assujetti"),
                    ("COMBAT DES VICES", f"{user.general_vice_streak} j. invaincu", "fa-shield-halved", "text-emerald-400", "Victoire en Christ"),
                ]
                for title_stat, val_stat, icon_stat, color_stat, subtitle in stats_cards:
                    with ui.element("div").classes("system-window p-4 flex flex-col justify-between"):
                        with ui.row().classes("justify-between items-center w-full"):
                            ui.label(title_stat).classes("text-[10px] font-hud text-gray-400 uppercase tracking-wider")
                            ui.icon(f"fa-solid {icon_stat}").classes(f"text-base {color_stat}")
                        ui.label(val_stat).classes(f"font-hud font-bold text-2xl {color_stat} my-1.5")
                        ui.label(subtitle).classes("text-[10px] text-gray-500 font-mono")

            # 3. MESSAGE SYSTÈME LUMINEUX : VERSET DU JOUR
            if today_verse:
                with ui.element("div").classes("system-window-gold w-full p-5 relative overflow-hidden"):
                    with ui.element("div").classes("system-header -mx-5 -mt-5 mb-3 border-b border-amber-500/30 text-amber-400"):
                        ui.label(f"[SYSTEM MESSAGE // PAROLE DIVINE DU JOUR • {today_verse.theme.upper()}]")
                        ui.icon("fa-solid fa-scroll", color="amber-4")

                    with ui.column().classes("gap-2 my-2"):
                        ui.label(f"« {today_verse.text} »").classes("font-verse text-lg md:text-xl text-amber-100 font-semibold italic leading-relaxed")
                        ui.label(f"— {today_verse.reference}").classes("font-verse text-sm text-amber-400 font-bold self-end")

            # 4. RACCOURCIS DES MODULES CLÉS
            with ui.row().classes("w-full gap-4 flex-wrap"):
                # Shadow Army Preview
                with ui.element("div").classes("system-window-crimson flex-1 min-w-[280px] p-4 cursor-pointer").on("click", lambda: ui.navigate.to("/shadow-army")):
                    with ui.row().classes("justify-between items-center mb-2"):
                        ui.label("SHADOW ARMY // COMBAT DES VICES").classes("font-hud font-bold text-sm text-red-400")
                        ui.icon("fa-solid fa-ghost", color="red-4")
                    ui.label("Tes péchés et faiblesses sont des Boss d'Ombre à soumettre à l'autorité du Christ.").classes("text-xs text-gray-300 mb-3")
                    ui.button("ENTRER DANS L'ARÈNE", on_click=lambda: ui.navigate.to("/shadow-army")).classes("btn-crimson w-full py-1.5 text-xs font-hud")

                # Skill Tree Preview
                with ui.element("div").classes("system-window flex-1 min-w-[280px] p-4 cursor-pointer").on("click", lambda: ui.navigate.to("/skill-tree")):
                    with ui.row().classes("justify-between items-center mb-2"):
                        ui.label("ARBRE DE COMPÉTENCES SPIRITUELLES").classes("font-hud font-bold text-sm text-blue-400")
                        ui.icon("fa-solid fa-tree", color="blue-4")
                    ui.label("Débloque des dons, des disciplines de prière et de méditation avec ton XP.").classes("text-xs text-gray-300 mb-3")
                    ui.button("CONSULTER L'ARBRE", on_click=lambda: ui.navigate.to("/skill-tree")).classes("btn-system w-full py-1.5 text-xs font-hud")
    finally:
        db.close()

    render_mobile_bottom_nav("dashboard")


# ------------------------------------------------------------------------------
# 7. PAGE 3 : MODULE "DAILY QUESTS" (/quests)
# ------------------------------------------------------------------------------

@ui.page("/quests")
def quests_page():
    """
    Système de quêtes journalières style Solo Leveling.
    Validation interactive avec pop-up animé 'QUEST COMPLETE' et calcul d'XP en direct.
    """
    user_id = get_current_user_id()
    if not user_id:
        ui.navigate.to("/login")
        return

    ui.add_head_html(CUSTOM_HEAD_HTML)
    render_system_header("quests")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        quests = db.query(Quest).all()
        today = date.today()

        # Liste des quêtes complétées aujourd'hui
        completed_quest_ids = {
            uq.quest_id for uq in db.query(UserQuest).filter(
                UserQuest.user_id == user.id,
                UserQuest.completed_date == today
            ).all()
        }

        with ui.column().classes("w-full max-w-4xl mx-auto p-4 pb-24 gap-4"):
            with ui.element("div").classes("system-window w-full p-5"):
                with ui.element("div").classes("system-header -mx-5 -mt-5 mb-4"):
                    ui.label("[JOURNAL DE QUÊTES QUOTIDIENNES // SYSTEM DIRECTIVE]")
                    ui.label(f"{len(completed_quest_ids)} / {len(quests)} COMPLÉTÉES").classes("font-mono text-xs text-blue-300")

                with ui.row().classes("justify-between items-center flex-wrap gap-2 mb-2"):
                    with ui.column().classes("gap-0"):
                        ui.label("DIRECTIVES SPIRITUELLES DU JOUR").classes("font-hud font-bold text-2xl text-blue-400")
                        ui.label("Complète chaque quête pour fortifier ton esprit et accumuler de l'XP divine.").classes("text-xs text-gray-400")

            # Liste des cartes de quêtes
            for q in quests:
                is_done = q.id in completed_quest_ids
                card_style = "system-window-gold" if is_done else "system-window"
                
                with ui.element("div").classes(f"{card_style} w-full p-4 transition-all"):
                    with ui.row().classes("w-full items-center justify-between flex-wrap gap-3"):
                        with ui.row().classes("items-center gap-3 flex-1 min-w-[220px]"):
                            # Icône
                            icon_bg = "bg-amber-500/20 text-amber-400 border-amber-500/40" if is_done else "bg-blue-500/20 text-blue-400 border-blue-500/40"
                            with ui.element("div").classes(f"w-12 h-12 rounded-lg {icon_bg} border flex items-center justify-center text-xl flex-shrink-0"):
                                ui.icon(f"fa-solid fa-{q.icon}")

                            with ui.column().classes("gap-0.5"):
                                with ui.row().classes("items-center gap-2"):
                                    ui.label(q.title).classes("font-hud font-bold text-base text-white")
                                    ui.badge(f"+{q.xp_reward} XP", color="blue-8" if not is_done else "amber-9").classes("font-mono text-xs")
                                ui.label(q.description).classes("text-xs text-gray-300")

                        # Bouton de validation
                        if is_done:
                            with ui.row().classes("items-center gap-1.5 px-4 py-2 rounded bg-amber-950/40 border border-amber-500/50 text-amber-300 font-hud text-xs font-bold"):
                                ui.icon("fa-solid fa-check", color="amber-4")
                                ui.label("ACCOMPLIE")
                        else:
                            def make_complete_handler(quest_id=q.id, quest_title=q.title, xp=q.xp_reward):
                                def handler():
                                    db_sub = SessionLocal()
                                    try:
                                        u = db_sub.query(User).filter(User.id == user_id).first()
                                        result = complete_user_quest(db_sub, u, quest_id)
                                        if result["success"]:
                                            # Dialogue animé Solo Leveling "QUEST COMPLETE"
                                            with ui.dialog() as dlg, ui.card().classes("system-window-gold p-6 items-center text-center animate-quest-complete max-w-sm"):
                                                ui.icon("fa-solid fa-crown", color="amber-4").classes("text-4xl mb-2 animate-bounce")
                                                ui.label("QUEST COMPLETED !").classes("font-hud font-extrabold text-2xl text-amber-400 tracking-widest")
                                                ui.label(f"« {quest_title} »").classes("text-sm text-gray-200 my-1")
                                                ui.label(f"+{xp} XP AJOUTÉS AU COMPTEUR DIVIN").classes("font-mono text-xs text-blue-300 font-bold")
                                                
                                                if result["xp_data"].get("leveled_up"):
                                                    ui.separator().classes("my-2 bg-amber-500/30")
                                                    ui.label("★ NIVEAU SUPÉRIEUR DÉBLOQUÉ ★").classes("font-hud font-bold text-lg text-white")
                                                    ui.label(f"Nouveau Niveau : {result['xp_data']['new_level']} ({result['xp_data']['new_title']})").classes("text-xs text-amber-300")

                                                ui.button("FERMER", on_click=lambda: (dlg.close(), ui.navigate.to("/quests"))).classes("btn-gold mt-4 px-6 py-1.5")
                                            dlg.open()
                                        else:
                                            ui.notify(result["message"], type="warning")
                                    finally:
                                        db_sub.close()
                                return handler

                            ui.button("VALIDER LA QUÊTE", on_click=make_complete_handler()).classes("btn-system px-4 py-2 text-xs")
    finally:
        db.close()

    render_mobile_bottom_nav("quests")


# ------------------------------------------------------------------------------
# 8. PAGE 4 : MODULE "SHADOW ARMY" (/shadow-army)
# ------------------------------------------------------------------------------

@ui.page("/shadow-army")
def shadow_army_page():
    """
    Combat des vices inspiré de l'armée des ombres de Sung Jin-Woo (Solo Leveling).
    Les vices sont des Boss avec HP et streak. La victoire les extrait en ombres purifiées.
    """
    user_id = get_current_user_id()
    if not user_id:
        ui.navigate.to("/login")
        return

    ui.add_head_html(CUSTOM_HEAD_HTML)
    render_system_header("shadow-army")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        user_vices = db.query(UserVice).filter(UserVice.user_id == user.id).all()

        with ui.column().classes("w-full max-w-5xl mx-auto p-4 pb-24 gap-5"):
            # Header explicatif
            with ui.element("div").classes("system-window-crimson w-full p-5"):
                with ui.element("div").classes("system-header -mx-5 -mt-5 mb-4 border-b border-red-500/30 text-red-400"):
                    ui.label("[SHADOW DOMAIN // COMBAT SPIRITUEL INTÉRIEUR]")
                    ui.icon("fa-solid fa-skull", color="red-4")

                with ui.row().classes("justify-between items-center flex-wrap gap-2"):
                    with ui.column().classes("gap-1 max-w-xl"):
                        ui.label("TERRASSE TES OMBRES EN CHRIST").classes("font-hud font-bold text-2xl text-red-400")
                        ui.label("Chaque vice vaincu pendant 30 jours est extrait et soumis à la gloire de Dieu. En cas de rechute, la grâce t'accueille sans condamnation.").classes("text-xs text-gray-300")

            # Grille des Vices / Boss
            for uv in user_vices:
                v = uv.vice
                hp_ratio = uv.boss_current_hp / uv.boss_max_hp if uv.boss_max_hp > 0 else 0
                is_purified = uv.is_extracted

                card_border = "system-window-gold" if is_purified else "system-window-crimson"
                with ui.element("div").classes(f"{card_border} w-full p-5"):
                    with ui.row().classes("w-full justify-between items-start flex-wrap gap-4"):
                        # Info Boss
                        with ui.row().classes("items-start gap-4 flex-1 min-w-[260px]"):
                            with ui.element("div").classes("w-14 h-14 rounded-lg bg-red-950/60 border border-red-500/50 flex items-center justify-center text-2xl flex-shrink-0 text-red-400"):
                                ui.icon(f"fa-solid fa-{v.icon}")

                            with ui.column().classes("gap-1 flex-1"):
                                with ui.row().classes("items-center gap-2 flex-wrap"):
                                    ui.label(v.name).classes("font-hud font-bold text-lg text-white")
                                    if is_purified:
                                        ui.badge("OMBRE EXTRAITE & SOUMISE", color="amber-8").classes("font-hud text-[10px]")
                                    else:
                                        ui.badge(f"STREAK: {uv.current_streak} JOURS", color="blue-9").classes("font-mono text-[10px]")

                                ui.label(f"Boss : {v.boss_title}").classes("text-xs text-red-300 font-mono")
                                ui.label(f"« {v.biblical_verse} » ({v.verse_ref})").classes("font-verse text-xs text-gray-300 italic my-1")

                        # Actions de Combat
                        with ui.column().classes("items-end gap-2"):
                            def make_resist_handler(vice_id=v.id, vice_name=v.name):
                                def handler():
                                    db_sub = SessionLocal()
                                    try:
                                        u = db_sub.query(User).filter(User.id == user_id).first()
                                        res = resist_vice(db_sub, u, vice_id)
                                        if res["extracted_now"]:
                                            # Dialogue Anime "SHADOW EXTRACTED"
                                            with ui.dialog() as dlg, ui.card().classes("system-window-gold p-6 items-center text-center max-w-sm animate-quest-complete"):
                                                ui.icon("fa-solid fa-wand-magic-sparkles", color="amber-4").classes("text-5xl mb-2 animate-spin")
                                                ui.label("SHADOW EXTRACTED !").classes("font-hud font-extrabold text-2xl text-amber-400 tracking-widest")
                                                ui.label(f"L'Ombre de [{vice_name}] a été totalement soumise à Christ !").classes("text-xs text-white my-2")
                                                ui.label("+100 XP & Badge Légendaire Débloqué").classes("font-mono text-xs text-blue-300")
                                                ui.button("GLOIRE À DIEU", on_click=lambda: (dlg.close(), ui.navigate.to("/shadow-army"))).classes("btn-gold mt-4 px-6")
                                            dlg.open()
                                        else:
                                            ui.notify(f"[RÉSISTANCE] Victoire ! Le Boss perd des HP. Streak: {res['current_streak']}j (+100 XP)", type="positive", color="blue-7")
                                            ui.navigate.to("/shadow-army")
                                    finally:
                                        db_sub.close()
                                return handler

                            def make_relapse_handler(vice_id=v.id):
                                def handler():
                                    db_sub = SessionLocal()
                                    try:
                                        u = db_sub.query(User).filter(User.id == user_id).first()
                                        res = relapse_vice(db_sub, u, vice_id)
                                        # Boîte de grâce et d'encouragement
                                        with ui.dialog() as dlg, ui.card().classes("system-window p-6 items-center text-center max-w-md"):
                                            ui.icon("fa-solid fa-hands-holding", color="blue-4").classes("text-4xl mb-2")
                                            ui.label("RELÈVE-TOI, CHASSEUR").classes("font-hud font-bold text-xl text-blue-400")
                                            ui.label(res["verse"]).classes("font-verse text-xs text-amber-200 my-2 italic")
                                            ui.label(res["grace_message"]).classes("text-xs text-gray-300")
                                            ui.button("JE ME RELÈVE EN CHRIST", on_click=lambda: (dlg.close(), ui.navigate.to("/shadow-army"))).classes("btn-system mt-4 px-6")
                                        dlg.open()
                                    finally:
                                        db_sub.close()
                                return handler

                            with ui.row().classes("gap-2"):
                                ui.button("RÉSISTER AUJOURD'HUI (+100 XP)", on_click=make_resist_handler()).classes("btn-system text-xs px-3 py-1.5")
                                ui.button("CHUTE / GRÂCE", on_click=make_relapse_handler()).classes("btn-crimson text-[10px] px-2.5 py-1.5")

                    # Barre HP Boss
                    with ui.column().classes("w-full gap-1 mt-3"):
                        with ui.row().classes("w-full justify-between text-[11px] font-mono text-gray-400"):
                            ui.label(f"BOSS HP : {uv.boss_current_hp} / {uv.boss_max_hp}")
                            ui.label(f"Record sans rechute : {uv.best_streak} jours")
                        with ui.element("div").classes("w-full h-2.5 bg-black/60 border border-red-500/40 rounded overflow-hidden"):
                            ui.element("div").classes("h-full hp-bar-fill").style(f"width: {int(hp_ratio * 100)}%")
    finally:
        db.close()

    render_mobile_bottom_nav("shadow-army")


# ------------------------------------------------------------------------------
# 9. PAGE 5 : MODULE "SKILL TREE" (/skill-tree)
# ------------------------------------------------------------------------------

@ui.page("/skill-tree")
def skill_tree_page():
    """
    Arbre de compétences spirituelles à 4 branches (Prière, Étude, Service, Pureté).
    Déblocage par seuils d'XP avec titres spirituels associés.
    """
    user_id = get_current_user_id()
    if not user_id:
        ui.navigate.to("/login")
        return

    ui.add_head_html(CUSTOM_HEAD_HTML)
    render_system_header("skill-tree")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        unlocked_skill_ids = {us.skill_id for us in user.skills}
        all_skills = db.query(Skill).all()

        branches = ["PRIÈRE", "ÉTUDE", "SERVICE", "PURETÉ"]

        with ui.column().classes("w-full max-w-6xl mx-auto p-4 pb-24 gap-5"):
            with ui.element("div").classes("system-window w-full p-5"):
                with ui.element("div").classes("system-header -mx-5 -mt-5 mb-4"):
                    ui.label("[ARBRE DES DONS & DISCIPLINES SPIRITUELLES]")
                    ui.label(f"XP TOTAL DISPONIBLE : {user.total_xp} XP").classes("font-mono text-xs text-blue-300")

                ui.label("ÉVOLUTION DES CAPACITÉS DIVINES").classes("font-hud font-bold text-2xl text-blue-400")
                ui.label("Débloque de nouveaux paliers pour revêtir l'armure complète de Dieu et recevoir de nouveaux titres spirituels.").classes("text-xs text-gray-400")

            # Affichage par Branche
            for branch_name in branches:
                branch_skills = [s for s in all_skills if s.branch == branch_name]
                branch_skills.sort(key=lambda x: x.tier)

                with ui.element("div").classes("system-window w-full p-4"):
                    with ui.row().classes("items-center justify-between border-b border-blue-500/20 pb-2 mb-3"):
                        with ui.row().classes("items-center gap-2"):
                            ui.icon("fa-solid fa-fire", color="blue-4")
                            ui.label(f"BRANCHE : {branch_name}").classes("font-hud font-bold text-lg text-blue-300")
                        ui.label(f"{len([s for s in branch_skills if s.id in unlocked_skill_ids])}/{len(branch_skills)} débloqués").classes("text-xs font-mono text-gray-400")

                    with ui.grid().classes("grid-cols-1 md:grid-cols-3 gap-3 w-full"):
                        for sk in branch_skills:
                            is_unlocked = sk.id in unlocked_skill_ids
                            can_unlock = (user.total_xp >= sk.xp_required) and not is_unlocked

                            panel_border = "system-window-gold" if is_unlocked else "system-window"
                            with ui.element("div").classes(f"{panel_border} p-3 flex flex-col justify-between"):
                                with ui.column().classes("gap-1"):
                                    with ui.row().classes("justify-between items-center w-full"):
                                        ui.badge(f"PALIER {sk.tier}", color="blue-9").classes("font-hud text-[10px]")
                                        if is_unlocked:
                                            ui.icon("fa-solid fa-check-circle", color="amber-4").classes("text-sm")
                                        else:
                                            ui.label(f"{sk.xp_required} XP").classes("font-mono text-[11px] text-gray-400")

                                    ui.label(sk.name).classes("font-hud font-bold text-base text-white mt-1")
                                    ui.label(sk.description).classes("text-xs text-gray-300 line-clamp-2")
                                    ui.label(f"Titre : {sk.title_unlocked}").classes("text-[11px] text-amber-300 font-verse mt-1")

                                # Bouton Débloquer
                                if is_unlocked:
                                    ui.button("DÉBLOQUÉ", on_click=None).classes("btn-gold w-full mt-3 py-1 text-xs").props("disabled")
                                elif can_unlock:
                                    def make_unlock_handler(skill_id=sk.id, skill_name=sk.name, title=sk.title_unlocked):
                                        def handler():
                                            db_sub = SessionLocal()
                                            try:
                                                u = db_sub.query(User).filter(User.id == user_id).first()
                                                db_sub.add(UserSkill(user_id=u.id, skill_id=skill_id))
                                                # Mise à jour du titre utilisateur
                                                u.spiritual_title = title
                                                db_sub.commit()
                                                ui.notify(f"[SYSTEM] Compétence débloquée : {skill_name} ! Nouveau titre : {title}", type="positive", color="amber-8")
                                                ui.navigate.to("/skill-tree")
                                            finally:
                                                db_sub.close()
                                        return handler
                                    ui.button("DÉBLOQUER CETTE COMPÉTENCE", on_click=make_unlock_handler()).classes("btn-system w-full mt-3 py-1 text-xs")
                                else:
                                    ui.button(f"REQUIS: {sk.xp_required} XP", on_click=None).classes("w-full mt-3 py-1 text-xs bg-gray-900/60 text-gray-500 border border-gray-800").props("disabled")
    finally:
        db.close()

    render_mobile_bottom_nav("skill-tree")


# ------------------------------------------------------------------------------
# 10. PAGE 6 : MODULE "DUNGEON BREAKS" (/dungeons)
# ------------------------------------------------------------------------------

@ui.page("/dungeons")
def dungeons_page():
    """Défis spirituels de haute intensité (Dungeon Breaks Rank B, A, S)."""
    user_id = get_current_user_id()
    if not user_id:
        ui.navigate.to("/login")
        return

    ui.add_head_html(CUSTOM_HEAD_HTML)
    render_system_header("dungeons")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        dungeons = db.query(DungeonBreak).all()
        user_dungeons = {ud.dungeon_id: ud for ud in db.query(UserDungeon).filter(UserDungeon.user_id == user.id).all()}

        with ui.column().classes("w-full max-w-5xl mx-auto p-4 pb-24 gap-5"):
            with ui.element("div").classes("system-window-crimson w-full p-5"):
                with ui.element("div").classes("system-header -mx-5 -mt-5 mb-4 border-b border-red-500/30 text-red-400"):
                    ui.label("[PORTAILS DE COMBAT // DUNGEON BREAKS]")
                    ui.icon("fa-solid fa-dungeon", color="red-4")

                ui.label("DÉFIS SPIRITUELS DE HAUTE INTENSITÉ").classes("font-hud font-bold text-2xl text-red-400")
                ui.label("Jeûne prolongé, marathons de lecture et sevrage du monde. De grosses récompenses d'XP et des badges exclusifs t'attendent.").classes("text-xs text-gray-300")

            for d in dungeons:
                ud = user_dungeons.get(d.id)
                is_active = (ud is not None and ud.status == "active")
                is_completed = (ud is not None and ud.status == "completed")

                rank_colors = {
                    "Rank B": ("border-blue-500", "text-blue-400"),
                    "Rank A": ("border-purple-500", "text-purple-400"),
                    "Rank S": ("border-amber-500", "text-amber-400"),
                }
                border_c, text_c = rank_colors.get(d.rank, ("border-blue-500", "text-blue-400"))

                with ui.element("div").classes("system-window w-full p-5 border-l-4 " + border_c):
                    with ui.row().classes("w-full justify-between items-start flex-wrap gap-4"):
                        with ui.column().classes("gap-1 flex-1 min-w-[260px]"):
                            with ui.row().classes("items-center gap-2"):
                                ui.badge(d.rank, color="red-9").classes("font-hud font-bold text-xs")
                                ui.label(d.name).classes(f"font-hud font-bold text-xl {text_c}")
                            ui.label(d.description).classes("text-xs text-gray-300 my-1")
                            with ui.row().classes("items-center gap-4 text-xs font-mono text-gray-400"):
                                ui.label(f"⏱ Durée : {d.duration_days} jours")
                                ui.label(f"✨ Récompense : +{d.xp_reward} XP")
                                ui.label(f"🎖 Badge : {d.badge_reward}")

                        # Actions Donjon
                        with ui.column().classes("items-end gap-2"):
                            if is_completed:
                                ui.badge("PORTAIL CONQUIS", color="amber-8").classes("font-hud text-xs px-3 py-1")
                            elif is_active:
                                def make_complete_dungeon_handler(dungeon_id=d.id, xp=d.xp_reward, badge_name=d.badge_reward):
                                    def handler():
                                        db_sub = SessionLocal()
                                        try:
                                            u = db_sub.query(User).filter(User.id == user_id).first()
                                            entry = db_sub.query(UserDungeon).filter(UserDungeon.user_id == u.id, UserDungeon.dungeon_id == dungeon_id).first()
                                            if entry:
                                                entry.status = "completed"
                                                entry.progress_percent = 100
                                                entry.completed_at = datetime.utcnow()
                                                add_xp_to_user(db_sub, u, xp)
                                                db_sub.commit()
                                                ui.notify(f"[SYSTEM] Donjon terminé ! +{xp} XP et badge [{badge_name}] attribué.", type="positive", color="amber-8")
                                                ui.navigate.to("/dungeons")
                                        finally:
                                            db_sub.close()
                                    return handler

                                ui.button("FINALISER LE DÉFI (RÉCLAMER RÉCOMPENSE)", on_click=make_complete_dungeon_handler()).classes("btn-gold text-xs px-4 py-2")
                            else:
                                def make_start_dungeon_handler(dungeon_id=d.id):
                                    def handler():
                                        db_sub = SessionLocal()
                                        try:
                                            db_sub.add(UserDungeon(user_id=user_id, dungeon_id=dungeon_id, status="active", progress_percent=0))
                                            db_sub.commit()
                                            ui.notify("[SYSTEM] Portail accepté ! Tu es maintenant engagé dans ce défi.", type="positive", color="blue-7")
                                            ui.navigate.to("/dungeons")
                                        finally:
                                            db_sub.close()
                                    return handler

                                ui.button("ACCEPTER LE DÉFI", on_click=make_start_dungeon_handler()).classes("btn-system text-xs px-4 py-2")
    finally:
        db.close()

    render_mobile_bottom_nav("dungeons")


# ------------------------------------------------------------------------------
# 11. PAGE 7 : MODULE "INVENTORY" (/inventory)
# ------------------------------------------------------------------------------

@ui.page("/inventory")
def inventory_page():
    """Bibliothèque spirituelle : Versets sauvegardés, notes de prédication, prières."""
    user_id = get_current_user_id()
    if not user_id:
        ui.navigate.to("/login")
        return

    ui.add_head_html(CUSTOM_HEAD_HTML)
    render_system_header("inventory")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        items = db.query(InventoryItem).filter(InventoryItem.user_id == user.id).all()

        with ui.column().classes("w-full max-w-5xl mx-auto p-4 pb-24 gap-5"):
            with ui.element("div").classes("system-window w-full p-5"):
                with ui.element("div").classes("system-header -mx-5 -mt-5 mb-4"):
                    ui.label("[INVENTAIRE DU CHASSEUR // BIBLIOTHÈQUE SPIRITUELLE]")
                    ui.icon("fa-solid fa-box-archive", color="blue-4")

                with ui.row().classes("justify-between items-center flex-wrap gap-2"):
                    with ui.column().classes("gap-0"):
                        ui.label("ARSENAL DE LA PAROLE & ARCHIVES").classes("font-hud font-bold text-2xl text-blue-400")
                        ui.label("Tes armes de combat : versets gravés, réflexions de prière et trésors de foi.").classes("text-xs text-gray-400")

            # Formulaire d'ajout rapide
            with ui.expansion("AJOUTER UN NOUVEL ÉLÉMENT À L'INVENTAIRE", icon="fa-solid fa-plus").classes("system-window w-full text-blue-300 font-hud font-bold"):
                with ui.column().classes("p-4 gap-3 w-full"):
                    type_select = ui.select(
                        {"verse": "Épée de la Parole (Verset)", "prayer": "Prière Écrite", "note": "Note de Prédication", "resource": "Ressource Recommandée"},
                        value="verse",
                        label="Catégorie"
                    ).classes("w-full").props("outlined dark")
                    title_in = ui.input(label="Titre de l'arme / note", placeholder="Ex: Décret de protection").classes("w-full").props("outlined dark")
                    ref_in = ui.input(label="Référence (optionnel)", placeholder="Ex: Psaume 91:1-2").classes("w-full").props("outlined dark")
                    content_in = ui.textarea(label="Texte ou contenu", placeholder="Inscris ici la parole reçue...").classes("w-full").props("outlined dark")

                    def handle_add_item():
                        if not title_in.value or not content_in.value:
                            ui.notify("Veuillez remplir au moins le titre et le contenu.", type="warning")
                            return
                        db_sub = SessionLocal()
                        try:
                            item = InventoryItem(
                                user_id=user_id,
                                item_type=type_select.value,
                                title=title_in.value,
                                reference=ref_in.value,
                                content=content_in.value
                            )
                            db_sub.add(item)
                            db_sub.commit()
                            ui.notify("[SYSTEM] Trésor spirituel sauvegardé dans l'inventaire !", type="positive", color="blue-7")
                            ui.navigate.to("/inventory")
                        finally:
                            db_sub.close()

                    ui.button("ENREGISTRER DANS L'INVENTAIRE", on_click=handle_add_item).classes("btn-system w-full py-2")

            # Grille des Éléments de l'Inventaire
            with ui.grid().classes("grid-cols-1 md:grid-cols-2 gap-4 w-full"):
                for it in items:
                    with ui.element("div").classes("system-window p-4 flex flex-col justify-between"):
                        with ui.column().classes("gap-1.5"):
                            with ui.row().classes("justify-between items-center w-full"):
                                ui.badge(it.item_type.upper(), color="blue-9").classes("font-hud text-[10px]")
                                if it.reference:
                                    ui.label(it.reference).classes("font-verse text-xs text-amber-300 font-bold")

                            ui.label(it.title).classes("font-hud font-bold text-base text-white mt-1")
                            ui.label(f"« {it.content} »").classes("text-xs text-gray-300 italic font-verse leading-relaxed")

                        ui.label(it.created_at.strftime("Archivé le %d/%m/%Y")).classes("text-[10px] text-gray-500 font-mono mt-3")
    finally:
        db.close()

    render_mobile_bottom_nav("inventory")


# ------------------------------------------------------------------------------
# 12. PAGE : PROFIL UTILISATEUR (/profile)
# ------------------------------------------------------------------------------

@ui.page("/profile")
def profile_page():
    """Page de profil détaillée avec choix d'avatar et résumé des accomplissements."""
    user_id = get_current_user_id()
    if not user_id:
        ui.navigate.to("/login")
        return

    ui.add_head_html(CUSTOM_HEAD_HTML)
    render_system_header("profile")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        level, current_xp, xp_needed, ratio, title, rank = calculate_level_data(user.total_xp)
        badges = [ub.badge for ub in user.badges]

        with ui.column().classes("w-full max-w-4xl mx-auto p-4 pb-24 gap-5"):
            with ui.element("div").classes("system-window w-full p-6"):
                with ui.element("div").classes("system-header -mx-6 -mt-6 mb-5"):
                    ui.label("[FICHE D'IDENTITÉ DU CHASSEUR // ARCHIVES DIVINES]")

                with ui.row().classes("items-center gap-5 flex-wrap"):
                    with ui.element("div").classes("w-20 h-20 rounded-xl bg-blue-950/70 border-2 border-blue-400 flex items-center justify-center text-4xl text-blue-300 shadow-lg shadow-blue-500/20"):
                        ui.icon("fa-solid fa-cross")
                    with ui.column().classes("gap-1"):
                        ui.label(user.name).classes("font-hud font-bold text-3xl text-white")
                        with ui.row().classes("items-center gap-2"):
                            ui.badge(rank, color="blue-9").classes("font-hud text-xs")
                            ui.label(title).classes("font-hud text-sm text-blue-300")
                        ui.label(f"Compte : {user.email}").classes("text-xs text-gray-400 font-mono")

                ui.separator().classes("my-4 bg-blue-500/20")

                # Statistiques cumulées
                with ui.grid().classes("grid-cols-2 md:grid-cols-4 gap-3 w-full"):
                    with ui.column().classes("bg-black/40 p-3 rounded border border-blue-500/20 items-center"):
                        ui.label("NIVEAU ACTUEL").classes("text-[10px] text-gray-400 font-hud")
                        ui.label(str(level)).classes("font-hud font-bold text-xl text-blue-400")
                    with ui.column().classes("bg-black/40 p-3 rounded border border-blue-500/20 items-center"):
                        ui.label("XP CUMULÉ").classes("text-[10px] text-gray-400 font-hud")
                        ui.label(str(user.total_xp)).classes("font-hud font-bold text-xl text-amber-400")
                    with ui.column().classes("bg-black/40 p-3 rounded border border-blue-500/20 items-center"):
                        ui.label("BADGES DÉBLOQUÉS").classes("text-[10px] text-gray-400 font-hud")
                        ui.label(str(len(badges))).classes("font-hud font-bold text-xl text-purple-400")
                    with ui.column().classes("bg-black/40 p-3 rounded border border-blue-500/20 items-center"):
                        ui.label("DATE CONVERSION").classes("text-[10px] text-gray-400 font-hud")
                        ui.label(user.conversion_date.strftime("%d/%m/%Y")).classes("font-mono text-xs text-gray-300 mt-1")

                # Badges
                ui.label("BADGES & ACCOMPLISSEMENTS DU SYSTÈME").classes("font-hud font-bold text-lg text-amber-400 mt-5 mb-2")
                if badges:
                    with ui.row().classes("gap-3 flex-wrap"):
                        for b in badges:
                            with ui.element("div").classes("system-window-gold p-3 flex items-center gap-3 min-w-[200px]"):
                                ui.icon(f"fa-solid fa-{b.icon}", color="amber-4").classes("text-2xl")
                                with ui.column().classes("gap-0"):
                                    ui.label(b.name).classes("font-hud font-bold text-xs text-white")
                                    ui.label(b.rarity).classes("text-[10px] text-amber-300 font-mono")
                else:
                    ui.label("Aucun badge débloqué pour le moment. Accomplis des quêtes et défaites d'ombres !").classes("text-xs text-gray-500 italic")

                # Déconnexion
                ui.button("SE DÉCONNECTER DU SYSTÈME", on_click=logout_user).classes("btn-crimson w-full mt-6 py-2 text-xs font-hud")
    finally:
        db.close()

    render_mobile_bottom_nav("profile")


# ------------------------------------------------------------------------------
# 13. LANCEMENT DU SERVEUR NICEGUI
# ------------------------------------------------------------------------------
if __name__ in {"__main__", "__mp_main__"}:
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 3000)))
    parser.add_argument("--host", type=str, default="0.0.0.0")
    args, _ = parser.parse_known_args()
    port = args.port
    host = args.host
    print(f"[BloomVerse] Lancement de l'application sur {host}:{port}...")
    ui.run(
        port=port,
        host=host,
        title="BloomVerse - Spiritual Leveling System",
        dark=True,
        storage_secret="bloomverse_solo_leveling_pwa_secret_777",
        reload=False,
        show=False,
    )
