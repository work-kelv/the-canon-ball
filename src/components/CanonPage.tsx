import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { cssColor } from '../lib/characters';
import { RefText } from './ScriptureRef';
import { Fold } from './sections';

/**
 * Which books are in the Bible? The 66 books every church shares (and the default on this site),
 * the further books in Catholic, Orthodox and Ethiopian Bibles, and why Protestant churches keep 66.
 */

type ChurchId = 'catholic' | 'orthodox' | 'ethiopian';
type Mark = 'yes' | 'appendix' | 'no';

const CANONS = [
  { id: 'protestant', name: 'Protestant', css: '--greek', ot: 39, nt: 27, total: '66', note: 'The 39 books of the Hebrew Bible and the 27 of the New Testament.' },
  { id: 'catholic', name: 'Catholic', css: '--role-king', ot: 46, nt: 27, total: '73', note: 'Adds seven books and parts of Esther and Daniel, defined at the Council of Trent (1546).' },
  { id: 'orthodox', name: 'Eastern Orthodox', css: '--role-priest', ot: 50, otText: '49–52', nt: 27, total: '76–79', note: 'The Catholic additions plus a few more; the exact list varies a little between churches.' },
  { id: 'ethiopian', name: 'Ethiopian Orthodox', css: '--role-judge', ot: 46, nt: 35, total: '81', note: 'The widest canon: 46 Old Testament and 35 New Testament books, counted in its own way.' },
] as const;

const CHURCHES: { id: ChurchId; short: string; css: string }[] = [
  { id: 'catholic', short: 'Catholic', css: '--role-king' },
  { id: 'orthodox', short: 'Orthodox', css: '--role-priest' },
  { id: 'ethiopian', short: 'Ethiopian', css: '--role-judge' },
];

interface Book {
  name: string;
  date: string;
  about: string;
  in: Record<ChurchId, Mark>;
}

const m = (catholic: Mark, orthodox: Mark, ethiopian: Mark) => ({ catholic, orthodox, ethiopian });

