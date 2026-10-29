import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  getJulianDay, 
  getAyanamsha, 
  normalize360, 
  formatDegree,
  formatDateDDMMYYYY
} from './astronomy';
import { 
  calculatePanchanga, 
  getTithiIndex, 
  getNakshatraIndex, 
  getYogaIndex, 
  getKaranaIndex 
} from './panchanga';
import { DEFAULT_CITY, NATURAL_FRIENDS } from './kosha';
import { calculateHoras, calculateChoghadiyas, calculateMuhurtas } from './muhurta';
import { calculateKundali, calculateCharaKarakas } from './kundali';
import { calculateVimshottariTree } from './dasha';
import { calculateAshtakoota } from './ashtakoota';
import { analyzeChart } from './bodha';
import { searchVidya } from './vidya';
import { generatePanchangaPDF, sanitizeForPdf } from './pdfExport';
import { 
  saveBookmark, 
  getAllBookmarks, 
  deleteBookmark, 
  updateBookmarkNotes, 
  filterBookmarks, 
  exportBookmarksJSON, 
  importBookmarksJSON, 
  clearAllBookmarks, 
  togglePanchangaBookmark, 
  toggleTransitBookmark,
  isPanchangaBookmarked,
  isTransitBookmarked,
  seedDefaultBookmarks 
} from './bookmarks';

test('astronomy: Julian Day and Ayanamsha calculations', () => {
  const d = new Date(Date.UTC(2026, 9, 27, 12, 0, 0));
  const jd = getJulianDay(d);
  assert.ok(jd > 2450000, 'Julian Day should be positive astronomical value');

  const ayanLahiri = getAyanamsha(jd, 'lahiri');
  assert.ok(ayanLahiri > 24.0 && ayanLahiri < 24.5, `Lahiri ayanamsha should be ~24.2°, got ${ayanLahiri}`);

  const ayanTrop = getAyanamsha(jd, 'tropical');
  assert.equal(ayanTrop, 0.0, 'Tropical ayanamsha must be 0');

  assert.equal(normalize360(370), 10);
  assert.equal(normalize360(-10), 350);
  assert.equal(formatDegree(15.5), `15° 30' 00"`);
});

test('panchanga: Five limbs index formulas', () => {
  assert.equal(getTithiIndex(100, 100), 0);
  assert.equal(getTithiIndex(0, 180), 15);

  assert.equal(getNakshatraIndex(5), 0);
  assert.equal(getNakshatraIndex(15), 1);

  assert.equal(getYogaIndex(0, 0), 0);

  const k = getKaranaIndex(0, 3);
  assert.equal(k.uniqueIdx, 10);
});

test('panchanga: calculatePanchanga returns complete structure', () => {
  const testDate = new Date(2026, 9, 27, 8, 30, 0);
  const p = calculatePanchanga(testDate, DEFAULT_CITY, 'udaya', 'lahiri');

  assert.ok(p.tithi.name.length > 0, 'Tithi name must not be empty');
  assert.ok(p.nakshatra.name.length > 0, 'Nakshatra name must not be empty');
  assert.ok(p.yoga.name.length > 0, 'Yoga name must not be empty');
  assert.ok(p.karana.name.length > 0, 'Karana name must not be empty');
  assert.ok(p.vaara.name.length > 0, 'Vaara name must not be empty');
  assert.ok(p.solar.sauraMasa.length > 0, 'Solar month must be present');
  assert.ok(p.traditionalTime.ghadi >= 0 && p.traditionalTime.ghadi < 60, 'Ghadi in range 0..60');
});

