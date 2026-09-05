import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Sparkles } from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface SystemAlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  rewardText?: string;
  type?: 'quest' | 'victory' | 'warning' | 'info';
  onClose: () => void;
}

export const SystemAlertModal: React.FC<SystemAlertModalProps> = ({
  isOpen,
  title,
  message,
  rewardText,
  type = 'quest',
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    playSystemSound('click');
    onClose();
  };

  const getBorderColor = () => {
    if (type === 'victory') return 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]';
    if (type === 'warning') return 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]';
    return 'border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.3)]';
  };

  const getHeaderBg = () => {
    if (type === 'victory') return 'bg-amber-950/60 text-amber-300';
    if (type === 'warning') return 'bg-red-950/60 text-red-300';
    return 'bg-sky-950/60 text-sky-300';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`relative w-full max-w-md rounded-2xl bg-[#090d16] border ${getBorderColor()} p-6 overflow-hidden system-corner`}
        >
          {/* Top System Header Label */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-900/30">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-400 animate-bounce" />
              <span className={`px-2 py-0.5 rounded text-xs font-hud tracking-widest uppercase font-bold ${getHeaderBg()}`}>
                [ NOTIFICATION DU SYSTÈME ]
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">#DIVINE-NOTICE</span>
          </div>

          {/* Title & Message */}
          <div className="space-y-3 my-4">
            <h3 className="font-hud text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <span>{title}</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {message}
            </p>

            {rewardText && (
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs font-hud tracking-wide text-sky-300">
                <span className="text-slate-400 uppercase mr-1">RÉCOMPENSE :</span>
                <span className="font-bold text-amber-300">{rewardText}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <button
              id="system-modal-confirm-btn"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-hud font-bold tracking-wider text-sm transition-all shadow-[0_0_15px_rgba(56,189,248,0.4)] flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>CONFIRMER & RECEVOIR</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
