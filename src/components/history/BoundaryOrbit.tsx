import { useEffect, useMemo, useState } from 'react';
import { CircleCheck, CircleDot, CircleX, ExternalLink, Info, Quote } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import {
  type BoundaryGroup,
  type ChurchFamily,
  type CreedId,
  type CreedSet,
  type CreedStatus,
  type FamilyMember,
  type Status,
  boundaryGroups,
  boundaryNote,
  boundaryTests,
  churchFamilies,
  creedCompare,
  creedLens,
  departure,
  memberCreeds,
  testStatus,
  testText,
} from '../../lib/history';
import { RefText } from '../ScriptureRef';
import { Segmented } from '../characters/controls';
import { ChalcedonExplainer, CREED_CSS, CreedStatusMark, NonCreedalExplainer, STATUS_STYLE, statusLook } from './CreedCompare';

const rad = (d: number) => (d * Math.PI) / 180;

/** Angular extent of each family's wedge (degrees, clockwise from east). */
const SPANS: Record<string, [number, number]> = {
  catholic: [-140, -60],
  'eastern-orthodox': [-60, 10],
  'oriental-orthodox': [10, 65],
  protestant: [65, 220],
};

const STATUS: Record<Status, { label: string; css: string; Icon: typeof CircleCheck }> = {
  affirms: { label: 'Affirms', css: '--rel-mentor', Icon: CircleCheck },
  partial: { label: 'Partly', css: '--role-king', Icon: CircleDot },
  differs: { label: 'Differs', css: '--rel-rival', Icon: CircleX },
};

const RING_LABEL: Record<BoundaryGroup['ring'], string> = {
  inside: 'Within the historic faith',
  outside: 'Differs from the historic creeds',
  other: 'A different religion',
};

type Sel = { kind: 'family'; id: string } | { kind: 'member'; family: string; id: string } | { kind: 'group'; id: string };
const keyOf = (s: Sel) => (s.kind === 'member' ? `m:${s.id}` : `${s.kind[0]}:${s.id}`);

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

/**
 * All drawing geometry, in SVG units. On phones the circle of churches is drawn larger (the drawing
 * shrinks to half size there) and the movements beyond it sit closer in, since their names appear as chips.
 */
function makeGeom(small: boolean) {
  const S = small ? 760 : 720;
  const C = S / 2;
  const CORE_R = small ? 82 : 72;
  const WEDGE_IN = CORE_R + 10;
  const BOUNDARY_R = small ? 232 : 172;
  const OTHER_R = small ? 348 : 318;
  const step = small ? 12 : 21;
  const pt = (r: number, deg: number) => ({ x: C + r * Math.cos(rad(deg)), y: C + r * Math.sin(rad(deg)) });
  const band = BOUNDARY_R - 18 - WEDGE_IN; // room for dots, inside the family label band

  const memberPos: Record<string, { x: number; y: number }> = {};
  for (const f of churchFamilies) {
    const [a0, a1] = SPANS[f.id];
    const core = f.members.filter((m) => !m.edge);
    const edge = f.members.filter((m) => m.edge);
    const end = edge.length ? a1 - 40 : a1;
    const two = core.length > 4;
    core.forEach((m, i) => {
      const a = a0 + ((i + 0.5) / core.length) * (end - a0);
      const r = WEDGE_IN + band * (two ? (i % 2 ? 0.74 : 0.3) : 0.5);
      memberPos[m.id] = pt(r, a);
    });
    edge.forEach((m, i) => {
      memberPos[m.id] = pt(WEDGE_IN + band * 0.55, end + 10 + i * 19);
    });
  }

  const outside = boundaryGroups.filter((g) => g.ring === 'outside');
  const ostep = 360 / outside.length;
  const groupPos: Record<string, { x: number; y: number; a: number }> = {};
  for (const g of boundaryGroups) {
    // other religions sit in the gaps between movements (Judaism at the top, Islam lower right)
    const others = boundaryGroups.filter((x) => x.ring === 'other');
    const a = g.ring === 'other' ? -62 + [7.5, 3.5][others.indexOf(g) % 2] * ostep : -62 + outside.indexOf(g) * ostep;
    const r = g.ring === 'other' ? OTHER_R : BOUNDARY_R + 30 + departure(g) * step;
    groupPos[g.id] = { ...pt(r, a), a };
  }

  const arcPath = (r: number, a0: number, a1: number, reverse = false) => {
    const p0 = pt(r, reverse ? a1 : a0);
    const p1 = pt(r, reverse ? a0 : a1);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M ${p0.x},${p0.y} A ${r},${r} 0 ${large},${reverse ? 0 : 1} ${p1.x},${p1.y}`;
  };
  const wedgePath = (a0: number, a1: number) => {
    const ro = BOUNDARY_R - 2;
    const o0 = pt(ro, a0);
    const o1 = pt(ro, a1);
    const i1 = pt(WEDGE_IN, a1);
    const i0 = pt(WEDGE_IN, a0);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${o0.x},${o0.y} A ${ro},${ro} 0 ${large},1 ${o1.x},${o1.y} L ${i1.x},${i1.y} A ${WEDGE_IN},${WEDGE_IN} 0 ${large},0 ${i0.x},${i0.y} Z`;
  };
  return { S, C, CORE_R, WEDGE_IN, BOUNDARY_R, OTHER_R, step, pt, memberPos, groupPos, arcPath, wedgePath };
}

