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

  // Load initial prompt when round starts
  useEffect(() => {
    if (phase === 'active' && !state.currentPrompt) {
      const prompt = getNextPrompt(
        SEED_PROMPTS,
        state.config.categories,
        state.config.difficulty,
        state.usedPromptIds
      );
      if (prompt) {
        dispatch({ type: 'SET_PROMPT', prompt });
      }
    }
  }, [phase, state.currentPrompt, state.config.categories, state.config.difficulty, state.usedPromptIds, dispatch]);

  const handleCorrect = () => {
    // Reducer selects next prompt atomically — no race condition
    dispatch({ type: 'ANSWER_CORRECT', allPrompts: SEED_PROMPTS });
  };

  const handleSkip = () => {
    // Reducer selects next prompt atomically — no race condition
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

  // Phone Pass Phase
  if (phase === 'phone-pass') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom">
        <div className="text-center max-w-sm w-full animate-fade-in">
          <div className="mb-10">
            <p className="text-caption text-foreground-faint mb-4 uppercase tracking-wider">Pass the phone to</p>
            <div className="glass-card-lg p-8">
              <p className="text-title">{currentTeam?.name}</p>
              <p className="text-caption text-foreground-muted mt-2">
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom">
        <div className="text-center">
          <p className="text-caption text-foreground-faint mb-8 uppercase tracking-wider">{currentTeam?.name}</p>
          <div
            className="text-[120px] font-bold text-primary-light animate-count-pop leading-none font-mono"
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom">
        <div className="text-center animate-scale-in">
          <div className="text-display text-danger mb-4">TIME!</div>
          <p className="text-body text-foreground-muted">Round complete</p>
        </div>
      </div>
    );
  }

  // Active Game Phase
  return (
    <div className="flex-1 flex flex-col px-5 py-5 safe-area-top safe-area-bottom max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-caption text-foreground-faint uppercase tracking-wider">{currentTeam?.name}</p>
          <p className="text-title">{currentTeam?.score}</p>
        </div>
        <div className="text-right">
          <p className="text-caption text-foreground-faint uppercase tracking-wider">
            {state.currentRound}/{state.config.totalRounds}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-success text-caption">✓ {state.roundCorrect}</span>
            <span className="text-foreground-faint">·</span>
            <span className="text-danger text-caption">✗ {state.roundSkipped}</span>
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
      <div className="flex-1 flex flex-col items-center justify-center min-h-[180px]">
        {state.currentPrompt ? (
          <div className="glass-card-lg p-8 w-full text-center animate-scale-in" key={state.currentPrompt.id}>
            <p className="text-title prompt-text">
              {state.currentPrompt.answer}
            </p>
            {state.currentPrompt.forbiddenWords &&
              state.currentPrompt.forbiddenWords.length > 0 && (
                <div className="mt-6 pt-4 border-t border-card-border">
                  <p className="text-label text-danger mb-2">
                    DON&apos;T SAY
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {state.currentPrompt.forbiddenWords.map((word) => (
                      <span
                        key={word}
                        className="px-3 py-1 rounded-full bg-danger-muted text-danger text-caption font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="glass-card-lg p-8 w-full text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-8 bg-surface rounded-xl w-48 mx-auto" />
              <div className="h-4 bg-surface rounded-lg w-32 mx-auto" />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pb-2">
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
