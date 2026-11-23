import { useCallback, useMemo, useState } from 'react';
import { BarChart3, CalendarRange, LayoutGrid } from 'lucide-react';
import { BookTimeline } from './BookTimeline';
import type { BibleBook, Division, LanguageFilter } from '../types';
import { books, matchesFilter, meta } from '../lib/books';
import { FilterPills } from './FilterPills';
import { GridView } from './GridView';
import { BreakdownView } from './BreakdownView';
import { BookDrawer } from './BookDrawer';
import { ViewTabs } from './ViewTabs';

type View = 'grid' | 'timeline' | 'breakdown';

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
      <div style={{ top: 'calc(var(--tabs-h, 44px) - 1px)' }} className="sticky z-10 -mx-4 -mt-6 space-y-3 border-b border-rule bg-paper/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <ViewTabs<View>
          label="Views"
          value={view}
          onChange={setView}
          tabs={[
            { id: 'grid', label: 'Canon grid', short: 'Grid', icon: LayoutGrid },
            { id: 'timeline', label: 'When written', short: 'Timeline', icon: CalendarRange },
            { id: 'breakdown', label: 'Language & division breakdown', short: 'Breakdown', icon: BarChart3 },
          ]}
        />
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
        ) : view === 'timeline' ? (
          <BookTimeline isMatch={isMatch} selected={selected} onOpen={setSelected} />
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
