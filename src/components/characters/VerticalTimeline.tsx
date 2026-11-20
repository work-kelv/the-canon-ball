import type { Character } from '../../characterTypes';
import { cssColor, formatYearRange, lineage, roleCss, twelveSons } from '../../lib/characters';
import { type Arrangement, type Highlight, SON_IDS, groupPeople, type useTimelineModel } from './timelineModel';

interface Props {
  model: ReturnType<typeof useTimelineModel>;
  arrangement: Arrangement;
  highlight: Highlight;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const LINEAGE_SET = new Set(lineage);
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
  span,
  dim,
  selected,
  badge,
  onSelect,
}: {
  c: Character;
  span: { start: number; end: number };
  dim: boolean;
  selected: boolean;
  badge: string | null;
  onSelect: () => void;
}) {
  const role = cssColor(roleCss(c.role));
  // Mini bar: the grey track is the group's whole span; the coloured part is this person's years.
  // Short spans (a single year) still get a visible 4% mark, kept inside the track.
  const total = Math.max(span.end - span.start, 1);
  const w = Math.max(((c.dates.end - c.dates.start) / total) * 100, 4);
  const left = Math.min(Math.max(((c.dates.start - span.start) / total) * 100, 0), 100 - w);
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
          {c.kind === 'human' && (
            <span className="mt-1 block h-1 rounded-full bg-ink/[0.07]" aria-hidden>
              <span
                className="block h-full rounded-full"
                style={{ marginLeft: `${left}%`, width: `${w}%`, background: role }}
              />
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

export function VerticalTimeline({ model, arrangement, highlight, selectedId, onSelect }: Props) {
  const groups = groupPeople(model.people, arrangement === 'book' ? 'book' : 'era');
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
        <span aria-hidden className="block h-1 w-16 shrink-0 rounded-full bg-ink/[0.1]">
          <span className="ml-[30%] block h-full w-[40%] rounded-full" style={{ background: cssColor('--role-king') }} />
        </span>
        <span>
          The line under each name shows <b className="text-ink">when they lived</b>: the grey track is the whole{' '}
          {arrangement === 'book' ? 'book group' : 'era'}, the coloured part is their years. Its{' '}
          <b className="text-ink">colour is their role</b> (key below).
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
          <ol className="relative px-1 py-1">
            {/* the vertical rail */}
            <span aria-hidden className="absolute bottom-0 top-0 w-px bg-ink/20" style={{ left: 'calc(0.25rem + 4.6rem + 0.5rem + 9px)' }} />
            {g.members.map((c) => (
              <Row
                key={c.id}
                c={c}
                span={g}
                dim={isDim(c.id)}
                selected={selectedId === c.id}
                badge={badgeFor(c)}
                onSelect={() => onSelect(c.id)}
              />
            ))}
          </ol>
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
                span={{ start: c.dates.start, end: c.dates.end }}
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
