"""
================================================================================
BLOOMVERSE - SPIRITUAL LEVELING SYSTEM
Fichier : database.py
Description : Modèles SQLAlchemy ORM & Logique Métier de Gamification Spirituelle
Auteur : Expert Fullstack Python & Product Designer
================================================================================
Ce module définit :
1. Les modèles de données SQLite / SQLAlchemy (User, Quest, Vice, Skill, Dungeon, Badge, Inventory)
2. La logique de calcul d'XP, de progression de rang et de montée de niveau
3. Les actions métier (accomplissement de quêtes, combat des ombres, arbre de compétences)
4. Les données d'initialisation (Seed Data) pour un test complet immédiat
"""

import os
from datetime import datetime, date, timedelta
from typing import Tuple, Dict, Any, List, Optional
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    Text,
    Float,
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, scoped_session

# ------------------------------------------------------------------------------
# 1. INITIALISATION DE LA BASE DE DONNÉES
# ------------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "bloomverse.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
Base = declarative_base()


def get_db():
    """Générateur de session SQLAlchemy pour les requêtes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------------------------------------------------------------
# 2. MODÈLES DE DONNÉES ORM
# ------------------------------------------------------------------------------

class User(Base):
    """
    Modèle Utilisateur / 'Chasseur de Lumière'
    Stocke les données de compte, le niveau spirituel, l'XP et les statistiques quotidiennes.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    name = Column(String(80), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Identité Solo Leveling Spirituelle
    spiritual_title = Column(String(100), default="Novice de la Grâce")
    hunter_rank = Column(String(10), default="Rang E")  # Rang E, D, C, B, A, S, National
    avatar = Column(String(50), default="shadow_monarch_cross")  # Clé d'avatar stylisé
    conversion_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Système de progression XP
    level = Column(Integer, default=1)
    current_xp = Column(Integer, default=0)
    total_xp = Column(Integer, default=0)

    # Statistiques directes pour le HUD "System Status"
    prayer_minutes_today = Column(Integer, default=0)
    bible_chapters_today = Column(Integer, default=0)
    fasting_days_streak = Column(Integer, default=0)
    general_vice_streak = Column(Integer, default=0)

    # Relations
    quests = relationship("UserQuest", back_populates="user", cascade="all, delete-orphan")
    vices = relationship("UserVice", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    dungeons = relationship("UserDungeon", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    inventory_items = relationship("InventoryItem", back_populates="user", cascade="all, delete-orphan")


class Quest(Base):
    """
    Modèle des Quêtes (Journalières et Récurrentes)
    Chaque quête confère de l'XP et augmente une stat spirituelle.
    """
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)  # 'prière', 'lecture', 'gratitude', 'combat', 'service'
    xp_reward = Column(Integer, default=50)
    icon = Column(String(50), default="star")  # Nom icône
    description = Column(String(255), nullable=False)
    stat_type = Column(String(50), default="xp")  # 'prayer_minutes', 'bible_chapters', etc.
    stat_increment = Column(Integer, default=10)
    is_daily = Column(Boolean, default=True)


class UserQuest(Base):
    """
    Table d'association pour historiser les quêtes complétées par utilisateur.
    """
    __tablename__ = "user_quests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quest_id = Column(Integer, ForeignKey("quests.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    completed_date = Column(Date, default=date.today)
    note = Column(Text, nullable=True)

    user = relationship("User", back_populates="quests")
    quest = relationship("Quest")


class Vice(Base):
    """
    Modèle des Vices / 'Ombres intérieures' à combattre dans le module Shadow Army.
    Inspiré des monarques et ombres de Solo Leveling, adapté au combat spirituel biblique.
    """
    __tablename__ = "vices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(50), unique=True, nullable=False)
    boss_title = Column(String(120), nullable=False)  # Ex: "L'Ombre de la Chair"
    biblical_verse = Column(Text, nullable=False)
    verse_ref = Column(String(80), nullable=False)
    default_boss_hp = Column(Integer, default=100)
    icon = Column(String(50), default="sword")


class UserVice(Base):
    """
    Progression personnelle face à un vice spécifique.
    Gère les points de vie du boss, le streak de résistance et l'extraction de l'ombre purifiée.
    """
    __tablename__ = "user_vices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vice_id = Column(Integer, ForeignKey("vices.id"), nullable=False)
    
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    boss_current_hp = Column(Integer, default=100)
    boss_max_hp = Column(Integer, default=100)
    is_extracted = Column(Boolean, default=False)  # Ombre vaincue & soumise à Christ (30j streak)
    
    last_resisted_at = Column(DateTime, nullable=True)
    last_relapse_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="vices")
    vice = relationship("Vice")


