import React, { useState } from 'react';
import { HunterUser, Quest, ReminderSettings } from '../types';
import { Flame, Bell, ChevronRight, X, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface StreakReminderBannerProps {
  user: HunterUser;
  quests: Quest[];
  settings: ReminderSettings;
  onOpenReminderModal: () => void;
  onNavigateToQuests: () => void;
  onOpenPrayerAltar: () => void;
}

export const StreakReminderBanner: React.FC<StreakReminderBannerProps> = ({
  user,
  quests,
  settings,
  onOpenReminderModal,
  onNavigateToQuests,
  onOpenPrayerAltar,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!settings.streakAlertEnabled || isDismissed) return null;

  const uncompletedQuests = quests.filter((q) => !q.completedToday).length;
  const streak = user.generalViceStreak > 0 ? user.generalViceStreak : 1;
  const prayerDone = user.prayerMinutesToday >= 15;
  const allDone = uncompletedQuests === 0 && prayerDone;

  // Don't show warning if everything is completed today, unless we want to show a celebratory streak shield
  if (allDone) {
    return (
      <div
        id="streak-complete-banner"
        className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-sky-950/60 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-between gap-3 flex-wrap animate-in fade-in"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-xl shrink-0 shadow-inner">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-hud font-bold uppercase tracking-wider text-emerald-400">
                SÉRIE DU JOUR SÉCURISÉE
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs text-white font-medium">
              Flamme spirituelle de <span className="text-emerald-300 font-bold font-hud">{streak} jours</span> protégée !
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playSystemSound('click');
            onOpenReminderModal();
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 text-xs font-hud font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Rappels ({settings.time})</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="streak-warning-banner"
      className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-red-950/50 to-slate-900 border-2 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-between gap-4 flex-wrap animate-in slide-in-from-top-2 relative overflow-hidden"
    >
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

      {/* Left side: Mascot & Message */}
      <div className="flex items-center gap-3.5 min-w-[260px] flex-1">
        {/* Duolingo style animated mascot icon */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-red-500 border-2 border-amber-300/80 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse">
            🦉
          </div>
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-black border border-amber-400 text-[9px] font-hud font-bold text-amber-300">
            {streak}j
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-hud font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400 animate-bounce" />
              SÉRIE EN JEU ({streak} JOURS)
            </span>
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              • Rappel {settings.time}
            </span>
          </div>

          <h4 className="font-hud font-bold text-white text-sm">
            {uncompletedQuests > 0
              ? `Il vous reste ${uncompletedQuests} quête(s) du jour pour protéger votre flamme !`
              : `Consacrez 10 min de prière à l'autel pour valider votre journée !`}
          </h4>

          <p className="text-[11px] text-slate-300 font-sans">
            {settings.tone === 'duolingo'
              ? 'Le hibou du Système vous observe : ne laissez pas vos efforts s’éteindre ce soir.'
              : 'Directive du Système : accomplissez vos quêtes avant minuit.'}
          </p>
        </div>
      </div>

      {/* Right side: Quick Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {!prayerDone && (
          <button
            type="button"
            onClick={() => {
              playSystemSound('click');
              onOpenPrayerAltar();
            }}
            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-hud font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Ouvrir le chronomètre du Lieu Secret"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prier (Autel)</span>
          </button>
        )}

        {uncompletedQuests > 0 && (
          <button
            type="button"
            onClick={() => {
              playSystemSound('click');
              onNavigateToQuests();
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-hud font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-95"
          >
            <span>Quêtes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Reminder Settings Icon */}
        <button
          type="button"
          onClick={() => {
            playSystemSound('click');
            onOpenReminderModal();
          }}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
          title="Configurer le rappel de notification quotidien"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Dismiss for session */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          title="Masquer le rappel pour le moment"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
