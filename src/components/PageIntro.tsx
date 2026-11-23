import { useState, type ReactNode } from 'react';
import { BookOpenText, ChevronDown } from 'lucide-react';
import { cssColor } from '../lib/characters';

export interface IntroCard {
  title: ReactNode;
  /** CSS colour variable for the card's accent, e.g. '--hebrew'. */
  css: string;
  aside?: ReactNode;
  kicker?: string;
  body: ReactNode;
}

interface Props {
  /** localStorage key for the open/closed choice (one per page). */
  storageKey: string;
  art: ReactNode;
  /** Accent behind the illustration. */
  css: string;
  lead: ReactNode;
  cards: IntroCard[];
  howTo: ReactNode[];
  /** Label of the button that opens the details, e.g. "Why three languages? How to read the grid". */
  moreLabel?: string;
  /** Optional content at the top of the details (e.g. a small timeline). */
  extra?: ReactNode;
  /** Optional content after the cards. */
  afterCards?: ReactNode;
  className?: string;
}

/**
 * The Introduction at the top of each section page. The short lead and the illustration are always
 * shown; the cards and "How to use it" open on request, so the page's content starts on the first screen.
 * The open/closed choice is remembered per page.
 */
export function PageIntro({ storageKey, art, css, lead, cards, howTo, moreLabel = 'How this page works', extra, afterCards, className = '' }: Props) {
  const key = `${storageKey}-details`;
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  });
  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(key, next ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
  };
  const id = `${storageKey}-title`;
  const detailsId = `${storageKey}-details`;

  return (
    <section aria-labelledby={id} className={`overflow-hidden rounded-md border border-rule bg-paper/80 ${className}`}>
      <div className="grid items-center gap-x-5 gap-y-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
        <div className="min-w-0">
          <h2 id={id} className="eyebrow mb-1.5 flex items-center gap-1.5">
            <BookOpenText size={13} aria-hidden />
            Introduction
          </h2>
          <div className="max-w-3xl font-serif text-[15.5px] leading-relaxed">{lead}</div>
          <button
            onClick={toggle}
            aria-expanded={open}
            aria-controls={detailsId}
            className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-full border border-rule px-3 py-1.5 font-sans text-[12.5px] font-medium hover:border-ink/50"
          >
            {open ? 'Hide details' : moreLabel}
            <ChevronDown size={14} aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <div
          aria-hidden
          className="hidden h-24 overflow-hidden rounded-md border border-rule px-3 pt-3 md:block"
          style={{ background: cssColor(css, 0.05) }}
        >
          {art}
        </div>
      </div>

      {open && (
        <div id={detailsId} className="space-y-4 border-t border-rule px-4 pb-4 pt-4">
          {extra}

          <div className={`grid gap-3 ${cards.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {cards.map((c, i) => (
              <div key={i} className="rounded-md border border-rule px-3.5 py-3" style={{ boxShadow: `inset 3px 0 0 ${cssColor(c.css)}` }}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-lg font-semibold" style={{ color: cssColor(c.css) }}>
                    {c.title}
                  </span>
                  {c.aside}
                </div>
                {c.kicker && <div className="font-sans text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{c.kicker}</div>}
                <div className="mt-1 font-serif text-[14.5px] leading-snug">{c.body}</div>
              </div>
            ))}
          </div>

          {afterCards}

          <div>
            <h3 className="eyebrow mb-1.5">How to use it</h3>
            <ul className="grid gap-x-6 gap-y-1 font-sans text-[13px] leading-snug sm:grid-cols-2">
              {howTo.map((h, i) => (
                <li key={i}>• {h}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
