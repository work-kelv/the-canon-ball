import { useEffect, useRef, useState } from 'react';
import { BookText, GitBranch, GitCompareArrows, Languages, ListOrdered, Orbit } from 'lucide-react';
import { FamilyTree } from './FamilyTree';
import { CreedExplorer } from './CreedExplorer';
import { OrthodoxyMatrix } from './OrthodoxyMatrix';
import { TranslationTimeline } from './TranslationTimeline';
import { TextualTransmission } from './TextualTransmission';
import { TraditionsCompare } from './TraditionsCompare';
import { BoundaryOrbit } from './BoundaryOrbit';
import { HistoryIntro } from '../PageIntros';

function InsideOutside() {
  return (
    <div className="space-y-12">
      <BoundaryOrbit />
      <div className="border-t border-rule pt-8">
        <OrthodoxyMatrix />
      </div>
    </div>
  );
}

const TABS = [
  { id: 'tree', label: 'Family tree', short: 'Family tree', icon: GitBranch, View: FamilyTree },
  { id: 'traditions', label: 'Traditions', short: 'Traditions', icon: GitCompareArrows, View: TraditionsCompare },
  { id: 'creeds', label: 'Creeds', short: 'Creeds', icon: BookText, View: CreedExplorer },
  { id: 'compare', label: 'Inside & outside', short: 'In & out', icon: Orbit, View: InsideOutside },
  { id: 'translations', label: 'Translations', short: 'Translations', icon: Languages, View: TranslationTimeline },
  { id: 'verses', label: 'Chapters & verses', short: 'Verses', icon: ListOrdered, View: TextualTransmission },
] as const;
type TabId = (typeof TABS)[number]['id'];

const fromHash = (): TabId => {
  const h = window.location.hash.slice(1);
  return (TABS.find((t) => t.id === h)?.id ?? 'tree') as TabId;
};

export function HistoryPage() {
  const [tab, setTab] = useState<TabId>(fromHash);
  useEffect(() => {
    const on = () => setTab(fromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const pick = (id: TabId) => {
    history.replaceState(null, '', `#${id}`);
    setTab(id);
    const bar = document.getElementById('history-tabs');
    if (bar && bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ block: 'start' });
  };
  const { View } = TABS.find((t) => t.id === tab)!;
  // Share the tab bar's height so bars pinned below it (e.g. the Traditions picker) sit right under it.
  const navRef = useRef<HTMLElement>(null);
  const [tabsH, setTabsH] = useState(44);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTabsH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <main className="pt-6" style={{ ['--tabs-h' as string]: `${tabsH}px` }}>
      <HistoryIntro />
      <nav
        ref={navRef}
        id="history-tabs"
        aria-label="Church history sections"
        className="sticky top-0 z-20 -mx-4 mb-6 grid grid-cols-3 gap-1 border-b border-rule bg-paper/95 px-4 py-2 backdrop-blur sm:-mx-8 sm:px-8 md:flex"
      >
        {TABS.map(({ id, label, short, icon: Icon }) => (
          <button
            key={id}
            onClick={() => pick(id)}
            aria-current={tab === id ? 'page' : undefined}
            className={`focus-ring inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1.5 font-sans text-[12.5px] font-medium md:px-3 md:text-[13px] ${
              tab === id ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
            }`}
          >
            <Icon size={14} aria-hidden className="shrink-0" />
            <span className="md:hidden">{short}</span>
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </nav>
      <View />
    </main>
  );
}
