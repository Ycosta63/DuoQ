import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      bio TEXT,
      games TEXT,
      playstyle TEXT,
      relation_mode TEXT,
      discord_username TEXT,
      is_premium INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS swipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      swiper_id TEXT,
      target_id TEXT,
      type TEXT, -- 'GG', 'FF', 'GOAT'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(swiper_id, target_id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      user1_id TEXT,
      user2_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user1_id, user2_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      match_id TEXT,
      sender_id TEXT,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    // Basic migration for existing databases
    await dbInstance.exec(`ALTER TABLE users ADD COLUMN password TEXT`);
  } catch (e) {
    // Column likely already exists
  }

  return dbInstance;
}
