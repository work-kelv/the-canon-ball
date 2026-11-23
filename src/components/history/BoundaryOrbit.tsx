import { useEffect, useState } from 'react';
import { CircleCheck, CircleDot, CircleX, ExternalLink, Info, Quote } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import {
  type BoundaryGroup,
  type Status,
  boundaryGroups,
  boundaryNote,
  boundaryTests,
  departure,
  testStatus,
  testText,
} from '../../lib/history';
import { RefText } from '../ScriptureRef';

const S = 720; // viewBox size
const C = S / 2;
const CORE_R = 84;
const INSIDE_R = 128;
const BOUNDARY_R = 168;
const OTHER_R = 312;

/** On a phone the 720-unit diagram shrinks to about half size, so text and circles are drawn larger there. */
function useSmall() {
  const q = '(max-width: 639px)';
  const [small, setSmall] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setSmall(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return small;
}

const STATUS: Record<Status, { label: string; css: string; Icon: typeof CircleCheck }> = {
  affirms: { label: 'Affirms', css: '--rel-mentor', Icon: CircleCheck },
  partial: { label: 'Partly', css: '--role-king', Icon: CircleDot },
  differs: { label: 'Differs', css: '--rel-rival', Icon: CircleX },
};

const RING_LABEL: Record<BoundaryGroup['ring'], string> = {
  inside: 'Within historic Christianity',
  outside: 'Outside the creeds’ boundary',
  other: 'A different religion',
};

const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

/** Node positions: inside groups on the inner ring; the rest farther out the more core beliefs they depart from. */
const layout = (() => {
  const inside = boundaryGroups.filter((g) => g.ring === 'inside');
  const outer = boundaryGroups.filter((g) => g.ring !== 'inside');
  const pos: Record<string, { x: number; y: number; r: number; a: number }> = {};
  inside.forEach((g, i) => {
    const a = (-90 + i * (360 / inside.length)) * (Math.PI / 180);
    pos[g.id] = { x: C + INSIDE_R * Math.cos(a), y: C + INSIDE_R * Math.sin(a), r: INSIDE_R, a };
  });
  outer.forEach((g, i) => {
    const a = (-62 + i * (360 / outer.length)) * (Math.PI / 180);
    const r = g.ring === 'other' ? OTHER_R : BOUNDARY_R + 26 + departure(g) * 21;
    pos[g.id] = { x: C + r * Math.cos(a), y: C + r * Math.sin(a), r, a };
  });
  return pos;
})();

function Beads({ g, x, y, k }: { g: BoundaryGroup; x: number; y: number; k: number }) {
  return (
    <g aria-hidden>
      {boundaryTests.map((t, i) => (
        <circle
          key={t.id}
          cx={x + (i - 2) * 10 * k}
          cy={y}
          r={3.6 * k}
          fill={cssColor(STATUS[testStatus(g, t.id)].css)}
          stroke={cssColor('--paper')}
          strokeWidth={1}
        />
      ))}
    </g>
  );
}

function Detail({ g }: { g: BoundaryGroup }) {
  const col = cssColor(g.css);
  return (
    <div className="overflow-hidden rounded-md border border-rule bg-paper shadow-sm">
      <div className="px-4 py-3" style={{ background: `linear-gradient(120deg, ${cssColor(g.css, 0.16)}, transparent 70%)` }}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 font-sans text-[10.5px] font-semibold uppercase tracking-wide"
            style={{
              background: cssColor(g.ring === 'inside' ? '--rel-mentor' : g.ring === 'other' ? '--ink-soft' : '--rel-rival', 0.14),
              color: cssColor(g.ring === 'inside' ? '--rel-mentor' : g.ring === 'other' ? '--ink-soft' : '--rel-rival'),
            }}
          >
            {RING_LABEL[g.ring]}
          </span>
        </div>
        <h3 className="mt-1 font-display text-2xl font-semibold leading-tight" style={{ color: col }}>
          {g.name}
        </h3>
        <p className="font-sans text-[12px] text-ink-soft">{g.origin}</p>
        <p className="mt-2 flex gap-2 font-serif text-[15px] italic leading-snug">
          <Quote size={14} className="mt-1 shrink-0 opacity-50" aria-hidden />
          {g.self}
        </p>
      </div>

      <div className="border-t border-rule px-4 py-3">
        <h4 className="eyebrow mb-2">The five core beliefs</h4>
        <ul className="space-y-2">
          {boundaryTests.map((t) => {
            const s = testStatus(g, t.id);
            const { label, css, Icon } = STATUS[s];
            const text = testText(g, t.id);
            return (
              <li key={t.id} className="grid grid-cols-[1.25rem_1fr] gap-x-2">
                <Icon size={17} className="mt-0.5" style={{ color: cssColor(css) }} aria-label={label} />
                <div>
                  <div className="font-sans text-[13px] font-semibold">
                    {t.label}{' '}
                    <span className="font-normal" style={{ color: cssColor(css) }}>
                      · {label}
                    </span>
                  </div>
                  {text && <p className="font-serif text-[14px] leading-snug text-ink/85">{text}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-2 border-t border-rule px-4 py-3">
        <h4 className="eyebrow">{g.ring === 'inside' ? 'Where it stands' : 'Why the historic churches draw the line here'}</h4>
        <p className="font-serif text-[15px] leading-relaxed">{g.why}</p>
        {g.affirms && (
          <p className="font-sans text-[12.5px]">
            <span className="font-semibold" style={{ color: cssColor('--rel-mentor') }}>
              Common ground:{' '}
            </span>
            {g.affirms}
          </p>
        )}
        {g.keyTexts && g.keyTexts.length > 0 && (
          <p className="flex flex-wrap items-center gap-1.5 font-sans text-[12px]">
            <span className="text-ink-soft">Passages in the debate:</span>
            {g.keyTexts.map((r) => (
              <span key={r} className="rounded-full border border-rule px-2 py-0.5">
                <RefText text={r} />
              </span>
            ))}
          </p>
        )}
        {g.source && (
          <a
            href={g.source}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-sans text-[12px] underline decoration-rule underline-offset-2 hover:decoration-ink"
          >
            In their own words: {new URL(g.source).hostname.replace(/^www\./, '')} <ExternalLink size={11} aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}

export function BoundaryOrbit() {
  const [sel, setSel] = useState('jw');
  const [hover, setHover] = useState<string | null>(null);
  const small = useSmall();
  const k = small ? 1.5 : 1; // drawing scale for text and circles
  const NODE_R = 21 * (small ? 1.3 : 1);
  const g = boundaryGroups.find((x) => x.id === sel)!;
  const p = layout[sel];

  return (
    <section aria-labelledby="orbit-title" className="space-y-4">
      <div>
        <h2 id="orbit-title" className="font-display text-3xl font-semibold">
          Inside and outside: who counts as Christian?
        </h2>
        <p className="max-w-3xl font-serif text-[15px] text-ink-soft">
          At the centre is the faith of the historic creeds. The churches inside the dashed circle all confess it. Movements outside
          sit farther out the more of its five core beliefs they set aside. Tap any circle to see why.
        </p>
      </div>
      <p className="flex gap-2 rounded-md border border-rule bg-paper/70 px-3 py-2 font-sans text-[12.5px] leading-snug text-ink-soft">
        <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
        {boundaryNote}
      </p>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="lg:col-start-1 lg:row-start-1">
          <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto block w-full max-w-[600px]" role="group" aria-label="Diagram: Christian traditions and other movements around the core beliefs of the creeds">
            <defs>
              <radialGradient id="core-glow">
                <stop offset="0%" stopColor={cssColor('--role-king', 0.55)} />
                <stop offset="70%" stopColor={cssColor('--role-king', 0.22)} />
                <stop offset="100%" stopColor={cssColor('--role-king', 0)} />
              </radialGradient>
              <radialGradient id="inside-wash">
                <stop offset="0%" stopColor={cssColor('--rel-mentor', 0.1)} />
                <stop offset="100%" stopColor={cssColor('--rel-mentor', 0.03)} />
              </radialGradient>
              <path id="boundary-path" d={`M ${C - BOUNDARY_R - 16 * k},${C} a ${BOUNDARY_R + 16 * k},${BOUNDARY_R + 16 * k} 0 0,0 ${2 * (BOUNDARY_R + 16 * k)},0`} />
              <path id="other-path" d={`M ${C - OTHER_R - 30},${C} a ${OTHER_R + 30},${OTHER_R + 30} 0 1,1 ${2 * (OTHER_R + 30)},0`} />
            </defs>

            {/* rings */}
            <circle cx={C} cy={C} r={OTHER_R} fill="none" stroke={cssColor('--ink', 0.1)} strokeDasharray="1 7" strokeLinecap="round" strokeWidth={2} />
            {[0, 1, 2, 3, 4, 5].map((d) => (
              <circle key={d} cx={C} cy={C} r={BOUNDARY_R + 26 + d * 21} fill="none" stroke={cssColor('--ink', 0.05)} />
            ))}
            <circle cx={C} cy={C} r={BOUNDARY_R} fill="url(#inside-wash)" stroke={cssColor('--rel-mentor', 0.7)} strokeWidth={1.5} strokeDasharray="6 5" />
            <text className="fill-ink-soft font-sans" style={{ letterSpacing: '0.18em', fontSize: 12 * k }}>
              <textPath href="#boundary-path" startOffset="50%" textAnchor="middle">
                BOUNDARY OF THE HISTORIC CREEDS
              </textPath>
            </text>
            <text className="fill-ink-soft font-sans" style={{ letterSpacing: '0.16em', opacity: 0.7, fontSize: 11 * k }}>
              <textPath href="#other-path" startOffset="50%" textAnchor="middle">
                OTHER RELIGIONS
              </textPath>
            </text>

            {/* line from the core to the selected group */}
            <line
              x1={C}
              y1={C}
              x2={p.x}
              y2={p.y}
              stroke={cssColor(g.css, 0.6)}
              strokeWidth={2}
              strokeDasharray="4 5"
              className="orbit-link"
              style={{ transition: 'all 500ms ease' }}
            />

            {/* core */}
            <circle cx={C} cy={C} r={CORE_R + 30} fill="url(#core-glow)" />
            <circle cx={C} cy={C} r={CORE_R} fill={cssColor('--paper')} stroke={cssColor('--role-king')} strokeWidth={2.5} />
            <text x={C} y={C - 22 * k} textAnchor="middle" className="fill-ink font-sans font-semibold" style={{ letterSpacing: '0.2em', fontSize: 10 * k }}>
              THE CORE
            </text>
            <text x={C} y={C + 6} textAnchor="middle" className="fill-ink font-display font-semibold" style={{ fontSize: small ? 27 : 21 }}>
              Nicene faith
            </text>
            <text x={C} y={C + 24 * k} textAnchor="middle" className="fill-ink-soft font-sans" style={{ fontSize: small ? 12.5 : 10 }}>
              Trinity · Jesus is God
            </text>
            <text x={C} y={C + 38 * k} textAnchor="middle" className="fill-ink-soft font-sans" style={{ fontSize: small ? 12.5 : 10 }}>
              Cross · Scripture · Grace
            </text>

            {/* groups */}
            {boundaryGroups.map((x) => {
              const q = layout[x.id];
              const active = sel === x.id;
              const hot = active || hover === x.id;
              const col = cssColor(x.css);
              const below = Math.sin(q.a) > -0.35; // label under the node unless it sits near the top
              return (
                <g
                  key={x.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  aria-label={`${x.name}: ${RING_LABEL[x.ring]}`}
                  className="cursor-pointer outline-none"
                  onClick={() => setSel(x.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel(x.id))}
                  onMouseEnter={() => setHover(x.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{ transform: `translate(${q.x}px, ${q.y}px)` }}
                >
                  {active && <circle r={NODE_R + 9} fill={cssColor(x.css, 0.18)} className="orbit-pulse" />}
                  <circle
                    r={hot ? NODE_R + 2 : NODE_R}
                    fill={active ? col : cssColor('--paper')}
                    stroke={col}
                    strokeWidth={x.ring === 'inside' ? 3 : 2.5}
                    strokeDasharray={x.ring === 'other' ? '3 3' : undefined}
                    style={{ transition: 'r 150ms' }}
                  />
                  <text textAnchor="middle" y={5 * k} className="pointer-events-none font-sans font-bold" style={{ fontSize: 13 * k }} fill={active ? cssColor('--paper') : col}>
                    {initials(x.name)}
                  </text>
                  {!small && <text
                    textAnchor="middle"
                    y={below ? NODE_R + 16 : -NODE_R - (x.ring === 'inside' ? 8 : 20)}
                    className={`map-label pointer-events-none font-sans text-[13px] ${active ? 'font-bold' : 'font-semibold'}`}
                    fill={cssColor('--ink')}
                  >
                    {x.name}
                  </text>}
                  {x.ring !== 'inside' && (
                    <Beads g={x} x={0} k={k} y={small ? NODE_R + 9 * k : below ? NODE_R + 28 : -NODE_R - 8} />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Phones: the names, as tappable chips */}
          <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:hidden">
            {boundaryGroups.map((x) => (
              <button
                key={x.id}
                onClick={() => setSel(x.id)}
                aria-pressed={sel === x.id}
                className={`focus-ring inline-flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2.5 font-sans text-[12px] font-medium ${
                  sel === x.id ? 'border-transparent text-paper' : 'border-rule'
                }`}
                style={sel === x.id ? { background: cssColor(x.css) } : undefined}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                  style={{ background: sel === x.id ? cssColor('--paper', 0.25) : cssColor(x.css, 0.15), color: sel === x.id ? undefined : cssColor(x.css) }}
                >
                  {initials(x.name)}
                </span>
                {x.name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-16 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Detail g={g} />
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          {/* key */}
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 font-sans text-[11.5px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex gap-0.5">
                {(['affirms', 'partial', 'differs'] as Status[]).map((s) => (
                  <span key={s} className="h-2 w-2 rounded-full" style={{ background: cssColor(STATUS[s].css) }} />
                ))}
              </span>
              Five beads = five core beliefs: affirmed · partly · denied
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border-[1.5px] border-dashed" style={{ borderColor: cssColor('--rel-mentor') }} />
              boundary of the creeds
            </span>
          </div>
          <ol className="mt-3 grid gap-1.5 font-sans text-[12px] sm:grid-cols-2">
            {boundaryTests.map((t, i) => (
              <li key={t.id} className="flex gap-2 rounded-md border border-rule bg-paper/70 px-2.5 py-1.5">
                <span className="font-semibold tabular-nums text-ink-soft">{i + 1}</span>
                <span>
                  <b>{t.label}</b>: <i className="text-ink-soft">“{t.creed}”</i>{' '}
                  <span className="whitespace-nowrap">
                    (<RefText text={t.ref} />)
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </section>
  );
}
