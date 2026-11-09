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

export default function HomeScreen({ route, navigation }) {
  const learnerName = route?.params?.learnerName || 'Learner';
  const learnerId = route?.params?.learnerId || 'KS-12345';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [customStories, setCustomStories] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function loadCustom() {
        const stories = await getCustomStories();
        setCustomStories(stories);
      }
      loadCustom();
    }, [])
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

    return (
      <TouchableOpacity
        style={styles.storyCard}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('StoryReader', {
            storyId: item.id,
            title: item.title,
            learnerId: learnerId, // Passed here
          })
        }
      >
        <View style={styles.coverWrapper}>
          {coverImage ? (
            <Image source={coverImage} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={item.gradientColors} style={styles.coverImage}>
              <MaterialCommunityIcons name={item.icon} size={44} color="rgba(255,255,255,0.95)" />
            </LinearGradient>
          )}
          <View style={styles.offlineBadge}>
            <Ionicons name="cloud-done" size={12} color={colors.textLight} />
          </View>
        </View>

        <View style={styles.storyInfo}>
          <View style={styles.storyTopRow}>
            <View style={[styles.categoryBadge, { backgroundColor: item.categoryColor + '20' }]}>
              <Text style={[styles.categoryBadgeText, { color: item.categoryColor }]}>
                {item.categoryLabel}
              </Text>
            </View>
            <View style={[styles.statusBadge, item.status === 'completed' && styles.statusCompleted]}>
              <Text style={styles.statusText}>
                {item.status === 'completed' ? 'Completed' : 'Not Started'}
              </Text>
            </View>
          </View>

          <Text style={styles.storyTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.storyTitleBisaya} numberOfLines={1}>{item.titleBisaya}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={styles.metaText}>{item.readTime}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Ionicons name="book-outline" size={12} color={colors.textMuted} />
            <Text style={styles.metaText}>{item.pageCount} pages</Text>
          </View>

          <View style={styles.storyAction}>
            <Ionicons name="book" size={14} color={colors.primary} />
            <Text style={styles.storyActionText}>Read Story</Text>
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
  storyCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, marginBottom: spacing.lg, overflow: 'hidden', height: 170, ...shadows.cardLarge },
  coverWrapper: { width: 128, position: 'relative' },
  coverImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  offlineBadge: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 22, height: 22, borderRadius: radius.pill, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center' },
  storyInfo: { flex: 1, padding: spacing.lg, justifyContent: 'space-between' },
  storyTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  categoryBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  statusCompleted: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 10, fontWeight: '700', color: colors.textPrimary },
  storyTitle: { fontSize: typography.heading3, fontWeight: '700', color: colors.textPrimary },
  storyTitleBisaya: { fontSize: typography.bodySmall, fontStyle: 'italic', color: colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: 4 },
  metaText: { fontSize: typography.tiny, color: colors.textMuted, fontWeight: '500' },
  metaDot: { fontSize: typography.tiny, color: colors.textMuted, marginHorizontal: 2 },
  storyAction: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: 4 },
  storyActionText: { fontSize: typography.bodySmall, fontWeight: '700', color: colors.primary },
  emptyState: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyStateText: { fontSize: typography.bodyLarge, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.md },
});