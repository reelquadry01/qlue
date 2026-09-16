'use client';

import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  duration: number;
  isRunning: boolean;
  onTimeUp: () => void;
}

/**
 * Countdown driven by a wall-clock deadline instead of accumulating 1s ticks.
 * `setInterval` is throttled in background tabs and drifts on slow devices, so
 * tick counting used to hand out extra seconds.
 */
export default function Timer({ duration, isRunning, onTimeUp }: TimerProps) {
  // The wall-clock deadline lives in a ref; a `timeLeft` state bump forces a
  // re-render on every tick so the visible number stays fresh. The tick
  // callback owns the interval, so state only changes inside that callback.
  const deadlineRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Keep the countdown fresh when the game settings change: recompute a new
  // deadline only in the timeout/effect path, never during render.
  const [timerDuration, setTimerDuration] = useState(duration);
  if (timerDuration !== duration) {
    setTimerDuration(duration);
    setTimeLeft(duration);
  }

  useEffect(() => {
    if (!isRunning) return;

    firedRef.current = false;
    const deadline = Date.now() + timeLeft * 1000;
    deadlineRef.current = deadline;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft((previous) => (previous === remaining ? previous : remaining));
      if (remaining === 0 && !firedRef.current) {
        firedRef.current = true;
        onTimeUpRef.current();
      }
    };

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
    // Deliberately keyed on `timeLeft` too: a length change restarts the clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, duration]);

  const currentLeft = timeLeft;
  const progress = duration > 0 ? Math.min(1, Math.max(0, currentLeft / duration)) : 0;
  const isUrgent = currentLeft <= 10;

  return (
    <div
      role="timer"
      aria-label={`${currentLeft} seconds remaining`}
      className={`flex items-center gap-3 ${isUrgent ? 'animate-pulse-urgent' : ''}`}
    >
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56" aria-hidden="true" focusable="false">
        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3"
          className="text-surface-light" />
        <circle cx="28" cy="28" r="24" fill="none"
          stroke={isUrgent ? 'var(--danger)' : 'var(--primary)'}
          strokeWidth="3"
          strokeDasharray={`${progress * 150.8} 150.8`}
          strokeLinecap="round" />
      </svg>
      <span
        aria-hidden="true"
        className={`text-[1.5rem] font-bold font-mono tabular-nums ${isUrgent ? 'text-danger' : 'text-foreground'}`}
      >
        {currentLeft}s
      </span>
    </div>
  );
}
