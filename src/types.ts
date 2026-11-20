export type Testament = 'Old' | 'New';
export type Language = 'Hebrew' | 'Aramaic' | 'Greek';
export type LanguageClass = 'hebrew' | 'mixed' | 'greek';
export type Division =
  | 'Pentateuch'
  | 'Historical'
  | 'Wisdom/Poetry'
  | 'Major Prophets'
  | 'Minor Prophets'
  | 'Gospels'
  | 'Acts'
  | 'Pauline Epistles'
  | 'General Epistles'
  | 'Apocalyptic';

export interface LanguageShare {
  language: Language;
  /** Share of the book by verse count (0–100). */
  percent: number;
  ranges?: string[];
}

export interface AramaicSection {
  reference: string;
  verses: number;
  words?: number;
  description: string;
}

export interface AramaicPhrase {
  reference: string;
  phrase: string;
  meaning: string;
  speaker?: string;
}

export interface Composition {
  /** Negative = BC, positive = AD. */
  start: number;
  end: number;
  display: string;
}

export interface BibleBook {
  order: number;
  name: string;
  abbrev: string;
  testament: Testament;
  division: Division;
  chapters: number;
  verses: number;
  languageClass: LanguageClass;
  languages: LanguageShare[];
  aramaicSections: AramaicSection[];
  aramaicPhrases: AramaicPhrase[];
  composition: Composition;
  context: string;
}

export interface DatasetMeta {
  title: string;
  canon: string;
  chapterAndVerseCounts: string;
  languagePercentNote: string;
  datingNote: string;
  sources: string[];
}

export type LanguageFilter = 'all' | 'hebrew' | 'aramaic' | 'greek' | 'mixed';
