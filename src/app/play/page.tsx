'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { SEED_PROMPTS } from '@/data/seed-content';
import { getNextPrompt } from '@/engine/prompts';
import { getCategoryById } from '@/lib/categories';
import { useSound } from '@/hooks/useSound';
import Timer from '@/components/ui/Timer';
import Button from '@/components/ui/Button';

type PlayPhase = 'phone-pass' | 'countdown' | 'active' | 'time-up';

export default function PlayPage() {
  const { state, dispatch, getCurrentTeam } = useGame();
  const router = useRouter();
  const [phase, setPhase] = useState<PlayPhase>('phone-pass');
  const [countdown, setCountdown] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [feedbackFlash, setFeedbackFlash] = useState<'correct' | 'skip' | null>(null);
  const hasDispatchedStart = useRef(false);
  const { play } = useSound(soundEnabled);

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
      play('countdownGo');
      return;
    }
    play('countdown');
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown, dispatch, play]);

  useEffect(() => {
    if (phase === 'active' && !state.currentPrompt) {
      const prompt = getNextPrompt(
        SEED_PROMPTS, state.config.categories, state.config.difficulty, state.usedPromptIds
      );
      if (prompt) dispatch({ type: 'SET_PROMPT', prompt });
    }
  }, [phase, state.currentPrompt, state.config.categories, state.config.difficulty, state.usedPromptIds, dispatch]);

  const handleCorrect = useCallback(() => {
    play('correct');
    setFeedbackFlash('correct');
    setTimeout(() => setFeedbackFlash(null), 300);
    dispatch({ type: 'ANSWER_CORRECT', allPrompts: SEED_PROMPTS });
  }, [dispatch, play]);

  const handleSkip = useCallback(() => {
    play('skip');
    setFeedbackFlash('skip');
    setTimeout(() => setFeedbackFlash(null), 300);
    dispatch({ type: 'ANSWER_SKIP', allPrompts: SEED_PROMPTS });
  }, [dispatch, play]);

  const handleTimeUp = useCallback(() => {
    setPhase('time-up');
    play('timeUp');
    dispatch({ type: 'TIME_UP' });
  }, [dispatch, play]);

  const handleReady = () => {
    setCountdown(3);
    setPhase('countdown');
  };

  const handleEndGame = () => {
    dispatch({ type: 'END_GAME' });
  };

  const category = state.currentPrompt ? getCategoryById(state.currentPrompt.categoryId) : null;

  // Phone Pass
  if (phase === 'phone-pass') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/[0.05] blur-[100px]" />
        </div>
        <div className="text-center max-w-sm w-full animate-fade-in relative z-10">
          <p className="text-label text-foreground-faint mb-6">Pass the phone to</p>
          <div className="glass-card-lg p-8 mb-8 animate-glow-pulse">
            <p className="text-[2.25rem] font-extrabold leading-tight gradient-text">{currentTeam?.name}</p>
            <p className="text-caption text-foreground-muted mt-2">
              Round {state.currentRound + 1} of {state.config.totalRounds}
            </p>
          </div>
          <Button size="lg" fullWidth onClick={handleReady} className="text-lg py-6 bg-gradient-to-r from-primary to-accent border-0 text-white font-bold shadow-lg shadow-primary/25">
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
        <div className="text-[180px] font-extrabold leading-none font-mono animate-count-pop" key={countdown}>
          {countdown === 0 ? (
            <span className="gradient-text">GO!</span>
          ) : (
            <span className="gradient-text">{countdown}</span>
          )}
        </div>
      </div>
    );
  }

  // Time Up
  if (phase === 'time-up') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom">
        <div className="animate-scale-in text-center">
          <div className="text-[5rem] font-extrabold text-danger mb-3 glow-danger">TIME!</div>
          <p className="text-body text-foreground-muted">Round complete</p>
        </div>
      </div>
    );
  }

  // Active Game
  return (
    <div className={`flex-1 flex flex-col px-5 py-4 safe-area-top safe-area-bottom max-w-lg mx-auto w-full transition-colors duration-200 ${feedbackFlash === 'correct' ? 'animate-correct-flash' : feedbackFlash === 'skip' ? 'animate-wrong-flash' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-label text-foreground-faint">{currentTeam?.name}</p>
          <p className="text-[2.25rem] font-extrabold text-primary score-glow leading-tight">{currentTeam?.score}</p>
        </div>
        <div className="text-right">
          <p className="text-label text-foreground-faint">
            {state.currentRound}/{state.config.totalRounds}
          </p>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <span className="text-success text-caption font-bold">✓ {state.roundCorrect}</span>
            <span className="text-foreground-faint text-xs">·</span>
            <span className="text-danger text-caption font-bold">✗ {state.roundSkipped}</span>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="flex justify-center my-2">
        <Timer
          duration={state.config.roundDuration}
          isRunning={phase === 'active'}
          onTimeUp={handleTimeUp}
        />
      </div>

      {/* PROMPT — MASSIVE */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[180px] px-1">
        {state.currentPrompt ? (
          <div className="glass-card-lg p-5 sm:p-7 w-full text-center animate-scale-in animate-glow-pulse" key={state.currentPrompt.id}>
            {/* Category badge */}
            {category && (
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <span className="text-sm">{category.icon}</span>
                <span className="text-label text-foreground-faint">{category.name}</span>
              </div>
            )}

            {/* THE WORD — HUGE */}
            <p className="text-[4rem] sm:text-[5.5rem] font-extrabold leading-[1.0] prompt-text tracking-tight gradient-text">
              {state.currentPrompt.answer}
            </p>

            {/* Forbidden words */}
            {state.currentPrompt.forbiddenWords && state.currentPrompt.forbiddenWords.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-label text-danger mb-2">DON&apos;T SAY</p>
                <div className="flex flex-wrap justify-center gap-1.5">
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

      {/* Action Buttons — HUGE */}
      <div className="flex gap-3 mt-4 pb-1">
        <button
          onClick={handleSkip}
          className="flex-1 py-8 rounded-2xl bg-danger text-white text-2xl font-extrabold shadow-lg shadow-danger/25 active:scale-[0.97] transition-all"
        >
          Skip
        </button>
        <button
          onClick={handleCorrect}
          className="flex-1 py-8 rounded-2xl bg-success text-white text-2xl font-extrabold shadow-lg shadow-success/25 active:scale-[0.97] transition-all"
        >
          ✓ Correct
        </button>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
        <button
          onClick={() => setSoundEnabled((s) => !s)}
          className="flex items-center gap-1.5 text-foreground-faint hover:text-foreground text-caption transition-colors py-1"
        >
          {soundEnabled ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>

        <button
          onClick={() => setShowQuitConfirm(true)}
          className="flex items-center gap-1.5 text-foreground-faint hover:text-danger text-caption transition-colors py-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          End Game
        </button>
      </div>

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card-lg p-6 w-full max-w-sm animate-scale-in">
            <h2 className="text-title mb-2">End Game?</h2>
            <p className="text-body text-foreground-muted mb-6">This will end the game now and show final results.</p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowQuitConfirm(false)}>
                Keep Playing
              </Button>
              <Button variant="danger" fullWidth onClick={handleEndGame}>
                End Game
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
