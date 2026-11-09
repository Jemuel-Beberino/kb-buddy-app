// screens/ProfileScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';

export default function ProfileScreen({ route, navigation }) {
  const learnerName = route?.params?.learnerName || 'Learner';
  const learnerId = route?.params?.learnerId || 'KS-12345';

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('both');
  const [textSize, setTextSize] = useState('medium');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileEmoji}>🦉</Text>
            <Text style={styles.profileName}>{learnerName}</Text>
            <Text style={styles.profileId}>Learner ID: {learnerId}</Text>
            <View style={styles.offlinePill}>
              <Ionicons name="cloud-done-outline" size={12} color={colors.textLight} />
              <Text style={styles.offlinePillText}>Offline-Ready</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Preferences</Text>

            <Text style={styles.subLabel}>Preferred Display Language</Text>
            <View style={styles.pillRow}>
              {['English', 'Bisaya', 'Both'].map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.pill, language === l.toLowerCase() && styles.pillActive]}
                  onPress={() => setLanguage(l.toLowerCase())}
                >
                  <Text style={[styles.pillText, language === l.toLowerCase() && styles.pillTextActive]}>
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Ionicons name="volume-medium-outline" size={20} color={colors.textPrimary} />
                <Text style={styles.rowLabel}>Sound Effects</Text>
              </View>
              <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ true: colors.primary }} />
            </View>

            <Text style={styles.subLabel}>Reading Text Size</Text>
            <View style={styles.pillRow}>
              {['Small', 'Medium', 'Large'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, textSize === s.toLowerCase() && styles.pillActive]}
                  onPress={() => setTextSize(s.toLowerCase())}
                >
                  <Text style={[styles.pillText, textSize === s.toLowerCase() && styles.pillTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.infoTitle}>Offline Information</Text>
              <Text style={styles.infoText}>
                Downloaded stories, saved progress, and completed quizzes remain accessible without internet.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Welcome')}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  profileHeader: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg, ...shadows.cardLarge },
  profileEmoji: { fontSize: 64, marginBottom: spacing.sm },
  profileName: { fontSize: typography.heading2, fontWeight: '700', color: colors.textLight },
  profileId: { fontSize: typography.body, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  offlinePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4, marginTop: spacing.md },
  offlinePillText: { fontSize: typography.tiny, color: colors.textLight, fontWeight: '600' },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card },
  sectionTitle: { fontSize: typography.heading3, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  subLabel: { fontSize: typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.sm, fontWeight: '600' },
  pillRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  pill: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  pillTextActive: { color: colors.textLight },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  rowLabel: { fontSize: typography.body, color: colors.textPrimary, fontWeight: '600' },
  infoCard: { flexDirection: 'row', backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  infoTitle: { fontSize: typography.body, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  infoText: { fontSize: typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.error },
  logoutText: { fontSize: typography.bodyLarge, fontWeight: '700', color: colors.error },
});