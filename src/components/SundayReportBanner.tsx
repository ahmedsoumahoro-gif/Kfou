import React from 'react';
import { Crown, Sparkles, ChevronRight, Calendar, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { HunterUser } from '../types';
import { isTodaySunday, formatMinutesToHours } from '../utils/weeklyReport';
import { playSystemSound } from '../utils/audio';

interface SundayReportBannerProps {
  user: HunterUser;
  onOpenReport: () => void;
  isSimulatedSunday?: boolean;
  onToggleSimulateSunday?: () => void;
}

export const SundayReportBanner: React.FC<SundayReportBannerProps> = ({
  user,
  onOpenReport,
  isSimulatedSunday = false,
  onToggleSimulateSunday,
}) => {
  const isRealSunday = isTodaySunday(false);
  const isSunday = isRealSunday || isSimulatedSunday;

  return (
    <div
      id="sunday-weekly-report-banner"
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isSunday
          ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-sky-950/70 border-amber-500/50 shadow-[0_0_25px_rgba(251,191,36,0.2)]'
          : 'bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-950 border-sky-500/30'
      }`}
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`p-3 rounded-xl border shrink-0 flex items-center justify-center ${
              isSunday
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                : 'bg-sky-500/20 border-sky-400/50 text-sky-300'
            }`}
          >
            <Crown className={`w-6 h-6 ${isSunday ? 'animate-pulse text-amber-400' : 'text-sky-400'}`} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-hud font-bold uppercase tracking-wider ${
                  isSunday
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                }`}
              >
                {isSunday ? '☀️ JOUR DU SEIGNEUR (DIMANCHE)' : 'RAPPORT DU DIMANCHE'}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-hud">
                <Calendar className="w-3 h-3 text-sky-400" />
                Bilan Spirituel Hebdomadaire
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-hud font-bold text-white tracking-wide flex items-center gap-1.5">
              {isSunday
                ? 'Votre Bilan Spirituel de la Semaine est Prêt !'
                : 'Consultez votre Bilan de la Semaine'}
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>

            <p className="text-xs text-slate-300 max-w-xl">
              {isSunday
                ? 'Temps passé dans la présence de Dieu, chapitres proclamés, quêtes scellées et évaluation du Système avec graphiques visuels.'
                : 'Découvrez vos graphiques de progression et votre évaluation spirituelle hebdomadaire.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          {onToggleSimulateSunday && !isRealSunday && (
            <button
              type="button"
              id="toggle-simulate-sunday-btn"
              onClick={() => {
                playSystemSound('click');
                onToggleSimulateSunday();
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-hud font-semibold border transition-colors ${
                isSimulatedSunday
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Tester le mode dimanche"
            >
              {isSimulatedSunday ? 'Mode Dimanche Activé' : 'Simuler le Dimanche'}
            </button>
          )}

          <button
            type="button"
            id="open-weekly-report-btn"
            onClick={() => {
              playSystemSound('click');
              onOpenReport();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-hud font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isSunday
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
            }`}
          >
            <span>Ouvrir le Rapport</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
