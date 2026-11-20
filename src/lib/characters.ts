import data from '../data/biblicalCharacters.json';
import type {
  Character,
  CharacterMeta,
  Edge,
  Era,
  RelType,
  Role,
} from '../characterTypes';

export const characters = data.characters as Character[];
export const characterMeta = data.meta as CharacterMeta;
export const characterById: Record<string, Character> = Object.fromEntries(
  characters.map((c) => [c.id, c]),
);

export const ROLES: { id: Role; css: string; short: string }[] = [
  { id: 'Patriarch/Matriarch', css: '--role-patriarch', short: 'Patriarchs' },
  { id: 'Judge', css: '--role-judge', short: 'Judges' },
  { id: 'King/Ruler', css: '--role-king', short: 'Kings & Rulers' },
  { id: 'Prophet', css: '--role-prophet', short: 'Prophets' },
  { id: 'Priest', css: '--role-priest', short: 'Priests' },
  { id: 'Apostle/Disciple', css: '--role-apostle', short: 'Apostles & Disciples' },
  { id: 'Key Figure', css: '--role-key', short: 'Key Figures' },
];

/**
 * Eras with the year bounds used by the timeline (Theographic / Ussher-based chronology)
 * and a relative width weight for the piecewise time axis.
 */
export const ERAS: {
  id: Era;
  dates: string;
  testament: 'Old' | 'New';
  from: number;
  to: number;
  weight: number;
}[] = [
  { id: 'Creation & Patriarchs', dates: 'Creation – c. 1600 BC', testament: 'Old', from: -4004, to: -1600, weight: 2.4 },
  { id: 'Exodus & Wilderness', dates: 'c. 1600–1400 BC', testament: 'Old', from: -1600, to: -1400, weight: 1.3 },
  { id: 'Judges', dates: 'c. 1400–1080 BC', testament: 'Old', from: -1400, to: -1080, weight: 1.2 },
  { id: 'United & Divided Kingdom', dates: 'c. 1080–586 BC', testament: 'Old', from: -1080, to: -586, weight: 2.8 },
  { id: 'Exile & Return', dates: '586–400 BC', testament: 'Old', from: -586, to: -400, weight: 1.6 },
  { id: 'Intertestamental', dates: '400–5 BC', testament: 'Old', from: -400, to: -5, weight: 0.9 },
  { id: 'Gospels', dates: 'c. 5 BC – AD 33', testament: 'New', from: -5, to: 33, weight: 1.4 },
  { id: 'Early Church', dates: 'AD 33–100', testament: 'New', from: 33, to: 100, weight: 1.6 },
];

export const lineage = data.lineage as string[];

/** The twelve sons of Jacob in birth order, with their mothers. */
export const twelveSons = data.twelveSons as { id: string; mother: string }[];

export const PRECISION_LABEL: Record<string, string> = {
  lifespan: 'Birth & death years',
  birth: 'Birth year known; end approximate',
  death: 'Death year known; start approximate',
  attested: 'Years of the verses they appear in',
  estimated: 'Estimated (by generation or editorially)',
  appearances: 'Narrative appearances',
};

export function formatYearRange(start: number, end: number): string {
  const y = (n: number) => (n < 0 ? `${-n}` : `${n}`);
  if (start === end) return start < 0 ? `${-start} BC` : `AD ${start}`;
  if (start < 0 && end < 0) return `${y(start)}–${y(end)} BC`;
  if (start >= 0) return `AD ${start}–${end}`;
  return `${-start} BC – AD ${end}`;
}
export const ERA_INDEX: Record<Era, number> = Object.fromEntries(
  ERAS.map((e, i) => [e.id, i]),
) as Record<Era, number>;

export const REL_TYPES: { id: RelType; css: string; dash: number[] | null }[] = [
  { id: 'Family', css: '--rel-family', dash: null },
  { id: 'Mentor/Disciple', css: '--rel-mentor', dash: null },
  { id: 'Ally/Companion', css: '--rel-ally', dash: null },
  { id: 'Rival/Adversary', css: '--rel-rival', dash: [3, 2] },
];

export const roleCss = (r: Role) => ROLES.find((x) => x.id === r)!.css;
export const relCss = (t: RelType) => REL_TYPES.find((x) => x.id === t)!.css;
export const cssColor = (v: string, alpha = 1) => `rgb(var(${v}) / ${alpha})`;

export const edges: Edge[] = characters.flatMap((c) =>
  c.relationships.map((r) => ({ ...r, sourceId: c.id, key: `${c.id}>${r.targetId}>${r.label}` })),
);

