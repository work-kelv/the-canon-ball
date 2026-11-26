import { LanguagesIntro } from './LanguagesIntro';
import { LanguagesSections } from './LanguagesPage';
import { CanonPage } from './CanonPage';
import { TextualTransmission } from './history/TextualTransmission';
import { TranslationTimeline } from './history/TranslationTimeline';
import { NextPage, OnThisPage, PageSection, useSectionHash, type SectionDef } from './sections';

/**
 * The Bible as a text, in the order it happened, on one continuous page: written in three languages
 * over many centuries, gathered into a canon (66 books, with the further books other churches keep),
 * copied by hand and divided into chapters and verses, then translated into the world's languages.
 */
const SECTIONS: SectionDef[] = [
  { id: 'languages', label: 'The 66 books and their languages', short: 'Languages' },
  { id: 'timeline', label: 'When the books were written', short: 'When written' },
  { id: 'canon', label: 'Which books are in the Bible?', short: 'Which books?' },
  { id: 'verses', label: 'From scrolls to chapters & verses', short: 'Chapters & verses' },
  { id: 'translations', label: 'Translations', short: 'Translations' },
  { id: 'references', label: 'References', short: 'References' },
];

export function BiblePage() {
  useSectionHash();
  return (
    <div className="pt-6">
      <div className="mb-6">
        <LanguagesIntro />
      </div>
      <OnThisPage sections={SECTIONS} label="On this page" />

      <LanguagesSections />

      <PageSection
        id="canon"
        n={3}
        title="Which books are in the Bible?"
        lead="All Christians share the same 66 books. Catholic, Orthodox and Ethiopian Bibles add further books, nearly all in the Old Testament. Here are the extra books and why Protestant churches keep to 66."
        takeaway="All churches share the same 66 books; Catholic, Orthodox and Ethiopian Bibles add more, and this site follows the shared 66."
      >
        <CanonPage />
      </PageSection>

      <PageSection
        id="verses"
        n={4}
        title="From ancient scrolls to chapters and verses"
        lead="The biblical authors wrote without chapters or verse numbers. See how the same passage, John 1:1–5, looked to readers in three periods, and how Scripture came to be divided."
        takeaway="Chapters date from about 1205 and verse numbers from 1551; the authors wrote without either."
      >
        <TextualTransmission />
      </PageSection>

      <PageSection
        id="translations"
        n={5}
        title="How the Bible reached the world’s languages"
        lead="From the Septuagint to today’s translation movement, with the manuscript discoveries that confirmed the text and the inventions that gave us chapters and verses."
        takeaway="Translation has been part of the church’s life from the start; today almost everyone has some Scripture in a language they understand."
      >
        <TranslationTimeline />
      </PageSection>

      <NextPage href="characters.html" label="Characters" blurb="The people of the Bible, on a timeline" />
    </div>
  );
}
