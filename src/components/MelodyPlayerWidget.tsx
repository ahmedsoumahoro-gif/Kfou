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
  Heart,
  BookOpen,
} from 'lucide-react';
import {
  worshipAudio,
  WORSHIP_TRACKS,
  WorshipTrack,
  WorshipEngineState,
} from '../utils/worshipAudio';
import { playSystemSound } from '../utils/audio';

interface MelodyPlayerWidgetProps {
  currentTab: string;
  onOpenBible?: () => void;
}

export const MelodyPlayerWidget: React.FC<MelodyPlayerWidgetProps> = ({
  currentTab,
  onOpenBible,
}) => {
  const [engineState, setEngineState] = useState<WorshipEngineState>(() => worshipAudio.getState());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMinimized, setIsMobileMinimized] = useState(true);

  useEffect(() => {
    const unsub = worshipAudio.subscribe((state) => {
      setEngineState(state);
    });
    return unsub;
  }, []);

  const handleTogglePlay = () => {
    playSystemSound('click');
    worshipAudio.togglePlay();
  };

  const handleNextTrack = () => {
    playSystemSound('click');
    const currentIndex = WORSHIP_TRACKS.findIndex((t) => t.id === engineState.currentTrackId);
    const nextIndex = (currentIndex + 1) % WORSHIP_TRACKS.length;
    worshipAudio.play(WORSHIP_TRACKS[nextIndex].id);
  };

  const handleSelectTrack = (trackId: string) => {
    playSystemSound('click');
    worshipAudio.play(trackId);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    worshipAudio.setVolume(val);
  };

  // If on mobile and minimized, show a small sacred pill that never obscures content
  if (isMobileMinimized) {
    return (
      <div
        id="worship-melody-pill"
        className="fixed bottom-20 right-3 z-30 flex items-center gap-1.5 p-1.5 pl-2.5 rounded-full bg-slate-950/90 border border-amber-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.7),0_0_12px_rgba(245,158,11,0.2)] backdrop-blur-md transition-all hover:scale-105 active:scale-95"
      >
        <button
          type="button"
          onClick={handleTogglePlay}
          className="flex items-center gap-1.5 text-xs font-hud font-bold text-amber-300 cursor-pointer"
          title={
            engineState.isPlaying
              ? 'Mettre la mélodie d’adoration en pause'
              : 'Lancer une douce mélodie d’adoration'
          }
        >
          {engineState.isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current text-amber-400" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
          )}
          <span className="max-w-[110px] truncate text-[11px]">
            {engineState.isPlaying ? engineState.currentTrack.name : 'Adoration'}
          </span>
        </button>

        {engineState.isPlaying && (
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/10">
            <span
              className="w-1 h-2 bg-amber-400 rounded-full animate-pulse"
              style={{ animationDuration: '0.9s' }}
            />
            <span
              className="w-1 h-3 bg-amber-400 rounded-full animate-pulse"
              style={{ animationDuration: '0.6s' }}
            />
            <span
              className="w-1 h-1.5 bg-amber-400 rounded-full animate-pulse"
              style={{ animationDuration: '1.2s' }}
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            playSystemSound('click');
            setIsMobileMinimized(false);
          }}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 cursor-pointer"
          title="Ouvrir le panneau d’adoration"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      id="worship-player-widget"
      className="fixed bottom-20 right-3 sm:bottom-4 sm:right-4 z-40 max-w-xs w-[calc(100%-24px)] sm:w-80 rounded-2xl bg-gradient-to-b from-[#0e1424]/95 to-[#080d19]/98 border border-amber-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.15)] backdrop-blur-xl text-slate-100 transition-all overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              engineState.isPlaying ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
            }`}
          />
          <span className="text-[11px] font-hud font-bold tracking-wider text-amber-300 uppercase flex items-center gap-1">
            <Music className="w-3 h-3 text-amber-400" />
            <span>Mélodies d’Adoration & Prière</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title={isExpanded ? 'Réduire' : 'Voir les titres'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMinimized(true)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer text-xs font-mono"
            title="Minimiser en pastille"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Track & Controls */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-hud font-bold text-sm text-white truncate">
              {engineState.currentTrack.name}
            </h4>
            <p className="text-[11px] text-amber-400/90 font-mono truncate">
              {engineState.currentTrack.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-md ${
                engineState.isPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title={engineState.isPlaying ? 'Pause' : 'Jouer'}
            >
              {engineState.isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleNextTrack}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer"
              title="Mélodie suivante"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Volume Bar */}
        <div className="flex items-center gap-2 pt-1">
          {engineState.volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={engineState.volume}
            onChange={handleVolumeChange}
            className="w-full accent-amber-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
            {Math.round(engineState.volume * 100)}%
          </span>
        </div>

        {/* Scripture reference of current track */}
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[10px] text-slate-300 italic flex items-start gap-1.5 leading-snug">
          <BookOpen className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{engineState.currentTrack.scriptureRef}</span>
        </div>
      </div>

      {/* Expanded Track Selection List */}
      {isExpanded && (
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 max-h-48 overflow-y-auto space-y-1">
          <span className="text-[10px] font-hud font-bold text-slate-400 uppercase tracking-wider block px-1 mb-1">
            Sélectionnez une mélodie
          </span>
          {WORSHIP_TRACKS.map((track) => {
            const isSelected = track.id === engineState.currentTrackId;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleSelectTrack(track.id)}
                className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-slate-200">{track.name}</div>
                  <div className="text-[10px] text-slate-500 truncate font-mono">{track.key}</div>
                </div>
                {isSelected && engineState.isPlaying && (
                  <span className="text-[10px] text-amber-400 font-bold ml-2">En cours</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
