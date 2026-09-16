import {
  CategorySelection,
  Difficulty,
  GameState,
  INITIAL_GAME_STATE,
  Prompt,
  Team,
} from './types';
import { applyCorrectScore, applySkipScore } from './scoring';
import { getNextPrompt } from './prompts';

/**
 * Game actions.
 *
 * Status flow:
 *   HOME -> SETUP_TEAMS -> SETUP_CATEGORIES -> SETUP_SETTINGS
 *        -> ROUND_READY -> PHONE_PASS -> COUNTDOWN -> ROUND_ACTIVE
 *        -> ROUND_RESULTS -> (PHONE_PASS | FINAL_RESULTS)
 *
 * Ownership rules:
 *   - `SET_SETTINGS` starts the game: it resets round/team position and scores.
 *   - `NEXT_ROUND` advances the turn (team first, round second) and is the only
 *     action that changes `currentRound` / `currentTeamIndex` after a round.
 *   - `START_ROUND` only marks "a round screen is showing" so a reload can be
 *     resumed; it never mutates counters. Keeping counter updates out of the
 *     round screen is what makes team rotation and round counting correct.
 */
export type GameAction =
  | { type: 'NEW_GAME' }
  | { type: 'GO_HOME' }
  | { type: 'SET_TEAMS'; teams: Team[] }
  | { type: 'SET_CATEGORIES'; categories: CategorySelection[] }
  | { type: 'PRESELECT_CATEGORY'; categoryId: string }
  | {
      type: 'SET_SETTINGS';
      roundDuration: number;
      totalRounds: number;
      difficulty: Difficulty;
    }
  | { type: 'START_ROUND' }
  | { type: 'COUNTDOWN_COMPLETE' }
  | { type: 'SET_PROMPT'; prompt: Prompt | null }
  | { type: 'ANSWER_CORRECT'; allPrompts: Prompt[] }
  | { type: 'ANSWER_SKIP'; allPrompts: Prompt[] }
  | { type: 'TIME_UP' }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'LOAD_STATE'; state: GameState };

/** Index of the team that plays next, or `null` when every team has played. */
export function getNextTeamIndex(state: GameState): number | null {
  const next = state.currentTeamIndex + 1;
  return next < state.config.teams.length ? next : null;
}

/** True when the round that just finished was the last round of the game. */
export function isLastRound(state: GameState): boolean {
  return state.currentRound >= state.config.totalRounds;
}

/** True when the current turn is the last turn of the current round. */
export function isLastTurnOfRound(state: GameState): boolean {
  return getNextTeamIndex(state) === null;
}

/**
 * Picks a follow-up prompt for the team whose turn is active.
 */
function advancePrompt(
  state: GameState,
  allPrompts: Prompt[],
  usedIds: string[]
): Pick<GameState, 'currentPrompt' | 'usedPromptIds'> {
  const nextPrompt = getNextPrompt(
    allPrompts,
    state.config.categories,
    state.config.difficulty,
    usedIds
  );
  return {
    currentPrompt: nextPrompt,
    usedPromptIds: nextPrompt ? [...usedIds, nextPrompt.id] : usedIds,
  };
}

