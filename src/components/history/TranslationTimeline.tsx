import { useState } from 'react';
import { Globe2 } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import { type Era, KIND_INFO, type MilestoneKind, timeline, translationMeta, translationStats } from '../../lib/history';

const ERAS: { id: Era | 'all'; label: string }[] = [
  { id: 'all', label: 'All eras' },
  { id: 'ancient', label: 'Ancient manuscripts' },
  { id: 'reformation', label: 'Reformation era' },
  { id: 'modern', label: 'Modern global era' },
];

export function KindBadge({ kind }: { kind: MilestoneKind }) {
  const k = KIND_INFO[kind];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[10.5px] font-semibold" style={{ background: cssColor(k.css, 0.14), color: cssColor(k.css) }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cssColor(k.css) }} />
      {k.label}
    </span>
  );
}

export function TranslationTimeline() {
  const [era, setEra] = useState<Era | 'all'>('all');
  const [kinds, setKinds] = useState<Set<MilestoneKind>>(() => new Set(Object.keys(KIND_INFO) as MilestoneKind[]));
  const toggleKind = (k: MilestoneKind) =>
    setKinds((s) => {
      const n = new Set(s);
      if (n.has(k)) {
        if (n.size > 1) n.delete(k);
      } else n.add(k);
      return n;
    });
  const shown = timeline.filter((m) => (era === 'all' || m.era === era) && (kinds.has(m.kind) || (m.navigation && kinds.has(m.navigation))));

  return (
    <section aria-labelledby="tl-title" className="space-y-4">
      <div>
        <h2 id="tl-title" className="font-display text-3xl font-semibold">
          How the Bible reached the world’s languages
        </h2>
        <p className="max-w-3xl font-serif text-[15px] text-ink-soft">
          From the Septuagint to today’s translation movement — with the manuscript discoveries that confirmed the text, and the
          inventions that gave us chapters and verses.
        </p>
      </div>

      {/* Scripture today */}
      <div className="rounded-md border border-rule bg-paper/80 p-4">
        <h3 className="eyebrow mb-2 flex items-center gap-1.5">
          <Globe2 size={12} aria-hidden /> Scripture today
        </h3>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {translationStats.map((s) => (
            <div key={s.label}>
              <dt className="font-display text-2xl font-semibold tabular-nums">{s.value}</dt>
              <dd className="font-sans text-[11.5px] leading-snug text-ink-soft">{s.label}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 font-sans text-[10.5px] text-ink-soft">{translationMeta.statsSource}</p>
      </div>

      <div className="space-y-2">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {ERAS.map((e) => (
            <button
              key={e.id}
              onClick={() => setEra(e.id)}
              aria-pressed={era === e.id}
              className={`focus-ring whitespace-nowrap rounded-full border px-3 py-1.5 font-sans text-[13px] ${era === e.id ? 'border-ink bg-ink text-paper' : 'border-rule hover:border-ink/60'}`}
            >
              {e.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(KIND_INFO) as MilestoneKind[]).map((k) => (
            <button key={k} onClick={() => toggleKind(k)} aria-pressed={kinds.has(k)} className={`focus-ring rounded-full transition-opacity ${kinds.has(k) ? '' : 'opacity-35'}`}>
              <KindBadge kind={k} />
            </button>
          ))}
        </div>
      </div>

      <ol className="relative space-y-3 pl-6 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-ink/20 sm:pl-0 sm:before:left-[9rem]">
        {shown.map((m) => {
          const col = cssColor(KIND_INFO[m.kind].css);
          return (
            <li key={m.id} className="relative sm:grid sm:grid-cols-[8rem_1fr] sm:gap-8">
              <div className="mb-1 font-sans text-[12.5px] font-semibold tabular-nums sm:mb-0 sm:pt-3 sm:text-right">{m.yearLabel}</div>
              <span
                aria-hidden
                className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full ring-[3px] ring-paper sm:left-[calc(9rem-7px)] sm:top-3.5"
                style={{ background: col }}
              />
              <article className="rounded-md border border-rule bg-paper/85 px-4 py-3" style={{ boxShadow: `inset 3px 0 0 ${col}` }}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <KindBadge kind={m.kind} />
                  {m.navigation && <KindBadge kind={m.navigation} />}
                </div>
                <h3 className="mt-1 font-display text-[19px] font-semibold leading-tight">{m.title}</h3>
                <p className="font-sans text-[12px] text-ink-soft">
                  {m.who}
                  {m.languages && m.languages !== '—' && <> · {m.languages}</>}
                </p>
                <p className="mt-1.5 font-serif text-[15px] leading-relaxed">{m.body}</p>
              </article>
            </li>
          );
        })}
      </ol>
      {shown.length === 0 && <p className="font-sans text-sm text-ink-soft">No milestones match these filters.</p>}
    </section>
  );
}
