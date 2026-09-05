import { HunterUser, Quest, Vice, Skill, DungeonBreak, Badge, InventoryItem, DailyVerse } from '../types';

export const INITIAL_USER: HunterUser = {
  id: 'usr_sung_jin_christ',
  name: 'Sung Jin-Christ',
  email: 'demo@bloomverse.app',
  spiritualTitle: 'Disciple Éveillé de la Grâce',
  hunterRank: 'Rang C',
  avatar: 'shadow_monarch_cross',
  conversionDate: '2024-01-01',
  level: 5,
  currentXp: 450,
  totalXp: 1650,
  prayerMinutesToday: 25,
  bibleChaptersToday: 3,
  fastingDaysStreak: 1,
  generalViceStreak: 14,
};

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Garde Matinale (Prière Fervente)',
    category: 'prière',
    xpReward: 60,
    icon: 'Flame',
    description: 'Consacrer au moins 15 minutes en tête-à-tête avec Jésus pour orienter la journée.',
    statType: 'prayer_minutes',
    statIncrement: 15,
    isDaily: true,
    completedToday: false,
  },
  {
    id: 'q2',
    title: 'Nourriture de Vie (Méditation Biblique)',
    category: 'lecture',
    xpReward: 60,
    icon: 'BookOpen',
    description: 'Lire et méditer au moins 2 chapitres des Saintes Écritures.',
    statType: 'bible_chapters',
    statIncrement: 2,
    isDaily: true,
    completedToday: false,
  },
  {
    id: 'q3',
    title: 'Bouclier de Pureté (Résistance aux Vices)',
    category: 'combat',
    xpReward: 80,
    icon: 'ShieldAlert',
    description: 'Refuser tout compromis avec les désirs de la chair et garder ses yeux et pensées purs.',
    statType: 'vice_streak',
    statIncrement: 1,
    isDaily: true,
    completedToday: false,
  },
  {
    id: 'q4',
    title: 'Service Fraternel & Acte de Grâce',
    category: 'service',
    xpReward: 50,
    icon: 'HeartHandshake',
    description: 'Bénir, encourager ou aider concrètement un frère, une sœur ou son prochain.',
    statType: 'general',
    statIncrement: 1,
    isDaily: true,
    completedToday: false,
  },
  {
    id: 'q5',
    title: 'Action de Grâce & Examen du Soir',
    category: 'gratitude',
    xpReward: 50,
    icon: 'Sparkles',
    description: 'Remercier Dieu pour 3 victoires du jour et déposer ses fardeaux à la croix.',
    statType: 'general',
    statIncrement: 1,
    isDaily: true,
    completedToday: false,
  },
];

export const INITIAL_VICES: Vice[] = [
  {
    id: 'v1',
    name: 'Pornographie & Luxure',
    slug: 'pornography',
    bossTitle: "L'Ombre de la Chair",
    biblicalVerse: 'Fuyez l\'impudicité. Quelque autre péché qu\'un homme commette, ce péché est hors du corps; mais celui qui se livre à l\'impudicité pèche contre son propre corps.',
    verseRef: '1 Corinthiens 6:18',
    currentHp: 40,
    maxHp: 100,
    streak: 14,
    extracted: false,
  },
  {
    id: 'v2',
    name: 'Procrastination & Paresse',
    slug: 'procrastination',
    bossTitle: "L'Ombre de l'Oisiveté",
    biblicalVerse: 'Va vers la fourmi, paresseux; considère ses voies, et deviens sage.',
    verseRef: 'Proverbes 6:6',
    currentHp: 20,
    maxHp: 100,
    streak: 21,
    extracted: false,
  },
  {
    id: 'v3',
    name: 'Colère, Amertume & Rancœur',
    slug: 'anger',
    bossTitle: "L'Ombre du Venin Intérieur",
    biblicalVerse: 'Si vous vous mettez en colère, ne péchez point; que le soleil ne se couche pas sur votre colère.',
    verseRef: 'Éphésiens 4:26',
    currentHp: 65,
    maxHp: 100,
    streak: 8,
    extracted: false,
  },
  {
    id: 'v4',
    name: 'Addiction aux Écrans & Distraction',
    slug: 'screen_addiction',
    bossTitle: "L'Ombre du Mirage Numérique",
    biblicalVerse: 'Rachetez le temps, car les jours sont mauvais.',
    verseRef: 'Éphésiens 5:16',
    currentHp: 0,
    maxHp: 100,
    streak: 32,
    extracted: true,
  },
];

