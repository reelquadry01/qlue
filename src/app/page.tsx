'use client';

import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { getResumeHref } from '@/lib/routes';
import { setPreferences, usePreferences } from '@/hooks/usePreferences';
import { CATEGORIES } from '@/lib/categories';
import { SEED_PROMPTS } from '@/data/seed-content';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';

const HOW_TO_PLAY = [
  {
    icon: '🎯',
    title: 'Pick a category',
    body: `${SEED_PROMPTS.length} prompts across ${CATEGORIES.length} categories.`,
  },
  {
    icon: '👥',
    title: 'Pick your teams',
    body: 'Add players, then split them into 2–4 teams.',
  },
  {
    icon: '⏱️',
    title: 'Beat the clock',
    body: 'Describe the word without saying the forbidden ones.',
  },
];

export default function HomePage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const { soundEnabled } = usePreferences();

  // A game that survived a reload can be picked up where it left off.
  const resumeHref = getResumeHref(state.status);
  const teamCount = state.config.teams.length;

  const startNewGame = () => {
    dispatch({ type: 'NEW_GAME' });
    router.push('/new-game');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-6 safe-area-top safe-area-bottom relative overflow-hidden">
      {/* Background orbs */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-accent/[0.05] blur-[100px]" />
        <div className="absolute top-[30%] right-[20%] w-[200px] h-[200px] rounded-full bg-warning/[0.04] blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full">
        {/* Logo */}
        <div className="text-center animate-fade-in">
          <h1 className="text-[4.5rem] leading-none font-extrabold tracking-tighter mb-4">
            <span className="gradient-text">Q</span>
            <span className="text-foreground">lue</span>
          </h1>
          <p className="text-body text-foreground-muted text-balance">
            Guess the word. Don&apos;t say the forbidden ones.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3 animate-slide-up">
          {resumeHref && (
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                fullWidth
                onClick={() => router.push(resumeHref)}
                className="text-xl py-6 bg-gradient-to-r from-primary to-accent border-0 text-white font-bold shadow-lg shadow-primary/25"
              >
                Resume Game
              </Button>
              <p className="text-caption text-foreground-muted text-center">
                Round {state.currentRound} of {state.config.totalRounds}
                {teamCount > 0 ? ` · ${teamCount} teams` : ''}
              </p>
            </div>
          )}

          <Button
            size="lg"
            fullWidth
            variant={resumeHref ? 'outline' : 'primary'}
            onClick={startNewGame}
            className={
              resumeHref
                ? ''
                : 'text-xl py-6 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light border-0 text-white font-bold shadow-lg shadow-primary/25'
            }
          >
            New Game
          </Button>

          <button
            type="button"
            disabled
            title="Online multiplayer is not available yet"
            className="w-full py-4 rounded-2xl border border-white/5 text-foreground-faint text-body font-medium cursor-not-allowed"
          >
            Join Game
            <span className="ml-2 text-xs bg-white/5 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>
        </div>

        {/* How to play */}
        <section
          aria-labelledby="how-to-play-heading"
          className="w-full glass-card p-5 animate-slide-up"
        >
          <h2
            id="how-to-play-heading"
            className="text-label text-foreground-faint mb-3"
          >
            How to play
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3 sm:gap-3">
            {HOW_TO_PLAY.map((step, index) => (
              <li key={step.title} className="flex gap-3 sm:flex-col sm:gap-2">
                <span aria-hidden="true" className="text-xl leading-none">
                  {step.icon}
                </span>
                <div>
                  <p className="text-body font-semibold">
                    {index + 1}. {step.title}
                  </p>
                  <p className="text-caption text-foreground-muted mt-0.5">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Preferences — the sound option applies to every screen */}
        <section
          aria-labelledby="preferences-heading"
          className="w-full glass-card px-5 py-2 animate-fade-in"
        >
          <h2
            id="preferences-heading"
            className="text-label text-foreground-faint pt-4"
          >
            Settings
          </h2>
          <Toggle
            label="Sound effects"
            description="Correct, skip and countdown sounds"
            checked={soundEnabled}
            onChange={(next) => setPreferences({ soundEnabled: next })}
          />
        </section>

        {/* Secondary links */}
        <div className="flex items-center justify-center gap-3 text-caption animate-fade-in">
          <button
            type="button"
            onClick={() => router.push('/explore')}
            className="text-foreground-muted hover:text-foreground transition-colors"
          >
            Explore categories
          </button>
          <span aria-hidden="true" className="text-foreground-faint">
            ·
          </span>
          <button
            type="button"
            disabled
            title="Custom packs are not available yet"
            className="text-foreground-faint cursor-not-allowed"
          >
            My Packs (soon)
          </button>
        </div>

        <p className="text-foreground-faint text-xs animate-fade-in">
          Developed by QA
        </p>
      </div>
    </div>
  );
}