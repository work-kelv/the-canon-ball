import { BookMarked, CalendarRange, RotateCcw, UserRound } from 'lucide-react';
import type { Era, Role } from '../../characterTypes';
import { books } from '../../lib/books';
import {
  EMPTY_FILTERS,
  ERAS,
  ROLES,
  TESTAMENT_ERAS,
  type CharacterFilters,
  type TestamentFilter,
  characters,
  cssColor,
  isFiltering,
} from '../../lib/characters';
import { FilterSelect, Segmented } from './controls';

interface Props {
  filters: CharacterFilters;
  onChange: (f: CharacterFilters) => void;
  matchCount: number;
}

const bookCounts: Record<string, number> = {};
for (const c of characters) for (const b of c.books) bookCounts[b.book] = (bookCounts[b.book] ?? 0) + 1;

/** One tidy row: Testament switch + Era / Book / Role dropdowns + count and Clear all. */
export function CharacterFilterBar({ filters, onChange, matchCount }: Props) {
  const set = (patch: Partial<CharacterFilters>) => onChange({ ...filters, ...patch });
  const setTestament = (t: TestamentFilter) => {
    // Drop an era that contradicts the chosen testament.
    const era = filters.era && t && !TESTAMENT_ERAS[t].includes(filters.era) ? null : filters.era;
    set({ testament: t, era });
  };
  const eras = ERAS.filter((e) => !filters.testament || TESTAMENT_ERAS[filters.testament].includes(e.id));
  const role = ROLES.find((r) => r.id === filters.role);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented<TestamentFilter>
        label="Testament"
        value={filters.testament}
        onChange={setTestament}
        className="w-full sm:w-auto"
        options={[
          { id: null, label: 'Both', title: 'All characters' },
          { id: 'Old', label: 'Old Testament', title: 'People of the Old Testament eras (Creation to the return from exile)' },
          { id: 'New', label: 'New Testament', title: 'People of the Gospels and the early church' },
        ]}
      />
      <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto">
        <FilterSelect
          label="Era"
          icon={<CalendarRange size={14} aria-hidden className="hidden shrink-0 opacity-70 sm:block" />}
          value={filters.era}
          onChange={(v) => set({ era: v as Era | null })}
          options={eras.map((e) => ({ value: e.id, label: e.id }))}
          className="sm:max-w-[15rem]"
        />
        <FilterSelect
          label="Book"
          icon={<BookMarked size={14} aria-hidden className="hidden shrink-0 opacity-70 sm:block" />}
          value={filters.book}
          onChange={(v) => set({ book: v })}
          allLabel="All"
          groups={(['Old', 'New'] as const).map((t) => ({
            label: `${t} Testament`,
            options: books
              .filter((b) => b.testament === t)
              .map((b) => ({
                value: b.name,
                label: bookCounts[b.name] ? `${b.name} (${bookCounts[b.name]})` : `${b.name} — none`,
                disabled: !bookCounts[b.name],
              })),
          }))}
          className="sm:max-w-[13rem]"
        />
        <FilterSelect
          label="Role"
          icon={
            role ? (
              <span className="hidden h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-paper sm:block" style={{ background: cssColor(role.css) }} />
            ) : (
              <UserRound size={14} aria-hidden className="hidden shrink-0 opacity-70 sm:block" />
            )
          }
          value={filters.role}
          onChange={(v) => set({ role: v as Role | null })}
          options={ROLES.map((r) => ({ value: r.id, label: r.id }))}
          className="sm:max-w-[14rem]"
        />
      </div>
      <div className="ml-auto flex items-center gap-2 font-sans text-xs tabular-nums text-ink-soft" aria-live="polite">
        <span>
          <b className="font-semibold text-ink">{matchCount}</b> of {characters.length} people
        </span>
        {isFiltering(filters) && (
          <button
            onClick={() => onChange(EMPTY_FILTERS)}
            className="focus-ring inline-flex items-center gap-1 rounded-full border border-rule px-2.5 py-1 font-medium text-ink hover:border-ink/60"
          >
            <RotateCcw size={12} aria-hidden /> Clear all
          </button>
        )}
      </div>
    </div>
  );
}
