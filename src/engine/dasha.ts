import { DashaNode } from '../types/kalayantra';
import { NAKSHATRAS, VIMSHOTTARI_DASHA_LORDS } from './kosha';
import { normalize360 } from './astronomy';

export function calculateVimshottariTree(
  birthDate: Date,
  moonLongitude: number,
  targetDate: Date = new Date()
): {
  janmaNakshatra: string;
  balanceYears: number;
  balanceLord: string;
  currentMahaDasha: string;
  currentAntarDasha: string;
  currentPratyantarDasha: string;
  mahadashas: DashaNode[];
} {
  const normMoon = normalize360(moonLongitude);
  const nakSpan = 360.0 / 27.0; // 13° 20'
  const nakIdx = Math.floor(normMoon / nakSpan);
  const degInNak = normMoon % nakSpan;

  const nakData = NAKSHATRAS[nakIdx];
  const janmaLordName = nakData.lord;

  // Find index in 9-lord cycle
  const lordOrder = VIMSHOTTARI_DASHA_LORDS;
  const startLordIdx = lordOrder.findIndex(l => l.lord === janmaLordName);

  const fractionElapsed = degInNak / nakSpan;
  const fractionRemaining = 1.0 - fractionElapsed;

  const startLordData = lordOrder[startLordIdx];
  const balanceYears = startLordData.years * fractionRemaining;

  const MS_PER_YEAR = 365.2425 * 86400000;

  const mahadashas: DashaNode[] = [];
  let currentStartMs = birthDate.getTime();

  let curMaha = '';
  let curAntar = '';
  let curPraty = '';

  for (let m = 0; m < 9; m++) {
    const lIdx = (startLordIdx + m) % 9;
    const lData = lordOrder[lIdx];
    const durationYears = m === 0 ? balanceYears : lData.years;
    const durationMs = durationYears * MS_PER_YEAR;
    const endMs = currentStartMs + durationMs;

    const startDate = new Date(currentStartMs);
    const endDate = new Date(endMs);
    const targetMs = targetDate.getTime();
    const isMahaCurrent = targetMs >= currentStartMs && targetMs < endMs;

    if (isMahaCurrent) {
      curMaha = lData.lord;
    }

    const elapsedMs = Math.max(0, Math.min(durationMs, targetMs - currentStartMs));
    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / durationMs) * 100)));

    // Generate Antardashas (sub-periods)
    const antardashas: DashaNode[] = [];
    let antarStartMs = currentStartMs;

    for (let a = 0; a < 9; a++) {
      const aIdx = (lIdx + a) % 9;
      const aData = lordOrder[aIdx];
      // Antardasha proportion: (MahaYears * AntarYears) / 120
      const standardAntarYears = (lData.years * aData.years) / 120.0;
      // In first mahadasha, scale proportionally if balance
      const effAntarYears = m === 0 ? (standardAntarYears * (balanceYears / lData.years)) : standardAntarYears;
      const antarMs = effAntarYears * MS_PER_YEAR;
      const antarEndMs = antarStartMs + antarMs;

      const antarStartDate = new Date(antarStartMs);
      const antarEndDate = new Date(antarEndMs);
      const isAntarCurrent = isMahaCurrent && targetMs >= antarStartMs && targetMs < antarEndMs;

      if (isAntarCurrent) {
        curAntar = aData.lord;
      }

      const antarElapsed = Math.max(0, Math.min(antarMs, targetMs - antarStartMs));
      const antarProgress = Math.min(100, Math.max(0, Math.round((antarElapsed / antarMs) * 100)));

      // Generate Pratyantardashas (sub-sub-periods)
      const pratyantardashas: DashaNode[] = [];
      let pratyStartMs = antarStartMs;

      for (let p = 0; p < 9; p++) {
        const pIdx = (aIdx + p) % 9;
        const pData = lordOrder[pIdx];
        const effPratyYears = (effAntarYears * pData.years) / 120.0;
        const pratyMs = effPratyYears * MS_PER_YEAR;
        const pratyEndMs = pratyStartMs + pratyMs;

        const pratyStartDate = new Date(pratyStartMs);
        const pratyEndDate = new Date(pratyEndMs);
        const isPratyCurrent = isAntarCurrent && targetMs >= pratyStartMs && targetMs < pratyEndMs;

        if (isPratyCurrent) {
          curPraty = pData.lord;
        }

        const pratyElapsed = Math.max(0, Math.min(pratyMs, targetMs - pratyStartMs));
        const pratyProgress = Math.min(100, Math.max(0, Math.round((pratyElapsed / pratyMs) * 100)));

        pratyantardashas.push({
          level: 3,
          lord: pData.lord,
          startDate: pratyStartDate,
          endDate: pratyEndDate,
          durationDays: Math.round(effPratyYears * 365.25),
          isCurrent: isPratyCurrent,
          progressPercent: pratyProgress,
        });

        pratyStartMs = pratyEndMs;
      }

      antardashas.push({
        level: 2,
        lord: aData.lord,
        startDate: antarStartDate,
        endDate: antarEndDate,
        durationDays: Math.round(effAntarYears * 365.25),
        isCurrent: isAntarCurrent,
        progressPercent: antarProgress,
        children: pratyantardashas,
      });

      antarStartMs = antarEndMs;
    }

    mahadashas.push({
      level: 1,
      lord: lData.lord,
      startDate,
      endDate,
      durationDays: Math.round(durationYears * 365.25),
      isCurrent: isMahaCurrent,
      progressPercent,
      children: antardashas,
    });

    currentStartMs = endMs;
  }

  return {
    janmaNakshatra: nakData.en,
    balanceYears: Math.round(balanceYears * 100) / 100,
    balanceLord: janmaLordName,
    currentMahaDasha: curMaha || mahadashas[0].lord,
    currentAntarDasha: curAntar || mahadashas[0].children![0].lord,
    currentPratyantarDasha: curPraty || mahadashas[0].children![0].children![0].lord,
    mahadashas,
  };
}
