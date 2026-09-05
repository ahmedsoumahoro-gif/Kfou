import React from 'react';
import { AppearanceSettings } from '../types';
import { AppearanceSettingsSection } from './AppearanceSettingsSection';
import { Sliders, X } from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface AppearanceSettingsModalProps {
  isOpen: boolean;
  settings: AppearanceSettings;
  onUpdateSettings: (newSettings: Partial<AppearanceSettings>) => void;
  onClose: () => void;
}

export const AppearanceSettingsModal: React.FC<AppearanceSettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#090d16] border border-sky-400/40 p-5 sm:p-7 shadow-[0_0_40px_rgba(56,189,248,0.25)] system-corner space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-hud uppercase tracking-widest text-sky-400 block">
                [ CONFIGURATION VISUELLE ]
              </span>
              <h2 className="font-hud text-xl sm:text-2xl font-bold text-white tracking-wide">
                Paramètres d'Affichage & Thèmes
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              playSystemSound('click');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <AppearanceSettingsSection
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              playSystemSound('click');
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
          >
            Appliquer et Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
