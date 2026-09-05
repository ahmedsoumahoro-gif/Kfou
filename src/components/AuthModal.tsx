import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  loginWithGoogle,
  logoutHunter,
  saveHunterToCloud,
  signUpWithEmail,
  signInWithEmail,
  updateHunterDisplayName,
  resetHunterPassword,
} from '../services/firebase';
import { HunterUser, Quest, Vice, Skill, DungeonBreak, Badge, InventoryItem, AppearanceSettings } from '../types';
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
  UserPlus,
  Key,
  Mail,
  User,
  Edit2,
  Check,
  KeyRound,
  ShieldCheck,
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

type AuthTab = 'login' | 'register' | 'quick-pseudo';

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
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
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

  if (!isOpen) return null;

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // 1. Email + Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Veuillez renseigner votre email et mot de passe.');
      return;
    }
    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      const user = await signInWithEmail(email.trim(), password);
      playSystemSound('quest_complete');
      setSuccessMsg(`Ravi de vous revoir, Chasseur ${user.displayName || hunterUser.name} !`);
      if (user.displayName && onUpdatePseudo) {
        onUpdatePseudo(user.displayName);
      }
    } catch (err: unknown) {
      console.error('Email sign in error:', err);
      const errString = err instanceof Error ? err.message : String(err);
      if (errString.includes('user-not-found') || errString.includes('wrong-password') || errString.includes('invalid-credential')) {
        setErrorMsg('Email ou mot de passe incorrect.');
      } else if (errString.includes('invalid-email')) {
        setErrorMsg('Adresse email invalide.');
      } else {
        setErrorMsg('Erreur lors de la connexion. Veuillez vérifier vos identifiants.');
      }
      playSystemSound('click');
    } finally {
      setLoading(false);
    }
  };

  // 2. Register New Hunter Account with Pseudo, Email, Password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo.trim()) {
      setErrorMsg('Veuillez choisir un pseudo de chasseur.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMsg('Veuillez renseigner un email et un mot de passe.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      const user = await signUpWithEmail(email.trim(), password, pseudo.trim());
      if (onUpdatePseudo) {
        onUpdatePseudo(pseudo.trim());
      }
      // Save initial progression to cloud immediately
      await saveHunterToCloud(user.uid, {
        user: { ...hunterUser, name: pseudo.trim(), email: email.trim() },
        quests,
        vices,
        skills,
        dungeons,
        badges,
        inventory,
        appearance: settings,
      });
      playSystemSound('level_up');
      setSuccessMsg(`Bienvenue dans BloomVerse, ${pseudo.trim()} ! Votre compte a été créé avec succès.`);
    } catch (err: unknown) {
      console.error('Register error:', err);
      const errString = err instanceof Error ? err.message : String(err);
      if (errString.includes('email-already-in-use')) {
        setErrorMsg('Cet email est déjà associé à un compte existant. Essayez de vous connecter.');
      } else if (errString.includes('weak-password')) {
        setErrorMsg('Le mot de passe est trop faible. Utilisez au moins 6 caractères.');
      } else {
        setErrorMsg("Erreur lors de la création du compte. Veuillez réessayer.");
      }
      playSystemSound('click');
    } finally {
      setLoading(false);
    }
  };

  // 3. Quick Pseudo Change (Local / Instant)
  const handleSaveQuickPseudo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo.trim()) {
      setErrorMsg('Veuillez saisir un pseudo valide.');
      return;
    }
    if (onUpdatePseudo) {
      onUpdatePseudo(pseudo.trim());
    }
    playSystemSound('quest_complete');
    setSuccessMsg(`Votre pseudo a été défini sur « ${pseudo.trim()} » !`);
  };

  // 4. Update Hunter Pseudo when logged in
  const handleSaveLoggedInPseudo = async () => {
    if (!editablePseudo.trim()) return;
    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      await updateHunterDisplayName(editablePseudo.trim());
      if (onUpdatePseudo) {
        onUpdatePseudo(editablePseudo.trim());
      }
      if (currentUser) {
        await saveHunterToCloud(currentUser.uid, {
          user: { ...hunterUser, name: editablePseudo.trim() },
          quests,
          vices,
          skills,
          dungeons,
          badges,
          inventory,
          appearance: settings,
        });
      }
      setIsEditingPseudo(false);
      playSystemSound('quest_complete');
      setSuccessMsg(`Pseudo mis à jour : « ${editablePseudo.trim()} »`);
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      console.error('Update pseudo error:', err);
      setErrorMsg('Impossible de mettre à jour le pseudo.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Password Reset
  const handleResetPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Entrez votre email ci-dessus pour recevoir un lien de réinitialisation.');
      return;
    }
    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      await resetHunterPassword(email.trim());
      setSuccessMsg(`Un lien de réinitialisation a été envoyé à ${email.trim()}.`);
    } catch (err) {
      console.error('Reset password error:', err);
      setErrorMsg("Impossible d'envoyer l'email de réinitialisation. Vérifiez l'adresse saisie.");
    } finally {
      setLoading(false);
    }
  };

  // 6. Google Sign In
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      const user = await loginWithGoogle();
      if (user.displayName && onUpdatePseudo) {
        onUpdatePseudo(user.displayName);
      }
      playSystemSound('level_up');
      setSuccessMsg(`Connexion Google réussie ! Bienvenue, ${user.displayName || hunterUser.name}.`);
    } catch (err: unknown) {
      console.error('Google login error:', err);
      const errString = err instanceof Error ? err.message : String(err);
      if (errString.includes('popup-closed-by-user')) {
        setErrorMsg('La fenêtre Google a été fermée.');
      } else {
        setErrorMsg('Erreur de connexion Google. Veuillez réessayer.');
      }
      playSystemSound('click');
    } finally {
      setLoading(false);
    }
  };

  // 7. Sign Out
  const handleLogout = async () => {
    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      await logoutHunter();
      setSuccessMsg('Session déconnectée avec succès.');
    } catch (err) {
      console.error('Logout error:', err);
      setErrorMsg('Erreur lors de la déconnexion.');
    } finally {
      setLoading(false);
    }
  };

  // 8. Manual Sync
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
      setSuccessMsg('Toutes vos données de chasseur ont été synchronisées avec succès !');
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      console.error('Sync error:', err);
      setErrorMsg('Échec de la synchronisation.');
      playSystemSound('click');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="hunter-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#080c16] border-2 border-sky-500/50 shadow-[0_0_50px_rgba(56,189,248,0.25)] system-corner overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-hud font-bold tracking-wider uppercase bg-sky-950/80 border border-sky-500/40 text-sky-300">
              <Sparkles className="w-3 h-3 text-sky-400" />
              SYSTÈME DE CONNEXION HUNTER
            </span>
            {currentUser && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-hud font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                CONNECTÉ
              </span>
            )}
          </div>
          <h2 className="font-hud text-2xl font-black text-white tracking-wide">
            Espace de Connexion
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Connectez-vous avec votre pseudo et mot de passe, ou liez votre compte pour synchroniser votre progression spirituelle.
          </p>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* CASE 1: HUNTER IS CONNECTED */}
        {currentUser ? (
          <div className="space-y-5">
            {/* Identity Card with Editable Pseudo */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-sky-950/40 border border-sky-500/30 space-y-4">
              <div className="flex items-start gap-3.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || hunterUser.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)] shrink-0"
                  />
                ) : (
                  <HunterAvatar avatar={hunterUser.avatar} name={hunterUser.name} size="md" />
                )}

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-hud uppercase tracking-wider text-sky-400">
                      PSEUDO DU CHASSEUR
                    </span>
                    {!isEditingPseudo && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditablePseudo(currentUser.displayName || hunterUser.name);
                          setIsEditingPseudo(true);
                        }}
                        className="text-[11px] font-hud text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                        title="Modifier votre pseudo"
                      >
                        <Edit2 className="w-3 h-3" /> Modifier
                      </button>
                    )}
                  </div>

                  {isEditingPseudo ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={editablePseudo}
                        onChange={(e) => setEditablePseudo(e.target.value)}
                        placeholder="Nouveau pseudo"
                        maxLength={30}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-sky-500/50 text-white font-hud text-sm focus:outline-none focus:border-sky-400"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveLoggedInPseudo}
                        disabled={loading || !editablePseudo.trim()}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-hud font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Valider
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingPseudo(false)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-hud font-bold text-white text-lg truncate">
                        {currentUser.displayName || hunterUser.name}
                      </h3>
                      <UserCheck className="w-4 h-4 text-sky-400 shrink-0" />
                    </div>
                  )}

                  <p className="text-xs text-slate-300 font-mono truncate">{currentUser.email}</p>
                  <div className="flex items-center gap-2 text-[11px] font-hud text-amber-300">
                    <span>{hunterUser.hunterRank}</span>
                    <span>•</span>
                    <span>Niveau {hunterUser.level}</span>
                    <span>•</span>
                    <span className="text-sky-300">{hunterUser.totalXp} XP</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="pt-3 border-t border-sky-900/30 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-hud text-[11px] font-bold tracking-wider">
                    CLOUD FIRESTORE ACTIF
                  </span>
                </div>

                <span className="text-[11px] text-slate-400">
                  {lastSyncedAt
                    ? `Synchro: ${new Date(lastSyncedAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : 'Prêt à sauvegarder'}
                </span>
              </div>
            </div>

            {/* Actions for Authenticated Hunter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                id="hunter-manual-sync-btn"
                onClick={handleManualSync}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                <CloudUpload className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Sauvegarde...' : 'Sauvegarder mon Profil'}</span>
              </button>

              <button
                type="button"
                id="hunter-logout-btn"
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-red-300 font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        ) : (
          /* CASE 2: HUNTER IS NOT CONNECTED - TABS FOR LOGIN, REGISTER, OR QUICK PSEUDO */
          <div className="space-y-4">
            {/* Tab Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-hud font-bold">
              <button
                type="button"
                onClick={() => {
                  playSystemSound('click');
                  setActiveTab('login');
                  clearMessages();
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'login'
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
                  playSystemSound('click');
                  setActiveTab('register');
                  clearMessages();
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Créer Compte</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSystemSound('click');
                  setActiveTab('quick-pseudo');
                  clearMessages();
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'quick-pseudo'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Pseudo Rapide</span>
              </button>
            </div>

            {/* TAB 1: CONNEXION (EMAIL + PASSWORD) */}
            {activeTab === 'login' && (
              <form onSubmit={handleEmailSignIn} className="space-y-3.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-hud uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@domaine.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-sans focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-hud uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-sky-400" />
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-[10px] text-sky-400 hover:text-sky-300 font-hud cursor-pointer"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-sans focus:outline-none focus:border-sky-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Connexion en cours...' : 'Se Connecter'}</span>
                </button>
              </form>
            )}

            {/* TAB 2: CRÉER UN COMPTE (PSEUDO + EMAIL + PASSWORD) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-hud uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Pseudo du Chasseur (Obligatoire)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Ex: David_Vaillant, ChasseurDeLumiere..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-white text-sm font-hud tracking-wide focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-500 font-sans block">
                    Ce pseudo apparaîtra sur votre carte de chasseur et vos exploits.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-hud uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@domaine.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-sans focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-hud uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-sky-400" />
                    Mot de passe (Min. 6 caractères)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-sans focus:outline-none focus:border-sky-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Création en cours...' : 'Créer mon Compte Hunter'}</span>
                </button>
              </form>
            )}

            {/* TAB 3: PSEUDO RAPIDE (SANS CRÉATION DE COMPTE EMAIL) */}
            {activeTab === 'quick-pseudo' && (
              <form onSubmit={handleSaveQuickPseudo} className="space-y-3.5 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <span className="font-hud font-bold text-white block">Mode Immédiat / Sans Inscription</span>
                  <p>
                    Vous pouvez simplement définir votre Pseudo de Chasseur sans mot de passe pour commencer à jouer immédiatement sur cet appareil.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-hud uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    Votre Pseudo Actuel
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Votre Pseudo..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/50 text-white text-sm font-hud tracking-wide focus:outline-none focus:border-sky-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer mon Pseudo</span>
                </button>
              </form>
            )}

            {/* Google alternative */}
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] font-hud uppercase text-slate-500 tracking-wider">
                  OU CONTINUER AVEC
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
                <span>Se connecter avec Google</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>BloomVerse • Système d'Éveil Spirituel</span>
          <button
            type="button"
            onClick={() => {
              playSystemSound('click');
              onClose();
            }}
            className="text-sky-400 hover:text-sky-300 font-hud font-bold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
