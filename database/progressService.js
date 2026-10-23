// database/progressService.js
// Handles all progress-related database operations

import { getDatabase } from './db';

// Save a quiz result (insert or update)
export async function saveQuizResult({
  learnerId,
  storyId,
  storyTitle,
  quizScore,
  totalQuestions,
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();

  // Check if a record already exists
  const existing = await db.getFirstAsync(
    'SELECT * FROM progress WHERE learner_id = ? AND story_id = ?',
    [learnerId, storyId]
  );

  if (existing) {
    // Update: keep the highest score, increment attempt count
    const newBestScore = Math.max(existing.quiz_score, quizScore);
    await db.runAsync(
      `UPDATE progress
       SET quiz_score = ?,
           total_questions = ?,
           completed = 1,
           attempt_count = attempt_count + 1,
           last_attempt_at = ?
       WHERE learner_id = ? AND story_id = ?`,
      [newBestScore, totalQuestions, now, learnerId, storyId]
    );
  } else {
    // Insert new
    await db.runAsync(
      `INSERT INTO progress
       (learner_id, story_id, story_title, quiz_score, total_questions, completed, attempt_count, last_attempt_at)
       VALUES (?, ?, ?, ?, ?, 1, 1, ?)`,
      [learnerId, storyId, storyTitle, quizScore, totalQuestions, now]
    );
  }
}

// Get all progress records for a learner (most recent first)
export async function getProgressForLearner(learnerId) {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM progress
     WHERE learner_id = ?
     ORDER BY last_attempt_at DESC`,
    [learnerId]
  );
  return rows;
}

// Compute aggregate stats for the Progress screen
export async function getLearnerStats(learnerId) {
  const db = await getDatabase();

  // Total completed stories
  const completedRow = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM progress
     WHERE learner_id = ? AND completed = 1`,
    [learnerId]
  );

  // Total quiz attempts (sum of all quizzes answered)
  const questionsRow = await db.getFirstAsync(
    `SELECT SUM(total_questions) as total, SUM(quiz_score) as correct
     FROM progress WHERE learner_id = ?`,
    [learnerId]
  );

  // Recent activity (last 3)
  const recent = await db.getAllAsync(
    `SELECT story_title, quiz_score, total_questions, last_attempt_at
     FROM progress WHERE learner_id = ?
     ORDER BY last_attempt_at DESC LIMIT 3`,
    [learnerId]
  );

  // Compute streak
  const allRecords = await db.getAllAsync(
    `SELECT DISTINCT date(last_attempt_at) as day
     FROM progress WHERE learner_id = ?
     ORDER BY day DESC`,
    [learnerId]
  );
  const streak = computeStreak(allRecords.map((r) => r.day));

  return {
    storiesCompleted: completedRow?.count || 0,
    vocabularyEncountered: questionsRow?.total || 0,
    vocabularyCorrect: questionsRow?.correct || 0,
    recentActivity: recent || [],
    learningStreak: streak,
  };
}

// --- NEW FUNCTION FOR TEACHER DASHBOARD ---
export async function getAllLearnersStats() {
  const db = await getDatabase();

  // Get distinct learners and their aggregated stats
  const learners = await db.getAllAsync(`
    SELECT 
      learner_id,
      COUNT(DISTINCT story_id) as stories_completed,
      SUM(quiz_score) as total_correct,
      SUM(total_questions) as total_questions,
      MAX(last_attempt_at) as last_active
    FROM progress
    GROUP BY learner_id
    ORDER BY last_active DESC
  `);

  return learners.map((l) => {
    const avgScore = l.total_questions > 0 
      ? Math.round((l.total_correct / l.total_questions) * 100) 
      : 0;
      
    return {
      learnerId: l.learner_id,
      storiesCompleted: l.stories_completed,
      averageScore: avgScore,
      lastActive: l.last_active,
    };
  });
}

// Compute consecutive days streak
function computeStreak(days) {
  if (!days || days.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // If last activity is neither today nor yesterday, streak is broken
  if (days[0] !== todayStr && days[0] !== yesterdayStr) return 0;

  let streak = 1;
  let currentDate = new Date(days[0]);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < days.length; i++) {
    const prevDate = new Date(days[i]);
    prevDate.setHours(0, 0, 0, 0);

    const diff = Math.round(
      (currentDate - prevDate) / (1000 * 60 * 60 * 24)
    );
    if (diff === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}