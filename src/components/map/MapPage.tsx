import { MapIntro } from '../PageIntros';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, BookOpen, ListVideo, ChevronLeft, ChevronRight, ExternalLink, Feather, Globe2, MapPin, Maximize2, Minimize2, Play, Route, Search, Users } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import {
  type AnimRoute,
  type BookGeo,
  type BookJourney,
  type Journey,
  KIND_LABEL,
  LEG_STYLE,
  REGIONS,
  fmtDistance,
  geoBooks,
  journeys,
  places,
} from '../../lib/geography';
import { DIVISIONS } from '../../lib/books';
import { Segmented } from '../characters/controls';
import { RefText } from '../ScriptureRef';
import { MapCanvas, type Selection } from './MapCanvas';
import { DetailHeader, DetailSheet, useDetailKeys, useMedia } from '../DetailSheet';
import { BOOK_INTROS } from '../../lib/bookIntros';
import { getLevel, useLevel } from '../../lib/level';
import { AtLevel } from '../LevelSwitch';

type Mode = 'books' | 'journeys';

const ALL_JOURNEYS = journeys.map((j) => j.id);

/** Read #book=45 / #journeys from the URL so views can be linked. */
function initialState(): { mode: Mode; order: number } {
  const h = location.hash;
  const m = h.match(/book=(\d+)/);
  if (h.includes('journeys') || (!m && getLevel() === 'beginner')) return { mode: 'journeys', order: 1 };
  return { mode: 'books', order: m ? Math.min(66, Math.max(1, Number(m[1]))) : 1 };
}

const footprint = (b: BookGeo): [number, number][] => [
  [b.origin.lng, b.origin.lat],
  [b.destinationOrSetting.lng, b.destinationOrSetting.lat],
  ...b.keyLocations.map((l) => [l.lng, l.lat] as [number, number]),
];

const KIND_STYLE: Record<BookJourney['kind'], { css: string; dash?: string }> = {
  travel: { css: '--lineage' },
  letter: { css: '--greek' },
  plan: { css: '--ink-soft', dash: '6 4' },
  vision: { css: '--role-priest', dash: '2 5' },
};

function routeOfBookJourney(j: BookJourney): AnimRoute {
  const style = j.legId ? LEG_STYLE[j.legId] : j.majorId ? LEG_STYLE[journeys.find((x) => x.id === j.majorId)?.legs[0].id ?? ''] : null;
  const st = style ?? KIND_STYLE[j.kind];
  return { key: j.id, title: j.title, css: st.css, dash: st.dash, stops: j.stops, legKm: j.legKm, distanceKm: j.distanceKm };
}

function routeOfLeg(j: Journey, legId: string): AnimRoute {
  const leg = j.legs.find((l) => l.id === legId)!;
  const st = LEG_STYLE[leg.id] ?? { css: '--ink' };
  return {
    key: `major:${leg.id}`,
    title: j.legs.length > 1 ? (j.id === "paul-journeys" ? `Paul · ${leg.label}` : leg.label) : j.name,
    css: st.css,
    dash: st.dash,
    stops: leg.waypoints,
    legKm: leg.legKm,
    distanceKm: leg.distanceKm,
  };
}

