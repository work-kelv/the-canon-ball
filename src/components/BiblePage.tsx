import { Languages, ListOrdered, Globe2, Library } from 'lucide-react';
import { CanonPage } from './CanonPage';
import { LanguagesIntro } from './LanguagesIntro';
import { LanguagesPage } from './LanguagesPage';
import { PageTabs, useHashTab } from './PageTabs';
import { PageNav } from './PageNav';
import { TextualTransmission } from './history/TextualTransmission';
import { TranslationTimeline } from './history/TranslationTimeline';

/**
 * The Bible as a text, in the order it happened: written in three languages, gathered into a canon
 * (66 books, with the further books other churches keep), copied by hand and
 * divided into chapters and verses, then translated into the world's languages.
 */
const TABS = [
  { id: 'languages', label: 'Original languages', short: 'Languages', icon: Languages, View: LanguagesPage, blurb: 'The 66 books, their languages and when they were written' },
  { id: 'canon', label: 'Which books?', short: 'Books', icon: Library, View: CanonPage, blurb: 'The 66 books, and the further books other churches keep' },
  { id: 'verses', label: 'Scrolls to chapters & verses', short: 'Verses', icon: ListOrdered, View: TextualTransmission, blurb: 'How the text was copied and divided' },
  { id: 'translations', label: 'Translations', icon: Globe2, View: TranslationTimeline, blurb: 'How the Bible reached the world’s languages' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export function BiblePage() {
  const [tab, setTab] = useHashTab<TabId>(
    TABS.map((t) => t.id),
    'languages',
  );
  const { View } = TABS.find((t) => t.id === tab)!;
  // Change tab and bring the reader back to the top of the new page.
  const go = (id: TabId) => {
    setTab(id);
    requestAnimationFrame(() => document.getElementById('bible-top')?.scrollIntoView({ block: 'start' }));
  };
  return (
    <div className="pt-6">
      <LanguagesIntro />
      <div id="bible-top" />
      <PageTabs label="The Bible" tabs={TABS} value={tab} onChange={setTab}>
        <View />
        <PageNav tabs={TABS} value={tab} go={go} end={{ eyebrow: 'Next page', label: 'Characters', blurb: 'The people of the Bible, on a timeline', href: 'characters.html' }} />
      </PageTabs>
    </div>
  );
}
