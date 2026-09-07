import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  HunterUser,
  Quest,
  Vice,
  Skill,
  DungeonBreak,
  Badge,
  InventoryItem,
  AppearanceSettings,
} from '../types';
import {
  Database,
  Download,
  Copy,
  Check,
  X,
  Server,
  Terminal,
  Play,
  RefreshCw,
  Users,
  HardDrive,
  Sparkles,
  AlertTriangle,
  Table as TableIcon,
  ShieldAlert,
} from 'lucide-react';
import { playSystemSound } from '../utils/audio';
import {
  fetchSqlStatus,
  fetchSqlUsers,
  executeRawSql,
  syncWithSql,
  SqlDatabaseStatus,
  SqlUserRecord,
  SqlQueryResult,
} from '../services/sqlService';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  hunterUser: HunterUser;
  quests: Quest[];
  vices: Vice[];
  skills: Skill[];
  dungeons: DungeonBreak[];
  badges: Badge[];
  inventory: InventoryItem[];
  settings: AppearanceSettings;
  lastSyncedAt?: string;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  hunterUser,
  quests,
  vices,
  skills,
  inventory,
  settings,
  dungeons,
  badges,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'query' | 'tables' | 'export'>('users');
  const [status, setStatus] = useState<SqlDatabaseStatus | null>(null);
  const [usersList, setUsersList] = useState<SqlUserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // SQL Query console state
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users ORDER BY level DESC;');
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [runningQuery, setRunningQuery] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // Auto-sync current user into SQL on opening
      await syncWithSql({
        user: hunterUser,
        quests,
        vices,
        skills,
        inventory,
      }).catch(() => {});

      const [statusRes, usersRes] = await Promise.all([
        fetchSqlStatus().catch(() => null),
        fetchSqlUsers().catch(() => ({ users: [], count: 0 })),
      ]);

      if (statusRes) setStatus(statusRes);
      if (usersRes) setUsersList(usersRes.users);
    } catch (err) {
      console.error('Failed to load SQL database info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await syncWithSql({
        user: hunterUser,
        quests,
        vices,
        skills,
        inventory,
      });
      setSyncSuccess(true);
      playSystemSound('level_up');
      loadData();
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleRunQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    setRunningQuery(true);
    playSystemSound('click');
    try {
      const res = await executeRawSql(q);
      setQueryResult(res);
    } catch (err: any) {
      setQueryResult({
        success: false,
        error: err.message || 'Erreur d\'exécution de la requête SQL.',
      });
    } finally {
      setRunningQuery(false);
    }
  };

  const handleDownloadJson = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      engine: 'BloomVerse Relational SQL Backend',
      currentUser: hunterUser,
      quests,
      vices,
      skills,
      inventory,
      dungeons,
      badges,
      settings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloomverse_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playSystemSound('level_up');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0b0f19] border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden text-slate-100">
        {/* Header HUD */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-hud font-black tracking-wider text-white">
                  BASE DE DONNÉES SQL RELATIONNELLE
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono uppercase font-bold">
                  SQLite 3 ACTIF
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Backend Node.js / SQLite • Données réelles, requêtes SQL directes et export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Firebase Console Explanation Banner */}
        <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-amber-300">Explication sur le message Firebase : </span>
            Le message <span className="italic text-slate-200">« Le projet n'existe pas ou vous n'avez pas l'autorisation »</span> est normal : les projets générés par le cloud AI Studio appartiennent à l'organisation Google Cloud d'exécution, votre compte Gmail personnel/universitaire n'y a pas les droits IAM.
            C'est pourquoi toute votre application utilise désormais cette <strong>véritable base de données SQL relationnelle</strong> accessible directement ici !
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => {
              playSystemSound('click');
              setActiveTab('users');
            }}
            className={`px-3 py-2 text-xs font-hud font-bold tracking-wider rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-amber-500/20 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>UTILISATEURS SQL ({usersList.length})</span>
          </button>

          <button
            onClick={() => {
              playSystemSound('click');
              setActiveTab('query');
            }}
            className={`px-3 py-2 text-xs font-hud font-bold tracking-wider rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'query'
                ? 'bg-amber-500/20 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>CONSOLE SQL</span>
          </button>

          <button
            onClick={() => {
              playSystemSound('click');
              setActiveTab('tables');
            }}
            className={`px-3 py-2 text-xs font-hud font-bold tracking-wider rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'tables'
                ? 'bg-amber-500/20 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>TABLES RELATIONNELLES</span>
          </button>

          <button
            onClick={() => {
              playSystemSound('click');
              setActiveTab('export');
            }}
            className={`px-3 py-2 text-xs font-hud font-bold tracking-wider rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'export'
                ? 'bg-amber-500/20 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>TÉLÉCHARGEMENT & BACKEND</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-hud font-bold text-white uppercase tracking-wider">
                    Table SQL <code className="text-amber-400">users</code>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comptes et progression spirituelle stockés dans le serveur SQL
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualSync}
                    disabled={syncing}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-hud font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncSuccess ? 'Données Synchronisées !' : 'Synchroniser Mon Compte'}</span>
                  </button>

                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
                    title="Rafraîchir"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {usersList.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800">
                  <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Aucun utilisateur enregistré pour le moment.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Cliquez sur « Synchroniser Mon Compte » pour insérer votre profil dans la table SQL.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] border-b border-slate-800 uppercase tracking-wider">
                      <tr>
                        <th className="p-3">ID / Pseudo</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Niveau & XP</th>
                        <th className="p-3">Rang Spirituel</th>
                        <th className="p-3">Prière (Auj.)</th>
                        <th className="p-3">Série Sanctification</th>
                        <th className="p-3">Dernière MàJ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3">
                            <span className="font-hud font-bold text-white">{u.name}</span>
                            <span className="block text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                              {u.id}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-amber-300/90">{u.email}</td>
                          <td className="p-3">
                            <span className="font-bold text-sky-400">Lvl {u.level}</span>
                            <span className="block text-[10px] text-slate-400">
                              {u.current_xp} / {u.total_xp} XP
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-500/30 text-sky-300 text-[10px] font-bold">
                              {u.hunter_rank}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-emerald-400">{u.prayer_minutes_today} min</td>
                          <td className="p-3 font-mono text-purple-400">{u.general_vice_streak} j</td>
                          <td className="p-3 text-slate-500 text-[10px] font-mono">
                            {new Date(u.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUERY CONSOLE */}
          {activeTab === 'query' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-hud font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Exécuteur de Requêtes SQL</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Exécutez n'importe quelle requête SQL réelle directement sur votre base SQLite.
                </p>
              </div>

              {/* Preset Queries */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] text-slate-400 py-1">Exemples :</span>
                {[
                  'SELECT * FROM users;',
                  'SELECT id, name, level, total_xp, prayer_minutes_today FROM users;',
                  'SELECT * FROM quests WHERE completed_today = 1;',
                  'SELECT * FROM vices;',
                  'SELECT * FROM inventory;',
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setSqlQuery(preset);
                      handleRunQuery(preset);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300/80 hover:text-amber-300 font-mono text-[11px] border border-slate-700 transition-all cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* SQL Textarea */}
              <div className="relative">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-black/60 border border-slate-700 focus:border-amber-400 font-mono text-xs text-emerald-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50 resize-none"
                  placeholder="SELECT * FROM users..."
                />

                <button
                  onClick={() => handleRunQuery()}
                  disabled={runningQuery}
                  className="absolute right-3 bottom-3 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-hud font-bold text-xs hover:bg-amber-400 flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Play className={`w-3.5 h-3.5 ${runningQuery ? 'animate-spin' : ''}`} />
                  <span>{runningQuery ? 'Exécution...' : 'Exécuter SQL'}</span>
                </button>
              </div>

              {/* Results Table */}
              {queryResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      Résultat ({queryResult.count ?? 0} ligne(s)) :
                    </span>
                    {queryResult.success ? (
                      <span className="text-emerald-400 font-mono text-[11px]">Succès</span>
                    ) : (
                      <span className="text-rose-400 font-mono text-[11px]">Erreur SQL</span>
                    )}
                  </div>

                  {queryResult.error ? (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
                      {queryResult.error}
                    </div>
                  ) : queryResult.rows && queryResult.rows.length > 0 ? (
                    <div className="overflow-x-auto max-h-60 rounded-xl border border-slate-800 bg-black/40">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900 text-slate-400 text-[10px] border-b border-slate-800 uppercase sticky top-0">
                          <tr>
                            {queryResult.columns?.map((c) => (
                              <th key={c} className="p-2 border-r border-slate-800/40">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {queryResult.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30">
                              {queryResult.columns?.map((c) => (
                                <td key={c} className="p-2 border-r border-slate-800/20 text-slate-200">
                                  {row[c] !== null && row[c] !== undefined ? String(row[c]) : 'NULL'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl">
                      Aucune ligne retournée par la requête.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RELATIONAL TABLES */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-hud font-bold text-white uppercase tracking-wider">
                  Schéma Relationnel SQLite
                </h3>
                <p className="text-xs text-slate-400">
                  Tables SQL structurées et synchronisées en temps réel sur le disque
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    name: 'users',
                    desc: 'Profils, niveau, XP, stats de prière quotidienne, séries de sanctification',
                    count: status?.tableCounts['users'] ?? usersList.length,
                    cols: 'id, email, password, name, level, current_xp, prayer_minutes_today...',
                  },
                  {
                    name: 'quests',
                    desc: 'Quêtes quotidiennes, XP rewards, état d\'accomplissement',
                    count: status?.tableCounts['quests'] ?? quests.length,
                    cols: 'id, user_id, title, category, xp_reward, completed_today...',
                  },
                  {
                    name: 'vices',
                    desc: 'Armée des ombres, PV boss, versets bibliques de combat, séries',
                    count: status?.tableCounts['vices'] ?? vices.length,
                    cols: 'id, user_id, name, slug, current_hp, max_hp, streak, extracted...',
                  },
                  {
                    name: 'skills',
                    desc: 'Arbre de compétences spirituelles (Prière, Étude, Service, Pureté)',
                    count: status?.tableCounts['skills'] ?? skills.length,
                    cols: 'id, user_id, code, branch, name, tier, xp_required, unlocked...',
                  },
                  {
                    name: 'inventory',
                    desc: 'Épée de l\'Esprit, versets bibliques mémorisés, niveau de puissance',
                    count: status?.tableCounts['inventory'] ?? inventory.length,
                    cols: 'id, user_id, name, type, verse_ref, power_level, recitations_count...',
                  },
                  {
                    name: 'weekly_reports',
                    desc: 'Bilans spirituels hebdomadaires du dimanche et synthèses',
                    count: status?.tableCounts['weekly_reports'] ?? 0,
                    cols: 'id, user_id, week_number, year, total_prayer_minutes, report_summary...',
                  },
                ].map((t) => (
                  <div key={t.name} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-amber-400" />
                        <span className="font-hud font-bold text-amber-300 text-sm">{t.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs">
                        {t.count} ligne(s)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{t.desc}</p>
                    <div className="p-2 rounded bg-black/40 font-mono text-[10px] text-slate-400 truncate">
                      {t.cols}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT & BACKEND INFO */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-hud font-bold text-white uppercase tracking-wider">
                  Téléchargement & Informations du Backend
                </h3>
                <p className="text-xs text-slate-400">
                  Téléchargez la base de données SQL sous différents formats pour vos sauvegardes ou migrations
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Download .SQL */}
                <a
                  href="/api/sql/export/sql"
                  download="bloomverse_database.sql"
                  className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/20 transition-all flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform mb-2">
                    <Download className="w-6 h-6" />
                  </div>
                  <span className="font-hud font-bold text-sm text-white">Script SQL (.sql)</span>
                  <span className="text-xs text-slate-400 mt-1">
                    Script standard avec <code className="text-amber-300">CREATE TABLE</code> et <code className="text-amber-300">INSERT INTO</code>
                  </span>
                </a>

                {/* Download .SQLITE */}
                <a
                  href="/api/sql/export/sqlite"
                  download="bloomverse.sqlite"
                  className="p-4 rounded-xl bg-slate-900/80 border border-sky-500/30 hover:border-sky-400 hover:bg-sky-950/20 transition-all flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform mb-2">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <span className="font-hud font-bold text-sm text-white">Fichier SQLite (.sqlite)</span>
                  <span className="text-xs text-slate-400 mt-1">
                    Base de données binaire ouvrable avec <em>DB Browser for SQLite</em>
                  </span>
                </a>

                {/* Download JSON */}
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-950/20 transition-all flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform mb-2">
                    <Download className="w-6 h-6" />
                  </div>
                  <span className="font-hud font-bold text-sm text-white">Export Complet JSON</span>
                  <span className="text-xs text-slate-400 mt-1">
                    Sauvegarde structurée JSON avec toutes vos données en cours
                  </span>
                </button>
              </div>

              {/* Backend Endpoint Details */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                <span className="font-hud font-bold text-xs text-slate-300 uppercase tracking-wider block">
                  Endpoints de l'API Backend SQL
                </span>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px]">POST</span>
                    <span>/api/sql/auth/register</span>
                    <span className="text-slate-500 text-[10px]">— Inscription SQL</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px]">POST</span>
                    <span>/api/sql/auth/login</span>
                    <span className="text-slate-500 text-[10px]">— Connexion SQL</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 text-[10px]">GET</span>
                    <span>/api/sql/users</span>
                    <span className="text-slate-500 text-[10px]">— Liste des utilisateurs</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px]">POST</span>
                    <span>/api/sql/sync</span>
                    <span className="text-slate-500 text-[10px]">— Synchronisation complète</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>Fichier DB : <code className="text-slate-300">data/bloomverse.sqlite</code></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-hud font-bold text-xs transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