export const INITIAL_SKILLS: Skill[] = [
  // PRIÈRE
  {
    id: 'sk1',
    code: 'prayer_1',
    branch: 'PRIÈRE',
    name: 'Intercession Fervente',
    tier: 1,
    xpRequired: 150,
    titleUnlocked: 'Sentinelle du Matin',
    icon: 'Flame',
    description: 'Prier avec endurance pour ses frères et pour l’avancement du Royaume.',
    unlocked: true,
  },
  {
    id: 'sk2',
    code: 'prayer_2',
    branch: 'PRIÈRE',
    name: 'Prière en Esprit',
    tier: 2,
    xpRequired: 450,
    titleUnlocked: 'Guerrier Céleste',
    icon: 'Zap',
    description: 'Édification profonde de son esprit par une communion intime et continue.',
    unlocked: true,
    prerequisiteCode: 'prayer_1',
  },
  {
    id: 'sk3',
    code: 'prayer_3',
    branch: 'PRIÈRE',
    name: 'Autorité dans le Nom de Jésus',
    tier: 3,
    xpRequired: 900,
    titleUnlocked: 'Général d\'Intercession',
    icon: 'Crown',
    description: 'Renverser les forteresses spirituelles et décréter la paix de Dieu avec foi.',
    unlocked: false,
    prerequisiteCode: 'prayer_2',
  },
  // ÉTUDE
  {
    id: 'sk4',
    code: 'study_1',
    branch: 'ÉTUDE',
    name: 'Méditation Quotidienne',
    tier: 1,
    xpRequired: 150,
    titleUnlocked: 'Scribe de la Grâce',
    icon: 'BookOpen',
    description: 'Graver les promesses divines dans son cœur et méditer jour et nuit.',
    unlocked: true,
  },
  {
    id: 'sk5',
    code: 'study_2',
    branch: 'ÉTUDE',
    name: 'Mémorisation des Écritures',
    tier: 2,
    xpRequired: 450,
    titleUnlocked: 'Épée Vivante',
    icon: 'Sword',
    description: 'Manier la Parole avec précision et rapidité dans toutes les épreuves.',
    unlocked: true,
    prerequisiteCode: 'study_1',
  },
  {
    id: 'sk6',
    code: 'study_3',
    branch: 'ÉTUDE',
    name: 'Discernement & Enseignement',
    tier: 3,
    xpRequired: 900,
    titleUnlocked: 'Maître des Écritures',
    icon: 'Compass',
    description: 'Distinguer la vérité des mensonges subtils et édifier l’Assemblée du Christ.',
    unlocked: false,
    prerequisiteCode: 'study_2',
  },
  // SERVICE
  {
    id: 'sk7',
    code: 'service_1',
    branch: 'SERVICE',
    name: 'Cœur de Serviteur',
    tier: 1,
    xpRequired: 150,
    titleUnlocked: 'Pilier Discret',
    icon: 'Heart',
    description: 'Servir dans l’ombre avec joie sans rechercher la gloire humaine.',
    unlocked: true,
  },
  {
    id: 'sk8',
    code: 'service_2',
    branch: 'SERVICE',
    name: 'Mentorat Spirituel',
    tier: 2,
    xpRequired: 450,
    titleUnlocked: 'Guide des Âmes',
    icon: 'Users',
    description: 'Accompagner un plus jeune dans la foi pour affermir ses pas en Christ.',
    unlocked: false,
    prerequisiteCode: 'service_1',
  },
  {
    id: 'sk9',
    code: 'service_3',
    branch: 'SERVICE',
    name: 'Ministère Engagé',
    tier: 3,
    xpRequired: 900,
    titleUnlocked: 'Pionnier du Royaume',
    icon: 'Shield',
    description: 'S\'investir pleinement dans la moisson et pour l\'expansion de l\'Évangile.',
    unlocked: false,
    prerequisiteCode: 'service_2',
  },
  // PURETÉ
  {
    id: 'sk10',
    code: 'purity_1',
    branch: 'PURETÉ',
    name: 'Résistance aux Tentations',
    tier: 1,
    xpRequired: 150,
    titleUnlocked: 'Bouclier de Foi',
    icon: 'ShieldCheck',
    description: 'Éteindre les traits enflammés du malin par une obéissance immédiate.',
    unlocked: true,
  },
  {
    id: 'sk11',
    code: 'purity_2',
    branch: 'PURETÉ',
    name: 'Pureté du Cœur',
    tier: 2,
    xpRequired: 450,
    titleUnlocked: 'Sentinelle Pure',
    icon: 'Sparkles',
    description: 'Sanctification constante des pensées, désirs et regards.',
    unlocked: false,
    prerequisiteCode: 'purity_1',
  },
  {
    id: 'sk12',
    code: 'purity_3',
    branch: 'PURETÉ',
    name: 'Intégrité Totale',
    tier: 3,
    xpRequired: 900,
    titleUnlocked: 'Vase d\'Honneur Purifié',
    icon: 'Award',
    description: 'Marche sans tache ni compromis devant la sainte face de Dieu.',
    unlocked: false,
    prerequisiteCode: 'purity_2',
  },
];

