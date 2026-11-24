import { CharactersIntro } from '../PageIntros';
import { ViewTabs } from '../ViewTabs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GanttChart, LayoutList, Share2 } from 'lucide-react';
import {
  EMPTY_FILTERS,
  type CharacterFilters,
  characterById,
  characterMeta,
  characters,
  edges,
  matchesCharacter,
} from '../../lib/characters';
import { CharacterFilterBar } from './CharacterFilterBar';
import { SearchBox } from './controls';
import { RelationshipGraph } from './RelationshipGraph';
import { EraTimeline } from './EraTimeline';
import { CharacterTimeline } from './CharacterTimeline';
import { CharacterInspector } from './CharacterInspector';

type Mode = 'timeline' | 'graph' | 'directory';
const HASH_OF: Record<Mode, string> = { timeline: '', graph: 'network', directory: 'directory' };
const modeFromHash = (): Mode => {
  const sub = location.hash.replace(/^#(characters\/?)?/, '');
  return sub.startsWith('network') ? 'graph' : sub.startsWith('directory') ? 'directory' : 'timeline';
};
/** characters.html?person=david opens that person (used by links from the Map page). */
const personFromUrl = () => new URLSearchParams(location.search).get('person');

export function CharactersPage({ dark }: { dark: boolean }) {
  // The view is reflected in the URL (#characters/network, #characters/directory) so it can be linked to.
  const [mode, setModeState] = useState<Mode>(modeFromHash);
  const setMode = (m: Mode) => {
    setModeState(m);
    history.replaceState(history.state, '', m === 'timeline' ? location.pathname + location.search : `#${HASH_OF[m]}`);
  };
  const [filters, setFilters] = useState<CharacterFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedIdState] = useState<string | null>(() => {
    const id = personFromUrl();
    return id && characterById[id] ? id : null;
  });

  // Opening the inspector adds a history entry, so the phone's Back button/gesture returns to
  // the timeline instead of leaving the page. Jumping between characters reuses that entry.
  const setSelectedId = useCallback((id: string | null) => {
    if (id === null) {
      if (history.state && history.state.inspector) history.back(); // popstate closes the panel
      else setSelectedIdState(null);
      return;
    }
    setSelectedIdState((cur) => {
      if (id && !cur && !(history.state && history.state.inspector)) history.pushState({ inspector: true }, '');
      return id;
    });
  }, []);
  useEffect(() => {
    const onPop = () => setSelectedIdState(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const matchCount = useMemo(() => characters.filter((c) => matchesCharacter(c, filters)).length, [filters]);
  const selected = selectedId ? characterById[selectedId] : null;
  const close = useCallback(() => setSelectedId(null), [setSelectedId]);

  // Publish the sticky filter bar's height so the timeline's era header can stick right below it.
  const controls = useRef<HTMLDivElement>(null);
  const [controlsH, setControlsH] = useState(0);
  useEffect(() => {
    const el = controls.current;
    if (!el) return;
    const update = () => setControlsH(getComputedStyle(el).position === 'sticky' ? el.offsetHeight : 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div style={{ ['--controls-h' as string]: `${controlsH}px` }}>
      <CharactersIntro />
      <div
        ref={controls}
        className="z-30 -mx-4 space-y-3 border-b border-rule bg-paper/90 px-4 pb-4 pt-2 backdrop-blur sm:-mx-8 sm:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b border-rule">
        <ViewTabs<Mode>
          label="Character views"
          value={mode}
          onChange={setMode}
          className="mb-2"
          tabs={[
            { id: 'timeline', label: 'Timeline', icon: GanttChart },
            { id: 'graph', label: 'Relationship network', short: 'Network', icon: Share2 },
            { id: 'directory', label: 'Era directory', short: 'Directory', icon: LayoutList },
          ]}
        />
        <SearchBox
          value={filters.query}
          onChange={(query) => setFilters((f) => ({ ...f, query }))}
          className="mb-2 w-full sm:w-64"
        />
        </div>
        <CharacterFilterBar filters={filters} onChange={setFilters} matchCount={matchCount} />
      </div>

      <div className="pt-4 md:pt-6">
        {mode === 'timeline' && (
          <>
            <CharacterTimeline filters={filters} selectedId={selectedId} onSelect={setSelectedId} />
          </>
        )}
        {mode === 'graph' && (
          <>
            <p className="mb-3 font-sans text-xs text-ink-soft">
              {characters.length} characters · {edges.length} relationships. Hover a character (or tap on a phone) to trace its
              connections; hover a line for the exact relationship; click to inspect.
            </p>
            <RelationshipGraph filters={filters} selectedId={selectedId} onSelect={setSelectedId} dark={dark} />
          </>
        )}
        {mode === 'directory' && <EraTimeline filters={filters} selectedId={selectedId} onSelect={setSelectedId} />}
      </div>

      <footer className="mt-16 border-t border-rule pt-6 font-sans text-xs leading-relaxed text-ink-soft">
        <p>
          Data: {characterMeta.source}. {characterMeta.license}.
        </p>
        <p className="mt-1">{characterMeta.method}</p>
        <p className="mt-1">{characterMeta.datesNote}</p>
        <p className="mt-1">{characterMeta.lineageNote}</p>
        <p className="mt-1">
          {characterMeta.eraNote} Titles, roles, summaries and non-family relationships are editorial; the character
          list was cross-checked against a per-book list in data-sources/gemini-characters-by-book.json.
        </p>
      </footer>

      {selected && (
        <CharacterInspector
          character={selected}
          activeBook={filters.book}
          onClose={close}
          onJump={setSelectedId}
          onBook={(book) => {
            // On a phone the panel covers the whole screen, so close it to reveal the filtered list.
            if (window.matchMedia('(max-width: 767px)').matches) {
              setFilters((f) => ({ ...f, book }));
              close();
              // After the shorter list renders, bring the filters + list into view.
              window.setTimeout(() => {
                const el = controls.current;
                if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'auto' });
              }, 80);
            } else {
              setFilters((f) => ({ ...f, book: f.book === book ? null : book }));
            }
          }}
          backLabel={mode === 'graph' ? 'Back to network' : mode === 'directory' ? 'Back to directory' : 'Back to timeline'}
        />
      )}
    </div>
  );
}
