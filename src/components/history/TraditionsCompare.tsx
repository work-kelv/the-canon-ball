import { useState } from 'react';
import { HeartHandshake, Info } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import { type Topic, type Tradition, commonGround, topics, traditions, traditionsMeta } from '../../lib/history';
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
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[11px] font-semibold"
      style={{ background: cssColor(css, 0.14), color: cssColor(css) }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cssColor(css) }} />
      {label}
    </span>
  );
}

/** Where all seven traditions sit between the topic's two poles; the pair being compared stands out. */
function Spectrum({ topic, a, b }: { topic: Topic; a: string; b: string }) {
  // Traditions sharing a value are fanned out vertically so none hide behind another.
  const slots = new Map<number, string[]>();
  for (const t of traditions) {
    const v = topic.positions[t.id].v;
    slots.set(v, [...(slots.get(v) ?? []), t.id]);
  }
  const offsetOf = (id: string) => {
    const same = slots.get(topic.positions[id].v)!.filter((x) => x !== a && x !== b);
    const i = same.indexOf(id);
    return i < 0 ? 0 : (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 7;
  };
  const pct = (v: number) => `${(v / 4) * 100}%`;
  const ta = byId(a);
  const tb = byId(b);
  return (
    <div className="px-1">
      <div className="relative mx-2 h-16">
        {/* track */}
        <div
          className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
          style={{ background: `linear-gradient(90deg, ${cssColor('--ink', 0.08)}, ${cssColor('--ink', 0.2)})` }}
        />
        {[0, 1, 2, 3, 4].map((v) => (
          <span key={v} className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-ink/25" style={{ left: pct(v) }} />
        ))}
        {/* the other traditions, faint */}
        {traditions
          .filter((t) => t.id !== a && t.id !== b)
          .map((t) => (
            <span
              key={t.id}
              title={`${t.short}: ${topic.positions[t.id].text}`}
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full ring-2 ring-paper transition-all duration-500"
              style={{
                left: pct(topic.positions[t.id].v),
                transform: `translate(-50%, calc(-50% + ${offsetOf(t.id)}px))`,
                background: cssColor(t.css, 0.45),
              }}
            />
          ))}
        {/* the compared pair: A labelled above the track, B below */}
        {([
          [ta, 'above'],
          [tb, 'below'],
        ] as [Tradition, 'above' | 'below'][]).map(([t, side]) => {
          const v = topic.positions[t.id].v;
          const align = v <= 0.5 ? 'left-0' : v >= 3.5 ? 'right-0' : 'left-1/2 -translate-x-1/2';
          return (
            <span
              key={side}
              className="absolute top-1/2 transition-all duration-500"
              style={{ left: pct(v), transform: `translate(-50%, -50%) translate(0, ${side === 'above' ? -3 : 3}px)` }}
            >
              <span className="block h-4 w-4 rounded-full shadow ring-[3px] ring-paper" style={{ background: cssColor(t.css) }} />
              <span
                className={`absolute ${align} whitespace-nowrap font-sans text-[11px] font-semibold ${side === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'}`}
                style={{ color: cssColor(t.css) }}
              >
                {t.short}
              </span>
            </span>
          );
        })}
      </div>
      <div className="flex justify-between gap-6 font-sans text-[11px] leading-tight text-ink-soft">
        <span className="max-w-[45%]">← {topic.left}</span>
        <span className="max-w-[45%] text-right">{topic.right} →</span>
      </div>
    </div>
  );
}

function Picker({ label, value, other, onChange }: { label: string; value: string; other: string; onChange: (id: string) => void }) {
  return (
    <div className="no-scrollbar -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      <span className="eyebrow w-[4.6rem] shrink-0">{label}</span>
      {traditions.map((t) => {
        const on = t.id === value;
        const taken = t.id === other;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            disabled={taken}
            aria-pressed={on}
            className={`focus-ring inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 font-sans text-[12.5px] font-medium transition-colors disabled:opacity-30 ${
              on ? 'border-transparent text-paper shadow-sm' : 'border-rule hover:border-ink/50'
            }`}
            style={on ? { background: cssColor(t.css) } : undefined}
          >
            {!on && <span className="h-2 w-2 rounded-full" style={{ background: cssColor(t.css) }} />}
            {t.short}
          </button>
        );
      })}
    </div>
  );
}