class Skill(Base):
    """
    Modèle de l'Arbre de Compétences Spirituelles.
    Branches : PRIÈRE, ÉTUDE, SERVICE, PURETÉ.
    """
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    branch = Column(String(30), nullable=False)  # PRIÈRE, ÉTUDE, SERVICE, PURETÉ
    name = Column(String(100), nullable=False)
    tier = Column(Integer, default=1)  # 1, 2, 3
    xp_required = Column(Integer, default=100)
    title_unlocked = Column(String(100), nullable=False)  # Ex: "Guerrier de Prière"
    icon = Column(String(50), default="sparkles")
    description = Column(String(255), nullable=False)
    prerequisite_skill_code = Column(String(50), nullable=True)


class UserSkill(Base):
    """Compétence débloquée par un utilisateur."""
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill")


class DungeonBreak(Base):
    """
    Modèle des Donjons / Portails Spirituels ('Dungeon Breaks').
    Défis de haute intensité (Jeûne, Marathon Biblique, Blackout Numérique).
    """
    __tablename__ = "dungeon_breaks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    rank = Column(String(10), default="Rank B")  # Rank B, Rank A, Rank S
    duration_days = Column(Integer, default=3)
    xp_reward = Column(Integer, default=500)
    badge_reward = Column(String(100), default="Conquérant du Désert")
    description = Column(Text, nullable=False)
    verse = Column(String(150), default="Éphésiens 6:11")
    icon = Column(String(50), default="shield")


class UserDungeon(Base):
    """Donjon en cours ou complété par un utilisateur."""
    __tablename__ = "user_dungeons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dungeon_id = Column(Integer, ForeignKey("dungeon_breaks.id"), nullable=False)
    status = Column(String(20), default="active")  # 'active', 'completed', 'failed'
    progress_percent = Column(Integer, default=0)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="dungeons")
    dungeon = relationship("DungeonBreak")


class Badge(Base):
    """Badges d'accomplissement divin (Solo Leveling System Badges)."""
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(50), default="trophy")
    rarity = Column(String(30), default="Rare")  # Rare, Épique, Légendaire, Divin


class UserBadge(Base):
    """Association des badges débloqués par l'utilisateur."""
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="badges")
    badge = relationship("Badge")


class InventoryItem(Base):
    """
    Inventaire Spirituel : Versets favoris, notes de prédication,
    prières écrites et ressources recommandées.
    """
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_type = Column(String(30), nullable=False)  # 'verse', 'note', 'prayer', 'resource'
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    reference = Column(String(120), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="inventory_items")


class DailyVerse(Base):
    """Versets du jour affichés dans le HUD Solo Leveling 'System Message'."""
    __tablename__ = "daily_verses"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    reference = Column(String(100), nullable=False)
    theme = Column(String(50), default="Victoire Spirituelle")


# ------------------------------------------------------------------------------
# 3. MOTEUR DE GAMIFICATION : CALCULS D'XP, NIVEAUX & RANGS
# ------------------------------------------------------------------------------

