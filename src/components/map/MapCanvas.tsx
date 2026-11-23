import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { geoGraticule, geoInterpolate, geoMercator, geoPath } from 'd3-geo';
import { Pause, Play, RotateCcw, SkipBack, SkipForward, X } from 'lucide-react';
import { select } from 'd3-selection';
import 'd3-transition';
import { type ZoomBehavior, type ZoomTransform, zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import { feature, mesh } from 'topojson-client';
import type { Feature, FeatureCollection, MultiLineString } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
// Coastlines/borders (~750 KB) are fetched as a separate static asset rather than bundled.
import worldUrl from 'world-atlas/countries-50m.json?url';
import { cssColor } from '../../lib/characters';
import { type AnimRoute, type BookGeo, type Journey, LEG_STYLE, REGIONS } from '../../lib/geography';

export type Selection =
  | { kind: 'place'; placeId: string }
  | { kind: 'pin'; role: 'origin' | 'setting'; order: number }
  | { kind: 'waypoint'; journeyId: string; legId: string; n: number };

export const selKey = (s: Selection | null) =>
  !s ? '' : s.kind === 'place' ? `p:${s.placeId}` : s.kind === 'pin' ? `${s.role}:${s.order}` : `w:${s.legId}:${s.n}`;

interface Props {
  mode: 'books' | 'journeys';
  book: BookGeo | null;
  journeys: Journey[];
  showBorders: boolean;
  /** Changing `id` flies the map to fit these [lng, lat] points. */
  flyTo: { id: number; points: [number, number][] };
  /** Screen space kept clear when fitting (e.g. under an overlay card). */
  fitPadding?: { top: number; left: number };
  selected: Selection | null;
  onSelect: (s: Selection | null) => void;
  /** Route to animate (a book journey or a leg of a major journey). */
  route?: AnimRoute | null;
  /** Changing this restarts the animation. */
  playToken?: number;
  onCloseRoute?: () => void;
  /** Called when the animation reaches the end of the route. */
  onRouteEnd?: () => void;
  /** When playing a sequence ("Play all"). */
  playlist?: { index: number; total: number; onPrev: () => void; onNext: () => void } | null;
}

// ── Static geography ──
type World = { land: FeatureCollection; borders: MultiLineString };
let worldPromise: Promise<World> | null = null;
function loadWorld(): Promise<World> {
  worldPromise ??= fetch(worldUrl)
    .then((r) => r.json())
    .then((json) => {
      const topo = json as Topology<{ countries: GeometryCollection; land: GeometryCollection }>;
      return {
        land: feature(topo, topo.objects.land) as unknown as FeatureCollection,
        borders: mesh(topo, topo.objects.countries, (a, b) => a !== b) as MultiLineString,
      };
    });
  return worldPromise;
}
function useWorld() {
  const [world, setWorld] = useState<World | null>(null);
  useEffect(() => {
    let live = true;
    loadWorld().then((w) => live && setWorld(w));
    return () => {
      live = false;
    };
  }, []);
  return world;
}

const graticule = geoGraticule().step([5, 5])();
const FULL = REGIONS[0].bounds;
const fullFeature: Feature = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'MultiPoint', coordinates: [FULL[0], FULL[1], [FULL[0][0], FULL[1][1]], [FULL[1][0], FULL[0][1]]] },
};

const line = (pts: [number, number][]): Feature => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: pts.map(([lat, lng]) => [lng, lat]) } });
const poly = (pts: [number, number][]): Feature => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'Polygon', coordinates: [[...pts, pts[0]].map(([lat, lng]) => [lng, lat])] },
});

