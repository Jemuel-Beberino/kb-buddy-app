// screens/LearnerLoginScreen.js

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';

export default function LearnerLoginScreen() {
  const navigation = useNavigation();
  const [learnerId, setLearnerId] = useState('');
  const [pin, setPin] = useState('');

  const handleLogin = () => {
    if (learnerId.trim() === '' || pin.trim() === '') {
      Alert.alert('Oops!', 'Please enter your Learner ID and PIN.');
      return;
    }
    navigation.navigate('MainTabs', { learnerName: learnerId.trim() });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.mascot}>🦉</Text>
            <Text style={styles.title}>Hi Learner! 👋</Text>
            <Text style={styles.subtitle}>Login with your Learner ID & PIN</Text>

            <TextInput
              style={styles.input}
              placeholder="Learner ID (e.g. KS-12345)"
              placeholderTextColor="#999"
              value={learnerId}
              onChangeText={setLearnerId}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <TextInput
              style={styles.input}
              placeholder="PIN"
              placeholderTextColor="#999"
              value={pin}
              onChangeText={setPin}
              secureTextEntry={true}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Tuloy! ➡️</Text>
            </TouchableOpacity>

            <View style={styles.offlineContainer}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlineText}>Offline Mode: Ready to use</Text>
            </View>

            <TouchableOpacity
              style={styles.teacherLink}
              onPress={() => navigation.navigate('TeacherLogin')}
            >
              <Text style={styles.teacherLinkText}>Are you a teacher?</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  mascot: { fontSize: 80, marginBottom: spacing.md },
  title: {
    fontSize: typography.heading1,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.cardLarge,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: typography.heading3,
    fontWeight: 'bold',
  },
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  offlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    marginRight: spacing.sm,
  },
  offlineText: {
    color: colors.success,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  teacherLink: { marginTop: spacing.lg, paddingVertical: spacing.sm },
  teacherLinkText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    textDecorationLine: 'underline',
  },
});