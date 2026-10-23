import React from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';

export default function ProgressScreen() {
    const stats = [
        { icon: 'book-outline', value: '3/5', label: 'Stories Completed' },
        { icon: 'list-outline', value: '15', label: 'Vocabulary Encountered' },
        { icon: 'checkmark-circle-outline', value: '12', label: 'Vocabulary Correct' },
        { icon: 'flame-outline', value: '4 days', label: 'Learning Streak' },
    ];

    return ( <
        SafeAreaProvider >
        <
        SafeAreaView style = { styles.container } >
        <
        StatusBar barStyle = "dark-content"
        backgroundColor = { colors.background }
        /> <
        ScrollView contentContainerStyle = { styles.scrollContent } > { /* Header */ } <
        Text style = { styles.pageTitle } > My Progress < /Text> <
        Text style = { styles.pageSubtitle } >
        Your learning journey, one story at a time. <
        /Text>

        { /* Learner Card */ } <
        View style = { styles.learnerCard } >
        <
        View style = { styles.learnerAvatar } >
        <
        Text style = { styles.learnerEmoji } > 🦉 < /Text> < /
        View > <
        View style = {
            { flex: 1 }
        } >
        <
        Text style = { styles.learnerName } > Sofia Reyes < /Text> <
        Text style = { styles.learnerId } > Learner ID: KS - 12345 < /Text> < /
        View > <
        /View>

        { /* Stats Grid */ } <
        View style = { styles.statsGrid } > {
            stats.map((stat, i) => ( <
                View key = { i }
                style = { styles.statCard } >
                <
                View style = { styles.statIconContainer } >
                <
                Ionicons name = { stat.icon }
                size = { 20 }
                color = { colors.primary }
                /> < /
                View > <
                Text style = { styles.statValue } > { stat.value } < /Text> <
                Text style = { styles.statLabel } > { stat.label } < /Text> < /
                View >
            ))
        } <
        /View>

        { /* Progress Overview */ } <
        View style = { styles.overviewCard } >
        <
        View style = { styles.overviewHeader } >
        <
        Ionicons name = "trending-up"
        size = { 20 }
        color = { colors.primary }
        /> <
        Text style = { styles.overviewTitle } > Progress Overview < /Text> < /
        View >

        <
        View style = { styles.progressItem } >
        <
        View style = { styles.progressLabelRow } >
        <
        Text style = { styles.progressLabel } > Stories Completed < /Text> <
        Text style = { styles.progressValue } > 3 / 5 < /Text> < /
        View > <
        View style = { styles.progressBarBg } >
        <
        View style = {
            [styles.progressBarFill, { width: '60%' }]
        }
        /> < /
        View > <
        /View>

        <
        View style = { styles.progressItem } >
        <
        View style = { styles.progressLabelRow } >
        <
        Text style = { styles.progressLabel } > Vocabulary Mastered < /Text> <
        Text style = { styles.progressValue } > 12 / 15 < /Text> < /
        View > <
        View style = { styles.progressBarBg } >
        <
        View style = {
            [styles.progressBarFill, { width: '80%' }]
        }
        /> < /
        View > <
        /View> < /
        View > <
        /ScrollView> < /
        SafeAreaView > <
        /SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
    pageTitle: { fontSize: typography.displayMedium, fontWeight: '700', color: colors.textPrimary },
    pageSubtitle: { fontSize: typography.body, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.xl },
    learnerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.cardLarge,
    },
    learnerAvatar: {
        width: 56,
        height: 56,
        borderRadius: radius.pill,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    learnerEmoji: { fontSize: 32 },
    learnerName: { fontSize: typography.heading3, fontWeight: '700', color: colors.textLight },
    learnerId: { fontSize: typography.bodySmall, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
    statCard: {
        width: '48%',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        ...shadows.card,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        backgroundColor: colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    statValue: { fontSize: typography.heading2, fontWeight: '700', color: colors.textPrimary },
    statLabel: { fontSize: typography.tiny, color: colors.textSecondary, marginTop: 2 },
    overviewCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.lg,
        ...shadows.card,
    },
    overviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
    overviewTitle: { fontSize: typography.heading3, fontWeight: '700', color: colors.textPrimary },
    progressItem: { marginBottom: spacing.lg },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    progressLabel: { fontSize: typography.body, color: colors.textPrimary, fontWeight: '600' },
    progressValue: { fontSize: typography.body, color: colors.primary, fontWeight: '700' },
    progressBarBg: { height: 10, backgroundColor: colors.primarySoft, borderRadius: radius.pill, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
});