// Journeys narrated (or, for letters, implied) in each book. Stops are [name, lat, lng, ref?].
// Coordinates are approximate; several sites (Makkedah, Mizpeh of Moab, Hobah, Midian, the
// Exodus stations…) are uncertain. Distances are computed by the build as straight lines between stops.
// `major` reuses a route from curated-geography.mjs (optionally a slice of its stops).

const J = (title, who, ref, summary, stops, extra = {}) => ({ title, who, ref, summary, stops, ...extra });
const M = (major, title, who, ref, summary, slice, leg) => ({ major, title, who, ref, summary, ...(slice ? { slice } : {}), ...(leg ? { leg } : {}) });

// Frequently used points
const JERUSALEM = ['Jerusalem', 31.778, 35.235];
const BETHEL = ['Bethel', 31.93, 35.222];
const HEBRON = ['Hebron', 31.532, 35.095];
const BEERSHEBA = ['Beersheba', 31.245, 34.84];
const SHECHEM = ['Shechem', 32.213, 35.282];
const HARAN = ['Haran', 36.865, 39.031];
const EGYPT = ['Egypt (Nile delta)', 30.6, 31.5];
const GOSHEN = ['Goshen', 30.8, 31.85];
const BABYLON = ['Babylon', 32.536, 44.421];
const SUSA = ['Susa', 32.19, 48.258];
const RIBLAH = ['Riblah', 34.45, 36.55];
const CARCHEMISH = ['Carchemish', 36.83, 38.02];
const JERICHO = ['Jericho', 31.871, 35.444];
const GILGAL = ['Gilgal', 31.86, 35.5];
const JORDAN_FORD = ['Jordan fords near Jericho', 31.84, 35.55];
const SINAI = ['Mount Sinai (Horeb)', 28.539, 33.975];
const KADESH = ['Kadesh-barnea', 30.687, 34.494];
const NAZARETH = ['Nazareth', 32.702, 35.297];
const BETHLEHEM = ['Bethlehem', 31.705, 35.2];
const CAPERNAUM = ['Capernaum', 32.881, 35.575];
const SAMARIA = ['Samaria', 32.276, 35.197];
const DAMASCUS = ['Damascus', 33.513, 36.292];
const ROME = ['Rome', 41.893, 12.483];
const CORINTH = ['Corinth', 37.906, 22.88];
const EPHESUS = ['Ephesus', 37.941, 27.342];
const PHILIPPI = ['Philippi', 41.013, 24.286];
const THESSALONICA = ['Thessalonica', 40.64, 22.944];
const ANTIOCH = ['Antioch (Syria)', 36.202, 36.16];
const CAESAREA = ['Caesarea', 32.5, 34.892];
const JOPPA = ['Joppa', 32.054, 34.752];
const TROAS = ['Troas', 39.753, 26.159];
const COLOSSAE = ['Colossae', 37.79, 29.26];
const GALATIA = ['Galatia (Pisidian Antioch, Iconium, Lystra, Derbe)', 37.87, 32.49];
const KIRIATH_JEARIM = ['Kiriath-jearim', 31.805, 35.1];
const GIBEAH = ['Gibeah', 31.822, 35.231];
const RAMAH = ['Ramah', 31.85, 35.2];
const GATH = ['Gath', 31.7, 34.85];
const NINEVEH = ['Nineveh', 36.36, 43.152];
const TYRE = ['Tyre', 33.271, 35.196];

const letter = (from, to, carrier, ref) =>
  J(`The letter is carried${carrier ? ` by ${carrier}` : ''}`, carrier || 'A courier', ref, `From ${from[0]} to ${to[0]}.`, [from, to], { kind: 'letter' });

