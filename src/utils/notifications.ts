import { ReminderSettings, ReminderTone, HunterUser } from '../types';
import { playSystemSound } from './audio';

const STORAGE_KEY = 'bloomverse_reminder_settings';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  time: '20:30',
  tone: 'duolingo',
  soundEnabled: true,
  streakAlertEnabled: true,
};

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REMINDER_SETTINGS;
    return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to load reminder settings:', err);
    return DEFAULT_REMINDER_SETTINGS;
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save reminder settings:', err);
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

// Duolingo-style quotes and reminders
export interface ReminderQuote {
  title: string;
  body: string;
  emoji: string;
}

export function getReminderContent(
  tone: ReminderTone,
  user: HunterUser,
  uncompletedQuestsCount: number
): ReminderQuote {
  const streak = user.generalViceStreak > 0 ? user.generalViceStreak : 1;
  const prayerDone = user.prayerMinutesToday >= 15;

  if (tone === 'duolingo') {
    const duolingoQuotes: ReminderQuote[] = [
      {
        title: `🔥 Votre flamme de ${streak} jours est en danger !`,
        body: uncompletedQuestsCount > 0
          ? `L'Aigle Céleste s'impatiente : il vous reste encore ${uncompletedQuestsCount} quête(s) à accomplir avant minuit !`
          : `L'Aigle Céleste vous rappelle : 10 petites minutes dans le Lieu Secret pour valider votre autel du jour !`,
        emoji: '🔥',
      },
      {
        title: `🦉 Toc-toc ! Le Système vous a vu scroller...`,
        body: `Vous avez eu 2h pour les réseaux, mais pas 5 minutes pour Dieu ? Votre série de ${streak} jours mérite mieux !`,
        emoji: '🦉',
      },
      {
        title: `😭 Ne brisez pas le cœur de vos anges gardiens !`,
        body: `Votre série de victoires spirituelles vacille. Validez une directive du jour pour garder l'armure étincelante !`,
        emoji: '🛡️',
      },
      {
        title: `⚡ Alerte Flamme Sacrée : Dernier Appel !`,
        body: `Chasseur ${user.name}, minuit approche. Un verset et une prière suffisent pour sécuriser votre streak !`,
        emoji: '⚡',
      },
    ];
    return duolingoQuotes[Math.floor(Math.random() * duolingoQuotes.length)];
  }

  if (tone === 'solo_leveling') {
    const soloQuotes: ReminderQuote[] = [
      {
        title: `⚠️ [DIRECTIVE IMPÉRATIVE DU SYSTÈME]`,
        body: `Chasseur de ${user.hunterRank} : Votre quota spirituel quotidien est incomplet. Pénétrez dans le Lieu Secret sans délai !`,
        emoji: '⚔️',
      },
      {
        title: `⚡ [ALERTE DONJON : OMBRES EN APPROCHE]`,
        body: `Votre résistance spirituelle requiert une recharge d'onction. Déclenchez l'épée de la foi avant la tombée de la nuit.`,
        emoji: '🗡️',
      },
      {
        title: `🔥 [AVERTISSEMENT DE PÉNALITÉ SPIRITUELLE]`,
        body: `Le Système n'accepte aucun relâchement. Vos quêtes quotidiennes doivent être validées pour maintenir votre rang.`,
        emoji: '👑',
      },
    ];
    return soloQuotes[Math.floor(Math.random() * soloQuotes.length)];
  }

  // Grace tone
  const graceQuotes: ReminderQuote[] = [
    {
      title: `🕊️ Le Lieu Secret vous attend ce soir`,
      body: `« Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos. » — Jésus vous appelle.`,
      emoji: '🕊️',
    },
    {
      title: `✨ Une étincelle de foi pour votre soirée`,
      body: `Prenez 5 minutes de paix avec le Seigneur pour déposer vos fardeaux et renouveler vos forces.`,
      emoji: '✨',
    },
    {
      title: `🌿 « Ta parole est une lampe à mes pieds »`,
      body: `Méditez quelques versets ce soir pour nourrir votre esprit et passer une nuit sous la paix divine.`,
      emoji: '📖',
    },
  ];
  return graceQuotes[Math.floor(Math.random() * graceQuotes.length)];
}

export async function triggerReminderNotification(
  settings: ReminderSettings,
  user: HunterUser,
  uncompletedQuestsCount: number
): Promise<{ sent: boolean; quote: ReminderQuote }> {
  const quote = getReminderContent(settings.tone, user, uncompletedQuestsCount);

  if (settings.soundEnabled) {
    playSystemSound('chime');
  }

  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const notif = new Notification(`${quote.emoji} ${quote.title}`, {
        body: quote.body,
        icon: '/favicon.ico',
        tag: 'bloomverse-daily-reminder',
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return { sent: true, quote };
    } catch (err) {
      console.warn('Native notification failed, using in-app fallback:', err);
    }
  }

  return { sent: false, quote };
}
