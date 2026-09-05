import { GameState, GameStatus } from './types';

type Transition = {
  from: GameStatus;
  to: GameStatus;
  action: string;
};

const TRANSITIONS: Transition[] = [
  { from: 'HOME', to: 'SETUP_PLAYERS', action: 'NEW_GAME' },
  { from: 'SETUP_PLAYERS', to: 'SETUP_TEAMS', action: 'CONFIRM_PLAYERS' },
  { from: 'SETUP_TEAMS', to: 'SETUP_CATEGORIES', action: 'CONFIRM_TEAMS' },
  {
    from: 'SETUP_CATEGORIES',
    to: 'SETUP_SETTINGS',
    action: 'CONFIRM_CATEGORIES',
  },
  {
    from: 'SETUP_SETTINGS',
    to: 'ROUND_READY',
    action: 'CONFIRM_SETTINGS',
  },
  { from: 'ROUND_READY', to: 'PHONE_PASS', action: 'START_ROUND' },
  { from: 'PHONE_PASS', to: 'COUNTDOWN', action: 'PLAYER_READY' },
  { from: 'COUNTDOWN', to: 'ROUND_ACTIVE', action: 'COUNTDOWN_COMPLETE' },
  { from: 'ROUND_ACTIVE', to: 'ROUND_ACTIVE', action: 'NEXT_PROMPT' },
  { from: 'ROUND_ACTIVE', to: 'ROUND_RESULTS', action: 'TIME_UP' },
  { from: 'ROUND_RESULTS', to: 'PHONE_PASS', action: 'NEXT_TEAM' },
  { from: 'ROUND_RESULTS', to: 'FINAL_RESULTS', action: 'GAME_OVER' },
  { from: 'FINAL_RESULTS', to: 'HOME', action: 'PLAY_AGAIN' },
];

export function canTransition(
  currentStatus: GameStatus,
  action: string
): boolean {
  return TRANSITIONS.some(
    (t) => t.from === currentStatus && t.action === action
  );
}

export function getNextStatus(
  currentStatus: GameStatus,
  action: string
): GameStatus | null {
  const transition = TRANSITIONS.find(
    (t) => t.from === currentStatus && t.action === action
  );
  return transition ? transition.to : null;
}

export function isGameActive(status: GameStatus): boolean {
  return (
    status === 'ROUND_ACTIVE' ||
    status === 'PHONE_PASS' ||
    status === 'COUNTDOWN' ||
    status === 'ROUND_READY'
  );
}

export function isGameComplete(status: GameStatus): boolean {
  return status === 'FINAL_RESULTS';
}

export function shouldAdvanceTeam(status: GameStatus, action: string): boolean {
  return status === 'ROUND_ACTIVE' && action === 'TIME_UP';
}

export function shouldEndGame(
  state: GameState,
  action: string
): boolean {
  if (state.status !== 'ROUND_RESULTS' || action !== 'NEXT_TEAM') return false;
  return state.currentRound >= state.config.totalRounds;
}
