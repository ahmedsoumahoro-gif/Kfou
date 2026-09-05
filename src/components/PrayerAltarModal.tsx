import React, { useState, useEffect, useRef } from 'react';
import { Flame, Clock, Play, Pause, RotateCcw, CheckCircle2, Sparkles, X, Volume2 } from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface PrayerAltarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogPrayerMinutes: (minutes: number) => void;
}

const PRESET_MINUTES = [5, 15, 30, 60];

const PRAYER_VERSES = [
  { text: 'Priez sans cesse. Rendez grâces en toutes choses, car c\'est à votre égard la volonté de Dieu en Jésus-Christ.', ref: '1 Thessaloniciens 5:17-18' },
  { text: 'Mais quand tu pries, entre dans ta chambre, ferme ta porte, et prie ton Père qui est là dans le lieu secret...', ref: 'Matthieu 6:6' },
  { text: 'La prière fervente du juste a une grande efficace.', ref: 'Jacques 5:16' },
  { text: 'Invoque-moi au jour de la détresse; je te délivrerai, et tu me glorifieras.', ref: 'Psaume 50:15' },
  { text: 'Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications...', ref: 'Philippiens 4:6' },
];

export const PrayerAltarModal: React.FC<PrayerAltarModalProps> = ({
  isOpen,
  onClose,
  onLogPrayerMinutes,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);

  const initialSeconds = selectedMinutes * 60;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setIsActive(false);
            setSessionCompleted(true);
            playSystemSound('bell');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining]);

  // Rotate prayer verse every 45s during prayer
  useEffect(() => {
    if (!isActive) return;
    const verseInterval = setInterval(() => {
      setCurrentVerseIndex((prev) => (prev + 1) % PRAYER_VERSES.length);
    }, 45000);
    return () => clearInterval(verseInterval);
  }, [isActive]);

  if (!isOpen) return null;

  const handleSelectMinutes = (mins: number) => {
    if (isActive) return;
    playSystemSound('click');
    setSelectedMinutes(mins);
    setSecondsRemaining(mins * 60);
    setSessionCompleted(false);
  };

  const toggleTimer = () => {
    playSystemSound('click');
    setIsActive((prev) => !prev);
  };

  const handleReset = () => {
    playSystemSound('click');
    setIsActive(false);
    setSecondsRemaining(initialSeconds);
    setSessionCompleted(false);
  };

  const handleValidateSession = () => {
    playSystemSound('quest_complete');
    onLogPrayerMinutes(selectedMinutes);
    onClose();
    setSessionCompleted(false);
    setIsActive(false);
    setSecondsRemaining(selectedMinutes * 60);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = ((initialSeconds - secondsRemaining) / initialSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#080d16] border border-amber-500/40 p-6 system-corner shadow-[0_0_50px_rgba(245,158,11,0.2)] text-white space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-hud text-amber-400 tracking-widest uppercase block">
                [ LIEU SECRET • AUTEL DE PRIÈRE ]
              </span>
              <h3 className="font-hud text-xl font-bold tracking-wide">
                Chronomètre de Consécration
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              playSystemSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset duration buttons */}
        {!sessionCompleted && (
          <div className="flex items-center justify-center gap-2">
            {PRESET_MINUTES.map((mins) => (
              <button
                key={mins}
                disabled={isActive}
                onClick={() => handleSelectMinutes(mins)}
                className={`px-3.5 py-1.5 rounded-xl font-hud font-bold text-xs uppercase tracking-wider transition-all ${
                  selectedMinutes === mins
                    ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50'
                }`}
              >
                {mins} MIN
              </button>
            ))}
          </div>
        )}

        {/* Circular Display / Countdown */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-800/80"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-amber-400 transition-all duration-1000 ease-linear"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Time readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-hud text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-hud text-amber-400 uppercase tracking-widest mt-1">
                {isActive ? 'INTERCESSION ACTIVE' : sessionCompleted ? 'CONSÉCRATION ACCOMPLIE' : 'AUTEL PRÊT'}
              </span>
            </div>
          </div>
        </div>

        {/* Inspirational Verse HUD */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-900/30 text-center space-y-1">
          <p className="font-biblical text-xs text-amber-100/90 italic leading-relaxed">
            « {PRAYER_VERSES[currentVerseIndex].text} »
          </p>
          <span className="text-[10px] font-hud text-amber-400 uppercase block">
            — {PRAYER_VERSES[currentVerseIndex].ref}
          </span>
        </div>

        {/* Action Controls */}
        <div className="pt-2">
          {sessionCompleted ? (
            <button
              onClick={handleValidateSession}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>VALIDER ET ENREGISTRER (+{selectedMinutes} MIN & XP)</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Réinitialiser le chronomètre"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={toggleTimer}
                className={`flex-1 py-3 rounded-xl font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer ${
                  isActive
                    ? 'bg-amber-950/80 border border-amber-500 text-amber-300'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>METTRE EN PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>COMMENCER L'INTERCESSION</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
