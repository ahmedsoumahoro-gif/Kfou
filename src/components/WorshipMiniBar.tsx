import React, { useState, useEffect } from 'react';
import { worshipAudio, WorshipEngineState } from '../utils/worshipAudio';
import { playSystemSound } from '../utils/audio';
import { Play, Pause, Volume2, VolumeX, Music, ChevronRight } from 'lucide-react';
import { ActiveTab } from '../types';

interface WorshipMiniBarProps {
  onNavigateToWorship: () => void;
  activeTab: ActiveTab;
}

export const WorshipMiniBar: React.FC<WorshipMiniBarProps> = ({
  onNavigateToWorship,
  activeTab,
}) => {
  const [engineState, setEngineState] = useState<WorshipEngineState>(worshipAudio.getState());

  useEffect(() => {
    const unsub = worshipAudio.subscribe((state) => {
      setEngineState(state);
    });
    return unsub;
  }, []);

  // Hide floating bar if already on the dedicated Worship view
  if (activeTab === 'worship') return null;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 max-w-sm w-[calc(100%-24px)] sm:w-auto">
      <div
        className={`p-2.5 sm:p-3 rounded-2xl border shadow-2xl backdrop-blur-md transition-all flex items-center gap-3 ${
          engineState.isPlaying
            ? 'bg-slate-900/95 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
            : 'bg-slate-950/90 border-slate-800 text-slate-400'
        }`}
      >
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={() => {
            playSystemSound('click');
            worshipAudio.togglePlay();
          }}
          className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
            engineState.isPlaying
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
          title={engineState.isPlaying ? 'Mettre en pause' : 'Lancer la mélodie d’adoration'}
        >
          {engineState.isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Track Title & Link */}
        <button
          type="button"
          onClick={() => {
            playSystemSound('click');
            onNavigateToWorship();
          }}
          className="text-left min-w-0 flex-1 cursor-pointer group"
        >
          <div className="flex items-center gap-1.5">
            <Music
              className={`w-3.5 h-3.5 ${
                engineState.isPlaying ? 'text-amber-400 animate-bounce' : 'text-slate-500'
              }`}
            />
            <span className="text-xs font-hud font-bold text-white group-hover:text-sky-300 truncate">
              {engineState.currentTrack.name}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {engineState.isPlaying ? 'Mélodie d’adoration active' : 'Cliquer pour ouvrir le Sanctuaire'}
          </p>
        </button>

        {/* Quick Navigate Arrow */}
        <button
          type="button"
          onClick={() => {
            playSystemSound('click');
            onNavigateToWorship();
          }}
          className="p-1 text-slate-400 hover:text-white cursor-pointer"
          title="Ouvrir le Sanctuaire d’Adoration"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
