import { 
  BodhaAnalysis, 
  CityInfo, 
  DivisionalChartId, 
  GrahaPosition, 
  GrahaStrengthFact, 
  KundaliChartData, 
  YogaEvidence 
} from '../types/kalayantra';
import { RASHIS, NAKSHATRAS } from './kosha';
import { calculateKundali } from './kundali';

export function analyzeChart(kundali: KundaliChartData): BodhaAnalysis {
  const grahas = kundali.grahas;
  const lagnaRashi = kundali.lagnaRashiIdx;

  const sun = grahas.find(g => g.id === 0)!;
  const moon = grahas.find(g => g.id === 1)!;
  const mars = grahas.find(g => g.id === 2)!;
  const mercury = grahas.find(g => g.id === 3)!;
  const jupiter = grahas.find(g => g.id === 4)!;
  const venus = grahas.find(g => g.id === 5)!;
  const saturn = grahas.find(g => g.id === 6)!;
  const rahu = grahas.find(g => g.id === 7)!;
  const ketu = grahas.find(g => g.id === 8)!;

  const yogas: YogaEvidence[] = [];

  // Helper: check if house is Kendra (1, 4, 7, 10)
  const isKendra = (h: number) => [1, 4, 7, 10].includes(h);
  // Helper: check if house is Trikona (1, 5, 9)
  const isTrikona = (h: number) => [1, 5, 9].includes(h);
  // Helper: check Kendra from Moon
  const isKendraFromMoon = (g: GrahaPosition) => {
    const dist = ((g.rashiIdx - moon.rashiIdx + 12) % 12) + 1;
    return [1, 4, 7, 10].includes(dist);
  };

  // 1. Gajakesari Yoga (Guru in Kendra from Moon)
  if (jupiter && moon && isKendraFromMoon(jupiter)) {
    yogas.push({
      id: 'gajakesari',
      name: 'Gajakesarī Yoga',
      type: 'Auspicious',
      description: 'Jupiter occupies a Kendra house (1st, 4th, 7th, or 10th) from the Moon. Conveys high intellectual acumen, noble eloquence, enduring public reputation, and royal favors.',
      grahasInvolved: ['Jupiter', 'Moon'],
      factors: [`Jupiter in ${jupiter.rashiName}`, `Moon in ${moon.rashiName}`],
      rule: 'Bṛhat Parāśara Horā Śāstra, Ch. 36: When Jupiter is in a quadrant from the Moon, Gajakesari is formed.',
      sourceText: 'Bṛhat Parāśara Horā Śāstra',
    });
  }

  // 2. Budhaditya Yoga (Sun + Mercury)
  if (sun && mercury && sun.rashiIdx === mercury.rashiIdx) {
    const degDiff = Math.abs(sun.degreeInRashi - mercury.degreeInRashi);
    const isCombust = degDiff < 5.0; // severe combustion
    yogas.push({
      id: 'budhaditya',
      name: 'Budhāditya Yoga',
      type: 'Auspicious',
      description: `Sun and Mercury unite in ${sun.rashiName}. Bestows analytical intelligence, mathematical or administrative acumen, and eloquence.${isCombust ? ' (Mildly affected by solar conjunction proximity).' : ''}`,
      grahasInvolved: ['Sun', 'Mercury'],
      factors: [`Sun and Mercury both in ${sun.rashiName} (${degDiff.toFixed(1)}° orb)`],
      rule: 'Sārāvalī, Ch. 14: Conjunction of Sun and Mercury produces a scholar possessing sharp intellect and respect.',
      sourceText: 'Sārāvalī',
    });
  }

  // 3. Pancha Mahapurusha Yogas
  // Ruchaka (Mars in Kendra in Own or Exalted)
  if (mars && isKendra(mars.bhava) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(mars.dignity)) {
    yogas.push({
      id: 'ruchaka',
      name: 'Rucaka Yoga (Pañca Mahāpuruṣa)',
      type: 'Mahapurusha',
      description: 'Mars is placed in a Kendra house in its exaltation (Capricorn) or own sign (Aries/Scorpio). Bestows valor, decisive leadership, physical stamina, and success in high enterprises.',
      grahasInvolved: ['Mars'],
      factors: [`Mars in Bhāva ${mars.bhava} (${mars.rashiName}) as ${mars.dignity}`],
      rule: 'Bṛhat Saṃhitā: Ruchaka native has great courage, strategic mastery, and command over land or army.',
      sourceText: 'Bṛhat Jātaka',
    });
  }

  // Bhadra (Mercury in Kendra in Gemini or Virgo)
  if (mercury && isKendra(mercury.bhava) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(mercury.dignity)) {
    yogas.push({
      id: 'bhadra',
      name: 'Bhadra Yoga (Pañca Mahāpuruṣa)',
      type: 'Mahapurusha',
      description: 'Mercury occupies a Kendra house in Gemini or Virgo. Confers supreme intellect, commercial mastery, witty eloquence, and deep scholarship.',
      grahasInvolved: ['Mercury'],
      factors: [`Mercury in Bhāva ${mercury.bhava} (${mercury.rashiName}) as ${mercury.dignity}`],
      rule: 'Phaladīpikā, Ch. 6: Bhadra Yoga produces a statesman with oratorical genius.',
      sourceText: 'Phaladīpikā',
    });
  }

  // Hamsa (Jupiter in Kendra in Sag, Pisces, or Cancer)
  if (jupiter && isKendra(jupiter.bhava) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(jupiter.dignity)) {
    yogas.push({
      id: 'hamsa',
      name: 'Haṃsa Yoga (Pañca Mahāpuruṣa)',
      type: 'Mahapurusha',
      description: 'Jupiter is in a Kendra house in Cancer (exalted) or Sagittarius/Pisces (own sign). Imparts dharmic righteousness, wisdom, noble patronage, and spiritual illumination.',
      grahasInvolved: ['Jupiter'],
      factors: [`Jupiter in Bhāva ${jupiter.bhava} (${jupiter.rashiName}) as ${jupiter.dignity}`],
      rule: 'Bṛhat Parāśara Horā Śāstra: Hamsa native is revered by rulers and devoted to spiritual wisdom.',
      sourceText: 'Bṛhat Parāśara Horā Śāstra',
    });
  }

  // Malavya (Venus in Kendra in Taurus, Libra, or Pisces)
  if (venus && isKendra(venus.bhava) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(venus.dignity)) {
    yogas.push({
      id: 'malavya',
      name: 'Mālavya Yoga (Pañca Mahāpuruṣa)',
      type: 'Mahapurusha',
      description: 'Venus resides in a Kendra house in Taurus, Libra, or Pisces. Grants refined artistic tastes, luxurious comforts, magnetic charm, and harmonious marital felicity.',
      grahasInvolved: ['Venus'],
      factors: [`Venus in Bhāva ${venus.bhava} (${venus.rashiName}) as ${venus.dignity}`],
      rule: 'Jātaka Pārijāta: Malavya yoga bestows wealth, vehicles, and aesthetic happiness.',
      sourceText: 'Jātaka Pārijāta',
    });
  }

  // Sasa (Saturn in Kendra in Cap, Aqua, or Libra)
  if (saturn && isKendra(saturn.bhava) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(saturn.dignity)) {
    yogas.push({
      id: 'sasa',
      name: 'Śaśa Yoga (Pañca Mahāpuruṣa)',
      type: 'Mahapurusha',
      description: 'Saturn is situated in a Kendra in Libra (exalted) or Capricorn/Aquarius (own sign). Bestows iron will, endurance, administrative control over masses, and lasting legacy.',
      grahasInvolved: ['Saturn'],
      factors: [`Saturn in Bhāva ${saturn.bhava} (${saturn.rashiName}) as ${saturn.dignity}`],
      rule: 'Bṛhat Parāśara Horā Śāstra: Sasa yoga elevates the native to authoritative dominance through resilience.',
      sourceText: 'Bṛhat Parāśara Horā Śāstra',
    });
  }

  // 4. Chandra-Mangala Yoga (Moon + Mars)
  if (moon && mars && moon.rashiIdx === mars.rashiIdx) {
    yogas.push({
      id: 'chandra_mangala',
      name: 'Candra-Maṅgala Yoga',
      type: 'Dhana',
      description: 'Moon and Mars conjoin in the same house. Stimulates financial dynamism, strong earning capabilities, entrepreneurship, and vigorous drive.',
      grahasInvolved: ['Moon', 'Mars'],
      factors: [`Moon and Mars both situated in ${moon.rashiName}`],
      rule: 'Sārāvalī, Ch. 15: Conjunction of Moon and Mars produces wealth through personal commerce and valor.',
      sourceText: 'Sārāvalī',
    });
  }

  // 5. Sunapha, Anapha, Durudhara Yogas (planets in 2nd / 12th from Moon)
  const moonRashi = moon.rashiIdx;
  const planets2nd = grahas.filter(g => ![0, 1, 7, 8, 12].includes(g.id) && g.rashiIdx === (moonRashi + 1) % 12);
  const planets12th = grahas.filter(g => ![0, 1, 7, 8, 12].includes(g.id) && g.rashiIdx === (moonRashi + 11) % 12);

  if (planets2nd.length > 0 && planets12th.length > 0) {
    yogas.push({
      id: 'durudhara',
      name: 'Durudharā Yoga',
      type: 'Auspicious',
      description: 'Benefic or strong grahas occupy both the 2nd and 12th houses from the Moon. Assures balanced prosperity, renown, comforts, and generous patronage.',
      grahasInvolved: [...planets2nd.map(p => p.name), ...planets12th.map(p => p.name)],
      factors: [`Planets in 2nd from Moon: ${planets2nd.map(p => p.name).join(', ')}`, `Planets in 12th from Moon: ${planets12th.map(p => p.name).join(', ')}`],
      rule: 'Bṛhat Jātaka: Native with Durudhara possesses abundant wealth and ethical conduct.',
      sourceText: 'Bṛhat Jātaka',
    });
  } else if (planets2nd.length > 0) {
    yogas.push({
      id: 'sunapha',
      name: 'Sunaphā Yoga',
      type: 'Auspicious',
      description: 'Grahas occupy the 2nd house from the Moon. Promotes self-earned prosperity, intelligent speech, and status.',
      grahasInvolved: planets2nd.map(p => p.name),
      factors: [`Grahas in 2nd from Moon: ${planets2nd.map(p => p.name).join(', ')}`],
      rule: 'Bṛhat Jātaka: Sunapha yields wealth, intelligence, and comfort.',
      sourceText: 'Bṛhat Jātaka',
    });
  } else if (planets12th.length > 0) {
    yogas.push({
      id: 'anapha',
      name: 'Anaphā Yoga',
      type: 'Auspicious',
      description: 'Grahas occupy the 12th house from the Moon. Grants self-restraint, freedom from diseases, and steady reputation.',
      grahasInvolved: planets12th.map(p => p.name),
      factors: [`Grahas in 12th from Moon: ${planets12th.map(p => p.name).join(', ')}`],
      rule: 'Bṛhat Jātaka: Anapha confers dignity and sound health.',
      sourceText: 'Bṛhat Jātaka',
    });
  }

  // 6. Neecha Bhanga Raja Yoga (Debilitation cancelled)
  const debGrahas = grahas.filter(g => g.dignity === 'Debilitated');
  debGrahas.forEach(g => {
    // Check if sign lord is in Kendra from Lagna or Moon
    const signLordId = RASHIS[g.rashiIdx].lordIdx;
    const signLord = grahas.find(item => item.id === signLordId);
    if (signLord && (isKendra(signLord.bhava) || isKendraFromMoon(signLord))) {
      yogas.push({
        id: `neecha_bhanga_${g.id}`,
        name: `Nīca Bhaṅga Rāja Yoga (${g.name})`,
        type: 'Raja',
        description: `The debilitation of ${g.name} in ${g.rashiName} is cancelled because its sign lord (${signLord.name}) occupies a strong Kendra house. Transforms initial struggle into extraordinary triumph.`,
        grahasInvolved: [g.name, signLord.name],
        factors: [`${g.name} debilitated in ${g.rashiName}`, `Dispositor ${signLord.name} in Kendra (Bhāva ${signLord.bhava})`],
        rule: 'Phaladīpikā, Ch. 6, Sl. 26: If the lord of the sign occupied by a debilitated planet is in a Kendra from Lagna or Moon, Neecha Bhanga Raja Yoga occurs.',
        sourceText: 'Phaladīpikā',
      });
    }
  });

  // 7. Vipareeta Raja Yoga (6th, 8th, 12th lord in 6th, 8th, 12th)
  // Simplified check for Trika lords
  const trikaHouses = [6, 8, 12];
  grahas.forEach(g => {
    if (trikaHouses.includes(g.bhava)) {
      // Check if this graha rules a Trika house
      const ownSigns = RASHIS.map((r, idx) => ({ idx, lordIdx: r.lordIdx })).filter(r => r.lordIdx === g.id).map(r => r.idx);
      const ruledHouses = ownSigns.map(s => ((s - lagnaRashi + 12) % 12) + 1);
      const isTrikaLord = ruledHouses.some(h => trikaHouses.includes(h));
      if (isTrikaLord && g.id !== 0 && g.id !== 1) { // Sun/Moon usually exempted
        yogas.push({
          id: `vipareeta_${g.id}`,
          name: `Viparīta Rāja Yoga (${g.name})`,
          type: 'Vipareeta',
          description: `${g.name} ruling a dusthana (6th/8th/12th) is placed in dusthana house ${g.bhava}. Neutralizes negative karmas and produces sudden elevation out of adversities.`,
          grahasInvolved: [g.name],
          factors: [`${g.name} in dusthana Bhāva ${g.bhava}`],
          rule: 'Uttara Kālāmṛta: Dusthana lords posited in dusthana houses destroy difficulties and bestow sudden wealth.',
          sourceText: 'Uttara Kālāmṛta',
        });
      }
    }
  });

  // Graha Yuddha (Planetary War: true planets within 1° in same rashi)
  const planetaryWars: string[] = [];
  const warEligible = [mars, mercury, jupiter, venus, saturn].filter(Boolean);
  for (let i = 0; i < warEligible.length; i++) {
    for (let j = i + 1; j < warEligible.length; j++) {
      const g1 = warEligible[i];
      const g2 = warEligible[j];
      if (g1.rashiIdx === g2.rashiIdx) {
        const diff = Math.abs(g1.degreeInRashi - g2.degreeInRashi);
        if (diff <= 1.0) {
          const winner = g1.speed > g2.speed ? g1.name : g2.name;
          planetaryWars.push(`Graha Yuddha between ${g1.name} and ${g2.name} in ${g1.rashiName} (${diff.toFixed(2)}° orb). Traditional victor: ${winner}.`);
        }
      }
    }
  }

  // Drishtis (Aspects)
  const drishtis: { from: string; toSigns: string[]; toGrahas: string[]; rule: string }[] = [];
  grahas.forEach(g => {
    if (g.id === 12) return; // skip Maandi
    const aspectHouses = [7]; // all planets aspect 7th house
    if (g.id === 2) aspectHouses.push(4, 8); // Mars: 4, 7, 8
    if (g.id === 4 || g.id === 7 || g.id === 8) aspectHouses.push(5, 9); // Guru, Rahu, Ketu: 5, 7, 9
    if (g.id === 6) aspectHouses.push(3, 10); // Saturn: 3, 7, 10

    const toSigns: string[] = [];
    const toGrahas: string[] = [];

    aspectHouses.forEach(h => {
      const targetRashi = (g.rashiIdx + (h - 1)) % 12;
      toSigns.push(RASHIS[targetRashi].en);
      const aspectedGrahas = grahas.filter(other => other.id !== g.id && other.rashiIdx === targetRashi);
      aspectedGrahas.forEach(other => toGrahas.push(other.name));
    });

    drishtis.push({
      from: g.name,
      toSigns,
      toGrahas: Array.from(new Set(toGrahas)),
      rule: `Parāśarī Hora Śāstra: Full aspect on house(s) ${aspectHouses.join(', ')} from position.`,
    });
  });

  // Explainable Graha Strengths Ranking
  const strengths: GrahaStrengthFact[] = grahas.filter(g => g.id <= 8).map(g => {
    let score = 50; // base score
    const reasons: string[] = [];

    // Dignity
    if (g.dignity === 'Exalted') { score += 30; reasons.push('Exalted (Ucca) placement in zodiac.'); }
    else if (g.dignity === 'Moolatrikona') { score += 25; reasons.push('Moolatrikona placement.'); }
    else if (g.dignity === 'Own Sign') { score += 20; reasons.push('Own sign placement.'); }
    else if (g.dignity === 'Great Friend') { score += 15; reasons.push('Positioned in great friendly sign.'); }
    else if (g.dignity === 'Friend') { score += 10; reasons.push('Positioned in friendly sign.'); }
    else if (g.dignity === 'Debilitated') { score -= 25; reasons.push('Debilitated (Nīca) placement.'); }
    else if (g.dignity === 'Great Enemy') { score -= 15; reasons.push('Positioned in inimical sign.'); }

    // House placement
    if (isKendra(g.bhava)) { score += 15; reasons.push(`Kendra house (${g.bhava}th Bhāva) angular strength.`); }
    if (isTrikona(g.bhava)) { score += 15; reasons.push(`Trikona house (${g.bhava}th Bhāva) auspicious fortune.`); }
    if ([6, 8, 12].includes(g.bhava)) { score -= 10; reasons.push(`Dusthāna house (${g.bhava}th Bhāva) placement.`); }

    // Digbala (Directional Strength)
    if ((g.id === 0 || g.id === 2) && g.bhava === 10) { score += 20; reasons.push('Digbala in 10th house (South).'); }
    if ((g.id === 3 || g.id === 4) && g.bhava === 1) { score += 20; reasons.push('Digbala in 1st house / Lagna (East).'); }
    if (g.id === 6 && g.bhava === 7) { score += 20; reasons.push('Digbala in 7th house (West).'); }
    if ((g.id === 1 || g.id === 5) && g.bhava === 4) { score += 20; reasons.push('Digbala in 4th house (North).'); }

    // Combustion
    if (g.isCombust) { score -= 20; reasons.push('Combust (Asta) by close proximity to the Sun.'); }
    // Retrograde
    if (g.isRetrograde) { score += 10; reasons.push('Vakri (Retrograde) denotes heightened Chesta Bala.'); }

    score = Math.min(100, Math.max(10, score));

    const status: GrahaStrengthFact['status'] = score >= 70 ? 'Strong' : score >= 45 ? 'Moderate' : 'Weak';

    const aspects = drishtis.find(d => d.from === g.name)?.toGrahas || [];
    const involvedYogas = yogas.filter(y => y.grahasInvolved.includes(g.name)).map(y => y.name);

    return {
      graha: g.name,
      score,
      rank: 1, // updated below
      status,
      reasons,
      drishtiAspects: aspects,
      inYogas: involvedYogas,
    };
  }).sort((a, b) => b.score - a.score);

  strengths.forEach((s, idx) => { s.rank = idx + 1; });

  const lagnaRashiName = RASHIS[lagnaRashi].en;
  const lagnaLord = RASHIS[lagnaRashi].lord;
  const lagnaAnalysis = `The Ascendant (Lagna) is placed in ${lagnaRashiName} (${kundali.lagnaDegreeFormatted}) in the constellation of ${kundali.lagnaNakshatra} (Pāda ${kundali.lagnaPada}). The ruling lord of the Lagna is ${lagnaLord}.`;

  const topPlanet = strengths[0]?.graha || 'Jupiter';
  const summaryNarrative = `The chart is strongly anchored by ${lagnaRashiName} Lagna. The highest ranked planetary power in this chart is ${topPlanet} (${strengths[0]?.score}/100), exhibiting remarkable positional dignity. There are ${yogas.length} classical Yogas identified, led by ${yogas[0]?.name || 'auspicious configurations'}.`;

  return {
    lagnaAnalysis,
    yogas,
    strengths,
    planetaryWars,
    drishtis,
    summaryNarrative,
  };
}

