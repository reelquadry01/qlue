'use client';

import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  duration: number;
  isRunning: boolean;
  onTimeUp: () => void;
  onTick?: (remaining: number) => void;
}

export default function Timer({ duration, isRunning, onTimeUp, onTick }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const onTimeUpRef = useRef(onTimeUp);
  const onTickRef = useRef(onTick);

  onTimeUpRef.current = onTimeUp;
  onTickRef.current = onTick;

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      setRemaining(duration);

      const tick = () => {
        if (!startTimeRef.current) return;
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const left = Math.max(0, duration - elapsed);
        setRemaining(left);
        onTickRef.current?.(left);

        if (left <= 0) {
          onTimeUpRef.current();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isRunning, duration]);

  const seconds = Math.ceil(remaining);
  const percentage = (remaining / duration) * 100;

  let colorClass = 'text-success';
  let bgClass = 'from-success/20 to-success/5';
  let ringClass = 'stroke-success';

  if (remaining <= 5) {
    colorClass = 'text-danger';
    bgClass = 'from-danger/20 to-danger/5';
    ringClass = 'stroke-danger';
  } else if (remaining <= 10) {
    colorClass = 'text-warning';
    bgClass = 'from-warning/20 to-warning/5';
    ringClass = 'stroke-warning';
  } else if (remaining <= 30) {
    colorClass = 'text-warning';
    bgClass = 'from-warning/10 to-transparent';
    ringClass = 'stroke-warning';
  }

  const isUrgent = remaining <= 10;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${isUrgent ? 'animate-pulse-urgent' : ''}`}>
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          className={ringClass}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center`}>
        <span className={`text-4xl font-mono font-bold ${colorClass}`}>
          {seconds}
        </span>
      </div>
    </div>
  );
}
