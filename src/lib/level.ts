import { useSyncExternalStore } from 'react';

/**
 * How much the site shows: Beginner (new to the Bible), Explorer (some background) or Scholar (everything,
 * the full site). The choice is remembered, can be set by a link (?level=beginner), and every page reads it.
 */
export type Level = 'beginner' | 'explorer' | 'scholar';

export const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: 'beginner', label: 'Beginner', hint: 'Easy' },
  { id: 'explorer', label: 'Explorer', hint: 'Medium' },
  { id: 'scholar', label: 'Scholar', hint: 'Hard' },
];

const KEY = 'canon-level';
const EVENT = 'canon:level';
const RANK: Record<Level, number> = { beginner: 0, explorer: 1, scholar: 2 };
const isLevel = (v: unknown): v is Level => v === 'beginner' || v === 'explorer' || v === 'scholar';

// A link can set the level: ?level=beginner
try {
  const fromUrl = new URLSearchParams(window.location.search).get('level');
  if (isLevel(fromUrl)) localStorage.setItem(KEY, fromUrl);
} catch {
  /* storage unavailable */
}

const stored = (): Level | null => {
  try {
    const v = localStorage.getItem(KEY);
    return isLevel(v) ? v : null;
  } catch {
    return null;
  }
};

/** Has the visitor chosen a level yet? (The home page asks once.) */
export const hasChosenLevel = () => stored() !== null;

export function getLevel(): Level {
  return stored() ?? 'explorer';
}

export function setLevel(l: Level) {
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* storage unavailable: still switch for this visit */
    memo = l;
  }
  window.dispatchEvent(new Event(EVENT));
}
let memo: Level | null = null;

export function useLevel(): Level {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      window.addEventListener('storage', cb);
      return () => {
        window.removeEventListener(EVENT, cb);
        window.removeEventListener('storage', cb);
      };
    },
    () => memo ?? getLevel(),
    () => 'explorer',
  );
}

/** Is the current level at least `min`? */
export const atLeast = (level: Level, min: Level) => RANK[level] >= RANK[min];

/** Pick the wording for this level: Explorer falls back to Scholar's, Beginner to Explorer's. */
export function pick<T>(level: Level, v: { beginner?: T; explorer?: T; scholar: T }): T {
  if (level === 'scholar') return v.scholar;
  if (level === 'explorer') return v.explorer ?? v.scholar;
  return v.beginner ?? v.explorer ?? v.scholar;
}
