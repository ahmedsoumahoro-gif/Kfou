import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Shield, Sword, BookOpen, Plus, Search, Copy, Check, Sparkles, Brain, Eye, EyeOff, Trash2, CheckCircle } from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface InventoryViewProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void;
  onDeleteItem?: (itemId: string) => void;
  onReciteItem?: (itemId: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  onAddItem,
  onDeleteItem,
  onReciteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dojoMode, setDojoMode] = useState<boolean>(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [recitedIds, setRecitedIds] = useState<Record<string, boolean>>({});

  // New item form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newReference, setNewReference] = useState('');
  const [newCategory, setNewCategory] = useState('Combat Spirituel');
  const [newType, setNewType] = useState<InventoryItem['type']>('verset');

  const toggleReveal = (id: string) => {
    playSystemSound('click');
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRecite = (id: string) => {
    playSystemSound('quest_complete');
    setRecitedIds((prev) => ({ ...prev, [id]: true }));
    if (onReciteItem) {
      onReciteItem(id);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    playSystemSound('click');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddItem({
      title: newTitle.trim(),
      content: newContent.trim(),
      reference: newReference.trim() || 'Méditation Personnelle',
      category: newCategory.trim() || 'Général',
      type: newType,
    });

    playSystemSound('quest_complete');
    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
    setNewReference('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="system-window rounded-2xl p-6 system-corner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-hud tracking-widest text-sky-400 uppercase">
                [ ARMERIE DU ROYAUME ]
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-hud bg-sky-950 text-sky-300 rounded border border-sky-500/30 uppercase">
                ÉPHÉSIENS 6:17
              </span>
            </div>
            <h1 className="font-hud text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Inventaire & Épées de l'Esprit
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
              Conservez vos versets de combat (Rhema), vos prières d'autorité et vos déclarations de foi pour vaincre l'ennemi.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                playSystemSound('click');
                setDojoMode((prev) => !prev);
              }}
              className={`px-3.5 py-2.5 rounded-xl font-hud font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                dojoMode
                  ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>{dojoMode ? 'DOJO ACTIF' : 'DOJO MÉMORISATION'}</span>
            </button>

            <button
              onClick={() => {
                playSystemSound('click');
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>FORGER UNE ÉPÉE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par verset, mot-clé, référence..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400 font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['all', 'verset', 'prière'].map((f) => (
            <button
              key={f}
              onClick={() => {
                playSystemSound('click');
                setActiveFilter(f);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-hud font-bold uppercase tracking-wider transition-all ${
                activeFilter === f
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {f === 'all' ? 'Toutes les Armes' : f === 'verset' ? 'Versets (Rhema)' : 'Prières'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Weapons / Verses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-[#090d16] border border-sky-950 hover:border-sky-500/40 p-5 flex flex-col justify-between transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-hud font-bold bg-sky-950 text-sky-300 border border-sky-500/30 uppercase">
                    {item.category}
                  </span>
                  <h3 className="font-hud text-lg font-bold text-white tracking-wide mt-1.5">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  {onDeleteItem && (
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer cette arme « ${item.title} » ?`)) {
                          playSystemSound('click');
                          onDeleteItem(item.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/50 border border-slate-800 hover:border-red-500/40 text-slate-500 hover:text-red-400 transition-colors"
                      title="Supprimer cette arme"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(item.id, `« ${item.content} » — ${item.reference}`)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-sky-300 transition-colors"
                    title="Copier le verset"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Dojo Mode vs Standard Mode */}
              {dojoMode ? (
                <div className="py-2 space-y-2.5">
                  {revealedIds[item.id] ? (
                    <blockquote className="font-biblical text-sm text-amber-200 italic leading-relaxed bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl animate-in fade-in">
                      « {item.content} »
                    </blockquote>
                  ) : (
                    <div className="py-6 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center gap-1.5">
                      <Brain className="w-6 h-6 text-amber-400/60 animate-pulse" />
                      <span className="font-hud text-xs text-slate-400 uppercase tracking-wider">
                        RÉCITEZ LE VERSET DE TÊTE
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReveal(item.id)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-hud text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-slate-800"
                    >
                      {revealedIds[item.id] ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Masquer</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Vérifier le texte</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleRecite(item.id)}
                      disabled={recitedIds[item.id]}
                      className={`flex-1 py-1.5 px-3 rounded-xl font-hud text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                        recitedIds[item.id]
                          ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-400'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)] cursor-pointer'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{recitedIds[item.id] ? 'RÉCITÉ (+15 XP)' : 'RÉCITÉ SANS FAUTE'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <blockquote className="font-biblical text-sm text-slate-200 italic leading-relaxed">
                  « {item.content} »
                </blockquote>
              )}

              <div className="flex items-center justify-between text-xs font-hud pt-2 border-t border-slate-800/80">
                <span className="text-amber-400 font-bold">{item.reference}</span>
                <span className="text-slate-500 font-mono text-[10px]">Arme Spirituelle</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add New Weapon */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#090d16] border border-sky-400/40 p-6 system-corner space-y-4">
            <div className="flex items-center justify-between border-b border-sky-900/30 pb-3">
              <h3 className="font-hud text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <Sword className="w-5 h-5 text-sky-400" />
                <span>Forger une Épée Spirituelle (Rhema)</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-hud text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="text-xs font-hud uppercase text-slate-400 block mb-1">
                  Titre de l'Arme
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Épée contre la solitude"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-xs font-hud uppercase text-slate-400 block mb-1">
                  Contenu du Verset ou Déclaration de Foi
                </label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Ex: L'Éternel est mon berger, je ne manquerai de rien..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-hud uppercase text-slate-400 block mb-1">
                    Référence Biblique
                  </label>
                  <input
                    type="text"
                    value={newReference}
                    onChange={(e) => setNewReference(e.target.value)}
                    placeholder="Ex: Psaume 23:1"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-hud uppercase text-slate-400 block mb-1">
                    Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="Combat Spirituel">Combat Spirituel</option>
                    <option value="Pureté">Pureté</option>
                    <option value="Foi & Victoire">Foi & Victoire</option>
                    <option value="Paix & Consolation">Paix & Consolation</option>
                    <option value="Guérison">Guérison</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-hud hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 text-white font-hud font-bold text-xs uppercase"
                >
                  Ajouter à l'Inventaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
