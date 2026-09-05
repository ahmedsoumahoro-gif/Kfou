import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Award, ChevronUp, Crown, Sparkles } from 'lucide-react';
import { HunterRank } from '../types';
import { playSystemSound } from '../utils/audio';

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  newRank: HunterRank;
  newTitle: string;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  newLevel,
  newRank,
  newTitle,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      playSystemSound('level_up');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#ffffff', '#a855f7'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#14120a] to-[#0a0d16] border-2 border-amber-400 p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(251,191,36,0.35)] system-corner overflow-hidden"
        >
          {/* Top Level Up Icon */}
          <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.5)]">
            <Crown className="w-10 h-10 text-amber-300 animate-pulse" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute inset-0 border-2 border-dashed border-amber-400/30 rounded-2xl pointer-events-none"
            />
          </div>

          {/* System Subtitle */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-[11px] font-hud uppercase tracking-widest text-amber-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ÉVEIL SPIRITUEL VALIDÉ</span>
          </div>

          <h2 className="font-hud text-3xl font-extrabold text-white tracking-wider glow-gold mb-1">
            LEVEL UP !
          </h2>

          <p className="text-slate-400 text-xs font-sans mb-6">
            Votre communion avec le Seigneur s'est approfondie. Votre autorité spirituelle augmente.
          </p>

          {/* New Stats Display Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-hud text-slate-400 uppercase">NOUVEAU NIVEAU</span>
              <div className="flex items-center gap-1 text-amber-300 font-hud font-bold text-xl">
                <ChevronUp className="w-5 h-5 text-amber-400 animate-bounce" />
                <span>NIVEAU {newLevel}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-2">
              <span className="text-xs font-hud text-slate-400 uppercase">RANG DE CHASSEUR</span>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400 font-hud font-bold text-xs uppercase">
                {newRank}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-2">
              <span className="text-xs font-hud text-slate-400 uppercase">TITRE SPIRITUEL</span>
              <span className="text-xs font-biblical text-sky-300 font-bold">
                « {newTitle} »
              </span>
            </div>
          </div>

          <button
            id="level-up-claim-btn"
            onClick={() => {
              playSystemSound('click');
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-hud font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>REVÊTIR LA NOUVELLE GRÂCE</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
