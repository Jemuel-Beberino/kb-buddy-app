// screens/TeacherAuthorScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { saveCustomStory, getCustomStories, deleteCustomStory, updateCustomStory } from '../database/storyService';

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
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.header}>
              <Text style={styles.title}>{editStory ? 'Edit Story' : 'Create a Story'}</Text>
              <Text style={styles.subtitle}>{editStory ? 'Update your custom story' : 'Write a new lesson for your learners'}</Text>
            </View>

            <Text style={styles.sectionHeader}>1. Story Details</Text>
            <TextInput style={styles.input} placeholder="Story Title *" value={title} onChangeText={setTitle} />

            <Text style={styles.sectionHeader}>2. Story Text (Page 1)</Text>
            <TextInput style={[styles.input, { height: 100 }]} placeholder="English Text *" value={englishText} onChangeText={setEnglishText} multiline textAlignVertical="top" />
            <TextInput style={[styles.input, { height: 100 }]} placeholder="Bisaya Translation *" value={bisayaText} onChangeText={setBisayaText} multiline textAlignVertical="top" />

            <Text style={styles.sectionHeader}>3. Vocabulary (Optional)</Text>
            <TextInput style={styles.input} placeholder="Difficult Word" value={vocabWord} onChangeText={setVocabWord} />
            <TextInput style={styles.input} placeholder="English Definition" value={vocabEnDef} onChangeText={setVocabEnDef} />
            <TextInput style={styles.input} placeholder="Bisaya Definition" value={vocabBisDef} onChangeText={setVocabBisDef} />

            <Text style={styles.sectionHeader}>4. Quiz Question</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.toggleBtn, quizType === 'multiple_choice' && styles.toggleBtnActive]} onPress={() => setQuizType('multiple_choice')}>
                <Text style={[styles.toggleText, quizType === 'multiple_choice' && styles.toggleTextActive]}>Multiple Choice</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleBtn, quizType === 'fill_in_the_blank' && styles.toggleBtnActive]} onPress={() => setQuizType('fill_in_the_blank')}>
                <Text style={[styles.toggleText, quizType === 'fill_in_the_blank' && styles.toggleTextActive]}>Fill in the Blank</Text>
              </TouchableOpacity>
            </View>

            {quizType === 'multiple_choice' ? (
              <View>
                <TextInput style={styles.input} placeholder="Question" value={question} onChangeText={setQuestion} />
                {[choiceA, choiceB, choiceC, choiceD].map((choice, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const setters = [setChoiceA, setChoiceB, setChoiceC, setChoiceD];
                  const isCorrect = correctIndex === idx;
                  return (
                    <View key={idx} style={styles.choiceRow}>
                      <TouchableOpacity style={[styles.letterBox, isCorrect && styles.letterBoxCorrect]} onPress={() => setCorrectIndex(idx)}>
                        <Text style={[styles.letterText, isCorrect && styles.letterTextCorrect]}>{letters[idx]}</Text>
                      </TouchableOpacity>
                      <TextInput style={[styles.choiceInput, isCorrect && styles.choiceInputCorrect]} placeholder={`Choice ${letters[idx]}`} value={choice} onChangeText={setters[idx]} />
                    </View>
                  );
                })}
              </View>
            ) : (
              <View>
                <TextInput style={styles.input} placeholder="Question (e.g. The boy played in the _____)" value={fibQuestion} onChangeText={setFibQuestion} />
                <TextInput style={styles.input} placeholder="Correct Answer" value={fibAnswer} onChangeText={setFibAnswer} />
              </View>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name={editStory ? "checkmark-circle" : "save"} size={20} color={colors.textLight} />
              <Text style={styles.saveBtnText}>{editStory ? 'Update Story' : 'Save Story to Library'}</Text>
            </TouchableOpacity>

            {editStory && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.setParams({ editStory: null })}>
                <Text style={styles.cancelBtnText}>Cancel Edit</Text>
              </TouchableOpacity>
            )}

            <View style={styles.manageSection}>
              <Text style={styles.sectionHeader}>Manage My Stories ({myStories.length})</Text>
              {myStories.map((story) => (
                <View key={story.id} style={styles.storyRow}>
                  <View style={styles.storyRowInfo}>
                    <Text style={styles.storyRowTitle} numberOfLines={1}>{story.title}</Text>
                  </View>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleEditClick(story)}>
                    <Ionicons name="pencil" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(story.id, story.title)}>
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
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.xl },
  title: { fontSize: typography.displayMedium, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: typography.body, color: colors.textSecondary, marginTop: 4 },
  sectionHeader: { fontSize: typography.heading3, fontWeight: '700', color: colors.primary, marginTop: spacing.xl, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.body, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  toggleBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontSize: typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
  toggleTextActive: { color: colors.textLight },
  choiceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  letterBox: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  letterBoxCorrect: { backgroundColor: colors.primary, borderColor: colors.primary },
  letterText: { fontSize: typography.body, fontWeight: '700', color: colors.textSecondary },
  letterTextCorrect: { color: colors.textLight },
  choiceInput: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 40, fontSize: typography.body, borderWidth: 1, borderColor: colors.border },
  choiceInputCorrect: { borderColor: colors.primary, borderWidth: 1.5 },
  saveBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.lg, marginTop: spacing.xl, ...shadows.cardLarge },
  saveBtnText: { color: colors.textLight, fontSize: typography.bodyLarge, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  cancelBtnText: { color: colors.error, fontSize: typography.body, fontWeight: '600' },
  manageSection: { marginTop: spacing.xxl, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
  storyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  storyRowInfo: { flex: 1 },
  storyRowTitle: { fontSize: typography.body, fontWeight: '700', color: colors.textPrimary },
  iconBtn: { padding: spacing.sm, marginLeft: spacing.xs, backgroundColor: colors.surfaceMuted, borderRadius: radius.sm },
});