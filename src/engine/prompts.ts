import { Prompt, CategorySelection, Difficulty } from './types';

export function selectPrompts(
  allPrompts: Prompt[],
  categories: CategorySelection[],
  difficulty: Difficulty,
  count: number,
  usedIds: string[] = []
): Prompt[] {
  let filtered = allPrompts.filter((p) => {
    const categoryMatch = categories.some((c) => c.categoryId === p.categoryId);
    const difficultyMatch =
      difficulty === 'mixed' || p.difficulty === difficulty;
    return categoryMatch && difficultyMatch;
  });

  const unused = filtered.filter((p) => !usedIds.includes(p.id));

  if (unused.length === 0) {
    unused.push(
      ...filtered.filter((p) => usedIds.includes(p.id))
    );
  }

  const weighted: Prompt[] = [];
  for (const prompt of unused) {
    const catSelection = categories.find(
      (c) => c.categoryId === prompt.categoryId
    );
    const weight = catSelection?.weight ?? 50;
    const copies = Math.max(1, Math.round(weight / 20));
    for (let i = 0; i < copies; i++) {
      weighted.push(prompt);
    }
  }

  const shuffled = shuffleArray(weighted);
  const selected: Prompt[] = [];
  const seenIds = new Set<string>();

  for (const prompt of shuffled) {
    if (selected.length >= count) break;
    if (!seenIds.has(prompt.id)) {
      seenIds.add(prompt.id);
      selected.push(prompt);
    }
  }

  return selected;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getNextPrompt(
  allPrompts: Prompt[],
  categories: CategorySelection[],
  difficulty: Difficulty,
  usedIds: string[]
): Prompt | null {
  const available = selectPrompts(
    allPrompts,
    categories,
    difficulty,
    1,
    usedIds
  );
  return available.length > 0 ? available[0] : null;
}
