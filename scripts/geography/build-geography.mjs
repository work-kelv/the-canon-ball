// Build src/data/bibleGeography.json
// Usage: node scripts/geography/build-geography.mjs <theographic-json-dir> <openbible-data-dir>
//   theographic dir: places.json, verses.json, books.json, people.json (github.com/robertrouse/theographic-bible-metadata)
//   openbible dir:   ancient.jsonl (github.com/openbibleinfo/Bible-Geocoding-Data)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoContains, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import { books as curatedBooks, journeys as curatedJourneys } from './curated-geography.mjs';
import { bookJourneys } from './curated-book-journeys.mjs';
import { writeups } from './curated-journey-writeups.mjs';

const EARTH_KM = 6371;
const km = (a, b) => geoDistance([a.lng, a.lat], [b.lng, b.lat]) * EARTH_KM;
/** Straight-line distances between consecutive stops (km). */
function distances(stops) {
  const legs = stops.slice(1).map((s, i) => Math.round(km(stops[i], s)));
  return { legKm: legs, distanceKm: legs.reduce((n, d) => n + d, 0) };
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [theoDir, obDir] = process.argv.slice(2);
const load = (d, f) => JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));

const PLACES = load(theoDir, 'places.json');
const VERSES = load(theoDir, 'verses.json');
const BOOKS = load(theoDir, 'books.json');
const PEOPLE = load(theoDir, 'people.json');
const canon = JSON.parse(fs.readFileSync(path.join(root, 'src/data/bibleBooks.json'), 'utf8')).books;
const chars = JSON.parse(fs.readFileSync(path.join(root, 'src/data/biblicalCharacters.json'), 'utf8')).characters;
const world = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/world-atlas/countries-50m.json'), 'utf8'));
const countries = feature(world, world.objects.countries).features;

