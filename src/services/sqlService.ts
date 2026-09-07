import { HunterUser, Quest, Vice, Skill, InventoryItem } from '../types';

export interface SqlDatabaseStatus {
  status: string;
  engine: string;
  databaseFile: string;
  tables: string[];
  tableCounts: Record<string, number>;
  timestamp: string;
}

export interface SqlUserRecord {
  id: string;
  email: string;
  name: string;
  spiritual_title: string;
  hunter_rank: string;
  level: number;
  current_xp: number;
  total_xp: number;
  prayer_minutes_today: number;
  bible_chapters_today: number;
  general_vice_streak: number;
  created_at: string;
  updated_at: string;
}

export interface SqlQueryResult {
  success: boolean;
  columns?: string[];
  rows?: Record<string, any>[];
  count?: number;
  error?: string;
}

/**
 * Fetch SQLite database status and table metrics from the backend
 */
export async function fetchSqlStatus(): Promise<SqlDatabaseStatus> {
  const res = await fetch('/api/sql/status');
  if (!res.ok) {
    throw new Error('Impossible de contacter le serveur SQL backend.');
  }
  return await res.json();
}

/**
 * Register user in the relational SQL database
 */
export async function registerWithSql(email: string, password: string, name?: string) {
  const res = await fetch('/api/sql/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Échec de l\'inscription dans la base SQL.');
  }
  return data;
}

/**
 * Login user directly from the SQL database
 */
export async function loginWithSql(email: string, password: string) {
  const res = await fetch('/api/sql/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Identifiants SQL incorrects.');
  }
  return data;
}

/**
 * Sync entire player state into SQL relational tables
 */
export async function syncWithSql(payload: {
  user: HunterUser;
  quests: Quest[];
  vices: Vice[];
  skills: Skill[];
  inventory: InventoryItem[];
}) {
  const res = await fetch('/api/sql/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors de la synchronisation SQL.');
  }
  return data;
}

/**
 * List all users stored in the SQL database
 */
export async function fetchSqlUsers(): Promise<{ users: SqlUserRecord[]; count: number }> {
  const res = await fetch('/api/sql/users');
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors de la récupération des utilisateurs SQL.');
  }
  return data;
}

/**
 * Execute raw SQL query from the frontend admin / studio console
 */
export async function executeRawSql(sql: string): Promise<SqlQueryResult> {
  const res = await fetch('/api/sql/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql }),
  });
  const data = await res.json();
  return data;
}
