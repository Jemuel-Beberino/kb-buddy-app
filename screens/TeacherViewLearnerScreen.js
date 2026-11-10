// screens/TeacherViewLearnerScreen.js
import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { getProgressForLearner } from '../database/progressService';

export default function TeacherViewLearnerScreen({ route, navigation }) {
  const { learnerId } = route.params || {};
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

  const renderRecord = ({ item }) => {
    const percentage = Math.round((item.quiz_score / item.total_questions) * 100);
    let statusColor = colors.success;
    if (percentage < 60) statusColor = colors.error;
    else if (percentage < 80) statusColor = colors.accent;

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <Text style={styles.recordTitle} numberOfLines={1}>{item.story_title}</Text>
          <View style={[styles.scoreBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.scoreText, { color: statusColor }]}>{percentage}%</Text>
          </View>
        </View>
        
        <View style={styles.recordDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="checkmark-circle-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{item.quiz_score} / {item.total_questions} correct</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {new Date(item.last_attempt_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Learner Details</Text>
            <Text style={styles.headerSubtitle}>ID: {learnerId}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading records...</Text>
        ) : records.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No records found.</Text>
            <Text style={styles.emptySubtext}>This learner hasn't completed any quizzes yet.</Text>
          </View>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRecord}
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
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.textPrimary },
  headerSubtitle: { fontSize: typography.tiny, color: colors.textSecondary },
  listContainer: { padding: spacing.xl },
  recordCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.card },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  recordTitle: { flex: 1, fontSize: typography.bodyLarge, fontWeight: '700', color: colors.textPrimary, marginRight: spacing.sm },
  scoreBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  scoreText: { fontSize: typography.bodySmall, fontWeight: '700' },
  recordDetails: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: typography.bodySmall, color: colors.textSecondary },
  loadingText: { textAlign: 'center', marginTop: spacing.xl, color: colors.textSecondary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyText: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md },
  emptySubtext: { fontSize: typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
});