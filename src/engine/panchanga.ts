import { 
  AyanamshaMode, 
  CityInfo, 
  PanchangaDay, 
  PanchangaMode,
  TithiInfo,
  NakshatraInfo,
  YogaInfo,
  KaranaInfo,
  VaaraInfo,
  SolarDateInfo,
} from '../types/kalayantra';
import { 
  calculateGrahaSiderealPositions, 
  calculateSunMoonTiming, 
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

export function calculatePanchanga(
  date: Date,
  city: CityInfo,
  mode: PanchangaMode = 'udaya',
  ayanamshaMode: AyanamshaMode = 'lahiri'
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

  const tithi: TithiInfo = {
    idx: tithiIdx,
    name: tithiData.en,
    paksha: tithiData.paksha,
    tithiInPaksha: tithiData.tithiNum,
    deity: tithiData.deity,
    nature: tithiData.nature,
    endTime: tithiTrans.endTime,
    percentElapsed: tithiTrans.percentElapsed,
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

  // 5. Vaara
  const vaaraDate = date >= timing.sunrise ? date : new Date(date.getTime() - 86400000);
  const vaaraIdx = vaaraDate.getDay();
  const vaaraData = VAARAS[vaaraIdx];
  const vaara: VaaraInfo = {
    idx: vaaraIdx,
    name: vaaraData.en,
    lord: vaaraData.lord,
    deity: vaaraData.lord,
  };

  // Solar Calendar
  const sauraMasaIdx = Math.floor(sunLon / 30.0);
  const sauraMasa = RASHIS[sauraMasaIdx].iast + ' Masa';
  const degInSauraMasa = sunLon % 30.0;
  const dayOfMonth = Math.floor(degInSauraMasa) + 1;

  const gregYear = date.getFullYear();
  const isPastChaitraPratipada = (sauraMasaIdx > 0) || (sauraMasaIdx === 0 && dayOfMonth >= 1);
  const shakaYear = isPastChaitraPratipada ? gregYear - 78 : gregYear - 79;
  const vikramaSamvat = isPastChaitraPratipada ? gregYear + 57 : gregYear + 56;

  const samvatsaraIdx = ((shakaYear - 11) % 60 + 60) % 60;
  const samvatsara = SAMVATSARAS[samvatsaraIdx];

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
    samvatsara,
    ayana,
    ritu,
  };

  const lunarMonthIdx = tithi.paksha === 'Shukla' ? sauraMasaIdx : (sauraMasaIdx) % 12;
  const lunarMonth = MASAS[lunarMonthIdx].en;

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
  };
}