function playedIds(state: GameState): string[] {
  return [...state.usedPromptIds, state.currentPrompt?.id].filter(
    (id): id is string => Boolean(id)
  );
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return { ...INITIAL_GAME_STATE, status: 'SETUP_PLAYERS' };

    case 'GO_HOME':
      return INITIAL_GAME_STATE;

    case 'SET_TEAMS':
      return {
        ...state,
        config: { ...state.config, teams: action.teams },
        status: 'SETUP_CATEGORIES',
      };

    case 'SET_CATEGORIES':
      return {
        ...state,
        config: { ...state.config, categories: action.categories },
        status: 'SETUP_SETTINGS',
      };

    // Used by Explore so a browsed category can be dropped straight into setup.
    case 'PRESELECT_CATEGORY':
      return {
        ...state,
        config: {
          ...state.config,
          categories: [{ categoryId: action.categoryId, weight: 50 }],
        },
      };

    case 'SET_SETTINGS':
      return {
        ...state,
        status: 'ROUND_READY',
        config: {
          ...state.config,
          roundDuration: action.roundDuration,
          totalRounds: action.totalRounds,
          difficulty: action.difficulty,
          // A fresh game always starts from zero, even when a previous game's
          // scores are still in state.
          teams: state.config.teams.map((team) => ({
            ...team,
            score: 0,
            streak: 0,
            bestStreak: 0,
          })),
        },
        currentRound: 1,
        currentTeamIndex: 0,
        currentPrompt: null,
        usedPromptIds: [],
        roundScores: [],
        startTime: null,
        timeRemaining: action.roundDuration,
        roundCorrect: 0,
        roundSkipped: 0,
      };

    case 'START_ROUND':
      // Counter updates belong to SET_SETTINGS / NEXT_ROUND, not to the screen
      // that renders a single turn.
      return state.status === 'PHONE_PASS'
        ? state
        : { ...state, status: 'PHONE_PASS' };

    case 'COUNTDOWN_COMPLETE':
      return {
        ...state,
        status: 'ROUND_ACTIVE',
        startTime: Date.now(),
        timeRemaining: state.config.roundDuration,
      };

    case 'SET_PROMPT':
      if (!action.prompt) return state;
      if (state.usedPromptIds.includes(action.prompt.id)) {
        return { ...state, currentPrompt: action.prompt };
      }
      return {
        ...state,
        currentPrompt: action.prompt,
        usedPromptIds: [...state.usedPromptIds, action.prompt.id],
      };

    case 'ANSWER_CORRECT': {
      const teams = [...state.config.teams];
      teams[state.currentTeamIndex] = applyCorrectScore(teams[state.currentTeamIndex]);
      return {
        ...state,
        config: { ...state.config, teams },
        roundCorrect: state.roundCorrect + 1,
        ...advancePrompt(state, action.allPrompts, playedIds(state)),
      };
    }

    case 'ANSWER_SKIP': {
      const teams = [...state.config.teams];
      teams[state.currentTeamIndex] = applySkipScore(teams[state.currentTeamIndex]);
      return {
        ...state,
        config: { ...state.config, teams },
        roundSkipped: state.roundSkipped + 1,
        ...advancePrompt(state, action.allPrompts, playedIds(state)),
      };
    }

    case 'TIME_UP': {
      const team = state.config.teams[state.currentTeamIndex];
      // Defensive: a deep link or a stale saved state can arrive without teams.
      if (!team) {
        return { ...state, status: 'FINAL_RESULTS', currentPrompt: null };
      }
      return {
        ...state,
        status: 'ROUND_RESULTS',
        roundScores: [
          ...state.roundScores,
          {
            teamId: team.id,
            roundNumber: state.currentRound,
            correct: state.roundCorrect,
            skipped: state.roundSkipped,
            streak: team.streak,
          },
        ],
        currentPrompt: null,
      };
    }

    case 'NEXT_ROUND': {
      const nextTeamIndex = getNextTeamIndex(state);
      // Same round, next team's turn.
      if (nextTeamIndex !== null) {
        return {
          ...state,
          status: 'PHONE_PASS',
          currentTeamIndex: nextTeamIndex,
          roundCorrect: 0,
          roundSkipped: 0,
          usedPromptIds: [],
        };
      }
      // Every team has played this round.
      if (isLastRound(state)) {
        return { ...state, status: 'FINAL_RESULTS', currentTeamIndex: 0 };
      }
      return {
        ...state,
        status: 'PHONE_PASS',
        currentRound: state.currentRound + 1,
        currentTeamIndex: 0,
        roundCorrect: 0,
        roundSkipped: 0,
        usedPromptIds: [],
      };
    }

    case 'END_GAME': {
      const team = state.config.teams[state.currentTeamIndex];
      const roundScores = team
        ? [
            ...state.roundScores,
            {
              teamId: team.id,
              roundNumber: state.currentRound,
              correct: state.roundCorrect,
              skipped: state.roundSkipped,
              streak: team.streak,
            },
          ]
        : state.roundScores;
      return {
        ...state,
        status: 'FINAL_RESULTS',
        roundScores,
        currentPrompt: null,
        currentTeamIndex: 0,
      };
    }

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}
