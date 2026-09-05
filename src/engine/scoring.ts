import { Team, ScoringRule, DEFAULT_SCORING } from './types';

export function applyCorrectScore(
  team: Team,
  rule: ScoringRule = DEFAULT_SCORING
): Team {
  const newStreak = team.streak + 1;
  let bonus = 0;

  if (rule.streakBonuses) {
    for (const streakBonus of rule.streakBonuses) {
      if (newStreak === streakBonus.at) {
        bonus = streakBonus.bonus;
        break;
      }
    }
  }

  return {
    ...team,
    score: team.score + rule.correct + bonus,
    streak: newStreak,
    bestStreak: Math.max(team.bestStreak, newStreak),
  };
}

export function applySkipScore(
  team: Team,
  rule: ScoringRule = DEFAULT_SCORING
): Team {
  return {
    ...team,
    score: team.score + rule.skip,
    streak: 0,
  };
}

export function getTeamRankings(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => b.score - a.score);
}

export function getWinner(teams: Team[]): Team | null {
  if (teams.length === 0) return null;
  const ranked = getTeamRankings(teams);
  return ranked[0];
}
