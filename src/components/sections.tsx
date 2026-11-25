import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, GraduationCap, List } from 'lucide-react';
import { LEVELS, atLeast, setLevel, useLevel, type Level } from '../lib/level';

/**
 * One continuous page instead of tabs: numbered sections, a single compact "On this page" bar pinned
 * to the top, and folds (accordions) for dense blocks. Old tab links (#canon, #creeds, #creeds-read)
 * keep working: they scroll to their section and open any fold they name.
 */

export interface SectionDef {
  id: string;
  label: string;
  /** Shorter label for the bar on narrower screens. */
  short?: string;
  /** The lowest level this section appears at (default: every level). */
  min?: Level;
  /** Other ids inside this section (folds) that a link may point to. */
  anchors?: string[];
}

/** The hash the page was opened with (a link to a hidden section still shows it). */
const openedWith = () => decodeURIComponent(window.location.hash.slice(1));

/**
 * The sections shown at the current level, numbered in order. A section above the reader's level
 * still appears when a link points at it (or at a fold inside it), with a note.
 */
export function useSections(defs: SectionDef[]) {
  const level = useLevel();
  const [target] = useState(openedWith);
  const linked = (d: SectionDef) => !!target && (d.id === target || (d.anchors ?? []).includes(target));
  const list = defs.filter((d) => !d.min || atLeast(level, d.min) || linked(d));
  return {
    list,
    shows: (id: string) => list.some((d) => d.id === id),
    n: (id: string) => list.findIndex((d) => d.id === id) + 1,
    /** The level a section needs, when it is shown only because a link pointed at it. */
    need: (id: string) => {
      const d = defs.find((x) => x.id === id);
      return d?.min && !atLeast(level, d.min) ? d.min : undefined;
    },
  };
}

/** Shown on a section or fold that is above the reader's level but was opened by a link. */
export function LevelNote({ need }: { need: Level }) {
  const label = LEVELS.find((l) => l.id === need)!.label;
  return (
    <p className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-dashed border-ink/40 px-3 py-2 font-sans text-[13px]">
      <GraduationCap size={15} aria-hidden className="text-ink-soft" />
      <span>This is part of {label} mode, shown because a link pointed here.</span>
      <button onClick={() => setLevel(need)} className="focus-ring ml-auto min-h-8 rounded-full border border-rule px-3 font-medium hover:border-ink/50">
        Switch to {label}
      </button>
    </p>
  );
}

const OPEN_FOLD = 'canon:open-fold';

/** Open any fold that is, or contains, the element with this id. */
export function openFold(id: string) {
  window.dispatchEvent(new CustomEvent(OPEN_FOLD, { detail: id }));
}

/** Open something (a fold, a Start here step) when a link or jump names one of these ids. */
export function useOpenTarget(ids: string[], open: () => void) {
  const key = ids.join(' ');
  useEffect(() => {
    const on = (e: Event) => {
      if (key.split(' ').includes((e as CustomEvent<string>).detail)) open();
    };
    window.addEventListener(OPEN_FOLD, on);
    return () => window.removeEventListener(OPEN_FOLD, on);
  }, [key, open]);
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scroll to a section or fold by id, opening the fold (and any fold around it) first. */
export function jumpTo(id: string, { smooth = false, replace = true } = {}) {
  window.dispatchEvent(new CustomEvent(OPEN_FOLD, { detail: id }));
  // Let a fold that has just opened render before measuring.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ block: 'start', behavior: smooth && !reducedMotion() ? 'smooth' : 'auto' });
      if (replace) history.replaceState(null, '', `#${id}`);
    }),
  );
}

/**
 * Follow the hash on load, so old tab URLs (#canon, #creeds-read …) land on their section or open
 * their fold; and make every in-page link (href="#…") scroll smoothly to its target, opening any fold.
 */
export function useSectionHash() {
  useEffect(() => {
    const go = (smooth: boolean) => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) jumpTo(id, { replace: false, smooth });
    };
    go(false);
    // Fonts and late layout can move things a little; settle once more.
    const t = window.setTimeout(() => go(false), 350);
    const onHash = () => go(true);
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      const id = a ? decodeURIComponent(a.getAttribute('href')!.slice(1)) : '';
      // The skip link keeps its own behaviour (it moves keyboard focus into the page).
      if (!id || id === 'main' || !document.getElementById(id)) return;
      e.preventDefault();
      jumpTo(id, { smooth: true });
    };
    window.addEventListener('hashchange', onHash);
    document.addEventListener('click', onClick);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('hashchange', onHash);
      document.removeEventListener('click', onClick);
    };
  }, []);
}

