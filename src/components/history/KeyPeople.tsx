import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Quote as QuoteIcon } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import { ERAS, EVENTS, PEOPLE_SOURCES, STREAMS, WITNESSES, type ChurchEvent, type Era, type EraId, type Stream, type Witness } from '../../lib/witnesses';
import { RefText } from '../ScriptureRef';
import { Fold } from '../sections';
import { DetailSheet } from '../DetailSheet';

/**
 * Key people from Jesus to today: one era at a time, people as lifespan bars and councils and
 * events as markers, in date order. Each person opens a card that says how they pointed to Jesus.
 */

const yr = (y: number) => (y < 0 ? `${-y} BC` : y < 1000 ? `AD ${y}` : `${y}`);

type Row = { kind: 'person'; w: Witness; start: number } | { kind: 'event'; e: ChurchEvent; start: number };

function ticksFor(e: Era) {
  const span = e.to - e.from;
  const step = span <= 130 ? 20 : span <= 300 ? 50 : span <= 650 ? 100 : 50;
  const out: number[] = [];
  for (let t = Math.ceil(e.from / step) * step; t <= e.to; t += step) out.push(t);
  return out;
}

const EVENT_LOOK: Record<ChurchEvent['kind'], { label: string; css: string }> = {
  council: { label: 'Council', css: '--ink' },
  persecution: { label: 'Persecution', css: '--rel-rival' },
  event: { label: 'Event', css: '--ink-soft' },
};

function Diamond({ css, size = 10 }: { css: string; size?: number }) {
  return <span aria-hidden className="inline-block shrink-0 rotate-45" style={{ width: size, height: size, background: cssColor(css) }} />;
}

/**
 * The eras from Jesus to today, in order, as one strip: tap an era to show it. Each era gets an equal
 * share of the strip (the early eras are short in years but full of people), with its dates beneath.
 */