const GROUPS: { title: string; blurb: string; books: Book[] }[] = [
  {
    title: 'The deuterocanonical books',
    blurb:
      'Catholics and Orthodox call these books “deuterocanonical” (a second canon); Protestants call them the Apocrypha. They came into the church through the Greek Old Testament, the Septuagint.',
    books: [
      { name: 'Tobit', date: 'c. 200 BC', about: 'A devout Israelite in exile goes blind; his son Tobias travels with the angel Raphael, marries Sarah and brings home the cure. A story of prayer, almsgiving and family faithfulness.', in: m('yes', 'yes', 'yes') },
      { name: 'Judith', date: 'c. 150 BC', about: 'A widow saves her besieged town by entering the enemy camp and killing the general Holofernes. A story of courage and trust in God.', in: m('yes', 'yes', 'yes') },
      { name: 'Wisdom of Solomon', date: 'c. 50 BC', about: 'Written in Greek, probably in Alexandria. It praises wisdom, speaks of the hope of the righteous after death and retells the Exodus.', in: m('yes', 'yes', 'yes') },
      { name: 'Sirach (Ecclesiasticus)', date: 'c. 180 BC', about: 'Proverbs and teaching by Jesus ben Sira of Jerusalem, translated into Greek by his grandson. Close in style to Proverbs.', in: m('yes', 'yes', 'yes') },
      { name: 'Baruch, with the Letter of Jeremiah', date: '2nd–1st century BC', about: 'Prayers and poems set among the exiles in Babylon and attributed to Jeremiah’s scribe, with a letter warning against idols. Catholic Bibles print the letter as Baruch chapter 6.', in: m('yes', 'yes', 'yes') },
      { name: '1 and 2 Maccabees', date: 'c. 100 BC', about: 'The Jewish revolt against the Seleucid king Antiochus IV (167–160 BC) and the rededication of the Temple remembered at Hanukkah. 2 Maccabees 12 tells of prayer for the dead. The Ethiopian Church has its own three books of Meqabyan instead (below).', in: m('yes', 'yes', 'no') },
      { name: 'Additions to Esther', date: '2nd–1st century BC', about: 'About a hundred verses in the Greek Esther: prayers of Mordecai and Esther, royal letters and a dream. They name God, who is not named in the Hebrew Esther.', in: m('yes', 'yes', 'yes') },
      { name: 'Additions to Daniel', date: '2nd–1st century BC', about: 'The Prayer of Azariah and Song of the Three Young Men (in the furnace), and the stories of Susanna and of Bel and the Dragon.', in: m('yes', 'yes', 'yes') },
    ],
  },
  {
    title: 'Further books in Orthodox Bibles',
    blurb:
      'Eastern Orthodox churches call the books beyond the Hebrew Bible anagignoskomena, “books to be read”. Their Bibles include a few the Catholic Church does not; Catholic Bibles once printed some of them in an appendix.',
    books: [
      { name: '1 Esdras', date: '2nd century BC', about: 'A Greek retelling of the return from exile (2 Chronicles 35–36, Ezra and part of Nehemiah), with the story of three young guards debating what is strongest.', in: m('appendix', 'yes', 'yes') },
      { name: 'Prayer of Manasseh', date: '2nd–1st century BC', about: 'A short prayer of repentance by King Manasseh, who is said to have prayed in captivity (2 Chronicles 33:12–13).', in: m('appendix', 'yes', 'yes') },
      { name: 'Psalm 151', date: 'Before the 1st century', about: 'A psalm of David the shepherd boy and his victory over Goliath. A Hebrew form was found among the Dead Sea Scrolls.', in: m('no', 'yes', 'yes') },
      { name: '3 Maccabees', date: '1st century BC', about: 'Despite its name, set before the Maccabees: the Jews of Egypt are rescued from persecution under Ptolemy IV.', in: m('no', 'yes', 'no') },
      { name: '4 Maccabees', date: '1st century AD', about: 'A reflection on reason ruling over the passions, told through the martyrdoms in 2 Maccabees 7. Printed as an appendix in Greek Bibles.', in: m('no', 'appendix', 'no') },
    ],
  },
  {
    title: 'Books in the Ethiopian Bible',
    blurb:
      'The Ethiopian Orthodox Tewahedo Church kept books that survive complete only, or best, in Ge’ez, the ancient language of Ethiopia. Its own list counts 46 Old Testament and 35 New Testament books, 81 in all.',
    books: [
      { name: '1 Enoch', date: '3rd–1st century BC', about: 'Visions of Enoch, the angels who fell (Genesis 6), the heavens and the coming judgement. Jude 14–15 quotes a line from it.', in: m('no', 'no', 'yes') },
      { name: 'Jubilees', date: 'c. 150 BC', about: 'Genesis and the start of Exodus retold as revealed to Moses on Sinai, arranged in periods of 49 years (jubilees).', in: m('no', 'no', 'yes') },
      { name: '1, 2 and 3 Meqabyan', date: 'Uncertain', about: 'Ethiopian books about faithfulness in times of persecution. Despite the name, they are not the Greek books of Maccabees.', in: m('no', 'no', 'yes') },
      { name: '4 Ezra (Ezra Sutuel)', date: 'c. AD 100', about: 'Ezra’s visions and questions to God after the fall of Jerusalem. Printed as 2 Esdras in the appendix of the Latin Vulgate and in the Anglican Apocrypha.', in: m('appendix', 'no', 'yes') },
      { name: 'Book of Josephus (Josippon)', date: '10th century', about: 'A history of the Jewish people in the Second Temple period, drawn from Josephus.', in: m('no', 'no', 'yes') },
      { name: 'Eight books of church order', date: 'Early centuries AD', about: 'In the Ethiopian New Testament: Sinodos (four books), the Book of the Covenant (two), Clement, and the Didascalia. They cover worship, church order and Christian life.', in: m('no', 'no', 'yes') },
    ],
  },
];

