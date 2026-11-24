import { useState } from 'react';
import { CircleCheck, CircleDot, CircleX, ExternalLink, Info } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import { type Status, benchmarks, comparisonMeta, groups } from '../../lib/history';
import { RefText } from '../ScriptureRef';

const STATUS: Record<Status, { label: string; css: string; Icon: typeof CircleCheck }> = {
  affirms: { label: 'Affirms', css: '--rel-mentor', Icon: CircleCheck },
  partial: { label: 'Partly', css: '--role-king', Icon: CircleDot },
  differs: { label: 'Differs', css: '--rel-rival', Icon: CircleX },
};

function Badge({ s }: { s: Status }) {
  const { label, css, Icon } = STATUS[s];
  return (
    <span className="inline-flex items-center gap-1 font-sans text-[12px] font-semibold" style={{ color: cssColor(css) }}>
      <Icon size={14} aria-hidden /> {label}
    </span>
  );
}

export function OrthodoxyMatrix() {
  const [shownGroups, setShownGroups] = useState<Set<string>>(() => new Set(groups.map((g) => g.id)));
  const [shownBench, setShownBench] = useState<Set<string>>(() => new Set(benchmarks.map((b) => b.id)));
  const [cell, setCell] = useState<{ g: string; b: string }>({ g: 'jw', b: 'trinity' });
  const toggle = (set: Set<string>, id: string, fn: (s: Set<string>) => void) => {
    const n = new Set(set);
    if (n.has(id)) {
      if (n.size > 1) n.delete(id);
    } else n.add(id);
    fn(n);
  };
  const gs = groups.filter((g) => shownGroups.has(g.id));
  const bs = benchmarks.filter((b) => shownBench.has(b.id));
  const g = groups.find((x) => x.id === cell.g)!;
  const b = benchmarks.find((x) => x.id === cell.b)!;
  const pos = g.positions[b.id];

  const pill = (on: boolean) =>
    `focus-ring whitespace-nowrap rounded-full border px-2.5 py-1 font-sans text-[12px] ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:border-ink/60'}`;

  return (
    <div className="space-y-4">
      <div>
        <p className="max-w-3xl font-serif text-[15px] text-ink-soft">
          Six benchmarks from the historic creeds, compared across movements. Click any cell to see the creedal clause, the Bible passages
          involved, and how the group itself describes its teaching.
        </p>
      </div>
      <p className="flex gap-2 rounded-md border border-rule bg-paper/70 px-3 py-2 font-sans text-[12.5px] leading-snug text-ink-soft">
        <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
        {comparisonMeta.purpose}
      </p>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="eyebrow mr-1 w-full sm:w-24">Groups</span>
          {groups.map((x) => (
            <button key={x.id} onClick={() => toggle(shownGroups, x.id, setShownGroups)} aria-pressed={shownGroups.has(x.id)} className={pill(shownGroups.has(x.id))}>
              {x.name}
            </button>
          ))}
        </div>
        <div className="hidden flex-wrap items-center gap-1.5 lg:flex">
          <span className="eyebrow mr-1 w-full sm:w-24">Benchmarks</span>
          {benchmarks.map((x) => (
            <button key={x.id} onClick={() => toggle(shownBench, x.id, setShownBench)} aria-pressed={shownBench.has(x.id)} className={pill(shownBench.has(x.id))}>
              {x.name.replace(/ \(.*\)$/, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Phones: one benchmark at a time, every group listed under it (no sideways-scrolling table). */}
      <div className="space-y-2 lg:hidden">
        <div className="eyebrow">Benchmark</div>
        <div className="flex flex-wrap gap-1.5">
          {benchmarks.map((bm) => (
            <button key={bm.id} onClick={() => setCell({ g: cell.g, b: bm.id })} aria-pressed={cell.b === bm.id} className={pill(cell.b === bm.id)}>
              {bm.name.replace(/ \(.*\)$/, '')}
            </button>
          ))}
        </div>
        <ul className="panel divide-y divide-rule">
          {gs.map((x) => {
            const p = x.positions[cell.b];
            const active = cell.g === x.id;
            return (
              <li key={x.id}>
                <button
                  onClick={() => setCell({ g: x.id, b: cell.b })}
                  aria-pressed={active}
                  className={`focus-ring block w-full px-3 py-2.5 text-left ${active ? 'bg-ink/[0.06]' : ''} ${x.family === 'historic' ? 'bg-ink/[0.03]' : ''}`}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-[16px] font-semibold leading-tight">{x.name}</span>
                    <Badge s={p.status} />
                  </span>
                  <span className="mt-0.5 line-clamp-2 block font-sans text-[12.5px] leading-snug text-ink-soft">{p.summary}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="font-sans text-[12px] text-ink-soft">Tap a group for the full comparison below.</p>
      </div>

      <div className="panel hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[720px] border-collapse font-sans text-[12.5px]">
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-[1] w-44 bg-paper px-3 py-2 text-left align-bottom">
                <span className="eyebrow">Benchmark</span>
              </th>
              {gs.map((x) => (
                <th key={x.id} scope="col" className={`px-3 py-2 text-left align-bottom ${x.family === 'historic' ? 'bg-ink/[0.05]' : ''}`}>
                  <div className="font-display text-[15px] font-semibold leading-tight">{x.name}</div>
                  <div className="text-[12px] font-normal text-ink-soft">{x.origin.split(';')[0]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bs.map((bm) => (
              <tr key={bm.id} className="border-t border-rule">
                <th scope="row" className="sticky left-0 z-[1] bg-paper px-3 py-2 text-left align-top font-semibold">
                  {bm.name}
                </th>
                {gs.map((x) => {
                  const p = x.positions[bm.id];
                  const active = cell.g === x.id && cell.b === bm.id;
                  return (
                    <td key={x.id} className={`p-1 align-top ${x.family === 'historic' ? 'bg-ink/[0.05]' : ''}`}>
                      <button
                        onClick={() => setCell({ g: x.id, b: bm.id })}
                        aria-pressed={active}
                        className={`focus-ring block h-full w-full rounded-md border px-2 py-1.5 text-left ${active ? 'border-ink bg-paper shadow-sm' : 'border-transparent hover:border-rule'}`}
                      >
                        <Badge s={p.status} />
                        <span className="mt-0.5 line-clamp-3 text-[12px] leading-snug text-ink-soft">{p.summary}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail */}
      <div className="grid gap-3 rounded-md border border-rule bg-paper p-4 shadow-sm md:grid-cols-2">
        <div>
          <div className="eyebrow">Historic creeds · {b.name}</div>
          <p className="mt-1 font-serif text-[15px] leading-relaxed">{b.orthodoxPosition}</p>
          <blockquote className="mt-2 border-l-2 border-ink/30 pl-3 font-serif text-[14.5px] italic text-ink-soft">{b.creedClause}</blockquote>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {b.scripture.map((r) => (
              <span key={r} className="rounded-full border border-rule px-2 py-0.5 font-sans text-[12px]">
                <RefText text={r} />
              </span>
            ))}
          </div>
        </div>
        <div className="md:border-l md:border-rule md:pl-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="eyebrow">{g.name}</div>
            <Badge s={pos.status} />
          </div>
          <p className="mt-1 font-serif text-[15px] leading-relaxed">{pos.summary}</p>
          {pos.differingClause && (
            <p className="mt-2 font-sans text-[12.5px]">
              <span className="text-ink-soft">Creedal clause in question: </span>
              <i>{pos.differingClause}</i>
            </p>
          )}
          {pos.keyTexts && (
            <p className="mt-1.5 font-sans text-[12.5px]">
              <span className="text-ink-soft">Passages this group emphasises: </span>
              {pos.keyTexts.map((r, i) => (
                <span key={r}>
                  {i > 0 && ', '}
                  <RefText text={r} />
                </span>
              ))}
            </p>
          )}
          <p className="mt-2 font-sans text-[12px] text-ink-soft">
            {g.origin}. {g.description}
          </p>
          {g.sources.map((s) => (
            <a key={s} href={s} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-sans text-[12px] underline decoration-rule underline-offset-2 hover:decoration-ink">
              Official site: {new URL(s).hostname.replace(/^www\./, '')} <ExternalLink size={10} aria-hidden />
            </a>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 font-sans text-[12px] text-ink-soft">
        {(Object.keys(STATUS) as Status[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <Badge s={s} /> {comparisonMeta.statusLegend[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
