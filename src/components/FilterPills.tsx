import { X } from 'lucide-react';
import type { Division, Language, LanguageFilter } from '../types';
import { FILTERS, books, langColor, matchesFilter } from '../lib/books';

const DOTS: Record<LanguageFilter, Language[]> = {
  all: ['Hebrew', 'Aramaic', 'Greek'],
  hebrew: ['Hebrew'],
  aramaic: ['Aramaic'],
  greek: ['Greek'],
  mixed: ['Hebrew', 'Aramaic'],
};

interface Props {
  filter: LanguageFilter;
  onFilter: (f: LanguageFilter) => void;
  division: Division | null;
  onClearDivision: () => void;
  matchCount: number;
}

export function FilterPills({ filter, onFilter, division, onClearDivision, matchCount }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-1">Language</span>
      <div role="radiogroup" aria-label="Filter by language" className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = f.id === filter;
          const count = books.filter((b) => matchesFilter(b, f.id)).length;
          return (
            <button
              key={f.id}
              role="radio"
              aria-checked={active}
              title={f.hint}
              onClick={() => onFilter(f.id)}
              className={`focus-ring inline-flex items-center gap-2 rounded-full border px-3 py-1 font-sans text-xs font-medium transition-colors ${
                active
                  ? 'border-ink bg-ink text-paper'
                  : 'border-rule bg-paper/60 text-ink hover:border-ink/60'
              }`}
            >
              <span className="flex -space-x-1">
                {DOTS[f.id].map((l) => (
                  <span
                    key={l}
                    className="h-2.5 w-2.5 rounded-full ring-1 ring-paper"
                    style={{ background: langColor(l) }}
                  />
                ))}
              </span>
              {f.label}
              <span className={`tabular-nums ${active ? 'text-paper/70' : 'text-ink-soft'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
      {division && (
        <button
          onClick={onClearDivision}
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-dashed border-ink/50 px-3 py-1 font-sans text-xs font-medium hover:bg-ink/5"
          title="Clear division filter"
        >
          {division}
          <X size={12} aria-hidden />
          <span className="sr-only">Clear division filter</span>
        </button>
      )}
      <span className="ml-auto font-sans text-xs text-ink-soft tabular-nums" aria-live="polite">
        {matchCount} of 66 books
      </span>
    </div>
  );
}
