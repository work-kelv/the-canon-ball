import { useCallback, useState } from 'react';
import { ArrowRight, ChevronDown, Lightbulb } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import { RefText } from '../ScriptureRef';
import { useOpenTarget } from '../sections';

/**
 * Church history told simply, as a short path of steps. Each step shows its era, title and key idea;
 * the rest opens on request, and a button jumps to the section that goes deeper.
 */
interface Step {
  era: string;
  /** When it happened, for the chart at the top: [from, to] (AD). */
  span: [number, number];
  title: string;
  css: string;
  body: string[];
  idea: string;
  words?: { w: string; d: string }[];
  refs?: string[];
  next: { tab: string; label: string }[];
}

const STEPS: Step[] = [
  {
    era: 'AD 30 – 300',
    span: [30, 313],
    title: 'One church, many cities',
    css: '--ink',
    body: [
      'After Jesus rose and the Holy Spirit came at Pentecost, the apostles took the gospel across the Roman Empire. Churches sprang up in Jerusalem, Antioch, Rome, Alexandria and beyond.',
      'For almost three centuries Christians were a small, often persecuted minority. Each city’s church was led by a bishop, and together they saw themselves as one church.',
    ],
    idea: 'At the start there were no denominations: just one church spread over many cities.',
    refs: ['Acts 2:41–42', 'Acts 11:26'],
    next: [
      { tab: 'people', label: 'Meet the people, from Jesus onwards' },
      { tab: 'tree', label: 'See where the family tree begins' },
    ],
  },
  {
    era: '313 – 451',
    span: [313, 451],
    title: 'Agreeing on what we believe',
    css: '--role-king',
    body: [
      'In 313 the emperor Constantine ended the persecution. Debates that had been simmering came into the open, above all: is Jesus truly God, or a created being?',
      'Bishops from across the empire met in councils to settle these questions. They wrote short summaries of the faith, called creeds. The Nicene Creed (325, expanded 381) is still said in churches all over the world.',
    ],
    idea: 'A creed is a short summary of the Bible’s central teaching: who God is, and what Jesus has done.',
    words: [
      { w: 'Council', d: 'a meeting of bishops to settle a question of faith' },
      { w: 'Creed', d: 'from Latin credo, “I believe”: a summary of the faith' },
      { w: 'Trinity', d: 'one God in three persons: Father, Son and Holy Spirit' },
    ],
    refs: ['Matthew 28:19', 'John 1:1'],
    next: [{ tab: 'creeds', label: 'Compare the four creeds' }],
  },
  {
    era: '431 – 1054',
    span: [431, 1054],
    title: 'The first splits',
    css: '--role-priest',
    body: [
      'Not everyone accepted every council. After 431 the Church of the East in Persia went its own way, and after 451 so did the churches of Egypt, Ethiopia and Armenia (today’s Oriental Orthodox), over how to describe Christ as both God and man.',
      'In 1054 the Greek-speaking East and the Latin-speaking West separated, over the Pope’s authority and the words “and the Son” added to the creed in the West. They became the Eastern Orthodox and the Roman Catholic churches.',
    ],
    idea: 'The great East–West split was as much about authority and culture as about doctrine.',
    words: [
      { w: 'Schism', d: 'a split in the church' },
      { w: 'Orthodox', d: '“right belief” or “right worship”' },
      { w: 'Catholic', d: '“universal”: the whole church' },
    ],
    next: [{ tab: 'tree', label: 'Follow the splits on the family tree' }],
  },
  {
    era: '1517 onwards',
    span: [1517, 2025],
    title: 'The Reformation',
    css: '--greek',
    body: [
      'In 1517 a German monk, Martin Luther, challenged the sale of indulgences. He taught that we are made right with God by grace, through faith in Christ, and that the Bible is the final authority.',
      'Those who followed (Lutherans, Reformed, Anglicans, and later Baptists, Methodists, Pentecostals and many more) are called Protestants. Because each reads the Bible for itself, they formed many denominations.',
    ],
    idea: 'Protestant denominations differ in worship and church order, but share the same core faith.',
    words: [
      { w: 'Indulgence', d: 'a release from punishment for sin, which Luther said was being sold' },
      { w: 'Denomination', d: 'a named family of churches, such as Baptist or Methodist' },
    ],
    refs: ['Ephesians 2:8–9', 'Romans 1:17'],
    next: [{ tab: 'tree', label: 'See the Protestant branches' }],
  },
  {
    era: 'Today',
    span: [1950, 2025],
    title: 'Different churches, one core faith',
    css: '--rel-mentor',
    body: [
      'Today there are four great families of churches: Catholic, Eastern Orthodox, Oriental Orthodox and Protestant. They still differ on questions like the Lord’s Supper, baptism, Mary and church leadership.',
      'But they share the core: one God in three persons; Jesus, fully God and fully man; his death for our sins and his resurrection; salvation by God’s grace. Some newer movements that call themselves Christian differ on these core beliefs.',
    ],
    idea: 'The differences between churches are real, but they sit on top of a faith they all share.',
    next: [
      { tab: 'traditions', label: 'Compare the four families' },
      { tab: 'compare', label: 'See who shares the core' },
    ],
  },
  {
    era: 'Along the way',
    span: [30, 2025],
    title: 'Who’s who',
    css: '--role-patriarch',
    body: [
      'Each tradition developed its own leaders and titles: popes and patriarchs, bishops and priests, pastors, elders and deacons. Many of these words come straight from the Greek of the New Testament.',
    ],
    idea: '“Bishop” means overseer, “elder” means elder, and “deacon” means servant.',
    refs: ['1 Timothy 3:1–8'],
    next: [{ tab: 'titles', label: 'Learn the titles' }],
  },
];

