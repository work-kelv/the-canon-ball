import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GLOSSARY } from '../lib/glossary';

export type GlossaryWord = keyof typeof GLOSSARY;

/** A word with a dotted underline: tap it for a plain explanation. */
export function Term({ t, children }: { t: GlossaryWord; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
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

  // Keep the explanation on screen, 12px from either edge. Measured before it opens,
  // so an explanation near the edge can never widen the page first.
  const toggle = () => {
    if (!open && ref.current) {
      const vw = document.documentElement.clientWidth;
      const width = Math.min(256, vw - 24);
      const left = ref.current.getBoundingClientRect().left;
      setShift(Math.max(12 - left, Math.min(0, vw - 12 - (left + width))));
    }
    setOpen((o) => !o);
  };

  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        title="Tap for a short explanation"
        className="focus-ring inline rounded-sm py-[3px] text-inherit underline decoration-ink/50 decoration-dotted underline-offset-[3px] hover:decoration-ink"
      >
        {children ?? t}
      </button>
      {open && (
        <span
          role="note"
          style={{ transform: `translateX(${shift}px)` }}
          className="absolute left-0 top-full z-40 mt-1 block w-64 max-w-[calc(100vw-24px)] rounded-md border border-rule bg-paper px-3 py-2 text-left font-sans text-[13px] font-normal not-italic leading-snug text-ink shadow-lg"
        >
          <b className="capitalize">{t}:</b> {GLOSSARY[t]}
        </span>
      )}
    </span>
  );
}
