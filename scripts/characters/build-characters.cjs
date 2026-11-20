// Usage: node scripts/characters/build-characters.cjs <dir with Theographic people.json, verses.json, books.json> src/data/biblicalCharacters.json
// Download those three files from https://github.com/robertrouse/theographic-bible-metadata/tree/master/json (not committed: ~45 MB).
const fs = require('fs');
const path = require('path');
const base = require('./curated.cjs');
const extra = require('./curated-additions.cjs');
const gemini = require('./curated-gemini.cjs');
const gemini2 = require('./curated-gemini2.cjs');
const twelve = require('./curated-twelve.cjs');
const SPIRITUAL = new Set(gemini2.spiritual);
const curated = [...base.people, ...extra.people, ...gemini.people, ...gemini2.people, ...twelve.people];
const curatedEdges = [...base.edges, ...extra.edges, ...gemini.edges, ...gemini2.edges, ...twelve.edges];

const [dir, out] = process.argv.slice(2);
const load = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const P = load('people.json');
const V = load('verses.json');
const B = load('books.json');

const bookByOsis = {};
B.forEach((b) => (bookByOsis[b.fields.osisName] = { name: b.fields.bookName, order: b.fields.bookOrder }));
const verseInfo = {};
V.forEach((v) => {
  const [osis, ch] = v.fields.osisRef.split('.');
  verseInfo[v.id] = { ...bookByOsis[osis], chapter: Number(ch), md: v.fields.mdText || '', year: v.fields.yearNum };
});

const byLookup = {};
const byRec = {};
P.forEach((p) => {
  byLookup[p.fields.personLookup] = p;
  byRec[p.id] = p;
});

// Jacob and his sons are also tagged on national/tribal uses ("children of Israel", "tribe of Gad",
// "king of Judah"). Keep a verse only if at least one tag looks like the person himself.
const TRIBAL = new Set(['israel_682', 'reuben_2429', 'simeon_2741', 'levi_1820', 'judah_1751', 'dan_973', 'naphtali_2149',
  'gad_1262', 'asher_337', 'issachar_645', 'zebulun_3002', 'joseph_1710', 'benjamin_463']);
const NATIONAL = /(children|house|elders|congregation|tribes?|camp|seed|excellency|land|families|assembly|armies|virgin|remnant|tents|people|kings?|princes|heads|cities|mountains|men|border|coast|lot|inheritance|wilderness|captivity|daughters|princess?|rulers|captains?|army|hosts?|nobles|towns|villages|gate|province) of (the )?$|his people $/i;
function isPersonal(lookup, md) {
  const re = new RegExp(`\\[([^\\]]+)\\]\\(/person/${lookup}\\)`, 'g');
  let m;
  while ((m = re.exec(md))) {
    const before = md.slice(Math.max(0, m.index - 40), m.index).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    if (!NATIONAL.test(before)) return true;
  }
  return false;
}

// Theographic mis-tags some names on unrelated verses.
const BOOK_FILTER = { lydia: (order) => order >= 40 };

const num = (x) => (x == null || x === '' ? null : Number(x));
const ids = new Set();
const recToId = {};
const rows = curated.map(([id, lookup, name, title, role, era, summary]) => {
  if (ids.has(id)) throw new Error('duplicate id ' + id);
  ids.add(id);
  const p = byLookup[lookup];
  if (!p) throw new Error('missing ' + lookup);
  recToId[p.id] = id;
  const books = {};
  const years = [];
  for (const vid of p.fields.verses || []) {
    const v = verseInfo[vid];
    if (!v) continue;
    if (TRIBAL.has(lookup) && !isPersonal(lookup, v.md)) continue;
    if (BOOK_FILTER[id] && !BOOK_FILTER[id](v.order)) continue;
    const b = (books[v.name] ??= { book: v.name, order: v.order, chapterSet: new Set(), verses: 0 });
    b.chapterSet.add(v.chapter);
    b.verses++;
    if (v.year != null) years.push(v.year);
  }
  const bookList = Object.values(books)
    .map((b) => ({ book: b.book, order: b.order, chapters: b.chapterSet.size, verses: b.verses }))
    .sort((a, b) => b.verses - a.verses || a.order - b.order);
  const ot = bookList.some((b) => b.order <= 39);
  const nt = bookList.some((b) => b.order >= 40);

  // Narrative years: the cluster of tagged verse years around the median (drops later retrospective mentions).
  years.sort((a, b) => a - b);
  const med = years.length ? years[Math.floor(years.length / 2)] : null;
  let core = med == null ? [] : years.filter((y) => Math.abs(y - med) <= 100);
  if (core.length >= 20) core = core.slice(Math.floor(core.length * 0.05), Math.ceil(core.length * 0.95));

  return {
    id, name, title,
    testament: ot && nt ? 'Both' : ot ? 'Old' : 'New',
    role, era,
    kind: SPIRITUAL.has(id) ? 'spiritual' : 'human',
    gender: p.fields.gender,
    theographicId: lookup,
    verseCount: bookList.reduce((n, b) => n + b.verses, 0),
    chapterCount: bookList.reduce((n, b) => n + b.chapters, 0),
    prominenceScore: 0,
    dates: null,
    lineage: null,
    books: bookList,
    summary,
    relationships: [],
    _birth: num(p.fields.birthYear),
    _death: num(p.fields.deathYear),
    _active: core.length ? [core[0], core[core.length - 1]] : null,
    _years: [...new Set(years)],
  };
});
const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