const FAMILIES = [
  { name: 'Catholic', pct: 50, css: '--role-king' },
  { name: 'Protestant', pct: 37, css: '--greek' },
  { name: 'Orthodox', pct: 12, css: '--role-priest' },
];

/** One step: era, title and key idea always visible; the body, words and passages on request. */
function StepCard({ s, i, go }: { s: Step; i: number; go: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const bodyId = `step-${i + 1}-body`;
  useOpenTarget([`step-${i + 1}`], useCallback(() => setOpen(true), []));
  return (
    <article className="rounded-md border border-rule bg-paper/90 px-4 py-4" style={{ boxShadow: `inset 3px 0 0 ${cssColor(s.css)}` }}>
      <div className="eyebrow">
        <span className="sm:hidden">Step {i + 1} · </span>
        {s.era}
      </div>
      <h3 className="mt-0.5 font-display text-2xl font-semibold leading-tight">{s.title}</h3>
      <p className="mt-2 flex gap-2 rounded-md px-3 py-2 font-sans text-[14px] leading-snug" style={{ background: cssColor(s.css, 0.08) }}>
        <Lightbulb size={16} className="mt-0.5 shrink-0" style={{ color: cssColor(s.css) }} aria-hidden />
        <span>
          <b>Key idea:</b> {s.idea}
        </span>
      </p>
      <div id={bodyId} hidden={!open} className="mt-3">
        <div className="space-y-2 font-serif text-[16px] leading-relaxed">
          {s.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {s.words && (
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[13px]">
            {s.words.map((x) => (
              <div key={x.w}>
                <dt className="inline font-semibold">{x.w}:</dt> <dd className="inline text-ink-soft">{x.d}</dd>
              </div>
            ))}
          </dl>
        )}
        {s.refs && (
          <div className="mt-3 flex flex-wrap gap-2">
            {s.refs.map((r) => (
              <span key={r} className="inline-flex min-h-7 items-center rounded-full border border-rule px-2.5 font-sans text-[13px]">
                <RefText text={r} />
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="focus-ring inline-flex min-h-8 items-center gap-1.5 rounded-full border border-rule px-3.5 font-sans text-[13px] font-medium hover:border-ink/50"
        >
          {open ? 'Show less' : 'Read this step'}
          <ChevronDown size={14} aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <span className="ml-auto flex flex-wrap gap-2">
          {s.next.map((n) => (
            <button
              key={n.tab}
              onClick={() => go(n.tab)}
              className="focus-ring inline-flex min-h-8 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-[13px] font-semibold text-paper"
              style={{ background: cssColor(s.css) }}
            >
              {n.label} <ArrowRight size={14} aria-hidden />
            </button>
          ))}
        </span>
      </div>
    </article>
  );
}

/** The milestones marked across the chart. */
const MARKS = [
  { y: 325, label: 'Nicaea', row: 0 },
  { y: 451, label: 'Chalcedon', row: 1 },
  { y: 1054, label: 'East–West split', row: 0 },
  { y: 1517, label: 'Luther', row: 1 },
];
const AXIS_FROM = 0,
  AXIS_TO = 2025;
const ax = (y: number) => ((y - AXIS_FROM) / (AXIS_TO - AXIS_FROM)) * 100;

/**
 * Two thousand years at a glance: each step as a bar on one real time scale, so the reader sees
 * how long each period lasted, where they overlap, and the gap of the Middle Ages. Tap a step to
 * jump to it and open it.
 */
function CourseTimeline({ go }: { go: (id: string) => void }) {
  // Phones: each title above a full-width bar; wider screens: titles in a column beside the bars.
  const grid = 'grid grid-cols-1 gap-x-3 sm:grid-cols-[14rem_1fr]';
  return (
    <div>
      <h3 className="eyebrow mb-2">Two thousand years at a glance · tap a step</h3>
      {/* milestones above the bars */}
      <div className={`${grid} hidden sm:grid`}>
        <span />
        <div className="relative h-10 font-sans text-[12px] leading-none text-ink-soft">
          {MARKS.map((m) => (
            <span
              key={m.y}
              className={`absolute whitespace-nowrap ${ax(m.y) > 70 ? '-translate-x-full pr-1 text-right' : 'pl-1'}`}
              style={{ left: `${ax(m.y)}%`, top: m.row * 18 }}
            >
              {m.label} <span className="tabular-nums opacity-75">{m.y}</span>
            </span>
          ))}
        </div>
      </div>
      <ol className="relative">
        {STEPS.map((s, i) => {
          const [y0, y1] = s.span;
          const l = ax(y0),
            w = Math.max(ax(y1) - l, 1.5);
          const along = s.era === 'Along the way';
          return (
            <li key={s.title}>
              <button
                onClick={() => go(`step-${i + 1}`)}
                aria-label={`Step ${i + 1}: ${s.title}, ${s.era}`}
                className={`focus-ring group ${grid} min-h-10 w-full items-center gap-y-1 rounded-md py-1 text-left hover:bg-ink/[0.04]`}
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-sans text-[12px] font-bold text-paper" style={{ background: cssColor(s.css) }}>
                    {i + 1}
                  </span>
                  <span className="min-w-0 font-sans text-[13px] font-semibold leading-tight group-hover:underline">{s.title}</span>
                </span>
                <span className="relative block h-6">
                  {/* the milestones, continued down through the bars */}
                  {MARKS.map((m) => (
                    <span key={m.y} aria-hidden className="absolute inset-y-[-4px] border-l border-dashed border-ink/20" style={{ left: `${ax(m.y)}%` }} />
                  ))}
                  {along ? (
                    <span className="absolute top-1/2 h-0 -translate-y-1/2 border-t-2 border-dashed" style={{ left: `${l}%`, width: `${w}%`, borderColor: cssColor(s.css, 0.7) }} />
                  ) : (
                    <span
                      className="absolute top-1/2 h-3.5 -translate-y-1/2 rounded-full"
                      style={{
                        left: `${l}%`,
                        width: `${w}%`,
                        background: y1 >= 2025 && y0 < 1900 ? `linear-gradient(90deg, ${cssColor(s.css)} 30%, ${cssColor(s.css, 0.25)})` : cssColor(s.css),
                      }}
                    />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {/* the scale */}
      <div className={grid}>
        <span className="hidden sm:block" />
        <div className="relative h-5 border-t border-rule font-sans text-[12px] tabular-nums text-ink-soft">
          {[30, 500, 1000, 1500, 2000].map((t, i) => (
            <span key={t} className={`absolute top-1 -translate-x-1/2 whitespace-nowrap ${i % 2 && t !== 1000 ? 'hidden sm:block' : ''}`} style={{ left: `${ax(t)}%` }}>
              {t === 30 ? 'AD 30' : t}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-2 font-sans text-[12.5px] leading-snug text-ink-soft sm:hidden">
        Dashed lines: {MARKS.map((m) => `${m.label} ${m.y}`).join(' · ')}.
      </p>
      <p className="mt-2 font-sans text-[12.5px] leading-snug text-ink-soft">
        The empty stretch between 1054 and 1517 is the Middle Ages, when the Catholic West and the Orthodox East went their
        separate ways. The dashed line is step 6: titles and offices that grew up all along the way.
      </p>
    </div>
  );
}

export function StartHere({ go }: { go: (tab: string) => void }) {
  return (
    <div className="space-y-6">

      {/* The path at a glance */}
      <div className="rounded-md border border-rule bg-paper/80 px-4 py-4">
        <CourseTimeline go={go} />
        <div className="mt-4 border-t border-rule pt-3">
          <div className="eyebrow mb-1.5">The Christian family today (2.18 billion, 2010)</div>
          <div className="flex h-6 overflow-hidden rounded-full ring-1 ring-rule">
            {FAMILIES.map((f) => (
              <div key={f.name} className="flex items-center justify-center font-sans text-[12px] font-semibold text-paper" style={{ width: `${f.pct}%`, background: cssColor(f.css) }}>
                <span className={f.pct >= 30 ? '' : 'hidden sm:inline'}>{f.name}&nbsp;</span>
                {f.pct}%
              </div>
            ))}
          </div>
          <p className="mt-1 font-sans text-[12px] text-ink-soft">
            <span className="sm:hidden">{FAMILIES.map((f) => `${f.name} ${f.pct}%`).join(' · ')}. </span>
            Pew Research Center; the remaining 1% belong to other groups.
          </p>
        </div>
      </div>

      {/* The steps */}
      <ol className="relative space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} id={`step-${i + 1}`} className="section-anchor relative sm:pl-12">
            <span
              aria-hidden
              className="absolute left-0 top-1 hidden h-9 w-9 items-center justify-center rounded-full font-display text-lg font-bold text-paper sm:flex"
              style={{ background: cssColor(s.css) }}
            >
              {i + 1}
            </span>
            {i < STEPS.length - 1 && <span aria-hidden className="absolute bottom-[-1rem] left-[17px] top-11 hidden w-0.5 bg-ink/10 sm:block" />}
            <StepCard s={s} i={i} go={go} />
          </li>
        ))}
      </ol>

      {/* The thread through it all */}
      <aside className="rounded-md px-4 py-4" style={{ background: cssColor('--lineage', 0.06), boxShadow: `inset 3px 0 0 ${cssColor('--lineage')}` }}>
        <h3 className="font-display text-xl font-semibold">Looking to Jesus</h3>
        <p className="mt-1 max-w-3xl font-serif text-[16px] leading-relaxed">
          These are weighty matters, and Christians have disagreed about them for centuries. Through all of it, the churches confess the
          same Lord: Jesus Christ, crucified and risen. As you explore the traditions, keep him at the centre. The creeds, the councils
          and the great teachers matter because they point to him.
        </p>
        <p className="mt-2 font-sans text-[13px] text-ink-soft">
          <RefText text="Hebrews 12:2; Colossians 1:18" />
        </p>
        <button
          onClick={() => go('people')}
          className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-[13px] font-semibold text-paper"
          style={{ background: cssColor('--lineage') }}
        >
          From Jesus to today: the key people <ArrowRight size={14} aria-hidden />
        </button>
      </aside>
    </div>
  );
}
