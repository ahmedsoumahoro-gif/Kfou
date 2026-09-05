import React, { useState } from 'react';
import { Skill, SkillBranch, HunterUser } from '../types';
import { Network, Lock, CheckCircle2, Flame, BookOpen, Heart, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface SkillTreeViewProps {
  skills: Skill[];
  user: HunterUser;
  onUnlockSkill: (skillId: string) => void;
}

export const SkillTreeView: React.FC<SkillTreeViewProps> = ({
  skills,
  user,
  onUnlockSkill,
}) => {
  const [activeBranch, setActiveBranch] = useState<SkillBranch>('PRIÈRE');

  const branches: { id: SkillBranch; label: string; icon: React.ReactNode }[] = [
    { id: 'PRIÈRE', label: 'Prière Fervente', icon: <Flame className="w-4 h-4 text-amber-400" /> },
    { id: 'ÉTUDE', label: 'Étude Biblique', icon: <BookOpen className="w-4 h-4 text-sky-400" /> },
    { id: 'SERVICE', label: 'Service & Amour', icon: <Heart className="w-4 h-4 text-emerald-400" /> },
    { id: 'PURETÉ', label: 'Pureté & Intégrité', icon: <ShieldCheck className="w-4 h-4 text-purple-400" /> },
  ];

  const branchSkills = skills
    .filter((s) => s.branch === activeBranch)
    .sort((a, b) => a.tier - b.tier);

  const unlockedCount = skills.filter((s) => s.unlocked).length;
  const totalCount = skills.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="system-window rounded-2xl p-6 system-corner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-hud tracking-widest text-sky-400 uppercase">
                [ ARBRE DES DONS SPIRITUELS ]
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-hud bg-sky-950 text-sky-300 rounded border border-sky-500/30 uppercase">
                1 CORINTHIENS 12
              </span>
            </div>
            <h1 className="font-hud text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Compétences & Ministères
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
              Débloquez les capacités spirituelles par la fidélité dans la prière et la parole. Chaque palier confère un titre honorifique.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-sky-800/40 text-center sm:text-right">
            <span className="text-[10px] font-hud uppercase text-slate-400 block">DONS ACTIVÉS</span>
            <span className="font-hud text-xl font-bold text-sky-300">
              {unlockedCount} / {totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Branch Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => {
              playSystemSound('click');
              setActiveBranch(b.id);
            }}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-hud text-xs sm:text-sm font-bold tracking-wider uppercase transition-all ${
              activeBranch === b.id
                ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {b.icon}
            <span>{b.label}</span>
          </button>
        ))}
      </div>

      {/* Tier Progression Cards */}
      <div className="space-y-4">
        {branchSkills.map((skill, index) => {
          const canUnlock =
            !skill.unlocked &&
            user.totalXp >= skill.xpRequired &&
            (!skill.prerequisiteCode ||
              skills.find((s) => s.code === skill.prerequisiteCode)?.unlocked);

          return (
            <div
              key={skill.id}
              className={`relative rounded-2xl border p-5 transition-all overflow-hidden ${
                skill.unlocked
                  ? 'bg-gradient-to-r from-[#0a1322] via-[#090d16] to-[#0a1322] border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                  : canUnlock
                  ? 'bg-[#0f1422] border-amber-500/40 animate-pulse'
                  : 'bg-[#090c12]/60 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-hud font-bold bg-slate-900 border border-slate-700 text-slate-300 uppercase">
                      TIER {skill.tier}
                    </span>
                    <h3 className="font-hud text-lg font-bold text-white tracking-wide">
                      {skill.name}
                    </h3>
                    {skill.unlocked && (
                      <span className="flex items-center gap-1 text-[11px] font-hud text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> DÉBLOQUÉ
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                    {skill.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-hud">
                    <span className="text-amber-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Titre conféré : « {skill.titleUnlocked} »
                    </span>
                    <span className="text-slate-400">
                      Requis : {skill.xpRequired} XP Cumulée
                    </span>
                  </div>
                </div>

                {/* Unlock Button / Status */}
                <div className="flex-shrink-0">
                  {skill.unlocked ? (
                    <div className="px-4 py-2 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-300 font-hud text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>ACTIF</span>
                    </div>
                  ) : canUnlock ? (
                    <button
                      onClick={() => {
                        playSystemSound('quest_complete');
                        onUnlockSkill(skill.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-hud font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                    >
                      DÉBLOQUER CE DON
                    </button>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-hud text-xs flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>VERROUILLÉ ({skill.xpRequired} XP)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
