// Scripture reference parsing, shared by the app and the build script
// (scripts/scripture/build-scripture.mjs imports this file directly via Node's type stripping,
// so keep to erasable TypeScript: no enums, namespaces or parameter properties).

/** [USFX id, display name, chapter count, ...aliases] */
const BOOKS: [string, string, number, ...string[]][] = [
  ['GEN', 'Genesis', 50, 'Gen', 'Gn'],
  ['EXO', 'Exodus', 40, 'Exod', 'Ex', 'Exo'],
  ['LEV', 'Leviticus', 27, 'Lev', 'Lv'],
  ['NUM', 'Numbers', 36, 'Num', 'Nm'],
  ['DEU', 'Deuteronomy', 34, 'Deut', 'Dt'],
  ['JOS', 'Joshua', 24, 'Josh', 'Jos'],
  ['JDG', 'Judges', 21, 'Judg', 'Jdg'],
  ['RUT', 'Ruth', 4, 'Rth'],
  ['1SA', '1 Samuel', 31, '1 Sam', '1Sam', '1 Sa'],
  ['2SA', '2 Samuel', 24, '2 Sam', '2Sam', '2 Sa'],
  ['1KI', '1 Kings', 22, '1 Kgs', '1Kgs', '1 Ki'],
  ['2KI', '2 Kings', 25, '2 Kgs', '2Kgs', '2 Ki'],
  ['1CH', '1 Chronicles', 29, '1 Chr', '1Chr', '1 Chron'],
  ['2CH', '2 Chronicles', 36, '2 Chr', '2Chr', '2 Chron'],
  ['EZR', 'Ezra', 10, 'Ezr'],
  ['NEH', 'Nehemiah', 13, 'Neh'],
  ['EST', 'Esther', 10, 'Esth', 'Est'],
  ['JOB', 'Job', 42],
  ['PSA', 'Psalms', 150, 'Psalm', 'Ps', 'Psa'],
  ['PRO', 'Proverbs', 31, 'Prov', 'Pr'],
  ['ECC', 'Ecclesiastes', 12, 'Eccl', 'Ecc', 'Eccles'],
  ['SNG', 'Song of Solomon', 8, 'Song of Songs', 'Song', 'Cant'],
  ['ISA', 'Isaiah', 66, 'Isa'],
  ['JER', 'Jeremiah', 52, 'Jer'],
  ['LAM', 'Lamentations', 5, 'Lam'],
  ['EZK', 'Ezekiel', 48, 'Ezek', 'Eze'],
  ['DAN', 'Daniel', 12, 'Dan', 'Dn'],
  ['HOS', 'Hosea', 14, 'Hos'],
  ['JOL', 'Joel', 3],
  ['AMO', 'Amos', 9, 'Am'],
  ['OBA', 'Obadiah', 1, 'Obad', 'Ob'],
  ['JON', 'Jonah', 4, 'Jon'],
  ['MIC', 'Micah', 7, 'Mic'],
  ['NAM', 'Nahum', 3, 'Nah'],
  ['HAB', 'Habakkuk', 3, 'Hab'],
  ['ZEP', 'Zephaniah', 3, 'Zeph'],
  ['HAG', 'Haggai', 2, 'Hag'],
  ['ZEC', 'Zechariah', 14, 'Zech'],
  ['MAL', 'Malachi', 4, 'Mal'],
  ['MAT', 'Matthew', 28, 'Matt', 'Mt'],
  ['MRK', 'Mark', 16, 'Mk', 'Mar'],
  ['LUK', 'Luke', 24, 'Lk'],
  ['JHN', 'John', 21, 'Jn', 'Joh'],
  ['ACT', 'Acts', 28, 'Act'],
  ['ROM', 'Romans', 16, 'Rom'],
  ['1CO', '1 Corinthians', 16, '1 Cor', '1Cor'],
  ['2CO', '2 Corinthians', 13, '2 Cor', '2Cor'],
  ['GAL', 'Galatians', 6, 'Gal'],
  ['EPH', 'Ephesians', 6, 'Eph'],
  ['PHP', 'Philippians', 4, 'Phil', 'Php'],
  ['COL', 'Colossians', 4, 'Col'],
  ['1TH', '1 Thessalonians', 5, '1 Thess', '1Thess', '1 Thes'],
  ['2TH', '2 Thessalonians', 3, '2 Thess', '2Thess', '2 Thes'],
  ['1TI', '1 Timothy', 6, '1 Tim', '1Tim'],
  ['2TI', '2 Timothy', 4, '2 Tim', '2Tim'],
  ['TIT', 'Titus', 3, 'Tit'],
  ['PHM', 'Philemon', 1, 'Phlm', 'Philem'],
  ['HEB', 'Hebrews', 13, 'Heb'],
  ['JAS', 'James', 5, 'Jas'],
  ['1PE', '1 Peter', 5, '1 Pet', '1Pet', '1 Pe'],
  ['2PE', '2 Peter', 3, '2 Pet', '2Pet', '2 Pe'],
  ['1JN', '1 John', 5, '1 Jn', '1Jn'],
  ['2JN', '2 John', 1, '2 Jn', '2Jn'],
  ['3JN', '3 John', 1, '3 Jn', '3Jn'],
  ['JUD', 'Jude', 1],
  ['REV', 'Revelation', 22, 'Rev'],
];

