// database/authService.js
import { getDatabase } from './db';
import * as Crypto from 'expo-crypto';

// Helper function to hash the PIN
async function hashPin(pin) {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
}

export async function registerLearner(id, name, pin) {
  const db = await getDatabase();
  
  const existing = await db.getFirstAsync('SELECT * FROM learners WHERE id = ?', [id]);
  if (existing) {
    throw new Error('Learner ID already exists.');
  }

  // Hash the PIN before saving
  const hashedPin = await hashPin(pin);

  await db.runAsync(
    'INSERT INTO learners (id, name, pin) VALUES (?, ?, ?)',
    [id, name, hashedPin]
  );
  return { id, name };
}

export async function loginLearner(id, pin) {
  const db = await getDatabase();
  
  // Hash the input PIN to compare with the database hash
  const hashedPin = await hashPin(pin);

  const user = await db.getFirstAsync(
    'SELECT * FROM learners WHERE id = ? AND pin = ?',
    [id, hashedPin]
  );

  if (!user) {
    throw new Error('Invalid Learner ID or PIN.');
  }
  return user;
}