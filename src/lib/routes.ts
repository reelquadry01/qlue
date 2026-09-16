import { GameStatus } from '../engine/types';

/**
 * Route that represents "where the player was" for a given game status, or
 * `null` when the status has nothing to resume (a fresh home screen, a finished
 * game, or a setup step whose data is not part of the game state).
 */
export function getResumeHref(status: GameStatus): string | null {
  switch (status) {
    case 'SETUP_CATEGORIES':
      return '/new-game/categories';
    case 'SETUP_SETTINGS':
      return '/new-game/settings';
    case 'ROUND_READY':
    case 'PHONE_PASS':
    case 'COUNTDOWN':
    case 'ROUND_ACTIVE':
      return '/play';
    case 'ROUND_RESULTS':
      return '/play/results';
    default:
      return null;
  }
}

/** Statuses where the play screen is the correct place to be. */
const PLAYABLE_STATUSES: GameStatus[] = [
  'ROUND_READY',
  'PHONE_PASS',
  'COUNTDOWN',
  'ROUND_ACTIVE',
  'ROUND_RESULTS',
];

/** Statuses where the results screen is the correct place to be. */
const RESULT_STATUSES: GameStatus[] = ['ROUND_RESULTS', 'FINAL_RESULTS'];

export function isPlayableStatus(status: GameStatus): boolean {
  return PLAYABLE_STATUSES.includes(status);
}

export function isResultStatus(status: GameStatus): boolean {
  return RESULT_STATUSES.includes(status);
}
