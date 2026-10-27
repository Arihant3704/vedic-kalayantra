import { 
  ChoghadiyaSlot, 
  HoraSlot, 
  MuhurtaSlot, 
  SunMoonTiming 
} from '../types/kalayantra';
import { 
  CHOGHADIYAS, 
  CHOGHADIYA_DAY_START, 
  CHOGHADIYA_NIGHT_START, 
  GRAHAS, 
  HORA_ORDER, 
  VAARAS 
} from './kosha';

export function calculateHoras(
  currentTime: Date,
  timing: SunMoonTiming,
  vaaraIdx: number
): HoraSlot[] {
  const sunrise = timing.sunrise;
  const sunset = timing.sunset;
  const tomorrowSunrise = new Date(sunrise.getTime() + 86400000);

  const daySlotDuration = (sunset.getTime() - sunrise.getTime()) / 12;
  const nightSlotDuration = (tomorrowSunrise.getTime() - sunset.getTime()) / 12;

  // Weekday lord starts the first hora
  const firstLordId = VAARAS[vaaraIdx].lordIdx;
  const firstLordIdxInChaldean = HORA_ORDER.indexOf(firstLordId);

  const slots: HoraSlot[] = [];

  // 12 Day Horas
  for (let i = 0; i < 12; i++) {
    const slotStart = new Date(sunrise.getTime() + i * daySlotDuration);
    const slotEnd = new Date(sunrise.getTime() + (i + 1) * daySlotDuration);
    const lordId = HORA_ORDER[(firstLordIdxInChaldean + i) % 7];
    const lord = GRAHAS[lordId].en;
    const isCurrent = currentTime >= slotStart && currentTime < slotEnd;

    slots.push({
      idx: i,
      startTime: slotStart,
      endTime: slotEnd,
      lord,
      isDay: true,
      isCurrent,
    });
  }

  // 12 Night Horas
  for (let i = 0; i < 12; i++) {
    const slotStart = new Date(sunset.getTime() + i * nightSlotDuration);
    const slotEnd = new Date(sunset.getTime() + (i + 1) * nightSlotDuration);
    const lordId = HORA_ORDER[(firstLordIdxInChaldean + 12 + i) % 7];
    const lord = GRAHAS[lordId].en;
    const isCurrent = currentTime >= slotStart && currentTime < slotEnd;

    slots.push({
      idx: 12 + i,
      startTime: slotStart,
      endTime: slotEnd,
      lord,
      isDay: false,
      isCurrent,
    });
  }

  return slots;
}

export function calculateChoghadiyas(
  currentTime: Date,
  timing: SunMoonTiming,
  vaaraIdx: number
): { day: ChoghadiyaSlot[]; night: ChoghadiyaSlot[] } {
  const sunrise = timing.sunrise;
  const sunset = timing.sunset;
  const tomorrowSunrise = new Date(sunrise.getTime() + 86400000);

  const daySlotMs = (sunset.getTime() - sunrise.getTime()) / 8;
  const nightSlotMs = (tomorrowSunrise.getTime() - sunset.getTime()) / 8;

  const dayStartIdx = CHOGHADIYA_DAY_START[vaaraIdx] ?? 0;
  const nightStartIdx = CHOGHADIYA_NIGHT_START[vaaraIdx] ?? 0;

  const daySlots: ChoghadiyaSlot[] = [];
  for (let i = 0; i < 8; i++) {
    const slotStart = new Date(sunrise.getTime() + i * daySlotMs);
    const slotEnd = new Date(sunrise.getTime() + (i + 1) * daySlotMs);
    const chog = CHOGHADIYAS[(dayStartIdx + i) % 7];
    const isCurrent = currentTime >= slotStart && currentTime < slotEnd;

    daySlots.push({
      idx: i,
      name: chog.name,
      nature: chog.nature,
      isAuspicious: chog.isAuspicious,
      startTime: slotStart,
      endTime: slotEnd,
      isDay: true,
      isCurrent,
    });
  }

  const nightSlots: ChoghadiyaSlot[] = [];
  for (let i = 0; i < 8; i++) {
    const slotStart = new Date(sunset.getTime() + i * nightSlotMs);
    const slotEnd = new Date(sunset.getTime() + (i + 1) * nightSlotMs);
    const chog = CHOGHADIYAS[(nightStartIdx + i) % 7];
    const isCurrent = currentTime >= slotStart && currentTime < slotEnd;

    nightSlots.push({
      idx: i,
      name: chog.name,
      nature: chog.nature,
      isAuspicious: chog.isAuspicious,
      startTime: slotStart,
      endTime: slotEnd,
      isDay: false,
      isCurrent,
    });
  }

  return { day: daySlots, night: nightSlots };
}

