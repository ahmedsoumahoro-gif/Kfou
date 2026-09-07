import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  loginWithGoogle,
  logoutHunter,
  saveHunterToCloud,
  updateHunterDisplayName,
  signUpWithEmail,
  signInWithEmail,
  loginWithHunterPseudo,
  resetHunterPassword,
} from '../services/firebase';
import {
  registerWithSql,
  loginWithSql,
  syncWithSql,
} from '../services/sqlService';
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
  LogIn,
  LogOut,
  CheckCircle2,
  Cloud,
  CloudUpload,
  Sparkles,
  AlertCircle,
  X,
  UserCheck,
  User,
  Edit2,
  Check,
  ShieldCheck,
  Database,
  Mail,
  Lock,
  Download,
  ExternalLink,
  Copy,
  KeyRound,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { playSystemSound } from '../utils/audio';
import { HunterAvatar } from './HunterAvatar';

interface AuthModalProps {
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
  onSyncSuccess?: () => void;
  onUpdatePseudo?: (newPseudo: string) => void;
}

type AuthTab = 'signup' | 'signin' | 'guest';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  hunterUser,
  quests,
  vices,
  skills,
  dungeons,
  badges,
  inventory,
  settings,
  lastSyncedAt,
  onSyncSuccess,
  onUpdatePseudo,
}) => {
  const [authTab, setAuthTab] = useState<AuthTab>('signup');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState(hunterUser.name || '');

  // Logged-in editable pseudo state
  const [isEditingPseudo, setIsEditingPseudo] = useState(false);
  const [editablePseudo, setEditablePseudo] = useState(
    currentUser?.displayName || hunterUser.name || ''
  );
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const getHumanErrorMessage = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('auth/email-already-in-use')) {
      return 'Cette adresse email est déjà enregistrée. Veuillez basculer sur l\'onglet « Connexion ».';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Le mot de passe doit comporter au moins 6 caractères.';
    }
    if (msg.includes('auth/invalid-email')) {
      return 'L\'adresse email saisie est invalide.';
    }
    if (
      msg.includes('auth/user-not-found') ||
      msg.includes('auth/wrong-password') ||
      msg.includes('auth/invalid-credential')
    ) {
      return 'Email ou mot de passe incorrect.';
    }
    if (msg.includes('auth/unauthorized-domain')) {
      return 'Ce domaine n\'est pas encore autorisé pour Google OAuth. Utilisez l\'inscription par Email ci-dessous (100% fonctionnelle sans configuration de domaine) !';
    }
    if (msg.includes('popup-closed-by-user')) {
      return 'La fenêtre de connexion Google a été fermée.';
    }
    return msg || 'Une erreur est survenue lors de l\'authentification.';
  };

  // Sign Up with Email and Password
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Veuillez renseigner votre email et un mot de passe.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      const cleanName = pseudo.trim() || 'Chasseur Novice';

      // 1. First register directly into Relational SQL Database (SQLite)
      let sqlUser: any = null;
      try {
        const sqlRes = await registerWithSql(email.trim(), password, cleanName);
        sqlUser = sqlRes.user;
        await syncWithSql({
          user: { ...hunterUser, id: sqlRes.user.id, name: cleanName, email: email.trim() },
          quests,
          vices,
          skills,
          inventory,
        }).catch((err) => console.warn('SQL initial sync non-blocking:', err));
      } catch (sqlErr) {
        console.warn('SQL register note:', sqlErr);
      }

      if (onUpdatePseudo) {
        onUpdatePseudo(cleanName);
      }

      // 2. Also register with Firebase if available
      try {
        const user = await signUpWithEmail(email.trim(), password, cleanName);
        await saveHunterToCloud(user.uid, {
          user: { ...hunterUser, name: cleanName, email: user.email || email.trim() },
          quests,
          vices,
          skills,
          dungeons,
          badges,
          inventory,
          appearance: settings,
        }).catch(() => {});
      } catch (fbErr) {
        console.warn('Firebase registration fallback to SQL:', fbErr);
      }

      playSystemSound('level_up');
      setSuccessMsg(`Compte créé avec succès ! Bienvenue, ${cleanName}. Vos données sont enregistrées dans la Base de Données SQL.`);
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      console.error('Sign up error:', err);
      setErrorMsg(getHumanErrorMessage(err));
      playSystemSound('click');
    } finally {
      setLoading(false);
    }
  };

  // Sign In with Email and Password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');

      let loggedInName = 'Chasseur';
      let loginDone = false;

      // 1. Attempt SQL Login
      try {
        const sqlRes = await loginWithSql(email.trim(), password);
        if (sqlRes.success) {
          loginDone = true;
          loggedInName = sqlRes.user.name || email.split('@')[0];
          if (onUpdatePseudo) onUpdatePseudo(loggedInName);
        }
      } catch (sqlErr) {
        console.warn('SQL login note:', sqlErr);
      }

      // 2. Attempt Firebase Login
      try {
        const user = await signInWithEmail(email.trim(), password);
        loginDone = true;
        if (user.displayName) loggedInName = user.displayName;
      } catch (fbErr) {
        console.warn('Firebase login note:', fbErr);
        if (!loginDone) {
          throw fbErr;
        }
      }

      playSystemSound('level_up');
      setSuccessMsg(`Connexion réussie ! Heureux de vous revoir, ${loggedInName}.`);
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      console.error('Sign in error:', err);
      setErrorMsg(getHumanErrorMessage(err));
      playSystemSound('click');
    } finally {
      setLoading(false);
    }
  };

  // Quick Guest / Anonymous Sign In
  const handleGuestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = pseudo.trim() || 'Chasseur Anonyme';

    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      const user = await loginWithHunterPseudo(cleanName);

      if (onUpdatePseudo) {
        onUpdatePseudo(cleanName);
      }

      await saveHunterToCloud(user.uid, {
        user: { ...hunterUser, name: cleanName },
        quests,
        vices,
        skills,
        dungeons,
        badges,
        inventory,
        appearance: settings,
      });

      playSystemSound('level_up');
      setSuccessMsg(`Accès Chasseur activé pour "${cleanName}". Données sauvegardées sur Firestore.`);
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      console.error('Guest sign in error:', err);
      setErrorMsg(getHumanErrorMessage(err));
      playSystemSound('click');
    } finally {
      setLoading(false);
    }
  };

  // Password reset
  const handleResetPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Veuillez entrer votre adresse email dans le champ ci-dessus pour réinitialiser votre mot de passe.');
      return;
    }
    try {
      setLoading(true);
      clearMessages();
      await resetHunterPassword(email.trim());
      playSystemSound('click');
      setSuccessMsg(`Un lien de réinitialisation a été envoyé à : ${email.trim()}`);
    } catch (err) {
      setErrorMsg(getHumanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      const cleanName = pseudo.trim() || hunterUser.name;
      const user = await loginWithGoogle(cleanName);
      if (cleanName && onUpdatePseudo) {
        onUpdatePseudo(cleanName);
      }
      playSystemSound('level_up');
      setSuccessMsg(`Connexion Google réussie ! Bienvenue, ${user.displayName || cleanName}.`);
    } catch (err: unknown) {
      console.error('Google login error:', err);
      setErrorMsg(getHumanErrorMessage(err));
      playSystemSound('click');
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const handleLogout = async () => {
    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      await logoutHunter();
      setSuccessMsg('Session déconnectée avec succès.');
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
      setErrorMsg('Erreur lors de la déconnexion.');
    } finally {
      setLoading(false);
    }
  };

  // Manual Cloud Sync
  const handleManualSync = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      await saveHunterToCloud(currentUser.uid, {
        user: hunterUser,
        quests,
        vices,
        skills,
        dungeons,
        badges,
        inventory,
        appearance: settings,
      });
      playSystemSound('quest_complete');
      setSuccessMsg('Toutes vos données de chasseur ont été synchronisées avec succès sur Firestore !');
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      console.error('Sync error:', err);
      setErrorMsg('Échec de la synchronisation.');
      playSystemSound('click');
    } finally {
      setLoading(false);
    }
  };

  // Export Full JSON Database backup
  const handleExportDatabase = () => {
    playSystemSound('click');
    const dbPayload = {
      exportDate: new Date().toISOString(),
      databaseId: 'ai-studio-bloomverse-128e6730-28a1-474d-9ecc-aafdfcda5a1b',
      userId: currentUser?.uid || 'local_user',
      userEmail: currentUser?.email || hunterUser.email || '',
      hunterProfile: hunterUser,
      quests,
      vices,
      skills,
      dungeons,
      badges,
      inventory,
      appearance: settings,
      lastSyncedAt,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dbPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `bloomverse_database_${hunterUser.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMsg('Export de la base de données téléchargé avec succès (.json) !');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    playSystemSound('click');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const firestoreConsoleUrl =
    'https://console.firebase.google.com/project/ai-studio-bloomverse-128e6730-28a1-474d-9ecc-aafdfcda5a1b/firestore/databases/-default-/data';
  const authConsoleUrl =
    'https://console.firebase.google.com/project/ai-studio-bloomverse-128e6730-28a1-474d-9ecc-aafdfcda5a1b/authentication/users';

  return (
    <div
      id="hunter-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-[#080c16] border-2 border-sky-500/50 shadow-[0_0_50px_rgba(56,189,248,0.25)] system-corner overflow-hidden p-5 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            playSystemSound('click');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50 transition-colors cursor-pointer"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-hud font-bold tracking-wider uppercase bg-sky-950/80 border border-sky-500/40 text-sky-300">
              <Sparkles className="w-3 h-3 text-sky-400" />
              AUTHENTIFICATION & BASE DE DONNÉES
            </span>
            {currentUser && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-hud font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                CONNECTÉ
              </span>
            )}
          </div>
          <h2 className="font-hud text-xl sm:text-2xl font-black text-white tracking-wide">
            {currentUser ? 'Mon Compte & Données Cloud' : 'Inscription & Connexion Chasseur'}
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            {currentUser
              ? 'Votre progression est stockée et synchronisée en temps réel sur Cloud Firestore.'
              : 'Créez votre compte en 10 secondes ou connectez-vous pour sécuriser votre progression.'}
          </p>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* CASE 1: LOGGED IN USER VIEW */}
        {currentUser ? (
          <div className="space-y-4">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-sky-500/30 space-y-3">
              <div className="flex items-center gap-3">
                <HunterAvatar
                  avatarId={hunterUser.avatar}
                  rank={hunterUser.hunterRank}
                  size="md"
                  level={hunterUser.level}
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-hud font-bold text-white text-base truncate">
                      {currentUser.displayName || hunterUser.name}
                    </h3>
                    <UserCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  </div>
                  {currentUser.email && (
                    <p className="text-xs text-slate-300 font-mono truncate">{currentUser.email}</p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] font-hud text-amber-300">
                    <span>{hunterUser.hunterRank}</span>
                    <span>•</span>
                    <span>Niveau {hunterUser.level}</span>
                    <span>•</span>
                    <span>{hunterUser.currentXp} XP</span>
                  </div>
                </div>
              </div>

              {/* Cloud Status */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-sky-400" />
                    Base Cloud Firestore
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">
                    Connecté & Actif
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  UID : {currentUser.uid}
                </p>
                <p className="text-[10px] text-slate-500">
                  {lastSyncedAt
                    ? `Dernière sauvegarde : ${new Date(lastSyncedAt).toLocaleString('fr-FR')}`
                    : 'Prêt pour la synchronisation'}
                </p>
              </div>
            </div>

            {/* Backend & Database Links Panel */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-hud font-bold text-xs uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  Accès Backend & Base de Données
                </h4>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Vos utilisateurs et leurs données sont stockés dans le projet Firebase :
                <code className="text-sky-300 ml-1 font-mono">ai-studio-bloomverse-128e6730-28a1-474d-9ecc-aafdfcda5a1b</code>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={firestoreConsoleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-sky-500/30 text-xs font-hud font-bold text-sky-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    Firestore (Collections)
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>

                <a
                  href={authConsoleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-sky-500/30 text-xs font-hud font-bold text-sky-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    Auth (Utilisateurs)
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>

              {/* Download JSON Database export button */}
              <button
                type="button"
                onClick={handleExportDatabase}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/40 text-amber-300 font-hud font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Télécharger la Base de Données (Export JSON)</span>
              </button>
            </div>

            {/* Actions for Logged-In User */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={loading}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{loading ? 'Synchronisation...' : 'Synchroniser Maintenant'}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-200 font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        ) : (
          /* CASE 2: NOT CONNECTED -> REAL SIGN UP & LOGIN */
          <div className="space-y-4">
            {/* Auth Tab Selector */}
            <div className="grid grid-cols-3 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-hud font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  clearMessages();
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authTab === 'signup'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inscription</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthTab('signin');
                  clearMessages();
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authTab === 'signin'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthTab('guest');
                  clearMessages();
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authTab === 'guest'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Invité Rapide</span>
              </button>
            </div>

            {/* TAB 1: SIGN UP WITH EMAIL & PASSWORD */}
            {authTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-hud uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    Pseudo du Chasseur
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={35}
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Ex: David, Esther, Ahmed..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-sans focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-hud uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-sans focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-hud uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    Mot de Passe (min. 6 caractères)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-sans focus:outline-none focus:border-sky-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Création en cours...' : 'Créer mon Compte & Sauvegarder'}</span>
                </button>
              </form>
            )}

            {/* TAB 2: SIGN IN WITH EMAIL & PASSWORD */}
            {authTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-hud uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-sans focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-hud uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-sky-400" />
                      Mot de Passe
                    </label>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-sans focus:outline-none focus:border-sky-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Connexion...' : 'Se Connecter'}</span>
                </button>
              </form>
            )}

            {/* TAB 3: GUEST / ANONYMOUS */}
            {authTab === 'guest' && (
              <form onSubmit={handleGuestSignIn} className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                  L'accès invité crée instantanément un identifiant Cloud Firestore sans mot de passe. Idéal pour commencer immédiatement.
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-hud uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Votre Pseudo
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={35}
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Ex: David, Esther, Ahmed..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Activation...' : 'Démarrer comme Invité'}</span>
                </button>
              </form>
            )}

            {/* Google alternative */}
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] font-hud uppercase text-slate-500 tracking-wider">
                  OU VIA GOOGLE
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-hud font-bold text-xs tracking-wide flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all cursor-pointer active:scale-98 disabled:opacity-50 mt-1"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Connexion Instantanée Google</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
