import { useMemo } from 'react';
import type { Character } from '../../characterTypes';
import {
  ERAS,
  type CharacterFilters,
  bookGroupOf,
  characters,
  formatYearRange,
  homeBook,
  isFiltering,
  lineage,
  matchesCharacter,
  twelveSons,
} from '../../lib/characters';

export type Arrangement = 'lifetime' | 'book';
export type Highlight = 'none' | 'lineage' | 'twelve';

export const MIN_YEAR = ERAS[0].from;
export const MAX_YEAR = ERAS[ERAS.length - 1].to;

export const humans = characters.filter((c) => c.kind === 'human');
export const spirits = characters.filter((c) => c.kind === 'spiritual');
export const SON_IDS = twelveSons.map((s) => s.id);

export const ERA_SHORT: Record<string, string> = {
  'Creation & Patriarchs': 'Patriarchs',
  'Exodus & Wilderness': 'Exodus',
  Judges: 'Judges',
  'United & Divided Kingdom': 'Kingdom',
  'Exile & Return': 'Exile',
  Intertestamental: 'Between',
  Gospels: 'Gospels',
  'Early Church': 'Church',
};

export interface Group {
  key: string;
  label: string;
  sub: string;
  members: Character[];
  start: number;
  end: number;
}

const byStart = (a: Character, b: Character) =>
  a.dates.start - b.dates.start || b.prominenceScore - a.prominenceScore;

function makeGroup(key: string, label: string, members: Character[], sub?: string): Group {
  const start = Math.min(...members.map((m) => m.dates.start));
  const end = Math.max(...members.map((m) => m.dates.end));
  return { key, label, members: [...members].sort(byStart), start, end, sub: sub ?? formatYearRange(start, end) };
}

/** Group people by era (in era order) or by "home" book (ordered by the median date of their people). */
export function groupPeople(people: Character[], by: 'era' | 'book'): Group[] {
  if (by === 'era') {
    return ERAS.map((e) => ({ e, members: people.filter((p) => p.era === e.id) }))
      .filter((g) => g.members.length)
      .map(({ e, members }) => makeGroup(e.id, e.id, members, e.dates));
  }
  const map = new Map<string, Character[]>();
  for (const p of people) {
    const g = homeBook[p.id];
    map.set(g, [...(map.get(g) ?? []), p]);
  }
  const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  return [...map.entries()]
    .map(([book, members]) => ({ g: makeGroup(book, book, members), m: median(members.map((x) => x.dates.start)) }))
    .sort((a, b) => a.m - b.m)
    .map((x) => x.g);
}

export const LINEAGE_SET = new Set(lineage);
export const TWELVE_SET = new Set(['jacob', ...SON_IDS, ...twelveSons.map((s) => s.mother)]);

/**
 * Which people/spirits are shown, and the time window the axis should cover.
 * Filters and highlights (Line of Jesus, 12 sons) both narrow the set and the axis.
 */
export function useTimelineModel(filters: CharacterFilters, showOthers: boolean, highlight: Highlight) {
  return useMemo(() => {
    const hl = highlight === 'lineage' ? LINEAGE_SET : highlight === 'twelve' ? TWELVE_SET : null;
    const filtering = isFiltering(filters) || !!hl;
    const matchSet = new Set(
      characters.filter((c) => matchesCharacter(c, filters) && (!hl || hl.has(c.id))).map((c) => c.id),
    );
    const hide = filtering && !showOthers;
    const people = hide ? humans.filter((c) => matchSet.has(c.id)) : humans;
    const spiritsShown = hide ? spirits.filter((c) => matchSet.has(c.id)) : spirits;

    // "Filter the length": fit the axis to the people that remain.
    let lo = MIN_YEAR;
    let hi = MAX_YEAR;
    if (hide && people.length) {
      lo = Math.min(...people.map((p) => p.dates.start));
      hi = Math.max(...people.map((p) => p.dates.end));
      const pad = Math.max((hi - lo) * 0.04, 3);
      lo = Math.max(MIN_YEAR, Math.floor(lo - pad));
      hi = Math.min(MAX_YEAR, Math.ceil(hi + pad));
    }
    return { filtering, matchSet, people, spiritsShown, lo, hi, hide };
  }, [filters, showOthers, highlight]);
}

export interface Segment {
  id: string;
  label: string;
  short: string;
  dates: string;
  from: number;
  to: number;
  x0: number;
  x1: number;
}

/**
 * Piecewise-linear axis over [lo, hi]. Each era's width follows how many of the shown people
 * are alive at once in it (peak overlap), so crowded periods such as the early church get room
 * and sparse ones shrink — fewer stacked rows, less scrolling.
 */
export function makeScale(width: number, lo: number, hi: number, people: Character[]) {
  const parts = ERAS.map((e) => {
    const from = Math.max(e.from, lo);
    const to = Math.min(e.to, hi);
    if (to <= from) return { e, from, to, w: 0 };
    const step = Math.max(1, (to - from) / 80);
    let peak = 0;
    for (let y = from; y <= to; y += step) {
      let n = 0;
      for (const p of people) if (p.dates.start <= y && p.dates.end >= y) n++;
      peak = Math.max(peak, n);
    }
    const fraction = (to - from) / (e.to - e.from);
    return { e, from, to, w: Math.pow(Math.max(peak, 1), 0.8) * (0.4 + 0.6 * fraction) };
  }).filter((p) => p.w > 0);
  const total = parts.reduce((n, p) => n + p.w, 0) || 1;
  let x = 0;
  const segs: Segment[] = parts.map((p) => {
    const w = (p.w / total) * width;
    const s = { id: p.e.id, label: p.e.id, short: ERA_SHORT[p.e.id], dates: p.e.dates, from: p.from, to: p.to, x0: x, x1: x + w };
    x += w;
    return s;
  });
  const xOf = (year: number) => {
    const y = Math.min(Math.max(year, lo), hi);
    const s = segs.find((g) => y <= g.to) ?? segs[segs.length - 1];
    return s.x0 + ((y - s.from) / (s.to - s.from || 1)) * (s.x1 - s.x0);
  };
  const yearOf = (px: number) => {
    const s = segs.find((g) => px <= g.x1) ?? segs[segs.length - 1];
    return Math.round(s.from + ((px - s.x0) / (s.x1 - s.x0 || 1)) * (s.to - s.from));
  };
  const ticks: { year: number; x: number }[] = [];
  for (const s of segs) {
    const pxPerYear = (s.x1 - s.x0) / (s.to - s.from || 1);
    const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find((c) => c * pxPerYear >= 72) ?? 1000;
    for (let y = Math.ceil(s.from / step) * step; y <= s.to; y += step) {
      const tx = xOf(y);
      // Keep labels clear of era boundaries and the edges so none are clipped.
      if (tx - s.x0 < 30 || s.x1 - tx < 30) continue;
      if (y === 0) continue;
      ticks.push({ year: y, x: tx });
    }
  }
  return { segs, width, xOf, yearOf, ticks };
}

export const fmtYear = (y: number) => (y < 0 ? `${-y} BC` : `AD ${y}`);

export { bookGroupOf };
