import { Fragment, useState } from 'react';
import { ChevronDown, ChevronRight, HeartHandshake, History, Info, Lightbulb, X } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import { type Topic, commonGround, familyMembers, familyOverview, topics, traditionFamilies, traditions, traditionsMeta } from '../../lib/history';
import { RefText } from '../ScriptureRef';
import { Fold } from '../sections';
import { DetailSheet } from '../DetailSheet';
import { AtLevel } from '../LevelSwitch';
import { useLevel } from '../../lib/level';

// ── Units: what is compared. Either the four families (Protestant shown as the range of its
//    branches) or all eight traditions one by one. ──
interface Unit {
  id: string;
  name: string;
  short: string;
  css: string;
  members: string[];
}
type Level = 'families' | 'all';
const unitsFor = (level: Level): Unit[] =>
  level === 'families' ? traditionFamilies : traditions.map((t) => ({ id: t.id, name: t.name, short: t.short, css: t.css, members: [t.id] }));
const tradById = (id: string) => traditions.find((t) => t.id === id)!;

/** Where a unit stands on a question: a point, or a range for a family of several branches. */
function placeOf(t: Topic, u: Unit) {
  const vs = u.members.map((m) => t.positions[m].v);
  const lo = Math.min(...vs);
  const hi = Math.max(...vs);
  return { lo, hi, mid: (lo + hi) / 2, text: u.members.length > 1 ? t.protestantSummary : t.positions[u.members[0]].text };
}

type Verdict = 'same' | 'close' | 'different';
const VERDICT: Record<Verdict, { label: string; css: string }> = {
  same: { label: 'Agree', css: '--rel-mentor' },
  close: { label: 'Close', css: '--role-king' },
  different: { label: 'Differ', css: '--rel-rival' },
};
/** Distance between two points or ranges; a wide range never fully "agrees". */
const verdictOf = (t: Topic, a: Unit, b: Unit): Verdict => {
  const p = placeOf(t, a);
  const q = placeOf(t, b);
  const gap = Math.max(0, p.lo - q.hi, q.lo - p.hi);
  const spread = Math.max(p.hi - p.lo, q.hi - q.lo);
  if (gap === 0 && spread === 0) return 'same';
  if (gap === 0 && spread <= 1) return 'close';
  return gap <= 1 ? 'close' : 'different';
};

function VerdictBadge({ v }: { v: Verdict }) {
  const { label, css } = VERDICT[v];
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[12px] font-semibold" style={{ background: cssColor(css, 0.14), color: cssColor(css) }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cssColor(css) }} />
      {label}
    </span>
  );
}

const pct = (v: number) => `${(v / 4) * 100}%`;

