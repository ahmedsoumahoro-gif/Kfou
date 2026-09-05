import React, { useState, useEffect } from 'react';
import { ReminderSettings, ReminderTone, HunterUser, Quest } from '../types';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  triggerReminderNotification,
  getReminderContent,
} from '../utils/notifications';
import {
  Bell,
  BellRing,
  Flame,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  X,
  Play,
  Check,
  ShieldAlert,
  HelpCircle,
  Smartphone,
} from 'lucide-react';
import { playSystemSound } from '../utils/audio';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReminderSettings;
  onUpdateSettings: (newSettings: ReminderSettings) => void;
  user: HunterUser;
  quests: Quest[];
  onTriggerInAppAlert?: (title: string, message: string) => void;
}

const PRESET_TIMES = [
  { label: 'Aube & Matinée', time: '07:30', icon: '🌅' },
  { label: 'Pause Midi', time: '12:30', icon: '☀️' },
  { label: 'Soirée & Bilan', time: '19:30', icon: '🌇' },
  { label: 'Dernier Appel', time: '21:45', icon: '🌙' },
];

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  user,
  quests,
  onTriggerInAppAlert,
}) => {
  const [localSettings, setLocalSettings] = useState<ReminderSettings>(settings);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSuccess, setTestSuccess] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setPermission(getNotificationPermission());
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const uncompletedQuests = quests.filter((q) => !q.completedToday).length;
  const streak = user.generalViceStreak > 0 ? user.generalViceStreak : 1;
  const isStreakAtRisk = uncompletedQuests > 0 || user.prayerMinutesToday < 10;

  // Request browser notification permission
  const handleRequestPermission = async () => {
    setIsRequesting(true);
    playSystemSound('click');
    const result = await requestNotificationPermission();
    setPermission(result);
    setIsRequesting(false);

    if (result === 'granted') {
      playSystemSound('level_up');
      const updated = { ...localSettings, enabled: true };
      setLocalSettings(updated);
      onUpdateSettings(updated);
    }
  };

  // Toggle notification enabled
  const handleToggleEnabled = async () => {
    playSystemSound('click');
    if (!localSettings.enabled) {
      if (permission !== 'granted') {
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result === 'granted') {
          playSystemSound('level_up');
          const updated = { ...localSettings, enabled: true };
          setLocalSettings(updated);
          onUpdateSettings(updated);
          return;
        }
      }
      const updated = { ...localSettings, enabled: true };
      setLocalSettings(updated);
      onUpdateSettings(updated);
    } else {
      const updated = { ...localSettings, enabled: false };
      setLocalSettings(updated);
      onUpdateSettings(updated);
    }
  };

  const handleTimeChange = (time: string) => {
    playSystemSound('click');
    const updated = { ...localSettings, time };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleToneChange = (tone: ReminderTone) => {
    playSystemSound('click');
    const updated = { ...localSettings, tone };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleSoundToggle = () => {
    playSystemSound('click');
    const updated = { ...localSettings, soundEnabled: !localSettings.soundEnabled };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleStreakAlertToggle = () => {
    playSystemSound('click');
    const updated = { ...localSettings, streakAlertEnabled: !localSettings.streakAlertEnabled };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  // Test Notification
  const handleTestNotification = async () => {
    playSystemSound('click');
    setTestSuccess(false);

    const { sent, quote } = await triggerReminderNotification(
      localSettings,
      user,
      uncompletedQuests
    );

    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3500);

    // If native notification couldn't display, trigger in-app popup as fallback
    if (!sent && onTriggerInAppAlert) {
      onTriggerInAppAlert(
        `${quote.emoji} ${quote.title}`,
        `${quote.body} (Aperçu du rappel Duolingo)`
      );
    }
  };

  // Live preview quote
  const previewQuote = getReminderContent(localSettings.tone, user, uncompletedQuests);

  return (
    <div
      id="reminder-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#080c16] border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)] system-corner overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            playSystemSound('click');
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-hud font-bold tracking-wider uppercase bg-amber-950/80 border border-amber-500/40 text-amber-300">
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              RAPPEL DE SÉRIE & NOTIFICATIONS
            </span>
            {localSettings.enabled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-hud font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ACTIF
              </span>
            )}
          </div>
          <h2 className="font-hud text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <span>Rappels Quotidiens</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Style Duolingo
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Ne perdez jamais votre série de foi ! Recevez un rappel persistant pour valider vos quêtes et votre temps de prière.
          </p>
        </div>

        {/* Duolingo Mascot & Streak Flame Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isStreakAtRisk
              ? 'bg-gradient-to-r from-amber-950/60 via-red-950/40 to-slate-900 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
              : 'bg-gradient-to-r from-emerald-950/50 via-sky-950/40 to-slate-900 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Animated Mascot / Flame Avatar */}
            <div className="relative shrink-0">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 shadow-inner ${
                  isStreakAtRisk
                    ? 'bg-gradient-to-tr from-amber-600 to-red-500 border-amber-300/80 animate-bounce shadow-amber-500/50'
                    : 'bg-gradient-to-tr from-emerald-600 to-sky-500 border-emerald-300/80 shadow-emerald-500/50'
                }`}
              >
                {isStreakAtRisk ? '🦉' : '🔥'}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-black/90 border border-amber-400 text-[10px] font-hud font-bold text-amber-300">
                {streak}j
              </span>
            </div>

            {/* Mascot Speech Bubble */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-hud uppercase tracking-wider text-amber-400 font-bold">
                  {isStreakAtRisk ? '⚠️ SÉRIE EN DANGER AUJOURD’HUI !' : '✨ SÉRIE DE VICTOIRE SÉCURISÉE'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {user.prayerMinutesToday}m / 15m prière
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium leading-snug">
                {isStreakAtRisk
                  ? `L'Aigle Céleste vous surveille ! Il vous reste ${uncompletedQuests} quête(s) à valider pour protéger votre flamme de ${streak} jours.`
                  : `Magnifique persévérance, Chasseur ${user.name} ! Votre autel céleste brille de mille feux aujourd'hui.`}
              </p>
            </div>
          </div>
        </div>

        {/* Master Toggle: Enable Reminders */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <BellRing className={`w-4 h-4 ${localSettings.enabled ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
              <span className="font-hud font-bold text-white text-sm">
                Rappels de notification
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Recevoir un rappel automatique chaque jour à l'heure sélectionnée
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleEnabled}
            className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer focus:outline-none shrink-0 ${
              localSettings.enabled ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                localSettings.enabled ? 'translate-x-8' : 'translate-x-1'
              } shadow-md`}
            />
          </button>
        </div>

        {/* Permission Status & Request Button */}
        {permission !== 'granted' && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {permission === 'denied'
                  ? 'Notifications bloquées dans votre navigateur.'
                  : 'Autorisez les alertes pour recevoir les rappels sur votre appareil.'}
              </span>
            </div>

            {permission !== 'denied' ? (
              <button
                type="button"
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-hud font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isRequesting ? 'Demande...' : 'Autoriser'}</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">
                Débloquez dans l'icône 🔒 de l'URL
              </span>
            )}
          </div>
        )}

        {/* TIME SELECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-hud uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Heure du Rappel Quotidien
            </label>
            <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
              {localSettings.time}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_TIMES.map((preset) => {
              const isSelected = localSettings.time === preset.time;
              return (
                <button
                  key={preset.time}
                  type="button"
                  onClick={() => handleTimeChange(preset.time)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{preset.icon}</span>
                    <span className="font-mono font-bold text-xs text-amber-300">{preset.time}</span>
                  </div>
                  <span className="text-[10px] font-hud font-semibold truncate">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Time Input */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 font-hud">Ou heure personnalisée :</span>
            <input
              type="time"
              value={localSettings.time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* TONE SELECTION (DUOLINGO / SOLO LEVELING / GRACE) */}
        <div className="space-y-3">
          <label className="text-xs font-hud uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Tempérament du Rappel
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Duolingo Style */}
            <button
              type="button"
              onClick={() => handleToneChange('duolingo')}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                localSettings.tone === 'duolingo'
                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">🦉</span>
                {localSettings.tone === 'duolingo' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <span className="font-hud font-bold text-xs text-amber-300">Style Duolingo</span>
              <span className="text-[10px] text-slate-400 leading-tight">
                Insistant, humoristique & protecteur de série
              </span>
            </button>

            {/* Solo Leveling Style */}
            <button
              type="button"
              onClick={() => handleToneChange('solo_leveling')}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                localSettings.tone === 'solo_leveling'
                  ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">⚔️</span>
                {localSettings.tone === 'solo_leveling' && <Check className="w-4 h-4 text-sky-400" />}
              </div>
              <span className="font-hud font-bold text-xs text-sky-300">Solo Leveling</span>
              <span className="text-[10px] text-slate-400 leading-tight">
                Directive d'urgence du Système & donjons
              </span>
            </button>

            {/* Grace Style */}
            <button
              type="button"
              onClick={() => handleToneChange('grace')}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                localSettings.tone === 'grace'
                  ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">🕊️</span>
                {localSettings.tone === 'grace' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <span className="font-hud font-bold text-xs text-emerald-300">Grâce & Paix</span>
              <span className="text-[10px] text-slate-400 leading-tight">
                Encouragement biblique doux et bienveillant
              </span>
            </button>
          </div>

          {/* Live Preview Card */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[9px] font-hud uppercase tracking-wider text-slate-400 block">
              [ EXEMPLE DU MESSAGE ENVOYÉ ]
            </span>
            <div className="flex items-start gap-2">
              <span className="text-base">{previewQuote.emoji}</span>
              <div>
                <p className="text-xs font-hud font-bold text-white">{previewQuote.title}</p>
                <p className="text-[11px] text-slate-300 font-sans">{previewQuote.body}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ADDITIONAL OPTIONS */}
        <div className="space-y-2.5 pt-1">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              {localSettings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span className="font-hud font-semibold">Carillon & Effet Sonore du Rappel</span>
            </div>
            <button
              type="button"
              onClick={handleSoundToggle}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                localSettings.soundEnabled ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform transform ${
                  localSettings.soundEnabled ? 'translate-x-5' : 'translate-x-1'
                } shadow-sm`}
              />
            </button>
          </div>

          {/* In-app streak banner toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="font-hud font-semibold">Bannière « Série en Danger » sur l'accueil</span>
            </div>
            <button
              type="button"
              onClick={handleStreakAlertToggle}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                localSettings.streakAlertEnabled ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform transform ${
                  localSettings.streakAlertEnabled ? 'translate-x-5' : 'translate-x-1'
                } shadow-sm`}
              />
            </button>
          </div>
        </div>

        {/* TEST BUTTON & ACTIONS */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            id="test-notification-btn"
            onClick={handleTestNotification}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-98"
          >
            {testSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Rappel Envoyé avec Succès !</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Tester la Notification Maintenant</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              playSystemSound('click');
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-hud font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Enregistrer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