function EraStrip({ era, onPick }: { era: EraId; onPick: (id: EraId) => void }) {
  const starts = ['AD 1', '100', '300', '500', '1000', '1500', '1650', '1900'];
  const short = ['Jesus & apostles', 'Church fathers', 'Councils & creeds', 'Early Middle Ages', 'Middle Ages', 'Reformation', 'Revival & mission', 'World church'];
  return (
    <div role="radiogroup" aria-label="Era" className="rounded-md border border-rule bg-paper/80 p-2">
      <div className="grid grid-cols-8 gap-1">
        {ERAS.map((e, i) => {
          const on = e.id === era;
          return (
            <button
              key={e.id}
              role="radio"
              aria-checked={on}
              aria-label={`${i + 1}. ${e.name}, ${e.span}`}
              title={`${e.name} (${e.span})`}
              onClick={() => onPick(e.id)}
              className={`focus-ring flex min-h-11 flex-col items-center justify-center rounded-md px-0.5 transition-colors ${on ? 'bg-ink text-paper' : 'hover:bg-ink/[0.07]'}`}
              style={on ? undefined : { background: cssColor('--ink', 0.05 + (i % 2) * 0.04) }}
            >
              <span className="font-sans text-[15px] font-bold tabular-nums">{i + 1}</span>
              <span className={`hidden font-sans text-[12px] leading-tight md:block ${on ? 'text-paper/80' : 'text-ink-soft'}`}>{short[i]}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-1 grid grid-cols-8 gap-1 font-sans text-[12px] tabular-nums text-ink-soft">
        {starts.map((y, i) => (
          <span key={y} className={`pl-0.5 ${i % 2 ? 'hidden sm:block' : ''}`}>
            {y}
          </span>
        ))}
      </div>
    </div>
  );
}

function PersonCard({ w, onClose, onPrev, onNext, position }: { w: Witness; onClose: () => void; onPrev: (() => void) | null; onNext: (() => void) | null; position: string }) {
  const s = STREAMS[w.stream];
  const era = ERAS.find((e) => e.id === w.era)!;
  return (
    <DetailSheet
      labelledBy="witness-name"
      backLabel="Back to timeline"
      onClose={onClose}
      title={w.name}
      position={position}
      onPrev={onPrev}
      onNext={onNext}
      prevLabel="Previous person"
      nextLabel="Next person"
      width="lg"
    >
      <div className="px-5 py-4">
          <div className="eyebrow">{era.name}</div>
          <h3 id="witness-name" className="font-display text-2xl font-semibold leading-tight">
            {w.name}
          </h3>
          <p className="mt-0.5 font-sans text-[13px] text-ink-soft">
            {w.life} · {w.place}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 font-sans text-[12px] font-semibold">
            <span className="rounded-full px-2 py-0.5" style={{ background: cssColor(s.css, 0.14), color: cssColor(s.css) }}>
              {w.stream === 'jesus' ? 'Jesus Christ' : s.label}
            </span>
            <span className="rounded-full border border-rule px-2 py-0.5">{w.role}</span>
            {w.martyr && (
              <span className="rounded-full px-2 py-0.5" style={{ background: cssColor('--lineage', 0.12), color: cssColor('--lineage') }}>
                Died as a martyr
              </span>
            )}
          </div>
          <p className="mt-3 font-serif text-[15.5px] leading-relaxed">{w.about}</p>

          <div className="mt-4 rounded-md px-4 py-3" style={{ background: cssColor('--lineage', 0.07), boxShadow: `inset 3px 0 0 ${cssColor('--lineage')}` }}>
            <div className="eyebrow" style={{ color: cssColor('--lineage') }}>
              {w.stream === 'jesus' ? 'The one they all looked to' : w.stream === 'rejected' ? 'How the church answered, pointing to Jesus' : 'Pointing to Jesus'}
            </div>
            <p className="mt-1 font-serif text-[15px] leading-relaxed">
              <RefText text={w.jesus} />
            </p>
            {w.quote && (
              <blockquote className="mt-2 border-l-2 border-rule pl-3">
                <p className="flex gap-1.5 font-serif text-[15px] italic leading-relaxed">
                  <QuoteIcon size={13} className="mt-1 shrink-0 text-ink-soft" aria-hidden />
                  <span>{w.quote.text}</span>
                </p>
                <footer className="mt-1 font-sans text-[12px] text-ink-soft">
                  {w.quote.url ? (
                    <a href={w.quote.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline decoration-rule underline-offset-2 hover:decoration-ink">
                      {w.quote.cite} <ExternalLink size={10} aria-hidden />
                    </a>
                  ) : (
                    w.quote.cite
                  )}
                </footer>
              </blockquote>
            )}
            {w.refs && (
              <p className="mt-2 font-sans text-[12.5px] text-ink-soft">
                Scripture: <RefText text={w.refs} />
              </p>
            )}
          </div>
      </div>
    </DetailSheet>
  );
}

export function KeyPeople() {
  const [era, setEra] = useState<EraId>('apostles');
  const [open, setOpen] = useState<string | null>(null);
  const [openEvent, setOpenEvent] = useState<string | null>(null);
  const e = ERAS.find((x) => x.id === era)!;
  const ei = ERAS.findIndex((x) => x.id === era);

  const rows = useMemo<Row[]>(() => {
    const people: Row[] = WITNESSES.filter((w) => w.era === era).map((w) => ({ kind: 'person', w, start: w.from }));
    const events: Row[] = EVENTS.filter((x) => x.era === era).map((x) => ({ kind: 'event', e: x, start: x.year }));
    return [...people, ...events].sort((a, b) => a.start - b.start || (a.kind === 'event' ? 1 : -1));
  }, [era]);
  const people = rows.filter((r): r is Extract<Row, { kind: 'person' }> => r.kind === 'person').map((r) => r.w);
  const pi = people.findIndex((w) => w.id === open);
  const ticks = ticksFor(e);
  const x = (y: number) => ((Math.min(Math.max(y, e.from), e.to) - e.from) / (e.to - e.from)) * 100;
  const used = new Set(people.map((w) => w.stream));

  const pick = (id: EraId) => {
    setEra(id);
    setOpenEvent(null);
    requestAnimationFrame(() => document.getElementById('people-chart')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };

  return (
    <div className="space-y-6">

      {/* The frame for the whole section */}
      <figure className="rounded-md px-4 py-3" style={{ background: cssColor('--lineage', 0.06), boxShadow: `inset 3px 0 0 ${cssColor('--lineage')}` }}>
        <blockquote className="font-serif text-[16px] italic leading-relaxed">
          “Therefore let us also, seeing we are surrounded by so great a cloud of witnesses … run with perseverance the race that is set
          before us, looking to Jesus, the author and perfecter of faith.”
        </blockquote>
        <figcaption className="mt-1 font-sans text-[12.5px] text-ink-soft">
          <RefText text="Hebrews 12:1–2" />. Every name here is a witness, not the centre: each one, at their best, pointed beyond
          themselves to Christ.
        </figcaption>
      </figure>

      <EraStrip era={era} onPick={pick} />


      <div id="people-chart" className="scroll-mt-32 space-y-4">
        <header className="border-b border-ink/80 pb-2">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="font-display text-2xl font-semibold tracking-tight">
              <span className="mr-2 font-sans text-[14px] font-bold tabular-nums text-ink-soft">{ei + 1}</span>
              {e.name}
            </h3>
            <span className="font-serif italic text-ink-soft">{e.span}</span>
          </div>
          <p className="mt-1 max-w-3xl font-serif text-[15px] leading-relaxed">{e.summary}</p>
        </header>
        <p className="flex max-w-3xl gap-2 font-sans text-[13.5px] leading-snug">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: cssColor('--lineage') }} aria-hidden />
          <span>
            <b>Looking to Jesus:</b> <RefText text={e.looking} />
          </span>
        </p>

        {/* the chart */}
        <div className="grid grid-cols-[8.5rem_1fr] sm:grid-cols-[13rem_1fr]">
          <span />
          <div className="relative h-5 border-b border-rule font-sans text-[12px] tabular-nums text-ink-soft">
            {ticks.map((t, i) => (
              <span key={t} className={`absolute -translate-x-1/2 whitespace-nowrap ${i % 2 ? 'hidden sm:block' : ''}`} style={{ left: `${x(t)}%` }}>
                {yr(t)}
              </span>
            ))}
          </div>
          <div className="relative col-span-2">
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[8.5rem] right-0 sm:left-[13rem]">
              {ticks.map((t) => (
                <span key={t} className="absolute inset-y-0 w-px bg-rule/70" style={{ left: `${x(t)}%` }} />
              ))}
            </div>
            <ul>
              {rows.map((r) => {
                if (r.kind === 'event') {
                  const ev = r.e;
                  const look = EVENT_LOOK[ev.kind];
                  const isOpen = openEvent === ev.id;
                  return (
                    <li key={ev.id}>
                      <button
                        onClick={() => setOpenEvent(isOpen ? null : ev.id)}
                        aria-expanded={isOpen}
                        className={`focus-ring grid min-h-6 w-full grid-cols-[8.5rem_1fr] items-center py-[3px] text-left sm:grid-cols-[13rem_1fr] ${isOpen ? 'bg-ink/[0.05]' : 'hover:bg-ink/[0.03]'}`}
                      >
                        <span className="break-words pr-2 font-sans text-[12px] italic leading-tight" style={{ color: cssColor(look.css === '--ink-soft' ? '--ink' : look.css, look.css === '--ink-soft' ? 0.7 : 1) }}>
                          {ev.name}
                        </span>
                        <span className="relative block h-4">
                          <span className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5" style={{ left: `${x(ev.year)}%` }}>
                            <Diamond css={look.css} />
                          </span>
                          <span
                            className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-sans text-[12px] tabular-nums text-ink-soft ${x(ev.year) > 75 ? '-translate-x-full pr-3' : 'pl-3'}`}
                            style={{ left: `${x(ev.year)}%` }}
                          >
                            {ev.label}
                          </span>
                        </span>
                      </button>
                      {isOpen && (
                        <p className="mb-1 ml-[8.5rem] border-l-2 border-rule px-3 py-1 font-serif text-[14px] leading-relaxed text-ink-soft sm:ml-[13rem]">
                          <RefText text={ev.about} />
                          {ev.refs && (
                            <>
                              {' '}
                              (<RefText text={ev.refs} />)
                            </>
                          )}
                        </p>
                      )}
                    </li>
                  );
                }
                const w = r.w;
                const s = STREAMS[w.stream];
                const l = x(w.from),
                  wd = Math.max(x(w.to) - l, 1);
                return (
                  <li key={w.id}>
                    <button
                      onClick={() => setOpen(w.id)}
                      aria-label={`${w.name}, ${w.life}, ${w.role}`}
                      className="focus-ring group grid min-h-6 w-full grid-cols-[8.5rem_1fr] items-center py-[3px] text-left hover:bg-ink/[0.04] sm:grid-cols-[13rem_1fr]"
                    >
                      <span className="break-words pr-2 font-serif text-[13.5px] font-semibold leading-tight group-hover:underline" style={w.stream === 'jesus' ? { color: cssColor('--lineage') } : undefined}>
                        {w.name}
                      </span>
                      <span className="relative block h-4">
                        <span
                          className="absolute inset-y-0.5 rounded-full"
                          style={{
                            left: `${l}%`,
                            width: `${wd}%`,
                            background: w.stream === 'rejected' ? 'transparent' : cssColor(s.css, w.stream === 'shared' ? 0.7 : 0.85),
                            border: w.stream === 'rejected' ? `1.5px dashed ${cssColor(s.css)}` : undefined,
                          }}
                        />
                        {w.martyr && (
                          <span
                            title="Died as a martyr"
                            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper"
                            style={{ left: `${l + wd}%`, background: cssColor('--lineage') }}
                          />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* key */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-sans text-[12px] text-ink-soft">
          {(Object.keys(STREAMS) as Stream[])
            .filter((k) => used.has(k))
            .map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-5 rounded-full"
                  style={k === 'rejected' ? { border: `1.5px dashed ${cssColor(STREAMS[k].css)}` } : { background: cssColor(STREAMS[k].css, k === 'shared' ? 0.7 : 0.85) }}
                />
                {STREAMS[k].label}
              </span>
            ))}
          {people.some((w) => w.martyr) && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: cssColor('--lineage') }} /> Died as a martyr
            </span>
          )}
          {(['council', 'persecution', 'event'] as const)
            .filter((k) => rows.some((r) => r.kind === 'event' && r.e.kind === k))
            .map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5">
                <Diamond css={EVENT_LOOK[k].css} size={8} /> {EVENT_LOOK[k].label}
              </span>
            ))}
          <span>Bars show lifespans; many early dates are approximate.</span>
        </div>

        {/* step through the eras */}
        <div className="flex flex-wrap justify-between gap-2 pt-2">
          {ei > 0 ? (
            <button onClick={() => pick(ERAS[ei - 1].id)} className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-rule px-3.5 py-1.5 font-sans text-[13px] hover:border-ink/60">
              <ArrowLeft size={14} aria-hidden /> {ERAS[ei - 1].name}
            </button>
          ) : (
            <span />
          )}
          {ei < ERAS.length - 1 && (
            <button onClick={() => pick(ERAS[ei + 1].id)} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 font-sans text-[13px] font-semibold text-paper">
              Next era: {ERAS[ei + 1].name} <ArrowRight size={14} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* where it all comes from */}
      <Fold id="people-sources" title="Sources for this timeline" summary="The ancient historians, reference works and primary texts behind every date and quotation.">
        <p className=" font-sans text-[12.5px] leading-relaxed text-ink-soft">
          Dates and lives follow the ancient historians and standard reference works below. Every quotation is taken from the linked
          primary text. Where no reliable quotation was found, the card describes in its own words how the person pointed to Jesus.
        </p>
        <ul className="mt-2 space-y-1 font-sans text-[12.5px]">
          {PEOPLE_SOURCES.map((s) => (
            <li key={s.title}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="inline-block py-1 font-medium underline decoration-rule underline-offset-2 hover:decoration-ink">
                  {s.title}
                </a>
              ) : (
                <span className="font-medium">{s.title}</span>
              )}
              <span className="text-ink-soft"> · {s.use}</span>
            </li>
          ))}
        </ul>
      </Fold>

      {pi >= 0 && (
        <PersonCard
          w={people[pi]}
          onClose={() => setOpen(null)}
          onPrev={pi > 0 ? () => setOpen(people[pi - 1].id) : null}
          onNext={pi < people.length - 1 ? () => setOpen(people[pi + 1].id) : null}
          position={`${pi + 1} of ${people.length}`}
        />
      )}
    </div>
  );
}
