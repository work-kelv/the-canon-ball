import { useState } from 'react';
import { BookOpen, ExternalLink, Landmark, ShieldCheck } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import { type Creed, type CreedClause, creedMeta, creeds } from '../../lib/history';
import { RefText } from '../ScriptureRef';
import { Segmented } from '../characters/controls';
import { CreedText } from './CreedText';

const isPrayerBook = (c: Creed) => c.source.url.includes('bcp1662');

function ClauseDetail({ creed, clause, index }: { creed: Creed; clause: CreedClause; index: number }) {
  return (
    <div className="rounded-md border border-rule bg-paper shadow-sm">
      <div className="border-b border-rule px-4 py-3" style={{ background: cssColor('--role-king', 0.08) }}>
        <div className="eyebrow">
          {creed.name} · line {index + 1} of {creed.clauses.length}
        </div>
        <blockquote className="mt-1 font-serif text-[17px] italic leading-snug">
          “<CreedText text={clause.clauseText} />”
        </blockquote>
        <p className="mt-1 font-sans text-[12px] text-ink-soft">Text: {creed.source.short}</p>
      </div>
      <div className="space-y-4 px-4 py-3">
        <section>
          <h4 className="eyebrow mb-1.5 flex items-center gap-1.5">
            <BookOpen size={12} aria-hidden /> Biblical background
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {clause.scriptureReferences.map((r) => (
              <span key={r} className="rounded-full border border-rule px-2 py-0.5 font-sans text-[12.5px]">
                <RefText text={r} />
              </span>
            ))}
          </div>
          <p className="mt-1 font-sans text-[12px] text-ink-soft">Click a reference to read it (WEB or BSB).</p>
        </section>
        <section>
          <h4 className="eyebrow mb-1 flex items-center gap-1.5">
            <Landmark size={12} aria-hidden /> Historical context
          </h4>
          <p className="font-serif text-[15px] leading-relaxed">
            <RefText text={clause.historicalContext} />
          </p>
        </section>
        <section>
          <h4 className="eyebrow mb-1 flex items-center gap-1.5">
            <ShieldCheck size={12} aria-hidden /> How reliable is it?
          </h4>
          {clause.reliabilityNote && <p className="mb-2 font-serif text-[15px] leading-relaxed">{clause.reliabilityNote}</p>}
          <p className="font-sans text-[13px] leading-relaxed text-ink-soft">{creed.reliabilityNote}</p>
        </section>
      </div>
    </div>
  );
}

export function CreedExplorer() {
  const [creedId, setCreedId] = useState(creeds[0].id);
  const [idx, setIdx] = useState(0);
  const creed = creeds.find((c) => c.id === creedId)!;
  const clause = creed.clauses[Math.min(idx, creed.clauses.length - 1)];

  return (
    <div className="space-y-4">
      <div>
        <p className="max-w-2xl font-serif text-[15px] text-ink-soft">
          Choose a creed, then click any line to see the Bible passages behind it, the controversy it answered, and how its text has
          come down to us.
        </p>
      </div>
      <Segmented<string>
        label="Creed"
        value={creedId}
        onChange={(v) => {
          setCreedId(v);
          setIdx(0);
        }}
        options={creeds.map((c) => ({ id: c.id, label: c.name.replace(' Definition', '') }))}
      />
      <div className="rounded-md border border-rule bg-paper/70 px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-2xl font-semibold">{creed.name}</h3>
          <span className="font-sans text-sm font-semibold tabular-nums">{creed.date}</span>
        </div>
        <p className="font-serif text-[15px]">{creed.summary}</p>
        <p className="mt-1 font-sans text-[12px] text-ink-soft">{creed.origin}</p>
        <p className="mt-2 border-t border-rule pt-2 font-sans text-[12.5px] leading-snug">
          <span className="text-ink-soft">Text: </span>
          <a
            href={creed.source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-baseline gap-1 underline decoration-rule underline-offset-2 hover:decoration-ink"
          >
            {creed.source.label}
            <ExternalLink size={11} className="shrink-0 self-center" aria-hidden />
          </a>
          . Public domain.
        </p>
        {isPrayerBook(creed) && <p className="mt-1 font-sans text-[12px] leading-snug text-ink-soft">{creedMeta.spellingNote}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_minmax(0,26rem)]">
        <ol className="space-y-1.5">
          {creed.clauses.map((c, i) => {
            const active = i === idx;
            return (
              <li key={i}>
                <button
                  onClick={() => setIdx(i)}
                  aria-pressed={active}
                  className={`focus-ring flex w-full gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                    active ? 'border-ink bg-paper shadow-sm' : 'border-transparent hover:border-rule hover:bg-paper/60'
                  }`}
                >
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-sans text-[12px] font-bold"
                    style={active ? { background: cssColor('--ink'), color: cssColor('--paper') } : { border: `1px solid ${cssColor('--rule')}` }}
                  >
                    {i + 1}
                  </span>
                  <span className={`font-serif text-[16.5px] leading-snug ${active ? '' : 'text-ink/85'}`}>{c.clauseText}</span>
                </button>
                {active && (
                  <div className="mt-2 md:hidden">
                    <ClauseDetail creed={creed} clause={c} index={i} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <div className="hidden md:block">
          <div className="sticky top-[calc(var(--jump-h,44px)+12px)]">
            <ClauseDetail creed={creed} clause={clause} index={Math.min(idx, creed.clauses.length - 1)} />
          </div>
        </div>
      </div>
      <p className="font-sans text-[12px] text-ink-soft">
        Texts: {creedMeta.translations} {creedMeta.reliabilityPrinciple}
      </p>
    </div>
  );
}
