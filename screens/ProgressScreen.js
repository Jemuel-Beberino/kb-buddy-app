// screens/ProgressScreen.js
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { getLearnerStats } from '../database/progressService';
import { allStories } from '../data/stories';

const TOTAL_STORIES = allStories.length;

export default function ProgressScreen({ route }) {
  const learnerId = route?.params?.learnerId || 'KS-12345'; // Dynamic ID

  const [stats, setStats] = useState({
    storiesCompleted: 0,
    vocabularyEncountered: 0,
    vocabularyCorrect: 0,
    recentActivity: [],
    learningStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadStats() {
        try {
          const result = await getLearnerStats(learnerId);
          if (isActive) setStats(result);
        } catch (error) {
          console.error('Failed to load stats:', error);
        } finally {
          if (isActive) setLoading(false);
        }
      }

      loadStats();
      return () => { isActive = false; };
    }, [learnerId])
  );

  const storiesPercent = Math.round((stats.storiesCompleted / TOTAL_STORIES) * 100);
  const vocabPercent = stats.vocabularyEncountered > 0
      ? Math.round((stats.vocabularyCorrect / stats.vocabularyEncountered) * 100)
      : 0;

  const statCards = [
    { icon: 'book-outline', value: `${stats.storiesCompleted}/${TOTAL_STORIES}`, label: 'Stories Completed' },
    { icon: 'list-outline', value: `${stats.vocabularyEncountered}`, label: 'Vocabulary Encountered' },
    { icon: 'checkmark-circle-outline', value: `${stats.vocabularyCorrect}`, label: 'Vocabulary Correct' },
    { icon: 'flame-outline', value: `${stats.learningStreak} ${stats.learningStreak === 1 ? 'day' : 'days'}`, label: 'Learning Streak' },
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>My Progress</Text>
          <Text style={styles.pageSubtitle}>Your learning journey, one story at a time.</Text>

          <View style={styles.learnerCard}>
            <View style={styles.learnerAvatar}>
              <Text style={styles.learnerEmoji}>🦉</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.learnerName}>Active Learner</Text>
              <Text style={styles.learnerId}>Learner ID: {learnerId}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            {statCards.map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name={stat.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Ionicons name="trending-up" size={20} color={colors.primary} />
              <Text style={styles.overviewTitle}>Progress Overview</Text>
            </View>

            <View style={styles.progressItem}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Stories Completed</Text>
                <Text style={styles.progressValue}>{stats.storiesCompleted}/{TOTAL_STORIES}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${storiesPercent}%` }]} />
              </View>
            </View>

            <View style={styles.progressItem}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Vocabulary Mastered</Text>
                <Text style={styles.progressValue}>{vocabPercent}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${vocabPercent}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.recentCard}>
            <View style={styles.overviewHeader}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.overviewTitle}>Recent Activity</Text>
            </View>

            {stats.recentActivity.length === 0 ? (
              <View style={styles.emptyRecent}>
                <Ionicons name="book-outline" size={40} color={colors.textMuted} />
                <Text style={styles.emptyRecentText}>No activity yet. Start reading a story!</Text>
              </View>
            ) : (
              stats.recentActivity.map((item, index) => {
                const pct = Math.round((item.quiz_score / item.total_questions) * 100);
                return (
                  <View key={index} style={styles.recentItem}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={styles.recentTitle} numberOfLines={1}>{item.story_title}</Text>
                      <Text style={styles.recentMeta}>{item.quiz_score}/{item.total_questions} correct</Text>
                    </View>
                    <Text style={styles.recentPercent}>{pct}%</Text>
                  </View>
                );
              })
            )}
          </View>

          <Text style={styles.footerText}>
            {stats.storiesCompleted === 0 ? 'Start your journey today! 🌱' : stats.storiesCompleted < TOTAL_STORIES ? 'Great job! Keep learning! 🌟' : 'Amazing! You finished all stories! 🏆'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  pageTitle: { fontSize: typography.displayMedium, fontWeight: '700', color: colors.textPrimary },
  pageSubtitle: { fontSize: typography.body, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.xl },
  learnerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.cardLarge },
  learnerAvatar: { width: 56, height: 56, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  learnerEmoji: { fontSize: 32 },
  learnerName: { fontSize: typography.heading3, fontWeight: '700', color: colors.textLight },
  learnerId: { fontSize: typography.bodySmall, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  statCard: { width: '48%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadows.card },
  statIconContainer: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  statValue: { fontSize: typography.heading2, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: typography.tiny, color: colors.textSecondary, marginTop: 2 },
  overviewCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card },
  overviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  overviewTitle: { fontSize: typography.heading3, fontWeight: '700', color: colors.textPrimary },
  progressItem: { marginBottom: spacing.lg },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressLabel: { fontSize: typography.body, color: colors.textPrimary, fontWeight: '600' },
  progressValue: { fontSize: typography.body, color: colors.primary, fontWeight: '700' },
  progressBarBg: { height: 10, backgroundColor: colors.primarySoft, borderRadius: radius.pill, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
  recentCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card },
  emptyRecent: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyRecentText: { fontSize: typography.bodySmall, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  recentTitle: { fontSize: typography.body, fontWeight: '600', color: colors.textPrimary },
  recentMeta: { fontSize: typography.tiny, color: colors.textSecondary, marginTop: 2 },
  recentPercent: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.primary },
  footerText: { fontSize: typography.body, fontWeight: '600', color: colors.primary, textAlign: 'center', marginTop: spacing.md },
});