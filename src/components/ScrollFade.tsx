import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject, type UIEvent } from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * A sideways-scrolling area with a quiet cue instead of a scrollbar: a soft fade on whichever edge
 * has more to see, and a small "Scroll →" hint until the reader reaches the end. The area can be
 * focused, so the arrow keys scroll it.
 */
export function ScrollFade({
  label,
  className = '',
  outerClassName = '',
  innerRef,
  onScroll,
  enabled = true,
  children,
}: {
  label: string;
  /** Classes for the scrolling box (e.g. "panel"). */
  className?: string;
  /** Classes for the outer wrapper (e.g. "hidden md:block"). */
  outerClassName?: string;
  innerRef?: RefObject<HTMLDivElement>;
  onScroll?: (e: UIEvent<HTMLDivElement>) => void;
  /** When false the box simply clips (e.g. the timeline before it is zoomed). */
  enabled?: boolean;
  children: ReactNode;
}) {
  const own = useRef<HTMLDivElement>(null);
  const ref = innerRef ?? own;
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ left: el.scrollLeft > 2, right: max > 2 && el.scrollLeft < max - 2 });
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [ref, measure, enabled]);

  const fade = (side: 'left' | 'right', on: boolean) => (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 ${side}-0 w-12 transition-opacity duration-200 ${on ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, rgb(var(--paper)), rgb(var(--paper) / 0))` }}
    />
  );

  return (
    <div className={`relative ${outerClassName}`}>
      <div
        ref={ref}
        role={enabled ? 'region' : undefined}
        aria-label={enabled ? label : undefined}
        tabIndex={enabled && (edges.left || edges.right) ? 0 : undefined}
        onScroll={(e) => {
          measure();
          onScroll?.(e);
        }}
        className={`no-scrollbar ${enabled ? 'overflow-x-auto' : 'overflow-x-hidden'} focus-ring ${className}`}
      >
        {children}
      </div>
      {enabled && (
        <>
          {fade('left', edges.left)}
          {fade('right', edges.right)}
          <span
            aria-hidden
            className={`pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-rule bg-paper/95 px-2.5 py-1 font-sans text-[12px] font-medium text-ink-soft shadow-sm transition-opacity duration-200 ${
              edges.right && !edges.left ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Scroll <ArrowRight size={12} />
          </span>
        </>
      )}
    </div>
  );
}
