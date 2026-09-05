import React from 'react';
import { DungeonBreak } from '../types';
import { Compass, Flame, BookOpen, WifiOff, Award, CheckCircle, ChevronRight, Play, Shield } from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface DungeonBreaksViewProps {
  dungeons: DungeonBreak[];
  onStartDungeon: (dungeonId: string) => void;
  onAdvanceDungeonDay: (dungeonId: string) => void;
}

export const DungeonBreaksView: React.FC<DungeonBreaksViewProps> = ({
  dungeons,
  onStartDungeon,
  onAdvanceDungeonDay,
}) => {
  const getRankBadge = (rank: DungeonBreak['rank']) => {
    switch (rank) {
      case 'Rank S':
        return 'bg-red-500/20 text-red-300 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
      case 'Rank A':
        return 'bg-orange-500/20 text-orange-300 border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]';
      case 'Rank B':
        return 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
    }
  };

  const getDungeonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-6 h-6 text-amber-400" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-sky-400" />;
      default:
        return <WifiOff className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="system-window rounded-2xl p-6 system-corner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-hud tracking-widest text-purple-400 uppercase">
                [ PORTAILS DE DÉFIS SPIRITUELS ]
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-hud bg-purple-950 text-purple-300 rounded border border-purple-500/30 uppercase">
                DUNGEON BREAK
              </span>
            </div>
            <h1 className="font-hud text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Portails Majeurs & Consécrations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
              Engagez-vous dans des épreuves intensives de consécration (jeûnes prolongés, marathons d'écriture, jeûnes médiatiques) pour débloquer des récompenses divines épiques.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300">
            <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
        </div>
      </div>

      {/* Dungeons List */}
      <div className="space-y-4">
        {dungeons.map((dungeon) => {
          const progressPercent = Math.min(
            100,
            Math.round((dungeon.currentDay / dungeon.durationDays) * 100)
          );

          return (
            <div
              key={dungeon.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                dungeon.completed
                  ? 'bg-[#080d12]/70 border-emerald-500/30 opacity-80'
                  : dungeon.active
                  ? 'bg-gradient-to-r from-[#110a1f] via-[#090d16] to-[#110a1f] border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.2)]'
                  : 'bg-[#090d16] border-slate-800/80 hover:border-purple-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0">
                    {getDungeonIcon(dungeon.icon)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-hud font-bold border uppercase tracking-wider ${getRankBadge(dungeon.rank)}`}>
                        {dungeon.rank}
                      </span>
                      <h3 className="font-hud text-lg sm:text-xl font-bold text-white tracking-wide">
                        {dungeon.name}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                      {dungeon.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-hud">
                      <span className="text-amber-300">
                        Récompense : +{dungeon.xpReward} XP
                      </span>
                      <span className="text-purple-300 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        Badge : « {dungeon.badgeReward} »
                      </span>
                      <span className="text-slate-400 font-mono">
                        Verset clé : {dungeon.verse}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                  {dungeon.completed ? (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-hud text-xs font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>PORTAIL CONQUIS</span>
                    </div>
                  ) : dungeon.active ? (
                    <button
                      onClick={() => {
                        playSystemSound('click');
                        onAdvanceDungeonDay(dungeon.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-hud font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>VALIDER JOUR {dungeon.currentDay + 1}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playSystemSound('portal');
                        onStartDungeon(dungeon.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4" />
                      <span>FRANCHIR LE PORTAIL</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar if active or completed */}
              {(dungeon.active || dungeon.completed) && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between text-xs font-hud">
                    <span className="text-slate-400">
                      JOUR {dungeon.currentDay} SUR {dungeon.durationDays}
                    </span>
                    <span className="text-purple-300 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-sky-400 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
