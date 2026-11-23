import { useEffect, useRef, useState } from 'react';
import { Check, Minus, Plus, Sparkles } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import { BRANCH_CSS, type Branch, branchMeta, branches, branchesInTreeOrder } from '../../lib/history';

// Piecewise time scale: the early centuries are compressed so the many modern branches have room.
const KNOTS: [number, number][] = [
  [30, 0],
  [500, 0.16],
  [1000, 0.27],
  [1500, 0.42],
  [1650, 0.6],
  [1800, 0.73],
  [2030, 1],
];
const xFrac = (year: number) => {
  for (let i = 1; i < KNOTS.length; i++) {
    const [y0, f0] = KNOTS[i - 1];
    const [y1, f1] = KNOTS[i];
    if (year <= y1) return f0 + ((year - y0) / (y1 - y0)) * (f1 - f0);
  }
  return 1;
};
const TICKS = [30, 325, 451, 1054, 1517, 1609, 1739, 1906, 2025];
const COUNCILS = [
  { year: 325, label: 'Nicaea' },
  { year: 381, label: 'Constantinople' },
  { year: 431, label: 'Ephesus' },
  { year: 451, label: 'Chalcedon' },
];

const ROW = 40;
const PAD_L = 16;
const PAD_R = 24;
const TOP = 56;

