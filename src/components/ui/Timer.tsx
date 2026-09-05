'use client';

import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  duration: number;
  isRunning: boolean;
  onTimeUp: () => void;
}

export default function Timer({ duration, isRunning, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const progress = timeLeft / duration;
  const pct = Math.round(progress * 100);
  const isUrgent = timeLeft <= 10;

  return (
    <div className={`flex items-center gap-3 ${isUrgent ? 'animate-pulse-urgent' : ''}`}>
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3"
          className="text-surface-light" />
        <circle cx="28" cy="28" r="24" fill="none"
          stroke={isUrgent ? 'var(--danger)' : 'var(--primary)'}
          strokeWidth="3"
          strokeDasharray={`${progress * 150.8} 150.8`}
          strokeLinecap="round" />
      </svg>
      <span className={`text-[1.5rem] font-bold font-mono ${isUrgent ? 'text-danger' : 'text-foreground'}`}>
        {timeLeft}s
      </span>
    </div>
  );
}