/**
 * Natural language Q&A engine for KalaMedha
 */
export function answerQuestion(
  question: string,
  kundali: KundaliChartData,
  bodha: BodhaAnalysis
): string {
  const q = question.toLowerCase();

  if (q.includes('shani') || q.includes('saturn')) {
    const s = kundali.grahas.find(g => g.id === 6);
    if (!s) return 'Saturn position could not be retrieved.';
    return `Saturn (Śani) is in ${s.rashiName} (${s.degreeFormatted}) in Bhāva ${s.bhava}, occupying ${s.nakshatraName} (Pada ${s.pada}). Dignity: ${s.dignity}. Retrograde: ${s.isRetrograde ? 'Yes (Vakri)' : 'No (Mārgi)'}. Combust: ${s.isCombust ? 'Yes (Asta)' : 'No'}.`;
  }

  if (q.includes('guru') || q.includes('jupiter')) {
    const j = kundali.grahas.find(g => g.id === 4);
    if (!j) return 'Jupiter position could not be retrieved.';
    const fact = bodha.strengths.find(s => s.graha === 'Jupiter');
    return `Jupiter (Guru) is in ${j.rashiName} in Bhāva ${j.bhava}. Dignity: ${j.dignity}. Strength Score: ${fact?.score || 60}/100 (${fact?.status}). Key factors: ${fact?.reasons.join(', ')}.`;
  }

  if (q.includes('yoga')) {
    if (bodha.yogas.length === 0) return 'No major classical planetary yogas were identified in this chart.';
    return `Active Yogas in this chart (${bodha.yogas.length}): ${bodha.yogas.map(y => `${y.name} (${y.type})`).join('; ')}. Most prominent: ${bodha.yogas[0].name} — ${bodha.yogas[0].description}`;
  }

  if (q.includes('drishti') || q.includes('aspect')) {
    const drishtiSummary = bodha.drishtis.map(d => `${d.from} aspects ${d.toSigns.slice(0, 3).join(', ')} (affects ${d.toGrahas.join(', ') || 'empty houses'})`).join('\n');
    return `Classical Graha Drishtis (Aspects):\n${drishtiSummary}`;
  }

  if (q.includes('lagna') || q.includes('ascendant')) {
    return bodha.lagnaAnalysis;
  }

  if (q.includes('strong') || q.includes('strength') || q.includes('weak')) {
    const ranked = bodha.strengths.map(s => `#${s.rank} ${s.graha}: ${s.score}/100 (${s.status})`).join(', ');
    return `Planetary Strength Rankings: ${ranked}. Top graha: ${bodha.strengths[0]?.graha}; Most challenged graha: ${bodha.strengths[bodha.strengths.length - 1]?.graha}.`;
  }

  // Default fallback answer
  return `${bodha.summaryNarrative} You can ask specific queries such as: "Where is Shani?", "Is Guru strong?", "Which yogas are present?", "What does Mars aspect?", or "Analyze the Lagna".`;
}

