import { Fragment, useState } from 'react';
import { BookOpenCheck, ChevronDown, ExternalLink, Info } from 'lucide-react';
import { cssColor } from '../../lib/characters';
import {
  type CreedId,
  type CreedRow,
  type CreedStatus,
  type PhraseStatus,
  type Explainer,
  boundaryGroups,
  churchFamilies,
  creedCompare,
  creedLens,
  memberCreeds,
} from '../../lib/history';

/** One accent per creed, used across the comparison. */
export const CREED_CSS: Record<CreedId, string> = {
  apostles: '--role-patriarch',
  nicene: '--role-king',
  chalcedon: '--role-priest',
  athanasian: '--greek',
};

function PhraseMark({ s, css }: { s: PhraseStatus; css: string }) {
  const col = cssColor(css);
  const label = creedCompare.meta.statuses[s];
  if (s === 'absent') return <span className="block h-0.5 w-3 rounded bg-ink/15" aria-label={label} title={label} />;
  return (
    <span
      className="block h-3.5 w-3.5 rounded-full"
      aria-label={label}
      title={label}
      style={s === 'explicit' ? { background: col } : { background: `linear-gradient(90deg, ${col} 50%, transparent 50%)`, boxShadow: `inset 0 0 0 1.5px ${col}` }}
    />
  );
}

/**
 * The four creed statuses, told apart by colour and by shape (for colour-blind readers too):
 * confessed = solid green ✓, agrees = green ring with ◐, not used = dashed grey –, rejects = solid red ✕.
 */
export const STATUS_STYLE: Record<CreedStatus, { css: string; mark: string }> = {
  confessed: { css: '--rel-mentor', mark: '✓' },
  content: { css: '--rel-mentor', mark: '◐' },
  unused: { css: '--ink-soft', mark: '–' },
  rejects: { css: '--rel-rival', mark: '✕' },
};

export function statusLook(s: CreedStatus) {
  const c = (a = 1) => cssColor(STATUS_STYLE[s].css, a);
  switch (s) {
    case 'confessed':
      return { fill: c(), stroke: c(), text: cssColor('--paper'), dash: undefined, opacity: 1 };
    case 'content':
      return { fill: c(0.16), stroke: c(), text: c(), dash: undefined, opacity: 1 };
    case 'unused':
      return { fill: cssColor('--paper'), stroke: c(0.7), text: c(), dash: '3 3', opacity: 0.75 };
    case 'rejects':
      return { fill: c(), stroke: c(), text: cssColor('--paper'), dash: undefined, opacity: 1 };
  }
}

export function CreedStatusMark({ s }: { s: CreedStatus }) {
  const l = statusLook(s);
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold leading-none"
      style={{ color: l.text, background: l.fill, border: `2px ${l.dash ? 'dashed' : 'solid'} ${l.stroke}` }}
      title={creedLens.statuses[s].label}
      aria-label={creedLens.statuses[s].label}
    >
      {STATUS_STYLE[s].mark}
    </span>
  );
}

/**
 * Why some churches (Pentecostal, Baptist and other free churches) do not recite the creeds, though
 * they hold the faith the creeds define. Folded by default; opens in place.
 */
export function NonCreedalExplainer({ label = 'Why don’t some churches recite the creeds?' }: { label?: string }) {
  return <ExplainerBox data={creedLens.nonCreedal} label={label} css="--rel-mentor" />;
}

/** Why the Oriental Orthodox did not accept the Council of Chalcedon (451). */
export function ChalcedonExplainer({ label = 'Why don’t the Oriental Orthodox accept Chalcedon?' }: { label?: string }) {
  return <ExplainerBox data={creedLens.chalcedon} label={label} css="--role-judge" />;
}

