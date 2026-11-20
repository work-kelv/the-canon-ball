import { useCallback, useMemo, useState } from 'react';
import { BarChart3, LayoutGrid } from 'lucide-react';
import type { BibleBook, Division, LanguageFilter } from '../types';
import { books, matchesFilter, meta } from '../lib/books';
import { FilterPills } from './FilterPills';
import { GridView } from './GridView';
import { BreakdownView } from './BreakdownView';
import { BookDrawer } from './BookDrawer';

type View = 'grid' | 'breakdown';

export function LanguagesPage() {
  const [view, setView] = useState<View>('grid');
  const [filter, setFilter] = useState<LanguageFilter>('all');
  const [division, setDivision] = useState<Division | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const isMatch = useCallback(
    (b: BibleBook) => matchesFilter(b, filter) && (!division || b.division === division),
    [filter, division],
  );
  const langBooks = useMemo(() => books.filter((b) => matchesFilter(b, filter)), [filter]);
  const visible = useMemo(() => books.filter(isMatch), [isMatch]);

  const book = selected ? books[selected - 1] : null;
  const close = useCallback(() => setSelected(null), []);
  const prev = useCallback(() => setSelected((s) => (s && s > 1 ? s - 1 : s)), []);
  const next = useCallback(() => setSelected((s) => (s && s < 66 ? s + 1 : s)), []);

  return (
    <>
      <div className="sticky top-0 z-30 -mx-4 space-y-3 border-b border-rule bg-paper/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <nav aria-label="Views" className="flex gap-1 font-sans text-sm">
          {(
            [
              ['grid', 'Canon grid', LayoutGrid],
              ['breakdown', 'Language & division breakdown', BarChart3],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              aria-current={view === id ? 'page' : undefined}
              className={`focus-ring inline-flex items-center gap-2 border-b-2 px-3 py-1.5 font-medium transition-colors ${
                view === id ? 'border-ink text-ink' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              <Icon size={15} aria-hidden />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{id === 'grid' ? 'Grid' : 'Breakdown'}</span>
            </button>
          ))}
        </nav>
        <FilterPills
          filter={filter}
          onFilter={setFilter}
          division={division}
          onClearDivision={() => setDivision(null)}
          matchCount={visible.length}
        />
      </div>

      <main className="pt-8">
        {view === 'grid' ? (
          <GridView isMatch={isMatch} division={division} onDivision={setDivision} selected={selected} onOpen={setSelected} />
        ) : (
          <BreakdownView langBooks={langBooks} visible={visible} division={division} onDivision={setDivision} onOpen={setSelected} />
        )}
      </main>

      <footer className="mt-16 border-t border-rule pt-6 font-sans text-xs leading-relaxed text-ink-soft">
        <p>{meta.chapterAndVerseCounts}</p>
        <p className="mt-1">{meta.languagePercentNote}</p>
        <p className="mt-1">{meta.datingNote}</p>
      </footer>

      {book && (
        <BookDrawer
          book={book}
          onClose={close}
          onPrev={book.order > 1 ? prev : null}
          onNext={book.order < 66 ? next : null}
        />
      )}
    </>
  );
}
