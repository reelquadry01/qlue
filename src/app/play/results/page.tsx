'use client';

import { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { getTeamRankings } from '@/engine/scoring';
import { isResultStatus } from '@/lib/routes';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PageShell from '@/components/ui/PageShell';

export default function ResultsPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const isGameOver = state.status === 'FINAL_RESULTS';
  const teams = state.config.teams;
  const rankedTeams = getTeamRankings(teams);
  const lastRoundScore = state.roundScores[state.roundScores.length - 1];

  // The results screen only makes sense right after a round or a game.
  useEffect(() => {
    if (!isResultStatus(state.status)) router.replace('/');
  }, [state.status, router]);

  const handleNextRound = () => {
    dispatch({ type: 'NEXT_ROUND' });
    router.push('/play');
  };
  const handlePlayAgain = () => {
    dispatch({ type: 'NEW_GAME' });
    router.push('/new-game');
  };
  const handleGoHome = () => {
    dispatch({ type: 'GO_HOME' });
    router.push('/');
  };

  if (isGameOver) {
    const total = state.roundScores.reduce((sum, rs) => sum + rs.correct, 0);
    const bestStreak = Math.max(0, ...teams.map((team) => team.bestStreak));

    return (
      <PageShell title="Game Over!" subtitle="Final results">
        <div className="relative z-10 text-center mb-8">
          <div aria-hidden="true" className="text-[5rem] mb-4 animate-float">
            🏆
          </div>
          <p className="text-body text-foreground-muted">
            {rankedTeams[0]?.name ?? 'No teams'} takes the crown
          </p>
        </div>

        <div className="w-full mb-6">
          {rankedTeams.map((team, index) => (
            <Card
              key={team.id}
              padding="md"
              className={`mb-2 ${index === 0 ? 'ring-2 ring-accent/40 border-accent/20 animate-glow-pulse' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-xl w-8 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <div>
                    <h3 className="font-bold text-body">
                      {team.name}
                      {index === 0 && (
                        <span className="sr-only-live"> (winner)</span>
                      )}
                    </h3>
                    <p className="text-caption text-foreground-faint">
                      Best streak: {team.bestStreak}
                    </p>
                  </div>
                </div>
                <span className="text-[2rem] font-extrabold gradient-text">
                  {team.score}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <dl className="w-full glass-card p-5 mb-8 grid grid-cols-2 gap-6 text-center">
          <div>
            <dd className="text-[2.25rem] font-extrabold gradient-text leading-none">
              {total}
            </dd>
            <dt className="text-label text-foreground-faint mt-2">
              Correct Guesses
            </dt>
          </div>
          <div>
            <dd className="text-[2.25rem] font-extrabold gradient-text leading-none">
              {bestStreak}
            </dd>
            <dt className="text-label text-foreground-faint mt-2">Best Streak</dt>
          </div>
        </dl>

        <div className="w-full flex flex-col gap-3 mt-auto relative z-10">
          <Button
            fullWidth
            size="lg"
            onClick={handlePlayAgain}
            className="py-6 bg-gradient-to-r from-primary to-accent border-0 text-white font-bold shadow-lg shadow-primary/25"
          >
            Play Again
          </Button>
          <Button fullWidth variant="ghost" onClick={handleGoHome}>
            Home
          </Button>
        </div>
      </PageShell>
    );
  }

  const teamCount = teams.length;
  const turnNumber = Math.min(state.currentTeamIndex + 1, Math.max(teamCount, 1));
  const nextTeam = teams[state.currentTeamIndex + 1];
  const isLastRound = state.currentRound >= state.config.totalRounds;
  const primaryLabel = nextTeam
    ? `Next Team · ${nextTeam.name}`
    : isLastRound
      ? 'See Final Results'
      : 'Next Round';

  return (
    <PageShell
      title="Round Complete"
      subtitle={`Round ${state.currentRound} of ${state.config.totalRounds}${teamCount > 1 ? ` · Turn ${turnNumber} of ${teamCount}` : ''}`}
    >
      <div className="w-full mb-6">
        {rankedTeams.map((team, index) => {
          const roundScore = state.roundScores.find(
            (score) =>
              score.teamId === team.id && score.roundNumber === state.currentRound
          );
          return (
            <Card
              key={team.id}
              padding="md"
              className={`mb-2 ${index === 0 ? 'ring-2 ring-primary/30 border-primary/15' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="text-body font-bold text-foreground-faint w-6"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-body">{team.name}</h3>
                    {roundScore && (
                      <p className="text-caption text-foreground-faint">
                        +{roundScore.correct} correct this round
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-[1.5rem] font-extrabold gradient-text">
                  {team.score}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {lastRoundScore && (
        <div className="w-full glass-card p-4 mb-6">
          <dl className="flex justify-between text-sm">
            <dt className="text-foreground-muted">This round</dt>
            <dd className="font-bold">
              {lastRoundScore.correct} correct, {lastRoundScore.skipped} skipped
            </dd>
          </dl>
        </div>
      )}

      <div className="w-full mt-auto relative z-10">
        <Button
          fullWidth
          size="lg"
          onClick={handleNextRound}
          className="py-6 bg-gradient-to-r from-primary to-accent border-0 text-white font-bold shadow-lg shadow-primary/25"
        >
          {primaryLabel}
        </Button>
      </div>
    </PageShell>
  );
}