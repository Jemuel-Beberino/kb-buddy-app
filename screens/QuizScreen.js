// screens/QuizScreen.js
import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  StatusBar, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { allStories } from '../data/stories';
import { saveQuizResult } from '../database/progressService';

const LEARNER_ID = 'KS-12345';

export default function QuizScreen({ route, navigation }) {
  const { storyId } = route.params || {};
  const story = allStories.find((s) => s.id === storyId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores both MC indices and FIB strings
  const [showResults, setShowResults] = useState(false);

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
  
  // Check if the current question has been answered (either index or text)
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

  const handleAnswerMC = (index) => {
    setAnswers({ ...answers, [currentQuestion]: index });
  };

  const handleAnswerText = (text) => {
    setAnswers({ ...answers, [currentQuestion]: text });
  };

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
          learnerId: LEARNER_ID,
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

  // --- RESULTS VIEW ---
  if (showResults) {
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    let message = percentage >= 80 ? 'Excellent! 🎉' : percentage >= 60 ? 'Good job! 👍' : 'Keep practicing! 💪';
    let stars = percentage >= 80 ? 5 : percentage >= 60 ? 4 : 3;

    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <ScrollView contentContainerStyle={styles.resultsContent}>
            <Text style={styles.resultsMascot}>🦉</Text>
            <Text style={styles.resultsMessage}>{message}</Text>
            <Text style={styles.resultsScore}>You got {score} out of {totalQuestions} correct!</Text>
            
            <View style={styles.starsRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Text key={i} style={styles.star}>{i < stars ? '⭐' : '☆'}</Text>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryButtonText}>Back to Story</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => { setAnswers({}); setCurrentQuestion(0); setShowResults(false); }}>
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
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

            {/* RENDER MULTIPLE CHOICE */}
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

            {/* RENDER FILL IN THE BLANK */}
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
  resultsContent: { padding: spacing.xl, alignItems: 'center' },
  resultsMascot: { fontSize: 80, marginBottom: spacing.md },
  resultsMessage: { fontSize: typography.heading1, fontWeight: '700', color: colors.textPrimary },
  resultsScore: { fontSize: typography.heading3, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.lg },
  starsRow: { flexDirection: 'row', marginBottom: spacing.xxl, gap: 4 },
  star: { fontSize: 36 },
  primaryButton: { width: '100%', backgroundColor: colors.primary, padding: spacing.lg, borderRadius: radius.pill, alignItems: 'center', marginBottom: spacing.md },
  primaryButtonText: { color: colors.textLight, fontSize: typography.bodyLarge, fontWeight: '700' },
  secondaryButton: { width: '100%', backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary, padding: spacing.lg, borderRadius: radius.pill, alignItems: 'center' },
  secondaryButtonText: { color: colors.primary, fontSize: typography.bodyLarge, fontWeight: '700' },
});