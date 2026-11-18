// screens/TeacherAuthorScreen.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, StatusBar, KeyboardAvoidingView, Platform,
  Animated, Pressable,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { saveCustomStory, getCustomStories, deleteCustomStory, updateCustomStory } from '../database/storyService';

/* ------------------------------------------------------------------ */
/*  UI-only helpers                                                    */
/* ------------------------------------------------------------------ */

const SCREEN_BG = '#FAFAF7'; // soft off-white
const CARD_BORDER = '#EEF0EA';
const TITLE_SIZE = typography.displayMedium ?? 28; // displayMedium isn't in theme.js
const FIELD_H = 58;
const LIP = 6;

// Text input with a floating label and a highlighted border while focused
function FloatingInput({ label, hint, value, onChangeText, multiline, height, accent, style }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;
  const anim = useRef(new Animated.Value(lifted ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: lifted ? 1 : 0, duration: 150, useNativeDriver: false }).start();
  }, [lifted, anim]);

  const restTop = multiline ? 18 : FIELD_H / 2 - 10;
  const labelTop = anim.interpolate({ inputRange: [0, 1], outputRange: [restTop, 7] });
  const labelSize = anim.interpolate({ inputRange: [0, 1], outputRange: [typography.body, 11] });
  const labelColor = focused ? colors.primary : lifted ? colors.textSecondary : colors.textMuted;

  return (
    <View
      style={[
        styles.field,
        { height: height || FIELD_H },
        accent && styles.fieldAccent,
        focused && styles.fieldFocused,
        style,
      ]}
    >
      <Animated.Text
        pointerEvents="none"
        numberOfLines={1}
        style={[styles.floatLabel, { top: labelTop, fontSize: labelSize, color: labelColor }]}
      >
        {label}
      </Animated.Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholder={focused ? hint : undefined}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        selectionColor={colors.primary}
      />
    </View>
  );
}

// Card section heading: numbered badge + title + optional tag
function SectionHeader({ number, icon, title, tag }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={styles.sectionBadge}>
        {icon ? (
          <Ionicons name={icon} size={16} color={colors.primaryDark} />
        ) : (
          <Text style={styles.sectionBadgeText}>{number}</Text>
        )}
      </View>
      <Text style={styles.sectionHeader}>{title}</Text>
      {tag ? (
        <View style={styles.sectionTag}>
          <Text style={styles.sectionTagText}>{tag}</Text>
        </View>
      ) : null}
    </View>
  );
}

