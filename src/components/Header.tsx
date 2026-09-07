import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { HunterUser, AppearanceSettings, ReminderSettings } from '../types';
import { Volume2, VolumeX, Sparkles, BookOpen, Flame, Sliders, Sun, Moon, Camera, Music, LogIn, LogOut, Cloud, UserCheck, Bell, Palette, Crown } from 'lucide-react';
import { isAudioEnabled, toggleAudio, playSystemSound } from '../utils/audio';
import { musicEngine } from '../utils/musicEngine';
import { logoutHunter } from '../services/firebase';
import { HunterAvatar } from './HunterAvatar';
import { BloomVerseLogo } from './BloomVerseLogo';
import { getRankBadgeColor, getXpRequiredForLevel } from '../data/initialData';
import { getEffectiveAccentColor } from '../constants/assets';

interface HeaderProps {
  user: HunterUser;
  settings: AppearanceSettings;
  firebaseUser?: FirebaseUser | null;
  isCloudSyncing?: boolean;
  onAudioToggled: (enabled: boolean) => void;
  onOpenSettings: () => void;
  onQuickToggleTheme: () => void;
  onOpenPhotoModal: () => void;
  onOpenAuthModal?: () => void;
  reminderSettings?: ReminderSettings;
  onOpenReminderModal?: () => void;
  onOpenWeeklyReport?: () => void;
  isSimulatedSunday?: boolean;
  activeTab?: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  settings,
  firebaseUser,
  isCloudSyncing = false,
  reminderSettings,
  onOpenReminderModal,
  onOpenWeeklyReport,
  isSimulatedSunday = false,
  onAudioToggled,
  onOpenSettings,
  onQuickToggleTheme,
  onOpenPhotoModal,
  onOpenAuthModal,
  activeTab = 'dashboard',
}) => {
  const [soundOn, setSoundOn] = useState(isAudioEnabled());
  const [musicPlaying, setMusicPlaying] = useState(() => musicEngine.getStatus().isPlaying);
  const [musicTrack, setMusicTrack] = useState(() => musicEngine.getStatus().trackInfo.title);

  useEffect(() => {
    const unsub = musicEngine.subscribe(() => {
      const status = musicEngine.getStatus();
      setMusicPlaying(status.isPlaying);
      setMusicTrack(status.trackInfo.title);
    });
    return unsub;
  }, []);

  const xpNeeded = getXpRequiredForLevel(user.level);
  const xpPercent = Math.min(100, Math.round((user.currentXp / xpNeeded) * 100));

  const accentColor = getEffectiveAccentColor(
    settings.accentColorPreset,
    settings.customAccentColor
  );

  const handleAudioToggle = () => {
    const next = toggleAudio();
    setSoundOn(next);
    onAudioToggled(next);
    if (next) playSystemSound('click');
  };

  const handleMusicToggle = () => {
    playSystemSound('click');
    musicEngine.togglePlay(activeTab);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-950/60 bg-[#07090e]/95 backdrop-blur-md">
      {/* Main Top Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Typographic BV Abbreviation Logo & System Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            id="header-logo-btn"
            onClick={() => {
              playSystemSound('click');
            }}
            className="cursor-pointer focus:outline-none transition-transform active:scale-95 shrink-0"
            title="BloomVerse (BV) - Système d'Éveil Spirituel"
          >
            <BloomVerseLogo accentColor={accentColor} size="md" showPingDot={true} />
          </button>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-hud tracking-wider text-base sm:text-xl font-bold text-white glow-blue">
                BLOOM<span style={{ color: accentColor }}>VERSE</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-hud uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded">
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-hud tracking-wide">
              {user.spiritualTitle}
            </p>
          </div>
        </div>

        {/* Hunter Stats Preview & Sound Toggle */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Quick HUD Counters (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-hud">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900/60 border border-sky-900/40 text-slate-300">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{user.prayerMinutesToday} min prière</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900/60 border border-sky-900/40 text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>{user.bibleChaptersToday} chap. Bible</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900/60 border border-sky-900/40 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{user.generalViceStreak}j pur</span>
            </div>
          </div>

          {/* Level, Rank & Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Clickable Hunter Avatar */}
            <button
              id="header-profile-avatar-btn"
              onClick={() => {
                playSystemSound('click');
                onOpenPhotoModal();
              }}
              className="relative group focus:outline-none shrink-0"
              title="Modifier votre photo de profil et vos titres"
            >
              <HunterAvatar
                avatar={user.avatar}
                name={user.name}
                rank={user.hunterRank}
                size="sm"
                showRankBorder={true}
                showStatusDot={true}
                showRankTag={true}
              />
              <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-3.5 h-3.5 text-sky-400" />
              </div>
            </button>

            {/* Level & Rank Badge (Always visible, shrink-0 to prevent cutoff on mobile) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-[9px] sm:text-[10px] uppercase font-hud text-slate-400 leading-none">
                  NIV.
                </span>
                <span className="font-hud text-sm sm:text-base font-bold text-sky-300 leading-tight">
                  {user.level}
                </span>
              </div>

              {/* Prominent Rank Badge */}
              <div
                id="header-rank-badge"
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border font-hud font-bold text-[11px] sm:text-xs uppercase tracking-wider shrink-0 shadow-md ${getRankBadgeColor(
                  user.hunterRank
                )}`}
                title={`Rang du Chasseur : ${user.hunterRank}`}
              >
                {user.hunterRank}
              </div>
            </div>
          </div>

          {/* Action Buttons (Compact on mobile) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Hunter User Account / Cloud Auth Button */}
            {firebaseUser ? (
              <button
                type="button"
                id="header-auth-user-btn"
                onClick={() => {
                  playSystemSound('click');
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900/90 border border-sky-500/40 text-sky-200 text-xs font-hud transition-all cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                title={`Compte Hunter Connecté: ${firebaseUser.email || firebaseUser.displayName} (Cliquer pour gérer)`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Cloud className={`w-3.5 h-3.5 text-sky-400 ${isCloudSyncing ? 'animate-bounce' : ''}`} />
                <span className="hidden sm:inline font-bold truncate max-w-[80px]">
                  {firebaseUser.displayName?.split(' ')[0] || 'Hunter'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                id="header-auth-login-btn"
                onClick={() => {
                  playSystemSound('click');
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-hud font-bold shadow-[0_0_12px_rgba(56,189,248,0.35)] transition-all cursor-pointer active:scale-95 border border-sky-400/40"
                title="Espace de connexion : connectez-vous ou créez votre compte avec votre pseudo"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">Connexion</span>
              </button>
            )}

            {/* Quick Logout Button when connected */}
            {firebaseUser && (
              <button
                type="button"
                id="header-auth-logout-btn"
                onClick={async () => {
                  playSystemSound('click');
                  await logoutHunter();
                }}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-colors"
                title="Déconnexion (Quitter la session)"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Quick Theme Toggle Button */}
            <button
              id="quick-theme-toggle-btn"
              onClick={() => {
                playSystemSound('click');
                onQuickToggleTheme();
              }}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
              title={
                settings.theme === 'divine-light'
                  ? 'Activer le mode Sombre (Solo Leveling)'
                  : 'Activer le mode Clair (Lumière Céleste)'
              }
            >
              {settings.theme === 'divine-light' || settings.theme === 'solar-parchment' ? (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              )}
            </button>

            {/* Settings Modal Button (Themes & Fonts) */}
            <button
              id="settings-modal-btn"
              onClick={() => {
                playSystemSound('click');
                onOpenSettings();
              }}
              className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg bg-sky-950/40 border border-sky-500/40 text-sky-400 hover:text-white hover:bg-sky-500/20 hover:border-sky-400 transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
              title="Paramètres d'Affichage, Thèmes, Polices & Couleurs"
            >
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
              <span className="hidden xl:inline text-xs font-hud font-bold tracking-wide">Thèmes</span>
            </button>

            {/* Sunday Weekly Spiritual Report Button */}
            {onOpenWeeklyReport && (
              <button
                type="button"
                id="header-weekly-report-btn"
                onClick={() => {
                  playSystemSound('click');
                  onOpenWeeklyReport();
                }}
                className={`px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isSimulatedSunday || new Date().getDay() === 0
                    ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border-amber-400/60 text-amber-300 hover:text-white hover:bg-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40'
                }`}
                title="Bilan Spirituel Hebdomadaire (Rapport du Dimanche)"
              >
                <Crown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSimulatedSunday || new Date().getDay() === 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                <span className="hidden xl:inline text-xs font-hud font-bold tracking-wide">
                  {isSimulatedSunday || new Date().getDay() === 0 ? 'Bilan Dimanche' : 'Bilan Hebdo'}
                </span>
              </button>
            )}

            {/* Duolingo Daily Reminder Bell Button */}
            {onOpenReminderModal && (
              <button
                type="button"
                id="header-reminder-modal-btn"
                onClick={() => {
                  playSystemSound('click');
                  onOpenReminderModal();
                }}
                className={`p-1.5 sm:p-2 rounded-lg border transition-all relative ${
                  reminderSettings?.enabled
                    ? 'bg-amber-950/70 border-amber-500/40 text-amber-300 hover:text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/50'
                }`}
                title={`Rappels Quotidiens Style Duolingo (${reminderSettings?.enabled ? 'Actif à ' + reminderSettings.time : 'Désactivé'})`}
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {reminderSettings?.enabled && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </button>
            )}

            {/* Melodic Music Toggle Button */}
            <button
              id="header-music-toggle-btn"
              onClick={handleMusicToggle}
              className={`p-1.5 sm:p-2 rounded-lg border transition-all relative ${
                musicPlaying
                  ? 'bg-sky-950/80 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.4)] animate-pulse'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/50'
              }`}
              title={
                musicPlaying
                  ? `Mélodie en cours: ${musicTrack} (Cliquer pour mettre en pause)`
                  : 'Lancer la musique mélodique adaptative'
              }
            >
              <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {musicPlaying && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            {/* Audio Toggle Button */}
            <button
              id="audio-toggle-btn"
              onClick={handleAudioToggle}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/50 transition-colors"
              title={soundOn ? 'Désactiver les effets sonores' : 'Activer les effets sonores'}
            >
              {soundOn ? (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dedicated Solo Leveling HUD Strip (Guarantees Rank is 100% visible on any phone) */}
      <div className="md:hidden w-full bg-[#050810]/95 border-t border-b border-sky-950/60 px-3 py-1.5 flex items-center justify-between text-xs font-hud">
        {/* Hunter Rank Highlight */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            [ RANG ]
          </span>
          <span
            id="mobile-hud-rank-pill"
            className={`px-2 py-0.5 rounded font-hud font-bold text-xs uppercase tracking-wider border shadow-sm ${getRankBadgeColor(
              user.hunterRank
            )}`}
          >
            {user.hunterRank}
          </span>
        </div>

        {/* Level & XP Mini Indicator */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-400">
            NIV. <strong className="text-sky-300 font-bold">{user.level}</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-sky-400 font-medium">
            {xpPercent}% XP
          </span>
        </div>

        {/* Daily Stats Pill */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1 text-amber-300" title="Minutes de prière aujourd'hui">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{user.prayerMinutesToday}m</span>
          </div>
          <div className="flex items-center gap-1 text-sky-300" title="Chapitres de Bible lus aujourd'hui">
            <BookOpen className="w-3 h-3 text-sky-400" />
            <span>{user.bibleChaptersToday}ch</span>
          </div>
        </div>
      </div>
    </header>
  );
};
