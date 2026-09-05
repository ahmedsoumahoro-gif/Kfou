import React from 'react';
import { Shield, Sparkles, Flame, User, Cross } from 'lucide-react';
import { getRankBadgeColor, getRankShortCode } from '../data/initialData';

interface HunterAvatarProps {
  avatar?: string;
  name: string;
  rank?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showRankBorder?: boolean;
  showStatusDot?: boolean;
  showRankTag?: boolean;
}

export const PRESET_AVATARS = [
  {
    id: 'preset:shadow_monarch',
    name: 'Monarque des Ombres Céleste',
    bg: 'from-blue-900 via-indigo-950 to-black',
    accent: '#38bdf8',
    icon: Shield,
  },
  {
    id: 'preset:prayer_warrior',
    name: 'Guerrier d’Intercession',
    bg: 'from-amber-700 via-orange-900 to-black',
    accent: '#fbbf24',
    icon: Flame,
  },
  {
    id: 'preset:light_sentinel',
    name: 'Sentinelle de Lumière',
    bg: 'from-emerald-700 via-teal-900 to-black',
    accent: '#34d399',
    icon: Sparkles,
  },
  {
    id: 'preset:faith_paladin',
    name: 'Chevalier de la Foi',
    bg: 'from-purple-800 via-slate-900 to-black',
    accent: '#c084fc',
    icon: Cross,
  },
  {
    id: 'preset:apostolic_seer',
    name: 'Disciple Éveillé',
    bg: 'from-sky-700 via-blue-950 to-slate-950',
    accent: '#60a5fa',
    icon: User,
  },
];

export const HunterAvatar: React.FC<HunterAvatarProps> = ({
  avatar,
  name,
  rank = 'Rang C',
  size = 'md',
  className = '',
  showRankBorder = true,
  showStatusDot = false,
  showRankTag = true,
}) => {
  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-24 h-24 text-3xl',
  };

  const getRankBorderClass = (r: string) => {
    switch (r) {
      case 'Chasseur National':
        return 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]';
      case 'Rang S':
        return 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
      case 'Rang A':
        return 'border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]';
      case 'Rang B':
        return 'border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
      case 'Rang C':
        return 'border-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.3)]';
      case 'Rang D':
        return 'border-teal-400';
      default:
        return 'border-slate-700';
    }
  };

  const borderStyle = showRankBorder
    ? getRankBorderClass(rank)
    : 'border-slate-700';

  // Check if avatar is an uploaded image (data URL or regular URL)
  const isImage =
    avatar &&
    (avatar.startsWith('data:image/') ||
      avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('blob:'));

  const matchingPreset = PRESET_AVATARS.find((p) => p.id === avatar);
  const shortRank = getRankShortCode(rank);

  return (
    <div className={`relative inline-block select-none ${className}`}>
      <div
        className={`relative overflow-hidden rounded-2xl border-2 flex items-center justify-center bg-slate-950 transition-all ${sizeClasses[size]} ${borderStyle}`}
      >
        {isImage ? (
          <img
            src={avatar}
            alt={`Photo de profil de ${name}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        ) : matchingPreset ? (
          <div
            className={`w-full h-full bg-gradient-to-br ${matchingPreset.bg} flex items-center justify-center`}
          >
            {React.createElement(matchingPreset.icon, {
              className: 'w-1/2 h-1/2',
              style: { color: matchingPreset.accent },
            })}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sky-950 via-slate-900 to-[#0c1426] flex items-center justify-center text-sky-400 font-hud font-bold">
            {name ? name.slice(0, 2).toUpperCase() : <Shield className="w-1/2 h-1/2 text-sky-400" />}
          </div>
        )}
      </div>

      {/* Online Status Dot */}
      {showStatusDot && (
        <span
          className={`absolute ${
            showRankTag ? '-top-0.5 -right-0.5' : '-bottom-0.5 -right-0.5'
          } w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_6px_#34d399] z-10`}
          title="Système Connecté"
        />
      )}

      {/* Rank Tag Badge on Avatar (Visible everywhere on mobile & desktop) */}
      {showRankTag && size !== 'xs' && (
        <span
          className={`absolute -bottom-1 -right-1 px-1 py-0.2 rounded font-hud font-bold text-[9px] uppercase leading-none border shadow-md z-10 pointer-events-none ${getRankBadgeColor(
            rank
          )}`}
          title={`Rang du Chasseur: ${rank}`}
        >
          {shortRank}
        </span>
      )}
    </div>
  );
};