// OpenBible: ancient id -> best modern identification
const modernOf = {};
for (const line of fs.readFileSync(path.join(obDir, 'ancient.jsonl'), 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const r = JSON.parse(line);
  const ident = (r.identifications || [])[0];
  if (ident?.description) modernOf[r.id] = ident.description.replace(/<[^>]+>/g, '').trim();
}

const bookOf = {};
for (const b of BOOKS) for (const v of b.fields.verses || []) bookOf[v] = b.fields.bookName;

const num = (x) => (x == null || x === '' ? null : Number(x));
const clean = (s) => s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
function firstSentences(text, max = 230) {
  if (!text) return null;
  const t = clean(text);
  let out = '';
  for (const s of t.split(/(?<=[.;])\s+(?=[A-Z(“"])/)) {
    if ((out + ' ' + s).length > max && out) break;
    out = (out ? out + ' ' : '') + s;
    if (out.length > 90) break;
  }
  return out.length > max ? out.slice(0, max - 1).replace(/\s\S*$/, '') + '…' : out;
}

function countryAt(lat, lng) {
  const pt = [lng, lat];
  const hit = countries.find((c) => geoContains(c, pt));
  let name = hit?.properties.name;
  if (!name) {
    // islands/coasts missed by the 50m polygons: nearest country by vertex distance
    let best = Infinity;
    for (const c of countries) {
      const rings = c.geometry.type === 'Polygon' ? [c.geometry.coordinates] : c.geometry.coordinates;
      for (const poly of rings) for (const ring of poly) for (const v of ring) {
        const d = geoDistance(pt, v);
        if (d < best) { best = d; name = c.properties.name; }
      }
    }
  }
  // Neutral wording for contested areas.
  if (geoDistance(pt, [35.235, 31.778]) < 0.0012) return 'Jerusalem (status disputed)';
  if (name === 'Palestine') return lat < 31.6 && lng < 34.6 ? 'Gaza Strip' : 'West Bank';
  return name;
}

// Characters: person verse sets for co-occurrence with places
const personVerses = {};
const lookupToChar = Object.fromEntries(chars.map((c) => [c.theographicId, c]));
// Jacob and his sons are also tagged on national/tribal uses ("children of Israel", "tribe of Gad");
// count only verses where the tag reads as the person (same rule as the characters dataset).
const TRIBAL = new Set(['israel_682', 'reuben_2429', 'simeon_2741', 'levi_1820', 'judah_1751', 'dan_973', 'naphtali_2149',
  'gad_1262', 'asher_337', 'issachar_645', 'zebulun_3002', 'joseph_1710', 'benjamin_463']);
const NATIONAL = /(children|house|elders|congregation|tribes?|camp|seed|excellency|land|families|assembly|armies|virgin|remnant|tents|people|kings?|princes|heads|cities|mountains|men|border|coast|lot|inheritance|wilderness|captivity|daughters|princess?|rulers|captains?|army|hosts?|nobles|towns|villages|gate|province) of (the )?$|his people $/i;
const mdOf = Object.fromEntries(VERSES.map((v) => [v.id, v.fields.mdText || '']));
function isPersonal(lookup, md) {
  const re = new RegExp(`\\[([^\\]]+)\\]\\(/person/${lookup}\\)`, 'g');
  let m;
  while ((m = re.exec(md))) {
    const before = md.slice(Math.max(0, m.index - 40), m.index).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    if (!NATIONAL.test(before)) return true;
  }
  return false;
}
for (const p of PEOPLE) {
  const lookup = p.fields.personLookup;
  const c = lookupToChar[lookup];
  if (!c) continue;
  const vs = (p.fields.verses || []).filter((v) => !TRIBAL.has(lookup) || isPersonal(lookup, mdOf[v]));
  personVerses[c.id] = new Set(vs);
}

// Place index
const place = {};
const byTitle = {};
for (const p of PLACES) {
  const f = p.fields;
  const lat = num(f.latitude), lng = num(f.longitude);
  const perBook = {};
  for (const v of f.verses || []) {
    const b = bookOf[v];
    if (b) perBook[b] = (perBook[b] || 0) + 1;
  }
  const obId = f.openBibleUri ? f.openBibleUri.split('/').pop() : null;
  place[f.placeLookup] = {
    id: f.placeLookup,
    // Theographic disambiguates e.g. "Bethel (of Palestine)"; keep the plain name for display.
    name: f.displayTitle.replace(/ \(of [^)]+\)$/, ''),
    lat, lng,
    featureType: f.featureType || f.featureSubType || null,
    verses: f.verses || [],
    perBook,
    modern: obId ? modernOf[obId] || null : null,
    description: firstSentences(Array.isArray(f.dictText) ? f.dictText[0] : f.dictText),
    openBible: f.openBibleUri || null,
    pleiades: f.pleiadesUri || null,
  };
  (byTitle[f.displayTitle] ??= []).push(place[f.placeLookup]);
}
const resolve = (title) => {
  const c = (byTitle[title] || []).filter((p) => p.lat != null);
  return c.sort((a, b) => b.verses.length - a.verses.length)[0] || null;
};

const used = new Set();
const orderOf = Object.fromEntries(canon.map((b) => [b.name, b.order]));

function pin(curated) {
  const p = curated.place ? resolve(curated.place) : null;
  if (curated.place && !p) console.warn('  unresolved place:', curated.place);
  if (p) used.add(p.id);
  const [lat, lng] = curated.at;
  return {
    placeName: curated.name,
    placeId: p?.id ?? null,
    modernCountry: countryAt(lat, lng),
    lat, lng,
  };
}

const outBooks = canon.map((b) => {
  const c = curatedBooks[b.order];
  if (!c) throw new Error('no curated geography for ' + b.name);
  const origin = { ...pin(c.origin), confidenceNote: c.originNote };
  const setting = { ...pin(c.setting), regionName: c.region };
  const key = Object.values(place)
    .filter((p) => p.lat != null && p.perBook[b.name])
    .sort((x, y) => y.perBook[b.name] - x.perBook[b.name] || y.verses.length - x.verses.length)
    .slice(0, 8)
    .filter((p, i) => i < 3 || p.perBook[b.name] >= 2)
    .map((p) => {
      used.add(p.id);
      return {
        placeId: p.id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        mentionCount: p.perBook[b.name],
        significance: p.description || (p.featureType ? `${p.featureType} named in ${b.name}.` : `Named in ${b.name}.`),
      };
    });
  return {
    book: b.name,
    order: b.order,
    testament: b.testament,
    division: b.division,
    origin,
    destinationOrSetting: setting,
    keyLocations: key,
    ...(c.journeyId ? { journeyId: c.journeyId } : {}),
    journeys: (bookJourneys[b.order] || []).map((j, i) => {
      let stops;
      if (j.major) {
        const mj = curatedJourneys.find((x) => x.id === j.major);
        if (!mj) throw new Error('unknown major journey ' + j.major);
        const leg = j.leg ? mj.legs.find((l) => l.id === j.leg) : mj.legs[0];
        if (!leg) throw new Error('unknown leg ' + j.leg);
        const wps = j.slice ? leg.waypoints.slice(j.slice[0], j.slice[1]) : leg.waypoints;
        stops = wps.map((w) => ({ name: w.name, lat: w.at[0], lng: w.at[1], ref: w.ref, place: w.place }));
      } else {
        stops = j.stops.map(([name, lat, lng, ref]) => ({ name, lat, lng, ...(ref ? { ref } : {}) }));
      }
      stops = stops.map((st) => {
        const p = resolve(st.place || st.name);
        if (p) used.add(p.id);
        const { place: _ignored, ...rest } = st;
        return { ...rest, placeId: p?.id ?? null };
      });
      return {
        id: `${b.order}-${i + 1}`,
        title: j.title,
        who: j.who,
        ref: j.ref,
        summary: j.summary,
        kind: j.kind || 'travel',
        ...(j.major ? { majorId: j.major, legId: j.leg || null } : {}),
        stops,
        ...distances(stops),
      };
    }),
  };
});

const outJourneys = curatedJourneys.map((j) => ({
  ...j,
  writeup: writeups[j.id]?.writeup ?? [],
  legs: j.legs.map((leg) => ({
    ...leg,
    about: writeups[j.id]?.legs?.[leg.id] ?? '',
    waypoints: leg.waypoints.map((w, i) => {
      const p = w.place ? resolve(w.place) : null;
      if (w.place && !p) console.warn('  unresolved waypoint place:', w.place);
      if (p) used.add(p.id);
      return { n: i + 1, name: w.name, lat: w.at[0], lng: w.at[1], ref: w.ref, note: w.note, placeId: p?.id ?? null };
    }),
    ...distances(leg.waypoints.map((w) => ({ lat: w.at[0], lng: w.at[1] }))),
  })),
}));

// Place catalogue for the inspector (only places the map can show)
const outPlaces = {};
for (const id of used) {
  const p = place[id];
  const vs = new Set(p.verses);
  const people = chars
    .map((c) => {
      const pv = personVerses[c.id];
      let n = 0;
      if (pv) for (const v of pv) if (vs.has(v)) n++;
      return { id: c.id, name: c.name, verses: n };
    })
    .filter((x) => x.verses > 0)
    .sort((a, b) => b.verses - a.verses)
    .slice(0, 8);
  outPlaces[id] = {
    id,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    featureType: p.featureType,
    modern: p.modern,
    modernCountry: p.lat != null ? countryAt(p.lat, p.lng) : null,
    description: p.description,
    verseCount: p.verses.length,
    books: Object.entries(p.perBook)
      .map(([book, verses]) => ({ book, order: orderOf[book], verses }))
      .sort((a, b) => b.verses - a.verses || a.order - b.order)
      .slice(0, 12),
    people,
    openBible: p.openBible,
    pleiades: p.pleiades,
  };
}

const result = {
  meta: {
    sources: [
      'Theographic Bible Metadata — json/places.json, verses.json, books.json, people.json (CC BY-SA 4.0)',
      'OpenBible.info Bible Geocoding Data — data/ancient.jsonl (modern identifications; CC BY 4.0)',
      'Natural Earth via world-atlas (countries-50m) — modern country lookup',
    ],
    method:
      'keyLocations: places with coordinates tagged in the book\'s verses, ranked by verse count (up to 8; places named only once are dropped after the top 3). significance: opening of the Easton\'s Bible Dictionary entry carried by Theographic. modern: OpenBible.info\'s top identification. modernCountry: point-in-polygon against Natural Earth borders. people: characters tagged in the same verses as the place. origin/destinationOrSetting and journeys are curated; origins are often traditional or uncertain (see confidenceNote).',
    generated: new Date().toISOString().slice(0, 10),
  },
  books: outBooks,
  journeys: outJourneys,
  places: outPlaces,
};
const out = path.join(root, 'src/data/bibleGeography.json');
fs.writeFileSync(out, JSON.stringify(result, null, 1) + '\n');

// Report
console.log('books', outBooks.length, 'places', Object.keys(outPlaces).length, 'journeys', outJourneys.length, 'bytes', fs.statSync(out).size);
console.log('book journeys', outBooks.reduce((n, b) => n + b.journeys.length, 0), '| books without journeys:', outBooks.filter((b) => !b.journeys.length).map((b) => b.book).join(', '));
console.log(outBooks.filter((b) => [1, 2, 32, 44, 66].includes(b.order)).map((b) => b.book + ': ' + b.journeys.map((j) => `${j.title} ${j.distanceKm} km`).join(' | ')).join(String.fromCharCode(10)));
console.log(outJourneys.map((j) => j.legs.map((l) => `${l.label}: ${l.distanceKm} km`).join(', ')).join(String.fromCharCode(10)));
if (0) console.log(outBooks.map((b) => `${b.book}: ${b.keyLocations.length} [${b.keyLocations.slice(0, 4).map((k) => k.name + ':' + k.mentionCount).join(', ')}] ${b.origin.placeName}(${b.origin.modernCountry}) → ${b.destinationOrSetting.placeName}(${b.destinationOrSetting.modernCountry})`).join('\n'));