test('muhurta: Hora and Choghadiya partitions', () => {
  const testDate = new Date(2026, 9, 27, 10, 0, 0);
  const p = calculatePanchanga(testDate, DEFAULT_CITY, 'udaya');

  const horas = calculateHoras(testDate, p.sunMoon, p.vaara.idx);
  assert.equal(horas.length, 24, 'There must be 24 horas in a day');

  const chog = calculateChoghadiyas(testDate, p.sunMoon, p.vaara.idx);
  assert.equal(chog.day.length, 8, '8 day choghadiyas');
  assert.equal(chog.night.length, 8, '8 night choghadiyas');

  const muhurtas = calculateMuhurtas(testDate, p.sunMoon, p.vaara.idx);
  assert.ok(muhurtas.length >= 8, 'Classical muhurtas calculated');
  assert.ok(muhurtas.some(m => m.name === 'Brahma Muhurta'));
  assert.ok(muhurtas.some(m => m.name === 'Abhijit Muhurta'));
});

test('kundali: Chart generation and divisional charts', () => {
  const testDate = new Date(2026, 9, 27, 14, 30, 0);
  const d1 = calculateKundali(testDate, DEFAULT_CITY, 'D1');
  assert.equal(d1.bhavas.length, 12, 'Must have 12 bhavas');
  assert.ok(d1.grahas.length >= 9, 'Must calculate all 9 grahas');

  const d9 = calculateKundali(testDate, DEFAULT_CITY, 'D9');
  assert.equal(d9.chartId, 'D9');
  assert.equal(d9.bhavas.length, 12);
});

test('dasha: Vimshottari 120-year tree', () => {
  const birth = new Date(1995, 4, 15, 10, 30, 0);
  const dasha = calculateVimshottariTree(birth, 45.0, new Date(2026, 9, 27));
  assert.equal(dasha.mahadashas.length, 9, 'Must have 9 mahadashas');
  assert.ok(dasha.balanceYears > 0, 'Balance must be positive');
  assert.ok(dasha.currentMahaDasha.length > 0, 'Current mahadasha detected');
});

test('ashtakoota: 36-point Gun Milan matching', () => {
  const res = calculateAshtakoota(0, 1, 3, 2);
  assert.equal(res.kootas.length, 8, '8 kootas evaluated');
  assert.ok(res.totalScore >= 0 && res.totalScore <= 36, 'Score out of 36');
  assert.ok(res.verdict.length > 0, 'Verdict generated');
});

test('bodha: Reasoning engine and Yogas', () => {
  const testDate = new Date(2026, 9, 27, 14, 30, 0);
  const chart = calculateKundali(testDate, DEFAULT_CITY, 'D1');
  const bodha = analyzeChart(chart);
  assert.ok(bodha.strengths.length >= 9, 'All 9 grahas ranked');
  assert.ok(bodha.summaryNarrative.length > 0, 'Narrative generated');
});

test('vidya: Search encyclopedia concepts', () => {
  const all = searchVidya('');
  assert.ok(all.length >= 40, 'Should load at least 40 concepts');
  const tithiHits = searchVidya('tithi');
  assert.ok(tithiHits.length > 0, 'Searching tithi returns results');
});

test('pdfExport: Generates valid Panchanga PDF instance and sanitizes diacritics', () => {
  const sanitized = sanitizeForPdf('Śukla Pakṣa Daśamī — Rohiṇī');
  assert.equal(sanitized, 'Shukla Paksha Dashami - Rohini');

  const pDate = new Date(2026, 9, 27, 6, 30, 0);
  const p = calculatePanchanga(pDate, DEFAULT_CITY, 'udaya', 'lahiri');
  const doc = generatePanchangaPDF({ panchanga: p });
  
  assert.ok(doc, 'jsPDF document instance created');
  const pdfOutput = doc.output('datauristring');
  assert.ok(pdfOutput.startsWith('data:application/pdf;filename=generated.pdf;base64,'), 'Valid PDF data URI output');

  // Test multi-page structured report with Grahas & Choghadiyas on US Letter
  const doc2 = generatePanchangaPDF({ 
    panchanga: p, 
    paperSize: 'letter', 
    includeGrahas: true, 
    includeChoghadiyas: true,
    notes: 'Personal puja sankalpa notes'
  });
  assert.equal(doc2.getNumberOfPages(), 2, 'Should create 2-page PDF when planetary ephemeris is enabled');
  const pdfOutput2 = doc2.output('datauristring');
  assert.ok(pdfOutput2.length > 5000, 'Valid 2-page PDF output generated');
});