const WHY: { title: string; body: string; quote?: string; cite?: string }[] = [
  {
    title: 'The Old Testament Jesus knew',
    body: 'The Hebrew Bible contains the same 39 books as the Protestant Old Testament; Jewish tradition counts them as 24 by combining some books. Jesus speaks of “the law of Moses, the prophets, and the psalms” (Luke 24:44), and Paul says the Jews “were entrusted with the oracles of God” (Romans 3:2). Protestants take the Old Testament to be the Scriptures of Israel that Jesus and the apostles received.',
  },
  {
    title: 'What the New Testament quotes as Scripture',
    body: 'The New Testament quotes the Old Testament hundreds of times, often with “it is written”. None of those quotations comes from the deuterocanonical books, though there are echoes of them. Jude 14–15 quotes a line from 1 Enoch, which is one reason the Ethiopian Church keeps the book. Other churches read it as Jude quoting a known writing, as Paul quotes Greek poets in Acts 17:28.',
  },
  {
    title: 'Questioned in the early church',
    body: 'Early writers did not all agree. Melito of Sardis (c. 170) travelled east to learn the Old Testament books and listed the Hebrew ones. Athanasius (367) gave the first list of the 27 New Testament books and set the extra Old Testament books apart. Jerome, translating from the Hebrew, called books outside the Hebrew canon “apocrypha”. Augustine and the North African councils of Hippo (393) and Carthage (397) counted them in.',
    quote: 'There are other books besides these not indeed included in the Canon, but appointed by the Fathers to be read by those who newly join us … The Wisdom of Solomon, and the Wisdom of Sirach, and Esther, and Judith, and Tobit.',
    cite: 'Athanasius, Festal Letter 39 (AD 367)',
  },
  {
    title: 'The Reformation drew the line',
    body: 'Luther followed Jerome. His 1534 Bible printed these books in a separate section headed “Apocrypha: books not held equal to Holy Scripture, yet useful and good to read”. Anglicans read them in church but do not base doctrine on them, and the Reformed confessions leave them out altogether. In reply, the Council of Trent (1546) declared the full Catholic list canonical.',
    quote: 'And the other Books (as Hierome saith) the Church doth read for example of life and instruction of manners; but yet doth it not apply them to establish any doctrine.',
    cite: 'Thirty-Nine Articles, Article VI (Church of England, 1571)',
  },
  {
    title: 'Why other churches keep more',
    body: 'Catholic and Orthodox churches point out that the early church read the Old Testament in Greek, in the Septuagint, which contained these books, and read them in worship from the start. The Ethiopian Church kept the books handed down in Ge’ez. For these churches the books belong to the church’s own Bible. They are not later additions.',
  },
  {
    title: 'The 66 are shared by all',
    body: 'Every church accepts the same 39 Old Testament books and the same 27 New Testament books. The disagreement is only about what to add. That is why this site works from the 66: they are the books every tradition reads as Scripture.',
  },
];

const MARK: Record<Mark, { label: string; sym: string }> = {
  yes: { label: 'In the canon', sym: '●' },
  appendix: { label: 'In an appendix', sym: '◐' },
  no: { label: 'Not included', sym: '–' },
};

function MarkCell({ mark, css, church }: { mark: Mark; css: string; church: string }) {
  return (
    <span
      title={`${church}: ${MARK[mark].label.toLowerCase()}`}
      aria-label={`${church}: ${MARK[mark].label.toLowerCase()}`}
      className="inline-flex h-6 w-6 items-center justify-center rounded-full font-sans text-[12px] font-bold"
      style={
        mark === 'yes'
          ? { background: cssColor(css), color: cssColor('--paper') }
          : mark === 'appendix'
            ? { border: `1.5px solid ${cssColor(css)}`, color: cssColor(css) }
            : { color: cssColor('--ink-soft', 0.6) }
      }
    >
      {mark === 'yes' ? '' : MARK[mark].sym}
    </span>
  );
}

