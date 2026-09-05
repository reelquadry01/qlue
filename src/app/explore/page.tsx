'use client';

import Card from '@/components/ui/Card';
import { CATEGORIES, getCategoryById } from '@/lib/categories';
import { getPromptCountByCategory } from '@/data/seed-content';

export default function ExplorePage() {
  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Explore Categories</h1>
        <p className="text-foreground-muted text-sm">
          Browse available categories and topics
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {CATEGORIES.map((category) => {
          const count = getPromptCountByCategory(category.id);
          return (
            <Card key={category.id}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{category.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-xs text-foreground-muted">
                    {count} prompts available
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
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
                <div className="flex flex-wrap gap-1">
                  {category.subcategories.map((sub) => (
                    <span
                      key={sub}
                      className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-foreground-muted"
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
        <p className="text-foreground-muted text-sm">
          More categories coming soon
        </p>
      </div>
    </div>
  );
}
