'use client';

import Card from '@/components/ui/Card';
import PageShell from '@/components/ui/PageShell';
import { CATEGORIES } from '@/lib/categories';
import { getPromptCountByCategory } from '@/data/seed-content';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';

export default function ExplorePage() {
  const { dispatch } = useGame();
  const router = useRouter();

  const startWithCategory = (categoryId: string) => {
    dispatch({ type: 'PRESELECT_CATEGORY', categoryId });
    router.push('/new-game');
  };

  return (
    <PageShell
      title="Explore Categories"
      subtitle="Browse what's in the game, then jump straight into setup"
      backHref="/"
      width="lg"
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map((category) => {
          const count = getPromptCountByCategory(category.id);
          return (
            <li key={category.id} className="h-full">
              <Card className="h-full flex flex-col">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl bg-surface shrink-0"
                  >
                    {category.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-body">{category.name}</h2>
                    <p className="text-label text-foreground-faint">{count} prompts</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <ul className="flex flex-wrap gap-1.5" aria-label={`${category.name} topics`}>
                    {category.subcategories.map((sub) => (
                      <li
                        key={sub}
                        className="text-caption px-2.5 py-1 rounded-lg bg-surface text-foreground-muted"
                      >
                        {sub}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => startWithCategory(category.id)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-surface text-foreground-muted hover:text-foreground hover:bg-surface-light transition-colors text-sm font-semibold touch-manipulation"
                >
                  Start with this category
                </button>
              </Card>
            </li>
          );
        })}
      </ul>

      <p className="text-caption text-foreground-faint text-center mt-8">
        More categories coming soon
      </p>
    </PageShell>
  );
}