test('bookmarks: CRUD operations, notes update, and toggles', () => {
  clearAllBookmarks();
  assert.equal(getAllBookmarks().length, 0, 'Initially empty store');

  // Save a Panchanga bookmark
  const pBm = saveBookmark({
    type: 'panchanga',
    title: 'Kārtika Pūrṇimā Special',
    subtitle: 'Full Moon auspicious worship',
    dateISO: '2026-11-24',
    displayDate: 'Tuesday, 24 Nov 2026',
    cityName: 'Varanasi',
    notes: 'Personal vrata notes',
    panchangaDetails: {
      tithiName: 'Pūrṇimā',
      paksha: 'Shukla',
      nakshatraName: 'Kṛttikā',
      yogaName: 'Śiva',
      karanaName: 'Bava',
      vaaraName: 'Tuesday',
      lunarMonth: 'Kārtika',
    },
  });

  assert.ok(pBm.id, 'Bookmark should be assigned an ID');
  assert.equal(getAllBookmarks().length, 1);
  assert.equal(isPanchangaBookmarked('2026-11-24', 'Varanasi'), true);
  assert.equal(isPanchangaBookmarked('2026-11-25', 'Varanasi'), false);

  // Update notes
  const updatedNote = updateBookmarkNotes(pBm.id, 'Updated puja list: offer ghee lamps.');
  assert.equal(updatedNote, true);
  assert.equal(getAllBookmarks()[0].notes, 'Updated puja list: offer ghee lamps.');

  // Save a transit bookmark
  const tBm = saveBookmark({
    type: 'transit',
    title: 'Guru Ingress into Gemini',
    dateISO: '2026-06-02',
    displayDate: 'Tuesday, 02 Jun 2026',
    transitDetails: {
      grahaName: 'Guru (Jupiter)',
      transitRashi: 'Mithuna (Gemini)',
      houseFromMoon: 9,
      isBeneficTransit: true,
      category: 'Guru Ingress',
    },
  });

  assert.equal(getAllBookmarks().length, 2);
  assert.equal(isTransitBookmarked('Guru (Jupiter)', '2026-06-02', 'Mithuna (Gemini)'), true);
  assert.equal(isTransitBookmarked('Śani', '2026-06-02'), false);

  // Toggle Panchanga (remove)
  const toggleRes = togglePanchangaBookmark({
    type: 'panchanga',
    title: pBm.title,
    dateISO: '2026-11-24',
    displayDate: pBm.displayDate,
    cityName: 'Varanasi',
  });
  assert.equal(toggleRes.bookmarked, false);
  assert.equal(getAllBookmarks().length, 1);

  // Delete transit bookmark
  assert.equal(deleteBookmark(tBm.id), true);
  assert.equal(getAllBookmarks().length, 0);
});

test('bookmarks: Filtering, seed samples, and JSON Export/Import', () => {
  clearAllBookmarks();
  const seeded = seedDefaultBookmarks();
  assert.equal(seeded.length, 3, 'Sample bookmarks seeded');

  // Filter by type
  const panchangaOnly = filterBookmarks(seeded, 'panchanga');
  assert.equal(panchangaOnly.length, 2);

  const transitOnly = filterBookmarks(seeded, 'transit');
  assert.equal(transitOnly.length, 1);

  // Search by text query
  const searchVaranasi = filterBookmarks(seeded, 'all', 'Varanasi');
  assert.equal(searchVaranasi.length, 1);

  const searchJupiter = filterBookmarks(seeded, 'all', 'Jupiter');
  assert.equal(searchJupiter.length, 1);

  // JSON Export & Import
  const jsonExport = exportBookmarksJSON(seeded);
  assert.ok(jsonExport.includes('Kālayantra'));
  assert.ok(jsonExport.includes('Mithuna'));

  // Clear and re-import
  clearAllBookmarks();
  assert.equal(getAllBookmarks().length, 0);

  const importResult = importBookmarksJSON(jsonExport);
  assert.equal(importResult.success, true);
  assert.equal(importResult.importedCount, 3);
  assert.equal(getAllBookmarks().length, 3);
});