export function calculateMuhurtas(
  currentTime: Date,
  timing: SunMoonTiming,
  vaaraIdx: number
): MuhurtaSlot[] {
  const sunrise = timing.sunrise;
  const sunset = timing.sunset;
  const dayMs = sunset.getTime() - sunrise.getTime();
  const octantMs = dayMs / 8;
  const muhurtaMs = dayMs / 15; // 1 muhurta = 1/15th of day

  // Rahu Kaal Octant by weekday (0=Sun..6=Sat)
  // Sun: 8th (idx 7), Mon: 2nd (idx 1), Tue: 7th (idx 6), Wed: 5th (idx 4), Thu: 6th (idx 5), Fri: 4th (idx 3), Sat: 3rd (idx 2)
  const rahuOctants: Record<number, number> = { 0: 7, 1: 1, 2: 6, 3: 4, 4: 5, 5: 3, 6: 2 };
  const rahuIdx = rahuOctants[vaaraIdx];
  const rahuStart = new Date(sunrise.getTime() + rahuIdx * octantMs);
  const rahuEnd = new Date(sunrise.getTime() + (rahuIdx + 1) * octantMs);

  // Yamaganda Octants
  // Sun: 5th (idx 4), Mon: 4th (idx 3), Tue: 3rd (idx 2), Wed: 2nd (idx 1), Thu: 1st (idx 0), Fri: 7th (idx 6), Sat: 6th (idx 5)
  const yamaOctants: Record<number, number> = { 0: 4, 1: 3, 2: 2, 3: 1, 4: 0, 5: 6, 6: 5 };
  const yamaIdx = yamaOctants[vaaraIdx];
  const yamaStart = new Date(sunrise.getTime() + yamaIdx * octantMs);
  const yamaEnd = new Date(sunrise.getTime() + (yamaIdx + 1) * octantMs);

  // Gulika Kaalam Octants
  // Sun: 7th (idx 6), Mon: 6th (idx 5), Tue: 5th (idx 4), Wed: 4th (idx 3), Thu: 3rd (idx 2), Fri: 2nd (idx 1), Sat: 1st (idx 0)
  const gulikaOctants: Record<number, number> = { 0: 6, 1: 5, 2: 4, 3: 3, 4: 2, 5: 1, 6: 0 };
  const gulikaIdx = gulikaOctants[vaaraIdx];
  const gulikaStart = new Date(sunrise.getTime() + gulikaIdx * octantMs);
  const gulikaEnd = new Date(sunrise.getTime() + (gulikaIdx + 1) * octantMs);

  // Abhijit Muhurta: 8th muhurta of the day (index 7, around solar noon)
  const abhijitStart = new Date(sunrise.getTime() + 7 * muhurtaMs);
  const abhijitEnd = new Date(sunrise.getTime() + 8 * muhurtaMs);

  // Vijaya Muhurta: 11th muhurta
  const vijayaStart = new Date(sunrise.getTime() + 10 * muhurtaMs);
  const vijayaEnd = new Date(sunrise.getTime() + 11 * muhurtaMs);

  // Godhuli Muhurta: 24 minutes around sunset (-12m to +12m)
  const godhuliStart = new Date(sunset.getTime() - 12 * 60000);
  const godhuliEnd = new Date(sunset.getTime() + 12 * 60000);

  // Nishita Kaal: 8th muhurta of night (around midnight)
  const tomorrowSunrise = new Date(sunrise.getTime() + 86400000);
  const nightMuhurtaMs = (tomorrowSunrise.getTime() - sunset.getTime()) / 15;
  const nishitaStart = new Date(sunset.getTime() + 7 * nightMuhurtaMs);
  const nishitaEnd = new Date(sunset.getTime() + 8 * nightMuhurtaMs);

  const slots: MuhurtaSlot[] = [
    {
      name: 'Brahma Muhurta',
      type: 'auspicious',
      startTime: timing.brahmaMuhurtaStart,
      endTime: timing.brahmaMuhurtaEnd,
      description: 'Supreme auspicious pre-dawn window for meditation, study, mantra japa, and spiritual awakening.',
      isCurrent: currentTime >= timing.brahmaMuhurtaStart && currentTime < timing.brahmaMuhurtaEnd,
    },
    {
      name: 'Abhijit Muhurta',
      type: vaaraIdx === 3 ? 'neutral' : 'auspicious', // Inauspicious on Wednesday
      startTime: abhijitStart,
      endTime: abhijitEnd,
      description: vaaraIdx === 3 
        ? 'Midday muhurta (Generally auspicious, but coincident with Rahu Kaal on Wednesday).' 
        : 'Most powerful auspicious muhurta capable of destroying countless doshas (Lord Vishnu’s blessing).',
      isCurrent: currentTime >= abhijitStart && currentTime < abhijitEnd,
    },
    {
      name: 'Vijaya Muhurta',
      type: 'auspicious',
      startTime: vijayaStart,
      endTime: vijayaEnd,
      description: 'Auspicious afternoon window best suited for undertaking victory in ventures, negotiations, and lawsuits.',
      isCurrent: currentTime >= vijayaStart && currentTime < vijayaEnd,
    },
    {
      name: 'Godhuli Muhurta',
      type: 'auspicious',
      startTime: godhuliStart,
      endTime: godhuliEnd,
      description: 'Peaceful twilight hour as cattle return home, sacred for evening prayers, Lakshmi invocation, and lighting lamps.',
      isCurrent: currentTime >= godhuliStart && currentTime < godhuliEnd,
    },
    {
      name: 'Nishita Kaal',
      type: 'auspicious',
      startTime: nishitaStart,
      endTime: nishitaEnd,
      description: 'Sacred midnight window dedicated to Lord Shiva, Goddess Kali, and divine nocturnal Tantric & Vaidik rituals.',
      isCurrent: currentTime >= nishitaStart && currentTime < nishitaEnd,
    },
    {
      name: 'Rāhu Kāla',
      type: 'inauspicious',
      startTime: rahuStart,
      endTime: rahuEnd,
      description: 'Inauspicious period ruled by Rahu. Inauspicious for initiating new travels, deals, or sacred rites.',
      isCurrent: currentTime >= rahuStart && currentTime < rahuEnd,
    },
    {
      name: 'Yamagaṇḍa',
      type: 'inauspicious',
      startTime: yamaStart,
      endTime: yamaEnd,
      description: 'Inauspicious period ruled by Yama. Activities started here encounter obstruction or losses.',
      isCurrent: currentTime >= yamaStart && currentTime < yamaEnd,
    },
    {
      name: 'Gulika Kāla',
      type: 'neutral',
      startTime: gulikaStart,
      endTime: gulikaEnd,
      description: 'Ruled by Saturn’s son Gulika. Any action done here tends to recur repeatedly.',
      isCurrent: currentTime >= gulikaStart && currentTime < gulikaEnd,
    },
  ];

  return slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}
