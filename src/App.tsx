import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  testConnection,
  onHunterAuthStateChanged,
  fetchHunterFromCloud,
  saveHunterToCloud,
} from './services/firebase';
import {
  HunterUser,
  Quest,
  Vice,
  Skill,
  DungeonBreak,
  Badge,
  InventoryItem,
  ActiveTab,
  HunterRank,
  AppearanceSettings,
  ReminderSettings,
} from './types';
import {
  INITIAL_USER,
  INITIAL_QUESTS,
  INITIAL_VICES,
  INITIAL_SKILLS,
  INITIAL_DUNGEONS,
  INITIAL_BADGES,
  INITIAL_INVENTORY,
  DAILY_VERSES,
  getXpRequiredForLevel,
  calculateHunterRank,
} from './data/initialData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { QuestsView } from './components/QuestsView';
import { ShadowArmyView } from './components/ShadowArmyView';
import { SkillTreeView } from './components/SkillTreeView';
import { DungeonBreaksView } from './components/DungeonBreaksView';
import { InventoryView } from './components/InventoryView';
import { ProfileView } from './components/ProfileView';
import { SystemAlertModal } from './components/SystemAlertModal';
import { LevelUpModal } from './components/LevelUpModal';
import { AppearanceSettingsModal } from './components/AppearanceSettingsModal';
import { ProfilePhotoModal } from './components/ProfilePhotoModal';
import { AuthModal } from './components/AuthModal';
import { PrayerAltarModal } from './components/PrayerAltarModal';
import { ReminderModal } from './components/ReminderModal';
import { WeeklySpiritualReport } from './components/WeeklySpiritualReport';
import { MelodyPlayerWidget } from './components/MelodyPlayerWidget';
import { playSystemSound } from './utils/audio';
import { loadReminderSettings, saveReminderSettings, triggerReminderNotification } from './utils/notifications';
import { logDailyActivity, isTodaySunday } from './utils/weeklyReport';
import { getEffectiveAccentColor } from './constants/assets';

const STORAGE_KEY_PREFIX = 'bloomverse_v2_';

