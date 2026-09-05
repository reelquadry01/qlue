'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { CategorySelection } from '@/engine/types';
import { CATEGORIES, getCategoryById } from '@/lib/categories';
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
    <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">
      <BackButton href="/new-game" />
      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold mb-1">Pick Categories</h1>
        <p className="text-foreground-muted text-sm">
          Choose what your team will be tested on
        </p>
      </div>

      <div className="flex flex-col gap-2 mb-6">
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
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-xs text-foreground-muted">
                    {promptCount} prompts
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-card-border'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-white"
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
                  <div className="flex items-center justify-between text-xs text-foreground-muted mb-1">
                    <span>Weight</span>
                    <span>{selection.weight}%</span>
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
                    className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-primary"
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