// Prominence: log-scaled verse mentions, 1–100.
const maxV = Math.max(...rows.map((r) => r.verseCount));
rows.forEach((r) => {
  r.prominenceScore = Math.max(1, Math.round((100 * Math.log(1 + r.verseCount)) / Math.log(1 + maxV)));
});

// ── Lineage of Jesus: walk Theographic father links from Jesus to Adam ──
const chain = [];
for (let p = byLookup['jesus_905']; p && p.fields.personLookup !== 'god_1324'; p = byRec[(p.fields.father || [])[0]]) {
  const id = recToId[p.id];
  if (!id) throw new Error('lineage member not curated: ' + p.fields.personLookup);
  chain.unshift(id);
}
chain.forEach((id, i) => {
  byId[id].lineage = { generation: i + 1, ...(extra.lineageNotes[id] ? { note: extra.lineageNotes[id] } : {}) };
});

// ── Dates (Theographic chronology) ──
const LIFE = 60; // assumed span when only one end, or neither, is known
for (const r of rows) {
  const b = r._birth, d = r._death, a = r._active;
  if (b != null && d != null) r.dates = { start: b, end: d, precision: 'lifespan' };
  else if (b != null) r.dates = { start: b, end: a && a[1] > b && a[1] - b < 130 ? a[1] : b + LIFE, precision: 'birth' };
  else if (d != null) r.dates = { start: a && a[0] < d && d - a[0] < 130 ? Math.min(a[0], d - 20) : d - LIFE, end: d, precision: 'death' };
  else if (a) r.dates = { start: a[0], end: a[1], precision: 'attested' };
}
// Editorial overrides where Theographic's own fields disagree (documented in meta).
const OVERRIDES = {
  ruth: { start: -1340, end: -1280, precision: 'attested', note: 'Theographic gives birth 1114 BC but dates the Book of Ruth to c. 1307 BC; the narrative date is used.' },
  boaz: { start: -1360, end: -1290, precision: 'attested', note: 'Dated with the Book of Ruth (c. 1307 BC in Theographic); later uses of his name for a temple pillar omitted.' },
  nehemiah: { start: -446, end: -433, precision: 'attested', note: 'Governor from the 20th to the 32nd year of Artaxerxes I (Neh 5:14; 13:6); Theographic dates nearly all his verses to 444 BC.' },
  hezron: { start: -1715, end: -1650, precision: 'estimated', note: 'Listed among those who went down to Egypt with Jacob (Gen 46:12).' },
  abijah: { start: -1000, end: -955, precision: 'death', note: 'Death year from Theographic; birth estimated.' },
  absalom: { start: -1052, end: -1023, precision: 'attested', note: 'Ends at his death in 2 Sam 18; later mentions of "Abishalom" omitted.' },
  'john-baptist': { start: -4, end: 29, precision: 'birth', note: 'Executed by Herod Antipas c. AD 29 (Mark 6); later mentions in Acts omitted.' },
  peter: { start: 26, end: 66, precision: 'attested', note: 'Theographic dates John 1 to AD 5; start adjusted to the beginning of Jesus’ ministry (c. AD 26).' },
  andrew: { start: 26, end: 33, precision: 'attested', note: 'Theographic dates John 1 to AD 5; start adjusted to the beginning of Jesus’ ministry (c. AD 26).' },
  'philip-apostle': { start: 26, end: 33, precision: 'attested', note: 'Theographic dates John 1 to AD 5; start adjusted to the beginning of Jesus’ ministry (c. AD 26).' },
  nathanael: { start: 26, end: 33, precision: 'attested', note: 'Theographic dates John 1 to AD 5; start adjusted to the beginning of Jesus’ ministry (c. AD 26).' },
  simeon: { start: -3, end: -3, precision: 'attested', note: 'Theographic dates Luke 2:25 to AD 4 but Jesus’ birth to 3 BC; aligned to the presentation 40 days after the birth.' },
  anna: { start: -3, end: -3, precision: 'attested', note: 'Aligned to Jesus’ presentation at the temple (Luke 2:36).' },
  joel: { start: -799, end: -799, precision: 'attested', note: 'Year of Joel 1:1 in Theographic; the quotation in Acts 2 omitted.' },
  ahasuerus: { start: -461, end: -451, precision: 'attested', note: 'Esther narrative years; Ezra 4:6 and Daniel 9:1 (likely different kings) omitted.' },
  pilate: { start: 26, end: 36, precision: 'attested', note: 'Prefect of Judea AD 26–36; later retrospective mentions omitted.' },
  stephen: { start: 33, end: 34, precision: 'attested', note: 'Martyred shortly after Pentecost (Acts 7); later retrospective mentions omitted.' },
  cyrus: { start: -600, end: -530, precision: 'estimated', note: 'Conventional dates (reigned 559–530 BC); a retrospective mention in Daniel 1:21 omitted.' },
  nebuchadnezzar: { start: -630, end: -562, precision: 'estimated', note: 'Reigned 605–562 BC; retrospective mentions in Daniel 5 omitted.' },
};
for (const [id, d] of Object.entries(OVERRIDES)) { byId[id].dates = d; byId[id]._fixed = true; }

