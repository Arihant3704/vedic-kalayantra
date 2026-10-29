import { 
  AyanamshaMode, 
  BhavaDetail, 
  CityInfo, 
  DivisionalChartId, 
  GrahaPosition, 
  KundaliChartData 
} from '../types/kalayantra';
import { 
  calculateGrahaSiderealPositions, 
  calculateLagna, 
  formatDegree, 
  normalize360 
} from './astronomy';
import { 
  EXALTATION, 
  GRAHAS, 
  NAKSHATRAS, 
  NATURAL_FRIENDS, 
  OWN_SIGNS, 
  RASHIS 
} from './kosha';

export function getVargaSign(longitude: number, chartId: DivisionalChartId): number {
  const normLon = normalize360(longitude);
  const rashi = Math.floor(normLon / 30.0);
  const degInSign = normLon % 30.0;
  const isOdd = rashi % 2 === 0; // Aries=0 (odd sign in 1-based)

  switch (chartId) {
    case 'D1':
      return rashi;

    case 'D2': { // Hora
      // In odd signs: first 15° Sun (Leo: 4), second 15° Moon (Cancer: 3)
      // In even signs: first 15° Moon (3), second 15° Sun (4)
      if (isOdd) {
        return degInSign < 15.0 ? 4 : 3;
      } else {
        return degInSign < 15.0 ? 3 : 4;
      }
    }

    case 'D3': { // Drekkana
      const part = Math.floor(degInSign / 10.0); // 0, 1, 2
      if (part === 0) return rashi;
      if (part === 1) return (rashi + 4) % 12; // 5th sign
      return (rashi + 8) % 12; // 9th sign
    }

    case 'D4': { // Chaturthamsha
      const part = Math.floor(degInSign / 7.5); // 0, 1, 2, 3
      return (rashi + part * 3) % 12;
    }

    case 'D7': { // Saptamsha
      const part = Math.floor(degInSign / (30.0 / 7.0));
      return isOdd ? (rashi + part) % 12 : (rashi + 6 + part) % 12;
    }

    case 'D9': { // Navamsha
      const part = Math.floor(degInSign / (30.0 / 9.0)); // 0..8
      let startSign = 0;
      const elementGroup = rashi % 4;
      if (elementGroup === 0) startSign = 0; // Fire (Aries, Leo, Sag) -> Aries
      else if (elementGroup === 1) startSign = 9; // Earth (Taurus, Virgo, Cap) -> Capricorn
      else if (elementGroup === 2) startSign = 6; // Air (Gemini, Libra, Aqua) -> Libra
      else startSign = 3; // Water (Cancer, Scorpio, Pisces) -> Cancer
      return (startSign + part) % 12;
    }

    case 'D10': { // Dashamsha
      const part = Math.floor(degInSign / 3.0); // 0..9
      return isOdd ? (rashi + part) % 12 : (rashi + 8 + part) % 12;
    }

    case 'D12': { // Dwadashamsha
      const part = Math.floor(degInSign / 2.5); // 0..11
      return (rashi + part) % 12;
    }

    case 'D16': { // Shodashamsha
      const part = Math.floor(degInSign / (30.0 / 16.0));
      const mod = rashi % 3;
      const start = mod === 0 ? 0 : (mod === 1 ? 4 : 8); // Chara=Aries, Sthira=Leo, Dwi=Sag
      return (start + part) % 12;
    }

    case 'D20': { // Vimshamsha
      const part = Math.floor(degInSign / 1.5);
      const mod = rashi % 3;
      const start = mod === 0 ? 0 : (mod === 1 ? 8 : 4);
      return (start + part) % 12;
    }

    case 'D24': { // Chaturvimshamsha
      const part = Math.floor(degInSign / 1.25);
      return isOdd ? (4 + part) % 12 : (3 + part) % 12; // Leo or Cancer
    }

    case 'D27': { // Saptavimshamsha
      const part = Math.floor(degInSign / (30.0 / 27.0));
      const elementGroup = rashi % 4;
      const start = elementGroup === 0 ? 0 : (elementGroup === 1 ? 3 : (elementGroup === 2 ? 6 : 9));
      return (start + part) % 12;
    }

    case 'D30': { // Trimshamsha
      if (isOdd) {
        if (degInSign < 5) return 0; // Mars (Aries)
        if (degInSign < 10) return 10; // Saturn (Aquarius)
        if (degInSign < 18) return 8; // Jupiter (Sagittarius)
        if (degInSign < 25) return 2; // Mercury (Gemini)
        return 1; // Venus (Taurus)
      } else {
        if (degInSign < 5) return 1; // Venus (Taurus)
        if (degInSign < 12) return 5; // Mercury (Virgo)
        if (degInSign < 20) return 11; // Jupiter (Pisces)
        if (degInSign < 25) return 9; // Saturn (Capricorn)
        return 7; // Mars (Scorpio)
      }
    }

    case 'D60': { // Shashtiamsha
      const part = Math.floor(degInSign / 0.5); // 0..59
      return (rashi + part) % 12;
    }

    default:
      return rashi;
  }
}

