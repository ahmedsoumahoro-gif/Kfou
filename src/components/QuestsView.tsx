import React, { useState } from 'react';
import { Quest, QuestCategory } from '../types';
import { CheckCircle, Clock, Sparkles, Flame, BookOpen, ShieldAlert, HeartHandshake, RotateCcw, AlertTriangle, Plus, Trash2, X } from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface QuestsViewProps {
  quests: Quest[];
  onCompleteQuest: (questId: string, note?: string) => void;
  onResetDailyQuests: () => void;
  onAddQuest?: (quest: Omit<Quest, 'id' | 'completedToday'>) => void;
  onDeleteQuest?: (questId: string) => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  quests,
  onCompleteQuest,
  onResetDailyQuests,
  onAddQuest,
  onDeleteQuest,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeNoteQuestId, setActiveNoteQuestId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New quest form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<QuestCategory>('prière');
  const [newDescription, setNewDescription] = useState('');
  const [newXpReward, setNewXpReward] = useState<number>(50);
  const [newStatType, setNewStatType] = useState<Quest['statType']>('general');
  const [newStatIncrement, setNewStatIncrement] = useState<number>(1);

  const completedCount = quests.filter((q) => q.completedToday).length;
  const totalCount = quests.length;
  const isAllCompleted = completedCount === totalCount && totalCount > 0;

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Toutes' },
    { id: 'prière', label: 'Prière' },
    { id: 'lecture', label: 'Lecture' },
    { id: 'combat', label: 'Combat' },
    { id: 'service', label: 'Service' },
    { id: 'gratitude', label: 'Gratitude' },
  ];

  const filteredQuests = quests.filter(
    (q) => selectedCategory === 'all' || q.category === selectedCategory
  );

  const getCategoryIcon = (cat: QuestCategory) => {
    switch (cat) {
      case 'prière':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'lecture':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'combat':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'service':
        return <HeartHandshake className="w-4 h-4 text-emerald-400" />;
      case 'gratitude':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  const handleValidateWithNote = (questId: string) => {
    onCompleteQuest(questId, noteText.trim() ? noteText.trim() : undefined);
    setActiveNoteQuestId(null);
    setNoteText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="system-window rounded-2xl p-6 system-corner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-hud tracking-widest text-sky-400 uppercase">
                [ JOURNAL DES QUÊTES ]
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-hud bg-sky-950 text-sky-300 rounded border border-sky-500/30 uppercase">
                RÉINITIALISATION 00:00
              </span>
            </div>
            <h1 className="font-hud text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Quêtes Quotidiennes de la Foi
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
              Accomplissez chaque jour vos exercices spirituels pour fortifier votre homme intérieur et débloquer les dons célestes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-sky-800/40 text-right">
              <span className="text-[10px] font-hud uppercase text-slate-400 block">PROGRESSION DU JOUR</span>
              <span className="font-hud text-xl font-bold text-sky-300">
                {completedCount} / {totalCount}
              </span>
            </div>

            <button
              onClick={() => {
                playSystemSound('click');
                setShowAddModal(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(56,189,248,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">NOUVELLE QUÊTE</span>
            </button>

            <button
              onClick={() => {
                playSystemSound('click');
                onResetDailyQuests();
              }}
              title="Réinitialiser les quêtes pour une nouvelle journée de test"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-300 hover:border-sky-500/40 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5/5 Bonus Banner */}
        {isAllCompleted && (
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-purple-500/20 border border-amber-400/40 flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <span className="font-hud font-bold text-amber-300 text-sm block">
                  TOUTES LES QUÊTES SONT ACCOMPLIES !
                </span>
                <span className="text-xs text-slate-300">
                  « Bon et fidèle serviteur, entre dans la joie de ton Maître » (Matthieu 25:21)
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-500/30 text-amber-300 font-hud text-xs font-bold uppercase tracking-wider">
              +100 XP BONUS
            </span>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playSystemSound('click');
              setSelectedCategory(cat.id);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-hud font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quests List */}
      <div className="space-y-3">
        {filteredQuests.map((quest) => {
          const isDone = quest.completedToday;
          const isNoteOpen = activeNoteQuestId === quest.id;

          return (
            <div
              key={quest.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isDone
                  ? 'bg-[#080d12]/60 border-emerald-500/30 opacity-80'
                  : 'bg-[#090d16] border-sky-900/40 hover:border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.05)]'
              }`}
            >
              <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {getCategoryIcon(quest.category)}
                    </span>
                    <h3 className="font-hud text-base sm:text-lg font-bold text-white tracking-wide">
                      {quest.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-hud font-bold bg-sky-950/70 border border-sky-500/30 text-sky-300">
                      +{quest.xpReward} XP
                    </span>
                    {quest.statType !== 'general' && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-hud bg-slate-900 text-slate-400 border border-slate-800">
                        +{quest.statIncrement} {quest.statType === 'prayer_minutes' ? 'min prière' : quest.statType === 'bible_chapters' ? 'chapitre' : 'streak'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                    {quest.description}
                  </p>

                  {/* Optional Note toggle */}
                  {!isDone && (
                    <button
                      onClick={() => setActiveNoteQuestId(isNoteOpen ? null : quest.id)}
                      className="text-[11px] font-hud text-slate-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                    >
                      <span>{isNoteOpen ? 'Fermer la note spirituelle' : '+ Ajouter un témoignage ou verset médité'}</span>
                    </button>
                  )}
                </div>

                {/* Validation Button & Delete */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onDeleteQuest && (
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer la quête « ${quest.title} » ?`)) {
                          playSystemSound('click');
                          onDeleteQuest(quest.id);
                        }
                      }}
                      title="Supprimer cette quête"
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-red-950/50 border border-slate-800 hover:border-red-500/40 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isDone ? (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-hud text-xs font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">COMPLÉTÉE</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleValidateWithNote(quest.id)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(56,189,248,0.35)] flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>ACCOMPLIR</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Note Input Box if toggled */}
              {isNoteOpen && !isDone && (
                <div className="px-5 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/50 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Ex: Médité sur Psaume 23, le Seigneur m'a rassuré sur mon travail..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                  <button
                    onClick={() => handleValidateWithNote(quest.id)}
                    className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-hud text-xs font-bold"
                  >
                    Valider avec note
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Quest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#080d16] border border-sky-500/40 p-6 system-corner shadow-[0_0_40px_rgba(56,189,248,0.2)] text-white space-y-4">
            <div className="flex items-center justify-between border-b border-sky-900/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-hud text-sky-400 uppercase tracking-widest block">
                    [ ÉDITEUR DU PROTOCOLE ]
                  </span>
                  <h3 className="font-hud text-xl font-bold tracking-wide">
                    Créer une Quête Spirituelle
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim() || !newDescription.trim()) return;
                if (onAddQuest) {
                  onAddQuest({
                    title: newTitle.trim(),
                    category: newCategory,
                    description: newDescription.trim(),
                    xpReward: newXpReward,
                    icon: newCategory === 'prière' ? 'Flame' : newCategory === 'lecture' ? 'BookOpen' : newCategory === 'combat' ? 'ShieldAlert' : newCategory === 'service' ? 'HeartHandshake' : 'Sparkles',
                    statType: newStatType,
                    statIncrement: newStatIncrement,
                    isDaily: true,
                  });
                }
                playSystemSound('quest_complete');
                setShowAddModal(false);
                setNewTitle('');
                setNewDescription('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-hud text-slate-400 uppercase mb-1">
                  Titre de la Quête
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Intercession pour ma famille"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-hud text-slate-400 uppercase mb-1">
                    Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as QuestCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                  >
                    <option value="prière">Prière</option>
                    <option value="lecture">Lecture</option>
                    <option value="combat">Combat</option>
                    <option value="service">Service</option>
                    <option value="gratitude">Gratitude</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-hud text-slate-400 uppercase mb-1">
                    Récompense XP
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={newXpReward}
                    onChange={(e) => setNewXpReward(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-hud text-slate-400 uppercase mb-1">
                  Description & Objectif Spirituel
                </label>
                <textarea
                  required
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ex: Prier au moins 10 minutes avec ferveur en citant Éphésiens 3:14-21..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-hud text-slate-400 uppercase mb-1">
                    Statistique Associée
                  </label>
                  <select
                    value={newStatType}
                    onChange={(e) => setNewStatType(e.target.value as Quest['statType'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                  >
                    <option value="prayer_minutes">Minutes de prière</option>
                    <option value="bible_chapters">Chapitres bibliques</option>
                    <option value="vice_streak">Série de victoire</option>
                    <option value="general">Général</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-hud text-slate-400 uppercase mb-1">
                    Incrémentation
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newStatIncrement}
                    onChange={(e) => setNewStatIncrement(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-hud text-xs hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                >
                  Ajouter au Protocole
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
