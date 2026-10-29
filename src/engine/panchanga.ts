import { 
  AyanamshaMode, 
  CityInfo, 
  PanchangaDay, 
  PanchangaMode,
  MonthSystem,
  CalendarSystem,
  TithiInfo,
  NakshatraInfo,
  YogaInfo,
  KaranaInfo,
  VaaraInfo,
  SolarDateInfo,
  SuryaNakshatraInfo,
  LagnaInfo,
  YearDetails,
} from '../types/kalayantra';
import { 
  calculateGrahaSiderealPositions, 
  calculateSunMoonTiming, 
  calculateLagna,
  formatDegree,
  getTraditionalTime, 
  findElementTransition, 
  normalize360 
} from './astronomy';
import { 
  NAKSHATRAS, 
  RASHIS, 
  TITHI_NAMES, 
  YOGAS, 
  KARANAS, 
  VAARAS, 
  MASAS, 
  SAMVATSARAS, 
  RITUS 
} from './kosha';
import { calculateFestivalsForDay } from './festivals';

export function getTithiIndex(sunLon: number, moonLon: number): number {
  const diff = normalize360(moonLon - sunLon);
  return Math.floor(diff / 12.0);
}

export function getNakshatraIndex(moonLon: number): number {
  return Math.floor(normalize360(moonLon) / (360.0 / 27.0));
}

export function getYogaIndex(sunLon: number, moonLon: number): number {
  const sum = normalize360(sunLon + moonLon);
  return Math.floor(sum / (360.0 / 27.0));
}

export function getKaranaIndex(sunLon: number, moonLon: number): { sequenceIdx: number; uniqueIdx: number } {
  const diff = normalize360(moonLon - sunLon);
  const sequenceIdx = Math.floor(diff / 6.0); // 0..59

  let uniqueIdx = 0;
  if (sequenceIdx === 0) {
    uniqueIdx = 10; // Kintughna
  } else if (sequenceIdx >= 1 && sequenceIdx <= 56) {
    uniqueIdx = (sequenceIdx - 1) % 7; // 0=Bava..6=Vishti
  } else if (sequenceIdx === 57) {
    uniqueIdx = 7; // Shakuni
  } else if (sequenceIdx === 58) {
    uniqueIdx = 8; // Chatushpada
  } else {
    uniqueIdx = 9; // Naga
  }

  return { sequenceIdx, uniqueIdx };
}

/**
 * Astronomical calculation of the Amavasyanta lunar month.
 * In Hindu astronomy, a lunar month is named after the solar rashi in which the Sun is
 * situated at the moment of the PRECEDING New Moon (Amāvāsyā).
 * It remains fixed for that entire synodic month and does NOT change when Sun crosses a Rashi mid-month.
 */
export function getAmavasyantaMonthIndex(date: Date, city: CityInfo, ayanamshaMode: AyanamshaMode): number {
  const pos = calculateGrahaSiderealPositions(date, city, ayanamshaMode);
  const sunLon = pos.grahas[0].lon;
  const moonLon = pos.grahas[1].lon;

  // Angular distance of Moon ahead of Sun
  const diff = normalize360(moonLon - sunLon);

  // Synodic month is ~29.530588 days
  const daysSinceAmavasya = (diff / 360.0) * 29.530588;

  // Center point for backward search
  const t = date.getTime() - daysSinceAmavasya * 86400000;

  const getElongation = (ms: number) => {
    const p = calculateGrahaSiderealPositions(new Date(ms), city, ayanamshaMode);
    return normalize360(p.grahas[1].lon - p.grahas[0].lon);
  };

  // Coarse scan in 2-hour steps (+/- 36 hours around t)
  let bestMs = t;
  let minDiff = 360;

  for (let step = -18; step <= 18; step++) {
    const testMs = t + step * 7200000;
    if (testMs <= date.getTime() + 1000) {
      const e = getElongation(testMs);
      const distToZero = Math.min(e, 360 - e);
      if (distToZero < minDiff) {
        minDiff = distToZero;
        bestMs = testMs;
      }
    }
  }

  // Refine around bestMs using bisection
  let bLow = bestMs - 3600000;
  let bHigh = Math.min(date.getTime(), bestMs + 3600000);
  while (bHigh - bLow > 60000) { // 1 min resolution
    const mid1 = bLow + (bHigh - bLow) / 3;
    const mid2 = bHigh - (bHigh - bLow) / 3;
    const e1 = getElongation(mid1);
    const d1 = Math.min(e1, 360 - e1);
    const e2 = getElongation(mid2);
    const d2 = Math.min(e2, 360 - e2);
    if (d1 < d2) {
      bHigh = mid2;
    } else {
      bLow = mid1;
    }
  }

  const amavasyaTime = new Date((bLow + bHigh) / 2);
  const posAtAmavasya = calculateGrahaSiderealPositions(amavasyaTime, city, ayanamshaMode);
  const sunLonAtAmavasya = posAtAmavasya.grahas[0].lon;
  const sunRashiAtAmavasya = Math.floor(sunLonAtAmavasya / 30.0);

  // Month definition:
  // Sun in Meena (11) at New Moon -> Month is Chaitra (0)
  // Sun in Mesha (0) at New Moon -> Month is Vaishakha (1)
  // etc.
  return (sunRashiAtAmavasya + 1) % 12;
}

