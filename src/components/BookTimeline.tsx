import { useState } from 'react';
import type { BibleBook } from '../types';
import { books, formatYear, langColor } from '../lib/books';

/**
 * When each book was written: one bar per book, from the earliest to the latest date scholars give.
 * The Old and New Testaments get their own scales (about 1,300 years against about 80), with Jesus
 * between them, so both can be read.
 */

interface Scale {
  from: number;
  to: number;
  ticks: number[];
  /** row: which line of labels; right: label ends at the line instead of starting there. */
  marks: { y: number; label: string; row: number; right?: boolean; minor?: boolean }[];
}

const OT: Scale = {
  from: -1500,
  to: -150,
  ticks: [-1500, -1250, -1000, -750, -500, -250],
  marks: [
    { y: -1446, label: 'Exodus (traditional)', row: 0, minor: true },
    { y: -1010, label: 'King David', row: 0 },
    { y: -722, label: 'Fall of Samaria', row: 2, minor: true },
    { y: -586, label: 'Jerusalem falls', row: 1, right: true },
    { y: -538, label: 'Return from exile', row: 0, minor: true },
    { y: -332, label: 'Alexander the Great', row: 2, right: true, minor: true },
  ],
};

const NT: Scale = {
  from: 30,
  to: 130,
  ticks: [40, 60, 80, 100, 120],
  marks: [
    { y: 30, label: 'Jesus’ death and resurrection', row: 0 },
    { y: 48, label: 'Paul’s first letters', row: 2, minor: true },
    { y: 70, label: 'Temple destroyed', row: 1 },
  ],
};

const pct = (s: Scale, y: number) => ((Math.min(Math.max(y, s.from), s.to) - s.from) / (s.to - s.from)) * 100;

function barStyle(b: BibleBook) {
  if (b.languageClass === 'greek') return { background: langColor('Greek', 0.85) };
  if (b.languageClass === 'mixed') {
    // Aramaic share at the end of the bar, in proportion (with a visible minimum for a few words)
    const ar = b.languages.find((l) => l.language === 'Aramaic')?.percent ?? 0;
    const at = 100 - Math.max(ar, 4);
    return { background: `linear-gradient(90deg, ${langColor('Hebrew', 0.85)} ${at}%, ${langColor('Aramaic', 0.95)} ${at}%)` };
  }
  return { background: langColor('Hebrew', 0.85) };
}

function Axis({ s, top }: { s: Scale; top?: boolean }) {
  return (
    <div className={`relative h-5 font-sans text-[12px] tabular-nums text-ink-soft ${top ? 'border-b' : 'border-t'} border-rule`}>
      {s.ticks.map((t, i) => (
        <span key={t} className={`absolute -translate-x-1/2 whitespace-nowrap ${i % 2 ? 'hidden sm:block' : ''}`} style={{ left: `${pct(s, t)}%`, top: top ? 0 : 3 }}>
          {formatYear(t)}
        </span>
      ))}
    </div>
  );
}