export const bookJourneys = {
  1: [
    J('Terah leaves Ur', 'Terah, Abram, Sarai, Lot', 'Gen 11:31', 'The family sets out for Canaan but settles in Haran.', [['Ur of the Chaldeans', 30.962, 46.103], HARAN]),
    J('Abram goes to Canaan', 'Abram, Sarai, Lot', 'Gen 12:4–9', 'Called by God at 75, Abram travels south through the land, building altars.', [HARAN, SHECHEM, BETHEL, ['The Negeb', 31.0, 34.8]]),
    J('Down to Egypt and back', 'Abram and Sarai', 'Gen 12:10–13:4', 'Famine drives Abram to Egypt; he returns rich to the altar at Bethel.', [['The Negeb', 31.0, 34.8], EGYPT, ['The Negeb', 31.0, 34.8], BETHEL]),
    J('The rescue of Lot', 'Abram and 318 men', 'Gen 14:13–20', 'Abram pursues the eastern kings to Dan and beyond Damascus, then meets Melchizedek at Salem.', [HEBRON, ['Dan', 33.249, 35.652], ['Hobah, north of Damascus', 33.65, 36.4], ['Salem (Jerusalem)', 31.778, 35.235]]),
    J('Hagar flees', 'Hagar', 'Gen 16:6–14', 'Hagar runs toward Egypt and meets the angel at a spring, Beer-lahai-roi.', [HEBRON, ['Beer-lahai-roi', 30.69, 34.49]]),
    J('Abraham at Gerar and Beersheba', 'Abraham', 'Gen 20:1; 21:31–33', 'Abraham sojourns in Gerar, then settles at Beersheba.', [HEBRON, ['Gerar', 31.38, 34.6], BEERSHEBA]),
    J('The three-day journey to Moriah', 'Abraham and Isaac', 'Gen 22:1–19', 'Abraham takes Isaac to be offered and returns to Beersheba.', [BEERSHEBA, ['Mount Moriah', 31.778, 35.235], BEERSHEBA]),
    J('A bride for Isaac', 'Abraham’s servant', 'Gen 24', 'The servant travels to the city of Nahor and returns with Rebekah.', [BEERSHEBA, HARAN, ['Beer-lahai-roi', 30.69, 34.49]]),
    J('Jacob flees to Haran', 'Jacob', 'Gen 28–29', 'Fleeing Esau, Jacob dreams of a ladder at Bethel on his way to Laban.', [BEERSHEBA, BETHEL, HARAN]),
    J('Jacob returns to Canaan', 'Jacob, Leah, Rachel and family', 'Gen 31–35', 'Jacob slips away from Laban, wrestles at Peniel, meets Esau and journeys to Isaac at Mamre; Rachel dies near Bethlehem.', [
      HARAN, ['Mizpah of Gilead', 32.33, 35.75], ['Mahanaim', 32.21, 35.67], ['Peniel', 32.18, 35.68], ['Succoth', 32.2, 35.62], SHECHEM, BETHEL, ['Ephrath (Bethlehem)', 31.705, 35.2], ['Mamre (Hebron)', 31.532, 35.095],
    ]),
    J('Joseph sold into Egypt', 'Joseph', 'Gen 37', 'Sent to find his brothers, Joseph is sold at Dothan to traders bound for Egypt.', [HEBRON, SHECHEM, ['Dothan', 32.41, 35.24], EGYPT]),
    J('Jacob’s family goes down to Egypt', 'Jacob and seventy of his house', 'Gen 46:1–7, 28', 'After sacrificing at Beersheba, Israel moves to Goshen.', [HEBRON, BEERSHEBA, GOSHEN]),
    J('Jacob’s burial procession', 'Joseph and his brothers', 'Gen 50:7–13', 'A great company carries Jacob’s body to the cave of Machpelah.', [GOSHEN, ['Atad, beyond the Jordan', 31.85, 35.55], ['Machpelah (Hebron)', 31.524, 35.11]]),
  ],
  2: [
    J('Moses flees to Midian', 'Moses', 'Exod 2:15', 'After killing an Egyptian, Moses escapes to Midian.', [GOSHEN, ['Midian', 28.2, 35.2]]),
    J('Moses returns to Egypt', 'Moses', 'Exod 3:1; 4:20–27', 'From the burning bush at Horeb back to Egypt, meeting Aaron on the way.', [['Midian', 28.2, 35.2], SINAI, GOSHEN]),
    M('exodus-route', 'The Exodus to Sinai', 'Israel', 'Exod 12–19', 'From Rameses across the sea to the mountain of God (traditional route).', [0, 7]),
  ],
  4: [
    J('Sinai to Kadesh', 'Israel', 'Num 10:11–13:26', 'Israel leaves Sinai and reaches the wilderness of Paran.', [SINAI, ['Hazeroth', 28.95, 34.4], KADESH]),
    J('The twelve spies', 'Joshua, Caleb and ten others', 'Num 13:17–25', 'Forty days scouting from the wilderness of Zin to Rehob, near Lebo-hamath.', [KADESH, HEBRON, ['Rehob, near Lebo-hamath (approx.)', 34.25, 36.4], HEBRON, KADESH]),
    J('Around Edom to the plains of Moab', 'Israel', 'Num 20–22; 33', 'Refused passage by Edom, Israel goes round by Mount Hor and the Arnon to the plains of Moab.', [KADESH, ['Mount Hor', 30.317, 35.407], ['Ezion-geber', 29.55, 34.97], ['Arnon', 31.45, 35.8], ['Heshbon', 31.8, 35.8], ['Plains of Moab', 31.84, 35.62]]),
    J('Balaam comes from Pethor', 'Balaam', 'Num 22:5–21', 'Summoned by Balak from Pethor on the Euphrates.', [['Pethor (on the Euphrates)', 36.66, 38.07], ['Plains of Moab', 31.84, 35.62]]),
  ],
  5: [
    J('Horeb to Kadesh-barnea', 'Israel', 'Deut 1:2, 19', '"Eleven days’ journey from Horeb by the way of Mount Seir."', [SINAI, KADESH]),
    J('Moses climbs Nebo', 'Moses', 'Deut 34:1–5', 'From the plains of Moab to the top of Pisgah, where he views the land and dies.', [['Plains of Moab', 31.84, 35.62], ['Mount Nebo', 31.768, 35.726]]),
  ],
  6: [
    J('The spies at Jericho', 'Two spies', 'Josh 2', 'Sent from Shittim, hidden by Rahab, they escape to the hills.', [['Shittim', 31.84, 35.67], JERICHO, ['Hill country', 31.85, 35.36], ['Shittim', 31.84, 35.67]]),
    J('Crossing the Jordan', 'Israel', 'Josh 3–6', 'The river stops; Israel camps at Gilgal and takes Jericho.', [['Shittim', 31.84, 35.67], JORDAN_FORD, GILGAL, JERICHO]),
    J('Ai and Mount Ebal', 'Joshua and Israel', 'Josh 7–8', 'After Ai falls, the law is read between Ebal and Gerizim.', [GILGAL, ['Ai', 31.916, 35.261], ['Mount Ebal', 32.233, 35.273]]),
    J('The southern campaign', 'Joshua', 'Josh 10', 'An all-night march to save Gibeon, then city after city in the south.', [GILGAL, ['Gibeon', 31.847, 35.185], ['Beth-horon', 31.88, 35.13], ['Azekah', 31.699, 34.936], ['Makkedah (approx.)', 31.63, 34.92], ['Libnah', 31.63, 34.87], ['Lachish', 31.565, 34.849], ['Eglon (approx.)', 31.5, 34.75], HEBRON, ['Debir', 31.43, 34.97], GILGAL]),
    J('The northern campaign', 'Joshua', 'Josh 11:1–11', 'Victory at the waters of Merom and the burning of Hazor.', [GILGAL, ['Waters of Merom', 33.0, 35.42], ['Hazor', 33.017, 35.568]]),
    J('The tabernacle moves to Shiloh', 'Israel', 'Josh 18:1', '', [GILGAL, ['Shiloh', 32.056, 35.29]]),
  ],
  7: [
    J('Deborah and Barak', 'Barak and 10,000 men', 'Judg 4–5', 'Gathered at Kedesh, they descend Mount Tabor and rout Sisera at the Kishon.', [['Kedesh-naphtali', 33.11, 35.53], ['Mount Tabor', 32.687, 35.39], ['River Kishon (near Megiddo)', 32.6, 35.17]]),
    J('Gideon pursues Midian', 'Gideon and 300 men', 'Judg 7–8', 'From the spring of Harod across the Jordan to Succoth and Penuel.', [['Spring of Harod', 32.55, 35.36], ['Jordan crossing', 32.3, 35.56], ['Succoth', 32.2, 35.62], ['Penuel', 32.18, 35.68]]),
    J('Samson in Philistia', 'Samson', 'Judg 14–16', 'From Zorah to Timnah and Ashkelon; he carries Gaza’s gates toward Hebron.', [['Zorah', 31.776, 34.98], ['Timnah', 31.785, 34.915], ['Ashkelon', 31.67, 34.56], ['Gaza', 31.5, 34.465], HEBRON]),
    J('The Danites move north', '600 men of Dan', 'Judg 18', 'Leaving Zorah and Eshtaol, they take Micah’s idol and conquer Laish.', [['Zorah', 31.776, 34.98], KIRIATH_JEARIM, ['Hill country of Ephraim', 32.05, 35.2], ['Laish (Dan)', 33.249, 35.652]]),
    J('The Levite and his concubine', 'A Levite', 'Judg 19', 'Returning from Bethlehem, he passes Jebus and lodges at Gibeah.', [['Hill country of Ephraim', 32.05, 35.2], BETHLEHEM, ['Jebus (Jerusalem)', 31.778, 35.235], GIBEAH]),
  ],
  8: [
    J('Elimelech’s family goes to Moab', 'Elimelech, Naomi and their sons', 'Ruth 1:1–2', 'Famine drives them from Bethlehem to the fields of Moab.', [BETHLEHEM, ['Fields of Moab', 31.5, 35.78]]),
    J('Naomi and Ruth return', 'Naomi and Ruth', 'Ruth 1:6–22', '"Where you go I will go": they arrive at the start of barley harvest.', [['Fields of Moab', 31.5, 35.78], BETHLEHEM]),
  ],
  9: [
    J('The journey of the ark', 'The ark of the covenant', '1 Sam 4–7', 'Captured at Ebenezer, the ark passes through three Philistine cities before returning.', [['Ebenezer / Aphek', 32.1, 34.95], ['Ashdod', 31.755, 34.645], GATH, ['Ekron', 31.78, 34.85], ['Beth-shemesh', 31.75, 34.975], KIRIATH_JEARIM]),
    J('Saul searches for the donkeys', 'Saul and his servant', '1 Sam 9–10', 'The search leads to Samuel, who anoints Saul.', [GIBEAH, ['Land of Zuph (approx.)', 31.95, 35.15], RAMAH, GIBEAH]),
    J('David on the run from Saul', 'David and his men', '1 Sam 19–27', 'A fugitive circuit through Judah, Philistia and Moab.', [GIBEAH, ['Ramah (Naioth)', 31.85, 35.2], ['Nob', 31.79, 35.24], GATH, ['Cave of Adullam', 31.65, 34.96], ['Mizpeh of Moab (approx.)', 31.4, 35.7], ['Keilah', 31.61, 35.0], ['Wilderness of Ziph', 31.48, 35.13], ['Maon', 31.41, 35.13], ['En-gedi', 31.461, 35.39], GATH, ['Ziklag', 31.38, 34.68]]),
    J('Saul’s last night', 'Saul', '1 Sam 28; 31', 'From the camp on Gilboa to the medium of Endor and back to his death.', [['Mount Gilboa', 32.47, 35.42], ['Endor', 32.635, 35.37], ['Mount Gilboa', 32.47, 35.42]]),
    J('The men of Jabesh recover Saul’s body', 'Valiant men of Jabesh-gilead', '1 Sam 31:11–13', '', [['Jabesh-gilead', 32.4, 35.62], ['Beth-shan', 32.5, 35.5], ['Jabesh-gilead', 32.4, 35.62]]),
  ],
  10: [
    J('David becomes king', 'David', '2 Sam 2:1–4; 5:1–9', 'From Ziklag to Hebron, and seven years later to Jerusalem.', [['Ziklag', 31.38, 34.68], HEBRON, JERUSALEM]),
    J('The ark comes to Jerusalem', 'David and Israel', '2 Sam 6', 'After Uzzah dies, the ark rests with Obed-edom before entering the city.', [KIRIATH_JEARIM, ['House of Obed-edom (approx.)', 31.79, 35.17], JERUSALEM]),
    J('David flees from Absalom', 'David and his household', '2 Sam 15–17', 'Barefoot up the Mount of Olives and across the Jordan to Mahanaim.', [JERUSALEM, ['Mount of Olives', 31.778, 35.244], ['Bahurim', 31.79, 35.27], JORDAN_FORD, ['Mahanaim', 32.21, 35.67]]),
    J('David returns', 'David', '2 Sam 19', 'Escorted back across the Jordan at Gilgal.', [['Mahanaim', 32.21, 35.67], GILGAL, JERUSALEM]),
  ],
  11: [
    J('Timber for the temple', 'Hiram’s workers', '1 Kgs 5:8–9', 'Cedar and cypress floated in rafts down the coast.', [['Lebanon forests', 34.25, 36.05], TYRE, JOPPA, JERUSALEM]),
    J('Elijah flees to Horeb', 'Elijah', '1 Kgs 18–19', 'From the victory on Carmel to Jezreel, Beersheba and forty days to Horeb.', [['Mount Carmel', 32.66, 35.05], ['Jezreel', 32.556, 35.33], BEERSHEBA, SINAI]),
    J('Elijah calls Elisha', 'Elijah', '1 Kgs 19:15–19', 'Sent back north by way of the wilderness of Damascus.', [SINAI, ['Abel-meholah', 32.36, 35.55]]),
  ],
  12: [
    J('Elijah taken up', 'Elijah and Elisha', '2 Kgs 2:1–14', 'Gilgal to Bethel to Jericho, then across the Jordan.', [['Gilgal (north)', 32.03, 35.2], BETHEL, JERICHO, ['Beyond the Jordan', 31.84, 35.56]]),
    J('Naaman comes to be healed', 'Naaman', '2 Kgs 5', 'From Damascus to the king of Israel, then to the Jordan.', [DAMASCUS, SAMARIA, JORDAN_FORD, DAMASCUS]),
    J('Israel exiled to Assyria', 'The northern tribes', '2 Kgs 17:6', 'Deported to Halah, the Habor river of Gozan and the cities of the Medes.', [SAMARIA, ['Gozan, on the Habor', 36.83, 40.07], ['Cities of the Medes (Ecbatana)', 34.8, 48.52]]),
    J('Sennacherib’s threat and withdrawal', 'The Assyrian army', '2 Kgs 18–19', 'From Lachish the Rabshakeh comes to Jerusalem; Sennacherib returns to Nineveh.', [['Lachish', 31.565, 34.849], JERUSALEM, ['Libnah', 31.63, 34.87], NINEVEH]),
    M('exile-return', 'Judah taken to Babylon', 'King Zedekiah and the people', '2 Kgs 25', 'Jerusalem falls in 586 BC; Zedekiah is judged at Riblah.', [0, 4]),
  ],
  13: [
    J('David moves the ark', 'David', '1 Chr 13–15', '', [KIRIATH_JEARIM, ['House of Obed-edom (approx.)', 31.79, 35.17], JERUSALEM]),
  ],
  14: [
    J('Timber from Lebanon', 'Hiram’s workers', '2 Chr 2:16', 'Floated to Joppa and carried up to Jerusalem.', [['Lebanon forests', 34.25, 36.05], TYRE, JOPPA, JERUSALEM]),
    J('Josiah marches to Megiddo', 'King Josiah', '2 Chr 35:20–24', 'Josiah intercepts Pharaoh Neco and is mortally wounded.', [JERUSALEM, ['Megiddo', 32.585, 35.185], JERUSALEM]),
    M('exile-return', 'Exile to Babylon', 'Judah', '2 Chr 36:17–20', '', [0, 4]),
  ],
  15: [
    J('The first return', 'Zerubbabel, Jeshua and 42,360 people', 'Ezra 1–2', 'Under Cyrus’ decree (538 BC).', [BABYLON, ['Tadmor (likely caravan route)', 34.55, 38.27], DAMASCUS, JERUSALEM]),
    J('Ezra’s return', 'Ezra and about 1,500 men', 'Ezra 7:6–9; 8:15–32', 'Four months from Babylon, gathering first at the Ahava canal (458 BC).', [BABYLON, ['Ahava', 33.63, 42.79], ['Tadmor (likely)', 34.55, 38.27], DAMASCUS, JERUSALEM]),
  ],
  16: [
    J('Nehemiah goes to Jerusalem', 'Nehemiah', 'Neh 2:1–11', 'With the king’s letters to the governors "beyond the River" (445 BC).', [SUSA, BABYLON, ['Tadmor (likely)', 34.55, 38.27], DAMASCUS, JERUSALEM]),
    J('Nehemiah reports to the king', 'Nehemiah', 'Neh 13:6–7', 'He returns to Artaxerxes, then comes back to Jerusalem.', [JERUSALEM, BABYLON, JERUSALEM]),
  ],
  17: [
    J('Mordecai’s family in exile', 'Kish, Mordecai’s ancestor', 'Esth 2:5–6', 'Carried away with Jeconiah; the family later lives in Susa.', [JERUSALEM, BABYLON, SUSA]),
  ],
  18: [
    J('Eliphaz comes to comfort Job', 'Eliphaz the Temanite', 'Job 2:11', 'Job’s friends meet and travel to Uz (both locations uncertain).', [['Teman (Edom)', 30.7, 35.6], ['Land of Uz (uncertain)', 30.5, 35.8]]),
  ],
  23: [
    J('The Assyrian advance', 'The Assyrian army (in Isaiah’s vision)', 'Isa 10:28–32', 'A poem tracing the enemy’s march, town by town, to the edge of Jerusalem.', [['Aiath (Ai)', 31.916, 35.261], ['Michmash', 31.873, 35.278], ['Geba', 31.853, 35.26], ['Ramah', 31.85, 35.2], GIBEAH, ['Anathoth', 31.81, 35.26], ['Nob', 31.79, 35.24]]),
    J('The Rabshakeh at Jerusalem', 'Sennacherib’s envoy', 'Isa 36:2', '', [['Lachish', 31.565, 34.849], JERUSALEM]),
    J('The new exodus', 'Returning exiles (prophesied)', 'Isa 40:3; 48:20', '"Go out from Babylon": a highway through the desert.', [BABYLON, ['Through the desert', 32.5, 39.5], JERUSALEM]),
  ],
  24: [
    J('Jeremiah taken to Egypt', 'Jeremiah, Baruch and the remnant', 'Jer 40–43', 'After Gedaliah’s murder at Mizpah the survivors flee to Tahpanhes, taking Jeremiah with them.', [JERUSALEM, ['Mizpah', 31.885, 35.215], ['Geruth Chimham, near Bethlehem', 31.7, 35.2], ['Tahpanhes', 30.86, 32.1]]),
    M('exile-return', 'Judah taken to Babylon', 'The people of Judah', 'Jer 39; 52', '', [0, 4]),
  ],
  26: [
    J('Ezekiel taken into exile', 'Ezekiel, with King Jehoiachin', 'Ezek 1:1–3; 2 Kgs 24:15', 'Deported in 597 BC to the Chebar canal.', [JERUSALEM, RIBLAH, CARCHEMISH, BABYLON, ['Tel-abib by the Chebar', 32.13, 45.23]]),
    J('Carried in visions to Jerusalem', 'Ezekiel (in a vision)', 'Ezek 8:3; 11:24', 'The Spirit lifts Ezekiel to the temple and brings him back.', [['Tel-abib by the Chebar', 32.13, 45.23], JERUSALEM, ['Tel-abib by the Chebar', 32.13, 45.23]], { kind: 'vision' }),
  ],
  27: [
    J('Daniel taken to Babylon', 'Daniel and his friends', 'Dan 1:1–6', 'Among the first captives (605 BC).', [JERUSALEM, RIBLAH, CARCHEMISH, BABYLON]),
    J('A vision at Susa', 'Daniel (in a vision)', 'Dan 8:2', 'Daniel sees himself in the citadel of Susa by the Ulai canal.', [BABYLON, SUSA], { kind: 'vision' }),
  ],
  30: [
    J('Amos goes north', 'Amos', 'Amos 1:1; 7:10–13', 'From Tekoa to the royal sanctuary at Bethel — and is told to go home.', [['Tekoa', 31.636, 35.215], BETHEL, ['Tekoa', 31.636, 35.215]]),
  ],
  32: [
    J('Jonah runs away', 'Jonah', 'Jonah 1', 'He boards a ship at Joppa for Tarshish; a storm stops him at sea.', [['Gath-hepher', 32.74, 35.32], JOPPA, ['At sea, toward Tarshish', 32.6, 33.4]]),
    J('Jonah goes to Nineveh', 'Jonah', 'Jonah 3:3', 'After the great fish, he walks to Nineveh — "an exceedingly great city, three days’ journey".', [JOPPA, ['Aleppo road (likely)', 36.2, 37.15], NINEVEH]),
  ],

  // ── New Testament ──
  40: [
    J('The magi follow the star', 'Magi "from the east"', 'Matt 2:1–12', 'Probably from Babylonia or Persia, via Herod in Jerusalem, to Bethlehem.', [['"The east" (Babylonia?)', 32.536, 44.421], ['Tadmor (likely)', 34.55, 38.27], DAMASCUS, JERUSALEM, BETHLEHEM]),
    J('Flight to Egypt and return', 'Joseph, Mary and Jesus', 'Matt 2:13–23', 'Escaping Herod, then settling in Nazareth.', [BETHLEHEM, ['Gaza (coast road)', 31.5, 34.465], EGYPT, ['Gaza (coast road)', 31.5, 34.465], NAZARETH]),
    J('Baptism, temptation, Capernaum', 'Jesus', 'Matt 3:13–4:13', '', [NAZARETH, ['Jordan (baptism)', 31.837, 35.553], ['Judean wilderness', 31.7, 35.35], NAZARETH, CAPERNAUM]),
    J('The last journey to Jerusalem', 'Jesus and the Twelve', 'Matt 19:1; 20:29; 21:1', 'From Galilee into Judea beyond the Jordan, through Jericho to Jerusalem.', [CAPERNAUM, ['Perea (beyond the Jordan)', 32.0, 35.62], JERICHO, ['Bethphage / Mount of Olives', 31.778, 35.25], JERUSALEM]),
    J('To the mountain in Galilee', 'The eleven disciples', 'Matt 28:16', 'The risen Jesus meets them and gives the Great Commission.', [JERUSALEM, SAMARIA, ['Mountain in Galilee (traditional)', 32.88, 35.555]]),
  ],
  41: [
    J('Through Tyre, Sidon and the Decapolis', 'Jesus', 'Mark 7:24–31', 'A wide northern loop through Gentile territory and back to the Sea of Galilee.', [CAPERNAUM, TYRE, ['Sidon', 33.563, 35.371], ['Caesarea Philippi region', 33.2, 35.7], ['Decapolis (Hippos)', 32.78, 35.66]]),
    J('To Caesarea Philippi', 'Jesus and the disciples', 'Mark 8:22–27', 'From Bethsaida north to the villages of Caesarea Philippi.', [['Bethsaida', 32.91, 35.63], ['Caesarea Philippi', 33.248, 35.694]]),
    J('Up to Jerusalem', 'Jesus and the disciples', 'Mark 10:1, 32, 46; 11:1', '', [CAPERNAUM, ['Perea (beyond the Jordan)', 32.0, 35.62], JERICHO, ['Bethany', 31.771, 35.261], JERUSALEM]),
  ],
  42: [
    J('Joseph and Mary go to Bethlehem', 'Joseph and Mary', 'Luke 2:1–7', 'For the census of Quirinius.', [NAZARETH, ['Jezreel valley', 32.56, 35.3], SAMARIA, JERUSALEM, BETHLEHEM]),
    J('The presentation in the temple', 'Joseph, Mary and the child', 'Luke 2:22–39', '', [BETHLEHEM, JERUSALEM, NAZARETH]),
    J('Jesus at twelve in the temple', 'Jesus with his family', 'Luke 2:41–51', 'A day’s journey home before they find him missing.', [NAZARETH, JERUSALEM, NAZARETH]),
    J('Setting his face to Jerusalem', 'Jesus and the disciples', 'Luke 9:51–19:28', 'Turned away by a Samaritan village, the journey reaches Jericho and Jerusalem.', [CAPERNAUM, ['Samaritan border', 32.45, 35.3], JERICHO, JERUSALEM]),
    J('The road to Emmaus', 'Cleopas and a companion', 'Luke 24:13–35', 'About 60 stadia (11 km); they hurry back the same evening.', [JERUSALEM, ['Emmaus', 31.839, 34.989], JERUSALEM]),
  ],
  43: [
    J('The first signs', 'Jesus and his first disciples', 'John 1:43–2:13', 'From where John baptized, to the wedding at Cana, Capernaum and Passover in Jerusalem.', [['Bethany beyond the Jordan', 31.837, 35.553], ['Cana', 32.747, 35.339], CAPERNAUM, JERUSALEM]),
    J('Through Samaria', 'Jesus', 'John 4:3–46', 'Meeting the woman at Jacob’s well, then back to Cana.', [JERUSALEM, ['Sychar (Jacob’s well)', 32.209, 35.285], ['Cana', 32.747, 35.339]]),
    J('Lazarus and the last Passover', 'Jesus', 'John 10:40–12:12', 'From beyond the Jordan to Bethany, Ephraim, and into Jerusalem.', [['Bethany beyond the Jordan', 31.837, 35.553], ['Bethany', 31.771, 35.261], ['Ephraim', 31.95, 35.3], ['Bethany', 31.771, 35.261], JERUSALEM]),
  ],
  44: [
    J('Philip’s mission', 'Philip the evangelist', 'Acts 8', 'Samaria, the Gaza road (the Ethiopian official), Azotus, then the coast to Caesarea.', [JERUSALEM, SAMARIA, ['Gaza road', 31.6, 34.8], ['Azotus', 31.755, 34.645], JOPPA, CAESAREA]),
    J('Saul on the Damascus road', 'Saul', 'Acts 9:1–30', 'Converted near Damascus; later sent from Jerusalem to Tarsus.', [JERUSALEM, DAMASCUS, JERUSALEM, CAESAREA, ['Tarsus', 36.918, 34.892]]),
    J('Peter to Lydda, Joppa and Caesarea', 'Peter', 'Acts 9:32–11:2', 'Aeneas healed, Tabitha raised, Cornelius baptized.', [JERUSALEM, ['Lydda', 31.95, 34.89], JOPPA, CAESAREA, JERUSALEM]),
    J('Barnabas fetches Saul', 'Barnabas', 'Acts 11:22–26', '', [JERUSALEM, ANTIOCH, ['Tarsus', 36.918, 34.892], ANTIOCH]),
    M('paul-journeys', 'Paul’s first journey', 'Paul and Barnabas', 'Acts 13–14', '', null, 'paul-1'),
    M('paul-journeys', 'Paul’s second journey', 'Paul, Silas and Timothy', 'Acts 15:36–18:22', '', null, 'paul-2'),
    M('paul-journeys', 'Paul’s third journey', 'Paul', 'Acts 18:23–21:17', '', null, 'paul-3'),
    M('paul-journeys', 'Voyage to Rome', 'Paul, Luke and Aristarchus', 'Acts 27–28', 'Shipwrecked on Malta on the way.', null, 'paul-rome'),
  ],
  45: [
    J('Phoebe carries the letter to Rome', 'Phoebe, deacon of Cenchreae', 'Rom 16:1–2', '', [CORINTH, ['Cenchreae', 37.88, 22.99], ['Patrae (likely route west)', 38.25, 21.73], ['Brundisium', 40.64, 17.94], ROME], { kind: 'letter' }),
    J('Paul’s planned journey', 'Paul', 'Rom 15:24–28', 'First to Jerusalem with the collection, then Rome on the way to Spain.', [CORINTH, JERUSALEM, ROME], { kind: 'plan' }),
  ],
  46: [
    letter(EPHESUS, CORINTH, 'Stephanas, Fortunatus and Achaicus (probably)', '1 Cor 16:17'),
    J('Paul’s travel plans', 'Paul', '1 Cor 16:5–9', 'Staying in Ephesus until Pentecost, then through Macedonia to Corinth.', [EPHESUS, TROAS, PHILIPPI, THESSALONICA, CORINTH], { kind: 'plan' }),
  ],
  47: [
    J('Paul waits for Titus', 'Paul', '2 Cor 2:12–13; 7:5–7', 'Restless at Troas, Paul crosses to Macedonia, where Titus brings good news.', [EPHESUS, TROAS, PHILIPPI]),
    letter(PHILIPPI, CORINTH, 'Titus and two brothers', '2 Cor 8:16–24'),
  ],
  48: [
    J('Paul after his conversion', 'Paul', 'Gal 1:15–2:1', 'Arabia, back to Damascus, three years later to Jerusalem, then Syria and Cilicia.', [DAMASCUS, ['Arabia (Nabataea, approx.)', 32.5, 36.5], DAMASCUS, JERUSALEM, ['Tarsus (Cilicia)', 36.918, 34.892], ANTIOCH]),
    letter(ANTIOCH, GALATIA, null, 'Gal 1:2'),
  ],
  49: [letter(ROME, EPHESUS, 'Tychicus', 'Eph 6:21–22')],
  50: [
    J('Epaphroditus brings the gift', 'Epaphroditus', 'Phil 2:25–30; 4:18', 'Sent from Philippi to Paul in prison; he nearly dies and is sent home with the letter.', [PHILIPPI, ['Via Egnatia to Dyrrachium', 41.32, 19.45], ['Brundisium', 40.64, 17.94], ROME, ['Brundisium', 40.64, 17.94], ['Dyrrachium', 41.32, 19.45], PHILIPPI]),
  ],
  51: [J('Tychicus and Onesimus deliver the letter', 'Tychicus and Onesimus', 'Col 4:7–9', '', [ROME, ['Brundisium', 40.64, 17.94], ['Corinth (likely route)', 37.906, 22.88], EPHESUS, COLOSSAE], { kind: 'letter' })],
  52: [
    J('Paul driven out of Macedonia', 'Paul, Silas and Timothy', 'Acts 17; 1 Thess 2:2; 3:1', 'From Philippi to Thessalonica, Berea and Athens.', [PHILIPPI, THESSALONICA, ['Berea', 40.524, 22.202], ['Athens', 37.972, 23.727]]),
    J('Timothy’s report', 'Timothy', '1 Thess 3:1–6', 'Sent back from Athens to Thessalonica; returns to Paul at Corinth.', [['Athens', 37.972, 23.727], THESSALONICA, CORINTH]),
    letter(CORINTH, THESSALONICA, null, '1 Thess 1:1'),
  ],
  53: [letter(CORINTH, THESSALONICA, null, '2 Thess 1:1')],
  54: [
    J('Paul leaves Timothy at Ephesus', 'Paul', '1 Tim 1:3', '', [EPHESUS, PHILIPPI]),
    letter(['Macedonia (Philippi?)', 41.013, 24.286], EPHESUS, null, '1 Tim 1:3'),
  ],
  55: [
    letter(ROME, EPHESUS, null, '2 Tim 4:9–21'),
    J('"Come before winter"', 'Timothy (requested)', '2 Tim 4:9–21', 'Bring Mark, and the cloak and books left at Troas.', [EPHESUS, TROAS, PHILIPPI, ['Dyrrachium', 41.32, 19.45], ['Brundisium', 40.64, 17.94], ROME], { kind: 'plan' }),
  ],
  56: [
    J('Titus on Crete', 'Paul and Titus', 'Titus 1:5', 'Paul leaves Titus to appoint elders in every town.', [['Crete (Gortyn)', 35.06, 24.95]]),
    J('"Come to me at Nicopolis"', 'Titus (requested)', 'Titus 3:12', 'Once Artemas or Tychicus arrives to replace him.', [['Crete (Gortyn)', 35.06, 24.95], ['Nicopolis', 39.01, 20.73]], { kind: 'plan' }),
  ],
  57: [J('Onesimus goes home', 'Onesimus (with Tychicus)', 'Phlm 10–12; Col 4:9', 'Paul sends the runaway back as "a beloved brother".', [ROME, ['Brundisium', 40.64, 17.94], ['Corinth (likely route)', 37.906, 22.88], EPHESUS, COLOSSAE], { kind: 'letter' })],
  58: [J('A letter "from Italy"', 'Unknown', 'Heb 13:23–24', 'Sender and recipients are unknown; Timothy has just been released.', [ROME, JERUSALEM], { kind: 'letter' })],
  59: [letter(JERUSALEM, ['The Dispersion (Syria & beyond)', 35.2, 37.5], null, 'Jas 1:1')],
  60: [
    J('Silvanus carries the letter round Asia Minor', 'Silvanus', '1 Pet 1:1; 5:12', 'The order of provinces in 1:1 may trace the courier’s circuit (a proposal).', [['"Babylon" (Rome)', 41.893, 12.483], ['Pontus (Amisus)', 41.29, 36.33], ['Galatia (Ancyra)', 39.93, 32.86], ['Cappadocia (Caesarea)', 38.72, 35.49], ['Asia (Ephesus)', 37.941, 27.342], ['Bithynia (Nicomedia)', 40.77, 29.92]], { kind: 'letter' }),
  ],
  61: [letter(ROME, ['Asia Minor', 39.6, 33.0], null, '2 Pet 3:1')],
  62: [letter(EPHESUS, ['Churches of Asia', 38.4, 28.0], null, '1 John (tradition)')],
  63: [letter(EPHESUS, ['"The elect lady" (a church in Asia)', 38.4, 28.0], null, '2 John 1')],
  64: [letter(EPHESUS, ['Gaius’ church (Asia)', 38.4, 28.0], null, '3 John 1')],
  65: [letter(JERUSALEM, ['Unknown community', 35.2, 37.5], null, 'Jude 1')],
  66: [
    J('From Patmos to the seven churches', 'The letter (John’s messenger)', 'Rev 1:9–11; 2–3', 'The churches are listed in the order of a natural circular postal route.', [['Patmos', 37.31, 26.55], EPHESUS, ['Smyrna', 38.42, 27.14], ['Pergamum', 39.13, 27.18], ['Thyatira', 38.92, 27.84], ['Sardis', 38.49, 28.04], ['Philadelphia', 38.35, 28.52], ['Laodicea', 37.84, 29.11]], { kind: 'letter' }),
  ],
};
