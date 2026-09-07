import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  HunterUser,
  Quest,
  Vice,
  Skill,
  DungeonBreak,
  Badge,
  InventoryItem,
  AppearanceSettings,
  WeeklySpiritualReportData,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Firestore must be initialized with firebaseConfig.firestoreDatabaseId as specified in skill guidelines
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Auth Provider configured for Hunter login
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Test connection on boot as requested by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: Client is offline or initializing.');
    }
    return false;
  }
}

// Global Firestore Error Handler
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface HunterSavePayload {
  user: HunterUser;
  quests: Quest[];
  vices: Vice[];
  skills: Skill[];
  dungeons: DungeonBreak[];
  badges: Badge[];
  inventory: InventoryItem[];
  appearance?: AppearanceSettings;
  lastSyncedAt?: string;
}

// Sign in with Google Popup (optionally binding the chosen Hunter pseudo)
export async function loginWithGoogle(preferredPseudo?: string): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (preferredPseudo && preferredPseudo.trim()) {
      await updateProfile(result.user, {
        displayName: preferredPseudo.trim(),
      });
    }
    return result.user;
  } catch (err: unknown) {
    console.error('Login error:', err);
    throw err;
  }
}

// Quick Hunter Pseudo Sign In (Anonymous Firebase Auth with custom Hunter Pseudo)
export async function loginWithHunterPseudo(pseudo: string): Promise<FirebaseUser> {
  try {
    const cleanPseudo = pseudo.trim() || 'Chasseur Novice';
    const userCredential = await signInAnonymously(auth);
    await updateProfile(userCredential.user, {
      displayName: cleanPseudo,
    });
    return userCredential.user;
  } catch (err: unknown) {
    console.error('Pseudo login error:', err);
    throw err;
  }
}

// Sign up with Email, Password and Hunter Pseudo
export async function signUpWithEmail(
  email: string,
  pass: string,
  pseudo: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (pseudo.trim()) {
      await updateProfile(userCredential.user, {
        displayName: pseudo.trim(),
      });
    }
    return userCredential.user;
  } catch (err: unknown) {
    console.error('Sign up error:', err);
    throw err;
  }
}

// Sign in with Email and Password
export async function signInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (err: unknown) {
    console.error('Email sign in error:', err);
    throw err;
  }
}

// Update current Hunter Pseudo / displayName
export async function updateHunterDisplayName(pseudo: string): Promise<void> {
  if (auth.currentUser && pseudo.trim()) {
    await updateProfile(auth.currentUser, {
      displayName: pseudo.trim(),
    });
  }
}

// Send Password Reset Email
export async function resetHunterPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// Sign out Hunter
export async function logoutHunter(): Promise<void> {
  await signOut(auth);
}

