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
    name: 'Nigerian Culture',
    icon: '🇳🇬',
    color: '#22C55E',
    subcategories: [
      'Nigerian Food',
      'Nigerian Slang',
      'Nollywood',
      'Nigerian Music',
      'Everyday Nigerian Life',
    ],
  },
  {
    id: 'general-knowledge',
    name: 'General Knowledge',
    icon: '🧠',
    color: '#6C3CE1',
    subcategories: [
      'Science',
      'Geography',
      'History',
      'Inventions',
      'Human Body',
    ],
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    color: '#F59E0B',
    subcategories: [
      'Football',
      'Athletics',
      'Nigerian Sports',
      'Olympics',
      'Famous Athletes',
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: '#EC4899',
    subcategories: [
      'Movies',
      'Music',
      'Celebrities',
      'Nollywood',
      'Afrobeats',
    ],
  },
  {
    id: 'faith-christianity',
    name: 'Christianity',
    icon: '✝️',
    color: '#3B82F6',
    subcategories: [
      'Bible',
      'Biblical Figures',
      'Christian History',
      'Christian Practices',
    ],
  },
  {
    id: 'faith-islam',
    name: 'Islam',
    icon: '☪️',
    color: '#10B981',
    subcategories: [
      'Quran',
      'Prophets',
      'Islamic History',
      'Islamic Practices',
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    color: '#8B5CF6',
    subcategories: [
      'Internet',
      'AI',
      'Smartphones',
      'Tech Companies',
      'Gadgets',
    ],
  },
];

export function getCategoryById(id: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryName(id: string): string {
  return getCategoryById(id)?.name ?? id;
}