test('panchanga: Classical Sanskrit Vaara names (Ravi, Indu, Bhauma, Saumya, Guru, Bhargava, Sthira)', () => {
  const sunday = new Date(2026, 9, 25, 12, 0, 0);
  const monday = new Date(2026, 9, 26, 12, 0, 0);
  const tuesday = new Date(2026, 9, 27, 12, 0, 0);
  const wednesday = new Date(2026, 9, 28, 12, 0, 0);
  const thursday = new Date(2026, 9, 29, 12, 0, 0);
  const friday = new Date(2026, 9, 30, 12, 0, 0);
  const saturday = new Date(2026, 9, 31, 12, 0, 0);

  assert.equal(calculatePanchanga(sunday, DEFAULT_CITY).vaara.name, 'Bhanu');
  assert.equal(calculatePanchanga(monday, DEFAULT_CITY).vaara.name, 'Indu');
  assert.equal(calculatePanchanga(tuesday, DEFAULT_CITY).vaara.name, 'Bhauma');
  assert.equal(calculatePanchanga(wednesday, DEFAULT_CITY).vaara.name, 'Saumya');
  assert.equal(calculatePanchanga(thursday, DEFAULT_CITY).vaara.name, 'Guru');
  assert.equal(calculatePanchanga(friday, DEFAULT_CITY).vaara.name, 'Bhargava');
  assert.equal(calculatePanchanga(saturday, DEFAULT_CITY).vaara.name, 'Sthira');
});

test('panchanga: Surya Nakshatra and Lagna calculation', () => {
  const testDate = new Date(2026, 9, 28, 6, 30, 0);
  const p = calculatePanchanga(testDate, DEFAULT_CITY, 'udaya');

  assert.ok(p.suryaNakshatra, 'Surya Nakshatra must be present');
  assert.ok(p.suryaNakshatra.name.length > 0, 'Surya Nakshatra name must not be empty');
  assert.ok(p.suryaNakshatra.pada >= 1 && p.suryaNakshatra.pada <= 4, 'Pada must be 1..4');
  assert.ok(p.suryaNakshatra.lord.length > 0, 'Lord must be present');

  assert.ok(p.lagna, 'Lagna must be present');
  assert.ok(p.lagna.rashi.length > 0, 'Lagna sign must be present');
  assert.ok(p.lagna.degreeInRashi >= 0 && p.lagna.degreeInRashi < 30, 'Degree in rashi 0..30');
  assert.ok(p.lagna.formattedDegree.includes('°'), 'Formatted degree must contain °');
  assert.ok(p.lagna.lord.length > 0, 'Lagna lord must be present');
});

test('panchanga: Decoupled Lunar Month and Purnimanta vs Amavasyanta', () => {
  // Test both month systems for the same astronomical moment
  const testDate = new Date(2026, 9, 28, 12, 0, 0); // October 2026
  const amavasyanta = calculatePanchanga(testDate, DEFAULT_CITY, 'udaya', 'lahiri', 'amavasyanta');
  const purnimanta = calculatePanchanga(testDate, DEFAULT_CITY, 'udaya', 'lahiri', 'purnimanta');

  assert.ok(amavasyanta.lunarMonth.length > 0);
  assert.ok(purnimanta.lunarMonth.length > 0);

  // If in Krishna paksha, Purnimanta is 1 month ahead of Amavasyanta
  if (amavasyanta.paksha === 'Krishna') {
    assert.equal(purnimanta.lunarMonthIdx, (amavasyanta.lunarMonthIdx + 1) % 12);
  } else {
    assert.equal(purnimanta.lunarMonthIdx, amavasyanta.lunarMonthIdx);
  }
});

