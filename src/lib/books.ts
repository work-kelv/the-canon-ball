import data from '../data/bibleBooks.json';
import type {
  BibleBook,
  DatasetMeta,
  Division,
  Language,
  LanguageFilter,
  Testament,
} from '../types';

export const books = data.books as BibleBook[];
export const meta = data.meta as DatasetMeta;

export const LANGUAGES: Language[] = ['Hebrew', 'Aramaic', 'Greek'];

export const LANGUAGE_INFO: Record<
  Language,
  { native: string; nativeClass: string; css: string; family: string; code: string }
> = {
  Hebrew: {
    native: 'עִבְרִית',
    nativeClass: 'font-hebrew',
    css: '--hebrew',
    family: 'Northwest Semitic · Canaanite',
    code: 'HE',
  },
  Aramaic: {
    native: 'אֲרָמִית',
    nativeClass: 'font-hebrew',
    css: '--aramaic',
    family: 'Northwest Semitic · Imperial Aramaic',
    code: 'AR',
  },
  Greek: {
    native: 'Κοινὴ Ἑλληνική',
    nativeClass: 'font-serif italic',
    css: '--greek',
    family: 'Indo-European · Hellenic',
    code: 'GR',
  },
};

export const DIVISIONS: { name: Division; testament: Testament }[] = [
  { name: 'Pentateuch', testament: 'Old' },
  { name: 'Historical', testament: 'Old' },
  { name: 'Wisdom/Poetry', testament: 'Old' },
  { name: 'Major Prophets', testament: 'Old' },
  { name: 'Minor Prophets', testament: 'Old' },
  { name: 'Gospels', testament: 'New' },
  { name: 'Acts', testament: 'New' },
  { name: 'Pauline Epistles', testament: 'New' },
  { name: 'General Epistles', testament: 'New' },
  { name: 'Apocalyptic', testament: 'New' },
];

export const FILTERS: { id: LanguageFilter; label: string; hint: string }[] = [
  { id: 'all', label: 'All', hint: 'All 66 books' },
  { id: 'hebrew', label: 'Hebrew', hint: 'Written wholly or mostly in Biblical Hebrew' },
  {
    id: 'aramaic',
    label: 'Aramaic',
    hint: 'Contains Aramaic text, or transliterated Aramaic words in the Greek NT',
  },
  { id: 'greek', label: 'Greek', hint: 'Written in Koine Greek' },
  { id: 'mixed', label: 'Mixed', hint: 'Original text combines Hebrew and Aramaic' },
];

export const MAX_CHAPTERS = Math.max(...books.map((b) => b.chapters));
export const TOTAL_CHAPTERS = books.reduce((n, b) => n + b.chapters, 0);
export const TOTAL_VERSES = books.reduce((n, b) => n + b.verses, 0);

export function hasLanguage(book: BibleBook, lang: Language): boolean {
  return book.languages.some((l) => l.language === lang && l.percent > 0);
}

export function hasAnyAramaic(book: BibleBook): boolean {
  return book.aramaicSections.length > 0 || book.aramaicPhrases.length > 0;
}

export function matchesFilter(book: BibleBook, filter: LanguageFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'hebrew':
      return hasLanguage(book, 'Hebrew');
    case 'aramaic':
      return hasAnyAramaic(book);
    case 'greek':
      return hasLanguage(book, 'Greek');
    case 'mixed':
      return book.languageClass === 'mixed';
  }
}

export function languagePercent(book: BibleBook, lang: Language): number {
  return book.languages.find((l) => l.language === lang)?.percent ?? 0;
}

/** Chapters attributable to each language, weighted by verse share. */
export function chapterEquivalents(list: BibleBook[]): Record<Language, number> {
  const out: Record<Language, number> = { Hebrew: 0, Aramaic: 0, Greek: 0 };
  for (const b of list) {
    for (const l of b.languages) out[l.language] += (b.chapters * l.percent) / 100;
  }
  return out;
}

export function langColor(lang: Language, alpha = 1): string {
  return `rgb(var(${LANGUAGE_INFO[lang].css}) / ${alpha})`;
}

export function formatYear(y: number): string {
  return y < 0 ? `${-y} BC` : `AD ${y}`;
}

export function formatPct(p: number): string {
  if (p === 0) return '0%';
  if (p < 0.1) return '<0.1%';
  if (p > 99.9 && p < 100) return '>99.9%';
  return `${Number(p.toFixed(1))}%`;
}

export function formatNum(n: number, digits = 0): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: digits });
}

/** Opacity for the chapter-count heat scale (sqrt so short books stay visible). */
export function heatAlpha(chapters: number): number {
  return 0.2 + 0.75 * Math.sqrt(chapters / MAX_CHAPTERS);
}
