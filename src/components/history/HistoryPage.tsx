import { useState } from 'react';
import { BookOpen, BookText, Columns4, Compass, GitBranch, GitCompareArrows, Orbit, UsersRound } from 'lucide-react';
import { ChurchTitles } from './ChurchTitles';
import { CreedCompare } from './CreedCompare';
import { ViewTabs } from '../ViewTabs';
import { FamilyTree } from './FamilyTree';
import { CreedExplorer } from './CreedExplorer';
import { OrthodoxyMatrix } from './OrthodoxyMatrix';
import { TraditionsCompare } from './TraditionsCompare';
import { BoundaryOrbit } from './BoundaryOrbit';
import { StartHere } from './StartHere';
import { HistoryIntro } from '../PageIntros';
import { PageTabs, useHashTab } from '../PageTabs';
import { PageNav } from '../PageNav';

/** Creeds tab: compare all four side by side (default), or read one creed line by line. */
function CreedsTab() {
  // Compare first (the big picture), then read any one creed line by line.
  const [mode, setMode] = useState<'read' | 'compare'>(() => (window.location.hash === '#creeds-read' ? 'read' : 'compare'));
  return (
    <div className="space-y-5">
      <ViewTabs<'read' | 'compare'>
        label="Creed views"
        value={mode}
        onChange={setMode}
        tabs={[
          { id: 'compare', label: 'Compare all four', short: 'Compare', icon: Columns4 },
          { id: 'read', label: 'Read a creed', short: 'Read one', icon: BookOpen },
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

/**
 * The tabs in learning order: the overview first; then what the early church agreed to believe;
 * how it split; how the traditions differ today; who shares the core faith; and who's who.
 */
const TABS = [
  { id: 'start', label: 'Start here', short: 'Start', icon: Compass, blurb: 'Church history, simply told' },
  { id: 'creeds', label: 'Creeds', icon: BookText, blurb: 'What the early church agreed to believe' },
  { id: 'tree', label: 'Family tree', icon: GitBranch, blurb: 'How one church became many' },
  { id: 'traditions', label: 'Differences', icon: GitCompareArrows, blurb: 'How the four families of churches differ today' },
  { id: 'compare', label: 'Core beliefs', short: 'Beliefs', icon: Orbit, blurb: 'Who shares the core faith' },
  { id: 'titles', label: 'Titles', icon: UsersRound, blurb: 'Who’s who, from pope to pastor' },
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
    'start',
  );
  // Change tab and bring the reader back to the top of the new page.
  const go = (id: string) => {
    setTab(id as TabId);
    requestAnimationFrame(() => document.getElementById('history-top')?.scrollIntoView({ block: 'start' }));
  };

  const view =
    tab === 'start' ? (
      <StartHere go={go} />
    ) : tab === 'creeds' ? (
      <CreedsTab />
    ) : tab === 'tree' ? (
      <FamilyTree />
    ) : tab === 'traditions' ? (
      <TraditionsCompare />
    ) : tab === 'compare' ? (
      <CoreBeliefsTab />
    ) : (
      <ChurchTitles />
    );

  return (
    <main className="pt-6">
      <HistoryIntro />
      <div id="history-top" className="scroll-mt-0" />
      <PageTabs label="Church history sections" tabs={TABS} value={tab} onChange={setTab}>
        {view}

        {/* Step through the pages like a course */}
        <PageNav tabs={TABS} value={tab} go={go} end={{ eyebrow: 'You’ve reached the end', label: 'Back to Start here', onClick: () => go('start') }} />
      </PageTabs>
    </main>
  );
}
