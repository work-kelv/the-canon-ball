import titles from '../../data/churchTitles.json';
import { ChurchTitles } from './ChurchTitles';
import { CreedCompare } from './CreedCompare';
import { FamilyTree } from './FamilyTree';
import { CreedExplorer } from './CreedExplorer';
import { OrthodoxyMatrix } from './OrthodoxyMatrix';
import { TraditionsCompare } from './TraditionsCompare';
import { BoundaryOrbit } from './BoundaryOrbit';
import { StartHere } from './StartHere';
import { KeyPeople } from './KeyPeople';
import { HistoryIntro } from '../PageIntros';
import type React from 'react';
import { Fold, NextPage, OnThisPage, PageSection, jumpTo, useSectionHash, useSections, type SectionDef } from '../sections';
import { Term } from '../LevelSwitch';
import { pick, useLevel } from '../../lib/level';

/**
 * Church history as one page, in learning order: the overview; the people; what the early church
 * agreed to believe; how it split; how the traditions differ today; who shares the core faith; and
 * who's who (titles). Section ids keep the old tab links working (#creeds, #creeds-read, #compare …).
 */
const SECTIONS: SectionDef[] = [
  { id: 'start', label: 'Church history, simply told', short: 'Start here' },
  { id: 'people', label: 'From Jesus to today', short: 'Key people' },
  { id: 'creeds', label: 'The four creeds', short: 'Creeds', min: 'explorer', anchors: ['creeds-read', 'who-confesses'] },
  { id: 'tree', label: 'The family tree', short: 'Family tree' },
  { id: 'traditions', label: 'How the four families differ', short: 'Differences' },
  { id: 'compare', label: 'Core beliefs', short: 'Core beliefs', min: 'explorer', anchors: ['benchmarks'] },
  { id: 'titles', label: 'Titles in the church', short: 'Titles' },
  { id: 'references', label: 'References', short: 'References' },
];

// The text's own history (translations, chapters & verses) moved to The Bible page; keep old links working.
const MOVED: Record<string, string> = { translations: 'languages.html#translations', verses: 'languages.html#verses' };
const redirectMoved = () => {
  const to = MOVED[window.location.hash.slice(1)];
  if (to) window.location.replace(to);
};
redirectMoved();
window.addEventListener('hashchange', redirectMoved);

