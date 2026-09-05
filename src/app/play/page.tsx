'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { SEED_PROMPTS } from '@/data/seed-content';
import { getNextPrompt } from '@/engine/prompts';
import Timer from '@/components/ui/Timer';
import Button from '@/components/ui/Button';

type PlayPhase = 'phone-pass' | 'countdown' | 'active' | 'time-up';

export default function PlayPage() {
  const { state, dispatch, getCurrentTeam } = useGame();
  const router = useRouter();
  const [phase, setPhase] = useState<PlayPhase>('phone-pass');
  const [countdown, setCountdown] = useState(3);
  const hasDispatchedStart = useRef(false);

  const currentTeam = getCurrentTeam();

  useEffect(() => {
    if (state.status === 'ROUND_RESULTS' || state.status === 'FINAL_RESULTS') {
      router.push('/play/results');
    }
    if (state.status === 'HOME') router.push('/');
  }, [state.status, router]);

  useEffect(() => {
    if (phase === 'phone-pass') hasDispatchedStart.current = false;
  }, [phase]);

  useEffect(() => {
    if (phase === 'phone-pass' && !hasDispatchedStart.current) {
      hasDispatchedStart.current = true;
      dispatch({ type: 'START_ROUND' });
    }
  }, [phase, dispatch]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('active');
      dispatch({ type: 'COUNTDOWN_COMPLETE' });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown, dispatch]);

  useEffect(() => {
    if (phase === 'active' && !state.currentPrompt) {
      const prompt = getNextPrompt(
        SEED_PROMPTS, state.config.categories, state.config.difficulty, state.usedPromptIds
      );
      if (prompt) dispatch({ type: 'SET_PROMPT', prompt });
    }
  }, [phase, state.currentPrompt, state.config.categories, state.config.difficulty, state.usedPromptIds, dispatch]);

  const handleCorrect = () => {
    dispatch({ type: 'ANSWER_CORRECT', allPrompts: SEED_PROMPTS });
  };

  const handleSkip = () => {
    dispatch({ type: 'ANSWER_SKIP', allPrompts: SEED_PROMPTS });
  };

  const handleTimeUp = () => {
    setPhase('time-up');
    dispatch({ type: 'TIME_UP' });
  };

  const handleReady = () => {
    setCountdown(3);
    setPhase('countdown');
  };

  // Phone Pass
  if (phase === 'phone-pass') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom">
        <div className="text-center max-w-sm w-full animate-fade-in">
          <p className="text-label text-foreground-faint mb-6">Pass the phone to</p>
          <div className="glass-card-lg p-8 mb-8">
            <p className="text-[2rem] font-bold leading-tight">{currentTeam?.name}</p>
            <p className="text-caption text-foreground-muted mt-2">
              Round {state.currentRound + 1} of {state.config.totalRounds}
            </p>
          </div>
          <Button size="lg" fullWidth onClick={handleReady} className="text-lg">
            Ready?
          </Button>
        </div>
      </div>
    );
  }

  // Countdown
  if (phase === 'countdown') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom">
        <p className="text-label text-foreground-faint mb-8">{currentTeam?.name}</p>
        <div className="text-[140px] font-bold text-primary leading-none font-mono animate-count-pop" key={countdown}>
          {countdown === 0 ? 'GO!' : countdown}
        </div>
      </div>
    );
  }

  // Time Up
  if (phase === 'time-up') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom">
        <div className="animate-scale-in text-center">
          <div className="text-display text-danger mb-3">TIME!</div>
          <p className="text-body text-foreground-muted">Round complete</p>
        </div>
      </div>
    );
  }

  // Active Game
  return (
    <div className="flex-1 flex flex-col px-5 py-4 safe-area-top safe-area-bottom max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-label text-foreground-faint">{currentTeam?.name}</p>
          <p className="text-[2rem] font-bold text-primary score-glow leading-tight">{currentTeam?.score}</p>
        </div>
        <div className="text-right">
          <p className="text-label text-foreground-faint">
            {state.currentRound}/{state.config.totalRounds}
          </p>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <span className="text-success text-caption font-semibold">✓ {state.roundCorrect}</span>
            <span className="text-foreground-faint text-xs">·</span>
            <span className="text-danger text-caption font-semibold">✗ {state.roundSkipped}</span>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="flex justify-center my-3">
        <Timer
          duration={state.config.roundDuration}
          isRunning={phase === 'active'}
          onTimeUp={handleTimeUp}
        />
      </div>

      {/* PROMPT — BIG, BOLD, DOMINANT */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] px-2">
        {state.currentPrompt ? (
          <div className="glass-card-lg p-6 sm:p-8 w-full text-center animate-scale-in glow-primary" key={state.currentPrompt.id}>
            <p className="text-[2.5rem] sm:text-[3.25rem] font-extrabold leading-[1.1] prompt-text tracking-tight">
              {state.currentPrompt.answer}
            </p>
            {state.currentPrompt.forbiddenWords && state.currentPrompt.forbiddenWords.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-label text-danger mb-2">DON&apos;T SAY</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {state.currentPrompt.forbiddenWords.map((word) => (
                    <span key={word} className="px-3 py-1 rounded-lg bg-danger-muted text-danger text-caption font-semibold">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card-lg p-8 w-full text-center">
            <div className="animate-shimmer h-12 rounded-xl mx-auto w-48" />
          </div>
        )}
      </div>

      {/* Action Buttons — LARGE touch targets */}
      <div className="flex gap-3 mt-5 pb-2">
        <Button
          variant="danger"
          size="lg"
          fullWidth
          onClick={handleSkip}
          className="py-7 text-xl font-bold"
        >
          Skip
        </Button>
        <Button
          variant="success"
          size="lg"
          fullWidth
          onClick={handleCorrect}
          className="py-7 text-xl font-bold"
        >
          ✓ Correct
        </Button>
      </div>
    </div>
  );
}
