'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { Difficulty } from '@/engine/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import BackButton from '@/components/ui/BackButton';

const DURATIONS = [30, 45, 60, 90];
const ROUNDS = [5, 10, 15, 20];
const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Simple prompts' },
  { value: 'medium', label: 'Medium', desc: 'Balanced challenge' },
  { value: 'hard', label: 'Hard', desc: 'Expert level' },
  { value: 'mixed', label: 'Mixed', desc: 'All difficulties' },
];

export default function SettingsPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();

  const [duration, setDuration] = useState(state.config.roundDuration || 60);
  const [totalRounds, setTotalRounds] = useState(state.config.totalRounds || 5);
  const [difficulty, setDifficulty] = useState<Difficulty>(state.config.difficulty || 'mixed');

  const handleStart = () => {
    dispatch({
      type: 'SET_SETTINGS',
      roundDuration: duration,
      totalRounds,
      difficulty,
    });
    router.push('/play');
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      <BackButton href="/new-game/categories" />
      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold mb-1">Game Settings</h1>
        <p className="text-foreground-muted text-sm">
          Customize your game
        </p>
      </div>

      {/* Round Duration */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-foreground-muted mb-3">
          Round Duration
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`py-3 rounded-xl font-semibold transition-all ${
                duration === d
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-foreground-muted hover:bg-white/10'
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* Number of Rounds */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-foreground-muted mb-3">
          Rounds
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {ROUNDS.map((r) => (
            <button
              key={r}
              onClick={() => setTotalRounds(r)}
              className={`py-3 rounded-xl font-semibold transition-all ${
                totalRounds === r
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-foreground-muted hover:bg-white/10'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-foreground-muted mb-3">
          Difficulty
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {DIFFICULTIES.map((d) => (
            <Card
              key={d.value}
              hover
              active={difficulty === d.value}
              onClick={() => setDifficulty(d.value)}
            >
              <div className="text-center">
                <h3 className="font-semibold">{d.label}</h3>
                <p className="text-xs text-foreground-muted">{d.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card p-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-foreground-muted">Teams</span>
          <span className="font-medium">{state.config.teams.length}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-foreground-muted">Categories</span>
          <span className="font-medium">{state.config.categories.length}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-foreground-muted">Duration</span>
          <span className="font-medium">{duration}s per round</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-foreground-muted">Rounds</span>
          <span className="font-medium">{totalRounds}</span>
        </div>
      </div>

      <div className="mt-auto">
        <Button fullWidth size="lg" onClick={handleStart}>
          Start Game
        </Button>
      </div>
    </div>
  );
}