# Table de progression de niveau : formule mathématique équilibrée
# Niveau 1: 0 - 300 XP
# Niveau 2: 300 - 800 XP (+500)
# Niveau 3: 800 - 1500 XP (+700)
# Niveau n requiert: 300 + (n - 1) * 250 XP
def calculate_level_data(total_xp: int) -> Tuple[int, int, int, float, str, str]:
    """
    Calcule le niveau spirituel, l'XP dans le niveau actuel, l'XP requis pour le prochain niveau,
    le pourcentage de complétion, le titre spirituel et le Rang de Chasseur.
    
    Retourne : (level, current_level_xp, xp_needed_for_next, progress_ratio, title, rank)
    """
    if total_xp < 0:
        total_xp = 0

    level = 1
    accumulated_xp = 0

    while True:
        xp_for_this_level = 300 + (level - 1) * 250
        if total_xp < accumulated_xp + xp_for_this_level:
            current_level_xp = total_xp - accumulated_xp
            xp_needed_for_next = xp_for_this_level
            progress_ratio = min(1.0, max(0.0, current_level_xp / xp_needed_for_next))
            break
        accumulated_xp += xp_for_this_level
        level += 1

    # Rangs et titres Solo Leveling Spirituels
    if level <= 2:
        rank = "Rang E"
        title = "Novice de la Grâce"
    elif level <= 4:
        rank = "Rang D"
        title = "Chercheur de Vérité"
    elif level <= 7:
        rank = "Rang C"
        title = "Disciple Éveillé"
    elif level <= 11:
        rank = "Rang B"
        title = "Guerrier de Prière"
    elif level <= 16:
        rank = "Rang A"
        title = "Paladin du Saint-Esprit"
    elif level <= 24:
        rank = "Rang S"
        title = "Sentinelle Céleste"
    else:
        rank = "Rang National"
        title = "Monarque de Lumière en Christ"

    return level, current_level_xp, xp_needed_for_next, progress_ratio, title, rank


def add_xp_to_user(db, user: User, xp_amount: int) -> Dict[str, Any]:
    """
    Ajoute de l'XP à un utilisateur et met à jour dynamiquement son niveau et son rang.
    Retourne un dictionnaire avec le statut de montée de niveau ('level_up').
    """
    old_level = user.level
    user.total_xp += xp_amount
    
    level, current_level_xp, xp_needed, ratio, title, rank = calculate_level_data(user.total_xp)
    user.level = level
    user.current_xp = current_level_xp
    user.spiritual_title = title
    user.hunter_rank = rank
    
    leveled_up = (level > old_level)
    db.commit()
    db.refresh(user)

    return {
        "leveled_up": leveled_up,
        "old_level": old_level,
        "new_level": level,
        "new_title": title,
        "new_rank": rank,
        "xp_added": xp_amount,
        "total_xp": user.total_xp,
        "current_xp": current_level_xp,
        "xp_needed": xp_needed,
        "ratio": ratio
    }


def complete_user_quest(db, user: User, quest_id: int, note: Optional[str] = None) -> Dict[str, Any]:
    """
    Valide l'accomplissement d'une quête journalière, incrémente les compteurs et octroie l'XP.
    """
    quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not quest:
        return {"success": False, "message": "Quête introuvable"}

    # Vérification si la quête journalière a déjà été faite aujourd'hui
    today = date.today()
    existing = db.query(UserQuest).filter(
        UserQuest.user_id == user.id,
        UserQuest.quest_id == quest_id,
        UserQuest.completed_date == today
    ).first()

    if existing:
        return {"success": False, "message": "Cette quête a déjà été accomplie aujourd'hui ! Repos mérité, Chasseur."}

    # Création du registre de validation
    user_quest = UserQuest(
        user_id=user.id,
        quest_id=quest_id,
        completed_date=today,
        note=note
    )
    db.add(user_quest)

    # Mise à jour des statistiques rapides
    if quest.stat_type == "prayer_minutes":
        user.prayer_minutes_today += quest.stat_increment
    elif quest.stat_type == "bible_chapters":
        user.bible_chapters_today += quest.stat_increment
    elif quest.stat_type == "fasting_streak":
        user.fasting_days_streak += 1
    elif quest.stat_type == "general_vice_streak":
        user.general_vice_streak += 1

    # Attribution de l'XP
    xp_result = add_xp_to_user(db, user, quest.xp_reward)
    
    return {
        "success": True,
        "quest_title": quest.title,
        "xp_reward": quest.xp_reward,
        "xp_data": xp_result,
        "message": f"Quête [{quest.title}] accomplie ! +{quest.xp_reward} XP reçus."
    }


