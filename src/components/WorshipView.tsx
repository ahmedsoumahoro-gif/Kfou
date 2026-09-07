import React, { useState, useEffect } from 'react';
import {
  worshipAudio,
  WORSHIP_TRACKS,
  WorshipTrack,
  WorshipEngineState,
} from '../utils/worshipAudio';
import { playSystemSound } from '../utils/audio';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Music,
  Heart,
  Sparkles,
  Shield,
  BookOpen,
  Compass,
  Radio,
  Sliders,
  ChevronRight,
} from 'lucide-react';

export const WorshipView: React.FC = () => {
  const [engineState, setEngineState] = useState<WorshipEngineState>(worshipAudio.getState());

  useEffect(() => {
    const unsub = worshipAudio.subscribe((state) => {
      setEngineState(state);
    });
    return unsub;
  }, []);

  const handlePlayTrack = (trackId: string) => {
    playSystemSound('click');
    if (engineState.isPlaying && engineState.currentTrackId === trackId) {
      worshipAudio.pause();
    } else {
      worshipAudio.play(trackId);
    }
  };

  const handleTogglePlay = () => {
    playSystemSound('click');
    worshipAudio.togglePlay();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    worshipAudio.setVolume(vol);
  };

  const handleSetTimer = (minutes: number | null) => {
    playSystemSound('click');
    worshipAudio.setTimer(minutes);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sanctuary Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-sky-950/40 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-400/40 text-amber-300 text-xs font-hud font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SANCTUAIRE DE PRIÈRE & ADORATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-hud font-black tracking-wide text-white">
              Mélodies Douces de Recueillement
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Un espace sonore solennel et pur, dépourvu de tout bruit artificiel de jeu vidéo.
              Ces nappes d’adoration et accords contemplatifs sont conçus pour accompagner votre
              prière secrète, votre méditation biblique et votre intimité avec le Seigneur.
            </p>
          </div>

          {/* Big Master Play / Pause Button */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`px-6 py-4 rounded-2xl font-hud font-black text-sm tracking-wider flex items-center gap-3 transition-all cursor-pointer shadow-xl ${
                engineState.isPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.5)] scale-102'
                  : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sky-500/20'
              }`}
            >
              {engineState.isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>PAUSE L’ADORATION</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>COMMENCER L’ADORATION</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ambient Waveform visualizer simulation when playing */}
        {engineState.isPlaying && (
          <div className="mt-6 pt-4 border-t border-amber-500/20 flex items-center justify-center gap-1.5 h-8">
            {[40, 70, 25, 90, 50, 80, 30, 60, 100, 45, 85, 35, 75, 55, 95, 20, 65, 40, 80].map(
              (height, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-amber-500 to-sky-400 rounded-full animate-pulse transition-all duration-300"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${(i % 5) * 0.2}s`,
                  }}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Control Console: Current Track, Volume & Timer */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Track in Focus */}
        <div className="space-y-1">
          <span className="text-[10px] font-hud font-bold text-slate-400 tracking-wider uppercase">
            Mélodie en cours
          </span>
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                engineState.isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <h4 className="font-hud font-bold text-white text-sm sm:text-base">
              {engineState.currentTrack.name}
            </h4>
          </div>
          <span className="text-xs text-amber-400 font-mono">
            {engineState.currentTrack.key} • {engineState.currentTrack.bpm} BPM
          </span>
        </div>

        {/* Volume Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-hud text-slate-300">
            <span className="flex items-center gap-1.5">
              {engineState.volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              )}
              Volume de la mélodie
            </span>
            <span className="font-mono text-sky-400 font-bold">
              {Math.round(engineState.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={engineState.volume}
            onChange={handleVolumeChange}
            className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>

        {/* Prayer Timer Options */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-hud text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Minuteur de Prière
            </span>
            <span className="text-[11px] text-amber-300 font-mono">
              {engineState.timerMinutes ? `${engineState.timerMinutes} min` : 'En continu'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[null, 15, 30, 60].map((mins, idx) => {
              const isSelected = engineState.timerMinutes === mins;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSetTimer(mins)}
                  className={`flex-1 py-1 rounded-lg text-xs font-hud font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins === null ? 'Infini' : `${mins}m`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Available Sacred Tracks Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-hud font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Music className="w-4 h-4 text-sky-400" />
          <span>Sélection des Harmonies d’Adoration</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WORSHIP_TRACKS.map((track) => {
            const isCur = engineState.currentTrackId === track.id;
            const isCurPlaying = isCur && engineState.isPlaying;

            return (
              <div
                key={track.id}
                className={`p-5 rounded-3xl border transition-all relative overflow-hidden ${
                  isCur
                    ? 'bg-gradient-to-br from-slate-900 via-[#0c1322] to-sky-950/50 border-amber-400/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-hud font-bold text-base text-white">{track.name}</h4>
                      {isCurPlaying && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30 uppercase tracking-widest">
                          En écoute
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-sky-400 font-mono">{track.subtitle}</p>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {track.description}
                    </p>
                  </div>

                  {/* Play / Stop this track button */}
                  <button
                    type="button"
                    onClick={() => handlePlayTrack(track.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md ${
                      isCurPlaying
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/30'
                        : 'bg-slate-950 hover:bg-sky-600 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title={isCurPlaying ? 'Pause' : `Écouter ${track.name}`}
                  >
                    {isCurPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    )}
                  </button>
                </div>

                {/* Scripture meditation attached to this track */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-400 italic">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
                  <span>{track.scriptureRef}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spiritual Guide & Adoration Philosophy */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 space-y-4">
        <h3 className="font-hud font-bold text-sm text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Conseils pour un temps de prière et d’adoration efficace</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-1">
            <strong className="text-sky-300 font-hud font-bold block">
              1. Le Lieu Secret (Matthieu 6:6)
            </strong>
            <p>
              Isolez-vous des distractions extérieures. Fermez vos yeux, respirez lentement et
              laissez la nappe sonore calmer le tourbillon de vos pensées.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-1">
            <strong className="text-amber-300 font-hud font-bold block">
              2. Adorer en Esprit et en Vérité
            </strong>
            <p>
              Commencez par remercier Dieu pour ce qu’Il est, et non seulement pour ce qu’Il donne.
              Élevez son saint nom dans le silence de votre cœur.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-1">
            <strong className="text-emerald-300 font-hud font-bold block">
              3. Écouter la Parole
            </strong>
            <p>
              La prière est un dialogue : ouvrez la Bible (onglet La Bible), méditez un psaume ou un
              chapitre des Évangiles pendant que la mélodie résonne.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