function useWide() {
  const q = '(min-width: 768px)';
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

/** "Ur → Haran → … → Bethel" */
function stopChain(names: string[]) {
  const short = names.map((n) => n.replace(/ \(.*\)$/, ''));
  if (short.length <= 6) return short.join(' → ');
  return [...short.slice(0, 3), '…', ...short.slice(-2)].join(' → ');
}

function BookList({ order, onPick }: { order: number; onPick: (o: number) => void }) {
  const [q, setQ] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const shown = geoBooks.filter((b) => b.book.toLowerCase().includes(q.trim().toLowerCase()));
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-order="${order}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [order]);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <label className="relative mb-2 block">
        <span className="sr-only">Find a book</span>
        <Search size={14} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a book…"
          className="focus-ring w-full rounded-full border border-rule bg-paper/70 py-1.5 pl-8 pr-3 font-sans text-sm"
        />
      </label>
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
        {DIVISIONS.map((d) => {
          const items = shown.filter((b) => b.division === d.name);
          if (!items.length) return null;
          return (
            <div key={d.name} className="mb-2">
              <div className="eyebrow sticky top-0 z-[1] bg-paper/95 px-2 py-1 backdrop-blur">{d.name}</div>
              {items.map((b) => (
                <button
                  key={b.order}
                  data-order={b.order}
                  onClick={() => onPick(b.order)}
                  className={`focus-ring flex w-full items-baseline gap-2 rounded-sm px-2 py-1 text-left font-sans text-sm ${
                    b.order === order ? 'bg-ink font-semibold text-paper' : 'hover:bg-ink/[0.05]'
                  }`}
                >
                  <span className={`w-5 shrink-0 text-right text-[12px] tabular-nums ${b.order === order ? 'text-paper/70' : 'text-ink-soft'}`}>{b.order}</span>
                  <span className="min-w-0 flex-1 break-words leading-tight">{b.book}</span>
                  {b.journeys.length > 0 && (
                    <span className={`shrink-0 text-[12px] tabular-nums ${b.order === order ? 'text-paper/70' : 'text-ink-soft'}`} title={`${b.journeys.length} journeys`}>
                      {b.journeys.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
        active ? 'border-ink bg-ink text-paper' : 'border-rule hover:border-ink/60'
      }`}
    >
      <Play size={13} className="translate-x-px" />
    </button>
  );
}

function JourneyList({
  active,
  onToggle,
  routeKey,
  onPlay,
  onPlayAll,
}: {
  active: Set<string>;
  onToggle: (id: string) => void;
  routeKey: string | null;
  onPlay: (j: Journey, legId: string) => void;
  onPlayAll: () => void;
}) {
  const legs = journeys.filter((j) => active.has(j.id)).reduce((n, j) => n + j.legs.length, 0);
  return (
    <div className="space-y-2">
      {legs > 1 && (
        <div className="flex items-center justify-between gap-2 px-0.5">
          <span className="font-sans text-[12px] text-ink-soft">{legs} routes ticked</span>
        <button
          onClick={onPlayAll}
          className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-sans text-[12px] font-semibold text-paper hover:opacity-90"
          title="Play all"
        >
          <ListVideo size={14} aria-hidden /> Play all
        </button>
        </div>
      )}
      {journeys.map((j) => {
        const on = active.has(j.id);
        return (
          <div key={j.id} className={`rounded-md border p-2.5 transition-colors ${on ? 'border-ink/40 bg-paper' : 'border-rule'}`}>
            <label className="flex cursor-pointer items-start gap-2">
              <input type="checkbox" checked={on} onChange={() => onToggle(j.id)} className="mt-1 h-4 w-4 accent-current" />
              <span className="min-w-0">
                <span className="block font-display text-[15px] font-semibold leading-tight">{j.name}</span>
                <span className="mt-0.5 block font-sans text-[12px] leading-snug text-ink-soft">{j.summary}</span>
              </span>
            </label>
            <ul className="mt-2 space-y-1">
              {j.legs.map((l) => (
                <li key={l.id} className="flex items-center gap-2 font-sans text-[12px]">
                  <svg width="18" height="6" aria-hidden className="shrink-0">
                    <line x1="0" y1="3" x2="18" y2="3" stroke={cssColor(LEG_STYLE[l.id]?.css ?? '--ink')} strokeWidth="3" strokeDasharray={LEG_STYLE[l.id]?.dash ? '4 3' : undefined} />
                  </svg>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words leading-snug">{j.legs.length > 1 ? l.label : `${l.waypoints.length} stops`}</span>
                    <span className="block text-[12px] tabular-nums text-ink-soft">{fmtDistance(l.distanceKm)}</span>
                  </span>
                  <PlayButton active={routeKey === `major:${l.id}`} onClick={() => onPlay(j, l.id)} label={`Play ${j.name}${j.legs.length > 1 ? ` — ${l.label}` : ''}`} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <p className="px-1 font-sans text-[12px] leading-snug text-ink-soft">
        Press ▶ to watch a route unfold, or click a numbered stop for its Scripture reference. Routes are traditional reconstructions; several (the Exodus, the return from exile) are uncertain. Distances are straight lines between stops.
      </p>
    </div>
  );
}

interface InspectorNav {
  position: string;
  prev: (() => void) | null;
  next: (() => void) | null;
}

function Inspector({
  sel,
  book,
  onClose,
  onPickBook,
  nav,
  asSheet,
}: {
  sel: Selection;
  book: BookGeo | null;
  onClose: () => void;
  onPickBook: (order: number) => void;
  nav: InspectorNav | null;
  /** Phones: a bottom sheet over the lower half, leaving the map visible above. */
  asSheet: boolean;
}) {
  // Esc and ←/→ for the card (the sheet has its own).
  useDetailKeys(asSheet ? null : onClose, asSheet ? null : nav?.prev, asSheet ? null : nav?.next);
  const level = useLevel();
  let heading = '';
  let kicker = '';
  let extra: ReactNode = null;
  let placeId: string | null = null;
  let country: string | null = null;

  if (sel.kind === 'place') {
    placeId = sel.placeId;
    const p = places[placeId];
    heading = p?.name ?? '';
    kicker = p?.featureType ?? 'Place';
    if (book) {
      const k = book.keyLocations.find((l) => l.placeId === placeId);
      if (k)
        extra = (
          <p className="font-sans text-xs text-ink-soft">
            Named in <b className="text-ink">{k.mentionCount}</b> verse{k.mentionCount === 1 ? '' : 's'} of {book.book}.
          </p>
        );
    }
  } else if (sel.kind === 'pin') {
    const b = geoBooks[sel.order - 1];
    const pin = sel.role === 'origin' ? b.origin : b.destinationOrSetting;
    placeId = pin.placeId;
    heading = pin.placeName;
    country = pin.modernCountry;
    kicker = sel.role === 'origin' ? `Where ${b.book} was likely written` : `Setting / destination of ${b.book}`;
    extra = (
      <p className="rounded-sm bg-ink/[0.04] px-2.5 py-2 font-sans text-xs leading-snug text-ink-soft">
        {sel.role === 'origin' ? <RefText text={b.origin.confidenceNote} /> : `Region: ${b.destinationOrSetting.regionName}.`}
      </p>
    );
  } else {
    const j = journeys.find((x) => x.id === sel.journeyId) as Journey;
    const leg = j.legs.find((l) => l.id === sel.legId)!;
    const wp = leg.waypoints.find((w) => w.n === sel.n)!;
    placeId = wp.placeId;
    heading = wp.name;
    kicker = `${j.name} · ${j.legs.length > 1 ? leg.label + ' · ' : ''}stop ${wp.n} of ${leg.waypoints.length}`;
    extra = (
      <p className="font-sans text-sm leading-snug">
        {wp.note}{' '}
        {wp.ref !== '—' && (
          <span className="whitespace-nowrap font-semibold">
            (<RefText text={wp.ref} />)
          </span>
        )}
      </p>
    );
  }
  const p = placeId ? places[placeId] : null;

  const head = (
    <div className="border-b border-rule px-4 py-3" style={{ background: cssColor('--greek', 0.08) }}>
      <div className="eyebrow">{kicker}</div>
      <h3 className="font-display text-2xl font-semibold leading-tight">{heading}</h3>
    </div>
  );
  const details = (
        <div className="space-y-3 px-4 py-3">
          {extra}
          {(p?.modern || country || p?.modernCountry) && (
            <div className="flex items-start gap-2 font-sans text-sm">
              <Globe2 size={15} className="mt-0.5 shrink-0 text-ink-soft" aria-hidden />
              <div>
                {p?.modern && p.modern !== p.name && (
                  <div>
                    Modern site: <b>{p.modern}</b>
                  </div>
                )}
                <div className="text-ink-soft">{country ?? p?.modernCountry}</div>
              </div>
            </div>
          )}
          {p?.description && (
            <p className="font-serif text-[15px] leading-relaxed">
              “<RefText text={p.description} />”<span className="font-sans text-[12px] text-ink-soft"> — Easton&rsquo;s Bible Dictionary</span>
            </p>
          )}
          {level !== 'beginner' && p && p.books.length > 0 && (
            <div>
              <div className="eyebrow mb-1.5 flex items-center gap-1.5">
                <BookOpen size={12} aria-hidden /> Named in {p.verseCount} verses · books
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.books.map((b) => (
                  <button
                    key={b.book}
                    onClick={() => onPickBook(b.order)}
                    className={`focus-ring rounded-full border px-2 py-0.5 font-sans text-xs hover:border-ink/60 ${book?.order === b.order ? 'border-ink bg-ink text-paper' : 'border-rule'}`}
                    title={`Show ${b.book} on the map`}
                  >
                    {b.book} <span className="opacity-60">{b.verses}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {level !== 'beginner' && p && p.people.length > 0 && (
            <div>
              <div className="eyebrow mb-1.5 flex items-center gap-1.5">
                <Users size={12} aria-hidden /> Key people here
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.people.map((c) => (
                  <a
                    key={c.id}
                    href={`characters.html?person=${c.id}`}
                    className="focus-ring inline-flex items-center gap-1 rounded-full border border-rule px-2 py-0.5 font-sans text-xs hover:border-ink/60"
                    title={`Open ${c.name} in Characters (named together in ${c.verses} verses)`}
                  >
                    {c.name}
                    <ArrowRight size={10} aria-hidden className="opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {level === 'scholar' && p && (p.openBible || p.pleiades) && (
            <div className="flex flex-wrap gap-3 border-t border-rule pt-2 font-sans text-[12px] text-ink-soft">
              {p.openBible && (
                <a href={p.openBible} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline-offset-2 hover:text-ink hover:underline">
                  OpenBible.info <ExternalLink size={10} aria-hidden />
                </a>
              )}
              {p.pleiades && (
                <a href={p.pleiades} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline-offset-2 hover:text-ink hover:underline">
                  Pleiades gazetteer <ExternalLink size={10} aria-hidden />
                </a>
              )}
            </div>
          )}
          {!p && sel.kind !== 'place' && <p className="font-sans text-xs text-ink-soft">No single gazetteer entry: this pin marks a region or a probable location.</p>}
        </div>
  );

  if (asSheet)
    return (
      <DetailSheet
        modal={false}
        phoneHeight={55}
        label={heading}
        backLabel="Back to the map"
        onClose={onClose}
        title={heading}
        position={nav?.position}
        onPrev={nav ? nav.prev : undefined}
        onNext={nav ? nav.next : undefined}
      >
        {head}
        {details}
      </DetailSheet>
    );

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-ink/30 bg-paper shadow-lg">
      <DetailHeader
        backLabel="Close"
        onBack={onClose}
        position={nav?.position}
        onPrev={nav ? nav.prev : undefined}
        onNext={nav ? nav.next : undefined}
        className="border-b border-rule px-3 py-2"
      />
      {head}
      {details}
    </div>
  );
}

function JourneysPanel({
  active,
  routeKey,
  onPlay,
  onPlayAll,
}: {
  active: Set<string>;
  routeKey: string | null;
  onPlay: (j: Journey, legId: string) => void;
  onPlayAll: () => void;
}) {
  const shown = journeys.filter((j) => active.has(j.id));
  const legs = shown.reduce((n, j) => n + j.legs.length, 0);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-rule bg-paper/80 px-4 py-3">
        <div>
          <h2 className="font-display text-2xl font-semibold leading-tight">The great journeys</h2>
          <p className="font-sans text-[12px] text-ink-soft">
            {shown.length} of {journeys.length} shown · {legs} routes
          </p>
        </div>
        {legs > 1 && (
          <button
            onClick={onPlayAll}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-sans text-[12px] font-semibold text-paper hover:opacity-90"
          >
            <ListVideo size={14} aria-hidden /> Play all
          </button>
        )}
      </div>
      {shown.length === 0 && <p className="px-1 font-sans text-[13px] text-ink-soft">Tick a journey in the list to show it.</p>}
      {shown.map((j) => {
        const total = j.legs.reduce((n, l) => n + l.distanceKm, 0);
        return (
          <article key={j.id} className="rounded-md border border-rule bg-paper/80">
            <header className="border-b border-rule px-4 py-3">
              <h3 className="font-display text-xl font-semibold leading-tight">{j.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 font-sans text-[12px] text-ink-soft">
                {j.books.map((b) => (
                  <span key={b} className="rounded-full border border-rule px-1.5 py-px">
                    {b}
                  </span>
                ))}
                <span className="ml-auto font-semibold tabular-nums text-ink">{fmtDistance(total)}</span>
              </div>
            </header>
            <div className="space-y-2 px-4 py-3 font-serif text-[15px] leading-relaxed">
              {j.writeup.map((para, i) => (
                <p key={i}>
                  <RefText text={para} />
                </p>
              ))}
            </div>
            <ol className="space-y-2 border-t border-rule px-4 py-3">
              {j.legs.map((l) => {
                const style = LEG_STYLE[l.id] ?? { css: '--ink' };
                const key = `major:${l.id}`;
                const activeL = routeKey === key;
                return (
                  <li
                    key={l.id}
                    data-route-key={key}
                    className={`rounded-md border px-3 py-2 transition-colors ${activeL ? 'border-ink/50 bg-paper shadow-sm' : 'border-rule'}`}
                    style={activeL ? { boxShadow: `inset 3px 0 0 ${cssColor(style.css)}` } : undefined}
                  >
                    <div className="flex items-start gap-2">
                      <svg width="20" height="8" aria-hidden className="mt-1.5 shrink-0">
                        <line x1="0" y1="4" x2="20" y2="4" stroke={cssColor(style.css)} strokeWidth="3" strokeDasharray={style.dash ? '4 3' : undefined} />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-[15px] font-semibold leading-tight">{j.legs.length > 1 ? l.label : `${l.waypoints.length} stops`}</div>
                        <div className="font-sans text-[12px] font-semibold tabular-nums">{fmtDistance(l.distanceKm)}</div>
                      </div>
                      <PlayButton active={activeL} onClick={() => onPlay(j, l.id)} label={`Play ${j.name}${j.legs.length > 1 ? ` — ${l.label}` : ''}`} />
                    </div>
                    {l.about && (
                      <p className="mt-1 font-serif text-[14px] leading-snug">
                        <RefText text={l.about} />
                      </p>
                    )}
                    <details className="mt-1.5 font-sans text-[12px]">
                      <summary className="min-h-6 cursor-pointer py-0.5 text-ink-soft hover:text-ink">{l.waypoints.length} stops</summary>
                      <ol className="mt-1.5 space-y-1">
                        {l.waypoints.map((w) => (
                          <li key={w.n} className="flex gap-2">
                            <span
                              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-paper"
                              style={{ background: cssColor(style.css) }}
                            >
                              {w.n}
                            </span>
                            <span className="min-w-0">
                              <b>{w.name}</b>
                              {w.n > 1 && (l.legKm[w.n - 2] ?? 0) > 0 && (
                                <span className="text-[12px] tabular-nums text-ink-soft"> +{(l.legKm[w.n - 2] ?? 0).toLocaleString('en-US')} km</span>
                              )}
                              {w.ref !== '\u2014' && (
                                <>
                                  {' '}
                                  · <RefText text={w.ref} />
                                </>
                              )}
                              <span className="block text-ink-soft">{w.note}</span>
                              {w.placeId && places[w.placeId] && (
                                <span className="block text-[12px] text-ink-soft/80">
                                  {[places[w.placeId].modern !== places[w.placeId].name ? places[w.placeId].modern : null, places[w.placeId].modernCountry].filter(Boolean).join(' · ')}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </details>
                  </li>
                );
              })}
            </ol>
          </article>
        );
      })}
      <p className="px-1 font-sans text-[12px] leading-snug text-ink-soft">
        Distances are straight lines between stops; the roads and sea lanes actually travelled were longer. Routes are traditional reconstructions.
      </p>
    </div>
  );
}

function BookPanel({
  book,
  routeKey,
  onPlay,
  onPin,
  onPlace,
  onShowMajor,
  onPlayAll,
}: {
  book: BookGeo;
  routeKey: string | null;
  onPlay: (j: BookJourney) => void;
  onPlayAll: () => void;
  onPin: (s: Selection) => void;
  onPlace: (placeId: string) => void;
  onShowMajor: (id: string) => void;
}) {
  const same = book.origin.placeName === book.destinationOrSetting.placeName;
  const major = book.journeyId ? journeys.find((j) => j.id === book.journeyId) : null;
  const totalKm = book.journeys.filter((j) => j.kind === 'travel').reduce((n, j) => n + j.distanceKm, 0);
  return (
    <div className="rounded-md border border-rule bg-paper/80">
      <div className="border-b border-rule px-4 py-3">
        <div className="eyebrow">
          {book.testament} Testament · {book.division}
        </div>
        <h2 className="font-display text-3xl font-semibold leading-tight">{book.book}</h2>
        <p className="mt-1 font-serif text-[15.5px] leading-snug">{BOOK_INTROS[book.order].oneLine}</p>
        <div className="mt-2 space-y-1 font-sans text-[13px]">
          <button onClick={() => onPin({ kind: 'pin', role: 'origin', order: book.order })} className="focus-ring flex min-h-6 w-full items-start gap-2 rounded-sm py-0.5 text-left hover:bg-ink/[0.04]">
            <Feather size={14} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              <span className="text-ink-soft">Written: </span>
              <b>{book.origin.placeName}</b> <span className="text-ink-soft">· {book.origin.modernCountry}</span>
            </span>
          </button>
          <button onClick={() => onPin({ kind: 'pin', role: 'setting', order: book.order })} className="focus-ring flex min-h-6 w-full items-start gap-2 rounded-sm py-0.5 text-left hover:bg-ink/[0.04]">
            <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: cssColor('--lineage') }} aria-hidden />
            <span>
              <span className="text-ink-soft">{same ? 'Also set in: ' : 'Setting / sent to: '}</span>
              <b>{book.destinationOrSetting.placeName}</b> <span className="text-ink-soft">· {book.destinationOrSetting.regionName}</span>
            </span>
          </button>
        </div>
        <AtLevel min="scholar">
          <p className="mt-2 font-sans text-[12px] leading-snug text-ink-soft">
            <RefText text={book.origin.confidenceNote} />
          </p>
        </AtLevel>
      </div>

      {/* Journeys */}
      <AtLevel min="explorer">
      <section className="border-b border-rule px-4 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="eyebrow flex items-center gap-1.5">
            <Route size={12} aria-hidden /> Journeys in {book.book} ({book.journeys.length})
          </h3>
          {totalKm > 0 && <span className="font-sans text-[12px] tabular-nums text-ink-soft">{fmtDistance(totalKm)} in all</span>}
        </div>
        {book.journeys.filter((j) => j.stops.length > 1).length > 1 && (
          <div className="mt-2">
        <button
          onClick={onPlayAll}
          className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-sans text-[12px] font-semibold text-paper hover:opacity-90"
          title="Play all"
        >
          <ListVideo size={14} aria-hidden /> Play all {book.journeys.filter((j) => j.stops.length > 1).length} journeys
        </button>
          </div>
        )}
        {book.journeys.length === 0 ? (
          <p className="mt-2 font-sans text-[13px] text-ink-soft">No journeys are narrated in {book.book}.</p>
        ) : (
          <ol className="mt-2 space-y-2">
            {book.journeys.map((j, i) => {
              const r = routeOfBookJourney(j);
              const activeJ = routeKey === j.id;
              return (
                <li
                  key={j.id}
                  data-route-key={j.id}
                  className={`rounded-md border px-3 py-2 transition-colors ${activeJ ? 'border-ink/50 bg-paper shadow-sm' : 'border-rule'}`}
                  style={activeJ ? { boxShadow: `inset 3px 0 0 ${cssColor(r.css)}` } : undefined}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-sans text-[12px] font-bold text-paper" style={{ background: cssColor(r.css) }}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[15px] font-semibold leading-tight">{j.title}</div>
                      <div className="font-sans text-[12px] text-ink-soft">
                        {j.kind !== 'travel' && <span className="mr-1 rounded bg-ink/[0.07] px-1 text-[12px] uppercase tracking-wide">{KIND_LABEL[j.kind]}</span>}
                        {j.who} · <RefText text={j.ref} />
                      </div>
                    </div>
                    {j.stops.length > 1 && <PlayButton active={activeJ} onClick={() => onPlay(j)} label={`Play: ${j.title}`} />}
                  </div>
                  {j.summary && (
                    <p className="mt-1 font-serif text-[14px] leading-snug">
                      <RefText text={j.summary} />
                    </p>
                  )}
                  {j.distanceKm > 0 && <div className="mt-1 font-sans text-[12px] font-semibold tabular-nums">{fmtDistance(j.distanceKm)}</div>}
                  {/* Expandable stop-by-stop details */}
                  <details className="group mt-1 font-sans text-[12px]">
                    <summary className="min-h-6 cursor-pointer list-none py-0.5 text-ink-soft hover:text-ink [&::-webkit-details-marker]:hidden">
                      <span className="mr-1 inline-block transition-transform group-open:rotate-90">▸</span>
                      <b className="font-semibold text-ink">
                        {j.stops.length} {j.stops.length === 1 ? 'stop' : 'stops'}
                      </b>
                      <span className="group-open:hidden"> · {stopChain(j.stops.map((s) => s.name))}</span>
                    </summary>
                    <ol className="mt-1.5 space-y-1.5">
                      {j.stops.map((st, si) => {
                        const p = st.placeId ? places[st.placeId] : null;
                        const modern = p ? [p.modern && p.modern !== p.name ? p.modern : null, p.modernCountry].filter(Boolean).join(' · ') : '';
                        return (
                          <li key={si} className="flex gap-2">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-paper" style={{ background: cssColor(r.css) }}>
                              {si + 1}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-baseline gap-x-1.5">
                                {p ? (
                                  <button
                                    onClick={() => onPlace(st.placeId as string)}
                                    className="focus-ring inline-block min-h-6 min-w-6 rounded-sm py-0.5 text-left font-semibold underline decoration-rule underline-offset-2 hover:decoration-ink"
                                    title={`About ${p.name}`}
                                  >
                                    {st.name}
                                  </button>
                                ) : (
                                  <b>{st.name}</b>
                                )}
                                {si > 0 && (j.legKm[si - 1] ?? 0) > 0 && (
                                  <span className="text-[12px] tabular-nums text-ink-soft">+{(j.legKm[si - 1] ?? 0).toLocaleString('en-US')} km</span>
                                )}
                                {st.ref && st.ref !== '—' && (
                                  <span className="text-[12px]">
                                    <RefText text={st.ref} />
                                  </span>
                                )}
                              </span>
                              {modern && <span className="block text-[12px] text-ink-soft">{modern}</span>}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  </details>
                </li>
              );
            })}
          </ol>
        )}
        {book.journeys.length > 0 && (
          <p className="mt-2 font-sans text-[12px] leading-snug text-ink-soft">
            Distances are straight lines between the stops; the roads actually travelled were longer. Some stops are approximate.
          </p>
        )}
        {major && (
          <button onClick={() => onShowMajor(major.id)} className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-full border border-ink/40 px-2.5 py-1 font-sans text-[12px] font-medium hover:bg-ink/5">
            <Route size={12} aria-hidden /> See {major.name} among the great journeys
          </button>
        )}
      </section>

      </AtLevel>

      {/* Key places */}
      <AtLevel min="explorer">
      <section className="px-4 py-3">
        <h3 className="eyebrow mb-1.5">Key places (verses naming them)</h3>
        {book.keyLocations.length === 0 ? (
          <p className="font-sans text-[13px] text-ink-soft">No places are named in this book.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {book.keyLocations.map((l) => (
              <button key={l.placeId} onClick={() => onPlace(l.placeId)} className="focus-ring inline-flex min-h-6 items-center rounded-full border border-rule px-2.5 py-0.5 font-sans text-xs hover:border-ink/60">
                {l.name} <span className="opacity-60">{l.mentionCount}</span>
              </button>
            ))}
          </div>
        )}
      </section>
      </AtLevel>
    </div>
  );
}

export function MapPage() {
  const wide = useWide();
  const init = useMemo(initialState, []);
  const [mode, setModeState] = useState<Mode>(init.mode);
  const [order, setOrder] = useState(init.order);
  const [active, setActive] = useState<Set<string>>(() => new Set(ALL_JOURNEYS));
  const [showBorders, setShowBorders] = useState(false);
  const [sel, setSel] = useState<Selection | null>(null);
  const [route, setRoute] = useState<AnimRoute | null>(null);
  const [playToken, setPlayToken] = useState(0);
  const [fly, setFly] = useState<{ id: number; points: [number, number][] }>({ id: 0, points: [] });
  const flyTo = (points: [number, number][]) => setFly((f) => ({ id: f.id + 1, points }));
  const mapRef = useRef<HTMLDivElement>(null);
  // Full-screen map: Esc or the button closes it; the page behind doesn't scroll meanwhile.
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [expanded]);

  const book = mode === 'books' ? geoBooks[order - 1] : null;
  const activeJourneys = journeys.filter((j) => active.has(j.id));
  const journeyPoints = (js: Journey[]) => js.flatMap((j) => j.legs.flatMap((l) => l.waypoints.map((w) => [w.lng, w.lat] as [number, number])));

  // Keep the URL in sync (shareable: map.html#book=45, map.html#journeys).
  useEffect(() => {
    history.replaceState(null, '', mode === 'journeys' ? '#journeys' : `#book=${order}`);
  }, [mode, order]);

  useEffect(() => {
    if (mode === 'books') flyTo(footprint(geoBooks[order - 1]));
  }, [mode, order]);
  useEffect(() => {
    if (mode === 'journeys' && !route) flyTo(journeyPoints(activeJourneys.length ? activeJourneys : journeys));
  }, [mode, active]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Playing one route, or a queue of routes ("Play all") ──
  const [queue, setQueue] = useState<AnimRoute[] | null>(null);
  const [qi, setQi] = useState(0);
  const advanceTimer = useRef<number>();
  const clearAdvance = () => window.clearTimeout(advanceTimer.current);
  useEffect(() => clearAdvance, []);

  const startRoute = (r: AnimRoute) => {
    setSel(null);
    setRoute(r);
    setPlayToken((t) => t + 1);
    flyTo(r.stops.map((s) => [s.lng, s.lat]));
    requestAnimationFrame(() => revealCard(r.key));
  };
  /**
   * Scroll the current journey's card so its top sits just below the pinned map
   * (phones / laptops, where the list runs under the map), or near the top of the
   * screen when the list is beside the map (wide screens).
   */
  const revealCard = (key: string) => {
    const card = document.querySelector<HTMLElement>(`[data-route-key="${key}"]`);
    const map = mapRef.current;
    if (!card || !map) return;
    const c = card.getBoundingClientRect();
    const m = map.getBoundingClientRect();
    const underMap = c.left < m.right && c.right > m.left; // list shares the map's column
    if (!underMap) {
      // Wide screens: the panel sits beside the map and scrolls on its own; never move the page.
      const panel = document.getElementById('map-details');
      if (!panel) return;
      const p = panel.getBoundingClientRect();
      if (c.top >= p.top && c.bottom <= p.bottom) return; // already visible
      panel.scrollTo({ top: panel.scrollTop + (c.top - p.top) - 12, behavior: 'smooth' });
      return;
    }
    // Phones/laptops: the list runs under the pinned map, so land the card just below it.
    const clearTop = map.offsetHeight + 16;
    window.scrollTo({ top: window.scrollY + c.top - clearTop, behavior: 'smooth' });
  };
  const play = (r: AnimRoute) => {
    clearAdvance();
    setQueue(null);
    startRoute(r);
  };
  const playAll = (routes: AnimRoute[]) => {
    if (!routes.length) return;
    clearAdvance();
    setQueue(routes);
    setQi(0);
    startRoute(routes[0]);
  };
  const goTo = (i: number) => {
    if (!queue) return;
    clearAdvance();
    const n = Math.min(Math.max(i, 0), queue.length - 1);
    setQi(n);
    startRoute(queue[n]);
  };
  const onRouteEnd = () => {
    if (queue && qi < queue.length - 1) advanceTimer.current = window.setTimeout(() => goTo(qi + 1), 1400);
  };
  const closeRoute = () => {
    clearAdvance();
    setQueue(null);
    setRoute(null);
    if (mode === 'books') flyTo(footprint(geoBooks[order - 1]));
    else flyTo(journeyPoints(activeJourneys.length ? activeJourneys : journeys));
  };
  const setMode = (m: Mode) => {
    clearAdvance();
    setQueue(null);
    setModeState(m);
    setSel(null);
    setRoute(null);
  };
  const pickBook = (o: number) => {
    clearAdvance();
    setQueue(null);
    setModeState('books');
    setOrder(o);
    setSel(null);
    setRoute(null);
  };
  const toggleJourney = (id: string) =>
    setActive((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const phone = !useMedia('(min-width: 768px)');
  const select = (s: Selection | null) => {
    setSel(s);
    // Tablets and laptops: bring the card (under the map) into view. Phones show it in a sheet instead.
    if (s && !wide && window.matchMedia('(min-width: 768px)').matches) document.getElementById('map-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Phones: the details open in a sheet over the lower half, so make sure the map is showing above it.
    if (s && !window.matchMedia('(min-width: 768px)').matches && mapRef.current) {
      const r = mapRef.current.getBoundingClientRect();
      if (r.top < -8 || r.bottom > window.innerHeight * 0.45) window.scrollTo({ top: r.top + window.scrollY - 8, behavior: 'smooth' });
    }
  };
  // Previous / next: the other stops on the same leg, the book's key places, or its two pins.
  const nav: InspectorNav | null = (() => {
    if (!sel) return null;
    if (sel.kind === 'waypoint') {
      const leg = journeys.find((x) => x.id === sel.journeyId)?.legs.find((l) => l.id === sel.legId);
      if (!leg) return null;
      const i = leg.waypoints.findIndex((w) => w.n === sel.n);
      return {
        position: `Stop ${i + 1} of ${leg.waypoints.length}`,
        prev: i > 0 ? () => select({ ...sel, n: leg.waypoints[i - 1].n }) : null,
        next: i < leg.waypoints.length - 1 ? () => select({ ...sel, n: leg.waypoints[i + 1].n }) : null,
      };
    }
    if (sel.kind === 'pin')
      return {
        position: sel.role === 'origin' ? '1 of 2' : '2 of 2',
        prev: sel.role === 'setting' ? () => select({ ...sel, role: 'origin' }) : null,
        next: sel.role === 'origin' ? () => select({ ...sel, role: 'setting' }) : null,
      };
    const list = book?.keyLocations ?? [];
    const i = list.findIndex((l) => l.placeId === sel.placeId);
    if (i < 0) return null;
    return {
      position: `Place ${i + 1} of ${list.length}`,
      prev: i > 0 ? () => select({ kind: 'place', placeId: list[i - 1].placeId }) : null,
      next: i < list.length - 1 ? () => select({ kind: 'place', placeId: list[i + 1].placeId }) : null,
    };
  })();

  return (
    <div className="pt-6">
      <MapIntro />
      {/* Controls */}
      <div className="flex min-w-0 flex-wrap items-center gap-2 pb-3">
        <Segmented<Mode>
          label="Map mode"
          value={mode}
          onChange={setMode}
          options={[
            {
              id: 'books',
              label: (
                <>
                  <Feather size={13} aria-hidden /> Books
                </>
              ),
            },
            {
              id: 'journeys',
              label: (
                <>
                  <Route size={13} aria-hidden /> Great journeys
                </>
              ),
            },
          ]}
        />
        <div role="group" aria-label="Zoom to region" className="flex max-w-full flex-wrap gap-1.5">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => flyTo([r.bounds[0], r.bounds[1]])}
              title={r.label}
              className="focus-ring whitespace-nowrap rounded-full border border-rule bg-paper/70 px-3 py-1.5 font-sans text-[13px] hover:border-ink/60"
            >
              {r.short}
            </button>
          ))}
        </div>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 font-sans text-[13px]">
          <span className="relative inline-flex h-5 w-9 items-center">
            <input type="checkbox" className="peer sr-only" checked={showBorders} onChange={(e) => setShowBorders(e.target.checked)} />
            <span className="absolute inset-0 rounded-full bg-ink/20 transition-colors peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink" />
            <span className="absolute left-0.5 h-4 w-4 rounded-full bg-paper shadow transition-transform peer-checked:translate-x-4" />
          </span>
          Show modern borders
        </label>
      </div>

      {/* Phones: book picker above the map */}
      {mode === 'books' && (
        <div className="mb-3 flex items-center gap-2 md:hidden">
          <button onClick={() => pickBook(Math.max(1, order - 1))} disabled={order === 1} aria-label="Previous book" className="focus-ring rounded-full border border-rule p-2 disabled:opacity-30">
            <ChevronLeft size={16} />
          </button>
          <select
            value={order}
            onChange={(e) => pickBook(Number(e.target.value))}
            aria-label="Choose a book"
            className="focus-ring min-w-0 flex-1 rounded-full border border-rule bg-paper px-3 py-2 font-sans text-sm"
          >
            {geoBooks.map((b) => (
              <option key={b.order} value={b.order}>
                {b.order}. {b.book}
                {b.journeys.length ? ` (${b.journeys.length} journeys)` : ''}
              </option>
            ))}
          </select>
          <button onClick={() => pickBook(Math.min(66, order + 1))} disabled={order === 66} aria-label="Next book" className="focus-ring rounded-full border border-rule p-2 disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-[13rem_1fr] xl:grid-cols-[13rem_1fr_22rem]">
        {/* Left: book list / journey list */}
        <aside
          className={`order-3 min-w-0 md:sticky md:top-0 md:z-20 md:order-1 md:block md:h-[calc(52vh+0.5rem)] md:self-start md:bg-paper md:pt-2 xl:h-[calc(74vh+0.5rem)] ${
            mode === 'books' ? 'hidden' : 'hidden md:overflow-y-auto md:pr-1'
          }`}
        >
          {mode === 'books' ? (
            <BookList order={order} onPick={pickBook} />
          ) : (
            <JourneyList active={active} onToggle={toggleJourney} routeKey={route?.key ?? null} onPlay={(j, legId) => play(routeOfLeg(j, legId))}
              onPlayAll={() => playAll(activeJourneys.flatMap((j) => j.legs.map((l) => routeOfLeg(j, l.id))))}
            />
          )}
        </aside>

        {/* Map */}
        {/* The map stays pinned while the journey list scrolls underneath (about 30% of a phone screen). */}
        <div
          ref={mapRef}
          className={
            expanded
              ? 'fixed inset-0 z-[60] bg-paper p-2 sm:p-4'
              : 'sticky top-0 z-20 order-1 -mx-4 min-w-0 self-start bg-paper/95 px-4 pb-2 pt-2 shadow-[0_6px_12px_-10px_rgb(var(--ink)/0.5)] backdrop-blur md:top-0 md:order-2 md:-ml-3 md:mr-0 md:bg-paper md:pb-0 md:pl-3 md:pr-0 md:pt-2 md:shadow-none md:backdrop-blur-none'
          }
        >
          <div className={`panel relative overflow-hidden ${expanded ? 'h-full' : 'h-[30vh] min-h-[210px] md:h-[52vh] xl:h-[74vh]'}`}>
            <button
              onClick={() => setExpanded((x) => !x)}
              aria-label={expanded ? 'Shrink map' : 'Expand map to full screen'}
              title={expanded ? 'Shrink map (Esc)' : 'Full screen'}
              className="focus-ring absolute right-2 top-2 z-10 rounded-md border border-rule bg-paper/90 p-1.5 shadow-sm backdrop-blur hover:bg-ink/5"
            >
              {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <MapCanvas
              mode={mode}
              book={book}
              journeys={activeJourneys}
              showBorders={showBorders}
              flyTo={fly}
              selected={sel}
              onSelect={select}
              route={route}
              playToken={playToken}
              onCloseRoute={closeRoute}
              onRouteEnd={onRouteEnd}
              playlist={queue ? { index: qi, total: queue.length, onPrev: () => goTo(qi - 1), onNext: () => goTo(qi + 1) } : null}
            />
          </div>
        </div>

        {/* Right (below on smaller screens): place card + book details */}
        <div
          id="map-details"
          className="order-2 min-w-0 scroll-mt-[calc(max(30vh,210px)+2rem)] space-y-3 md:order-3 md:col-span-2 md:scroll-mt-[calc(52vh+1.5rem)] xl:sticky xl:top-2 xl:col-span-1 xl:h-[74vh] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:pr-1"
        >
          {sel && <Inspector sel={sel} book={book} onClose={() => setSel(null)} onPickBook={pickBook} nav={nav} asSheet={phone} />}
          {mode === 'journeys' && (
            <JourneysPanel
              active={active}
              routeKey={route?.key ?? null}
              onPlay={(j, legId) => play(routeOfLeg(j, legId))}
              onPlayAll={() => playAll(activeJourneys.flatMap((j) => j.legs.map((l) => routeOfLeg(j, l.id))))}
            />
          )}
          {book && (
            <BookPanel
              book={book}
              routeKey={route?.key ?? null}
              onPlay={(j) => play(routeOfBookJourney(j))}
              onPlayAll={() => playAll(book.journeys.filter((j) => j.stops.length > 1).map(routeOfBookJourney))}
              onPin={select}
              onPlace={(placeId) => select({ kind: 'place', placeId })}
              onShowMajor={(id) => {
                setModeState('journeys');
                setRoute(null);
                setActive(new Set([id]));
              }}
            />
          )}
        </div>
      </div>

      <MapLegend mode={mode} />
    </div>
  );
}

function MapLegend({ mode }: { mode: Mode }) {
  const item = (key: string, swatch: ReactNode, text: string) => (
    <span key={key} className="inline-flex items-center gap-1.5">
      {swatch}
      {text}
    </span>
  );
  const line = (css: string, dash?: string) => (
    <svg width="20" height="6" aria-hidden>
      <line x1="0" y1="3" x2="20" y2="3" stroke={cssColor(css)} strokeWidth="3" strokeDasharray={dash ? '4 3' : undefined} />
    </svg>
  );
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-sans text-[12px] text-ink-soft">
      {mode === 'books' ? (
        <>
          {item('w', <span className="h-3 w-3 rounded-full" style={{ background: cssColor('--ink') }} />, 'Where it was written')}
          {item('s', <span className="h-3 w-3 rounded-full" style={{ background: cssColor('--lineage') }} />, 'Setting / destination')}
          {item('k', <span className="h-3 w-3 rounded-full border" style={{ background: cssColor('--greek', 0.22), borderColor: cssColor('--greek') }} />, 'Key places (size = verses)')}
          {item('j', line('--lineage'), 'Journey')}
          {item('l', line('--greek'), 'Letter delivered')}
          {item('p', line('--ink-soft', '1'), 'Planned journey')}
        </>
      ) : (
        journeys.flatMap((j) => j.legs.map((l) => item(l.id, line(LEG_STYLE[l.id]?.css ?? '--ink', LEG_STYLE[l.id]?.dash), j.legs.length > 1 ? l.label : j.name)))
      )}
      {item('r', line('--river'), 'Rivers (approximate)')}
    </div>
  );
}
