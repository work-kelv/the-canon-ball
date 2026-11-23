// Match the names in data-sources/gemini-characters-by-book.json to character ids, so the
// Characters page can filter to "Key figures" (the people that list names for each book).
// Writes src/data/keyFigures.json and prints any names it could not match.
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const list = require(path.join(root, 'data-sources/gemini-characters-by-book.json'));
const { characters } = require(path.join(root, 'src/data/biblicalCharacters.json'));

// Names the list spells differently from the dataset (list name → character id).
const ALIASES = {
  'Mary (mother of Jesus)': 'mary-mother',
  'Mary': 'mary-mother',
  'John': 'john-apostle',
  'John the Apostle': 'john-apostle',
  'James': 'james-zebedee',
  'Mark': 'mark',
  'John Mark': 'mark',
  'Saul (Paul)': 'paul',
  'Paul': 'paul',
  'Jesus': 'jesus',
  'Jesus Christ': 'jesus',
  'Saul / Paul': 'paul',
  'Cephas (Peter)': 'peter',
  'King Agrippa': 'agrippa',
  'Jeshua': 'joshua-high-priest',
  'Joshua the High Priest': 'joshua-high-priest',
  'Exodus|Pharaoh': 'pharaoh-exodus',
  'John|Philip': 'philip-apostle',
};
// Not separate people in the dataset (left unmatched on purpose): Sons of Korah, the Shulammite,
// Darius the Mede, Jeroboam II, the king of Nineveh, the Samaritan woman.

const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim();
// Every way a character can be named: full name, name without the bracket, the bracketed alternative,
// and the part before a comma ("James, son of Zebedee" → "James").
const keys = new Map();
const add = (k, c) => {
  const n = norm(k);
  if (!n) return;
  keys.set(n, [...(keys.get(n) ?? []), c]);
};
for (const c of characters) {
  add(c.name, c);
  add(c.id.replace(/-/g, ' '), c);
  const m = c.name.match(/^(.*?)\s*\((.*)\)\s*$/);
  if (m) {
    add(m[1], c);
    m[2].split(/,|\bor\b|\//).forEach((x) => add(x, c));
  }
  add(c.name.split(',')[0], c);
}

const ids = new Set();
const unmatched = [];
for (const book of list) {
  for (const raw of book.characters) {
    let id = ALIASES[`${book.book}|${raw}`] ?? ALIASES[raw];
    if (!id) {
      const cands = [
        ...(keys.get(norm(raw)) ?? []),
        ...(keys.get(norm(raw.replace(/\s*\(.*\)\s*/, ''))) ?? []),
      ];
      const uniq = [...new Map(cands.map((c) => [c.id, c])).values()];
      // Prefer the person who actually appears in this book.
      const inBook = uniq.filter((c) => c.books.some((b) => b.book === book.book));
      const pick = (inBook.length ? inBook : uniq).sort((a, b) => b.verseCount - a.verseCount)[0];
      id = pick?.id;
    }
    if (id && characters.some((c) => c.id === id)) ids.add(id);
    else unmatched.push(`${book.book}: ${raw}`);
  }
}

const out = {
  meta: {
    source: 'data-sources/gemini-characters-by-book.json (a per-book list of prominent figures)',
    note: 'Characters named in that list, matched to this dataset by name and book.',
  },
  ids: [...ids].sort(),
};
fs.writeFileSync(path.join(root, 'src/data/keyFigures.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`matched ${ids.size} characters; unmatched ${unmatched.length}`);
if (unmatched.length) console.log(unmatched.join('\n'));
