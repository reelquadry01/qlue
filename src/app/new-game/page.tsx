'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { Player, Team } from '@/engine/types';
import { v4 as uuid } from 'uuid';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import PageShell from '@/components/ui/PageShell';

const TEAM_NAMES = ['Team A', 'Team B', 'Team C', 'Team D'];
const TEAM_COLORS = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger'];

const emptyTeams = (): Team[] => [
  { id: uuid(), name: 'Team A', players: [], score: 0, streak: 0, bestStreak: 0 },
  { id: uuid(), name: 'Team B', players: [], score: 0, streak: 0, bestStreak: 0 },
];

export default function NewGamePage() {
  const { dispatch } = useGame();
  const router = useRouter();

  const [step, setStep] = useState<'players' | 'teams'>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>(emptyTeams);
  const [autoAssign, setAutoAssign] = useState(true);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const addPlayer = () => {
    const name = newName.trim();
    if (!name) return;
    if (players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
      setNameError(`${name} is already in the game.`);
      return;
    }
    if (name.length > 24) {
      setNameError('Keep names under 24 characters.');
      return;
    }
    setNameError(null);
    const player = { id: uuid(), name };
    setPlayers([...players, player]);
    setNewName('');
    setJustAdded(player.id);
    setTimeout(() => setJustAdded(null), 500);
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((player) => player.id !== id));
  };

  const handleAddTeam = () => {
    if (teams.length >= 4) return;
    setTeams([
      ...teams,
      {
        id: uuid(),
        name: TEAM_NAMES[teams.length],
        players: [],
        score: 0,
        streak: 0,
        bestStreak: 0,
      },
    ]);
  };

  const handleRemoveTeam = (id: string) => {
    if (teams.length <= 2) return;
    setTeams(teams.filter((team) => team.id !== id));
  };

  const autoAssignPlayers = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const assigned = teams.map((team) => ({ ...team, players: [] as Player[] }));
    shuffled.forEach((player, index) => {
      assigned[index % assigned.length].players.push(player);
    });
    setTeams(assigned);
  };

  const movePlayer = (playerId: string, fromTeamId: string, toTeamId: string) => {
    setTeams((prev) => {
      const updated = prev.map((team) => ({ ...team, players: [...team.players] }));
      const from = updated.find((team) => team.id === fromTeamId);
      const to = updated.find((team) => team.id === toTeamId);
      if (!from || !to) return prev;
      const index = from.players.findIndex((player) => player.id === playerId);
      if (index === -1) return prev;
      const [player] = from.players.splice(index, 1);
      to.players.push(player);
      return updated;
    });
  };

  const unassignedPlayers = players.filter(
    (player) => !teams.some((team) => team.players.some((member) => member.id === player.id))
  );

  const handleConfirmPlayers = () => {
    if (players.length < 2) return;
    if (autoAssign) autoAssignPlayers();
    setStep('teams');
  };

  const handleConfirmTeams = () => {
    const validTeams = teams.filter((team) => team.players.length > 0);
    if (validTeams.length < 2) return;
    dispatch({ type: 'SET_TEAMS', teams: validTeams });
    router.push('/new-game/categories');
  };

  if (step === 'players') {
    return (
      <PageShell
        title="Add Players"
        subtitle="Add at least 2 players to start"
        backHref="/"
        footer={
          <div className="flex flex-col gap-4">
            <label
              htmlFor="auto-assign"
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <input
                id="auto-assign"
                type="checkbox"
                checked={autoAssign}
                onChange={(e) => setAutoAssign(e.target.checked)}
                className="w-5 h-5 rounded bg-surface border-white/10 text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground-muted">Auto-assign to teams</span>
            </label>
            <Button
              fullWidth
              size="lg"
              disabled={players.length < 2}
              onClick={handleConfirmPlayers}
            >
              Continue ({players.length} player{players.length === 1 ? '' : 's'})
            </Button>
          </div>
        }
      >
        <div className="flex gap-2 mb-2">
          <Input
            id="player-name"
            placeholder="Type a name..."
            aria-label="Player name"
            autoComplete="off"
            maxLength={24}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
          />
          <Button onClick={addPlayer} disabled={!newName.trim()} className="shrink-0">
            Add
          </Button>
        </div>

        <div aria-live="polite">
          {nameError && <p className="text-caption text-warning mb-3">{nameError}</p>}
        </div>

        <ul className="flex flex-col gap-2 mb-6 flex-1" aria-label="Players">
          {players.map((player) => (
            <li key={player.id}>
              <Card
                className={`flex items-center justify-between ${justAdded === player.id ? 'animate-correct-pulse' : ''}`}
              >
                <span className="font-semibold text-body">{player.name}</span>
                <button
                  type="button"
                  onClick={() => removePlayer(player.id)}
                  aria-label={`Remove ${player.name}`}
                  className="text-foreground-faint hover:text-danger text-caption transition-colors px-2 py-1"
                >
                  Remove
                </button>
              </Card>
            </li>
          ))}
        </ul>

        {players.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div aria-hidden="true" className="text-5xl mb-3 opacity-20">
              👥
            </div>
            <p className="text-foreground-faint text-sm">No players yet</p>
          </div>
        )}
      </PageShell>
    );
  }

  if (step === 'teams') {
    const teamsReady = teams.filter((team) => team.players.length > 0).length >= 2;

    return (
      <PageShell
        title="Set Up Teams"
        subtitle="Tap to move players between teams"
        backHref="/"
        footer={
          <Button fullWidth size="lg" disabled={!teamsReady} onClick={handleConfirmTeams}>
            Continue
          </Button>
        }
      >
        <SetupTeamsView
          teams={teams}
          unassignedCount={unassignedPlayers.length}
          canAddTeam={teams.length < 4}
          onAddTeam={handleAddTeam}
          onRemoveTeam={handleRemoveTeam}
          onMovePlayer={movePlayer}
        />
      </PageShell>
    );
  }

  return null;
}

