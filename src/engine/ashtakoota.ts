import { AshtakootaResult, AshtakootaScore } from '../types/kalayantra';
import { NAKSHATRAS, NATURAL_FRIENDS, RASHIS } from './kosha';

export function calculateAshtakoota(
  groomNakIdx: number,
  groomPada: number,
  brideNakIdx: number,
  bridePada: number
): AshtakootaResult {
  const groomNak = NAKSHATRAS[groomNakIdx];
  const brideNak = NAKSHATRAS[brideNakIdx];

  // Moon Rashi from Nakshatra & Pada
  // Total 108 padas in 12 signs = 9 padas per sign
  const groomTotalPada = groomNakIdx * 4 + (groomPada - 1);
  const brideTotalPada = brideNakIdx * 4 + (bridePada - 1);

  const groomRashiIdx = Math.floor(groomTotalPada / 9) % 12;
  const brideRashiIdx = Math.floor(brideTotalPada / 9) % 12;

  const groomRashi = RASHIS[groomRashiIdx];
  const brideRashi = RASHIS[brideRashiIdx];

  const kootas: AshtakootaScore[] = [];
  const doshas: string[] = [];
  const cancellations: string[] = [];

  // 1. Varna (1 Point)
  const varnaOrder: Record<string, number> = { Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1 };
  const gVarnaVal = varnaOrder[groomRashi.varna] || 1;
  const bVarnaVal = varnaOrder[brideRashi.varna] || 1;
  const varnaPoints = gVarnaVal >= bVarnaVal ? 1 : 0;
  kootas.push({
    koota: 'Varna',
    maxPoints: 1,
    obtainedPoints: varnaPoints,
    description: `Groom (${groomRashi.varna}) & Bride (${brideRashi.varna}). Spiritual & temperament alignment.`,
    hasDosha: false,
    isCancelled: false,
  });

  // 2. Vashya (2 Points)
  let vashyaPoints = 0;
  if (groomRashi.vashya === brideRashi.vashya) {
    vashyaPoints = 2;
  } else if (
    (groomRashi.vashya === 'Manava' && brideRashi.vashya === 'Chatushpada') ||
    (groomRashi.vashya === 'Chatushpada' && brideRashi.vashya === 'Jalachara')
  ) {
    vashyaPoints = 1;
  } else if (groomRashi.vashya === 'Vanchara' || brideRashi.vashya === 'Keeta') {
    vashyaPoints = 0.5;
  } else {
    vashyaPoints = 1;
  }
  kootas.push({
    koota: 'Vashya',
    maxPoints: 2,
    obtainedPoints: vashyaPoints,
    description: `Mutual attraction, dominance, and magnetic harmony.`,
    hasDosha: false,
    isCancelled: false,
  });

  // 3. Tara (3 Points)
  // Distance from bride nakshatra to groom nakshatra mod 9, and groom to bride mod 9
  const taraDist1 = ((groomNakIdx - brideNakIdx + 27) % 27) % 9;
  const taraDist2 = ((brideNakIdx - groomNakIdx + 27) % 27) % 9;
  // Inauspicious remainders (0-indexed): 2 (Vipat=3rd), 4 (Pratyak=5th), 6 (Vadha=7th)
  const isMalefic1 = [2, 4, 6].includes(taraDist1);
  const isMalefic2 = [2, 4, 6].includes(taraDist2);

  let taraPoints = 3;
  if (isMalefic1 && isMalefic2) {
    taraPoints = 0;
  } else if (isMalefic1 || isMalefic2) {
    taraPoints = 1.5;
  }
  kootas.push({
    koota: 'Tara',
    maxPoints: 3,
    obtainedPoints: taraPoints,
    description: `Birth star destiny and longevity relationship.`,
    hasDosha: taraPoints === 0,
    isCancelled: false,
  });

  // 4. Yoni (4 Points)
  // Bitter enemy animal pairs
  const bitterEnemies: [string, string][] = [
    ['Horse', 'Buffalo'],
    ['Elephant', 'Lion'],
    ['Sheep', 'Monkey'],
    ['Serpent', 'Mongoose'],
    ['Dog', 'Deer'],
    ['Cat', 'Rat'],
    ['Cow', 'Tiger'],
  ];

  const gYoni = groomNak.yoni;
  const bYoni = brideNak.yoni;
  let yoniPoints = 2; // neutral default
  const isBitterEnemy = bitterEnemies.some(
    ([a, b]) => (a === gYoni && b === bYoni) || (b === gYoni && a === bYoni)
  );

  if (gYoni === bYoni) {
    yoniPoints = 4;
  } else if (isBitterEnemy) {
    yoniPoints = 0;
  } else {
    yoniPoints = 2.5;
  }
  kootas.push({
    koota: 'Yoni',
    maxPoints: 4,
    obtainedPoints: yoniPoints,
    description: `Biological, physical, and intimacy compatibility (Groom: ${gYoni}, Bride: ${bYoni}).`,
    hasDosha: isBitterEnemy,
    isCancelled: false,
  });

  // 5. Graha Maitri (5 Points)
  const gLord = groomRashi.lordIdx;
  const bLord = brideRashi.lordIdx;
  let maitriPoints = 3;

  if (gLord === bLord) {
    maitriPoints = 5;
  } else {
    const gRel = NATURAL_FRIENDS[gLord];
    const bRel = NATURAL_FRIENDS[bLord];
    const gLikesB = gRel?.friends.includes(bLord);
    const gHatesB = gRel?.enemies.includes(bLord);
    const bLikesG = bRel?.friends.includes(gLord);
    const bHatesG = bRel?.enemies.includes(gLord);

    if (gLikesB && bLikesG) maitriPoints = 5;
    else if ((gLikesB && !bHatesG) || (bLikesG && !gHatesB)) maitriPoints = 4;
    else if (!gHatesB && !bHatesG) maitriPoints = 3;
    else if (gHatesB && bHatesG) maitriPoints = 0;
    else maitriPoints = 1;
  }
  kootas.push({
    koota: 'Graha Maitri',
    maxPoints: 5,
    obtainedPoints: maitriPoints,
    description: `Rashi lord friendship: ${groomRashi.lord} & ${brideRashi.lord}. Mental camaraderie and intellectual affinity.`,
    hasDosha: maitriPoints <= 1,
    isCancelled: false,
  });

  // 6. Gana (6 Points)
  const gGana = groomNak.gana;
  const bGana = brideNak.gana;
  let ganaPoints = 6;
  let ganaDosha = false;

  if (gGana === bGana) {
    ganaPoints = 6;
  } else if ((gGana === 'Deva' && bGana === 'Manushya') || (gGana === 'Manushya' && bGana === 'Deva')) {
    ganaPoints = 5;
  } else if (gGana === 'Deva' && bGana === 'Rakshasa') {
    ganaPoints = 1;
    ganaDosha = true;
  } else if (gGana === 'Manushya' && bGana === 'Rakshasa') {
    ganaPoints = 0;
    ganaDosha = true;
  } else {
    ganaPoints = 0;
    ganaDosha = true;
  }
  if (ganaDosha) doshas.push('Gana Dosha present: Temperament mismatch between Deva/Manushya and Rakshasa ganas.');

  kootas.push({
    koota: 'Gana',
    maxPoints: 6,
    obtainedPoints: ganaPoints,
    description: `Psychological nature & life outlook (Groom: ${gGana}, Bride: ${bGana}).`,
    hasDosha: ganaDosha,
    isCancelled: false,
  });

  // 7. Bhakoot (7 Points)
  // Difference between moon signs
  const bhakootDist = ((brideRashiIdx - groomRashiIdx + 12) % 12) + 1;
  const badDistances = [2, 12, 6, 8, 5, 9];
  const isBadBhakoot = badDistances.includes(bhakootDist);
  let bhakootPoints = isBadBhakoot ? 0 : 7;
  let bhakootDosha = isBadBhakoot;
  let bhakootCancelled = false;
  let bhakootCancelReason = '';

  // Classical Bhakoot Dosha Cancellations:
  // 1. Same Rashi Lord (Aries-Scorpio Mars, Taurus-Libra Venus, Capricorn-Aquarius Saturn)
  // 2. Mutual friends
  if (bhakootDosha) {
    if (gLord === bLord) {
      bhakootCancelled = true;
      bhakootCancelReason = `Both Rashis share the same planetary ruler (${groomRashi.lord}), completely dissolving the Bhakoot dosha.`;
      bhakootPoints = 7;
    } else {
      const gRel = NATURAL_FRIENDS[gLord];
      const bRel = NATURAL_FRIENDS[bLord];
      if (gRel?.friends.includes(bLord) && bRel?.friends.includes(gLord)) {
        bhakootCancelled = true;
        bhakootCancelReason = `Rashi rulers (${groomRashi.lord} and ${brideRashi.lord}) are mutual friends in Shastra, granting Bhakoot cancellation.`;
        bhakootPoints = 7;
      }
    }
  }

  if (bhakootDosha && !bhakootCancelled) {
    doshas.push(`Bhakoot Dosha (${bhakootDist}/14 distance): may create domestic friction or financial strain unless pacified.`);
  } else if (bhakootCancelled) {
    cancellations.push(`Bhakoot Dosha cancelled: ${bhakootCancelReason}`);
  }

  kootas.push({
    koota: 'Bhakoot',
    maxPoints: 7,
    obtainedPoints: bhakootPoints,
    description: `Emotional bonding, longevity of marriage, and progeny health.`,
    hasDosha: bhakootDosha,
    isCancelled: bhakootCancelled,
    cancellationReason: bhakootCancelReason,
  });

  // 8. Nadi (8 Points)
  const gNadi = groomNak.nadi;
  const bNadi = brideNak.nadi;
  let nadiPoints = gNadi !== bNadi ? 8 : 0;
  let nadiDosha = gNadi === bNadi;
  let nadiCancelled = false;
  let nadiCancelReason = '';

  // Classical Nadi Cancellations:
  // 1. Same Nakshatra but different Padas
  if (nadiDosha && groomNakIdx === brideNakIdx && groomPada !== bridePada) {
    nadiCancelled = true;
    nadiCancelReason = 'Same Nakshatra with distinct Padas provides traditional exemption from Nadi Dosha.';
    nadiPoints = 8;
  }
  // 2. Different Nakshatras with same Rashi
  else if (nadiDosha && groomRashiIdx === brideRashiIdx && groomNakIdx !== brideNakIdx) {
    nadiCancelled = true;
    nadiCancelReason = 'Different Nakshatras positioned in the same Rashi neutralizes Nadi Dosha.';
    nadiPoints = 8;
  }
  // 3. Same Nakshatra in Rohini, Mrigashirsha, Ardra, Punarvasu, Pushya, etc. (Nakshatra special exemptions)
  else if (nadiDosha && [3, 4, 5, 6, 7].includes(groomNakIdx)) {
    nadiCancelled = true;
    nadiCancelReason = 'Classical exemption granted for benign birth constellations.';
    nadiPoints = 8;
  }

  if (nadiDosha && !nadiCancelled) {
    doshas.push(`Nadi Dosha (${gNadi} Nadi): Traditional warning regarding physiological and genetic compatibility.`);
  } else if (nadiCancelled) {
    cancellations.push(`Nadi Dosha cancelled: ${nadiCancelReason}`);
  }

  kootas.push({
    koota: 'Nadi',
    maxPoints: 8,
    obtainedPoints: nadiPoints,
    description: `Genetic health, vitality, and progeny vitality (Groom: ${gNadi}, Bride: ${bNadi}).`,
    hasDosha: nadiDosha,
    isCancelled: nadiCancelled,
    cancellationReason: nadiCancelReason,
  });

  const totalScore = kootas.reduce((acc, k) => acc + k.obtainedPoints, 0);

  let verdict: AshtakootaResult['verdict'] = 'Average';
  let recommendation = '';

  if (totalScore >= 28 && doshas.length === 0) {
    verdict = 'Excellent';
    recommendation = 'Exceptionally harmonious union across all physical, mental, and spiritual kootas.';
  } else if (totalScore >= 18 && doshas.length === 0) {
    verdict = 'Good';
    recommendation = 'Auspicious match with healthy overall compatibility above the classical 18-point threshold.';
  } else if (totalScore >= 18 && doshas.length > 0) {
    verdict = 'Good';
    recommendation = 'Points meet the required 18+ threshold, but active doshas require guidance or remedial rituals (Shanti Puja).';
  } else {
    verdict = 'Not Recommended';
    recommendation = 'Total score is below the traditional 18-point threshold. Astrological consultation recommended.';
  }

  return {
    groomNakshatra: groomNak.en,
    groomPada,
    groomRashi: groomRashi.en,
    brideNakshatra: brideNak.en,
    bridePada,
    brideRashi: brideRashi.en,
    totalScore,
    maxScore: 36,
    verdict,
    kootas,
    doshas,
    cancellations,
    recommendation,
  };
}
