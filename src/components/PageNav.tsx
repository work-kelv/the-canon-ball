import { ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Previous / Next at the bottom of a tabbed page (The Bible, Church History), so the tabs read like
 * a short course. After the last tab, `end` points somewhere sensible: back to the start, or on to
 * the next page of the site.
 */
export function PageNav<T extends string>({
  tabs,
  value,
  go,
  end,
}: {
  tabs: readonly { id: T; label: string; blurb: string }[];
  value: T;
  go: (id: T) => void;
  end: { eyebrow: string; label: string; blurb?: string; onClick?: () => void; href?: string };
}) {
  const i = tabs.findIndex((t) => t.id === value);
  const prev = tabs[i - 1];
  const next = tabs[i + 1];
  const endInner = (
    <>
      <span>
        <span className="eyebrow block">{end.eyebrow}</span>
        <span className="font-display text-lg font-semibold">{end.label}</span>
        {end.blurb && <span className="block font-sans text-[12px] text-ink-soft">{end.blurb}</span>}
      </span>
      <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </>
  );
  const endClass = 'focus-ring group flex items-center justify-end gap-3 rounded-md border border-ink px-4 py-3 text-right hover:bg-ink/5 sm:col-start-2';
  return (
    <nav aria-label="Previous and next page" className="mt-10 grid gap-3 border-t border-rule pt-6 sm:grid-cols-2">
      {prev ? (
        <button onClick={() => go(prev.id)} className="focus-ring group flex items-center gap-3 rounded-md border border-rule bg-paper/80 px-4 py-3 text-left hover:border-ink/40">
          <ArrowLeft size={18} className="shrink-0 text-ink-soft transition-transform group-hover:-translate-x-0.5" aria-hidden />
          <span>
            <span className="eyebrow block">Previous · {i}</span>
            <span className="font-display text-lg font-semibold">{prev.label}</span>
            <span className="block font-sans text-[12px] text-ink-soft">{prev.blurb}</span>
          </span>
        </button>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <button onClick={() => go(next.id)} className="focus-ring group flex items-center justify-end gap-3 rounded-md bg-ink px-4 py-3 text-right text-paper sm:col-start-2">
          <span>
            <span className="block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] opacity-75">
              Next · {i + 2} of {tabs.length}
            </span>
            <span className="font-display text-lg font-semibold">{next.label}</span>
            <span className="block font-sans text-[12px] opacity-80">{next.blurb}</span>
          </span>
          <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
      ) : end.href ? (
        <a href={end.href} className={endClass}>
          {endInner}
        </a>
      ) : (
        <button onClick={end.onClick} className={endClass}>
          {endInner}
        </button>
      )}
    </nav>
  );
}