def resist_vice(db, user: User, vice_id: int) -> Dict[str, Any]:
    """
    Enregistre une journée de victoire face à une tentation/vice dans le module Shadow Army.
    Diminue les HP du Boss, augmente le streak et peut déclencher l'EXTRACTION DE L'OMBRE.
    """
    user_vice = db.query(UserVice).filter(
        UserVice.user_id == user.id,
        UserVice.vice_id == vice_id
    ).first()

    if not user_vice:
        vice = db.query(Vice).filter(Vice.id == vice_id).first()
        if not vice:
            return {"success": False, "message": "Vice introuvable"}
        user_vice = UserVice(
            user_id=user.id,
            vice_id=vice_id,
            current_streak=0,
            best_streak=0,
            boss_current_hp=vice.default_boss_hp,
            boss_max_hp=vice.default_boss_hp,
            is_extracted=False
        )
        db.add(user_vice)
        db.commit()
        db.refresh(user_vice)

    now = datetime.utcnow()
    # Incrémentation du streak
    user_vice.current_streak += 1
    if user_vice.current_streak > user_vice.best_streak:
        user_vice.best_streak = user_vice.current_streak

    user_vice.last_resisted_at = now

    # Dégâts infligés au Boss (10% par victoire)
    damage = max(10, int(user_vice.boss_max_hp * 0.10))
    user_vice.boss_current_hp = max(0, user_vice.boss_current_hp - damage)

    # Récompense d'XP pour la résistance spirituelle (+100 XP)
    xp_result = add_xp_to_user(db, user, 100)

    # Condition d'extraction d'Ombre : 30 jours de streak OU 0 HP
    extracted_now = False
    if (user_vice.current_streak >= 30 or user_vice.boss_current_hp == 0) and not user_vice.is_extracted:
        user_vice.is_extracted = True
        extracted_now = True

        # Attribution automatique du Badge d'Ombre Purifiée
        badge_code = f"shadow_slayer_{vice_id}"
        badge = db.query(Badge).filter(Badge.code == badge_code).first()
        if not badge:
            badge = Badge(
                code=badge_code,
                name=f"Vainqueur de {user_vice.vice.name}",
                description=f"A terrassé l'Ombre de {user_vice.vice.name} et l'a soumise à Christ.",
                icon="shield-check",
                rarity="Légendaire"
            )
            db.add(badge)
            db.commit()
            db.refresh(badge)

        existing_user_badge = db.query(UserBadge).filter(
            UserBadge.user_id == user.id,
            UserBadge.badge_id == badge.id
        ).first()
        if not existing_user_badge:
            db.add(UserBadge(user_id=user.id, badge_id=badge.id))

    db.commit()
    db.refresh(user_vice)

    return {
        "success": True,
        "current_streak": user_vice.current_streak,
        "boss_current_hp": user_vice.boss_current_hp,
        "boss_max_hp": user_vice.boss_max_hp,
        "extracted_now": extracted_now,
        "is_extracted": user_vice.is_extracted,
        "xp_data": xp_result,
        "message": "Victoire enregistrée ! L'Ombre faiblit sous la Lumière divine."
    }


