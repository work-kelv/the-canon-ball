import { useEffect, useState } from 'react';
import { BookText, GitBranch, GitCompareArrows, Languages, ListOrdered, Orbit } from 'lucide-react';
import { FamilyTree } from './FamilyTree';
import { CreedExplorer } from './CreedExplorer';
import { OrthodoxyMatrix } from './OrthodoxyMatrix';
import { TranslationTimeline } from './TranslationTimeline';
import { TextualTransmission } from './TextualTransmission';
import { TraditionsCompare } from './TraditionsCompare';
import { BoundaryOrbit } from './BoundaryOrbit';

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
  { id: 'tree', label: 'Family tree', icon: GitBranch, View: FamilyTree },
  { id: 'traditions', label: 'Traditions', icon: GitCompareArrows, View: TraditionsCompare },
  { id: 'creeds', label: 'Creeds', icon: BookText, View: CreedExplorer },
  { id: 'compare', label: 'Inside & outside', icon: Orbit, View: InsideOutside },
  { id: 'translations', label: 'Translations', icon: Languages, View: TranslationTimeline },
  { id: 'verses', label: 'Chapters & verses', icon: ListOrdered, View: TextualTransmission },
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

  return (
    <main className="pt-6">
      <nav
        id="history-tabs"
        aria-label="Church history sections"
        className="no-scrollbar sticky top-0 z-20 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-rule bg-paper/95 px-4 py-2 backdrop-blur sm:-mx-8 sm:px-8"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => pick(id)}
            aria-current={tab === id ? 'page' : undefined}
            className={`focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[13px] font-medium ${
              tab === id ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
            }`}
          >
            <Icon size={14} aria-hidden />
            {label}
          </button>
        ))}
      </nav>
      <View />
    </main>
  );
}
