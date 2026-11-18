// screens/StoryReaderScreen.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Image, StatusBar, ActivityIndicator, Animated, Pressable,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { allStories } from '../data/stories';
import { storyImages } from '../data/storyImages';
import { getCustomStories } from '../database/storyService';
import VocabularyPopup from '../components/VocabularyPopup';
import { useSettings } from '../context/SettingsContext'; // <-- Import

/* ------------------------------------------------------------------ */
/*  UI-only helpers                                                    */
/* ------------------------------------------------------------------ */

const LIP = 5;
const PAPER = '#FFFDF7';
const PAPER_BORDER = '#F1EAD7';

// Tactile bottom-bar button: coloured lip underneath, face sinks on press
const NAV_VARIANTS = {
  light: { face: colors.surface, border: colors.border, lip: '#CBD5E1', text: colors.primary },
  primary: { face: colors.primary, border: colors.primary, lip: colors.primaryDark, text: colors.textLight },
  accent: { face: colors.accent, border: colors.accent, lip: colors.accentDark, text: colors.textOnAccent },
};

function NavButton({ label, variant, iconLeft, iconRight, onPress, disabled }) {
  const v = NAV_VARIANTS[variant];
  const press = useRef(new Animated.Value(0)).current;
  const animateTo = (toValue) =>
    Animated.timing(press, { toValue, duration: 80, useNativeDriver: true }).start();
  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, LIP - 1] });
  const contentColor = disabled ? colors.textMuted : v.text;

  return (
    <Pressable
      style={styles.navButtonWrap}
      onPress={onPress}
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
    >
      <View style={{ paddingBottom: LIP, opacity: disabled ? 0.5 : 1 }}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { top: LIP, backgroundColor: v.lip, borderRadius: radius.pill },
          ]}
        />
        <Animated.View
          style={[
            styles.navButtonFace,
            { backgroundColor: v.face, borderColor: v.border, transform: [{ translateY }] },
          ]}
        >
          {iconLeft ? <Ionicons name={iconLeft} size={20} color={contentColor} /> : null}
          <Text style={[styles.navButtonLabel, { color: contentColor }]}>{label}</Text>
          {iconRight ? <Ionicons name={iconRight} size={20} color={contentColor} /> : null}
        </Animated.View>
      </View>
    </Pressable>
  );
}

