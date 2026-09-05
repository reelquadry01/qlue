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
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const addPlayer = () => {
    const name = newName.trim();
    if (!name || players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    const player = { id: uuid(), name };
    setPlayers([...players, player]);
    setNewName('');
    setJustAdded(player.id);
    setTimeout(() => setJustAdded(null), 500);
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const handleAddTeam = () => {
    if (teams.length >= 4) return;
    setTeams([...teams, { id: uuid(), name: TEAM_NAMES[teams.length], players: [], score: 0, streak: 0, bestStreak: 0 }]);
  };

  const handleRemoveTeam = (id: string) => {
    if (teams.length <= 2) return;
    setTeams(teams.filter((t) => t.id !== id));
  };

  const autoAssignPlayers = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const newTeams = teams.map((t) => ({ ...t, players: [] as Player[] }));
    shuffled.forEach((player, i) => { newTeams[i % newTeams.length].players.push(player); });
    setTeams(newTeams);
  };

  const movePlayer = (playerId: string, fromTeamId: string, toTeamId: string) => {
    setTeams((prev) => {
      const updated = prev.map((t) => ({ ...t, players: [...t.players] }));
      const from = updated.find((t) => t.id === fromTeamId);
      const to = updated.find((t) => t.id === toTeamId);
      if (!from || !to) return prev;
      const idx = from.players.findIndex((p) => p.id === playerId);
      if (idx === -1) return prev;
      const [player] = from.players.splice(idx, 1);
      to.players.push(player);
      return updated;
    });
  };

  const unassignedPlayers = players.filter((p) => !teams.some((t) => t.players.some((tp) => tp.id === p.id)));

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
      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full safe-area-top safe-area-bottom">
        <BackButton href="/" />
        <div className="mt-6 mb-8">
          <h1 className="text-title mb-1">Add Players</h1>
          <p className="text-body text-foreground-muted">Add at least 2 players to start</p>
        </div>

        <div className="flex gap-2 mb-5">
          <Input placeholder="Type a name..." value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addPlayer()} />
          <Button onClick={addPlayer} disabled={!newName.trim()} className="shrink-0">Add</Button>
        </div>

        <div className="flex flex-col gap-2 mb-6 flex-1">
          {players.map((player) => (
            <Card key={player.id} className={`flex items-center justify-between ${justAdded === player.id ? 'animate-correct-pulse' : ''}`}>
              <span className="font-semibold text-body">{player.name}</span>
              <button onClick={() => removePlayer(player.id)} className="text-foreground-faint hover:text-danger text-caption transition-colors">Remove</button>
            </Card>
          ))}
          {players.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <div className="text-5xl mb-3 opacity-20">👥</div>
              <p className="text-foreground-faint text-sm">No players yet</p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4">
          <label className="flex items-center gap-3 mb-4 cursor-pointer select-none">
            <input type="checkbox" checked={autoAssign} onChange={(e) => setAutoAssign(e.target.checked)} className="w-5 h-5 rounded bg-surface border-white/10 text-primary focus:ring-primary" />
            <span className="text-sm text-foreground-muted">Auto-assign to teams</span>
          </label>
          <Button fullWidth size="lg" disabled={players.length < 2} onClick={handleConfirmPlayers}>
            Continue ({players.length} players)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full safe-area-top safe-area-bottom">
      <BackButton />
      <div className="mt-6 mb-8">
        <h1 className="text-title mb-1">Set Up Teams</h1>
        <p className="text-body text-foreground-muted">Tap to move players between teams</p>
      </div>

      {unassignedPlayers.length > 0 && (
        <div className="mb-5">
          <h3 className="text-label text-foreground-faint mb-2">Unassigned</h3>
          <div className="flex flex-wrap gap-2">
            {unassignedPlayers.map((p) => (
              <span key={p.id} className="px-3 py-1.5 rounded-lg bg-surface text-sm font-medium">{p.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 mb-5">
        {teams.map((team, i) => (
          <Card key={team.id} padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-8 rounded-full bg-${['primary', 'success', 'warning', 'danger'][i]}`} />
                <h3 className="font-bold text-body">{team.name}</h3>
              </div>
              {teams.length > 2 && (
                <button onClick={() => handleRemoveTeam(team.id)} className="text-foreground-faint hover:text-danger text-caption transition-colors">Remove</button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {team.players.map((player) => (
                <div key={player.id} className="flex items-center gap-1">
                  <span className="px-3 py-1.5 rounded-lg bg-surface text-sm font-medium">{player.name}</span>
                  {teams.map((other) => other.id !== team.id ? (
                    <button key={other.id} onClick={() => movePlayer(player.id, team.id, other.id)}
                      className="w-6 h-6 rounded-lg bg-white/5 hover:bg-primary/20 text-foreground-faint hover:text-primary text-xs font-bold transition-all flex items-center justify-center">→</button>
                  ) : null)}
                </div>
              ))}
              {team.players.length === 0 && <p className="text-foreground-faint text-xs py-2">No players yet</p>}
            </div>
          </Card>
        ))}
      </div>

      <Button variant="ghost" fullWidth onClick={handleAddTeam} disabled={teams.length >= 4}>+ Add Team</Button>

      <div className="mt-auto pt-6">
        <Button fullWidth size="lg" disabled={teams.filter((t) => t.players.length > 0).length < 2} onClick={handleConfirmTeams}>Continue</Button>
      </div>
    </div>
  );
}
