import { GameState, GameStatus } from './types';

export const GAME_STORAGE_KEY = 'qlue-game-state';

/**
 * Statuses worth restoring after a reload or an accidental browser close.
 * Purely pre-game setup screens are excluded: the players typed on
 * `/new-game` only live in that screen's local state, so "restoring" them
 * would show an empty setup again.
 */
const PERSISTABLE_STATUSES: GameStatus[] = [
  'SETUP_CATEGORIES',
  'SETUP_SETTINGS',
  'ROUND_READY',
  'PHONE_PASS',
  'COUNTDOWN',
  'ROUND_ACTIVE',
  'ROUND_RESULTS',
];

export function isPersistableStatus(status: unknown): status is GameStatus {
  return (
    typeof status === 'string' &&
    (PERSISTABLE_STATUSES as string[]).includes(status)
  );
}

export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

/**
 * Parses a stored game state, returning `null` for anything that is missing,
 * corrupted or written by an incompatible older version of the app.
 */
export function parseGameState(raw: string | null): GameState | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;

  const candidate = parsed as Partial<GameState>;
  if (!isPersistableStatus(candidate.status)) return null;

  const config = candidate.config;
  if (!config || !Array.isArray(config.teams) || !Array.isArray(config.categories)) {
    return null;
  }
  const teamsAreValid = config.teams.every(
    (team) =>
      team &&
      typeof team.id === 'string' &&
      typeof team.name === 'string' &&
      typeof team.score === 'number'
  );
  if (!teamsAreValid) return null;
  if (
    typeof config.roundDuration !== 'number' ||
    typeof config.totalRounds !== 'number'
  ) {
    return null;
  }
  if (
    typeof candidate.currentRound !== 'number' ||
    typeof candidate.currentTeamIndex !== 'number'
  ) {
    return null;
  }

  const maxTeamIndex = Math.max(0, config.teams.length - 1);
  return {
    ...(candidate as GameState),
    currentRound: Math.max(1, Math.floor(candidate.currentRound)),
    currentTeamIndex: Math.min(
      Math.max(0, Math.floor(candidate.currentTeamIndex)),
      maxTeamIndex
    ),
    roundScores: Array.isArray(candidate.roundScores) ? candidate.roundScores : [],
    usedPromptIds: Array.isArray(candidate.usedPromptIds) ? candidate.usedPromptIds : [],
  };
}