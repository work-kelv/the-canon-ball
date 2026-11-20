// Write-ups for the five great journeys (merged into bibleGeography.json by build-geography.mjs).
// `writeup`: paragraphs for the journey; `legs`: one-line description per leg.
// Dates and routes follow common reconstructions; debated points are flagged in the text.

export const writeups = {
  'abraham-migration': {
    writeup: [
      'Genesis traces the family of Terah from Ur of the Chaldeans, a great city on the lower Euphrates, up the Fertile Crescent to Haran in upper Mesopotamia (Gen 11:31). There God calls Abram to leave his country and his father’s house for a land he will be shown, promising that through him all the families of the earth will be blessed (Gen 12:1–3).',
      'Abram enters Canaan at Shechem and builds altars there and between Bethel and Ai before moving south into the Negeb. Famine drives him down to Egypt (Gen 12:10–20); he returns rich, parts from Lot, and settles by the oaks of Mamre at Hebron (Gen 13:18). Later he lives at Beersheba, from where he takes Isaac on the three-day journey to Moriah (Gen 22).',
      'The route follows the arc of the Fertile Crescent rather than crossing the Syrian desert. The patriarchal period is traditionally dated c. 2000–1800 BC, but the dates are debated, and while Ur is usually identified with Tell el-Muqayyar in southern Iraq, a northern Ur near Haran has also been proposed.',
    ],
    legs: { abraham: 'From Ur to Canaan, down to Egypt and back, ending with the journey to Moriah (Gen 11–22).' },
  },
  'exodus-route': {
    writeup: [
      'After the tenth plague Israel sets out from Rameses in the eastern Nile delta (Exod 12:37). Rather than the short coastal road through Philistine territory, God leads the people by the wilderness road toward the Red Sea (Exod 13:17–18), where the waters are divided and Pharaoh’s army is drowned (Exod 14).',
      'Through the wilderness of Shur and Sin — Marah, Elim, Rephidim — they reach Mount Sinai, where they receive the covenant and build the tabernacle (Exod 19–40). About a year later they move on to Kadesh-barnea; when they refuse to enter the land after the spies’ report, they wander for forty years (Num 13–14), finally going around Edom and Moab to the plains opposite Jericho (Num 20–22; 33). Joshua leads them across the Jordan (Josh 3–4).',
      'Numbers 33 lists more than forty stopping places, most of which can no longer be identified. This map follows the traditional southern route with Sinai at Jebel Musa; scholars also propose a northern route or a Sinai in north-west Arabia, and the date of the Exodus (c. 1446 or c. 1270 BC) is likewise debated.',
    ],
    legs: { exodus: 'Rameses to Jericho by way of the Red Sea, Sinai, Kadesh-barnea and the plains of Moab.' },
  },
  'exile-return': {
    writeup: [
      'Babylon took captives from Judah in several waves: Daniel and other young nobles in 605 BC (Dan 1:1–6), King Jehoiachin, Ezekiel and the leading citizens in 597 BC (2 Kgs 24:10–16), and the bulk of the population after Jerusalem and the temple were destroyed in 586 BC. King Zedekiah was taken to Nebuchadnezzar’s headquarters at Riblah, blinded and carried to Babylon (2 Kgs 25:1–21).',
      'The deportees did not cross the open desert but followed the Fertile Crescent north through Syria and down the Euphrates, a journey of some four months. In Babylonia they lived in their own communities, such as Tel-abib by the Chebar canal where Ezekiel prophesied (Ezek 3:15), and remembered Zion “by the rivers of Babylon” (Ps 137).',
      'In 539 BC Cyrus of Persia took Babylon, and in 538 BC he allowed the Jews to return and rebuild the temple (Ezra 1:1–4). Groups returned under Sheshbazzar and Zerubbabel (538 BC), Ezra (458 BC, a four-month journey, Ezra 7:9) and Nehemiah, who came from the Persian court at Susa as governor (445 BC, Neh 2). The text does not give the return route; the caravan road by Tadmor and Damascus is a likely reconstruction.',
    ],
    legs: {
      exile: 'Jerusalem to Babylon along the Fertile Crescent, by way of Riblah and Carchemish (597–586 BC).',
      return: 'From Susa and Babylon back to Jerusalem under Cyrus’ decree (538–445 BC).',
    },
  },
  'jesus-ministry': {
    writeup: [
      'Jesus is born in Bethlehem of Judea (Matt 2:1; Luke 2:4–7). Warned in a dream, Joseph takes the family to Egypt until Herod’s death, then settles in Nazareth in Galilee (Matt 2:13–23), where Jesus grows up.',
      'After his baptism by John at the Jordan (Matt 3:13–17), Jesus makes Capernaum on the Sea of Galilee the base of his ministry (Matt 4:13), teaching and healing in the towns of Galilee. He passes through Samaria (John 4), travels north to the villages of Caesarea Philippi, where Peter confesses him as the Messiah (Matt 16:13–20), and is transfigured on a high mountain (Matt 17:1–8).',
      'Setting his face toward Jerusalem (Luke 9:51), he goes by way of Jericho (Luke 19:1–10) and Bethany into the city, where he is crucified and rises again; the risen Jesus appears to two disciples on the road to Emmaus (Luke 24:13–35). John’s Gospel records several earlier visits to Jerusalem for the feasts, so this route is a simplified outline that follows the first three Gospels.',
    ],
    legs: { jesus: 'From his birth in Bethlehem to the cross and resurrection in Jerusalem.' },
  },
  'paul-journeys': {
    writeup: [
      'Sent out by the church in Antioch of Syria (Acts 13:1–3), Paul — with Barnabas on the first journey, and Silas and Timothy on the second — carried the gospel along Roman roads and sea lanes. In each city he usually began in the synagogue before turning to the Gentiles, and he later wrote to many of the churches he founded.',
      'The first journey crossed Cyprus into southern Asia Minor (c. AD 46–48). The second revisited those churches, crossed from Troas to Macedonia after a vision (Acts 16:9–10), and founded churches at Philippi, Thessalonica, Berea and Corinth (c. AD 49–52). The third centred on nearly three years in Ephesus before Paul revisited Macedonia and Greece and sailed for Jerusalem with the collection for its poor (c. AD 53–57).',
      'Arrested in Jerusalem and held for two years at Caesarea, Paul appealed to Caesar and was sent to Rome under guard. After a storm and shipwreck on Malta (Acts 27–28) he reached Rome around AD 60, where he lived for two years under house arrest, teaching openly. The dates are approximate.',
    ],
    legs: {
      'paul-1': 'Antioch to Cyprus and the cities of southern Galatia — Pisidian Antioch, Iconium, Lystra, Derbe — and back (c. AD 46–48).',
      'paul-2': 'Through Asia Minor to Troas, then into Europe: Macedonia and Achaia (c. AD 49–52).',
      'paul-3': 'Three years in Ephesus, then Macedonia and Greece, and by sea to Jerusalem (c. AD 53–57).',
      'paul-rome': 'From Caesarea as a prisoner; shipwrecked on Malta; Rome (c. AD 59–60).',
    },
  },
};
