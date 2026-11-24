import type { Character } from '../../characterTypes';
import {
  ERAS,
  type CharacterFilters,
  characters,
  cssColor,
  isFiltering,
  matchesCharacter,
  roleCss,
} from '../../lib/characters';

interface Props {
  filters: CharacterFilters;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function Chip({
  c,
  dimmed,
  selected,
  bookVerses,
  onSelect,
}: {
  c: Character;
  dimmed: boolean;
  selected: boolean;
  bookVerses: number | null;
  onSelect: () => void;
}) {
  const dot = 8 + (c.prominenceScore / 100) * 18;
  return (
    <button
      onClick={onSelect}
      className={`focus-ring group flex min-w-0 items-center gap-2.5 rounded-sm border px-2.5 py-2 text-left transition-all hover:-translate-y-0.5 hover:border-ink/50 hover:shadow-md ${
        selected ? 'border-ink bg-ink/[0.06] ring-1 ring-ink' : 'border-rule bg-paper/70'
      } ${dimmed ? 'opacity-25 saturate-0' : ''}`}
      title={`${c.name} — ${c.title} (prominence ${c.prominenceScore})`}
    >
      <span className="flex w-[26px] shrink-0 justify-center">
        <span
          className="rounded-full ring-2 ring-paper"
          style={{ width: dot, height: dot, background: cssColor(roleCss(c.role)) }}
        />
      </span>
      <span className="min-w-0">
        <span className="block break-words font-display text-[15px] font-semibold leading-tight">{c.name}</span>
        <span className="block break-words font-sans text-[12px] leading-snug text-ink-soft">
          {c.title}
          {bookVerses != null && <> · <span className="text-ink">{bookVerses} vv.</span></>}
        </span>
      </span>
    </button>
  );
}

export function EraTimeline({ filters, selectedId, onSelect }: Props) {
  const filtering = isFiltering(filters);

  return (
    <ol className="relative space-y-0">
      {ERAS.map((era, i) => {
        const inEra = characters
          .filter((c) => c.era === era.id)
          .sort((a, b) => b.prominenceScore - a.prominenceScore);
        const matching = inEra.filter((c) => matchesCharacter(c, filters));
        const firstNT = i > 0 && era.testament === 'New' && ERAS[i - 1].testament === 'Old';
        return (
          <li key={era.id}>
            {firstNT && (
              <div className="my-4 flex items-center gap-3 font-sans text-[12px] uppercase tracking-[0.2em] text-ink-soft">
                <span className="h-px flex-1 bg-rule" />
                New Testament
                <span className="h-px flex-1 bg-rule" />
              </div>
            )}
            <div className="grid gap-x-6 gap-y-3 border-t border-rule py-5 md:grid-cols-[13rem_1fr]">
              <div className="relative md:pl-6">
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 hidden h-3 w-3 rounded-full border-2 border-ink bg-paper md:block"
                />
                <span
                  aria-hidden
                  className={`absolute left-[5px] top-6 hidden w-0.5 bg-ink/20 md:block ${i === ERAS.length - 1 ? 'h-0' : '-bottom-6'}`}
                />
                <div className="eyebrow">{era.testament} Testament</div>
                <h3 className="mt-0.5 font-display text-xl font-semibold leading-tight">{era.id}</h3>
                <div className="mt-1 font-serif text-sm italic text-ink-soft">{era.dates}</div>
                <div className="mt-1 font-sans text-xs tabular-nums text-ink-soft">
                  {filtering ? `${matching.length} of ${inEra.length}` : inEra.length} characters
                </div>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))] gap-2">
                {inEra.map((c) => (
                  <Chip
                    key={c.id}
                    c={c}
                    dimmed={filtering && !matching.includes(c)}
                    selected={selectedId === c.id}
                    bookVerses={filters.book ? c.books.find((b) => b.book === filters.book)?.verses ?? null : null}
                    onSelect={() => onSelect(c.id)}
                  />
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
