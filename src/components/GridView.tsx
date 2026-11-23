import { useState } from 'react';
import { Columns3, Rows3 } from 'lucide-react';
import type { BibleBook, Division, Testament } from '../types';
import {
  DIVISIONS,
  LANGUAGE_INFO,
  MAX_CHAPTERS,
  books,
  heatAlpha,
  langColor,
  languagePercent,
} from '../lib/books';

type Sizing = 'uniform' | 'chapters';

interface Props {
  isMatch: (b: BibleBook) => boolean;
  division: Division | null;
  onDivision: (d: Division | null) => void;
  selected: number | null;
  onOpen: (order: number) => void;
}

function tileBackground(book: BibleBook): string {
  const a = heatAlpha(book.chapters);
  if (book.languageClass === 'mixed') {
    // Daniel/Ezra split at their true Aramaic share; Genesis/Jeremiah show a corner "trace".
    const ar = languagePercent(book, 'Aramaic');
    const split = 100 - Math.max(ar, 16);
    return `linear-gradient(135deg, ${langColor('Hebrew', a)} ${split}%, ${langColor(
      'Aramaic',
      Math.max(a, 0.9),
    )} ${split}%)`;
  }
  return langColor(book.languageClass === 'hebrew' ? 'Hebrew' : 'Greek', a);
}

function LangBadge({ book }: { book: BibleBook }) {
  if (book.languageClass === 'mixed') {
    return (
      <span className="inline-flex overflow-hidden rounded-[2px] font-sans text-[9px] font-semibold leading-none ring-1 ring-paper/70">
        <span className="px-1 py-0.5 text-paper" style={{ background: langColor('Hebrew') }}>
          HE
        </span>
        <span className="px-1 py-0.5 text-paper" style={{ background: langColor('Aramaic') }}>
          AR
        </span>
      </span>
    );
  }
  return null;
}

