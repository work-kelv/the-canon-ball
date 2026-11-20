export type Role =
  | 'Patriarch/Matriarch'
  | 'Judge'
  | 'King/Ruler'
  | 'Prophet'
  | 'Priest'
  | 'Apostle/Disciple'
  | 'Key Figure';

export type Era =
  | 'Creation & Patriarchs'
  | 'Exodus & Wilderness'
  | 'Judges'
  | 'United & Divided Kingdom'
  | 'Exile & Return'
  | 'Intertestamental'
  | 'Gospels'
  | 'Early Church';

export type RelType = 'Family' | 'Mentor/Disciple' | 'Ally/Companion' | 'Rival/Adversary';

export interface CharacterBook {
  book: string;
  order: number;
  /** Distinct chapters in this book where the person is tagged. */
  chapters: number;
  /** Verses in this book where the person is tagged. */
  verses: number;
}

export interface Relationship {
  targetId: string;
  type: RelType;
  label: string;
  source: 'theographic' | 'curated';
}

export type DatePrecision = 'lifespan' | 'birth' | 'death' | 'attested' | 'estimated' | 'appearances';

export interface CharacterDates {
  /** Negative = BC, positive = AD (Theographic chronology). */
  start: number;
  end: number;
  precision: DatePrecision;
  note?: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  testament: 'Old' | 'New' | 'Both';
  role: Role;
  era: Era;
  kind: 'human' | 'spiritual';
  theographicId: string;
  verseCount: number;
  chapterCount: number;
  prominenceScore: number;
  dates: CharacterDates;
  /** Present for members of Jesus' lineage (generation 1 = Adam). */
  lineage: { generation: number; note?: string } | null;
  /** Spiritual beings only: distinct narrative years they appear in. */
  appearances?: number[];
  /** Sorted by verse mentions, descending. */
  books: CharacterBook[];
  summary: string;
  relationships: Relationship[];
}

export interface CharacterMeta {
  source: string;
  license: string;
  method: string;
  datesNote: string;
  lineageNote: string;
  eraNote: string;
  generated: string;
}

/** A flattened directed edge. */
export interface Edge extends Relationship {
  sourceId: string;
  key: string;
}