const BALANCE_COPY: Record<TeamBalance, string> = {
  even: 'Teams look even — everyone has the same number of players.',
  fair: 'Teams are nearly even — sizes differ by more than one.',
  uneven: 'Some teams are empty. Give every team at least one player.',
};

function SetupTeamsView({
  teams,
  unassignedCount,
  canAddTeam,
  onAddTeam,
  onRemoveTeam,
  onMovePlayer,
}: {
  teams: Team[];
  unassignedCount: number;
  canAddTeam: boolean;
  onAddTeam: () => void;
  onRemoveTeam: (id: string) => void;
  onMovePlayer: (playerId: string, fromTeamId: string, toTeamId: string) => void;
}) {
  const balance = describeBalance(teams);

  return (
    <div className="flex-1 flex flex-col">
      {unassignedCount > 0 && (
        <p role="status" className="text-caption text-warning mb-4">
          {unassignedCount} player{unassignedCount === 1 ? '' : 's'} still need
          a team.
        </p>
      )}

      <ul className="flex flex-col gap-3 mb-5">
        {teams.map((team, index) => (
          <li key={team.id}>
            <Card padding="md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className={`w-1.5 h-8 rounded-full ${TEAM_COLORS[index % TEAM_COLORS.length]}`}
                  />
                  <h3 className="font-bold text-body">
                    {team.name}
                    <span className="sr-only-live">
                      , {team.players.length} player{team.players.length === 1 ? '' : 's'}
                    </span>
                  </h3>
                </div>
                {teams.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onRemoveTeam(team.id)}
                    className="text-foreground-faint hover:text-danger text-caption transition-colors px-2 py-1"
                  >
                    Remove
                  </button>
                )}
              </div>
              <ul className="flex flex-wrap gap-2" aria-label={`${team.name} players`}>
                {team.players.map((player) => (
                  <li key={player.id} className="flex items-center gap-1">
                    <span className="px-3 py-1.5 rounded-lg bg-surface text-sm font-medium">
                      {player.name}
                    </span>
                    {teams.map((other) =>
                      other.id !== team.id ? (
                        <button
                          key={other.id}
                          type="button"
                          onClick={() => onMovePlayer(player.id, team.id, other.id)}
                          aria-label={`Move ${player.name} to ${other.name}`}
                          className="w-6 h-6 rounded-lg bg-white/5 hover:bg-primary/20 text-foreground-faint hover:text-primary text-xs font-bold transition-all flex items-center justify-center"
                        >
                          →
                        </button>
                      ) : null
                    )}
                  </li>
                ))}
                {team.players.length === 0 && (
                  <li>
                    <p className="text-foreground-faint text-xs py-2">
                      No players yet
                    </p>
                  </li>
                )}
              </ul>
            </Card>
          </li>
        ))}
      </ul>

      <p className="text-caption text-foreground-muted mb-4">{BALANCE_COPY[balance]}</p>

      <Button variant="ghost" fullWidth onClick={onAddTeam} disabled={!canAddTeam}>
        + Add Team
      </Button>
    </div>
  );
}

type TeamBalance = 'even' | 'fair' | 'uneven';

function describeBalance(teams: Team[]): TeamBalance {
  const sizes = teams.map((team) => team.players.length);
  if (sizes.some((size) => size === 0)) return 'uneven';
  return Math.max(...sizes) - Math.min(...sizes) <= 1 ? 'even' : 'fair';
}

  // ANCHOR_NEW_GAME_TEAMS_BODY