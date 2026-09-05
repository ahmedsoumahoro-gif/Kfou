import { AccentColorPreset } from '../types';

export interface ColorPresetConfig {
  id: AccentColorPreset;
  name: string;
  sub: string;
  hex: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  glowClass: string;
}

export const ACCENT_COLOR_PRESETS: ColorPresetConfig[] = [
  {
    id: 'cyan',
    name: 'Cyan Néon',
    sub: 'Solo Leveling',
    hex: '#38bdf8',
    borderClass: 'border-sky-400',
    bgClass: 'bg-sky-500',
    textClass: 'text-sky-400',
    glowClass: 'shadow-[0_0_15px_rgba(56,189,248,0.5)]',
  },
  {
    id: 'gold',
    name: 'Or Céleste',
    sub: 'Gloire Divine',
    hex: '#f59e0b',
    borderClass: 'border-amber-400',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-400',
    glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]',
  },
  {
    id: 'emerald',
    name: 'Émeraude Vivant',
    sub: 'Arbre de Vie',
    hex: '#10b981',
    borderClass: 'border-emerald-400',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]',
  },
  {
    id: 'purple',
    name: 'Pourpre Monarque',
    sub: 'Onction Royale',
    hex: '#a855f7',
    borderClass: 'border-purple-400',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-400',
    glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
  },
  {
    id: 'crimson',
    name: 'Rouge Écarlate',
    sub: 'Feu du Saint-Esprit',
    hex: '#ef4444',
    borderClass: 'border-red-500',
    bgClass: 'bg-red-500',
    textClass: 'text-red-400',
    glowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]',
  },
  {
    id: 'blue',
    name: 'Saphir Azur',
    sub: 'Trône de Grâce',
    hex: '#3b82f6',
    borderClass: 'border-blue-400',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-400',
    glowClass: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  },
  {
    id: 'amber',
    name: 'Flamme Vivante',
    sub: 'Lampe Sacrée',
    hex: '#f97316',
    borderClass: 'border-orange-400',
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-400',
    glowClass: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]',
  },
  {
    id: 'rose',
    name: 'Rose Shulamite',
    sub: 'Amour Pur',
    hex: '#f43f5e',
    borderClass: 'border-rose-400',
    bgClass: 'bg-rose-500',
    textClass: 'text-rose-400',
    glowClass: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]',
  },
];

export function getEffectiveAccentColor(preset: AccentColorPreset, customHex?: string): string {
  if (preset === 'custom' && customHex) {
    return customHex;
  }
  const match = ACCENT_COLOR_PRESETS.find((p) => p.id === preset);
  return match ? match.hex : '#38bdf8';
}