/** A small track with a dot, or a band when the unit is a range. */
function MiniTrack({ lo, hi, css }: { lo: number; hi: number; css: string }) {
  return (
    <span className="relative block h-3 w-full">
      <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/10" />
      {hi > lo && <span className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full" style={{ left: pct(lo), width: `calc(${pct(hi)} - ${pct(lo)})`, background: cssColor(css, 0.35) }} />}
      <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper" style={{ left: pct(lo), background: cssColor(css) }} />
      {hi > lo && <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper" style={{ left: pct(hi), background: cssColor(css) }} />}
    </span>
  );
}

// ── At a glance: one line per question, both answers labelled ──
function Glance({ units, onTopic, focus }: { units: Unit[]; onTopic: (id: string) => void; focus: string[] }) {
  const pair = focus.length === 2 ? (focus.map((f) => units.find((u) => u.id === f)!) as [Unit, Unit]) : null;
  return (
    <div className="panel overflow-hidden">
      <div className="grid lg:grid-cols-2">
        {topics.map((tp, i) => {
          const seen = new Map<number, number>();
          const verdict = pair ? verdictOf(tp, pair[0], pair[1]) : null;
          return (
            <button
              key={tp.id}
              onClick={() => onTopic(tp.id)}
              className="focus-ring group block w-full border-b border-rule px-4 pb-2.5 pt-2.5 text-left hover:bg-ink/[0.03] lg:[&:nth-child(odd)]:border-r"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-sans text-[13px] font-semibold">
                  <span className="mr-1.5 tabular-nums text-ink-soft">{i + 1}</span>
                  {tp.question}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {verdict && <VerdictBadge v={verdict} />}
                  <ChevronRight size={15} className="text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </span>
              <span className="relative mx-1.5 mt-3 block h-5">
                <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/10" />
                {units.map((u) => {
                  const p = placeOf(tp, u);
                  const strong = focus.includes(u.id);
                  const faded = focus.length > 0 && !strong;
                  const n = seen.get(p.lo) ?? 0;
                  seen.set(p.lo, n + 1);
                  const dy = n === 0 ? 0 : (n % 2 ? -1 : 1) * Math.ceil(n / 2) * 5;
                  const size = strong ? 13 : 10;
                  const common = { opacity: faded ? 0.25 : 1, zIndex: strong ? 2 : 1, transition: 'all 300ms' } as const;
                  if (p.hi > p.lo) {
                    // a family that spans a range: a band from its nearest to its farthest branch
                    return (
                      <span
                        key={u.id}
                        title={`${u.short}: ${p.text}`}
                        className="absolute top-1/2 rounded-full ring-2 ring-paper"
                        style={{ ...common, left: pct(p.lo), width: `calc(${pct(p.hi)} - ${pct(p.lo)})`, height: size - 2, transform: `translateY(calc(-50% + ${dy}px))`, background: cssColor(u.css, strong ? 0.85 : 0.6) }}
                      />
                    );
                  }
                  return (
                    <span
                      key={u.id}
                      title={`${u.short}: ${p.text}`}
                      className="absolute top-1/2 rounded-full ring-2 ring-paper"
                      style={{ ...common, left: pct(p.lo), width: size, height: size, transform: `translate(-50%, calc(-50% + ${dy}px))`, background: cssColor(u.css) }}
                    />
                  );
                })}
              </span>
              <span className="mt-1 flex justify-between gap-4 font-sans text-[12px] leading-tight text-ink-soft">
                <span>← {tp.leftShort}</span>
                <span className="text-right">{tp.rightShort} →</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── One question in full (in the side panel) ──
function TopicDetail({ topic, units, focus }: { topic: Topic; units: Unit[]; focus: string[] }) {
  const sorted = [...units].sort((a, b) => placeOf(topic, a).mid - placeOf(topic, b).mid);
  const pair = focus.length === 2 ? (focus.map((f) => units.find((u) => u.id === f)!) as [Unit, Unit]) : null;
  return (
    <div className="space-y-5">
      <header>
        <div className="eyebrow">{topic.name}</div>
        <h3 className="mt-0.5 font-display text-3xl font-semibold leading-tight">{topic.question}</h3>
        {pair && (
          <div className="mt-2 flex flex-wrap items-center gap-2 font-sans text-[12.5px]">
            <b style={{ color: cssColor(pair[0].css) }}>{pair[0].short}</b> and <b style={{ color: cssColor(pair[1].css) }}>{pair[1].short}</b>:
            <VerdictBadge v={verdictOf(topic, pair[0], pair[1])} />
          </div>
        )}
      </header>

      <section>
        <h4 className="eyebrow mb-1 flex items-center gap-1.5">
          <Lightbulb size={12} aria-hidden /> Why it matters
        </h4>
        <p className="font-serif text-[16px] leading-relaxed">{topic.why}</p>
      </section>
      <section>
        <h4 className="eyebrow mb-1 flex items-center gap-1.5">
          <History size={12} aria-hidden /> How the disagreement arose
        </h4>
        <p className="font-serif text-[16px] leading-relaxed">{topic.history}</p>
      </section>

      <section>
        <h4 className="eyebrow mb-1.5">Where they stand</h4>
        <div className="mb-1 flex justify-between gap-6 font-sans text-[12px] font-semibold leading-tight text-ink-soft">
          <span className="max-w-[45%]">← {topic.left}</span>
          <span className="max-w-[45%] text-right">{topic.right} →</span>
        </div>
        <ol className="divide-y divide-rule rounded-md border border-rule">
          {sorted.map((u) => {
            const p = placeOf(topic, u);
            const on = focus.includes(u.id);
            return (
              <li
                key={u.id}
                className={`px-3 py-2.5 ${on ? 'bg-ink/[0.05]' : ''}`}
                style={{ boxShadow: `inset 3px 0 0 ${cssColor(u.css, on ? 1 : 0.6)}`, opacity: focus.length && !on ? 0.65 : 1 }}
              >
                <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
                  <span className="font-sans text-[13px] font-semibold" style={{ color: cssColor(u.css) }}>
                    {u.name}
                  </span>
                  <MiniTrack lo={p.lo} hi={p.hi} css={u.css} />
                </div>
                <p className="mt-1 font-serif text-[14.5px] leading-snug">{p.text}</p>
                {u.members.length > 1 && (
                  <ul className="mt-2 space-y-1.5 border-l-2 pl-3" style={{ borderColor: cssColor(u.css, 0.3) }}>
                    {[...u.members]
                      .sort((a, b) => topic.positions[a].v - topic.positions[b].v)
                      .map((m) => (
                        <li key={m} className="font-sans text-[12.5px] leading-snug">
                          <span className="font-semibold" style={{ color: cssColor(tradById(m).css) }}>
                            {tradById(m).short}:
                          </span>{' '}
                          <span className="text-ink/85">{topic.positions[m].text}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {topic.note && (
        <p className="flex gap-2 rounded-md bg-ink/[0.03] px-3 py-2 font-sans text-[12.5px] leading-snug text-ink-soft">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
          {topic.note}
        </p>
      )}

      <section>
        <h4 className="eyebrow mb-1.5">Key terms</h4>
        <dl className="space-y-1.5">
          {topic.terms.map((d) => (
            <div key={d.term} className="font-sans text-[13.5px] leading-snug">
              <dt className="inline font-semibold">{d.term}: </dt>
              <dd className="inline text-ink/85">{d.def}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h4 className="eyebrow mb-1.5">Passages each side cites</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              [topic.left, topic.leftRefs, '← '],
              [topic.right, topic.rightRefs, '→ '],
            ] as const
          ).map(([pole, refs, arrow]) => (
            <div key={pole}>
              <div className="font-sans text-[12px] leading-snug text-ink-soft">
                {arrow}
                {pole}
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {refs.map((r) => (
                  <span key={r} className="rounded-full border border-rule px-2 py-0.5 font-sans text-[12px]">
                    <RefText text={r} />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Side panel for one question, like the person panel on the Characters timeline. */
function QuestionPanel({ index, units, focus, onStep, onClose }: { index: number; units: Unit[]; focus: string[]; onStep: (d: -1 | 1) => void; onClose: () => void }) {
  const topic = topics[index];
  return (
    <DetailSheet
      label={topic.question}
      backLabel="Back to all questions"
      onClose={onClose}
      title={topic.name}
      position={`Question ${index + 1} of ${topics.length}`}
      onPrev={index > 0 ? () => onStep(-1) : null}
      onNext={index < topics.length - 1 ? () => onStep(1) : null}
      prevLabel="Previous question"
      nextLabel="Next question"
      width="xl"
    >
      <div className="px-5 py-5">
        <TopicDetail topic={topic} units={units} focus={focus} />
      </div>
    </DetailSheet>
  );
}

/** The four families side by side: who they are, then what they teach (tap a teaching row for the full question). */
/** The rows Beginners see: who each family is, and five teachings. */
const BEGINNER_ROWS = new Set(['origins', 'leaders', 'where', 'authority', 'salvation', 'eucharist', 'baptism', 'mary']);

function OverviewTable({ onTopic }: { onTopic: (topicId: string) => void }) {
  const simple = useLevel() === 'beginner';
  const rowsOf = (rows: (typeof familyOverview.groups)[number]['rows']) => (simple ? rows.filter((r) => BEGINNER_ROWS.has(r.id)) : rows);
  return (
    <>
      {/* Wide screens: a table with the families as columns */}
      <div className="panel hidden overflow-hidden md:block">
        <table className="w-full table-fixed border-collapse font-sans text-[12.5px]">
          <colgroup>
            <col className="w-40" />
            {traditionFamilies.map((f) => (
              <col key={f.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="px-3 py-2 text-left align-bottom">
                <span className="eyebrow">Family</span>
              </th>
              {traditionFamilies.map((f) => (
                <th key={f.id} className="px-3 pb-2 pt-3 text-left align-bottom" style={{ boxShadow: `inset 0 3px 0 ${cssColor(f.css)}` }}>
                  <span className="font-display text-[16px] font-semibold leading-tight" style={{ color: cssColor(f.css) }}>
                    {f.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {familyOverview.groups.map((g) => (
              <Fragment key={g.label}>
                <tr>
                  <td colSpan={5} className="eyebrow border-t border-rule bg-ink/[0.04] px-3 py-1.5">
                    {g.label}
                    {g.rows.some((r) => r.topic) && <span className="ml-2 normal-case tracking-normal text-ink-soft">· tap a row for the full story</span>}
                  </td>
                </tr>
                {rowsOf(g.rows).map((r) => {
                  const clickable = !!r.topic;
                  return (
                    <tr
                      key={r.id}
                      onClick={clickable ? () => onTopic(r.topic!) : undefined}
                      className={`border-t border-rule align-top ${clickable ? 'cursor-pointer hover:bg-ink/[0.03]' : ''}`}
                    >
                      <th scope="row" className="px-3 py-2 text-left font-semibold">
                        {clickable ? (
                          // The whole row opens the question for the mouse; this button makes it reachable by keyboard.
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTopic(r.topic!);
                            }}
                            aria-haspopup="dialog"
                            className="focus-ring inline-flex min-h-6 items-center gap-1 rounded-sm text-left underline decoration-rule underline-offset-2 hover:decoration-ink"
                          >
                            {r.label}
                            <ChevronRight size={13} className="text-ink-soft" aria-hidden />
                          </button>
                        ) : (
                          <span>{r.label}</span>
                        )}
                      </th>
                      {traditionFamilies.map((f) => (
                        <td key={f.id} className="px-3 py-2 leading-snug text-ink/85">
                          {r.cells[f.id]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones: one card per row, the four families in a 2 × 2 grid */}
      <div className="space-y-3 md:hidden">
        {familyOverview.groups.map((g) => (
          <div key={g.label} className="space-y-2">
            <div className="eyebrow">{g.label}</div>
            {rowsOf(g.rows).map((r) => {
              const Wrap = r.topic ? 'button' : 'div';
              return (
                <Wrap
                  key={r.id}
                  {...(r.topic ? { onClick: () => onTopic(r.topic!) } : {})}
                  className="focus-ring block w-full rounded-md border border-rule bg-paper/85 px-3 py-2.5 text-left"
                >
                  <span className="flex items-center justify-between font-sans text-[13.5px] font-semibold">
                    {r.label}
                    {r.topic && <ChevronRight size={15} className="text-ink-soft" aria-hidden />}
                  </span>
                  <span className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-2">
                    {traditionFamilies.map((f) => (
                      <span key={f.id} className="block border-l-2 pl-2" style={{ borderColor: cssColor(f.css) }}>
                        <span className="block font-sans text-[12px] font-semibold uppercase tracking-wide" style={{ color: cssColor(f.css) }}>
                          {f.short}
                        </span>
                        <span className="block font-sans text-[12.5px] leading-snug text-ink/85">{r.cells[f.id]}</span>
                      </span>
                    ))}
                  </span>
                </Wrap>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

/** Which of the eight traditions belong to which family. */
function FamilyGroups() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {traditionFamilies.map((f) => {
        const m = familyMembers[f.id];
        return (
          <div key={f.id} className="rounded-md border border-rule bg-paper/85 px-3.5 py-3" style={{ boxShadow: `inset 0 3px 0 ${cssColor(f.css)}` }}>
            <div className="font-display text-lg font-semibold leading-tight" style={{ color: cssColor(f.css) }}>
              {f.name}
            </div>
            <p className="font-sans text-[12px] text-ink-soft">{m.blurb}</p>
            <ul className="mt-2 space-y-1.5">
              {m.members.map((x) => {
                const t = tradById(x.id);
                return (
                  <li key={x.id} className="flex gap-2">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: cssColor(t.css) }} />
                    <span className="font-sans text-[13px] leading-snug">
                      <b>{t.short}</b>
                      <span className="block text-[12px] text-ink-soft">{x.note}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function TraditionsCompare() {
  const [open, setOpen] = useState<number | null>(null);
  const [focus, setFocus] = useState<string[]>([]);
  const [showShared, setShowShared] = useState(false);
  const units = unitsFor('all');

  const toFocus = (id: string) =>
    setFocus((f) => (f.includes(id) ? f.filter((x) => x !== id) : f.length >= 2 ? [f[1], id] : [...f, id]));
  const step = (d: -1 | 1) => setOpen((i) => (i === null ? i : Math.min(topics.length - 1, Math.max(0, i + d))));
  const openTopic = (id: string) => setOpen(topics.findIndex((t) => t.id === id));

  const pair = focus.length === 2 ? (focus.map((f) => units.find((u) => u.id === f)!) as [Unit, Unit]) : null;
  const counts = pair ? (['same', 'close', 'different'] as Verdict[]).map((v) => topics.filter((t) => verdictOf(t, pair[0], pair[1]) === v).length) : null;

  return (
    <div className="space-y-8">
      <div className="space-y-4">

        {/* Shared by all: one quiet line, with the details on request */}
        <div className="rounded-md border border-rule px-3 py-2" style={{ background: cssColor('--rel-mentor', 0.06) }}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[12.5px]">
            <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: cssColor('--rel-mentor') }}>
              <HeartHandshake size={14} aria-hidden /> Shared by all:
            </span>
            <span className="text-ink-soft">the Trinity · Jesus fully God and man · his death and resurrection · grace · the Bible · his return</span>
            <button onClick={() => setShowShared((x) => !x)} aria-expanded={showShared} className="focus-ring ml-auto inline-flex items-center gap-1 rounded-full border border-rule px-2.5 py-0.5 text-[12px] hover:border-ink/50">
              {showShared ? 'Less' : 'More'} <ChevronDown size={13} aria-hidden className={showShared ? 'rotate-180' : ''} />
            </button>
          </div>
          {showShared && (
            <div className="mt-3 grid gap-4 border-t border-rule pt-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <ul className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {commonGround.map((c) => (
                  <li key={c.text} className="flex gap-2 font-serif text-[14.5px] leading-snug">
                    <span aria-hidden style={{ color: cssColor('--rel-mentor') }}>
                      ✓
                    </span>
                    <span>
                      {c.text}{' '}
                      <span className="whitespace-nowrap font-sans text-[12px] text-ink-soft">
                        (<RefText text={c.ref} />)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <div>
                <h3 className="eyebrow mb-2">The world’s Christians · {traditionsMeta.shares.total}</h3>
                <div className="flex h-6 overflow-hidden rounded-full ring-1 ring-rule">
                  {traditionsMeta.shares.parts.map((p) => (
                    <div key={p.id} title={`${p.label}: ${p.pct}%`} className="flex items-center justify-center font-sans text-[12px] font-semibold text-paper" style={{ width: `${p.pct}%`, background: cssColor(p.css) }}>
                      {p.pct >= 10 ? `${p.pct}%` : ''}
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 font-sans text-[12px] text-ink-soft">{traditionsMeta.shares.source}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1. The overview */}
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-semibold">
          <span className="mr-2 text-ink-soft">1</span>At a glance
        </h3>
        <OverviewTable onTopic={openTopic} />
      </div>

      {/* 2. The traditions within the families */}
      <Fold
        id="eight-traditions"
        min="explorer"
        title={
          <>
            <span className="mr-2 text-ink-soft">2</span>Eight traditions in four families
          </>
        }
        summary={`The Protestant family is made up of several traditions that differ among themselves, so the questions below look at each of them separately.`}
      >
        <FamilyGroups />
      </Fold>

      {/* 3. The ten questions, tradition by tradition */}
      <AtLevel min="explorer">
      <div className="space-y-3">
        <div>
          <h3 className="font-display text-2xl font-semibold">
            <span className="mr-2 text-ink-soft">3</span>Ten questions, tradition by tradition
          </h3>
          <p className="max-w-3xl font-sans text-[13px] text-ink-soft">
            Each question is a line between two answers, with all eight traditions placed along it. Tap a question for the full story,
            or pick two traditions to compare them.
          </p>
        </div>

        <div className="rounded-md border border-rule bg-paper/85 px-3 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-sans text-[13px] font-semibold">{pair ? 'Comparing' : focus.length ? 'Pick one more' : 'Pick two to compare'}</span>
            {units.map((u) => {
              const on = focus.includes(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => toFocus(u.id)}
                  aria-pressed={on}
                  className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-[12.5px] font-medium ${on ? 'border-transparent shadow-sm' : 'border-rule hover:border-ink/50'}`}
                  style={on ? { background: cssColor(u.css), color: cssColor('--paper') } : undefined}
                >
                  {!on && <span className="h-2 w-2 rounded-full" style={{ background: cssColor(u.css) }} />}
                  {u.short}
                </button>
              );
            })}
            {focus.length > 0 && (
              <button onClick={() => setFocus([])} className="focus-ring ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[12px] text-ink-soft hover:text-ink">
                <X size={12} aria-hidden /> Clear
              </button>
            )}
          </div>
          {pair && counts && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule pt-3">
              <div className="flex gap-1">
                {topics.map((t, i) => {
                  const v = verdictOf(t, pair[0], pair[1]);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setOpen(i)}
                      title={`${i + 1}. ${t.name}: ${VERDICT[v].label}`}
                      aria-label={`${t.name}: ${VERDICT[v].label}`}
                      className="focus-ring flex h-7 w-7 items-center justify-center rounded-[5px] font-sans text-[12px] font-bold text-paper hover:scale-110 sm:h-8 sm:w-8"
                      style={{ background: cssColor(VERDICT[v].css, 0.9), transition: 'transform 150ms' }}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <p className="font-sans text-[13px]">
                <b style={{ color: cssColor(pair[0].css) }}>{pair[0].short}</b> and <b style={{ color: cssColor(pair[1].css) }}>{pair[1].short}</b> agree on{' '}
                <b>{counts[0]}</b>, are close on <b>{counts[1]}</b> and differ on <b>{counts[2]}</b> of {topics.length} questions.
                <span className="block text-[12px] text-ink-soft">Tap a square to read that question.</span>
              </p>
            </div>
          )}
        </div>

        <Glance units={units} onTopic={openTopic} focus={focus} />
      </div>
      </AtLevel>

      <p className="font-sans text-[12px] text-ink-soft">
        {traditionsMeta.purpose} {traditionsMeta.spectrumNote} Main sources:{' '}
        {traditions.map((t, i) => (
          <span key={t.id}>
            {i > 0 && '; '}
            {t.short}: {t.documents}
          </span>
        ))}
        .
      </p>

      {open !== null && <QuestionPanel index={open} units={units} focus={focus} onStep={step} onClose={() => setOpen(null)} />}
    </div>
  );
}
