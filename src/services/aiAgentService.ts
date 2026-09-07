import { HunterUser, Quest, Vice } from '../types';

export interface SpiritualAgentContext {
  name: string;
  spiritualTitle: string;
  hunterRank: string;
  level: number;
  currentXp: number;
  prayerMinutesToday: number;
  bibleChaptersToday: number;
  generalViceStreak: number;
  uncompletedQuestsCount: number;
}

export interface SpiritualActionRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'prayer' | 'bible' | 'quest' | 'fasting';
  xpReward: number;
  actionTab: 'prayer' | 'bible' | 'quests' | 'worship' | 'shadows';
  urgent: boolean;
}

export interface SpiritualDiagnosis {
  greeting: string;
  generalStatus: 'excellent' | 'good' | 'warning' | 'critical';
  statusSummary: string;
  keyScripture: {
    verse: string;
    reference: string;
  };
  recommendations: SpiritualActionRecommendation[];
}

/**
 * Builds diagnostic and high-focus priority recommendations based on real user state.
 */
export function generateLocalDiagnosis(
  user: HunterUser,
  quests: Quest[],
  vices: Vice[]
): SpiritualDiagnosis {
  const uncompleted = quests.filter((q) => !q.completedToday);
  const prayerDone = user.prayerMinutesToday >= 15;
  const bibleDone = user.bibleChaptersToday >= 1;
  const activeVices = vices.filter((v) => !v.extracted);

  const recommendations: SpiritualActionRecommendation[] = [];

  if (!prayerDone) {
    recommendations.push({
      id: 'rec_prayer',
      title: 'Priorité 1 : Entrer dans le Lieu Secret',
      description: `Vous avez accompli ${user.prayerMinutesToday} min de prière. Prenez au moins 15 minutes d'intimité avec Dieu.`,
      category: 'prayer',
      xpReward: 50,
      actionTab: 'worship',
      urgent: true,
    });
  }

  if (!bibleDone) {
    recommendations.push({
      id: 'rec_bible',
      title: 'Priorité 2 : Méditer la Parole Sainte',
      description: 'Nourrissez votre esprit avec au moins 1 chapitre de l\'Évangile de Jean ou des Psaumes.',
      category: 'bible',
      xpReward: 30,
      actionTab: 'bible',
      urgent: false,
    });
  }

  if (uncompleted.length > 0) {
    recommendations.push({
      id: 'rec_quests',
      title: `Priorité 3 : Accomplir vos quêtes quotidiennes (${uncompleted.length} restante${uncompleted.length > 1 ? 's' : ''})`,
      description: `Complétez ${uncompleted[0].title} pour débloquer +${uncompleted[0].xpReward} XP et sanctifier votre journée.`,
      category: 'quest',
      xpReward: uncompleted[0].xpReward,
      actionTab: 'quests',
      urgent: false,
    });
  }

  if (activeVices.length > 0) {
    recommendations.push({
      id: 'rec_vices',
      title: 'Vigilance : Dompter vos ombres intérieures',
      description: `Restez éveillé face à ${activeVices[0].name}. « Veillez et priez, afin que vous ne tombiez pas en tentation. »`,
      category: 'fasting',
      xpReward: 100,
      actionTab: 'shadows',
      urgent: true,
    });
  }

  let statusSummary = '';
  let generalStatus: 'excellent' | 'good' | 'warning' | 'critical' = 'good';

  if (prayerDone && bibleDone && uncompleted.length === 0) {
    generalStatus = 'excellent';
    statusSummary = 'Excellente discipline spirituelle aujourd\'hui ! Vous persévérez dans la sainteté et la prière fervente.';
  } else if (!prayerDone && !bibleDone) {
    generalStatus = 'warning';
    statusSummary = 'La journée avance sans nourriture spirituelle. Accordez en priorité 15 minutes au Seigneur pour fortifier votre esprit.';
  } else {
    generalStatus = 'good';
    statusSummary = 'Progression en cours. Poursuivez vos efforts pour valider votre objectif de prière et de méditation.';
  }

  return {
    greeting: `Que la grâce du Seigneur soit sur toi, ${user.name}.`,
    generalStatus,
    statusSummary,
    keyScripture: {
      verse: '« Je puis tout par celui qui me fortifie. »',
      reference: 'Philippiens 4:13',
    },
    recommendations,
  };
}

