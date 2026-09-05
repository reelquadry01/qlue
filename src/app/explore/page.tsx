'use client';

import Card from '@/components/ui/Card';
import { CATEGORIES } from '@/lib/categories';
import { getPromptCountByCategory } from '@/data/seed-content';
import BackButton from '@/components/ui/BackButton';

export default function ExplorePage() {
  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full safe-area-top safe-area-bottom">
      <BackButton href="/" />
      <div className="mt-6 mb-8">
        <h1 className="text-title mb-1 text-balance">Explore Categories</h1>
        <p className="text-body text-foreground-muted">
          Browse available categories and topics
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {CATEGORIES.map((category) => {
          const count = getPromptCountByCategory(category.id);
          return (
            <Card key={category.id} padding="md">
              <div className="flex items-center gap-3">
                <span className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl bg-surface shrink-0">
                  {category.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-body">{category.name}</h3>
                  <p className="text-caption text-foreground-faint">
                    {count} prompts
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: category.color }}
                  >
                    {count}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-card-border">
                <div className="flex flex-wrap gap-1.5">
                  {category.subcategories.map((sub) => (
                    <span
                      key={sub}
                      className="text-caption px-2.5 py-1 rounded-full bg-surface text-foreground-muted"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-caption text-foreground-faint">
          More categories coming soon
        </p>
      </div>
    </div>
  );
}
