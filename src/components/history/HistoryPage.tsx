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
import { Fold, NextPage, OnThisPage, PageSection, jumpTo, useSectionHash, type SectionDef } from '../sections';

/**
 * Church history as one page, in learning order: the overview; the people; what the early church
 * agreed to believe; how it split; how the traditions differ today; who shares the core faith; and
 * who's who. Section ids keep the old tab links working (#creeds, #creeds-read, #compare …).
 */
const SECTIONS: SectionDef[] = [
  { id: 'start', label: 'Church history, simply told', short: 'Start here' },
  { id: 'people', label: 'From Jesus to today', short: 'Key people' },
  { id: 'creeds', label: 'The four creeds', short: 'Creeds' },
  { id: 'tree', label: 'The family tree', short: 'Family tree' },
  { id: 'traditions', label: 'How the four families differ', short: 'Differences' },
  { id: 'compare', label: 'Core beliefs', short: 'Core beliefs' },
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

  return (
    <div className="pt-6">
      <HistoryIntro />
      <OnThisPage sections={SECTIONS} label="On this page" />

      <PageSection
        id="start"
        n={1}
        first
        title="Church history, simply told"
        lead="Two thousand years in six short steps. Each step gives its key idea; open it for more, or jump to the section that explores it in depth."
        takeaway="One church at Pentecost; splits in 431, 451 and 1054; the Reformation from 1517; and one core faith shared by the churches today."
      >
        <StartHere go={go} />
      </PageSection>

      <PageSection
        id="people"
        n={2}
        title="From Jesus to today"
        lead="The key people of the church, era by era: the apostles, the early church fathers, the councils, the Reformers and the missionaries, down to our own time. Tap anyone to see who they were and how they pointed to Jesus."
        takeaway="A cloud of witnesses, each at their best pointing beyond themselves to Jesus."
      >
        <KeyPeople />
      </PageSection>

      <PageSection
        id="creeds"
        n={3}
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

      <PageSection
        id="tree"
        n={4}
        title="The family tree of the church"
        lead="Major schisms and reformations from Pentecost to today. Click a branch to see what it shares with all Christians and what is distinctive to it."
        takeaway="From one church at Pentecost to thirteen traditions, through the splits of 431, 451 and 1054 and the Reformation."
      >
        <FamilyTree />
      </PageSection>

      <PageSection
        id="traditions"
        n={5}
        title="How the four families of churches differ"
        lead="Catholic, Eastern Orthodox, Oriental Orthodox and Protestant churches share the same core faith. Here is how they differ, first at a glance, then tradition by tradition."
        takeaway="They agree on the core faith; they differ on authority, salvation, the sacraments, Mary and the saints, and how the church is led."
      >
        <TraditionsCompare />
      </PageSection>

      <PageSection
        id="compare"
        n={6}
        title="Core beliefs: where each church stands"
        lead="At the centre is the faith set out in the historic creeds. The four great families of churches that confess it fill the circle, each with some of its member churches. Movements whose teaching differs on one or more of five core beliefs sit beyond it, farther out the more they differ. Tap anything for details, or turn on a creed to see who confesses it."
        takeaway="The four families share the creeds’ core faith; the movements outside the circle set aside one or more of five core beliefs."
      >
        <div className="space-y-6">
          <BoundaryOrbit />
          <Fold
            id="benchmarks"
            title="In detail: six benchmarks, side by side"
            summary="Historic orthodoxy compared with Arianism, Jehovah’s Witnesses, Latter-day Saints, Oneness Pentecostalism and Christian Science."
          >
            <OrthodoxyMatrix />
          </Fold>
        </div>
      </PageSection>

      <PageSection
        id="titles"
        n={7}
        title="Titles in the church"
        lead={titles.meta.intro}
        takeaway="From pope and patriarch to pastor: each family has its own ladder of offices. Tap a title to read what it means."
      >
        <ChurchTitles />
      </PageSection>

      <NextPage href="languages.html" label="The Bible" blurb="Back to the text itself: its languages, canon and translations" />
    </div>
  );
}