function ExplainerBox({ data: n, label, css, defaultOpen = false }: { data: Explainer; label: string; css: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-rule" style={{ background: cssColor(css, 0.05) }}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="focus-ring flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-[13px] font-semibold">
        <BookOpenCheck size={15} style={{ color: cssColor(css) }} aria-hidden />
        <span className="flex-1">{label}</span>
        <ChevronDown size={14} aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-rule px-3 pb-3 pt-3">
          <h4 className="font-display text-lg font-semibold leading-tight">{n.title}</h4>
          <p className="font-serif text-[15px] leading-relaxed">{n.intro}</p>
          <ol className="space-y-2.5">
            {n.reasons.map((r, i) => (
              <li key={r.title} className="grid grid-cols-[1.4rem_1fr] gap-x-2">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full font-sans text-[11px] font-bold text-paper" style={{ background: cssColor(css) }}>
                  {i + 1}
                </span>
                <div>
                  <div className="font-sans text-[13.5px] font-semibold">{r.title}</div>
                  <p className="font-serif text-[14.5px] leading-snug">{r.body}</p>
                  {r.quote && (
                    <blockquote className="mt-1 border-l-2 pl-3 font-serif text-[14.5px] italic leading-snug" style={{ borderColor: cssColor(css, 0.6) }}>
                      “{r.quote}”
                      {r.cite && <span className="mt-0.5 block font-sans text-[11px] not-italic text-ink-soft">{r.cite}</span>}
                    </blockquote>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div>
            <div className="eyebrow mb-1">{n.storyTitle}</div>
            <p className="font-serif text-[14.5px] leading-relaxed">{n.story}</p>
          </div>
          <div>
            <div className="eyebrow mb-1.5">{n.parallel.title}</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[n.parallel.left, n.parallel.right].map((x, i) => (
                <div key={x.label} className="rounded-md border border-rule bg-paper px-3 py-2" style={{ boxShadow: `inset 3px 0 0 ${cssColor(i === 0 ? '--rel-family' : '--greek')}` }}>
                  <div className="font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{x.label}</div>
                  <p className="mt-0.5 font-serif text-[14px] italic leading-snug">“{x.text}”</p>
                </div>
              ))}
            </div>
            <p className="mt-1.5 font-sans text-[12px] text-ink-soft">{n.parallel.note}</p>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 font-sans text-[11.5px]">
            <span className="text-ink-soft">Sources:</span>
            {n.sources.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline decoration-rule underline-offset-2 hover:decoration-ink">
                {s.label} <ExternalLink size={10} aria-hidden />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RowDetail({ row }: { row: CreedRow }) {
  return (
    <div className="space-y-2 bg-ink/[0.025] px-3 py-3">
      {row.note && (
        <p className="flex gap-2 font-sans text-[12.5px] leading-snug text-ink-soft">
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
          {row.note}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {creedCompare.creeds.map((c) => {
          const cell = row.cells[c.id];
          return (
            <div key={c.id} className="rounded-md border border-rule bg-paper px-3 py-2" style={{ boxShadow: `inset 3px 0 0 ${cssColor(CREED_CSS[c.id])}` }}>
              <div className="font-sans text-[11px] font-semibold uppercase tracking-wide" style={{ color: cssColor(CREED_CSS[c.id]) }}>
                {c.short}
              </div>
              {cell.q ? (
                <p className="mt-0.5 font-serif text-[14px] italic leading-snug">“{cell.q}”</p>
              ) : (
                <p className="mt-0.5 font-sans text-[12px] text-ink-soft">Not addressed.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CreedCompare() {
  const [open, setOpen] = useState<string | null>('filioque');
  const creeds = creedCompare.creeds;

  const confessRows = [
    ...churchFamilies.flatMap((f) =>
      f.id === 'protestant'
        ? f.members.map((m) => ({ id: m.id, name: m.name, family: f.name, css: f.css, creeds: memberCreeds(f, m) }))
        : [{ id: f.id, name: f.name, family: f.name, css: f.css, creeds: f.creeds }],
    ),
    ...boundaryGroups.filter((g) => g.creeds).map((g) => ({ id: g.id, name: g.name, family: g.category ?? '', css: g.css, creeds: g.creeds! })),
  ];

  return (
    <section aria-labelledby="cc-title" className="space-y-6">
      <div>
        <h2 id="cc-title" className="font-display text-3xl font-semibold">
          Four creeds compared
        </h2>
        <p className="max-w-3xl font-serif text-[15px] text-ink-soft">
          Each creed answered the questions of its time, so each adds something the earlier ones left open. Here is what they share,
          where they differ, and which churches confess them today.
        </p>
      </div>

      {/* How the creeds grew */}
      <ol className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {creeds.map((c, i) => (
          <li key={c.id} className="relative rounded-md border border-rule bg-paper/85 px-3.5 py-3" style={{ boxShadow: `inset 0 3px 0 ${cssColor(CREED_CSS[c.id])}` }}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-lg font-semibold" style={{ color: cssColor(CREED_CSS[c.id]) }}>
                {c.short}
              </span>
              <span className="font-sans text-[11.5px] font-semibold tabular-nums text-ink-soft">{c.yearLabel}</span>
            </div>
            <div className="font-sans text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">
              {i + 1}. {c.purpose}
            </div>
            <p className="mt-1 font-serif text-[14px] leading-snug">{c.added}</p>
          </li>
        ))}
      </ol>

      {/* What each says */}
      <div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-semibold">What each creed says</h3>
          <div className="flex flex-wrap gap-3 font-sans text-[11.5px] text-ink-soft">
            {(['explicit', 'brief', 'absent'] as PhraseStatus[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <PhraseMark s={s} css="--ink" /> {creedCompare.meta.statuses[s]}
              </span>
            ))}
          </div>
        </div>
        <div className="panel overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_repeat(4,2.75rem)] items-end gap-x-1 border-b border-rule bg-paper px-3 py-2 sm:grid-cols-[minmax(0,1fr)_repeat(4,6.5rem)]">
            <span className="eyebrow">Tap a row for the exact words</span>
            {creeds.map((c) => (
              <span key={c.id} className="text-center font-sans text-[10.5px] font-semibold leading-tight sm:text-[12px]" style={{ color: cssColor(CREED_CSS[c.id]) }}>
                <span className="sm:hidden">{c.short.slice(0, 4)}.</span>
                <span className="hidden sm:inline">{c.short}</span>
              </span>
            ))}
          </div>
          {creedCompare.groups.map((g) => (
            <Fragment key={g.id}>
              <div className="eyebrow border-b border-rule bg-ink/[0.04] px-3 py-1.5">{g.label}</div>
              {g.rows.map((r) => {
                const isOpen = open === r.id;
                return (
                  <div key={r.id} className="border-b border-rule last:border-b-0">
                    <button
                      onClick={() => setOpen(isOpen ? null : r.id)}
                      aria-expanded={isOpen}
                      className={`focus-ring grid w-full grid-cols-[minmax(0,1fr)_repeat(4,2.75rem)] items-center gap-x-1 px-3 py-2 text-left hover:bg-ink/[0.03] sm:grid-cols-[minmax(0,1fr)_repeat(4,6.5rem)] ${isOpen ? 'bg-ink/[0.04]' : ''}`}
                    >
                      <span className="flex items-center gap-1.5 font-serif text-[14.5px] leading-snug">
                        <ChevronDown size={13} aria-hidden className={`shrink-0 text-ink-soft transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        {r.label}
                      </span>
                      {creeds.map((c) => (
                        <span key={c.id} className="flex justify-center">
                          <PhraseMark s={r.cells[c.id].s} css={CREED_CSS[c.id]} />
                        </span>
                      ))}
                    </button>
                    {isOpen && <RowDetail row={r} />}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
        <p className="mt-2 font-sans text-[11px] text-ink-soft">{creedCompare.meta.note}</p>
      </div>

      {/* Who confesses which */}
      <div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-semibold">Who confesses which creed</h3>
          <div className="flex flex-wrap gap-3 font-sans text-[11.5px] text-ink-soft">
            {(Object.keys(STATUS_STYLE) as CreedStatus[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1" title={creedLens.statuses[s].note}>
                <CreedStatusMark s={s} /> {creedLens.statuses[s].label}
              </span>
            ))}
          </div>
        </div>
        <div className="panel overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_repeat(4,2.75rem)] items-end gap-x-1 border-b border-rule px-3 py-2 sm:grid-cols-[minmax(0,1fr)_repeat(4,6.5rem)]">
            <span className="eyebrow">Church or movement</span>
            {creeds.map((c) => (
              <span key={c.id} className="text-center font-sans text-[10.5px] font-semibold leading-tight sm:text-[12px]" style={{ color: cssColor(CREED_CSS[c.id]) }}>
                <span className="sm:hidden">{c.short.slice(0, 4)}.</span>
                <span className="hidden sm:inline">{c.short}</span>
              </span>
            ))}
          </div>
          {confessRows.map((r, i) => (
            <div key={r.id}>
              {(i === 0 || confessRows[i - 1].family !== r.family) && r.family !== r.name && (
                <div className="eyebrow border-b border-rule bg-ink/[0.04] px-3 py-1.5">{r.family}</div>
              )}
              <div className="grid grid-cols-[minmax(0,1fr)_repeat(4,2.75rem)] items-center gap-x-1 border-b border-rule px-3 py-1.5 sm:grid-cols-[minmax(0,1fr)_repeat(4,6.5rem)]">
                <span className="flex items-center gap-2 font-sans text-[13px] font-medium">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: cssColor(r.css) }} />
                  {r.name}
                </span>
                {creeds.map((c) => (
                  <span key={c.id} className="flex justify-center">
                    <CreedStatusMark s={r.creeds[c.id]} />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 font-sans text-[11px] text-ink-soft">
          “Holds its teaching” marks churches that teach the same faith in their own statement of faith rather than reciting the
          historic creed. Within a family, individual churches and congregations vary.
        </p>
        <div className="mt-3 space-y-2">
          <NonCreedalExplainer />
          <ChalcedonExplainer />
        </div>
      </div>
    </section>
  );
}
