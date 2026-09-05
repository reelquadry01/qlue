import { Prompt } from '@/engine/types';

export const SEED_PROMPTS: Prompt[] = [
  // Nigerian Culture (20)
  { id: 'ng-001', text: 'Jollof Rice', answer: 'Jollof Rice', categoryId: 'nigerian-culture', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ng-002', text: 'Suya', answer: 'Suya', categoryId: 'nigerian-culture', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ng-003', text: 'Eba', answer: 'Eba', categoryId: 'nigerian-culture', difficulty: 'medium', gameMode: 'classic' },
  { id: 'ng-004', text: 'Nollywood', answer: 'Nollywood', categoryId: 'nigerian-culture', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ng-005', text: 'Afrobeats', answer: 'Afrobeats', categoryId: 'nigerian-culture', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ng-006', text: 'Ojuelegba', answer: 'Ojuelegba', categoryId: 'nigerian-culture', difficulty: 'medium', gameMode: 'classic' },
  { id: 'ng-007', text: 'Danfo', answer: 'Danfo', categoryId: 'nigerian-culture', difficulty: 'medium', gameMode: 'classic' },
  { id: 'ng-008', text: 'Keke Napep', answer: 'Keke Napep', categoryId: 'nigerian-culture', difficulty: 'medium', gameMode: 'classic' },
  { id: 'ng-009', text: 'Waakye', answer: 'Waakye', categoryId: 'nigerian-culture', difficulty: 'medium', gameMode: 'classic' },
  { id: 'ng-010', text: 'Moi Moi', answer: 'Moi Moi', categoryId: 'nigerian-culture', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ng-011', text: 'Puff Puff', answer: 'Puff Puff', categoryId: 'nigerian-culture', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ng-012', text: 'Egusi Soup', answer: 'Egusi Soup', categoryId: 'nigerian-culture', difficulty: 'medium', gameMode: 'classic' },
  { id: 'ng-013', text: 'Aso Ebi', answer: 'Aso Ebi', categoryId: 'nigerian-culture', difficulty: 'medium', gameMode: 'classic' },
  { id: 'ng-014', text: 'Owambe', answer: 'Owambe', categoryId: 'nigerian-culture', difficulty: 'medium', gameMode: 'classic' },
  { id: 'ng-015', text: 'Japa', answer: 'Japa', categoryId: 'nigerian-culture', difficulty: 'hard', gameMode: 'classic' },
  { id: 'ng-016', text: 'Owanbe', answer: 'Owanbe', categoryId: 'nigerian-culture', difficulty: 'hard', gameMode: 'classic' },
  { id: 'ng-017', text: 'Naira', answer: 'Naira', categoryId: 'nigerian-culture', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ng-018', text: 'Lagos', answer: 'Lagos', categoryId: 'nigerian-culture', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ng-019', text: 'Abuja', answer: 'Abuja', categoryId: 'nigerian-culture', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ng-020', text: 'Chin Chin', answer: 'Chin Chin', categoryId: 'nigerian-culture', difficulty: 'easy', gameMode: 'classic' },

  // General Knowledge (20)
  { id: 'gk-001', text: 'The Sun', answer: 'The Sun', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'gk-002', text: 'Water boils at this temperature in Celsius', answer: '100 degrees', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'gk-003', text: 'The largest ocean on Earth', answer: 'Pacific Ocean', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'gk-004', text: 'The chemical symbol for gold', answer: 'Au', categoryId: 'general-knowledge', difficulty: 'medium', gameMode: 'classic' },
  { id: 'gk-005', text: 'The tallest mountain in the world', answer: 'Mount Everest', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'gk-006', text: 'The speed of light in km per second', answer: '300,000 km/s', categoryId: 'general-knowledge', difficulty: 'hard', gameMode: 'classic' },
  { id: 'gk-007', text: 'The largest planet in our solar system', answer: 'Jupiter', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'gk-008', text: 'The element with atomic number 1', answer: 'Hydrogen', categoryId: 'general-knowledge', difficulty: 'medium', gameMode: 'classic' },
  { id: 'gk-009', text: 'The longest river in the world', answer: 'Nile River', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'gk-010', text: 'The inventor of the telephone', answer: 'Alexander Graham Bell', categoryId: 'general-knowledge', difficulty: 'medium', gameMode: 'classic' },
  { id: 'gk-011', text: 'The chemical symbol for water', answer: 'H2O', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'gk-012', text: 'The hardest natural substance on Earth', answer: 'Diamond', categoryId: 'general-knowledge', difficulty: 'medium', gameMode: 'classic' },
  { id: 'gk-013', text: 'The country with the most people', answer: 'India', categoryId: 'general-knowledge', difficulty: 'medium', gameMode: 'classic' },
  { id: 'gk-014', text: 'The number of continents', answer: '7', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'gk-015', text: 'The organ that pumps blood', answer: 'Heart', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'gk-016', text: 'The powerhouse of the cell', answer: 'Mitochondria', categoryId: 'general-knowledge', difficulty: 'hard', gameMode: 'classic' },
  { id: 'gk-017', text: 'The planet closest to the Sun', answer: 'Mercury', categoryId: 'general-knowledge', difficulty: 'medium', gameMode: 'classic' },
  { id: 'gk-018', text: 'The capital of France', answer: 'Paris', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'gk-019', text: 'The largest desert in the world', answer: 'Sahara Desert', categoryId: 'general-knowledge', difficulty: 'medium', gameMode: 'classic' },
  { id: 'gk-020', text: 'The square root of 144', answer: '12', categoryId: 'general-knowledge', difficulty: 'medium', gameMode: 'classic' },

  // Sports (15)
  { id: 'sp-001', text: 'Lionel Messi', answer: 'Lionel Messi', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },
  { id: 'sp-002', text: 'Cristiano Ronaldo', answer: 'Cristiano Ronaldo', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },
  { id: 'sp-003', text: 'Usain Bolt', answer: 'Usain Bolt', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },
  { id: 'sp-004', text: 'The Super Eagles', answer: 'Nigeria National Football Team', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },
  { id: 'sp-005', text: 'Nkanu', answer: 'Nkanu', categoryId: 'sports', difficulty: 'hard', gameMode: 'classic' },
  { id: 'sp-006', text: 'The FIFA World Cup trophy', answer: 'FIFA World Cup', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },
  { id: 'sp-007', text: 'Michael Jordan', answer: 'Michael Jordan', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },
  { id: 'sp-008', text: 'Serena Williams', answer: 'Serena Williams', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },
  { id: 'sp-009', text: 'The Olympic Games are held every how many years', answer: '4 years', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },
  { id: 'sp-010', text: 'Real Madrid', answer: 'Real Madrid', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },
  { id: 'sp-011', text: 'Anthony Joshua', answer: 'Anthony Joshua', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },
  { id: 'sp-012', text: 'Asisat Oshoala', answer: 'Asisat Oshoala', categoryId: 'sports', difficulty: 'medium', gameMode: 'classic' },
  { id: 'sp-013', text: 'Tobi Amusan', answer: 'Tobi Amusan', categoryId: 'sports', difficulty: 'medium', gameMode: 'classic' },
  { id: 'sp-014', text: 'The Premier League', answer: 'English Premier League', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },
  { id: 'sp-015', text: 'Formula 1', answer: 'Formula 1', categoryId: 'sports', difficulty: 'easy', gameMode: 'classic' },

  // Entertainment (15)
  { id: 'en-001', text: 'Wizkid', answer: 'Wizkid', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },
  { id: 'en-002', text: 'Burna Boy', answer: 'Burna Boy', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },
  { id: 'en-003', text: 'Davido', answer: 'Davido', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },
  { id: 'en-004', text: 'Tiwa Savage', answer: 'Tiwa Savage', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },
  { id: 'en-005', text: 'The Lion King', answer: 'The Lion King', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },
  { id: 'en-006', text: 'Marvel Avengers', answer: 'Avengers', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },
  { id: 'en-007', text: 'Beyonce', answer: 'Beyonce', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },
  { id: 'en-008', text: 'Netflix', answer: 'Netflix', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },
  { id: 'en-009', text: 'Genevieve Nnaji', answer: 'Genevieve Nnaji', categoryId: 'entertainment', difficulty: 'medium', gameMode: 'classic' },
  { id: 'en-010', text: 'Omotola Jalade Ekeinde', answer: 'Omotola Jalade Ekeinde', categoryId: 'entertainment', difficulty: 'medium', gameMode: 'classic' },
  { id: 'en-011', text: 'Rema', answer: 'Rema', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },
  { id: 'en-012', text: 'Ayra Starr', answer: 'Ayra Starr', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },
  { id: 'en-013', text: 'The Grammy Awards', answer: 'Grammy Awards', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },
  { id: 'en-014', text: 'Lionel Richie', answer: 'Lionel Richie', categoryId: 'entertainment', difficulty: 'medium', gameMode: 'classic' },
  { id: 'en-015', text: 'YouTube', answer: 'YouTube', categoryId: 'entertainment', difficulty: 'easy', gameMode: 'classic' },

  // Christianity (10)
  { id: 'ch-001', text: 'Moses', answer: 'Moses', categoryId: 'faith-christianity', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ch-002', text: 'David and Goliath', answer: 'David and Goliath', categoryId: 'faith-christianity', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ch-003', text: 'The Ten Commandments', answer: 'Ten Commandments', categoryId: 'faith-christianity', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ch-004', text: 'Noah', answer: 'Noah', categoryId: 'faith-christianity', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ch-005', text: 'The Garden of Eden', answer: 'Garden of Eden', categoryId: 'faith-christianity', difficulty: 'medium', gameMode: 'classic' },
  { id: 'ch-006', text: 'Abraham', answer: 'Abraham', categoryId: 'faith-christianity', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ch-007', text: 'The Christmas Story', answer: 'Birth of Jesus', categoryId: 'faith-christianity', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ch-008', text: 'Easter', answer: 'Resurrection of Jesus', categoryId: 'faith-christianity', difficulty: 'easy', gameMode: 'classic' },
  { id: 'ch-009', text: 'The Lord is my Shepherd', answer: 'Psalm 23', categoryId: 'faith-christianity', difficulty: 'medium', gameMode: 'classic' },
  { id: 'ch-010', text: 'Daniel in the Lions Den', answer: 'Daniel', categoryId: 'faith-christianity', difficulty: 'medium', gameMode: 'classic' },

  // Islam (10)
  { id: 'is-001', text: 'The Holy Quran', answer: 'Quran', categoryId: 'faith-islam', difficulty: 'easy', gameMode: 'classic' },
  { id: 'is-002', text: 'The Five Pillars of Islam', answer: 'Five Pillars', categoryId: 'faith-islam', difficulty: 'medium', gameMode: 'classic' },
  { id: 'is-003', text: 'Mecca', answer: 'Mecca', categoryId: 'faith-islam', difficulty: 'easy', gameMode: 'classic' },
  { id: 'is-004', text: 'Prophet Muhammad', answer: 'Prophet Muhammad', categoryId: 'faith-islam', difficulty: 'easy', gameMode: 'classic' },
  { id: 'is-005', text: 'Ramadan', answer: 'Ramadan', categoryId: 'faith-islam', difficulty: 'easy', gameMode: 'classic' },
  { id: 'is-006', text: 'The First Caliph', answer: 'Abu Bakr', categoryId: 'faith-islam', difficulty: 'hard', gameMode: 'classic' },
  { id: 'is-007', text: 'The Night Journey', answer: 'Isra and Mi\'raj', categoryId: 'faith-islam', difficulty: 'hard', gameMode: 'classic' },
  { id: 'is-008', text: 'Zakat', answer: 'Zakat', categoryId: 'faith-islam', difficulty: 'medium', gameMode: 'classic' },
  { id: 'is-009', text: 'The Kaaba', answer: 'Kaaba', categoryId: 'faith-islam', difficulty: 'easy', gameMode: 'classic' },
  { id: 'is-010', text: 'Salah', answer: 'Salah', categoryId: 'faith-islam', difficulty: 'easy', gameMode: 'classic' },

  // Technology (10)
  { id: 'te-001', text: 'iPhone', answer: 'iPhone', categoryId: 'technology', difficulty: 'easy', gameMode: 'classic' },
  { id: 'te-002', text: 'Google', answer: 'Google', categoryId: 'technology', difficulty: 'easy', gameMode: 'classic' },
  { id: 'te-003', text: 'ChatGPT', answer: 'ChatGPT', categoryId: 'technology', difficulty: 'easy', gameMode: 'classic' },
  { id: 'te-004', text: 'Elon Musk', answer: 'Elon Musk', categoryId: 'technology', difficulty: 'easy', gameMode: 'classic' },
  { id: 'te-005', text: 'SpaceX', answer: 'SpaceX', categoryId: 'technology', difficulty: 'easy', gameMode: 'classic' },
  { id: 'te-006', text: 'Bitcoin', answer: 'Bitcoin', categoryId: 'technology', difficulty: 'easy', gameMode: 'classic' },
  { id: 'te-007', text: 'The World Wide Web', answer: 'World Wide Web', categoryId: 'technology', difficulty: 'medium', gameMode: 'classic' },
  { id: 'te-008', text: 'Mark Zuckerberg', answer: 'Mark Zuckerberg', categoryId: 'technology', difficulty: 'easy', gameMode: 'classic' },
  { id: 'te-009', text: 'Artificial Intelligence', answer: 'AI', categoryId: 'technology', difficulty: 'easy', gameMode: 'classic' },
  { id: 'te-010', text: 'Tesla', answer: 'Tesla', categoryId: 'technology', difficulty: 'easy', gameMode: 'classic' },
];

export function getPromptsByCategory(categoryId: string): Prompt[] {
  return SEED_PROMPTS.filter((p) => p.categoryId === categoryId);
}

export function getPromptCountByCategory(categoryId: string): number {
  return SEED_PROMPTS.filter((p) => p.categoryId === categoryId).length;
}