const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: 'solo-dark',
  hudFont: 'rajdhani',
  bodyFont: 'jakarta',
  fontScale: 'normal',
  accentColorPreset: 'cyan',
  customAccentColor: '#38bdf8',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch {
    // LocalStorage fallback
  }
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core Persistent State
  const [user, setUser] = useState<HunterUser>(() => getStored('user', INITIAL_USER));
  const [quests, setQuests] = useState<Quest[]>(() => getStored('quests', INITIAL_QUESTS));
  const [vices, setVices] = useState<Vice[]>(() => getStored('vices', INITIAL_VICES));
  const [skills, setSkills] = useState<Skill[]>(() => getStored('skills', INITIAL_SKILLS));
  const [dungeons, setDungeons] = useState<DungeonBreak[]>(() =>
    getStored('dungeons', INITIAL_DUNGEONS)
  );
  const [badges, setBadges] = useState<Badge[]>(() => getStored('badges', INITIAL_BADGES));
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    getStored('inventory', INITIAL_INVENTORY)
  );

  // Appearance Settings (Theme & Fonts)
  const [settings, setSettings] = useState<AppearanceSettings>(() =>
    getStored('appearance', DEFAULT_APPEARANCE)
  );
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Profile Photo / Avatar Modal
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Prayer Altar Secret Place Timer Modal
  const [isPrayerAltarOpen, setIsPrayerAltarOpen] = useState(false);

  // System Modals
  const [systemAlert, setSystemAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    rewardText?: string;
    type?: 'quest' | 'victory' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const [levelUpData, setLevelUpData] = useState<{
    isOpen: boolean;
    newLevel: number;
    newRank: HunterRank;
    newTitle: string;
  }>({
    isOpen: false,
    newLevel: 1,
    newRank: 'Rang E',
    newTitle: '',
  });

  // User Account & Cloud Firebase State (Ready for Deployment)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(() =>
    getStored('last_cloud_sync', undefined)
  );

  // Duolingo-style Daily Streak Reminder Settings State
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() =>
    loadReminderSettings()
  );
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // Sunday Weekly Spiritual Report State
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);
  const [isSimulatedSunday, setIsSimulatedSunday] = useState(false);

  const handleUpdateReminderSettings = (newSettings: ReminderSettings) => {
    setReminderSettings(newSettings);
    saveReminderSettings(newSettings);
  };

  // Background ticker for Daily Reminder (Duolingo Style)
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    const checkReminder = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateStr = now.toISOString().split('T')[0];

      // If scheduled time has arrived and hasn't notified today
      if (
        currentTimeStr === reminderSettings.time &&
        reminderSettings.lastNotifiedDate !== todayDateStr
      ) {
        const uncompleted = quests.filter((q) => q.isDaily && !q.completedToday).length;
        triggerReminderNotification(reminderSettings, user, uncompleted).then(({ quote }) => {
          // Show in-app system modal notification as well
          setSystemAlert({
            isOpen: true,
            title: `${quote.emoji} ${quote.title}`,
            message: quote.body,
            type: 'warning',
          });
        });

        const updated: ReminderSettings = {
          ...reminderSettings,
          lastNotifiedDate: todayDateStr,
        };
        setReminderSettings(updated);
        saveReminderSettings(updated);
      }
    };

    // Check once immediately, then every 20 seconds
    checkReminder();
    const intervalId = setInterval(checkReminder, 20000);
    return () => clearInterval(intervalId);
  }, [reminderSettings, quests, user]);

  // Initialize Firebase connection test & Auth listener on boot
  useEffect(() => {
    // Mandated by Firebase skill
    testConnection();

    const unsubscribe = onHunterAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setIsCloudSyncing(true);
        try {
          const cloudData = await fetchHunterFromCloud(fbUser.uid);
          if (cloudData) {
            setUser(cloudData.user);
            if (cloudData.quests?.length) setQuests(cloudData.quests);
            if (cloudData.vices?.length) setVices(cloudData.vices);
            if (cloudData.skills?.length) setSkills(cloudData.skills);
            if (cloudData.dungeons?.length) setDungeons(cloudData.dungeons);
            if (cloudData.badges?.length) setBadges(cloudData.badges);
            if (cloudData.inventory?.length) setInventory(cloudData.inventory);
            if (cloudData.appearance) setSettings(cloudData.appearance);
            const syncTime = cloudData.lastSyncedAt || new Date().toISOString();
            setLastSyncedAt(syncTime);
            setStored('last_cloud_sync', syncTime);
          } else {
            // First time this Google account connects: bootstrap cloud record
            const freshHunter: HunterUser = {
              ...user,
              id: fbUser.uid,
              name: fbUser.displayName || user.name,
              email: fbUser.email || user.email,
              avatar: fbUser.photoURL || user.avatar,
            };
            setUser(freshHunter);
            await saveHunterToCloud(fbUser.uid, {
              user: freshHunter,
              quests,
              vices,
              skills,
              dungeons,
              badges,
              inventory,
              appearance: settings,
            });
            const now = new Date().toISOString();
            setLastSyncedAt(now);
            setStored('last_cloud_sync', now);
          }
        } catch (err) {
          console.warn('Initial cloud fetch error:', err);
        } finally {
          setIsCloudSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Automatic Debounced Cloud Sync when authenticated user makes progress
  useEffect(() => {
    if (!firebaseUser) return;
    const timer = setTimeout(async () => {
      try {
        setIsCloudSyncing(true);
        await saveHunterToCloud(firebaseUser.uid, {
          user,
          quests,
          vices,
          skills,
          dungeons,
          badges,
          inventory,
          appearance: settings,
        });
        const now = new Date().toISOString();
        setLastSyncedAt(now);
        setStored('last_cloud_sync', now);
      } catch (err) {
        console.warn('Cloud debounced sync warning:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [firebaseUser, user, quests, vices, skills, dungeons, badges, inventory, settings]);

  // Apply Appearance Settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme);
    root.setAttribute('data-font-hud', settings.hudFont);
    root.setAttribute('data-font-body', settings.bodyFont);
    root.setAttribute('data-font-scale', settings.fontScale);

    const accentColor = getEffectiveAccentColor(
      settings.accentColorPreset || 'cyan',
      settings.customAccentColor
    );
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--accent-glow', `${accentColor}66`);
    root.style.setProperty('--accent-border', `${accentColor}80`);
    root.style.setProperty('--accent-bg', `${accentColor}1a`);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (settings.theme === 'divine-light') {
        metaThemeColor.setAttribute('content', '#f4f6f9');
      } else if (settings.theme === 'solar-parchment') {
        metaThemeColor.setAttribute('content', '#f7f3eb');
      } else if (settings.theme === 'midnight-blue') {
        metaThemeColor.setAttribute('content', '#070d1e');
      } else if (settings.theme === 'crimson-gate') {
        metaThemeColor.setAttribute('content', '#0d0608');
      } else if (settings.theme === 'emerald-eden') {
        metaThemeColor.setAttribute('content', '#040d09');
      } else if (settings.theme === 'royal-amethyst') {
        metaThemeColor.setAttribute('content', '#0c0715');
      } else {
        metaThemeColor.setAttribute('content', '#06080e');
      }
    }

    setStored('appearance', settings);
  }, [settings]);

  const handleUpdateSettings = (newSettings: Partial<AppearanceSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleQuickToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme:
        prev.theme === 'divine-light' || prev.theme === 'solar-parchment'
          ? 'solo-dark'
          : 'divine-light',
    }));
  };

  const handleSaveAvatar = (newAvatar: string, newName?: string, newSpiritualTitle?: string) => {
    setUser((prev) => ({
      ...prev,
      avatar: newAvatar,
      name: newName || prev.name,
      spiritualTitle: newSpiritualTitle || prev.spiritualTitle,
    }));
    setSystemAlert({
      isOpen: true,
      title: 'PROFIL DU CHASSEUR MIS À JOUR',
      message: 'Votre photo de profil et vos informations d’identité ont été enregistrées avec succès dans le Système.',
      rewardText: 'IDENTITÉ SYSTÈME SYNCHRONISÉE',
      type: 'info',
    });
  };

  // Local Storage synchronization
  useEffect(() => {
    setStored('user', user);
  }, [user]);

  useEffect(() => {
    setStored('quests', quests);
  }, [quests]);

  useEffect(() => {
    setStored('vices', vices);
  }, [vices]);

  useEffect(() => {
    setStored('skills', skills);
  }, [skills]);

  useEffect(() => {
    setStored('dungeons', dungeons);
  }, [dungeons]);

  useEffect(() => {
    setStored('badges', badges);
  }, [badges]);

  useEffect(() => {
    setStored('inventory', inventory);
  }, [inventory]);

  // XP & Level Progression Engine
  const addXp = (amount: number, reason?: string) => {
    setUser((prevUser) => {
      let currentXp = prevUser.currentXp + amount;
      let totalXp = prevUser.totalXp + amount;
      let level = prevUser.level;
      let hunterRank = prevUser.hunterRank;
      let spiritualTitle = prevUser.spiritualTitle;
      let leveledUp = false;

      let xpNeeded = getXpRequiredForLevel(level);

      while (currentXp >= xpNeeded) {
        currentXp -= xpNeeded;
        level += 1;
        leveledUp = true;
        xpNeeded = getXpRequiredForLevel(level);
      }

      if (leveledUp) {
        const rankInfo = calculateHunterRank(level);
        hunterRank = rankInfo.rank;
        spiritualTitle = rankInfo.title;

        setLevelUpData({
          isOpen: true,
          newLevel: level,
          newRank: hunterRank,
          newTitle: spiritualTitle,
        });

        // Check level 5 badge
        if (level >= 5) {
          unlockBadge('level_5');
        }
      }

      return {
        ...prevUser,
        currentXp,
        totalXp,
        level,
        hunterRank,
        spiritualTitle,
      };
    });
  };

  const unlockBadge = (badgeCode: string) => {
    setBadges((prev) =>
      prev.map((b) => {
        if (b.code === badgeCode && !b.unlocked) {
          return {
            ...b,
            unlocked: true,
            unlockedAt: new Date().toISOString().split('T')[0],
          };
        }
        return b;
      })
    );
  };

  // Quests Actions
  const handleCompleteQuest = (questId: string, note?: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.completedToday) return;

    playSystemSound('quest_complete');

    // Update quest state
    const updatedQuests = quests.map((q) =>
      q.id === questId ? { ...q, completedToday: true } : q
    );
    setQuests(updatedQuests);

    // Update user stats
    setUser((prev) => {
      const next = { ...prev };
      if (quest.statType === 'prayer_minutes') {
        next.prayerMinutesToday += quest.statIncrement;
      } else if (quest.statType === 'bible_chapters') {
        next.bibleChaptersToday += quest.statIncrement;
      } else if (quest.statType === 'vice_streak') {
        next.generalViceStreak += quest.statIncrement;
      }
      return next;
    });

    // Add XP
    addXp(quest.xpReward, quest.title);

    // Log daily activity for weekly spiritual reports
    logDailyActivity({
      questsCompleted: 1,
      xpGained: quest.xpReward,
      prayerMinutes: quest.statType === 'prayer_minutes' ? quest.statIncrement : 0,
      bibleChapters: quest.statType === 'bible_chapters' ? quest.statIncrement : 0,
    });

    // Unlock first quest badge if not already
    unlockBadge('first_quest');

    // Check if all daily quests are completed
    const allDone = updatedQuests.filter((q) => q.isDaily).every((q) => q.completedToday);
    if (allDone) {
      addXp(100, 'Bonus Toutes Quêtes du Jour');
      setSystemAlert({
        isOpen: true,
        title: 'JOURNÉE SPIRITUELLE VALIDÉE !',
        message:
          'Félicitations Chasseur ! Vous avez accompli toutes les quêtes quotidiennes avec fidélité. Le Seigneur récompense votre constance.',
        rewardText: `+${quest.xpReward} XP de Quête + 100 XP Bonus de Fidélité`,
        type: 'victory',
      });
    } else {
      setSystemAlert({
        isOpen: true,
        title: 'QUÊTE ACCOMPLIE AVEC SUCCÈS',
        message: `Vous avez validé « ${quest.title} ». Votre discipline spirituelle édifie votre homme intérieur.`,
        rewardText: `+${quest.xpReward} XP Spirituelle`,
        type: 'quest',
      });
    }
  };

  const handleResetDailyQuests = () => {
    setQuests((prev) => prev.map((q) => ({ ...q, completedToday: false })));
    setSystemAlert({
      isOpen: true,
      title: 'NOUVELLE JOURNÉE DE COMBAT',
      message: 'Les quêtes quotidiennes ont été réinitialisées pour un nouveau cycle de gloire.',
      type: 'info',
    });
  };

  // Stat Direct Increment
  const handleIncrementStat = (type: 'prayer' | 'bible', amount: number) => {
    playSystemSound('click');
    setUser((prev) => ({
      ...prev,
      prayerMinutesToday:
        type === 'prayer' ? prev.prayerMinutesToday + amount : prev.prayerMinutesToday,
      bibleChaptersToday:
        type === 'bible' ? prev.bibleChaptersToday + amount : prev.bibleChaptersToday,
    }));
    addXp(amount * 5, type === 'prayer' ? 'Temps de prière' : 'Lecture biblique');
    logDailyActivity(
      type === 'prayer'
        ? { prayerMinutes: amount, xpGained: amount * 5 }
        : { bibleChapters: amount, xpGained: amount * 5 }
    );
  };

  // Shadow Army / Vices Actions
  const handleResistVice = (viceId: string) => {
    const targetVice = vices.find((v) => v.id === viceId);
    if (!targetVice) return;

    const newHp = Math.max(0, targetVice.currentHp - 15);
    const newStreak = targetVice.streak + 1;
    const isNowExtracted = newHp === 0;

    setVices((prev) =>
      prev.map((v) => {
        if (v.id === viceId) {
          return {
            ...v,
            currentHp: newHp,
            streak: newStreak,
            extracted: isNowExtracted || v.extracted,
          };
        }
        return v;
      })
    );

    addXp(50, `Résistance : ${targetVice.name}`);

    if (isNowExtracted && !targetVice.extracted) {
      playSystemSound('extract');
      unlockBadge('shadow_extractor');
      setSystemAlert({
        isOpen: true,
        title: 'ARISE ! OMBRE ASSUJETTIE & PURIFIÉE',
        message: `Par la foi et l'épée de l'Esprit, vous avez réduit à néant « ${targetVice.bossTitle} ». Ce vice ne règne plus sur vous en Christ !`,
        rewardText: '+200 XP Majeure & Titre Débloqué',
        type: 'victory',
      });
      addXp(200, 'Extraction de l’Ombre');
    } else {
      setSystemAlert({
        isOpen: true,
        title: 'COUP D’ÉPÉE PORTÉ À L’ENNEMI',
        message: `Vous avez refusé le compromis avec « ${targetVice.name} ». Le boss perd 15 PV ! Votre streak passe à ${newStreak} jours.`,
        rewardText: '+50 XP Spirituelle',
        type: 'quest',
      });
    }
  };

  const handleRelapseVice = (viceId: string) => {
    playSystemSound('click');
    setVices((prev) =>
      prev.map((v) => {
        if (v.id === viceId) {
          return { ...v, currentHp: 100, streak: 0 };
        }
        return v;
      })
    );
    setSystemAlert({
      isOpen: true,
      title: 'RELEVÉ PAR LA GRÂCE DIVINE',
      message:
        'Le juste tombe sept fois et se relève (Proverbes 24:16). Aucun jugement ne pèse sur vous. Reprenez votre épée et marchez dans la victoire de la croix.',
      type: 'warning',
    });
  };

  // Skill Tree Unlock Action
  const handleUnlockSkill = (skillId: string) => {
    const targetSkill = skills.find((s) => s.id === skillId);
    if (!targetSkill) return;

    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, unlocked: true } : s))
    );

    setUser((prev) => ({
      ...prev,
      spiritualTitle: targetSkill.titleUnlocked,
    }));

    setSystemAlert({
      isOpen: true,
      title: 'NOUVEAU DON SPIRITUEL DÉBLOQUÉ',
      message: `Vous avez manifesté « ${targetSkill.name} ». Votre nouveau titre d'autorité est désormais : « ${targetSkill.titleUnlocked} ».`,
      rewardText: `Titre « ${targetSkill.titleUnlocked} » activé`,
      type: 'victory',
    });
  };

  // Dungeon Breaks Actions
  const handleStartDungeon = (dungeonId: string) => {
    setDungeons((prev) =>
      prev.map((d) => (d.id === dungeonId ? { ...d, active: true, currentDay: 1 } : d))
    );
    const dg = dungeons.find((d) => d.id === dungeonId);
    setSystemAlert({
      isOpen: true,
      title: 'PORTAIL SPIRITUEL OUVERT',
      message: `Vous êtes entré dans le portail « ${dg?.name} ». Tenez bon dans la consécration !`,
      type: 'info',
    });
  };

  const handleAdvanceDungeonDay = (dungeonId: string) => {
    const dg = dungeons.find((d) => d.id === dungeonId);
    if (!dg) return;

    const nextDay = dg.currentDay + 1;
    const isCompleted = nextDay >= dg.durationDays;

    setDungeons((prev) =>
      prev.map((d) => {
        if (d.id === dungeonId) {
          return {
            ...d,
            currentDay: nextDay,
            completed: isCompleted,
            active: !isCompleted,
          };
        }
        return d;
      })
    );

    if (isCompleted) {
      playSystemSound('level_up');
      addXp(dg.xpReward, `Donjon Conquis: ${dg.name}`);
      unlockBadge('unshakable');
      setSystemAlert({
        isOpen: true,
        title: 'DONJON SPIRITUEL ENTIÈREMENT CONQUIS !',
        message: `Gloire à Dieu ! Vous avez terminé les ${dg.durationDays} jours de « ${dg.name} ».`,
        rewardText: `+${dg.xpReward} XP & Badge « ${dg.badgeReward} »`,
        type: 'victory',
      });
    } else {
      addXp(50, `Jour de Donjon`);
      setSystemAlert({
        isOpen: true,
        title: `JOUR ${nextDay} DU PORTAIL VALIDÉ`,
        message: `Plus que ${dg.durationDays - nextDay} jours pour sceller la victoire complète !`,
        rewardText: '+50 XP Spirituelle',
        type: 'quest',
      });
    }
  };

  // Inventory Action
  const handleAddItem = (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: 'inv_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setInventory((prev) => [newItem, ...prev]);
    addXp(30, 'Nouvelle arme de foi forgée');
    unlockBadge('word_carrier');
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleReciteInventoryItem = (itemId: string) => {
    addXp(15, 'Récitation de verset Rhema');
  };

  // Custom Quest Handlers
  const handleAddQuest = (questData: Omit<Quest, 'id' | 'completedToday'>) => {
    const newQuest: Quest = {
      ...questData,
      id: 'quest_custom_' + Date.now(),
      completedToday: false,
    };
    setQuests((prev) => [newQuest, ...prev]);
    setSystemAlert({
      isOpen: true,
      title: 'DIRECTIVE ENREGISTRÉE',
      message: `La quête « ${newQuest.title} » a été ajoutée à votre protocole quotidien.`,
      type: 'info',
    });
  };

  const handleDeleteQuest = (questId: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== questId));
  };

  // Custom Vice / Boss Handlers
  const handleAddVice = (viceData: Omit<Vice, 'id' | 'streak' | 'extracted'>) => {
    const newVice: Vice = {
      ...viceData,
      id: 'vice_custom_' + Date.now(),
      streak: 0,
      extracted: false,
    };
    setVices((prev) => [newVice, ...prev]);
    setSystemAlert({
      isOpen: true,
      title: 'COMBAT SPIRITUEL DÉCLARÉ',
      message: `Le combat contre « ${newVice.name} » (${newVice.bossTitle}) est engagé. Revêtez toutes les armes de Dieu !`,
      type: 'warning',
    });
  };

  const handleDeleteVice = (viceId: string) => {
    setVices((prev) => prev.filter((v) => v.id !== viceId));
  };

  // Prayer Altar / Secret Place Timer Handler
  const handleLogPrayerMinutes = (minutes: number) => {
    setUser((prev) => ({
      ...prev,
      prayerMinutesToday: prev.prayerMinutesToday + minutes,
    }));
    addXp(minutes * 5, 'Consécration au Lieu Secret');
    logDailyActivity({ prayerMinutes: minutes, xpGained: minutes * 5 });
    unlockBadge('prayer_warrior');
    setSystemAlert({
      isOpen: true,
      title: 'INTERCESSION AU LIEU SECRET VALIDÉE',
      message: `Vous avez passé ${minutes} minutes dans la présence du Seigneur. Votre consécration a été enregistrée au ciel !`,
      rewardText: `+${minutes * 5} XP Spirituelle`,
      type: 'victory',
    });
  };

  // Reset to Default Hunter State
  const handleResetData = () => {
    setUser(INITIAL_USER);
    setQuests(INITIAL_QUESTS);
    setVices(INITIAL_VICES);
    setSkills(INITIAL_SKILLS);
    setDungeons(INITIAL_DUNGEONS);
    setBadges(INITIAL_BADGES);
    setInventory(INITIAL_INVENTORY);
    setSystemAlert({
      isOpen: true,
      title: 'DONNÉES INITIALISÉES',
      message: 'Le profil du Chasseur a été réinitialisé aux statistiques initiales de rang de départ.',
      type: 'info',
    });
  };

  const uncompletedQuestsCount = quests.filter((q) => q.isDaily && !q.completedToday).length;

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Header HUD with Cloud Sync & Auth status */}
      <Header
        user={user}
        settings={settings}
        firebaseUser={firebaseUser}
        isCloudSyncing={isCloudSyncing}
        reminderSettings={reminderSettings}
        onOpenReminderModal={() => setIsReminderModalOpen(true)}
        onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
        isSimulatedSunday={isSimulatedSunday}
        onAudioToggled={() => {}}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onQuickToggleTheme={handleQuickToggleTheme}
        onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        activeTab={activeTab}
      />

      {/* Navigation Bars */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        uncompletedQuestsCount={uncompletedQuestsCount}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 pb-32 lg:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            quests={quests}
            dungeons={dungeons}
            dailyVerse={DAILY_VERSES[0]}
            onNavigate={setActiveTab}
            onIncrementStat={handleIncrementStat}
            onCompleteQuest={handleCompleteQuest}
            onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
            onOpenPrayerAltar={() => setIsPrayerAltarOpen(true)}
            reminderSettings={reminderSettings}
            onOpenReminderModal={() => setIsReminderModalOpen(true)}
            onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
            isSimulatedSunday={isSimulatedSunday}
            onToggleSimulateSunday={() => setIsSimulatedSunday((prev) => !prev)}
          />
        )}

        {activeTab === 'quests' && (
          <QuestsView
            quests={quests}
            onCompleteQuest={handleCompleteQuest}
            onResetDailyQuests={handleResetDailyQuests}
            onAddQuest={handleAddQuest}
            onDeleteQuest={handleDeleteQuest}
          />
        )}

        {activeTab === 'shadows' && (
          <ShadowArmyView
            vices={vices}
            onResistVice={handleResistVice}
            onRelapseVice={handleRelapseVice}
            onAddVice={handleAddVice}
            onDeleteVice={handleDeleteVice}
          />
        )}

        {activeTab === 'skills' && (
          <SkillTreeView
            skills={skills}
            user={user}
            onUnlockSkill={handleUnlockSkill}
          />
        )}

        {activeTab === 'dungeons' && (
          <DungeonBreaksView
            dungeons={dungeons}
            onStartDungeon={handleStartDungeon}
            onAdvanceDungeonDay={handleAdvanceDungeonDay}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            items={inventory}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteInventoryItem}
            onReciteItem={handleReciteInventoryItem}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            badges={badges}
            settings={settings}
            firebaseUser={firebaseUser}
            lastSyncedAt={lastSyncedAt}
            reminderSettings={reminderSettings}
            onOpenReminderModal={() => setIsReminderModalOpen(true)}
            onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
            onUpdateSettings={handleUpdateSettings}
            onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Prayer Altar / Secret Place Timer Modal */}
      <PrayerAltarModal
        isOpen={isPrayerAltarOpen}
        onClose={() => setIsPrayerAltarOpen(false)}
        onLogPrayerMinutes={handleLogPrayerMinutes}
      />

      {/* Duolingo-style Daily Streak Reminder Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        settings={reminderSettings}
        onUpdateSettings={handleUpdateReminderSettings}
        user={user}
        quests={quests}
        onTriggerInAppAlert={(title, message) => {
          setSystemAlert({
            isOpen: true,
            title,
            message,
            type: 'warning',
          });
        }}
      />

      {/* Sunday Weekly Spiritual Report Modal */}
      <WeeklySpiritualReport
        isOpen={isWeeklyReportOpen}
        onClose={() => setIsWeeklyReportOpen(false)}
        user={user}
        quests={quests}
        vices={vices}
        firebaseUser={firebaseUser}
        isSimulatedSunday={isSimulatedSunday}
        onSimulateSundayToggle={() => setIsSimulatedSunday((prev) => !prev)}
      />

      {/* System Alert Hologram Modal */}
      <SystemAlertModal
        isOpen={systemAlert.isOpen}
        title={systemAlert.title}
        message={systemAlert.message}
        rewardText={systemAlert.rewardText}
        type={systemAlert.type}
        onClose={() => setSystemAlert((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Level Up Golden Banner Modal */}
      <LevelUpModal
        isOpen={levelUpData.isOpen}
        newLevel={levelUpData.newLevel}
        newRank={levelUpData.newRank}
        newTitle={levelUpData.newTitle}
        onClose={() => setLevelUpData((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Appearance Settings (Theme & Typography) Modal */}
      <AppearanceSettingsModal
        isOpen={isSettingsModalOpen}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Profile Photo & Hunter Identity Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        user={user}
        onSaveAvatar={handleSaveAvatar}
        onClose={() => setIsPhotoModalOpen(false)}
      />

      {/* Hunter Account & Authentication Space Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={firebaseUser}
        hunterUser={user}
        quests={quests}
        vices={vices}
        skills={skills}
        dungeons={dungeons}
        badges={badges}
        inventory={inventory}
        settings={settings}
        lastSyncedAt={lastSyncedAt}
        onSyncSuccess={() => {
          const now = new Date().toISOString();
          setLastSyncedAt(now);
          setStored('last_cloud_sync', now);
        }}
        onUpdatePseudo={(newPseudo) => {
          setUser((prev) => ({ ...prev, name: newPseudo }));
        }}
      />

      {/* Adaptive Melodies Sound Player for Youth / Solo Leveling Quests */}
      <MelodyPlayerWidget currentTab={activeTab} />
    </div>
  );
};

export default App;
