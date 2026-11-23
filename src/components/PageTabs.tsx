import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface PageTab<T extends string> {
  id: T;
  label: string;
  /** Shorter label for phones. */
  short?: string;
  icon: LucideIcon;
}

/** The current tab lives in the URL hash (#creeds), so every tab can be linked and shared. */
export function useHashTab<T extends string>(ids: readonly T[], fallback: T) {
  const read = (): T => {
    const h = window.location.hash.slice(1) as T;
    return ids.includes(h) ? h : fallback;
  };
  const [tab, setTab] = useState<T>(read);
  useEffect(() => {
    const on = () => setTab(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (id: T) => {
    history.replaceState(null, '', `#${id}`);
    setTab(id);
  };
  return [tab, pick] as const;
}

/**
 * The tab bar of a page with several views (The Bible, Church History): pinned to the top while you
 * scroll, a grid of short labels on phones (never clipped, never scrolling sideways), one row on wider
 * screens. Its height is published as --tabs-h so bars pinned beneath it sit right under it.
 */
export function PageTabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
  children,
}: {
  label: string;
  tabs: readonly PageTab<T>[];
  value: T;
  onChange: (id: T) => void;
  children: ReactNode;
}) {
  const navRef = useRef<HTMLElement>(null);
  const [h, setH] = useState(44);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pick = (id: T) => {
    onChange(id);
    const bar = navRef.current;
    if (bar && bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ block: 'start' });
  };
  const cols = tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div style={{ ['--tabs-h' as string]: `${h}px` }}>
      <nav
        ref={navRef}
        aria-label={label}
        className={`sticky top-0 z-20 -mx-4 mb-6 grid ${cols} gap-1 border-b border-rule bg-paper/95 px-4 py-2 backdrop-blur sm:-mx-8 sm:px-8 md:flex`}
      >
        {tabs.map(({ id, label: l, short, icon: Icon }) => (
          <button
            key={id}
            onClick={() => pick(id)}
            aria-current={value === id ? 'page' : undefined}
            className={`focus-ring inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1.5 font-sans text-[12.5px] font-medium md:px-3 md:text-[13px] ${
              value === id ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
            }`}
          >
            <Icon size={14} aria-hidden className="shrink-0" />
            <span className="md:hidden">{short ?? l}</span>
            <span className="hidden md:inline">{l}</span>
          </button>
        ))}
      </nav>
      {children}
    </div>
  );
}
