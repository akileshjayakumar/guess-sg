export type Category = 'food' | 'places' | 'singlish' | 'all';

export interface WordData {
  word: string;
  category: Category;
  hint: string;
  emoji: string;
}

export const WORDS: WordData[] = [
  // FOOD (5 letters only)
  { word: 'LAKSA', category: 'food', hint: 'Spicy noodle soup with coconut milk', emoji: '🍜' },
  { word: 'SATAY', category: 'food', hint: 'Grilled meat on sticks with peanut sauce', emoji: '🍢' },
  { word: 'ROJAK', category: 'food', hint: 'Mixed fruit and vegetable salad with sweet sauce', emoji: '🥗' },
  { word: 'CHILI', category: 'food', hint: '_____ crab - Singapore national dish', emoji: '🦀' },
  { word: 'CURRY', category: 'food', hint: '_____ puff - popular pastry snack', emoji: '🥟' },
  { word: 'PRAWN', category: 'food', hint: 'Noodle dish with these shellfish', emoji: '🦐' },
  { word: 'TOAST', category: 'food', hint: 'Kaya _____ - breakfast staple', emoji: '🍞' },
  { word: 'BROTH', category: 'food', hint: 'Bak kut teh is a pork rib _____', emoji: '🍲' },
  { word: 'SPICE', category: 'food', hint: 'What makes laksa so flavorful', emoji: '🌶️' },
  { word: 'SUGAR', category: 'food', hint: 'Sweet addition to teh tarik', emoji: '🍬' },

  // PLACES (5 letters only)
  { word: 'BUGIS', category: 'places', hint: 'Street market and MRT area', emoji: '🛒' },
  { word: 'BEDOK', category: 'places', hint: 'Eastern residential town', emoji: '🏠' },
  { word: 'JEWEL', category: 'places', hint: 'Airport mall with waterfall', emoji: '💎' },
  { word: 'PULAU', category: 'places', hint: '_____ Ubin - rustic island', emoji: '🚲' },
  { word: 'PASIR', category: 'places', hint: '_____ Ris - beach town', emoji: '🏖️' },
  { word: 'TIONG', category: 'places', hint: '_____ Bahru hipster area', emoji: '☕' },
  { word: 'DOVER', category: 'places', hint: 'MRT station near polytechnic', emoji: '🎓' },
  { word: 'SANDS', category: 'places', hint: 'Marina Bay _____', emoji: '🏨' },
  { word: 'QUAYS', category: 'places', hint: 'Boat and Clarke _____', emoji: '🌃' },
  { word: 'CREEK', category: 'places', hint: 'Rochor _____', emoji: '🏞️' },

  // SINGLISH (5 letters only)
  { word: 'SHIOK', category: 'singlish', hint: 'Feeling of extreme pleasure', emoji: '😍' },
  { word: 'KIASU', category: 'singlish', hint: 'Fear of losing out', emoji: '😰' },
  { word: 'MAKAN', category: 'singlish', hint: 'To eat', emoji: '😋' },
  { word: 'CHOPE', category: 'singlish', hint: 'To reserve using tissue packets', emoji: '🧻' },
  { word: 'WALAO', category: 'singlish', hint: 'Exclamation of surprise', emoji: '😮' },
  { word: 'BOJIO', category: 'singlish', hint: 'Didn\'t invite me!', emoji: '😤' },
  { word: 'LEPAK', category: 'singlish', hint: 'To hang out and relax', emoji: '😎' },
  { word: 'SIBEI', category: 'singlish', hint: 'Very/Extremely (Hokkien)', emoji: '💯' },
  { word: 'BOLEH', category: 'singlish', hint: 'Can/Possible', emoji: '✅' },
  { word: 'GABRA', category: 'singlish', hint: 'Panicked and confused', emoji: '😵' },
];

export function getWordsByCategory(category: Category): WordData[] {
  return category === 'all' ? WORDS : WORDS.filter(w => w.category === category);
}

export function getRandomWord(category: Category, exclude: string[] = []): WordData {
  const pool = getWordsByCategory(category);
  const excludeSet = new Set(exclude.map(word => word.trim().toUpperCase()));

  const available = pool.filter(word => !excludeSet.has(word.word.toUpperCase()));
  const source = available.length > 0 ? available : pool;

  const index = Math.floor(Math.random() * source.length);
  return source[index];
}

export async function fetchDailyWord(category: Category, exclude: string[] = []): Promise<WordData> {
  try {
    const response = await fetch('/api/daily-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        exclude: exclude.map(word => word.trim().toUpperCase()),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch daily word');
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      word: data.word,
      category: (data.category as Category) ?? category,
      hint: data.hint,
      emoji: data.emoji,
    };
  } catch (error) {
    console.error('Error fetching daily word, using fallback:', error);
    return getRandomWord(category, exclude);
  }
}