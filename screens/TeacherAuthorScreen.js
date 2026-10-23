// screens/TeacherAuthorScreen.js
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { saveCustomStory } from '../database/storyService';

export default function TeacherAuthorScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [titleBisaya, setTitleBisaya] = useState('');
  const [description, setDescription] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [bisayaText, setBisayaText] = useState('');

  const handleSave = async () => {
    if (!title || !englishText || !bisayaText) {
      Alert.alert('Missing Fields', 'Please fill in the title, English text, and Bisaya text.');
      return;
    }

    try {
      await saveCustomStory({
        title,
        titleBisaya,
        description: description || 'A custom story created by the teacher.',
        englishText,
        bisayaText,
      });
      Alert.alert('Success!', 'Story saved successfully. It will now appear on the learner home screen.');
      
      // Clear form
      setTitle('');
      setTitleBisaya('');
      setDescription('');
      setEnglishText('');
      setBisayaText('');
      
      // Send them to the dashboard
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save the story.');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.header}>
              <Text style={styles.title}>Create a Story</Text>
              <Text style={styles.subtitle}>Write a new lesson for your learners</Text>
            </View>

            <Text style={styles.label}>Story Title (English) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., The Lazy Carabao"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Story Title (Bisaya)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Ang Tapulan nga Kabaw"
              value={titleBisaya}
              onChangeText={setTitleBisaya}
            />

            <Text style={styles.label}>Short Description</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="A short summary of the story"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Page 1: English Text *</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Write the English story here..."
              value={englishText}
              onChangeText={setEnglishText}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.label}>Page 1: Bisaya Translation *</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Isulat ang Bisaya nga hubad dinhi..."
              value={bisayaText}
              onChangeText={setBisayaText}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="save" size={20} color={colors.textLight} />
              <Text style={styles.saveBtnText}>Save Story to Library</Text>
            </TouchableOpacity>

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
  label: { fontSize: typography.bodySmall, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: typography.body, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
  },
  saveBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: spacing.sm, backgroundColor: colors.primary,
    borderRadius: radius.pill, paddingVertical: spacing.lg, marginTop: spacing.xxl,
    ...shadows.cardLarge,
  },
  saveBtnText: { color: colors.textLight, fontSize: typography.bodyLarge, fontWeight: '700' },
});