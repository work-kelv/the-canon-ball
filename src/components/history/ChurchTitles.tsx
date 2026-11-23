import { useState } from 'react';
import { BookMarked } from 'lucide-react';
import data from '../../data/churchTitles.json';
import { cssColor } from '../../lib/characters';
import { RefText } from '../ScriptureRef';

type TraditionId = keyof typeof data.meta.traditions;
interface Title {
  id: string;
  title: string;
  word: string;
  used: string[];
  body: string;
  refs?: string[];
  sources: string[];
}
const groups = data.groups as { id: string; label: string; titles: Title[] }[];
const byId = Object.fromEntries(groups.flatMap((g) => g.titles).map((t) => [t.id, t]));
const TRAD = data.meta.traditions as Record<TraditionId, { label: string; css: string }>;

/** A short, plain guide to Christian titles: a who's-who ladder per tradition, then a card for each title. */
export function ChurchTitles() {
  const [flash, setFlash] = useState<string | null>(null);
  const jump = (id: string) => {
    document.getElementById(`title-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFlash(id);
    window.setTimeout(() => setFlash((f) => (f === id ? null : f)), 1600);
  };

  return (
    <section aria-labelledby="titles-title" className="space-y-6">
      <div>
        <h2 id="titles-title" className="font-display text-3xl font-semibold">
          Titles in the church
        </h2>
        <p className="max-w-3xl font-serif text-[15px] text-ink-soft">{data.meta.intro}</p>
      </div>

      {/* Who's who */}
      <div>
        <h3 className="eyebrow mb-2">Who’s who, from the top · tap a title</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {data.ladders.map((l) => (
            <div key={l.id} className="rounded-md border border-rule bg-paper/85 p-3" style={{ boxShadow: `inset 0 3px 0 ${cssColor(l.css)}` }}>
              <div className="font-display text-lg font-semibold" style={{ color: cssColor(l.css) }}>
                {l.label}
              </div>
              <ol className="mt-1.5 space-y-1">
                {l.tiers.map((t, i) => (
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
              <p className="mt-2 font-sans text-[11.5px] leading-snug text-ink-soft">{l.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The titles */}
      {groups.map((g) => (
        <div key={g.id}>
          <h3 className="mb-2 font-display text-xl font-semibold">{g.label}</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {g.titles.map((t) => (
              <article
                key={t.id}
                id={`title-${t.id}`}
                className={`scroll-mt-40 rounded-md border bg-paper/85 px-4 py-3 transition-shadow duration-500 ${flash === t.id ? 'border-ink shadow-md' : 'border-rule'}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h4 className="font-display text-[21px] font-semibold leading-tight">{t.title}</h4>
                  <span className="font-sans text-[11.5px] italic text-ink-soft">{t.word}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {t.used.map((u) => {
                    const tr = TRAD[u as TraditionId];
                    return (
                      <span key={u} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[10.5px] font-semibold" style={{ background: cssColor(tr.css, 0.12), color: cssColor(tr.css) }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: cssColor(tr.css) }} />
                        {tr.label}
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
                <p className="mt-2 flex gap-1.5 font-sans text-[11px] leading-snug text-ink-soft">
                  <BookMarked size={12} className="mt-px shrink-0" aria-hidden />
                  {t.sources.join(' · ')}
                </p>
              </article>
            ))}
          </div>
        </div>
      ))}
      <p className="font-sans text-[11px] text-ink-soft">
        Usage differs between churches and countries; the sources (full details in the References below) describe each title as its own
        tradition uses it.
      </p>
    </section>
  );
}
