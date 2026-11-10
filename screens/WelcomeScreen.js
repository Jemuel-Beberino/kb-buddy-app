// screens/WelcomeScreen.js
import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';

// `displayLarge` isn't defined in theme.js, so the old hero title had no font size.
// Add `displayLarge: 32` to typography if you want to control it from the theme.
const HERO_SIZE = typography.displayLarge ?? 32;
const LIP = 5; // depth of the "3D" bottom edge on tactile buttons

/**
 * Duolingo-style tactile button: a coloured "lip" sits under the face,
 * and the face sinks into it while pressed. Uses the built-in Animated API only.
 */
function Tactile({ onPress, lipColor, borderRadius, lipShadow, accessibilityLabel, children }) {
  const press = useRef(new Animated.Value(0)).current;

  const animateTo = (toValue) =>
    Animated.timing(press, { toValue, duration: 80, useNativeDriver: true }).start();

  const translateY = press.interpolate({
    inputRange: [0, 1],
    outputRange: [0, LIP - 1],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={{ paddingBottom: LIP }}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { top: LIP, backgroundColor: lipColor, borderRadius },
            lipShadow,
          ]}
        />
        <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>
      </View>
    </Pressable>
  );
}

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primarySoft} />

        {/* Soft gradient wash behind the top of the screen */}
        <LinearGradient
          colors={[colors.primarySoft, colors.background]}
          style={styles.topGradient}
          pointerEvents="none"
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.appHeader}>
            <View style={styles.owlBadge}>
              <Text style={styles.owlEmoji}>🦉</Text>
            </View>
            <Text style={styles.appName}>KB Buddy</Text>
            <View style={styles.offlineBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.offlineText}>Offline Mode Ready</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            KB Buddy: <Text style={styles.heroTitleAccent}>Klaro Basa</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Read. Understand. Learn in Bisaya.
          </Text>
          <Text style={styles.heroDescription}>
            A fun way to read stories, understand new words, and learn in English and Bisaya.
          </Text>

          {/* LEARNER CARD - Goes to 'Login' */}
          <View style={styles.learnerWrap}>
            <Tactile
              onPress={() => navigation.navigate('Login')}
              lipColor={colors.primaryDark}
              borderRadius={radius.xl}
              lipShadow={styles.learnerShadow}
              accessibilityLabel="I'm a Learner. Read stories and learn new words."
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.learnerFace}
              >
                {/* decorative bubbles (pure Views, no images) */}
                <View style={styles.bubbleLarge} />
                <View style={styles.bubbleSmall} />

                <View style={styles.learnerIconBadge}>
                  <Ionicons name="book" size={30} color={colors.primary} />
                </View>
                <Text style={styles.learnerTitle}>I'm a Learner</Text>
                <Text style={styles.learnerSubtitle}>Read stories & learn new words</Text>

                <View style={styles.learnerFooter}>
                  <View style={styles.demoPill}>
                    <MaterialCommunityIcons name="star-four-points" size={12} color={colors.textOnAccent} />
                    <Text style={styles.demoPillText}>Demo: KS-12345 / 1234</Text>
                  </View>
                  <View style={styles.goCircle}>
                    <Ionicons name="arrow-forward" size={20} color={colors.primaryDark} />
                  </View>
                </View>
              </LinearGradient>
            </Tactile>
          </View>

          {/* TEACHER CARD - Goes to 'TeacherLogin' */}
          <View style={styles.teacherWrap}>
            <Tactile
              onPress={() => navigation.navigate('TeacherLogin')}
              lipColor={colors.primaryLight}
              borderRadius={radius.xl}
              accessibilityLabel="I'm a Teacher. Manage stories and support learners."
            >
              <View style={styles.teacherFace}>
                <View style={styles.teacherIconBadge}>
                  <MaterialCommunityIcons name="school" size={28} color={colors.primary} />
                </View>
                <View style={styles.teacherText}>
                  <Text style={styles.teacherTitle}>I'm a Teacher</Text>
                  <Text style={styles.teacherSubtitle}>Manage stories & support learners</Text>
                  <View style={styles.demoPill}>
                    <MaterialCommunityIcons name="star-four-points" size={12} color={colors.textOnAccent} />
                    <Text style={styles.demoPillText}>Demo: teacher@demo</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
              </View>
            </Tactile>
          </View>

          {/* Metrics: one card, three columns */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.primarySoft }]}>
                <MaterialCommunityIcons name="book-open-variant" size={18} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Stories</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.accentSoft }]}>
                <MaterialCommunityIcons name="lightbulb-on" size={18} color={colors.accentDark} />
              </View>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Words Learned</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.14)' }]}>
                <MaterialCommunityIcons name="trophy" size={18} color={colors.success} />
              </View>
              <Text style={styles.statValue}>80%</Text>
              <Text style={styles.statLabel}>Latest Quiz</Text>
            </View>
          </View>

          <View style={styles.demoWrap}>
            <Tactile
              onPress={() => navigation.navigate('MainTabs', { learnerName: 'Sofia' })}
              lipColor={colors.accentDark}
              borderRadius={radius.pill}
              lipShadow={styles.demoShadow}
              accessibilityLabel="Instant Demo. Skip to Home."
            >
              <View style={styles.instantDemoFace}>
                <MaterialCommunityIcons name="star-four-points" size={20} color={colors.textOnAccent} />
                <Text style={styles.instantDemoText}>Instant Demo — Skip to Home</Text>
                <View style={styles.demoArrow}>
                  <Ionicons name="arrow-forward" size={18} color={colors.textOnAccent} />
                </View>
              </View>
            </Tactile>
          </View>

          <View style={styles.footerRow}>
            <Ionicons name="cloud-offline-outline" size={14} color={colors.textMuted} />
            <Text style={styles.footerNote}>
              Downloaded stories and progress stay accessible without internet.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 380 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },

  // Header
  appHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  owlBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    ...shadows.card,
  },
  owlEmoji: { fontSize: 24 },
  appName: { flex: 1, fontSize: typography.heading3, fontFamily: typography.fontBold, color: colors.primaryDark },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  offlineText: { fontSize: typography.tiny, fontFamily: typography.fontSemiBold, color: '#047857', marginLeft: 4 },

  // Hero
  heroTitle: {
    fontSize: HERO_SIZE,
    lineHeight: HERO_SIZE + 8,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroTitleAccent: { color: colors.primary },
  heroSubtitle: {
    fontSize: typography.heading3,
    fontFamily: typography.fontSemiBold,
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroDescription: {
    fontSize: typography.body,
    fontFamily: typography.fontRegular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },

  // Learner card (primary action)
  learnerWrap: { marginBottom: spacing.lg },
  learnerShadow: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
  },
  learnerFace: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  bubbleLarge: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  bubbleSmall: {
    position: 'absolute',
    top: 70,
    right: 50,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  learnerIconBadge: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  learnerTitle: {
    fontSize: 24,
    fontFamily: typography.fontBold,
    color: colors.textLight,
    marginBottom: 2,
  },
  learnerSubtitle: {
    fontSize: typography.body,
    fontFamily: typography.fontRegular,
    color: 'rgba(255, 255, 255, 0.92)',
    marginBottom: spacing.lg,
  },
  learnerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Shared demo pill
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  demoPillText: {
    fontSize: typography.tiny,
    fontFamily: typography.fontSemiBold,
    color: colors.textOnAccent,
    marginLeft: 4,
  },

  // Teacher card (secondary action)
  teacherWrap: { marginBottom: spacing.lg },
  teacherFace: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    padding: spacing.lg,
  },
  teacherIconBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  teacherText: { flex: 1, marginRight: spacing.sm },
  teacherTitle: { fontSize: typography.bodyLarge + 2, fontFamily: typography.fontBold, color: colors.textPrimary },
  teacherSubtitle: {
    fontSize: typography.caption,
    fontFamily: typography.fontRegular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  // Metrics
  statsCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { fontSize: typography.heading1, lineHeight: 30, fontFamily: typography.fontBold, color: colors.textPrimary },
  statLabel: {
    fontSize: typography.tiny,
    fontFamily: typography.fontRegular,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: { width: 1, backgroundColor: colors.border, marginVertical: spacing.xs },

  // Instant demo button
  demoWrap: { marginBottom: spacing.sm },
  demoShadow: {
    shadowColor: colors.accentDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  instantDemoFace: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    gap: spacing.sm,
  },
  instantDemoText: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.bodyLarge,
    fontFamily: typography.fontBold,
    color: colors.textOnAccent,
  },
  demoArrow: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(120, 53, 15, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  footerNote: {
    flexShrink: 1,
    fontSize: typography.tiny,
    fontFamily: typography.fontRegular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});