// Little audio-wave bars that animate only while speech is playing
function EqBars({ active }) {
  const bars = useRef([0, 1, 2, 3].map(() => new Animated.Value(0.35))).current;

  useEffect(() => {
    if (!active) {
      bars.forEach((b) => b.setValue(0.35));
      return undefined;
    }
    const loops = bars.map((b, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(b, { toValue: 1, duration: 280 + i * 90, useNativeDriver: true }),
          Animated.timing(b, { toValue: 0.3, duration: 280 + i * 90, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, bars]);

  return (
    <View style={styles.eq}>
      {bars.map((b, i) => (
        <Animated.View key={i} style={[styles.eqBar, { transform: [{ scaleY: b }] }]} />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */

export default function StoryReaderScreen({ route, navigation }) {
  const { storyId, learnerId } = route.params || {}; 
  const { textSize } = useSettings(); // <-- Get font size setting
  
  const hardcodedStory = allStories.find((s) => s.id === storyId);
  const [story, setStory] = useState(hardcodedStory || null);
  const [loading, setLoading] = useState(!hardcodedStory);
  const [currentPage, setCurrentPage] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [language, setLanguage] = useState('both');
  const [isPlaying, setIsPlaying] = useState(false); 

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

  useEffect(() => {
    return () => { Speech.stop(); };
  }, [currentPage]);

  if (loading) { return ( <SafeAreaProvider><SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.primary} /></SafeAreaView></SafeAreaProvider> ); }
  if (!story) { return ( <SafeAreaProvider><SafeAreaView style={styles.container}><View style={styles.errorContent}><Text style={styles.errorText}>Story not found.</Text><TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}><Text style={styles.navButtonText}>← Back to Home</Text></TouchableOpacity></View></SafeAreaView></SafeAreaProvider> ); }

  const page = story.pages[currentPage];
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === story.pages.length - 1;

  let pageImage = null;
  if (!story.isCustom && page.image) {
    const imagePathPrefix = page.image.split('/')[0];
    const pageImageArray = storyImages[imagePathPrefix];
    pageImage = pageImageArray ? pageImageArray[currentPage] : null;
  }

  const parsedEnglish = useMemo(() => {
    const parts = [];
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(page.englishText)) !== null) {
      if (match.index > lastIndex) { parts.push({ text: page.englishText.slice(lastIndex, match.index), isTappable: false }); }
      parts.push({ text: match[1], isTappable: true });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < page.englishText.length) { parts.push({ text: page.englishText.slice(lastIndex), isTappable: false }); }
    return parts;
  }, [page]);

  const handleWordTap = (word) => {
    const vocab = page.vocabulary?.find((v) => v.word.toLowerCase() === word.toLowerCase());
    if (vocab) { setSelectedVocab(vocab); setPopupVisible(true); }
  };

  const handleReadAloud = () => {
    if (isPlaying) { Speech.stop(); setIsPlaying(false); return; }
    const cleanEnglish = page.englishText.replace(/[\[\]]/g, '');
    let textToRead = '';
    if (language === 'english') textToRead = cleanEnglish;
    else if (language === 'bisaya') textToRead = page.bisayaText;
    else textToRead = `${cleanEnglish} ... ${page.bisayaText}`; 

    setIsPlaying(true);
    Speech.speak(textToRead, {
      language: 'en-US', pitch: 1.0, rate: 0.85,
      onDone: () => setIsPlaying(false), onStopped: () => setIsPlaying(false), onError: () => setIsPlaying(false),
    });
  };

  const goToPreviousPage = () => { if (!isFirstPage) setCurrentPage(currentPage - 1); };
  const goToNextPage = () => { if (!isLastPage) setCurrentPage(currentPage + 1); };
  
  const handleTakeQuiz = () => {
    Speech.stop(); 
    navigation.navigate('Quiz', { storyId: story.id, title: story.title, learnerId: learnerId });
  };

  const progressPercent = ((currentPage + 1) / story.pages.length) * 100;

  // Dynamic Font Size
  let dynamicFontSize = typography.bodyLarge; 
  if (textSize === 'small') dynamicFontSize = typography.body; 
  if (textSize === 'large') dynamicFontSize = typography.heading2;

  // Display-only: what the player will read
  const playerSubtitle =
    language === 'both' ? 'English + Bisaya' : language === 'english' ? 'English' : 'Bisaya';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => { Speech.stop(); navigation.goBack(); }}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{story.title}</Text>
            <Text style={styles.headerSubtitle}>Page {currentPage + 1} of {story.pages.length}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.readerArea}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Illustration */}
            <View style={styles.imageFrame}>
              {pageImage ? (
                <Image source={pageImage} style={styles.pageImage} resizeMode="cover" />
              ) : (
                <View style={[styles.pageImage, styles.pageImagePlaceholder]}>
                  <Ionicons name="image-outline" size={48} color={colors.textMuted} />
                  <Text style={styles.placeholderText}>Image not available</Text>
                </View>
              )}
            </View>

            {/* Segmented control */}
            <View style={styles.segmentTrack}>
              {[
                ['english', 'English'],
                ['bisaya', 'Bisaya'],
                ['both', 'Both'],
              ].map(([key, label]) => {
                const active = language === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.segment, active && styles.segmentActive]}
                    activeOpacity={0.85}
                    onPress={() => { setLanguage(key); Speech.stop(); setIsPlaying(false); }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* The "page" */}
            <View style={styles.pageCard}>
              <View style={styles.bookmark} />

              {(language === 'english' || language === 'both') && (
                <View style={language === 'both' && styles.textBlockSpaced}>
                  <View style={styles.sectionLabelRow}>
                    <View style={[styles.labelDot, { backgroundColor: colors.primary }]} />
                    <Text style={styles.sectionLabel}>ENGLISH</Text>
                  </View>
                  {/* Apply Dynamic Font Size Here */}
                  <Text style={[styles.englishText, { fontSize: dynamicFontSize, lineHeight: dynamicFontSize * 1.6 }]}>
                    {parsedEnglish.map((part, index) => part.isTappable ? (
                      <Text key={index} style={styles.tappableWord} onPress={() => handleWordTap(part.text)}>{part.text}</Text>
                    ) : (
                      <Text key={index}>{part.text}</Text>
                    ))}
                  </Text>
                </View>
              )}

              {language === 'both' && (
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerDot} />
                  <View style={styles.dividerLine} />
                </View>
              )}

              {(language === 'bisaya' || language === 'both') && (
                <View style={language === 'both' && styles.textBlockSpaced}>
                  <View style={styles.sectionLabelRow}>
                    <View style={[styles.labelDot, { backgroundColor: colors.accentDark }]} />
                    <Text style={styles.sectionLabel}>BISAYA</Text>
                  </View>
                  {/* Apply Dynamic Font Size Here Too */}
                  <Text style={[styles.bisayaText, { fontSize: dynamicFontSize - 1, lineHeight: (dynamicFontSize - 1) * 1.6 }]}>{page.bisayaText}</Text>
                </View>
              )}

              <Text style={styles.folio}>— {currentPage + 1} —</Text>
            </View>

            {page.vocabulary && page.vocabulary.length > 0 && (
              <View style={styles.hintCard}>
                <Ionicons name="bulb-outline" size={18} color={colors.accentDark} />
                <Text style={styles.hintText}>Tap <Text style={styles.hintBold}>underlined</Text> words to see their meaning.</Text>
              </View>
            )}

            <View style={styles.storyMetaRow}>
              <View style={styles.metaChip}>
                <Ionicons name="cloud-done-outline" size={14} color={colors.primary} />
                <Text style={styles.metaItemText}>Available Offline</Text>
              </View>
              <Text style={styles.metaItemText}>{page.vocabulary?.length || 0} words to explore</Text>
            </View>
          </ScrollView>

          {/* Floating media player */}
          <TouchableOpacity
            style={styles.player}
            activeOpacity={0.92}
            onPress={handleReadAloud}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Stop Reading' : 'Read Aloud'}
          >
            <View style={[styles.playBtn, isPlaying && styles.playBtnActive]}>
              <Ionicons
                name={isPlaying ? 'stop' : 'play'}
                size={20}
                color={isPlaying ? colors.primaryDark : colors.textOnAccent}
                style={!isPlaying && { marginLeft: 2 }}
              />
            </View>
            <View style={styles.playerText}>
              <Text style={styles.playerTitle}>{isPlaying ? 'Stop Reading' : 'Read Aloud'}</Text>
              <Text style={styles.playerSub}>{playerSubtitle}</Text>
            </View>
            <EqBars active={isPlaying} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomBar}>
          <NavButton
            variant="light"
            label="Previous"
            iconLeft="chevron-back"
            onPress={goToPreviousPage}
            disabled={isFirstPage}
          />
          {isLastPage ? (
            <NavButton
              variant="accent"
              label="Take Quiz"
              iconLeft="help-circle"
              onPress={handleTakeQuiz}
            />
          ) : (
            <NavButton
              variant="primary"
              label="Next"
              iconRight="chevron-forward"
              onPress={goToNextPage}
            />
          )}
        </View>

        <VocabularyPopup visible={popupVisible} vocabulary={selectedVocab} onClose={() => setPopupVisible(false)} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  headerBackButton: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadows.card },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm },
  headerTitle: { fontSize: typography.bodyLarge, fontFamily: typography.fontBold, color: colors.textPrimary },
  headerSubtitle: { fontSize: typography.tiny, fontFamily: typography.fontSemiBold, color: colors.textSecondary, marginTop: 1 },
  headerSpacer: { width: 42 },
  progressTrack: { height: 8, backgroundColor: colors.primarySoft, marginHorizontal: spacing.lg, marginBottom: spacing.xs, borderRadius: radius.pill, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },

  // Reading area
  readerArea: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 112 }, // room for the floating player

  imageFrame: { borderRadius: radius.xl, backgroundColor: colors.surface, marginBottom: spacing.lg, ...shadows.cardLarge },
  pageImage: { width: '100%', height: 240, borderRadius: radius.xl, backgroundColor: colors.surfaceMuted },
  pageImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: colors.textMuted, fontSize: typography.caption, fontFamily: typography.fontRegular, marginTop: spacing.sm },

  // Segmented control
  segmentTrack: { flexDirection: 'row', backgroundColor: colors.primarySoft, borderRadius: radius.pill, padding: 4, marginBottom: spacing.lg },
  segment: { flex: 1, minHeight: 42, borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center' },
  segmentActive: { backgroundColor: colors.surface, ...shadows.card },
  segmentText: { fontSize: typography.bodySmall, fontFamily: typography.fontSemiBold, color: colors.primaryDark, opacity: 0.7 },
  segmentTextActive: { fontFamily: typography.fontBold, color: colors.primaryDark, opacity: 1 },

  // Paper page
  pageCard: {
    backgroundColor: PAPER,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: PAPER_BORDER,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  bookmark: {
    position: 'absolute',
    top: -1,
    right: spacing.xl,
    width: 18,
    height: 30,
    backgroundColor: colors.accent,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  textBlockSpaced: { marginBottom: spacing.md },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  labelDot: { width: 8, height: 8, borderRadius: 4 },
  sectionLabel: { fontSize: typography.tiny, fontFamily: typography.fontSemiBold, color: colors.textSecondary, letterSpacing: 1.5 },
  englishText: { fontFamily: typography.fontRegular, color: colors.textPrimary }, // Font size applied inline
  tappableWord: {
    fontFamily: typography.fontBold,
    color: colors.primaryDark,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    textDecorationLine: 'underline',
    textDecorationColor: colors.accentDark,
  },
  bisayaText: { fontFamily: typography.fontRegular, color: colors.textSecondary, fontStyle: 'italic' }, // Font size applied inline
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: PAPER_BORDER },
  dividerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  folio: { textAlign: 'center', fontSize: typography.tiny, fontFamily: typography.fontSemiBold, color: colors.textMuted, marginTop: spacing.md },

  // Hint + meta
  hintCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: radius.lg, borderWidth: 1, borderColor: '#FDE68A', padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
  hintText: { flex: 1, fontSize: typography.bodySmall, fontFamily: typography.fontRegular, color: colors.textOnAccent },
  hintBold: { fontFamily: typography.fontBold, color: colors.primaryDark, backgroundColor: 'rgba(251, 191, 36, 0.3)', textDecorationLine: 'underline' },
  storyMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  metaItemText: { fontSize: typography.tiny, fontFamily: typography.fontSemiBold, color: colors.textSecondary },

  // Floating media player
  player: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xl,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  playBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  playBtnActive: { backgroundColor: colors.surface },
  playerText: { flex: 1 },
  playerTitle: { fontSize: typography.body, fontFamily: typography.fontBold, color: colors.textLight },
  playerSub: { fontSize: typography.tiny, fontFamily: typography.fontRegular, color: 'rgba(255,255,255,0.8)' },
  eq: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 24 },
  eqBar: { width: 4, height: 22, borderRadius: 2, backgroundColor: colors.accent },

  // Bottom bar
  bottomBar: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.md },
  navButtonWrap: { flex: 1 },
  navButtonFace: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, minHeight: 52, borderRadius: radius.pill, borderWidth: 2 },
  navButtonLabel: { fontSize: typography.bodyLarge, fontFamily: typography.fontBold },

  // Error state
  errorContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  errorText: { fontSize: typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  navButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.pill },
  navButtonText: { color: colors.textLight, fontSize: typography.body, fontWeight: '700' },
});