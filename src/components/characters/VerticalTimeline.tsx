import { Fragment, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Character } from '../../characterTypes';
import { cssColor, formatYearRange, lineage, roleCss, twelveSons } from '../../lib/characters';
import { type Arrangement, type Highlight, SON_IDS, fmtYear, groupPeople, type useTimelineModel } from './timelineModel';

interface Props {
  model: ReturnType<typeof useTimelineModel>;
  arrangement: Arrangement;
  highlight: Highlight;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const LINEAGE_SET = new Set(lineage);
/** People shown per era before "Show all" (phones). */
const PREVIEW = 4;
const SON_ORDER: Record<string, number> = Object.fromEntries(SON_IDS.map((id, i) => [id, i + 1]));
const TWELVE_SET = new Set(['jacob', ...SON_IDS, ...twelveSons.map((s) => s.mother)]);

/** "1084–1014 BC" → ["1084–1014", "BC"]; "AD 26–66" → ["26–66", "AD"]; mixed ranges stay whole. */
function dateParts(c: Character): [string, string] {
  const r = formatYearRange(c.dates.start, c.dates.end);
  const prefix = c.kind === 'spiritual' ? 'seen ' : '';
  if (r.endsWith(' BC') && !r.includes('AD')) return [r.slice(0, -3), prefix + 'BC'];
  if (r.startsWith('AD ') && !r.includes('BC')) return [r.slice(3), prefix + 'AD'];
  return [r.replace(' – ', '–'), prefix];
}

function Row({
  c,
  dim,
  selected,
  badge,
  onSelect,
}: {
  c: Character;
  dim: boolean;
  selected: boolean;
  badge: string | null;
  onSelect: () => void;
}) {
  const role = cssColor(roleCss(c.role));
  const inLine = LINEAGE_SET.has(c.id);
  return (
    <li>
      <button
        onClick={onSelect}
        className={`focus-ring grid w-full grid-cols-[4.6rem_18px_1fr] items-start gap-x-2 rounded-sm py-2 pr-2 text-left transition-opacity active:bg-ink/[0.06] ${
          selected ? 'bg-ink/[0.07]' : ''
        } ${dim ? 'opacity-30' : ''}`}
      >
        <span className="pt-0.5 text-right font-sans leading-tight tabular-nums text-ink-soft">
          <span className="block text-[12px] text-ink">{dateParts(c)[0]}</span>
          <span className="block text-[10px] uppercase tracking-wider">{dateParts(c)[1]}</span>
        </span>
        <span className="relative flex h-full justify-center">
          <span className="relative z-[1] mt-1 h-3 w-3 rounded-full ring-[3px] ring-paper" style={{ background: role }} />
        </span>
        <span className="min-w-0">
          <span className="flex items-baseline gap-1.5">
            {badge && (
              <span
                className="shrink-0 rounded-full px-1.5 font-sans text-[10px] font-semibold leading-4 text-paper"
                style={{ background: badge.startsWith('Gen') ? cssColor('--lineage') : cssColor('--rel-family') }}
              >
                {badge}
              </span>
            )}
            <span className="truncate font-display text-[16px] font-semibold leading-tight">{c.name}</span>
            {inLine && (
              <span
                className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full"
                style={{ background: cssColor('--lineage') }}
                title="In the line of Jesus"
                aria-label="In the line of Jesus"
              />
            )}
          </span>
          <span className="block truncate font-sans text-xs text-ink-soft">{c.title}</span>
        </span>
      </button>
    </li>
  );
}

/** Compact "who lived at the same time" chart for one era: everyone packed into lanes on the era's own axis. */
function EraStrip({
  members,
  start,
  end,
  isDim,
  selectedId,
  onSelect,
}: {
  members: Character[];
  start: number;
  end: number;
  isDim: (id: string) => boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const lo = Math.min(start, ...members.map((c) => c.dates.start));
  const hi = Math.max(end, ...members.map((c) => c.dates.end));
  const span = Math.max(hi - lo, 1);
  const minW = span * 0.025; // very short spans still get a tappable mark
  const sorted = [...members].sort((a, b) => a.dates.start - b.dates.start);
  const laneEnd: number[] = [];
  const bars = sorted.map((c) => {
    const s0 = c.dates.start;
    const e0 = Math.max(c.dates.end, s0 + minW);
    let lane = 0;
    while (laneEnd[lane] !== undefined && laneEnd[lane] + span * 0.012 > s0) lane++;
    laneEnd[lane] = e0;
    return { c, x: ((s0 - lo) / span) * 100, w: ((e0 - s0) / span) * 100, lane };
  });
  const LANE = 9;
  const fmt = fmtYear;
  const ticks = [lo, lo + span / 2, hi].map((y) => Math.round(y));
  return (
    <div className="border-b border-rule px-3 pb-2 pt-2.5">
      <div className="eyebrow mb-1.5 !text-[10px]">Who lived at the same time · tap a bar</div>
      <div className="relative" style={{ height: laneEnd.length * LANE }}>
        {bars.map(({ c, x, w, lane }) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            aria-label={`${c.name}, ${formatYearRange(c.dates.start, c.dates.end)}`}
            title={c.name}
            className="focus-ring absolute flex items-center"
            style={{ left: `${x}%`, width: `max(${w}%, 6px)`, top: lane * LANE, height: LANE }}
          >
            <span
              className="block h-[6px] w-full rounded-full"
              style={{
                background: cssColor(roleCss(c.role)),
                opacity: isDim(c.id) ? 0.2 : 1,
                boxShadow: selectedId === c.id ? `0 0 0 2px ${cssColor('--ink')}` : undefined,
              }}
            />
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between font-sans text-[10px] tabular-nums text-ink-soft">
        {ticks.map((t, i) => (
          <span key={i}>{fmt(t)}</span>
        ))}
      </div>
    </div>
  );
}

/** "~120 years later" marker between two rows when time jumps noticeably. */
function GapMarker({ years }: { years: number }) {
  const r = years >= 100 ? Math.round(years / 10) * 10 : Math.round(years / 5) * 5;
  return (
    <li aria-hidden className="grid grid-cols-[4.6rem_18px_1fr] items-center gap-x-2 py-0.5">
      <span />
      <span className="flex justify-center">
        <span className="h-1 w-1 rounded-full bg-ink/40" />
      </span>
      <span className="font-sans text-[10.5px] italic text-ink-soft">~{r.toLocaleString('en-US')} years later</span>
    </li>
  );
}

export function VerticalTimeline({ model, arrangement, highlight, selectedId, onSelect }: Props) {
  const groups = groupPeople(model.people, arrangement === 'book' ? 'book' : 'era');
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const toggleGroup = (key: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  const isDim = (id: string) =>
    highlight === 'lineage'
      ? !LINEAGE_SET.has(id)
      : highlight === 'twelve'
        ? !TWELVE_SET.has(id)
        : model.filtering && !model.matchSet.has(id);
  const badgeFor = (c: Character) =>
    highlight === 'lineage' && c.lineage
      ? `Gen ${c.lineage.generation}`
      : highlight === 'twelve' && SON_ORDER[c.id]
        ? `${SON_ORDER[c.id]} of 12`
        : null;

  if (!groups.length && !model.spiritsShown.length) {
    return <p className="px-4 py-10 text-center font-sans text-sm text-ink-soft">No characters match these filters.</p>;
  }

  return (
    <div>
      <aside className="flex items-center gap-3 border-b border-rule bg-ink/[0.03] px-3 py-2.5 font-sans text-[11.5px] leading-snug text-ink-soft">
        <span>
          Each {arrangement === 'book' ? 'book group' : 'era'} opens with a chart of <b className="text-ink">who lived at the same time</b>: one
          bar per person, <b className="text-ink">coloured by role</b> (key above). The list runs in date order; long eras show the first few, with “Show all” for the rest.
          {highlight !== 'lineage' && (
            <>
              {' '}
              A <span className="inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: cssColor('--lineage') }} /> marks the
              line of Jesus.
            </>
          )}
        </span>
      </aside>
      {groups.map((g) => (
        <section key={g.key} aria-label={g.label}>
          <header className="sticky top-0 z-20 border-b border-rule bg-paper/95 px-3 py-2 backdrop-blur">
            <h3 className="font-display text-lg font-semibold leading-tight">{g.label}</h3>
            <span className="font-sans text-[11px] tabular-nums text-ink-soft">
              {g.sub} · {g.members.length} {g.members.length === 1 ? 'person' : 'people'}
            </span>
          </header>
          {g.members.length > 1 && (
            <EraStrip members={g.members} start={g.start} end={g.end} isDim={isDim} selectedId={selectedId} onSelect={onSelect} />
          )}
          {(() => {
            // Long eras start folded to a short preview (the chart above is the overview);
            // a search, filter or highlight opens everything.
            const foldable = !model.filtering && g.members.length > PREVIEW + 2;
            const isOpen = !foldable || open.has(g.key) || g.members.some((m) => m.id === selectedId && g.members.indexOf(m) >= PREVIEW);
            const list = isOpen ? g.members : g.members.slice(0, PREVIEW);
            return (
              <>
                <ol className="relative px-1 py-1">
                  {/* the vertical rail */}
                  <span aria-hidden className="absolute bottom-0 top-0 w-px bg-ink/20" style={{ left: 'calc(0.25rem + 4.6rem + 0.5rem + 9px)' }} />
                  {list.map((c, i) => {
                    const prev = list[i - 1];
                    const gap = prev ? c.dates.start - prev.dates.start : 0;
                    const showGap = gap >= 30 && gap >= (g.end - g.start) * 0.08;
                    return (
                      <Fragment key={c.id}>
                        {showGap && <GapMarker years={gap} />}
                        <Row
                          c={c}
                          dim={isDim(c.id)}
                          selected={selectedId === c.id}
                          badge={badgeFor(c)}
                          onSelect={() => onSelect(c.id)}
                        />
                      </Fragment>
                    );
                  })}
                </ol>
                {foldable && (
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => toggleGroup(g.key)}
                      aria-expanded={isOpen}
                      className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-full border border-rule py-2 font-sans text-[13px] font-medium hover:border-ink/50 active:bg-ink/5"
                    >
                      {isOpen ? 'Show fewer' : `Show all ${g.members.length} people`}
                      <ChevronDown size={14} aria-hidden className={isOpen ? 'rotate-180' : ''} />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </section>
      ))}
      {model.spiritsShown.length > 0 && (
        <section aria-label="Heavenly beings">
          <header className="sticky top-0 z-20 border-b border-rule bg-paper/95 px-3 py-2 backdrop-blur">
            <h3 className="font-display text-lg font-semibold">Heavenly beings</h3>
          </header>
          <ol className="px-1 py-1">
            {model.spiritsShown.map((c) => (
              <Row
                key={c.id}
                c={c}
                dim={isDim(c.id)}
                selected={selectedId === c.id}
                badge={null}
                onSelect={() => onSelect(c.id)}
              />
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
