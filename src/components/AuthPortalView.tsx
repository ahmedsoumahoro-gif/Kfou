import React, { useState } from 'react';
import {
  Sparkles,
  User,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Database,
  Cross,
  Flame,
  Info,
} from 'lucide-react';
import {
  loginWithGoogle,
  loginWithHunterPseudo,
} from '../services/firebase';
import { playSystemSound } from '../utils/audio';

interface AuthPortalViewProps {
  onAuthenticated?: () => void;
}

export const AuthPortalView: React.FC<AuthPortalViewProps> = ({ onAuthenticated }) => {
  const [pseudo, setPseudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMsg(null);
    setInfoMsg(null);
  };

  // 1. Direct Entry with Hunter Pseudo
  const handlePseudoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanPseudo = pseudo.trim();
    if (!cleanPseudo) {
      setErrorMsg('Veuillez entrer votre pseudo de Chasseur.');
      playSystemSound('bell');
      return;
    }

    setLoading(true);
    playSystemSound('click');
    try {
      await loginWithHunterPseudo(cleanPseudo);
      playSystemSound('level_up');
      if (onAuthenticated) onAuthenticated();
    } catch (err: unknown) {
      console.warn('Direct pseudo login attempt:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/operation-not-allowed') {
        setInfoMsg(
          "L'authentification anonyme sans Google n'est pas encore activée dans la console Firebase de votre projet. Utilisez le bouton Google ci-dessous : votre pseudo sera conservé !"
        );
      } else {
        setErrorMsg('Impossible de démarrer avec ce pseudo pour le moment. Essayez via Google.');
      }
      playSystemSound('bell');
    } finally {
      setLoading(false);
    }
  };

  // 2. Google One-Click Sign In (Optionally applying the typed pseudo)
  const handleGoogleLogin = async () => {
    resetMessages();
    setLoading(true);
    playSystemSound('click');
    try {
      const cleanPseudo = pseudo.trim();
      await loginWithGoogle(cleanPseudo || undefined);
      playSystemSound('level_up');
      if (onAuthenticated) onAuthenticated();
    } catch (err: unknown) {
      console.error('Google login failed:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Connexion annulée : la fenêtre Google a été fermée.');
      } else {
        setErrorMsg('Erreur de connexion Google. Vérifiez votre connexion.');
      }
      playSystemSound('bell');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#06080e] relative overflow-hidden text-slate-100">
      {/* Ambient Celestial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[550px] sm:h-[550px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass HUD Container */}
      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* HUD Frame Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-400/40 text-sky-300 text-xs font-hud font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>SYSTÈME BLOOMVERSE • ACCÈS CHASSEUR</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-hud font-black tracking-wider text-white">
            PORTAIL DU CHASSEUR
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Entrez simplement votre <strong className="text-sky-300">Pseudo</strong> pour démarrer votre progression authentique à <strong className="text-amber-300">zéro</strong> (Niveau 1, Rang E).
          </p>
        </div>

        {/* HUD Card Container */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-sky-500/30 shadow-[0_0_50px_rgba(14,165,233,0.15)] backdrop-blur-xl space-y-6">
          {/* Cloud Database Zero-Slate Status Banner */}
          <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/40 flex items-start gap-3">
            <Database className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-300">
              <span className="font-bold text-sky-300">Sauvegarde Cloud Firestore :</span>{' '}
              Aucun mode démo. Chaque Chasseur commence au <strong className="text-white font-semibold">Rang E (Niveau 1, 0 XP)</strong> et sauvegarde ses temps de prière et quêtes dans sa propre base de données.
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-3 text-red-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 flex items-start gap-3 text-amber-200 text-xs animate-in fade-in">
              <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Pseudo-Only Entry Form */}
          <form onSubmit={handlePseudoLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-hud font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" />
                <span>Votre Pseudo de Chasseur</span>
              </label>
              <input
                type="text"
                id="hunter-pseudo-input"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Ex: David, Ahmed, SoldatDeChrist, Esther..."
                maxLength={40}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-sky-400 text-white font-hud text-base tracking-wide focus:outline-none transition-colors placeholder:text-slate-600 shadow-inner"
              />
              <p className="text-[11px] text-slate-400">
                Ce nom sera votre identifiant affiché sur votre profil et vos quêtes.
              </p>
            </div>

            {/* Direct Entry Button */}
            <button
              type="submit"
              id="pseudo-enter-btn"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-hud text-sm font-black tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(14,165,233,0.4)] transition-all cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <span>{loading ? 'INITIALISATION...' : 'ENTRER DANS LE SYSTÈME'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-400 font-hud tracking-wider">
                OU CONNEXION DIRECTE SÉCURISÉE
              </span>
            </div>
          </div>

          {/* Google One-Click Button */}
          <button
            type="button"
            id="auth-google-button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-700 hover:border-sky-400/60 text-white font-hud text-sm font-bold tracking-wide flex items-center justify-center gap-3 shadow-md hover:shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all cursor-pointer disabled:opacity-50 active:scale-98"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                ? `Continuer avec Google sous le pseudo "${pseudo.trim()}"`
                : 'Continuer avec Google (Recommandé)'}
            </span>
          </button>

          {/* Guarantee Pill */}
          <div className="pt-2 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Chiffrement Firebase & Firestore Cloud DB Actifs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