def relapse_vice(db, user: User, vice_id: int) -> Dict[str, Any]:
    """
    Enregistre une rechute sans culpabilité toxique.
    Réinitialise le streak, régénère partiellement le Boss et envoie un verset de grâce et relèvement.
    """
    user_vice = db.query(UserVice).filter(
        UserVice.user_id == user.id,
        UserVice.vice_id == vice_id
    ).first()

    if not user_vice:
        return {"success": False, "message": "Entrée de combat introuvable"}

    user_vice.current_streak = 0
    # Le boss récupère 40% de ses HP max
    user_vice.boss_current_hp = min(user_vice.boss_max_hp, user_vice.boss_current_hp + int(user_vice.boss_max_hp * 0.4))
    user_vice.last_relapse_at = datetime.utcnow()
    user_vice.is_extracted = False

    db.commit()

    encouragement_verse = (
        "« Car sept fois le juste tombe, et il se relève, mais les méchants sont précipités dans le malheur. » — Proverbes 24:16"
    )
    grace_message = (
        "La grâce du Christ surabonde sur tes faiblesses. Ne reste pas à terre, relève-toi, Chasseur !"
    )

    return {
        "success": True,
        "boss_current_hp": user_vice.boss_current_hp,
        "verse": encouragement_verse,
        "grace_message": grace_message
    }


# ------------------------------------------------------------------------------
# 4. DONNÉES DE DÉMONSTRATION (SEED DATA)
# ------------------------------------------------------------------------------