export function TraditionsCompare() {
  const [a, setA] = useState('catholic');
  const [b, setB] = useState('baptist');
  const ta = byId(a);
  const tb = byId(b);
  const verdicts = topics.map((t) => verdictOf(t, a, b));
  const count = (v: Verdict) => verdicts.filter((x) => x === v).length;

  return (
    <section aria-labelledby="trad-title" className="space-y-5">
      <div>
        <h2 id="trad-title" className="font-display text-3xl font-semibold">
          Catholic, Orthodox, Protestant: what’s the difference?
        </h2>
        <p className="max-w-3xl font-serif text-[15px] text-ink-soft">
          All of these churches confess the same core faith. Pick two traditions to see where they agree and where they part ways, on
          ten questions Christians have debated for centuries.
        </p>
      </div>

      {/* Who and what is shared */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="rounded-md border border-rule bg-paper/80 p-4">
          <h3 className="eyebrow mb-2">The world’s Christians · {traditionsMeta.shares.total}</h3>
          <div className="flex h-7 overflow-hidden rounded-full ring-1 ring-rule">
            {traditionsMeta.shares.parts.map((p) => (
              <div
                key={p.id}
                title={`${p.label}: ${p.pct}%`}
                className="flex items-center justify-center font-sans text-[11px] font-semibold text-paper"
                style={{ width: `${p.pct}%`, background: cssColor(p.css) }}
              >
                {p.pct >= 10 ? `${p.pct}%` : ''}
              </div>
            ))}
          </div>
          <ul className="mt-2.5 space-y-1 font-sans text-[12px]">
            {traditionsMeta.shares.parts.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: cssColor(p.css) }} />
                <span className="w-8 tabular-nums font-semibold">{p.pct}%</span>
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
                  {c.text} <span className="whitespace-nowrap font-sans text-[11.5px] text-ink-soft">(<RefText text={c.ref} />)</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pick two + an at-a-glance fingerprint */}
      <div style={{ top: 'calc(var(--tabs-h, 44px) - 1px)' }} className="sticky z-10 -mx-4 space-y-2 border-y border-rule bg-paper/95 px-4 py-2.5 backdrop-blur sm:-mx-8 sm:px-8 sm:py-3">
        <Picker label="Compare" value={a} other={b} onChange={setA} />
        <Picker label="with" value={b} other={a} onChange={setB} />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
          <div className="flex gap-1" aria-hidden>
            {topics.map((t, i) => (
              <a
                key={t.id}
                href={`#topic-${t.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(`topic-${t.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                title={`${t.name}: ${VERDICT[verdicts[i]].label}`}
                className="h-4 w-4 rounded-[3px] transition-colors duration-500 sm:h-5 sm:w-5"
                style={{ background: cssColor(VERDICT[verdicts[i]].css, 0.85) }}
              />
            ))}
          </div>
          <p className="font-sans text-[12.5px]">
            <b style={{ color: cssColor(ta.css) }}>{ta.short}</b> and <b style={{ color: cssColor(tb.css) }}>{tb.short}</b>: agree on{' '}
            <b>{count('same')}</b>, close on <b>{count('close')}</b>, differ on <b>{count('different')}</b> of {topics.length}
          </p>
        </div>
      </div>

      <ol className="space-y-3">
        {topics.map((t, i) => {
          const pa = t.positions[a];
          const pb = t.positions[b];
          return (
            <li key={t.id} id={`topic-${t.id}`} className="scroll-mt-48 overflow-hidden rounded-md border border-rule bg-paper/85">
              <div className="flex items-start justify-between gap-3 px-4 pt-3">
                <div>
                  <div className="eyebrow">
                    {i + 1} · {t.name}
                  </div>
                  <h3 className="font-display text-[19px] font-semibold leading-tight">{t.question}</h3>
                </div>
                <VerdictBadge v={verdicts[i]} />
              </div>
              <div className="px-3 pb-1 pt-2">
                <Spectrum topic={t} a={a} b={b} />
              </div>
              <div className="grid border-t border-rule sm:grid-cols-2">
                {([
                  [ta, pa],
                  [tb, pb],
                ] as const).map(([tr, p], k) => (
                  <div
                    key={k}
                    className={`px-4 py-3 ${k === 0 ? 'border-b border-rule sm:border-b-0 sm:border-r' : ''}`}
                    style={{ boxShadow: `inset 3px 0 0 ${cssColor(tr.css)}` }}
                  >
                    <div className="font-sans text-[11.5px] font-semibold" style={{ color: cssColor(tr.css) }}>
                      {tr.name}
                    </div>
                    <p className="mt-0.5 font-serif text-[15px] leading-relaxed">{p.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 border-t border-rule bg-ink/[0.02] px-4 py-2 font-sans text-[12px]">
                <span className="text-ink-soft">Passages in the debate:</span>
                {t.scripture.map((r) => (
                  <span key={r} className="rounded-full border border-rule px-2 py-0.5">
                    <RefText text={r} />
                  </span>
                ))}
              </div>
              {t.note && (
                <p className="flex gap-2 border-t border-rule px-4 py-2 font-sans text-[12px] text-ink-soft">
                  <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
                  {t.note}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <p className="font-sans text-[11px] text-ink-soft">
        {traditionsMeta.purpose} {traditionsMeta.spectrumNote} Main sources: {ta.short}: {ta.documents}. {tb.short}: {tb.documents}.
      </p>
    </section>
  );
}
