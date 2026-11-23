import { useEffect, useRef, type ReactNode } from 'react';
import { RefText } from '../ScriptureRef';
import { ArrowLeft, ArrowRight, BookMarked, CalendarRange, ChevronDown, ChevronUp, Gauge, GitCommitVertical, Users, X } from 'lucide-react';
import type { Character, RelType } from '../../characterTypes';
import {
  ERAS,
  PRECISION_LABEL,
  REL_TYPES,
  characterById,
  cssColor,
  edgesFor,
  formatYearRange,
  lineage,
  relCss,
  roleCss,
  twelveSons,
} from '../../lib/characters';

interface Props {
  character: Character;
  activeBook: string | null;
  onClose: () => void;
  onJump: (id: string) => void;
  onBook: (book: string) => void;
  /** e.g. "Back to timeline" — shown as a big button on phones, where the panel covers the screen. */
  backLabel: string;
}

function Section({ icon, title, aside, children }: { icon: ReactNode; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-rule pt-5">
      <h3 className="eyebrow mb-3 flex items-center gap-1.5">
        {icon}
        {title}
        {aside && <span className="ml-auto normal-case tracking-normal">{aside}</span>}
      </h3>
      {children}
    </section>
  );
}

export function CharacterInspector({ character: c, activeBook, onClose, onJump, onBook, backLabel }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [c.id]);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const role = cssColor(roleCss(c.role));
  const era = ERAS.find((e) => e.id === c.era)!;
  const rels = edgesFor(c.id);
  const maxVerses = c.books[0]?.verses ?? 1;

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="char-title"
      className="animate-drawer fixed inset-y-0 right-0 z-50 flex w-full max-w-[28rem] flex-col overflow-y-auto border-l border-rule bg-paper shadow-2xl"
    >
      {/* Phones: the panel fills the screen, so keep an obvious way back pinned to the top. */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-rule bg-paper/95 px-3 py-2 backdrop-blur md:hidden">
        <button
          onClick={onClose}
          className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 font-sans text-sm font-medium text-paper active:opacity-80"
        >
          <ArrowLeft size={16} aria-hidden />
          {backLabel}
        </button>
        <span className="min-w-0 truncate font-sans text-xs text-ink-soft">{c.name}</span>
      </div>
      <div className="relative px-6 pb-5 pt-5" style={{ background: cssColor(roleCss(c.role), 0.12) }}>
        <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: role }} />
        <div className="flex items-center justify-between">
          <span className="eyebrow">
            {c.testament === 'Both' ? 'Old & New Testament' : `${c.testament} Testament`}
          </span>
          <button
            ref={closeRef}
            onClick={onClose}
            className="focus-ring hidden rounded-full p-1.5 hover:bg-ink/10 md:inline-flex"
            aria-label="Close inspector"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
        <h2 id="char-title" className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight">
          {c.name}
        </h2>
        <p className="mt-1 font-serif text-lg italic text-ink-soft">{c.title}</p>
        <div className="mt-3 flex flex-wrap gap-2 font-sans text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-paper" style={{ background: role }}>
            {c.role}
          </span>
          <span className="rounded-full border border-ink/30 px-2.5 py-0.5" title={era.dates}>
            {c.era} · {era.dates}
          </span>
        </div>
      </div>

      <div className="space-y-6 px-6 pb-12 pt-5">
        <p className="text-[17px] leading-relaxed"><RefText text={c.summary} /></p>

        <div className="flex items-start gap-2 rounded-sm border border-rule px-3 py-2.5 font-sans text-sm">
          <CalendarRange size={15} className="mt-0.5 shrink-0 text-ink-soft" aria-hidden />
          <div>
            <div className="font-semibold tabular-nums">
              {c.kind === 'spiritual'
                ? `Appears ${formatYearRange(c.dates.start, c.dates.end)}`
                : `c. ${formatYearRange(c.dates.start, c.dates.end)}`}
            </div>
            <div className="text-xs text-ink-soft">
              {PRECISION_LABEL[c.dates.precision]}
              {c.kind === 'spiritual' && c.appearances ? ` · ${c.appearances.length} narrative years` : ''}
            </div>
            {c.dates.note && <div className="mt-1 text-xs italic text-ink-soft"><RefText text={c.dates.note} /></div>}
          </div>
        </div>

        {(c.id === 'jacob' || twelveSons.some((s) => s.id === c.id)) && (
          <Section
            icon={<Users size={12} aria-hidden />}
            title="Twelve sons of Israel"
            aside={
              c.id !== 'jacob' ? (
                <span className="font-sans text-[11px]" style={{ color: cssColor('--rel-family') }}>
                  son {twelveSons.findIndex((s) => s.id === c.id) + 1} of 12 · mother{' '}
                  {characterById[twelveSons.find((s) => s.id === c.id)!.mother].name}
                </span>
              ) : undefined
            }
          >
            <ol className="space-y-0.5 font-sans text-[13px]">
              {twelveSons.map((s, i) => (
                <li key={s.id}>
                  <button
                    onClick={() => onJump(s.id)}
                    className={`focus-ring grid w-full grid-cols-[1.25rem_1fr_auto] items-baseline gap-2 rounded-sm px-1.5 py-0.5 text-left hover:bg-ink/[0.05] ${
                      s.id === c.id ? 'bg-ink/[0.07] font-semibold' : ''
                    }`}
                  >
                    <span className="text-right text-[10px] tabular-nums" style={{ color: cssColor('--rel-family') }}>
                      {i + 1}
                    </span>
                    <span className="font-display text-[15px] font-semibold">{characterById[s.id].name}</span>
                    <span className="text-[11px] text-ink-soft">{characterById[s.mother].name}</span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-2 font-sans text-[11px] text-ink-soft">
              Birth order per <RefText text="Genesis 29–30, 35" />. Levi became the priestly tribe; Joseph&rsquo;s sons Ephraim and Manasseh
              were later counted as tribes in his place.
            </p>
          </Section>
        )}

        {c.lineage && (
          <Section
            icon={<GitCommitVertical size={12} aria-hidden />}
            title="Line of Jesus"
            aside={
              <span className="font-sans text-[11px]" style={{ color: cssColor('--lineage') }}>
                generation {c.lineage.generation} of {lineage.length}
              </span>
            }
          >
            {c.lineage.note && <p className="mb-2 font-sans text-xs italic text-ink-soft"><RefText text={c.lineage.note} /></p>}
            {c.id === 'jesus' ? (
              <ol className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-sans text-[13px]">
                {lineage.map((id, i) => (
                  <li key={id}>
                    <button
                      onClick={() => onJump(id)}
                      className="focus-ring flex w-full items-baseline gap-1.5 rounded-sm px-1 py-0.5 text-left hover:bg-ink/[0.05]"
                    >
                      <span className="w-5 shrink-0 text-right text-[10px] tabular-nums text-ink-soft">{i + 1}</span>
                      <span className={`truncate ${characterById[id].lineage?.note ? 'italic' : ''}`}>{characterById[id].name}</span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex flex-col gap-1 font-sans text-sm">
                {[
                  { id: lineage[c.lineage.generation - 2], icon: <ChevronUp size={14} />, label: 'Father in the line' },
                  { id: lineage[c.lineage.generation], icon: <ChevronDown size={14} />, label: 'Son in the line' },
                ]
                  .filter((x) => x.id)
                  .map((x) => (
                    <button
                      key={x.label}
                      onClick={() => onJump(x.id)}
                      className="focus-ring flex items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-ink/[0.05]"
                    >
                      <span style={{ color: cssColor('--lineage') }}>{x.icon}</span>
                      <span className="text-ink-soft">{x.label}:</span>
                      <span className="font-display text-base font-semibold">{characterById[x.id].name}</span>
                    </button>
                  ))}
                <button
                  onClick={() => onJump('jesus')}
                  className="focus-ring mt-1 self-start rounded-full border px-2.5 py-0.5 text-xs hover:bg-ink/[0.05]"
                  style={{ borderColor: cssColor('--lineage'), color: cssColor('--lineage') }}
                >
                  See the full line →
                </button>
              </div>
            )}
          </Section>
        )}

        <dl className="grid grid-cols-3 gap-3">
          {[
            { k: 'Prominence', v: c.prominenceScore },
            { k: 'Verses', v: c.verseCount },
            { k: 'Books', v: c.books.length },
          ].map((s) => (
            <div key={s.k} className="rounded-sm border border-rule p-3">
              <dt className="eyebrow !tracking-[0.08em]">{s.k}</dt>
              <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">{s.v}</dd>
            </div>
          ))}
        </dl>
        <div className="-mt-3" aria-hidden>
          <div className="flex items-center gap-2 font-sans text-[11px] text-ink-soft">
            <Gauge size={12} />
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full" style={{ width: `${c.prominenceScore}%`, background: role }} />
            </div>
            {c.prominenceScore}/100
          </div>
        </div>

        <Section
          icon={<BookMarked size={12} aria-hidden />}
          title="Books they appear in"
          aside={<span className="font-sans text-[11px] text-ink-soft">click to filter</span>}
        >
          {c.books.length === 0 ? (
            <p className="font-sans text-sm text-ink-soft">No tagged verses in the dataset.</p>
          ) : (
            <ul className="space-y-1">
              {c.books.map((b) => (
                <li key={b.book}>
                  <button
                    onClick={() => onBook(b.book)}
                    aria-pressed={activeBook === b.book}
                    className={`focus-ring grid w-full grid-cols-[7.5rem_1fr_auto] items-center gap-3 rounded-sm px-2 py-1 text-left font-sans text-sm hover:bg-ink/[0.05] ${
                      activeBook === b.book ? 'bg-ink/[0.08] font-semibold' : ''
                    }`}
                  >
                    <span className="truncate">{b.book}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-ink/[0.07]">
                      <span className="block h-full rounded-full" style={{ width: `${(b.verses / maxVerses) * 100}%`, background: role }} />
                    </span>
                    <span className="text-right text-xs tabular-nums text-ink-soft">
                      {b.verses} vv · {b.chapters} ch
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section icon={<Users size={12} aria-hidden />} title={`Key relationships (${rels.length})`}>
          {rels.length === 0 ? (
            <p className="font-sans text-sm text-ink-soft">
              No direct relationships with the other characters in this set.
            </p>
          ) : (
            <div className="space-y-4">
              {REL_TYPES.map((t) => {
                const group = rels.filter((r) => r.edge.type === (t.id as RelType));
                if (!group.length) return null;
                return (
                  <div key={t.id}>
                    <div className="mb-1.5 flex items-center gap-1.5 font-sans text-xs font-semibold" style={{ color: cssColor(relCss(t.id)) }}>
                      <span className="h-0.5 w-4" style={{ background: cssColor(relCss(t.id)) }} />
                      {t.id}
                    </div>
                    <ul className="space-y-1">
                      {group.map(({ edge, otherId, outgoing }) => {
                        const other = characterById[otherId];
                        return (
                          <li key={edge.key}>
                            <button
                              onClick={() => onJump(otherId)}
                              className="focus-ring group flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-ink/[0.05]"
                              title={`${characterById[edge.sourceId].name} → ${edge.label} → ${characterById[edge.targetId].name}`}
                            >
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: cssColor(roleCss(other.role)) }} />
                              <span className="min-w-0 flex-1 font-sans text-sm">
                                {outgoing ? (
                                  <>
                                    <span className="text-ink-soft">{edge.label}</span>{' '}
                                    <span className="font-display text-base font-semibold">{other.name}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-display text-base font-semibold">{other.name}</span>{' '}
                                    <span className="text-ink-soft">{edge.label.toLowerCase()} {c.name.split(' ')[0]}</span>
                                  </>
                                )}
                              </span>
                              {outgoing ? (
                                <ArrowRight size={14} className="shrink-0 text-ink-soft opacity-0 group-hover:opacity-100" aria-hidden />
                              ) : (
                                <ArrowLeft size={14} className="shrink-0 text-ink-soft opacity-0 group-hover:opacity-100" aria-hidden />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <p className="border-t border-rule pt-4 font-sans text-[11px] leading-relaxed text-ink-soft">
          Verse and book counts from Theographic person{' '}
          <code className="rounded bg-ink/[0.06] px-1">{c.theographicId}</code>.
        </p>
        <button
          onClick={onClose}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-full border border-ink py-3 font-sans text-sm font-medium hover:bg-ink/5 active:bg-ink/10"
        >
          <ArrowLeft size={16} aria-hidden />
          {backLabel}
        </button>
      </div>
    </aside>
  );
}