/**
 * The single pinned bar: ‹ previous section · current section (tap for the list) · next section ›.
 * On wide screens the sections are listed inline. Its height is published as --jump-h so sections
 * and section-scoped sticky bars sit just below it.
 */
export function OnThisPage({ sections, label }: { sections: SectionDef[]; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const [cur, setCur] = useState(-1);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty('--jump-h', `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scroll-spy: the current section is the last one whose top has passed under the bar.
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = (ref.current?.offsetHeight ?? 44) + 24;
      let i = -1;
      sections.forEach((s, k) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) i = k;
      });
      setCur(i);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sections]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', close);
    window.addEventListener('mousedown', close);
    return () => {
      window.removeEventListener('keydown', close);
      window.removeEventListener('mousedown', close);
    };
  }, [open]);

  const go = (i: number) => {
    setOpen(false);
    jumpTo(sections[i].id);
  };
  const prev = cur > 0 ? cur - 1 : null;
  const next = cur < sections.length - 1 ? cur + 1 : null;
  const arrow = 'focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-ink/5 disabled:opacity-30';

  return (
    <nav
      ref={ref}
      aria-label={label}
      className="sticky top-0 z-30 -mx-4 mb-8 flex items-center gap-1 border-b border-rule bg-paper/95 px-3 py-1 backdrop-blur sm:-mx-8 sm:px-6"
    >
      <button onClick={() => prev !== null && go(prev)} disabled={prev === null} aria-label={prev !== null ? `Previous section: ${sections[prev].label}` : 'Previous section'} className={arrow}>
        <ChevronLeft size={18} aria-hidden />
      </button>

      {/* Wide screens: every section in one row */}
      <ol className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-0.5 lg:flex">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                go(i);
              }}
              aria-current={i === cur ? 'location' : undefined}
              className={`focus-ring inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3 font-sans text-[13px] font-medium ${
                i === cur ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
              }`}
            >
              <span className="tabular-nums opacity-70">{i + 1}</span>
              {s.short ?? s.label}
            </a>
          </li>
        ))}
      </ol>

      {/* Phones and tablets: the current section, with the list on request */}
      <div className="relative min-w-0 flex-1 lg:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="true"
          className="focus-ring flex min-h-9 w-full items-center justify-center gap-2 rounded-full px-3 font-sans text-[13.5px] font-semibold"
        >
          <List size={16} aria-hidden className="shrink-0 text-ink-soft" />
          <span className="truncate">{cur >= 0 ? `${cur + 1} · ${sections[cur].label}` : 'On this page'}</span>
          <ChevronDown size={15} aria-hidden className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <ol className="absolute left-1/2 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-rule bg-paper p-1.5 shadow-xl">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(i);
                  }}
                  aria-current={i === cur ? 'location' : undefined}
                  className={`focus-ring flex min-h-10 items-center gap-3 rounded-md px-3 font-sans text-[14px] ${i === cur ? 'bg-ink text-paper' : 'hover:bg-ink/5'}`}
                >
                  <span className="w-5 text-right tabular-nums opacity-70">{i + 1}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>

      <button onClick={() => next !== null && go(next)} disabled={next === null} aria-label={next !== null ? `Next section: ${sections[next].label}` : 'Next section'} className={arrow}>
        <ChevronRight size={18} aria-hidden />
      </button>
    </nav>
  );
}

/** A numbered section: its heading, a short lead and a one-line takeaway are always visible. */
export function PageSection({
  id,
  n,
  title,
  lead,
  takeaway,
  aside,
  first = false,
  need,
  children,
}: {
  id: string;
  n: number;
  /** Set when the section is above the reader’s level but a link opened it. */
  need?: Level;
  /** The first section sits right under the bar, without a rule above it. */
  first?: boolean;
  title: ReactNode;
  lead?: ReactNode;
  takeaway?: ReactNode;
  /** Small controls beside the heading (e.g. zoom). */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`section-anchor pb-8 ${first ? '' : 'border-t-[3px] border-double border-ink/70 pt-8'}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${id}-h`} className="font-display text-3xl font-semibold leading-tight">
            <span className="mr-2 align-[0.15em] font-sans text-[15px] font-bold tabular-nums text-ink-soft">{n}</span>
            {title}
          </h2>
          {lead && <div className="mt-1.5 max-w-3xl font-serif text-[16px] leading-relaxed text-ink-soft">{lead}</div>}
        </div>
        {aside}
      </div>
      {takeaway && (
        <p className="mt-3 flex max-w-3xl gap-2 font-sans text-[14px] leading-snug">
          <span aria-hidden className="mt-[0.45em] h-2 w-2 shrink-0 rounded-full bg-ink" />
          <span>
            <b>Takeaway:</b> {takeaway}
          </span>
        </p>
      )}
      <div className="mt-6">
        {need && <LevelNote need={need} />}
        {children}
      </div>
    </section>
  );
}

/**
 * An accordion for a dense block. The title and a one-line summary are always visible; the content
 * mounts when opened. A link to its id (#creeds-read) opens it.
 */
export function Fold({
  id,
  title,
  summary,
  count,
  defaultOpen = false,
  targetPrefix,
  level = 3,
  min,
  children,
}: {
  id?: string;
  title: ReactNode;
  summary?: ReactNode;
  count?: ReactNode;
  defaultOpen?: boolean;
  /** Also open for any target id with this prefix (its content is not mounted while closed). */
  targetPrefix?: string;
  level?: 3 | 4;
  /** The lowest reader level this fold appears at. */
  min?: Level;
  children: ReactNode;
}) {
  const reader = useLevel();
  const [linked] = useState(() => !!id && openedWith() === id);
  const [open, setOpen] = useState(defaultOpen);
  const boxRef = useRef<HTMLDivElement>(null);
  const onOpen = useCallback(
    (e: Event) => {
      const target = (e as CustomEvent<string>).detail;
      if (!target) return;
      if (target === id || (targetPrefix && target.startsWith(targetPrefix)) || (boxRef.current && boxRef.current.querySelector(`[id="${CSS.escape(target)}"]`))) setOpen(true);
    },
    [id, targetPrefix],
  );
  useEffect(() => {
    window.addEventListener(OPEN_FOLD, onOpen);
    return () => window.removeEventListener(OPEN_FOLD, onOpen);
  }, [onOpen]);
  const H = level === 3 ? 'h3' : 'h4';
  const bodyId = useId();
  if (min && !atLeast(reader, min) && !linked) return null;
  return (
    <div ref={boxRef} id={id} className="section-anchor rounded-md border border-rule bg-paper/70">
      <H className="m-0">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="focus-ring flex min-h-12 w-full items-center gap-3 rounded-md px-4 py-2.5 text-left hover:bg-ink/[0.03]"
        >
          <ChevronDown size={18} aria-hidden className={`shrink-0 text-ink-soft transition-transform ${open ? '' : '-rotate-90'}`} />
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[19px] font-semibold leading-tight">
              {title}
              {count !== undefined && <span className="ml-2 font-sans text-[13px] font-semibold tabular-nums text-ink-soft">{count}</span>}
            </span>
            {summary && <span className="mt-0.5 block font-sans text-[13px] font-normal leading-snug text-ink-soft">{summary}</span>}
          </span>
          <span className="hidden shrink-0 font-sans text-[12.5px] font-medium text-ink-soft sm:inline">{open ? 'Hide' : 'Show'}</span>
        </button>
      </H>
      <div id={bodyId} hidden={!open} className="border-t border-rule px-4 pb-5 pt-4">
        {open && children}
      </div>
    </div>
  );
}

/** The end of a page: on to the next page of the site. */
export function NextPage({ href, label, blurb }: { href: string; label: string; blurb: string }) {
  return (
    <a
      href={href}
      className="focus-ring group mt-6 flex items-center justify-between gap-3 rounded-md bg-ink px-5 py-4 text-paper sm:ml-auto sm:max-w-md"
    >
      <span>
        <span className="block font-sans text-[12px] font-semibold uppercase tracking-[0.14em] opacity-75">Next page</span>
        <span className="font-display text-xl font-semibold">{label}</span>
        <span className="block font-sans text-[13px] opacity-80">{blurb}</span>
      </span>
      <ArrowRight size={20} aria-hidden className="shrink-0 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}