// Large tactile 3D button
function TactileButton({ onPress, children }) {
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
    >
      <View style={{ paddingBottom: LIP }}>
        <View style={[StyleSheet.absoluteFill, styles.saveLip]} />
        <Animated.View style={[styles.saveFace, { transform: [{ translateY }] }]}>
          {children}
        </Animated.View>
      </View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */

export default function TeacherAuthorScreen({ route, navigation }) {
  const editStory = route.params?.editStory;

  const [title, setTitle] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [bisayaText, setBisayaText] = useState('');
  
  // Vocabulary
  const [vocabWord, setVocabWord] = useState('');
  const [vocabEnDef, setVocabEnDef] = useState('');
  const [vocabBisDef, setVocabBisDef] = useState('');

  // Quiz Type Toggle
  const [quizType, setQuizType] = useState('multiple_choice');

  // Multiple Choice State
  const [question, setQuestion] = useState('');
  const [choiceA, setChoiceA] = useState('');
  const [choiceB, setChoiceB] = useState('');
  const [choiceC, setChoiceC] = useState('');
  const [choiceD, setChoiceD] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);

  // Fill in the Blank State
  const [fibQuestion, setFibQuestion] = useState('');
  const [fibAnswer, setFibAnswer] = useState('');
  
  const [myStories, setMyStories] = useState([]);

  // Pre-fill form if editing
  useEffect(() => {
    if (editStory) {
      setTitle(editStory.title);
      setEnglishText(editStory.pages[0].englishText.replace(/\[|\]/g, ''));
      setBisayaText(editStory.pages[0].bisayaText);
      
      if (editStory.pages[0].vocabulary && editStory.pages[0].vocabulary.length > 0) {
        const v = editStory.pages[0].vocabulary[0];
        setVocabWord(v.word);
        setVocabEnDef(v.englishDef);
        setVocabBisDef(v.bisayaDef);
      } else {
        setVocabWord(''); setVocabEnDef(''); setVocabBisDef('');
      }

      if (editStory.quiz && editStory.quiz.length > 0) {
        const q = editStory.quiz[0];
        if (q.questionType === 'fill_in_the_blank') {
          setQuizType('fill_in_the_blank');
          setFibQuestion(q.question);
          setFibAnswer(q.correctText);
        } else {
          setQuizType('multiple_choice');
          setQuestion(q.question);
          setChoiceA(q.choices[0] || '');
          setChoiceB(q.choices[1] || '');
          setChoiceC(q.choices[2] || '');
          setChoiceD(q.choices[3] || '');
          setCorrectIndex(q.correctAnswerIndex);
        }
      }
    } else {
      // Reset form if not editing
      setTitle(''); setEnglishText(''); setBisayaText('');
      setVocabWord(''); setVocabEnDef(''); setVocabBisDef('');
      setQuestion(''); setChoiceA(''); setChoiceB(''); setChoiceC(''); setChoiceD('');
      setFibQuestion(''); setFibAnswer(''); setCorrectIndex(0);
    }
  }, [editStory]);

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [])
  );

  const loadStories = async () => {
    try {
      const stories = await getCustomStories();
      setMyStories(stories);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!title || !englishText || !bisayaText) {
      Alert.alert('Missing Fields', 'Please fill in the title, English text, and Bisaya text.');
      return;
    }

    let quizData = [];
    if (quizType === 'multiple_choice') {
      if (!question || !choiceA || !choiceB) return Alert.alert('Missing Quiz', 'Provide a question and at least 2 choices.');
      quizData = [{ questionType: 'multiple_choice', question, choices: [choiceA, choiceB, choiceC || 'C', choiceD || 'D'], correctAnswerIndex: correctIndex }];
    } else {
      if (!fibQuestion || !fibAnswer) return Alert.alert('Missing Quiz', 'Provide the question and answer.');
      quizData = [{ questionType: 'fill_in_the_blank', question: fibQuestion, correctText: fibAnswer }];
    }

    try {
      if (editStory) {
        await updateCustomStory({
          id: editStory.id,
          title, englishText, bisayaText, vocabWord, vocabEnDef, vocabBisDef, quizData,
        });
        Alert.alert('Success!', 'Story updated successfully.');
        navigation.setParams({ editStory: null }); 
      } else {
        await saveCustomStory({
          title, titleBisaya: '', description: 'Custom story', englishText, bisayaText, vocabWord, vocabEnDef, vocabBisDef, quizData,
        });
        Alert.alert('Success!', 'Story saved successfully.');
      }
      
      setTitle(''); setEnglishText(''); setBisayaText('');
      setVocabWord(''); setVocabEnDef(''); setVocabBisDef('');
      setQuestion(''); setChoiceA(''); setChoiceB(''); setChoiceC(''); setChoiceD('');
      setFibQuestion(''); setFibAnswer('');
      
      loadStories(); 
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save the story.');
    }
  };

  const handleDelete = (id, storyTitle) => {
    Alert.alert("Delete Story", `Delete "${storyTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteCustomStory(id); loadStories(); } }
    ]);
  };

  const handleEditClick = (story) => {
    navigation.setParams({ editStory: story });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BG} />
        
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            
            <View style={styles.header}>
              <Text style={styles.title}>{editStory ? 'Edit Story' : 'Create a Story'}</Text>
              <Text style={styles.subtitle}>{editStory ? 'Update your custom story' : 'Write a new lesson for your learners'}</Text>
            </View>

            {/* Card 1: details */}
            <View style={styles.card}>
              <SectionHeader number="1" title="Story Details" />
              <FloatingInput label="Story Title *" value={title} onChangeText={setTitle} />
            </View>

            {/* Card 2: text */}
            <View style={styles.card}>
              <SectionHeader number="2" title="Story Text" tag="Page 1" />
              <FloatingInput label="English Text *" value={englishText} onChangeText={setEnglishText} multiline height={128} />
              <FloatingInput label="Bisaya Translation *" value={bisayaText} onChangeText={setBisayaText} multiline height={128} />
            </View>

            {/* Card 3: vocabulary */}
            <View style={styles.card}>
              <SectionHeader number="3" title="Vocabulary" tag="Optional" />
              <FloatingInput label="Difficult Word" value={vocabWord} onChangeText={setVocabWord} />
              <FloatingInput label="English Definition" value={vocabEnDef} onChangeText={setVocabEnDef} />
              <FloatingInput label="Bisaya Definition" value={vocabBisDef} onChangeText={setVocabBisDef} />
            </View>

            {/* Card 4: quiz */}
            <View style={styles.card}>
              <SectionHeader number="4" title="Quiz Question" />

              <View style={styles.segmentTrack}>
                <TouchableOpacity
                  style={[styles.segment, quizType === 'multiple_choice' && styles.segmentActive]}
                  activeOpacity={0.85}
                  onPress={() => setQuizType('multiple_choice')}
                >
                  <Ionicons name="list" size={16} color={colors.primaryDark} style={{ opacity: quizType === 'multiple_choice' ? 1 : 0.6 }} />
                  <Text style={[styles.segmentText, quizType === 'multiple_choice' && styles.segmentTextActive]}>Multiple Choice</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, quizType === 'fill_in_the_blank' && styles.segmentActive]}
                  activeOpacity={0.85}
                  onPress={() => setQuizType('fill_in_the_blank')}
                >
                  <Ionicons name="create-outline" size={16} color={colors.primaryDark} style={{ opacity: quizType === 'fill_in_the_blank' ? 1 : 0.6 }} />
                  <Text style={[styles.segmentText, quizType === 'fill_in_the_blank' && styles.segmentTextActive]}>Fill in the Blank</Text>
                </TouchableOpacity>
              </View>

              {quizType === 'multiple_choice' ? (
                <View>
                  <FloatingInput label="Question" value={question} onChangeText={setQuestion} />
                  <Text style={styles.helperText}>Tap a letter to mark the correct answer.</Text>
                  {[choiceA, choiceB, choiceC, choiceD].map((choice, idx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const setters = [setChoiceA, setChoiceB, setChoiceC, setChoiceD];
                    const isCorrect = correctIndex === idx;
                    return (
                      <View key={idx} style={styles.choiceRow}>
                        <TouchableOpacity style={[styles.letterBox, isCorrect && styles.letterBoxCorrect]} onPress={() => setCorrectIndex(idx)}>
                          {isCorrect ? (
                            <Ionicons name="checkmark" size={22} color={colors.textLight} />
                          ) : (
                            <Text style={styles.letterText}>{letters[idx]}</Text>
                          )}
                        </TouchableOpacity>
                        <FloatingInput
                          style={styles.choiceField}
                          label={`Choice ${letters[idx]}`}
                          value={choice}
                          onChangeText={setters[idx]}
                          accent={isCorrect}
                        />
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View>
                  <FloatingInput label="Question" hint="e.g. The boy played in the _____" value={fibQuestion} onChangeText={setFibQuestion} />
                  <FloatingInput label="Correct Answer" value={fibAnswer} onChangeText={setFibAnswer} />
                </View>
              )}
            </View>

            <View style={styles.saveWrap}>
              <TactileButton onPress={handleSave}>
                <Ionicons name={editStory ? "checkmark-circle" : "save"} size={22} color={colors.textLight} />
                <Text style={styles.saveBtnText}>{editStory ? 'Update Story' : 'Save Story to Library'}</Text>
              </TactileButton>
            </View>

            {editStory && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.setParams({ editStory: null })}>
                <Text style={styles.cancelBtnText}>Cancel Edit</Text>
              </TouchableOpacity>
            )}

            {/* Manage stories */}
            <View style={[styles.card, styles.manageCard]}>
              <SectionHeader icon="library" title={`Manage My Stories (${myStories.length})`} />
              {myStories.length === 0 && (
                <Text style={styles.emptyText}>No custom stories yet.</Text>
              )}
              {myStories.map((story) => (
                <View key={story.id} style={styles.storyRow}>
                  <View style={styles.storyRowIcon}>
                    <Ionicons name="book" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.storyRowInfo}>
                    <Text style={styles.storyRowTitle} numberOfLines={1}>{story.title}</Text>
                  </View>
                  <TouchableOpacity style={[styles.iconBtn, styles.iconBtnEdit]} onPress={() => handleEditClick(story)} accessibilityLabel="Edit story">
                    <Ionicons name="pencil" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDelete]} onPress={() => handleDelete(story.id, story.title)} accessibilityLabel="Delete story">
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SCREEN_BG },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  title: { fontSize: TITLE_SIZE, lineHeight: TITLE_SIZE + 8, fontFamily: typography.fontBold, color: colors.textPrimary },
  subtitle: { fontSize: typography.body, fontFamily: typography.fontRegular, color: colors.textSecondary, marginTop: 2 },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center' },
  sectionBadgeText: { fontSize: typography.bodySmall, fontFamily: typography.fontBold, color: colors.primaryDark },
  sectionHeader: { flexShrink: 1, fontSize: typography.heading3, fontFamily: typography.fontBold, color: colors.textPrimary },
  sectionTag: { backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  sectionTagText: { fontSize: typography.tiny, fontFamily: typography.fontSemiBold, color: colors.textSecondary },

  // Floating-label field
  field: {
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  fieldFocused: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fieldAccent: { borderColor: colors.primary, backgroundColor: 'rgba(204, 251, 241, 0.35)' },
  floatLabel: { position: 'absolute', left: 14, right: 14, fontFamily: typography.fontSemiBold },
  fieldInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 22,
    paddingBottom: 4,
    fontSize: typography.body,
    fontFamily: typography.fontRegular,
    color: colors.textPrimary,
  },
  fieldInputMultiline: { paddingTop: 26, paddingBottom: 10 },

  // Segmented control
  segmentTrack: { flexDirection: 'row', backgroundColor: colors.primarySoft, borderRadius: radius.pill, padding: 4, marginBottom: spacing.md },
  segment: { flex: 1, minHeight: 42, flexDirection: 'row', gap: 6, borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center' },
  segmentActive: { backgroundColor: colors.surface, ...shadows.card },
  segmentText: { fontSize: typography.bodySmall, fontFamily: typography.fontSemiBold, color: colors.primaryDark, opacity: 0.7 },
  segmentTextActive: { fontFamily: typography.fontBold, opacity: 1 },

  // Multiple-choice rows
  helperText: { fontSize: typography.caption, fontFamily: typography.fontRegular, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.sm },
  choiceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  letterBox: { width: FIELD_H, height: FIELD_H, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  letterBoxCorrect: { backgroundColor: colors.primary, borderColor: colors.primary },
  letterText: { fontSize: typography.bodyLarge, fontFamily: typography.fontBold, color: colors.textSecondary },
  choiceField: { flex: 1, marginBottom: 0 },

  // Save button
  saveWrap: { marginTop: spacing.sm, marginBottom: spacing.sm },
  saveLip: { top: LIP, backgroundColor: colors.primaryDark, borderRadius: radius.pill },
  saveFace: {
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
  saveBtnText: { color: colors.textLight, fontSize: typography.bodyLarge + 2, fontFamily: typography.fontBold },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.md },
  cancelBtnText: { color: colors.error, fontSize: typography.body, fontFamily: typography.fontSemiBold },

  // Manage stories
  manageCard: { marginTop: spacing.lg },
  emptyText: { fontSize: typography.bodySmall, fontFamily: typography.fontRegular, color: colors.textMuted },
  storyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceMuted, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
  storyRowIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  storyRowInfo: { flex: 1 },
  storyRowTitle: { fontSize: typography.body, fontFamily: typography.fontBold, color: colors.textPrimary },
  iconBtn: { width: 40, height: 40, marginLeft: spacing.xs, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' },
  iconBtnEdit: { backgroundColor: colors.primarySoft },
  iconBtnDelete: { backgroundColor: 'rgba(239, 68, 68, 0.12)' },
});