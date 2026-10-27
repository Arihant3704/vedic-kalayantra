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
