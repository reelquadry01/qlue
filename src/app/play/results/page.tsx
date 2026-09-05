'use client';

import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { getTeamRankings } from '@/engine/scoring';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ResultsPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();

  const isGameOver = state.status === 'FINAL_RESULTS';
  const rankedTeams = getTeamRankings(state.config.teams);
  const lastRoundScore = state.roundScores[state.roundScores.length - 1];

  const handleNextRound = () => {
    dispatch({ type: 'NEXT_ROUND' });
    router.push('/play');
  };

  const handlePlayAgain = () => {
    dispatch({ type: 'NEW_GAME' });
    router.push('/new-game');
  };

  const handleGoHome = () => {
    dispatch({ type: 'NEW_GAME' });
    router.push('/');
  };

  // Final Results
  if (isGameOver) {
    const totalWordsGuessed = state.roundScores.reduce(
      (sum, rs) => sum + rs.correct,
      0
    );
    const bestStreak = Math.max(
      ...state.config.teams.map((t) => t.bestStreak),
      0
    );

    return (
      <div className="flex-1 flex flex-col items-center px-6 py-8 max-w-md mx-auto w-full safe-area-top safe-area-bottom animate-fade-in">
        {/* Trophy */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-float">🏆</div>
          <h1 className="text-title mb-1">Game Over!</h1>
          <p className="text-body text-foreground-muted">Final results</p>
        </div>

        {/* Rankings */}
        <div className="w-full mb-6">
          {rankedTeams.map((team, index) => (
            <Card
              key={team.id}
              padding="md"
              className={`mb-2 ${index === 0 ? 'ring-2 ring-warning/50 border-warning/20' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <div>
                    <h3 className="font-semibold text-body">{team.name}</h3>
                    <p className="text-caption text-foreground-faint">
                      Best streak: {team.bestStreak}
                    </p>
                  </div>
                </div>
                <span className="text-title">{team.score}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="w-full glass-card p-5 mb-8">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-[2rem] font-bold text-primary-light leading-none">{totalWordsGuessed}</p>
              <p className="text-label text-foreground-faint mt-2">Correct Guesses</p>
            </div>
            <div>
              <p className="text-[2rem] font-bold text-warning leading-none">{bestStreak}</p>
              <p className="text-label text-foreground-faint mt-2">Best Streak</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3 mt-auto">
          <Button fullWidth size="lg" onClick={handlePlayAgain}>
            Play Again
          </Button>
          <Button fullWidth variant="ghost" onClick={handleGoHome}>
            Home
          </Button>
        </div>
      </div>
    );
  }

  // Round Results
  return (
    <div className="flex-1 flex flex-col items-center px-6 py-8 max-w-md mx-auto w-full safe-area-top safe-area-bottom animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-title mb-1">Round Complete</h1>
        <p className="text-body text-foreground-muted">
          Round {state.currentRound} of {state.config.totalRounds}
        </p>
      </div>

      {/* All team scores */}
      <div className="w-full mb-6">
        {rankedTeams.map((team, index) => {
          const roundScore = state.roundScores.find(
            (rs) => rs.teamId === team.id && rs.roundNumber === state.currentRound
          );
          return (
            <Card
              key={team.id}
              padding="md"
              className={`mb-2 ${index === 0 ? 'ring-2 ring-primary/30 border-primary/20' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-body font-bold text-foreground-faint w-6">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-body">{team.name}</h3>
                    {roundScore && (
                      <p className="text-caption text-foreground-faint">
                        +{roundScore.correct} correct this round
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-heading">{team.score}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Round stats */}
      {lastRoundScore && (
        <div className="w-full glass-card p-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">This round</span>
            <span className="font-medium">
              {lastRoundScore.correct} correct, {lastRoundScore.skipped} skipped
            </span>
          </div>
        </div>
      )}

      <div className="w-full mt-auto">
        <Button fullWidth size="lg" onClick={handleNextRound}>
          {state.currentRound >= state.config.totalRounds
            ? 'See Final Results'
            : 'Next Round'}
        </Button>
      </div>
    </div>
  );
}
