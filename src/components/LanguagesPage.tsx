import { useCallback, useMemo, useState } from 'react';
import { BookTimeline } from './BookTimeline';
import type { BibleBook, Division, LanguageFilter } from '../types';
import { FILTERS, books, matchesFilter, meta } from '../lib/books';
import { FilterPills } from './FilterPills';
import { GridView } from './GridView';
import { BreakdownView } from './BreakdownView';
import { BookDrawer } from './BookDrawer';
import { Fold, PageSection } from './sections';

/**
 * The first two sections of The Bible page, which share one set of filters and one book drawer:
 * 1. the 66 books by language (grid, with the breakdown folded beneath), and 2. when they were written.
 * The filters stay pinned only while section 1 is on screen.
 */
export function LanguagesSections() {
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
  const filtered = filter !== 'all' || division;

  return (
    <>
      <PageSection
        id="languages"
        n={1}
        first
        title="The 66 books and their languages"
        lead="All 66 books in Bible order, each coloured by the language it was first written in. Tap a book for its exact Aramaic passages, its date and why it used that language."
        takeaway="Hebrew for Israel’s Scriptures, a little Aramaic from the exile, and Greek for the New Testament: each the language its first readers understood."
      >
        <div className="space-y-8">
          <div
            style={{ top: 'calc(var(--jump-h, 44px) - 1px)' }}
            className="sticky z-20 -mx-4 border-b border-rule bg-paper/95 px-4 py-2 backdrop-blur sm:-mx-8 sm:px-8"
          >
            <FilterPills
              filter={filter}
              onFilter={setFilter}
              division={division}
              onClearDivision={() => setDivision(null)}
              matchCount={visible.length}
            />
          </div>

          <GridView isMatch={isMatch} division={division} onDivision={setDivision} selected={selected} onOpen={setSelected} />

          <Fold
            id="breakdown"
            title="Language & division breakdown"
            summary="How the chapters divide between the three languages and the parts of the Bible, with the same filters."
          >
            <BreakdownView langBooks={langBooks} visible={visible} division={division} onDivision={setDivision} onOpen={setSelected} />
          </Fold>

          <footer className="border-t border-rule pt-4 font-sans text-[12px] leading-relaxed text-ink-soft">
            <p>{meta.chapterAndVerseCounts}</p>
            <p className="mt-1">{meta.languagePercentNote}</p>
            <p className="mt-1">{meta.datingNote}</p>
          </footer>
        </div>
      </PageSection>

      <PageSection
        id="timeline"
        n={2}
        title="When the books were written"
        lead="Each bar runs from the earliest to the latest date commonly given for a book. Long bars mean the date is uncertain, or that the book grew over time. Tap a book for details."
        takeaway="The Old Testament grew over about a thousand years; the New Testament was written within a single lifetime."
      >
        {filtered && (
          <p className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-rule bg-paper/80 px-3 py-2 font-sans text-[13px]">
            <span>
              Showing <b>{visible.length}</b> of 66 books, filtered in section 1
              {filter !== 'all' && <> by {FILTERS.find((f) => f.id === filter)?.label}</>}
              {division && <> · {division}</>}.
            </span>
            <button
              onClick={() => {
                setFilter('all');
                setDivision(null);
              }}
              className="focus-ring ml-auto min-h-8 rounded-full border border-rule px-3 font-medium hover:border-ink/60"
            >
              Clear filters
            </button>
          </p>
        )}
        <BookTimeline isMatch={isMatch} selected={selected} onOpen={setSelected} />
      </PageSection>

      {book && <BookDrawer book={book} onClose={close} onPrev={book.order > 1 ? prev : null} onNext={book.order < 66 ? next : null} />}
    </>
  );
}
