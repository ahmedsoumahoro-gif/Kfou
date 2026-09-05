import React, { useState } from 'react';
import { AppearanceSettings, AppTheme, HudFont, BodyFont, FontScale, AccentColorPreset } from '../types';
import {
  Sun,
  Moon,
  Scroll,
  Sparkles,
  Flame,
  Shield,
  Palette,
  Check,
  Eye,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { playSystemSound } from '../utils/audio';
import { ACCENT_COLOR_PRESETS, getEffectiveAccentColor } from '../constants/assets';

interface AppearanceSettingsSectionProps {
  settings: AppearanceSettings;
  onUpdateSettings: (newSettings: Partial<AppearanceSettings>) => void;
}

export const AppearanceSettingsSection: React.FC<AppearanceSettingsSectionProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [customHexInput, setCustomHexInput] = useState(
    settings.customAccentColor || '#38bdf8'
  );

  const themes: {
    id: AppTheme;
    name: string;
    description: string;
    icon: React.ElementType;
    badge: string;
    colors: string[];
  }[] = [
    {
      id: 'solo-dark',
      name: 'Monarque des Ombres',
      description: 'Ambiance Solo Leveling originale, sombre abyssale avec lueurs néon.',
      icon: Moon,
      badge: 'SOLO LEVELING',
      colors: ['#06080e', '#38bdf8', '#0f172a'],
    },
    {
      id: 'divine-light',
      name: 'Lumière Céleste',
      description: 'Thème clair haute clarté, lumineux et moderne avec accents ciel et or.',
      icon: Sun,
      badge: 'CLARTÉ DIVINE',
      colors: ['#ffffff', '#0284c7', '#f4f6f9'],
    },
    {
      id: 'solar-parchment',
      name: 'Parchemin Sacré',
      description: 'Sépia chaleureux style manuscrit biblique, apaisant pour la lecture.',
      icon: Scroll,
      badge: 'SÉPIA BIBLIQUE',
      colors: ['#f7f3eb', '#b45309', '#ffffff'],
    },
    {
      id: 'midnight-blue',
      name: 'Nuit Royale',
      description: 'Bleu cobalt profond et or céleste, élégant et noble.',
      icon: Sparkles,
      badge: 'BLEU COBALT',
      colors: ['#070d1e', '#60a5fa', '#0c1630'],
    },
    {
      id: 'crimson-gate',
      name: 'Portail Écarlate',
      description: 'Noir obsidienne et braises ardentes, intensité du combat spirituel.',
      icon: Flame,
      badge: 'FEU SACRÉ',
      colors: ['#0d0608', '#ef4444', '#1f0d12'],
    },
    {
      id: 'emerald-eden',
      name: 'Éden Céleste',
      description: 'Vert forêt profond et émeraude radiant, symbole de vie et de résurrection.',
      icon: Shield,
      badge: 'VIE ÉTERNELLE',
      colors: ['#040d09', '#10b981', '#06170e'],
    },
    {
      id: 'royal-amethyst',
      name: 'Sagesse Pourpre',
      description: 'Onyx et pourpre royal, mystère et dignité des rois et prêtres de Dieu.',
      icon: Zap,
      badge: 'ONCTION ROYALE',
      colors: ['#0c0715', '#a855f7', '#10081f'],
    },
  ];

  const hudFonts: { id: HudFont; name: string; sample: string; desc: string }[] = [
    { id: 'rajdhani', name: 'Rajdhani', sample: 'SYSTEM ONLINE • LVL 5', desc: 'Style Cyber HUD' },
    { id: 'cinzel', name: 'Cinzel', sample: 'PAROLE DE PUISSANCE', desc: 'Majestueux & Biblique' },
    { id: 'montserrat', name: 'Montserrat', sample: 'CHASSEUR DU ROYAUME', desc: 'Moderne & Dynamique' },
    { id: 'playfair', name: 'Playfair Display', sample: 'GLOIRE ET VICTOIRE', desc: 'Noble & Élégant' },
    { id: 'oswald', name: 'Oswald', sample: 'ARME SPIRITUELLE', desc: 'Impact Fort & Condensé' },
  ];

  const bodyFonts: { id: BodyFont; name: string; sample: string; desc: string }[] = [
    { id: 'jakarta', name: 'Plus Jakarta Sans', sample: 'Méditation et prière au quotidien.', desc: 'Moderne & Fluide (défaut)' },
    { id: 'inter', name: 'Inter', sample: 'Lecture claire et lisibilité maximale.', desc: 'Haute clarté' },
    { id: 'merriweather', name: 'Merriweather', sample: 'L’Éternel est mon berger, je ne manquerai de rien.', desc: 'Sérif Bible d’étude' },
    { id: 'outfit', name: 'Outfit', sample: 'Discipline et consécration dans la marche chrétienne.', desc: 'Géométrique' },
  ];

  const fontScales: { id: FontScale; name: string; pct: string; desc: string }[] = [
    { id: 'normal', name: 'Normal', pct: '100%', desc: 'Taille standard' },
    { id: 'large', name: 'Grand', pct: '110%', desc: 'Confort de lecture' },
    { id: 'xlarge', name: 'Très Grand', pct: '120%', desc: 'Accessibilité accrue' },
  ];

  const currentAccent = getEffectiveAccentColor(
    settings.accentColorPreset,
    settings.customAccentColor
  );

  const handleCustomColorChange = (hex: string) => {
    setCustomHexInput(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onUpdateSettings({
        accentColorPreset: 'custom',
        customAccentColor: hex,
      });
    }
  };

  return (
    <div className="space-y-7">
      {/* 1. Theme Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
              [ 1. AMBIANCE FONDAMENTALE ]
            </span>
            <h3 className="font-hud text-lg font-bold text-white tracking-wide">
              Thème Visuel Principal
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-sans">
            {themes.find((t) => t.id === settings.theme)?.name || 'Actif'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {themes.map((th) => {
            const Icon = th.icon;
            const isSelected = settings.theme === th.id;
            return (
              <button
                key={th.id}
                id={`theme-select-${th.id}`}
                onClick={() => {
                  playSystemSound('click');
                  onUpdateSettings({ theme: th.id });
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky-400 ring-2 ring-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.2)] bg-slate-900/90'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl border ${
                        isSelected
                          ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-hud font-bold text-sm text-white flex items-center gap-1.5">
                        {th.name}
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </h4>
                      <span className="text-[9px] font-hud uppercase tracking-wider text-slate-400">
                        {th.badge}
                      </span>
                    </div>
                  </div>

                  {/* Color dots preview */}
                  <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                    {th.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
                  {th.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Themes / Accent Customization (User Request) */}
      <div className="space-y-4 pt-5 border-t border-slate-800/80">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-hud text-sky-400 tracking-wider uppercase">
                [ 2. COULEUR DU SYSTÈME & NÉONS ]
              </span>
            </div>
            <h3 className="font-hud text-lg font-bold text-white tracking-wide">
              Personnalisation des Couleurs d'Accent
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Choisissez l'aura lumineuse appliquée aux boutons, barres de progression, jauges et titres.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Actuel :</span>
            <div
              className="w-5 h-5 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: currentAccent }}
              title={currentAccent}
            />
          </div>
        </div>

        {/* Preset Swatches Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ACCENT_COLOR_PRESETS.map((preset) => {
            const isSelected = settings.accentColorPreset === preset.id;
            return (
              <button
                key={preset.id}
                id={`accent-color-${preset.id}`}
                onClick={() => {
                  playSystemSound('click');
                  onUpdateSettings({
                    accentColorPreset: preset.id,
                    customAccentColor: preset.hex,
                  });
                }}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 relative ${
                  isSelected
                    ? 'border-white bg-slate-900 shadow-md ring-1 ring-white/40'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-lg border border-black/30 shrink-0 shadow-sm"
                  style={{ backgroundColor: preset.hex }}
                />
                <div className="min-w-0">
                  <div className="font-hud font-bold text-xs text-white truncate flex items-center gap-1">
                    {preset.name}
                    {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{preset.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Hex & Native Color Wheel Picker */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* HTML5 Native Color Picker */}
            <div className="relative">
              <input
                type="color"
                id="custom-accent-color-picker"
                value={currentAccent}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0 overflow-hidden"
                title="Cliquer pour ouvrir la roue de couleurs personnalisée"
              />
            </div>

            <div>
              <label
                htmlFor="custom-accent-color-picker"
                className="font-hud font-bold text-xs text-white block cursor-pointer"
              >
                Roue Chromatique Libre (Sélecteur Sur-Mesure)
              </label>
              <span className="text-[11px] text-slate-400 font-sans">
                Sélectionnez n'importe quelle teinte personnalisée
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-mono text-slate-400">HEX:</span>
            <input
              type="text"
              id="custom-accent-hex-input"
              value={customHexInput}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              placeholder="#38bdf8"
              maxLength={7}
              className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-400 uppercase"
            />
            {settings.accentColorPreset === 'custom' && (
              <button
                type="button"
                onClick={() => {
                  playSystemSound('click');
                  onUpdateSettings({
                    accentColorPreset: 'cyan',
                    customAccentColor: '#38bdf8',
                  });
                  setCustomHexInput('#38bdf8');
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                title="Réinitialiser vers le Cyan Solo Leveling par défaut"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Heading / HUD Font Selection */}
      <div className="space-y-3 pt-5 border-t border-slate-800/80">
        <div>
          <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
            [ 3. TYPOGRAPHIE DES TITRES ]
          </span>
          <h3 className="font-hud text-lg font-bold text-white tracking-wide">
            Police du HUD & Titres
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Typographie appliquée à l'interface système, aux jauges et aux titres.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {hudFonts.map((f) => {
            const isSelected = settings.hudFont === f.id;
            return (
              <button
                key={f.id}
                id={`font-hud-${f.id}`}
                onClick={() => {
                  playSystemSound('click');
                  onUpdateSettings({ hudFont: f.id });
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-500/10 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-hud font-bold text-sm text-white">{f.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <div
                  className="text-xs text-sky-300 my-1 tracking-wider"
                  style={{
                    fontFamily:
                      f.id === 'cinzel'
                        ? 'Cinzel, serif'
                        : f.id === 'montserrat'
                        ? 'Montserrat, sans-serif'
                        : f.id === 'playfair'
                        ? 'Playfair Display, serif'
                        : f.id === 'oswald'
                        ? 'Oswald, sans-serif'
                        : 'Rajdhani, sans-serif',
                  }}
                >
                  {f.sample}
                </div>
                <span className="text-[10px] text-slate-500 font-sans block">{f.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Body Font Selection */}
      <div className="space-y-3 pt-5 border-t border-slate-800/80">
        <div>
          <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
            [ 4. TYPOGRAPHIE DU CORPS & VERSETS ]
          </span>
          <h3 className="font-hud text-lg font-bold text-white tracking-wide">
            Police de Lecture
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Optimisez le confort de lecture pour les versets bibliques et descriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {bodyFonts.map((f) => {
            const isSelected = settings.bodyFont === f.id;
            return (
              <button
                key={f.id}
                id={`font-body-${f.id}`}
                onClick={() => {
                  playSystemSound('click');
                  onUpdateSettings({ bodyFont: f.id });
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-500/10 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-hud font-bold text-sm text-white">{f.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <div
                  className="text-xs text-slate-200 my-1 italic"
                  style={{
                    fontFamily:
                      f.id === 'inter'
                        ? 'Inter, sans-serif'
                        : f.id === 'merriweather'
                        ? 'Merriweather, serif'
                        : f.id === 'outfit'
                        ? 'Outfit, sans-serif'
                        : 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  « {f.sample} »
                </div>
                <span className="text-[10px] text-slate-500 font-sans block">{f.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Font Scale Selection */}
      <div className="space-y-3 pt-5 border-t border-slate-800/80">
        <div>
          <span className="text-xs font-hud text-sky-400 tracking-wider uppercase block">
            [ 5. TAILLE DE POLICE ]
          </span>
          <h3 className="font-hud text-lg font-bold text-white tracking-wide">
            Échelle d'Affichage du Texte
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {fontScales.map((s) => {
            const isSelected = settings.fontScale === s.id;
            return (
              <button
                key={s.id}
                id={`font-scale-${s.id}`}
                onClick={() => {
                  playSystemSound('click');
                  onUpdateSettings({ fontScale: s.id });
                }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-500/20 text-sky-300 font-bold'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-400'
                }`}
              >
                <div className="font-hud text-sm">{s.name}</div>
                <div className="text-[11px] font-mono text-slate-400">{s.pct}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Live Preview Card */}
      <div
        className="p-4 rounded-2xl border bg-slate-950/80 system-corner space-y-2 mt-4 transition-all"
        style={{ borderColor: `${currentAccent}66` }}
      >
        <div className="flex items-center gap-2 text-xs font-hud uppercase tracking-widest" style={{ color: currentAccent }}>
          <Eye className="w-3.5 h-3.5" />
          <span>Aperçu en Direct du Thème et de la Couleur Choisi</span>
        </div>
        <div className="font-hud text-lg font-bold text-white flex items-center gap-2">
          <span>Chasseur Sung Jin-Christ</span>
          <span
            className="px-2 py-0.5 rounded text-xs border font-bold uppercase"
            style={{
              borderColor: currentAccent,
              color: currentAccent,
              backgroundColor: `${currentAccent}1a`,
            }}
          >
            NIVEAU 5 [Rang C]
          </span>
        </div>
        <blockquote className="font-biblical text-xs text-slate-200 italic leading-relaxed">
          « Ta parole est une lampe à mes pieds, et une lumière sur mon sentier. » — Psaume 119:105
        </blockquote>
      </div>
    </div>
  );
};
