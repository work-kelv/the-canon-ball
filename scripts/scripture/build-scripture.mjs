// Build src/data/scripture.json: verse text for every Scripture reference used in the app,
// in two public-domain translations.
// Usage: node scripts/scripture/build-scripture.mjs <eng-web.usfx.xml> <eng-bsb.usfx.xml>
//   World English Bible and Berean Standard Bible, from https://github.com/seven1m/open-bibles
// References are found by scanning src/ (data JSON and components) with the same parser the app uses.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOK_NAME, displayRef, findRefs } from '../../src/lib/scriptureRefs.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [webPath, bsbPath] = process.argv.slice(2);
const MAX_VERSES = Infinity; // every verse of each reference is stored, so the pop-up shows the whole passage

// ── Parse USFX into book → chapter → [{ v, t }] ──
function parseUsfx(file) {
  const xml = fs.readFileSync(file, 'utf8');
  const bible = {};
  for (const bm of xml.matchAll(/<book id="([0-9A-Z]{3})">([\s\S]*?)<\/book>/g)) {
    const [, id, body] = bm;
    if (!BOOK_NAME[id]) continue; // front matter, deuterocanon
    const clean = body
      .replace(/<f\b[^>]*>[\s\S]*?<\/f>/g, '') // footnotes
      .replace(/<x\b[^>]*>[\s\S]*?<\/x>/g, '') // cross-references
      .replace(/<(h|toc|id|ide|rem)\b[^>]*>[\s\S]*?<\/\1>/g, '')
      .replace(/<(p|q|d)\b[^>]*sfm="(mt|ms|s|r|d)\d?"[^>]*>[\s\S]*?<\/\1>/g, ''); // titles & headings
    const chapters = {};
    let ch = 0;
    for (const tok of clean.split(/(<c id="\d+"[^>]*\/>|<v id="[^"]+"[^>]*\/>|<ve\s*\/>)/)) {
      const c = tok.match(/^<c id="(\d+)"/);
      if (c) {
        ch = Number(c[1]);
        chapters[ch] = [];
        continue;
      }
      const v = tok.match(/^<v id="(\d+)/);
      if (v) {
        (chapters[ch] ??= []).push({ v: Number(v[1]), t: '' });
        continue;
      }
      if (/^<ve/.test(tok)) continue;
      const arr = chapters[ch];
      if (arr && arr.length) arr[arr.length - 1].t += tok.replace(/<[^>]+>/g, ' ');
    }
    for (const k in chapters)
      for (const verse of chapters[k])
        verse.t = verse.t
          .replace(/\s+/g, ' ')
          .replace(/\s([,.;:!?”’)\]])/g, '$1')
          .replace(/([“‘([])\s+/g, '$1')
          .trim();
    bible[id] = chapters;
  }
  return bible;
}
const BIBLES = { web: parseUsfx(webPath), bsb: parseUsfx(bsbPath) };

// BibleHub book slugs for BSB chapter links
const HUB = {
  GEN: 'genesis', EXO: 'exodus', LEV: 'leviticus', NUM: 'numbers', DEU: 'deuteronomy', JOS: 'joshua', JDG: 'judges', RUT: 'ruth',
  '1SA': '1_samuel', '2SA': '2_samuel', '1KI': '1_kings', '2KI': '2_kings', '1CH': '1_chronicles', '2CH': '2_chronicles',
  EZR: 'ezra', NEH: 'nehemiah', EST: 'esther', JOB: 'job', PSA: 'psalms', PRO: 'proverbs', ECC: 'ecclesiastes', SNG: 'songs',
  ISA: 'isaiah', JER: 'jeremiah', LAM: 'lamentations', EZK: 'ezekiel', DAN: 'daniel', HOS: 'hosea', JOL: 'joel', AMO: 'amos',
  OBA: 'obadiah', JON: 'jonah', MIC: 'micah', NAM: 'nahum', HAB: 'habakkuk', ZEP: 'zephaniah', HAG: 'haggai', ZEC: 'zechariah',
  MAL: 'malachi', MAT: 'matthew', MRK: 'mark', LUK: 'luke', JHN: 'john', ACT: 'acts', ROM: 'romans', '1CO': '1_corinthians',
  '2CO': '2_corinthians', GAL: 'galatians', EPH: 'ephesians', PHP: 'philippians', COL: 'colossians', '1TH': '1_thessalonians',
  '2TH': '2_thessalonians', '1TI': '1_timothy', '2TI': '2_timothy', TIT: 'titus', PHM: 'philemon', HEB: 'hebrews', JAS: 'james',
  '1PE': '1_peter', '2PE': '2_peter', '1JN': '1_john', '2JN': '2_john', '3JN': '3_john', JUD: 'jude', REV: 'revelation',
};

// ── Collect references used across the app ──
const texts = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(json|tsx?)$/.test(e.name) && !e.name.startsWith('scripture')) texts.push(fs.readFileSync(p, 'utf8'));
  }
};
walk(path.join(root, 'src'));
const found = new Map();
for (const t of texts) for (const r of findRefs(t)) found.set(r.key, r);

function versesOf(bible, seg) {
  const book = bible[seg.book];
  if (!book) return [];
  const out = [];
  const c2 = seg.c2 ?? seg.c1;
  for (let c = seg.c1; c <= c2; c++) {
    for (const verse of book[c] || []) {
      if (c === seg.c1 && seg.v1 !== undefined && verse.v < seg.v1) continue;
      if (c === c2) {
        const last = seg.v2 ?? (seg.c2 === undefined ? seg.v1 : undefined);
        if (last !== undefined && verse.v > last) continue;
      }
      out.push([c, verse.v, verse.t]);
    }
  }
  return out;
}

const refs = {};
const missing = [];
for (const [key, r] of found) {
  const web = r.segments.flatMap((sg) => versesOf(BIBLES.web, sg));
  const bsb = r.segments.flatMap((sg) => versesOf(BIBLES.bsb, sg));
  if (!web.length && !bsb.length) {
    missing.push(r.text);
    continue;
  }
  const display = displayRef(r.segments);
  const s0 = r.segments[0];
  refs[key] = {
    display,
    total: Math.max(web.length, bsb.length),
    web: web.slice(0, MAX_VERSES),
    bsb: bsb.slice(0, MAX_VERSES),
    links: {
      // Read the full passage in context
      web: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(display)}&version=WEB`,
      bsb: `https://biblehub.com/bsb/${HUB[s0.book]}/${s0.c1}.htm`,
    },
  };
}

const out = path.join(root, 'src/data/scripture.json');
fs.writeFileSync(
  out,
  JSON.stringify({
    meta: {
      translations: { web: 'World English Bible (WEB)', bsb: 'Berean Standard Bible (BSB)' },
      license: 'Both public domain',
      source: 'https://github.com/seven1m/open-bibles (eng-web.usfx.xml, eng-bsb.usfx.xml)',
      note: 'Every verse of each reference is stored, so the pop-up can show the whole passage.',
    },
    refs,
  }) + '\n',
);
console.log('books parsed', Object.keys(BIBLES.web).length, Object.keys(BIBLES.bsb).length, '| references', Object.keys(refs).length, '| unresolved', missing.length, missing.join(', '), '| bytes', fs.statSync(out).size);
const sample = refs['MRK 5:41'];
console.log('WEB:', sample.web[0][2]);
console.log('BSB:', sample.bsb[0][2]);
