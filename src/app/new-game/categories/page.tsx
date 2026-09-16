'use client';

import { useMemo, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { CategorySelection } from '@/engine/types';
import { CATEGORIES } from '@/lib/categories';
import { getPromptCountByCategory } from '@/data/seed-content';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PageShell from '@/components/ui/PageShell';

export default function CategoriesPage() {
  const { state, dispatch } = useGame();
  const router = useRouter();

  const [selected, setSelected] = useState<CategorySelection[]>(
    state.config.categories.length > 0
      ? state.config.categories
      : CATEGORIES.map((category) => ({ categoryId: category.id, weight: 50 }))
  );

  const totalPrompts = useMemo(
    () =>
      selected.reduce(
        (sum, selection) => sum + getPromptCountByCategory(selection.categoryId),
        0
      ),
    [selected]
  );

  const toggleCategory = (categoryId: string) => {
    setSelected((prev) => {
      if (prev.some((selection) => selection.categoryId === categoryId)) {
        return prev.filter((selection) => selection.categoryId !== categoryId);
      }
      return [...prev, { categoryId, weight: 50 }];
    });
  };

  const updateWeight = (categoryId: string, weight: number) => {
    setSelected((prev) =>
      prev.map((selection) =>
        selection.categoryId === categoryId ? { ...selection, weight } : selection
      )
    );
  };

  const selectAll = () =>
    setSelected(CATEGORIES.map((category) => ({ categoryId: category.id, weight: 50 })));
  const selectNone = () => setSelected([]);

  const continueToSettings = () => {
    dispatch({ type: 'SET_CATEGORIES', categories: selected });
    router.push('/new-game/settings');
  };

  return (
    <PageShell
      title="Pick Categories"
      subtitle="Choose what your team will be tested on"
      backHref="/new-game"
      width="lg"
      footer={
        <div className="flex flex-col gap-2">
          <p className="text-caption text-foreground-muted text-center">
            {totalPrompts} prompts in play
          </p>
          <Button fullWidth size="lg" disabled={selected.length === 0} onClick={continueToSettings}>
            Continue ({selected.length} selected)
          </Button>
        </div>
      }
    >
      <div className="flex gap-2 mb-5">
        <Button variant="ghost" size="sm" onClick={selectAll}>
          Select all
        </Button>
        <Button variant="ghost" size="sm" onClick={selectNone}>
          Clear
        </Button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 mb-6">
        {CATEGORIES.map((category) => {
          const selection = selected.find((s) => s.categoryId === category.id);
          const isSelected = selection !== undefined;
          const count = getPromptCountByCategory(category.id);
          const sliderId = `frequency-${category.id}`;

          return (
            <li key={category.id}>
              <Card active={isSelected} className="h-full" hover={false}>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="text-2xl w-11 h-11 flex items-center justify-center rounded-xl bg-surface shrink-0"
                  >
                    {category.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-body">{category.name}</h2>
                    <p className="text-label text-foreground-faint">{count} prompts</p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? 'Remove' : 'Add'} ${category.name}`}
                    onClick={() => toggleCategory(category.id)}
                    className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 touch-manipulation ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    {isSelected && (
                      <svg aria-hidden="true" className="w-4 h-4 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>

                {isSelected && selection && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor={sliderId} className="text-label text-foreground-faint">
                        Frequency
                      </label>
                      <output htmlFor={sliderId} className="text-caption text-primary font-bold">
                        {selection.weight}%
                      </output>
                    </div>
                    <input
                      id={sliderId}
                      type="range"
                      min={10}
                      max={100}
                      step={10}
                      value={selection.weight}
                      onChange={(e) => updateWeight(category.id, Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none bg-surface-light accent-primary cursor-pointer"
                    />
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}