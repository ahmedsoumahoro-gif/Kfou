import React, { useState, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { musicEngine, MELODY_TRACKS, MelodyThemeId } from '../utils/musicEngine';
import { playSystemSound } from '../utils/audio';

interface MelodyPlayerWidgetProps {
  currentTab: string;
}

export const MelodyPlayerWidget: React.FC<MelodyPlayerWidgetProps> = ({ currentTab }) => {
  const [status, setStatus] = useState(() => musicEngine.getStatus());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMinimized, setIsMobileMinimized] = useState(true);

  useEffect(() => {
    // Notify engine of tab change so it auto-adapts if on 'auto' mode
    musicEngine.onContextChange(currentTab);
  }, [currentTab]);

  useEffect(() => {
    const unsub = musicEngine.subscribe(() => {
      setStatus(musicEngine.getStatus());
    });
    return unsub;
  }, []);

  const handleTogglePlay = () => {
    playSystemSound('click');
    musicEngine.togglePlay(currentTab);
  };

  const handleNextTrack = () => {
    playSystemSound('click');
    const allKeys: MelodyThemeId[] = [
      'auto',
      'lofi_sanctuary',
      'quest_synthwave',
      'dungeon_battle',
      'shadow_monarch',
      'celestial_praise',
    ];
    const currentIndex = allKeys.indexOf(status.currentTrackId);
    const nextIndex = (currentIndex + 1) % allKeys.length;
    musicEngine.selectTrack(allKeys[nextIndex], currentTab);
  };

  const handleSelectTrack = (id: MelodyThemeId) => {
    playSystemSound('click');
    musicEngine.selectTrack(id, currentTab);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    musicEngine.setVolume(val);
  };

  // If minimized on mobile, display a small floating audio pill that NEVER blocks modules
  if (isMobileMinimized) {
    return (
      <div
        id="bloomverse-melody-pill"
        className="fixed bottom-20 right-3 z-30 flex items-center gap-1.5 p-1.5 pl-2.5 rounded-full bg-slate-950/90 border border-sky-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.7),0_0_12px_rgba(56,189,248,0.25)] backdrop-blur-md transition-all hover:scale-105 active:scale-95"
      >
        <button
          type="button"
          onClick={handleTogglePlay}
          className="flex items-center gap-1.5 text-xs font-hud font-bold text-sky-300"
          title={status.isPlaying ? 'Mettre la musique en pause' : 'Lancer la musique'}
        >
          {status.isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-1 bg-sky-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3.5" />
              <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s] h-2.5" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.2s] h-3" />
            </div>
          ) : (
            <Music className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="text-[11px] truncate max-w-[80px] sm:max-w-[120px]">
            {status.isPlaying ? status.trackInfo.title.split(' ')[0] : 'Musique'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsMobileMinimized(false)}
          className="p-1 rounded-full bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300"
          title="Agrandir le lecteur de mélodies"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      id="bloomverse-melody-player"
      className="fixed bottom-20 sm:bottom-4 right-3 sm:right-6 z-40 max-w-[320px] sm:max-w-[380px] w-full transition-all"
    >
      <div className="rounded-2xl bg-slate-950/95 border border-sky-500/40 shadow-[0_4px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(56,189,248,0.2)] backdrop-blur-md overflow-hidden">
        {/* Compact Header Bar */}
        <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
          {/* Left: Icon & Equalizer or Status */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              id="melody-player-toggle-btn"
              onClick={handleTogglePlay}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/25 transition-transform active:scale-95"
              title={status.isPlaying ? 'Mettre en pause' : 'Lancer la musique mélodique'}
            >
              {status.isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-hud font-bold text-white truncate">
                  {status.trackInfo.icon} {status.trackInfo.title}
                </span>
                {status.isAuto && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-hud font-bold uppercase bg-sky-950 text-sky-300 border border-sky-500/40 shrink-0">
                    AUTO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 truncate font-sans">
                <span>{status.trackInfo.genre}</span>
                <span>•</span>
                <span>{status.trackInfo.bpm} BPM</span>
              </div>
            </div>
          </div>

          {/* Right: Controls & Minimize Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Animated Equalizer Bars */}
            <div className="flex items-end gap-0.5 h-5 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
              <div
                className={`w-1 rounded-full bg-sky-400 transition-all ${
                  status.isPlaying ? 'animate-[pulse_0.6s_ease-in-out_infinite] h-4' : 'h-1.5'
                }`}
              />
              <div
                className={`w-1 rounded-full bg-amber-400 transition-all ${
                  status.isPlaying ? 'animate-[pulse_0.4s_ease-in-out_infinite_0.1s] h-3' : 'h-1'
                }`}
              />
              <div
                className={`w-1 rounded-full bg-emerald-400 transition-all ${
                  status.isPlaying ? 'animate-[pulse_0.8s_ease-in-out_infinite_0.2s] h-4.5' : 'h-2'
                }`}
              />
            </div>

            {/* Next Track Button */}
            <button
              type="button"
              id="melody-player-next-btn"
              onClick={handleNextTrack}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-900 transition-colors"
              title="Chanson suivante"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Minimize to Pill (Mobile-Friendly) */}
            <button
              type="button"
              id="melody-player-minimize-btn"
              onClick={() => setIsMobileMinimized(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title="Réduire en bulle flottante"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Track Selection & Volume Bar */}
        <div className="p-3 pt-0 border-t border-slate-800/80 space-y-2 mt-1 bg-slate-950/70">
          <div className="flex items-center justify-between text-[11px] font-hud text-slate-400 pt-2">
            <span className="flex items-center gap-1 uppercase tracking-wider text-sky-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Mélodies Solo Leveling
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-sky-300 hover:underline flex items-center gap-0.5"
            >
              <span>{isExpanded ? 'Moins' : 'Toutes les pistes'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Mode Auto Quick Button */}
          <button
            type="button"
            id="melody-track-auto"
            onClick={() => handleSelectTrack('auto')}
            className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
              status.isAuto
                ? 'border-sky-400 bg-sky-950/60 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-300">
                <Zap className="w-3 h-3" />
              </div>
              <div className="font-hud font-bold text-xs text-white">
                Mode Défi Adaptatif (Auto)
              </div>
            </div>
            {status.isAuto && (
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
            )}
          </button>

          {/* Expanded Track Selection List */}
          {isExpanded && (
            <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto pr-1 animate-in fade-in duration-150">
              {MELODY_TRACKS.map((t) => {
                const isSelected = !status.isAuto && status.currentTrackId === t.id;
                return (
                  <button
                    key={t.id}
                    id={`melody-track-${t.id}`}
                    onClick={() => handleSelectTrack(t.id)}
                    className={`p-1.5 rounded-lg text-left border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-sky-400 bg-slate-900 shadow-[0_0_8px_rgba(56,189,248,0.2)]'
                        : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs shrink-0">{t.icon}</span>
                      <div className="font-hud font-bold text-[11px] text-white truncate">
                        {t.title}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Volume Control */}
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => musicEngine.setVolume(status.volume > 0 ? 0 : 0.45)}
              className="text-slate-400 hover:text-white"
              title={status.volume === 0 ? 'Réactiver le son' : 'Couper le son'}
            >
              {status.volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={status.volume}
              onChange={handleVolumeChange}
              className="w-full accent-sky-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              title={`Volume: ${Math.round(status.volume * 100)}%`}
            />
            <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
              {Math.round(status.volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
