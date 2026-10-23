// screens/WelcomeScreen.js
// Landing screen with learner/teacher role selection

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

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

          <TouchableOpacity
            style={styles.roleCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('TeacherLogin')}
          >
            <View style={styles.roleIconContainer}>
              <Ionicons name="book" size={28} color={colors.textLight} />
            </View>
            <Text style={styles.roleTitle}>I'm a Learner</Text>
            <Text style={styles.roleSubtitle}>Read stories & learn new words</Text>
            <View style={styles.demoPill}>
              <MaterialCommunityIcons
                name="star-four-points"
                size={12}
                color={colors.textOnAccent}
              />
              <Text style={styles.demoPillText}>Demo: KS-12345 / 1234</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, styles.roleCardDark]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Login')}
          >
            <View style={styles.roleIconContainer}>
              <MaterialCommunityIcons
                name="school"
                size={28}
                color={colors.textLight}
              />
            </View>
            <Text style={styles.roleTitle}>I'm a Teacher</Text>
            <Text style={styles.roleSubtitle}>Manage stories & support learners</Text>
            <View style={styles.demoPill}>
              <MaterialCommunityIcons
                name="star-four-points"
                size={12}
                color={colors.textOnAccent}
              />
              <Text style={styles.demoPillText}>Demo: teacher@demo</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>5</Text>
              <Text style={styles.statPillLabel}>Stories</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>12</Text>
              <Text style={styles.statPillLabel}>Words Learned</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>80%</Text>
              <Text style={styles.statPillLabel}>Latest Quiz</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.instantDemoButton}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('MainTabs', { learnerName: 'Sofia' })
            }
          >
            <MaterialCommunityIcons
              name="star-four-points"
              size={20}
              color={colors.textOnAccent}
            />
            <Text style={styles.instantDemoText}>
              Instant Demo — Skip to Home
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.textOnAccent} />
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Downloaded stories and progress stay accessible without internet.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  owlBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  owlEmoji: {
    fontSize: 22,
  },
  appName: {
    flex: 1,
    fontSize: typography.heading3,
    fontWeight: '700',
    color: colors.primary,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.success,
  },
  offlineText: {
    fontSize: typography.tiny,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: typography.displayLarge,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroTitleAccent: {
    color: colors.primary,
  },
  heroSubtitle: {
    fontSize: typography.heading3,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroDescription: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  roleCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.cardLarge,
  },
  roleCardDark: {
    backgroundColor: colors.primaryDark,
  },
  roleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roleTitle: {
    fontSize: typography.heading2,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: typography.body,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: spacing.md,
  },
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
    fontWeight: '600',
    color: colors.textOnAccent,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  statPillValue: {
    fontSize: typography.heading2,
    fontWeight: '700',
    color: colors.primary,
  },
  statPillLabel: {
    fontSize: typography.tiny,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  instantDemoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    gap: spacing.sm,
    ...shadows.cardLarge,
  },
  instantDemoText: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    color: colors.textOnAccent,
  },
  footerNote: {
    fontSize: typography.tiny,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 16,
  },
});