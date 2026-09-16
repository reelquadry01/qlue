'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { SEED_PROMPTS } from '@/data/seed-content';
import { getNextPrompt } from '@/engine/prompts';
import { isPlayableStatus } from '@/lib/routes';
import { setPreferences, usePreferences } from '@/hooks/usePreferences';
import { useSound } from '@/hooks/useSound';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CountdownScreen from '@/components/play/CountdownScreen';
import PhonePassScreen from '@/components/play/PhonePassScreen';
import RoundScreen from '@/components/play/RoundScreen';
import TimeUpScreen from '@/components/play/TimeUpScreen';

type PlayPhase = 'phone-pass' | 'countdown' | 'active' | 'time-up';

/** Ignore repeat taps while the previous answer's animation is still playing. */
const ANSWER_COOLDOWN_MS = 180;

export default function PlayPage() {
  const { state, dispatch, getCurrentTeam } = useGame();
  const router = useRouter();

  const [phase, setPhase] = useState<PlayPhase>('phone-pass');
  const [countdown, setCountdown] = useState(3);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [feedbackFlash, setFeedbackFlash] = useState<'correct' | 'skip' | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [noPrompts, setNoPrompts] = useState(false);
  const lastAnswerRef = useRef(0);

  const { soundEnabled } = usePreferences();
  const { play, prime } = useSound();

  const currentTeam = getCurrentTeam();
  const teamCount = state.config.teams.length;
  const turnNumber = Math.min(state.currentTeamIndex + 1, Math.max(teamCount, 1));
  const correctThisRound = state.roundCorrect;
  const skippedThisRound = state.roundSkipped;

  // Deal the first prompt of a turn from inside the timeout/handler path, so
  // no effect has to set state synchronously during render.
  const dealFirstPrompt = useCallback(() => {
    if (state.currentPrompt) return;
    const prompt = getNextPrompt(
      SEED_PROMPTS,
      state.config.categories,
      state.config.difficulty,
      state.usedPromptIds
    );
    if (prompt) {
      dispatch({ type: 'SET_PROMPT', prompt });
    } else {
      setNoPrompts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep links and stale saved states must never land on the round screen.
  useEffect(() => {
    if (state.status === 'ROUND_RESULTS' || state.status === 'FINAL_RESULTS') {
      router.replace('/play/results');
      return;
    }
    if (!isPlayableStatus(state.status)) router.replace('/');
  }, [state.status, router]);

  // Flags the game as in-progress so a reload can be resumed. Counter changes
  // belong to SET_SETTINGS / NEXT_ROUND, never to the round screen.
  useEffect(() => {
    dispatch({ type: 'START_ROUND' });
  }, [dispatch]);


  // Ticks down once per second. The screen only changes when the count hits
  // zero, so firing the follow-up from inside the timeout is the cheapest
  // correct structure — not a synchronous effect body.
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) return;
    play('countdown');
    const timer = setTimeout(() => {
      if (countdown === 1) {
        setCountdown(0);
        setPhase('active');
        dispatch({ type: 'COUNTDOWN_COMPLETE' });
        play('countdownGo');
        dealFirstPrompt();
        return;
      }
      setCountdown((value) => value - 1);
    }, 1000);
    return () => clearTimeout(timer);
    // `play`/`dispatch`/`dealFirstPrompt` stay stable for this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdown]);

  const handleCorrect = useCallback(() => {
    const now = Date.now();
    if (now - lastAnswerRef.current < ANSWER_COOLDOWN_MS) return;
    lastAnswerRef.current = now;

    play('correct');
    setFeedbackFlash('correct');
    setTimeout(() => setFeedbackFlash(null), 300);
    setAnnouncement(`Correct. ${correctThisRound + 1} this round.`);
    dispatch({ type: 'ANSWER_CORRECT', allPrompts: SEED_PROMPTS });
  }, [correctThisRound, dispatch, play]);

  const handleSkip = useCallback(() => {
    const now = Date.now();
    if (now - lastAnswerRef.current < ANSWER_COOLDOWN_MS) return;
    lastAnswerRef.current = now;

    play('skip');
    setFeedbackFlash('skip');
    setTimeout(() => setFeedbackFlash(null), 300);
    setAnnouncement(`Skipped. ${skippedThisRound + 1} skipped this round.`);
    dispatch({ type: 'ANSWER_SKIP', allPrompts: SEED_PROMPTS });
  }, [dispatch, play, skippedThisRound]);

  const handleTimeUp = useCallback(() => {
    setPhase('time-up');
    play('timeUp');
    setAnnouncement(
      `Time is up. ${correctThisRound} correct, ${skippedThisRound} skipped.`
    );
    dispatch({ type: 'TIME_UP' });
  }, [correctThisRound, dispatch, play, skippedThisRound]);

  // The prompt deal only needs to run when a turn first goes live. Moving the
  // side effect into the ready handler avoids effect-ordering surprises
  // between the mount-time deal and the countdown zero beat.
  const handleReady = () => {
    // Pre-warm audio inside the tap gesture so mobile browsers allow playback.
    prime();
    setCountdown(3);
    setNoPrompts(false);
    setPhase('countdown');
  };

  const handleEndGame = () => dispatch({ type: 'END_GAME' });
  const toggleSound = () => setPreferences({ soundEnabled: !soundEnabled });

  return (
    <>
      {phase === 'phone-pass' && (
        <PhonePassScreen
          teamName={currentTeam?.name}
          roundNumber={state.currentRound}
          totalRounds={state.config.totalRounds}
          turnNumber={turnNumber}
          teamCount={teamCount}
          onReady={handleReady}
        />
      )}

      {phase === 'countdown' && (
        <CountdownScreen teamName={currentTeam?.name} countdown={countdown} />
      )}

      {phase === 'time-up' && (
        <TimeUpScreen correct={correctThisRound} skipped={skippedThisRound} />
      )}

      {phase === 'active' && (
        <RoundScreen
          teamName={currentTeam?.name}
          teamScore={currentTeam?.score ?? 0}
          roundNumber={state.currentRound}
          totalRounds={state.config.totalRounds}
          turnNumber={turnNumber}
          teamCount={teamCount}
          prompt={state.currentPrompt}
          noPrompts={noPrompts}
          correct={correctThisRound}
          skipped={skippedThisRound}
          duration={state.config.roundDuration}
          isTimerRunning
          feedbackFlash={feedbackFlash}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onTimeUp={handleTimeUp}
          onSkip={handleSkip}
          onCorrect={handleCorrect}
          onEndGame={() => setShowQuitConfirm(true)}
        />
      )}

      {/* Screen readers hear score changes without the visual flashes. */}
      <p aria-live="polite" className="sr-only-live">
        {announcement}
      </p>

      <Modal
        isOpen={showQuitConfirm}
        onClose={() => setShowQuitConfirm(false)}
        ariaLabel="End game"
      >
        <h2 className="text-title mb-2">End Game?</h2>
        <p className="text-body text-foreground-muted mb-6">
          This will end the game now and show final results.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setShowQuitConfirm(false)}>
            Keep Playing
          </Button>
          <Button variant="danger" fullWidth onClick={handleEndGame}>
            End Game
          </Button>
        </div>
      </Modal>
    </>
  );
}