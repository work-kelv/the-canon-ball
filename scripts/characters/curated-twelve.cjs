// The twelve sons of Jacob (Israel) and the two handmaid mothers. Judah and Joseph are in curated.cjs.
const P = 'Patriarch/Matriarch';
const E1 = 'Creation & Patriarchs';

exports.people = [
  ['reuben', 'reuben_2429', 'Reuben', 'Firstborn of Jacob · Tribe of Reuben', P, E1, 'Jacob\'s firstborn by Leah, who tried to rescue Joseph from his brothers but lost his birthright for sleeping with Bilhah.'],
  ['simeon-patriarch', 'simeon_2741', 'Simeon', 'Son of Jacob · Tribe of Simeon', P, E1, 'Leah\'s second son who, with Levi, avenged Dinah at Shechem; Joseph held him hostage in Egypt.'],
  ['levi', 'levi_1820', 'Levi', 'Son of Jacob · Priestly Tribe', P, E1, 'Leah\'s third son, ancestor of Moses, Aaron and the priestly tribe that received no territory but served the sanctuary.'],
  ['dan', 'dan_973', 'Dan', 'Son of Jacob · Tribe of Dan', P, E1, 'First son of Rachel\'s servant Bilhah, named "judgement" by Rachel; ancestor of Samson.'],
  ['naphtali', 'naphtali_2149', 'Naphtali', 'Son of Jacob · Tribe of Naphtali', P, E1, 'Bilhah\'s second son, whose name recalls Rachel\'s "wrestling"; his tribe\'s land in Galilee saw Jesus\' ministry (Matt 4:15).'],
  ['gad', 'gad_1262', 'Gad', 'Son of Jacob · Tribe of Gad', P, E1, 'First son of Leah\'s servant Zilpah, named for "good fortune"; his tribe settled east of the Jordan.'],
  ['asher', 'asher_337', 'Asher', 'Son of Jacob · Tribe of Asher', P, E1, 'Zilpah\'s second son, named "happy"; Anna the prophetess was of his tribe (Luke 2:36).'],
  ['issachar', 'issachar_645', 'Issachar', 'Son of Jacob · Tribe of Issachar', P, E1, 'Leah\'s fifth son; his tribe was later noted for men "who understood the times" (1 Chr 12:32).'],
  ['zebulun', 'zebulun_3002', 'Zebulun', 'Son of Jacob · Tribe of Zebulun', P, E1, 'Leah\'s sixth son, blessed to "dwell at the shore of the sea"; his land in Galilee is named in Isaiah 9 and Matthew 4.'],
  ['benjamin', 'benjamin_463', 'Benjamin', 'Youngest Son of Jacob · Tribe of Benjamin', P, E1, 'Rachel\'s second son, born as she died; Jacob\'s cherished youngest and ancestor of King Saul and the apostle Paul.'],
  ['bilhah', 'bilhah_502', 'Bilhah', 'Rachel\'s Servant', P, E1, 'Rachel\'s handmaid, given to Jacob as a wife; mother of Dan and Naphtali.'],
  ['zilpah', 'zilpah_3081', 'Zilpah', 'Leah\'s Servant', P, E1, 'Leah\'s handmaid, given to Jacob as a wife; mother of Gad and Asher.'],
];

const F = 'Family', AC = 'Ally/Companion', R = 'Rival/Adversary';
exports.edges = [
  ['reuben', 'joseph', AC, 'Tried to rescue'],
  ['judah', 'joseph', R, 'Proposed selling'],
  ['joseph', 'simeon-patriarch', R, 'Held hostage'],
  ['judah', 'benjamin', AC, 'Offered himself as surety for'],
  ['levi', 'moses', F, 'Great-grandfather of'],
  ['levi', 'aaron', F, 'Great-grandfather of'],
  ['bilhah', 'rachel', AC, 'Servant of'],
  ['zilpah', 'leah', AC, 'Servant of'],
];

// Birth order per Genesis 29:31–30:24 and 35:16–18.
exports.twelveSons = [
  { id: 'reuben', mother: 'leah' },
  { id: 'simeon-patriarch', mother: 'leah' },
  { id: 'levi', mother: 'leah' },
  { id: 'judah', mother: 'leah' },
  { id: 'dan', mother: 'bilhah' },
  { id: 'naphtali', mother: 'bilhah' },
  { id: 'gad', mother: 'zilpah' },
  { id: 'asher', mother: 'zilpah' },
  { id: 'issachar', mother: 'leah' },
  { id: 'zebulun', mother: 'leah' },
  { id: 'joseph', mother: 'rachel' },
  { id: 'benjamin', mother: 'rachel' },
];
