import React, { useState } from 'react';
import { Vice } from '../types';
import { Skull, Sword, Shield, Heart, Sparkles, AlertCircle, Zap, ShieldCheck, Plus, Trash2, X } from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface ShadowArmyViewProps {
  vices: Vice[];
  onResistVice: (viceId: string) => void;
  onRelapseVice: (viceId: string) => void;
  onAddVice?: (vice: Omit<Vice, 'id' | 'streak' | 'extracted'>) => void;
  onDeleteVice?: (viceId: string) => void;
}

export const ShadowArmyView: React.FC<ShadowArmyViewProps> = ({
  vices,
  onResistVice,
  onRelapseVice,
  onAddVice,
  onDeleteVice,
}) => {
  const [relapseModalVice, setRelapseModalVice] = useState<Vice | null>(null);
  const [showAddViceModal, setShowAddViceModal] = useState<boolean>(false);

  // New vice form
  const [newName, setNewName] = useState('');
  const [newBossTitle, setNewBossTitle] = useState('');
  const [newBiblicalVerse, setNewBiblicalVerse] = useState('');
  const [newVerseRef, setNewVerseRef] = useState('');
  const [newHp, setNewHp] = useState<number>(100);

  const extractedCount = vices.filter((v) => v.extracted).length;
  const totalCount = vices.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="system-window-danger rounded-2xl p-6 system-corner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-hud tracking-widest text-red-400 uppercase">
                [ PROTOCOLE DU MONARQUE SPIRITUEL ]
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-hud bg-red-950 text-red-300 rounded border border-red-500/30 uppercase">
                COMBAT CONTRE LA CHAIR
              </span>
            </div>
            <h1 className="font-hud text-2xl sm:text-3xl font-bold text-white tracking-wide glow-crimson">
              L'Armée des Ombres & Vices
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
              « Car nous n'avons pas à lutter contre la chair et le sang, mais contre les dominations et les esprits méchants » (Éphésiens 6:12).
              Terrassez vos faiblesses par la foi. Lorsqu'un vice est réduit à 0 PV, son ombre est extraite et purifiée.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-red-500/40 text-center sm:text-right">
              <span className="text-[10px] font-hud uppercase text-slate-400 block">OMBRES PURIFIÉES</span>
              <span className="font-hud text-xl font-bold text-red-400">
                {extractedCount} / {totalCount}
              </span>
            </div>

            <button
              onClick={() => {
                playSystemSound('click');
                setShowAddViceModal(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">NOUVEAU COMBAT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Shadow Bosses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vices.map((vice) => {
          const hpPercent = Math.max(0, Math.round((vice.currentHp / vice.maxHp) * 100));
          const isDefeated = vice.extracted || vice.currentHp <= 0;

          return (
            <div
              key={vice.id}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                isDefeated
                  ? 'bg-gradient-to-b from-[#0a141a] to-[#080d16] border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                  : 'bg-[#0e0a0d] border-red-900/40 hover:border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Title and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {isDefeated ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-hud font-bold bg-sky-950 text-sky-300 border border-sky-500/40">
                          OMBRE EXTRAITE & ASSUJETTIE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-hud font-bold bg-red-950 text-red-300 border border-red-500/40">
                          BOSS ACTIF
                        </span>
                      )}
                      <span className="text-xs font-hud text-slate-400">
                        {vice.streak} jours de victoire
                      </span>
                    </div>
                    <h3 className="font-hud text-xl font-bold text-white tracking-wide mt-1">
                      {vice.bossTitle}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      Vice : <span className="text-slate-200 font-medium">{vice.name}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {onDeleteVice && (
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer le combat contre « ${vice.name} » ?`)) {
                            playSystemSound('click');
                            onDeleteVice(vice.id);
                          }
                        }}
                        title="Supprimer ce combat"
                        className="p-2 rounded-xl bg-slate-900/80 hover:bg-red-950/50 border border-slate-800 hover:border-red-500/40 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div
                      className={`p-2.5 rounded-xl border flex-shrink-0 ${
                        isDefeated
                          ? 'bg-sky-950/40 border-sky-500/40 text-sky-400'
                          : 'bg-red-950/40 border-red-500/40 text-red-400'
                      }`}
                    >
                      {isDefeated ? <ShieldCheck className="w-6 h-6" /> : <Skull className="w-6 h-6 animate-pulse" />}
                    </div>
                  </div>
                </div>

                {/* Boss HP Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-hud">
                    <span className="text-slate-400">
                      {isDefeated ? 'POUVOIR PURIFIÉ' : 'POINTS DE VIE DU BOSS'}
                    </span>
                    <span className={isDefeated ? 'text-sky-300 font-bold' : 'text-red-400 font-bold'}>
                      {isDefeated ? '0 PV (TERRASSÉ)' : `${vice.currentHp} / ${vice.maxHp} PV`}
                    </span>
                  </div>

                  <div className="h-3.5 w-full bg-slate-950 rounded-full border border-slate-800 p-0.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDefeated
                          ? 'bg-sky-500 shadow-[0_0_10px_#38bdf8]'
                          : 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_10px_#ef4444]'
                      }`}
                      style={{ width: `${isDefeated ? 100 : hpPercent}%` }}
                    />
                  </div>
                </div>

                {/* Biblical Rhema Sword */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-hud text-amber-300 font-semibold mb-1">
                    <Sword className="w-3.5 h-3.5 text-amber-400" />
                    <span>ÉPÉE DE L'ESPRIT ({vice.verseRef})</span>
                  </div>
                  <p className="font-biblical text-xs text-slate-300 italic leading-relaxed">
                    « {vice.biblicalVerse} »
                  </p>
                </div>
              </div>

              {/* Combat Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                {isDefeated ? (
                  <div className="w-full py-2 text-center text-xs font-hud text-sky-400 bg-sky-950/30 border border-sky-500/20 rounded-xl flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>L'OMBRE EST AU SERVICE DU CHRIST • VIGILANCE CONTINUE</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        playSystemSound('slash');
                        onResistVice(vice.id);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] flex items-center justify-center gap-1.5"
                    >
                      <Sword className="w-4 h-4" />
                      <span>FRAPPER (-10 PV)</span>
                    </button>

                    <button
                      onClick={() => setRelapseModalVice(vice)}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-300 border border-slate-800 text-xs font-hud transition-colors flex items-center gap-1"
                      title="Je me suis laissé surprendre, mais je me relève par la grâce"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Grâce</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grace & Relapse Recovery Modal */}
      {relapseModalVice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0e0c12] border border-amber-500/40 p-6 system-corner space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-hud text-lg font-bold uppercase tracking-wider">
                Refuge de la Grâce Divine
              </h3>
            </div>

            <blockquote className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 font-biblical text-sm text-amber-200 italic">
              « Car sept fois le juste tombe, et il se relève, mais les méchants sont précipités dans le malheur. »
              <span className="block text-right not-italic font-hud text-xs text-amber-400 mt-1">
                — Proverbes 24:16
              </span>
            </blockquote>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Ne reste pas dans la culpabilité ni la honte. Le sang de Jésus efface toute condamnation. Confesse ta faute, redresse-toi et reprends immédiatement ton épée.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRelapseModalVice(null)}
                className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-hud text-xs hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onRelapseVice(relapseModalVice.id);
                  setRelapseModalVice(null);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-hud font-bold text-xs tracking-wider uppercase transition-colors"
              >
                Je me relève en Christ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Vice / Fortress Modal */}
      {showAddViceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0e0a0d] border border-red-500/40 p-6 system-corner shadow-[0_0_40px_rgba(239,68,68,0.25)] text-white space-y-4">
            <div className="flex items-center justify-between border-b border-red-900/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-hud text-red-400 uppercase tracking-widest block">
                    [ IDENTIFICATION DE LA FORTERESSE ]
                  </span>
                  <h3 className="font-hud text-xl font-bold tracking-wide">
                    Déclarer un Combat Spirituel
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowAddViceModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newName.trim() || !newBossTitle.trim()) return;
                if (onAddVice) {
                  onAddVice({
                    name: newName.trim(),
                    slug: newName.toLowerCase().replace(/\s+/g, '-'),
                    bossTitle: newBossTitle.trim(),
                    biblicalVerse: newBiblicalVerse.trim() || 'Soumettez-vous donc à Dieu; résistez au diable, et il fuira loin de vous.',
                    verseRef: newVerseRef.trim() || 'Jacques 4:7',
                    currentHp: newHp,
                    maxHp: newHp,
                  });
                }
                playSystemSound('slash');
                setShowAddViceModal(false);
                setNewName('');
                setNewBossTitle('');
                setNewBiblicalVerse('');
                setNewVerseRef('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-hud text-slate-400 uppercase mb-1">
                  Nom du Vice / Tentation
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Dépendance aux réseaux sociaux, Colère, etc."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-xs font-hud text-slate-400 uppercase mb-1">
                  Titre du Boss (Monstre de l'Ombre)
                </label>
                <input
                  type="text"
                  required
                  value={newBossTitle}
                  onChange={(e) => setNewBossTitle(e.target.value)}
                  placeholder="Ex: L'Ombre de la Dispersion"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-xs font-hud text-slate-400 uppercase mb-1">
                  Verset Biblique d'Épée (Rhema)
                </label>
                <textarea
                  rows={2}
                  value={newBiblicalVerse}
                  onChange={(e) => setNewBiblicalVerse(e.target.value)}
                  placeholder="Ex: Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l'intelligence..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-hud text-slate-400 uppercase mb-1">
                    Référence
                  </label>
                  <input
                    type="text"
                    value={newVerseRef}
                    onChange={(e) => setNewVerseRef(e.target.value)}
                    placeholder="Ex: Romains 12:2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-red-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-hud text-slate-400 uppercase mb-1">
                    Points de Vie (PV)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={300}
                    step={10}
                    value={newHp}
                    onChange={(e) => setNewHp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddViceModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-hud text-xs hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-hud font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  Engager le Combat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
