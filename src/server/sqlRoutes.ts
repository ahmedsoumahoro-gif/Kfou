import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import {
  getSqlDatabase,
  saveDatabaseToDisk,
  executeSqlQuery,
  exportSqlScript,
} from './sqlDatabase.js';

export const sqlRouter = Router();

// Test connection & table status
sqlRouter.get('/status', async (req, res) => {
  try {
    const db = await getSqlDatabase();
    const tablesRes = db.exec(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `);
    const tables: string[] = tablesRes.length > 0 ? tablesRes[0].values.map((v) => v[0] as string) : [];

    // Get count for each table
    const tableCounts: Record<string, number> = {};
    for (const t of tables) {
      const countRes = db.exec(`SELECT COUNT(*) FROM ${t};`);
      tableCounts[t] = countRes.length > 0 ? (countRes[0].values[0][0] as number) : 0;
    }

    res.json({
      status: 'ok',
      engine: 'SQLite 3 (Relational SQL)',
      databaseFile: 'data/bloomverse.sqlite',
      tables,
      tableCounts,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Register user directly into SQL
sqlRouter.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis pour la base SQL.' });
    }

    const db = await getSqlDatabase();

    // Check if user already exists
    const checkRes = db.exec('SELECT id FROM users WHERE email = ?;', [email.trim().toLowerCase()]);
    if (checkRes.length > 0 && checkRes[0].values.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà enregistré dans la base SQL.' });
    }

    const userId = `sql_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const hunterName = name && name.trim().length > 0 ? name.trim() : email.split('@')[0];

    db.run(
      `INSERT INTO users (
        id, email, password, name, spiritual_title, hunter_rank, avatar, conversion_date,
        level, current_xp, total_xp, prayer_minutes_today, bible_chapters_today,
        fasting_days_streak, general_vice_streak, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        userId,
        email.trim().toLowerCase(),
        password,
        hunterName,
        'Novice de la Grâce',
        'Rang E',
        '',
        now,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        now,
        now,
      ]
    );

    saveDatabaseToDisk();

    res.json({
      success: true,
      message: 'Utilisateur SQL créé avec succès.',
      user: {
        id: userId,
        email: email.trim().toLowerCase(),
        name: hunterName,
        spiritualTitle: 'Novice de la Grâce',
        hunterRank: 'Rang E',
        avatar: '',
        conversionDate: now,
        level: 1,
        currentXp: 0,
        totalXp: 0,
        prayerMinutesToday: 0,
        bibleChaptersToday: 0,
        fastingDaysStreak: 0,
        generalViceStreak: 0,
      },
    });
  } catch (error: any) {
    console.error('SQL Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login user directly from SQL
sqlRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const db = await getSqlDatabase();
    const resUser = db.exec('SELECT * FROM users WHERE email = ? AND password = ?;', [
      email.trim().toLowerCase(),
      password,
    ]);

    if (!resUser || resUser.length === 0 || resUser[0].values.length === 0) {
      return res.status(401).json({ error: 'Identifiants SQL incorrects. Vérifiez votre email ou mot de passe.' });
    }

    const columns = resUser[0].columns;
    const values = resUser[0].values[0];
    const userRow: Record<string, any> = {};
    columns.forEach((c, idx) => {
      userRow[c] = values[idx];
    });

    // Fetch relational user data
    const questsRes = db.exec('SELECT * FROM quests WHERE user_id = ?;', [userRow.id]);
    const vicesRes = db.exec('SELECT * FROM vices WHERE user_id = ?;', [userRow.id]);
    const skillsRes = db.exec('SELECT * FROM skills WHERE user_id = ?;', [userRow.id]);
    const inventoryRes = db.exec('SELECT * FROM inventory WHERE user_id = ?;', [userRow.id]);

    const formatRows = (r: any[]) => {
      if (!r || r.length === 0) return [];
      const cols = r[0].columns;
      return r[0].values.map((valArr: any[]) => {
        const obj: Record<string, any> = {};
        cols.forEach((col: string, i: number) => {
          obj[col] = valArr[i];
        });
        return obj;
      });
    };

    res.json({
      success: true,
      user: {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        spiritualTitle: userRow.spiritual_title,
        hunterRank: userRow.hunter_rank,
        avatar: userRow.avatar,
        conversionDate: userRow.conversion_date,
        level: userRow.level,
        currentXp: userRow.current_xp,
        totalXp: userRow.total_xp,
        prayerMinutesToday: userRow.prayer_minutes_today,
        bibleChaptersToday: userRow.bible_chapters_today,
        fastingDaysStreak: userRow.fasting_days_streak,
        generalViceStreak: userRow.general_vice_streak,
      },
      quests: formatRows(questsRes),
      vices: formatRows(vicesRes),
      skills: formatRows(skillsRes),
      inventory: formatRows(inventoryRes),
    });
  } catch (error: any) {
    console.error('SQL Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync / Save full user state into SQL relational tables
sqlRouter.post('/sync', async (req, res) => {
  try {
    const { user, quests, vices, skills, inventory, weeklyReports } = req.body;
    if (!user || !user.id) {
      return res.status(400).json({ error: 'Données utilisateur invalides pour la synchronisation SQL.' });
    }

    const db = await getSqlDatabase();
    const now = new Date().toISOString();

    // Upsert User
    db.run(
      `INSERT INTO users (
        id, email, password, name, spiritual_title, hunter_rank, avatar, conversion_date,
        level, current_xp, total_xp, prayer_minutes_today, bible_chapters_today,
        fasting_days_streak, general_vice_streak, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        spiritual_title=excluded.spiritual_title,
        hunter_rank=excluded.hunter_rank,
        avatar=excluded.avatar,
        level=excluded.level,
        current_xp=excluded.current_xp,
        total_xp=excluded.total_xp,
        prayer_minutes_today=excluded.prayer_minutes_today,
        bible_chapters_today=excluded.bible_chapters_today,
        fasting_days_streak=excluded.fasting_days_streak,
        general_vice_streak=excluded.general_vice_streak,
        updated_at=excluded.updated_at;`,
      [
        user.id,
        user.email || `${user.id}@bloomverse.sql`,
        user.password || 'sql_pass_default',
        user.name || 'Disciple',
        user.spiritualTitle || 'Novice de la Grâce',
        user.hunterRank || 'Rang E',
        user.avatar || '',
        user.conversionDate || now,
        user.level || 1,
        user.currentXp || 0,
        user.totalXp || 0,
        user.prayerMinutesToday || 0,
        user.bibleChaptersToday || 0,
        user.fastingDaysStreak || 0,
        user.generalViceStreak || 0,
        now,
        now,
      ]
    );

    // Sync Quests
    if (Array.isArray(quests)) {
      for (const q of quests) {
        db.run(
          `INSERT INTO quests (
            id, user_id, title, category, xp_reward, icon, description, stat_type, stat_increment, is_daily, completed_today
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            title=excluded.title,
            category=excluded.category,
            xp_reward=excluded.xp_reward,
            completed_today=excluded.completed_today;`,
          [
            q.id,
            user.id,
            q.title,
            q.category,
            q.xpReward,
            q.icon || '',
            q.description || '',
            q.statType || 'general',
            q.statIncrement || 1,
            q.isDaily ? 1 : 0,
            q.completedToday ? 1 : 0,
          ]
        );
      }
    }

    // Sync Vices
    if (Array.isArray(vices)) {
      for (const v of vices) {
        db.run(
          `INSERT INTO vices (
            id, user_id, name, slug, boss_title, biblical_verse, verse_ref, current_hp, max_hp, streak, extracted, last_resisted_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            streak=excluded.streak,
            current_hp=excluded.current_hp,
            extracted=excluded.extracted,
            last_resisted_date=excluded.last_resisted_date;`,
          [
            v.id,
            user.id,
            v.name,
            v.slug || v.name.toLowerCase(),
            v.bossTitle || '',
            v.biblicalVerse || '',
            v.verseRef || '',
            v.currentHp || 0,
            v.maxHp || 100,
            v.streak || 0,
            v.extracted ? 1 : 0,
            v.lastResistedDate || null,
          ]
        );
      }
    }

    // Sync Inventory
    if (Array.isArray(inventory)) {
      for (const item of inventory) {
        db.run(
          `INSERT INTO inventory (
            id, user_id, name, type, verse_ref, biblical_text, power_level, recitations_count, obtained_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            power_level=excluded.power_level,
            recitations_count=excluded.recitations_count;`,
          [
            item.id,
            user.id,
            item.name,
            item.type || 'Épée de l\'Esprit',
            item.verseRef || '',
            item.biblicalText || '',
            item.powerLevel || 1,
            item.recitationsCount || 0,
            item.obtainedAt || now,
          ]
        );
      }
    }

    saveDatabaseToDisk();

    res.json({
      success: true,
      syncedAt: now,
      message: 'Données synchronisées dans la base SQL avec succès.',
    });
  } catch (error: any) {
    console.error('SQL Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all registered users in the SQL database
sqlRouter.get('/users', async (req, res) => {
  try {
    const db = await getSqlDatabase();
    const result = db.exec(`
      SELECT id, email, name, spiritual_title, hunter_rank, level, current_xp, total_xp,
             prayer_minutes_today, bible_chapters_today, general_vice_streak, created_at, updated_at
      FROM users ORDER BY updated_at DESC;
    `);

    if (!result || result.length === 0) {
      return res.json({ users: [], count: 0 });
    }

    const cols = result[0].columns;
    const users = result[0].values.map((vals) => {
      const obj: Record<string, any> = {};
      cols.forEach((col, idx) => {
        obj[col] = vals[idx];
      });
      return obj;
    });

    res.json({ users, count: users.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Run arbitrary SQL query (for the in-app SQL Studio & admin console)
sqlRouter.post('/query', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ error: 'La requête SQL est obligatoire.' });
    }

    const { columns, rows, count } = await executeSqlQuery(sql);
    res.json({ success: true, columns, rows, count });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Export database as .sql script file
sqlRouter.get('/export/sql', async (req, res) => {
  try {
    const sqlDump = await exportSqlScript();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bloomverse_database.sql"');
    res.send(sqlDump);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export binary .sqlite database file
sqlRouter.get('/export/sqlite', async (req, res) => {
  try {
    const db = await getSqlDatabase();
    const data = db.export();
    const buffer = Buffer.from(data);
    res.setHeader('Content-Type', 'application/x-sqlite3');
    res.setHeader('Content-Disposition', 'attachment; filename="bloomverse.sqlite"');
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
