// database/progressService.js
import { getDatabase } from './db';

export async function saveQuizResult({
  learnerId, storyId, storyTitle, quizScore, totalQuestions,
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  
  // A story is considered "completed" if they score 60% or higher
  const isPassed = (quizScore / totalQuestions) >= 0.6 ? 1 : 0;

  const existing = await db.getFirstAsync(
    'SELECT * FROM progress WHERE learner_id = ? AND story_id = ?',
    [learnerId, storyId]
  );

  if (existing) {
    const newBestScore = Math.max(existing.quiz_score, quizScore);
    const newCompleted = newBestScore >= (totalQuestions * 0.6) ? 1 : existing.completed;
    
    await db.runAsync(
      `UPDATE progress
       SET quiz_score = ?, total_questions = ?, completed = ?,
           attempt_count = attempt_count + 1, last_attempt_at = ?
       WHERE learner_id = ? AND story_id = ?`,
      [newBestScore, totalQuestions, newCompleted, now, learnerId, storyId]
    );
  } else {
    await db.runAsync(
      `INSERT INTO progress
       (learner_id, story_id, story_title, quiz_score, total_questions, completed, attempt_count, last_attempt_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      [learnerId, storyId, storyTitle, quizScore, totalQuestions, isPassed, now]
    );
  }
}

export async function getProgressForLearner(learnerId) {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM progress WHERE learner_id = ? ORDER BY last_attempt_at DESC`,
    [learnerId]
  );
  return rows;
}

export async function getLearnerStats(learnerId) {
  const db = await getDatabase();

  const completedRow = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM progress WHERE learner_id = ? AND completed = 1`,
    [learnerId]
  );

  const questionsRow = await db.getFirstAsync(
    `SELECT SUM(total_questions) as total, SUM(quiz_score) as correct
     FROM progress WHERE learner_id = ?`,
    [learnerId]
  );

  const recent = await db.getAllAsync(
    `SELECT story_title, quiz_score, total_questions, last_attempt_at
     FROM progress WHERE learner_id = ? ORDER BY last_attempt_at DESC LIMIT 3`,
    [learnerId]
  );

  const allRecords = await db.getAllAsync(
    `SELECT DISTINCT date(last_attempt_at) as day
     FROM progress WHERE learner_id = ? ORDER BY day DESC`,
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

function computeStreak(days) {
  if (!days || days.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (days[0] !== todayStr && days[0] !== yesterdayStr) return 0;

  let streak = 1;
  let currentDate = new Date(days[0]);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < days.length; i++) {
    const prevDate = new Date(days[i]);
    prevDate.setHours(0, 0, 0, 0);

    const diff = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  return streak;
}

export async function getAllLearnersStats() {
  const db = await getDatabase();

  // Removed avatar_uri from the SELECT
  const learners = await db.getAllAsync(`
    SELECT 
      l.id as learner_id,
      l.name as learner_name,
      COUNT(DISTINCT p.story_id) as stories_completed,
      SUM(p.quiz_score) as total_correct,
      SUM(p.total_questions) as total_questions,
      MAX(p.last_attempt_at) as last_active
    FROM learners l
    LEFT JOIN progress p ON l.id = p.learner_id
    GROUP BY l.id
    ORDER BY last_active DESC
  `);

  return learners.map((l) => {
    const avgScore = l.total_questions > 0 
      ? Math.round((l.total_correct / l.total_questions) * 100) 
      : 0;
      
    return {
      learnerId: l.learner_id,
      learnerName: l.learner_name || l.learner_id,
      storiesCompleted: l.stories_completed || 0,
      averageScore: avgScore,
      lastActive: l.last_active || null,
    };
  });
}

export async function getLearnerStoryStatuses(learnerId) {
  const db = await getDatabase();
  const records = await db.getAllAsync(
    'SELECT story_id, quiz_score, total_questions FROM progress WHERE learner_id = ?',
    [learnerId]
  );

  const statuses = {};
  records.forEach((rec) => {
    const isPassed = rec.total_questions > 0 && (rec.quiz_score / rec.total_questions) >= 0.6;
    statuses[rec.story_id] = isPassed ? 'completed' : 'in-progress';
  });

  return statuses;
}