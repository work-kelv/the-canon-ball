import { Fragment, type ReactNode } from 'react';
import { LANGUAGE_INFO, langColor } from '../lib/books';
import type { Language } from '../types';
import { LanguagesArt } from './PageArt';
import { PageIntro } from './PageIntro';
import { RefText } from './ScriptureRef';

const Ref = ({ r, pre = '', post = '' }: { r: string; pre?: string; post?: string }) => (
  <span className="whitespace-nowrap font-sans text-[13px]">
    {pre}
    <RefText text={r} />
    {post}
  </span>
);
/** "(A, B, C and D)" with the brackets attached to the first and last reference. */
const refList = (refs: string[]) =>
  refs.map((r, i) => (
    <Fragment key={r}>
      {i > 0 && (i === refs.length - 1 ? ' and ' : ', ')}
      <Ref r={r} pre={i === 0 ? '(' : ''} post={i === refs.length - 1 ? ')' : ''} />
    </Fragment>
  ));

const native = (lang: Language) => (
  <span className={`${LANGUAGE_INFO[lang].nativeClass} text-[15px] text-ink-soft`} lang={lang === 'Greek' ? 'grc' : 'he'}>
    {LANGUAGE_INFO[lang].native}
  </span>
);

// ── When each language was in use, 1450 BC – AD 100 (dates approximate) ──
const LO = -1450;
const HI = 100;
const pct = (y: number) => `${((y - LO) / (HI - LO)) * 100}%`;
const fmt = (y: number) => (y < 0 ? `${-y} BC` : `AD ${y}`);

const SPANS: { lang: Language; from: number; to: number; label: string; faded?: [number, number] }[] = [
  { lang: 'Hebrew', from: -1400, to: -400, label: 'Hebrew: the Old Testament written' },
  { lang: 'Aramaic', from: -700, to: 100, label: 'Aramaic: language of the empires', faded: [-160, 100] },
  { lang: 'Greek', from: -330, to: 100, label: 'Greek: Alexander to Rome' },
];
const MARKS: { y: number; label: string; row: 0 | 1 }[] = [
  { y: -586, label: 'Exile to Babylon', row: 0 },
  { y: -333, label: 'Alexander the Great', row: 1 },
  { y: -250, label: 'Septuagint', row: 0 },
  { y: 30, label: 'Jesus', row: 1 },
];

