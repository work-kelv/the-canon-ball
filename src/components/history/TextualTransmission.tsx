import { Fragment, useState } from 'react';
import { cssColor } from '../../lib/characters';
import { KIND_INFO, type MilestoneKind, navigation } from '../../lib/history';
import { Segmented } from '../characters/controls';
import { KindBadge } from './TranslationTimeline';
import { Fold } from '../sections';

type View = 'ancient' | 'scribal' | 'modern';
const { sample } = navigation;

const kindOf = (c: string): MilestoneKind => (c === 'chapters' ? 'nav-chapters' : c === 'verses' ? 'nav-verses' : 'nav-manuscript');

/** Greek uncials with nomina sacra (ΘΝ, ΘΣ) drawn with the scribal overline. */
function Uncials({ text }: { text: string }) {
  const parts = text.split(new RegExp(`(${sample.nominaSacra.join('|')})`));
  return (
    <>
      {parts.map((p, i) =>
        sample.nominaSacra.includes(p) ? (
          <span key={i} className="relative inline-block before:absolute before:inset-x-0 before:top-[0.08em] before:h-[2px] before:bg-current" title="Nomen sacrum: an abbreviated sacred name (ΘΝ = θεόν, ΘΣ = θεός)">
            {p}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

export function TextualTransmission() {
  const [view, setView] = useState<View>('ancient');
  const englishContinuous = sample.verses
    .map((v) => v.text)
    .join('')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');

  return (
    <div className="space-y-5">
      <Segmented<View>
        label="Page layout"
        value={view}
        onChange={setView}
        options={[
          { id: 'ancient', label: '1 · Ancient manuscript' },
          { id: 'scribal', label: '2 · Scribal sections' },
          { id: 'modern', label: '3 · Chapter & verse' },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,30rem)_1fr]">
        {/* The "page" */}
        <div
          className="relative overflow-hidden rounded-sm border border-rule px-6 py-6 shadow-inner"
          style={{ background: `linear-gradient(180deg, ${cssColor('--paper-2')}, ${cssColor('--paper')})` }}
        >
          {view === 'ancient' && (
            <div>
              <p className="break-all font-serif text-[21px] leading-[1.55] tracking-[0.08em] text-ink" lang="grc">
                <Uncials text={sample.greekUncial} />
              </p>
              <hr className="my-4 border-rule" />
              <p className="break-all font-serif text-[13px] uppercase leading-relaxed tracking-[0.12em] text-ink-soft">{englishContinuous}</p>
            </div>
          )}
          {view === 'scribal' && (
            <div className="grid grid-cols-[2.25rem_1fr] gap-x-3">
              <div className="pt-0.5 text-center font-serif text-[13px] leading-tight" style={{ color: cssColor('--lineage') }} title="Section number with its canon-table reference beneath">
                <div className="font-semibold">§1</div>
                <div className="border-t border-current pt-0.5 text-[12px]">x</div>
              </div>
              <div className="space-y-0.5 font-serif text-[16.5px] leading-snug">
                {sample.senseLines.map((l, i) => (
                  <p key={i} className={/^[A-Z]/.test(l) && i > 0 && sample.senseLines[i - 1].endsWith('.') ? 'pt-2' : ''}>
                    {l}
                  </p>
                ))}
              </div>
            </div>
          )}
          {view === 'modern' && (
            <div>
              <h3 className="mb-2 font-display text-xl font-semibold">John 1</h3>
              <p className="font-serif text-[17px] leading-relaxed">
                {sample.verses.map((v) => (
                  <Fragment key={v.v}>
                    <sup className="mr-0.5 font-sans text-[12px] font-semibold text-ink-soft">{v.v}</sup>
                    {v.text}{' '}
                  </Fragment>
                ))}
              </p>
            </div>
          )}
        </div>

        {/* Explanation */}
        <div className="space-y-3 font-serif text-[15px] leading-relaxed">
          {view === 'ancient' && (
            <>
              <p>
                <b>Scriptio continua.</b> Fourth-century codices such as Sinaiticus were written in Greek capitals (uncials), with no spaces,
                punctuation, verse numbers or lowercase letters. Readers read aloud and worked out the word breaks as they went.
              </p>
              <p>
                Scribes abbreviated sacred names (nomina sacra) with a line above them — here <b>ΘΝ</b> and <b>ΘΣ</b> for “God”. The English
                line beneath imitates the same layout.
              </p>
              <p className="font-sans text-[12px] text-ink-soft">
                The Greek is reconstructed in the style of the 4th-century uncial codices, not copied letter for letter from a particular
                manuscript.
              </p>
            </>
          )}
          {view === 'scribal' && (
            <>
              <p>
                <b>Sense lines and sections.</b> Some manuscripts set the text in short sense-lines (colometry) so a reader could phrase it
                aloud correctly, and counted the lines (stichometry) to check that nothing was lost.
              </p>
              <p>
                In the Gospels, a number in the margin gave the <b>Eusebian section</b>, with the number of a canon table below it. The
                tables at the front of the book listed the parallel sections in the other Gospels — an early cross-reference system.
              </p>
              <p className="font-sans text-[12px] text-ink-soft">The section and canon numbers shown here illustrate the system rather than quote a manuscript.</p>
            </>
          )}
          {view === 'modern' && (
            <>
              <p>
                <b>Chapters and verses.</b> The chapters were added by Stephen Langton in Paris around 1205, and the New Testament verse
                numbers by the printer Robert Estienne in 1551. The Geneva Bible (1560) was the first English Bible to use both, and almost
                every Bible since has followed it.
              </p>
              <p className="font-sans text-[12px] text-ink-soft">Text: {sample.translation}.</p>
            </>
          )}
        </div>
      </div>

      {/* Milestones strip */}
      <Fold
        id="verse-milestones"
        title="Milestones"
        count={navigation.milestones.length}
        summary="From writing without spaces to the first Bible with chapters and verses (1555)."
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(['nav-manuscript', 'nav-chapters', 'nav-verses'] as MilestoneKind[]).map((k) => (
            <KindBadge key={k} kind={k} />
          ))}
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {navigation.milestones.map((m) => {
            const kind = kindOf(m.category);
            return (
              <li
                key={m.id}
                className="rounded-md lg:w-auto border border-rule bg-paper/85 p-3"
                style={{ boxShadow: `inset 0 3px 0 ${cssColor(KIND_INFO[kind].css)}` }}
              >
                <div className="font-sans text-[12px] font-semibold tabular-nums">{m.dateLabel}</div>
                <h4 className="mt-0.5 font-display text-[17px] font-semibold leading-tight">{m.title}</h4>
                <div className="mt-1">
                  <KindBadge kind={kind} />
                </div>
                <p className="mt-1.5 font-serif text-[13.5px] leading-snug">{m.description}</p>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 font-sans text-[12px] text-ink-soft">These milestones also appear in the Translations timeline.</p>
      </Fold>
    </div>
  );
}
