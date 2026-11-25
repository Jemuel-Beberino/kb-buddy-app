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
import { getCustomStories } from '../database/storyService'; // Added this

const CircularProgress = ({ size, strokeWidth, percentage, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle stroke={colors.borderLight} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <Circle
          stroke={color} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.circleText}>{Math.round(percentage)}%</Text>
    </View>
  );
};

export default function ProgressScreen({ route }) {
  const learnerId = route?.params?.learnerId || 'KS-12345';

  const [stats, setStats] = useState({
    storiesCompleted: 0, vocabularyEncountered: 0, vocabularyCorrect: 0, recentActivity: [], learningStreak: 0,
  });
  const [customCount, setCustomCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function loadStats() {
        try {
          const result = await getLearnerStats(learnerId);
          const customs = await getCustomStories(); // Fetch custom stories count
          
          if (isActive) {
            setStats(result);
            setCustomCount(customs.length); // Save to state
          }
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

  // FIXED: Combined built-in stories and custom stories
  const totalAvailableStories = allStories.length + customCount;
  
  const storiesPercent = totalAvailableStories > 0 ? (stats.storiesCompleted / totalAvailableStories) * 100 : 0;
  const vocabPercent = stats.vocabularyEncountered > 0
      ? (stats.vocabularyCorrect / stats.vocabularyEncountered) * 100
      : 0;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>My Progress</Text>
          <Text style={styles.pageSubtitle}>Your learning journey, one story at a time.</Text>

          <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.learnerCard}>
            <View style={styles.learnerAvatar}>
              <Text style={styles.learnerEmoji}>🦉</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.learnerName}>Active Learner</Text>
              <Text style={styles.learnerId}>Learner ID: {learnerId}</Text>
            </View>
          </LinearGradient>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="book-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats.storiesCompleted}/{totalAvailableStories}</Text>
              <Text style={styles.statLabel}>Stories Completed</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="list-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats.vocabularyEncountered}</Text>
              {/* FIXED: Changed label to reflect actual tracking */}
              <Text style={styles.statLabel}>Questions Answered</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats.vocabularyCorrect}</Text>
              <Text style={styles.statLabel}>Correct Answers</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="flame-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats.learningStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          <View style={styles.overviewCard}>
            <Text style={styles.sectionTitle}>Progress Overview</Text>
            <View style={styles.ringContainer}>
              <View style={styles.ringItem}>
                <CircularProgress size={110} strokeWidth={12} percentage={storiesPercent} color={colors.primary} />
                <Text style={styles.ringLabel}>Stories</Text>
              </View>
              <View style={styles.ringItem}>
                <CircularProgress size={110} strokeWidth={12} percentage={vocabPercent} color={colors.accent} />
                <Text style={styles.ringLabel}>Accuracy</Text>
              </View>
            </View>
          </View>

          <View style={styles.recentCard}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {stats.recentActivity.length === 0 ? (
              <Text style={styles.emptyText}>No activity yet. Start reading!</Text>
            ) : (
              stats.recentActivity.map((item, index) => (
                <View key={index} style={styles.recentRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.recentTitle} numberOfLines={1}>{item.story_title}</Text>
                    <Text style={styles.recentDate}>{new Date(item.last_attempt_at).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.recentScore}>{item.quiz_score}/{item.total_questions}</Text>
                </View>
              ))
            )}
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
  
  learnerCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.cardLarge },
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
  sectionTitle: { fontSize: typography.heading3, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  ringContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  ringItem: { alignItems: 'center' },
  circleText: { position: 'absolute', fontSize: typography.bodyLarge, fontWeight: '700', color: colors.textPrimary },
  ringLabel: { marginTop: spacing.sm, fontSize: typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  
  recentCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadows.card },
  emptyText: { fontSize: typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  recentTitle: { fontSize: typography.body, fontWeight: '600', color: colors.textPrimary },
  recentDate: { fontSize: typography.tiny, color: colors.textSecondary, marginTop: 2 },
  recentScore: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.primary },
});