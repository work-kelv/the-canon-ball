import { ArrowRight, Lightbulb } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import { RefText } from '../ScriptureRef';

/**
 * Church history told simply, in five steps, each read in full, with a button to the section that
 * goes deeper.
 */
interface Step {
  era: string;
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
];

const FAMILIES = [
  { name: 'Catholic', pct: 50, css: '--role-king' },
  { name: 'Protestant', pct: 37, css: '--greek' },
  { name: 'Orthodox', pct: 12, css: '--role-priest' },
];

/** One step, read in full: era, title, key idea, the story, simple definitions and passages. */
function StepCard({ s, i, go }: { s: Step; i: number; go: (id: string) => void }) {
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
      <div className="mt-3">
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

export function StartHere({ go }: { go: (tab: string) => void }) {
  return (
    <div className="space-y-6">

      {/* The path at a glance */}
      <div className="rounded-md border border-rule bg-paper/80 px-4 py-4">
        <div>
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
