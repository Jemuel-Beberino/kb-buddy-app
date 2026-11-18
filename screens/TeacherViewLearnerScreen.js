// screens/TeacherViewLearnerScreen.js
import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { getProgressForLearner } from '../database/progressService';

// ---- helpers ---------------------------------------------------------------

const getPercentage = (item) =>
  item.total_questions > 0
    ? Math.round((item.quiz_score / item.total_questions) * 100)
    : 0;

// Green = high, Yellow = medium, Red = low
const getScoreStatus = (percentage) => {
  if (percentage >= 80) return { color: colors.success, label: 'Strong' };
  if (percentage >= 60) return { color: colors.warning || colors.accent, label: 'Fair' };
  return { color: colors.error, label: 'Needs help' };
};

// "Maria Santos" -> "MS", "maria" -> "M"
const getInitials = (name) => {
  if (!name) return null;
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

// ---- screen ----------------------------------------------------------------

export default function TeacherViewLearnerScreen({ route, navigation }) {
  // learnerName is optional; pass it from the dashboard if you have it
  const { learnerId, learnerName } = route.params || {};
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function loadData() {
        try {
          const data = await getProgressForLearner(learnerId);
          if (isActive) setRecords(data);
        } catch (error) {
          console.error('Failed to load learner records:', error);
        } finally {
          if (isActive) setLoading(false);
        }
      }
      loadData();
      return () => { isActive = false; };
    }, [learnerId])
  );

  const stats = useMemo(() => {
    if (records.length === 0) return { average: 0, count: 0 };
    const total = records.reduce((sum, r) => sum + getPercentage(r), 0);
    return { average: Math.round(total / records.length), count: records.length };
  }, [records]);

  const initials = getInitials(learnerName);
  const averageStatus = getScoreStatus(stats.average);

  const renderProfile = () => (
    <View style={styles.profileCard}>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          {initials ? (
            <Text style={styles.avatarText}>{initials}</Text>
          ) : (
            <Ionicons name="person" size={28} color={colors.surface} />
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {learnerName || 'Learner'}
          </Text>
          <View style={styles.idPill}>
            <Text style={styles.idText}>ID: {learnerId}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{stats.count}</Text>
          <Text style={styles.statLabel}>Quizzes taken</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBlock}>
          <Text
            style={[
              styles.statValue,
              stats.count > 0 && { color: averageStatus.color },
            ]}
          >
            {stats.count > 0 ? `${stats.average}%` : '–'}
          </Text>
          <Text style={styles.statLabel}>Average score</Text>
        </View>
      </View>

      {records.length > 0 && <Text style={styles.sectionTitle}>Quiz history</Text>}
    </View>
  );

  const renderRecord = ({ item }) => {
    const percentage = getPercentage(item);
    const { color } = getScoreStatus(percentage);

    return (
      <View style={styles.recordCard}>
        <View style={[styles.accentBar, { backgroundColor: color }]} />
        <View style={styles.recordBody}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle} numberOfLines={1}>
              {item.story_title}
            </Text>
            <View style={[styles.scoreBadge, { backgroundColor: color + '1F' }]}>
              <View style={[styles.scoreDot, { backgroundColor: color }]} />
              <Text style={[styles.scoreText, { color }]}>{percentage}%</Text>
            </View>
          </View>

          <View style={styles.recordDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>
                {item.quiz_score} of {item.total_questions} correct
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>{formatDate(item.last_attempt_at)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Learner details</Text>
          <View style={styles.backBtn} />
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.textSecondary} />
          </View>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRecord}
            ListHeaderComponent={renderProfile}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="document-text-outline" size={32} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyText}>No quiz results yet</Text>
                <Text style={styles.emptySubtext}>
                  Results will appear here once this learner completes a quiz.
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ---- styles ----------------------------------------------------------------

const AVATAR_SIZE = 64;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  topBarTitle: {
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },

  // profile header
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.primary || colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.5,
  },
  profileInfo: { flex: 1, marginLeft: spacing.md },
  profileName: {
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  idPill: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  idText: { fontSize: typography.tiny, color: colors.textSecondary, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statBlock: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: { fontSize: typography.tiny, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },

  sectionTitle: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },

  // record cards
  recordCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  accentBar: { width: 4 },
  recordBody: { flex: 1, padding: spacing.lg },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitle: {
    flex: 1,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  scoreDot: { width: 6, height: 6, borderRadius: 3 },
  scoreText: { fontSize: typography.bodySmall, fontWeight: '700' },

  recordDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: typography.tiny, color: colors.textMuted },

  // empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});