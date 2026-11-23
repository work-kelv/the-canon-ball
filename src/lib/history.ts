import branchesData from '../data/churchBranches.json';
import creedsData from '../data/historicCreeds.json';
import comparisonData from '../data/theologicalComparison.json';
import translationsData from '../data/bibleTranslations.json';
import navigationData from '../data/textualNavigation.json';
import traditionsData from '../data/traditionsCompared.json';

export interface Branch {
  id: string;
  name: string;
  parentId: string | null;
  year: number;
  keyEvent: string;
  keyFigures: string[];
  distinctives: string[];
  sharedEssentials: string[];
}

export interface CreedClause {
  clauseText: string;
  scriptureReferences: string[];
  historicalContext: string;
  reliabilityNote?: string;
}

export interface Creed {
  id: string;
  name: string;
  date: string;
  origin: string;
  summary: string;
  reliabilityNote: string;
  clauses: CreedClause[];
}

export type Status = 'affirms' | 'partial' | 'differs';
export interface Position {
  status: Status;
  summary: string;
  differingClause?: string;
  keyTexts?: string[];
}
export interface Benchmark {
  id: string;
  name: string;
  orthodoxPosition: string;
  creedClause: string;
  scripture: string[];
}
export interface Group {
  id: string;
  name: string;
  family: 'historic' | 'divergent';
  origin: string;
  description: string;
  sources: string[];
  positions: Record<string, Position>;
}

export type Era = 'ancient' | 'reformation' | 'modern';
export type MilestoneKind = 'translation' | 'manuscript' | 'printing' | 'discovery' | 'statistics' | 'nav-manuscript' | 'nav-chapters' | 'nav-verses';
export interface Milestone {
  id: string;
  year: number;
  yearLabel: string;
  era: Era;
  kind: MilestoneKind;
  title: string;
  who: string;
  languages?: string;
  body: string;
  /** Extra badge when a translation milestone also marks a navigation change (Geneva 1560). */
  navigation?: MilestoneKind;
}

export const branches = branchesData.branches as Branch[];
export const branchMeta = branchesData.meta;
export const creeds = creedsData.creeds as Creed[];
export const creedMeta = creedsData.meta;
export const benchmarks = comparisonData.benchmarks as Benchmark[];
export const groups = comparisonData.groups as Group[];
export const comparisonMeta = comparisonData.meta;
export const translationStats = translationsData.meta.stats as { value: string; label: string }[];
export const translationMeta = translationsData.meta;
export const navigation = navigationData;

// ── Traditions compared & the creedal boundary ──
export interface Tradition {
  id: string;
  name: string;
  short: string;
  css: string;
  documents: string;
}
export interface Topic {
  id: string;
  name: string;
  question: string;
  left: string;
  right: string;
  note?: string;
  scripture: string[];
  positions: Record<string, { v: number; text: string }>;
}
export type TestId = 'trinity' | 'deity' | 'cross' | 'scripture' | 'grace';
export interface BoundaryTest {
  id: TestId;
  label: string;
  short: string;
  creed: string;
  ref: string;
}
export interface BoundaryGroup {
  id: string;
  ring: 'inside' | 'outside' | 'other';
  name: string;
  css: string;
  origin: string;
  self: string;
  why: string;
  affirms?: string;
  keyTexts?: string[];
  source?: string;
  /** Inside groups store a bare status; others store status + their own teaching. */
  tests: Record<TestId, Status | { s: Status; text: string }>;
}
export const traditionsMeta = traditionsData.meta;
export const commonGround = traditionsData.commonGround as { text: string; ref: string }[];
export const traditions = traditionsData.traditions as Tradition[];
export const topics = traditionsData.topics as Topic[];
export const boundaryNote = traditionsData.boundary.note;
export const boundaryTests = traditionsData.boundary.tests as BoundaryTest[];
export const boundaryGroups = traditionsData.boundary.groups as BoundaryGroup[];
export const testStatus = (g: BoundaryGroup, t: TestId): Status => {
  const x = g.tests[t];
  return typeof x === 'string' ? x : x.s;
};
export const testText = (g: BoundaryGroup, t: TestId): string | null => {
  const x = g.tests[t];
  return typeof x === 'string' ? null : x.text;
};
/** 0 = all core tests affirmed … 5 = none. Partial agreement counts half. */
export const departure = (g: BoundaryGroup) =>
  boundaryTests.reduce((n, t) => n + ({ affirms: 0, partial: 0.5, differs: 1 } as const)[testStatus(g, t.id)], 0);

