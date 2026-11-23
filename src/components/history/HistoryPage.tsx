import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, BookText, Columns4, Compass, GitBranch, GitCompareArrows, Orbit, UsersRound } from 'lucide-react';
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

/**
 * The tabs in learning order: the overview first; then what the early church agreed to believe;
 * how it split; how the traditions differ today; who shares the core faith; and who's who.
 */
const TABS = [
  { id: 'start', label: 'Start here', short: 'Start', icon: Compass, blurb: 'Church history, simply told' },
  { id: 'creeds', label: 'Creeds', icon: BookText, blurb: 'What the early church agreed to believe' },
  { id: 'tree', label: 'Family tree', icon: GitBranch, blurb: 'How one church became many' },
  { id: 'traditions', label: 'Traditions', icon: GitCompareArrows, blurb: 'How Catholic, Orthodox and Protestant differ today' },
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
  const i = TABS.findIndex((t) => t.id === tab);
  const prev = TABS[i - 1];
  const next = TABS[i + 1];
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
                  Next · {i + 2} of {TABS.length}
                </span>
                <span className="font-display text-lg font-semibold">{next.label}</span>
                <span className="block font-sans text-[12px] opacity-80">{next.blurb}</span>
              </span>
              <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          ) : (
            <button onClick={() => go('start')} className="focus-ring group flex items-center justify-end gap-3 rounded-md border border-ink px-4 py-3 text-right hover:bg-ink/5 sm:col-start-2">
              <span>
                <span className="eyebrow block">You’ve reached the end</span>
                <span className="font-display text-lg font-semibold">Back to Start here</span>
              </span>
              <ArrowRight size={18} className="shrink-0" aria-hidden />
            </button>
          )}
        </nav>
      </PageTabs>
    </main>
  );
}
