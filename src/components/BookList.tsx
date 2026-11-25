import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { books, langColor } from '../lib/books';
import { BOOK_INTROS, KIND_HELP, type BookKind } from '../lib/bookIntros';

const KINDS = Object.keys(KIND_HELP) as BookKind[];

/**
 * Beginner view of the 66 books: a list in Bible order, each with a one-line description,
 * filtered by kind of book (story, law, poetry, prophecy, Gospel, letter, vision). Tap a book to read more.
 */
export function BookList({ onOpen }: { onOpen: (order: number) => void }) {
  const [kind, setKind] = useState<BookKind | null>(null);
  const shown = books.filter((b) => !kind || BOOK_INTROS[b.order].kind === kind);
  const chip = (on: boolean) =>
    `focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 font-sans text-[13px] ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:border-ink/60'}`;
  return (
    <div className="space-y-5">
      <div>
        <div className="eyebrow mb-2">What kind of book?</div>
        <div role="radiogroup" aria-label="Kind of book" className="flex flex-wrap gap-1.5">
          <button role="radio" aria-checked={!kind} onClick={() => setKind(null)} className={chip(!kind)}>
            All 66
          </button>
          {KINDS.map((k) => {
            const n = books.filter((b) => BOOK_INTROS[b.order].kind === k).length;
            return (
              <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)} title={KIND_HELP[k]} className={chip(kind === k)}>
                {k} <span className="tabular-nums opacity-70">{n}</span>
              </button>
            );
          })}
        </div>
        {kind && <p className="mt-2 font-sans text-[13px] text-ink-soft">{KIND_HELP[kind]}.</p>}
      </div>

      {(['Old', 'New'] as const).map((t) => {
        const list = shown.filter((b) => b.testament === t);
        if (!list.length) return null;
        return (
          <div key={t}>
            <h3 className="mb-2 flex flex-wrap items-baseline gap-x-3 border-b border-ink/80 pb-1 font-display text-2xl font-semibold">
              {t} Testament
              <span className="font-serif text-[15px] font-normal italic text-ink-soft">
                {t === 'Old' ? 'written before Jesus, mostly in Hebrew' : 'written after Jesus, in Greek'}
              </span>
            </h3>
            <ul className="grid gap-x-6 sm:grid-cols-2">
              {list.map((b) => {
                const intro = BOOK_INTROS[b.order];
                return (
                  <li key={b.order} className="border-b border-rule/70">
                    <button onClick={() => onOpen(b.order)} className="focus-ring group flex w-full items-start gap-3 py-2.5 text-left">
                      <span
                        aria-hidden
                        className="mt-1 h-8 w-1.5 shrink-0 rounded-full"
                        style={{ background: langColor(b.testament === 'Old' ? 'Hebrew' : 'Greek', 0.75) }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-display text-[17px] font-semibold group-hover:underline">{b.name}</span>
                          <span className="font-sans text-[12px] text-ink-soft">{intro.kind}</span>
                        </span>
                        <span className="block font-serif text-[15px] leading-snug text-ink-soft">{intro.oneLine}</span>
                      </span>
                      <ChevronRight size={16} aria-hidden className="mt-1.5 shrink-0 text-ink-soft" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** Beginner view of when the books were written: two long eras with Jesus between them. */
export function SimpleTimeline() {
  const parts = [
    { t: 'Old Testament', d: 'c. 1450–160 BC', n: '39 books', body: 'Written over about a thousand years, from the time of Moses to after the return from exile, mostly in Hebrew.', css: 'Hebrew' as const },
    { t: 'Jesus', d: 'c. 4 BC – AD 30', n: '', body: 'Jesus lives, dies and rises again. About four hundred years separate the last Old Testament book from the first New Testament writing.', css: null },
    { t: 'New Testament', d: 'c. AD 45–125', n: '27 books', body: 'Written within a single lifetime by Jesus’ first followers and those who knew them, in Greek.', css: 'Greek' as const },
  ];
  return (
    <ol className="grid gap-3 md:grid-cols-[1.4fr_1fr_1.2fr]">
      {parts.map((p) => (
        <li
          key={p.t}
          className="rounded-md border border-rule bg-paper/85 px-4 py-3"
          style={{ boxShadow: `inset 0 4px 0 ${p.css ? langColor(p.css) : 'rgb(var(--lineage))'}` }}
        >
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-xl font-semibold">{p.t}</h3>
            <span className="font-sans text-[12.5px] font-semibold tabular-nums text-ink-soft">{p.n}</span>
          </div>
          <div className="font-sans text-[13px] font-semibold tabular-nums">{p.d}</div>
          <p className="mt-1 font-serif text-[15px] leading-snug">{p.body}</p>
        </li>
      ))}
    </ol>
  );
}
