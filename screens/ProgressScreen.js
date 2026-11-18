// screens/ProgressScreen.js
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { getLearnerStats } from '../database/progressService';
import { allStories } from '../data/stories';

const TOTAL_STORIES = allStories.length;

// Presentation helpers (no effect on data/logic)
const getScoreColor = (pct) => {
  if (pct >= 80) return colors.success;
  if (pct >= 60) return colors.warning || colors.accent;
  return colors.error;
};

// Circular progress ring, Apple Fitness style
function ProgressRing({ percent, color, size = 112, stroke = 12, children }) {
  const safe = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - safe / 100);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primarySoft}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.ringCenter}>{children}</View>
      </View>
    </View>
  );
}

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
    { icon: 'book', tint: colors.primary, value: `${stats.storiesCompleted}/${TOTAL_STORIES}`, label: 'Stories completed' },
    { icon: 'list', tint: '#8B5CF6', value: `${stats.vocabularyEncountered}`, label: 'Vocabulary encountered' },
    { icon: 'checkmark-circle', tint: '#10B981', value: `${stats.vocabularyCorrect}`, label: 'Vocabulary correct' },
    { icon: 'flame', tint: '#F97316', value: `${stats.learningStreak} ${stats.learningStreak === 1 ? 'day' : 'days'}`, label: 'Learning streak' },
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>My Progress</Text>
          <Text style={styles.pageSubtitle}>Your learning journey, one story at a time.</Text>

          {/* Learner card: gradient + floating shadow */}
          <View style={styles.learnerShadow}>
            <View style={styles.learnerCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.22)', 'rgba(0,0,0,0.18)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.learnerAvatar}>
                <Text style={styles.learnerEmoji}>🦉</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.learnerName}>Active Learner</Text>
                <Text style={styles.learnerId}>Learner ID: {learnerId}</Text>
              </View>
              <View style={styles.streakChip}>
                <Ionicons name="flame" size={14} color="#FDBA74" />
                <Text style={styles.streakChipText}>{stats.learningStreak}</Text>
              </View>
            </View>
          </View>

          {/* Stat cards */}
          <View style={styles.statsGrid}>
            {statCards.map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: stat.tint + '1F' }]}>
                  <Ionicons name={stat.icon} size={20} color={stat.tint} />
                </View>
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Progress overview: rings */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Ionicons name="trending-up" size={20} color={colors.primary} />
              <Text style={styles.overviewTitle}>Progress Overview</Text>
            </View>

            <View style={styles.ringsRow}>
              <View style={styles.ringItem}>
                <ProgressRing percent={storiesPercent} color={colors.primary}>
                  <Text style={styles.ringPercent}>
                    {Number.isFinite(storiesPercent) ? storiesPercent : 0}%
                  </Text>
                </ProgressRing>
                <Text style={styles.ringLabel}>Stories completed</Text>
                <Text style={styles.ringSub}>{stats.storiesCompleted}/{TOTAL_STORIES}</Text>
              </View>

              <View style={styles.ringItem}>
                <ProgressRing percent={vocabPercent} color={colors.accent}>
                  <Text style={styles.ringPercent}>{vocabPercent}%</Text>
                </ProgressRing>
                <Text style={styles.ringLabel}>Vocabulary mastered</Text>
                <Text style={styles.ringSub}>
                  {stats.vocabularyCorrect}/{stats.vocabularyEncountered}
                </Text>
              </View>
            </View>
          </View>

          {/* Recent activity */}
          <View style={styles.recentCard}>
            <View style={styles.overviewHeader}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.overviewTitle}>Recent Activity</Text>
            </View>

            {stats.recentActivity.length === 0 ? (
              <View style={styles.emptyRecent}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="book-outline" size={28} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyRecentText}>No activity yet. Start reading a story!</Text>
              </View>
            ) : (
              stats.recentActivity.map((item, index) => {
                const pct = Math.round((item.quiz_score / item.total_questions) * 100);
                const tone = getScoreColor(pct);
                const isLast = index === stats.recentActivity.length - 1;
                return (
                  <View key={index} style={[styles.recentItem, isLast && styles.recentItemLast]}>
                    <View style={[styles.recentIcon, { backgroundColor: tone + '1F' }]}>
                      <Ionicons name="checkmark" size={18} color={tone} />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                      <Text style={styles.recentTitle} numberOfLines={1}>{item.story_title}</Text>
                      <Text style={styles.recentMeta}>{item.quiz_score}/{item.total_questions} correct</Text>
                    </View>
                    <View style={[styles.recentBadge, { backgroundColor: tone + '1F' }]}>
                      <Text style={[styles.recentPercent, { color: tone }]}>{pct}%</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.footerPill}>
            <Text style={styles.footerText}>
              {stats.storiesCompleted === 0 ? 'Start your journey today! 🌱' : stats.storiesCompleted < TOTAL_STORIES ? 'Great job! Keep learning! 🌟' : 'Amazing! You finished all stories! 🏆'}
            </Text>
          </View>
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

  // learner card
  learnerShadow: {
    marginBottom: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  learnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  learnerAvatar: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  learnerEmoji: { fontSize: 32 },
  learnerName: { fontSize: typography.heading3, fontWeight: '700', color: colors.textLight },
  learnerId: { fontSize: typography.bodySmall, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  streakChipText: { fontSize: typography.bodySmall, fontWeight: '700', color: colors.textLight },

  // stat cards
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: { fontSize: typography.displayMedium, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: typography.bodySmall, color: colors.textSecondary, marginTop: 2 },

  // overview
  overviewCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card },
  overviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  overviewTitle: { fontSize: typography.heading3, fontWeight: '700', color: colors.textPrimary },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  ringItem: { alignItems: 'center', flex: 1 },
  ringCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ringPercent: { fontSize: typography.heading2, fontWeight: '800', color: colors.textPrimary },
  ringLabel: { fontSize: typography.bodySmall, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' },
  ringSub: { fontSize: typography.tiny, color: colors.textSecondary, marginTop: 2 },

  // recent activity
  recentCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card },
  emptyRecent: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyRecentText: { fontSize: typography.bodySmall, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  recentItemLast: { borderBottomWidth: 0, paddingBottom: 0 },
  recentIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  recentTitle: { fontSize: typography.body, fontWeight: '600', color: colors.textPrimary },
  recentMeta: { fontSize: typography.tiny, color: colors.textSecondary, marginTop: 2 },
  recentBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  recentPercent: { fontSize: typography.bodySmall, fontWeight: '700' },

  // footer
  footerPill: {
    alignSelf: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  footerText: { fontSize: typography.bodySmall, fontWeight: '600', color: colors.primary, textAlign: 'center' },
});