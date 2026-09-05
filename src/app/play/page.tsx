'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Redirect if game not active
  useEffect(() => {
    if (state.status === 'ROUND_RESULTS' || state.status === 'FINAL_RESULTS') {
      router.push('/play/results');
    }
    if (state.status === 'HOME') {
      router.push('/');
    }
  }, [state.status, router]);

  // Reset dispatch flag when phase changes back to phone-pass
  useEffect(() => {
    if (phase === 'phone-pass') {
      hasDispatchedStart.current = false;
    }
  }, [phase]);

  // Handle phone-pass phase
  useEffect(() => {
    if (phase === 'phone-pass' && !hasDispatchedStart.current) {
      hasDispatchedStart.current = true;
      dispatch({ type: 'START_ROUND' });
    }
  }, [phase, dispatch]);

  // Handle countdown
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

  const loadNextPrompt = useCallback(() => {
    const prompt = getNextPrompt(
      SEED_PROMPTS,
      state.config.categories,
      state.config.difficulty,
      state.usedPromptIds
    );
    dispatch({ type: 'SET_PROMPT', prompt });
  }, [state.config.categories, state.config.difficulty, state.usedPromptIds, dispatch]);

  // Load prompt when active and none present
  useEffect(() => {
    if (phase === 'active' && !state.currentPrompt) {
      loadNextPrompt();
    }
  }, [phase, state.currentPrompt, loadNextPrompt]);

  const handleCorrect = () => {
    dispatch({ type: 'ANSWER_CORRECT' });
    // Small delay before loading next prompt for visual feedback
    setTimeout(() => loadNextPrompt(), 150);
  };

  const handleSkip = () => {
    dispatch({ type: 'ANSWER_SKIP' });
    setTimeout(() => loadNextPrompt(), 150);
  };

  const handleTimeUp = () => {
    setPhase('time-up');
    dispatch({ type: 'TIME_UP' });
  };

  const handleReady = () => {
    setCountdown(3);
    setPhase('countdown');
  };

  // Phone Pass Phase
  if (phase === 'phone-pass') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
        <div className="text-center max-w-sm w-full">
          <div className="mb-8">
            <p className="text-foreground-muted text-sm mb-4">Pass the phone to</p>
            <div className="glass-card p-8">
              <p className="text-4xl font-bold mb-2">{currentTeam?.name}</p>
              <p className="text-foreground-muted">
                Round {state.currentRound + 1} of {state.config.totalRounds}
              </p>
            </div>
          </div>
          <Button size="lg" fullWidth onClick={handleReady} className="text-lg">
            Ready?
          </Button>
        </div>
      </div>
    );
  }

  // Countdown Phase
  if (phase === 'countdown') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <p className="text-foreground-muted mb-8">{currentTeam?.name}</p>
          <div
            className="text-[120px] font-bold text-primary-light animate-count-pop leading-none"
            key={countdown}
          >
            {countdown === 0 ? 'GO!' : countdown}
          </div>
        </div>
      </div>
    );
  }

  // Time Up overlay
  if (phase === 'time-up') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center animate-scale-in">
          <div className="text-7xl font-bold text-danger mb-4">TIME!</div>
          <p className="text-foreground-muted text-lg">Round complete</p>
        </div>
      </div>
    );
  }

  // Active Game Phase
  return (
    <div className="flex-1 flex flex-col px-4 py-4 safe-area-top safe-area-bottom max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm text-foreground-muted">{currentTeam?.name}</p>
          <p className="text-3xl font-bold">{currentTeam?.score}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-foreground-muted">
            {state.currentRound}/{state.config.totalRounds}
          </p>
          <div className="flex items-center gap-1 justify-end">
            <span className="text-success text-sm">✓ {state.roundCorrect}</span>
            <span className="text-foreground-muted text-sm mx-1">·</span>
            <span className="text-danger text-sm">✗ {state.roundSkipped}</span>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="flex justify-center my-4">
        <Timer
          duration={state.config.roundDuration}
          isRunning={phase === 'active'}
          onTimeUp={handleTimeUp}
        />
      </div>

      {/* Prompt Card */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
        {state.currentPrompt ? (
          <div className="glass-card p-6 w-full text-center animate-scale-in" key={state.currentPrompt.id}>
            <p className="text-3xl md:text-4xl font-bold leading-tight">
              {state.currentPrompt.answer}
            </p>
            {state.currentPrompt.forbiddenWords &&
              state.currentPrompt.forbiddenWords.length > 0 && (
                <div className="mt-6 pt-4 border-t border-card-border">
                  <p className="text-sm text-danger font-semibold mb-2">
                    DON&apos;T SAY:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {state.currentPrompt.forbiddenWords.map((word) => (
                      <span
                        key={word}
                        className="px-3 py-1 rounded-full bg-danger/10 text-danger text-sm font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="glass-card p-6 w-full text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded w-48 mx-auto mb-2" />
              <div className="h-4 bg-white/5 rounded w-32 mx-auto" />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4 pb-2">
        <Button
          variant="danger"
          size="lg"
          fullWidth
          onClick={handleSkip}
          className="py-6 text-lg"
        >
          Skip
        </Button>
        <Button
          variant="success"
          size="lg"
          fullWidth
          onClick={handleCorrect}
          className="py-6 text-lg"
        >
          ✓ Correct
        </Button>
      </div>
    </div>
  );
}