/**
 * Calculate dignities of grahas
 */
export function getGrahaDignity(
  grahaId: number,
  rashiIdx: number,
  degInRashi: number,
  allGrahaRashis: Record<number, number>
): { dignity: GrahaPosition['dignity']; color: string } {
  // Exaltation check
  const ex = EXALTATION[grahaId];
  if (ex && rashiIdx === ex.sign) {
    return { dignity: 'Exalted', color: '#10b981' };
  }
  if (ex && rashiIdx === ex.debilitationSign) {
    return { dignity: 'Debilitated', color: '#ef4444' };
  }

  // Own sign check
  const own = OWN_SIGNS[grahaId] || [];
  if (own.includes(rashiIdx)) {
    // Moolatrikona degrees check
    if (
      (grahaId === 0 && rashiIdx === 4 && degInRashi <= 20) ||
      (grahaId === 1 && rashiIdx === 1 && degInRashi > 3) ||
      (grahaId === 2 && rashiIdx === 0 && degInRashi <= 12) ||
      (grahaId === 3 && rashiIdx === 5 && degInRashi >= 15 && degInRashi <= 20) ||
      (grahaId === 4 && rashiIdx === 8 && degInRashi <= 10) ||
      (grahaId === 5 && rashiIdx === 6 && degInRashi <= 15) ||
      (grahaId === 6 && rashiIdx === 10 && degInRashi <= 20)
    ) {
      return { dignity: 'Moolatrikona', color: '#059669' };
    }
    return { dignity: 'Own Sign', color: '#3b82f6' };
  }

  // Rashi lord
  const signLord = RASHIS[rashiIdx].lordIdx;
  const rel = NATURAL_FRIENDS[grahaId];
  if (!rel) return { dignity: 'Neutral', color: '#94a3b8' };

  const isNatFriend = rel.friends.includes(signLord);
  const isNatEnemy = rel.enemies.includes(signLord);

  // Temporary friendship (Tatkalika Mitra): grahas in 2nd, 3rd, 4th, 10th, 11th, 12th from each other
  const gRashi = allGrahaRashis[grahaId];
  const lordRashi = allGrahaRashis[signLord];
  let isTempFriend = false;
  if (gRashi !== undefined && lordRashi !== undefined) {
    const dist = (lordRashi - gRashi + 12) % 12;
    isTempFriend = [1, 2, 3, 9, 10, 11].includes(dist);
  }

  // Combine Natural + Temporary (Pañcadhā Maitrī)
  const natScore = isNatFriend ? 1 : (isNatEnemy ? -1 : 0);
  const tempScore = isTempFriend ? 1 : -1;
  const totalScore = natScore + tempScore;

  if (totalScore === 2) return { dignity: 'Great Friend', color: '#0284c7' }; // Adhi Mitra (+2)
  if (totalScore === 1) return { dignity: 'Friend', color: '#0ea5e9' };       // Mitra (+1)
  if (totalScore === 0) return { dignity: 'Neutral', color: '#94a3b8' };      // Sama (0)
  if (totalScore === -1) return { dignity: 'Enemy', color: '#f97316' };       // Shatru (-1)
  return { dignity: 'Great Enemy', color: '#dc2626' };                        // Adhi Shatru (-2)
}

