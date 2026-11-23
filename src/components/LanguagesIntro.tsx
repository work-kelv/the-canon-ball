import { Fragment } from 'react';
import { LANGUAGE_INFO } from '../lib/books';
import type { Language } from '../types';
import { LanguagesArt } from './PageArt';
import { PageIntro } from './PageIntro';
import { RefText } from './ScriptureRef';

const Ref = ({ r }: { r: string }) => (
  <span className="whitespace-nowrap font-sans text-[13px]">
    <RefText text={r} />
  </span>
);

const ARAMAIC_REFS = ['Daniel 2:4–7:28', 'Ezra 4:8–6:18', 'Ezra 7:12–26', 'Jeremiah 10:11', 'Genesis 31:47'];

const native = (lang: Language) => (
  <span className={`${LANGUAGE_INFO[lang].nativeClass} text-[15px] text-ink-soft`} lang={lang === 'Greek' ? 'grc' : 'he'}>
    {LANGUAGE_INFO[lang].native}
  </span>
);

export function LanguagesIntro() {
  return (
    <PageIntro
      storageKey="languages-intro-hidden"
      className="mb-8"
      css="--hebrew"
      art={<LanguagesArt />}
      lead={
        <p>
          The Bible was not first written in English. Its 66 books were written over some 1,500 years in three languages. This page
          shows which language each book was written in, and how much of it, so you can see at a glance where the Hebrew Scriptures
          end, where Aramaic appears, and where the Greek New Testament begins. The picture shows all 66 books as bars, coloured by
          language.
        </p>
      }
      cards={[
        {
          title: 'Hebrew',
          css: '--hebrew',
          aside: native('Hebrew'),
          kicker: 'All 39 Old Testament books',
          body: 'The language of ancient Israel, in which almost the whole Old Testament was written over about a thousand years.',
        },
        {
          title: 'Aramaic',
          css: '--aramaic',
          aside: native('Aramaic'),
          kicker: 'Parts of four Old Testament books',
          body: (
            <>
              The shared language of the Assyrian and Persian empires, and the everyday language of Jesus’ time. Found in{' '}
              {ARAMAIC_REFS.map((r, i) => (
                <Fragment key={r}>
                  {i > 0 && (i === ARAMAIC_REFS.length - 1 ? ' and ' : ', ')}
                  <Ref r={r} />
                </Fragment>
              ))}
              . Aramaic words also appear inside the Greek New Testament, such as “Talitha koum” in <Ref r="Mark 5:41" />.
            </>
          ),
        },
        {
          title: 'Greek',
          css: '--greek',
          aside: native('Greek'),
          kicker: 'All 27 New Testament books',
          body: 'Koine, the “common” Greek spread by Alexander’s conquests and spoken across the Roman world, so the apostles’ letters could travel everywhere.',
        },
      ]}
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
