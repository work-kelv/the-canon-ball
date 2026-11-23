import type { ReactNode } from 'react';
import { ArrowRight, BookOpenText, Church, Languages, Map as MapIcon, Moon, MousePointerClick, Smartphone, Users } from 'lucide-react';
import { LANGUAGES, books, langColor, languagePercent } from '../lib/books';
import { cssColor } from '../lib/characters';
import { RefText } from './ScriptureRef';

// ── Small illustrations, drawn from (or in the spirit of) each page's own data ──

/** All 66 books as thin bars, each split by the languages it was written in. */
function LanguagesArt() {
  const w = 300 / books.length;
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      {books.map((b, i) => {
        const h = 26 + (b.chapters / 150) * 80;
        let y = 120;
        return (
          <g key={b.order}>
            {LANGUAGES.map((l) => {
              const ph = (languagePercent(b, l) / 100) * h;
              if (!ph) return null;
              y -= ph;
              return <rect key={l} x={i * w + 0.6} y={y} width={w - 1.2} height={ph} fill={langColor(l)} rx={0.8} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

const NET_NODES: [number, number, string][] = [
  [60, 60, '--role-patriarch'], [110, 30, '--role-king'], [118, 82, '--role-prophet'], [170, 55, '--role-key'],
  [210, 25, '--role-apostle'], [225, 88, '--role-priest'], [265, 50, '--role-apostle'], [30, 95, '--role-patriarch'],
  [150, 100, '--role-judge'], [75, 18, '--role-patriarch'], [195, 105, '--role-prophet'], [280, 98, '--role-key'],
];
const NET_EDGES = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [0, 7], [2, 8], [1, 9], [9, 0], [5, 10], [8, 10], [6, 11], [10, 11]];

function CharactersArt() {
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" aria-hidden>
      {NET_EDGES.map(([a, b], i) => (
        <line key={i} x1={NET_NODES[a][0]} y1={NET_NODES[a][1]} x2={NET_NODES[b][0]} y2={NET_NODES[b][1]} stroke={cssColor('--ink', 0.22)} strokeWidth={1.2} />
      ))}
      {NET_NODES.map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r={i === 3 ? 9 : 6} fill={cssColor(c)} stroke={cssColor('--paper')} strokeWidth={2} />
      ))}
    </svg>
  );
}

function MapArt() {
  const stops: [number, number][] = [[52, 92], [96, 60], [150, 74], [196, 40], [250, 58]];
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" aria-hidden>
      <rect width="300" height="120" fill={cssColor('--sea', 0.55)} />
      <path d="M0,120 L0,78 C40,70 60,96 96,84 C130,72 140,98 180,92 C220,86 240,104 300,96 L300,120 Z" fill={cssColor('--land')} stroke={cssColor('--coast')} />
      <path d="M150,0 C160,20 140,30 170,48 C200,62 240,30 300,40 L300,0 Z" fill={cssColor('--land')} stroke={cssColor('--coast')} />
      <path d={`M${stops.map((p) => p.join(',')).join(' L')}`} fill="none" stroke={cssColor('--lineage')} strokeWidth={2.5} strokeDasharray="6 5" className="map-arc" />
      {stops.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={8} fill={cssColor('--lineage')} stroke={cssColor('--paper')} strokeWidth={2} />
          <text x={x} y={y + 3.5} textAnchor="middle" className="font-sans text-[9px] font-bold" fill={cssColor('--paper')}>
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

function HistoryArt() {
  const lines: [number, number, number, string][] = [
    // [start x, y, parent y, colour]
    [20, 20, 20, '--ink'],
    [70, 40, 20, '--aramaic'],
    [130, 60, 20, '--role-priest'],
    [130, 80, 20, '--role-king'],
    [190, 96, 80, '--greek'],
    [205, 108, 80, '--lineage'],
  ];
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" aria-hidden>
      {lines.map(([x, y, py, c], i) => (
        <g key={i}>
          {i > 0 && <path d={`M${x},${py} C${x},${(py + y) / 2} ${x},${(py + y) / 2} ${x + 10},${y}`} fill="none" stroke={cssColor(c, 0.7)} strokeWidth={1.6} />}
          <line x1={x + (i > 0 ? 10 : 0)} y1={y} x2={i === 0 ? 130 : 290} y2={y} stroke={cssColor(c)} strokeWidth={4} strokeLinecap="round" />
          <circle cx={x} cy={y} r={4.5} fill={cssColor(c)} stroke={cssColor('--paper')} strokeWidth={1.5} />
        </g>
      ))}
    </svg>
  );
}

// ── Content ──

interface Feature {
  href: string;
  title: string;
  icon: typeof Languages;
  css: string;
  art: ReactNode;
  blurb: string;
  points: string[];
  tries: { label: string; href: string }[];
}

const FEATURES: Feature[] = [
  {
    href: 'languages.html',
    title: 'Languages',
    icon: Languages,
    css: '--hebrew',
    art: <LanguagesArt />,
    blurb: 'All 66 books by the language they were first written in: Hebrew, Aramaic or Koine Greek.',
    points: ['Grid, chart and breakdown views', 'The Aramaic passages, chapter by chapter', 'Original-language words with their meanings'],
    tries: [{ label: 'Which books contain Aramaic?', href: 'languages.html' }],
  },
  {
    href: 'characters.html',
    title: 'Characters',
    icon: Users,
    css: '--role-king',
    art: <CharactersArt />,
    blurb: '266 people of Scripture on one timeline, with their families, friendships and rivalries.',
    points: ['Timeline by lifetime or by book', 'A network of 441 relationships', 'The line of Jesus, from Adam'],
    tries: [
      { label: 'Meet David', href: 'characters.html?person=david' },
      { label: 'Explore the network', href: 'characters.html#network' },
    ],
  },
  {
    href: 'map.html',
    title: 'Map',
    icon: MapIcon,
    css: '--lineage',
    art: <MapArt />,
    blurb: 'Where each book was written and set, and 129 journeys you can watch unfold on the map.',
    points: ['Every book’s places and journeys', 'Distances stop by stop', 'Abraham, the Exodus, Jesus and Paul'],
    tries: [
      { label: 'Follow Paul’s journeys', href: 'map.html#journeys' },
      { label: 'The journeys in Acts', href: 'map.html#book=44' },
    ],
  },
  {
    href: 'history.html',
    title: 'Church History',
    icon: Church,
    css: '--role-priest',
    art: <HistoryArt />,
    blurb: 'How the church branched, what the creeds confess, and how the Bible reached the world’s languages.',
    points: ['Catholic, Orthodox and Protestant compared', 'The creeds, line by line, with their Scriptures', 'From ancient scrolls to chapter and verse'],
    tries: [
      { label: 'Compare two traditions', href: 'history.html#traditions' },
      { label: 'Who counts as Christian?', href: 'history.html#compare' },
    ],
  },
];

const QUESTIONS: { q: string; href: string; css: string }[] = [
  { q: 'Who were the ancestors of Jesus?', href: 'characters.html?person=jesus', css: '--lineage' },
  { q: 'How far did Paul travel on his journeys?', href: 'map.html#journeys', css: '--lineage' },
  { q: 'Why is part of Daniel in Aramaic?', href: 'languages.html', css: '--aramaic' },
  { q: 'How do Catholics and Baptists differ on baptism?', href: 'history.html#traditions', css: '--role-king' },
  { q: 'Why aren’t Jehovah’s Witnesses counted as Christian?', href: 'history.html#compare', css: '--rel-rival' },
  { q: 'Where did chapter and verse numbers come from?', href: 'history.html#verses', css: '--greek' },
];

const STATS: [string, string][] = [
  ['66', 'books'],
  ['3', 'original languages'],
  ['266', 'people'],
  ['129', 'journeys'],
  ['13', 'church traditions'],
  ['4', 'historic creeds'],
];

export function HomePage() {
  return (
    <main className="space-y-12 pt-8">
      {/* At a glance */}
      <dl className="grid grid-cols-3 gap-y-4 border-y border-rule py-4 sm:grid-cols-6">
        {STATS.map(([n, l]) => (
          <div key={l} className="text-center">
            <dt className="font-display text-3xl font-semibold tabular-nums sm:text-4xl">{n}</dt>
            <dd className="font-sans text-[11.5px] uppercase tracking-[0.12em] text-ink-soft">{l}</dd>
          </div>
        ))}
      </dl>

      {/* The four pages */}
      <section aria-labelledby="explore">
        <h2 id="explore" className="mb-4 font-display text-3xl font-semibold">
          Four ways in
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {FEATURES.map((f) => (
            <article
              key={f.href}
              className="group relative flex flex-col overflow-hidden rounded-md border border-rule bg-paper/85 shadow-sm transition-shadow hover:shadow-md"
              style={{ boxShadow: `inset 0 3px 0 ${cssColor(f.css)}` }}
            >
              <a href={f.href} className="focus-ring block" aria-label={`Open ${f.title}`}>
                <div className="h-32 overflow-hidden border-b border-rule px-4 pt-4 sm:h-36" style={{ background: cssColor(f.css, 0.05) }}>
                  <div className="h-full transition-transform duration-500 group-hover:scale-[1.03]">{f.art}</div>
                </div>
              </a>
              <div className="flex flex-1 flex-col px-5 py-4">
                <h3 className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <f.icon size={20} style={{ color: cssColor(f.css) }} aria-hidden />
                  <a href={f.href} className="focus-ring rounded-sm hover:underline hover:decoration-rule hover:underline-offset-4">
                    {f.title}
                  </a>
                </h3>
                <p className="mt-1 font-serif text-[15.5px] leading-snug">{f.blurb}</p>
                <ul className="mt-2 space-y-0.5 font-sans text-[13px] text-ink-soft">
                  {f.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span aria-hidden style={{ color: cssColor(f.css) }}>
                        •
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  <a
                    href={f.href}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-sans text-[13px] font-semibold text-paper"
                    style={{ background: cssColor(f.css) }}
                  >
                    Open {f.title} <ArrowRight size={14} aria-hidden />
                  </a>
                  {f.tries.map((t) => (
                    <a
                      key={t.href}
                      href={t.href}
                      className="focus-ring rounded-full border border-rule px-3 py-1.5 font-sans text-[12.5px] hover:border-ink/50"
                    >
                      {t.label}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Start with a question */}
      <section aria-labelledby="questions">
        <h2 id="questions" className="mb-1 font-display text-3xl font-semibold">
          Start with a question
        </h2>
        <p className="mb-4 font-serif text-[15px] text-ink-soft">Each one opens the page that answers it.</p>
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {QUESTIONS.map((x) => (
            <li key={x.q}>
              <a
                href={x.href}
                className="focus-ring group flex h-full items-center justify-between gap-3 rounded-md border border-rule bg-paper/80 px-4 py-3 transition-colors hover:border-ink/40"
                style={{ boxShadow: `inset 3px 0 0 ${cssColor(x.css)}` }}
              >
                <span className="font-serif text-[16px] leading-snug">{x.q}</span>
                <ArrowRight size={16} className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section aria-labelledby="how" className="rounded-md border border-rule bg-ink/[0.025] px-5 py-5">
        <h2 id="how" className="mb-3 font-display text-2xl font-semibold">
          Good to know
        </h2>
        <ul className="grid gap-4 font-sans text-[13.5px] leading-snug sm:grid-cols-2 lg:grid-cols-4">
          <li className="flex gap-3">
            <MousePointerClick size={18} className="mt-0.5 shrink-0 text-ink-soft" aria-hidden />
            <span>
              <b>Tap any underlined reference</b> to read it, in the World English Bible or the Berean Standard Bible. Try it:{' '}
              <RefText text="John 3:16" />.
            </span>
          </li>
          <li className="flex gap-3">
            <BookOpenText size={18} className="mt-0.5 shrink-0 text-ink-soft" aria-hidden />
            <span>
              <b>Every page ends with its references</b>: primary texts, open datasets and each group’s own words, never Wikipedia.
            </span>
          </li>
          <li className="flex gap-3">
            <Smartphone size={18} className="mt-0.5 shrink-0 text-ink-soft" aria-hidden />
            <span>
              <b>Made for phones too.</b> The map stays pinned while you scroll, and timelines turn vertical.
            </span>
          </li>
          <li className="flex gap-3">
            <Moon size={18} className="mt-0.5 shrink-0 text-ink-soft" aria-hidden />
            <span>
              <b>Light or dark.</b> Use the moon button at the top of any page.
            </span>
          </li>
        </ul>
      </section>
    </main>
  );
}