/** Undirected 1st-degree neighbourhoods. */
export const neighbors: Record<string, Set<string>> = (() => {
  const m: Record<string, Set<string>> = Object.fromEntries(characters.map((c) => [c.id, new Set<string>()]));
  for (const e of edges) {
    m[e.sourceId].add(e.targetId);
    m[e.targetId].add(e.sourceId);
  }
  return m;
})();

/** Edges touching a character, outgoing first. */
export function edgesFor(id: string): { edge: Edge; otherId: string; outgoing: boolean }[] {
  return [
    ...edges.filter((e) => e.sourceId === id).map((edge) => ({ edge, otherId: edge.targetId, outgoing: true })),
    ...edges.filter((e) => e.targetId === id).map((edge) => ({ edge, otherId: edge.sourceId, outgoing: false })),
  ];
}

export type TestamentFilter = 'Old' | 'New' | null;

export interface CharacterFilters {
  testament: TestamentFilter;
  book: string | null;
  era: Era | null;
  role: Role | null;
  query: string;
}

export const EMPTY_FILTERS: CharacterFilters = { testament: null, book: null, era: null, role: null, query: '' };

/** Eras whose people "belong" to each testament (Intertestamental sits between and is in neither). */
export const TESTAMENT_ERAS: Record<'Old' | 'New', Era[]> = {
  Old: ['Creation & Patriarchs', 'Exodus & Wilderness', 'Judges', 'United & Divided Kingdom', 'Exile & Return'],
  New: ['Gospels', 'Early Church'],
};

export function matchesCharacter(c: Character, f: CharacterFilters): boolean {
  if (f.testament && !TESTAMENT_ERAS[f.testament].includes(c.era)) return false;
  if (f.book && !c.books.some((b) => b.book === f.book)) return false;
  if (f.era && c.era !== f.era) return false;
  if (f.role && c.role !== f.role) return false;
  const q = f.query.trim().toLowerCase();
  if (q && !`${c.name} ${c.title}`.toLowerCase().includes(q)) return false;
  return true;
}

export function isFiltering(f: CharacterFilters): boolean {
  return !!(f.testament || f.book || f.era || f.role || f.query.trim());
}

// ── Book grouping ("time of the books") ──
// Books that tell one continuous story are grouped: Ezra–Nehemiah was a single book in the
// Hebrew Bible, Samuel/Kings/Chronicles were each split in two, and the Gospels cover one period.
const BOOK_GROUP: Record<string, string> = {
  '1 Samuel': '1–2 Samuel',
  '2 Samuel': '1–2 Samuel',
  '1 Kings': '1–2 Kings',
  '2 Kings': '1–2 Kings',
  '1 Chronicles': '1–2 Chronicles',
  '2 Chronicles': '1–2 Chronicles',
  Ezra: 'Ezra–Nehemiah',
  Nehemiah: 'Ezra–Nehemiah',
  Matthew: 'Gospels',
  Mark: 'Gospels',
  Luke: 'Gospels',
  John: 'Gospels',
};
export const bookGroupOf = (book: string) => BOOK_GROUP[book] ?? book;

/**
 * The book (group) a character features in most: their "home" book. Only books of the
 * character's own testament count (so Ram is placed with Ruth/Chronicles, not with the
 * Gospel genealogies that merely list him); Luke-only Cainan falls back to Genesis.
 */
export const homeBook: Record<string, string> = Object.fromEntries(
  characters.map((c) => {
    const ntPerson = c.era === 'Gospels' || c.era === 'Early Church' || c.era === 'Intertestamental';
    const own = c.books.filter((b) => (ntPerson ? b.order >= 40 : b.order <= 39));
    if (!own.length && !ntPerson) return [c.id, 'Genesis'];
    const totals = new Map<string, { verses: number; order: number }>();
    for (const b of own.length ? own : c.books) {
      const g = bookGroupOf(b.book);
      const t = totals.get(g) ?? { verses: 0, order: b.order };
      t.verses += b.verses;
      t.order = Math.min(t.order, b.order);
      totals.set(g, t);
    }
    const best = [...totals.entries()].sort((a, b) => b[1].verses - a[1].verses || a[1].order - b[1].order)[0];
    return [c.id, best ? best[0] : 'Unknown'];
  }),
);

/** Node radius in graph units. */
export const nodeRadius = (c: Character) => 3 + (c.prominenceScore / 100) * 11;