function BranchCard({ b, onPick }: { b: Branch; onPick: (id: string) => void }) {
  const parent = branches.find((x) => x.id === b.parentId);
  const children = branches.filter((x) => x.parentId === b.id);
  const col = cssColor(BRANCH_CSS[b.id] ?? '--ink');
  return (
    <div className="rounded-md border border-rule bg-paper/90 shadow-sm">
      <div className="border-b border-rule px-4 py-3" style={{ boxShadow: `inset 4px 0 0 ${col}` }}>
        <div className="eyebrow">{b.year < 100 ? `c. AD ${b.year}` : `AD ${b.year}`}{parent ? ` · branched from ${parent.name}` : ''}</div>
        <h3 className="font-display text-2xl font-semibold leading-tight">{b.name}</h3>
        <p className="mt-1 font-serif text-[15px] leading-snug">{b.keyEvent}</p>
        <div className="mt-2 flex flex-wrap gap-1.5 font-sans text-[11px]">
          {b.keyFigures.map((f) => (
            <span key={f} className="rounded-full border border-rule px-2 py-0.5">
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-0 sm:grid-cols-2">
        <div className="border-b border-rule px-4 py-3 sm:border-b-0 sm:border-r">
          <h4 className="eyebrow mb-1.5 flex items-center gap-1.5">
            <Check size={12} aria-hidden /> Shared with all Christians
          </h4>
          <ul className="space-y-1 font-sans text-[13px]">
            {b.sharedEssentials.map((s) => (
              <li key={s} className="flex gap-1.5">
                <span aria-hidden style={{ color: cssColor('--rel-mentor') }}>
                  ✓
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="px-4 py-3">
          <h4 className="eyebrow mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} aria-hidden /> Distinctive emphases
          </h4>
          <ul className="space-y-1 font-sans text-[13px]">
            {b.distinctives.map((s) => (
              <li key={s} className="flex gap-1.5">
                <span aria-hidden style={{ color: col }}>
                  •
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {children.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-rule px-4 py-2 font-sans text-[12px] text-ink-soft">
          Gave rise to:
          {children.map((c) => (
            <button key={c.id} onClick={() => onPick(c.id)} className="focus-ring rounded-full border border-rule px-2 py-0.5 text-ink hover:border-ink/60">
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FamilyTree() {
  const [sel, setSel] = useState('early');
  const [zoom, setZoom] = useState(1);
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(980);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxW(Math.max(760, el.clientWidth - 2)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const width = boxW * zoom;
  const inner = width - PAD_L - PAD_R;
  const X = (y: number) => PAD_L + xFrac(y) * inner;
  const rows = branchesInTreeOrder;
  const rowY = Object.fromEntries(rows.map((b, i) => [b.id, TOP + i * ROW]));
  const height = TOP + rows.length * ROW + 10;
  const selected = branches.find((b) => b.id === sel)!;

  return (
    <section aria-labelledby="tree-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="tree-title" className="font-display text-3xl font-semibold">
            The family tree of the church
          </h2>
          <p className="max-w-2xl font-serif text-[15px] text-ink-soft">
            Major schisms and reformations from Pentecost to today. Click a branch to see what it shares with all Christians and what is
            distinctive to it.
          </p>
        </div>
        <div className="hidden items-center gap-1.5 font-sans text-xs md:flex">
          <span className="text-ink-soft">Zoom</span>
          <button onClick={() => setZoom((z) => Math.max(1, z - 0.5))} disabled={zoom === 1} aria-label="Zoom out" className="focus-ring rounded-full border border-rule p-1 disabled:opacity-30">
            <Minus size={13} />
          </button>
          <button onClick={() => setZoom((z) => Math.min(2.5, z + 0.5))} disabled={zoom >= 2.5} aria-label="Zoom in" className="focus-ring rounded-full border border-rule p-1 disabled:opacity-30">
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Desktop: branching timeline */}
      <div ref={boxRef} className="panel hidden overflow-x-auto md:block">
        <svg width={width} height={height} className="block" role="img" aria-label="Branching timeline of Christian traditions">
          {/* time axis */}
          {TICKS.map((t) => (
            <g key={t}>
              <line x1={X(t)} x2={X(t)} y1={34} y2={height} stroke={cssColor('--rule', 0.5)} strokeDasharray="2 4" />
              <text x={X(t)} y={24} textAnchor="middle" className="fill-ink-soft font-sans text-[11px] tabular-nums">
                {t === 30 ? 'AD 30' : t}
              </text>
            </g>
          ))}
          {/* councils on the early-church line */}
          {COUNCILS.map((c) => (
            <g key={c.year} transform={`translate(${X(c.year)},${rowY.early + 18})`}>
              <path d="M0,-4 L4,0 L0,4 L-4,0 Z" fill={cssColor('--ink')} />
              <title>{`Council of ${c.label} (${c.year})`}</title>
            </g>
          ))}
          {/* connectors from parent line to child start */}
          {rows
            .filter((b) => b.parentId)
            .map((b) => {
              const x = X(b.year);
              const y0 = rowY[b.parentId!] + 18;
              const y1 = rowY[b.id] + 18;
              return (
                <path
                  key={`c-${b.id}`}
                  d={`M${x},${y0} C${x},${(y0 + y1) / 2} ${x},${(y0 + y1) / 2} ${x + 10},${y1}`}
                  fill="none"
                  stroke={cssColor(BRANCH_CSS[b.id] ?? '--ink', 0.7)}
                  strokeWidth={1.5}
                />
              );
            })}
          {/* branch lines */}
          {rows.map((b) => {
            const y = rowY[b.id] + 18;
            const x0 = X(b.year);
            const col = cssColor(BRANCH_CSS[b.id] ?? '--ink');
            const active = sel === b.id;
            const ends = b.id === 'early' ? X(1054) : width - PAD_R;
            const nearEnd = ends - x0 < 260;
            return (
              <g key={b.id} className="cursor-pointer" onClick={() => setSel(b.id)} role="button" tabIndex={0} aria-label={`${b.name}, from ${b.year}`} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSel(b.id)}>
                <rect x={x0 - 6} y={y - 20} width={ends - x0 + 12} height={30} fill="transparent" />
                <line x1={x0} x2={ends} y1={y} y2={y} stroke={col} strokeWidth={active ? 7 : 4} strokeLinecap="round" opacity={active ? 1 : 0.8} />
                <circle cx={x0} cy={y} r={active ? 7 : 5.5} fill={col} stroke={cssColor('--paper')} strokeWidth={2} />
                <text x={nearEnd ? x0 - 10 : x0 + 10} y={nearEnd ? y + 4 : y - 8} textAnchor={nearEnd ? 'end' : 'start'} className="map-label fill-ink font-sans text-[12px] font-semibold">
                  {b.name}
                  <tspan className="fill-ink-soft font-normal"> · {b.year}</tspan>
                </text>
              </g>
            );
          })}
          <text x={X(1054) - 4} y={rowY.early + 34} textAnchor="end" className="fill-ink-soft font-sans text-[10px] italic">
            East–West Schism, 1054
          </text>
        </svg>
      </div>

      {/* Phones: indented list */}
      <ol className="space-y-1 md:hidden">
        {rows.map((b) => (
          <li key={b.id} style={{ paddingLeft: b.depth * 14 }}>
            <button
              onClick={() => setSel(b.id)}
              className={`focus-ring flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left ${sel === b.id ? 'border-ink bg-paper shadow-sm' : 'border-rule'}`}
            >
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: cssColor(BRANCH_CSS[b.id] ?? '--ink') }} />
              <span className="min-w-0 flex-1 font-display text-[16px] font-semibold">{b.name}</span>
              <span className="font-sans text-xs tabular-nums text-ink-soft">{b.year}</span>
            </button>
            {sel === b.id && (
              <div className="mt-2">
                <BranchCard b={b} onPick={setSel} />
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="hidden md:block">
        <BranchCard b={selected} onPick={setSel} />
      </div>
      <p className="font-sans text-[11px] text-ink-soft">{branchMeta.note}</p>
    </section>
  );
}