export const BOOK_NAME: Record<string, string> = Object.fromEntries(BOOKS.map((b) => [b[0], b[1]]));
export const BOOK_CHAPTERS: Record<string, number> = Object.fromEntries(BOOKS.map((b) => [b[0], b[2]]));

const ALIAS: Record<string, string> = {};
for (const [id, name, , ...aliases] of BOOKS) {
  for (const a of [name, ...aliases]) ALIAS[a.toLowerCase().replace(/\s+/g, ' ')] = id;
}
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const NAMES = Object.keys(ALIAS)
  .sort((a, b) => b.length - a.length)
  .map((n) => escapeRe(n).replace(/ /g, '\\s?'));

const DASH = '[–—-]';
const NUM_RANGE = `\\d+(?::\\d+[ab]?)?(?:\\s*${DASH}\\s*\\d+(?::\\d+[ab]?)?)?`;
/** Book name (optionally with a period) followed by chapter[:verse][–[chapter:]verse] */
const REF_RE = new RegExp(`(?<![A-Za-z0-9])(${NAMES.join('|')})\\.?\\s?(${NUM_RANGE})`, 'gi');
const CONT_RE = new RegExp(`^(\\s*[;,]\\s*|\\s+and\\s+)(${NUM_RANGE})(?![\\d:A-Za-z])`, 'i');

export interface RefSegment {
  book: string;
  c1: number;
  v1?: number;
  c2?: number;
  v2?: number;
}

export interface FoundRef {
  start: number;
  end: number;
  text: string;
  key: string;
  segments: RefSegment[];
}

function parseRange(book: string, s: string, prevChapter: number | null, afterVerse: boolean): RefSegment | null {
  const single = BOOK_CHAPTERS[book] === 1;
  const m = s.match(new RegExp(`^(\\d+)(?::(\\d+)[ab]?)?(?:\\s*${DASH}\\s*(\\d+)(?::(\\d+)[ab]?)?)?$`));
  if (!m) return null;
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : undefined;
  const c = m[3] ? Number(m[3]) : undefined;
  const d = m[4] ? Number(m[4]) : undefined;
  // Single-chapter books, or a bare number continuing after a verse ("Rom 16:1, 23"): numbers are verses.
  if (b === undefined && (single || (afterVerse && prevChapter !== null))) {
    const ch = single ? 1 : (prevChapter as number);
    return { book, c1: ch, v1: a, ...(c !== undefined ? { c2: ch, v2: c } : {}) };
  }
  if (b === undefined) {
    // chapter or chapter range
    return { book, c1: a, ...(c !== undefined ? { c2: c } : {}) };
  }
  if (c === undefined) return { book, c1: a, v1: b };
  if (d === undefined) return { book, c1: a, v1: b, c2: a, v2: c }; // 12:4–9
  return { book, c1: a, v1: b, c2: c, v2: d }; // 12:10–13:4
}

const segKey = (s: RefSegment) =>
  `${s.book} ${s.c1}${s.v1 !== undefined ? ':' + s.v1 : ''}${s.c2 !== undefined ? '-' + s.c2 + (s.v2 !== undefined ? ':' + s.v2 : '') : ''}`;

/** Find Scripture references in free text (e.g. "Gen 12:4–9", "Josh. 3:16", "Isa 40:3; 48:20"). */
export function findRefs(text: string): FoundRef[] {
  const out: FoundRef[] = [];
  REF_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = REF_RE.exec(text))) {
    const book = ALIAS[m[1].toLowerCase().replace(/\s+/g, ' ')];
    if (!book) continue;
    const first = parseRange(book, m[2], null, false);
    if (!first || first.c1 < 1 || first.c1 > BOOK_CHAPTERS[book]) continue;
    // Avoid false positives such as "Job 3" in prose? Require a verse or a capitalised book token.
    if (first.v1 === undefined && m[1] !== m[1].replace(/^[a-z]/, (x) => x.toUpperCase())) continue;
    const segments = [first];
    let end = m.index + m[0].length;
    // Continuations: "; 48:20", ", 23", "; 13:6"
    for (;;) {
      const rest = text.slice(end);
      const cm = rest.match(CONT_RE);
      if (!cm) break;
      const last = segments[segments.length - 1];
      const lastChapter = last.c2 ?? last.c1;
      const seg = parseRange(book, cm[2], lastChapter, last.v1 !== undefined);
      if (!seg || seg.c1 > BOOK_CHAPTERS[book]) break;
      segments.push(seg);
      end += cm[0].length;
    }
    out.push({ start: m.index, end, text: text.slice(m.index, end), key: segments.map(segKey).join('; '), segments });
    REF_RE.lastIndex = end;
  }
  return out;
}

/** "Genesis 12:4–9; 13:2" */
export function displayRef(segments: RefSegment[]): string {
  let prevBook = '';
  return segments
    .map((s) => {
      const range =
        `${s.c1}${s.v1 !== undefined ? ':' + s.v1 : ''}` +
        (s.c2 !== undefined
          ? '–' + (s.v2 !== undefined ? (s.c2 !== s.c1 ? s.c2 + ':' : '') + s.v2 : s.c2)
          : '');
      const single = BOOK_CHAPTERS[s.book] === 1 && s.v1 !== undefined;
      const body = single ? range.replace(/^1:/, '') : range;
      const label = s.book === prevBook ? body : `${BOOK_NAME[s.book]} ${body}`;
      prevBook = s.book;
      return label;
    })
    .join('; ');
}
