import { 
  CityInfo, 
  FestivalItem, 
  SunMoonTiming, 
  AyanamshaMode 
} from '../types/kalayantra';
import { FESTIVAL_METADATA, MASAS, RASHIS } from './kosha';
import { calculateGrahaSiderealPositions, normalize360 } from './astronomy';

export interface FestivalContext {
  date: Date;
  dateStr: string;
  tithiIdx: number;
  isKrishna: boolean;
  sauraMasaIdx: number;
  lunarMonthIdx: number;
  vaaraIdx: number;
  timing: SunMoonTiming;
  city: CityInfo;
  ayanamshaMode: AyanamshaMode;
  festivalRule?: 'vaishnava' | 'smarta';
}

function resolveMeta(key: string, defaultName: string): FestivalItem {
  const meta = FESTIVAL_METADATA[key] || {};
  return {
    id: key,
    name: meta.en || defaultName,
    type: meta.type || 'Festival',
    color: meta.color || '#10b981',
    priority: meta.priority || 5,
    description: meta.description || '',
    rule: meta.rule || 'Tithi prevailing at Sunrise (Udaya-vyāpinī)',
  };
}

/**
 * Dharmaśāstra Festival & Vrata Engine (KalaUtsavachakra)
 */
export function calculateFestivalsForDay(ctx: FestivalContext): FestivalItem[] {
  const festivals: FestivalItem[] = [];
  const { 
    tithiIdx, 
    isKrishna, 
    lunarMonthIdx, 
    vaaraIdx, 
    timing, 
    city, 
    ayanamshaMode,
    festivalRule = 'vaishnava'
  } = ctx;

  const sunrise = timing.sunrise;
  const sunset = timing.sunset;
  const noon = timing.noon;
  const midnight = timing.midnight;
  const arunodaya = timing.dawn;
  const pradosha = new Date(sunset.getTime() + 36 * 60000);
  const moonrise = timing.moonrise || sunset;

  const getTithiAtTime = (t: Date): number => {
    const p = calculateGrahaSiderealPositions(t, city, ayanamshaMode);
    const diff = normalize360(p.grahas[1].lon - p.grahas[0].lon);
    return Math.floor(diff / 12.0);
  };

  const tSunrise = tithiIdx;
  const tNoon = getTithiAtTime(noon);
  const tNishitha = getTithiAtTime(midnight);
  const tPradosha = getTithiAtTime(pradosha);
  const tArunodaya = getTithiAtTime(arunodaya);
  const tMoonrise = getTithiAtTime(moonrise);

  // --- Annual Classical Festivals ---

  // Chaitra (Month 0)
  if (lunarMonthIdx === 0 && !isKrishna && tSunrise === 0) {
    festivals.push(resolveMeta('gudi_padwa', 'Ugadi / Gudi Padwa'));
  }
  if (lunarMonthIdx === 0 && tNoon === 8) {
    festivals.push(resolveMeta('rama_navami', 'Sri Rama Navami'));
  }
  if (lunarMonthIdx === 0 && !isKrishna && tSunrise === 14) {
    festivals.push(resolveMeta('hanuman_janmotsav', 'Hanuman Jayanti'));
  }

  // Vaishakha (Month 1)
  if (lunarMonthIdx === 1 && !isKrishna && tSunrise === 2) {
    festivals.push(resolveMeta('akshaya_tritiya', 'Akshaya Tritiya'));
  }
  if (lunarMonthIdx === 1 && tPradosha === 2) {
    festivals.push(resolveMeta('parashurama_jayanti', 'Parashurama Jayanti'));
  }
  if (lunarMonthIdx === 1 && tPradosha === 13) {
    festivals.push(resolveMeta('narasimha_jayanti', 'Narasimha Jayanti'));
  }

  // Jyeshtha (Month 2)
  if (lunarMonthIdx === 2 && isKrishna && tSunrise === 29) {
    festivals.push(resolveMeta('vat_savitri_amavasya', 'Vat Savitri Vrata (Amavasya)'));
  }
  if (lunarMonthIdx === 2 && !isKrishna && tSunrise === 14) {
    festivals.push(resolveMeta('vat_savitri_purnima', 'Vat Savitri Vrata (Purnima)'));
  }

  // Ashadha (Month 3)
  if (lunarMonthIdx === 3 && !isKrishna && tSunrise === 14) {
    festivals.push(resolveMeta('guru_purnima', 'Guru Purnima / Vyasa Puja'));
  }

  // Shravana (Month 4)
  if (lunarMonthIdx === 4 && !isKrishna && tSunrise === 4) {
    festivals.push(resolveMeta('nag_panchami', 'Nag Panchami'));
  }
  if (lunarMonthIdx === 4 && tNoon === 14) {
    festivals.push(resolveMeta('raksha_bandhan', 'Raksha Bandhan / Upakarma'));
  }
  if (lunarMonthIdx === 4 && vaaraIdx === 5 && !isKrishna) {
    const daysToPurnima = 14 - tSunrise;
    if (daysToPurnima >= 0 && daysToPurnima <= 7) {
      festivals.push(resolveMeta('varamahalakshmi_vrata', 'Varamahalakshmi Vrata'));
    }
  }
  if (lunarMonthIdx === 4 && tNishitha === 22) {
    festivals.push(resolveMeta('krishna_janmashtami', 'Sri Krishna Janmashtami'));
  }

  // Bhadrapada (Month 5)
  if (lunarMonthIdx === 5 && !isKrishna && tSunrise === 2) {
    festivals.push(resolveMeta('swarna_gauri', 'Swarna Gauri Vrata'));
  }
  if (lunarMonthIdx === 5 && tNoon === 3) {
    festivals.push(resolveMeta('ganesh_chaturthi', 'Ganesh Chaturthi / Vinayaka Chavithi'));
  }
  if (lunarMonthIdx === 5 && tNoon === 4) {
    festivals.push(resolveMeta('rishi_panchami', 'Rishi Panchami'));
  }
  if (lunarMonthIdx === 5 && !isKrishna && tSunrise === 13) {
    festivals.push(resolveMeta('ananta_chaturdashi', 'Ananta Chaturdashi'));
  }
  if (lunarMonthIdx === 5 && tPradosha === 29) {
    festivals.push(resolveMeta('mahalaya_amavasya', 'Mahalaya Amavasya (Sarva Pitru)'));
  }

  // Ashvina (Month 6)
  if (lunarMonthIdx === 6 && !isKrishna && tSunrise === 0) {
    festivals.push({
      id: 'navaratri_start',
      name: 'Sharad Navaratri (Ghatasthapana)',
      type: 'Festival',
      color: '#e11d48',
      priority: 9,
      description: 'Beginning of the 9 sacred nights of Goddess Durga.',
      rule: 'Ashvina Shukla Pratipada prevailing at Sunrise',
    });
  }
  if (lunarMonthIdx === 6 && tNoon === 8) {
    festivals.push(resolveMeta('mahanavami', 'Maha Navami / Ayudha Puja'));
  }
  if (lunarMonthIdx === 6 && tNoon === 9) {
    festivals.push(resolveMeta('vijayadashami', 'Vijayadashami / Dussehra'));
  }
  if (lunarMonthIdx === 6 && tNishitha === 14) {
    festivals.push(resolveMeta('kojagari_purnima', 'Kojagari Purnima / Sharad Purnima'));
  }
  if (lunarMonthIdx === 6 && tMoonrise === 18) {
    festivals.push({
      id: 'karwa_chauth',
      name: 'Karwa Chauth',
      type: 'Vrata',
      color: '#ec4899',
      priority: 8,
      description: 'Traditional fast observed by married women for the longevity of their spouses, broken upon moonrise.',
      rule: 'Kartika/Ashvina Krishna Chaturthi prevailing at Moonrise',
    });
  }
  if (lunarMonthIdx === 6 && tPradosha === 27) {
    festivals.push({
      id: 'dhanteras',
      name: 'Dhanteras / Dhanvantari Jayanti',
      type: 'Festival',
      color: '#f59e0b',
      priority: 8,
      description: 'Auspicious day for worshipping Lord Dhanvantari, Kubera, and buying gold or utensils.',
      rule: 'Krishna Trayodashi prevailing at Pradosha',
    });
  }
  if (lunarMonthIdx === 6 && isKrishna && tArunodaya === 28) {
    festivals.push(resolveMeta('naraka_chaturdashi', 'Naraka Chaturdashi (Choti Diwali)'));
  }
  if (lunarMonthIdx === 6 && tPradosha === 29) {
    festivals.push(resolveMeta('deepavali', 'Diwali / Maha Lakshmi Puja'));
  }

  // Kartika (Month 7)
  if (lunarMonthIdx === 7 && !isKrishna && tSunrise === 0) {
    festivals.push(resolveMeta('bali_pratipada', 'Govardhan Puja / Bali Pratipada'));
  }
  if (lunarMonthIdx === 7 && !isKrishna && tSunrise === 1) {
    festivals.push({
      id: 'bhai_dooj',
      name: 'Bhai Dooj / Yama Dwitiya',
      type: 'Festival',
      color: '#8b5cf6',
      priority: 7,
      description: 'Celebration of the sacred bond between brothers and sisters.',
      rule: 'Kartika Shukla Dwitiya prevailing at Sunrise',
    });
  }
  if (lunarMonthIdx === 7 && !isKrishna && tPradosha === 5) {
    festivals.push({
      id: 'chhath_puja',
      name: 'Chhath Puja (Surya Shashthi)',
      type: 'Vrata',
      color: '#ea580c',
      priority: 9,
      description: 'Ancient Vedic festival dedicated to Lord Surya and Chhathi Maiya.',
      rule: 'Kartika Shukla Shashthi with evening Arghya',
    });
  }
  if (lunarMonthIdx === 7 && tPradosha === 11) {
    festivals.push(resolveMeta('tulsi_vivah', 'Tulsi Vivah'));
  }
  if (lunarMonthIdx === 7 && !isKrishna && tSunrise === 14) {
    festivals.push({
      id: 'kartika_purnima',
      name: 'Kartika Purnima / Dev Diwali',
      type: 'Festival',
      color: '#3b82f6',
      priority: 8,
      description: 'Festival of lights of the Gods celebrated in Varanasi, commemorating Lord Shiva defeating Tripurasura.',
      rule: 'Kartika Purnima prevailing at Pradosha',
    });
  }

  // Margashirsha (Month 8)
  if (lunarMonthIdx === 8 && !isKrishna && tSunrise === 5) {
    festivals.push(resolveMeta('champa_shashthi', 'Champa Shashthi'));
  }
  if (lunarMonthIdx === 8 && tPradosha === 14) {
    festivals.push(resolveMeta('datta_jayanti', 'Datta Jayanti'));
  }
  if (lunarMonthIdx === 8 && !isKrishna && tSunrise === 10) {
    festivals.push({
      id: 'gita_jayanti',
      name: 'Gita Jayanti / Mokshada Ekadashi',
      type: 'Ekadashi',
      color: '#3b82f6',
      priority: 9,
      description: 'Day Bhagavan Sri Krishna delivered the Bhagavad Gita to Arjuna on the battlefield of Kurukshetra.',
      rule: 'Margashirsha Shukla Ekadashi at Sunrise',
    });
  }

  // Magha (Month 10)
  if (lunarMonthIdx === 10 && !isKrishna && tSunrise === 4) {
    festivals.push({
      id: 'vasant_panchami',
      name: 'Vasant Panchami / Saraswati Puja',
      type: 'Festival',
      color: '#eab308',
      priority: 8,
      description: 'Welcoming of Spring season and invocation of Goddess Saraswati, the deity of wisdom and arts.',
      rule: 'Magha Shukla Panchami prevailing at Purvahna',
    });
  }
  if (lunarMonthIdx === 10 && !isKrishna && tArunodaya === 6) {
    festivals.push(resolveMeta('ratha_saptami', 'Ratha Saptami / Surya Jayanti'));
  }
  if (lunarMonthIdx === 10 && tNoon === 7) {
    festivals.push(resolveMeta('bhishma_ashtami', 'Bhishma Ashtami'));
  }
  if (lunarMonthIdx === 10 && !isKrishna && tSunrise === 8) {
    festivals.push(resolveMeta('madhwa_navami', 'Madhwa Navami'));
  }
  if (lunarMonthIdx === 10 && tNishitha === 28) {
    festivals.push(resolveMeta('mahashivaratri', 'Maha Shivaratri'));
  }

  // Phalguna (Month 11)
  if (lunarMonthIdx === 11 && tPradosha === 14) {
    festivals.push(resolveMeta('holi', 'Holi / Holika Dahan'));
  }

  // --- Monthly Observance Solvers ---

  // Sankashti Chaturthi
  if (isKrishna && tMoonrise === 18) {
    festivals.push({
      id: 'sankashti_chaturthi',
      name: 'Sankashti Chaturthi',
      type: 'Vrata',
      color: '#9333ea',
      priority: 7,
      description: 'Monthly sacred fast dedicated to Lord Ganesha, broken after sighting and offering Arghya to the Moon.',
      rule: 'Krishna Chaturthi prevailing at Moonrise',
    });
  }

  // Pradosha Vrata
  if (tPradosha === 12 || tPradosha === 27) {
    const isShukla = tPradosha === 12;
    const dayNames = ['Ravi', 'Soma', 'Bhauma', 'Budha', 'Guru', 'Shukra', 'Shani'];
    const pPrefix = dayNames[vaaraIdx];
    festivals.push({
      id: `pradosha_${isShukla ? 'shukla' : 'krishna'}`,
      name: `${pPrefix} Pradosha Vrata`,
      type: 'Vrata',
      color: '#06b6d4',
      priority: 7,
      description: `Bimonthly twilight fast dedicated to Lord Shiva and Goddess Parvati during Pradosha Kaal.`,
      rule: 'Trayodashi prevailing during Pradosha Kaal (after sunset)',
    });
  }

  // Ekadashi Solver
  const isShuklaEkadashi = (tSunrise === 10);
  const isKrishnaEkadashi = (tSunrise === 25);

  if (isShuklaEkadashi || isKrishnaEkadashi) {
    const ekadashiType = isShuklaEkadashi ? 'Shukla' : 'Krishna';
    const monthName = MASAS[lunarMonthIdx].en;
    const baseName = `${monthName} ${ekadashiType} Ekadashi`;

    if (festivalRule === 'smarta') {
      festivals.push({
        id: `ekadashi_${lunarMonthIdx}_${isShuklaEkadashi ? 's' : 'k'}`,
        name: baseName,
        type: 'Ekadashi',
        color: '#2563eb',
        priority: 9,
        description: `Sacred Ekadashi fast observed by Smartas per Sunrise Udaya-vyāpinī rule.`,
        rule: 'Tithi prevailing at Sunrise (Udaya-vyāpinī)',
      });
    } else {
      const isViddha = (tArunodaya === 9 || tArunodaya === 24);
      if (!isViddha) {
        festivals.push({
          id: `ekadashi_vaishnava_${lunarMonthIdx}_${isShuklaEkadashi ? 's' : 'k'}`,
          name: `${baseName} (Vaishnava)`,
          type: 'Ekadashi',
          color: '#2563eb',
          priority: 9,
          description: `Sacred Ekadashi fast observed by Vaishnavas (Pure / Shuddha, unmixed with Dashami at Arunodaya).`,
          rule: 'Vaishnava Arunodaya Vyapini (Unmixed with Dashami)',
          paranaTime: `Next day after Sunrise between 06:15 AM - 09:30 AM`,
        });
      }
    }
  }

  // Purnima (Full Moon)
  if (tSunrise === 14) {
    festivals.push({
      id: 'purnima_day',
      name: `${MASAS[lunarMonthIdx].en} Purnima / Satyanarayan Vrata`,
      type: 'Purnima',
      color: '#38bdf8',
      priority: 6,
      description: 'Auspicious full moon day ideal for Sri Satyanarayana Swami Puja and charity.',
      rule: 'Purnima prevailing at Sunrise / Pradosha',
    });
  }

  // Amavasya (New Moon)
  if (tSunrise === 29) {
    festivals.push({
      id: 'amavasya_day',
      name: `${MASAS[lunarMonthIdx].en} Amavasya / Pitru Tarpan`,
      type: 'Amavasya',
      color: '#64748b',
      priority: 6,
      description: 'Sacred new moon day dedicated to honoring ancestors and performing Pitru Tarpan.',
      rule: 'Amavasya prevailing at Sunrise',
    });
  }

  // Sankranti (Solar transit)
  const tomorrowSunrise = new Date(sunrise.getTime() + 86400000);
  const posToday = calculateGrahaSiderealPositions(sunrise, city, ayanamshaMode);
  const posTmrw = calculateGrahaSiderealPositions(tomorrowSunrise, city, ayanamshaMode);
  const rashiToday = Math.floor(posToday.grahas[0].lon / 30.0);
  const rashiTmrw = Math.floor(posTmrw.grahas[0].lon / 30.0);

  if (rashiToday !== rashiTmrw) {
    const nextRashi = RASHIS[rashiTmrw];
    const isMakar = rashiTmrw === 9;
    festivals.push({
      id: `sankranti_${rashiTmrw}`,
      name: isMakar ? 'Makar Sankranti / Pongal / Uttarayana' : `${nextRashi.iast} Sankranti`,
      type: 'Sankranti',
      color: '#f97316',
      priority: isMakar ? 10 : 8,
      description: `Sun transitions into the sidereal zodiac sign of ${nextRashi.en} (${nextRashi.iast}).`,
      rule: 'Solar Rashi Ingress (Sankranti Punyakala)',
    });
  }

  return festivals.sort((a, b) => b.priority - a.priority);
}
