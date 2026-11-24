import { ArrowRight, Lightbulb } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import { RefText } from '../ScriptureRef';

/**
 * Church history told simply, as a short path of steps. Each step links to the tab that goes deeper,
 * so the detailed pages are scaffolded by this overview.
 */
interface Step {
  era: string;
  year: string;
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
    year: '30',
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
    year: '325',
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
    year: '1054',
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
    year: '1517',
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
    year: 'Today',
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
    year: '',
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

export function StartHere({ go }: { go: (tab: string) => void }) {
  return (
    <section aria-labelledby="start-title" className="space-y-6">
      <div>
        <h2 id="start-title" className="font-display text-3xl font-semibold">
          Church history, simply told
        </h2>
        <p className="max-w-3xl font-serif text-[16px] leading-relaxed text-ink-soft">
          Two thousand years in six short steps. Read from top to bottom; each step ends with a link to the page that explores it in
          more depth, and every page ends with a button to the next one.
        </p>
      </div>

      {/* The path at a glance */}
      <div className="rounded-md border border-rule bg-paper/80 px-4 py-4">
        <ol className="relative grid grid-cols-6 gap-1">
          <span aria-hidden className="absolute left-[8%] right-[8%] top-[13px] h-0.5 bg-ink/15" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex flex-col items-center text-center">
              <a
                href={`#step-${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(`step-${i + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="focus-ring flex h-7 w-7 items-center justify-center rounded-full font-sans text-[12px] font-bold text-paper ring-4 ring-paper"
                style={{ background: cssColor(s.css) }}
              >
                {i + 1}
              </a>
              <span className="mt-1 font-sans text-[11px] font-semibold tabular-nums">{s.year}</span>
              <span className="hidden font-sans text-[11px] leading-tight text-ink-soft sm:block">{s.title}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 border-t border-rule pt-3">
          <div className="eyebrow mb-1.5">The Christian family today (2.18 billion, 2010)</div>
          <div className="flex h-6 overflow-hidden rounded-full ring-1 ring-rule">
            {FAMILIES.map((f) => (
              <div key={f.name} className="flex items-center justify-center font-sans text-[11px] font-semibold text-paper" style={{ width: `${f.pct}%`, background: cssColor(f.css) }}>
                {f.name} {f.pct}%
              </div>
            ))}
          </div>
          <p className="mt-1 font-sans text-[10.5px] text-ink-soft">Pew Research Center; the remaining 1% belong to other groups.</p>
        </div>
      </div>

      {/* The steps */}
      <ol className="relative space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} id={`step-${i + 1}`} className="relative scroll-mt-32 sm:pl-12">
            <span
              aria-hidden
              className="absolute left-0 top-1 hidden h-9 w-9 items-center justify-center rounded-full font-display text-lg font-bold text-paper sm:flex"
              style={{ background: cssColor(s.css) }}
            >
              {i + 1}
            </span>
            {i < STEPS.length - 1 && <span aria-hidden className="absolute bottom-[-1rem] left-[17px] top-11 hidden w-0.5 bg-ink/10 sm:block" />}
            <article className="rounded-md border border-rule bg-paper/90 px-4 py-4" style={{ boxShadow: `inset 3px 0 0 ${cssColor(s.css)}` }}>
              <div className="eyebrow">
                <span className="sm:hidden">Step {i + 1} · </span>
                {s.era}
              </div>
              <h3 className="mt-0.5 font-display text-2xl font-semibold leading-tight">{s.title}</h3>
              <div className="mt-2 space-y-2 font-serif text-[16px] leading-relaxed">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <p className="mt-3 flex gap-2 rounded-md px-3 py-2 font-sans text-[13.5px] leading-snug" style={{ background: cssColor(s.css, 0.08) }}>
                <Lightbulb size={16} className="mt-0.5 shrink-0" style={{ color: cssColor(s.css) }} aria-hidden />
                <span>
                  <b>Key idea:</b> {s.idea}
                </span>
              </p>
              {s.words && (
                <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[12.5px]">
                  {s.words.map((x) => (
                    <div key={x.w}>
                      <dt className="inline font-semibold">{x.w}:</dt> <dd className="inline text-ink-soft">{x.d}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {s.refs?.map((r) => (
                  <span key={r} className="rounded-full border border-rule px-2 py-0.5 font-sans text-[12px]">
                    <RefText text={r} />
                  </span>
                ))}
                <span className="ml-auto flex flex-wrap gap-2">
                  {s.next.map((n) => (
                    <button
                      key={n.tab}
                      onClick={() => go(n.tab)}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-[13px] font-semibold text-paper"
                      style={{ background: cssColor(s.css) }}
                    >
                      {n.label} <ArrowRight size={14} aria-hidden />
                    </button>
                  ))}
                </span>
              </div>
            </article>
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
    </section>
  );
}