/** Branch colours (CSS variables shared with the rest of the site). */
export const BRANCH_CSS: Record<string, string> = {
  early: '--ink',
  'east-syriac': '--aramaic',
  oriental: '--role-judge',
  eastern: '--role-priest',
  catholic: '--role-king',
  lutheran: '--greek',
  reformed: '--role-apostle',
  anabaptist: '--rel-mentor',
  anglican: '--lineage',
  baptist: '--role-key',
  methodist: '--role-prophet',
  pentecostal: '--rel-family',
  nondenominational: '--rel-ally',
};

/** Branches in tree order (each parent followed by its descendants). */
export const branchesInTreeOrder: (Branch & { depth: number })[] = (() => {
  const out: (Branch & { depth: number })[] = [];
  const visit = (parent: string | null, depth: number) => {
    branches
      .filter((b) => b.parentId === parent)
      .sort((a, b) => a.year - b.year)
      .forEach((b) => {
        out.push({ ...b, depth });
        visit(b.id, depth + 1);
      });
  };
  visit(null, 0);
  return out;
})();

export const KIND_INFO: Record<MilestoneKind, { label: string; css: string }> = {
  translation: { label: 'Translation', css: '--greek' },
  manuscript: { label: 'Manuscript', css: '--role-patriarch' },
  printing: { label: 'Printing', css: '--role-king' },
  discovery: { label: 'Discovery', css: '--aramaic' },
  statistics: { label: 'Today', css: '--ink-soft' },
  'nav-manuscript': { label: 'Manuscript navigation', css: '--role-priest' },
  'nav-chapters': { label: 'Chapter divisions', css: '--rel-family' },
  'nav-verses': { label: 'Verse numbering', css: '--lineage' },
};

const navKind = (c: string): MilestoneKind => (c === 'chapters' ? 'nav-chapters' : c === 'verses' ? 'nav-verses' : 'nav-manuscript');
const eraOf = (y: number): Era => (y < 1400 ? 'ancient' : y < 1700 ? 'reformation' : 'modern');

/** Translation milestones merged with the chapter-and-verse milestones, in date order. */
export const timeline: Milestone[] = (() => {
  const t: Milestone[] = (translationsData.milestones as {
    id: string; year: number; yearLabel: string; era: Era; kind: MilestoneKind; title: string; translatorOrOrigin: string;
    sourceLanguages: string[]; targetLanguage: string; historicalSignificance: string; navigation?: string;
  }[]).map((m) => ({
    id: m.id,
    year: m.year,
    yearLabel: m.yearLabel,
    era: m.era,
    kind: m.kind,
    title: m.title,
    who: m.translatorOrOrigin,
    languages:
      m.targetLanguage === '—'
        ? m.sourceLanguages.join(', ')
        : `${m.sourceLanguages.filter((x) => x !== '—').join(', ') || '—'} → ${m.targetLanguage}`,
    body: m.historicalSignificance,
    ...(m.navigation ? { navigation: navKind(m.navigation) } : {}),
  }));
  const ids = new Set(t.map((m) => m.id));
  const n: Milestone[] = navigationData.milestones
    .filter((m) => !ids.has(m.id))
    .map((m) => ({
      id: m.id,
      year: m.year,
      yearLabel: m.dateLabel,
      era: eraOf(m.year),
      kind: navKind(m.category),
      title: m.title,
      who: (m as { keyFigure?: string }).keyFigure ?? '',
      body: m.description,
    }));
  return [...t, ...n].sort((a, b) => a.year - b.year);
})();