/**
 * Check if a planet is combust (Asta) by Sun proximity
 */
export function isCombustBySun(grahaId: number, grahaLon: number, sunLon: number, isRetrograde: boolean): boolean {
  if (grahaId === 0 || grahaId === 7 || grahaId === 8 || grahaId === 12) return false;
  const dist = Math.abs(normalize360(grahaLon - sunLon));
  const orb = dist > 180 ? 360 - dist : dist;

  const limits: Record<number, number> = {
    1: 12.0, // Moon
    2: 17.0, // Mars
    3: isRetrograde ? 12.0 : 14.0, // Mercury
    4: 11.0, // Jupiter
    5: isRetrograde ? 8.0 : 10.0, // Venus
    6: 15.0, // Saturn
  };

  return orb <= (limits[grahaId] || 12.0);
}

/**
 * Calculate classical Jaimini 7-Chara Karakas (Sapta Karaka: AK through DK)
 * Evaluates only the 7 physical Grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
 * in descending order of longitudinal advancement in their respective rashis.
 */
export function calculateCharaKarakas(
  grahaList: { id: number; degInRashi: number }[]
): Record<number, string> {
  // Classical 7-Karaka system: Only 7 planets (0..6), strictly excluding Rahu, Ketu, and Maandi
  const eligible = grahaList
    .filter(g => [0, 1, 2, 3, 4, 5, 6].includes(g.id))
    .map(g => ({
      id: g.id,
      degInRashi: g.degInRashi,
    }))
    .sort((a, b) => b.degInRashi - a.degInRashi);

  const labels = [
    'AK (Ātmakāraka)',
    'AmK (Amātyakāraka)',
    'BK (Bhrātṛkāraka)',
    'MK (Mātṛkāraka)',
    'PK (Putrakāraka)',
    'GK (Jñātikāraka)',
    'DK (Dārākāraka)',
  ];

  const res: Record<number, string> = {};
  eligible.forEach((item, idx) => {
    if (idx < labels.length) {
      res[item.id] = labels[idx];
    }
  });

  return res;
}

/**
 * Main Kundali Chart Calculator
 */
