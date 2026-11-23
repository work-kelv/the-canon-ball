import { CharactersArt, HistoryArt, MapArt } from './PageArt';
import { PageIntro } from './PageIntro';

/** Introductions for the Characters, Map and Church History pages (Languages has its own in LanguagesIntro). */

export function CharactersIntro() {
  return (
    <PageIntro
      storageKey="characters-intro"
      className="mb-5 mt-6"
      css="--role-king"
      art={<CharactersArt />}
      lead={
        <p>
          From Adam to the early church: see when each person lived, how they were related (as family, mentors, allies or
          rivals), and which books they appear in. Every person links to the verses that mention them.
        </p>
      }
      cards={[
        {
          title: 'Timeline',
          css: '--role-king',
          kicker: 'When they lived',
          body: 'Everyone placed by their years: a single time axis on wide screens, era by era on phones, each era opening with a chart of who lived at the same time.',
        },
        {
          title: 'Network',
          css: '--role-apostle',
          kicker: 'Who knew whom',
          body: '441 relationships drawn as a web. Follow a family line, a mentor and student, or a rivalry from one person to the next.',
        },
        {
          title: 'Directory',
          css: '--role-patriarch',
          kicker: 'Everyone, era by era',
          body: 'A plain list of all the people, grouped by era, for quick browsing and searching.',
        },
      ]}
      howTo={[
        <>
          <b>Colour is a person’s role</b>: patriarch, judge, king, prophet, priest, apostle or other key figure (key on the timeline).
        </>,
        <>
          <b>Line of Jesus</b> highlights the 65 generations from Adam to Jesus.
        </>,
        <>
          <b>Filters</b> narrow by testament, era, book or role; <b>Prominent figures only</b> keeps the best-known 209.
        </>,
        <>
          <b>Tap a person</b> for their story, dates, books, relationships and verses; “Back to timeline” returns you.
        </>,
        <>
          <b>Dates</b> follow Archbishop Ussher’s traditional chronology, so treat early dates as approximate.
        </>,
        <>
          <b>Search</b> finds anyone by name or title.
        </>,
      ]}
    />
  );
}

export function MapIntro() {
  return (
    <PageIntro
      storageKey="map-intro"
      className="mb-4"
      css="--lineage"
      art={<MapArt />}
      lead={
        <p>
          A map of the ancient Mediterranean and Near East. Pick a book or one of the great journeys and watch it unfold stop by
          stop, with the distance travelled and the passage behind each step, or tap any place for its modern site.
        </p>
      }
      cards={[
        {
          title: 'Books',
          css: '--lineage',
          kicker: 'All 66, one at a time',
          body: 'Pick a book to see where it was written and set, its key places, and every journey in it, with its stops and distances.',
        },
        {
          title: 'Great journeys',
          css: '--greek',
          kicker: 'The big routes',
          body: 'Abraham’s migration, the Exodus, the return from exile, Jesus’ ministry and Paul’s missionary journeys, each with a short history.',
        },
        {
          title: 'Places',
          css: '--role-king',
          kicker: 'Every pin',
          body: 'Tap a pin for the site’s modern name and country, the passages where it appears, and links to gazetteers.',
        },
      ]}
      howTo={[
        <>
          <b>▶ plays a journey</b>; <b>Play all</b> plays each journey of a book in turn.
        </>,
        <>
          <b>The map stays pinned</b> while you scroll the list beneath it; tap ⤢ for full screen.
        </>,
        <>
          <b>Drag to pan</b>; pinch, scroll or use + and − to zoom.
        </>,
        <>
          <b>Show modern borders</b> overlays today’s countries.
        </>,
        <>
          <b>Distances</b> are straight lines between stops; the roads and sea routes were longer.
        </>,
        <>
          <b>Some sites are uncertain</b>; their notes say so.
        </>,
      ]}
    />
  );
}

export function HistoryIntro() {
  const tab = (id: string, label: string) => (
    <a href={`#${id}`} className="font-sans text-[13px] font-semibold underline decoration-rule underline-offset-2 hover:decoration-ink">
      {label}
    </a>
  );
  return (
    <PageIntro
      storageKey="history-intro"
      moreLabel="What each tab shows"
      className="mb-5"
      css="--role-priest"
      art={<HistoryArt />}
      lead={
        <p>
          Two thousand years of the church in six views: how it branched into today’s traditions, what unites and divides them, the
          creeds that define the Christian faith and who stands outside them, and how the Bible itself was copied, divided into
          chapters and verses, and translated into the world’s languages.
        </p>
      }
      cards={[
        {
          title: 'The church',
          css: '--role-priest',
          kicker: 'Branches & traditions',
          body: (
            <>
              {tab('tree', 'Family tree')}: the great schisms and reformations, from Pentecost to today. {tab('traditions', 'Traditions')}:
              compare Catholic, Orthodox and Protestant churches on ten questions.
            </>
          ),
        },
        {
          title: 'The faith',
          css: '--role-king',
          kicker: 'Creeds & boundaries',
          body: (
            <>
              {tab('creeds', 'Creeds')}: four historic creeds, line by line, with their Scriptures. {tab('compare', 'Inside & outside')}:
              which movements share that faith, and why others are counted outside it.
            </>
          ),
        },
        {
          title: 'The Book',
          css: '--greek',
          kicker: 'Copying & translating',
          body: (
            <>
              {tab('translations', 'Translations')}: from the Septuagint to today’s 7,000+ languages. {tab('verses', 'Chapters & verses')}:
              how ancient scrolls became numbered verses.
            </>
          ),
        },
      ]}
      howTo={[
        <>
          <b>Switch views</b> with the tabs below; each tab has its own link you can share.
        </>,
        <>
          <b>Tap any underlined reference</b> to read the passage (WEB or BSB).
        </>,
        <>
          <b>Comparisons are descriptive</b>, summarised from each group’s own catechisms, confessions and websites.
        </>,
        <>
          <b>Sources</b> for every view are listed in the References at the bottom.
        </>,
      ]}
    />
  );
}
