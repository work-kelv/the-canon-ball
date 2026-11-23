import { useState, type ReactNode } from 'react';
import { BookOpenText, ChevronDown, ChevronUp } from 'lucide-react';
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
  /** localStorage key for the hidden/shown choice (one per page). */
  storageKey: string;
  art: ReactNode;
  /** Accent behind the illustration. */
  css: string;
  lead: ReactNode;
  cards: IntroCard[];
  howTo: ReactNode[];
  className?: string;
}

/**
 * The "Introduction" card at the top of each page: an illustration, a short lead, a few cards
 * explaining what the page shows, and how to use it. It can be folded away; the choice is remembered.
 */
export function PageIntro({ storageKey, art, css, lead, cards, howTo, className = '' }: Props) {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });
  const toggle = () => {
    const next = !hidden;
    setHidden(next);
    try {
      localStorage.setItem(storageKey, next ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
  };
  const id = `${storageKey}-title`;

  return (
    <section aria-labelledby={id} className={`overflow-hidden rounded-md border border-rule bg-paper/80 ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h2 id={id} className="flex items-center gap-2 font-display text-xl font-semibold">
          <BookOpenText size={17} className="text-ink-soft" aria-hidden />
          Introduction
        </h2>
        <button
          onClick={toggle}
          aria-expanded={!hidden}
          className="focus-ring inline-flex items-center gap-1 rounded-full border border-rule px-2.5 py-1 font-sans text-[12px] text-ink-soft hover:border-ink/50 hover:text-ink"
        >
          {hidden ? (
            <>
              Show <ChevronDown size={13} aria-hidden />
            </>
          ) : (
            <>
              Hide <ChevronUp size={13} aria-hidden />
            </>
          )}
        </button>
      </div>

      {!hidden && (
        <div className="space-y-4 border-t border-rule px-4 pb-4 pt-4">
          <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,19rem)]">
            <div className="order-2 max-w-3xl font-serif text-[16px] leading-relaxed md:order-1">{lead}</div>
            <div
              aria-hidden
              className="order-1 h-24 overflow-hidden rounded-md border border-rule px-3 pt-3 md:order-2 md:h-28"
              style={{ background: cssColor(css, 0.05) }}
            >
              {art}
            </div>
          </div>

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
