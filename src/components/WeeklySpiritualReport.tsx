import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Trophy,
  Flame,
  Cloud,
  Share2,
  Copy,
  ChevronRight,
  Shield,
  ArrowUpRight,
  RefreshCw,
  Check,
  Sun,
  Crown,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { HunterUser, Quest, Vice, WeeklySpiritualReportData } from '../types';
import {
  buildWeeklyReport,
  formatMinutesToHours,
  getGradeBadge,
  getWeekDateRange,
  isTodaySunday,
} from '../utils/weeklyReport';
import {
  saveWeeklyReportToCloud,
  fetchWeeklyReportsFromCloud,
} from '../services/firebase';
import { playSystemSound } from '../utils/audio';

interface WeeklySpiritualReportProps {
  isOpen: boolean;
  onClose: () => void;
  user: HunterUser;
  quests: Quest[];
  vices: Vice[];
  firebaseUser: FirebaseUser | null;
  onSimulateSundayToggle?: () => void;
  isSimulatedSunday?: boolean;
}

export const WeeklySpiritualReport: React.FC<WeeklySpiritualReportProps> = ({
  isOpen,
  onClose,
  user,
  quests,
  vices,
  firebaseUser,
  isSimulatedSunday = false,
}) => {
  const [report, setReport] = useState<WeeklySpiritualReportData | null>(null);
  const [historyReports, setHistoryReports] = useState<WeeklySpiritualReportData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'history'>('overview');
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const isRealSunday = isTodaySunday(false);
  const isSunday = isRealSunday || isSimulatedSunday;
  const dateRange = getWeekDateRange();

  // Generate the current week report whenever opened or dependencies update
  useEffect(() => {
    if (isOpen) {
      const generated = buildWeeklyReport(user, quests, vices, {
        simulatedSunday: isSunday,
      });
      setReport(generated);
      playSystemSound('level_up');

      // If user is connected to Firebase, auto-persist Sunday report to Firestore
      if (firebaseUser?.uid) {
        saveWeeklyReportToCloud(firebaseUser.uid, generated)
          .then(() => setCloudSynced(true))
          .catch((err) => console.warn('Could not auto-save weekly report to cloud:', err));
      }
    }
  }, [isOpen, user, quests, vices, firebaseUser?.uid, isSunday]);

  // Load history from Firebase when the history tab is opened
  useEffect(() => {
    if (activeTab === 'history' && firebaseUser?.uid) {
      setLoadingHistory(true);
      fetchWeeklyReportsFromCloud(firebaseUser.uid)
        .then((items) => {
          setHistoryReports(items);
        })
        .catch((err) => {
          console.error('Error fetching weekly report history:', err);
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    }
  }, [activeTab, firebaseUser?.uid]);

  if (!isOpen || !report) return null;

  const gradeInfo = getGradeBadge(report.weeklyGrade);

  // Manual save to cloud
  const handleSaveToCloud = async () => {
    if (!firebaseUser?.uid) {
      playSystemSound('click');
      alert('Veuillez vous connecter avec votre compte pour sauvegarder vos bilans dans Firebase.');
      return;
    }
    try {
      setIsSavingCloud(true);
      playSystemSound('click');
      await saveWeeklyReportToCloud(firebaseUser.uid, report);
      setCloudSynced(true);
      playSystemSound('level_up');
    } catch (err) {
      console.error('Save to cloud failed:', err);
    } finally {
      setIsSavingCloud(false);
    }
  };

  // Copy report summary text for sharing
  const handleCopySummary = () => {
    playSystemSound('click');
    const textToCopy = `👑 [ BILAN SPIRITUEL HEBDOMADAIRE DU DIMANCHE ] 👑
Chasseur : ${user.name} (${user.spiritualTitle})
Période : Semaine ${report.weekNumber} (${dateRange.formattedRange})
Rang Semaine : ${gradeInfo.label} (${report.weeklyEvaluationTitle})

⏱️ Prière totale : ${formatMinutesToHours(report.totalPrayerMinutes)}
📖 Chapitres Bibliques : ${report.totalBibleChapters}
⚔️ Quêtes de Gloire : ${report.totalQuestsCompleted}
✨ XP Obtenue : +${report.totalXpGained} XP

Verset Clé : "${report.scriptureAnchor.verse}" (${report.scriptureAnchor.reference})

Généré par BloomVerse Céleste.`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  return (
    <div
      id="weekly-report-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="weekly-report-container"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900/95 border border-sky-500/40 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.25)] text-slate-100 overflow-hidden"
      >
        {/* Top Celestial Glow Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-b border-sky-500/30 p-4 sm:p-6 shrink-0">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-sky-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-hud font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {isRealSunday
                      ? '☀️ JOUR DU SEIGNEUR (DIMANCHE)'
                      : isSimulatedSunday
                      ? '☀️ APERÇU BILAN DU DIMANCHE'
                      : 'RAPPORT HEBDOMADAIRE'}
                  </span>
                  <span className="text-xs text-sky-400 font-hud">
                    Semaine {report.weekNumber} • {dateRange.formattedRange}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-hud font-bold text-white tracking-wide flex items-center gap-2 mt-0.5">
                  Bilan Spirituel Hebdomadaire
                  <Sparkles className="w-4 h-4 text-sky-400 inline" />
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Résumé visuel des victoires, du temps de prière et de la consécration dans le Système.
                </p>
              </div>
            </div>

            <button
              id="weekly-report-close-btn"
              onClick={() => {
                playSystemSound('click');
                onClose();
              }}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Fermer le rapport"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-header Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800/80 overflow-x-auto text-xs font-hud">
            <button
              type="button"
              id="tab-weekly-overview"
              onClick={() => {
                playSystemSound('click');
                setActiveTab('overview');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-sky-500 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              Vue d'Ensemble & Rang
            </button>
            <button
              type="button"
              id="tab-weekly-breakdown"
              onClick={() => {
                playSystemSound('click');
                setActiveTab('breakdown');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'breakdown'
                  ? 'bg-sky-500 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              Graphiques & Piliers
            </button>
            <button
              type="button"
              id="tab-weekly-history"
              onClick={() => {
                playSystemSound('click');
                setActiveTab('history');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-sky-500 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              Archives Firebase
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Prayer Time */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-sky-500/30 relative overflow-hidden group hover:border-sky-500/60 transition-colors">
                  <div className="flex items-center justify-between text-sky-400 mb-1">
                    <span className="text-[11px] font-hud uppercase tracking-wider font-bold">
                      Temps de Prière
                    </span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xl sm:text-2xl font-hud font-extrabold text-white">
                    {formatMinutesToHours(report.totalPrayerMinutes)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <span className="text-sky-400 font-semibold">{report.averageDailyPrayer} min</span>
                    <span>/ jour moy.</span>
                  </div>
                </div>

                {/* Bible Chapters */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-amber-500/30 relative overflow-hidden group hover:border-amber-500/60 transition-colors">
                  <div className="flex items-center justify-between text-amber-400 mb-1">
                    <span className="text-[11px] font-hud uppercase tracking-wider font-bold">
                      Parole Méditée
                    </span>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-xl sm:text-2xl font-hud font-extrabold text-white">
                    {report.totalBibleChapters}{' '}
                    <span className="text-sm font-normal text-slate-400">chapitres</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Épée de l'Esprit active</div>
                </div>

                {/* Quests Completed */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 relative overflow-hidden group hover:border-emerald-500/60 transition-colors">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <span className="text-[11px] font-hud uppercase tracking-wider font-bold">
                      Quêtes Scellées
                    </span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-xl sm:text-2xl font-hud font-extrabold text-white">
                    {report.totalQuestsCompleted}{' '}
                    <span className="text-sm font-normal text-slate-400">validées</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Fidélité & constance</div>
                </div>

                {/* XP Gained */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-purple-500/30 relative overflow-hidden group hover:border-purple-500/60 transition-colors">
                  <div className="flex items-center justify-between text-purple-400 mb-1">
                    <span className="text-[11px] font-hud uppercase tracking-wider font-bold">
                      XP Spirituelle
                    </span>
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="text-xl sm:text-2xl font-hud font-extrabold text-white">
                    +{report.totalXpGained}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Croissance de la stature</div>
                </div>
              </div>

              {/* Weekly Grade & Prophetic Evaluation */}
              <div
                className={`p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border ${gradeInfo.glowClass} relative overflow-hidden`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
                  <div>
                    <div className="text-xs font-hud font-bold text-sky-400 uppercase tracking-widest">
                      [ SCEAU DU SYSTÈME • ÉVALUATION HEBDOMADAIRE ]
                    </div>
                    <div className="text-lg sm:text-xl font-hud font-extrabold text-white mt-1">
                      {report.weeklyEvaluationTitle}
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm border tracking-widest ${gradeInfo.badgeClass}`}
                  >
                    {gradeInfo.label}
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed italic">
                  « {report.weeklyCommentary} »
                </p>

                {/* Highlights list */}
                <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {report.keyHighlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-sky-400 shrink-0 font-bold">•</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Progression Chart (Quick View) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-hud font-bold text-white tracking-wide">
                      Progression Quotidienne (Lundi au Dimanche)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Minutes de prière et chapitres lus par jour
                    </p>
                  </div>
                  <span className="text-xs font-hud text-sky-400 font-bold">
                    Semaine {report.weekNumber}
                  </span>
                </div>

                <div className="h-56 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={report.dailyBreakdown}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="prayerGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="bibleGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="dayName"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#38bdf8',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey="prayerMinutes"
                        name="Prière (min)"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#prayerGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="bibleChapters"
                        name="Chapitres Bibliques"
                        stroke="#fbbf24"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#bibleGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sunday Scripture of Sending */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-sky-950/30 border border-amber-500/30 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-hud font-bold text-amber-400 uppercase tracking-wider">
                      Verset du Dimanche pour la Semaine à Venir
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {report.scriptureAnchor.theme}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-serif italic">
                    « {report.scriptureAnchor.verse} »
                  </p>
                  <div className="text-xs font-hud font-bold text-amber-300">
                    — {report.scriptureAnchor.reference}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED BREAKDOWN & 5 PILLARS */}
          {activeTab === 'breakdown' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 5 Pillars of Spiritual Strength */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-sm sm:text-base font-hud font-bold text-white tracking-wide mb-1">
                  Équilibre des 5 Piliers Spirituels
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Activité consolidée dans chaque domaine de la sanctification et du service
                </p>

                <div className="space-y-3.5">
                  {report.categoryBreakdown.map((cat, idx) => {
                    const percent = Math.min(100, Math.round((cat.completed / cat.total) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-hud">
                          <span className="font-bold text-slate-200 flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.label}
                          </span>
                          <span className="text-slate-400 font-semibold">
                            {cat.completed} actions ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bar Chart: Daily Quests and XP */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-hud font-bold text-white tracking-wide">
                      Quêtes & Victoires par Jour
                    </h3>
                    <p className="text-xs text-slate-400">
                      Nombre de quêtes scellées chaque jour de la semaine
                    </p>
                  </div>
                </div>

                <div className="h-56 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={report.dailyBreakdown}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="dayName" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#10b981',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar
                        dataKey="questsCompletedCount"
                        name="Quêtes Accomplies"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FIREBASE CLOUD HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-sky-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Cloud className="w-5 h-5 text-sky-400" />
                  <div>
                    <div className="text-xs font-hud font-bold text-white">
                      Stockage Cloud Firebase Firestore
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {firebaseUser
                        ? `Connecté en tant que ${firebaseUser.email}`
                        : 'Mode invité local • Connectez-vous pour synchroniser vos bilans'}
                    </div>
                  </div>
                </div>

                {firebaseUser && (
                  <button
                    type="button"
                    onClick={handleSaveToCloud}
                    disabled={isSavingCloud}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-hud font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isSavingCloud ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : cloudSynced ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5" />
                    )}
                    <span>{cloudSynced ? 'Synchronisé' : 'Sauvegarder'}</span>
                  </button>
                )}
              </div>

              {loadingHistory ? (
                <div className="p-8 text-center text-slate-400 text-xs font-hud flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                  Chargement des archives depuis Firebase...
                </div>
              ) : historyReports.length > 0 ? (
                <div className="space-y-3">
                  {historyReports.map((hist, idx) => {
                    const badge = getGradeBadge(hist.weeklyGrade);
                    return (
                      <div
                        key={hist.id || idx}
                        className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/40 transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-hud font-bold text-white">
                              Semaine {hist.weekNumber} ({hist.year})
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${badge.badgeClass}`}>
                              {hist.weeklyGrade}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {hist.weeklyEvaluationTitle}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-3">
                            <span>⏱️ {formatMinutesToHours(hist.totalPrayerMinutes)}</span>
                            <span>📖 {hist.totalBibleChapters} chap.</span>
                            <span>⚔️ {hist.totalQuestsCompleted} quêtes</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setReport(hist);
                            setActiveTab('overview');
                            playSystemSound('click');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white text-xs font-hud font-bold transition-colors cursor-pointer"
                        >
                          Consulter
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs font-hud border border-dashed border-slate-800 rounded-xl space-y-2">
                  <p>Aucun rapport archivé pour le moment.</p>
                  <p className="text-[11px] text-slate-500">
                    Ce premier rapport sera sauvegardé sous votre profil Firestore le dimanche !
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {cloudSynced ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-hud">
                <Check className="w-3.5 h-3.5" />
                Sauvegardé dans Firebase Cloud
              </span>
            ) : firebaseUser ? (
              <span className="text-slate-400 font-hud">Prêt à être scellé dans le Cloud</span>
            ) : (
              <span className="text-amber-400 font-hud">Sauvegardé localement</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              id="weekly-report-share-btn"
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-hud font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Résumé Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  <span>Partager le Bilan</span>
                </>
              )}
            </button>

            {firebaseUser && (
              <button
                type="button"
                id="weekly-report-cloud-save-btn"
                onClick={handleSaveToCloud}
                disabled={isSavingCloud}
                className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-slate-950 text-xs font-hud font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto shadow-[0_0_10px_rgba(56,189,248,0.3)]"
              >
                {isSavingCloud ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5" />
                )}
                <span>Synchroniser Firebase</span>
              </button>
            )}

            <button
              type="button"
              id="weekly-report-finish-btn"
              onClick={() => {
                playSystemSound('click');
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-hud font-bold transition-colors cursor-pointer w-full sm:w-auto"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
