'use client';

interface TimeUpScreenProps {
  correct: number;
  skipped: number;
}

/** Brief "time is up" flash before the round results screen takes over. */
export default function TimeUpScreen({ correct, skipped }: TimeUpScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom">
      <div className="animate-scale-in text-center">
        <p className="text-[5rem] font-extrabold text-danger mb-3 glow-danger">
          TIME!
        </p>
        <p className="text-body text-foreground-muted">
          {correct} correct · {skipped} skipped
        </p>
      </div>
    </div>
  );
}