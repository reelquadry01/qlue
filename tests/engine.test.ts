import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CategorySelection,
  Difficulty,
  GameState,
  INITIAL_GAME_STATE,
  Team,
} from '../src/engine/types';
import { gameReducer } from '../src/engine/reducer';
import {
  isPersistableStatus,
  parseGameState,
  serializeGameState,
} from '../src/engine/persistence';
import { getResumeHref, isPlayableStatus, isResultStatus } from '../src/lib/routes';
import {
  DEFAULT_PREFERENCES,
  parsePreferences,
} from '../src/lib/preferences';

const PROMPTS = [
  { id: 'p1', text: '', answer: 'One', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'p2', text: '', answer: 'Two', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'p3', text: '', answer: 'Three', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
  { id: 'p4', text: '', answer: 'Four', categoryId: 'general-knowledge', difficulty: 'easy', gameMode: 'classic' },
] as const;

const CATEGORIES: CategorySelection[] = [{ categoryId: 'general-knowledge', weight: 50 }];

function makeTeam(name: string): Team {
  return {
    id: `team-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    players: [{ id: `player-${name.toLowerCase()}`, name }],
    score: 0,
    streak: 0,
    bestStreak: 0,
  };
}

/** Run a full game without a browser: every team takes every turn. */
function playFullGame(teamCount: 2 | 3 | 4, totalRounds: 2 | 3, correctPerTurn = 1) {
  const teams = Array.from({ length: teamCount }, (_, i) =>
    makeTeam(['Red', 'Blue', 'Green', 'Gold'][i])
  );
  let state: GameState = INITIAL_GAME_STATE;

  const seen: string[] = [];
  const record = () => seen.push(`${state.status}|r${state.currentRound}|t${state.currentTeamIndex}`);

  state = gameReducer(state, { type: 'NEW_GAME' });
  state = gameReducer(state, { type: 'SET_TEAMS', teams });
  assert.equal(state.config.teams.length, teamCount);
  state = gameReducer(state, { type: 'SET_CATEGORIES', categories: CATEGORIES });
  const difficulty: Difficulty = 'easy';
  state = gameReducer(state, {
    type: 'SET_SETTINGS',
    roundDuration: 60,
    totalRounds,
    difficulty,
  });
  record();

  let guard = 0;
  while (state.status !== 'FINAL_RESULTS' && guard++ < 200) {
    state = gameReducer(state, { type: 'START_ROUND' });
    state = gameReducer(state, { type: 'COUNTDOWN_COMPLETE' });
    record();
    for (let i = 0; i < correctPerTurn; i++) {
      state = gameReducer(state, { type: 'ANSWER_CORRECT', allPrompts: [...PROMPTS] });
    }
    state = gameReducer(state, { type: 'TIME_UP' });
    if (state.status === 'FINAL_RESULTS') break;
    // A round result always routes back to a phone-pass turn or the final screen.
    assert.equal(state.status, 'ROUND_RESULTS');
    state = gameReducer(state, { type: 'NEXT_ROUND' });
  }

  assert.equal(state.status, 'FINAL_RESULTS');
  assert.ok(guard < 200, 'game must finish without looping');
  return { state, seen };
}

describe('round and team rotation', () => {
  it('rotates every team through every round, then ends the game', () => {
    const { state, seen } = playFullGame(2, 2);

    // Each of the 2 teams plays 2 rounds: 4 ROUND_ACTIVE turns at the
    // right (round, team) positions — the bug that skipped Team B made
    // this impossible.
    assert.deepEqual(
      seen.filter((entry) => entry.startsWith('ROUND_ACTIVE')),
      ['ROUND_ACTIVE|r1|t0', 'ROUND_ACTIVE|r1|t1', 'ROUND_ACTIVE|r2|t0', 'ROUND_ACTIVE|r2|t1']
    );
    assert.equal(state.roundScores.length, 4);
    assert.deepEqual(
      state.roundScores.map((score) => `${score.roundNumber}:${score.correct}`),
      ['1:1', '1:1', '2:1', '2:1']
    );
  });

  it('advances 3 teams and 3 rounds without skipping anyone', () => {
    const { state, seen } = playFullGame(3, 3, 2);

    assert.equal(state.roundScores.length, 9);
    const perRound = [1, 2, 3].map(
      (round) => state.roundScores.filter((score) => score.roundNumber === round).length
    );
    assert.deepEqual(perRound, [3, 3, 3]);

    const teamNames = new Set(state.roundScores.map((score) => score.teamId));
    assert.equal(teamNames.size, 3);
    assert.deepEqual(
      seen.filter((entry) => entry.startsWith('ROUND_ACTIVE')).length,
      9
    );
  });

  it('scores each turn into the right team total', () => {
    const { state } = playFullGame(2, 2, 2);
    for (const team of state.config.teams) {
      assert.equal(team.score, 4);
    }
  });
});

describe('game setup resets', () => {
  it('SET_SETTINGS starts round 1 with zeroed scores', () => {
    const dirty: GameState = {
      ...INITIAL_GAME_STATE,
      config: {
        ...INITIAL_GAME_STATE.config,
        teams: [{ ...makeTeam('Red'), score: 99, streak: 4, bestStreak: 9 }],
        roundDuration: 30,
        totalRounds: 10,
      },
      currentRound: 4,
      currentTeamIndex: 1,
      roundScores: [
        { teamId: 'team-red', roundNumber: 1, correct: 5, skipped: 0, streak: 2 },
      ],
    };

    const next = gameReducer(dirty, {
      type: 'SET_SETTINGS',
      roundDuration: 60,
      totalRounds: 5,
      difficulty: 'mixed',
    });

    assert.equal(next.status, 'ROUND_READY');
    assert.equal(next.currentRound, 1);
    assert.equal(next.currentTeamIndex, 0);
    assert.equal(next.config.teams[0].score, 0);
    assert.equal(next.roundScores.length, 0);
    assert.equal(next.currentPrompt, null);
  });
});

describe('guarded transitions', () => {
  it('START_ROUND never changes rounds or teams', () => {
    let state: GameState = {
      ...INITIAL_GAME_STATE,
      status: 'PHONE_PASS',
      currentRound: 2,
      currentTeamIndex: 1,
      config: { ...INITIAL_GAME_STATE.config, teams: [makeTeam('Red'), makeTeam('Blue')] },
    };
    state = gameReducer(state, { type: 'START_ROUND' });
    assert.equal(state.currentRound, 2);
    assert.equal(state.currentTeamIndex, 1);
  });

  it('TIME_UP with no teams cannot throw', () => {
    const next = gameReducer(INITIAL_GAME_STATE, { type: 'TIME_UP' });
    assert.equal(next.status, 'FINAL_RESULTS');
  });
});

describe('state persistence', () => {
  it('round-trips a resumable game', () => {
    const dirty: GameState = {
      ...INITIAL_GAME_STATE,
      status: 'PHONE_PASS',
      currentRound: 2,
      currentTeamIndex: 1,
      config: { ...INITIAL_GAME_STATE.config, teams: [makeTeam('Red'), makeTeam('Blue')] },
    };
    const restored = parseGameState(serializeGameState(dirty));
    assert.ok(restored);
    assert.equal(restored.status, 'PHONE_PASS');
    assert.equal(restored.currentTeamIndex, 1);
  });

  it('rejects finished games, setup-only states and corrupt payloads', () => {
    assert.equal(parseGameState(null), null);
    assert.equal(parseGameState('not json'), null);
    assert.equal(
      parseGameState(JSON.stringify({ ...INITIAL_GAME_STATE, status: 'HOME' })),
      null
    );
    assert.equal(
      parseGameState(
        JSON.stringify({ ...INITIAL_GAME_STATE, status: 'FINAL_RESULTS' })
      ),
      null
    );
    assert.equal(
      parseGameState(
        JSON.stringify({ ...INITIAL_GAME_STATE, status: 'SETUP_PLAYERS' })
      ),
      null
    );
    assert.equal(
      parseGameState(JSON.stringify({ status: 'PHONE_PASS' })),
      null
    );
    assert.ok(!isPersistableStatus('HOME'));
    assert.ok(
      !isPersistableStatus(
        (JSON.parse(serializeGameState(INITIAL_GAME_STATE)) as GameState).status
      )
    );
  });

  it('clamps out-of-range team indexes instead of rejecting history', () => {
    const parsed = parseGameState(
      JSON.stringify({
        ...INITIAL_GAME_STATE,
        status: 'ROUND_ACTIVE',
        currentTeamIndex: 7,
        config: {
          ...INITIAL_GAME_STATE.config,
          teams: [makeTeam('Red'), makeTeam('Blue')],
        },
      })
    );
    assert.ok(parsed);
    assert.equal(parsed.currentTeamIndex, 1);
  });
});

describe('resume routing', () => {
  it('sends each resumable status to the right screen', () => {
    assert.equal(getResumeHref('SETUP_CATEGORIES'), '/new-game/categories');
    assert.equal(getResumeHref('SETUP_SETTINGS'), '/new-game/settings');
    assert.equal(getResumeHref('PHONE_PASS'), '/play');
    assert.equal(getResumeHref('ROUND_ACTIVE'), '/play');
    assert.equal(getResumeHref('ROUND_RESULTS'), '/play/results');
    assert.equal(getResumeHref('HOME'), null);
    assert.equal(getResumeHref('FINAL_RESULTS'), null);
  });

  it('guards the play and results screens', () => {
    assert.ok(isPlayableStatus('PHONE_PASS'));
    assert.ok(isPlayableStatus('ROUND_ACTIVE'));
    assert.ok(!isPlayableStatus('HOME'));
    assert.ok(!isPlayableStatus('SETUP_PLAYERS'));
    assert.ok(isResultStatus('ROUND_RESULTS'));
    assert.ok(isResultStatus('FINAL_RESULTS'));
    assert.ok(!isResultStatus('ROUND_ACTIVE'));
  });
});

describe('sound preference', () => {
  it('defaults to on and ignores invalid payloads', () => {
    assert.deepEqual(parsePreferences(null), DEFAULT_PREFERENCES);
    assert.deepEqual(parsePreferences('nope'), DEFAULT_PREFERENCES);
    assert.deepEqual(parsePreferences('{"soundEnabled":false}'), {
      soundEnabled: false,
    });
    assert.deepEqual(parsePreferences('{"soundEnabled":"yes"}'), DEFAULT_PREFERENCES);
  });
});