export const INITIAL_DUNGEONS: DungeonBreak[] = [
  {
    id: 'dg1',
    name: 'Jeûne d\'Esther & Daniel',
    rank: 'Rank B',
    durationDays: 3,
    currentDay: 1,
    xpReward: 450,
    badgeReward: 'Flamme du Désert',
    description: 'Trois jours de consécration par le jeûne et la prière pour briser des liens tenaces.',
    verse: 'Daniel 9:3',
    icon: 'Flame',
    active: true,
    completed: false,
  },
  {
    id: 'dg2',
    name: 'Marathon Biblique : Évangile de Jean',
    rank: 'Rank A',
    durationDays: 7,
    currentDay: 0,
    xpReward: 700,
    badgeReward: 'Disciple Bien-Aimé',
    description: 'Lecture intégrale et méditation des 21 chapitres de l\'Évangile de Jean en 7 jours.',
    verse: 'Jean 20:31',
    icon: 'BookOpen',
    active: false,
    completed: false,
  },
  {
    id: 'dg3',
    name: 'Semaine Détox : Blackout Numérique',
    rank: 'Rank S',
    durationDays: 7,
    currentDay: 0,
    xpReward: 1000,
    badgeReward: 'Maître du Silence',
    description: '7 jours sans réseaux sociaux ni divertissements vains pour entendre la voix de Dieu.',
    verse: 'Psaume 46:10',
    icon: 'WifiOff',
    active: false,
    completed: false,
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'b1',
    code: 'first_quest',
    name: 'Premier Pas du Chasseur',
    description: 'A complété sa toute première quête spirituelle divine.',
    icon: 'Sparkles',
    rarity: 'Rare',
    unlocked: true,
    unlockedAt: '2024-01-02',
  },
  {
    id: 'b2',
    code: 'level_5',
    name: 'Éveil du Disciple',
    description: 'A atteint le Niveau 5 et franchi le portail du Rang C.',
    icon: 'Award',
    rarity: 'Épique',
    unlocked: true,
    unlockedAt: '2024-02-15',
  },
  {
    id: 'b3',
    code: 'shadow_extractor',
    name: 'Commandant des Ombres Purifiées',
    description: 'A terrassé une ombre intérieure après 30 jours de fidélité.',
    icon: 'Crown',
    rarity: 'Légendaire',
    unlocked: true,
    unlockedAt: '2024-02-28',
  },
  {
    id: 'b4',
    code: 'prayer_warrior',
    name: 'Genou Incliné, Ciel Ouvert',
    description: 'A cumulé plus de 500 minutes de prière fervente.',
    icon: 'Flame',
    rarity: 'Divin',
    unlocked: false,
  },
  {
    id: 'b5',
    code: 'word_carrier',
    name: 'Porteur du Rhema Divin',
    description: 'A conservé plus de 20 épées de combat spirituel dans son inventaire.',
    icon: 'Sword',
    rarity: 'Épique',
    unlocked: false,
  },
  {
    id: 'b6',
    code: 'unshakable',
    name: 'Forteresse Inébranlable',
    description: 'A vaincu un donjon de Rang S sans fléchir.',
    icon: 'ShieldCheck',
    rarity: 'Légendaire',
    unlocked: false,
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv1',
    type: 'verset',
    title: 'Épée contre la Crainte',
    content: 'Ne crains rien, car je suis avec toi; Ne promène pas des regards inquiets, car je suis ton Dieu; Je te fortifie, je viens à ton secours.',
    reference: 'Ésaïe 41:10',
    category: 'Combat Spirituel',
    createdAt: '2024-01-10',
  },
  {
    id: 'inv2',
    type: 'verset',
    title: 'Épée contre la Luxure',
    content: 'Comment le jeune homme rendra-t-il pur son sentier? En se dirigeant d\'après ta parole.',
    reference: 'Psaume 119:9',
    category: 'Pureté',
    createdAt: '2024-01-15',
  },
  {
    id: 'inv3',
    type: 'verset',
    title: 'Épée contre le Doute',
    content: 'Je puis tout par celui qui me fortifie.',
    reference: 'Philippiens 4:13',
    category: 'Foi & Victoire',
    createdAt: '2024-01-20',
  },
  {
    id: 'inv4',
    type: 'prière',
    title: 'Prière d\'Éphésiens 6 (Les Armes Divines)',
    content: 'Seigneur, je revêts aujourd\'hui le casque du salut, la cuirasse de la justice, la ceinture de vérité, le zèle de l\'Évangile, le bouclier de la foi et l\'épée de l\'Esprit. Garde mon cœur et mes pas.',
    reference: 'Éphésiens 6:10-18',
    category: 'Prière Quotidienne',
    createdAt: '2024-01-25',
  },
];

