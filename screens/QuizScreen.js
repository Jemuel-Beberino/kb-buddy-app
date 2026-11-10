// screens/QuizScreen.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  StatusBar, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Pressable,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { allStories } from '../data/stories';
import { getCustomStories } from '../database/storyService';
import { saveQuizResult } from '../database/progressService';

/* ------------------------------------------------------------------ */
/*  Results-view helpers (UI only)                                     */
/* ------------------------------------------------------------------ */

const PASS_PERCENT = 60; // matches your existing "Good job!" tier
const PASS_GRADIENT = ['#86EFAC', '#FDE68A', colors.background]; // green -> yellow -> app bg
const TRY_GRADIENT = [colors.primarySoft, colors.background];
const STAR_SIZES = [38, 50, 64, 50, 38];
const STAR_OFFSETS = [22, 8, 0, 8, 22];
const LIP = 5;

// Springy pop-in used for mascot, stars and score card
function PopIn({ delay = 0, from = 0.4, style, children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(v, {
      toValue: 1,
      delay,
      friction: 5,
      tension: 110,
      useNativeDriver: true,
    }).start();
  }, [v, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.4], outputRange: [0, 1], extrapolate: 'clamp' }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [from, 1] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Big number that counts up from 0 to the final score
function ScoreCounter({ score, style }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const v = new Animated.Value(0);
    const id = v.addListener(({ value }) => setShown(Math.round(value)));
    Animated.timing(v, { toValue: score, duration: 900, delay: 450, useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, [score]);
  return <Text style={style}>{shown}</Text>;
}

// One-shot confetti burst made of plain Views (no images, offline-safe)
const CONFETTI = [
  { left: '6%', color: '#F59E0B', w: 10, h: 16, delay: 0, spin: 2 },
  { left: '14%', color: '#10B981', w: 12, h: 12, delay: 200, spin: -1 },
  { left: '22%', color: '#EF4444', w: 8, h: 14, delay: 80, spin: 3 },
  { left: '31%', color: '#0D9488', w: 10, h: 10, delay: 320, spin: -2 },
  { left: '40%', color: '#FBBF24', w: 9, h: 15, delay: 140, spin: 2 },
  { left: '49%', color: '#8B5CF6', w: 12, h: 12, delay: 380, spin: -3 },
  { left: '57%', color: '#F59E0B', w: 8, h: 14, delay: 40, spin: 2 },
  { left: '65%', color: '#10B981', w: 10, h: 16, delay: 260, spin: -2 },
  { left: '73%', color: '#EF4444', w: 12, h: 12, delay: 120, spin: 3 },
  { left: '81%', color: '#FBBF24', w: 9, h: 15, delay: 340, spin: -1 },
  { left: '89%', color: '#0D9488', w: 10, h: 10, delay: 20, spin: 2 },
  { left: '94%', color: '#8B5CF6', w: 8, h: 14, delay: 220, spin: -2 },
];

function ConfettiPiece({ left, color, w, h, delay, spin }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 2600, delay, useNativeDriver: true }).start();
  }, [t, delay]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -20,
        left,
        width: w,
        height: h,
        borderRadius: 2,
        backgroundColor: color,
        opacity: t.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, 460] }) },
          { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, spin * 10, 0] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin * 240}deg`] }) },
        ],
      }}
    />
  );
}

function Confetti() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {CONFETTI.map((c, i) => (
        <ConfettiPiece key={i} {...c} />
      ))}
    </View>
  );
}

// Tactile "game" button with a bottom lip that the face sinks into on press
const GAME_VARIANTS = {
  primary: { face: colors.primary, border: colors.primary, lip: colors.primaryDark, text: colors.textLight },
  accent: { face: colors.accent, border: colors.accent, lip: colors.accentDark, text: colors.textOnAccent },
  light: { face: colors.surface, border: colors.border, lip: '#CBD5E1', text: colors.primaryDark },
};

function GameButton({ label, icon, variant = 'primary', onPress }) {
  const v = GAME_VARIANTS[variant];
  const press = useRef(new Animated.Value(0)).current;
  const animateTo = (toValue) =>
    Animated.timing(press, { toValue, duration: 80, useNativeDriver: true }).start();
  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, LIP - 1] });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.gameButtonWrap}
    >
      <View style={{ paddingBottom: LIP }}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { top: LIP, backgroundColor: v.lip, borderRadius: radius.pill },
          ]}
        />
        <Animated.View
          style={[
            styles.gameButtonFace,
            { backgroundColor: v.face, borderColor: v.border, transform: [{ translateY }] },
          ]}
        >
          <Ionicons name={icon} size={22} color={v.text} />
          <Text style={[styles.gameButtonText, { color: v.text }]}>{label}</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */

export default function QuizScreen({ route, navigation }) {
  const { storyId, learnerId } = route.params || {}; 
  
  const hardcodedStory = allStories.find((s) => s.id === storyId);
  
  const [story, setStory] = useState(hardcodedStory || null);
  const [loading, setLoading] = useState(!hardcodedStory);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false); // <-- New State for Review

  useEffect(() => {
    if (story) return;
    async function fetchCustom() {
      try {
        const customs = await getCustomStories();
        const found = customs.find((s) => s.id === storyId);
        setStory(found || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustom();
  }, [storyId, story]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!story || !story.quiz || story.quiz.length === 0) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>No quiz available.</Text>
            <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const questions = story.quiz;
  const question = questions[currentQuestion];
  const isFirst = currentQuestion === 0;
  const isLast = currentQuestion === questions.length - 1;
  
  const currentAnswer = answers[currentQuestion];
  const hasAnswered = currentAnswer !== undefined && currentAnswer !== '';

  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

  const score = useMemo(() => {
    let correct = 0;
    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (q.questionType === 'fill_in_the_blank') {
        if (userAnswer && userAnswer.trim().toLowerCase() === q.correctText.trim().toLowerCase()) {
          correct += 1;
        }
      } else {
        if (userAnswer === q.correctAnswerIndex) {
          correct += 1;
        }
      }
    });
    return correct;
  }, [answers, questions]);

  const handleAnswerMC = (index) => setAnswers({ ...answers, [currentQuestion]: index });
  const handleAnswerText = (text) => setAnswers({ ...answers, [currentQuestion]: text });

  const goToPrevious = () => {
    if (!isFirst) setCurrentQuestion(currentQuestion - 1);
  };

  const goToNext = async () => {
    if (isLast) {
      let finalScore = 0;
      questions.forEach((q, index) => {
        const userAnswer = answers[index];
        if (q.questionType === 'fill_in_the_blank') {
          if (userAnswer && userAnswer.trim().toLowerCase() === q.correctText.trim().toLowerCase()) finalScore += 1;
        } else {
          if (userAnswer === q.correctAnswerIndex) finalScore += 1;
        }
      });

      try {
        await saveQuizResult({
          learnerId: learnerId || 'KS-12345',
          storyId: story.id,
          storyTitle: story.title,
          quizScore: finalScore,
          totalQuestions: questions.length,
        });
      } catch (error) {
        console.error('Failed to save:', error);
      }
      setShowResults(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // --- REVIEW ANSWERS VIEW ---
  if (showReview) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBackButton} onPress={() => setShowReview(false)}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Review Answers</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.reviewContent}>
            {questions.map((q, index) => {
              const userAnswer = answers[index];
              let isCorrect = false;
              let correctAnswerDisplay = '';
              let userAnswerDisplay = '';

              if (q.questionType === 'fill_in_the_blank') {
                isCorrect = userAnswer && userAnswer.trim().toLowerCase() === q.correctText.trim().toLowerCase();
                correctAnswerDisplay = q.correctText;
                userAnswerDisplay = userAnswer || '(No answer)';
              } else {
                isCorrect = userAnswer === q.correctAnswerIndex;
                correctAnswerDisplay = q.choices[q.correctAnswerIndex];
                userAnswerDisplay = userAnswer !== undefined ? q.choices[userAnswer] : '(No answer)';
              }

              return (
                <View key={index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewNumber}>Question {index + 1}</Text>
                    <Ionicons 
                      name={isCorrect ? "checkmark-circle" : "close-circle"} 
                      size={24} 
                      color={isCorrect ? colors.success : colors.error} 
                    />
                  </View>
                  <Text style={styles.reviewQuestion}>{q.question}</Text>
                  
                  <View style={styles.reviewAnswerRow}>
                    <Text style={styles.reviewLabel}>Your Answer:</Text>
                    <Text style={[styles.reviewAnswerText, !isCorrect && { color: colors.error }]}>
                      {userAnswerDisplay}
                    </Text>
                  </View>
                  
                  {!isCorrect && (
                    <View style={styles.reviewAnswerRow}>
                      <Text style={styles.reviewLabel}>Correct Answer:</Text>
                      <Text style={[styles.reviewAnswerText, { color: colors.success }]}>
                        {correctAnswerDisplay}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // --- RESULTS VIEW ---
  if (showResults) {
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    let message = percentage >= 80 ? 'Excellent! 🎉' : percentage >= 60 ? 'Good job! 👍' : 'Keep practicing! 💪';
    let stars = percentage >= 80 ? 5 : percentage >= 60 ? 4 : 3;
    const passed = percentage >= PASS_PERCENT;

    return (
      <SafeAreaProvider>
        <LinearGradient
          colors={passed ? PASS_GRADIENT : TRY_GRADIENT}
          locations={passed ? [0, 0.5, 1] : [0, 1]}
          style={styles.resultsGradient}
        >
          <SafeAreaView style={styles.resultsSafe} edges={['top']}>
            <ScrollView contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
              <PopIn from={0.3} style={styles.mascotWrap}>
                <View style={[styles.mascotGlow, passed ? styles.mascotGlowPass : styles.mascotGlowTry]}>
                  <View style={[styles.mascotCircle, passed ? styles.mascotCirclePass : styles.mascotCircleTry]}>
                    <Text style={styles.resultsMascot}>🦉</Text>
                  </View>
                </View>
              </PopIn>

              <Text style={[styles.resultsMessage, passed ? styles.messagePass : styles.messageTry]}>
                {message}
              </Text>

              <View style={styles.starsRow}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <PopIn key={i} delay={650 + i * 150} from={0} style={{ marginTop: STAR_OFFSETS[i] }}>
                    <Ionicons
                      name="star"
                      size={STAR_SIZES[i]}
                      color={i < stars ? colors.accent : '#CBD5E1'}
                      style={i < stars ? styles.starGlow : undefined}
                    />
                  </PopIn>
                ))}
              </View>

              <PopIn delay={250} from={0.8} style={styles.scoreCard}>
                <Text style={styles.scoreLead}>You got</Text>
                <View style={styles.scoreRow}>
                  <ScoreCounter
                    score={score}
                    style={[styles.scoreBig, passed ? styles.messagePass : styles.messageTry]}
                  />
                  <Text style={styles.scoreOutOf}> out of {totalQuestions}</Text>
                </View>
                <Text style={styles.scoreTail}>correct!</Text>

                <View style={styles.scoreTrack}>
                  <View
                    style={[
                      styles.scoreFill,
                      { width: `${percentage}%`, backgroundColor: passed ? colors.success : colors.primary },
                    ]}
                  />
                </View>
                <Text style={styles.scorePercent}>{percentage}%</Text>
              </PopIn>

              <View style={styles.buttonStack}>
                <GameButton
                  label="Review Answers"
                  icon="eye-outline"
                  variant="primary"
                  onPress={() => setShowReview(true)}
                />
                <GameButton
                  label="Try Again"
                  icon="refresh"
                  variant="accent"
                  onPress={() => { setAnswers({}); setCurrentQuestion(0); setShowResults(false); }}
                />
                <GameButton
                  label="Back to Story"
                  icon="arrow-back"
                  variant="light"
                  onPress={() => navigation.goBack()}
                />
              </View>
            </ScrollView>

            {passed && <Confetti />}
          </SafeAreaView>
        </LinearGradient>
      </SafeAreaProvider>
    );
  }

  // --- QUESTION VIEW ---
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Question {currentQuestion + 1} of {questions.length}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.questionCard}>
              <Text style={styles.questionLabel}>
                {question.questionType === 'fill_in_the_blank' ? 'FILL IN THE BLANK' : 'MULTIPLE CHOICE'}
              </Text>
              <Text style={styles.questionText}>{question.question}</Text>
              {question.questionBisaya && <Text style={styles.questionTextBisaya}>{question.questionBisaya}</Text>}
            </View>

            {question.questionType !== 'fill_in_the_blank' && (
              <View style={styles.choicesContainer}>
                {question.choices.map((choice, index) => {
                  const isSelected = currentAnswer === index;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.choiceButton, isSelected && styles.choiceButtonSelected]}
                      onPress={() => handleAnswerMC(index)}
                    >
                      <View style={[styles.choiceLetter, isSelected && styles.choiceLetterSelected]}>
                        <Text style={[styles.choiceLetterText, isSelected && styles.choiceLetterTextSelected]}>
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>
                      <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>{choice}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {question.questionType === 'fill_in_the_blank' && (
              <View style={styles.fibContainer}>
                <Text style={styles.fibInstruction}>Type your answer below:</Text>
                <TextInput
                  style={styles.fibInput}
                  placeholder="Type answer here..."
                  placeholderTextColor={colors.textMuted}
                  value={currentAnswer || ''}
                  onChangeText={handleAnswerText}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={[styles.pageNavButton, isFirst && { opacity: 0.4 }]} onPress={goToPrevious} disabled={isFirst}>
              <Text style={styles.pageNavButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.pageNavButton, styles.pageNavButtonPrimary, !hasAnswered && { opacity: 0.4 }]} 
              onPress={goToNext} 
              disabled={!hasAnswered}
            >
              <Text style={styles.pageNavButtonTextPrimary}>{isLast ? 'Finish Quiz' : 'Next Question'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  headerBackButton: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: typography.body, fontWeight: '700', color: colors.textPrimary },
  progressTrack: { height: 4, backgroundColor: colors.primarySoft, marginHorizontal: spacing.md, borderRadius: radius.pill },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
  scrollContent: { padding: spacing.lg },
  questionCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, ...shadows.card },
  questionLabel: { fontSize: typography.tiny, fontWeight: '700', color: colors.primary, letterSpacing: 1.5, marginBottom: spacing.sm },
  questionText: { fontSize: typography.heading3, fontWeight: '700', color: colors.textPrimary, lineHeight: 26 },
  questionTextBisaya: { fontSize: typography.body, fontStyle: 'italic', color: colors.textSecondary, marginTop: spacing.sm },
  choicesContainer: { gap: spacing.md },
  choiceButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1.5, borderColor: colors.border, gap: spacing.md },
  choiceButtonSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceLetter: { width: 32, height: 32, borderRadius: radius.pill, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center' },
  choiceLetterSelected: { backgroundColor: 'rgba(255,255,255,0.2)' },
  choiceLetterText: { fontSize: typography.body, fontWeight: '700', color: colors.primary },
  choiceLetterTextSelected: { color: colors.textLight },
  choiceText: { flex: 1, fontSize: typography.body, color: colors.textPrimary },
  choiceTextSelected: { color: colors.textLight, fontWeight: '600' },
  fibContainer: { marginTop: spacing.md },
  fibInstruction: { fontSize: typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  fibInput: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md, padding: spacing.md, fontSize: typography.bodyLarge, color: colors.textPrimary },
  bottomBar: { flexDirection: 'row', padding: spacing.lg, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.md },
  pageNavButton: { flex: 1, height: 48, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  pageNavButtonPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  pageNavButtonText: { fontSize: typography.body, fontWeight: '700', color: colors.primary },
  pageNavButtonTextPrimary: { fontSize: typography.body, fontWeight: '700', color: colors.textLight },

  // ---- Results styles (redesigned) ----
  resultsGradient: { flex: 1 },
  resultsSafe: { flex: 1 },
  resultsContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl, alignItems: 'center' },

  mascotWrap: { marginBottom: spacing.md },
  mascotGlow: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center' },
  mascotGlowPass: { backgroundColor: 'rgba(251, 191, 36, 0.35)' },
  mascotGlowTry: { backgroundColor: 'rgba(94, 234, 212, 0.45)' },
  mascotCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: colors.surface,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.cardLarge,
  },
  mascotCirclePass: { borderColor: colors.accent },
  mascotCircleTry: { borderColor: colors.primaryLight },
  resultsMascot: { fontSize: 68 },

  resultsMessage: { fontSize: 34, lineHeight: 42, fontFamily: typography.fontBold, textAlign: 'center' },
  messagePass: { color: '#047857' },
  messageTry: { color: colors.primaryDark },

  starsRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 6, marginTop: spacing.md, marginBottom: spacing.lg },
  starGlow: {
    textShadowColor: 'rgba(245, 158, 11, 0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },

  scoreCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.cardLarge,
  },
  scoreLead: { fontSize: typography.bodyLarge, fontFamily: typography.fontSemiBold, color: colors.textSecondary },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' },
  scoreBig: { fontSize: 72, lineHeight: 84, fontFamily: typography.fontBold },
  scoreOutOf: { fontSize: typography.heading2, fontFamily: typography.fontBold, color: colors.textPrimary },
  scoreTail: { fontSize: typography.heading3, fontFamily: typography.fontBold, color: colors.textPrimary, marginBottom: spacing.lg },
  scoreTrack: { width: '100%', height: 14, borderRadius: radius.pill, backgroundColor: colors.borderLight, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: radius.pill },
  scorePercent: { marginTop: spacing.sm, fontSize: typography.bodySmall, fontFamily: typography.fontSemiBold, color: colors.textSecondary },

  buttonStack: { width: '100%', gap: spacing.sm },
  gameButtonWrap: { width: '100%' },
  gameButtonFace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 58,
    borderRadius: radius.pill,
    borderWidth: 2,
    paddingHorizontal: spacing.xl,
  },
  gameButtonText: { fontSize: typography.bodyLarge + 1, fontFamily: typography.fontBold },

  // Review Styles
  reviewContent: { padding: spacing.lg },
  reviewCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.card },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  reviewNumber: { fontSize: typography.tiny, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  reviewQuestion: { fontSize: typography.bodyLarge, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  reviewAnswerRow: { flexDirection: 'row', marginBottom: spacing.xs },
  reviewLabel: { width: 110, fontSize: typography.bodySmall, color: colors.textSecondary },
  reviewAnswerText: { flex: 1, fontSize: typography.bodySmall, fontWeight: '600', color: colors.textPrimary },

  errorContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  errorText: { fontSize: typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  navButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.pill },
  navButtonText: { color: colors.textLight, fontSize: typography.body, fontWeight: '700' },
});