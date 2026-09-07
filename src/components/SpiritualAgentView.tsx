import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  HunterUser,
  Quest,
  Vice,
  Skill,
  ActiveTab,
} from '../types';
import {
  generateLocalDiagnosis,
  askSpiritualAgent,
  SpiritualDiagnosis,
} from '../services/aiAgentService';
import {
  Bot,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  Music,
  Flame,
  ShieldAlert,
  Send,
  User,
  MessageSquare,
  ArrowRight,
  Target,
  Zap,
  Check,
  Shield,
  ShieldCheck,
  Smartphone,
  Lock,
  Unlock,
  Maximize2,
  AlertOctagon,
  Eye,
  HelpCircle,
  X,
} from 'lucide-react';
import { playSystemSound } from '../utils/audio';
import { worshipAudio } from '../utils/worshipAudio';

interface SpiritualAgentViewProps {
  user: HunterUser;
  quests: Quest[];
  vices: Vice[];
  skills: Skill[];
  onNavigate: (tab: ActiveTab) => void;
  onAddPrayerMinutes: (minutes: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
}

export const SpiritualAgentView: React.FC<SpiritualAgentViewProps> = ({
  user,
  quests,
  vices,
  skills,
  onNavigate,
  onAddPrayerMinutes,
}) => {
  // Diagnosis
  const diagnosis = useMemo(() => {
    return generateLocalDiagnosis(user, quests, vices);
  }, [user, quests, vices]);

  // Deep Focus Timer state
  const [focusTargetMinutes, setFocusTargetMinutes] = useState<number>(15);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState<number>(15 * 60);
  const [isFocusActive, setIsFocusActive] = useState<boolean>(false);
  const [focusSessionCompleted, setFocusSessionCompleted] = useState<boolean>(false);

  // Phone App Blocker & Focus Shield State
  const [isPhoneBlockShieldActive, setIsPhoneBlockShieldActive] = useState<boolean>(true);
  const [isStrictMode, setIsStrictMode] = useState<boolean>(true);
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [showDistractionAlert, setShowDistractionAlert] = useState<boolean>(false);
  const [showAppBlockGuide, setShowAppBlockGuide] = useState<boolean>(false);
  const wakeLockRef = useRef<any>(null);

  // Chat with AI Agent
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'agent',
      text: `Salutations fraternelles dans le Seigneur, ${user.name} (${user.spiritualTitle}). Je suis votre Guide et Mentor Spirituel. Ma tâche est de vous garder pleinement focalisé sur votre croissance dans la grâce, votre persévérance dans la prière et la victoire sur vos distractions quotidiennes. Sur quoi désirez-vous concentrer vos efforts aujourd'hui ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  // Screen WakeLock helper
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.warn('WakeLock not granted:', err);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      try {
        wakeLockRef.current.release();
      } catch (err) {}
      wakeLockRef.current = null;
    }
  };

  const requestFullscreenMode = () => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  // Phone distraction & app-switch tracker (intercepts tab / phone app switching)
  useEffect(() => {
    if (!isFocusActive || !isPhoneBlockShieldActive) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setDistractionCount((prev) => prev + 1);
        setShowDistractionAlert(true);
        playSystemSound('warning');
      }
    };

    const handleBlur = () => {
      if (isFocusActive) {
        setDistractionCount((prev) => prev + 1);
        setShowDistractionAlert(true);
        playSystemSound('warning');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isFocusActive, isPhoneBlockShieldActive]);

  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, []);

  // Focus Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isFocusActive && focusSecondsLeft > 0) {
      interval = setInterval(() => {
        setFocusSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isFocusActive && focusSecondsLeft === 0) {
      setIsFocusActive(false);
      setFocusSessionCompleted(true);
      releaseWakeLock();
      playSystemSound('quest_complete');
      onAddPrayerMinutes(focusTargetMinutes);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusActive, focusSecondsLeft, focusTargetMinutes, onAddPrayerMinutes]);

  const handleStartFocus = () => {
    playSystemSound('click');
    setIsFocusActive(true);
    setFocusSessionCompleted(false);

    if (isPhoneBlockShieldActive) {
      requestWakeLock();
      requestFullscreenMode();
    }

    // Auto-launch gentle worship audio if not already playing
    if (!worshipAudio.getState().isPlaying) {
      worshipAudio.play('presence');
    }
  };

  const handlePauseFocus = () => {
    playSystemSound('click');
    setIsFocusActive(false);
    releaseWakeLock();
  };

  const handleResetFocus = (minutes: number) => {
    playSystemSound('click');
    setIsFocusActive(false);
    releaseWakeLock();
    setFocusTargetMinutes(minutes);
    setFocusSecondsLeft(minutes * 60);
    setFocusSessionCompleted(false);
    setDistractionCount(0);
    setShowDistractionAlert(false);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Chat submission
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuestion;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAgentThinking(true);
    playSystemSound('click');

    try {
      const reply = await askSpiritualAgent(query.trim(), {
        name: user.name,
        spiritualTitle: user.spiritualTitle,
        hunterRank: user.hunterRank,
        level: user.level,
        currentXp: user.currentXp,
        prayerMinutesToday: user.prayerMinutesToday,
        bibleChaptersToday: user.bibleChaptersToday,
        generalViceStreak: user.generalViceStreak,
        uncompletedQuestsCount: quests.filter((q) => !q.completedToday).length,
      });

      const agentMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'agent',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, agentMsg]);
      playSystemSound('level_up');
    } catch (err) {
      console.error('Agent chat error:', err);
    } finally {
      setIsAgentThinking(false);
    }
  };

  const quickPrompts = [
    'Comment bloquer les autres applis du téléphone pour prier ?',
    'Comment rester concentré dans ma prière aujourd\'hui ?',
    'Donne-moi un plan pour vaincre ma paresse spirituelle',
    'Active le bouclier anti-distraction maximal pour ma session',
  ];

  const uncompletedQuests = quests.filter((q) => !q.completedToday);
  const activeVices = vices.filter((v) => !v.extracted);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Mentor Agent Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-950/60 via-[#0a101d] to-indigo-950/60 border border-sky-500/30 shadow-[0_0_50px_rgba(56,189,248,0.15)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-950/90 border border-sky-400/40 text-sky-300 text-xs font-hud font-bold tracking-widest uppercase">
              <Bot className="w-4 h-4 text-sky-400" />
              <span>MENTOR & GUIDE SPIRITUEL IA • CONCENTRATEUR DE PROGRESSION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-hud font-black tracking-wide text-white flex items-center gap-3">
              <span>{diagnosis.greeting}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {diagnosis.statusSummary}
            </p>
          </div>

          {/* Quick Stats Widget in Agent Banner */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center min-w-[90px]">
              <span className="text-[10px] font-hud text-slate-400 uppercase tracking-wider block">
                Niveau
              </span>
              <span className="text-lg font-hud font-bold text-sky-400">
                Lvl {user.level}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center min-w-[90px]">
              <span className="text-[10px] font-hud text-slate-400 uppercase tracking-wider block">
                Prière Jour
              </span>
              <span className="text-lg font-hud font-bold text-amber-400">
                {user.prayerMinutesToday} min
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center min-w-[90px]">
              <span className="text-[10px] font-hud text-slate-400 uppercase tracking-wider block">
                Parole Jour
              </span>
              <span className="text-lg font-hud font-bold text-emerald-400">
                {user.bibleChaptersToday} chap.
              </span>
            </div>
          </div>
        </div>

        {/* Biblical Foundation Quote */}
        <div className="mt-6 pt-4 border-t border-sky-500/20 flex items-center gap-2 text-xs text-slate-300 italic">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>
            {diagnosis.keyScripture.verse} — {diagnosis.keyScripture.reference}
          </span>
        </div>
      </div>

      {/* Main Grid: Deep Focus Mode (Left) & Focused Action Plan (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MODULE 1: DEEP FOCUS ENGINE & PHONE APP BLOCK SHIELD */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-hud font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-sky-400" />
                <span>Mode Recueillement & Bouclier Téléphone</span>
              </h3>
              <div className="flex items-center gap-2">
                {isPhoneBlockShieldActive && (
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-950 border border-sky-500/40 text-sky-300 text-[10px] font-hud font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    <span>BOUCLIER ACTIF</span>
                  </span>
                )}
                {isFocusActive && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 uppercase tracking-widest animate-pulse">
                    Session Active
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              L'Agent IA veille sur votre sanctuaire : plein écran immersif, écran maintenu éveillé, et alerte d'interception si vous tentez d'ouvrir une autre application.
            </p>

            {/* Shield Controls Strip */}
            <div className="p-3 rounded-2xl bg-black/40 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playSystemSound('click');
                    setIsPhoneBlockShieldActive(!isPhoneBlockShieldActive);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-hud font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isPhoneBlockShieldActive
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Kiosque & Écran Éveillé : {isPhoneBlockShieldActive ? 'OUI' : 'NON'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSystemSound('click');
                    setIsStrictMode(!isStrictMode);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-hud font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isStrictMode
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Mode Strict : {isStrictMode ? 'ACTIF' : 'OFF'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  playSystemSound('click');
                  setShowAppBlockGuide(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-hud font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700 hover:border-amber-400"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Bloquer Réseaux Sociaux (Guide)</span>
              </button>
            </div>

            {/* Distraction warning strip if user attempted distraction */}
            {distractionCount > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-center justify-between text-xs text-rose-300 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    <strong>{distractionCount} tentative(s)</strong> de basculement vers d'autres applications interceptée(s) !
                  </span>
                </div>
                <button
                  onClick={() => setDistractionCount(0)}
                  className="text-[10px] underline text-rose-400 hover:text-rose-200 cursor-pointer"
                >
                  Effacer
                </button>
              </div>
            )}
          </div>

          {/* Big Circular / Boxed Timer */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-950 to-[#0c1220] border border-sky-500/30 text-center space-y-4">
            <div className="text-5xl sm:text-6xl font-mono font-black text-white tracking-widest glow-blue">
              {formatTimer(focusSecondsLeft)}
            </div>

            <p className="text-xs font-hud text-slate-400">
              {isFocusActive
                ? 'Lieu Secret actif : Priez, méditez et demeurez en communion avec Dieu.'
                : focusSessionCompleted
                ? 'Gloire à Dieu ! Session validée et enregistrée sur votre profil.'
                : 'Choisissez la durée et lancez votre temps de recueillement.'}
            </p>

            {/* Timer Durations Selection */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  disabled={isFocusActive}
                  onClick={() => handleResetFocus(mins)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-hud font-bold border transition-all cursor-pointer disabled:opacity-40 ${
                    focusTargetMinutes === mins
                      ? 'bg-sky-500/30 border-sky-400 text-sky-200 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons for Focus Timer */}
          <div className="flex items-center gap-3">
            {isFocusActive ? (
              <button
                type="button"
                onClick={handlePauseFocus}
                className="flex-1 py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartFocus}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Démarrer le Recueillement</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleResetFocus(focusTargetMinutes)}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Réinitialiser le minuteur"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODULE 2: FOCUSED DAILY ACTION PLAN */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-hud font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Plan d'Action Focalisé du Jour</span>
            </h3>
            <p className="text-xs text-slate-300">
              Pour ne pas vous éparpiller, voici les 3 priorités absolues calculées par l'Agent selon votre état actuel :
            </p>
          </div>

          {/* Actionable Recommendations List */}
          <div className="space-y-3 flex-1">
            {diagnosis.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-sky-500/50 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        rec.urgent ? 'bg-rose-400 animate-ping' : 'bg-sky-400'
                      }`}
                    />
                    <h4 className="font-hud font-bold text-xs text-white uppercase tracking-wider">
                      {rec.title}
                    </h4>
                    <span className="text-[10px] font-hud text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      +{rec.xpReward} XP
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSystemSound('click');
                    onNavigate(rec.actionTab);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-slate-300 hover:text-white border border-slate-800 transition-colors shrink-0 cursor-pointer"
                  title="Ouvrir cette section"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Quick Links Footer */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-hud">
            <span className="text-slate-400">
              Quêtes du jour restantes : {uncompletedQuests.length}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('quests')}
              className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Voir les quêtes <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODULE 3: INTERACTIVE CHAT WITH SPIRITUAL AGENT */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-hud font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              <span>Dialogue avec l'Agent IA & Conseils Personnalisés</span>
            </h3>
            <p className="text-xs text-slate-300">
              Posez vos questions sur la sanctification, la prière, vos tentations ou demandez un plan d'action sur mesure.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-hud text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Agent Actif & À l'Écoute</span>
          </div>
        </div>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              disabled={isAgentThinking}
              className="px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-xs text-slate-300 hover:text-white transition-all cursor-pointer text-left"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Messages Log Container */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white'
                    : 'bg-indigo-950 border border-indigo-500/40 text-sky-300'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-sky-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isAgentThinking && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" />
              <span
                className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.4s' }}
              />
              <span>L'Agent analyse vos statistiques et prépare votre conseil...</span>
            </div>
          )}
        </div>

        {/* Chat input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={isAgentThinking}
            placeholder="Posez votre question à l'Agent spirituel..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isAgentThinking || !inputQuestion.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </form>
      </div>

      {/* MODAL 1: DISTRACTION / APP-SWITCH INTERCEPTION ALERT */}
      {showDistractionAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-950 border-2 border-rose-500/80 shadow-[0_0_50px_rgba(244,63,94,0.4)] text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                Alerte Distraction Téléphonique ({distractionCount} tentative{distractionCount > 1 ? 's' : ''})
              </span>
              <h3 className="text-lg font-hud font-black text-white uppercase tracking-wider mt-2">
                Interception de l'Agent IA !
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                L'Agent a détecté que vous avez quitté BloomVerse pour basculer vers une autre application du téléphone.
                Ne laissez pas les algorithmes du monde voler votre temps d'intimité avec Dieu !
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-amber-300 font-hud italic">
              « Veillez et priez, afin que vous ne tombiez pas dans la tentation ; l'esprit est bien disposé, mais la chair est faible. » (Matthieu 26:41)
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  playSystemSound('click');
                  setShowDistractionAlert(false);
                  if (isPhoneBlockShieldActive) {
                    requestFullscreenMode();
                    requestWakeLock();
                  }
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-hud font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
              >
                Reprendre le Recueillement (Résister au Piège)
              </button>

              <button
                type="button"
                onClick={() => {
                  playSystemSound('click');
                  setShowDistractionAlert(false);
                  handlePauseFocus();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-hud font-bold text-xs uppercase transition-all cursor-pointer"
              >
                Mettre en Pause la Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: COMPLETE GUIDE FOR BLOCKING OTHER PHONE APPS */}
      {showAppBlockGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-2xl w-full max-h-[90vh] flex flex-col rounded-3xl bg-[#0b0f19] border border-sky-500/40 shadow-[0_0_50px_rgba(56,189,248,0.2)] overflow-hidden text-slate-100">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-hud font-black text-white tracking-wider">
                    GUIDE DE BLOCAGE DES APPLIS DU TÉLÉPHONE
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comment coupler BloomVerse aux mécanismes de verrouillage de votre smartphone
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAppBlockGuide(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-300">
              {/* Note technique de sécurité */}
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-hud font-bold text-sky-300 text-xs block uppercase tracking-wider">
                    Fonctionnement du Bouclier BloomVerse
                  </span>
                  <p className="leading-relaxed">
                    Pour des raisons de sécurité imposées par Google (Android) et Apple (iOS), les applications web ne peuvent pas forcer la fermeture ou la désinstallation d'autres applications sans passer par les outils de <strong>Bien-être numérique</strong> de votre téléphone. L'Agent IA gère cela grâce à 3 piliers :
                  </p>
                </div>
              </div>

              {/* 3 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <div className="font-hud font-bold text-sky-400 text-xs flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4" />
                    <span>1. Plein Écran Kiosque</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Masque la barre d'onglets, l'adresse web et les barres système pour éliminer toute tentation visuelle.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <div className="font-hud font-bold text-amber-400 text-xs flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>2. Écran Éveillé (WakeLock)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Maintient l'écran allumé pendant toute la durée de la prière pour éviter que le téléphone ne se verrouille.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <div className="font-hud font-bold text-rose-400 text-xs flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4" />
                    <span>3. Alerte d'Évasion</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Dès que vous quittez BloomVerse pour ouvrir Instagram, TikTok ou WhatsApp, l'alarme sonne pour vous ramener au calme.
                  </p>
                </div>
              </div>

              {/* Steps for Android */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-hud font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Configuration sur Android (Samsung, Xiaomi, Pixel, etc.)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                    Recommandé
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed text-xs">
                  <li>Ouvrez les <strong>Paramètres</strong> de votre téléphone Android.</li>
                  <li>Allez dans <strong>Bien-être numérique et contrôle parental</strong>.</li>
                  <li>Sélectionnez <strong>Mode Sans distraction</strong> ou <strong>Mode Concentration</strong>.</li>
                  <li>Cochez les applications perturbatrices : <em>TikTok, Instagram, WhatsApp, Facebook, YouTube, Jeux</em>.</li>
                  <li><strong>Activez-le</strong> avant de lancer votre session : Android grisera et bloquera totalement l'ouverture de ces applications !</li>
                </ol>
              </div>

              {/* Steps for iPhone / iOS */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-hud font-bold text-indigo-400 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Configuration sur iPhone (iOS)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-bold">
                    Mode Focus Apple
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed text-xs">
                  <li>Ouvrez <strong>Réglages</strong> &gt; <strong>Concentration</strong>.</li>
                  <li>Appuyez sur le bouton <strong>+</strong> et créez un profil nommé <em>« Prière & Recueillement »</em>.</li>
                  <li>Dans « Notifications autorisées », n'ajoutez aucune application sociale.</li>
                  <li>Dans « Pages d'écran d'accueil », vous pouvez masquer les pages contenant les réseaux sociaux pendant le mode concentration !</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Bouclier IA prêt pour votre prochaine session.
              </span>
              <button
                type="button"
                onClick={() => setShowAppBlockGuide(false)}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-hud font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Compris, Activer le Bouclier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
