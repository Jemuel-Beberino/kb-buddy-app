// screens/LearnerLoginScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView,
  Animated, Pressable,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { loginLearner, registerLearner } from '../database/authService';

/* ------------------------------------------------------------------ */
/*  UI-only helpers                                                    */
/* ------------------------------------------------------------------ */

const FIELD_H = 58;
const LIP = 6;

// Owl inside a soft, gently pulsing glow
function Mascot() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <View style={styles.mascotArea}>
      <Animated.View style={[styles.glowOuter, { opacity, transform: [{ scale }] }]} />
      <View style={styles.glowInner} />
      <View style={styles.mascotCircle}>
        <Text style={styles.mascot}>🦉</Text>
      </View>
    </View>
  );
}

// Floating-label input with a leading icon
function FloatingInput({ icon, label, hint, value, onChangeText, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;
  const anim = useRef(new Animated.Value(lifted ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: lifted ? 1 : 0, duration: 150, useNativeDriver: false }).start();
  }, [lifted, anim]);

  const labelTop = anim.interpolate({ inputRange: [0, 1], outputRange: [FIELD_H / 2 - 10, 7] });
  const labelSize = anim.interpolate({ inputRange: [0, 1], outputRange: [typography.body, 11] });
  const labelColor = focused ? colors.primary : lifted ? colors.textSecondary : colors.textMuted;

  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      <Ionicons
        name={icon}
        size={20}
        color={focused ? colors.primary : colors.textMuted}
        style={styles.fieldIcon}
      />
      <Animated.Text
        pointerEvents="none"
        numberOfLines={1}
        style={[styles.floatLabel, { top: labelTop, fontSize: labelSize, color: labelColor }]}
      >
        {label}
      </Animated.Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={focused ? hint : undefined}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        selectionColor={colors.primary}
        {...inputProps}
      />
    </View>
  );
}

// Large tactile 3D button
function TactileButton({ onPress, disabled, children }) {
  const press = useRef(new Animated.Value(0)).current;
  const animateTo = (toValue) =>
    Animated.timing(press, { toValue, duration: 80, useNativeDriver: true }).start();
  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, LIP - 1] });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
    >
      <View style={{ paddingBottom: LIP, opacity: disabled ? 0.7 : 1 }}>
        <View style={[StyleSheet.absoluteFill, styles.buttonLip]} />
        <Animated.View style={[styles.buttonFace, { transform: [{ translateY }] }]}>
          {children}
        </Animated.View>
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */

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
        <StatusBar barStyle="dark-content" backgroundColor={colors.primarySoft} />

        <LinearGradient
          colors={[colors.primarySoft, colors.background]}
          style={styles.topGradient}
          pointerEvents="none"
        />

        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            
            <Mascot />
            <Text style={styles.title}>{isRegistering ? 'Create Account' : 'Hi Learner! 👋'}</Text>
            <Text style={styles.subtitle}>
              {isRegistering ? 'Sign up to start learning' : 'Login with your Learner ID & PIN'}
            </Text>

            <View style={styles.formCard}>
              {/* Mode switch (replaces the old text link) */}
              <View style={styles.segmentTrack}>
                <TouchableOpacity
                  style={[styles.segment, !isRegistering && styles.segmentActive]}
                  activeOpacity={0.85}
                  onPress={() => setIsRegistering(false)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: !isRegistering }}
                >
                  <Text style={[styles.segmentText, !isRegistering && styles.segmentTextActive]}>Log in</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, isRegistering && styles.segmentActive]}
                  activeOpacity={0.85}
                  onPress={() => setIsRegistering(true)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isRegistering }}
                >
                  <Text style={[styles.segmentText, isRegistering && styles.segmentTextActive]}>Create account</Text>
                </TouchableOpacity>
              </View>

              <FloatingInput
                icon="id-card-outline"
                label="Learner ID"
                hint="e.g. KS-12345"
                value={learnerId}
                onChangeText={setLearnerId}
                autoCapitalize="none"
              />

              {isRegistering && (
                <FloatingInput
                  icon="person-outline"
                  label="Your Full Name"
                  value={name}
                  onChangeText={setName}
                />
              )}

              <FloatingInput
                icon="lock-closed-outline"
                label="PIN"
                hint="Numbers only"
                value={pin}
                onChangeText={setPin}
                secureTextEntry={true}
                keyboardType="numeric"
              />

              <View style={styles.buttonWrap}>
                <TactileButton onPress={handleAction} disabled={loading}>
                  <Text style={styles.buttonText}>
                    {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Tuloy!')}
                  </Text>
                  {!loading && <Ionicons name="arrow-forward" size={22} color={colors.textLight} />}
                </TactileButton>
              </View>
            </View>

            <TouchableOpacity style={styles.teacherLink} onPress={() => navigation.navigate('TeacherLogin')}>
              <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
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
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 380 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, alignItems: 'center' },

  // Mascot
  mascotArea: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  glowOuter: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(94, 234, 212, 0.28)' },
  glowInner: { position: 'absolute', width: 166, height: 166, borderRadius: 83, backgroundColor: 'rgba(94, 234, 212, 0.45)' },
  mascotCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: colors.surface,
    borderWidth: 5,
    borderColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.cardLarge,
  },
  mascot: { fontSize: 76 },

  title: { fontSize: 30, lineHeight: 38, fontFamily: typography.fontBold, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { fontSize: typography.body, fontFamily: typography.fontRegular, color: colors.textSecondary, marginBottom: spacing.xl, textAlign: 'center' },

  // Form card
  formCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },

  // Segmented control
  segmentTrack: { flexDirection: 'row', backgroundColor: colors.primarySoft, borderRadius: radius.pill, padding: 4, marginBottom: spacing.lg },
  segment: { flex: 1, minHeight: 42, borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center' },
  segmentActive: { backgroundColor: colors.surface, ...shadows.card },
  segmentText: { fontSize: typography.bodySmall, fontFamily: typography.fontSemiBold, color: colors.primaryDark, opacity: 0.7 },
  segmentTextActive: { fontFamily: typography.fontBold, opacity: 1 },

  // Floating-label field with icon
  field: {
    height: FIELD_H,
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  fieldFocused: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fieldIcon: { position: 'absolute', left: 14, top: FIELD_H / 2 - 11 },
  floatLabel: { position: 'absolute', left: 46, right: 14, fontFamily: typography.fontSemiBold },
  fieldInput: {
    flex: 1,
    paddingLeft: 46,
    paddingRight: 14,
    paddingTop: 22,
    paddingBottom: 4,
    fontSize: typography.bodyLarge,
    fontFamily: typography.fontRegular,
    color: colors.textPrimary,
  },

  // Tactile button
  buttonWrap: { marginTop: spacing.sm },
  buttonLip: {
    top: LIP,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
  },
  buttonFace: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 62,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: spacing.xl,
  },
  buttonText: { color: colors.textLight, fontSize: typography.heading3 + 2, fontFamily: typography.fontBold },

  // Teacher link
  teacherLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  teacherLinkText: { color: colors.textSecondary, fontSize: typography.caption, fontFamily: typography.fontSemiBold },
});