/**
 * Calls server-side Gemini coach endpoint with fallback to intelligent local counsel.
 */
export async function askSpiritualAgent(
  prompt: string,
  userContext: SpiritualAgentContext
): Promise<string> {
  try {
    const res = await fetch('/api/ai/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, userContext }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.reply) {
        return data.reply;
      }
    }
  } catch (e) {
    console.warn('AI Server coach unavailable, using local spiritual counsel:', e);
  }

  // Fallback if backend server or Gemini key is unavailable
  const lower = prompt.toLowerCase();

  if (lower.includes('prière') || lower.includes('prier')) {
    return `« Mais quand tu pries, entre dans ta chambre, ferme ta porte, et prie ton Père qui est là dans le lieu secret » (Matthieu 6:6).
Pour vous focaliser :
1. Isolez-vous et coupez toute distraction.
2. Lancez une douce mélodie d'adoration dans l'onglet Sanctuaire.
3. Commencez par louer Dieu pendant 5 minutes, confessez vos manquements, puis exposez vos requêtes avec foi.`;
  }

  if (lower.includes('vice') || lower.includes('tentation') || lower.includes('péché')) {
    return `« Soumettez-vous donc à Dieu; résistez au diable, et il fuira loin de vous. » (Jacques 4:7).
Votre série actuelle est de ${userContext.generalViceStreak} jours. Dès qu'une pensée impure ou une tentation survient :
1. Proclamez à voix haute un verset (consultez votre onglet Épées célestes).
2. Changez immédiatement d'environnement et faites 10 respirations profondes.
3. Fixez vos yeux sur Christ.`;
  }

  if (
    lower.includes('bloqu') ||
    lower.includes('téléphone') ||
    lower.includes('appli') ||
    lower.includes('application') ||
    lower.includes('distraction') ||
    lower.includes('interagir') ||
    lower.includes('concentration')
  ) {
    return `🛡️ BOUCLIER ANTI-DISTRACTION DU TÉLÉPHONE ACTIVÉ :

Pour vous couper complètement du monde et empêcher les autres applications de disperser votre esprit :

1. **Verrouillage Kiosque & Plein Écran (BloomVerse)** :
   Activez le bouton « Bouclier Anti-Distraction » dans le minuteur de recueillement. L'écran restera allumé et passera en plein écran sans aucune barre de notification visible.

2. **Détecteur d'Évasion de l'Agent IA** :
   Si vous tentez de quitter BloomVerse pour ouvrir WhatsApp, TikTok, Instagram ou YouTube pendant votre prière, je détecte immédiatement la sortie, déclenche une alerte sonore et vous interpelle pour vous ramener au sanctuaire.

3. **Blocage des autres applications via votre système** :
   • **Sur Android** : Activez le *Mode Sans distraction* dans *Paramètres > Bien-être numérique*. Cochez vos réseaux sociaux : Android interdira leur ouverture tant que vous priez !
   • **Sur iPhone** : Activez le *Mode Concentration (Prière)* dans *Réglages > Concentration* pour masquer automatiquement toutes les notifications et applis perturbatrices.

Que tout votre être soit captif de Christ pour ce temps béni !`;
  }

  if (lower.includes('bible') || lower.includes('verset') || lower.includes('parole')) {
    return `« Ta parole est une lampe à mes pieds, et une lumière sur mon sentier. » (Psaume 119:105).
Vous avez médité ${userContext.bibleChaptersToday} chapitre(s) aujourd'hui.
Ouvrez dès maintenant l'onglet "La Bible", lisez le Psaume 23 ou Jean 15, et mémorisez une phrase pour toute la journée.`;
  }

  return `Pour maximiser votre sanctification aujourd'hui (${userContext.spiritualTitle}, Niveau ${userContext.level}) :
1. Consacrez les 20 prochaines minutes exclusivement à Dieu sans toucher à votre téléphone.
2. Méditez Romains 12:2 : « Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l'intelligence ».
3. Accomplissez votre quête du jour pour enraciner votre discipline.`;
}
