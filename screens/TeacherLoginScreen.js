// screens/TeacherLoginScreen.js

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';

export default function TeacherLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    // DEMO ONLY: Hardcoded login for now
    if (email === 'teacher@demo' && password === 'admin123') {
      navigation.replace('TeacherTabs');
    } else {
      setError('Invalid credentials. Use teacher@demo / admin123');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconBadge}>
                <MaterialCommunityIcons name="school" size={32} color={colors.textLight} />
              </View>
              <Text style={styles.title}>Teacher Portal</Text>
              <Text style={styles.subtitle}>Sign in to manage your classroom</Text>
            </View>

            <View style={styles.formCard}>
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="warning" size={16} color={colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>School Email</Text>
              <TextInput
                style={styles.input}
                placeholder="teacher@deped.gov.ph"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={(text) => { setEmail(text); setError(''); }}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={(text) => { setPassword(text); setError(''); }}
                secureTextEntry
              />

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
                <Text style={styles.loginButtonText}>Log In</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>

              <View style={styles.demoHint}>
                <Text style={styles.demoHintText}>Demo: teacher@demo / admin123</Text>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  backButton: { position: 'absolute', top: spacing.xl, left: spacing.xl, padding: spacing.sm },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  iconBadge: {
    width: 64, height: 64, borderRadius: radius.lg,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md, ...shadows.cardLarge,
  },
  title: { fontSize: typography.displayMedium, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: typography.body, color: colors.textSecondary, marginTop: 4 },
  formCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.xl, ...shadows.card,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEE2E2', padding: spacing.md,
    borderRadius: radius.md, marginBottom: spacing.lg,
  },
  errorText: { flex: 1, color: colors.error, fontSize: typography.bodySmall, fontWeight: '600' },
  label: { fontSize: typography.bodySmall, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surfaceMuted, borderRadius: radius.md,
    paddingHorizontal: spacing.md, height: 50,
    fontSize: typography.body, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
  },
  loginButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: spacing.sm, backgroundColor: colors.primary,
    borderRadius: radius.md, height: 54, marginTop: spacing.xl,
  },
  loginButtonText: { color: colors.textLight, fontSize: typography.bodyLarge, fontWeight: '700' },
  demoHint: { alignItems: 'center', marginTop: spacing.lg },
  demoHintText: { color: colors.textMuted, fontSize: typography.tiny, fontStyle: 'italic' },
});