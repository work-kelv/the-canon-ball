// Build the downloadable summary posters (one per page) into public/downloads/.
//
//   npm run build && npx vite preview --base /the-canon-ball/ --port 4180   (or any server for dist/)
//   BROWSER="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" node scripts/posters/build-posters.mjs [baseUrl]
//
// Every number comes from the site's own data files; the map, network and family-tree pictures are
// screenshots of the live pages, so the posters always match the site.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { WITNESSES, EVENTS, ERAS as PEOPLE_ERAS } from '../../src/lib/witnesses.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, 'src/data', f), 'utf8'));
const base = process.argv[2] ?? 'http://localhost:4180/the-canon-ball/';
const browserPath = process.env.BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const outDir = path.join(root, 'public/downloads');
fs.mkdirSync(outDir, { recursive: true });

const books = read('bibleBooks.json').books;
const chars = read('biblicalCharacters.json').characters;
const geo = read('bibleGeography.json');
const branches = read('churchBranches.json').branches;
const creeds = read('historicCreeds.json').creeds;
const trad = read('traditionsCompared.json');
const translations = read('bibleTranslations.json');

const fmt = (n) => n.toLocaleString('en-GB');
const C = {
  paper: '#F6F0E1', paper2: '#ECE2CB', ink: '#1F1A15', soft: '#5C5042', rule: '#C4B496',
  hebrew: '#9E3A22', aramaic: '#1F7068', greek: '#263E80', lineage: '#B01C28',
  patriarch: '#855426', judge: '#60701E', king: '#B0800E', prophet: '#A63422', priest: '#703E8C', apostle: '#264896', key: '#466470',
  family: '#BA8428', mentor: '#188070', ally: '#5878B4', rival: '#C4223A',
};

// ---------- figures ----------
const chapters = books.reduce((n, b) => n + b.chapters, 0);
const verses = books.reduce((n, b) => n + b.verses, 0);
const share = { Hebrew: 0, Aramaic: 0, Greek: 0 };
for (const b of books) for (const l of b.languages) share[l.language] += (b.chapters * l.percent) / 100;
const pct = (k) => Math.round((share[k] / chapters) * 100);
const count = (arr, f) => arr.reduce((m, x) => ((m[f(x)] = (m[f(x)] ?? 0) + 1), m), {});
const relCount = count(chars.flatMap((c) => c.relationships ?? []), (r) => r.type);
const rels = Object.values(relCount).reduce((a, b) => a + b, 0);
const places = Object.values(geo.places);
const journeys = geo.books.flatMap((b) => b.journeys ?? []);
const stops = journeys.reduce((n, j) => n + j.stops.length, 0);
const km = Math.round(journeys.reduce((n, j) => n + (j.distanceKm ?? 0), 0) / 100) * 100;
const topPlaces = [...places].sort((a, b) => b.verseCount - a.verseCount).slice(0, 8);

// ---------- shared poster frame ----------
const FONTS =
  '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">';
