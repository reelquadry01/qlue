'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from 'react';
import { GameState, INITIAL_GAME_STATE, Team } from '@/engine/types';
import { GameAction, gameReducer } from '@/engine/reducer';
import {
  GAME_STORAGE_KEY,
  isPersistableStatus,
  parseGameState,
  serializeGameState,
} from '@/engine/persistence';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  getCurrentTeam: () => Team | undefined;
  getTeamById: (id: string) => Team | undefined;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);

  // Restore an in-progress game (reload, accidental back, browser restart).
  useEffect(() => {
    const saved = parseGameState(safeReadStorage());
    if (saved) dispatch({ type: 'LOAD_STATE', state: saved });
  }, []);

  // Only a game in progress is worth restoring, so finished games and the
  // setup screens clear the stored state instead of leaving stale data behind.
  useEffect(() => {
    if (isPersistableStatus(state.status)) {
      safeWriteStorage(serializeGameState(state));
    } else {
      safeRemoveStorage();
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

// Storage can throw (private windows, disabled storage, quota); the game must
// keep working when it does.
function safeReadStorage(): string | null {
  try {
    return window.localStorage.getItem(GAME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeWriteStorage(value: string) {
  try {
    window.localStorage.setItem(GAME_STORAGE_KEY, value);
  } catch {
    // Ignore: the game continues without persistence.
  }
}

function safeRemoveStorage() {
  try {
    window.localStorage.removeItem(GAME_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