// Hand-traced major rivers and lakes (approximate) — [lat, lng]
const RIVERS: { name: string; f: Feature; label: [number, number]; rotate: number }[] = [
  {
    name: 'Nile',
    f: line([[24.09, 32.9], [25.69, 32.64], [26.16, 32.72], [27.18, 31.18], [28.1, 30.75], [29.07, 31.1], [30.05, 31.25], [30.6, 31.0], [31.45, 30.37]]),
    label: [27.4, 30.75],
    rotate: -75,
  },
  { name: '', f: line([[30.6, 31.0], [31.05, 31.4], [31.47, 31.8]]), label: [0, 0], rotate: 0 },
  {
    name: 'Euphrates',
    f: line([[39.0, 38.9], [38.3, 38.7], [37.4, 38.2], [36.83, 38.02], [36.0, 38.2], [35.95, 39.0], [35.33, 40.14], [34.45, 40.92], [34.13, 42.38], [33.64, 42.83], [33.35, 43.78], [32.54, 44.42], [31.31, 45.28], [31.04, 46.26], [31.0, 47.43], [30.5, 47.8], [29.95, 48.55]]),
    label: [34.75, 40.6],
    rotate: 32,
  },
  {
    name: 'Tigris',
    f: line([[38.1, 40.1], [37.91, 40.23], [37.33, 42.19], [36.34, 43.13], [35.46, 43.26], [34.2, 43.87], [33.31, 44.36], [32.5, 45.82], [31.84, 47.15], [31.0, 47.43]]),
    label: [35.2, 43.65],
    rotate: 70,
  },
  {
    name: 'Jordan',
    f: line([[33.25, 35.65], [33.08, 35.61], [32.89, 35.6], [32.71, 35.57], [32.4, 35.58], [32.1, 35.53], [31.85, 35.55], [31.77, 35.55]]),
    label: [32.3, 35.63],
    rotate: 88,
  },
];
const LAKES: Feature[] = [
  poly([[32.88, 35.57], [32.86, 35.64], [32.8, 35.65], [32.72, 35.64], [32.7, 35.58], [32.77, 35.53], [32.84, 35.52]]),
  poly([[31.77, 35.47], [31.77, 35.56], [31.55, 35.58], [31.35, 35.53], [31.18, 35.45], [31.3, 35.4], [31.5, 35.4]]),
];

type Label = { text: string; at: [number, number]; minK?: number; maxK?: number; size?: number; kind: 'region' | 'sea' | 'small' };
const ANCIENT: Label[] = [
  { text: 'EGYPT', at: [26.9, 29.6], kind: 'region', maxK: 5 },
  { text: 'ARABIA', at: [27.8, 41.5], kind: 'region', maxK: 5 },
  { text: 'ASSYRIA', at: [36.6, 43.9], kind: 'region', maxK: 6 },
  { text: 'BABYLONIA', at: [31.7, 45.3], kind: 'region', maxK: 6 },
  { text: 'ELAM', at: [31.9, 48.9], kind: 'region', maxK: 6 },
  { text: 'MEDIA', at: [35.2, 48.6], kind: 'region', maxK: 6 },
  { text: 'ARAM', at: [34.6, 37.6], kind: 'region', maxK: 5 },
  { text: 'ASIA', at: [38.7, 28.9], kind: 'region', maxK: 6 },
  { text: 'GALATIA', at: [39.5, 32.6], kind: 'region', maxK: 6 },
  { text: 'CAPPADOCIA', at: [38.6, 35.6], kind: 'region', maxK: 6 },
  { text: 'CILICIA', at: [37.2, 34.7], kind: 'region', minK: 1.6, maxK: 6 },
  { text: 'MACEDONIA', at: [41.05, 22.4], kind: 'region', maxK: 6 },
  { text: 'ACHAIA', at: [38.1, 21.75], kind: 'region', maxK: 6 },
  { text: 'ITALIA', at: [41.9, 14.9], kind: 'region', maxK: 6 },
  { text: 'LIBYA', at: [30.2, 21.5], kind: 'region', maxK: 5 },
  { text: 'SINAI', at: [29.4, 33.6], kind: 'region', minK: 1.4, maxK: 8 },
  { text: 'CANAAN', at: [31.2, 34.75], kind: 'region', maxK: 2.4 },
  { text: 'Galilee', at: [32.95, 35.32], kind: 'small', minK: 2.4 },
  { text: 'Samaria', at: [32.27, 35.12], kind: 'small', minK: 2.4 },
  { text: 'Judea', at: [31.55, 34.98], kind: 'small', minK: 2.4 },
  { text: 'Philistia', at: [31.55, 34.45], kind: 'small', minK: 3.2 },
  { text: 'Moab', at: [31.35, 35.85], kind: 'small', minK: 2.4 },
  { text: 'Edom', at: [30.55, 35.55], kind: 'small', minK: 2.4 },
  { text: 'Ammon', at: [31.98, 36.05], kind: 'small', minK: 3.2 },
  { text: 'Gilead', at: [32.4, 35.85], kind: 'small', minK: 3.2 },
  { text: 'Phoenicia', at: [33.75, 35.55], kind: 'small', minK: 2.4 },
  { text: 'Great Sea', at: [34.2, 19.2], kind: 'sea', maxK: 6 },
  { text: 'Red Sea', at: [25.2, 35.6], kind: 'sea' },
  { text: 'Persian Gulf', at: [27.4, 50.7], kind: 'sea' },
  { text: 'Black Sea', at: [43.3, 33.8], kind: 'sea' },
  { text: 'Caspian Sea', at: [41.4, 50.6], kind: 'sea' },
  { text: 'Salt Sea', at: [31.47, 35.49], kind: 'sea', minK: 5 },
  { text: 'Sea of Galilee', at: [32.8, 35.59], kind: 'sea', minK: 6 },
];
const MODERN: Label[] = [
  { text: 'Israel', at: [30.9, 34.82], kind: 'small' },
  { text: 'Jordan', at: [30.9, 36.75], kind: 'small' },
  { text: 'Egypt', at: [25.8, 30.0], kind: 'small' },
  { text: 'Iraq', at: [33.2, 42.6], kind: 'small' },
  { text: 'Turkey', at: [39.0, 35.5], kind: 'small' },
  { text: 'Greece', at: [39.6, 22.0], kind: 'small' },
  { text: 'Italy', at: [42.6, 12.6], kind: 'small' },
  { text: 'Syria', at: [35.3, 38.6], kind: 'small' },
  { text: 'Lebanon', at: [33.95, 35.95], kind: 'small', minK: 2.4 },
  { text: 'West Bank', at: [31.95, 35.3], kind: 'small', minK: 4 },
  { text: 'Saudi Arabia', at: [27.0, 43.0], kind: 'small' },
  { text: 'Iran', at: [33.5, 50.0], kind: 'small' },
  { text: 'Cyprus', at: [35.05, 33.25], kind: 'small', minK: 1.6 },
  { text: 'Libya', at: [29.5, 18.0], kind: 'small' },
];

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 900, h: 600 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const set = () => ref.current && setSize({ w: ref.current.clientWidth, h: ref.current.clientHeight });
    set();
    const ro = new ResizeObserver(set);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

