// screens/HomeDashboardScreen.js
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { getLearnerStats } from '../database/progressService';

export default function HomeDashboardScreen({ route, navigation }) {
  const learnerName = route?.params?.learnerName || 'Learner';
  const learnerId = route?.params?.learnerId || 'KS-12345';

  const [stats, setStats] = useState({ storiesCompleted: 0, learningStreak: 0 });

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const data = await getLearnerStats(learnerId);
        setStats(data);
      }
      load();
    }, [learnerId])
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {learnerName}! 👋</Text>
              <Text style={styles.subtitle}>Ready for your next adventure?</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 24 }}>🦉</Text>
            </View>
          </View>

          {/* Hero Card */}
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.heroCard}
          >
            <View style={styles.heroTextContent}>
              <Text style={styles.heroTitle}>Keep up the great work!</Text>
              <Text style={styles.heroSubtitle}>
                You've completed {stats.storiesCompleted} stories so far.
              </Text>
              <TouchableOpacity 
                style={styles.heroButton}
                onPress={() => navigation.navigate('Stories', { learnerName, learnerId })}
              >
                <Text style={styles.heroButtonText}>Go to Library</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
            <MaterialCommunityIcons name="book-open-page-variant" size={100} color="rgba(255,255,255,0.15)" style={styles.heroBgIcon} />
          </LinearGradient>

          {/* Quick Stats */}
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="flame" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats.learningStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="trophy" size={24} color={colors.accentDark} />
              </View>
              <Text style={styles.statValue}>{stats.storiesCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  greeting: { fontSize: typography.displayMedium, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: typography.body, color: colors.textSecondary, marginTop: 4 },
  avatar: { width: 50, height: 50, borderRadius: radius.pill, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadows.card },
  
  heroCard: { borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.xl, overflow: 'hidden', ...shadows.cardLarge },
  heroTextContent: { zIndex: 1 },
  heroTitle: { fontSize: 24, fontWeight: '700', color: colors.textLight, marginBottom: 8 },
  heroSubtitle: { fontSize: typography.body, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.lg },
  heroButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill, gap: 8 },
  heroButtonText: { fontSize: typography.body, fontWeight: '700', color: colors.primaryDark },
  heroBgIcon: { position: 'absolute', right: -20, bottom: -20 },

  sectionTitle: { fontSize: typography.heading3, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statBox: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center', ...shadows.card },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
});