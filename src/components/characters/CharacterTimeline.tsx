import { useEffect, useState } from 'react';
import { BookOpen, Hourglass, Minus, Plus } from 'lucide-react';
import { ROLES, type CharacterFilters, cssColor, lineage } from '../../lib/characters';
import { HorizontalTimeline } from './HorizontalTimeline';
import { VerticalTimeline } from './VerticalTimeline';
import { Segmented } from './controls';
import { type Arrangement, type Highlight, fmtYear, useTimelineModel } from './timelineModel';

interface Props {
  filters: CharacterFilters;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function useMediaQuery(q: string) {
  const [match, setMatch] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setMatch(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [q]);
  return match;
}

export function CharacterTimeline({ filters, selectedId, onSelect }: Props) {
  const wide = useMediaQuery('(min-width: 768px)');
  const [arrangement, setArrangement] = useState<Arrangement>('lifetime');
  const [highlight, setHighlight] = useState<Highlight>('none');
  const [showOthers, setShowOthers] = useState(false);
  const [zoom, setZoom] = useState(1);
  const model = useTimelineModel(filters, showOthers, highlight);
  // A new filter or highlight re-fits the axis, so drop any manual zoom.
  useEffect(() => setZoom(1), [filters, highlight]);

  return (
    <div className="panel">
      {/* Toolbar: how to arrange · what to highlight · zoom */}
      <div className="flex flex-wrap items-center gap-2 border-b border-rule px-3 py-2.5">
        <Segmented<Arrangement>
          label="Arrange by"
          value={arrangement}
          onChange={setArrangement}
          options={[
            {
              id: 'lifetime',
              label: (
                <>
                  <Hourglass size={13} aria-hidden /> {wide ? 'By lifetime' : 'By era'}
                </>
              ),
              title: 'Place everyone by the years they lived',
            },
            {
              id: 'book',
              label: (
                <>
                  <BookOpen size={13} aria-hidden /> By book
                </>
              ),
              title: 'Group people under the book they feature in most, ordered by when its events happen',
            },
          ]}
        />
        <button
          onClick={() => setHighlight((h) => (h === 'lineage' ? 'none' : 'lineage'))}
          aria-pressed={highlight === 'lineage'}
          title={`Show only the ${lineage.length} generations from Adam to Jesus`}
          className={`focus-ring inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 font-sans text-[13px] font-medium transition-colors ${
            highlight === 'lineage' ? 'border-transparent text-paper' : 'border-rule bg-paper/70 text-ink hover:border-ink/60'
          }`}
          style={highlight === 'lineage' ? { background: cssColor('--lineage') } : undefined}
        >
          <span className="h-0.5 w-4 rounded" style={{ background: highlight === 'lineage' ? 'currentColor' : cssColor('--lineage') }} />
          Line of Jesus
        </button>
        {model.filtering && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 font-sans text-xs text-ink-soft" title="Show everyone else faded (the axis then covers all of history)">
            <input
              type="checkbox"
              checked={showOthers}
              onChange={(e) => setShowOthers(e.target.checked)}
              className="h-3.5 w-3.5 accent-current"
            />
            Show others faded
          </label>
        )}
        {wide && (
          <div className="ml-auto flex items-center gap-2 font-sans text-xs">
            <span className="tabular-nums text-ink-soft" title="Time span shown">
              {fmtYear(model.lo)} – {fmtYear(model.hi)}
            </span>
            <div className="inline-flex items-center rounded-full border border-rule" role="group" aria-label="Zoom">
              <button
                onClick={() => setZoom((z) => Math.max(1, z / 1.5))}
                disabled={zoom === 1}
                className="focus-ring rounded-l-full px-2 py-1 hover:bg-ink/5 disabled:opacity-30"
                aria-label="Zoom out"
              >
                <Minus size={13} />
              </button>
              <button
                onClick={() => setZoom(1)}
                disabled={zoom === 1}
                className="focus-ring border-x border-rule px-2 py-1 hover:bg-ink/5 disabled:opacity-30"
                title="Fit the whole span to the screen"
              >
                Fit
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(6, z * 1.5))}
                className="focus-ring rounded-r-full px-2 py-1 hover:bg-ink/5"
                aria-label="Zoom in"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend (at the top, so the colours are explained before you scroll) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-rule bg-ink/[0.02] px-3 py-2 font-sans text-[11px] text-ink-soft">
        {ROLES.map((r) => (
          <span key={r.id} className="inline-flex items-center gap-1">
            <span className="h-2 w-4 rounded-full" style={{ background: cssColor(r.css) }} />
            {r.id}
          </span>
        ))}
        {wide && (
          <>
            <span className="mx-1 h-3 w-px bg-rule" />
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-5 rounded-full" style={{ background: cssColor('--ink-soft', 0.9) }} /> lifespan
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-5 rounded-full" style={{ background: `linear-gradient(90deg, ${cssColor('--ink-soft', 0.9)}, ${cssColor('--ink-soft', 0.1)})` }} /> one end known
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-5 rounded-full" style={{ background: cssColor('--ink-soft', 0.55) }} /> years in the text
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-5 rounded-full border border-dashed border-ink-soft" style={{ background: cssColor('--ink-soft', 0.2) }} /> estimated
            </span>
          </>
        )}
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full" style={{ boxShadow: `0 0 0 2px ${cssColor('--lineage')}` }} /> line of Jesus
        </span>
      </div>
      {model.people.length === 0 && model.spiritsShown.length === 0 ? (
        <p className="px-4 py-12 text-center font-sans text-sm text-ink-soft">No characters match these filters.</p>
      ) : wide ? (
        <HorizontalTimeline
          model={model}
          arrangement={arrangement}
          highlight={highlight}
          zoom={zoom}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ) : (
        <VerticalTimeline model={model} arrangement={arrangement} highlight={highlight} selectedId={selectedId} onSelect={onSelect} />
      )}

    </div>
  );
}
