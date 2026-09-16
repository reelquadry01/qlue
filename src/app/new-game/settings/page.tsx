'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { Difficulty } from '@/engine/types';
import { setPreferences, usePreferences } from '@/hooks/usePreferences';
import { getCategoryName } from '@/lib/categories';
import Button from '@/components/ui/Button';
import PageShell from '@/components/ui/PageShell';
import Toggle from '@/components/ui/Toggle';

const DURATIONS = [30, 45, 60, 90];
const ROUNDS = [5, 10, 15, 20];
const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Simple prompts' },
  { value: 'medium', label: 'Medium', desc: 'Balanced' },
  { value: 'hard', label: 'Hard', desc: 'Expert level' },
  { value: 'mixed', label: 'Mixed', desc: 'All levels' },
];

const optionClasses = (isActive: boolean) =>
  `py-3 rounded-xl font-bold text-body transition-all ${
    isActive
      ? 'bg-primary text-background shadow-lg shadow-primary/20'
      : 'bg-surface text-foreground-muted hover:bg-surface-light border border-white/5'
  }`;

export default function SettingsPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const { soundEnabled } = usePreferences();
  const [duration, setDuration] = useState(state.config.roundDuration || 60);
  const [totalRounds, setTotalRounds] = useState(state.config.totalRounds || 5);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    state.config.difficulty || 'mixed'
  );

  const teamsReady = state.config.teams.length >= 2;
  const selectedCategories = state.config.categories;

  const startGame = () => {
    dispatch({
      type: 'SET_SETTINGS',
      roundDuration: duration,
      totalRounds,
      difficulty,
    });
    router.push('/play');
  };

  return (
    <PageShell
      title="Game Settings"
      subtitle="Customize your game"
      backHref="/new-game/categories"
      footer={
        <div className="flex flex-col gap-2">
          {!teamsReady && (
            <p className="text-caption text-warning text-center">
              Add at least 2 teams before starting.
            </p>
          )}
          <Button
            fullWidth
            size="lg"
            onClick={startGame}
            disabled={!teamsReady || selectedCategories.length === 0}
          >
            Start Game
          </Button>
        </div>
      }
    >
      <fieldset className="mb-6">
        <legend className="text-label text-foreground-faint mb-3">
          Round Duration
        </legend>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={duration === value}
              onClick={() => setDuration(value)}
              className={optionClasses(duration === value)}
            >
              {value}s
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-label text-foreground-faint mb-3">
          Rounds
        </legend>
        <div className="grid grid-cols-4 gap-2">
          {ROUNDS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={totalRounds === value}
              onClick={() => setTotalRounds(value)}
              className={optionClasses(totalRounds === value)}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className="text-label text-foreground-faint mb-3">
          Difficulty
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {DIFFICULTIES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={difficulty === option.value}
              onClick={() => setDifficulty(option.value)}
              className={`text-center py-4 rounded-2xl transition-all ${
                difficulty === option.value
                  ? 'bg-card-active ring-2 ring-primary/30 border border-primary/20'
                  : 'bg-card border border-card-border hover:bg-card-hover'
              }`}
            >
              <span className="block font-bold text-body">{option.label}</span>
              <span className="block text-caption text-foreground-faint mt-0.5">
                {option.desc}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Summary */}
      <section
        aria-labelledby="summary-heading"
        className="glass-card p-4 mb-6"
      >
        <h2 id="summary-heading" className="text-label text-foreground-faint mb-3">
          This game
        </h2>
        <dl className="space-y-2">
          {[
            ['Teams', String(state.config.teams.length)],
            ['Duration', `${duration}s per round`],
            ['Rounds', String(totalRounds)],
            ['Difficulty', DIFFICULTIES.find((d) => d.value === difficulty)?.label ?? difficulty],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 text-sm">
              <dt className="text-foreground-muted">{label}</dt>
              <dd className="font-bold text-right">{value}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-foreground-muted">Categories</dt>
            <dd className="font-bold text-right">
              {selectedCategories.length === 0
                ? 'None selected'
                : selectedCategories
                    .map((selection) => getCategoryName(selection.categoryId))
                    .join(', ')}
            </dd>
          </div>
        </dl>
      </section>

      {/* Audio */}
      <section
        aria-labelledby="audio-heading"
        className="glass-card px-4 py-2 mb-6"
      >
        <h2 id="audio-heading" className="text-label text-foreground-faint pt-4">
          Audio
        </h2>
        <Toggle
          label="Sound effects"
          description="Correct, skip and countdown sounds"
          checked={soundEnabled}
          onChange={(next) => setPreferences({ soundEnabled: next })}
        />
      </section>

      <button
        type="button"
        onClick={() => router.push('/new-game/categories')}
        className="text-caption text-foreground-muted hover:text-foreground transition-colors mx-auto"
      >
        Change categories
      </button>
    </PageShell>
  );
}