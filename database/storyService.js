// database/storyService.js
import { getDatabase } from './db';

export async function saveCustomStory({
  title,
  titleBisaya,
  description,
  englishText,
  bisayaText,
  vocabWord,
  vocabEnDef,
  vocabBisDef,
  quizData,
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const quizString = JSON.stringify(quizData);

  await db.runAsync(
    `INSERT INTO custom_stories 
     (title, titleBisaya, description, englishText, bisayaText, vocab_word, vocab_en_def, vocab_bis_def, quiz_data, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, titleBisaya, description, englishText, bisayaText, vocabWord, vocabEnDef, vocabBisDef, quizString, now]
  );
}

export async function updateCustomStory({
  id,
  title,
  englishText,
  bisayaText,
  vocabWord,
  vocabEnDef,
  vocabBisDef,
  quizData,
}) {
  const db = await getDatabase();
  const numericId = id.replace('custom_', '');
  const quizString = JSON.stringify(quizData);

  await db.runAsync(
    `UPDATE custom_stories 
     SET title = ?, englishText = ?, bisayaText = ?, 
         vocab_word = ?, vocab_en_def = ?, vocab_bis_def = ?, quiz_data = ?
     WHERE id = ?`,
    [title, englishText, bisayaText, vocabWord, vocabEnDef, vocabBisDef, quizString, numericId]
  );
}

export async function getCustomStories() {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM custom_stories ORDER BY createdAt DESC');
  
  return rows.map((row) => {
    let parsedQuiz = [];
    try {
      if (row.quiz_data) parsedQuiz = JSON.parse(row.quiz_data);
    } catch (e) { console.error("Parse error", e); }

    if (parsedQuiz.length === 0) {
      parsedQuiz = [{
        questionType: 'multiple_choice',
        question: 'Did you understand the story?',
        choices: ['Yes', 'No', 'Maybe', 'I need to read it again'],
        correctAnswerIndex: 0,
      }];
    }

    let formattedEnglish = row.englishText;
    let vocabArray = [];

    if (row.vocab_word && row.vocab_en_def) {
      const regex = new RegExp(`\\b${row.vocab_word}\\b`, 'gi');
      formattedEnglish = row.englishText.replace(regex, `[${row.vocab_word}]`);

      vocabArray.push({
        word: row.vocab_word,
        partOfSpeech: 'word',
        englishDef: row.vocab_en_def,
        bisayaDef: row.vocab_bis_def || '',
        example: '',
      });
    }

    return {
      id: `custom_${row.id}`,
      title: row.title,
      titleBisaya: row.titleBisaya || '',
      category: 'values',
      categoryLabel: 'Custom',
      categoryColor: '#8B5CF6',
      gradientColors: ['#8B5CF6', '#6D28D9'],
      icon: 'book-open-page-variant',
      readTime: '3 min',
      pageCount: 1,
      vocabularyCount: vocabArray.length,
      status: 'not-started',
      description: row.description,
      isCustom: true,
      pages: [
        {
          pageNumber: 1,
          image: 'custom/placeholder.png',
          englishText: formattedEnglish,
          bisayaText: row.bisayaText,
          vocabulary: vocabArray,
        }
      ],
      quiz: parsedQuiz,
    };
  });
}

export async function deleteCustomStory(id) {
  const db = await getDatabase();
  const numericId = id.replace('custom_', ''); 
  await db.runAsync('DELETE FROM custom_stories WHERE id = ?', [numericId]);
}