// screens/TeacherDashboardScreen.js

import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { getAllLearnersStats } from '../database/progressService';

export default function TeacherDashboardScreen({ navigation }) {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function loadData() {
        try {
          const data = await getAllLearnersStats();
          if (isActive) setLearners(data);
        } catch (error) {
          console.error('Failed to load learners:', error);
        } finally {
          if (isActive) setLoading(false);
        }
      }
      loadData();
      return () => { isActive = false; };
    }, [])
  );

  const renderLearner = ({ item }) => (
    <View style={styles.learnerCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.learnerId.substring(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.learnerId}>{item.learnerId}</Text>
        <Text style={styles.learnerMeta}>
          {item.storiesCompleted} {item.storiesCompleted === 1 ? 'story' : 'stories'} • Last active: {new Date(item.lastActive).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.scoreBadge}>
        <Text style={styles.scoreLabel}>Avg</Text>
        <Text style={styles.scoreValue}>{item.averageScore}%</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Teacher Dashboard</Text>
            <Text style={styles.subtitle}>Monitor your learners' progress</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Welcome')}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{learners.length}</Text>
            <Text style={styles.summaryLabel}>Active Learners</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {learners.reduce((acc, curr) => acc + curr.storiesCompleted, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Stories Read</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Learner List</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading learners...</Text>
        ) : learners.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-group-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No learner data yet.</Text>
            <Text style={styles.emptySubtext}>Learners will appear here after they complete quizzes.</Text>
          </View>
        ) : (
          <FlatList
            data={learners}
            keyExtractor={(item) => item.learnerId}
            renderItem={renderLearner}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.xl, paddingBottom: spacing.md,
  },
  title: { fontSize: typography.displayMedium, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: typography.body, color: colors.textSecondary, marginTop: 4 },
  profileBtn: { padding: spacing.sm },
  summaryRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, marginVertical: spacing.md },
  summaryCard: {
    flex: 1, backgroundColor: colors.primary, borderRadius: radius.lg,
    padding: spacing.lg, ...shadows.cardLarge,
  },
  summaryValue: { fontSize: 32, fontWeight: '700', color: colors.textLight },
  summaryLabel: { fontSize: typography.bodySmall, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  sectionTitle: {
    fontSize: typography.heading3, fontWeight: '700', color: colors.textPrimary,
    paddingHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.sm,
  },
  listContainer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  learnerCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.card,
  },
  avatar: {
    width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.primarySoft,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  avatarText: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.primary },
  info: { flex: 1 },
  learnerId: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.textPrimary },
  learnerMeta: { fontSize: typography.tiny, color: colors.textSecondary, marginTop: 2 },
  scoreBadge: {
    alignItems: 'center', backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.md,
  },
  scoreLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  scoreValue: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.primary },
  loadingText: { textAlign: 'center', marginTop: spacing.xl, color: colors.textSecondary },
  emptyState: { alignItems: 'center', marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyText: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md },
  emptySubtext: { fontSize: typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
});