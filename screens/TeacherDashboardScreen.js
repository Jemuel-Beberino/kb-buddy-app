// screens/TeacherDashboardScreen.js
import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList,
  TouchableOpacity, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { getAllLearnersStats } from '../database/progressService';

/* ------------------------------------------------------------------ */
/*  PRESENTATION MODE TOGGLE                                           */
/* ------------------------------------------------------------------ */
const USE_MOCK_DATA = true; // Set to false to load real data

const MOCK_LEARNERS = [
  { learnerId: 'KS-12345', learnerName: 'Maria Santos', storiesCompleted: 5, averageScore: 92 },
  { learnerId: 'KS-12346', learnerName: 'Juan Dela Cruz', storiesCompleted: 3, averageScore: 78 },
  { learnerId: 'KS-12347', learnerName: 'Jose Rizal', storiesCompleted: 2, averageScore: 55 },
  { learnerId: 'KS-12348', learnerName: 'Andres Bonifacio', storiesCompleted: 4, averageScore: 88 },
  { learnerId: 'KS-12349', learnerName: 'Gabriela Silang', storiesCompleted: 1, averageScore: 68 },
  { learnerId: 'KS-12350', learnerName: 'Liza Soberano', storiesCompleted: 0, averageScore: NaN },
];

/* ------------------------------------------------------------------ */
/*  UI-only helpers                                                    */
/* ------------------------------------------------------------------ */

const TITLE_SIZE = typography.displayMedium ?? 28;

const TIERS = {
  high: { label: 'High', bg: '#D1FAE5', fg: '#047857', bar: colors.success },
  medium: { label: 'Medium', bg: '#FEF3C7', fg: '#92400E', bar: colors.warning },
  low: { label: 'Low', bg: '#FEE2E2', fg: '#B91C1C', bar: colors.error },
  none: { label: 'No data', bg: colors.surfaceMuted, fg: colors.textMuted, bar: colors.border },
};

function getTier(score) {
  if (Number.isNaN(score)) return TIERS.none;
  if (score >= 80) return TIERS.high;
  if (score >= 60) return TIERS.medium;
  return TIERS.low;
}

const AVATAR_PALETTE = [
  { bg: '#CCFBF1', fg: '#0F766E' }, { bg: '#FEF3C7', fg: '#92400E' },
  { bg: '#E0E7FF', fg: '#4338CA' }, { bg: '#FCE7F3', fg: '#BE185D' },
  { bg: '#E0F2FE', fg: '#0369A1' }, { bg: '#DCFCE7', fg: '#15803D' },
];

function getAvatarColors(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) % 997;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

/* ------------------------------------------------------------------ */

