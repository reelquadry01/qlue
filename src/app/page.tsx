'use client';

import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const { state, dispatch } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (state.status !== 'HOME') dispatch({ type: 'NEW_GAME' });
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 safe-area-top safe-area-bottom relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center animate-fade-in">
          <h1 className="text-display mb-3">
            <span className="text-primary">Q</span>lue
          </h1>
          <p className="text-body text-foreground-muted text-balance">
            Guess. Compete. Have fun.
          </p>
        </div>

        {/* CTA */}
        <div className="w-full animate-slide-up">
          <Button size="lg" fullWidth onClick={() => { dispatch({ type: 'NEW_GAME' }); router.push('/new-game'); }} className="text-xl py-6">
            New Game
          </Button>
        </div>

        {/* Disabled join */}
        <div className="w-full animate-slide-up" style={{ animationDelay: '40ms' }}>
          <button disabled className="w-full py-5 rounded-2xl border border-white/5 text-foreground-faint text-base font-medium opacity-30 cursor-not-allowed">
            Join Game
            <span className="ml-2 text-xs bg-white/5 px-2 py-0.5 rounded-full">Soon</span>
          </button>
        </div>

        {/* Links */}
        <div className="flex gap-8 mt-2 animate-fade-in">
          <button onClick={() => router.push('/explore')} className="text-foreground-muted text-sm hover:text-foreground transition-colors">
            Explore
          </button>
          <button className="text-foreground-faint text-sm cursor-not-allowed">My Packs</button>
          <button className="text-foreground-faint text-sm cursor-not-allowed">Settings</button>
        </div>

        <p className="text-foreground-faint text-xs mt-4 animate-fade-in">Developed by QA</p>
      </div>
    </div>
  );
}
