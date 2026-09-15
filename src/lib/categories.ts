export interface CategoryDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'nigerian-culture',
    name: 'Naija Vibes',
    icon: '🇳🇬',
    color: '#22C55E',
    subcategories: ['Food', 'Slang', 'Nollywood', 'Music', 'Lagos Life', 'Traditions'],
  },
  {
    id: 'general-knowledge',
    name: 'Brain Teasers',
    icon: '🧠',
    color: '#F59E0B',
    subcategories: ['Science', 'Geography', 'History', 'Human Body', 'Space'],
  },
  {
    id: 'sports',
    name: 'Sports Zone',
    icon: '⚽',
    color: '#EF4444',
    subcategories: ['Football', 'Athletics', 'Olympics', 'NBA', 'Boxing', 'F1'],
  },
  {
    id: 'entertainment',
    name: 'Pop Culture',
    icon: '🎬',
    color: '#EC4899',
    subcategories: ['Movies', 'Music', 'Celebrities', 'TV Shows', 'Social Media'],
  },
  {
    id: 'faith-christianity',
    name: 'Bible Stories',
    icon: '✝️',
    color: '#3B82F6',
    subcategories: ['Old Testament', 'New Testament', 'Parables', 'Miracles'],
  },
  {
    id: 'faith-islam',
    name: 'Islamic Knowledge',
    icon: '☪️',
    color: '#10B981',
    subcategories: ['Quran', 'Prophets', 'Practices', 'History'],
  },
  {
    id: 'technology',
    name: 'Tech World',
    icon: '💻',
    color: '#8B5CF6',
    subcategories: ['Internet', 'AI', 'Smartphones', 'Gaming', 'Social Media'],
  },
  {
    id: 'movies-tv',
    name: 'Movies & TV',
    icon: '🍿',
    color: '#F97316',
    subcategories: ['Hollywood', 'Nollywood', 'Series', 'Cartoons', 'Anime'],
  },
  {
    id: 'music',
    name: 'Music Madness',
    icon: '🎵',
    color: '#06D6A0',
    subcategories: ['Afrobeats', 'Hip Hop', 'Pop', 'Rock', 'Classical', 'R&B'],
  },
  {
    id: 'food-drinks',
    name: 'Foodie Quiz',
    icon: '🍕',
    color: '#EAB308',
    subcategories: ['Nigerian Food', 'World Cuisines', 'Drinks', 'Street Food', 'Desserts'],
  },
  {
    id: 'animals',
    name: 'Wild Kingdom',
    icon: '🦁',
    color: '#78716C',
    subcategories: ['African Wildlife', 'Sea Creatures', 'Birds', 'Insects', 'Extinct'],
  },
  {
    id: 'riddles',
    name: 'Riddle Me This',
    icon: '🧩',
    color: '#A855F7',
    subcategories: ['Wordplay', 'Math Riddles', 'Logic', 'Tricky Questions'],
  },
];

export function getCategoryById(id: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name ?? id;
}
