import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, {
  type ForceGraphMethods,
  type LinkObject,
  type NodeObject,
} from 'react-force-graph-2d';
import { Clock, EyeOff, Maximize2, Network } from 'lucide-react';
import type { Character, Edge, Era } from '../../characterTypes';
import {
  ERAS,
  ERA_INDEX,
  REL_TYPES,
  ROLES,
  type CharacterFilters,
  characterById,
  characters,
  cssColor,
  edges,
  isFiltering,
  matchesCharacter,
  neighbors,
  nodeRadius,
  relCss,
  roleCss,
} from '../../lib/characters';

interface GNode {
  id: string;
  c: Character;
  r: number;
}
interface GLink {
  source: string;
  target: string;
  edge: Edge;
  curvature: number;
}
type N = NodeObject<GNode>;
type L = LinkObject<GNode, GLink>;

interface Props {
  filters: CharacterFilters;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  dark: boolean;
}

const ERA_SPACING = 150;
const eraX = (e: Era) => (ERA_INDEX[e] - (ERAS.length - 1) / 2) * ERA_SPACING;

/** Resolve the theme's CSS variables into canvas-friendly rgba() builders. */
function useCanvasPalette(dark: boolean) {
  return useMemo(() => {
    const cs = getComputedStyle(document.documentElement);
    const get = (v: string) => cs.getPropertyValue(v).trim().split(/\s+/).join(',');
    const vars = [
      '--ink',
      '--ink-soft',
      '--paper',
      '--rule',
      ...ROLES.map((r) => r.css),
      ...REL_TYPES.map((r) => r.css),
    ];
    const map = Object.fromEntries(vars.map((v) => [v, get(v)]));
    return (v: string, a = 1) => `rgba(${map[v]},${a})`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);
}

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 800, height: 560 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) =>
      setSize({ width: Math.floor(e.contentRect.width), height: Math.floor(e.contentRect.height) }),
    );
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

const linkKey = (a: string, b: string) => `${a}>${b}`;