export function calculatePanchanga(
  date: Date,
  city: CityInfo,
  mode: PanchangaMode = 'udaya',
  ayanamshaMode: AyanamshaMode = 'lahiri',
  monthSystem: MonthSystem = 'amavasyanta',
  calendarSystem: CalendarSystem = 'vikram_samvat'
): PanchangaDay {
  const timing = calculateSunMoonTiming(date, city);
  const calcDate = mode === 'udaya' ? timing.sunrise : date;

  const { ayanamsha, grahas } = calculateGrahaSiderealPositions(calcDate, city, ayanamshaMode);
  const sunLon = grahas[0].lon;
  const moonLon = grahas[1].lon;

  // 1. Tithi
  const tithiIdx = getTithiIndex(sunLon, moonLon);
  const tithiData = TITHI_NAMES[tithiIdx];
  const tithiTrans = findElementTransition(calcDate, (d) => {
    const p = calculateGrahaSiderealPositions(d, city, ayanamshaMode);
    return getTithiIndex(p.grahas[0].lon, p.grahas[1].lon);
  });

  // Calculate Kshaya and Vriddhi Tithis:
  // Compare tithi at previous sunrise (yesterday), current sunrise, and next sunrise (tomorrow)
  const prevSunrise = new Date(timing.sunrise.getTime() - 86400000);
  const nextSunrise = new Date(timing.sunrise.getTime() + 86400000);

  const prevPos = calculateGrahaSiderealPositions(prevSunrise, city, ayanamshaMode);
  const nextPos = calculateGrahaSiderealPositions(nextSunrise, city, ayanamshaMode);

  const prevTithiIdx = getTithiIndex(prevPos.grahas[0].lon, prevPos.grahas[1].lon);
  const nextTithiIdx = getTithiIndex(nextPos.grahas[0].lon, nextPos.grahas[1].lon);

  // Vriddhi occurs if the tithi is present at two consecutive sunrises
  const isVriddhi = (tithiIdx === nextTithiIdx) || (tithiIdx === prevTithiIdx);
  const vriddhiNote = isVriddhi 
    ? 'Tithi spans across consecutive sunrises (Vṛddhi Tithi / extended lunar day)' 
    : undefined;

  // Kshaya occurs if a tithi is skipped between today's sunrise and next sunrise
  const tithiStep = (nextTithiIdx - tithiIdx + 30) % 30;
  const isKshaya = tithiStep >= 2;
  let kshayaTithiName: string | undefined;
  let kshayaEndTime: Date | undefined;

  if (isKshaya) {
    const skippedIdx = (tithiIdx + 1) % 30;
    kshayaTithiName = `${TITHI_NAMES[skippedIdx].paksha} ${TITHI_NAMES[skippedIdx].en}`;
    const skippedTrans = findElementTransition(timing.sunrise, (d) => {
      const p = calculateGrahaSiderealPositions(d, city, ayanamshaMode);
      return getTithiIndex(p.grahas[0].lon, p.grahas[1].lon);
    });
    kshayaEndTime = skippedTrans.endTime;
  }

  const tithi: TithiInfo = {
    idx: tithiIdx,
    name: tithiData.en,
    paksha: tithiData.paksha,
    tithiInPaksha: tithiData.tithiNum,
    deity: tithiData.deity,
    nature: tithiData.nature,
    endTime: tithiTrans.endTime,
    percentElapsed: tithiTrans.percentElapsed,
    isKshaya,
    isVriddhi,
    kshayaTithiName,
    kshayaEndTime,
    vriddhiNote,
  };

  // 2. Nakshatra
  const nakshatraIdx = getNakshatraIndex(moonLon);
  const nakshatraData = NAKSHATRAS[nakshatraIdx];
  const nakshatraSpan = 360.0 / 27.0; // 13° 20'
  const degInNakshatra = moonLon % nakshatraSpan;
  const pada = Math.floor(degInNakshatra / (nakshatraSpan / 4.0)) + 1;
  const degInPada = degInNakshatra % (nakshatraSpan / 4.0);

  const nakTrans = findElementTransition(calcDate, (d) => {
    const p = calculateGrahaSiderealPositions(d, city, ayanamshaMode);
    return getNakshatraIndex(p.grahas[1].lon);
  });

  const nakshatra: NakshatraInfo = {
    idx: nakshatraIdx,
    name: nakshatraData.en,
    pada,
    degreeInPada: degInPada,
    lord: nakshatraData.lord,
    deity: nakshatraData.deity,
    symbol: nakshatraData.symbol,
    gana: nakshatraData.gana,
    nadi: nakshatraData.nadi,
    yoni: nakshatraData.yoni,
    endTime: nakTrans.endTime,
    percentElapsed: nakTrans.percentElapsed,
  };

  // 3. Yoga
  const yogaIdx = getYogaIndex(sunLon, moonLon);
  const yogaData = YOGAS[yogaIdx];
  const yogaTrans = findElementTransition(calcDate, (d) => {
    const p = calculateGrahaSiderealPositions(d, city, ayanamshaMode);
    return getYogaIndex(p.grahas[0].lon, p.grahas[1].lon);
  });

  const yoga: YogaInfo = {
    idx: yogaIdx,
    name: yogaData.en,
    isAuspicious: yogaData.isAuspicious,
    endTime: yogaTrans.endTime,
    percentElapsed: yogaTrans.percentElapsed,
  };

  // 4. Karana
  const { sequenceIdx, uniqueIdx } = getKaranaIndex(sunLon, moonLon);
  const karanaData = KARANAS[uniqueIdx];
  const karanaTrans = findElementTransition(calcDate, (d) => {
    const p = calculateGrahaSiderealPositions(d, city, ayanamshaMode);
    return getKaranaIndex(p.grahas[0].lon, p.grahas[1].lon).sequenceIdx;
  });

  const karana: KaranaInfo = {
    idx: sequenceIdx,
    uniqueIdx,
    name: karanaData.en,
    isFixed: karanaData.isFixed,
    isBhadra: karanaData.isBhadra,
    endTime: karanaTrans.endTime,
    percentElapsed: karanaTrans.percentElapsed,
  };

  // 5. Vaara (Classical Sanskrit names: Ravi, Indu, Bhauma, Saumya, Guru, Bhargava, Sthira)
  const vaaraDate = date >= timing.sunrise ? date : new Date(date.getTime() - 86400000);
  const vaaraIdx = vaaraDate.getDay();
  const vaaraData = VAARAS[vaaraIdx];
  const vaara: VaaraInfo = {
    idx: vaaraIdx,
    name: vaaraData.en, // 'Ravi', 'Indu', 'Bhauma', 'Saumya', 'Guru', 'Bhargava', 'Sthira'
    lord: vaaraData.lord,
    deity: vaaraData.deity,
  };

  // 6. Surya Nakshatra & Lagna (Ascendant)
  const suryaNakIdx = Math.floor(sunLon / (360.0 / 27.0));
  const degInSuryaNak = sunLon % (360.0 / 27.0);
  const suryaPada = Math.floor(degInSuryaNak / (360.0 / 108.0)) + 1;
  const degInSuryaPada = degInSuryaNak % (360.0 / 108.0);
  const suryaNakMeta = NAKSHATRAS[suryaNakIdx];

  const suryaNakshatra: SuryaNakshatraInfo = {
    idx: suryaNakIdx,
    name: suryaNakMeta.en,
    pada: suryaPada,
    degreeInPada: degInSuryaPada,
    lord: suryaNakMeta.lord,
    deity: suryaNakMeta.deity,
  };

  const lagnaRaw = calculateLagna(calcDate, city, ayanamsha);
  const lagna: LagnaInfo = {
    rashi: RASHIS[lagnaRaw.rashiIdx].en,
    rashiIdx: lagnaRaw.rashiIdx,
    degreeInRashi: lagnaRaw.degreeInRashi,
    formattedDegree: formatDegree(lagnaRaw.degreeInRashi),
    lord: RASHIS[lagnaRaw.rashiIdx].lord,
  };

  // 7. Decoupled Lunar Month & Purnimanta/Amavasyanta
  const baseAmavasyantaMonthIdx = getAmavasyantaMonthIndex(calcDate, city, ayanamshaMode);
  let lunarMonthIdx = baseAmavasyantaMonthIdx;

  if (monthSystem === 'purnimanta' && tithi.paksha === 'Krishna') {
    // In Purnimanta system, Krishna Paksha is advanced by 1 month compared to Amavasyanta
    lunarMonthIdx = (baseAmavasyantaMonthIdx + 1) % 12;
  }
  const lunarMonth = MASAS[lunarMonthIdx].en;

  // 8. Solar Calendar
  const sauraMasaIdx = Math.floor(sunLon / 30.0);
  const sauraMasa = RASHIS[sauraMasaIdx].iast + ' Masa';
  const degInSauraMasa = sunLon % 30.0;
  const dayOfMonth = Math.floor(degInSauraMasa) + 1;

  const gregYear = date.getFullYear();
  // Chaitra Shukla Pratipada transition defines civil year changes in Chaitradi systems
  const isPastChaitraPratipada = (baseAmavasyantaMonthIdx > 0) || 
    (baseAmavasyantaMonthIdx === 0 && (tithi.paksha === 'Shukla' || monthSystem === 'purnimanta'));

  // Shalivahana Shaka Year (Epoch 78 CE)
  const shakaYear = isPastChaitraPratipada ? gregYear - 78 : gregYear - 79;

  // Vikram Samvat (Chaitradi - Epoch 57 BCE)
  const vikramaSamvat = isPastChaitraPratipada ? gregYear + 57 : gregYear + 56;

  // Vikram Kartak (Kartikadi - Epoch 56 BCE, starts Kartika Shukla Pratipada)
  const isPastKartikPratipada = baseAmavasyantaMonthIdx >= 7 || (baseAmavasyantaMonthIdx === 7 && tithi.paksha === 'Shukla');
  const vikramaKartakYear = isPastKartikPratipada ? gregYear + 57 : gregYear + 56;

  // Kali Yuga Year (Epoch 3102 BCE: 2026 CE is Kali Year 5128)
  const kaliYear = isPastChaitraPratipada ? gregYear + 3102 : gregYear + 3101;

  // Samvatsara calculations:
  // South Indian / Chandramana cycle (cyclic 60 synchronized with Shaka year):
  const samvatsaraSouthIdx = ((shakaYear + 11) % 60 + 60) % 60;
  const samvatsaraSouth = SAMVATSARAS[samvatsaraSouthIdx];

  // North Indian / Barhaspatya Jovian transit cycle (synchronized to Raudri for VS 2083):
  const samvatsaraNorthIdx = ((vikramaSamvat + 10) % 60 + 60) % 60;
  const samvatsaraNorth = SAMVATSARAS[samvatsaraNorthIdx];

  // Pick Samvatsara corresponding to chosen calendar system
  let activeSamvatsara = samvatsaraSouth;
  let calendarSystemName = 'Shalivahana Shaka';

  if (calendarSystem === 'vikram_samvat') {
    activeSamvatsara = samvatsaraNorth;
    calendarSystemName = 'Vikram Samvat (Chaitradi)';
  } else if (calendarSystem === 'vikram_kartak') {
    activeSamvatsara = samvatsaraNorth;
    calendarSystemName = 'Vikram Kartak (Kartikadi)';
  } else if (calendarSystem === 'shaka_samvat') {
    activeSamvatsara = samvatsaraSouth;
    calendarSystemName = 'Shalivahana Shaka';
  } else if (calendarSystem === 'saura') {
    activeSamvatsara = samvatsaraSouth;
    calendarSystemName = 'Saura (Solar Calendar)';
  }

  const isUttarayana = sauraMasaIdx >= 9 || sauraMasaIdx <= 2;
  const ayana: 'Uttarayana' | 'Dakshinayana' = isUttarayana ? 'Uttarayana' : 'Dakshinayana';

  const rituIdx = Math.floor(sauraMasaIdx / 2);
  const ritu = RITUS[rituIdx].name;

  const solar: SolarDateInfo = {
    sauraMasa,
    sauraMasaIdx,
    dayOfMonth,
    shakaYear,
    vikramaSamvat,
    vikramaKartakYear,
    kaliYear,
    samvatsara: activeSamvatsara,
    samvatsaraNorth,
    samvatsaraSouth,
    ayana,
    ritu,
  };

  const years: YearDetails = {
    shaka: shakaYear,
    vikram: vikramaSamvat,
    vikramKartak: vikramaKartakYear,
    kali: kaliYear,
    samvatsara: activeSamvatsara,
    calendarSystemName,
  };

  const traditionalTime = getTraditionalTime(date, timing.sunrise, timing.sunset);

  const dd = date.getDate().toString().padStart(2, '0');
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const dateStr = `${dd}-${mm}-${yyyy}`;

  const festivals = calculateFestivalsForDay({
    date,
    dateStr,
    tithiIdx,
    isKrishna: tithi.paksha === 'Krishna',
    sauraMasaIdx,
    lunarMonthIdx,
    vaaraIdx,
    timing,
    city,
    ayanamshaMode,
  });

  return {
    date,
    dateStr,
    mode,
    monthSystem,
    calendarSystem,
    ayanamshaMode,
    ayanamshaValue: ayanamsha,
    city,
    tithi,
    nakshatra,
    yoga,
    karana,
    vaara,
    lunarMonth,
    lunarMonthIdx,
    isAdhikaMasa: false,
    paksha: tithi.paksha,
    solar,
    sunMoon: timing,
    traditionalTime,
    festivals,
    suryaNakshatra,
    lagna,
    years,
  };
}
