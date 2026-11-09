// screens/LearnerLoginScreen.js
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { loginLearner, registerLearner } from '../database/authService';

export default function LearnerLoginScreen() {
  const navigation = useNavigation();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [learnerId, setLearnerId] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (learnerId.trim() === '' || pin.trim() === '') {
      Alert.alert('Oops!', 'Please enter your Learner ID and PIN.');
      return;
    }
    if (isRegistering && name.trim() === '') {
      Alert.alert('Oops!', 'Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await registerLearner(learnerId.trim(), name.trim(), pin.trim());
        Alert.alert('Success!', 'Account created. You can now log in.');
        setIsRegistering(false);
        setPin('');
      } else {
        const user = await loginLearner(learnerId.trim(), pin.trim());
        navigation.navigate('MainTabs', { 
          learnerId: user.id, 
          learnerName: user.name 
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            
            <Text style={styles.mascot}>🦉</Text>
            <Text style={styles.title}>{isRegistering ? 'Create Account' : 'Hi Learner! 👋'}</Text>
            <Text style={styles.subtitle}>
              {isRegistering ? 'Sign up to start learning' : 'Login with your Learner ID & PIN'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Learner ID (e.g. KS-12345)"
              placeholderTextColor="#999"
              value={learnerId}
              onChangeText={setLearnerId}
              autoCapitalize="none"
            />

            {isRegistering && (
              <TextInput
                style={styles.input}
                placeholder="Your Full Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="PIN (Numbers only)"
              placeholderTextColor="#999"
              value={pin}
              onChangeText={setPin}
              secureTextEntry={true}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={handleAction} disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Please wait...' : (isRegistering ? 'Register ➡️' : 'Tuloy! ➡️')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleLink} onPress={() => setIsRegistering(!isRegistering)}>
              <Text style={styles.toggleText}>
                {isRegistering ? 'Already have an account? Log in.' : 'New here? Create an account.'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.teacherLink} onPress={() => navigation.navigate('TeacherLogin')}>
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
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, alignItems: 'center' },
  mascot: { fontSize: 80, marginBottom: spacing.md },
  title: { fontSize: typography.heading1, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.body, color: colors.textSecondary, marginBottom: spacing.xl, textAlign: 'center' },
  input: { width: '100%', height: 55, backgroundColor: colors.cardBackground, borderRadius: 12, paddingHorizontal: spacing.md, fontSize: typography.body, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: spacing.md, color: colors.textPrimary },
  button: { width: '100%', height: 55, backgroundColor: colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: spacing.sm, ...shadows.cardLarge },
  buttonText: { color: colors.textLight, fontSize: typography.heading3, fontWeight: 'bold' },
  toggleLink: { marginTop: spacing.lg, paddingVertical: spacing.sm },
  toggleText: { color: colors.primary, fontSize: typography.body, fontWeight: '600' },
  teacherLink: { marginTop: spacing.xl, paddingVertical: spacing.sm },
  teacherLinkText: { color: colors.textSecondary, fontSize: typography.caption, textDecorationLine: 'underline' },
});