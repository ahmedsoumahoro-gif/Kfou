import fs from 'fs';
import path from 'path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;
let dbInstance: Database | null = null;

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'bloomverse.sqlite');

/**
 * Persist in-memory SQLite database to disk
 */
export function saveDatabaseToDisk(): void {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const binaryArray = dbInstance.export();
    fs.writeFileSync(DB_PATH, Buffer.from(binaryArray));
  } catch (err) {
    console.error('Failed to save SQLite database to disk:', err);
  }
}

/**
 * Initialize the SQLite database and create relational tables
 */
export async function getSqlDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  if (!SQL) {
    SQL = await initSqlJs();
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn('Could not read existing SQLite DB, creating fresh one:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Create relational schema
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      spiritual_title TEXT DEFAULT 'Novice de la Grâce',
      hunter_rank TEXT DEFAULT 'Rang E',
      avatar TEXT DEFAULT '',
      conversion_date TEXT,
      level INTEGER DEFAULT 1,
      current_xp INTEGER DEFAULT 0,
      total_xp INTEGER DEFAULT 0,
      prayer_minutes_today INTEGER DEFAULT 0,
      bible_chapters_today INTEGER DEFAULT 0,
      fasting_days_streak INTEGER DEFAULT 0,
      general_vice_streak INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      xp_reward INTEGER NOT NULL,
      icon TEXT,
      description TEXT,
      stat_type TEXT,
      stat_increment INTEGER,
      is_daily INTEGER DEFAULT 1,
      completed_today INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      boss_title TEXT,
      biblical_verse TEXT,
      verse_ref TEXT,
      current_hp INTEGER DEFAULT 0,
      max_hp INTEGER DEFAULT 100,
      streak INTEGER DEFAULT 0,
      extracted INTEGER DEFAULT 0,
      last_resisted_date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      code TEXT NOT NULL,
      branch TEXT NOT NULL,
      name TEXT NOT NULL,
      tier INTEGER DEFAULT 1,
      xp_required INTEGER DEFAULT 100,
      title_unlocked TEXT,
      unlocked INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      verse_ref TEXT,
      biblical_text TEXT,
      power_level INTEGER DEFAULT 1,
      recitations_count INTEGER DEFAULT 0,
      obtained_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS weekly_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      year INTEGER NOT NULL,
      total_prayer_minutes INTEGER DEFAULT 0,
      total_chapters_read INTEGER DEFAULT 0,
      days_vice_free INTEGER DEFAULT 0,
      quests_completed INTEGER DEFAULT 0,
      report_summary TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sql_query_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      executed_at TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `;

  dbInstance.run(schemaSql);
  saveDatabaseToDisk();

  return dbInstance;
}

/**
 * Execute raw SQL query safely and return columns and row objects
 */
export async function executeSqlQuery(sql: string): Promise<{ columns: string[]; rows: any[]; count: number }> {
  const db = await getSqlDatabase();
  const trimmed = sql.trim();

  try {
    const res = db.exec(trimmed);
    
    // Log the query
    try {
      db.run('INSERT INTO sql_query_logs (query, executed_at, status) VALUES (?, ?, ?);', [
        trimmed,
        new Date().toISOString(),
        'SUCCESS',
      ]);
    } catch {
      // ignore logging error
    }

    saveDatabaseToDisk();

    if (!res || res.length === 0) {
      return { columns: [], rows: [], count: 0 };
    }

    const first = res[0];
    const columns = first.columns;
    const rows = first.values.map((valArray) => {
      const obj: Record<string, any> = {};
      columns.forEach((col, idx) => {
        obj[col] = valArray[idx];
      });
      return obj;
    });

    return { columns, rows, count: rows.length };
  } catch (error: any) {
    try {
      db.run('INSERT INTO sql_query_logs (query, executed_at, status) VALUES (?, ?, ?);', [
        trimmed,
        new Date().toISOString(),
        `ERROR: ${error.message}`,
      ]);
      saveDatabaseToDisk();
    } catch {
      // ignore
    }
    throw error;
  }
}

/**
 * Export full SQL dump script (.sql)
 */
export async function exportSqlScript(): Promise<string> {
  const db = await getSqlDatabase();
  const tables = ['users', 'quests', 'vices', 'skills', 'inventory', 'weekly_reports', 'sql_query_logs'];
  let sqlDump = `-- ========================================================\n`;
  sqlDump += `-- BloomVerse SQL Relational Database Dump\n`;
  sqlDump += `-- Export Date: ${new Date().toISOString()}\n`;
  sqlDump += `-- Engine: SQLite 3 / SQL Relational Schema\n`;
  sqlDump += `-- ========================================================\n\n`;

  for (const table of tables) {
    sqlDump += `--\n-- Table structure & data for '${table}'\n--\n`;
    try {
      const res = db.exec(`SELECT * FROM ${table};`);
      if (res && res.length > 0) {
        const { columns, values } = res[0];
        for (const row of values) {
          const formattedVals = row.map((v) => {
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'number') return v;
            return `'${String(v).replace(/'/g, "''")}'`;
          });
          sqlDump += `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${formattedVals.join(', ')});\n`;
        }
      }
    } catch (err) {
      sqlDump += `-- Could not export table ${table}: ${err}\n`;
    }
    sqlDump += `\n`;
  }

  return sqlDump;
}
