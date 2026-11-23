import { Languages, ListOrdered, Globe2 } from 'lucide-react';
import { LanguagesIntro } from './LanguagesIntro';
import { LanguagesPage } from './LanguagesPage';
import { PageTabs, useHashTab } from './PageTabs';
import { TextualTransmission } from './history/TextualTransmission';
import { TranslationTimeline } from './history/TranslationTimeline';

/**
 * The Bible as a text, in the order it happened: written in three languages, copied by hand and
 * divided into chapters and verses, then translated into the world's languages.
 */
const TABS = [
  { id: 'languages', label: 'Original languages', short: 'Languages', icon: Languages, View: LanguagesPage },
  { id: 'verses', label: 'Scrolls to chapters & verses', short: 'Verses', icon: ListOrdered, View: TextualTransmission },
  { id: 'translations', label: 'Translations', icon: Globe2, View: TranslationTimeline },
] as const;
type TabId = (typeof TABS)[number]['id'];

export function BiblePage() {
  const [tab, setTab] = useHashTab<TabId>(
    TABS.map((t) => t.id),
    'languages',
  );
  const { View } = TABS.find((t) => t.id === tab)!;
  return (
    <div className="pt-6">
      <LanguagesIntro />
      <PageTabs label="The Bible" tabs={TABS} value={tab} onChange={setTab}>
        <View />
      </PageTabs>
    </div>
  );
}
