'use client';

import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const { state, dispatch } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (state.status !== 'HOME') {
      dispatch({ type: 'NEW_GAME' });
    }
  }, []);

  const handleNewGame = () => {
    dispatch({ type: 'NEW_GAME' });
    router.push('/new-game');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 safe-area-top safe-area-bottom relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center animate-fade-in">
          <h1 className="text-display mb-3">
            <span className="text-primary-light">Q</span>lue
          </h1>
          <p className="text-body text-foreground-muted text-balance">
            Guess. Compete. Have fun.
          </p>
        </div>

        {/* Main CTA */}
        <div className="w-full animate-slide-up">
          <Button
            size="lg"
            fullWidth
            onClick={handleNewGame}
            className="text-lg py-5"
          >
            New Game
          </Button>
        </div>

        {/* Secondary actions */}
        <div className="w-full animate-slide-up" style={{ animationDelay: '50ms' }}>
          <button
            disabled
            className="w-full py-4 rounded-2xl border border-card-border text-foreground-muted text-base font-medium opacity-40 cursor-not-allowed"
          >
            Join Game
            <span className="ml-2 text-xs bg-white/5 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>
        </div>

        {/* Footer links */}
        <div className="flex gap-6 mt-2 animate-fade-in">
          <button
            onClick={() => router.push('/explore')}
            className="text-foreground-muted text-sm hover:text-foreground transition-colors"
          >
            Explore
          </button>
          <button className="text-foreground-faint text-sm cursor-not-allowed">
            My Packs
          </button>
          <button className="text-foreground-faint text-sm cursor-not-allowed">
            Settings
          </button>
        </div>

        {/* Credit */}
        <p className="text-foreground-faint text-xs mt-4 animate-fade-in">
          Developed by QA
        </p>
      </div>
    </div>
  );
}