/**
 * Recursively sanitizes objects and arrays for Firestore.
 * Firestore throws a runtime error if ANY property is `undefined`.
 * This function:
 * - Omits keys whose value is undefined.
 * - Deeply cleans nested objects and arrays.
 * - Leaves null, numbers, strings, and booleans intact.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => cleanForFirestore(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = cleanForFirestore(value);
    }
  }
  return result as T;
}

// Save or sync complete Hunter progress to Firestore /users/{userId}
export async function saveHunterToCloud(
  userId: string,
  payload: HunterSavePayload
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const dataToSave = {
      id: userId,
      name: (payload.user?.name || 'Chasseur Novice').slice(0, 100),
      email: (payload.user?.email || '').slice(0, 150),
      spiritualTitle: (payload.user?.spiritualTitle || 'Novice de la Grâce').slice(0, 100),
      hunterRank: (payload.user?.hunterRank || 'Rang E').slice(0, 50),
      avatar: payload.user?.avatar || 'shadow_monarch_cross',
      conversionDate: payload.user?.conversionDate || new Date().toISOString().split('T')[0],
      level: Number(payload.user?.level) || 1,
      currentXp: Number(payload.user?.currentXp) || 0,
      totalXp: Number(payload.user?.totalXp) || 0,
      prayerMinutesToday: Number(payload.user?.prayerMinutesToday) || 0,
      bibleChaptersToday: Number(payload.user?.bibleChaptersToday) || 0,
      fastingDaysStreak: Number(payload.user?.fastingDaysStreak) || 0,
      generalViceStreak: Number(payload.user?.generalViceStreak) || 0,
      quests: payload.quests || [],
      vices: payload.vices || [],
      skills: payload.skills || [],
      dungeons: payload.dungeons || [],
      badges: payload.badges || [],
      inventory: payload.inventory || [],
      appearance: payload.appearance || {},
      updatedAt: new Date().toISOString(),
    };

    const sanitizedData = cleanForFirestore(dataToSave);
    await setDoc(docRef, sanitizedData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load Hunter progression from Firestore
export async function fetchHunterFromCloud(
  userId: string
): Promise<HunterSavePayload | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return {
      user: {
        id: data.id || userId,
        name: data.name,
        email: data.email,
        spiritualTitle: data.spiritualTitle || 'Initié de la Foi',
        hunterRank: data.hunterRank || 'Rang E',
        avatar: data.avatar || '',
        conversionDate: data.conversionDate || new Date().toISOString().split('T')[0],
        level: data.level || 1,
        currentXp: data.currentXp || 0,
        totalXp: data.totalXp || 0,
        prayerMinutesToday: data.prayerMinutesToday || 0,
        bibleChaptersToday: data.bibleChaptersToday || 0,
        fastingDaysStreak: data.fastingDaysStreak || 0,
        generalViceStreak: data.generalViceStreak || 0,
      },
      quests: data.quests || [],
      vices: data.vices || [],
      skills: data.skills || [],
      dungeons: data.dungeons || [],
      badges: data.badges || [],
      inventory: data.inventory || [],
      appearance: data.appearance,
      lastSyncedAt: data.updatedAt,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Subscribe to real-time updates for the Hunter's cloud record
export function subscribeToHunterDoc(
  userId: string,
  onData: (payload: HunterSavePayload) => void
): () => void {
  const path = `users/${userId}`;
  const docRef = doc(db, 'users', userId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onData({
          user: {
            id: data.id || userId,
            name: data.name,
            email: data.email,
            spiritualTitle: data.spiritualTitle || 'Initié de la Foi',
            hunterRank: data.hunterRank || 'Rang E',
            avatar: data.avatar || '',
            conversionDate: data.conversionDate || new Date().toISOString().split('T')[0],
            level: data.level || 1,
            currentXp: data.currentXp || 0,
            totalXp: data.totalXp || 0,
            prayerMinutesToday: data.prayerMinutesToday || 0,
            bibleChaptersToday: data.bibleChaptersToday || 0,
            fastingDaysStreak: data.fastingDaysStreak || 0,
            generalViceStreak: data.generalViceStreak || 0,
          },
          quests: data.quests || [],
          vices: data.vices || [],
          skills: data.skills || [],
          dungeons: data.dungeons || [],
          badges: data.badges || [],
          inventory: data.inventory || [],
          appearance: data.appearance,
          lastSyncedAt: data.updatedAt,
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Helper to observe Auth State
export function onHunterAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Save Sunday Weekly Report to Cloud: /users/{userId}/weeklyReports/{reportId}
export async function saveWeeklyReportToCloud(
  userId: string,
  report: WeeklySpiritualReportData
): Promise<void> {
  const path = `users/${userId}/weeklyReports/${report.id}`;
  try {
    const reportRef = doc(db, 'users', userId, 'weeklyReports', report.id);
    const reportData = cleanForFirestore({
      ...report,
      savedAt: new Date().toISOString(),
    });
    await setDoc(reportRef, reportData);

    // Also update current active user doc with latest weekly report reference
    const userRef = doc(db, 'users', userId);
    const userUpdate = cleanForFirestore({
      latestWeeklyReport: {
        id: report.id,
        weekNumber: report.weekNumber,
        year: report.year,
        weeklyGrade: report.weeklyGrade,
        weeklyEvaluationTitle: report.weeklyEvaluationTitle,
        totalPrayerMinutes: report.totalPrayerMinutes,
        totalQuestsCompleted: report.totalQuestsCompleted,
        totalXpGained: report.totalXpGained,
        generatedAt: report.generatedAt,
      },
      updatedAt: new Date().toISOString(),
    });
    await setDoc(userRef, userUpdate, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch all Sunday Weekly Reports from Cloud
export async function fetchWeeklyReportsFromCloud(
  userId: string
): Promise<WeeklySpiritualReportData[]> {
  const path = `users/${userId}/weeklyReports`;
  try {
    const reportsColl = collection(db, 'users', userId, 'weeklyReports');
    const q = query(reportsColl, orderBy('weekNumber', 'desc'));
    const snap = await getDocs(q);
    const reports: WeeklySpiritualReportData[] = [];
    snap.forEach((docSnap) => {
      reports.push(docSnap.data() as WeeklySpiritualReportData);
    });
    return reports;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