function BookRow({ b }: { b: Book }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-t border-rule first:border-t-0">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="focus-ring flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-ink/[0.03]">
        <ChevronDown size={14} aria-hidden className={`shrink-0 text-ink-soft transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="min-w-0 flex-1">
          <span className="font-serif text-[15px] font-semibold">{b.name}</span>
          <span className="ml-2 font-sans text-[12px] text-ink-soft">{b.date}</span>
        </span>
        <span className="flex shrink-0 gap-1.5 sm:gap-4">
          {CHURCHES.map((c) => (
            <span key={c.id} className="flex w-7 justify-center sm:w-16">
              <MarkCell mark={b.in[c.id]} css={c.css} church={c.short} />
            </span>
          ))}
        </span>
      </button>
      {open && (
        <p className="px-3 pb-3 pl-8 font-serif text-[14.5px] leading-relaxed text-ink-soft">
          <RefText text={b.about} />
        </p>
      )}
    </li>
  );
}

export function CanonPage() {
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="space-y-8">

      <p className="flex max-w-3xl items-start gap-2 rounded-md border border-rule bg-paper/80 px-3.5 py-2.5 font-sans text-[13px] leading-relaxed">
        <Info size={15} aria-hidden className="mt-0.5 shrink-0 text-ink-soft" />
        <span>
          <strong>This site uses the 66 books.</strong> The book grid, the characters and the map all follow the 39 + 27 books
          that every church accepts.
        </span>
      </p>

      {/* How many books */}
      <div>
        <h3 className="eyebrow mb-3">How many books?</h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CANONS.map((c) => {
            const max = 85;
            return (
              <li key={c.id} className="rounded-md border border-rule bg-paper/80 p-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-sans text-[13px] font-semibold" style={{ color: cssColor(c.css) }}>
                    {c.name}
                  </span>
                  <span className="font-display text-3xl font-semibold tabular-nums">{c.total}</span>
                </div>
                <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-ink/[0.06]" aria-hidden>
                  <span style={{ width: `${(66 / max) * 100}%`, background: cssColor('--ink', 0.55) }} />
                  <span style={{ width: `${((c.ot + c.nt - 66) / max) * 100}%`, background: cssColor(c.css) }} />
                </div>
                <p className="mt-1 font-sans text-[12px] text-ink-soft">
                  {'otText' in c ? c.otText : c.ot} Old Testament · {c.nt} New Testament
                </p>
                <p className="mt-2 font-serif text-[13.5px] leading-snug text-ink-soft">{c.note}</p>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-[12px] text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full" style={{ background: cssColor('--ink', 0.55) }} /> The shared 66
          </span>
          <span>Coloured: further books</span>
          <span>Book counts depend on how books are grouped, so numbers vary slightly between sources.</span>
        </p>
      </div>

      {/* The further books */}
      <Fold
        id="further-books"
        title="The further books"
        count={GROUPS.reduce((n, g) => n + g.books.length, 0)}
        summary="From Tobit to 1 Enoch: what each book is, and which churches include it. Tap a book to read about it."
      >
        <div className="space-y-5">
          {GROUPS.map((g, gi) => {
            if (gi > 0 && !showAll) return null;
            return (
              <div key={g.title}>
                <h4 className="font-display text-xl font-semibold">{g.title}</h4>
                <p className="mb-2 max-w-3xl font-serif text-[14px] leading-relaxed text-ink-soft">{g.blurb}</p>
                <div className="overflow-hidden rounded-md border border-rule bg-paper/80">
                  <div className="flex items-center gap-2 border-b border-rule bg-ink/[0.03] px-3 py-1.5">
                    <span className="flex-1 font-sans text-[12px] font-semibold uppercase tracking-wide text-ink-soft">Book</span>
                    <span className="flex shrink-0 gap-1.5 sm:gap-4">
                      {CHURCHES.map((c) => (
                        <span key={c.id} className="flex w-7 justify-center font-sans text-[12px] font-semibold sm:w-16" style={{ color: cssColor(c.css) }}>
                          <span className="sm:hidden">{c.short[0]}</span>
                          <span className="hidden sm:inline">{c.short}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                  <ul>
                    {g.books.map((b) => (
                      <BookRow key={b.name} b={b} />
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => setShowAll((s) => !s)}
            aria-expanded={showAll}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-rule px-3.5 py-1.5 font-sans text-[13px] hover:border-ink/60"
          >
            <ChevronDown size={14} aria-hidden className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
            {showAll ? 'Show fewer' : 'Show the Orthodox and Ethiopian books'}
          </button>
          <span className="flex flex-wrap gap-x-3 gap-y-1 font-sans text-[12px] text-ink-soft">
            {(['yes', 'appendix', 'no'] as Mark[]).map((k) => (
              <span key={k} className="inline-flex items-center gap-1">
                <MarkCell mark={k} css="--ink" church="Key" /> {MARK[k].label}
              </span>
            ))}
            <span className="sm:hidden">C Catholic · O Orthodox · E Ethiopian</span>
          </span>
        </div>
      </Fold>

      {/* Why 66 */}
      <div>
        <h3 className="eyebrow mb-1">Why Protestant churches keep 66</h3>
        <p className="mb-3 max-w-3xl font-serif text-[15px] leading-relaxed text-ink-soft">
          Protestants still read these books with interest, and Lutheran and Anglican Bibles often print them between the
          Testaments. The question is whether they are Scripture, on which doctrine can be based. Six points explain the answer.
        </p>
        <ol className="grid gap-3 md:grid-cols-2">
          {WHY.map((w, i) => (
            <li key={w.title} className="rounded-md border border-rule bg-paper/80 p-4">
              <h4 className="flex items-baseline gap-2 font-display text-lg font-semibold">
                <span className="font-sans text-[12px] font-bold tabular-nums text-ink-soft">{i + 1}</span>
                {w.title}
              </h4>
              <p className="mt-1 font-serif text-[14.5px] leading-relaxed">
                <RefText text={w.body} />
              </p>
              {w.quote && (
                <blockquote className="mt-2 border-l-2 border-rule pl-3 font-serif text-[14px] italic leading-relaxed text-ink-soft">
                  “{w.quote}”
                  <footer className="mt-1 font-sans text-[12px] not-italic">{w.cite}</footer>
                </blockquote>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 max-w-3xl font-sans text-[12.5px] leading-relaxed text-ink-soft">
          Does it change any teaching? A little. 2 Maccabees 12 describes prayer and an offering for the dead, which Catholic
          teaching cites in support of purgatory; Protestants, without the book, do not hold that doctrine. The other differences
          between the churches are set out on the{' '}
          <a href="history.html#traditions" className="font-medium text-ink underline decoration-rule underline-offset-2 hover:decoration-ink">
            Church History page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
