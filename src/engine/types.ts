export type GameStatus =
  | 'HOME'
  | 'SETUP_PLAYERS'
  | 'SETUP_TEAMS'
  | 'SETUP_CATEGORIES'
  | 'SETUP_SETTINGS'
  | 'ROUND_READY'
  | 'PHONE_PASS'
  | 'COUNTDOWN'
  | 'ROUND_ACTIVE'
  | 'ROUND_RESULTS'
  | 'FINAL_RESULTS';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type GameMode = 'classic' | 'rapid-fire' | 'trivia' | 'taboo' | 'who-am-i' | 'chaos';

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  score: number;
  streak: number;
  bestStreak: number;
}

export interface Prompt {
  id: string;
  text: string;
  answer: string;
  categoryId: string;
  subcategoryId?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  forbiddenWords?: string[];
  gameMode: string;
}

export interface CategorySelection {
  categoryId: string;
  weight: number;
}

export interface GameConfig {
  teams: Team[];
  categories: CategorySelection[];
  roundDuration: number;
  totalRounds: number;
  difficulty: Difficulty;
  gameMode: GameMode;
}

export interface RoundScore {
  teamId: string;
  roundNumber: number;
  correct: number;
  skipped: number;
  streak: number;
}

export interface GameState {
  status: GameStatus;
  config: GameConfig;
  currentRound: number;
  currentTeamIndex: number;
  currentPrompt: Prompt | null;
  usedPromptIds: string[];
  roundScores: RoundScore[];
  startTime: number | null;
  timeRemaining: number;
  roundCorrect: number;
  roundSkipped: number;
}

export interface ScoringRule {
  correct: number;
  skip: number;
  streakBonuses?: { at: number; bonus: number }[];
}

export const DEFAULT_SCORING: ScoringRule = {
  correct: 1,
  skip: 0,
  streakBonuses: [
    { at: 5, bonus: 2 },
    { at: 10, bonus: 5 },
  ],
};

export const INITIAL_GAME_STATE: GameState = {
  status: 'HOME',
  config: {
    teams: [],
    categories: [],
    roundDuration: 60,
    totalRounds: 5,
    difficulty: 'mixed',
    gameMode: 'classic',
  },
  currentRound: 0,
  currentTeamIndex: 0,
  currentPrompt: null,
  usedPromptIds: [],
  roundScores: [],
  startTime: null,
  timeRemaining: 60,
  roundCorrect: 0,
  roundSkipped: 0,
};
