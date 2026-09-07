export type HunterRank = 'Rang E' | 'Rang D' | 'Rang C' | 'Rang B' | 'Rang A' | 'Rang S' | 'Chasseur National';

export type QuestCategory = 'prière' | 'lecture' | 'gratitude' | 'combat' | 'service';

export type SkillBranch = 'PRIÈRE' | 'ÉTUDE' | 'SERVICE' | 'PURETÉ';

export type BadgeRarity = 'Rare' | 'Épique' | 'Légendaire' | 'Divin';

export interface HunterUser {
  id: string;
  name: string;
  email: string;
  spiritualTitle: string;
  hunterRank: HunterRank;
  avatar: string;
  conversionDate: string;
  level: number;
  currentXp: number;
  totalXp: number;
  prayerMinutesToday: number;
  bibleChaptersToday: number;
  fastingDaysStreak: number;
  generalViceStreak: number;
}

export interface Quest {
  id: string;
  title: string;
  category: QuestCategory;
  xpReward: number;
  icon: string;
  description: string;
  statType: 'prayer_minutes' | 'bible_chapters' | 'vice_streak' | 'general';
  statIncrement: number;
  isDaily: boolean;
  completedToday: boolean;
}

export interface Vice {
  id: string;
  name: string;
  slug: string;
  bossTitle: string;
  biblicalVerse: string;
  verseRef: string;
  currentHp: number;
  maxHp: number;
  streak: number;
  extracted: boolean;
  lastResistedDate?: string;
}

export interface Skill {
  id: string;
  code: string;
  branch: SkillBranch;
  name: string;
  tier: 1 | 2 | 3;
  xpRequired: number;
  titleUnlocked: string;
  icon: string;
  description: string;
  unlocked: boolean;
  prerequisiteCode?: string;
}

export interface DungeonBreak {
  id: string;
  name: string;
  rank: 'Rank B' | 'Rank A' | 'Rank S';
  durationDays: number;
  currentDay: number;
  xpReward: number;
  badgeReward: string;
  description: string;
  verse: string;
  icon: string;
  active: boolean;
  completed: boolean;
  startDate?: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface InventoryItem {
  id: string;
  type: 'verset' | 'prière' | 'témoignage';
  title: string;
  content: string;
  reference: string;
  category: string;
  createdAt: string;
}

export interface DailyVerse {
  text: string;
  reference: string;
  theme: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'bible'
  | 'worship'
  | 'quests'
  | 'shadows'
  | 'skills'
  | 'dungeons'
  | 'inventory'
  | 'profile';

export type AppTheme =
  | 'solo-dark'
  | 'divine-light'
  | 'solar-parchment'
  | 'midnight-blue'
  | 'crimson-gate'
  | 'emerald-eden'
  | 'royal-amethyst';

export type AccentColorPreset =
  | 'cyan'
  | 'gold'
  | 'emerald'
  | 'purple'
  | 'crimson'
  | 'blue'
  | 'amber'
  | 'rose'
  | 'custom';

export type HudFont = 'rajdhani' | 'cinzel' | 'montserrat' | 'playfair' | 'oswald';
export type BodyFont = 'jakarta' | 'inter' | 'merriweather' | 'outfit';
export type FontScale = 'normal' | 'large' | 'xlarge';

export type ReminderTone = 'duolingo' | 'solo_leveling' | 'grace';

export interface ReminderSettings {
  enabled: boolean;
  time: string; // "HH:mm" e.g. "20:30"
  tone: ReminderTone;
  soundEnabled: boolean;
  streakAlertEnabled: boolean;
  lastNotifiedDate?: string;
}

export interface AppearanceSettings {
  theme: AppTheme;
  hudFont: HudFont;
  bodyFont: BodyFont;
  fontScale: FontScale;
  accentColorPreset: AccentColorPreset;
  customAccentColor: string;
}

export interface DailySpiritualLog {
  date: string; // "YYYY-MM-DD"
  dayName: string; // "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"
  prayerMinutes: number;
  bibleChapters: number;
  questsCompletedCount: number;
  xpEarned: number;
}

export interface WeeklySpiritualReportData {
  id: string;
  userId: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  generatedAt: string;

  // Key Aggregates
  totalPrayerMinutes: number;
  totalBibleChapters: number;
  totalQuestsCompleted: number;
  totalXpGained: number;
  averageDailyPrayer: number;

  // Daily logs across 7 days
  dailyBreakdown: DailySpiritualLog[];

  // Breakdown by quest category
  categoryBreakdown: {
    category: QuestCategory;
    label: string;
    completed: number;
    total: number;
    color: string;
  }[];

  // Sunday Spiritual Evaluation
  hunterRankAtReport: HunterRank;
  weeklyGrade: 'S+' | 'S' | 'A' | 'B' | 'C';
  weeklyEvaluationTitle: string;
  weeklyCommentary: string;
  scriptureAnchor: {
    verse: string;
    reference: string;
    theme: string;
  };
  keyHighlights: string[];
}