export function HistoryPage() {
  useSectionHash();
  const go = (id: string) => jumpTo(id, { smooth: true });
  const level = useLevel();
  const sec = useSections(SECTIONS);

  return (
    <div className="pt-6">
      <HistoryIntro />
      <OnThisPage sections={sec.list} label="On this page" />

      {sec.shows('start') && (
      <PageSection
        id="start"
        n={sec.n('start')}
        need={sec.need('start')}
        first
        title="Church history, simply told"
        lead={pick<React.ReactNode>(level, {
          beginner: (
            <>
              The story of the church in five short steps, from Jesus’ first followers to the many churches of today, which still share
              one faith. New words are underlined: tap one to see what it means, such as <Term t="creed">creed</Term> or{' '}
              <Term t="schism">schism</Term>.
            </>
          ),
          scholar: 'Two thousand years in five short steps. Each ends with a link to the section that explores it in depth.',
        })}
        takeaway="One church at Pentecost; splits in 431, 451 and 1054; the Reformation from 1517; and one core faith shared by the churches today."
      >
        <StartHere go={go} />
      </PageSection>
      )}

      {sec.shows('people') && (
      <PageSection
        id="people"
        n={sec.n('people')}
        need={sec.need('people')}
        title="From Jesus to today"
        lead={pick<React.ReactNode>(level, {
          beginner: (
            <>
              The best-known people in church history, from the <Term t="apostle">apostles</Term> to today. Tap anyone to see who they were and
              how they pointed to Jesus.
            </>
          ),
          scholar: 'The key people of the church, era by era: the apostles, the early church fathers, the councils, the Reformers and the missionaries, down to our own time. Tap anyone to see who they were and how they pointed to Jesus.',
        })}
        takeaway="A cloud of witnesses, each at their best pointing beyond themselves to Jesus."
      >
        <KeyPeople />
      </PageSection>
      )}

      {sec.shows('creeds') && (
      <PageSection
        id="creeds"
        n={sec.n('creeds')}
        need={sec.need('creeds')}
        title="The four creeds, compared"
        lead="Each creed answered the questions of its time, so each adds something the earlier ones left open. Here is what they share, where they differ, and which churches confess them today."
        takeaway="The Apostles’ Creed gives the basic faith; Nicaea confesses that the Son is truly God; Chalcedon that Christ is truly God and truly man."
      >
        <div className="space-y-6">
          <CreedCompare />
          <Fold id="creeds-read" title="Read a creed, line by line" summary="Choose a creed and tap any line for the Bible passages behind it and the controversy it answered.">
            <CreedExplorer />
          </Fold>
        </div>
      </PageSection>
      )}

      {sec.shows('tree') && (
      <PageSection
        id="tree"
        n={sec.n('tree')}
        need={sec.need('tree')}
        title="The family tree of the church"
        lead={pick<React.ReactNode>(level, {
          beginner: (
            <>
              How one church became many over two thousand years. Tap a church to see what it shares with all Christians and what makes it
              different. A <Term t="denomination">denomination</Term> is one of these families of churches.
            </>
          ),
          scholar: 'Major schisms and reformations from Pentecost to today. Click a branch to see what it shares with all Christians and what is distinctive to it.',
        })}
        takeaway="From one church at Pentecost to thirteen traditions, through the splits of 431, 451 and 1054 and the Reformation."
      >
        <FamilyTree />
      </PageSection>
      )}

      {sec.shows('traditions') && (
      <PageSection
        id="traditions"
        n={sec.n('traditions')}
        need={sec.need('traditions')}
        title="How the four families of churches differ"
        lead={pick(level, {
          beginner: 'Catholic, Orthodox and Protestant churches share the same core faith. Here are the main ways they differ, side by side. Tap a teaching to read more.',
          scholar: 'Catholic, Eastern Orthodox, Oriental Orthodox and Protestant churches share the same core faith. Here is how they differ, first at a glance, then tradition by tradition.',
        })}
        takeaway="They agree on the core faith; they differ on authority, salvation, the sacraments, Mary and the saints, and how the church is led."
      >
        <TraditionsCompare />
      </PageSection>
      )}

      {sec.shows('compare') && (
      <PageSection
        id="compare"
        n={sec.n('compare')}
        need={sec.need('compare')}
        title="Core beliefs: where each church stands"
        lead="At the centre is the faith set out in the historic creeds. The four great families of churches that confess it fill the circle, each with some of its member churches. Movements whose teaching differs on one or more of five core beliefs sit beyond it, farther out the more they differ. Tap anything for details, or turn on a creed to see who confesses it."
        takeaway="The four families share the creeds’ core faith; the movements outside the circle set aside one or more of five core beliefs."
      >
        <div className="space-y-6">
          <BoundaryOrbit />
          <Fold
            id="benchmarks"
            min="scholar"
            title="In detail: six benchmarks, side by side"
            summary="Historic orthodoxy compared with Arianism, Jehovah’s Witnesses, Latter-day Saints, Oneness Pentecostalism and Christian Science."
          >
            <OrthodoxyMatrix />
          </Fold>
        </div>
      </PageSection>
      )}

      {sec.shows('titles') && (
      <PageSection
        id="titles"
        n={sec.n('titles')}
        need={sec.need('titles')}
        title="Titles in the church"
        lead={titles.meta.intro}
        takeaway="From pope and patriarch to pastor: each family has its own ladder of offices. Tap a title to read what it means."
      >
        <ChurchTitles />
      </PageSection>
      )}

      <NextPage href="languages.html" label="The Bible" blurb="Back to the text itself: its languages, canon and translations" />
    </div>
  );
}
