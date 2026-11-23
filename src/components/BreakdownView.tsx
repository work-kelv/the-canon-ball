import { BookOpen, CalendarRange, Hash, Library, MessageSquareQuote } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BibleBook, Division, Language } from '../types';
import {
  DIVISIONS,
  LANGUAGES,
  LANGUAGE_INFO,
  TOTAL_CHAPTERS,
  TOTAL_VERSES,
  books as allBooks,
  chapterEquivalents,
  formatNum,
  formatPct,
  formatYear,
  langColor,
} from '../lib/books';
import { LanguageBar } from './LanguageBar';

interface Props {
  /** Books matching the language filter (before division filter). */
  langBooks: BibleBook[];
  /** Books matching both filters. */
  visible: BibleBook[];
  division: Division | null;
  onDivision: (d: Division | null) => void;
  onOpen: (order: number) => void;
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="panel p-4">
      <div className="eyebrow flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      {sub && <div className="mt-1 font-sans text-xs text-ink-soft">{sub}</div>}
    </div>
  );
}

function segmentsFor(list: BibleBook[]) {
  const eq = chapterEquivalents(list);
  return LANGUAGES.map((language) => ({ language, value: eq[language] }));
}

export function BreakdownView({ langBooks, visible, division, onDivision, onOpen }: Props) {
  const chapters = visible.reduce((n, b) => n + b.chapters, 0);
  const verses = visible.reduce((n, b) => n + b.verses, 0);
  const eq = chapterEquivalents(visible);
  const eqTotal = LANGUAGES.reduce((n, l) => n + eq[l], 0);
  const start = visible.length ? Math.min(...visible.map((b) => b.composition.start)) : 0;
  const end = visible.length ? Math.max(...visible.map((b) => b.composition.end)) : 0;
  const ot = visible.filter((b) => b.testament === 'Old').length;

  const maxDivChapters = Math.max(
    ...DIVISIONS.map((d) =>
      allBooks.filter((b) => b.division === d.name).reduce((n, b) => n + b.chapters, 0),
    ),
  );

  const sections = visible.flatMap((b) => b.aramaicSections.map((s) => ({ book: b, s })));
  const phrases = visible.flatMap((b) => b.aramaicPhrases.map((p) => ({ book: b, p })));

  return (
    <section aria-label="Language and division breakdown" className="space-y-8">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={<Library size={12} aria-hidden />}
          label="Books"
          value={visible.length}
          sub={`${ot} OT · ${visible.length - ot} NT`}
        />
        <Stat
          icon={<Hash size={12} aria-hidden />}
          label="Chapters"
          value={formatNum(chapters)}
          sub={`${formatPct((chapters / TOTAL_CHAPTERS) * 100)} of 1,189 in the canon`}
        />
        <Stat
          icon={<BookOpen size={12} aria-hidden />}
          label="Verses (KJV)"
          value={formatNum(verses)}
          sub={`${formatPct((verses / TOTAL_VERSES) * 100)} of ${formatNum(TOTAL_VERSES)}`}
        />
        <Stat
          icon={<CalendarRange size={12} aria-hidden />}
          label="Composition span"
          value={<span className="text-xl">{visible.length ? `${formatYear(start)} – ${formatYear(end)}` : '—'}</span>}
          sub="Broad range across traditional & critical dating"
        />
      </div>

      {/* Language proportions */}
      <div className="panel p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-semibold">Chapters by original language</h3>
          <span className="font-sans text-xs text-ink-soft">
            Mixed books apportioned by verse share
          </span>
        </div>
        <LanguageBar segments={segmentsFor(visible)} className="mt-4 h-6" />
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          {LANGUAGES.map((l) => {
            const books = visible.filter((b) => b.languages.some((x) => x.language === l));
            return (
              <div key={l} className="border-l-[3px] pl-3" style={{ borderColor: langColor(l) }}>
                <dt className="flex items-baseline gap-2">
                  <span className="font-display text-lg font-semibold">{l}</span>
                  <span className={`${LANGUAGE_INFO[l].nativeClass} text-ink-soft`} lang={l === 'Greek' ? 'grc' : l === 'Hebrew' ? 'he' : 'arc'}>
                    {LANGUAGE_INFO[l].native}
                  </span>
                </dt>
                <dd className="mt-1 font-sans text-sm tabular-nums">
                  <span className="font-semibold">{formatNum(eq[l], 1)}</span> ch-equiv ·{' '}
                  {formatPct(eqTotal ? (eq[l] / eqTotal) * 100 : 0)}
                </dd>
                <dd className="font-sans text-xs text-ink-soft">
                  {books.length} book{books.length === 1 ? '' : 's'} · {LANGUAGE_INFO[l].family}
                </dd>
              </div>
            );
          })}
        </dl>
        {visible.length !== allBooks.length && (
          <div className="mt-5 border-t border-rule pt-3">
            <div className="eyebrow mb-1.5">Whole canon, for comparison</div>
            <LanguageBar segments={segmentsFor(allBooks)} className="h-2 opacity-70" />
          </div>
        )}
      </div>

      {/* Divisions */}
      <div className="panel p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-semibold">Literary divisions</h3>
          <span className="font-sans text-xs text-ink-soft">Click a division to filter</span>
        </div>
        <ul className="mt-4 divide-y divide-rule/70">
          {DIVISIONS.map((d) => {
            const inDiv = langBooks.filter((b) => b.division === d.name);
            const totalInDiv = allBooks.filter((b) => b.division === d.name);
            const ch = inDiv.reduce((n, b) => n + b.chapters, 0);
            const active = division === d.name;
            const empty = inDiv.length === 0;
            return (
              <li key={d.name}>
                <button
                  disabled={empty}
                  onClick={() => onDivision(active ? null : d.name)}
                  aria-pressed={active}
                  className={`focus-ring grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 rounded-sm px-2 py-2.5 text-left sm:grid-cols-[11rem_1fr_7rem] ${
                    active ? 'bg-ink/[0.07]' : 'hover:bg-ink/[0.04]'
                  } ${empty ? 'cursor-default opacity-35' : ''}`}
                >
                  <span className="flex items-baseline gap-2">
                    <span className="font-display font-semibold">{d.name}</span>
                    <span className="font-sans text-[10px] uppercase tracking-wider text-ink-soft">
                      {d.testament === 'Old' ? 'OT' : 'NT'}
                    </span>
                  </span>
                  <span className="order-last col-span-2 sm:order-none sm:col-span-1">
                    <span
                      className="block"
                      style={{ width: `${Math.max((ch / maxDivChapters) * 100, ch ? 1.5 : 0)}%` }}
                    >
                      <LanguageBar segments={segmentsFor(inDiv)} className="h-2.5" />
                    </span>
                  </span>
                  <span className="text-right font-sans text-xs tabular-nums text-ink-soft">
                    {inDiv.length}/{totalInDiv.length} bks · <span className="text-ink">{ch}</span> ch
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Aramaic register */}
      {(sections.length > 0 || phrases.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.length > 0 && (
            <div className="panel p-5">
              <h3 className="font-display text-xl font-semibold">Aramaic passages</h3>
              <p className="mt-1 font-sans text-xs text-ink-soft">
                Sections of the Old Testament composed in Biblical Aramaic
              </p>
              <ul className="mt-3 space-y-2">
                {sections.map(({ book, s }) => (
                  <li key={s.reference}>
                    <button
                      onClick={() => onOpen(book.order)}
                      className="focus-ring flex w-full items-baseline justify-between gap-3 rounded-sm border-l-[3px] px-3 py-1.5 text-left hover:bg-ink/[0.04]"
                      style={{ borderColor: langColor('Aramaic') }}
                    >
                      <span className="font-display font-semibold">{s.reference}</span>
                      <span className="shrink-0 font-sans text-xs tabular-nums text-ink-soft">
                        {s.words ? `${s.words} words` : `${s.verses} vv.`}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {phrases.length > 0 && (
            <div className="panel p-5">
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                <MessageSquareQuote size={18} aria-hidden /> Aramaic in the Greek NT
              </h3>
              <p className="mt-1 font-sans text-xs text-ink-soft">
                Transliterated words preserved in the Greek text
              </p>
              <ul className="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                {phrases.map(({ book, p }) => (
                  <li key={p.reference + p.phrase}>
                    <button
                      onClick={() => onOpen(book.order)}
                      className="focus-ring w-full rounded-sm px-2 py-1 text-left hover:bg-ink/[0.04]"
                    >
                      <span className="italic" style={{ color: langColor('Aramaic') }}>
                        {p.phrase}
                      </span>
                      <span className="ml-2 font-sans text-[11px] text-ink-soft">{p.reference}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Book index */}
      <div className="panel overflow-hidden">
        <div className="px-5 pt-5">
          <h3 className="font-display text-xl font-semibold">Books in view</h3>
        </div>
        {visible.length === 0 ? (
          <p className="p-5 font-sans text-sm text-ink-soft">No books match these filters.</p>
        ) : (
          <div>
            <table className="mt-3 w-full font-sans text-sm">
              <thead>
                <tr className="border-y border-rule text-left">
                  {['#', 'Book', 'Division', 'Ch.', 'Language'].map((h) => (
                    <th key={h} scope="col" className={`eyebrow px-3 py-2 first:pl-5 last:pr-5 ${h === 'Division' ? 'hidden sm:table-cell' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {visible.map((b) => (
                  <tr
                    key={b.order}
                    onClick={() => onOpen(b.order)}
                    className="cursor-pointer hover:bg-ink/[0.04]"
                  >
                    <td className="py-2 pl-5 pr-3 tabular-nums text-ink-soft">{b.order}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(b.order);
                        }}
                        className="focus-ring rounded-sm font-display font-semibold hover:underline"
                      >
                        {b.name}
                      </button>
                    </td>
                    <td className="hidden px-3 py-2 text-ink-soft sm:table-cell">{b.division}</td>
                    <td className="px-3 py-2 tabular-nums">{b.chapters}</td>
                    <td className="py-2 pl-3 pr-5">
                      <div className="flex items-center gap-2">
                        <span className="w-28">
                          <LanguageBar
                            segments={b.languages.map((l) => ({
                              language: l.language as Language,
                              value: l.percent,
                            }))}
                            className="h-2"
                          />
                        </span>
                        <span className="text-xs text-ink-soft">
                          {b.languages.map((l) => l.language).join(' + ')}
                          {b.aramaicPhrases.length > 0 && ' · ✦ Aramaic words'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