def seed_database():
    """
    Initialise la base de données avec des quêtes, vices, compétences,
    donjons, badges et un utilisateur de démonstration ('Sung Jin-Christ').
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Quêtes Journalières
    if db.query(Quest).count() == 0:
        default_quests = [
            Quest(
                title="Prière du matin (10 min)",
                category="prière",
                xp_reward=50,
                icon="hands-praying",
                description="Entrer en communion avec le Père dès les premières lueurs de l'aube.",
                stat_type="prayer_minutes",
                stat_increment=10
            ),
            Quest(
                title="Lecture biblique (1 chapitre)",
                category="lecture",
                xp_reward=75,
                icon="book-open",
                description="Se nourrir du Pain de Vie quotidien et méditer sur la Parole.",
                stat_type="bible_chapters",
                stat_increment=1
            ),
            Quest(
                title="Journal de gratitude (3 lignes)",
                category="gratitude",
                xp_reward=30,
                icon="pen-nib",
                description="Noter 3 bienfaits reçus du Seigneur aujourd'hui avec un cœur reconnaissant.",
                stat_type="xp",
                stat_increment=0
            ),
            Quest(
                title="Résister à une tentation",
                category="combat",
                xp_reward=100,
                icon="shield-halved",
                description="Dire NON à l'attrait de la chair par la puissance de l'Esprit Saint.",
                stat_type="general_vice_streak",
                stat_increment=1
            ),
            Quest(
                title="Acte de service anonyme",
                category="service",
                xp_reward=60,
                icon="heart-handshake",
                description="Bénir un frère, une sœur ou un inconnu sans rien chercher en retour.",
                stat_type="xp",
                stat_increment=0
            ),
        ]
        db.add_all(default_quests)

    # 2. Vices / Ombres Intérieures (Shadow Army)
    if db.query(Vice).count() == 0:
        default_vices = [
            Vice(
                name="Pornographie & Luxure",
                slug="pornography",
                boss_title="L'Ombre de la Chair Déchue",
                biblical_verse="Fuyez l'impudicité. Quelque autre péché qu'un homme commette, ce péché est hors du corps; mais celui qui se livre à l'impudicité pèche contre son propre corps.",
                verse_ref="1 Corinthiens 6:18",
                default_boss_hp=100,
                icon="eye-slash"
            ),
            Vice(
                name="Mensonge & Tromperie",
                slug="lying",
                boss_title="Le Spectre de la Dissimulation",
                biblical_verse="C'est pourquoi, renoncez au mensonge, et que chacun de vous parle selon la vérité à son prochain; car nous sommes membres les uns des autres.",
                verse_ref="Éphésiens 4:25",
                default_boss_hp=100,
                icon="mask"
            ),
            Vice(
                name="Colère & Rancœur",
                slug="anger",
                boss_title="Le Golem de Braise & d'Amertume",
                biblical_verse="Que toute amertume, toute animosité, toute colère, toute clameur, toute calomnie, et toute espèce de méchanceté disparaissent du milieu de vous.",
                verse_ref="Éphésiens 4:31",
                default_boss_hp=100,
                icon="fire"
            ),
            Vice(
                name="Paresse & Procrastination",
                slug="sloth",
                boss_title="L'Esprit d'Apathie & de Sommeil",
                biblical_verse="Va vers la fourmi, paresseux; considère ses voies, et deviens sage. Elle n'a ni chef, ni inspecteur, ni maître; elle prépare en été sa nourriture.",
                verse_ref="Proverbes 6:6-8",
                default_boss_hp=100,
                icon="bed"
            ),
            Vice(
                name="Addiction aux Réseaux Sociaux",
                slug="screens",
                boss_title="Le Voleur de Temps & de Destinée",
                biblical_verse="Prenez donc garde de vous conduire avec circonspection, non comme des insensés, mais comme des sages; rachetez le temps, car les jours sont mauvais.",
                verse_ref="Éphésiens 5:15-16",
                default_boss_hp=100,
                icon="mobile"
            ),
        ]
        db.add_all(default_vices)

    # 3. Arbre de Compétences Spirituelles (Skill Tree)
    if db.query(Skill).count() == 0:
        default_skills = [
            # Branche PRIÈRE
            Skill(
                code="prayer_1",
                branch="PRIÈRE",
                name="Intercession",
                tier=1,
                xp_required=150,
                title_unlocked="Sentinelle d'Intercession",
                icon="hands-praying",
                description="Capacité à porter avec constance les requêtes d'autrui devant le trône divin."
            ),
            Skill(
                code="prayer_2",
                branch="PRIÈRE",
                name="Prière en Langues",
                tier=2,
                xp_required=450,
                title_unlocked="Chantre de l'Esprit",
                icon="bolt",
                description="Édification spirituelle profonde par les soupirs inexprimables de l'Esprit.",
                prerequisite_skill_code="prayer_1"
            ),
            Skill(
                code="prayer_3",
                branch="PRIÈRE",
                name="Veillée Nocturne",
                tier=3,
                xp_required=900,
                title_unlocked="Guerrier de Prière",
                icon="moon",
                description="Tenir ferme dans l'adoration et le combat quand le monde dort.",
                prerequisite_skill_code="prayer_2"
            ),
            # Branche ÉTUDE
            Skill(
                code="study_1",
                branch="ÉTUDE",
                name="Lecture Quotidienne",
                tier=1,
                xp_required=150,
                title_unlocked="Lecteur de l'Alliance",
                icon="book-open",
                description="Méditation régulière des Écritures pour nourrir l'homme intérieur."
            ),
            Skill(
                code="study_2",
                branch="ÉTUDE",
                name="Mémorisation de la Parole",
                tier=2,
                xp_required=450,
                title_unlocked="Scribe du Royaume",
                icon="brain",
                description="Garder les commandements gravés sur les tables du cœur.",
                prerequisite_skill_code="study_1"
            ),
            Skill(
                code="study_3",
                branch="ÉTUDE",
                name="Enseignement & Témoignage",
                tier=3,
                xp_required=900,
                title_unlocked="Docteur Évangélique",
                icon="chalkboard-user",
                description="Partager fidèlement la saine doctrine et rendre témoignage de la foi.",
                prerequisite_skill_code="study_2"
            ),
            # Branche SERVICE
            Skill(
                code="service_1",
                branch="SERVICE",
                name="Aide Ponctuelle",
                tier=1,
                xp_required=150,
                title_unlocked="Serviteur Silencieux",
                icon="hand-holding-heart",
                description="Répondre aux besoins matériels et émotionnels des proches avec humilité."
            ),
            Skill(
                code="service_2",
                branch="SERVICE",
                name="Mentorat Spirituel",
                tier=2,
                xp_required=450,
                title_unlocked="Guide des Âmes",
                icon="user-group",
                description="Accompagner un plus jeune dans la foi pour affermir ses pas.",
                prerequisite_skill_code="service_1"
            ),
            Skill(
                code="service_3",
                branch="SERVICE",
                name="Ministère Engagé",
                tier=3,
                xp_required=900,
                title_unlocked="Pionnier du Royaume",
                icon="cross",
                description="S'investir pleinement au service de l'Église locale et de la moisson.",
                prerequisite_skill_code="service_2"
            ),
            # Branche PURETÉ
            Skill(
                code="purity_1",
                branch="PURETÉ",
                name="Résistance aux Tentations",
                tier=1,
                xp_required=150,
                title_unlocked="Bouclier de Foi",
                icon="shield",
                description="Éteindre les traits enflammés du malin par la foi ferme."
            ),
            Skill(
                code="purity_2",
                branch="PURETÉ",
                name="Pureté du Cœur",
                tier=2,
                xp_required=450,
                title_unlocked="Sentinelle Pure",
                icon="gem",
                description="Nettoyage des pensées, des désirs et sanctification intérieure constante.",
                prerequisite_skill_code="purity_1"
            ),
            Skill(
                code="purity_3",
                branch="PURETÉ",
                name="Intégrité Totale",
                tier=3,
                xp_required=900,
                title_unlocked="Vase d'Honneur Purifié",
                icon="crown",
                description="Marche sans tache ni compromis devant la face du Seigneur.",
                prerequisite_skill_code="purity_2"
            ),
        ]
        db.add_all(default_skills)

    # 4. Donjons Spéciaux (Dungeon Breaks)
    if db.query(DungeonBreak).count() == 0:
        default_dungeons = [
            DungeonBreak(
                name="Jeûne d'Esther & Daniel (3 jours)",
                rank="Rank B",
                duration_days=3,
                xp_reward=450,
                badge_reward="Flamme du Désert",
                description="Trois jours de consécration par le jeûne pour débloquer des victoires spirituelles majeures.",
                verse="Daniel 9:3",
                icon="flame"
            ),
            DungeonBreak(
                name="Marathon Biblique : Évangile de Jean",
                rank="Rank A",
                duration_days=7,
                xp_reward=700,
                badge_reward="Disciple Bien-Aimé",
                description="Lecture intégrale et méditation des 21 chapitres de l'Évangile selon Jean en 7 jours.",
                verse="Jean 20:31",
                icon="book-bookmark"
            ),
            DungeonBreak(
                name="Semaine Détox : Blackout Numérique",
                rank="Rank S",
                duration_days=7,
                xp_reward=1000,
                badge_reward="Maître du Silence",
                description="7 jours sans réseaux sociaux ni divertissements futiles, focalisés sur la présence de Dieu.",
                verse="Psaume 46:10",
                icon="power-off"
            ),
        ]
        db.add_all(default_dungeons)

    # 5. Badges d'Accomplissement
    if db.query(Badge).count() == 0:
        default_badges = [
            Badge(
                code="first_quest",
                name="Premier Pas du Chasseur",
                description="A complété sa toute première quête spirituelle.",
                icon="sparkles",
                rarity="Rare"
            ),
            Badge(
                code="level_5",
                name="Éveil du Disciple",
                description="A atteint le Niveau 5 et franchi la porte du Rang C.",
                icon="award",
                rarity="Épique"
            ),
            Badge(
                code="shadow_extractor",
                name="Commandant des Ombres Purifiées",
                description="A terrassé une ombre intérieure après 30 jours de fidélité.",
                icon="crown",
                rarity="Légendaire"
            ),
            Badge(
                code="prayer_warrior",
                name="Genou Incliné, Ciel Ouvert",
                description="A cumulé plus de 500 minutes de prière fervente.",
                icon="hands-praying",
                rarity="Divin"
            ),
        ]
        db.add_all(default_badges)

    # 6. Versets Quotidiens (System Message HUD)
    if db.query(DailyVerse).count() == 0:
        default_verses = [
            DailyVerse(
                text="Je puis tout par celui qui me fortifie.",
                reference="Philippiens 4:13",
                theme="Puissance Spirituelle"
            ),
            DailyVerse(
                text="Revêtez-vous de toutes les armes de Dieu, afin de pouvoir tenir ferme contre les ruses du diable.",
                reference="Éphésiens 6:11",
                theme="Combat Spirituel"
            ),
            DailyVerse(
                text="Car ce n'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d'amour et de sagesse.",
                reference="2 Timothée 1:7",
                theme="Courage Divin"
            ),
            DailyVerse(
                text="Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.",
                reference="Ésaïe 40:31",
                theme="Renouvellement"
            ),
            DailyVerse(
                text="Vous, petits enfants, vous êtes de Dieu, et vous les avez vaincus, parce que celui qui est en vous est plus grand que celui qui est dans le monde.",
                reference="1 Jean 4:4",
                theme="Victoire Absolue"
            ),
        ]
        db.add_all(default_verses)

    # 7. Utilisateur Démonstration ("Sung Jin-Christ")
    demo_user = db.query(User).filter(User.email == "demo@bloomverse.app").first()
    if not demo_user:
        # Mot de passe hashé simple de démo
        demo_user = User(
            email="demo@bloomverse.app",
            name="Sung Jin-Christ",
            hashed_password="demo_password_hash",
            spiritual_title="Disciple Éveillé",
            hunter_rank="Rang C",
            avatar="shadow_monarch_cross",
            conversion_date=date.today() - timedelta(days=45),
            level=5,
            current_xp=240,
            total_xp=2340,
            prayer_minutes_today=25,
            bible_chapters_today=2,
            fasting_days_streak=3,
            general_vice_streak=14
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # Assigner des vices initiaux à l'utilisateur démo
        vices = db.query(Vice).all()
        for v in vices:
            uv = UserVice(
                user_id=demo_user.id,
                vice_id=v.id,
                current_streak=14 if v.slug == "pornography" else 7,
                best_streak=18,
                boss_current_hp=45 if v.slug == "pornography" else 70,
                boss_max_hp=100,
                is_extracted=False
            )
            db.add(uv)

        # Débloquer les compétences de palier 1 pour la démo
        tier1_skills = db.query(Skill).filter(Skill.tier == 1).all()
        for s in tier1_skills:
            db.add(UserSkill(user_id=demo_user.id, skill_id=s.id))

        # Ajouter un badge débloqué
        b1 = db.query(Badge).filter(Badge.code == "first_quest").first()
        if b1:
            db.add(UserBadge(user_id=demo_user.id, badge_id=b1.id))

        # Ajouter des éléments d'inventaire démo
        inventory_samples = [
            InventoryItem(
                user_id=demo_user.id,
                item_type="verse",
                title="Mon armure de combat",
                content="Car les armes avec lesquelles nous combattons ne sont pas charnelles; mais elles sont puissantes, par la vertu de Dieu, pour renverser des forteresses.",
                reference="2 Corinthiens 10:4"
            ),
            InventoryItem(
                user_id=demo_user.id,
                item_type="prayer",
                title="Prière pour la pureté du regard",
                content="Seigneur Jésus, sanctifie mes yeux. Fais que je ne pose mes regards sur rien de vil ou de corrompu, mais que ma vision soit fixée sur Ta sainteté.",
                reference="Psaume 101:3"
            ),
            InventoryItem(
                user_id=demo_user.id,
                item_type="note",
                title="Prédication : Vaincre dans le lieu secret",
                content="La victoire publique découle toujours de l'intimité cachée avec le Père. C'est dans la chambre haute que les ombres sont dissoutes.",
                reference="Matthieu 6:6"
            ),
            InventoryItem(
                user_id=demo_user.id,
                item_type="resource",
                title="Livre : Le Combat Chrétien (John Bunyan)",
                content="Un classique intemporel sur la guerre spirituelle et le pèlerinage vers la Cité Céleste.",
                reference="Littérature Spirituelle"
            )
        ]
        db.add_all(inventory_samples)

    db.commit()
    db.close()


# Initialiser la base si exécuté directement
if __name__ == "__main__":
    print("[BloomVerse] Initialisation et amorçage de la base de données SQLite...")
    seed_database()
    print(f"[BloomVerse] Base de données prête avec succès : {DB_PATH}")