export const DAILY_VERSES: DailyVerse[] = [
  {
    text: 'Je puis tout par celui qui me fortifie.',
    reference: 'Philippiens 4:13',
    theme: 'Force Divine',
  },
  {
    text: 'Revêtez-vous de toutes les armes de Dieu, afin de pouvoir tenir ferme contre les ruses du diable.',
    reference: 'Éphésiens 6:11',
    theme: 'Combat Spirituel',
  },
  {
    text: 'Car ce n\'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d\'amour et de sagesse.',
    reference: '2 Timothée 1:7',
    theme: 'Courage Divin',
  },
  {
    text: 'Mais ceux qui se confient en l\'Éternel renouvellent leur force. Ils prennent le vol comme les aigles.',
    reference: 'Ésaïe 40:31',
    theme: 'Renouvellement',
  },
  {
    text: 'Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.',
    reference: 'Psaume 119:105',
    theme: 'Direction Divine',
  },
];

export function getXpRequiredForLevel(lvl: number): number {
  return 100 * Math.floor(Math.pow(lvl, 1.4));
}

export function calculateHunterRank(level: number): { rank: HunterUser['hunterRank']; title: string } {
  if (level >= 30) return { rank: 'Chasseur National', title: 'Monarque Céleste de la Grâce' };
  if (level >= 20) return { rank: 'Rang S', title: 'Apôtre de la Puissance Divine' };
  if (level >= 15) return { rank: 'Rang A', title: 'Commandant de la Moisson' };
  if (level >= 10) return { rank: 'Rang B', title: 'Guerrier Consacré' };
  if (level >= 5) return { rank: 'Rang C', title: 'Disciple Éveillé' };
  if (level >= 3) return { rank: 'Rang D', title: 'Soldat du Christ' };
  return { rank: 'Rang E', title: 'Novice de la Grâce' };
}

export function getRankBadgeColor(rank: string): string {
  switch (rank) {
    case 'Chasseur National':
      return 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
    case 'Rang S':
      return 'bg-red-500/20 text-red-300 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
    case 'Rang A':
      return 'bg-orange-500/20 text-orange-300 border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]';
    case 'Rang B':
      return 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
    case 'Rang C':
      return 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.3)]';
    case 'Rang D':
      return 'bg-teal-500/20 text-teal-300 border-teal-400';
    default:
      return 'bg-slate-700/30 text-slate-300 border-slate-600';
  }
}

export function getRankTextColor(rank: string): string {
  switch (rank) {
    case 'Chasseur National':
      return 'text-amber-400';
    case 'Rang S':
      return 'text-red-400';
    case 'Rang A':
      return 'text-orange-400';
    case 'Rang B':
      return 'text-purple-400';
    case 'Rang C':
      return 'text-sky-400';
    case 'Rang D':
      return 'text-teal-400';
    default:
      return 'text-slate-300';
  }
}

export function getRankShortCode(rank: string): string {
  switch (rank) {
    case 'Chasseur National':
      return 'NAT';
    case 'Rang S':
      return 'S';
    case 'Rang A':
      return 'A';
    case 'Rang B':
      return 'B';
    case 'Rang C':
      return 'C';
    case 'Rang D':
      return 'D';
    default:
      return 'E';
  }
}