/** Family names along the outer edge of each wedge; shorter on phones. */
const FAMILY_LABEL: Record<string, [string, string]> = {
  catholic: ['CATHOLIC', 'CATHOLIC'],
  'eastern-orthodox': ['EASTERN ORTHODOX', 'E. ORTHODOX'],
  'oriental-orthodox': ['ORIENTAL ORTHODOX', 'ORIENTAL'],
  protestant: ['PROTESTANT', 'PROTESTANT'],
};

function CreedRow({ creeds, note }: { creeds: CreedSet; note?: string }) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {creedCompare.creeds.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1 rounded-full border border-rule py-0.5 pl-0.5 pr-2 font-sans text-[11.5px]" title={creedLens.statuses[creeds[c.id]].note}>
            <CreedStatusMark s={creeds[c.id]} />
            <span style={{ color: cssColor(CREED_CSS[c.id]) }} className="font-semibold">
              {c.short}
            </span>
          </span>
        ))}
      </div>
      {note && <p className="mt-1 font-sans text-[11.5px] leading-snug text-ink-soft">{note}</p>}
    </div>
  );
}

function CoreBeliefs({ g }: { g: { tests: BoundaryGroup['tests'] } }) {
  return (
    <ul className="space-y-2">
      {boundaryTests.map((t) => {
        const s = testStatus(g as BoundaryGroup, t.id);
        const { label, css, Icon } = STATUS[s];
        const text = testText(g as BoundaryGroup, t.id);
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
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-t border-rule px-4 py-3">
      <h4 className="eyebrow">{title}</h4>
      {children}
    </div>
  );
}

function Header({ badge, badgeCss, name, css, sub, self }: { badge: string; badgeCss: string; name: string; css: string; sub?: string; self?: string }) {
  return (
    <div className="px-4 py-3" style={{ background: `linear-gradient(120deg, ${cssColor(css, 0.16)}, transparent 70%)` }}>
      <span className="rounded-full px-2 py-0.5 font-sans text-[10.5px] font-semibold uppercase tracking-wide" style={{ background: cssColor(badgeCss, 0.14), color: cssColor(badgeCss) }}>
        {badge}
      </span>
      <h3 className="mt-1 font-display text-2xl font-semibold leading-tight" style={{ color: cssColor(css) }}>
        {name}
      </h3>
      {sub && <p className="font-sans text-[12px] text-ink-soft">{sub}</p>}
      {self && (
        <p className="mt-2 flex gap-2 font-serif text-[15px] italic leading-snug">
          <Quote size={14} className="mt-1 shrink-0 opacity-50" aria-hidden />
          {self}
        </p>
      )}
    </div>
  );
}

function Extras({ x }: { x: { affirms?: string; keyTexts?: string[]; source?: string } }) {
  return (
    <>
      {x.affirms && (
        <p className="font-sans text-[12.5px]">
          <span className="font-semibold" style={{ color: cssColor('--rel-mentor') }}>
            Common ground:{' '}
          </span>
          {x.affirms}
        </p>
      )}
      {x.keyTexts && x.keyTexts.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5 font-sans text-[12px]">
          <span className="text-ink-soft">Passages in the debate:</span>
          {x.keyTexts.map((r) => (
            <span key={r} className="rounded-full border border-rule px-2 py-0.5">
              <RefText text={r} />
            </span>
          ))}
        </p>
      )}
      {x.source && (
        <a href={x.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-sans text-[12px] underline decoration-rule underline-offset-2 hover:decoration-ink">
          In their own words: {new URL(x.source).hostname.replace(/^www\./, '')} <ExternalLink size={11} aria-hidden />
        </a>
      )}
    </>
  );
}

function FamilyDetail({ f, onPick }: { f: ChurchFamily; onPick: (s: Sel) => void }) {
  return (
    <div className="overflow-hidden rounded-md border border-rule bg-paper shadow-sm">
      <Header badge="Within the historic faith" badgeCss="--rel-mentor" name={f.name} css={f.css} self={f.self} />
      <Section title="Who they are">
        <p className="font-serif text-[15px] leading-relaxed">{f.about}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {f.members.map((m) => (
            <button key={m.id} onClick={() => onPick({ kind: 'member', family: f.id, id: m.id })} className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-rule py-0.5 pl-0.5 pr-2.5 font-sans text-[12px] hover:border-ink/50">
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] font-bold text-paper" style={{ background: cssColor(f.css) }}>
                {m.abbr}
              </span>
              {m.name}
            </button>
          ))}
        </div>
      </Section>
      <Section title="The creeds">
        <CreedRow creeds={f.creeds} note={f.creedNote} />
        {f.creeds.chalcedon === 'rejects' && <ChalcedonExplainer />}
      </Section>
      <Section title="Where it stands">
        <p className="font-serif text-[15px] leading-relaxed">{f.why}</p>
        <p className="flex items-center gap-1.5 font-sans text-[12.5px]" style={{ color: cssColor('--rel-mentor') }}>
          <CircleCheck size={15} aria-hidden /> Affirms all five core beliefs
        </p>
      </Section>
    </div>
  );
}

function MemberDetail({ f, m, onPick }: { f: ChurchFamily; m: FamilyMember; onPick: (s: Sel) => void }) {
  return (
    <div className="overflow-hidden rounded-md border border-rule bg-paper shadow-sm">
      <Header
        badge={m.edge ? 'Within, with distinctive teachings' : 'Within the historic faith'}
        badgeCss="--rel-mentor"
        name={m.name}
        css={f.css}
        sub={m.origin}
        self={m.self}
      />
      <Section title="Who they are">
        <p className="font-serif text-[15px] leading-relaxed">{m.about}</p>
        {m.examples && (
          <p className="font-sans text-[12.5px]">
            <span className="text-ink-soft">Examples: </span>
            {m.examples}
          </p>
        )}
        <button onClick={() => onPick({ kind: 'family', id: f.id })} className="focus-ring font-sans text-[12.5px] underline decoration-rule underline-offset-2 hover:decoration-ink">
          Part of the {f.name} family →
        </button>
      </Section>
      <Section title="The creeds">
        <CreedRow creeds={memberCreeds(f, m)} note={m.creedNote} />
        {Object.values(memberCreeds(f, m)).includes('content') && <NonCreedalExplainer label="Why doesn’t it recite the creeds?" />}
        {memberCreeds(f, m).chalcedon === 'rejects' && <ChalcedonExplainer label="Why doesn’t it accept Chalcedon?" />}
      </Section>
      {m.tests ? (
        <>
          <Section title="The five core beliefs">
            <CoreBeliefs g={{ tests: m.tests }} />
          </Section>
          <Section title="Where it stands">
            {m.why && <p className="font-serif text-[15px] leading-relaxed">{m.why}</p>}
            <Extras x={m} />
          </Section>
        </>
      ) : (
        <Section title="Core beliefs">
          <p className="flex items-center gap-1.5 font-sans text-[12.5px]" style={{ color: cssColor('--rel-mentor') }}>
            <CircleCheck size={15} aria-hidden /> Shares the {f.name} family’s faith: affirms all five core beliefs
          </p>
        </Section>
      )}
    </div>
  );
}

function GroupDetail({ g }: { g: BoundaryGroup }) {
  return (
    <div className="overflow-hidden rounded-md border border-rule bg-paper shadow-sm">
      <Header
        badge={g.category ?? RING_LABEL[g.ring]}
        badgeCss={g.ring === 'other' ? '--ink-soft' : '--role-king'}
        name={g.name}
        css={g.css}
        sub={g.origin}
        self={g.self}
      />
      <Section title="The five core beliefs">
        <CoreBeliefs g={g} />
      </Section>
      {g.creeds && (
        <Section title="The creeds">
          <CreedRow creeds={g.creeds} />
        </Section>
      )}
      <Section title={g.ring === 'other' ? 'How it relates to Christian faith' : 'How it differs from the historic creeds'}>
        <p className="font-serif text-[15px] leading-relaxed">{g.why}</p>
        <Extras x={g} />
      </Section>
    </div>
  );
}

export function BoundaryOrbit() {
  const [sel, setSel] = useState<Sel>({ kind: 'family', id: 'catholic' });
  const [lens, setLens] = useState<CreedId | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const small = useSmall();
  const k = small ? 1.45 : 1; // larger text and dots on phones, where the drawing shrinks
  const { S, C, CORE_R, BOUNDARY_R, OTHER_R, step, pt, memberPos, groupPos, arcPath, wedgePath } = useMemo(() => makeGeom(small), [small]);
  // One size for every circle, inside the circle of churches and beyond it.
  const DOT = small ? 21 : 15;
  const NODE_R = DOT;
  const selKey = keyOf(sel);

  const famOf = (id: string) => churchFamilies.find((f) => f.id === id)!;
  const selFamily = sel.kind === 'group' ? null : famOf(sel.kind === 'family' ? sel.id : sel.family);
  const selMember = sel.kind === 'member' ? selFamily!.members.find((m) => m.id === sel.id)! : null;
  const selGroup = sel.kind === 'group' ? boundaryGroups.find((g) => g.id === sel.id)! : null;

  // Where the dashed link from the core points
  const target = selGroup ? groupPos[selGroup.id] : selMember ? memberPos[selMember.id] : (() => {
    const [a0, a1] = SPANS[selFamily!.id];
    return pt(126, (a0 + a1) / 2);
  })();
  const linkCss = selGroup ? selGroup.css : selFamily!.css;

  // How a node looks through the creed lens
  const lensStyle = (s: CreedStatus | undefined) => ({ opacity: lens && s ? statusLook(s).opacity : 1 });
  const Badge = ({ s, x, y }: { s?: CreedStatus; x: number; y: number }) => {
    if (!lens || !s) return null;
    const l = statusLook(s);
    return (
      <g transform={`translate(${x},${y})`} aria-hidden>
        <circle r={small ? 10 : 7.5} fill={s === 'content' ? cssColor('--paper') : l.fill === cssColor('--paper') ? cssColor('--paper') : l.fill} stroke={l.stroke} strokeWidth={1.8} strokeDasharray={l.dash} />
        <text textAnchor="middle" y={small ? 4.5 : 3.4} className="font-sans font-bold" style={{ fontSize: small ? 13 : 10 }} fill={s === 'content' || s === 'unused' ? l.stroke : cssColor('--paper')}>
          {STATUS_STYLE[s].mark}
        </text>
      </g>
    );
  };

  return (
    <section aria-labelledby="orbit-title" className="space-y-4">
      <div>
        <h2 id="orbit-title" className="font-display text-3xl font-semibold">
          Core beliefs: where each church stands
        </h2>
        <p className="max-w-3xl font-serif text-[15px] text-ink-soft">
          At the centre is the faith set out in the historic creeds. The four great families of churches that confess it fill the
          circle, each with some of its member churches. Movements whose teaching differs on one or more of five core beliefs sit
          beyond it, farther out the more they differ. Tap anything for details, or turn on a creed to see who confesses it.
        </p>
      </div>
      <p className="flex gap-2 rounded-md border border-rule bg-paper/70 px-3 py-2 font-sans text-[12.5px] leading-snug text-ink-soft">
        <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
        {boundaryNote}
      </p>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="lg:col-start-1 lg:row-start-1">
          {/* Creed lens */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="eyebrow">Show who confesses</span>
            <Segmented<CreedId | null>
              label="Creed lens"
              value={lens}
              onChange={setLens}
              options={[
                { id: null, label: 'Off' },
                ...creedCompare.creeds.map((c) => ({ id: c.id, label: c.short })),
              ]}
            />
          </div>
          {lens && (
            <div className="mb-2 rounded-md border border-rule px-3 py-2 font-sans text-[12.5px] leading-snug" style={{ boxShadow: `inset 3px 0 0 ${cssColor(CREED_CSS[lens])}` }}>
              <p>{creedLens.notes[lens]}</p>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-ink-soft">
                {(Object.keys(STATUS_STYLE) as CreedStatus[]).map((s) => (
                  <span key={s} className="inline-flex items-center gap-1" title={creedLens.statuses[s].note}>
                    <CreedStatusMark s={s} /> {creedLens.statuses[s].label}
                  </span>
                ))}
              </div>
              <div className="mt-2 space-y-2">
                <NonCreedalExplainer label="What does “Holds its teaching” mean?" />
                {lens === 'chalcedon' && <ChalcedonExplainer />}
              </div>
            </div>
          )}

          <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto block w-full max-w-[600px]" role="group" aria-label="Diagram: the families of churches around the faith of the creeds, and other movements beyond it">
            <defs>
              <radialGradient id="core-glow">
                <stop offset="0%" stopColor={cssColor('--role-king', 0.55)} />
                <stop offset="70%" stopColor={cssColor('--role-king', 0.2)} />
                <stop offset="100%" stopColor={cssColor('--role-king', 0)} />
              </radialGradient>
              <path id="faith-path" d={arcPath(BOUNDARY_R + 9 * k, -150, -30)} />
              <path id="other-path" d={arcPath(OTHER_R + 22 * k, 130, 165, true)} />
              {churchFamilies.map((f) => {
                // Labels run along the wedge's outer edge, reading upright on both halves of the circle.
                const [a0, a1] = SPANS[f.id];
                const mid = (a0 + a1) / 2;
                const bottom = mid > 0 && mid < 180;
                const r = bottom ? BOUNDARY_R - 5 : BOUNDARY_R - 14 * k;
                return <path key={f.id} id={`fam-${f.id}`} d={arcPath(r, a0 + 2, a1 - 2, bottom)} />;
              })}
            </defs>

            {/* rings beyond the circle */}
            <circle cx={C} cy={C} r={OTHER_R} fill="none" stroke={cssColor('--ink', 0.1)} strokeDasharray="1 7" strokeLinecap="round" strokeWidth={2} />
            {[0, 1, 2, 3, 4, 5].map((d) => (
              <circle key={d} cx={C} cy={C} r={BOUNDARY_R + 30 + d * step} fill="none" stroke={cssColor('--ink', 0.05)} />
            ))}
            <text className="fill-ink-soft font-sans" style={{ letterSpacing: '0.16em', opacity: 0.7, fontSize: 11 * k }}>
              <textPath href="#other-path" startOffset="50%" textAnchor="middle">
                OTHER RELIGIONS
              </textPath>
            </text>

            {/* family wedges */}
            {churchFamilies.map((f) => {
              const [a0, a1] = SPANS[f.id];
              const whole = sel.kind === 'family' && sel.id === f.id; // the whole family is selected
              const within = sel.kind === 'member' && sel.family === f.id; // one of its churches is
              const fillA = lens ? 0.05 : whole ? 0.34 : within ? 0.18 : sel.kind === 'family' ? 0.06 : 0.1;
              return (
                <g key={f.id} className="cursor-pointer" onClick={() => setSel({ kind: 'family', id: f.id })}>
                  <title>{f.name}</title>
                  <path d={wedgePath(a0, a1)} fill={lens ? cssColor('--ink', fillA) : cssColor(f.css, fillA)} stroke={cssColor('--paper')} strokeWidth={3} style={{ transition: 'fill 250ms' }} />
                  <text className={`pointer-events-none font-sans ${whole ? 'font-bold' : 'font-semibold'}`} style={{ letterSpacing: small ? '0.08em' : '0.12em', fontSize: small ? 15 : 9.5, opacity: sel.kind === 'family' && !whole && !lens ? 0.55 : 1 }} fill={cssColor(f.css)}>
                    <textPath href={`#fam-${f.id}`} startOffset="50%" textAnchor="middle">
                      {FAMILY_LABEL[f.id][small ? 1 : 0]}
                    </textPath>
                  </text>
                </g>
              );
            })}
            {/* Bold outline around the selected family, drawn above the neighbouring wedges */}
            {sel.kind === 'family' && !lens && (
              <path
                d={wedgePath(...SPANS[sel.id])}
                fill="none"
                stroke={cssColor(famOf(sel.id).css)}
                strokeWidth={3.5}
                strokeLinejoin="round"
                className="pointer-events-none"
              />
            )}
            <circle cx={C} cy={C} r={BOUNDARY_R} fill="none" stroke={cssColor('--rel-mentor', 0.75)} strokeWidth={1.5} strokeDasharray="6 5" />
            {/* On phones the outer circles sit close in, so the dashed line is explained by the legend instead. */}
            <text className={`fill-ink-soft font-sans ${small ? 'hidden' : ''}`} style={{ letterSpacing: '0.16em', fontSize: 11 * k }}>
              <textPath href="#faith-path" startOffset="50%" textAnchor="middle">
                THE SHARED FAITH OF THE HISTORIC CREEDS
              </textPath>
            </text>

            {/* link from the core to the selection */}
            <line x1={C} y1={C} x2={target.x} y2={target.y} stroke={cssColor(linkCss, 0.6)} strokeWidth={2} strokeDasharray="4 5" className="orbit-link" />

            {/* core */}
            <circle cx={C} cy={C} r={CORE_R + 26} fill="url(#core-glow)" />
            <circle cx={C} cy={C} r={CORE_R} fill={cssColor('--paper')} stroke={cssColor('--role-king')} strokeWidth={2.5} />
            <text x={C} y={C - 18 * k} textAnchor="middle" className="fill-ink font-sans font-semibold" style={{ letterSpacing: '0.2em', fontSize: 9.5 * k }}>
              THE CORE
            </text>
            <text x={C} y={C + 6} textAnchor="middle" className="fill-ink font-display font-semibold" style={{ fontSize: small ? 25 : 19 }}>
              Nicene faith
            </text>
            <text x={C} y={C + 22 * k} textAnchor="middle" className="fill-ink-soft font-sans" style={{ fontSize: small ? 11.5 : 9.5 }}>
              Trinity · Jesus is God
            </text>
            <text x={C} y={C + 34 * k} textAnchor="middle" className="fill-ink-soft font-sans" style={{ fontSize: small ? 11.5 : 9.5 }}>
              Cross · Scripture · Grace
            </text>

            {/* member churches */}
            {churchFamilies.flatMap((f) =>
              f.members.map((m) => {
                const p = memberPos[m.id];
                const active = selKey === `m:${m.id}`;
                const st = lens ? memberCreeds(f, m)[lens] : undefined;
                return (
                  <g
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${m.name} (${f.name})`}
                    className="cursor-pointer outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSel({ kind: 'member', family: f.id, id: m.id });
                    }}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel({ kind: 'member', family: f.id, id: m.id }))}
                    style={{ ...lensStyle(st), transition: 'opacity 300ms' }}
                  >
                    <title>{m.name}</title>
                    {active && <circle cx={p.x} cy={p.y} r={DOT + 7} fill={cssColor(f.css, 0.22)} className="orbit-pulse" />}
                    {(() => {
                      const look = st ? statusLook(st) : null;
                      const famOn = sel.kind === 'family' && sel.id === f.id;
                      const fill = look ? look.fill : active || famOn ? cssColor(f.css) : cssColor('--paper');
                      const txt = look ? look.text : active || famOn ? cssColor('--paper') : cssColor(f.css);
                      return (
                        <>
                          <circle cx={p.x} cy={p.y} r={DOT} fill={fill} stroke={look ? look.stroke : cssColor(f.css)} strokeWidth={look ? 2.5 : 2} strokeDasharray={look ? look.dash : m.edge ? '3 2' : undefined} />
                          <text x={p.x} y={p.y + (small ? 4.5 : 3.4)} textAnchor="middle" className="pointer-events-none font-sans font-bold" style={{ fontSize: small ? (m.abbr.length > 2 ? 11 : 13) : m.abbr.length > 2 ? 8.5 : 10 }} fill={txt}>
                            {m.abbr}
                          </text>
                        </>
                      );
                    })()}
                    <Badge s={st} x={p.x + DOT * 0.78} y={p.y - DOT * 0.78} />
                  </g>
                );
              }),
            )}

            {/* movements beyond the circle */}
            {boundaryGroups.map((g) => {
              const q = groupPos[g.id];
              const active = selKey === `g:${g.id}`;
              const hot = active || hover === g.id;
              const col = cssColor(g.css);
              const below = Math.sin(rad(q.a)) > -0.35 || q.y < 70;
              const st = lens ? g.creeds?.[lens] : undefined;
              const initials = g.id === 'christadelphians' ? 'Cd' : g.name.split(/[\s-]+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('');
              return (
                <g
                  key={g.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${g.name}: ${g.category ?? RING_LABEL[g.ring]}`}
                  className="cursor-pointer outline-none"
                  onClick={() => setSel({ kind: 'group', id: g.id })}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel({ kind: 'group', id: g.id }))}
                  onMouseEnter={() => setHover(g.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{ ...lensStyle(st), transition: 'opacity 300ms' }}
                >
                  <title>{g.name}</title>
                  <g transform={`translate(${q.x},${q.y})`}>
                    {active && <circle r={NODE_R + 9} fill={cssColor(g.css, 0.18)} className="orbit-pulse" />}
                    <circle
                      r={hot ? NODE_R + 2 : NODE_R}
                      fill={st ? statusLook(st).fill : active ? col : cssColor('--paper')}
                      stroke={st ? statusLook(st).stroke : col}
                      strokeWidth={st ? 2.5 : 2}
                      strokeDasharray={st ? statusLook(st).dash : g.ring === 'other' ? '3 3' : undefined}
                    />
                    <text textAnchor="middle" y={small ? 4.5 : 3.6} className="pointer-events-none font-sans font-bold" style={{ fontSize: small ? 13 : 10.5 }} fill={st ? statusLook(st).text : active ? cssColor('--paper') : col}>
                      {initials}
                    </text>
                    {!small && (
                      <text textAnchor="middle" y={below ? NODE_R + 16 : -NODE_R - 24} className={`map-label pointer-events-none font-sans text-[13px] ${active ? 'font-bold' : 'font-semibold'}`} fill={cssColor('--ink')}>
                        {g.name}
                      </text>
                    )}
                    {!lens &&
                      boundaryTests.map((t, i) => (
                        <circle
                          key={t.id}
                          cx={(i - 2) * 10 * k}
                          cy={small ? NODE_R + 9 * k : below ? NODE_R + 28 : -NODE_R - 9}
                          r={3.6 * k}
                          fill={cssColor(STATUS[testStatus(g, t.id)].css)}
                          stroke={cssColor('--paper')}
                          strokeWidth={1}
                          aria-hidden
                        />
                      ))}
                    <Badge s={st} x={NODE_R * 0.75} y={-NODE_R * 0.75} />
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Phones: names as tappable chips */}
          <div className="mt-2 space-y-2 sm:hidden">
            {[
              { label: 'Families of churches', items: churchFamilies.map((f) => ({ sel: { kind: 'family', id: f.id } as Sel, name: f.name, css: f.css })) },
              { label: 'Beyond the circle', items: boundaryGroups.map((g) => ({ sel: { kind: 'group', id: g.id } as Sel, name: g.name, css: g.css })) },
            ].map((row) => (
              <div key={row.label}>
                <div className="eyebrow mb-1">{row.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {row.items.map((it) => {
                    const on = keyOf(it.sel) === selKey || (it.sel.kind === 'family' && sel.kind === 'member' && sel.family === it.sel.id);
                    return (
                      <button
                        key={keyOf(it.sel)}
                        onClick={() => setSel(it.sel)}
                        aria-pressed={on}
                        className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-[12px] font-medium ${on ? 'border-transparent text-paper' : 'border-rule'}`}
                        style={on ? { background: cssColor(it.css) } : undefined}
                      >
                        {!on && <span className="h-2 w-2 rounded-full" style={{ background: cssColor(it.css) }} />}
                        {it.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-16 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {selGroup ? (
            <GroupDetail g={selGroup} />
          ) : selMember ? (
            <MemberDetail f={selFamily!} m={selMember} onPick={setSel} />
          ) : (
            <FamilyDetail f={selFamily!} onPick={setSel} />
          )}
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 font-sans text-[11.5px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex gap-0.5">
                {(['affirms', 'partial', 'differs'] as Status[]).map((s) => (
                  <span key={s} className="h-2 w-2 rounded-full" style={{ background: cssColor(STATUS[s].css) }} />
                ))}
              </span>
              Five beads = five core beliefs: affirmed · partly · not affirmed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border-[1.5px] border-dashed" style={{ borderColor: cssColor('--ink-soft') }} />
              dashed circle: the shared faith of the historic creeds · dashed dot: distinctive teachings, or another religion
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
