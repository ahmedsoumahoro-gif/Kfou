import React from 'react';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Music,
  CheckSquare,
  Skull,
  Network,
  Compass,
  ShieldCheck,
  User,
  Palette,
} from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  uncompletedQuestsCount: number;
  onOpenSettings?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  uncompletedQuestsCount,
  onOpenSettings,
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Statut', shortLabel: 'Statut', icon: LayoutDashboard },
    { id: 'bible' as ActiveTab, label: 'La Bible', shortLabel: 'Bible', icon: BookOpen },
    { id: 'worship' as ActiveTab, label: 'Adoration', shortLabel: 'Adoration', icon: Music },
    {
      id: 'quests' as ActiveTab,
      label: 'Quêtes',
      shortLabel: 'Quêtes',
      icon: CheckSquare,
      badge: uncompletedQuestsCount > 0 ? uncompletedQuestsCount : undefined,
    },
    { id: 'shadows' as ActiveTab, label: 'Ombres', shortLabel: 'Ombres', icon: Skull },
    { id: 'skills' as ActiveTab, label: 'Dons & Skills', shortLabel: 'Dons', icon: Network },
    { id: 'dungeons' as ActiveTab, label: 'Portails', shortLabel: 'Portails', icon: Compass },
    { id: 'inventory' as ActiveTab, label: 'Épées', shortLabel: 'Épées', icon: ShieldCheck },
    { id: 'profile' as ActiveTab, label: 'Profil', shortLabel: 'Profil', icon: User },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    playSystemSound('click');
    onSelectTab(tabId);
  };

  return (
    <>
      {/* Desktop Navigation Tabs */}
      <nav className="hidden lg:flex items-center justify-center gap-1.5 py-3 px-4 border-b border-sky-950/40 bg-[#090c14]/80 backdrop-blur-sm sticky top-[65px] z-30">
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-sky-900/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`desktop-nav-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--accent-bg)',
                        borderColor: 'var(--accent-border)',
                        color: 'var(--accent-color)',
                        boxShadow: '0 0 15px var(--accent-glow)',
                      }
                    : undefined
                }
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-hud text-sm font-semibold tracking-wide transition-all border ${
                  isActive
                    ? 'border'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon
                  className="w-4 h-4 transition-colors"
                  style={isActive ? { color: 'var(--accent-color)' } : undefined}
                />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-red-500/80 text-white font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Appearance & Theme Shortcut */}
          {onOpenSettings && (
            <button
              type="button"
              id="desktop-nav-settings-shortcut"
              onClick={() => {
                playSystemSound('click');
                onOpenSettings();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-hud text-xs font-bold text-sky-400 hover:text-sky-300 hover:bg-sky-950/40 border border-sky-900/40 hover:border-sky-500/50 transition-all cursor-pointer ml-1"
              title="Personnaliser les Thèmes, Polices & Couleurs"
            >
              <Palette className="w-4 h-4 text-sky-400" />
              <span>Thèmes</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Top Quick Module Carousel Strip (Guarantees all 7 modules are 100% visible & 1-tap accessible) */}
      <div className="lg:hidden sticky top-[57px] sm:top-[63px] z-30 w-full bg-[#07090e]/95 backdrop-blur-md border-b border-sky-950/60 px-2 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 scroll-smooth">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={`mobile-top-${tab.id}`}
              id={`mobile-top-nav-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud font-bold whitespace-nowrap shrink-0 transition-all border ${
                isActive
                  ? 'border shadow-sm scale-102'
                  : 'border-slate-800/80 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: 'var(--accent-bg)',
                      borderColor: 'var(--accent-border)',
                      color: 'var(--accent-color)',
                      boxShadow: '0 0 10px var(--accent-glow)',
                    }
                  : undefined
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.shortLabel}</span>
              {tab.badge !== undefined && (
                <span className="px-1 text-[9px] rounded-full bg-red-500 text-white font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Mobile Top Themes button */}
        {onOpenSettings && (
          <button
            type="button"
            id="mobile-top-nav-themes"
            onClick={() => {
              playSystemSound('click');
              onOpenSettings();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-hud font-bold whitespace-nowrap shrink-0 border border-sky-500/50 bg-sky-950/40 text-sky-400 hover:text-sky-300"
            title="Thèmes & Polices"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Thèmes</span>
          </button>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (PWA Style, Smooth Scroll & No Clipping) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/95 border-t border-sky-900/40 backdrop-blur-xl px-1 py-1.5 safe-area-pb shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between sm:justify-around w-full max-w-md mx-auto overflow-x-auto no-scrollbar gap-0.5 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-nav-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition-all min-w-[44px] sm:min-w-[50px] shrink-0 ${
                  isActive ? 'scale-105' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={isActive ? { color: 'var(--accent-color)' } : undefined}
              >
                <div className="relative">
                  <Icon
                    className="w-5 h-5 transition-all"
                    style={
                      isActive
                        ? {
                            color: 'var(--accent-color)',
                            filter: 'drop-shadow(0 0 8px var(--accent-glow))',
                          }
                        : undefined
                    }
                  />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 px-1 text-[9px] rounded-full bg-red-500 text-white font-bold">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] font-hud mt-0.5 whitespace-nowrap ${
                    isActive ? 'font-bold' : 'font-medium text-slate-400'
                  }`}
                  style={isActive ? { color: 'var(--accent-color)' } : undefined}
                >
                  {tab.shortLabel}
                </span>
                {isActive && (
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-0.5"
                    style={{
                      backgroundColor: 'var(--accent-color)',
                      boxShadow: '0 0 6px var(--accent-color)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
