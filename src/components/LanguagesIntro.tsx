import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { LANGUAGE_INFO, langColor } from '../lib/books';
import { RefText } from './ScriptureRef';

const KEY = 'languages-intro-hidden';

const LANGS = [
  {
    lang: 'Hebrew' as const,
    where: 'All 39 Old Testament books',
    text: 'The language of ancient Israel, in which almost the whole Old Testament was written over about a thousand years.',
  },
  {
    lang: 'Aramaic' as const,
    where: 'Parts of four Old Testament books',
    text: 'The shared language of the Assyrian and Persian empires, and the everyday language of Jesus’ time. Found in',
    refs: ['Daniel 2:4–7:28', 'Ezra 4:8–6:18', 'Ezra 7:12–26', 'Jeremiah 10:11', 'Genesis 31:47'],
    after: 'Aramaic words also appear inside the Greek New Testament, such as “Talitha koum” in',
    afterRef: 'Mark 5:41',
  },
  {
    lang: 'Greek' as const,
    where: 'All 27 New Testament books',
    text: 'Koine, the “common” Greek spread by Alexander’s conquests and spoken across the Roman world, so the apostles’ letters could travel everywhere.',
  },
];

/** A short orientation for the Languages page: what the colours mean and how to use the views. Can be folded away. */
export function LanguagesIntro() {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });
  const toggle = () => {
    const next = !hidden;
    setHidden(next);
    try {
      localStorage.setItem(KEY, next ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <section aria-labelledby="lang-intro" className="mb-8 rounded-md border border-rule bg-paper/80">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h2 id="lang-intro" className="flex items-center gap-2 font-display text-xl font-semibold">
          <Info size={17} className="text-ink-soft" aria-hidden />
          What you’re looking at
        </h2>
        <button
          onClick={toggle}
          aria-expanded={!hidden}
          className="focus-ring inline-flex items-center gap-1 rounded-full border border-rule px-2.5 py-1 font-sans text-[12px] text-ink-soft hover:border-ink/50 hover:text-ink"
        >
          {hidden ? (
            <>
              Show <ChevronDown size={13} aria-hidden />
            </>
          ) : (
            <>
              Hide <ChevronUp size={13} aria-hidden />
            </>
          )}
        </button>
      </div>

      {!hidden && (
        <div className="space-y-4 border-t border-rule px-4 pb-4 pt-3">
          <p className="max-w-3xl font-serif text-[16px] leading-relaxed">
            The Bible was not first written in English. Its 66 books were written over some 1,500 years in three languages. This
            page shows which language each book was written in, and how much of it, so you can see at a glance where the Hebrew
            Scriptures end, where Aramaic appears, and where the Greek New Testament begins.
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            {LANGS.map(({ lang, where, text, refs, after, afterRef }) => {
              const info = LANGUAGE_INFO[lang];
              return (
                <div key={lang} className="rounded-md border border-rule px-3.5 py-3" style={{ boxShadow: `inset 3px 0 0 ${langColor(lang)}` }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-lg font-semibold" style={{ color: langColor(lang) }}>
                      {lang}
                    </span>
                    <span className={`${info.nativeClass} text-[15px] text-ink-soft`} lang={lang === 'Greek' ? 'grc' : 'he'}>
                      {info.native}
                    </span>
                  </div>
                  <div className="font-sans text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{where}</div>
                  <p className="mt-1 font-serif text-[14.5px] leading-snug">
                    {text}
                    {refs && (
                      <>
                        {' '}
                        {refs.map((r, i) => (
                          <span key={r}>
                            {i > 0 && (i === refs.length - 1 ? ' and ' : ', ')}
                            <span className="whitespace-nowrap font-sans text-[13px]">
                              <RefText text={r} />
                            </span>
                          </span>
                        ))}
                        .
                      </>
                    )}
                    {after && (
                      <>
                        {' '}
                        {after}{' '}
                        <span className="whitespace-nowrap font-sans text-[13px]">
                          <RefText text={afterRef!} />
                        </span>
                        .
                      </>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="eyebrow mb-1.5">How to read it</h3>
            <ul className="grid gap-x-6 gap-y-1 font-sans text-[13px] leading-snug sm:grid-cols-2">
              <li>
                • <b>Each tile is a book</b>, in Bible order, grouped by section (Law, History, Prophets, Gospels, Letters…).
              </li>
              <li>
                • <b>Colour is the language</b>. A book with Aramaic passages gets an Aramaic corner, sized to its share; a ✚ marks
                Aramaic words quoted in a Greek book.
              </li>
              <li>
                • <b>A darker tile has more chapters</b>: Psalms (150) is darkest, Obadiah and Jude (1) the palest.
              </li>
              <li>
                • <b>Tap a book</b> for its exact language passages, dates and key words in the original.
              </li>
              <li>
                • <b>Filters</b> above pick out a language; tap a section name to focus on it.
              </li>
              <li>
                • <b>Breakdown</b> (top) totals each language by section, measured in chapters.
              </li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
