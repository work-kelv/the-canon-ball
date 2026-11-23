import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, HeartHandshake, History, Info, Lightbulb, X } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import { type Topic, commonGround, topics, traditions, traditionsMeta } from '../../lib/history';
import { RefText } from '../ScriptureRef';

type Verdict = 'same' | 'close' | 'different';
const VERDICT: Record<Verdict, { label: string; css: string }> = {
  same: { label: 'Agree', css: '--rel-mentor' },
  close: { label: 'Close', css: '--role-king' },
  different: { label: 'Differ', css: '--rel-rival' },
};
const verdictOf = (t: Topic, a: string, b: string): Verdict => {
  const d = Math.abs(t.positions[a].v - t.positions[b].v);
  return d === 0 ? 'same' : d <= 1 ? 'close' : 'different';
};
const byId = (id: string) => traditions.find((t) => t.id === id)!;

function VerdictBadge({ v }: { v: Verdict }) {
  const { label, css } = VERDICT[v];
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold" style={{ background: cssColor(css, 0.14), color: cssColor(css) }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cssColor(css) }} />
      {label}
    </span>
  );
}

/** A tiny track with a dot: where one tradition sits between a question's two answers. */
function MiniTrack({ v, css, strong, faded }: { v: number; css: string; strong?: boolean; faded?: boolean }) {
  return (
    <span className="relative block h-3 w-full" style={{ opacity: faded ? 0.3 : 1 }}>
      <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/10" />
      <span
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper transition-all duration-300"
        style={{ left: `${(v / 4) * 100}%`, width: strong ? 12 : 9, height: strong ? 12 : 9, background: cssColor(css) }}
      />
    </span>
  );
}