// Twelve sons: Theographic has birth years only. All twelve are alive at Jacob's blessing (Gen 49),
// so no bar ends before Jacob's death; Levi lived 137 years (Exod 6:16).
{
  const jacobDeath = byId.jacob._death;
  for (const { id } of twelve.twelveSons) {
    const r = byId[id];
    if (id === 'levi' && r._birth != null) {
      r.dates = { start: r._birth, end: r._birth + 137, precision: 'lifespan', note: 'Death from his age of 137 (Exod 6:16).' };
      r._fixed = true;
    } else if (!r._fixed && r.dates.precision === 'birth' && r.dates.end < jacobDeath) {
      r.dates = { ...r.dates, end: jacobDeath, note: 'Alive at Jacob’s deathbed blessing (Gen 49); death year unknown.' };
    }
  }
}

// Spiritual beings: no lifespan — list the distinct years they appear in the narrative.
for (const r of rows) {
  if (r.kind !== 'spiritual') continue;
  r.appearances = r._years;
  r.dates = { start: r._years[0], end: r._years[r._years.length - 1], precision: 'appearances' };
  r._fixed = true;
}

// Lineage members with no birth/death: interpolate birth by generation between dated ancestors.
// Anchors: Theographic birth/death years or documented overrides only (genealogy-verse years reflect the book's era, not the person's).
const anchor = (r) => (r._fixed ? r.dates.start : r._birth != null ? r._birth : r._death != null ? r._death - LIFE : null);
chain.forEach((id, i) => {
  const r = byId[id];
  if (r._fixed || r._birth != null || r._death != null) return;
  let lo = i - 1, hi = i + 1;
  while (lo >= 0 && anchor(byId[chain[lo]]) == null) lo--;
  while (hi < chain.length && anchor(byId[chain[hi]]) == null) hi++;
  if (lo < 0 || hi >= chain.length) return;
  const b0 = anchor(byId[chain[lo]]), b1 = anchor(byId[chain[hi]]);
  const est = Math.round(b0 + ((b1 - b0) * (i - lo)) / (hi - lo));
  const a = r._active;
  // Keep narrative years when they agree with the generational estimate (e.g. Zerubbabel).
  if (a && a[0] >= est - 10 && a[0] <= est + 90) return;
  r.dates = { start: est, end: est + LIFE, precision: 'estimated' };
});