function Panel({
  title,
  sub,
  s,
  list,
  isMatch,
  selected,
  onOpen,
}: {
  title: string;
  sub: string;
  s: Scale;
  list: BibleBook[];
  isMatch: (b: BibleBook) => boolean;
  selected: number | null;
  onOpen: (order: number) => void;
}) {
  return (
    <div>
      <header className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-ink/80 pb-2">
        <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
        <span className="font-serif italic text-ink-soft">{sub}</span>
      </header>

      <div className="grid grid-cols-[6.5rem_1fr] sm:grid-cols-[9rem_1fr]">
        {/* events above the bars */}
        <span />
        <div className="relative mb-1 h-[2.6rem] font-sans md:h-[3.6rem] text-[12px] leading-tight text-ink-soft">
          {s.marks.map((m) => (
            <span
              key={m.label}
              className={`absolute whitespace-nowrap ${m.minor ? 'hidden md:block' : ''} ${m.right ? '-translate-x-full pr-1 text-right' : 'pl-1'}`}
              style={{ left: `${pct(s, m.y)}%`, top: m.row * 19 }}
            >
              {m.label}
              <span className="ml-1 tabular-nums opacity-70">{formatYear(m.y)}</span>
            </span>
          ))}
        </div>
        <span />
        <Axis s={s} top />

        {/* the books */}
        <div className="col-span-2 relative">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[6.5rem] right-0 sm:left-[9rem]">
            {s.ticks.map((t) => (
              <span key={t} className="absolute inset-y-0 w-px bg-rule/70" style={{ left: `${pct(s, t)}%` }} />
            ))}
            {s.marks.map((m) => (
              <span key={m.label} className={`absolute inset-y-0 border-l border-dashed border-ink/30 ${m.minor ? 'hidden md:block' : ''}`} style={{ left: `${pct(s, m.y)}%` }} />
            ))}
          </div>
          <ul>
            {list.map((b) => {
              const c = b.composition;
              const l = pct(s, c.start);
              const w = Math.max(pct(s, c.end) - l, 0.9);
              return (
                <li key={b.order}>
                  <button
                    onClick={() => onOpen(b.order)}
                    title={`${b.name}: ${c.display}`}
                    aria-label={`${b.name}, written ${c.display}`}
                    className={`focus-ring group grid w-full grid-cols-[6.5rem_1fr] items-center py-[3px] text-left transition-opacity sm:grid-cols-[9rem_1fr] ${isMatch(b) ? '' : 'opacity-25'} ${selected === b.order ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.04]'}`}
                  >
                    <span className="truncate pr-2 font-serif text-[13px] group-hover:underline">{b.name}</span>
                    <span className="relative block h-3.5">
                      <span className="absolute inset-y-0 rounded-full" style={{ left: `${l}%`, width: `${w}%`, ...barStyle(b) }} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <span />
        <Axis s={s} />
      </div>
    </div>
  );
}

export function BookTimeline({
  isMatch,
  selected,
  onOpen,
}: {
  isMatch: (b: BibleBook) => boolean;
  selected: number | null;
  onOpen: (order: number) => void;
}) {
  const [order, setOrder] = useState<'date' | 'bible'>('date');
  const sorted = (t: 'Old' | 'New') => {
    const list = books.filter((b) => b.testament === t);
    if (order === 'bible') return list;
    return [...list].sort((a, b) => a.composition.start + a.composition.end - (b.composition.start + b.composition.end) || a.order - b.order);
  };

  return (
    <div aria-label="When the books were written" className="space-y-8">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div role="radiogroup" aria-label="Order" className="inline-flex rounded-full border border-rule p-0.5 font-sans text-xs">
          {(
            [
              ['date', 'By date'],
              ['bible', 'Bible order'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="radio"
              aria-checked={order === id}
              onClick={() => setOrder(id)}
              className={`focus-ring rounded-full px-3 py-1 ${order === id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Panel title="Old Testament" sub="Written before Jesus · c. 1450–160 BC" s={OT} list={sorted('Old')} isMatch={isMatch} selected={selected} onOpen={onOpen} />

      <div className="flex items-center gap-3 rounded-md border border-rule bg-paper/80 px-4 py-3 font-serif text-[14.5px]">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-ink" aria-hidden />
        <span>
          <b>Jesus</b> <span className="text-ink-soft">(c. 4 BC – AD 30)</span>. About four centuries pass between the last Old
          Testament book and the first New Testament writings. The scale changes here: the New Testament was written within a
          single lifetime.
        </span>
      </div>

      <Panel title="New Testament" sub="Written after Jesus · c. AD 45–125" s={NT} list={sorted('New')} isMatch={isMatch} selected={selected} onOpen={onOpen} />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-full" style={{ background: langColor('Hebrew', 0.85) }} /> Hebrew
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-full" style={{ background: `linear-gradient(90deg, ${langColor('Hebrew', 0.85)} 55%, ${langColor('Aramaic', 0.95)} 55%)` }} /> Hebrew
          with Aramaic
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-full" style={{ background: langColor('Greek', 0.85) }} /> Greek
        </span>
        <span>Where traditional and critical dates differ (for example Daniel, 2 Peter), the bar spans both.</span>
      </div>
    </div>
  );
}