export function RelationshipGraph({ filters, selectedId, onSelect, dark }: Props) {
  const fg = useRef<ForceGraphMethods<N, L>>();
  const [wrapRef, size] = useSize<HTMLDivElement>();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hoverLink, setHoverLink] = useState<string | null>(null);
  const [chrono, setChrono] = useState(true);
  const [hideOthers, setHideOthers] = useState(false);
  const fitted = useRef(false);
  const color = useCanvasPalette(dark);

  // Stable node/link objects (force-graph mutates them with positions).
  const all = useMemo(() => {
    const nodes: N[] = characters.map((c) => ({ id: c.id, c, r: nodeRadius(c) }));
    const pairs = new Set(edges.map((e) => linkKey(e.sourceId, e.targetId)));
    const links: L[] = edges.map((e) => ({
      source: e.sourceId,
      target: e.targetId,
      edge: e,
      // Bend reciprocal edges (e.g. Jesus ⇄ Judas) so both stay visible.
      curvature: pairs.has(linkKey(e.targetId, e.sourceId)) ? 0.25 : 0,
    }));
    return { nodes, links };
  }, []);

  const matchSet = useMemo(
    () => new Set(characters.filter((c) => matchesCharacter(c, filters)).map((c) => c.id)),
    [filters],
  );
  const filtering = isFiltering(filters);

  const graphData = useMemo(() => {
    if (!hideOthers || !filtering) return all;
    return {
      nodes: all.nodes.filter((n) => matchSet.has(n.id as string)),
      links: all.links.filter((l) => matchSet.has(l.edge.sourceId) && matchSet.has(l.edge.targetId)),
    };
  }, [all, hideOthers, filtering, matchSet]);

  const focusId = hoverId ?? selectedId;
  const focusSet = useMemo(() => {
    if (!focusId) return null;
    return new Set([focusId, ...neighbors[focusId]]);
  }, [focusId]);

  const nodeActive = useCallback(
    (id: string) => (focusSet ? focusSet.has(id) : !filtering || matchSet.has(id)),
    [focusSet, filtering, matchSet],
  );
  const linkActive = useCallback(
    (e: Edge) =>
      focusId
        ? e.sourceId === focusId || e.targetId === focusId
        : !filtering || (matchSet.has(e.sourceId) && matchSet.has(e.targetId)),
    [focusId, filtering, matchSet],
  );

  // Forces: era columns (optional) + gentle vertical centring.
  useEffect(() => {
    const g = fg.current;
    if (!g) return;
    let nodes: N[] = [];
    const eraForce = Object.assign(
      (alpha: number) => {
        for (const n of nodes) {
          if (chrono) n.vx = (n.vx ?? 0) + (eraX(n.c.era) - (n.x ?? 0)) * 0.12 * alpha;
          n.vy = (n.vy ?? 0) - (n.y ?? 0) * 0.02 * alpha;
        }
      },
      { initialize: (ns: N[]) => (nodes = ns) },
    );
    g.d3Force('era', eraForce);
    g.d3Force('charge')?.strength?.(chrono ? -70 : -110);
    g.d3Force('link')?.distance?.((l: L) => (l.edge.type === 'Family' ? 34 : 50));
    g.d3ReheatSimulation();
    fitted.current = false;
  }, [chrono, graphData]);

  // Centre on a character when selected (incl. jumps from the inspector).
  useEffect(() => {
    if (!selectedId || !fg.current) return;
    const n = graphData.nodes.find((x) => x.id === selectedId);
    if (n?.x == null || n.y == null) return;
    const k = Math.max(fg.current.zoom(), 1.8);
    // On wide screens the inspector covers the right ~28rem, so centre in the remaining space.
    const offset = window.innerWidth >= 1024 ? 224 / k : 0;
    fg.current.centerAt(n.x + offset, n.y, 600);
    if (fg.current.zoom() < 1.8) fg.current.zoom(1.8, 600);
  }, [selectedId, graphData]);

  const paintNode = useCallback(
    (node: N, ctx: CanvasRenderingContext2D, scale: number) => {
      const { c, r } = node;
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const active = nodeActive(c.id);
      const isFocus = c.id === focusId;
      const isSelected = c.id === selectedId;
      const fill = color(roleCss(c.role), active ? 1 : 0.13);

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = (isSelected ? 2.5 : 1.2) / scale;
      ctx.strokeStyle = isSelected || isFocus ? color('--ink', 1) : color('--paper', active ? 0.9 : 0.3);
      ctx.stroke();
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, r + 3.5 / scale, 0, 2 * Math.PI);
        ctx.lineWidth = 1 / scale;
        ctx.strokeStyle = color('--ink', 0.5);
        ctx.stroke();
      }

      const labelled =
        isFocus ||
        isSelected ||
        (focusSet ? focusSet.has(c.id) : active && (c.prominenceScore >= 58 || scale > 2.2 || (filtering && matchSet.size <= 30)));
      if (!labelled) return;

      const fontSize = Math.max(11 / scale, 1.5);
      ctx.font = `${isFocus || isSelected ? 600 : 500} ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const ty = y + r + 2.5 / scale;
      ctx.lineWidth = 3 / scale;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color('--paper', 0.92);
      ctx.strokeText(c.name, x, ty);
      ctx.fillStyle = color('--ink', active ? 1 : 0.4);
      ctx.fillText(c.name, x, ty);
    },
    [color, nodeActive, focusId, focusSet, selectedId, filtering, matchSet],
  );

  const paintPointer = useCallback((node: N, paint: string, ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.arc(node.x ?? 0, node.y ?? 0, node.r + 2, 0, 2 * Math.PI);
    ctx.fillStyle = paint;
    ctx.fill();
  }, []);

  const tooltip = (l: L) => {
    const s = characterById[l.edge.sourceId];
    const t = characterById[l.edge.targetId];
    return `${s.name} → <b>${l.edge.label}</b> → ${t.name}<br/><span style="opacity:.7">${l.edge.type}${
      l.edge.source === 'theographic' ? ' · Theographic' : ''
    }</span>`;
  };

  return (
    <div className="panel relative overflow-hidden">
      <div ref={wrapRef} className="h-[68vh] min-h-[460px] w-full touch-none">
        <ForceGraph2D<GNode, GLink>
          ref={fg}
          width={size.width}
          height={size.height}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={1}
          nodeVal={(n) => n.r * n.r}
          nodeLabel={(n) => `<b>${n.c.name}</b> · ${n.c.title}<br/><span style="opacity:.7">${n.c.era} · ${n.c.verseCount} verses</span>`}
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={paintPointer}
          linkLabel={tooltip}
          linkColor={(l) => {
            const hovered = hoverLink === l.edge.key;
            return color(relCss(l.edge.type), hovered ? 1 : linkActive(l.edge) ? (focusId ? 0.95 : 0.6) : 0.07);
          }}
          linkWidth={(l) => (hoverLink === l.edge.key ? 3 : focusId && linkActive(l.edge) ? 2 : 1.1)}
          linkLineDash={(l) => (l.edge.type === 'Rival/Adversary' ? [3, 2] : null)}
          linkCurvature="curvature"
          linkDirectionalArrowLength={(l) => (linkActive(l.edge) ? 4.5 : 0)}
          linkDirectionalArrowRelPos={1}
          linkDirectionalArrowColor={(l) => color(relCss(l.edge.type), linkActive(l.edge) ? 0.95 : 0.1)}
          linkHoverPrecision={6}
          onNodeHover={(n) => setHoverId((n?.id as string) ?? null)}
          onLinkHover={(l) => setHoverLink(l?.edge.key ?? null)}
          onNodeClick={(n) => onSelect(n.id as string)}
          onBackgroundClick={() => onSelect(null)}
          autoPauseRedraw={false}
          cooldownTicks={180}
          onEngineStop={() => {
            if (!fitted.current) {
              fitted.current = true;
              fg.current?.zoomToFit(500, 40);
            }
          }}
          minZoom={0.3}
          maxZoom={8}
        />
      </div>

      {/* Toolbar */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5 font-sans text-xs">
        {[
          {
            on: chrono,
            icon: chrono ? <Clock size={14} /> : <Network size={14} />,
            label: chrono ? 'Chronological layout' : 'Free layout',
            click: () => setChrono((v) => !v),
            title: 'Toggle arranging characters in era columns',
          },
          {
            on: hideOthers,
            icon: <EyeOff size={14} />,
            label: hideOthers ? 'Hiding non-matches' : 'Dimming non-matches',
            click: () => setHideOthers((v) => !v),
            title: 'When filtering, hide (rather than dim) characters that do not match',
          },
          {
            on: false,
            icon: <Maximize2 size={14} />,
            label: 'Fit to view',
            click: () => fg.current?.zoomToFit(500, 40),
            title: 'Zoom to fit all visible characters',
          },
        ].map((b) => (
          <button
            key={b.title}
            onClick={b.click}
            title={b.title}
            aria-pressed={b.on}
            className={`focus-ring inline-flex items-center justify-end gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur ${
              b.on ? 'border-ink/70 bg-ink/90 text-paper' : 'border-rule bg-paper/85 text-ink hover:border-ink/60'
            }`}
          >
            {b.icon}
            <span className="hidden sm:inline">{b.label}</span>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-paper via-paper/80 to-transparent px-4 pb-3 pt-8 font-sans text-[12px] text-ink-soft">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {ROLES.map((r) => (
            <span key={r.id} className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: cssColor(r.css) }} />
              {r.id}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {REL_TYPES.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1">
              <svg width="18" height="6" aria-hidden>
                <line
                  x1="0"
                  y1="3"
                  x2="18"
                  y2="3"
                  stroke={cssColor(t.css)}
                  strokeWidth="2"
                  strokeDasharray={t.dash ? '4 3' : undefined}
                />
              </svg>
              {t.id}
            </span>
          ))}
          <span className="hidden md:inline">· Size = prominence · Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}
