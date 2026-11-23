// Per-page references. Primary texts, datasets and gazetteers — not Wikipedia.
export interface Reference {
  title: string;
  detail: string;
  url?: string;
  links?: { label: string; url: string }[];
  use: string;
}

export const REFERENCES: Record<'home' | 'languages' | 'characters' | 'map' | 'history', Reference[]> = {
  home: [
    {
      title: 'World English Bible (WEB) and Berean Standard Bible (BSB)',
      detail: 'Both public domain; USFX texts from the open-bibles collection (seven1m/open-bibles)',
      url: 'https://github.com/seven1m/open-bibles',
      use: 'The verse text in every Scripture pop-up on the site.',
    },
    {
      title: 'Theographic Bible Metadata',
      detail: 'Robert Rouse, GitHub repository (CC BY-SA 4.0)',
      url: 'https://github.com/robertrouse/theographic-bible-metadata',
      use: 'People, family links, places and verse tags behind the Characters and Map pages.',
    },
    {
      title: 'OpenBible.info Bible Geocoding Data',
      detail: 'OpenBible.info (CC BY 4.0)',
      url: 'https://www.openbible.info/geo/',
      use: 'Modern identifications of ancient places on the Map page.',
    },
    {
      title: 'The Creeds of Christendom',
      detail: 'Philip Schaff, Christian Classics Ethereal Library',
      url: 'https://www.ccel.org/ccel/schaff/creeds1',
      use: 'The creed texts and much of the church history on the Church History page.',
    },
    {
      title: 'More on each page',
      detail: 'Each page lists the sources it uses in its own References section.',
      use: 'Languages, Characters, Map and Church History each cite their primary texts and datasets.',
    },
  ],
  languages: [
  {
    title: 'World English Bible (WEB) and Berean Standard Bible (BSB)',
    detail: 'Both public domain; USFX texts from the open-bibles collection (seven1m/open-bibles)',
    url: 'https://github.com/seven1m/open-bibles',
    links: [
      { label: 'World English Bible', url: 'https://worldenglish.bible/' },
      { label: 'Berean Standard Bible', url: 'https://berean.bible/' },
    ],
    use: 'The verse text shown when you click any Scripture reference on this page (switch WEB / BSB in the pop-up), and the John 1:1–5 sample on the Scrolls to verses tab (WEB).',
  },
    {
      title: 'Hebrew Bible (Masoretic Text) — Hebrew & Aramaic',
      detail: 'Sefaria, Tanakh text with vocalisation',
      url: 'https://www.sefaria.org/texts/Tanakh',
      links: [
        { label: 'Daniel 2:4', url: 'https://www.sefaria.org/Daniel.2.4' },
        { label: 'Daniel 7:28', url: 'https://www.sefaria.org/Daniel.7.28' },
        { label: 'Ezra 4:8', url: 'https://www.sefaria.org/Ezra.4.8' },
        { label: 'Ezra 6:18', url: 'https://www.sefaria.org/Ezra.6.18' },
        { label: 'Ezra 7:12', url: 'https://www.sefaria.org/Ezra.7.12' },
        { label: 'Jeremiah 10:11', url: 'https://www.sefaria.org/Jeremiah.10.11' },
        { label: 'Genesis 31:47', url: 'https://www.sefaria.org/Genesis.31.47' },
      ],
      use: 'Primary text for every Aramaic passage marked on this page (where the text switches from Hebrew to Aramaic and back).',
    },
    {
      title: 'The Greek New Testament: SBL Edition',
      detail: 'Michael W. Holmes (ed.), Society of Biblical Literature and Logos Bible Software, 2010',
      url: 'https://sblgnt.com/',
      use: 'Primary text for the Koine Greek New Testament and the transliterated Aramaic words (e.g. Mark 5:41; 15:34).',
    },
    {
      title: 'Bible-kjv (King James Version as JSON)',
      detail: 'Arul John, GitHub repository',
      url: 'https://github.com/aruljohn/Bible-kjv',
      use: 'Canonical book order and chapter/verse counts.',
    },
    {
      title: 'Manuscripts of the Bible',
      detail: 'BiblicalTraining.org library article',
      url: 'https://www.biblicaltraining.org/library/manuscripts-of-the-bible',
      use: 'Background on the manuscript tradition and original languages.',
    },
    {
      title: 'Bible translation statistics, 2025',
      detail: 'Wycliffe Global Alliance',
      url: 'https://www.wycliffe.net/resources/statistics/',
      links: [{ label: 'ProgressBible', url: 'https://progress.bible/' }],
      use: '"Scripture today" figures: languages, translations in progress, and access.',
    },
    {
      title: 'The Leon Levy Dead Sea Scrolls Digital Library',
      detail: 'Israel Antiquities Authority',
      url: 'https://www.deadseascrolls.org.il/',
      use: 'Dating and discovery of the Qumran scrolls.',
    },
    {
      title: 'The Text of the New Testament',
      detail: 'Bruce M. Metzger and Bart D. Ehrman, 4th ed., Oxford University Press, 2005',
      use: 'Manuscripts (P52, the great codices), scriptio continua, nomina sacra, Eusebian canons, and the early printed editions.',
    },
    {
      title: 'Codex Sinaiticus Project',
      detail: 'British Library, Leipzig University Library, St Catherine’s Monastery and the National Library of Russia',
      url: 'https://codexsinaiticus.org/',
      use: 'What a 4th-century uncial page looks like (layout of the John 1 sample on the Scrolls to verses tab).',
    },
  ],
  characters: [
  {
    title: 'World English Bible (WEB) and Berean Standard Bible (BSB)',
    detail: 'Both public domain; USFX texts from the open-bibles collection (seven1m/open-bibles)',
    url: 'https://github.com/seven1m/open-bibles',
    links: [
      { label: 'World English Bible', url: 'https://worldenglish.bible/' },
      { label: 'Berean Standard Bible', url: 'https://berean.bible/' },
    ],
    use: 'The verse text shown when you click any Scripture reference on this page (switch WEB / BSB in the pop-up).',
  },
    {
      title: 'Theographic Bible Metadata',
      detail: 'Robert Rouse, GitHub repository (CC BY-SA 4.0) — json/people.json, verses.json, books.json',
      url: 'https://github.com/robertrouse/theographic-bible-metadata',
      use: 'People, family links, the verses each person is tagged in (books, counts, prominence) and birth/death years.',
    },
    {
      title: "Easton's Illustrated Bible Dictionary",
      detail: 'M. G. Easton, 3rd ed., T. Nelson & Sons, 1897 (text carried in the Theographic data)',
      use: 'Background for the character summaries.',
    },
    {
      title: 'The Annals of the World',
      detail: 'James Ussher, 1658 (English translation of Annales Veteris Testamenti, 1650)',
      use: 'The chronology behind Theographic’s dates (creation 4004 BC), used for the timeline.',
    },
    {
      title: 'The Holy Bible, King James Version (1611)',
      detail: 'Verse text and references as tagged in Theographic',
      use: 'Scripture references for relationships, lineage and date corrections.',
    },
    {
      title: 'Character checklist (data-sources/gemini-characters-by-book.json)',
      detail: 'AI-generated list of prominent figures per book, supplied by the site author',
      use: 'Used to find missing characters (every added person was matched to Theographic) and for the “Prominent figures only” filter: the 209 people it names.',
    },
  ],
  map: [
  {
    title: 'World English Bible (WEB) and Berean Standard Bible (BSB)',
    detail: 'Both public domain; USFX texts from the open-bibles collection (seven1m/open-bibles)',
    url: 'https://github.com/seven1m/open-bibles',
    links: [
      { label: 'World English Bible', url: 'https://worldenglish.bible/' },
      { label: 'Berean Standard Bible', url: 'https://berean.bible/' },
    ],
    use: 'The verse text shown when you click any Scripture reference on this page (switch WEB / BSB in the pop-up).',
  },
    {
      title: 'Theographic Bible Metadata',
      detail: 'Robert Rouse, GitHub repository (CC BY-SA 4.0) — json/places.json, verses.json, books.json',
      url: 'https://github.com/robertrouse/theographic-bible-metadata',
      use: 'Places, coordinates and the verses naming them (key locations, mention counts, linked books and people).',
    },
    {
      title: 'OpenBible.info Bible Geocoding Data',
      detail: 'OpenBible.info (CC BY 4.0) — data/ancient.jsonl',
      url: 'https://www.openbible.info/geo/',
      links: [{ label: 'Data repository', url: 'https://github.com/openbibleinfo/Bible-Geocoding-Data' }],
      use: 'Modern identifications of ancient sites (e.g. Jericho = Tell es-Sultan) and per-place links.',
    },
    {
      title: 'Pleiades: a gazetteer of past places',
      detail: 'Institute for the Study of the Ancient World, NYU, and partners',
      url: 'https://pleiades.stoa.org/',
      use: 'Linked from each place card where Theographic records a Pleiades identifier.',
    },
    {
      title: 'Natural Earth (1:50m), via world-atlas',
      detail: 'Natural Earth public-domain map data, packaged as TopoJSON by Mike Bostock',
      url: 'https://www.naturalearthdata.com/',
      links: [{ label: 'world-atlas', url: 'https://github.com/topojson/world-atlas' }],
      use: 'Coastlines, modern borders and the modern country of each pin.',
    },
    {
      title: "Easton's Illustrated Bible Dictionary",
      detail: 'M. G. Easton, 1897 (text carried in the Theographic data)',
      use: 'The short historical note on each place card.',
    },
    {
      title: 'Bible text references',
      detail: 'Acts 13–28; Genesis 11–22; Exodus 12–19; Numbers 13–33; 2 Kings 25; Ezra 1–8; Nehemiah 1–2; the Gospels',
      use: 'Every journey stop cites its passage. Rivers and lakes are hand-traced approximations; where-written and setting pins are editorial (see each note).',
    },
  ],
  history: [
    {
      title: 'World English Bible (WEB) and Berean Standard Bible (BSB)',
      detail: 'Both public domain; USFX texts from the open-bibles collection (seven1m/open-bibles)',
      url: 'https://github.com/seven1m/open-bibles',
      links: [
        { label: 'World English Bible', url: 'https://worldenglish.bible/' },
        { label: 'Berean Standard Bible', url: 'https://berean.bible/' },
      ],
      use: 'Verse pop-ups for the creed clauses and the comparisons.',
    },
    {
      title: 'The Creeds of Christendom',
      detail: 'Philip Schaff, 1877 (6th ed. 1931), Christian Classics Ethereal Library',
      url: 'https://www.ccel.org/ccel/schaff/creeds1',
      links: [{ label: 'Vol. 2: Greek and Latin creeds', url: 'https://www.ccel.org/ccel/schaff/creeds2' }],
      use: "Texts and histories of the Apostles', Nicene, Chalcedonian and Athanasian creeds (Chalcedon in Schaff's translation).",
    },
    {
      title: 'The Book of Common Prayer (1662)',
      detail: 'Church of England',
      use: 'English text of the Athanasian Creed ("Quicunque vult").',
    },
    {
      title: 'Early Christian Creeds',
      detail: 'J. N. D. Kelly, 3rd ed., Longman, 1972',
      use: "Background on how the Apostles' and Nicene creeds developed.",
    },
    {
      title: 'History of the Christian Church',
      detail: 'Philip Schaff, Christian Classics Ethereal Library',
      url: 'https://www.ccel.org/ccel/schaff/hcc3',
      links: [{ label: 'Vol. 4: Mediaeval Christianity', url: 'https://www.ccel.org/ccel/schaff/hcc4' }],
      use: 'The councils, the Church of the East and Oriental Orthodox divisions, and the East–West schism of 1054.',
    },
    {
      title: 'Religion timelines',
      detail: 'Association of Religion Data Archives (ARDA)',
      url: 'https://www.thearda.com/us-religion/history/timelines',
      use: 'Dates and key figures for the Reformation and later Protestant branches.',
    },
    {
      title: 'Official statements of the groups compared',
      detail: "Each group's own website",
      links: [
        { label: 'jw.org', url: 'https://www.jw.org/' },
        { label: 'churchofjesuschrist.org', url: 'https://www.churchofjesuschrist.org/' },
        { label: 'upci.org', url: 'https://www.upci.org/' },
        { label: 'christianscience.com', url: 'https://www.christianscience.com/' },
      ],
      use: "Each group's position is summarised from what it says about itself.",
    },
    {
      title: 'Catechism of the Catholic Church',
      detail: 'Holy See, 2nd ed. (1997)',
      url: 'https://www.vatican.va/archive/ENG0015/_INDEX.HTM',
      use: 'Catholic positions in the Traditions comparison (Scripture and Tradition, justification, sacraments, Mary, purgatory).',
    },
    {
      title: 'The Orthodox Faith',
      detail: 'Fr Thomas Hopko, Orthodox Church in America',
      url: 'https://www.oca.org/orthodoxy/the-orthodox-faith',
      use: 'Eastern Orthodox positions in the Traditions comparison.',
    },
    {
      title: 'The Book of Concord',
      detail: 'The Lutheran Confessions (1580), incl. the Augsburg Confession and the Small Catechism',
      url: 'https://bookofconcord.org/',
      use: 'Lutheran positions in the Traditions comparison.',
    },
    {
      title: 'The Thirty-Nine Articles of Religion',
      detail: 'Church of England (1571), printed in the Book of Common Prayer',
      url: 'https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/book-common-prayer/articles-religion',
      use: 'Anglican positions in the Traditions comparison (Articles VI, XI, XXII, XXV, XXVII, XXVIII).',
    },
    {
      title: 'The Westminster Confession of Faith and Shorter Catechism',
      detail: 'Westminster Assembly (1646–47); text from the Orthodox Presbyterian Church',
      url: 'https://www.opc.org/wcf.html',
      use: 'Reformed / Presbyterian positions in the Traditions comparison.',
    },
    {
      title: 'The Baptist Faith and Message (2000)',
      detail: 'Southern Baptist Convention',
      url: 'https://bfm.sbc.net/',
      use: 'Baptist positions in the Traditions comparison.',
    },
    {
      title: 'Statement of Fundamental Truths',
      detail: 'Assemblies of God (1916, revised)',
      url: 'https://ag.org/',
      use: 'Pentecostal positions in the Traditions comparison.',
    },
    {
      title: 'Joint Declaration on the Doctrine of Justification',
      detail: 'Lutheran World Federation and the Catholic Church, Augsburg, 31 October 1999',
      use: 'The note on Catholic–Lutheran agreement about justification.',
    },
    {
      title: 'Global Christianity: A Report on the Size and Distribution of the World’s Christian Population',
      detail: 'Pew Research Center, December 2011 (data for 2010)',
      url: 'https://www.pewresearch.org/religion/2011/12/19/global-christianity-exec/',
      use: 'The shares of Catholic, Protestant and Orthodox Christians worldwide.',
    },
    {
      title: 'Response on the validity of baptism conferred by The Church of Jesus Christ of Latter-day Saints',
      detail: 'Congregation for the Doctrine of the Faith, 5 June 2001',
      use: 'The Catholic ruling cited in the Inside & outside diagram.',
    },
    {
      title: 'Groups in their own words',
      detail: "Official websites of each movement in the Inside & outside diagram",
      links: [
        { label: 'uua.org', url: 'https://www.uua.org/beliefs/what-we-believe' },
        { label: 'iglesianicristo.net', url: 'https://iglesianicristo.net/' },
        { label: 'Qur’an 4:157', url: 'https://quran.com/4/157' },
        { label: 'Qur’an 5:116', url: 'https://quran.com/5/116' },
        { label: 'Doctrine and Covenants 130', url: 'https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/130?lang=eng' },
      ],
      use: 'How each movement describes its own beliefs (alongside jw.org, churchofjesuschrist.org, upci.org and christianscience.com above).',
    },
    {
      title: 'The Belgic Confession (1561), Article 9',
      detail: 'Christian Reformed Church in North America',
      url: 'https://www.crcna.org/welcome/beliefs/confessions/belgic-confession',
      use: 'The Reformed reception of the Apostles’, Nicene and Athanasian Creeds (Who confesses which creed).',
    },
    {
      title: 'Code of Canons of the Eastern Churches',
      detail: 'Pope John Paul II, apostolic constitution Sacri Canones, 1990',
      url: 'https://www.vatican.va/content/john-paul-ii/en/apost_constitutions/documents/hf_jp-ii_apc_19901018_index-codex-can-eccl-orient.html',
      use: 'The self-governing (sui iuris) Eastern Catholic churches alongside the Latin Church.',
    },
    {
      title: 'Member churches in their own words',
      detail: 'Official websites of churches shown in the Core beliefs diagram',
      links: [
        { label: 'Coptic Orthodox', url: 'https://www.copticchurch.net/' },
        { label: 'Ethiopian Orthodox Tewahedo', url: 'https://www.ethiopianorthodox.org/' },
        { label: 'Armenian Apostolic', url: 'https://www.armenianchurch.org/' },
        { label: 'Russian Orthodox (DECR)', url: 'https://mospat.ru/en/' },
        { label: 'Syro-Malabar Church', url: 'https://www.syromalabarchurch.in/' },
        { label: 'ELCA', url: 'https://www.elca.org/' },
        { label: 'LCMS', url: 'https://www.lcms.org/' },
        { label: 'PC(USA)', url: 'https://www.pcusa.org/' },
        { label: 'United Methodist', url: 'https://www.umc.org/en/content/our-wesleyan-heritage' },
        { label: 'COGIC', url: 'https://www.cogic.org/' },
        { label: 'Mennonite Church USA', url: 'https://www.mennoniteusa.org/' },
      ],
      use: 'How each member church describes itself; summaries in the diagram are brief.',
    },
    {
      title: 'Code of Canon Law (1983)',
      detail: 'Holy See; cann. 331 (the Pope), 349 (cardinals), 435 (metropolitan archbishops), 519 (pastors), 564 (chaplains), 620 (major superiors)',
      url: 'https://www.vatican.va/archive/cod-iuris-canonici/cic_index_en.html',
      use: 'Catholic titles on the Titles tab.',
    },
    {
      title: 'Catechism of the Catholic Church, 886, 915, 1562–1571',
      detail: 'Holy See, 2nd ed. (1997)',
      url: 'https://www.vatican.va/archive/ENG0015/_INDEX.HTM',
      use: 'Bishops, priests and deacons; the vows of religious life (Titles tab).',
    },
    {
      title: 'The Rule of St Benedict, chapter 2',
      detail: 'Benedict of Nursia, c. 530; Christian Classics Ethereal Library',
      url: 'https://www.ccel.org/ccel/benedict/rule',
      use: 'The abbot as “Abba, Father”.',
    },
    {
      title: 'The Ecumenical Patriarchate of Constantinople',
      detail: 'Official website',
      url: 'https://ecumenicalpatriarchate.org/',
      use: 'The title of patriarch among the Eastern Orthodox.',
    },
    {
      title: 'How to address the clergy',
      detail: 'Crockford’s Clerical Directory (Church House Publishing)',
      url: 'https://www.crockford.org.uk/faq/how-to-address-the-clergy',
      use: '“The Reverend”, “The Right Reverend” and correct forms of address.',
    },
    {
      title: 'Book of Order',
      detail: 'Presbyterian Church (USA)',
      url: 'https://www.pcusa.org/',
      use: 'Ministers of Word and Sacrament (teaching elders), ruling elders and deacons.',
    },
    {
      title: 'Order of Friars Minor',
      detail: 'The Franciscans, official website',
      url: 'https://ofm.org/',
      use: 'Friars and the mendicant orders.',
    },
  ],
};
