'use client';

import { Prompt } from '@/engine/types';
import { getCategoryById } from '@/lib/categories';
import Timer from '@/components/ui/Timer';

interface RoundScreenProps {
  teamName?: string;
  teamScore: number;
  roundNumber: number;
  totalRounds: number;
  turnNumber: number;
  teamCount: number;
  prompt: Prompt | null;
  noPrompts: boolean;
  correct: number;
  skipped: number;
  duration: number;
  isTimerRunning: boolean;
  feedbackFlash: 'correct' | 'skip' | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTimeUp: () => void;
  onSkip: () => void;
  onCorrect: () => void;
  onEndGame: () => void;
}

/** The live turn: timer, the word to describe and the two answer buttons. */
export default function RoundScreen({
  teamName,
  teamScore,
  roundNumber,
  totalRounds,
  turnNumber,
  teamCount,
  prompt,
  noPrompts,
  correct,
  skipped,
  duration,
  isTimerRunning,
  feedbackFlash,
  soundEnabled,
  onToggleSound,
  onTimeUp,
  onSkip,
  onCorrect,
  onEndGame,
}: RoundScreenProps) {
  const category = prompt ? getCategoryById(prompt.categoryId) : null;
  const flashClass =
    feedbackFlash === 'correct'
      ? 'animate-correct-flash'
      : feedbackFlash === 'skip'
        ? 'animate-wrong-flash'
        : '';

  return (
    <div
      className={`flex-1 flex flex-col px-5 py-4 safe-area-top safe-area-bottom max-w-lg mx-auto w-full transition-colors duration-200 ${flashClass}`}
    >
      <header className="flex items-start justify-between gap-4 mb-2">
        <div className="min-w-0">
          <p className="text-label text-foreground-faint truncate">{teamName}</p>
          <p className="text-[2.25rem] font-extrabold text-primary score-glow leading-tight">
            {teamScore}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-label text-foreground-faint">
            Round {roundNumber}/{totalRounds}
            {teamCount > 1 ? ` · Turn ${turnNumber}/${teamCount}` : ''}
          </p>
          <p className="mt-1 text-caption">
            <span className="text-success font-bold">{'\u2713'} {correct}</span>
            <span className="text-foreground-faint"> · </span>
            <span className="text-danger font-bold">{'\u2715'} {skipped}</span>
          </p>
        </div>
      </header>

      <div className="flex justify-center my-2">
        <Timer
          duration={duration}
          isRunning={isTimerRunning}
          onTimeUp={onTimeUp}
        />
      </div>

{/* The word, or an explicit empty state when the selection is used up */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[180px] px-1">
        {prompt ? (
          <div
            key={prompt.id}
            className="glass-card-lg p-5 sm:p-7 w-full text-center animate-scale-in animate-glow-pulse"
          >
            {category && (
              <p className="flex items-center justify-center gap-1.5 mb-3">
                <span aria-hidden="true" className="text-sm">
                  {category.icon}
                </span>
                <span className="text-label text-foreground-faint">
                  {category.name}
                </span>
              </p>
            )}

            <p className="text-[3rem] sm:text-[5.5rem] font-extrabold leading-[1.0] prompt-text tracking-tight gradient-text">
              {prompt.answer}
            </p>

            {prompt.forbiddenWords && prompt.forbiddenWords.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-label text-danger mb-2">DON&apos;T SAY</p>
                <ul className="flex flex-wrap justify-center gap-1.5">
                  {prompt.forbiddenWords.map((word) => (
                    <li
                      key={word}
                      className="px-3 py-1 rounded-lg bg-danger-muted text-danger text-caption font-semibold"
                    >
                      {word}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card-lg p-6 w-full text-center">
            {noPrompts ? (
              <>
                <p className="text-body font-semibold mb-1">
                  No more prompts left
                </p>
                <p className="text-caption text-foreground-muted">
                  Every prompt in this selection has been played. End the round,
                  or go back and pick more categories.
                </p>
              </>
            ) : (
              <div
                role="status"
                aria-label="Loading prompt"
                className="animate-shimmer h-12 rounded-xl mx-auto w-48"
              />
            )}
          </div>
        )}
      </div>

      {/* Answer buttons */}
      <div className="flex gap-3 mt-4 pb-1">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 py-7 sm:py-8 rounded-2xl bg-danger text-white text-2xl font-extrabold shadow-lg shadow-danger/25 active:scale-[0.97] transition-all touch-manipulation"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={onCorrect}
          className="flex-1 py-7 sm:py-8 rounded-2xl bg-success text-white text-2xl font-extrabold shadow-lg shadow-success/25 active:scale-[0.97] transition-all touch-manipulation"
        >
          Correct
        </button>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          className="flex items-center gap-1.5 text-foreground-faint hover:text-foreground text-caption transition-colors py-2 px-1"
        >
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
        <button
          type="button"
          onClick={onEndGame}
          className="flex items-center gap-1.5 text-foreground-faint hover:text-danger text-caption transition-colors py-2 px-1"
        >
          End Game
        </button>
      </div>
    </div>
  );
}