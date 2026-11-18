// screens/ProfileScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { useSettings } from '../context/SettingsContext';

const LANGUAGES = ['English', 'Bisaya', 'Both'];
const TEXT_SIZES = ['Small', 'Medium', 'Large'];

// iOS-style segmented control
function Segmented({ options, isActive, onSelect }) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = isActive(option);
        return (
          <TouchableOpacity
            key={option}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onSelect(option)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Small colored icon tile, like iOS Settings
function IconTile({ name, tint }) {
  return (
    <View style={[styles.iconTile, { backgroundColor: tint }]}>
      <Ionicons name={name} size={16} color={colors.textLight} />
    </View>
  );
}

export default function ProfileScreen({ route, navigation }) {
  const learnerName = route?.params?.learnerName || 'Learner';
  const learnerId = route?.params?.learnerId || 'KS-12345';

  const { textSize, updateTextSize, soundEnabled, updateSoundEnabled } = useSettings();

  // Local only for now (not saved). Move into SettingsContext to persist it.
  const [language, setLanguage] = useState('Both');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header: floating gradient card */}
          <View style={styles.headerShadow}>
            <View style={styles.headerCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.22)', 'rgba(0,0,0,0.18)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.owlCircle}>
                <Text style={styles.profileEmoji}>🦉</Text>
              </View>
              <Text style={styles.profileName}>{learnerName}</Text>
              <Text style={styles.profileId}>Learner ID: {learnerId}</Text>
              <View style={styles.offlinePill}>
                <Ionicons name="cloud-done-outline" size={12} color={colors.textLight} />
                <Text style={styles.offlinePillText}>Offline-ready</Text>
              </View>
            </View>
          </View>

          {/* Learning preferences: grouped, iOS style */}
          <Text style={styles.groupLabel}>Learning preferences</Text>
          <View style={styles.group}>
            <View style={styles.row}>
              <View style={styles.rowTop}>
                <IconTile name="language-outline" tint={colors.primary} />
                <Text style={styles.rowLabel}>Display language</Text>
              </View>
              <Segmented
                options={LANGUAGES}
                isActive={(o) => language === o}
                onSelect={setLanguage}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.rowInline}>
              <View style={styles.rowTop}>
                <IconTile name="volume-medium-outline" tint="#F59E0B" />
                <Text style={styles.rowLabel}>Sound effects</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={updateSoundEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                ios_backgroundColor={colors.border}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowTop}>
                <IconTile name="text-outline" tint="#10B981" />
                <Text style={styles.rowLabel}>Reading text size</Text>
              </View>
              <Segmented
                options={TEXT_SIZES}
                isActive={(o) => textSize === o.toLowerCase()}
                onSelect={(o) => updateTextSize(o.toLowerCase())}
              />
            </View>
          </View>

          {/* Offline info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.infoTitle}>Offline information</Text>
              <Text style={styles.infoText}>
                Downloaded stories, saved progress, and completed quizzes remain accessible without
                internet.
              </Text>
            </View>
          </View>

          {/* Pushes logout to the bottom on tall screens */}
          <View style={styles.spacer} />

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxl },

  // header
  headerShadow: {
    marginBottom: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  headerCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
  },
  owlCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileEmoji: { fontSize: 52 },
  profileName: { fontSize: typography.heading2, fontWeight: '700', color: colors.textLight },
  profileId: { fontSize: typography.body, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginTop: spacing.md,
  },
  offlinePillText: { fontSize: typography.tiny, color: colors.textLight, fontWeight: '600' },

  // grouped settings
  groupLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  row: { padding: spacing.lg },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowLabel: { fontSize: typography.body, color: colors.textPrimary, fontWeight: '600' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 30 + spacing.md, // aligns with label text, past the icon tile
  },
  iconTile: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // segmented control
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 3,
    marginTop: spacing.md,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md - 2,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: { fontSize: typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  segmentTextActive: { color: colors.primary },

  // info
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  infoTitle: { fontSize: typography.body, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  infoText: { fontSize: typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },

  // logout
  spacer: { flex: 1, minHeight: spacing.xl },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  logoutText: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.error },
});