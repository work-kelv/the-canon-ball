import { useState } from 'react';
import { BookOpen, BookText, Columns4, GitBranch, GitCompareArrows, Orbit } from 'lucide-react';
import { CreedCompare } from './CreedCompare';
import { ViewTabs } from '../ViewTabs';
import { FamilyTree } from './FamilyTree';
import { CreedExplorer } from './CreedExplorer';
import { OrthodoxyMatrix } from './OrthodoxyMatrix';
import { TraditionsCompare } from './TraditionsCompare';
import { BoundaryOrbit } from './BoundaryOrbit';
import { HistoryIntro } from '../PageIntros';
import { PageTabs, useHashTab } from '../PageTabs';

/** Creeds tab: read one creed line by line, or compare all four side by side. */
function CreedsTab() {
  const [mode, setMode] = useState<'read' | 'compare'>(() => (window.location.hash === '#creeds-compare' ? 'compare' : 'read'));
  return (
    <div className="space-y-5">
      <ViewTabs<'read' | 'compare'>
        label="Creed views"
        value={mode}
        onChange={setMode}
        tabs={[
          { id: 'read', label: 'Read a creed', icon: BookOpen },
          { id: 'compare', label: 'Compare all four', short: 'Compare', icon: Columns4 },
        ]}
      />
      {mode === 'read' ? <CreedExplorer /> : <CreedCompare />}
    </div>
  );
}

function CoreBeliefsTab() {
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
  { id: 'creeds', label: 'Creeds', icon: BookText, View: CreedsTab },
  { id: 'compare', label: 'Core beliefs', short: 'Beliefs', icon: Orbit, View: CoreBeliefsTab },
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
