// components/VocabularyPopup.js
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, StyleSheet, Text, View, TouchableOpacity,
  TouchableWithoutFeedback, ScrollView, Animated, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { useSettings } from '../context/SettingsContext';

/* ------------------------------------------------------------------ */
/*  UI-only helpers                                                    */
/* ------------------------------------------------------------------ */

const LIP = 6;
const DARK = colors.primaryDark || colors.primary;

// Large tactile 3D button that sinks when pressed
function TactileButton({ onPress, children }) {
  const press = useRef(new Animated.Value(0)).current;
  const animateTo = (toValue) =>
    Animated.timing(press, { toValue, duration: 80, useNativeDriver: true }).start();
  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, LIP - 1] });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      accessibilityRole="button"
    >
      <View style={{ paddingBottom: LIP }}>
        <View style={[StyleSheet.absoluteFill, styles.buttonLip]} />
        <Animated.View style={[styles.buttonFace, { transform: [{ translateY }] }]}>
          {children}
        </Animated.View>
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */

export default function VocabularyPopup({ visible, vocabulary, onClose }) {
  const { soundEnabled } = useSettings();

  // UI-only animation state
  const [playing, setPlaying] = useState(false);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  // Card springs in when the modal opens
  useEffect(() => {
    if (visible) {
      cardAnim.setValue(0);
      Animated.spring(cardAnim, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(0);
      setPlaying(false);
    }
  }, [visible, cardAnim, pulse]);

  if (!vocabulary) return null;

  const handlePlayAudio = () => {
    if (!soundEnabled) return;

    Speech.stop();
    Speech.speak(vocabulary.word, { language: 'en-US', pitch: 1.0, rate: 0.85 });

    // Icon bounces three times while the word is spoken
    setPlaying(true);
    pulse.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]),
      { iterations: 3 }
    ).start(() => setPlaying(false));
  };

  const cardScale = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const iconScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  const audioIcon = !soundEnabled ? 'volume-mute' : playing ? 'volume-high' : 'volume-medium';

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.card, { opacity: cardAnim, transform: [{ scale: cardScale }] }]}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardContent}>

                {/* Header */}
                <View style={styles.headerRow}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="book" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.headerLabel}>Vocabulary help</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeIcon}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Hero word */}
                <View style={styles.hero}>
                  <Text style={styles.word} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    {vocabulary.word}
                  </Text>
                  {!!vocabulary.partOfSpeech && (
                    <View style={styles.posChip}>
                      <Text style={styles.posText}>{vocabulary.partOfSpeech}</Text>
                    </View>
                  )}
                </View>

                {/* Pronunciation pill */}
                <View style={styles.audioRow}>
                  <TouchableOpacity
                    style={[styles.audioPill, !soundEnabled && styles.audioPillMuted]}
                    activeOpacity={0.8}
                    onPress={handlePlayAudio}
                    accessibilityRole="button"
                    accessibilityLabel="Listen to pronunciation"
                  >
                    <View style={styles.audioIconWrap}>
                      <Animated.View
                        pointerEvents="none"
                        style={[styles.audioRing, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
                      />
                      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                        <Ionicons name={audioIcon} size={20} color={colors.textLight} />
                      </Animated.View>
                    </View>
                    <Text style={[styles.audioText, !soundEnabled && styles.audioTextMuted]}>
                      {soundEnabled ? 'Listen' : 'Sound is off'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* English: white panel */}
                <View style={styles.englishBox}>
                  <View style={styles.defLabelRow}>
                    <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
                    <Text style={styles.defLabel}>English</Text>
                  </View>
                  <Text style={styles.definition}>{vocabulary.englishDef}</Text>
                </View>

                {/* Bisaya: soft teal panel */}
                <View style={styles.bisayaBox}>
                  <View style={styles.defLabelRow}>
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.defLabel, { color: DARK }]}>Bisaya</Text>
                  </View>
                  <Text style={styles.definition}>{vocabulary.bisayaDef}</Text>
                </View>

                {/* Example */}
                {vocabulary.example && (
                  <View style={styles.exampleBox}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textOnAccent} style={styles.exampleIcon} />
                    <View style={styles.exampleBody}>
                      <Text style={styles.exampleLabel}>Example</Text>
                      <Text style={styles.exampleText}>{vocabulary.example}</Text>
                    </View>
                  </View>
                )}

                {/* Tactile close button */}
                <View style={styles.buttonWrap}>
                  <TactileButton onPress={onClose}>
                    <Ionicons name="arrow-back" size={20} color={colors.textLight} />
                    <Text style={styles.closeButtonText}>Return to Story</Text>
                  </TactileButton>
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: spacing.lg,
  },

  // Floating flashcard with soft drop shadow
  card: {
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderRadius: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 16,
  },
  cardContent: { padding: spacing.xl },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBadge: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center' },
  headerLabel: { flex: 1, fontSize: typography.body, fontWeight: '700', color: colors.textSecondary },
  closeIcon: { width: 36, height: 36, borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceMuted },

  // Hero word
  hero: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  word: { fontSize: 48, lineHeight: 56, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  posChip: { marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  posText: { fontSize: typography.body, fontStyle: 'italic', color: colors.textSecondary },

  // Pronunciation pill
  audioRow: { alignItems: 'center', marginBottom: spacing.lg },
  audioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  audioPillMuted: { borderColor: colors.surfaceMuted, backgroundColor: colors.surfaceMuted },
  audioIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  audioRing: { position: 'absolute', width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary },
  audioText: { fontSize: typography.body, fontWeight: '700', color: colors.primary },
  audioTextMuted: { color: colors.textMuted },

  // Definitions
  englishBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg || radius.md,
    borderWidth: 1.5,
    borderColor: colors.border || colors.surfaceMuted,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bisayaBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg || radius.md,
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
    padding: spacing.md,
  },
  defLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  defLabel: { fontSize: typography.body, fontWeight: '700', color: colors.textSecondary },
  definition: { fontSize: typography.bodyLarge, color: colors.textPrimary, lineHeight: 25 },

  // Example
  exampleBox: { flexDirection: 'row', backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, gap: spacing.sm },
  exampleIcon: { marginTop: 2 },
  exampleBody: { flex: 1 },
  exampleLabel: { fontSize: typography.body, fontWeight: '700', color: colors.textOnAccent, marginBottom: 2 },
  exampleText: { fontSize: typography.body, fontStyle: 'italic', color: colors.textOnAccent, lineHeight: 22 },

  // Tactile button
  buttonWrap: { marginTop: spacing.xl },
  buttonLip: { top: LIP, backgroundColor: DARK, borderRadius: radius.pill },
  buttonFace: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 58,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
  },
  closeButtonText: { color: colors.textLight, fontSize: typography.bodyLarge, fontWeight: '800' },
});