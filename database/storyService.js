// database/storyService.js
import { getDatabase } from './db';

export async function saveCustomStory({
  title,
  titleBisaya,
  description,
  englishText,
  bisayaText,
}) {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO custom_stories 
     (title, titleBisaya, description, englishText, bisayaText, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, titleBisaya, description, englishText, bisayaText, now]
  );
}

  export async function getCustomStories() {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM custom_stories ORDER BY createdAt DESC');
  return rows.map((row) => ({
    id: `custom_${row.id}`,
    title: row.title,
    titleBisaya: row.titleBisaya || '',
    category: 'values', // Default category
    categoryLabel: 'Custom',
    categoryColor: '#8B5CF6', // Purple
    gradientColors: ['#8B5CF6', '#6D28D9'],
    icon: 'book-open-page-variant',
    readTime: '3 min',
    pageCount: 1,
    vocabularyCount: 0,
    status: 'not-started',
    description: row.description,
    isCustom: true,
    pages: [
      {
        pageNumber: 1,
        image: 'custom/placeholder.png', // We will handle this in StoryReader
        englishText: row.englishText,
        bisayaText: row.bisayaText,
        vocabulary: [],
      }
    ],
    quiz: [
      {
        question: 'Did you understand the story?',
        questionBisaya: 'Nasabtan nimo ang istorya?',
        choices: ['Yes', 'No', 'Maybe', 'I need to read it again'],
        correctAnswerIndex: 0,
      }
    ]
  }));
}