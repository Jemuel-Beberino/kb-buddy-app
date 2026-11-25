// screens/RulesScreen.js
import React from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  StatusBar, SafeAreaView 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';

const RULES_DATA = [
  {
    id: 'both',
    title: 'FOR BOTH BUDDIES',
    icon: 'account-group',
    color: '#0EA5E9', // Blue
    bgColor: '#E0F2FE',
    rules: [
      { en: 'We learn together, we don\'t compete.', bis: 'Magtinabangay ta, dili ta mag-unahan.' },
      { en: 'Take turns.', bis: 'Mag-ilis-ilis ta.' },
      { en: 'Praise your buddy.', bis: 'Dayega imong buddy.' },
    ]
  },
  {
    id: 'tutor',
    title: 'FOR THE TUTOR',
    icon: 'school',
    color: '#F59E0B', // Orange
    bgColor: '#FEF3C7',
    rules: [
      { en: 'Explain, don\'t just give the answer.', bis: 'I-explain, ayaw lang ihätag ang tubag.' },
      { en: 'Be patient, wait for your buddy to try first.', bis: 'Hulata imong buddy nga mosulay una.' },
      { en: 'Praise your buddy.', bis: 'Dayega imong buddy.' },
    ]
  },
  {
    id: 'tutee',
    title: 'FOR THE TUTEE',
    icon: 'book-open-page-variant',
    color: '#8B5CF6', // Purple
    bgColor: '#EDE9FE',
    rules: [
      { en: 'Try first before asking for help.', bis: 'Sulayi una ayna mangayo og tabang.' },
      { en: 'Ask when you don\'t understand.', bis: 'Pangutana kung wala ka kasabot.' },
      { en: 'Listen and follow your tutor.', bis: 'Paminaw ug sunod sa imong tutor.' },
    ]
  }
];

export default function RulesScreen({ route, navigation }) {
  // We pass user data from login to this screen, then to MainTabs
  const { learnerId, learnerName } = route.params || {};

  const handleAccept = () => {
    navigation.replace('MainTabs', { learnerId, learnerName });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <MaterialCommunityIcons name="star-four-points" size={20} color={colors.accent} />
          <Text style={styles.headerTitle}>KB BUDDY - PEER TUTORING RULES</Text>
          <MaterialCommunityIcons name="star-four-points" size={20} color={colors.accent} />
        </View>

        {/* Rule Cards */}
        {RULES_DATA.map((section) => (
          <View key={section.id} style={styles.card}>
            <View style={[styles.cardHeader, { backgroundColor: section.color }]}>
              <MaterialCommunityIcons name={section.icon} size={20} color="#FFF" />
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>
            
            <View style={[styles.cardBody, { backgroundColor: section.bgColor }]}>
              {section.rules.map((rule, index) => (
                <View key={index} style={styles.ruleRow}>
                  <Text style={[styles.ruleNumber, { color: section.color }]}>{index + 1}.</Text>
                  <View style={styles.ruleTextContainer}>
                    <Text style={styles.ruleEn}>{rule.en}</Text>
                    <Text style={styles.ruleBis}>{rule.bis}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Universal Rule */}
        <View style={styles.universalCard}>
          <Text style={styles.universalTitle}>FOR ALL</Text>
          <Text style={styles.universalRule}>9. No teasing, no laughing at mistakes.</Text>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaText}>LET'S START! / SUGOD NA TA!</Text>
          
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} activeOpacity={0.8}>
            <View style={styles.checkbox}>
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            </View>
            <Text style={styles.acceptText}>I Understand / Naka-sabot ko</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' }, // Warm off-white
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },

  // Header Banner
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7', // Deep Blue
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    borderWidth: 3,
    borderColor: '#38BDF8',
  },
  headerTitle: {
    color: '#FFF',
    fontFamily: typography.fontBold,
    fontSize: typography.heading3,
    textAlign: 'center',
  },

  // Rule Cards
  card: {
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    color: '#FFF',
    fontFamily: typography.fontBold,
    fontSize: typography.body,
  },
  cardBody: {
    padding: spacing.md,
  },
  ruleRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  ruleNumber: {
    fontFamily: typography.fontBold,
    fontSize: typography.bodyLarge,
    width: 24,
  },
  ruleTextContainer: {
    flex: 1,
  },
  ruleEn: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.body,
    color: colors.textPrimary,
  },
  ruleBis: {
    fontFamily: typography.fontRegular,
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Universal Rule
  universalCard: {
    backgroundColor: '#10B981', // Green
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  universalTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: typography.fontBold,
    fontSize: typography.bodySmall,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  universalRule: {
    color: '#FFF',
    fontFamily: typography.fontBold,
    fontSize: typography.heading3,
    textAlign: 'center',
  },

  // CTA
  ctaContainer: {
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: typography.fontBold,
    fontSize: typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: spacing.md,
    ...shadows.card,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
  },
  acceptText: {
    fontFamily: typography.fontBold,
    fontSize: typography.bodyLarge,
    color: colors.primaryDark,
  },
});
