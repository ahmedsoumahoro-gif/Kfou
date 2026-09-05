import React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { HunterUser, Badge, AppearanceSettings, ReminderSettings } from '../types';
import { Shield, Award, Calendar, Sparkles, Flame, BookOpen, RotateCcw, Sliders, Camera, Edit3, Cloud, CloudUpload, UserCheck, LogIn, LogOut, CheckCircle2, Bell, BellRing, Clock, Crown, ChevronRight } from 'lucide-react';
import { playSystemSound } from '../utils/audio';
import { AppearanceSettingsSection } from './AppearanceSettingsSection';
import { HunterAvatar } from './HunterAvatar';
import { getRankBadgeColor, getRankTextColor } from '../data/initialData';

interface ProfileViewProps {
  user: HunterUser;
  badges: Badge[];
  settings: AppearanceSettings;
  firebaseUser?: FirebaseUser | null;
  lastSyncedAt?: string;
  reminderSettings?: ReminderSettings;
  onOpenReminderModal?: () => void;
  onOpenWeeklyReport?: () => void;
  onUpdateSettings: (newSettings: Partial<AppearanceSettings>) => void;
  onOpenPhotoModal: () => void;
  onOpenAuthModal: () => void;
  onResetData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  badges,
  settings,
  firebaseUser,
  lastSyncedAt,
  reminderSettings,
  onOpenReminderModal,
  onOpenWeeklyReport,
  onUpdateSettings,
  onOpenPhotoModal,
  onOpenAuthModal,
  onResetData,
}) => {
  const getRarityBadgeColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'Divin':
        return 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]';
      case 'Légendaire':
        return 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
      case 'Épique':
        return 'bg-sky-500/20 text-sky-300 border-sky-400';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hunter ID License Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c1426] via-[#090d16] to-[#120e24] border-2 border-sky-500/40 shadow-[0_0_35px_rgba(56,189,248,0.2)] system-corner overflow-hidden">
        {/* Holographic Watermark */}
        <div className="absolute top-4 right-4 text-[70px] sm:text-[100px] font-hud font-extrabold text-sky-500/5 select-none pointer-events-none">
          HUNTER
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Interactive Profile Photo Avatar */}
            <div
              className="relative group cursor-pointer"
              onClick={() => {
                playSystemSound('click');
                onOpenPhotoModal();
              }}
              title="Cliquez pour changer votre photo de profil"
            >
              <HunterAvatar
                avatar={user.avatar}
                name={user.name}
                rank={user.hunterRank}
                size="xl"
                showRankBorder={true}
                showStatusDot={true}
              />
              <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-white backdrop-blur-[2px]">
                <Camera className="w-5 h-5 text-sky-400 animate-bounce" />
                <span className="text-[9px] font-hud uppercase tracking-wider text-sky-300 font-bold">
                  MODIFIER
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-hud font-bold bg-sky-950 border border-sky-500/30 text-sky-300 uppercase tracking-widest">
                  LICENCE DE CHASSEUR SPIRITUEL
                </span>
                {/* Mobile Rank Pill */}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-hud font-bold uppercase tracking-wider border sm:hidden ${getRankBadgeColor(
                    user.hunterRank
                  )}`}
                >
                  {user.hunterRank}
                </span>
                <button
                  type="button"
                  id="edit-profile-photo-btn"
                  onClick={() => {
                    playSystemSound('click');
                    onOpenPhotoModal();
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-hud uppercase tracking-wider bg-slate-900/80 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700 hover:border-sky-400 flex items-center gap-1 transition-all"
                >
                  <Camera className="w-3 h-3 text-sky-400" />
                  <span>Photo / Titre</span>
                </button>
              </div>
              <h1 className="font-hud text-2xl sm:text-3xl font-bold text-white tracking-wide mt-0.5">
                {user.name}
              </h1>
              <p className="font-biblical text-sm text-sky-300 font-medium">
                « {user.spiritualTitle} »
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex sm:items-center">
            <div
              className={`px-4 py-3 sm:px-5 sm:py-3 rounded-2xl bg-slate-950/90 border text-center shadow-md ${getRankBadgeColor(
                user.hunterRank
              )}`}
            >
              <span className="text-[10px] font-hud uppercase text-slate-400 block tracking-wider">
                RANG
              </span>
              <span className={`font-hud text-xl sm:text-2xl font-bold ${getRankTextColor(user.hunterRank)}`}>
                {user.hunterRank}
              </span>
            </div>
            <div className="px-4 py-3 sm:px-5 sm:py-3 rounded-2xl bg-slate-950/90 border border-sky-400/40 text-center shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <span className="text-[10px] font-hud uppercase text-slate-400 block tracking-wider">
                NIVEAU
              </span>
              <span className="font-hud text-xl sm:text-2xl font-bold text-sky-300">LVL {user.level}</span>
            </div>
          </div>
        </div>

        {/* Hunter Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-sky-900/40">
          <div className="space-y-1">
            <span className="text-[11px] font-hud text-slate-400 uppercase">XP CUMULÉE</span>
            <div className="font-hud text-lg font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>{user.totalXp} XP</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-hud text-slate-400 uppercase">PRIÈRE ENREGISTRÉE</span>
            <div className="font-hud text-lg font-bold text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{user.prayerMinutesToday} min</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-hud text-slate-400 uppercase">CHAPITRES MÉDITÉS</span>
            <div className="font-hud text-lg font-bold text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>{user.bibleChaptersToday} chapitres</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-hud text-slate-400 uppercase">ALLIANCE DE FOI</span>
            <div className="font-hud text-lg font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>{user.conversionDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Accomplishments Section */}
      <div className="system-window rounded-2xl p-6 system-corner space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
              [ SALLE DES TROPHÉES CÉLESTES ]
            </span>
            <h3 className="font-hud text-xl font-bold text-white tracking-wide">
              Badges & Titres Honorifiques ({unlockedBadgesCount}/{badges.length})
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                badge.unlocked
                  ? 'bg-slate-950/80 border-sky-900/60 shadow-[0_0_15px_rgba(56,189,248,0.08)]'
                  : 'bg-slate-950/30 border-slate-900 opacity-40'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl border flex-shrink-0 ${
                  badge.unlocked
                    ? 'bg-sky-950/50 border-sky-500/40 text-sky-400'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
              >
                <Award className="w-6 h-6" />
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-hud text-sm font-bold text-white">{badge.name}</h4>
                  <span className={`px-2 py-0.2 rounded text-[9px] font-hud uppercase tracking-wider font-bold border ${getRarityBadgeColor(badge.rarity)}`}>
                    {badge.rarity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {badge.description}
                </p>
                {badge.unlocked && badge.unlockedAt && (
                  <span className="text-[10px] font-mono text-emerald-400 block pt-1">
                    ✓ Débloqué le {badge.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hunter Identity & Profile Photo Card */}
      <div className="system-window rounded-2xl p-6 system-corner space-y-4">
        <div className="flex items-center justify-between border-b border-sky-900/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
                [ PERSONNALISATION DU COMPTE ]
              </span>
              <h3 className="font-hud text-xl font-bold text-white tracking-wide">
                Photo de Profil & Identité Spirituelle
              </h3>
            </div>
          </div>

          <button
            type="button"
            id="profile-section-edit-photo-btn"
            onClick={() => {
              playSystemSound('click');
              onOpenPhotoModal();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-all flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>Changer de Photo</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <HunterAvatar
              avatar={user.avatar}
              name={user.name}
              rank={user.hunterRank}
              size="lg"
              showRankBorder={true}
              showStatusDot={true}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-hud font-bold text-white text-base">
                  {user.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-hud text-sky-300 bg-sky-950 border border-sky-500/30 uppercase">
                  {user.hunterRank}
                </span>
              </div>
              <p className="font-biblical text-xs text-slate-300 italic">
                « {user.spiritualTitle} »
              </p>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                {user.avatar && (user.avatar.startsWith('data:image/') || user.avatar.startsWith('http'))
                  ? 'Photo personnalisée active'
                  : 'Avatar prédéfini du Système'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="profile-modify-details-btn"
            onClick={() => {
              playSystemSound('click');
              onOpenPhotoModal();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-sky-500/30 text-sky-300 text-xs font-hud font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modifier Identité</span>
          </button>
        </div>
      </div>

      {/* Duolingo-style Notification Reminder Section */}
      <div className="system-window rounded-2xl p-6 system-corner space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-hud text-amber-400 tracking-wider uppercase block">
                  [ RAPPEL DE SÉRIE DUOLINGO ]
                </span>
                {reminderSettings?.enabled && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-hud font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                    ACTIF À {reminderSettings.time}
                  </span>
                )}
              </div>
              <h3 className="font-hud text-xl font-bold text-white tracking-wide">
                Rappels Quotidiens & Notifications
              </h3>
            </div>
          </div>

          {onOpenReminderModal && (
            <button
              type="button"
              onClick={() => {
                playSystemSound('click');
                onOpenReminderModal();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-hud font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Configurer les Rappels</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
              🦉
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-hud font-bold text-white">
                {reminderSettings?.enabled
                  ? `Rappel programmé à ${reminderSettings.time} (${
                      reminderSettings.tone === 'duolingo'
                        ? 'Style Duolingo Insistant'
                        : reminderSettings.tone === 'solo_leveling'
                        ? 'Directive Solo Leveling'
                        : 'Grâce & Paix'
                    })`
                  : 'Rappels de notification désactivés'}
              </p>
              <p className="text-[11px] text-slate-400">
                Protégez votre flamme de prière quotidienne grâce à des alertes directes sur votre appareil.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-hud text-amber-300 font-bold px-3 py-1.5 rounded-lg bg-slate-950 border border-amber-500/30">
              {reminderSettings?.enabled ? `⏰ ${reminderSettings.time}` : 'Désactivé'}
            </span>
          </div>
        </div>
      </div>

      {/* Sunday Weekly Report Section */}
      {onOpenWeeklyReport && (
        <div className="system-window rounded-2xl p-6 system-corner space-y-4 bg-gradient-to-r from-amber-950/20 via-slate-900 to-sky-950/20 border border-amber-500/30">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.25)]">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-hud text-amber-400 tracking-wider uppercase block">
                  [ RAPPORT DU JOUR DU SEIGNEUR ]
                </span>
                <h3 className="font-hud text-xl font-bold text-white tracking-wide">
                  Bilan Spirituel Hebdomadaire & Archives
                </h3>
              </div>
            </div>

            <button
              type="button"
              id="profile-open-weekly-report-btn"
              onClick={() => {
                playSystemSound('click');
                onOpenWeeklyReport();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-hud text-xs font-extrabold flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all cursor-pointer"
            >
              <span>Consulter le Bilan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Chaque dimanche, le Système compile l’ensemble de vos progrès spirituels (temps de prière, chapitres de la Bible médités, quêtes accomplies, croissance d’XP et sanctification) avec graphiques interactifs et évaluation du Système. Toutes vos données sont sauvegardées dans Firebase Firestore.
          </p>
        </div>
      )}

      {/* Appearance & Themes Settings Section */}
      <div className="system-window rounded-2xl p-6 system-corner space-y-6">
        <div className="flex items-center gap-3 border-b border-sky-900/30 pb-3">
          <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
              [ PARAMÈTRES DU SYSTÈME ]
            </span>
            <h3 className="font-hud text-xl font-bold text-white tracking-wide">
              Personnalisation de l'Affichage & Typographie
            </h3>
          </div>
        </div>

        <AppearanceSettingsSection
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />
      </div>

      {/* Espace Compte Hunter & Connexion Cloud */}
      <div className="system-window rounded-2xl p-6 system-corner space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-sky-900/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
                [ ESPACE DE CONNEXION & IDENTIFIANT ]
              </span>
              <h3 className="font-hud text-xl font-bold text-white tracking-wide">
                Espace Connexion & Sauvegarde du Compte
              </h3>
            </div>
          </div>

          {firebaseUser ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-hud font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>COMPTE CONNECTÉ</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-hud font-bold">
              <span>MODE LOCAL / INITIÉ</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-hud font-bold text-sm">
              <UserCheck className="w-4 h-4 text-sky-400" />
              <span>Identité de Connexion</span>
            </div>
            {firebaseUser ? (
              <div className="space-y-1 text-xs">
                <p className="text-slate-200 font-bold">{firebaseUser.displayName || user.name}</p>
                <p className="text-slate-400 font-mono">{firebaseUser.email}</p>
                <p className="text-[11px] text-emerald-400 pt-1 font-hud">
                  ✓ Base de données Cloud connectée
                </p>
              </div>
            ) : (
              <div className="space-y-1 text-xs text-slate-400">
                <p>Aucun compte connecté actuellement.</p>
                <p className="text-amber-300/80 text-[11px]">
                  Connectez-vous pour préserver votre progression et synchroniser votre profil.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-hud font-bold text-sm">
              <CloudUpload className="w-4 h-4 text-sky-400" />
              <span>État de Sauvegarde</span>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <p>
                Statut :{' '}
                <span className="text-slate-200 font-bold">
                  {firebaseUser ? 'Sauvegarde automatique Cloud' : 'Mémoire locale'}
                </span>
              </p>
              <p className="text-[11px]">
                {lastSyncedAt
                  ? `Dernière synchronisation : ${new Date(lastSyncedAt).toLocaleString('fr-FR')}`
                  : 'Prêt à être sauvegardé'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            id="profile-manage-auth-btn"
            onClick={() => {
              playSystemSound('click');
              onOpenAuthModal();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all cursor-pointer active:scale-98"
          >
            {firebaseUser ? (
              <>
                <Cloud className="w-4 h-4" />
                <span>Gérer Mon Profil & Synchroniser</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Ouvrir l'Espace de Connexion</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Voulez-vous réinitialiser les données locales au compte par défaut ?')) {
                playSystemSound('click');
                onResetData();
              }
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-300 font-hud text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les Données</span>
          </button>
        </div>
      </div>
    </div>
  );
};
