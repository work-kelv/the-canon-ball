import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Character, RelType } from '../../characterTypes';
import {
  PRECISION_LABEL,
  REL_TYPES,
  characterById,
  cssColor,
  edgesFor,
  formatYearRange,
  lineage,
  neighbors,
  relCss,
  roleCss,
  twelveSons,
} from '../../lib/characters';
import {
  type Arrangement,
  type Highlight,
  SON_IDS,
  fmtYear,
  groupPeople,
  makeScale,
  type useTimelineModel,
} from './timelineModel';

interface Props {
  model: ReturnType<typeof useTimelineModel>;
  arrangement: Arrangement;
  highlight: Highlight;
  zoom: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const ROW = 26; // caption (11px) above an 8px bar
const BAR_Y = 15;
const BAR_H = 8;
const GAP = 10;
const MIN_W = 6;
const HEADER_H = 50;
const GROUP_HEAD = 22;
const SPIRIT_ROW = 22;

const LINEAGE_SET = new Set(lineage);
const SON_ORDER: Record<string, number> = Object.fromEntries(SON_IDS.map((id, i) => [id, i + 1]));
const TWELVE_SET = new Set(['jacob', ...SON_IDS, ...twelveSons.map((s) => s.mother)]);

let measureCtx: CanvasRenderingContext2D | null = null;
function textWidth(t: string, weight = 600, size = 11): number {
  measureCtx ??= document.createElement('canvas').getContext('2d');
  if (!measureCtx) return t.length * size * 0.6;
  measureCtx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
  return measureCtx.measureText(t).width;
}

interface Placed {
  c: Character;
  x0: number;
  x1: number;
  /** caption x (shifted left near the right edge so it is never clipped) */
  lx: number;
  y: number;
}

/** Greedy lane packing in start order; the twelve sons stay in consecutive lanes, in birth order. */
function pack(list: Character[], xOf: (y: number) => number, top: number, width: number) {
  const sorted = [...list].sort((a, b) => a.dates.start - b.dates.start || b.prominenceScore - a.prominenceScore);
  const geom = (c: Character) => {
    const x0 = xOf(c.dates.start);
    const x1 = Math.max(xOf(c.dates.end), x0 + MIN_W);
    const tw = textWidth(c.name) + 4;
    const lx = Math.max(2, Math.min(x0, width - tw - 2));
    return { x0, x1, lx, start: Math.min(x0, lx), extent: Math.max(x1, lx + tw) };
  };
  const laneEnd: number[] = [];
  const free = (lane: number, x: number) => laneEnd[lane] === undefined || laneEnd[lane] + GAP <= x;
  const placed: Placed[] = [];
  const sons = SON_IDS.map((id) => sorted.find((c) => c.id === id)).filter((c): c is Character => !!c);
  let sonsDone = false;
  for (const c of sorted) {
    if (sons.includes(c)) {
      if (sonsDone) continue;
      sonsDone = true;
      const g = sons.map((s) => ({ s, ...geom(s) }));
      const minX = Math.min(...g.map((x) => x.start));
      let k = 0;
      while (!g.every((_, i) => free(k + i, minX))) k++;
      g.forEach(({ s, x0, x1, lx, extent }, i) => {
        laneEnd[k + i] = extent;
        placed.push({ c: s, x0, x1, lx, y: top + (k + i) * ROW });
      });
      continue;
    }
    const { x0, x1, lx, start, extent } = geom(c);
    let lane = 0;
    while (!free(lane, start)) lane++;
    laneEnd[lane] = extent;
    placed.push({ c, x0, x1, lx, y: top + lane * ROW });
  }
  return { placed, bottom: top + laneEnd.length * ROW };
}

function barFill(c: Character) {
  const p = c.dates.precision;
  if (p === 'birth' || p === 'death') return `url(#fade-${c.id})`;
  return cssColor(roleCss(c.role), p === 'estimated' ? 0.28 : p === 'attested' ? 0.62 : 0.9);
}

export function HorizontalTimeline({ model, arrangement, highlight, zoom, selectedId, onSelect }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(1100);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hover, setHover] = useState<{ id: string; cx: number; cy: number } | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!wrap.current) return;
    setContainerW(wrap.current.clientWidth);
    const ro = new ResizeObserver(([e]) => setContainerW(Math.floor(e.contentRect.width)));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const width = Math.max(600, containerW * zoom);
  const scale = useMemo(() => makeScale(width, model.lo, model.hi, model.people), [width, model.lo, model.hi, model.people]);
  const { matchSet, filtering, people, spiritsShown } = model;

  const layout = useMemo(() => {
    const placed: Placed[] = [];
    const headers: { key: string; label: string; sub: string; x0: number; x1: number; y: number; h: number; n: number }[] = [];
    let y = 8;
    if (arrangement === 'lifetime') {
      const r = pack(people, scale.xOf, y, width);
      placed.push(...r.placed);
      y = r.bottom + 6;
    } else {
      for (const g of groupPeople(people, 'book')) {
        const r = pack(g.members, scale.xOf, y + GROUP_HEAD, width);
        placed.push(...r.placed);
        headers.push({
          key: g.key,
          label: g.label,
          sub: g.sub,
          x0: scale.xOf(g.start),
          x1: Math.max(scale.xOf(g.end), scale.xOf(g.start) + MIN_W),
          y,
          h: r.bottom - y + 4,
          n: g.members.length,
        });
        y = r.bottom + 12;
      }
    }
    const spiritTop = y + (spiritsShown.length ? 14 : 0);
    const height = spiritTop + spiritsShown.length * SPIRIT_ROW + 12;
    return { placed, headers, spiritTop, height: Math.max(height, 120) };
  }, [arrangement, people, spiritsShown, scale, width]);

  const byId = useMemo(() => Object.fromEntries(layout.placed.map((p) => [p.c.id, p])), [layout]);

  const focusId = hover?.id ?? selectedId;
  const focusSet = useMemo(() => (focusId ? new Set([focusId, ...neighbors[focusId]]) : null), [focusId]);
  const isActive = (id: string) => {
    if (focusSet) return focusSet.has(id);
    if (highlight === 'lineage') return LINEAGE_SET.has(id);
    if (highlight === 'twelve') return TWELVE_SET.has(id);
    return !filtering || matchSet.has(id);
  };

  // Bring the selected person into view (only when off-screen).
  useEffect(() => {
    const p = selectedId ? byId[selectedId] : null;
    const el = scroller.current;
    if (!p || !el) return;
    if (p.x0 < el.scrollLeft || p.x0 > el.scrollLeft + el.clientWidth - 80) {
      el.scrollTo({ left: Math.max(0, p.x0 - el.clientWidth * 0.3), behavior: 'smooth' });
    }
    const top = el.getBoundingClientRect().top + window.scrollY + p.y;
    if (top < window.scrollY + 220 || top > window.scrollY + window.innerHeight - 80) {
      window.scrollTo({ top: top - window.innerHeight * 0.4, behavior: 'smooth' });
    }
  }, [selectedId, byId]);

  const mid = (p: Placed) => p.y + BAR_Y + BAR_H / 2;

  const lineageThread = useMemo(() => {
    const d: string[] = [];
    for (let i = 1; i < lineage.length; i++) {
      const a = byId[lineage[i - 1]];
      const b = byId[lineage[i]];
      if (!a || !b) continue;
      const xs = Math.min(Math.max(b.x0, a.x0), a.x1);
      d.push(`M${xs},${mid(a)} L${xs},${mid(b)} L${b.x0},${mid(b)}`);
    }
    return d.join(' ');
  }, [byId]);

  const sonsThread = useMemo(() => {
    const j = byId.jacob;
    const sons = SON_IDS.map((id) => byId[id]).filter(Boolean);
    if (!j || !sons.length) return null;
    // One trunk dropping from Jacob's bar just left of the sons, with a short branch to each
    // son's bar (at bar height, below the caption) — no lines crossing the names.
    const trunkX = Math.max(j.x0 + 2, Math.min(...sons.map((s) => Math.min(s.x0, s.lx))) - 8);
    const last = Math.max(...sons.map(mid));
    const d = [`M${trunkX},${mid(j)} L${trunkX},${last}`, ...sons.map((s) => `M${trunkX},${mid(s)} L${s.x0},${mid(s)}`)].join(' ');
    return { d, labelX: trunkX - 6, labelY: (mid(j) + last) / 2 };
  }, [byId]);

  const connectors = useMemo(() => {
    if (!focusId || !byId[focusId]) return [];
    const a = byId[focusId];
    return edgesFor(focusId)
      .map(({ edge, otherId }) => {
        const b = byId[otherId];
        if (!b) return null;
        const lo = Math.max(a.x0, b.x0);
        const hi = Math.min(a.x1, b.x1);
        const xa = lo <= hi ? (lo + hi) / 2 : b.x0 > a.x1 ? a.x1 : a.x0;
        const xb = lo <= hi ? (lo + hi) / 2 : b.x0 > a.x1 ? b.x0 : b.x1;
        const my = (mid(a) + mid(b)) / 2;
        return { key: edge.key, type: edge.type as RelType, d: `M${xa},${mid(a)} C${xa},${my} ${xb},${my} ${xb},${mid(b)}` };
      })
      .filter((x): x is { key: string; type: RelType; d: string } => !!x);
  }, [focusId, byId]);

  const cursorYear = cursorX != null ? scale.yearOf(cursorX) : null;
  const alive = cursorYear != null ? layout.placed.filter((p) => p.c.dates.start <= cursorYear && p.c.dates.end >= cursorYear).length : 0;
  const hovered = hover ? characterById[hover.id] : null;
  const lineageMode = highlight === 'lineage';
  const twelveMode = highlight === 'twelve';

  return (
    <div ref={wrap} className="relative">
      {/* Era header: sticks below the filter bar while the page scrolls */}
      <div className="sticky z-20 overflow-hidden border-b border-rule bg-paper/95 backdrop-blur" style={{ top: 'var(--controls-h, 0px)' }}>
        <svg width={width} height={HEADER_H} style={{ transform: `translateX(${-scrollLeft}px)` }} className="block">
          {scale.segs.map((s, i) => {
            const w = s.x1 - s.x0;
            const fits = (t: string) => textWidth(t.toUpperCase(), 600, 11) + t.length * 1.2 + 16 <= w;
            const label = fits(s.label) ? s.label : fits(s.short) ? s.short : '';
            return (
              <g key={s.id}>
                <rect x={s.x0} y={0} width={w} height={26} fill={cssColor('--ink', i % 2 ? 0.03 : 0.075)} />
                <clipPath id={`era-clip-${i}`}>
                  <rect x={s.x0} y={0} width={w} height={26} />
                </clipPath>
                <text x={s.x0 + 8} y={17} clipPath={`url(#era-clip-${i})`} className="fill-ink font-sans text-[11px] font-semibold uppercase tracking-[0.1em]">
                  {label.toUpperCase()}
                  <title>{`${s.label} · ${s.dates}`}</title>
                </text>
                {i > 0 && <line x1={s.x0} x2={s.x0} y1={0} y2={HEADER_H} stroke={cssColor('--ink', 0.3)} />}
              </g>
            );
          })}
          {scale.ticks.map((t) => (
            <g key={t.year} transform={`translate(${t.x},26)`}>
              <line y1={0} y2={4} stroke={cssColor('--ink-soft', 0.6)} />
              <text y={16} textAnchor="middle" className="fill-ink-soft font-sans text-[10px] tabular-nums">
                {fmtYear(t.year)}
              </text>
            </g>
          ))}
          {cursorX != null && cursorYear != null && (
            <g transform={`translate(${Math.min(Math.max(cursorX, 62), width - 62)},0)`} pointerEvents="none">
              <rect x={-60} y={28} width={120} height={19} rx={3} fill={cssColor('--ink')} />
              <text y={41.5} textAnchor="middle" className="fill-paper font-sans text-[10.5px] font-semibold tabular-nums">
                {fmtYear(cursorYear)} · {alive} alive
              </text>
            </g>
          )}
        </svg>
      </div>

      <div
        ref={scroller}
        className={zoom > 1 ? 'overflow-x-auto' : 'overflow-x-hidden'}
        onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
        onMouseLeave={() => setCursorX(null)}
      >
        <svg
          width={width}
          height={layout.height}
          className="block"
          onMouseMove={(e) => setCursorX(e.clientX - e.currentTarget.getBoundingClientRect().left)}
          onClick={(e) => {
            if (e.target === e.currentTarget) onSelect(null);
          }}
        >
          <defs>
            {layout.placed
              .filter((p) => p.c.dates.precision === 'birth' || p.c.dates.precision === 'death')
              .map(({ c }) => (
                <linearGradient key={c.id} id={`fade-${c.id}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" style={{ stopColor: cssColor(roleCss(c.role), c.dates.precision === 'birth' ? 0.9 : 0.1) }} />
                  <stop offset="100%" style={{ stopColor: cssColor(roleCss(c.role), c.dates.precision === 'birth' ? 0.1 : 0.9) }} />
                </linearGradient>
              ))}
          </defs>

          {/* Era columns + year grid */}
          {scale.segs.map((s, i) => (
            <rect key={s.id} x={s.x0} y={0} width={s.x1 - s.x0} height={layout.height} fill={cssColor('--ink', i % 2 ? 0 : 0.022)} pointerEvents="none" />
          ))}
          {scale.ticks.map((t) => (
            <line key={t.year} x1={t.x} x2={t.x} y1={0} y2={layout.height} stroke={cssColor('--rule', 0.3)} pointerEvents="none" />
          ))}
          {scale.segs.slice(1).map((s) => (
            <line key={s.id} x1={s.x0} x2={s.x0} y1={0} y2={layout.height} stroke={cssColor('--ink', 0.2)} pointerEvents="none" />
          ))}

          {/* Book groups (By book arrangement) */}
          {layout.headers.map((h) => {
            const label = `${h.label}`;
            const lw = textWidth(label, 700, 12) + textWidth(` ${h.sub} · ${h.n}`, 400, 11) + 12;
            const lx = Math.min(Math.max(h.x0, 4), width - lw - 4);
            return (
              <g key={h.key} pointerEvents="none">
                <rect x={h.x0 - 4} y={h.y} width={h.x1 - h.x0 + 8} height={h.h} rx={4} fill={cssColor('--ink', 0.035)} stroke={cssColor('--ink', 0.12)} />
                <text x={lx} y={h.y + 15} className="font-sans">
                  <tspan className="fill-ink text-[12px] font-bold">{label}</tspan>
                  <tspan className="fill-ink-soft text-[11px]"> {h.sub} · {h.n}</tspan>
                </text>
              </g>
            );
          })}

          {/* Lineage thread */}
          <path
            d={lineageThread}
            fill="none"
            stroke={cssColor('--lineage')}
            strokeWidth={lineageMode ? 2 : 1.1}
            strokeOpacity={focusSet ? 0.12 : lineageMode ? 0.95 : arrangement === 'book' ? 0 : 0.35}
            pointerEvents="none"
          />

          {/* Twelve sons */}
          {twelveMode && sonsThread && (
            <g pointerEvents="none">
              <path d={sonsThread.d} fill="none" stroke={cssColor('--rel-family')} strokeWidth={1.6} strokeOpacity={focusSet ? 0.2 : 0.9} />
              <text
                x={sonsThread.labelX}
                y={sonsThread.labelY}
                textAnchor="end"
                dominantBaseline="middle"
                className="font-sans text-[11px] font-semibold"
                style={{ fill: cssColor('--rel-family') }}
              >
                12 tribes
              </text>
            </g>
          )}

          {/* Relationship connectors */}
          {connectors.map((k) => (
            <path
              key={k.key}
              d={k.d}
              fill="none"
              stroke={cssColor(relCss(k.type))}
              strokeWidth={1.6}
              strokeDasharray={k.type === 'Rival/Adversary' ? '4 3' : undefined}
              pointerEvents="none"
            />
          ))}

          {/* People */}
          {layout.placed.map((p) => {
            const { c } = p;
            const active = isActive(c.id);
            const selected = selectedId === c.id;
            const strong = selected || focusId === c.id;
            return (
              <g
                key={c.id}
                role="button"
                tabIndex={0}
                aria-label={`${c.name}, ${c.title}, ${formatYearRange(c.dates.start, c.dates.end)}`}
                className="cursor-pointer outline-none"
                opacity={active ? 1 : 0.16}
                onClick={() => onSelect(c.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(c.id);
                  }
                }}
                onFocus={(e) => {
                  const r = (e.currentTarget as SVGGElement).getBoundingClientRect();
                  setHover({ id: c.id, cx: r.left, cy: r.bottom });
                }}
                onBlur={() => setHover(null)}
                onMouseEnter={(e) => setHover({ id: c.id, cx: e.clientX, cy: e.clientY })}
                onMouseMove={(e) => setHover({ id: c.id, cx: e.clientX, cy: e.clientY })}
                onMouseLeave={() => setHover(null)}
              >
                <rect x={Math.min(p.x0, p.lx) - 2} y={p.y + 1} width={Math.max(p.x1, p.lx + textWidth(c.name)) - Math.min(p.x0, p.lx) + 4} height={ROW - 2} fill="transparent" />
                <text x={p.lx} y={p.y + 11} className={`fill-ink font-sans text-[11px] ${strong ? 'font-bold' : 'font-semibold'}`}>
                  {twelveMode && SON_ORDER[c.id] && <tspan style={{ fill: cssColor('--rel-family') }}>{SON_ORDER[c.id]}. </tspan>}
                  {c.name}
                </text>
                <rect
                  x={p.x0}
                  y={p.y + BAR_Y}
                  width={p.x1 - p.x0}
                  height={BAR_H}
                  rx={BAR_H / 2}
                  fill={barFill(c)}
                  stroke={selected ? cssColor('--ink') : cssColor(roleCss(c.role), c.dates.precision === 'estimated' ? 0.8 : 0)}
                  strokeWidth={selected ? 2 : 1}
                  strokeDasharray={c.dates.precision === 'estimated' && !selected ? '3 2' : undefined}
                />
                {LINEAGE_SET.has(c.id) && (
                  <circle cx={p.x0} cy={mid(p)} r={2.6} fill={cssColor('--lineage')} stroke={cssColor('--paper')} strokeWidth={1} />
                )}
              </g>
            );
          })}

          {/* Heavenly beings */}
          {spiritsShown.length > 0 && (
            <g>
              <line x1={0} x2={width} y1={layout.spiritTop - 8} y2={layout.spiritTop - 8} stroke={cssColor('--rule')} strokeDasharray="4 4" />
              {spiritsShown.map((c, i) => {
                const y = layout.spiritTop + i * SPIRIT_ROW + 12;
                const xs = (c.appearances ?? []).filter((yr) => yr >= model.lo && yr <= model.hi).map(scale.xOf);
                if (!xs.length) return null;
                const role = cssColor(roleCss(c.role));
                return (
                  <g
                    key={c.id}
                    opacity={isActive(c.id) ? 1 : 0.16}
                    className="cursor-pointer"
                    onClick={() => onSelect(c.id)}
                    onMouseEnter={(e) => setHover({ id: c.id, cx: e.clientX, cy: e.clientY })}
                    onMouseLeave={() => setHover(null)}
                  >
                    <rect x={xs[0] - 6} y={y - 10} width={xs[xs.length - 1] - xs[0] + 12} height={20} fill="transparent" />
                    <line x1={xs[0]} x2={xs[xs.length - 1]} y1={y} y2={y} stroke={role} strokeDasharray="2 4" strokeOpacity={0.6} />
                    {xs.map((x, k) => (
                      <path key={k} d={`M${x},${y - 4} L${x + 4},${y} L${x},${y + 4} L${x - 4},${y} Z`} fill={role} />
                    ))}
                    <text x={Math.min(xs[0] + 8, width - 220)} y={y - 6} className="fill-ink font-sans text-[11px] font-semibold">
                      {c.name}
                      <tspan className="fill-ink-soft font-normal"> · {c.title} · appearances</tspan>
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {cursorX != null && (
            <line x1={cursorX} x2={cursorX} y1={0} y2={layout.height} stroke={cssColor('--ink', 0.35)} strokeDasharray="2 3" pointerEvents="none" />
          )}
        </svg>
      </div>

      {hovered &&
        hover &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[60] max-w-xs rounded-sm border border-rule bg-paper px-3 py-2 shadow-xl"
            style={{
              left: Math.min(hover.cx + 14, window.innerWidth - 320),
              top: hover.cy + 150 > window.innerHeight ? hover.cy - 120 : hover.cy + 14,
            }}
          >
            <div className="font-display text-base font-semibold leading-tight">{hovered.name}</div>
            <div className="font-sans text-xs text-ink-soft">
              {hovered.title} · {hovered.role}
            </div>
            <div className="mt-1 font-sans text-xs tabular-nums">
              {hovered.kind === 'spiritual' ? 'Appears ' : 'c. '}
              {formatYearRange(hovered.dates.start, hovered.dates.end)}{' '}
              <span className="text-ink-soft">({PRECISION_LABEL[hovered.dates.precision]})</span>
            </div>
            {hovered.lineage && (
              <div className="mt-0.5 font-sans text-xs" style={{ color: cssColor('--lineage') }}>
                Generation {hovered.lineage.generation} of {lineage.length} in the line of Jesus
              </div>
            )}
            {SON_ORDER[hovered.id] && (
              <div className="mt-0.5 font-sans text-xs" style={{ color: cssColor('--rel-family') }}>
                Son {SON_ORDER[hovered.id]} of 12 · tribe of {hovered.name}
              </div>
            )}
            <div className="mt-1.5 flex flex-wrap gap-x-2 font-sans text-[10.5px]">
              {REL_TYPES.map((t) => {
                const n = edgesFor(hovered.id).filter((e) => e.edge.type === t.id).length;
                return n ? (
                  <span key={t.id} style={{ color: cssColor(t.css) }}>
                    {n} {t.id}
                  </span>
                ) : null;
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
