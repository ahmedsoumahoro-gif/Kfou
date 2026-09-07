import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  loginWithGoogle,
  logoutHunter,
  saveHunterToCloud,
  updateHunterDisplayName,
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
  User,
  Edit2,
  Check,
  ShieldCheck,
  Database,
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
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

  // Save Pseudo when logged in
  const handleSaveLoggedInPseudo = async () => {
    if (!editablePseudo.trim()) {
      setErrorMsg('Le pseudo ne peut pas être vide.');
      return;
    }
    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      await updateHunterDisplayName(editablePseudo.trim());
      if (onUpdatePseudo) {
        onUpdatePseudo(editablePseudo.trim());
      }
      setIsEditingPseudo(false);
      playSystemSound('level_up');
      setSuccessMsg(`Votre pseudo a été mis à jour : "${editablePseudo.trim()}".`);

      // Persist to cloud
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
    } catch (err) {
      console.error('Update pseudo error:', err);
      setErrorMsg('Erreur lors de la mise à jour du pseudo.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Pseudo Change
  const handleSaveQuickPseudo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo.trim()) {
      setErrorMsg('Le pseudo ne peut pas être vide.');
      return;
    }
    clearMessages();
    playSystemSound('click');
    if (onUpdatePseudo) {
      onUpdatePseudo(pseudo.trim());
    }
    setSuccessMsg(`Pseudo défini sur "${pseudo.trim()}".`);
  };

  // Google Sign In
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      clearMessages();
      playSystemSound('click');
      const cleanPseudo = pseudo.trim() || hunterUser.name;
      const user = await loginWithGoogle(cleanPseudo);
      if (cleanPseudo && onUpdatePseudo) {
        onUpdatePseudo(cleanPseudo);
      }
      playSystemSound('level_up');
      setSuccessMsg(`Connexion Google réussie ! Bienvenue, ${user.displayName || cleanPseudo}.`);
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
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50 transition-colors cursor-pointer"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-hud font-bold tracking-wider uppercase bg-sky-950/80 border border-sky-500/40 text-sky-300">
              <Sparkles className="w-3 h-3 text-sky-400" />
              GESTION DU COMPTE CHASSEUR
            </span>
            {currentUser && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-hud font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                CONNECTÉ
              </span>
            )}
          </div>
          <h2 className="font-hud text-2xl font-black text-white tracking-wide">
            {currentUser ? 'Mon Profil & Synchronisation' : 'Identification du Chasseur'}
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            {currentUser
              ? 'Votre progression est sauvegardée dans votre base de données Cloud Firestore.'
              : 'Définissez votre pseudo ou connectez-vous avec Google pour sécuriser vos données.'}
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

              {/* Cloud Sync Status */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-sky-400" />
                    Statut Cloud Firestore
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">
                    Opérationnel & Actif
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  {lastSyncedAt
                    ? `Dernière synchro : ${new Date(lastSyncedAt).toLocaleTimeString('fr-FR')} (${new Date(lastSyncedAt).toLocaleDateString('fr-FR')})`
                    : 'Prêt pour la synchronisation'}
                </p>
              </div>
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
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        ) : (
          /* CASE 2: NOT CONNECTED */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/40 flex items-start gap-3">
              <Database className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-slate-300">
                <span className="font-bold text-sky-300">Zéro Inscription Email :</span>{' '}
                Définissez votre pseudo ou connectez-vous avec Google en 1 clic pour enregistrer votre progression.
              </div>
            </div>

            {/* Pseudo Form */}
            <form onSubmit={handleSaveQuickPseudo} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-hud uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  Votre Pseudo de Chasseur
                </label>
                <input
                  type="text"
                  required
                  maxLength={35}
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Ex: David, Esther, Ahmed..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-sky-500/40 text-white text-sm font-hud tracking-wide focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer ce Pseudo</span>
              </button>
            </form>

            {/* Google alternative */}
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] font-hud uppercase text-slate-500 tracking-wider">
                  OU CONNEXION DIRECTE GOOGLE
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-hud font-bold text-xs tracking-wide flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all cursor-pointer active:scale-98 disabled:opacity-50 mt-1"
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
                <span>
                  {pseudo.trim()
                    ? `Lier à Google sous le pseudo "${pseudo.trim()}"`
                    : 'Continuer avec Google'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>BloomVerse • Solo Leveling Céleste</span>
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
