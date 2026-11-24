import type { ReactNode } from 'react';
import { BookOpen, CalendarRange, Hash, Landmark, Languages, MessageSquareQuote } from 'lucide-react';
import type { BibleBook } from '../types';
import { LANGUAGE_INFO, formatNum, formatPct, langColor } from '../lib/books';
import { LanguageBar } from './LanguageBar';
import { RefText } from './ScriptureRef';
import { DetailSheet } from './DetailSheet';

interface Props {
  book: BibleBook;
  onClose: () => void;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
}

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-rule pt-5">
      <h3 className="eyebrow mb-3 flex items-center gap-1.5">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

export function BookDrawer({ book, onClose, onPrev, onNext }: Props) {
  const primary = [...book.languages].sort((a, b) => b.percent - a.percent)[0].language;

  return (
    <DetailSheet
      labelledBy="drawer-title"
      backLabel="Back to all 66 books"
      onClose={onClose}
      title={book.name}
      position={`${book.order} of 66`}
      onPrev={onPrev}
      onNext={onNext}
      prevLabel="Previous book"
      nextLabel="Next book"
      width="lg"
    >
      <div>
        {/* Masthead */}
        <div
          className="relative px-6 pb-6 pt-5"
          style={{
            background:
              book.languageClass === 'mixed'
                ? `linear-gradient(135deg, ${langColor('Hebrew', 0.16)} 0%, ${langColor('Aramaic', 0.16)} 100%)`
                : langColor(primary, 0.12),
          }}
        >
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1"
            style={{
              background:
                book.languageClass === 'mixed'
                  ? `linear-gradient(90deg, ${langColor('Hebrew')} 50%, ${langColor('Aramaic')} 50%)`
                  : langColor(primary),
            }}
          />
          <span className="eyebrow">
            Book {book.order} of 66 · {book.testament} Testament
          </span>
          <h2 id="drawer-title" className="mt-3 font-display text-4xl font-semibold tracking-tight">
            {book.name}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2 font-sans text-xs">
            <span className="rounded-full border border-ink/30 px-2.5 py-0.5">{book.division}</span>
            {book.languages.map((l) => (
              <span
                key={l.language}
                className="rounded-full px-2.5 py-0.5 font-medium text-paper"
                style={{ background: langColor(l.language) }}
              >
                {l.language}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-6 px-6 pb-10 pt-5">
          {/* Key figures */}
          <dl className="grid grid-cols-3 gap-3">
            {[
              { icon: <Hash size={12} aria-hidden />, k: 'Chapters', v: book.chapters },
              { icon: <BookOpen size={12} aria-hidden />, k: 'Verses', v: formatNum(book.verses) },
              {
                icon: <Landmark size={12} aria-hidden />,
                k: 'Division',
                v: <span className="text-base leading-tight">{book.division}</span>,
              },
            ].map((s) => (
              <div key={s.k} className="rounded-sm border border-rule p-3">
                <dt className="eyebrow flex items-center gap-1">
                  {s.icon}
                  {s.k}
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{s.v}</dd>
              </div>
            ))}
          </dl>

          <Section icon={<Languages size={12} aria-hidden />} title="Original language">
            <LanguageBar
              segments={book.languages.map((l) => ({ language: l.language, value: l.percent }))}
              className="h-4"
            />
            <ul className="mt-4 space-y-3">
              {book.languages.map((l) => (
                <li key={l.language} className="border-l-[3px] pl-3" style={{ borderColor: langColor(l.language) }}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-baseline gap-2">
                      <span className="font-display text-lg font-semibold">{l.language === 'Greek' ? 'Koine Greek' : `Biblical ${l.language}`}</span>
                      <span className={`${LANGUAGE_INFO[l.language].nativeClass} text-sm text-ink-soft`}>
                        {LANGUAGE_INFO[l.language].native}
                      </span>
                    </span>
                    <span className="font-sans text-sm font-semibold tabular-nums">
                      {formatPct(l.percent)}
                    </span>
                  </div>
                  {l.ranges && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {l.ranges.map((r) => (
                        <span
                          key={r}
                          className="rounded-sm bg-ink/[0.06] px-1.5 py-0.5 font-sans text-xs tabular-nums"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-sans text-[12px] text-ink-soft">
              Percentages by verse share (English versification).
            </p>
          </Section>

          {book.aramaicSections.length > 0 && (
            <Section icon={<span aria-hidden className="h-2 w-2 rounded-full" style={{ background: langColor('Aramaic') }} />} title="Aramaic sections">
              <ul className="space-y-3">
                {book.aramaicSections.map((s) => (
                  <li
                    key={s.reference}
                    className="rounded-sm p-3"
                    style={{ background: langColor('Aramaic', 0.09) }}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-lg font-semibold"><RefText text={s.reference} /></span>
                      <span className="font-sans text-xs tabular-nums text-ink-soft">
                        {s.words ? `${s.words} words` : `≈ ${s.verses} verses`}
                      </span>
                    </div>
                    <p className="mt-1 text-[15px] leading-relaxed">{s.description}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {book.aramaicPhrases.length > 0 && (
            <Section icon={<MessageSquareQuote size={12} aria-hidden />} title="Aramaic words in the Greek text">
              <ul className="divide-y divide-rule/70">
                {book.aramaicPhrases.map((p) => (
                  <li key={p.reference + p.phrase} className="py-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-lg italic" style={{ color: langColor('Aramaic') }}>
                        {p.phrase}
                      </span>
                      <span className="shrink-0 font-sans text-xs tabular-nums text-ink-soft">
                        <RefText text={p.reference} />
                      </span>
                    </div>
                    <div className="font-sans text-sm text-ink-soft">
                      “{p.meaning}”{p.speaker && <span> — {p.speaker}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section icon={<CalendarRange size={12} aria-hidden />} title="Composition">
            <p className="font-display text-xl font-semibold">{book.composition.display}</p>
          </Section>

          <Section icon={<BookOpen size={12} aria-hidden />} title="Why this language">
            <blockquote className="border-l-2 border-ink/40 pl-4 text-lg italic leading-relaxed">
              <RefText text={book.context} />
            </blockquote>
          </Section>

        </div>
      </div>
    </DetailSheet>
  );
}
