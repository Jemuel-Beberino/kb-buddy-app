// database/db.js
import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export async function getDatabase() {
  if (dbInstance) return dbInstance;

  console.log('🔧 Initializing database...');

  if (typeof SQLite.openDatabaseAsync !== 'function') {
    throw new Error('expo-sqlite is not properly installed.');
  }

  // UPGRADED TO V4
  dbInstance = await SQLite.openDatabaseAsync('kbbuddy_v4.db');
  console.log('🔧 Database opened');

  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learner_id TEXT NOT NULL,
      story_id TEXT NOT NULL,
      story_title TEXT,
      quiz_score INTEGER NOT NULL DEFAULT 0,
      total_questions INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      attempt_count INTEGER NOT NULL DEFAULT 1,
      last_attempt_at TEXT NOT NULL,
      UNIQUE(learner_id, story_id)
    );

    CREATE TABLE IF NOT EXISTS custom_stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      titleBisaya TEXT,
      description TEXT,
      englishText TEXT,
      bisayaText TEXT,
      vocab_word TEXT,
      vocab_en_def TEXT,
      vocab_bis_def TEXT,
      quiz_data TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS learners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      pin TEXT NOT NULL
    );
  `);

  console.log('🔧 Tables ready');
  return dbInstance;
}