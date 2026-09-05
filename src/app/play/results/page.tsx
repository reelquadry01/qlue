'use client';

import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { getTeamRankings } from '@/engine/scoring';
import Button from '@/components/ui/Button';

export default function ResultsPage() {
  const { state, dispatch, getTeamById } = useGame();
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
    const winner = rankedTeams[0];
    const totalWordsGuessed = state.roundScores.reduce(
      (sum, rs) => sum + rs.correct,
      0
    );
    const bestStreak = Math.max(
      ...state.config.teams.map((t) => t.bestStreak),
      0
    );

    return (
      <div className="flex-1 flex flex-col items-center px-6 py-8 max-w-lg mx-auto w-full animate-fade-in">
        {/* Trophy */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold mb-1">Game Over!</h1>
        </div>

        {/* Rankings */}
        <div className="w-full mb-6">
          {rankedTeams.map((team, index) => (
            <div
              key={team.id}
              className={`glass-card p-4 mb-2 flex items-center justify-between ${
                index === 0 ? 'ring-2 ring-warning' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-foreground-muted w-8">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-xs text-foreground-muted">
                    Best streak: {team.bestStreak}
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold">{team.score}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="w-full glass-card p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-light">{totalWordsGuessed}</p>
              <p className="text-xs text-foreground-muted">Words Guessed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{bestStreak}</p>
              <p className="text-xs text-foreground-muted">Best Streak</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3 mt-auto">
          <Button fullWidth size="lg" onClick={handlePlayAgain}>
            Play Again
          </Button>
          <Button fullWidth variant="outline" onClick={handleGoHome}>
            New Game
          </Button>
        </div>
      </div>
    );
  }

  // Round Results
  return (
    <div className="flex-1 flex flex-col items-center px-6 py-8 max-w-lg mx-auto w-full animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">Round Complete</h1>
        <p className="text-foreground-muted">
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
            <div
              key={team.id}
              className={`glass-card p-4 mb-2 flex items-center justify-between ${
                index === 0 ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground-muted w-6">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  {roundScore && (
                    <p className="text-xs text-foreground-muted">
                      +{roundScore.correct} correct this round
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xl font-bold">{team.score}</span>
            </div>
          );
        })}
      </div>

      {/* Round stats */}
      {lastRoundScore && (
        <div className="w-full glass-card p-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">This round</span>
            <span>
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
