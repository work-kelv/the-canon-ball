import { BookText, GitBranch, GitCompareArrows, Orbit } from 'lucide-react';
import { FamilyTree } from './FamilyTree';
import { CreedExplorer } from './CreedExplorer';
import { OrthodoxyMatrix } from './OrthodoxyMatrix';
import { TraditionsCompare } from './TraditionsCompare';
import { BoundaryOrbit } from './BoundaryOrbit';
import { HistoryIntro } from '../PageIntros';
import { PageTabs, useHashTab } from '../PageTabs';

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
  { id: 'compare', label: 'Inside & outside', short: 'In & out', icon: Orbit, View: InsideOutside },
] as const;
type TabId = (typeof TABS)[number]['id'];

// The text's own history (translations, chapters & verses) moved to The Bible page; keep old links working.
const MOVED: Record<string, string> = { translations: 'languages.html#translations', verses: 'languages.html#verses' };
const redirectMoved = () => {
  const to = MOVED[window.location.hash.slice(1)];
  if (to) window.location.replace(to);
};
redirectMoved();
window.addEventListener('hashchange', redirectMoved);

export function HistoryPage() {
  const [tab, setTab] = useHashTab<TabId>(
    TABS.map((t) => t.id),
    'tree',
  );
  const { View } = TABS.find((t) => t.id === tab)!;
  return (
    <main className="pt-6">
      <HistoryIntro />
      <PageTabs label="Church history sections" tabs={TABS} value={tab} onChange={setTab}>
        <View />
      </PageTabs>
    </main>
  );
}
