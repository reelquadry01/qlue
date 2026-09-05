'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { Player, Team } from '@/engine/types';
import { v4 as uuid } from 'uuid';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import BackButton from '@/components/ui/BackButton';

const TEAM_NAMES = ['Team A', 'Team B', 'Team C', 'Team D'];
const TEAM_COLORS = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger'];

export default function NewGamePage() {
  const { state, dispatch } = useGame();
  const router = useRouter();

  const [step, setStep] = useState<'players' | 'teams'>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState('');
  const [teams, setTeams] = useState<Team[]>([
    { id: uuid(), name: 'Team A', players: [], score: 0, streak: 0, bestStreak: 0 },
    { id: uuid(), name: 'Team B', players: [], score: 0, streak: 0, bestStreak: 0 },
  ]);
  const [autoAssign, setAutoAssign] = useState(true);

  const addPlayer = () => {
    const name = newName.trim();
    if (!name || players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    setPlayers([...players, { id: uuid(), name }]);
    setNewName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const handleAddTeam = () => {
    if (teams.length >= 4) return;
    setTeams([
      ...teams,
      { id: uuid(), name: TEAM_NAMES[teams.length], players: [], score: 0, streak: 0, bestStreak: 0 },
    ]);
  };

  const handleRemoveTeam = (id: string) => {
    if (teams.length <= 2) return;
    setTeams(teams.filter((t) => t.id !== id));
  };

  const autoAssignPlayers = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const newTeams = teams.map((t) => ({ ...t, players: [] as Player[] }));
    shuffled.forEach((player, i) => {
      newTeams[i % newTeams.length].players.push(player);
    });
    setTeams(newTeams);
  };

  const movePlayer = (playerId: string, fromTeamId: string, toTeamId: string) => {
    setTeams((prev) => {
      const updated = prev.map((t) => ({ ...t, players: [...t.players] }));
      const fromTeam = updated.find((t) => t.id === fromTeamId);
      const toTeam = updated.find((t) => t.id === toTeamId);
      if (!fromTeam || !toTeam) return prev;

      const playerIndex = fromTeam.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return prev;

      const [player] = fromTeam.players.splice(playerIndex, 1);
      toTeam.players.push(player);
      return updated;
    });
  };

  const unassignedPlayers = players.filter(
    (p) => !teams.some((t) => t.players.some((tp) => tp.id === p.id))
  );

  const handleConfirmPlayers = () => {
    if (players.length < 2) return;
    if (autoAssign) autoAssignPlayers();
    setStep('teams');
  };

  const handleConfirmTeams = () => {
    const validTeams = teams.filter((t) => t.players.length > 0);
    if (validTeams.length < 2) return;
    dispatch({ type: 'SET_TEAMS', teams: validTeams });
    router.push('/new-game/categories');
  };

  if (step === 'players') {
    return (
      <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
        <BackButton href="/" />
        <div className="mt-4 mb-6">
          <h1 className="text-2xl font-bold mb-1">Add Players</h1>
          <p className="text-foreground-muted text-sm">
            Add at least 2 players to get started
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Type a name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
          />
          <Button onClick={addPlayer} disabled={!newName.trim()}>
            Add
          </Button>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          {players.map((player) => (
            <Card key={player.id} className="flex items-center justify-between">
              <span className="font-medium">{player.name}</span>
              <button
                onClick={() => removePlayer(player.id)}
                className="text-foreground-muted hover:text-danger transition-colors text-sm"
              >
                Remove
              </button>
            </Card>
          ))}
          {players.length === 0 && (
            <p className="text-foreground-muted text-sm text-center py-8">
              No players added yet
            </p>
          )}
        </div>

        <div className="mt-auto">
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={autoAssign}
              onChange={(e) => setAutoAssign(e.target.checked)}
              className="w-5 h-5 rounded bg-white/10 border-card-border text-primary focus:ring-primary"
            />
            <span className="text-sm">Auto-assign to teams</span>
          </label>
          <Button
            fullWidth
            size="lg"
            disabled={players.length < 2}
            onClick={handleConfirmPlayers}
          >
            Continue ({players.length} players)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      <BackButton />
      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold mb-1">Set Up Teams</h1>
        <p className="text-foreground-muted text-sm">
          Drag players between teams or reassign
        </p>
      </div>

      {/* Unassigned players */}
      {unassignedPlayers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-foreground-muted mb-2">Unassigned</h3>
          <div className="flex flex-wrap gap-2">
            {unassignedPlayers.map((player) => (
              <span
                key={player.id}
                className="px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium"
              >
                {player.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Teams */}
      <div className="flex flex-col gap-3 mb-6">
        {teams.map((team, teamIndex) => (
          <Card key={team.id}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${TEAM_COLORS[teamIndex]}`} />
                <h3 className="font-semibold">{team.name}</h3>
              </div>
              {teams.length > 2 && (
                <button
                  onClick={() => handleRemoveTeam(team.id)}
                  className="text-foreground-muted hover:text-danger text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {team.players.map((player) => (
                <div key={player.id} className="flex items-center gap-1">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    {player.name}
                  </span>
                  {/* Move buttons */}
                  {teams.map((otherTeam) =>
                    otherTeam.id !== team.id ? (
                      <button
                        key={otherTeam.id}
                        onClick={() => movePlayer(player.id, team.id, otherTeam.id)}
                        className="text-xs text-foreground-muted hover:text-primary transition-colors"
                        title={`Move to ${otherTeam.name}`}
                      >
                        →{otherTeam.name.slice(-1)}
                      </button>
                    ) : null
                  )}
                </div>
              ))}
              {team.players.length === 0 && (
                <p className="text-foreground-muted text-xs">No players yet</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Button variant="ghost" fullWidth onClick={handleAddTeam} disabled={teams.length >= 4}>
        + Add Team
      </Button>

      <div className="mt-auto pt-6">
        <Button
          fullWidth
          size="lg"
          disabled={teams.filter((t) => t.players.length > 0).length < 2}
          onClick={handleConfirmTeams}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
