// screens/QuizScreen.js
// Quiz screen with multiple-choice questions, bilingual support, and score results

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
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
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!story || !story.quiz || story.quiz.length === 0) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
            <Text style={styles.errorText}>
              {!story ? 'Story not found.' : 'No quiz available for this story.'}
            </Text>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.goBack()}
            >
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
  const hasAnswered = selectedAnswers[currentQuestion] !== undefined;
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

  const score = useMemo(() => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswerIndex) {
        correct += 1;
      }
    });
    return correct;
  }, [selectedAnswers, questions]);

  const handleSelectAnswer = (index) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: index,
    });
  };

  const goToPrevious = () => {
    if (!isFirst) setCurrentQuestion(currentQuestion - 1);
  };

  const goToNext = async () => {
    if (isLast) {
      let finalScore = 0;
      questions.forEach((q, index) => {
        if (selectedAnswers[index] === q.correctAnswerIndex) {
          finalScore += 1;
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
        console.log('Quiz result saved to database');
      } catch (error) {
        console.error('Failed to save quiz result:', error);
      }

      setShowResults(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
  };

  if (showResults) {
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    let message = '';
    let stars = 0;
    let encouragement = '';

    if (percentage >= 80) {
      message = 'Excellent! 🎉';
      stars = 5;
      encouragement = 'You are a superstar!';
    } else if (percentage >= 60) {
      message = 'Good job! 👍';
      stars = 4;
      encouragement = 'You are improving!';
    } else if (percentage >= 40) {
      message = 'Keep practicing! 💪';
      stars = 3;
      encouragement = 'You can do it!';
    } else {
      message = 'Try again! 🌱';
      stars = 2;
      encouragement = 'Every try makes you stronger.';
    }

    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          <ScrollView contentContainerStyle={styles.resultsContent}>
            <Text style={styles.resultsMascot}>🦉</Text>
            <Text style={styles.resultsMessage}>{message}</Text>
            <Text style={styles.resultsScore}>
              You got {score} out of {totalQuestions} correct!
            </Text>
            <View style={styles.starsRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Text key={i} style={styles.star}>
                  {i < stars ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
            <Text style={styles.encouragementText}>{encouragement}</Text>

            <View style={styles.scoreBarWrapper}>
              <View style={styles.scoreBarTrack}>
                <View
                  style={[styles.scoreBarFill, { width: `${percentage}%` }]}
                />
              </View>
              <Text style={styles.scoreBarLabel}>{percentage}%</Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Ionicons name="home" size={20} color={colors.textLight} />
              <Text style={styles.primaryButtonText}>Back to Story</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRetake}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={20} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tertiaryButton}
              onPress={() => navigation.navigate('MainTabs')}
              activeOpacity={0.85}
            >
              <Text style={styles.tertiaryButtonText}>Return to Story List</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {story.title}
            </Text>
            <Text style={styles.headerSubtitle}>
              Question {currentQuestion + 1} of {questions.length}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.quizBadge}>
            <Ionicons name="help-circle" size={24} color={colors.primary} />
            <Text style={styles.quizBadgeText}>Quiz Time</Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>QUESTION</Text>
            <Text style={styles.questionText}>{question.question}</Text>
            {question.questionBisaya && (
              <Text style={styles.questionTextBisaya}>
                {question.questionBisaya}
              </Text>
            )}
          </View>

          <View style={styles.choicesContainer}>
            {question.choices.map((choice, index) => {
              const isSelected = selectedAnswers[currentQuestion] === index;
              const letter = String.fromCharCode(65 + index);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.choiceButton,
                    isSelected && styles.choiceButtonSelected,
                  ]}
                  onPress={() => handleSelectAnswer(index)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.choiceLetter,
                      isSelected && styles.choiceLetterSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceLetterText,
                        isSelected && styles.choiceLetterTextSelected,
                      ]}
                    >
                      {letter}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.choiceText,
                      isSelected && styles.choiceTextSelected,
                    ]}
                  >
                    {choice}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.textLight}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.hintCard}>
            <Ionicons name="bulb-outline" size={16} color={colors.textOnAccent} />
            <Text style={styles.hintText}>
              Choose the best answer. You can change it before going to the next
              question.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.pageNavButton, isFirst && styles.pageNavButtonDisabled]}
            onPress={goToPrevious}
            disabled={isFirst}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={isFirst ? colors.textMuted : colors.primary}
            />
            <Text
              style={[
                styles.pageNavButtonText,
                isFirst && styles.pageNavButtonTextDisabled,
              ]}
            >
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pageNavButton,
              styles.pageNavButtonPrimary,
              !hasAnswered && styles.pageNavButtonDisabled,
            ]}
            onPress={goToNext}
            disabled={!hasAnswered}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.pageNavButtonTextPrimary,
                !hasAnswered && styles.pageNavButtonTextDisabled,
              ]}
            >
              {isLast ? 'Finish Quiz' : 'Next Question'}
            </Text>
            <Ionicons
              name={isLast ? 'checkmark-circle' : 'chevron-forward'}
              size={20}
              color={hasAnswered ? colors.textLight : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.tiny,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.primarySoft,
    marginHorizontal: spacing.md,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.lg,
  },
  quizBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  quizBadgeText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    color: colors.primary,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  questionLabel: {
    fontSize: typography.tiny,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  questionText: {
    fontSize: typography.heading3,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 26,
  },
  questionTextBisaya: {
    fontSize: typography.body,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  choicesContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  choiceButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceLetter: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceLetterSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  choiceLetterText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  choiceLetterTextSelected: {
    color: colors.textLight,
  },
  choiceText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  choiceTextSelected: {
    color: colors.textLight,
    fontWeight: '600',
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  hintText: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.textOnAccent,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  pageNavButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 4,
  },
  pageNavButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pageNavButtonDisabled: {
    opacity: 0.4,
  },
  pageNavButtonText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
  pageNavButtonTextPrimary: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textLight,
  },
  pageNavButtonTextDisabled: {
    color: colors.textMuted,
  },
  resultsContent: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  resultsMascot: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  resultsMessage: {
    fontSize: typography.displayMedium,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  resultsScore: {
    fontSize: typography.heading3,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: 4,
  },
  star: {
    fontSize: 36,
  },
  encouragementText: {
    fontSize: typography.bodyLarge,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  scoreBarWrapper: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  scoreBarTrack: {
    height: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  scoreBarLabel: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    width: '100%',
    marginBottom: spacing.md,
    ...shadows.cardLarge,
  },
  primaryButtonText: {
    color: colors.textLight,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },
  tertiaryButton: {
    paddingVertical: spacing.md,
  },
  tertiaryButtonText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  navButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  navButtonText: {
    color: colors.textLight,
    fontSize: typography.body,
    fontWeight: '700',
  },
});