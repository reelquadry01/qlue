'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, INITIAL_GAME_STATE, Team, Player, CategorySelection, Prompt } from '@/engine/types';
import { getNextStatus, shouldEndGame } from '@/engine/state-machine';
import { applyCorrectScore, applySkipScore } from '@/engine/scoring';
import { getNextPrompt } from '@/engine/prompts';

type GameAction =
  | { type: 'NEW_GAME' }
  | { type: 'SET_PLAYERS'; players: Player[] }
  | { type: 'SET_TEAMS'; teams: Team[] }
  | { type: 'SET_CATEGORIES'; categories: CategorySelection[] }
  | { type: 'SET_SETTINGS'; roundDuration: number; totalRounds: number; difficulty: GameState['config']['difficulty'] }
  | { type: 'NAVIGATE'; status: GameState['status'] }
  | { type: 'START_ROUND' }
  | { type: 'PLAYER_READY' }
  | { type: 'COUNTDOWN_COMPLETE' }
  | { type: 'SET_PROMPT'; prompt: Prompt | null }
  | { type: 'ANSWER_CORRECT'; allPrompts: Prompt[] }
  | { type: 'ANSWER_SKIP'; allPrompts: Prompt[] }
  | { type: 'TIME_UP' }
  | { type: 'NEXT_TEAM' }
  | { type: 'NEXT_ROUND' }
  | { type: 'LOAD_STATE'; state: GameState };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return { ...INITIAL_GAME_STATE, status: 'SETUP_PLAYERS' };

    case 'SET_PLAYERS':
      return { ...state, status: 'SETUP_TEAMS' };

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

    case 'SET_SETTINGS':
      return {
        ...state,
        config: {
          ...state.config,
          roundDuration: action.roundDuration,
          totalRounds: action.totalRounds,
          difficulty: action.difficulty,
        },
        status: 'ROUND_READY',
      };

    case 'NAVIGATE': {
      const next = getNextStatus(state.status, action.status);
      return next ? { ...state, status: next } : state;
    }

    case 'START_ROUND':
      return {
        ...state,
        status: 'PHONE_PASS',
        currentRound: state.currentRound + 1,
        currentTeamIndex: 0,
        roundCorrect: 0,
        roundSkipped: 0,
      };

    case 'PLAYER_READY':
      return { ...state, status: 'COUNTDOWN' };

    case 'COUNTDOWN_COMPLETE':
      return {
        ...state,
        status: 'ROUND_ACTIVE',
        startTime: Date.now(),
        timeRemaining: state.config.roundDuration,
      };

    case 'SET_PROMPT':
      if (!action.prompt) return state;
      return {
        ...state,
        currentPrompt: action.prompt,
        usedPromptIds: [...state.usedPromptIds, action.prompt.id],
      };

    case 'ANSWER_CORRECT': {
      const teamIndex = state.currentTeamIndex;
      const teams = [...state.config.teams];
      teams[teamIndex] = applyCorrectScore(teams[teamIndex]);

      // Select next prompt atomically — no race condition
      const usedIds = [...state.usedPromptIds, state.currentPrompt?.id].filter(Boolean) as string[];
      const nextPrompt = getNextPrompt(
        action.allPrompts,
        state.config.categories,
        state.config.difficulty,
        usedIds
      );

      return {
        ...state,
        config: { ...state.config, teams },
        roundCorrect: state.roundCorrect + 1,
        currentPrompt: nextPrompt,
        usedPromptIds: nextPrompt ? [...usedIds, nextPrompt.id] : usedIds,
      };
    }

    case 'ANSWER_SKIP': {
      const teamIndex = state.currentTeamIndex;
      const teams = [...state.config.teams];
      teams[teamIndex] = applySkipScore(teams[teamIndex]);

      // Select next prompt atomically — no race condition
      const usedIds = [...state.usedPromptIds, state.currentPrompt?.id].filter(Boolean) as string[];
      const nextPrompt = getNextPrompt(
        action.allPrompts,
        state.config.categories,
        state.config.difficulty,
        usedIds
      );

      return {
        ...state,
        config: { ...state.config, teams },
        roundSkipped: state.roundSkipped + 1,
        currentPrompt: nextPrompt,
        usedPromptIds: nextPrompt ? [...usedIds, nextPrompt.id] : usedIds,
      };
    }

    case 'TIME_UP': {
      const teamIndex = state.currentTeamIndex;
      const roundScore = {
        teamId: state.config.teams[teamIndex].id,
        roundNumber: state.currentRound,
        correct: state.roundCorrect,
        skipped: state.roundSkipped,
        streak: state.config.teams[teamIndex].streak,
      };
      return {
        ...state,
        status: 'ROUND_RESULTS',
        roundScores: [...state.roundScores, roundScore],
        currentPrompt: null,
      };
    }

    case 'NEXT_TEAM': {
      if (shouldEndGame(state, 'NEXT_TEAM')) {
        return { ...state, status: 'FINAL_RESULTS' };
      }
      const nextTeamIndex = state.currentTeamIndex + 1;
      if (nextTeamIndex >= state.config.teams.length) {
        return {
          ...state,
          status: 'ROUND_RESULTS',
          currentRound: state.currentRound,
          currentTeamIndex: 0,
        };
      }
      return {
        ...state,
        status: 'PHONE_PASS',
        currentTeamIndex: nextTeamIndex,
        roundCorrect: 0,
        roundSkipped: 0,
        usedPromptIds: [],
      };
    }

    case 'NEXT_ROUND': {
      const nextTeamIndex = state.currentTeamIndex + 1;
      if (nextTeamIndex >= state.config.teams.length) {
        if (state.currentRound >= state.config.totalRounds) {
          return { ...state, status: 'FINAL_RESULTS' };
        }
        return {
          ...state,
          status: 'PHONE_PASS',
          currentTeamIndex: 0,
          currentRound: state.currentRound + 1,
          roundCorrect: 0,
          roundSkipped: 0,
          usedPromptIds: [],
        };
      }
      return {
        ...state,
        status: 'PHONE_PASS',
        currentTeamIndex: nextTeamIndex,
        roundCorrect: 0,
        roundSkipped: 0,
        usedPromptIds: [],
      };
    }

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  getCurrentTeam: () => Team | undefined;
  getTeamById: (id: string) => Team | undefined;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('qlue-game-state');
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        if (parsed.status !== 'HOME' && parsed.status !== 'FINAL_RESULTS') {
          dispatch({ type: 'LOAD_STATE', state: parsed });
        }
      }
    } catch {
      localStorage.removeItem('qlue-game-state');
    }
  }, []);

  useEffect(() => {
    if (state.status !== 'HOME' && state.status !== 'FINAL_RESULTS') {
      localStorage.setItem('qlue-game-state', JSON.stringify(state));
    } else {
      localStorage.removeItem('qlue-game-state');
    }
  }, [state]);

  const getCurrentTeam = () => state.config.teams[state.currentTeamIndex];
  const getTeamById = (id: string) => state.config.teams.find((t) => t.id === id);

  return (
    <GameContext.Provider value={{ state, dispatch, getCurrentTeam, getTeamById }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
