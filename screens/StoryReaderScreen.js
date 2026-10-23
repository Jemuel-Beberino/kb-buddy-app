// screens/StoryReaderScreen.js
// Full story reader with bilingual text, images, tappable vocabulary, and custom story support

import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { allStories } from '../data/stories';
import { storyImages } from '../data/storyImages';
import { getCustomStories } from '../database/storyService';
import VocabularyPopup from '../components/VocabularyPopup';

export default function StoryReaderScreen({ route, navigation }) {
  const { storyId } = route.params || {};
  
  // 1. Try to find the story in the hardcoded list first
  const hardcodedStory = allStories.find((s) => s.id === storyId);
  
  const [story, setStory] = useState(hardcodedStory || null);
  const [loading, setLoading] = useState(!hardcodedStory);
  const [currentPage, setCurrentPage] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [language, setLanguage] = useState('both');

  // 2. If not found in hardcoded, fetch from database
  useEffect(() => {
    if (story) return; 

    async function fetchCustomStory() {
      try {
        const customs = await getCustomStories();
        const found = customs.find((s) => s.id === storyId);
        setStory(found || null);
      } catch (error) {
        console.error('Error fetching custom story:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomStory();
  }, [storyId, story]);

  // 3. Handle Loading State
  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading story...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // 4. Handle Story Not Found
  if (!story) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>Story not found.</Text>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.navButtonText}>← Back to Home</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const page = story.pages[currentPage];
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === story.pages.length - 1;

  // 5. Handle Image Logic (Custom vs Hardcoded)
  let pageImage = null;
  if (!story.isCustom && page.image) {
    const imagePathPrefix = page.image.split('/')[0];
    const pageImageArray = storyImages[imagePathPrefix];
    pageImage = pageImageArray ? pageImageArray[currentPage] : null;
  }

  // 6. Parse English text for vocabulary tapping
  const parsedEnglish = useMemo(() => {
    const parts = [];
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(page.englishText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: page.englishText.slice(lastIndex, match.index),
          isTappable: false,
        });
      }
      parts.push({
        text: match[1],
        isTappable: true,
      });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < page.englishText.length) {
      parts.push({
        text: page.englishText.slice(lastIndex),
        isTappable: false,
      });
    }
    return parts;
  }, [page]);

  const handleWordTap = (word) => {
    const vocab = page.vocabulary?.find(
      (v) => v.word.toLowerCase() === word.toLowerCase()
    );
    if (vocab) {
      setSelectedVocab(vocab);
      setPopupVisible(true);
    }
  };

  const goToPreviousPage = () => {
    if (!isFirstPage) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (!isLastPage) setCurrentPage(currentPage + 1);
  };

  const handleTakeQuiz = () => {
    navigation.navigate('Quiz', { storyId: story.id, title: story.title });
  };

  const progressPercent = ((currentPage + 1) / story.pages.length) * 100;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {story.title}
            </Text>
            <Text style={styles.headerSubtitle}>
              Page {currentPage + 1} of {story.pages.length}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Page Image */}
          {pageImage ? (
            <Image
              source={pageImage}
              style={styles.pageImage}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.pageImage, styles.pageImagePlaceholder]}>
              <Ionicons name="image-outline" size={48} color={colors.textMuted} />
              <Text style={styles.placeholderText}>Image not available</Text>
            </View>
          )}

          {/* Language Toggle */}
          <View style={styles.langToggleRow}>
            <TouchableOpacity
              style={[styles.langPill, language === 'english' && styles.langPillActive]}
              onPress={() => setLanguage('english')}
            >
              <Text style={[styles.langPillText, language === 'english' && styles.langPillTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langPill, language === 'bisaya' && styles.langPillActive]}
              onPress={() => setLanguage('bisaya')}
            >
              <Text style={[styles.langPillText, language === 'bisaya' && styles.langPillTextActive]}>
                Bisaya
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langPill, language === 'both' && styles.langPillActive]}
              onPress={() => setLanguage('both')}
            >
              <Text style={[styles.langPillText, language === 'both' && styles.langPillTextActive]}>
                Both
              </Text>
            </TouchableOpacity>
          </View>

          {/* Text Container */}
          <View style={styles.textCard}>
            {(language === 'english' || language === 'both') && (
              <View style={language === 'both' && styles.textBlockSpaced}>
                <Text style={styles.sectionLabel}>ENGLISH</Text>
                <Text style={styles.englishText}>
                  {parsedEnglish.map((part, index) =>
                    part.isTappable ? (
                      <Text
                        key={index}
                        style={styles.tappableWord}
                        onPress={() => handleWordTap(part.text)}
                      >
                        {part.text}
                      </Text>
                    ) : (
                      <Text key={index}>{part.text}</Text>
                    )
                  )}
                </Text>
              </View>
            )}

            {language === 'both' && <View style={styles.divider} />}

            {(language === 'bisaya' || language === 'both') && (
              <View style={language === 'both' && styles.textBlockSpaced}>
                <Text style={styles.sectionLabel}>BISAYA</Text>
                <Text style={styles.bisayaText}>{page.bisayaText}</Text>
              </View>
            )}
          </View>

          {/* Hint */}
          {page.vocabulary && page.vocabulary.length > 0 && (
            <View style={styles.hintCard}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
              <Text style={styles.hintText}>
                Tap <Text style={styles.hintBold}>underlined</Text> words to see their meaning.
              </Text>
            </View>
          )}

          {/* Story Info */}
          <View style={styles.storyMetaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="cloud-done-outline" size={14} color={colors.primary} />
              <Text style={styles.metaItemText}>Available Offline</Text>
            </View>
            <Text style={styles.metaItemText}>
              {page.vocabulary?.length || 0} words to explore
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.pageNavButton, isFirstPage && styles.pageNavButtonDisabled]}
            onPress={goToPreviousPage}
            disabled={isFirstPage}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={isFirstPage ? colors.textMuted : colors.primary}
            />
            <Text style={[styles.pageNavButtonText, isFirstPage && styles.pageNavButtonTextDisabled]}>
              Previous
            </Text>
          </TouchableOpacity>

          {isLastPage ? (
            <TouchableOpacity
              style={[styles.pageNavButton, styles.quizButton]}
              onPress={handleTakeQuiz}
              activeOpacity={0.8}
            >
              <Ionicons name="help-circle" size={20} color={colors.textOnAccent} />
              <Text style={styles.quizButtonText}>Take Quiz</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.pageNavButton, styles.pageNavButtonPrimary]}
              onPress={goToNextPage}
              activeOpacity={0.8}
            >
              <Text style={styles.pageNavButtonTextPrimary}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Vocabulary Popup */}
        <VocabularyPopup
          visible={popupVisible}
          vocabulary={selectedVocab}
          onClose={() => setPopupVisible(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.tiny,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.primarySoft,
    marginHorizontal: spacing.md,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.lg,
  },
  pageImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceMuted,
  },
  pageImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.sm,
  },
  langToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.lg,
    alignSelf: 'center',
    gap: 4,
    ...shadows.card,
  },
  langPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  langPillActive: {
    backgroundColor: colors.primary,
  },
  langPillText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  langPillTextActive: {
    color: colors.textLight,
  },
  textCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  textBlockSpaced: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.tiny,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  englishText: {
    fontSize: typography.bodyLarge,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  tappableWord: {
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  bisayaText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  hintText: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.textOnAccent,
  },
  hintBold: {
    fontWeight: '700',
    color: colors.textOnAccent,
  },
  storyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemText: {
    fontSize: typography.tiny,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  pageNavButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 4,
  },
  pageNavButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pageNavButtonDisabled: {
    opacity: 0.4,
  },
  pageNavButtonText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  pageNavButtonTextPrimary: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textLight,
  },
  pageNavButtonTextDisabled: {
    color: colors.textMuted,
  },
  quizButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    ...shadows.cardLarge,
  },
  quizButtonText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textOnAccent,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  navButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  navButtonText: {
    color: colors.textLight,
    fontSize: typography.body,
    fontWeight: '700',
  },
});