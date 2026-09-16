'use client';

import { useSyncExternalStore } from 'react';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  Preferences,
  readPreferences,
  writePreferences,
} from '@/lib/preferences';

/**
 * Tiny external store so every screen sees the same preferences and the values
 * stay in sync when another tab changes them.
 */
let cached: Preferences | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Preferences {
  if (cached === null) cached = readPreferences();
  return cached;
}

// Rendered on the server as well, so it must never touch `window`.
function getServerSnapshot(): Preferences {
  return DEFAULT_PREFERENCES;
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === PREFERENCES_STORAGE_KEY) {
      cached = readPreferences();
      notify();
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

/** Merge a partial update into the stored preferences and re-render consumers. */
export function setPreferences(patch: Partial<Preferences>): void {
  const next = { ...getSnapshot(), ...patch };
  cached = next;
  writePreferences(next);
  notify();
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}