test('panchanga: Four calendrical systems and epoch years (Shaka, Vikram, Kali)', () => {
  const testDate = new Date(2026, 9, 28, 12, 0, 0);
  const pVikram = calculatePanchanga(testDate, DEFAULT_CITY, 'udaya', 'lahiri', 'amavasyanta', 'vikram_samvat');
  const pKartak = calculatePanchanga(testDate, DEFAULT_CITY, 'udaya', 'lahiri', 'amavasyanta', 'vikram_kartak');
  const pShaka = calculatePanchanga(testDate, DEFAULT_CITY, 'udaya', 'lahiri', 'amavasyanta', 'shaka_samvat');
  const pSaura = calculatePanchanga(testDate, DEFAULT_CITY, 'udaya', 'lahiri', 'amavasyanta', 'saura');

  // Year 2026 is Shaka 1948, Vikram Samvat 2083, Kali 5128
  assert.equal(pShaka.years.shaka, 1948);
  assert.equal(pVikram.years.vikram, 2083);
  assert.equal(pShaka.years.kali, 5128);

  // Samvatsara names according to active calendar system
  assert.ok(pVikram.years.samvatsara.length > 0);
  assert.ok(pShaka.years.samvatsara.length > 0);
  assert.equal(pVikram.years.calendarSystemName, 'Vikram Samvat (Chaitradi)');
  assert.equal(pKartak.years.calendarSystemName, 'Vikram Kartak (Kartikadi)');
  assert.equal(pShaka.years.calendarSystemName, 'Shalivahana Shaka');
  assert.equal(pSaura.years.calendarSystemName, 'Saura (Solar Calendar)');
});

test('graha maitri: Guru and Shukra are classical enemies and full friendship matrix', () => {
  // Guru (4) and Shukra (5)
  assert.ok(NATURAL_FRIENDS[4].enemies.includes(5), 'Guru must consider Shukra an enemy');
  assert.ok(NATURAL_FRIENDS[5].enemies.includes(4), 'Shukra must consider Guru an enemy');
  assert.ok(!NATURAL_FRIENDS[4].friends.includes(5), 'Guru must not consider Shukra a friend');
  assert.ok(!NATURAL_FRIENDS[5].friends.includes(4), 'Shukra must not consider Guru a friend');
});

test('kundali: Indian names for Grahas and Rashis', () => {
  const testDate = new Date(2026, 9, 28, 14, 30, 0);
  const chart = calculateKundali(testDate, DEFAULT_CITY, 'D1');

  const grahaNames = chart.grahas.map(g => g.name);
  assert.ok(grahaNames.includes('Surya'), 'Sun should be named Surya');
  assert.ok(grahaNames.includes('Chandra'), 'Moon should be named Chandra');
  assert.ok(grahaNames.includes('Mangala'), 'Mars should be named Mangala');
  assert.ok(grahaNames.includes('Budha'), 'Mercury should be named Budha');
  assert.ok(grahaNames.includes('Guru'), 'Jupiter should be named Guru');
  assert.ok(grahaNames.includes('Shukra'), 'Venus should be named Shukra');
  assert.ok(grahaNames.includes('Shani'), 'Saturn should be named Shani');
  assert.ok(grahaNames.includes('Rahu'), 'Rahu should be present');
  assert.ok(grahaNames.includes('Ketu'), 'Ketu should be present');

  // Verify Rashis are Indian
  const validIndianRashis = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
  chart.grahas.forEach(g => {
    assert.ok(validIndianRashis.includes(g.rashiName), `Rashi name ${g.rashiName} should be Indian`);
  });
});