// ── Relationships ──
const familyPairs = new Set();
const pairKey = (a, b) => [a, b].sort().join('|');
function add(src, tgt, type, label, source) {
  if (!byId[src] || !byId[tgt] || src === tgt) return;
  if (type === 'Family') {
    const k = pairKey(src, tgt);
    if (familyPairs.has(k)) return;
    familyPairs.add(k);
  }
  byId[src].relationships.push({ targetId: tgt, type, label, source });
}
const parentLabel = (g) => (g === 'Female' ? 'Mother of' : 'Father of');
const sibLabel = (g) => (g === 'Female' ? 'Sister of' : 'Brother of');
const spouseLabel = (g) => (g === 'Female' ? 'Wife of' : 'Husband of');

for (const [s, t, type, label] of curatedEdges) {
  if (!byId[s] || !byId[t]) throw new Error('bad edge ' + s + '→' + t);
  if (type === 'Family') add(s, t, type, label, 'curated');
}
for (const r of rows) {
  const f = byLookup[r.theographicId].fields;
  for (const rec of [...(f.father || []), ...(f.mother || [])]) {
    const pid = recToId[rec];
    if (pid) add(pid, r.id, 'Family', parentLabel(byId[pid].gender), 'theographic');
  }
  for (const rec of f.children || []) {
    const cid = recToId[rec];
    if (cid) add(r.id, cid, 'Family', parentLabel(r.gender), 'theographic');
  }
  for (const rec of f.partners || []) {
    const sid = recToId[rec];
    if (sid && r.gender === 'Male') add(r.id, sid, 'Family', spouseLabel(r.gender), 'theographic');
  }
  for (const rec of [...(f.siblings || []), ...(f.halfSiblingsSameFather || []), ...(f.halfSiblingsSameMother || [])]) {
    const sid = recToId[rec];
    if (sid && r.id < sid) add(r.id, sid, 'Family', sibLabel(r.gender), 'theographic');
  }
}
for (const [s, t, type, label] of curatedEdges) {
  if (type !== 'Family') add(s, t, type, label, 'curated');
}

for (const r of rows) {
  if (!r.dates) throw new Error('no dates for ' + r.id);
  delete r.gender;
  delete r._birth;
  delete r._death;
  delete r._active;
  delete r._fixed;
  delete r._years;
}

const result = {
  meta: {
    source: 'Theographic Bible Metadata (github.com/robertrouse/theographic-bible-metadata), json/people.json + verses.json + books.json',
    license: 'Theographic data is CC BY-SA 4.0',
    method:
      'books[] and verse/chapter counts are computed from each person\'s tagged verses. prominenceScore = round(100 × ln(1+verses) / ln(1+max verses)). Family edges marked source "theographic" come from the dataset\'s father/mother/children/siblings/partners fields; others are curated.',
    datesNote:
      'Dates follow Theographic\'s chronology, which is largely Ussher-based (creation 4004 BC, exodus 1491 BC); modern scholarly dates differ, especially before c. 900 BC. precision: "lifespan" = birth and death years in Theographic; "birth"/"death" = one end known; "attested" = years of the verses they appear in; "estimated" = interpolated by generation along the lineage.',
    lineageNote:
      'The lineage follows Theographic\'s father links from Jesus back to Adam: Luke 3 before Abraham (including Cainan, Luke 3:36), then the royal line of 1 Chronicles 3 and Matthew 1 through Joseph. It includes four kings Matthew omits and gives Pedaiah (1 Chr 3:19) as Zerubbabel\'s father. Luke\'s line from David through Nathan to Heli is not shown.',
    eraNote: 'Theographic has no periods.json; eras are assigned editorially.',
    generated: new Date().toISOString().slice(0, 10),
  },
  lineage: chain,
  twelveSons: twelve.twelveSons,
  characters: rows,
};
fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');

// Report
const edges = rows.flatMap((r) => r.relationships.map((e) => ({ ...e, s: r.id })));
console.log('characters', rows.length, 'edges', edges.length, 'theographic', edges.filter((e) => e.source === 'theographic').length, 'lineage', chain.length);
console.log(rows.map((r) => `${r.id} ${r.dates.start}..${r.dates.end} ${r.dates.precision[0]} [${r.era.split(' ')[0]}]`).join('\n'));
const deg = {}; edges.forEach((e) => { deg[e.s] = (deg[e.s] || 0) + 1; deg[e.targetId] = (deg[e.targetId] || 0) + 1; });
console.log('isolated:', rows.filter((r) => !deg[r.id]).map((r) => r.id).join(', '));
