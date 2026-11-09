// database/authService.js
import { getDatabase } from './db';

export async function registerLearner(id, name, pin) {
  const db = await getDatabase();
  
  const existing = await db.getFirstAsync('SELECT * FROM learners WHERE id = ?', [id]);
  if (existing) {
    throw new Error('Learner ID already exists.');
  }

  await db.runAsync(
    'INSERT INTO learners (id, name, pin) VALUES (?, ?, ?)',
    [id, name, pin]
  );
  return { id, name };
}

export async function loginLearner(id, pin) {
  const db = await getDatabase();
  const user = await db.getFirstAsync(
    'SELECT * FROM learners WHERE id = ? AND pin = ?',
    [id, pin]
  );

  if (!user) {
    throw new Error('Invalid Learner ID or PIN.');
  }
  return user;
}