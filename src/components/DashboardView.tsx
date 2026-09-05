import React from 'react';
import { HunterUser, Quest, DungeonBreak, DailyVerse, ActiveTab, ReminderSettings } from '../types';
import { getXpRequiredForLevel, getRankBadgeColor, getRankTextColor } from '../data/initialData';
import { Flame, BookOpen, Sparkles, Shield, ChevronRight, CheckCircle2, Clock, Plus, ArrowUpRight, Camera, CheckSquare, Skull, Network, Compass, ShieldCheck, User } from 'lucide-react';
import { playSystemSound } from '../utils/audio';
import { HunterAvatar } from './HunterAvatar';
import { StreakReminderBanner } from './StreakReminderBanner';
import { SundayReportBanner } from './SundayReportBanner';

interface DashboardViewProps {
  user: HunterUser;
  quests: Quest[];
  dungeons: DungeonBreak[];
  dailyVerse: DailyVerse;
  onNavigate: (tab: ActiveTab) => void;
  onIncrementStat: (type: 'prayer' | 'bible', amount: number) => void;
  onCompleteQuest: (questId: string) => void;
  onOpenPhotoModal?: () => void;
  onOpenPrayerAltar?: () => void;
  reminderSettings?: ReminderSettings;
  onOpenReminderModal?: () => void;
  onOpenWeeklyReport?: () => void;
  isSimulatedSunday?: boolean;
  onToggleSimulateSunday?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  quests,
  dungeons,
  dailyVerse,
  onNavigate,
  onIncrementStat,
  onCompleteQuest,
  onOpenPhotoModal,
  onOpenPrayerAltar,
  reminderSettings,
  onOpenReminderModal,
  onOpenWeeklyReport,
  isSimulatedSunday = false,
  onToggleSimulateSunday,
}) => {
  const xpNeeded = getXpRequiredForLevel(user.level);
  const xpPercent = Math.min(100, Math.round((user.currentXp / xpNeeded) * 100));

  const activeDungeon = dungeons.find((d) => d.active && !d.completed);
  const dailyQuests = quests.filter((q) => q.isDaily);
  const completedCount = dailyQuests.filter((q) => q.completedToday).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sunday Weekly Spiritual Report Banner */}
      {onOpenWeeklyReport && (
        <SundayReportBanner
          user={user}
          onOpenReport={onOpenWeeklyReport}
          isSimulatedSunday={isSimulatedSunday}
          onToggleSimulateSunday={onToggleSimulateSunday}
        />
      )}

      {/* Duolingo Streak Reminder Alert Banner */}
      {reminderSettings && onOpenReminderModal && (
        <StreakReminderBanner
          user={user}
          quests={quests}
          settings={reminderSettings}
          onOpenReminderModal={onOpenReminderModal}
          onNavigateToQuests={() => onNavigate('quests')}
          onOpenPrayerAltar={() => onOpenPrayerAltar ? onOpenPrayerAltar() : onNavigate('quests')}
        />
      )}

      {/* Top Banner: Verse of the Day (System Message HUD) */}
      <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-sky-950/50 via-[#0a0f1e] to-slate-950 border border-sky-500/30 system-corner shadow-[0_0_25px_rgba(56,189,248,0.15)]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-hud uppercase tracking-widest text-sky-400 bg-sky-950/80 border border-sky-500/40">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>RHEMA DU JOUR • {dailyVerse.theme}</span>
          </span>
          <span className="text-xs font-hud text-slate-400 font-medium">PAROLE DE PUISSANCE</span>
        </div>
        <blockquote className="font-biblical text-lg sm:text-xl text-slate-100 italic my-3 leading-relaxed">
          « {dailyVerse.text} »
        </blockquote>
        <div className="flex items-center justify-end">
          <cite className="not-italic text-sm font-hud text-amber-300 tracking-wider">
            — {dailyVerse.reference}
          </cite>
        </div>
      </div>

      {/* Main Hunter Status Card (Solo Leveling System Window) */}
      <div className="system-window rounded-2xl p-6 system-corner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-900/30">
          <div className="flex items-center gap-4">
            {onOpenPhotoModal ? (
              <button
                type="button"
                id="dashboard-avatar-edit-btn"
                onClick={() => {
                  playSystemSound('click');
                  onOpenPhotoModal();
                }}
                className="relative group focus:outline-none shrink-0"
                title="Changer votre photo de profil"
              >
                <HunterAvatar
                  avatar={user.avatar}
                  name={user.name}
                  rank={user.hunterRank}
                  size="lg"
                  showRankBorder={true}
                  showStatusDot={true}
                />
                <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-5 h-5 text-sky-400" />
                </div>
              </button>
            ) : (
              <HunterAvatar
                avatar={user.avatar}
                name={user.name}
                rank={user.hunterRank}
                size="lg"
                showRankBorder={true}
                showStatusDot={true}
              />
            )}

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-hud tracking-widest text-sky-400 uppercase">
                  [ FICHE DU CHASSEUR ]
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {/* Mobile Rank Badge inline with title */}
                <span
                  className={`inline-flex md:hidden px-2 py-0.5 rounded text-[11px] font-hud font-bold uppercase tracking-wider border ${getRankBadgeColor(
                    user.hunterRank
                  )}`}
                >
                  {user.hunterRank}
                </span>
              </div>
              <h1 className="font-hud text-2xl sm:text-3xl font-bold text-white tracking-wide">
                {user.name}
              </h1>
              <p className="font-biblical text-sm text-sky-300 font-semibold">
                « {user.spiritualTitle} »
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 w-full md:w-auto md:flex md:items-center">
            <div
              className={`px-4 py-2.5 rounded-xl bg-slate-950/90 border text-center shadow-md ${getRankBadgeColor(
                user.hunterRank
              )}`}
            >
              <span className="text-[10px] font-hud uppercase text-slate-400 block tracking-wider">
                RANG ACTUEL
              </span>
              <span className={`font-hud text-xl font-bold ${getRankTextColor(user.hunterRank)}`}>
                {user.hunterRank}
              </span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-950/90 border border-sky-800/60 text-center shadow-[0_0_12px_rgba(56,189,248,0.2)]">
              <span className="text-[10px] font-hud uppercase text-slate-400 block tracking-wider">
                NIVEAU
              </span>
              <span className="font-hud text-xl font-bold text-sky-300">LVL {user.level}</span>
            </div>
          </div>
        </div>

        {/* XP Level Progression Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-xs font-hud">
            <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              EXPÉRIENCE SPIRITUELLE (XP)
            </span>
            <span className="text-sky-300 font-semibold">
              {user.currentXp} / {xpNeeded} XP ({xpPercent}%)
            </span>
          </div>

          <div className="relative h-4 w-full bg-slate-950 rounded-full border border-sky-900/40 p-0.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 rounded-full transition-all duration-700 shadow-[0_0_12px_#38bdf8]"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-hud">
            <span>NIVEAU {user.level}</span>
            <span>PROCHAIN ÉVEIL : {Math.max(0, xpNeeded - user.currentXp)} XP REQUIS</span>
            <span>NIVEAU {user.level + 1}</span>
          </div>
        </div>
      </div>

      {/* 4 Daily HUD Stat Meters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Prière */}
        <div className="p-4 rounded-xl bg-[#0b0f19] border border-amber-500/20 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-hud text-slate-400 uppercase">PRIÈRE MATINALE</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-hud text-2xl font-bold text-amber-300 mb-1">
            {user.prayerMinutesToday} <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <button
              onClick={() => onIncrementStat('prayer', 5)}
              className="px-2 py-1 rounded text-[11px] font-hud font-bold bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> 5m
            </button>
            <button
              onClick={() => onIncrementStat('prayer', 15)}
              className="px-2 py-1 rounded text-[11px] font-hud font-bold bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> 15m
            </button>
            {onOpenPrayerAltar && (
              <button
                type="button"
                onClick={() => {
                  playSystemSound('click');
                  onOpenPrayerAltar();
                }}
                className="px-2 py-1 rounded text-[11px] font-hud font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 flex items-center gap-1 transition-all"
                title="Ouvrir le chronomètre du Lieu Secret"
              >
                <Clock className="w-3 h-3" /> Autel
              </button>
            )}
          </div>
        </div>

        {/* Stat 2: Bible */}
        <div className="p-4 rounded-xl bg-[#0b0f19] border border-sky-500/20 hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-hud text-slate-400 uppercase">LECTURE BIBLIQUE</span>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-hud text-2xl font-bold text-sky-300 mb-1">
            {user.bibleChaptersToday} <span className="text-sm font-normal text-slate-400">chap.</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => onIncrementStat('bible', 1)}
              className="px-2 py-1 rounded text-[11px] font-hud font-bold bg-sky-950/50 hover:bg-sky-900/60 text-sky-300 border border-sky-500/30 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> +1 chap
            </button>
          </div>
        </div>

        {/* Stat 3: Jeûne */}
        <div className="p-4 rounded-xl bg-[#0b0f19] border border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-hud text-slate-400 uppercase">STREAK JEÛNE</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-hud text-2xl font-bold text-purple-300 mb-1">
            {user.fastingDaysStreak} <span className="text-sm font-normal text-slate-400">jours</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-2">
            Consécration active
          </p>
        </div>

        {/* Stat 4: Victoire Pureté */}
        <div className="p-4 rounded-xl bg-[#0b0f19] border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-hud text-slate-400 uppercase">PURETÉ & COMBAT</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-hud text-2xl font-bold text-emerald-300 mb-1">
            {user.generalViceStreak} <span className="text-sm font-normal text-slate-400">jours</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-2">
            Victoire sans compromis
          </p>
        </div>
      </div>

      {/* Active Dungeon Break Banner (if any) */}
      {activeDungeon && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-purple-950/20 border border-purple-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-900/30 border border-purple-400/40 text-purple-300">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-hud uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30 font-bold">
                  {activeDungeon.rank} EN COURS
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Jour {activeDungeon.currentDay} sur {activeDungeon.durationDays}
                </span>
              </div>
              <h4 className="font-hud font-bold text-white text-sm sm:text-base mt-0.5">
                {activeDungeon.name}
              </h4>
            </div>
          </div>

          <button
            onClick={() => onNavigate('dungeons')}
            className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-xs font-hud font-bold flex items-center gap-1 transition-all"
          >
            <span>PORTAIL</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Access Hub to All Modules (Guarantees 100% visibility & instant access on mobile) */}
      <div className="rounded-2xl bg-[#080c16] border border-sky-950/60 p-4 sm:p-5 space-y-3 system-corner shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-hud text-sky-400 tracking-wider uppercase block">
              [ DIRECTOIRE DU CHASSEUR ]
            </span>
            <h3 className="font-hud text-base sm:text-lg font-bold text-white tracking-wide">
              Tous les Modules BloomVerse
            </h3>
          </div>
          <span className="text-[11px] font-hud text-slate-500 uppercase">7 Modules Actifs</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {/* 1. Quêtes */}
          <button
            type="button"
            id="dash-quick-quests-btn"
            onClick={() => {
              playSystemSound('click');
              onNavigate('quests');
            }}
            className="p-3 rounded-xl bg-slate-950/80 border border-sky-900/40 hover:border-sky-500/50 flex flex-col items-start gap-1.5 transition-all group text-left cursor-pointer active:scale-98"
          >
            <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-400 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="font-hud font-bold text-xs text-white block group-hover:text-sky-300">
                Quêtes & Défis
              </span>
              <span className="text-[10px] text-slate-400 font-sans">Directives & XP</span>
            </div>
          </button>

          {/* 2. Armée des Ombres */}
          <button
            type="button"
            id="dash-quick-shadows-btn"
            onClick={() => {
              playSystemSound('click');
              onNavigate('shadows');
            }}
            className="p-3 rounded-xl bg-slate-950/80 border border-red-950/50 hover:border-red-500/50 flex flex-col items-start gap-1.5 transition-all group text-left cursor-pointer active:scale-98"
          >
            <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/30 text-red-400 group-hover:scale-105 transition-transform">
              <Skull className="w-4 h-4" />
            </div>
            <div>
              <span className="font-hud font-bold text-xs text-white block group-hover:text-red-300">
                Armée des Ombres
              </span>
              <span className="text-[10px] text-slate-400 font-sans">Combat des Vices</span>
            </div>
          </button>

          {/* 3. Arbre des Dons */}
          <button
            type="button"
            id="dash-quick-skills-btn"
            onClick={() => {
              playSystemSound('click');
              onNavigate('skills');
            }}
            className="p-3 rounded-xl bg-slate-950/80 border border-amber-950/50 hover:border-amber-500/50 flex flex-col items-start gap-1.5 transition-all group text-left cursor-pointer active:scale-98"
          >
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <span className="font-hud font-bold text-xs text-white block group-hover:text-amber-300">
                Arbre des Dons
              </span>
              <span className="text-[10px] text-slate-400 font-sans">Compétences 1 Cor 12</span>
            </div>
          </button>

          {/* 4. Portails & Donjons */}
          <button
            type="button"
            id="dash-quick-dungeons-btn"
            onClick={() => {
              playSystemSound('click');
              onNavigate('dungeons');
            }}
            className="p-3 rounded-xl bg-slate-950/80 border border-purple-950/50 hover:border-purple-500/50 flex flex-col items-start gap-1.5 transition-all group text-left cursor-pointer active:scale-98"
          >
            <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-400 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-hud font-bold text-xs text-white block group-hover:text-purple-300">
                Portails Éthérés
              </span>
              <span className="text-[10px] text-slate-400 font-sans">Donjons & Jeûne</span>
            </div>
          </button>

          {/* 5. Arsenal Céleste */}
          <button
            type="button"
            id="dash-quick-inventory-btn"
            onClick={() => {
              playSystemSound('click');
              onNavigate('inventory');
            }}
            className="p-3 rounded-xl bg-slate-950/80 border border-emerald-950/50 hover:border-emerald-500/50 flex flex-col items-start gap-1.5 transition-all group text-left cursor-pointer active:scale-98"
          >
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-hud font-bold text-xs text-white block group-hover:text-emerald-300">
                Arsenal Céleste
              </span>
              <span className="text-[10px] text-slate-400 font-sans">Épées & Armures</span>
            </div>
          </button>

          {/* 6. Profil & Rang */}
          <button
            type="button"
            id="dash-quick-profile-btn"
            onClick={() => {
              playSystemSound('click');
              onNavigate('profile');
            }}
            className="p-3 rounded-xl bg-slate-950/80 border border-sky-950/50 hover:border-sky-500/50 flex flex-col items-start gap-1.5 transition-all group text-left cursor-pointer active:scale-98"
          >
            <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-400 group-hover:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="font-hud font-bold text-xs text-white block group-hover:text-sky-300">
                Profil & Titres
              </span>
              <span className="text-[10px] text-slate-400 font-sans">Rang {user.hunterRank} • Badges</span>
            </div>
          </button>
        </div>
      </div>

      {/* Quêtes du Jour Overview */}
      <div className="rounded-2xl bg-[#090d16] border border-sky-950/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
              [ DIRECTIVES DU SYSTÈME ]
            </span>
            <h3 className="font-hud text-lg font-bold text-white tracking-wide">
              Quêtes Quotidiennes ({completedCount}/{dailyQuests.length})
            </h3>
          </div>

          <button
            onClick={() => onNavigate('quests')}
            className="text-xs font-hud font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
          >
            <span>VOIR TOUTES LES QUÊTES</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dailyQuests.slice(0, 4).map((quest) => (
            <div
              key={quest.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                quest.completedToday
                  ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70'
                  : 'bg-slate-950/60 border-sky-900/40 hover:border-sky-500/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-hud font-bold text-white">
                    {quest.title}
                  </span>
                  <span className="text-[10px] font-hud px-1.5 py-0.2 rounded bg-sky-950 border border-sky-500/30 text-sky-300">
                    +{quest.xpReward} XP
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 font-sans">
                  {quest.description}
                </p>
              </div>

              <button
                disabled={quest.completedToday}
                onClick={() => {
                  playSystemSound('click');
                  onCompleteQuest(quest.id);
                }}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  quest.completedToday
                    ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-sky-400 bg-slate-900 border border-slate-800 hover:border-sky-500/40'
                }`}
                title={quest.completedToday ? 'Quête déjà complétée' : 'Valider la quête'}
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
