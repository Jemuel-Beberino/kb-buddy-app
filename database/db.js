// database/db.js
// SQLite database initialization for KB Buddy

import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export async function getDatabase() {
    if (dbInstance) return dbInstance;

    console.log('🔧 Initializing database...');

    if (typeof SQLite.openDatabaseAsync !== 'function') {
        throw new Error(
            'expo-sqlite is not properly installed. Run: npx expo install expo-sqlite'
        );
    }

    dbInstance = await SQLite.openDatabaseAsync('kbbuddy.db');
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
      createdAt TEXT
    );
  `);

    console.log('🔧 Table ready');
    return dbInstance;
}