function LanguageTimeline() {
  return (
    <figure className="rounded-md border border-rule bg-ink/[0.02] px-3 pb-2 pt-3" aria-label="Timeline: when Hebrew, Aramaic and Greek were the Bible's languages">
      <figcaption className="eyebrow mb-2">Why three languages? The language followed the readers</figcaption>
      <div className="relative">
        {/* marker lines behind the bars */}
        {MARKS.map((m) => (
          <span key={m.y} className="absolute bottom-0 top-0 w-px bg-ink/25" style={{ left: pct(m.y) }} aria-hidden />
        ))}
        <div className="relative space-y-1.5">
          {SPANS.map((s) => (
            <div key={s.lang} className="relative h-6">
              <div
                className="absolute inset-y-0 flex items-center overflow-hidden rounded-full px-2 font-sans text-[11px] font-semibold text-paper"
                style={{
                  left: pct(s.from),
                  width: `calc(${pct(s.to)} - ${pct(s.from)})`,
                  background: s.faded
                    ? `linear-gradient(90deg, ${langColor(s.lang)} 0%, ${langColor(s.lang)} ${((s.faded[0] - s.from) / (s.to - s.from)) * 100}%, ${langColor(s.lang, 0.45)} 100%)`
                    : langColor(s.lang),
                }}
                title={`${s.label} (c. ${fmt(s.from)} – ${fmt(s.to)})`}
              >
                <span className="truncate sm:hidden">{s.lang}</span>
                <span className="hidden truncate sm:inline">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* marker labels: two rows on wide screens, one row each on phones, so neighbours never collide */}
      {([
        ['hidden sm:block h-8', (m: (typeof MARKS)[number]) => (m.row ? 15 : 0)],
        ['sm:hidden h-[3.6rem]', (_m: (typeof MARKS)[number], i: number) => i * 14],
      ] as const).map(([cls, topOf]) => (
        <div key={cls} className={`relative mt-1 font-sans text-[10.5px] leading-tight text-ink-soft ${cls}`}>
          {MARKS.map((m, i) => {
            const right = (m.y - LO) / (HI - LO) > 0.5;
            return (
              <span
                key={m.y}
                className={`absolute whitespace-nowrap ${right ? '-translate-x-full pr-1 text-right' : 'pl-1'}`}
                style={{ left: pct(m.y), top: topOf(m, i) }}
              >
                {m.label} <span className="tabular-nums opacity-80">{fmt(m.y)}</span>
              </span>
            );
          })}
        </div>
      ))}
      <div className="relative h-4 border-t border-rule font-sans text-[10px] tabular-nums text-ink-soft">
        {[-1400, -1000, -500, 1].map((y, i, a) => (
          <span
            key={y}
            className={`absolute top-1 whitespace-nowrap ${i === 0 ? '' : i === a.length - 1 ? '-translate-x-full' : '-translate-x-1/2'}`}
            style={{ left: pct(y) }}
          >
            {y === 1 ? 'AD 1' : fmt(y)}
          </span>
        ))}
      </div>
    </figure>
  );
}

const why = (title: string, body: ReactNode) => (
  <>
    <span className="font-semibold">{title}</span> {body}
  </>
);

export function LanguagesIntro() {
  return (
    <PageIntro
      storageKey="languages-intro"
      moreLabel="Why three languages? How to read the grid"
      className="mb-5"
      css="--hebrew"
      art={<LanguagesArt />}
      lead={
        <>
        <p>
          The Bible has two parts. The <b>Old Testament</b> (39 books) is the Scriptures of Israel, written before Jesus was born; the <b>New Testament</b> (27 books) was written by his first followers in the decades after his death and resurrection. These 66 books are shared by every church; Catholic, Orthodox and Ethiopian Bibles add some further books, explained under{' '}
          <a href="#canon" className="font-medium underline decoration-rule underline-offset-2 hover:decoration-ink">Which books?</a>.
        </p>
        <p className="mt-2">
          The Bible was not first written in English. Its 66 books were written over some 1,500 years in three languages: Hebrew,
          Aramaic and Greek. Each was the language its first readers understood, so the languages change as God’s people moved
          from a small nation to life under great empires, and then to churches spread across the Roman world. Start with
          which language each book was written in, then follow the text as scribes copied it, divided it into chapters and verses,
          and translated it into the world’s languages.
        </p>
        </>
      }
      extra={<LanguageTimeline />}
      cards={[
        {
          title: 'Hebrew',
          css: '--hebrew',
          aside: native('Hebrew'),
          kicker: 'All 39 Old Testament books',
          body: why(
            'Israel’s own language.',
            'From the Law to the Prophets, the Scriptures came to Israel in the language of its homes, its worship and its courts, and were written down over about a thousand years.',
          ),
        },
        {
          title: 'Aramaic',
          css: '--aramaic',
          aside: native('Aramaic'),
          kicker: 'Parts of four Old Testament books',
          body: why(
            'The language of empires.',
            <>
              By 700 BC Aramaic was the diplomats’ language <Ref r="2 Kings 18:26" pre="(" post=")" />, and under Babylon and Persia it became the
              empire’s official tongue. So the Aramaic chapters are where the Bible deals with the nations: the Persian kings’
              letters and decrees copied into Ezra, Daniel’s visions of the world empires, a message to the nations, and Laban’s
              name for a heap of stones {refList(['Ezra 4:8–6:18', 'Daniel 2:4–7:28', 'Jeremiah 10:11', 'Genesis 31:47'])}. By
              Jesus’ day it was what people spoke at home: “Talitha koum” <Ref r="Mark 5:41" pre="(" post=")" />.
            </>,
          ),
        },
        {
          title: 'Greek',
          css: '--greek',
          aside: native('Greek'),
          kicker: 'All 27 New Testament books',
          body: why(
            'The language everyone shared.',
            'After Alexander the Great, Koine (“common”) Greek was spoken from Rome to Egypt, and Jews abroad already read their Scriptures in Greek, in the Septuagint. Writing to churches in Rome, Corinth and Asia Minor, the apostles used the one language they all knew, translating Jesus’ Aramaic words for their readers.',
          ),
        },
      ]}
      afterCards={
        <p className="rounded-md px-3.5 py-2.5 font-serif text-[15px] leading-relaxed" style={{ background: langColor('Greek', 0.06) }}>
          <b>The thread running through all three:</b> God’s word reaches people in a language they understand. The sign on the
          cross was written in Hebrew, Latin and Greek <Ref r="John 19:20" pre="(" post=")" />; at Pentecost each listener heard “in our own
          language” <Ref r="Acts 2:8" pre="(" post=")" />; and Revelation pictures worshippers “from every nation, tribe, people and language”
          {' '}<Ref r="Revelation 7:9" pre="(" post=")" />. Translation has continued ever since; see{' '}
          <a href="#translations" className="underline decoration-rule underline-offset-2 hover:decoration-ink">
            the Translations tab
          </a>
          .
        </p>
      }
      howTo={[
        <>
          <b>Each tile is a book</b>, in Bible order, grouped by section (Law, History, Prophets, Gospels, Letters…).
        </>,
        <>
          <b>Colour is the language.</b> A book with Aramaic passages gets an Aramaic corner, sized to its share; a ✚ marks Aramaic
          words quoted in a Greek book.
        </>,
        <>
          <b>A darker tile has more chapters</b>: Psalms (150) is darkest, Obadiah and Jude (1) the palest.
        </>,
        <>
          <b>Tap a book</b> for its exact language passages, dates and key words in the original.
        </>,
        <>
          <b>Filters</b> above pick out a language; tap a section name to focus on it.
        </>,
        <>
          <b>Breakdown</b> (top) totals each language by section, measured in chapters.
        </>,
      ]}
    />
  );
}