// ── At a glance: one shared track per question, with all seven traditions on it ──
function Glance({
  topicId,
  onTopic,
  focus,
  onFocus,
}: {
  topicId: string;
  onTopic: (id: string) => void;
  focus: string[];
  onFocus: (id: string) => void;
}) {
  const pair = focus.length === 2 ? (focus as [string, string]) : null;
  return (
    <div className="panel overflow-hidden">
      {/* Tradition chips: tap up to two to compare */}
      <div className="flex flex-wrap gap-1 border-b border-rule px-2.5 py-2">
        {traditions.map((t) => {
          const on = focus.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => onFocus(t.id)}
              aria-pressed={on}
              title={on ? `Stop highlighting ${t.name}` : `Highlight ${t.name}`}
              className={`focus-ring inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-sans text-[11.5px] font-semibold ${on ? 'border-transparent' : 'border-rule hover:border-ink/50'}`}
              style={on ? { background: cssColor(t.css), color: cssColor('--paper') } : { color: cssColor(t.css) }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: on ? cssColor('--paper') : cssColor(t.css) }} />
              {t.short}
            </button>
          );
        })}
      </div>
      {topics.map((tp, i) => {
        const on = tp.id === topicId;
        // traditions at the same point are fanned out vertically so none hide another
        const seen = new Map<number, number>();
        const verdict = pair ? verdictOf(tp, pair[0], pair[1]) : null;
        return (
          <button
            key={tp.id}
            onClick={() => onTopic(tp.id)}
            aria-pressed={on}
            className={`focus-ring block w-full border-b border-rule px-3 pb-2.5 pt-2 text-left last:border-b-0 ${on ? 'bg-ink/[0.07]' : 'hover:bg-ink/[0.03]'}`}
            style={{ boxShadow: on ? `inset 3px 0 0 ${cssColor('--ink')}` : undefined }}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className={`font-sans text-[12.5px] ${on ? 'font-semibold' : ''}`}>
                <span className="mr-1.5 tabular-nums text-ink-soft">{i + 1}</span>
                {tp.name}
              </span>
              {verdict && <VerdictBadge v={verdict} />}
            </span>
            <span className="relative mx-1.5 mt-2 block h-4">
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/10" />
              {traditions.map((t) => {
                const v = tp.positions[t.id].v;
                const n = seen.get(v) ?? 0;
                seen.set(v, n + 1);
                const dy = n === 0 ? 0 : (n % 2 ? -1 : 1) * Math.ceil(n / 2) * 5;
                const strong = focus.includes(t.id);
                const faded = focus.length > 0 && !strong;
                return (
                  <span
                    key={t.id}
                    title={`${t.short}: ${tp.positions[t.id].text}`}
                    className="absolute top-1/2 rounded-full ring-2 ring-paper transition-all duration-300"
                    style={{
                      left: `${(v / 4) * 100}%`,
                      width: strong ? 13 : 9,
                      height: strong ? 13 : 9,
                      transform: `translate(-50%, calc(-50% + ${dy}px))`,
                      background: cssColor(t.css),
                      opacity: faded ? 0.25 : 1,
                      zIndex: strong ? 2 : 1,
                    }}
                  />
                );
              })}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── One question in full ──
function TopicDetail({ topic, index, focus, onStep }: { topic: Topic; index: number; focus: string[]; onStep: (d: -1 | 1) => void }) {
  const sorted = [...traditions].sort((a, b) => topic.positions[a.id].v - topic.positions[b.id].v);
  const pair = focus.length === 2 ? (focus as [string, string]) : null;

  return (
    <article className="overflow-hidden rounded-md border border-rule bg-paper/90 shadow-sm">
      <header className="border-b border-rule px-4 pb-3 pt-3">
        <div className="eyebrow">
          {index + 1} · {topic.name}
        </div>
        <h3 className="mt-0.5 font-display text-2xl font-semibold leading-tight">{topic.question}</h3>
        {pair && (
          <div className="mt-2 flex flex-wrap items-center gap-2 font-sans text-[12.5px]">
            <b style={{ color: cssColor(byId(pair[0]).css) }}>{byId(pair[0]).short}</b> and{' '}
            <b style={{ color: cssColor(byId(pair[1]).css) }}>{byId(pair[1]).short}</b>:
            <VerdictBadge v={verdictOf(topic, pair[0], pair[1])} />
          </div>
        )}
      </header>

      <div className="space-y-4 px-4 py-4">
        <section className="grid gap-3 md:grid-cols-2">
          <div>
            <h4 className="eyebrow mb-1 flex items-center gap-1.5">
              <Lightbulb size={12} aria-hidden /> Why it matters
            </h4>
            <p className="font-serif text-[15px] leading-relaxed">{topic.why}</p>
          </div>
          <div>
            <h4 className="eyebrow mb-1 flex items-center gap-1.5">
              <History size={12} aria-hidden /> How the disagreement arose
            </h4>
            <p className="font-serif text-[15px] leading-relaxed">{topic.history}</p>
          </div>
        </section>

        {/* Where they stand: the spectrum, one tradition per row, ordered from one answer to the other */}
        <section>
          <h4 className="eyebrow mb-1.5">Where they stand</h4>
          <div className="mb-1 flex justify-between gap-6 font-sans text-[11.5px] font-semibold leading-tight text-ink-soft">
            <span className="max-w-[45%]">← {topic.left}</span>
            <span className="max-w-[45%] text-right">{topic.right} →</span>
          </div>
          <ol className="divide-y divide-rule rounded-md border border-rule">
            {sorted.map((t) => {
              const p = topic.positions[t.id];
              const on = focus.includes(t.id);
              return (
                <li
                  key={t.id}
                  className={`px-3 py-2.5 ${on ? 'bg-ink/[0.05]' : ''}`}
                  style={{ boxShadow: `inset 3px 0 0 ${cssColor(t.css, on ? 1 : 0.6)}`, opacity: focus.length && !on ? 0.65 : 1 }}
                >
                  <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
                    <span className="font-sans text-[13px] font-semibold" style={{ color: cssColor(t.css) }}>
                      {t.name}
                    </span>
                    <MiniTrack v={p.v} css={t.css} strong />
                  </div>
                  <p className="mt-1 font-serif text-[14.5px] leading-snug">{p.text}</p>
                </li>
              );
            })}
          </ol>
        </section>

        {topic.note && (
          <p className="flex gap-2 rounded-md bg-ink/[0.03] px-3 py-2 font-sans text-[12.5px] leading-snug text-ink-soft">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
            {topic.note}
          </p>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="eyebrow mb-1.5">Key terms</h4>
            <dl className="space-y-1.5">
              {topic.terms.map((d) => (
                <div key={d.term} className="font-sans text-[13px] leading-snug">
                  <dt className="inline font-semibold">{d.term}: </dt>
                  <dd className="inline text-ink/85">{d.def}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h4 className="eyebrow mb-1.5">Passages each side cites</h4>
            {(
              [
                [topic.left, topic.leftRefs],
                [topic.right, topic.rightRefs],
              ] as const
            ).map(([pole, refs], k) => (
              <div key={k} className="mb-2">
                <div className="font-sans text-[11.5px] text-ink-soft">
                  {k === 0 ? '← ' : ''}
                  {pole}
                  {k === 1 ? ' →' : ''}
                </div>
                <div className="mt-0.5 flex flex-wrap gap-1.5">
                  {refs.map((r) => (
                    <span key={r} className="rounded-full border border-rule px-2 py-0.5 font-sans text-[12px]">
                      <RefText text={r} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between gap-2 border-t border-rule pt-3">
          <button onClick={() => onStep(-1)} disabled={index === 0} className="focus-ring inline-flex items-center gap-1 rounded-full border border-rule px-3 py-1.5 font-sans text-[12.5px] font-medium hover:border-ink/50 disabled:opacity-30">
            <ChevronLeft size={14} aria-hidden /> Previous
          </button>
          <span className="font-sans text-[11.5px] tabular-nums text-ink-soft">
            {index + 1} of {topics.length}
          </span>
          <button onClick={() => onStep(1)} disabled={index === topics.length - 1} className="focus-ring inline-flex items-center gap-1 rounded-full border border-rule px-3 py-1.5 font-sans text-[12.5px] font-medium hover:border-ink/50 disabled:opacity-30">
            Next question <ChevronRight size={14} aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}

export function TraditionsCompare() {
  const [topicId, setTopicId] = useState(topics[0].id);
  const [focus, setFocus] = useState<string[]>([]);
  const detailRef = useRef<HTMLDivElement>(null);
  const index = topics.findIndex((t) => t.id === topicId);
  const topic = topics[index];

  const toFocus = (id: string) =>
    setFocus((f) => (f.includes(id) ? f.filter((x) => x !== id) : f.length >= 2 ? [f[1], id] : [...f, id]));
  // On narrow screens the details sit below the grid; bring them into view after choosing a question.
  const pickTopic = (id: string) => {
    setTopicId(id);
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };
  const step = (d: -1 | 1) => {
    const n = topics[Math.min(topics.length - 1, Math.max(0, index + d))];
    setTopicId(n.id);
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pair = focus.length === 2 ? (focus as [string, string]) : null;
  const counts = pair
    ? (['same', 'close', 'different'] as Verdict[]).map((v) => topics.filter((t) => verdictOf(t, pair[0], pair[1]) === v).length)
    : null;

  return (
    <section aria-labelledby="trad-title" className="space-y-5">
      <div>
        <h2 id="trad-title" className="font-display text-3xl font-semibold">
          Catholic, Orthodox, Protestant: what’s the difference?
        </h2>
        <p className="max-w-3xl font-serif text-[15px] text-ink-soft">
          All of these churches confess the same core faith. The grid shows, at a glance, where seven traditions stand on ten
          questions Christians have debated for centuries. Tap a question to read it in full, or tap two traditions to compare them.
        </p>
      </div>

      {/* Who and what is shared */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="rounded-md border border-rule bg-paper/80 p-4">
          <h3 className="eyebrow mb-2">The world’s Christians · {traditionsMeta.shares.total}</h3>
          <div className="flex h-7 overflow-hidden rounded-full ring-1 ring-rule">
            {traditionsMeta.shares.parts.map((p) => (
              <div key={p.id} title={`${p.label}: ${p.pct}%`} className="flex items-center justify-center font-sans text-[11px] font-semibold text-paper" style={{ width: `${p.pct}%`, background: cssColor(p.css) }}>
                {p.pct >= 10 ? `${p.pct}%` : ''}
              </div>
            ))}
          </div>
          <ul className="mt-2.5 space-y-1 font-sans text-[12px]">
            {traditionsMeta.shares.parts.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: cssColor(p.css) }} />
                <span className="w-8 font-semibold tabular-nums">{p.pct}%</span>
                <span className="text-ink-soft">{p.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 font-sans text-[10.5px] text-ink-soft">{traditionsMeta.shares.source}</p>
        </div>
        <div className="rounded-md border border-rule p-4" style={{ background: cssColor('--rel-mentor', 0.06) }}>
          <h3 className="eyebrow mb-2 flex items-center gap-1.5">
            <HeartHandshake size={13} aria-hidden /> Common ground: believed by all of them
          </h3>
          <ul className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {commonGround.map((c) => (
              <li key={c.text} className="flex gap-2 font-serif text-[14.5px] leading-snug">
                <span aria-hidden style={{ color: cssColor('--rel-mentor') }}>
                  ✓
                </span>
                <span>
                  {c.text}{' '}
                  <span className="whitespace-nowrap font-sans text-[11.5px] text-ink-soft">
                    (<RefText text={c.ref} />)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
        {/* At a glance (stays in view on wide screens while you read) */}
        <div className="space-y-2 lg:sticky lg:top-16">
          <h3 className="font-display text-xl font-semibold">At a glance</h3>
          <Glance topicId={topicId} onTopic={pickTopic} focus={focus} onFocus={toFocus} />
          <p className="font-sans text-[11.5px] leading-snug text-ink-soft">
            Each line runs between a question’s two answers; each dot is a tradition. Tap a question to read it in full; tap up to two
            traditions above to highlight and compare them.
          </p>
          {focus.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-rule bg-paper px-3 py-2 font-sans text-[12.5px]">
              {pair && counts ? (
                <span>
                  <b style={{ color: cssColor(byId(pair[0]).css) }}>{byId(pair[0]).short}</b> and{' '}
                  <b style={{ color: cssColor(byId(pair[1]).css) }}>{byId(pair[1]).short}</b>: agree on <b>{counts[0]}</b>, close on{' '}
                  <b>{counts[1]}</b>, differ on <b>{counts[2]}</b> of {topics.length}
                </span>
              ) : (
                <span>
                  Highlighting <b style={{ color: cssColor(byId(focus[0]).css) }}>{byId(focus[0]).name}</b>. Tap one more tradition to
                  compare.
                </span>
              )}
              <button onClick={() => setFocus([])} className="focus-ring ml-auto inline-flex items-center gap-1 rounded-full border border-rule px-2 py-0.5 text-[11.5px] hover:border-ink/50">
                <X size={11} aria-hidden /> Clear
              </button>
            </div>
          )}
        </div>

        <div ref={detailRef} className="scroll-mt-32">
          <TopicDetail topic={topic} index={index} focus={focus} onStep={step} />
        </div>
      </div>

      <p className="font-sans text-[11px] text-ink-soft">
        {traditionsMeta.purpose} {traditionsMeta.spectrumNote} Main sources:{' '}
        {traditions.map((t, i) => (
          <span key={t.id}>
            {i > 0 && '; '}
            {t.short}: {t.documents}
          </span>
        ))}
        .
      </p>
    </section>
  );
}
