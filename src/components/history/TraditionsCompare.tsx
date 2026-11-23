import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, HeartHandshake, History, Info, Lightbulb, X } from 'lucide-react';
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
function MiniTrack({ v, css }: { v: number; css: string }) {
  return (
    <span className="relative block h-3 w-full">
      <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/10" />
      <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper" style={{ left: `${(v / 4) * 100}%`, background: cssColor(css) }} />
    </span>
  );
}

// ── At a glance: one line per question, both answers labelled, all seven traditions on it ──
function Glance({ onTopic, focus }: { onTopic: (id: string) => void; focus: string[] }) {
  const pair = focus.length === 2 ? (focus as [string, string]) : null;
  return (
    <div className="panel overflow-hidden">
      <div className="grid lg:grid-cols-2">
        {topics.map((tp, i) => {
          const seen = new Map<number, number>();
          const verdict = pair ? verdictOf(tp, pair[0], pair[1]) : null;
          return (
            <button
              key={tp.id}
              onClick={() => onTopic(tp.id)}
              className="focus-ring group block w-full border-b border-rule px-4 pb-2.5 pt-2.5 text-left hover:bg-ink/[0.03] lg:[&:nth-child(odd)]:border-r"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-sans text-[13px] font-semibold">
                  <span className="mr-1.5 tabular-nums text-ink-soft">{i + 1}</span>
                  {tp.question}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {verdict && <VerdictBadge v={verdict} />}
                  <ChevronRight size={15} className="text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </span>
              <span className="relative mx-1.5 mt-3 block h-4">
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
              {/* The two answers, at the two ends of the line */}
              <span className="mt-1.5 flex justify-between gap-4 font-sans text-[11px] leading-tight text-ink-soft">
                <span>← {tp.leftShort}</span>
                <span className="text-right">{tp.rightShort} →</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── One question in full (shown in the side panel) ──
function TopicDetail({ topic, focus }: { topic: Topic; focus: string[] }) {
  const sorted = [...traditions].sort((a, b) => topic.positions[a.id].v - topic.positions[b.id].v);
  const pair = focus.length === 2 ? (focus as [string, string]) : null;
  return (
    <div className="space-y-5">
      <header>
        <div className="eyebrow">{topic.name}</div>
        <h3 className="mt-0.5 font-display text-3xl font-semibold leading-tight">{topic.question}</h3>
        {pair && (
          <div className="mt-2 flex flex-wrap items-center gap-2 font-sans text-[12.5px]">
            <b style={{ color: cssColor(byId(pair[0]).css) }}>{byId(pair[0]).short}</b> and{' '}
            <b style={{ color: cssColor(byId(pair[1]).css) }}>{byId(pair[1]).short}</b>:
            <VerdictBadge v={verdictOf(topic, pair[0], pair[1])} />
          </div>
        )}
      </header>

      <section>
        <h4 className="eyebrow mb-1 flex items-center gap-1.5">
          <Lightbulb size={12} aria-hidden /> Why it matters
        </h4>
        <p className="font-serif text-[16px] leading-relaxed">{topic.why}</p>
      </section>
      <section>
        <h4 className="eyebrow mb-1 flex items-center gap-1.5">
          <History size={12} aria-hidden /> How the disagreement arose
        </h4>
        <p className="font-serif text-[16px] leading-relaxed">{topic.history}</p>
      </section>

      {/* Where they stand: one tradition per row, ordered from one answer to the other */}
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
                  <MiniTrack v={p.v} css={t.css} />
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

      <section>
        <h4 className="eyebrow mb-1.5">Key terms</h4>
        <dl className="space-y-1.5">
          {topic.terms.map((d) => (
            <div key={d.term} className="font-sans text-[13.5px] leading-snug">
              <dt className="inline font-semibold">{d.term}: </dt>
              <dd className="inline text-ink/85">{d.def}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h4 className="eyebrow mb-1.5">Passages each side cites</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              [topic.left, topic.leftRefs, '← '],
              [topic.right, topic.rightRefs, '→ '],
            ] as const
          ).map(([pole, refs, arrow]) => (
            <div key={pole}>
              <div className="font-sans text-[11.5px] leading-snug text-ink-soft">
                {arrow}
                {pole}
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
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
    </div>
  );
}

/** Side panel for one question, like the person panel on the Characters timeline. */
function QuestionPanel({ index, focus, onStep, onClose }: { index: number; focus: string[]; onStep: (d: -1 | 1) => void; onClose: () => void }) {
  const topic = topics[index];
  const panelRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [index]);
  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onStep]);

  const back = (
    <>
      <ArrowLeft size={16} aria-hidden /> Back to all questions
    </>
  );
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="animate-fade absolute inset-0 bg-ink/30" onClick={onClose} aria-hidden />
      <aside
        ref={panelRef}
        role="dialog"
        aria-label={topic.question}
        className="animate-drawer absolute inset-y-0 right-0 flex w-full max-w-[40rem] flex-col overflow-y-auto overscroll-contain border-l border-rule bg-paper shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-rule bg-paper/95 px-3 py-2 backdrop-blur">
          <button ref={backRef} onClick={onClose} title="Esc" className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 font-sans text-sm font-medium text-paper active:opacity-80">
            {back}
          </button>
          <span className="ml-auto font-sans text-xs tabular-nums text-ink-soft">
            Question {index + 1} of {topics.length}
          </span>
        </div>
        <div className="px-5 py-5">
          <TopicDetail topic={topic} focus={focus} />
        </div>
        <div className="mt-auto space-y-3 border-t border-rule px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => onStep(-1)} disabled={index === 0} className="focus-ring inline-flex items-center gap-1 rounded-full border border-rule px-3 py-1.5 font-sans text-[12.5px] font-medium hover:border-ink/50 disabled:opacity-30">
              <ChevronLeft size={14} aria-hidden /> Previous question
            </button>
            <button onClick={() => onStep(1)} disabled={index === topics.length - 1} className="focus-ring inline-flex items-center gap-1 rounded-full border border-rule px-3 py-1.5 font-sans text-[12.5px] font-medium hover:border-ink/50 disabled:opacity-30">
              Next question <ChevronRight size={14} aria-hidden />
            </button>
          </div>
          <button onClick={onClose} className="focus-ring flex w-full items-center justify-center gap-2 rounded-full border border-ink py-3 font-sans text-sm font-medium hover:bg-ink/5 active:bg-ink/10">
            {back}
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

export function TraditionsCompare() {
  const [open, setOpen] = useState<number | null>(null);
  const [focus, setFocus] = useState<string[]>([]);
  const [showShared, setShowShared] = useState(false);

  const toFocus = (id: string) =>
    setFocus((f) => (f.includes(id) ? f.filter((x) => x !== id) : f.length >= 2 ? [f[1], id] : [...f, id]));
  const step = (d: -1 | 1) => setOpen((i) => (i === null ? i : Math.min(topics.length - 1, Math.max(0, i + d))));

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
          All of these churches share the same core faith. Where they differ, each of ten questions below is a line between two answers,
          with every tradition placed along it. Tap a question to read the full story.
        </p>
      </div>

      {/* Shared by all: one quiet line, with the details on request */}
      <div className="rounded-md border border-rule px-3 py-2" style={{ background: cssColor('--rel-mentor', 0.06) }}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[12.5px]">
          <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: cssColor('--rel-mentor') }}>
            <HeartHandshake size={14} aria-hidden /> Shared by all:
          </span>
          <span className="text-ink-soft">the Trinity · Jesus fully God and man · his death and resurrection · grace · the Bible · his return</span>
          <button onClick={() => setShowShared((x) => !x)} aria-expanded={showShared} className="focus-ring ml-auto inline-flex items-center gap-1 rounded-full border border-rule px-2.5 py-0.5 text-[12px] hover:border-ink/50">
            {showShared ? 'Less' : 'More'} <ChevronDown size={13} aria-hidden className={showShared ? 'rotate-180' : ''} />
          </button>
        </div>
        {showShared && (
          <div className="mt-3 grid gap-4 border-t border-rule pt-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
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
            <div>
              <h3 className="eyebrow mb-2">The world’s Christians · {traditionsMeta.shares.total}</h3>
              <div className="flex h-6 overflow-hidden rounded-full ring-1 ring-rule">
                {traditionsMeta.shares.parts.map((p) => (
                  <div key={p.id} title={`${p.label}: ${p.pct}%`} className="flex items-center justify-center font-sans text-[11px] font-semibold text-paper" style={{ width: `${p.pct}%`, background: cssColor(p.css) }}>
                    {p.pct >= 10 ? `${p.pct}%` : ''}
                  </div>
                ))}
              </div>
              <ul className="mt-2 space-y-0.5 font-sans text-[12px]">
                {traditionsMeta.shares.parts.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: cssColor(p.css) }} />
                    <span className="w-8 font-semibold tabular-nums">{p.pct}%</span>
                    <span className="text-ink-soft">{p.label}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 font-sans text-[10.5px] text-ink-soft">{traditionsMeta.shares.source}</p>
            </div>
          </div>
        )}
      </div>

      {/* Compare two: chips, then the ten squares */}
      <div className="rounded-md border border-rule bg-paper/85 px-3 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-sans text-[13px] font-semibold">{pair ? 'Comparing' : focus.length ? 'Pick one more' : 'Pick two traditions to compare'}</span>
          {traditions.map((t) => {
            const on = focus.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toFocus(t.id)}
                aria-pressed={on}
                className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-[12.5px] font-medium ${on ? 'border-transparent shadow-sm' : 'border-rule hover:border-ink/50'}`}
                style={on ? { background: cssColor(t.css), color: cssColor('--paper') } : undefined}
              >
                {!on && <span className="h-2 w-2 rounded-full" style={{ background: cssColor(t.css) }} />}
                {t.short}
              </button>
            );
          })}
          {focus.length > 0 && (
            <button onClick={() => setFocus([])} className="focus-ring ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[11.5px] text-ink-soft hover:text-ink">
              <X size={12} aria-hidden /> Clear
            </button>
          )}
        </div>
        {pair && counts && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule pt-3">
            <div className="flex gap-1">
              {topics.map((t, i) => {
                const v = verdictOf(t, pair[0], pair[1]);
                return (
                  <button
                    key={t.id}
                    onClick={() => setOpen(i)}
                    title={`${i + 1}. ${t.name}: ${VERDICT[v].label}`}
                    aria-label={`${t.name}: ${VERDICT[v].label}`}
                    className="focus-ring flex h-7 w-7 items-center justify-center rounded-[5px] font-sans text-[11px] font-bold text-paper hover:scale-110 sm:h-8 sm:w-8"
                    style={{ background: cssColor(VERDICT[v].css, 0.9), transition: 'transform 150ms' }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <p className="font-sans text-[13px]">
              <b style={{ color: cssColor(byId(pair[0]).css) }}>{byId(pair[0]).short}</b> and{' '}
              <b style={{ color: cssColor(byId(pair[1]).css) }}>{byId(pair[1]).short}</b> agree on <b>{counts[0]}</b>, are close on{' '}
              <b>{counts[1]}</b> and differ on <b>{counts[2]}</b> of {topics.length} questions.
              <span className="block text-[11.5px] text-ink-soft">Tap a square to read that question.</span>
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-semibold">Ten questions at a glance</h3>
          <span className="font-sans text-[11.5px] text-ink-soft">Each dot is a tradition · tap a question for the full story</span>
        </div>
        <Glance onTopic={(id) => setOpen(topics.findIndex((t) => t.id === id))} focus={focus} />
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

      {open !== null && <QuestionPanel index={open} focus={focus} onStep={step} onClose={() => setOpen(null)} />}
    </section>
  );
}
