import { useState, useEffect, useRef, type ReactNode } from 'react';
import { GraduationCap, X } from 'lucide-react';
import { LEVELS, atLeast, hasChosenLevel, setLevel, useLevel, type Level } from '../lib/level';
import { GLOSSARY } from '../lib/glossary';

/** The Beginner · Explorer · Scholar switch, on every page. */
export function LevelSwitch({ className = '' }: { className?: string }) {
  const level = useLevel();
  return (
    <div role="radiogroup" aria-label="How much to show" className={`inline-flex items-center rounded-full border border-rule p-0.5 font-sans ${className}`}>
      <GraduationCap size={15} aria-hidden className="ml-2 mr-1 hidden text-ink-soft sm:block" />
      {LEVELS.map((l) => {
        const on = l.id === level;
        return (
          <button
            key={l.id}
            role="radio"
            aria-checked={on}
            onClick={() => setLevel(l.id)}
            title={`${l.label} (${l.hint.toLowerCase()})`}
            className={`focus-ring flex min-h-10 flex-col items-center justify-center rounded-full px-3 leading-none ${on ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
          >
            <span className="text-[13px] font-semibold">{l.label}</span>
            <span className={`mt-0.5 text-[12px] uppercase tracking-[0.1em] ${on ? 'text-paper/75' : 'text-ink-soft/80'}`} aria-hidden>
              {l.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Shows its content only from a given level up. */
export function AtLevel({ min, children }: { min: Level; children: ReactNode }) {
  const level = useLevel();
  return atLeast(level, min) ? <>{children}</> : null;
}

/** Shows its content only below a given level (e.g. a simple version for Beginners). */
export function BelowLevel({ max, children }: { max: Level; children: ReactNode }) {
  const level = useLevel();
  return atLeast(level, max) ? null : <>{children}</>;
}

/** Asked once, on the home page: start as a Beginner? */
export function LevelWelcome() {
  const [show, setShow] = useState(() => !hasChosenLevel());
  if (!show) return null;
  const choose = (l: Level) => {
    setLevel(l);
    setShow(false);
  };
  return (
    <aside aria-label="Choose how much to show" className="relative rounded-md border border-ink/30 bg-paper px-5 py-4 shadow-sm">
      <button onClick={() => choose('explorer')} aria-label="Close" className="focus-ring absolute right-2 top-2 rounded-full p-2 text-ink-soft hover:bg-ink/5">
        <X size={16} aria-hidden />
      </button>
      <h2 className="flex items-center gap-2 pr-8 font-display text-2xl font-semibold">
        <GraduationCap size={22} aria-hidden /> New to the Bible?
      </h2>
      <p className="mt-1 max-w-2xl font-serif text-[16px] leading-relaxed">
        Start as a <b>Beginner</b>: simpler words, the essentials first, and a short description of every book. You can change this at any time with the
        switch at the top of every page.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => choose('beginner')} className="focus-ring inline-flex min-h-10 items-center rounded-full bg-ink px-5 font-sans text-[14px] font-semibold text-paper">
          Start as a Beginner
        </button>
        <button onClick={() => choose('explorer')} className="focus-ring inline-flex min-h-10 items-center rounded-full border border-rule px-5 font-sans text-[14px] font-medium hover:border-ink/50">
          Explorer (some background)
        </button>
        <button onClick={() => choose('scholar')} className="focus-ring inline-flex min-h-10 items-center rounded-full border border-rule px-5 font-sans text-[14px] font-medium hover:border-ink/50">
          Scholar (everything)
        </button>
      </div>
    </aside>
  );
}

/** A word with a plain explanation on tap, for Beginners. */
export function Term({ t, children }: { t: keyof typeof GLOSSARY; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', close);
    };
  }, [open]);
  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="focus-ring inline rounded-sm py-[3px] text-inherit underline decoration-ink/50 decoration-dotted underline-offset-[3px]"
      >
        {children ?? t}
      </button>
      {open && (
        <span role="note" className="absolute left-0 top-full z-40 mt-1 block w-64 rounded-md border border-rule bg-paper px-3 py-2 font-sans text-[13px] font-normal not-italic leading-snug text-ink shadow-lg">
          <b className="capitalize">{t}:</b> {GLOSSARY[t]}
        </span>
      )}
    </span>
  );
}