/**
 * Birth-Time Uncertainty & Sensitivity Analyzer
 * Evaluates chart stability across ±5m, ±15m, ±30m
 */
export function analyzeBirthTimeSensitivity(
  birthDate: Date,
  city: CityInfo,
  chartId: DivisionalChartId = 'D1'
): {
  baseLagna: string;
  baseNavamsha: string;
  shifts: {
    offsetMinutes: number;
    lagnaRashi: string;
    navamshaRashi: string;
    hasLagnaShift: boolean;
    hasNavamshaShift: boolean;
  }[];
} {
  const baseChart = calculateKundali(birthDate, city, 'D1');
  const baseNav = calculateKundali(birthDate, city, 'D9');

  const baseLagna = baseChart.bhavas[0].rashiName;
  const baseNavamsha = baseNav.bhavas[0].rashiName;

  const offsets = [-30, -15, -5, +5, +15, +30];
  const shifts = offsets.map(m => {
    const testDate = new Date(birthDate.getTime() + m * 60000);
    const d1 = calculateKundali(testDate, city, 'D1');
    const d9 = calculateKundali(testDate, city, 'D9');
    const lRashi = d1.bhavas[0].rashiName;
    const nRashi = d9.bhavas[0].rashiName;
    return {
      offsetMinutes: m,
      lagnaRashi: lRashi,
      navamshaRashi: nRashi,
      hasLagnaShift: lRashi !== baseLagna,
      hasNavamshaShift: nRashi !== baseNavamsha,
    };
  });

  return {
    baseLagna,
    baseNavamsha,
    shifts,
  };
}
