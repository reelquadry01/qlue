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
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-accent/[0.05] blur-[100px]" />
        <div className="absolute top-[30%] right-[20%] w-[200px] h-[200px] rounded-full bg-warning/[0.04] blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center animate-fade-in">
          <div className="mb-4">
            <span className="text-[4.5rem] leading-none font-extrabold tracking-tighter">
              <span className="gradient-text">Q</span>
              <span className="text-foreground">lue</span>
            </span>
          </div>
          <p className="text-body text-foreground-muted text-balance">
            Guess the word. Don&apos;t say the forbidden ones.
          </p>
        </div>

        {/* CTA */}
        <div className="w-full animate-slide-up">
          <Button size="lg" fullWidth onClick={() => { dispatch({ type: 'NEW_GAME' }); router.push('/new-game'); }} className="text-xl py-6 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light border-0 text-white font-bold shadow-lg shadow-primary/25">
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
