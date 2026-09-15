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

  const handleNextRound = () => { dispatch({ type: 'NEXT_ROUND' }); router.push('/play'); };
  const handlePlayAgain = () => { dispatch({ type: 'NEW_GAME' }); router.push('/new-game'); };
  const handleGoHome = () => { dispatch({ type: 'NEW_GAME' }); router.push('/'); };

  if (isGameOver) {
    const total = state.roundScores.reduce((sum, rs) => sum + rs.correct, 0);
    const bestStreak = Math.max(...state.config.teams.map((t) => t.bestStreak), 0);

    return (
      <div className="flex-1 flex flex-col items-center px-6 py-8 max-w-md mx-auto w-full safe-area-top safe-area-bottom animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-accent/[0.06] blur-[100px]" />
          <div className="absolute bottom-[-15%] right-[-5%] w-[300px] h-[300px] rounded-full bg-primary/[0.05] blur-[80px]" />
        </div>

        <div className="relative z-10 text-center mb-8">
          <div className="text-[5rem] mb-4 animate-float">🏆</div>
          <h1 className="text-title mb-1 gradient-text">Game Over!</h1>
          <p className="text-body text-foreground-muted">Final results</p>
        </div>

        <div className="w-full mb-6 relative z-10">
          {rankedTeams.map((team, i) => (
            <Card key={team.id} padding="md" className={`mb-2 ${i === 0 ? 'ring-2 ring-accent/40 border-accent/20 animate-glow-pulse' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                  <div>
                    <h3 className="font-bold text-body">{team.name}</h3>
                    <p className="text-caption text-foreground-faint">Best streak: {team.bestStreak}</p>
                  </div>
                </div>
                <span className="text-[2rem] font-extrabold gradient-text">{team.score}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="w-full glass-card p-5 mb-8 relative z-10">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-[2.25rem] font-extrabold gradient-text leading-none">{total}</p>
              <p className="text-label text-foreground-faint mt-2">Correct Guesses</p>
            </div>
            <div>
              <p className="text-[2.25rem] font-extrabold gradient-text leading-none">{bestStreak}</p>
              <p className="text-label text-foreground-faint mt-2">Best Streak</p>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 mt-auto relative z-10">
          <Button fullWidth size="lg" onClick={handlePlayAgain} className="py-6 bg-gradient-to-r from-primary to-accent border-0 text-white font-bold shadow-lg shadow-primary/25">Play Again</Button>
          <Button fullWidth variant="ghost" onClick={handleGoHome}>Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-8 max-w-md mx-auto w-full safe-area-top safe-area-bottom animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-primary/[0.05] blur-[80px]" />
      </div>

      <div className="relative z-10 text-center mb-8">
        <h1 className="text-title mb-1 gradient-text">Round Complete</h1>
        <p className="text-body text-foreground-muted">Round {state.currentRound} of {state.config.totalRounds}</p>
      </div>

      <div className="w-full mb-6 relative z-10">
        {rankedTeams.map((team, i) => {
          const rs = state.roundScores.find((r) => r.teamId === team.id && r.roundNumber === state.currentRound);
          return (
            <Card key={team.id} padding="md" className={`mb-2 ${i === 0 ? 'ring-2 ring-primary/30 border-primary/15' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-body font-bold text-foreground-faint w-6">{i + 1}</span>
                  <div>
                    <h3 className="font-bold text-body">{team.name}</h3>
                    {rs && <p className="text-caption text-foreground-faint">+{rs.correct} correct this round</p>}
                  </div>
                </div>
                <span className="text-[1.5rem] font-extrabold gradient-text">{team.score}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {lastRoundScore && (
        <div className="w-full glass-card p-4 mb-6 relative z-10">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">This round</span>
            <span className="font-bold">{lastRoundScore.correct} correct, {lastRoundScore.skipped} skipped</span>
          </div>
        </div>
      )}

      <div className="w-full mt-auto relative z-10">
        <Button fullWidth size="lg" onClick={handleNextRound} className="py-6 bg-gradient-to-r from-primary to-accent border-0 text-white font-bold shadow-lg shadow-primary/25">
          {state.currentRound >= state.config.totalRounds ? 'See Final Results' : 'Next Round'}
        </Button>
      </div>
    </div>
  );
}