const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{width:1200px;background:${C.paper};color:${C.ink};font-family:Inter,system-ui,sans-serif}
.poster{width:1200px;min-height:1700px;padding:64px 72px 56px;background:radial-gradient(ellipse at top,#FBF7EC,${C.paper} 60%,${C.paper2});position:relative}
.eyebrow{font:600 15px Inter;letter-spacing:.22em;text-transform:uppercase;color:${C.soft}}
h1{font:700 76px/1.02 Fraunces,Georgia,serif;letter-spacing:-.01em;margin-top:10px}
.sub{font:400 25px/1.4 "Source Serif 4",Georgia,serif;color:${C.soft};margin-top:14px;max-width:920px}
.rule{border-top:4px double ${C.ink};margin:30px 0 28px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.stat{border:1px solid ${C.rule};border-radius:10px;padding:16px 18px;background:rgba(255,255,255,.35)}
.stat b{display:block;font:700 46px/1 Fraunces,serif}
.stat span{display:block;margin-top:6px;font:500 15px Inter;color:${C.soft};text-transform:uppercase;letter-spacing:.1em}
h2{font:600 30px Fraunces,serif;margin:34px 0 14px;display:flex;align-items:baseline;gap:12px}
h2 small{font:500 15px Inter;color:${C.soft};letter-spacing:.08em;text-transform:uppercase}
.row{display:grid;gap:28px}
.bar{display:flex;height:40px;border-radius:999px;overflow:hidden;border:1px solid ${C.rule}}
.bar div{display:flex;align-items:center;justify-content:center;color:#fff;font:600 16px Inter;white-space:nowrap}
.hbar{display:grid;grid-template-columns:240px 1fr 64px;align-items:center;gap:12px;margin:7px 0;font:500 17px Inter}
.hbar i{display:block;height:18px;border-radius:999px}
.hbar em{font-style:normal;text-align:right;color:${C.soft};font-variant-numeric:tabular-nums}
.card{border:1px solid ${C.rule};border-radius:12px;padding:18px 20px;background:rgba(255,255,255,.35)}
.card h3{font:600 21px Fraunces,serif;margin-bottom:6px}
.card p,.note{font:400 18px/1.45 "Source Serif 4",serif}
.note{color:${C.soft}}
.shot{width:100%;border:1px solid ${C.rule};border-radius:12px;display:block}
.chip{display:inline-flex;align-items:center;gap:8px;font:500 16px Inter;margin:0 18px 8px 0}
.chip i{width:14px;height:14px;border-radius:50%;display:inline-block}
.foot{position:absolute;left:72px;right:72px;bottom:40px;display:flex;justify-content:space-between;font:500 14px Inter;color:${C.soft};border-top:1px solid ${C.rule};padding-top:14px}
`;
const page = (eyebrow, title, sub, body, sources) => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${CSS}</style></head><body><div class="poster">
<div class="eyebrow">The Canon Ball · ${eyebrow}</div><h1>${title}</h1><p class="sub">${sub}</p><div class="rule"></div>
${body}
<div style="height:70px"></div>
<div class="foot"><span>work-kelv.github.io/the-canon-ball</span><span>${sources}</span></div></div></body></html>`;
const stats = (items) => `<div class="stats">${items.map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('')}</div>`;
const hbars = (rows, max, color) =>
  rows.map(([label, n, col]) => `<div class="hbar"><span>${label}</span><i style="width:${(n / max) * 100}%;background:${col ?? color}"></i><em>${fmt(n)}</em></div>`).join('');

// ---------- 1. The Bible ----------
function bible() {
  const tile = (b) => {
    const ar = b.languages.find((l) => l.language === 'Aramaic')?.percent ?? 0;
    const col = b.testament === 'Old' ? C.hebrew : C.greek;
    const shade = 0.45 + 0.55 * Math.min(1, b.chapters / 50);
    const arStop = ar ? Math.max(ar, 12) : 0;
    const bg = ar ? `linear-gradient(135deg, ${col} ${100 - arStop}%, ${C.aramaic} ${100 - arStop}%)` : col;
    return `<div title="${b.name}" style="height:54px;border-radius:5px;background:${bg};opacity:${shade.toFixed(2)};display:flex;align-items:flex-end;padding:4px 5px;color:#fff;font:600 11.5px Inter">${b.abbrev}</div>`;
  };
  const canons = [['Protestant', 66, C.greek], ['Catholic', 73, C.king], ['Eastern Orthodox', 77, C.priest, '76–79'], ['Ethiopian', 81, C.judge]];
  const st = translations.meta.stats;
  const body = `
${stats([[66, 'books'], [fmt(chapters), 'chapters'], [fmt(verses), 'verses'], [3, 'languages']])}
<h2>The 66 books, by original language <small>in Bible order · darker = more chapters</small></h2>
<div style="display:grid;grid-template-columns:repeat(11,1fr);gap:5px">${books.map(tile).join('')}</div>
<div style="margin-top:16px" class="bar">
 <div style="width:${pct('Hebrew')}%;background:${C.hebrew}">Hebrew ${pct('Hebrew')}%</div>
 <div style="width:${Math.max(pct('Aramaic'), 4)}%;background:${C.aramaic}">${pct('Aramaic')}%</div>
 <div style="width:${pct('Greek')}%;background:${C.greek}">Greek ${pct('Greek')}%</div></div>
<p class="note" style="margin-top:8px">Aramaic, the language of the exile, in Daniel 2–7, Ezra 4–7, Jeremiah 10:11 and two words of Genesis 31:47.</p>
<div class="row" style="grid-template-columns:1fr 1fr;margin-top:6px">
 <div><h2>When they were written</h2>
  <div class="card"><h3>Old Testament · c. 1450–160 BC</h3><p>Written over about a thousand years, in Hebrew, with Aramaic from the exile.</p></div>
  <div class="card" style="margin-top:12px"><h3>New Testament · c. AD 45–125</h3><p>Written within a single lifetime, in the common Greek of the Roman world.</p></div></div>
 <div><h2>Which books? <small>books in each Bible</small></h2>
  ${canons.map(([n, v, col, lab]) => `<div class="hbar" style="grid-template-columns:170px 1fr 70px"><span>${n}</span><span style="display:flex;height:18px;border-radius:999px;overflow:hidden;background:rgba(0,0,0,.05)"><i style="width:${(66 / 81) * 100}%;height:18px;background:${C.ink};opacity:.55;border-radius:0"></i><i style="width:${((v - 66) / 81) * 100}%;height:18px;background:${col};border-radius:0"></i></span><em>${lab ?? v}</em></div>`).join('')}
  <p class="note" style="margin-top:8px">All churches share the same 66 (grey); Catholic, Orthodox and Ethiopian Bibles add further books.</p></div>
</div>
<h2>From scrolls to chapter and verse</h2>
<div class="row" style="grid-template-columns:repeat(4,1fr);gap:12px">
 ${[['c. 300 BC', 'Greek written without spaces or numbers'], ['1205', 'Stephen Langton divides the chapters'], ['1551', 'Robert Estienne numbers the verses'], ['1560', 'The Geneva Bible brings both to English']].map(([y, t]) => `<div class="card"><h3>${y}</h3><p>${t}</p></div>`).join('')}
</div>
<h2>Translated for the world <small>Wycliffe Global Alliance, 2025</small></h2>
${stats(st.slice(0, 4).map((s) => [s.value, s.label.replace(/ \(.*\)$/, '')]))}`;
  return page('The Bible', 'One library,<br>three languages', 'How the 66 books were written in Hebrew, Aramaic and Greek, gathered into a canon, divided into chapters and verses, and translated into the world’s languages.', body, 'Sources: Masoretic Text · SBL Greek New Testament · Wycliffe Global Alliance');
}

// ---------- 2. Characters ----------
function characters(network) {
  const ROLE = { 'Key Figure': C.key, 'King/Ruler': C.king, 'Patriarch/Matriarch': C.patriarch, 'Apostle/Disciple': C.apostle, Prophet: C.prophet, Priest: C.priest, Judge: C.judge };
  const roles = Object.entries(count(chars, (c) => c.role)).sort((a, b) => b[1] - a[1]);
  const eraOrder = ['Creation & Patriarchs', 'Exodus & Wilderness', 'Judges', 'United & Divided Kingdom', 'Exile & Return', 'Intertestamental', 'Gospels', 'Early Church'];
  const eras = count(chars, (c) => c.era);
  const REL = { Family: C.family, 'Ally/Companion': C.ally, 'Rival/Adversary': C.rival, 'Mentor/Disciple': C.mentor };
  const body = `
${stats([[chars.length, 'people'], [fmt(rels), 'relationships'], [8, 'eras'], [65, 'generations to Jesus']])}
<h2>A web of relationships <small>family · friends · rivals · mentors</small></h2>
<div class="shot" style="position:relative;height:700px;overflow:hidden;background:#F2EAD8"><img src="${network}" style="position:absolute;left:50%;top:50%;width:175%;transform:translate(-57.5%,-41%)"></div>
<div class="row" style="grid-template-columns:1fr 1fr;margin-top:4px">
 <div><h2>People in each era</h2>${hbars(eraOrder.map((e) => [e.replace('United & Divided Kingdom', 'Kingdom'), eras[e] ?? 0]), 62, C.ink)}</div>
 <div><h2>Their roles</h2>${hbars(roles.map(([r, n]) => [r, n, ROLE[r]]), 98)}</div>
</div>
<h2>How they are connected</h2>
${hbars(Object.entries(relCount).sort((a, b) => b[1] - a[1]).map(([r, n]) => [r, n, REL[r]]), 261)}
<div class="card" style="margin-top:20px;border-left:5px solid ${C.lineage}"><h3>The line of Jesus</h3><p>A single thread runs through the whole story: 65 generations from Adam, through Noah, Abraham, Judah, Boaz, David and Solomon, to Jesus.</p></div>`;
  return page('Characters', '266 people,<br>one story', 'Everyone from Adam to the early church on one timeline, with their families, friendships, rivalries and mentors.', body, 'Source: Theographic Bible Metadata (CC BY-SA 4.0)');
}

// ---------- 3. Map ----------
function map(mapShot) {
  const ftypes = Object.entries(count(places, (p) => p.featureType ?? 'Unclassified')).sort((a, b) => b[1] - a[1]);
  const great = [
    ['Abraham', 'Ur → Haran → Canaan → Egypt and back', C.patriarch],
    ['The Exodus', 'Egypt → the Red Sea → Sinai → Moab', C.prophet],
    ['Exile and return', 'Jerusalem → Babylon → Jerusalem', C.judge],
    ['Jesus’ ministry', 'Bethlehem → Nazareth → Galilee → Jerusalem', C.lineage],
    ['Paul', 'Antioch → Asia Minor → Greece → Rome', C.greek],
  ];
  const body = `
${stats([[places.length, 'places'], [journeys.length, 'journeys'], [stops, 'stops'], [`${fmt(km)} km`, 'travelled']])}
<h2>Paul’s second journey <small>one of 129 journeys you can play</small></h2>
<img class="shot" style="height:820px;object-fit:cover;object-position:50% 42%" src="${mapShot}">
<div class="row" style="grid-template-columns:1.1fr 1fr;margin-top:4px">
 <div><h2>Most-named places <small>verses</small></h2>${hbars(topPlaces.map((p) => [p.name, p.verseCount, C.greek]), topPlaces[0].verseCount)}</div>
 <div><h2>The five great journeys</h2>${great.map(([n, r, c]) => `<div class="card" style="margin-bottom:10px;border-left:5px solid ${c};padding:12px 16px"><h3 style="margin:0">${n}</h3><p style="font-size:16px">${r}</p></div>`).join('')}</div>
</div>
<h2>Kinds of place</h2>
<div>${ftypes.map(([t, n]) => `<span class="chip"><i style="background:${C.soft}"></i>${t} ${n}</span>`).join('')}</div>`;
  return page('Map', 'Lands of<br>the Bible', 'Where each of the 66 books was written and set, the places it names, and the journeys its people made, from Ur to Rome.', body, 'Sources: Theographic · OpenBible.info · Pleiades · Natural Earth');
}

// ---------- 4. Church History ----------
function history(treeShot) {
  const fam = [['Catholic', 50, C.king], ['Protestant', 37, C.greek], ['Orthodox', 12, C.priest]];
  const body = `
${stats([['2,000', 'years'], [branches.length, 'traditions'], [creeds.length, 'historic creeds'], [WITNESSES.length, 'key people']])}
<h2>The family tree of the church <small>from Pentecost to today</small></h2>
<img class="shot" src="${treeShot}">
<h2>The four creeds</h2>
<div class="row" style="grid-template-columns:repeat(4,1fr);gap:12px">${creeds.map((c) => `<div class="card"><h3>${c.name.replace(' Definition', '')}</h3><p class="note" style="font-size:16px">${c.date}</p></div>`).join('')}</div>
<div class="row" style="grid-template-columns:1fr 1fr;margin-top:4px">
 <div><h2>Ten questions they differ on</h2><ol style="margin-left:22px;font:400 17px/1.55 'Source Serif 4',serif">${trad.topics.map((t) => `<li>${t.question}</li>`).join('')}</ol></div>
 <div><h2>The Christian family today</h2>
  <div class="bar">${fam.map(([n, v, c]) => `<div style="width:${v}%;background:${c}">${v >= 30 ? n + ' ' : ''}${v}%</div>`).join('')}</div>
  <p class="note" style="margin-top:8px">2.18 billion Christians (Pew Research Center, 2010): Catholic 50% · Protestant 37% · Orthodox 12%.</p>
  <h2>From Jesus to today</h2><p class="note">${WITNESSES.length} people and ${EVENTS.length} councils and events in ${PEOPLE_ERAS.length} eras: the apostles, the church fathers, the councils, the Reformers and the missionaries.</p>
  <div class="card" style="margin-top:16px;border-left:5px solid ${C.lineage}"><p><i>“Let us run with perseverance the race that is set before us, looking to Jesus, the author and perfecter of faith.”</i></p><p class="note" style="font-size:15px;margin-top:6px">Hebrews 12:1–2</p></div></div>
</div>`;
  return page('Church History', 'Two thousand years<br>of the church', 'How one church became many traditions, what the creeds confess, where the churches differ, and the core faith they share.', body, 'Sources: Schaff · Eusebius · the churches’ own confessions · Pew Research Center');
}

// ---------- render ----------
const browser = await puppeteer.launch({ executablePath: browserPath, headless: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function shoot(url, prep, selector, w = 1440, h = 1000) {
  const p = await browser.newPage();
  await p.evaluateOnNewDocument(() => localStorage.setItem('theme', 'light'));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await p.goto(base + url, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await prep(p);
  const el =
    selector === 'LARGEST'
      ? (await p.evaluateHandle(() => [...document.querySelectorAll('main svg')].sort((a, b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height)[0])).asElement()
      : await p.$(selector);
  const png = await el.screenshot({ type: 'png' });
  await p.close();
  return 'data:image/png;base64,' + Buffer.from(png).toString('base64');
}
const network = await shoot(
  'characters.html#network',
  async (p) => {
    await sleep(9000);
    await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Fit to view'))?.click());
    await sleep(1500);
    // the graph is a canvas; hide its on-screen controls
    await p.evaluate(() => document.querySelectorAll('main .absolute.right-3.top-3').forEach((e) => (e.style.visibility = 'hidden')));
  },
  'main div.touch-none',
);
const mapShot = await shoot(
  'map.html#journeys',
  async (p) => {
    await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label')?.startsWith('Play Paul') && x.getAttribute('aria-label').includes('Journey 2'))?.click());
    await sleep(8000);
    // keep only the map drawing: hide the player, zoom buttons and hints laid over it
    await p.evaluate(() => {
      const svg = document.querySelector('svg[aria-label^="Map of the Mediterranean"]');
      let box = svg;
      while (box && box.parentElement && box.parentElement.getBoundingClientRect().height - svg.getBoundingClientRect().height < 40) box = box.parentElement;
      box.querySelectorAll('button, [class*="absolute"]').forEach((e) => { if (!e.contains(svg)) e.style.visibility = 'hidden'; });
    });
  },
  'svg[aria-label^="Map of the Mediterranean"]',
);
const treeShot = await shoot('history.html#tree', async (p) => sleep(600), '#tree svg[aria-label^="Branching"]');

const posters = [
  ['the-canon-ball-poster-bible.png', bible()],
  ['the-canon-ball-poster-characters.png', characters(network)],
  ['the-canon-ball-poster-map.png', map(mapShot)],
  ['the-canon-ball-poster-church-history.png', history(treeShot)],
];
for (const [name, html] of posters) {
  const p = await browser.newPage();
  await p.setViewport({ width: 1200, height: 1700, deviceScaleFactor: 2 });
  await p.setContent(html, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  await sleep(400);
  await p.screenshot({ path: path.join(outDir, name), fullPage: true, type: 'png' });
  // a small preview for the home page
  await p.setViewport({ width: 1200, height: 1700, deviceScaleFactor: 0.4 });
  await sleep(200);
  await p.screenshot({ path: path.join(outDir, name.replace('.png', '-thumb.jpg')), clip: { x: 0, y: 0, width: 1200, height: 1500 }, type: 'jpeg', quality: 82 });
  console.log('saved', name);
  await p.close();
}
await browser.close();
