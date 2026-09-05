'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { CategorySelection } from '@/engine/types';
import { CATEGORIES } from '@/lib/categories';
import { getPromptCountByCategory } from '@/data/seed-content';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import BackButton from '@/components/ui/BackButton';

export default function CategoriesPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();

  const [selected, setSelected] = useState<CategorySelection[]>(
    state.config.categories.length > 0
      ? state.config.categories
      : CATEGORIES.map((c) => ({ categoryId: c.id, weight: 50 }))
  );

  const toggleCategory = (categoryId: string) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.categoryId === categoryId);
      if (exists) {
        return prev.filter((s) => s.categoryId !== categoryId);
      }
      return [...prev, { categoryId, weight: 50 }];
    });
  };

  const updateWeight = (categoryId: string, weight: number) => {
    setSelected((prev) =>
      prev.map((s) => (s.categoryId === categoryId ? { ...s, weight } : s))
    );
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    dispatch({ type: 'SET_CATEGORIES', categories: selected });
    router.push('/new-game/settings');
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full safe-area-top safe-area-bottom">
      <BackButton href="/new-game" />
      <div className="mt-6 mb-8">
        <h1 className="text-title mb-1 text-balance">Pick Categories</h1>
        <p className="text-body text-foreground-muted">
          Choose what your team will be tested on
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {CATEGORIES.map((category) => {
          const isSelected = selected.some((s) => s.categoryId === category.id);
          const selection = selected.find((s) => s.categoryId === category.id);
          const promptCount = getPromptCountByCategory(category.id);

          return (
            <Card
              key={category.id}
              hover
              active={isSelected}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-surface">
                  {category.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-body">{category.name}</h3>
                  <p className="text-label text-foreground-faint">
                    {promptCount} prompts
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-card-border'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {isSelected && selection && (
                <div className="mt-3 pt-3 border-t border-card-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-label text-foreground-faint">Frequency</span>
                    <span className="text-caption text-foreground-muted font-semibold">{selection.weight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={selection.weight}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateWeight(category.id, Number(e.target.value));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-1.5 rounded-full appearance-none bg-surface-light accent-primary cursor-pointer"
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-auto">
        <Button
          fullWidth
          size="lg"
          disabled={selected.length === 0}
          onClick={handleContinue}
        >
          Continue ({selected.length} selected)
        </Button>
      </div>
    </div>
  );
}
