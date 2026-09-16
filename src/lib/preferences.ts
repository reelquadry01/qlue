/**
 * Player preferences that must survive a reload.
 *
 * Kept separate from the game state (`src/engine/persistence.ts`): preferences
 * outlive a single game and should not be cleared when a game ends.
 */
export interface Preferences {
  /** Play the built-in sound effects (score, skip, countdown, time-up). */
  soundEnabled: boolean;
}

export const PREFERENCES_STORAGE_KEY = 'qlue-preferences';

export const DEFAULT_PREFERENCES: Preferences = {
  soundEnabled: true,
};

export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return DEFAULT_PREFERENCES;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_PREFERENCES;
  }
  if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PREFERENCES;

  const candidate = parsed as Partial<Preferences>;
  return {
    soundEnabled:
      typeof candidate.soundEnabled === 'boolean'
        ? candidate.soundEnabled
        : DEFAULT_PREFERENCES.soundEnabled,
  };
}

export function serializePreferences(preferences: Preferences): string {
  return JSON.stringify(preferences);
}

export function readPreferences(): Preferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    return parsePreferences(window.localStorage.getItem(PREFERENCES_STORAGE_KEY));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function writePreferences(preferences: Preferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      serializePreferences(preferences)
    );
  } catch {
    // Storage can be unavailable (private mode, quota); the game still works,
    // the choice just does not persist.
  }
}