export default function TeacherDashboardScreen({ navigation }) {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function loadData() {
        try {
          if (USE_MOCK_DATA) {
            // Simulate a tiny loading delay for realism
            await new Promise((resolve) => setTimeout(resolve, 400));
            if (isActive) setLearners(MOCK_LEARNERS);
          } else {
            const data = await getAllLearnersStats();
            if (isActive) setLearners(data);
          }
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

  const query = searchQuery.trim().toLowerCase();
  const filteredLearners = query === ''
    ? learners
    : learners.filter((l) => 
        l.learnerId.toLowerCase().includes(query) || 
        l.learnerName.toLowerCase().includes(query)
      );

  const renderLearner = ({ item }) => {
    const score = Number(item.averageScore);
    const tier = getTier(score);
    const avatar = getAvatarColors(item.learnerId);
    const barWidth = Number.isNaN(score) ? 0 : Math.max(0, Math.min(100, score));

    return (
      <TouchableOpacity 
        style={styles.learnerCard} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TeacherViewLearner', { learnerId: item.learnerId, learnerName: item.learnerName })}
      >
        <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
          <Text style={[styles.avatarText, { color: avatar.fg }]}>{item.learnerName.substring(0, 2).toUpperCase()}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.learnerId} numberOfLines={1}>{item.learnerName}</Text>
          <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>ID: {item.learnerId}</Text>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="book-check-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.learnerMeta}>
              {item.storiesCompleted} {item.storiesCompleted === 1 ? 'story' : 'stories'}
            </Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: tier.bar }]} />
          </View>
        </View>

        <View style={[styles.scoreBadge, { backgroundColor: tier.bg }]}>
          <Text style={[styles.scoreValue, { color: tier.fg }]}>
            {Number.isNaN(score) ? '—' : `${score}%`}
          </Text>
          <View style={styles.scoreStatusRow}>
            <View style={[styles.scoreDot, { backgroundColor: tier.bar }]} />
            <Text style={[styles.scoreLabel, { color: tier.fg }]}>{tier.label}</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={{ marginLeft: spacing.sm }} />
      </TouchableOpacity>
    );
  };

  const listHeader = (
    <View>
      <View style={styles.summaryRow}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryBubble} />
          <View style={[styles.summaryIcon, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
            <MaterialCommunityIcons name="account-group" size={22} color={colors.textLight} />
          </View>
          <Text style={[styles.summaryValue, { color: colors.textLight }]}>{learners.length}</Text>
          <Text style={[styles.summaryLabel, { color: 'rgba(255,255,255,0.92)' }]}>Active Learners</Text>
        </LinearGradient>

        <LinearGradient
          colors={[colors.accent, colors.accentDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryBubble} />
          <View style={[styles.summaryIcon, { backgroundColor: 'rgba(120,53,15,0.16)' }]}>
            <MaterialCommunityIcons name="book-open-variant" size={22} color={colors.textOnAccent} />
          </View>
          <Text style={[styles.summaryValue, { color: colors.textOnAccent }]}>
            {learners.reduce((acc, curr) => acc + curr.storiesCompleted, 0)}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.textOnAccent }]}>Total Stories Read</Text>
        </LinearGradient>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Learner List</Text>
        <View style={styles.countChip}>
          <Text style={styles.countChipText}>
            {query === '' ? learners.length : `${filteredLearners.length} of ${learners.length}`}
          </Text>
        </View>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>High 80%+</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendText}>Medium 60–79%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Low under 60%</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primarySoft} />

        <LinearGradient
          colors={[colors.primarySoft, colors.background]}
          style={styles.topGradient}
          pointerEvents="none"
        />
        
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Teacher Dashboard</Text>
            <Text style={styles.subtitle}>Monitor your learners' progress</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileBtn} 
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, searchFocused && styles.searchContainerFocused]}>
          <Ionicons name="search" size={18} color={searchFocused ? colors.primary : colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search learner name or ID..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.padX}>
            {listHeader}
            <Text style={styles.loadingText}>Loading learners...</Text>
          </View>
        ) : learners.length === 0 ? (
          <View style={styles.padX}>
            {listHeader}
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <MaterialCommunityIcons name="account-group-outline" size={44} color={colors.primary} />
              </View>
              <Text style={styles.emptyText}>No learner data yet.</Text>
              <Text style={styles.emptySubtext}>Learners will appear here after they complete quizzes.</Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredLearners}
            keyExtractor={(item) => item.learnerId}
            renderItem={renderLearner}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="search" size={36} color={colors.primary} />
                </View>
                <Text style={styles.emptyText}>No learners found.</Text>
                <Text style={styles.emptySubtext}>Try a different name or ID.</Text>
              </View>
            }
            contentContainerStyle={styles.listContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  padX: { paddingHorizontal: spacing.xl },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  headerText: { flex: 1, marginRight: spacing.md },
  title: { fontSize: TITLE_SIZE, lineHeight: TITLE_SIZE + 8, fontFamily: typography.fontBold, color: colors.textPrimary },
  subtitle: { fontSize: typography.body, fontFamily: typography.fontRegular, color: colors.textSecondary, marginTop: 2 },
  profileBtn: { width: 46, height: 46, borderRadius: radius.pill, backgroundColor: 'rgba(239, 68, 68, 0.12)', justifyContent: 'center', alignItems: 'center' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 50,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.card,
  },
  searchContainerFocused: { borderColor: colors.primary },
  searchInput: { flex: 1, fontSize: typography.body, fontFamily: typography.fontRegular, color: colors.textPrimary, paddingVertical: 0 },

  summaryRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm },
  summaryCard: {
    flex: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
  },
  summaryBubble: { position: 'absolute', top: -34, right: -30, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.14)' },
  summaryIcon: { width: 40, height: 40, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  summaryValue: { fontSize: 36, lineHeight: 42, fontFamily: typography.fontBold },
  summaryLabel: { fontSize: typography.bodySmall, fontFamily: typography.fontSemiBold, marginTop: 2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.xs },
  sectionTitle: { fontSize: typography.heading3, fontFamily: typography.fontBold, color: colors.textPrimary },
  countChip: { backgroundColor: colors.primarySoft, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  countChipText: { fontSize: typography.caption, fontFamily: typography.fontBold, color: colors.primaryDark },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: 4, marginBottom: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: typography.tiny, fontFamily: typography.fontSemiBold, color: colors.textSecondary },

  listContainer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  learnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  avatar: { width: 52, height: 52, borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: { fontSize: typography.bodyLarge, fontFamily: typography.fontBold },
  info: { flex: 1, marginRight: spacing.sm },
  learnerId: { fontSize: typography.bodyLarge, fontFamily: typography.fontBold, color: colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  learnerMeta: { fontSize: typography.caption, fontFamily: typography.fontRegular, color: colors.textSecondary },
  barTrack: { height: 6, borderRadius: radius.pill, backgroundColor: colors.borderLight, marginTop: spacing.sm, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill },
  scoreBadge: { alignItems: 'center', minWidth: 68, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.md },
  scoreValue: { fontSize: typography.bodyLarge, lineHeight: 22, fontFamily: typography.fontBold },
  scoreStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreDot: { width: 6, height: 6, borderRadius: 3 },
  scoreLabel: { fontSize: 10, fontFamily: typography.fontBold },

  loadingText: { textAlign: 'center', marginTop: spacing.xl, fontFamily: typography.fontRegular, color: colors.textSecondary },
  emptyState: { alignItems: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xl },
  emptyIconWrap: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: typography.bodyLarge, fontFamily: typography.fontBold, color: colors.textPrimary, marginTop: spacing.md },
  emptySubtext: { fontSize: typography.bodySmall, fontFamily: typography.fontRegular, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
});