export function MapCanvas({ mode, book, journeys, showBorders, flyTo, fitPadding, selected, onSelect, route, playToken = 0, onCloseRoute, onRouteEnd, playlist }: Props) {
  const [wrapRef, { w, h }] = useSize<HTMLDivElement>();
  const world = useWorld();
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown>>();
  const [t, setT] = useState<ZoomTransform>(zoomIdentity);

  // ── Route animation ──
  const [prog, setProg] = useState(1);
  const [playing, setPlaying] = useState(false);
  const progRef = useRef(1);
  progRef.current = prog;
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const endRef = useRef(onRouteEnd);
  endRef.current = onRouteEnd;

  // Great-circle samples with cumulative km, so the traveller moves at a constant speed.
  const samples = useMemo(() => {
    if (!route || route.stops.length < 1) return [];
    const out: { lat: number; lng: number; km: number }[] = [{ lat: route.stops[0].lat, lng: route.stops[0].lng, km: 0 }];
    let cum = 0;
    for (let i = 1; i < route.stops.length; i++) {
      const a = route.stops[i - 1];
      const b = route.stops[i];
      const legKm = route.legKm[i - 1] ?? 0;
      const n = Math.max(2, Math.min(48, Math.ceil(legKm / 30)));
      const interp = geoInterpolate([a.lng, a.lat], [b.lng, b.lat]);
      for (let j = 1; j <= n; j++) {
        const [lng, lat] = interp(j / n);
        out.push({ lat, lng, km: cum + (legKm * j) / n });
      }
      cum += legKm;
    }
    return out;
  }, [route]);

  useEffect(() => {
    if (!route) return;
    if (reduced || route.distanceKm < 1) {
      setProg(1);
      setPlaying(false);
      const done = window.setTimeout(() => endRef.current?.(), 2500);
      return () => window.clearTimeout(done);
    }
    setProg(0);
    setPlaying(false);
    const id = window.setTimeout(() => setPlaying(true), 950); // start after the fly-to
    return () => window.clearTimeout(id);
  }, [route?.key, playToken]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!playing || !route) return;
    const dur = Math.min(14000, Math.max(4000, (route.distanceKm / 300) * 1000));
    const p0 = progRef.current >= 1 ? 0 : progRef.current;
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      start ??= ts;
      const p = Math.min(1, p0 + (ts - start) / dur);
      setProg(p);
      if (p < 1) raf = requestAnimationFrame(step);
      else {
        setPlaying(false);
        endRef.current?.();
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, route]);

  const projection = useMemo(() => geoMercator().fitExtent([[8, 8], [w - 8, h - 8]], fullFeature), [w, h]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const base = useMemo(
    () => ({
      land: world ? path(world.land) ?? "" : "",
      borders: world ? path(world.borders) ?? "" : "",
      graticule: path(graticule) ?? '',
      rivers: RIVERS.map((r) => path(r.f) ?? ''),
      lakes: LAKES.map((l) => path(l) ?? ''),
    }),
    [path, world],
  );

  // Screen position of a [lat, lng] under the current zoom.
  const P = (lat: number, lng: number): [number, number] => {
    const p = projection([lng, lat]) ?? [0, 0];
    return [t.applyX(p[0]), t.applyY(p[1])];
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const z = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 60])
      .translateExtent([[-w * 0.25, -h * 0.25], [w * 1.25, h * 1.25]])
      .on('zoom', (e) => setT(e.transform));
    zoomRef.current = z;
    select(svg).call(z).on('dblclick.zoom', null);
    return () => {
      select(svg).on('.zoom', null);
    };
  }, [w, h]);

  // Fly to fit the requested points.
  useEffect(() => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!svg || !z || !flyTo.points.length) return;
    const pts = flyTo.points.map(([lng, lat]) => projection([lng, lat]) ?? [0, 0]);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const dx = Math.max(x1 - x0, 1);
    const dy = Math.max(y1 - y0, 1);
    // While a journey plays, keep its route clear of the player bar across the top.
    const playerH = route ? 48 : 0;
    const pt = Math.min((fitPadding?.top ?? 0) + playerH, h * 0.4);
    const pl = Math.min(fitPadding?.left ?? 0, w * 0.4);
    const pb = route ? 10 : 0;
    const pr = route ? 44 : 0; // room for the stop labels beside the zoom buttons
    const aw = w - pl - pr;
    const ah = h - pt - pb;
    const single = dx < 4 && dy < 4;
    const k = single ? 14 : Math.min(40, (route ? 0.72 : 0.8) / Math.max(dx / aw, dy / ah));
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    // A footprint as wide as the whole map: just show the whole map.
    const target =
      k <= 1.05 && !route ? zoomIdentity : zoomIdentity.translate(pl + aw / 2, pt + ah / 2).scale(Math.max(k, 1)).translate(-cx, -cy);
    select(svg).transition().duration(850).call(z.transform, target);
  }, [flyTo.id, projection, w, h]); // eslint-disable-line react-hooks/exhaustive-deps

  const k = t.k;
  const sel = selKey(selected);
  const ink = cssColor('--ink');
  const paper = cssColor('--paper');

  const visible = (l: Label) => (!l.minK || k >= l.minK) && (!l.maxK || k <= l.maxK);

  // ── Book overlay ──
  const bookLayer = (() => {
    if (mode !== 'books' || !book) return null;
    const o = book.origin;
    const s = book.destinationOrSetting;
    const [ox, oy] = P(o.lat, o.lng);
    const [sx, sy] = P(s.lat, s.lng);
    const dist = Math.hypot(sx - ox, sy - oy);
    const same = dist < 6;
    // curved arc: control point offset perpendicular to the chord
    const mx = (ox + sx) / 2;
    const my = (oy + sy) / 2;
    const off = Math.min(dist * 0.28, 160);
    const nx = -(sy - oy) / (dist || 1);
    const ny = (sx - ox) / (dist || 1);
    const cx = mx + nx * off;
    const cy = my + ny * off;
    const maxM = Math.max(...book.keyLocations.map((l) => l.mentionCount), 1);
    const keyIds = new Set([o.placeId, s.placeId]);
    return (
      <g>
        {/* key locations */}
        {book.keyLocations.map((l) => {
          const [x, y] = P(l.lat, l.lng);
          const r = 4 + 11 * Math.sqrt(l.mentionCount / maxM);
          const isSel = sel === `p:${l.placeId}`;
          const dup = keyIds.has(l.placeId);
          return (
            <g key={l.placeId} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelect({ kind: 'place', placeId: l.placeId }); }}>
              <circle cx={x} cy={y} r={r} fill={cssColor('--greek', 0.22)} stroke={cssColor('--greek', 0.9)} strokeWidth={isSel ? 2.5 : 1.2} />
              {!dup && (
                <text x={x + r + 3} y={y + 4} className="map-label font-sans text-[11px] font-semibold" style={{ fill: ink }}>
                  {l.name}
                  <tspan className="font-normal" style={{ fill: cssColor('--ink-soft') }}> {l.mentionCount}</tspan>
                </text>
              )}
            </g>
          );
        })}
        {/* origin → setting arc */}
        {!same && (
          <path
            d={`M${ox},${oy} Q${cx},${cy} ${sx},${sy}`}
            fill="none"
            stroke={ink}
            strokeWidth={1.8}
            strokeDasharray="6 5"
            className="map-arc"
            markerEnd="url(#arrow)"
          />
        )}
        {[
          { role: 'origin' as const, x: ox, y: oy, label: `Written · ${o.placeName}`, color: ink },
          { role: 'setting' as const, x: sx, y: sy, label: `${same ? 'Written & set' : 'Setting'} · ${s.placeName}`, color: cssColor('--lineage') },
        ]
          .filter((p) => !(same && p.role === 'origin'))
          .map((p) => {
            const isSel = sel === `${p.role}:${book.order}`;
            const up = p.role === 'origin' ? oy <= sy : sy < oy;
            return (
              <g key={p.role} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelect({ kind: 'pin', role: p.role, order: book.order }); }}>
                <path
                  d={`M${p.x},${p.y} l-8,-14 a9,9 0 1,1 16,0 z`}
                  fill={p.color}
                  stroke={paper}
                  strokeWidth={isSel ? 2.5 : 1.5}
                />
                <circle cx={p.x} cy={p.y - 17} r={3.4} fill={paper} />
                <g transform={`translate(${p.x}, ${up ? p.y - 34 : p.y + 16})`}>
                  <rect x={-textW(p.label) / 2 - 7} y={-12} width={textW(p.label) + 14} height={19} rx={9.5} fill={p.color} />
                  <text textAnchor="middle" y={2} className="font-sans text-[11px] font-semibold" style={{ fill: paper }}>
                    {p.label}
                  </text>
                </g>
              </g>
            );
          })}
      </g>
    );
  })();

  // ── Journeys overlay ──
  const journeyLayer =
    mode === 'journeys'
      ? journeys.flatMap((j) =>
          j.legs.map((leg) => {
            const style = LEG_STYLE[leg.id] ?? { css: '--ink' };
            const col = cssColor(style.css);
            const pts = leg.waypoints.map((wp) => P(wp.lat, wp.lng));
            return (
              <g key={leg.id}>
                <path
                  d={pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')}
                  fill="none"
                  stroke={col}
                  strokeWidth={3}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={style.dash}
                  opacity={0.9}
                />
                {leg.waypoints.map((wp, i) => {
                  const [x, y] = pts[i];
                  const isSel = sel === `w:${leg.id}:${wp.n}`;
                  return (
                    <g
                      key={wp.n}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect({ kind: 'waypoint', journeyId: j.id, legId: leg.id, n: wp.n });
                      }}
                    >
                      <circle cx={x} cy={y} r={isSel ? 11 : 9} fill={col} stroke={isSel ? ink : paper} strokeWidth={isSel ? 2.5 : 1.5} />
                      <text x={x} y={y + 3.6} textAnchor="middle" className="pointer-events-none font-sans text-[10px] font-bold" style={{ fill: paper }}>
                        {wp.n}
                      </text>
                      {k >= 2.2 && (
                        <text x={x + 13} y={y + 4} className="map-label pointer-events-none font-sans text-[11px] font-semibold" style={{ fill: ink }}>
                          {wp.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          }),
        )
      : null;

  const routeLayer = (() => {
    if (!route || !samples.length) return null;
    const col = cssColor(route.css);
    const total = route.distanceKm;
    const kmNow = prog * total;
    const pts = samples.map((p) => P(p.lat, p.lng));
    let idx = samples.findIndex((p) => p.km >= kmNow);
    if (idx < 0) idx = samples.length - 1;
    let cur = pts[idx];
    if (idx > 0 && samples[idx].km > samples[idx - 1].km) {
      const f = (kmNow - samples[idx - 1].km) / (samples[idx].km - samples[idx - 1].km);
      cur = [pts[idx - 1][0] + (pts[idx][0] - pts[idx - 1][0]) * f, pts[idx - 1][1] + (pts[idx][1] - pts[idx - 1][1]) * f];
    }
    const done = [...pts.slice(0, idx), cur];
    const d = (arr: [number, number][]) => arr.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const stopAt = route.stops.map((st) => P(st.lat, st.lng));
    let cumKm = 0;
    const stopKm = route.stops.map((_, i) => (i === 0 ? 0 : (cumKm += route.legKm[i - 1] ?? 0)));
    return (
      <g>
        <path d={d(pts)} fill="none" stroke={col} strokeWidth={2} strokeDasharray="3 5" opacity={0.45} />
        <path d={d(done)} fill="none" stroke={col} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={route.dash} />
        {stopAt.map(([x, y], i) => {
          const reached = stopKm[i] <= kmNow + 0.01;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={9} fill={reached ? col : paper} stroke={col} strokeWidth={2} />
              <text x={x} y={y + 3.5} textAnchor="middle" className="pointer-events-none font-sans text-[10px] font-bold" style={{ fill: reached ? paper : col }}>
                {i + 1}
              </text>
              <text x={x + 13} y={y + 4} className="map-label pointer-events-none font-sans text-[11px] font-semibold" style={{ fill: ink, opacity: reached ? 1 : 0.55 }}>
                {route.stops[i].name}
              </text>
            </g>
          );
        })}
        {total > 0 && (
          <g transform={'translate(' + cur[0] + ',' + cur[1] + ')'} className="pointer-events-none">
            <circle r={14} fill={col} opacity={0.18} className={playing ? 'map-pulse' : ''} />
            <circle r={6.5} fill={paper} stroke={col} strokeWidth={3} />
          </g>
        )}
      </g>
    );
  })();

  const label = (l: Label, i: number, modern = false) => {
    if (!visible(l)) return null;
    const [x, y] = P(l.at[0], l.at[1]);
    const cls =
      l.kind === 'region'
        ? 'font-display text-[13px] font-semibold tracking-[0.25em]'
        : l.kind === 'sea'
          ? 'font-serif text-[13px] italic tracking-wide'
          : modern
            ? 'font-sans text-[11px] font-semibold uppercase tracking-[0.12em]'
            : 'font-serif text-[12px] italic';
    const fill = modern ? cssColor('--rel-rival', 0.75) : l.kind === 'sea' ? cssColor('--river') : cssColor('--ink-soft', l.kind === 'region' ? 0.75 : 0.9);
    return (
      <text key={(modern ? 'm' : 'a') + i} x={x} y={y} textAnchor="middle" className={`map-label pointer-events-none ${cls}`} style={{ fill }}>
        {l.text}
      </text>
    );
  };

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden" style={{ background: cssColor('--sea') }}>
      <svg
        ref={svgRef}
        width={w}
        height={h}
        className="block cursor-grab touch-none select-none active:cursor-grabbing"
        onClick={() => onSelect(null)}
        role="img"
        aria-label="Map of the Mediterranean and the Ancient Near East"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={ink} />
          </marker>
        </defs>
        <g transform={t.toString()}>
          <path d={base.graticule} fill="none" stroke={cssColor('--coast', 0.18)} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
          <path d={base.land} fill={cssColor('--land')} stroke={cssColor('--coast', 0.9)} strokeWidth={0.9} vectorEffect="non-scaling-stroke" />
          {base.lakes.map((d, i) => (
            <path key={i} d={d} fill={cssColor('--sea')} stroke={cssColor('--coast', 0.7)} strokeWidth={0.7} vectorEffect="non-scaling-stroke" />
          ))}
          {base.rivers.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={cssColor('--river')} strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          ))}
          <path
            d={base.borders}
            fill="none"
            stroke={cssColor('--rel-rival', 0.65)}
            strokeWidth={1}
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
            style={{ opacity: showBorders ? 1 : 0, transition: 'opacity 400ms ease' }}
          />
        </g>

        {/* Labels in screen space so they stay crisp at any zoom */}
        <g>
          {RIVERS.filter((r) => r.name).map((r) => {
            const [x, y] = P(r.label[0], r.label[1]);
            return (
              <text key={r.name} transform={`translate(${x},${y}) rotate(${r.rotate})`} textAnchor="middle" className="map-label pointer-events-none font-serif text-[11px] italic" style={{ fill: cssColor('--river') }}>
                {r.name}
              </text>
            );
          })}
          {ANCIENT.map((l, i) => label(l, i))}
          <g style={{ opacity: showBorders ? 1 : 0, transition: 'opacity 400ms ease' }}>{MODERN.map((l, i) => label(l, i, true))}</g>
        </g>

        <g style={{ opacity: route ? 0.3 : 1, transition: 'opacity 300ms' }}>
          {bookLayer}
          {journeyLayer}
        </g>
        {routeLayer}
      </svg>

      {/* Route player */}
      {route && (
        <RoutePlayer
          route={route}
          prog={prog}
          playing={playing}
          onPlay={() => {
            if (progRef.current >= 1) setProg(0);
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onRestart={() => {
            setProg(0);
            setPlaying(true);
          }}
          onClose={onCloseRoute}
          playlist={playlist ?? null}
        />
      )}

      {/* Zoom buttons */}
      <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-md border border-rule bg-paper/90 font-sans text-sm shadow-sm backdrop-blur">
        {[
          ['+', 1.6, 'Zoom in'],
          ['−', 1 / 1.6, 'Zoom out'],
        ].map(([s, f, lbl]) => (
          <button
            key={s as string}
            aria-label={lbl as string}
            onClick={() => svgRef.current && zoomRef.current && select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, f as number)}
            className="focus-ring h-8 w-8 border-b border-rule last:border-0 hover:bg-ink/5"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 hidden rounded bg-paper/80 px-2 py-1 font-sans text-[10px] text-ink-soft backdrop-blur sm:block">
        Drag to pan · scroll or pinch to zoom
      </div>
    </div>
  );
}

let ctx: CanvasRenderingContext2D | null = null;
function textW(s: string) {
  ctx ??= document.createElement('canvas').getContext('2d');
  if (!ctx) return s.length * 6.5;
  ctx.font = '600 11px Inter, system-ui, sans-serif';
  return ctx.measureText(s).width;
}


function RoutePlayer({
  route,
  prog,
  playing,
  onPlay,
  onPause,
  onRestart,
  onClose,
  playlist,
}: {
  playlist: { index: number; total: number; onPrev: () => void; onNext: () => void } | null;
  route: AnimRoute;
  prog: number;
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onClose?: () => void;
}) {
  // Compact one-line player: position in the playlist, title, km so far, small controls.
  const kmNow = Math.round(prog * route.distanceKm);
  const btn = 'focus-ring rounded-full p-1 hover:bg-ink/10 disabled:opacity-30';
  return (
    <div
      className="absolute left-2 top-2 max-w-[calc(100%-3.5rem)] overflow-hidden rounded-2xl border border-rule bg-paper/95 font-sans shadow-md backdrop-blur sm:max-w-[22rem]"
    >
      <div className="flex items-center gap-1.5 py-1 pl-3 pr-1">
        {playlist && (
          <span className="shrink-0 text-[10px] font-semibold tabular-nums text-ink-soft">
            {playlist.index + 1}/{playlist.total}
          </span>
        )}
        <span className="line-clamp-2 min-w-0 flex-1 text-[12px] font-semibold leading-tight">{route.title}</span>
        {route.distanceKm > 0 && (
          <span className="shrink-0 text-[10px] tabular-nums text-ink-soft" aria-live="off">
            {kmNow.toLocaleString('en-US')} km
          </span>
        )}
        {playlist && (
          <button className={btn} onClick={playlist.onPrev} disabled={playlist.index === 0} aria-label="Previous journey">
            <SkipBack size={12} />
          </button>
        )}
        {route.distanceKm > 0 &&
          (playing ? (
            <button className={btn} onClick={onPause} aria-label="Pause">
              <Pause size={13} />
            </button>
          ) : (
            <button className={btn} onClick={prog >= 1 && !playlist ? onRestart : onPlay} aria-label={prog >= 1 ? 'Replay' : 'Play'}>
              {prog >= 1 && !playlist ? <RotateCcw size={12} /> : <Play size={13} />}
            </button>
          ))}
        {playlist && (
          <button className={btn} onClick={playlist.onNext} disabled={playlist.index >= playlist.total - 1} aria-label="Next journey">
            <SkipForward size={12} />
          </button>
        )}
        {onClose && (
          <button className={btn} onClick={onClose} aria-label="Close journey">
            <X size={13} />
          </button>
        )}
      </div>
      <div className="h-[3px] bg-ink/10">
        <div className="h-full" style={{ width: prog * 100 + '%', background: cssColor(route.css) }} />
      </div>
    </div>
  );
}
