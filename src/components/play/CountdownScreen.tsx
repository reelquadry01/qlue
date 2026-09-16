'use client';

interface CountdownScreenProps {
  teamName?: string;
  countdown: number;
}

/** 3-2-1-GO countdown before the word appears. */
export default function CountdownScreen({ teamName, countdown }: CountdownScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom">
      <p className="text-label text-foreground-faint mb-8">{teamName}</p>
      <div
        role="status"
        aria-live="polite"
        className="text-[120px] sm:text-[180px] font-extrabold leading-none font-mono animate-count-pop"
        key={countdown}
      >
        {countdown === 0 ? (
          <span className="gradient-text">GO!</span>
        ) : (
          <span className="gradient-text">{countdown}</span>
        )}
      </div>
      <span className="sr-only-live">
        {countdown === 0 ? 'Go!' : `Starting in ${countdown}`}
      </span>
    </div>
  );
}