import { useState } from 'react';
import { BookMarked } from 'lucide-react';
import data from '../../data/churchTitles.json';
import { cssColor } from '../../lib/characters';
import { RefText } from '../ScriptureRef';
import { Fold, openFold } from '../sections';

type TraditionId = keyof typeof data.meta.traditions;
/** A family that uses the title, optionally narrowed (e.g. Protestant · Anglican). */
type Use = TraditionId | { f: TraditionId; note: string };
interface Ladder {
  id: string;
  label: string;
  css: string;
  tiers: string[];
  branches?: { label: string; tiers: string[] }[];
  note: string;
}
interface Title {
  id: string;
  title: string;
  word: string;
  used: Use[];
  body: string;
  refs?: string[];
  sources: string[];
}
const groups = data.groups as unknown as { id: string; label: string; titles: Title[] }[];
const byId = Object.fromEntries(groups.flatMap((g) => g.titles).map((t) => [t.id, t]));
const TRAD = data.meta.traditions as Record<TraditionId, { label: string; css: string }>;

/** A short, plain guide to Christian titles: a who's-who ladder per tradition, then a card for each title. */
export function ChurchTitles() {
  const [flash, setFlash] = useState<string | null>(null);
  const jump = (id: string) => {
    openFold(`title-${id}`);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.getElementById(`title-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })),
    );
    setFlash(id);
    window.setTimeout(() => setFlash((f) => (f === id ? null : f)), 1600);
  };

  return (
    <div className="space-y-6">

      {/* Who's who */}
      <div>
        <h3 className="eyebrow mb-2">Who’s who, from the top · tap a title</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(data.ladders as Ladder[]).map((l) => {
            const Rungs = ({ tiers }: { tiers: string[] }) => (
              <ol className="space-y-1">
                {tiers.map((t, i) => (
                  <li key={t} style={{ paddingLeft: i * 6 }}>
                    <button
                      onClick={() => jump(t)}
                      className="focus-ring flex w-full items-center gap-2 rounded-full border border-rule px-2.5 py-1 text-left font-sans text-[12.5px] font-medium hover:border-ink/50"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: cssColor(l.css) }} />
                      {byId[t]?.title ?? t}
                    </button>
                  </li>
                ))}
              </ol>
            );
            return (
              <div
                key={l.id}
                className={`rounded-md border border-rule bg-paper/85 p-3 ${l.branches ? 'sm:col-span-2 lg:col-span-2' : ''}`}
                style={{ boxShadow: `inset 0 3px 0 ${cssColor(l.css)}` }}
              >
                <div className="mb-1.5 font-display text-lg font-semibold" style={{ color: cssColor(l.css) }}>
                  {l.label}
                </div>
                {l.branches ? (
                  <div className="grid gap-x-3 gap-y-3 sm:grid-cols-2">
                    {l.branches.map((br) => (
                      <div key={br.label}>
                        <div className="mb-1 font-sans text-[12px] font-semibold uppercase tracking-wide text-ink-soft">{br.label}</div>
                        <Rungs tiers={br.tiers} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Rungs tiers={l.tiers} />
                )}
                <p className="mt-2 font-sans text-[12px] leading-snug text-ink-soft">{l.note}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* The titles */}
      <Fold
        id="title-cards"
        min="explorer"
        targetPrefix="title-"
        title="All the titles, explained"
        count={groups.reduce((n, g) => n + g.titles.length, 0)}
        summary="What each title means in its original language, who uses it, and the Scripture and sources behind it."
      >
      <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.id}>
          <h4 className="mb-2 font-display text-xl font-semibold">{g.label}</h4>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {g.titles.map((t) => (
              <article
                key={t.id}
                id={`title-${t.id}`}
                className={`section-anchor rounded-md border bg-paper/85 px-4 py-3 transition-shadow duration-500 ${flash === t.id ? 'border-ink shadow-md' : 'border-rule'}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h5 className="font-display text-[21px] font-semibold leading-tight">{t.title}</h5>
                  <span className="font-sans text-[12px] italic text-ink-soft">{t.word}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {t.used.map((u) => {
                    const id = typeof u === 'string' ? u : u.f;
                    const note = typeof u === 'string' ? null : u.note;
                    const tr = TRAD[id];
                    return (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[12px] font-semibold" style={{ background: cssColor(tr.css, 0.12), color: cssColor(tr.css) }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: cssColor(tr.css) }} />
                        {tr.label}
                        {note && <span className="font-normal opacity-80">· {note}</span>}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-2 font-serif text-[15px] leading-relaxed">{t.body}</p>
                {t.refs && (
                  <p className="mt-2 flex flex-wrap items-center gap-1.5 font-sans text-[12px]">
                    <span className="text-ink-soft">In Scripture:</span>
                    {t.refs.map((r) => (
                      <span key={r} className="rounded-full border border-rule px-2 py-0.5">
                        <RefText text={r} />
                      </span>
                    ))}
                  </p>
                )}
                <p className="mt-2 flex gap-1.5 font-sans text-[12px] leading-snug text-ink-soft">
                  <BookMarked size={12} className="mt-px shrink-0" aria-hidden />
                  {t.sources.join(' · ')}
                </p>
              </article>
            ))}
          </div>
        </div>
      ))}
      </div>
      </Fold>
      <p className="font-sans text-[12px] text-ink-soft">
        Usage differs between churches and countries; the sources (full details in the References below) describe each title as its own
        tradition uses it.
      </p>
    </div>
  );
}