function BookTile({
  book,
  sizing,
  dimmed,
  selected,
  onOpen,
}: {
  book: BibleBook;
  sizing: Sizing;
  dimmed: boolean;
  selected: boolean;
  onOpen: () => void;
}) {
  const strong = heatAlpha(book.chapters) > 0.56;
  const width = sizing === 'uniform' ? 78 : Math.max(52, 30 + book.chapters * 2.4);
  const tiny = width < 64;
  const aramaicCount = book.aramaicPhrases.length;

  return (
    <button
      onClick={onOpen}
      aria-label={`${book.name}, ${book.chapters} chapters, ${book.languages
        .map((l) => l.language)
        .join(' and ')}`}
      title={`${book.order}. ${book.name} — ${book.chapters} ch · ${book.languages
        .map((l) => l.language)
        .join(' + ')}`}
      style={{ width, background: tileBackground(book) }}
      className={`focus-ring group relative flex h-[86px] max-w-full shrink-0 flex-col justify-between overflow-hidden rounded-[3px] border p-1.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        strong ? 'text-paper' : 'text-ink'
      } ${selected ? 'border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper' : 'border-ink/10'} ${
        dimmed ? 'opacity-[0.14] saturate-0 hover:opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="font-sans text-[10px] tabular-nums opacity-70">{book.order}</span>
        {!tiny && <LangBadge book={book} />}
        {!tiny && aramaicCount > 0 && (
          <span
            className="rounded-full px-1 font-sans text-[9px] font-semibold leading-[14px] text-paper"
            style={{ background: langColor('Aramaic') }}
            title={`${aramaicCount} transliterated Aramaic word(s)`}
          >
            ✦{aramaicCount}
          </span>
        )}
      </div>
      <div className="font-display text-[15px] font-semibold leading-none tracking-tight">
        {book.abbrev}
      </div>
      <div className="flex items-end justify-between font-sans text-[10px] tabular-nums">
        <span>
          <span className="font-semibold">{book.chapters}</span>
          {!tiny && <span className="opacity-70"> ch</span>}
        </span>
      </div>
      {/* chapter gauge */}
      <span
        aria-hidden
        className={`absolute bottom-0 left-0 h-[3px] ${strong ? 'bg-paper/70' : 'bg-ink/50'}`}
        style={{ width: `${(book.chapters / MAX_CHAPTERS) * 100}%` }}
      />
    </button>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-xs text-ink-soft">
      {(['Hebrew', 'Aramaic', 'Greek'] as const).map((l) => (
        <span key={l} className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px]" style={{ background: langColor(l) }} />
          {l}
          <span className={`${LANGUAGE_INFO[l].nativeClass} text-ink/60`}>{LANGUAGE_INFO[l].native}</span>
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span
          className="h-3 w-3 rounded-[2px]"
          style={{
            background: `linear-gradient(135deg, ${langColor('Hebrew')} 50%, ${langColor('Aramaic')} 50%)`,
          }}
        />
        Hebrew + Aramaic (split ∝ verses)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="rounded-full px-1 text-[9px] font-semibold leading-[14px] text-paper"
          style={{ background: langColor('Aramaic') }}
        >
          ✦
        </span>
        Aramaic words in Greek text
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="h-3 w-16 rounded-[2px]"
          style={{
            background: `linear-gradient(90deg, ${langColor('Hebrew', 0.2)}, ${langColor('Hebrew', 0.95)})`,
          }}
        />
        1 → 150 chapters
      </span>
    </div>
  );
}

export function GridView({ isMatch, division, onDivision, selected, onOpen }: Props) {
  const [sizing, setSizing] = useState<Sizing>('uniform');

  const testaments: { id: Testament; title: string; sub: string }[] = [
    { id: 'Old', title: 'Old Testament', sub: 'Written before Jesus · Biblical Hebrew, with Aramaic portions' },
    { id: 'New', title: 'New Testament', sub: 'Written after Jesus · Koine Greek' },
  ];

  return (
    <section aria-label="Canon grid" className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Legend />
        <div
          role="radiogroup"
          aria-label="Tile sizing"
          className="inline-flex rounded-full border border-rule p-0.5 font-sans text-xs"
        >
          {(
            [
              ['uniform', 'Uniform', Columns3],
              ['chapters', 'Size by chapters', Rows3],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              role="radio"
              aria-checked={sizing === id}
              onClick={() => setSizing(id)}
              className={`focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${
                sizing === id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Icon size={13} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      {testaments.map((t) => {
        const tBooks = books.filter((b) => b.testament === t.id);
        const chapters = tBooks.reduce((n, b) => n + b.chapters, 0);
        return (
          <div key={t.id}>
            <header className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-ink/80 pb-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight">{t.title}</h2>
              <span className="font-serif italic text-ink-soft">{t.sub}</span>
              <span className="ml-auto font-sans text-xs tabular-nums text-ink-soft">
                {tBooks.length} books · {chapters} chapters
              </span>
            </header>
            <div className="flex flex-wrap gap-x-7 gap-y-6">
              {DIVISIONS.filter((d) => d.testament === t.id).map((d) => {
                const dBooks = tBooks.filter((b) => b.division === d.name);
                const dCh = dBooks.reduce((n, b) => n + b.chapters, 0);
                const active = division === d.name;
                return (
                  <div key={d.name} className="min-w-0 max-w-full">
                    <button
                      onClick={() => onDivision(active ? null : d.name)}
                      className={`focus-ring mb-2 flex items-baseline gap-2 rounded-sm text-left ${
                        active ? 'text-ink' : 'text-ink-soft hover:text-ink'
                      }`}
                      title={active ? 'Clear division filter' : `Filter to ${d.name}`}
                    >
                      <span className={`eyebrow ${active ? '!text-ink underline underline-offset-4' : ''}`}>
                        {d.name}
                      </span>
                      <span className="font-sans text-[11px] tabular-nums">
                        {dBooks.length} · {dCh} ch
                      </span>
                    </button>
                    <div className="flex flex-wrap gap-1.5">
                      {dBooks.map((b) => (
                        <BookTile
                          key={b.order}
                          book={b}
                          sizing={sizing}
                          dimmed={!isMatch(b)}
                          selected={selected === b.order}
                          onOpen={() => onOpen(b.order)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="border-t border-rule pt-3 font-sans text-[12.5px] text-ink-soft">
        These are the 66 books every church accepts. Catholic, Orthodox and Ethiopian Bibles include further books:{' '}
        <a href="#canon" className="font-medium text-ink underline decoration-rule underline-offset-2 hover:decoration-ink">
          see which books, and why Protestants keep 66
        </a>
        .
      </p>
    </section>
  );
}
