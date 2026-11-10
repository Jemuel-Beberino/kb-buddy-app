// screens/HomeScreen.js
import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  TextInput, ScrollView, Image, StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { allStories, categories } from '../data/stories';
import { storyCovers } from '../data/storyImages';
import { getCustomStories } from '../database/storyService';
import { getLearnerStoryStatuses } from '../database/progressService';

// Soft teal-tinted shadows so cards and covers look like they float
const floatingCard = {
  shadowColor: colors.primaryDark,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.18,
  shadowRadius: 18,
  elevation: 8,
};
const floatingCover = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 6,
};

export default function HomeScreen({ route, navigation }) {
  const learnerName = route?.params?.learnerName || 'Learner';
  const learnerId = route?.params?.learnerId || 'KS-12345';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [customStories, setCustomStories] = useState([]);
  const [storyStatuses, setStoryStatuses] = useState({});

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        // Fetch custom stories
        const stories = await getCustomStories();
        setCustomStories(stories);
        
        // Fetch learner's status for all stories
        const statuses = await getLearnerStoryStatuses(learnerId);
        setStoryStatuses(statuses);
      }
      loadData();
    }, [learnerId])
  );

  const combinedStories = [...customStories, ...allStories];

  const filteredStories = useMemo(() => {
    return combinedStories.filter((story) => {
      const matchesCategory =
        activeCategory === 'all' || story.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory, customStories]);

  const getCoverImage = (story) => {
    const folderPrefix = story.pages?.[0]?.image?.split('/')[0];
    if (folderPrefix && storyCovers[folderPrefix]) {
      return storyCovers[folderPrefix];
    }
    return null;
  };

  const renderStoryCard = ({ item }) => {
    const coverImage = getCoverImage(item);
    
    // Determine status dynamically from the database
    const status = storyStatuses[item.id] || 'not-started';
    
    // Style variables based on status
    let statusText = 'Not Started';
    let statusIcon = 'sparkles';
    let statusIconColor = 'rgba(255,255,255,0.9)';
    let actionText = 'Read Story';
    let actionIcon = 'book';

    if (status === 'completed') {
      statusText = 'Completed';
      statusIcon = 'checkmark-circle';
      statusIconColor = '#34D399'; // green
      actionText = 'Read Again';
      actionIcon = 'refresh';
    } else if (status === 'in-progress') {
      statusText = 'In Progress';
      statusIcon = 'bookmark';
      statusIconColor = '#FBBF24'; // yellow
      actionText = 'Continue Reading';
      actionIcon = 'play';
    }

    return (
      <TouchableOpacity
        style={styles.storyCard}
        activeOpacity={0.92}
        onPress={() =>
          navigation.navigate('StoryReader', {
            storyId: item.id,
            title: item.title,
            learnerId: learnerId, 
          })
        }
      >
        {/* "Book cover": shadow wrapper + clipped inner so the cover floats */}
        <View style={styles.coverShadow}>
          <View style={styles.coverClip}>
            {coverImage ? (
              <Image source={coverImage} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <LinearGradient colors={item.gradientColors} style={styles.coverImage}>
                <MaterialCommunityIcons name={item.icon} size={48} color="rgba(255,255,255,0.95)" />
              </LinearGradient>
            )}

            {/* bottom scrim so white text stays readable on any cover */}
            <LinearGradient
              colors={['rgba(15,23,42,0)', 'rgba(15,23,42,0.88)']}
              style={styles.coverScrim}
              pointerEvents="none"
            />

            <View style={styles.statusPill}>
              <Ionicons name={statusIcon} size={12} color={statusIconColor} />
              <Text style={styles.statusText}>{statusText}</Text>
            </View>

            <View style={styles.offlineBadge}>
              <Ionicons name="cloud-done" size={12} color={colors.textLight} />
            </View>

            <View style={styles.coverMeta}>
              <View style={styles.coverMetaRow}>
                <Ionicons name="time-outline" size={12} color={colors.textLight} />
                <Text style={styles.coverMetaText} numberOfLines={1}>{item.readTime}</Text>
              </View>
              <View style={styles.coverMetaRow}>
                <Ionicons name="book-outline" size={12} color={colors.textLight} />
                <Text style={styles.coverMetaText} numberOfLines={1}>{item.pageCount} pages</Text>
              </View>
            </View>

            <View style={styles.playButton}>
              <Ionicons name={actionIcon} size={17} color={colors.primaryDark} />
            </View>
          </View>
        </View>

        <View style={styles.storyInfo}>
          <View>
            <View style={[styles.categoryPill, { backgroundColor: item.categoryColor + '1A' }]}>
              <View style={[styles.categoryDot, { backgroundColor: item.categoryColor }]} />
              <Text style={styles.categoryPillText} numberOfLines={1}>
                {item.categoryLabel}
              </Text>
            </View>

            <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.storyTitleBisaya} numberOfLines={1}>{item.titleBisaya}</Text>
          </View>

          <View style={styles.storyAction}>
            <Text style={styles.storyActionText} numberOfLines={1}>{actionText}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        <View style={styles.appBar}>
          <View style={styles.appBarLeft}>
            <View style={styles.miniOwl}>
              <Text style={styles.miniOwlEmoji}>🦉</Text>
            </View>
            <Text style={styles.appBarTitle}>KB Buddy</Text>
          </View>
          <View style={styles.offlineModePill}>
            <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
            <Text style={styles.offlineModePillText}>Offline-Ready</Text>
          </View>
        </View>

        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Mga Istorya</Text>
          <Text style={styles.pageSubtitle}>Hi, {learnerName}! Choose a story.</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search a story..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filterPill, activeCategory === cat.id && styles.filterPillActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Text style={[styles.filterPillText, activeCategory === cat.id && styles.filterPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredStories}
          renderItem={renderStoryCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No stories found.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  appBarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  miniOwl: { width: 32, height: 32, borderRadius: radius.pill, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center' },
  miniOwlEmoji: { fontSize: 18 },
  appBarTitle: { fontSize: typography.heading3, fontWeight: '700', color: colors.primary },
  offlineModePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary },
  offlineModePillText: { fontSize: typography.tiny, fontWeight: '600', color: colors.primary },
  pageHeader: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  pageTitle: { fontSize: typography.displayMedium, fontWeight: '700', color: colors.textPrimary },
  pageSubtitle: { fontSize: typography.body, color: colors.textSecondary, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.md, height: 48, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.body, color: colors.textPrimary, paddingVertical: 0 },
  filterRow: { paddingHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.sm },
  filterScroll: { gap: spacing.sm, paddingRight: spacing.md },
  filterPill: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterPillText: { fontSize: typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  filterPillTextActive: { color: colors.textLight },
  listContainer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl },

  // ---- Story card (redesigned) ----
  // No overflow:hidden on the card itself, so its shadow isn't clipped on iOS.
  storyCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...floatingCard,
  },
  coverShadow: {
    width: 132,
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.surface, // needed for Android elevation
    ...floatingCover,
  },
  coverClip: { flex: 1, borderRadius: radius.lg, overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  coverScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 92 },

  statusPill: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusText: { fontSize: 10, fontFamily: typography.fontBold, color: colors.textLight },
  offlineBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  coverMeta: { position: 'absolute', left: spacing.sm, bottom: spacing.sm, right: 52, gap: 2 },
  coverMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  coverMetaText: {
    flexShrink: 1,
    fontSize: typography.tiny,
    fontFamily: typography.fontSemiBold,
    color: colors.textLight,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  playButton: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  storyInfo: { flex: 1, marginLeft: spacing.md, paddingVertical: 2, justifyContent: 'space-between' },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  categoryPillText: { flexShrink: 1, fontSize: 11, fontFamily: typography.fontSemiBold, color: colors.textPrimary },
  storyTitle: { fontSize: typography.heading3, lineHeight: 24, fontFamily: typography.fontBold, color: colors.textPrimary },
  storyTitleBisaya: { fontSize: typography.bodySmall, fontStyle: 'italic', fontFamily: typography.fontRegular, color: colors.textSecondary, marginTop: 2 },
  storyAction: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: spacing.sm },
  storyActionText: { flexShrink: 1, fontSize: typography.bodySmall, fontFamily: typography.fontBold, color: colors.primary },

  emptyState: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyStateText: { fontSize: typography.bodyLarge, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.md },
});