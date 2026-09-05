'use client';

import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const { state, dispatch } = useGame();
  const router = useRouter();

  useEffect(() => {
    // Reset game state when arriving at home
    if (state.status !== 'HOME') {
      dispatch({ type: 'NEW_GAME' });
    }
  }, []);

  const handleNewGame = () => {
    dispatch({ type: 'NEW_GAME' });
    router.push('/new-game');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm w-full">
        {/* Logo */}
        <div className="text-center animate-fade-in">
          <h1 className="text-7xl font-bold tracking-tight mb-3">
            <span className="text-primary-light">Q</span>lue
          </h1>
          <p className="text-foreground-muted text-lg">
            Guess. Compete. Have fun.
          </p>
        </div>

        {/* Main CTA */}
        <div className="w-full animate-slide-up">
          <Button
            size="lg"
            fullWidth
            onClick={handleNewGame}
            className="text-xl py-6 rounded-2xl"
          >
            New Game
          </Button>
        </div>

        {/* Secondary actions */}
        <div className="w-full flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <button
            disabled
            className="w-full py-4 rounded-2xl border border-card-border text-foreground-muted text-base font-medium opacity-50 cursor-not-allowed"
          >
            Join Game
            <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>
        </div>

        {/* Footer links */}
        <div className="flex gap-8 mt-4 animate-fade-in">
          <button
            onClick={() => router.push('/explore')}
            className="text-foreground-muted text-sm hover:text-foreground transition-colors"
          >
            Explore
          </button>
          <button className="text-foreground-muted text-sm hover:text-foreground transition-colors opacity-50 cursor-not-allowed">
            My Packs
          </button>
          <button className="text-foreground-muted text-sm hover:text-foreground transition-colors opacity-50 cursor-not-allowed">
            Settings
          </button>
        </div>

        {/* Credit */}
        <p className="text-foreground-muted/50 text-xs mt-8 animate-fade-in">
          Developed by QA
        </p>
      </div>
    </div>
  );
}