export function calculateKundali(
  date: Date,
  city: CityInfo,
  chartId: DivisionalChartId = 'D1',
  ayanamshaMode: AyanamshaMode = 'lahiri'
): KundaliChartData {
  const { ayanamsha, grahas: rawGrahasUntyped } = calculateGrahaSiderealPositions(date, city, ayanamshaMode);
  const rawGrahas = rawGrahasUntyped as Record<number, { lon: number; speed: number; isRetrograde: boolean }>;
  const lagnaInfo = calculateLagna(date, city, ayanamsha);

  const chartLagnaRashi = getVargaSign(lagnaInfo.lon, chartId);
  const chartTitle = `${chartId} — ${getVargaTitle(chartId)}`;

  const allGrahaRashis: Record<number, number> = {};
  Object.keys(rawGrahas).forEach((idStr) => {
    const id = parseInt(idStr, 10);
    allGrahaRashis[id] = Math.floor(rawGrahas[id].lon / 30.0);
  });

  const grahasRawList: { id: number; degInRashi: number }[] = [];
  const processedGrahas: GrahaPosition[] = [];

  const sunLon = rawGrahas[0].lon;

  Object.keys(rawGrahas).forEach((idStr) => {
    const id = parseInt(idStr, 10);
    const g = rawGrahas[id];
    const baseMeta = GRAHAS.find(item => item.id === id) || {
      id,
      en: 'Graha',
      iast: 'Graha',
      devanagari: 'ग्रह',
      glyph: '★',
      color: '#fff',
    };

    const d1Rashi = Math.floor(g.lon / 30.0);
    const degInD1 = g.lon % 30.0;
    grahasRawList.push({ id, degInRashi: degInD1 });

    // Varga sign
    const vargaRashi = getVargaSign(g.lon, chartId);
    const bhava = ((vargaRashi - chartLagnaRashi + 12) % 12) + 1;

    const nakIdx = Math.floor(g.lon / (360.0 / 27.0));
    const degInNak = g.lon % (360.0 / 27.0);
    const pada = Math.floor(degInNak / (360.0 / 108.0)) + 1;

    const { dignity, color } = getGrahaDignity(id, vargaRashi, degInD1, allGrahaRashis);
    const isCombust = isCombustBySun(id, g.lon, sunLon, g.isRetrograde);

    processedGrahas.push({
      id,
      name: baseMeta.en,
      glyph: baseMeta.glyph,
      longitude: g.lon,
      rashiIdx: vargaRashi,
      rashiName: RASHIS[vargaRashi].en,
      degreeInRashi: degInD1,
      degreeFormatted: formatDegree(degInD1),
      nakshatraIdx: nakIdx,
      nakshatraName: NAKSHATRAS[nakIdx].en,
      pada,
      bhava,
      speed: g.speed,
      isRetrograde: g.isRetrograde,
      isCombust,
      dignity,
      dignityColor: color,
    });
  });

  // Attach Chara Karakas
  const karakaMap = calculateCharaKarakas(grahasRawList);
  processedGrahas.forEach(g => {
    if (karakaMap[g.id]) {
      g.charaKaraka = karakaMap[g.id];
    }
  });

  // Group grahas into Bhavas (1..12)
  const bhavas: BhavaDetail[] = [];
  for (let b = 1; b <= 12; b++) {
    const rashiIdx = (chartLagnaRashi + (b - 1)) % 12;
    bhavas.push({
      bhava: b,
      rashiIdx,
      rashiName: RASHIS[rashiIdx].en,
      grahas: processedGrahas.filter(g => g.bhava === b),
    });
  }

  const lagnaNakIdx = Math.floor(lagnaInfo.lon / (360.0 / 27.0));
  const lagnaDegInNak = lagnaInfo.lon % (360.0 / 27.0);
  const lagnaPada = Math.floor(lagnaDegInNak / (360.0 / 108.0)) + 1;

  return {
    chartId,
    chartTitle,
    lagnaLongitude: lagnaInfo.lon,
    lagnaRashiIdx: chartLagnaRashi,
    lagnaDegreeFormatted: formatDegree(lagnaInfo.degreeInRashi),
    lagnaNakshatra: NAKSHATRAS[lagnaNakIdx].en,
    lagnaPada,
    grahas: processedGrahas,
    bhavas,
  };
}

function getVargaTitle(id: DivisionalChartId): string {
  switch (id) {
    case 'D1': return 'Rāśi (Natal Root Chart)';
    case 'D2': return 'Horā (Wealth & Resources)';
    case 'D3': return 'Drekkāṇa (Siblings & Courage)';
    case 'D4': return 'Caturthāṃśa (Property & Assets)';
    case 'D7': return 'Saptāṃśa (Children & Progeny)';
    case 'D9': return 'Navāṃśa (Dharma & Spouse)';
    case 'D10': return 'Daśāṃśa (Career & Status)';
    case 'D12': return 'Dvādaśāṃśa (Parents & Lineage)';
    case 'D16': return 'Ṣoḍaśāṃśa (Vehicles & Happiness)';
    case 'D20': return 'Viṃśāṃśa (Spiritual Progress)';
    case 'D24': return 'Caturviṃśāṃśa (Learning & Knowledge)';
    case 'D27': return 'Saptaviṃśāṃśa (Strengths & Weaknesses)';
    case 'D30': return 'Triṃśāṃśa (Misfortunes & Arishta)';
    case 'D60': return 'Ṣaṣṭyāṃśa (Past Karma & Fine Destiny)';
    default: return 'Divisional Chart';
  }
}
