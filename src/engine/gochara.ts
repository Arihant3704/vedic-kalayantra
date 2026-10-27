import { GrahaPosition } from '../types/kalayantra';
import { GRAHAS, RASHIS } from './kosha';

export interface SadeSatiStatus {
  isActive: boolean;
  phase: 'Rising (12th House)' | 'Peak (Janma Rashi)' | 'Setting (2nd House)' | 'None';
  houseFromMoon: number;
  description: string;
  remedy: string;
}

export interface GocharaGraha {
  id: number;
  name: string;
  glyph: string;
  transitRashiIdx: number;
  transitRashiName: string;
  degreeFormatted: string;
  isRetrograde: boolean;
  houseFromMoon: number;
  houseFromLagna: number;
  isBeneficTransit: boolean;
  transitEffect: string;
}

export interface GocharaResult {
  natalMoonRashi: string;
  natalLagnaRashi: string;
  sadeSati: SadeSatiStatus;
  ashtamaShani: boolean;
  kantakaShani: boolean;
  guruBenefic: boolean;
  grahas: GocharaGraha[];
}

export function calculateGochara(
  natalMoonRashi: number,
  natalLagnaRashi: number,
  transitGrahas: GrahaPosition[]
): GocharaResult {
  // Find transit Saturn (id: 6)
  const saturn = transitGrahas.find(g => g.id === 6);
  const saturnRashi = saturn ? saturn.rashiIdx : 0;
  const saturnFromMoon = ((saturnRashi - natalMoonRashi + 12) % 12) + 1;

  let sadeSati: SadeSatiStatus = {
    isActive: false,
    phase: 'None',
    houseFromMoon: saturnFromMoon,
    description: 'You are currently not undergoing the 7.5-year Sade Sati cycle.',
    remedy: 'Maintain regular Hanuman Chalisa chanting and righteous conduct.',
  };

  if (saturnFromMoon === 12) {
    sadeSati = {
      isActive: true,
      phase: 'Rising (12th House)',
      houseFromMoon: 12,
      description: 'First Phase of Sade Sati (Rising / Aadhyantika). Saturn transits 12th from natal Moon, causing expenditures, domestic shifts, and psychological reorientation.',
      remedy: 'Recite Hanuman Chalisa, light mustard oil lamp on Saturdays, and practice patience with family finances.',
    };
  } else if (saturnFromMoon === 1) {
    sadeSati = {
      isActive: true,
      phase: 'Peak (Janma Rashi)',
      houseFromMoon: 1,
      description: 'Core Peak Phase of Sade Sati (Madhyama). Saturn transits directly over natal Moon, demanding emotional maturity, discipline, physical health care, and rigorous self-discipline.',
      remedy: 'Perform Rudrabhisheka, donate iron or black sesame on Saturday, practice mindfulness, avoid impulsive commitments.',
    };
  } else if (saturnFromMoon === 2) {
    sadeSati = {
      isActive: true,
      phase: 'Setting (2nd House)',
      houseFromMoon: 2,
      description: 'Third Phase of Sade Sati (Setting / Antya). Saturn transits 2nd from natal Moon, testing financial savings and speech; resolution and emergence into stability begins.',
      remedy: 'Mindful speech, respect elders, support the underprivileged, visit Shani Shingnapur or Navagraha temple.',
    };
  }

  const ashtamaShani = saturnFromMoon === 8;
  const kantakaShani = saturnFromMoon === 4 || saturnFromMoon === 10;

  // Transit benefic houses from Moon in Gochara Shastra:
  // Sun: 3, 6, 10, 11
  // Moon: 1, 3, 6, 7, 10, 11
  // Mars: 3, 6, 11
  // Mercury: 2, 4, 6, 8, 10, 11
  // Jupiter: 2, 5, 7, 9, 11
  // Venus: 1, 2, 3, 4, 5, 8, 9, 11, 12
  // Saturn: 3, 6, 11
  // Rahu/Ketu: 3, 6, 11
  const beneficHouses: Record<number, number[]> = {
    0: [3, 6, 10, 11],
    1: [1, 3, 6, 7, 10, 11],
    2: [3, 6, 11],
    3: [2, 4, 6, 8, 10, 11],
    4: [2, 5, 7, 9, 11],
    5: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    6: [3, 6, 11],
    7: [3, 6, 11],
    8: [3, 6, 11],
  };

  const guru = transitGrahas.find(g => g.id === 4);
  const guruFromMoon = guru ? ((guru.rashiIdx - natalMoonRashi + 12) % 12) + 1 : 1;
  const guruBenefic = [2, 5, 7, 9, 11].includes(guruFromMoon);

  const grahas: GocharaGraha[] = transitGrahas.map(g => {
    const hMoon = ((g.rashiIdx - natalMoonRashi + 12) % 12) + 1;
    const hLagna = ((g.rashiIdx - natalLagnaRashi + 12) % 12) + 1;
    const isBenefic = (beneficHouses[g.id] || []).includes(hMoon);

    let effect = '';
    if (g.id === 4 && isBenefic) effect = 'Favorable expansion, auspicious endeavors, and divine blessings.';
    else if (g.id === 6 && ashtamaShani) effect = 'Ashtama Shani — demanding period requiring caution in travels and health.';
    else if (g.id === 6 && isBenefic) effect = 'Strong Saturn transit bestowing stamina, endurance, and steady achievements.';
    else if (isBenefic) effect = `Auspicious transit in house ${hMoon} from Janma Rashi.`;
    else effect = `Transit in house ${hMoon} brings mixed results and requires measured effort.`;

    return {
      id: g.id,
      name: g.name,
      glyph: g.glyph,
      transitRashiIdx: g.rashiIdx,
      transitRashiName: RASHIS[g.rashiIdx].en,
      degreeFormatted: g.degreeFormatted,
      isRetrograde: g.isRetrograde,
      houseFromMoon: hMoon,
      houseFromLagna: hLagna,
      isBeneficTransit: isBenefic,
      transitEffect: effect,
    };
  });

  return {
    natalMoonRashi: RASHIS[natalMoonRashi].en,
    natalLagnaRashi: RASHIS[natalLagnaRashi].en,
    sadeSati,
    ashtamaShani,
    kantakaShani,
    guruBenefic,
    grahas,
  };
}
