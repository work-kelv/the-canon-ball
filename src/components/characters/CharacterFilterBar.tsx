import { useState } from 'react';
import { BookMarked, CalendarRange, RotateCcw, SlidersHorizontal, Star, UserRound } from 'lucide-react';
import { DetailSheet, useMedia } from '../DetailSheet';
import type { Era, Role } from '../../characterTypes';
import { books } from '../../lib/books';
import {
  EMPTY_FILTERS,
  ERAS,
  KEY_FIGURES,
  ROLES,
  TESTAMENT_ERAS,
  type CharacterFilters,
  type TestamentFilter,
  characters,
  cssColor,
} from '../../lib/characters';
import { FilterSelect, Segmented } from './controls';

interface Props {
  filters: CharacterFilters;
  onChange: (f: CharacterFilters) => void;
  matchCount: number;
}

const bookCounts: Record<string, number> = {};
for (const c of characters) for (const b of c.books) bookCounts[b.book] = (bookCounts[b.book] ?? 0) + 1;

/**
 * Wider screens: one tidy row (Testament switch, Era / Book / Role menus, Prominent figures, count, Clear all).
 * Phones: a single row (Filters · n, count, Clear) that opens the same controls in a sheet; changes apply
 * as you tap, and the sheet's button shows the live count.
 */
export function CharacterFilterBar({ filters, onChange, matchCount }: Props) {
  const phone = !useMedia('(min-width: 768px)');
  const [open, setOpen] = useState(false);
  const active = [filters.testament, filters.era, filters.book, filters.role, filters.keyOnly].filter(Boolean).length;
  const count = (
    <span aria-live="polite">
      <b className="font-semibold text-ink">{matchCount}</b> of {characters.length} people
    </span>
  );
  const clear = (label: string) =>
    active > 0 && (
      <button
        onClick={() => onChange({ ...EMPTY_FILTERS, query: filters.query })}
        className="focus-ring inline-flex min-h-8 items-center gap-1 rounded-full border border-rule px-3 font-sans text-[13px] font-medium text-ink hover:border-ink/60"
      >
        <RotateCcw size={13} aria-hidden /> {label}
      </button>
    );

  if (phone)
    return (
      <>
        <div className="flex items-center gap-2 font-sans text-[13px] tabular-nums text-ink-soft">
          <button
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-full border border-ink/60 px-3.5 font-semibold text-ink"
          >
            <SlidersHorizontal size={15} aria-hidden />
            Filters
            {active > 0 && <span className="rounded-full bg-ink px-1.5 text-[12px] leading-5 text-paper">{active}</span>}
          </button>
          <span className="ml-auto">{count}</span>
          {clear('Clear')}
        </div>
        {open && (
          <DetailSheet label="Filters" backLabel="Done" onClose={() => setOpen(false)} title="Filters" footer={false}>
            <div className="p-4">
              <FilterControls filters={filters} onChange={onChange} stacked />
            </div>
            <div className="sticky bottom-0 flex items-center gap-2 border-t border-rule bg-paper px-4 py-3">
              {clear('Clear all')}
              <button onClick={() => setOpen(false)} className="focus-ring ml-auto inline-flex min-h-10 items-center rounded-full bg-ink px-5 font-sans text-[14px] font-semibold text-paper">
                Show {matchCount} {matchCount === 1 ? 'person' : 'people'}
              </button>
            </div>
          </DetailSheet>
        )}
      </>
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterControls filters={filters} onChange={onChange} />
      <div className="ml-auto flex items-center gap-2 font-sans text-xs tabular-nums text-ink-soft">
        {count}
        {clear('Clear all')}
      </div>
    </div>
  );
}

/** Testament, Era, Book, Role and Prominent figures: in a row, or stacked in the phone sheet. */
function FilterControls({ filters, onChange, stacked = false }: { filters: CharacterFilters; onChange: (f: CharacterFilters) => void; stacked?: boolean }) {
  const set = (patch: Partial<CharacterFilters>) => onChange({ ...filters, ...patch });
  const setTestament = (t: TestamentFilter) => {
    // Drop an era that contradicts the chosen testament.
    const era = filters.era && t && !TESTAMENT_ERAS[t].includes(filters.era) ? null : filters.era;
    set({ testament: t, era });
  };
  const eras = ERAS.filter((e) => !filters.testament || TESTAMENT_ERAS[filters.testament].includes(e.id));
  const role = ROLES.find((r) => r.id === filters.role);

  return (
    <div className={stacked ? 'space-y-4' : 'contents'}>
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
      <div className={stacked ? 'grid gap-2' : 'flex w-auto gap-2'}>
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
      <button
        onClick={() => set({ keyOnly: !filters.keyOnly })}
        aria-pressed={filters.keyOnly}
        title="Show only the prominent figures named for each book in the per-book list"
        className={`focus-ring inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 font-sans text-[13px] font-medium transition-colors ${
          filters.keyOnly ? 'border-ink bg-ink text-paper' : 'border-rule bg-paper/70 hover:border-ink/60'
        }`}
      >
        <Star size={13} aria-hidden className={filters.keyOnly ? 'fill-current' : ''} />
        Prominent figures only <span className="tabular-nums opacity-70">({KEY_FIGURES.size})</span>
      </button>
    </div>
  );
}
