'use client';

import Button from '@/components/ui/Button';

interface PhonePassScreenProps {
  teamName?: string;
  roundNumber: number;
  totalRounds: number;
  turnNumber: number;
  teamCount: number;
  onReady: () => void;
}

/** "Pass the phone to <team>" screen shown before every turn. */
export default function PhonePassScreen({
  teamName,
  roundNumber,
  totalRounds,
  turnNumber,
  teamCount,
  onReady,
}: PhonePassScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/[0.05] blur-[100px]" />
      </div>

      <div className="text-center max-w-sm w-full animate-fade-in relative z-10">
        <p className="text-label text-foreground-faint mb-6">Pass the phone to</p>

        <div className="glass-card-lg p-8 mb-8 animate-glow-pulse">
          <h1 className="text-[2.25rem] font-extrabold leading-tight gradient-text">
            {teamName ?? 'Next team'}
          </h1>
          <p className="text-caption text-foreground-muted mt-2">
            Round {roundNumber} of {totalRounds}
            {teamCount > 1 ? ` · Turn ${turnNumber} of ${teamCount}` : ''}
          </p>
        </div>

        <Button
          size="lg"
          fullWidth
          onClick={onReady}
          className="text-lg py-6 bg-gradient-to-r from-primary to-accent border-0 text-white font-bold shadow-lg shadow-primary/25"
        >
          Ready?
        </Button>
      </div>
    </div>
  );
}