test('engine: Raudri Samvatsara for Vikram Samvat 2083', () => {
  const testDate = new Date(2026, 9, 28, 12, 0, 0);
  const pVikram = calculatePanchanga(testDate, DEFAULT_CITY, 'udaya', 'lahiri', 'amavasyanta', 'vikram_samvat');
  assert.equal(pVikram.years.samvatsara, 'Raudri', `Vikram Samvat 2083 should be Raudri, got ${pVikram.years.samvatsara}`);
});

test('engine: Classical 7-Chara Karaka system', () => {
  const testDate = new Date(2026, 9, 28, 14, 30, 0);
  const chart = calculateKundali(testDate, DEFAULT_CITY, 'D1');

  // Rahu (id 7) and Ketu (id 8) must NOT have chara karakas in 7-karaka system
  const rahu = chart.grahas.find(g => g.id === 7)!;
  const ketu = chart.grahas.find(g => g.id === 8)!;
  assert.equal(rahu.charaKaraka, undefined, 'Rahu must not be in 7-Karaka system');
  assert.equal(ketu.charaKaraka, undefined, 'Ketu must not be in 7-Karaka system');

  // Exactly 7 karakas must exist for the 7 classical planets (ids 0 to 6)
  const classicalGrahas = chart.grahas.filter(g => g.id >= 0 && g.id <= 6);
  assert.equal(classicalGrahas.length, 7, 'There must be exactly 7 classical planets');
  classicalGrahas.forEach(g => {
    assert.ok(g.charaKaraka, `Planet ${g.name} must have a charaKaraka assigned`);
  });

  const karakaLabels = classicalGrahas.map(g => g.charaKaraka!);
  assert.ok(karakaLabels.some(l => l.startsWith('AK')), 'Atmakaraka present');
  assert.ok(karakaLabels.some(l => l.startsWith('AmK')), 'Amatyakaraka present');
  assert.ok(karakaLabels.some(l => l.startsWith('BK')), 'Bhratrikaraka present');
  assert.ok(karakaLabels.some(l => l.startsWith('MK')), 'Matrikaraka present');
  assert.ok(karakaLabels.some(l => l.startsWith('PK')), 'Putrakaraka present');
  assert.ok(karakaLabels.some(l => l.startsWith('GK')), 'Gnatikaraka present');
  assert.ok(karakaLabels.some(l => l.startsWith('DK')), 'Darakaraka present');
});

test('astronomy: Rahu and Ketu sidereal positions in Kumbha and Simha', () => {
  const testDate = new Date(2026, 9, 28, 12, 0, 0);
  const chart = calculateKundali(testDate, DEFAULT_CITY, 'D1', 'lahiri');
  const rahu = chart.grahas.find(g => g.id === 7)!;
  const ketu = chart.grahas.find(g => g.id === 8)!;

  assert.ok(rahu, 'Rahu should exist');
  assert.ok(ketu, 'Ketu should exist');

  // In Oct 2026, sidereal Rahu is in Kumbha (Aquarius: 300°..330°)
  assert.equal(rahu.rashiName, 'Kumbha', `Rahu should be in Kumbha, got ${rahu.rashiName}`);
  assert.ok(rahu.longitude >= 300 && rahu.longitude < 330, `Rahu longitude should be in Kumbha [300, 330), got ${rahu.longitude}`);

  // Ketu is 180° opposite in Simha (Leo: 120°..150°)
  assert.equal(ketu.rashiName, 'Simha', `Ketu should be in Simha, got ${ketu.rashiName}`);
  assert.ok(ketu.longitude >= 120 && ketu.longitude < 150, `Ketu longitude should be in Simha [120, 150), got ${ketu.longitude}`);
});

test('astronomy: formatDateDDMMYYYY format verification', () => {
  const d1 = new Date(2026, 9, 28);
  assert.equal(formatDateDDMMYYYY(d1), '28-10-2026');

  const d2 = new Date(1947, 7, 15);
  assert.equal(formatDateDDMMYYYY(d2), '15-08-1947');
});

