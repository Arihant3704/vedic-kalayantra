import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  getJulianDay, 
  getAyanamsha, 
  normalize360, 
  formatDegree 
} from './astronomy';
import { 
  calculatePanchanga, 
  getTithiIndex, 
  getNakshatraIndex, 
  getYogaIndex, 
  getKaranaIndex 
} from './panchanga';
import { DEFAULT_CITY } from './kosha';
import { calculateHoras, calculateChoghadiyas, calculateMuhurtas } from './muhurta';
import { calculateKundali } from './kundali';
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
