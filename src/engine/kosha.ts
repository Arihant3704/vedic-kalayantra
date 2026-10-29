import citiesData from './cities_data.json';
import festivalsData from './festivals_data.json';
import { CityInfo, Language, TrilingualName } from '../types/kalayantra';

export const BUILTIN_CITIES: CityInfo[] = (citiesData as any[]).map(c => ({
  name: c.name,
  stateCountry: c.stateCountry || c.country || (c.tz === 5.5 ? 'India' : 'International'),
  lat: c.lat,
  lon: c.lon,
  tz: c.tz,
  alt: c.alt || 0,
}));

export const DEFAULT_CITY: CityInfo = BUILTIN_CITIES.find(c => c.name === 'Ujjain') || {
  name: 'Ujjain',
  stateCountry: 'Madhya Pradesh, India',
  lat: 23.1765,
  lon: 75.7885,
  tz: 5.5,
  alt: 491,
};

export const FESTIVAL_METADATA: Record<string, any> = festivalsData;

// 27 Nakshatras
export const NAKSHATRAS: {
  idx: number;
  en: string;
  iast: string;
  devanagari: string;
  lord: string;
  lordIdx: number;
  deity: string;
  symbol: string;
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  nadi: 'Adi' | 'Madhya' | 'Antya';
  yoni: string;
}[] = [
  { idx: 0, en: 'Ashwini', iast: 'Aśvinī', devanagari: 'अश्विनी', lord: 'Ketu', lordIdx: 8, deity: 'Ashvins', symbol: 'Horse Head', gana: 'Deva', nadi: 'Adi', yoni: 'Horse' },
  { idx: 1, en: 'Bharani', iast: 'Bharaṇī', devanagari: 'भरणी', lord: 'Shukra', lordIdx: 5, deity: 'Yama', symbol: 'Yoni', gana: 'Manushya', nadi: 'Madhya', yoni: 'Elephant' },
  { idx: 2, en: 'Krittika', iast: 'Kṛttikā', devanagari: 'कृत्तिका', lord: 'Surya', lordIdx: 0, deity: 'Agni', symbol: 'Razor/Flame', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Sheep' },
  { idx: 3, en: 'Rohini', iast: 'Rohiṇī', devanagari: 'रोहिणी', lord: 'Chandra', lordIdx: 1, deity: 'Brahma', symbol: 'Cart/Chariot', gana: 'Manushya', nadi: 'Antya', yoni: 'Serpent' },
  { idx: 4, en: 'Mrigashirsha', iast: 'Mṛgaśīrṣā', devanagari: 'मृगशीर्षा', lord: 'Mangala', lordIdx: 2, deity: 'Soma', symbol: 'Deer Head', gana: 'Deva', nadi: 'Madhya', yoni: 'Serpent' },
  { idx: 5, en: 'Ardra', iast: 'Ārdrā', devanagari: 'आर्द्रा', lord: 'Rahu', lordIdx: 7, deity: 'Rudra', symbol: 'Teardrop/Diamond', gana: 'Manushya', nadi: 'Adi', yoni: 'Dog' },
  { idx: 6, en: 'Punarvasu', iast: 'Punarvasu', devanagari: 'पुनर्वसु', lord: 'Guru', lordIdx: 4, deity: 'Aditi', symbol: 'Bow and Quiver', gana: 'Deva', nadi: 'Adi', yoni: 'Cat' },
  { idx: 7, en: 'Pushya', iast: 'Puṣya', devanagari: 'पुष्य', lord: 'Shani', lordIdx: 6, deity: 'Brihaspati', symbol: 'Flower/Circle', gana: 'Deva', nadi: 'Madhya', yoni: 'Sheep' },
  { idx: 8, en: 'Ashlesha', iast: 'Āśleṣā', devanagari: 'आश्लेषा', lord: 'Budha', lordIdx: 3, deity: 'Nagas', symbol: 'Coiled Serpent', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Cat' },
  { idx: 9, en: 'Magha', iast: 'Maghā', devanagari: 'मघा', lord: 'Ketu', lordIdx: 8, deity: 'Pitris', symbol: 'Royal Throne', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Rat' },
  { idx: 10, en: 'Purva Phalguni', iast: 'Pūrva Phālgunī', devanagari: 'पूर्व फाल्गुनी', lord: 'Shukra', lordIdx: 5, deity: 'Bhaga', symbol: 'Hammock/Couch', gana: 'Manushya', nadi: 'Madhya', yoni: 'Rat' },
  { idx: 11, en: 'Uttara Phalguni', iast: 'Uttara Phālgunī', devanagari: 'उत्तर फाल्गुनी', lord: 'Surya', lordIdx: 0, deity: 'Aryaman', symbol: 'Bed Legs', gana: 'Manushya', nadi: 'Adi', yoni: 'Cow' },
  { idx: 12, en: 'Hasta', iast: 'Hasta', devanagari: 'हस्त', lord: 'Chandra', lordIdx: 1, deity: 'Savitr', symbol: 'Open Hand', gana: 'Deva', nadi: 'Adi', yoni: 'Buffalo' },
  { idx: 13, en: 'Chitra', iast: 'Citrā', devanagari: 'चित्रा', lord: 'Mangala', lordIdx: 2, deity: 'Vishvakarma', symbol: 'Bright Jewel', gana: 'Rakshasa', nadi: 'Madhya', yoni: 'Tiger' },
  { idx: 14, en: 'Swati', iast: 'Svātī', devanagari: 'स्वाती', lord: 'Rahu', lordIdx: 7, deity: 'Vayu', symbol: 'Young Shoot/Coral', gana: 'Deva', nadi: 'Antya', yoni: 'Buffalo' },
  { idx: 15, en: 'Vishakha', iast: 'Viśākhā', devanagari: 'विशाखा', lord: 'Guru', lordIdx: 4, deity: 'Indragni', symbol: 'Triumphal Arch', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Tiger' },
  { idx: 16, en: 'Anuradha', iast: 'Anurādhā', devanagari: 'अनुराधा', lord: 'Shani', lordIdx: 6, deity: 'Mitra', symbol: 'Lotus', gana: 'Deva', nadi: 'Madhya', yoni: 'Deer' },
  { idx: 17, en: 'Jyeshtha', iast: 'Jyeṣṭhā', devanagari: 'ज्येष्ठा', lord: 'Budha', lordIdx: 3, deity: 'Indra', symbol: 'Circular Amulet', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Deer' },
  { idx: 18, en: 'Mula', iast: 'Mūla', devanagari: 'मूल', lord: 'Ketu', lordIdx: 8, deity: 'Nirriti', symbol: 'Tied Bunch of Roots', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Dog' },
  { idx: 19, en: 'Purva Ashadha', iast: 'Pūrvāṣāḍhā', devanagari: 'पूर्वाषाढा', lord: 'Shukra', lordIdx: 5, deity: 'Apas', symbol: 'Elephant Tusk/Fan', gana: 'Manushya', nadi: 'Madhya', yoni: 'Monkey' },
  { idx: 20, en: 'Uttara Ashadha', iast: 'Uttarāṣāḍhā', devanagari: 'उत्तराषाढा', lord: 'Surya', lordIdx: 0, deity: 'Vishvedevas', symbol: 'Elephant Tusk/Bed', gana: 'Manushya', nadi: 'Antya', yoni: 'Mongoose' },
  { idx: 21, en: 'Shravana', iast: 'Śravaṇa', devanagari: 'श्रवण', lord: 'Chandra', lordIdx: 1, deity: 'Vishnu', symbol: 'Three Footprints/Ear', gana: 'Deva', nadi: 'Antya', yoni: 'Monkey' },
  { idx: 22, en: 'Dhanishta', iast: 'Dhaniṣṭhā', devanagari: 'धनिष्ठा', lord: 'Mangala', lordIdx: 2, deity: 'Ashta Vasus', symbol: 'Drum (Mridanga)', gana: 'Rakshasa', nadi: 'Madhya', yoni: 'Lion' },
  { idx: 23, en: 'Shatabhisha', iast: 'Śatabhiṣaj', devanagari: 'शतभिषज्', lord: 'Rahu', lordIdx: 7, deity: 'Varuna', symbol: 'Empty Circle/100 Flowers', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Horse' },
  { idx: 24, en: 'Purva Bhadrapada', iast: 'Pūrva Bhādrapadā', devanagari: 'पूर्व भाद्रपदा', lord: 'Guru', lordIdx: 4, deity: 'Aja Ekapada', symbol: 'Front of Funeral Bed', gana: 'Manushya', nadi: 'Adi', yoni: 'Lion' },
  { idx: 25, en: 'Uttara Bhadrapada', iast: 'Uttara Bhādrapadā', devanagari: 'उत्तर भाद्रपदा', lord: 'Shani', lordIdx: 6, deity: 'Ahirbudhnya', symbol: 'Back of Funeral Bed/Twin', gana: 'Manushya', nadi: 'Madhya', yoni: 'Cow' },
  { idx: 26, en: 'Revati', iast: 'Revatī', devanagari: 'रेवती', lord: 'Budha', lordIdx: 3, deity: 'Pushan', symbol: 'Fish Pair', gana: 'Deva', nadi: 'Antya', yoni: 'Elephant' },
];

// 12 Rashis (Indian Names primary)
export const RASHIS: {
  idx: number;
  en: string;
  western: string;
  iast: string;
  devanagari: string;
  lord: string;
  lordIdx: number;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  varna: 'Kshatriya' | 'Vaishya' | 'Shudra' | 'Brahmin';
  vashya: 'Chatushpada' | 'Manava' | 'Jalachara' | 'Vanchara' | 'Keeta';
  glyph: string;
}[] = [
  { idx: 0, en: 'Mesha', western: 'Aries', iast: 'Meṣa', devanagari: 'मेष', lord: 'Mangala', lordIdx: 2, element: 'Fire', varna: 'Kshatriya', vashya: 'Chatushpada', glyph: '♈' },
  { idx: 1, en: 'Vrishabha', western: 'Taurus', iast: 'Vṛṣabha', devanagari: 'वृषभ', lord: 'Shukra', lordIdx: 5, element: 'Earth', varna: 'Vaishya', vashya: 'Chatushpada', glyph: '♉' },
  { idx: 2, en: 'Mithuna', western: 'Gemini', iast: 'Mithuna', devanagari: 'मिथुन', lord: 'Budha', lordIdx: 3, element: 'Air', varna: 'Shudra', vashya: 'Manava', glyph: '♊' },
  { idx: 3, en: 'Karka', western: 'Cancer', iast: 'Karka', devanagari: 'कर्क', lord: 'Chandra', lordIdx: 1, element: 'Water', varna: 'Brahmin', vashya: 'Jalachara', glyph: '♋' },
  { idx: 4, en: 'Simha', western: 'Leo', iast: 'Siṃha', devanagari: 'सिंह', lord: 'Surya', lordIdx: 0, element: 'Fire', varna: 'Kshatriya', vashya: 'Vanchara', glyph: '♌' },
  { idx: 5, en: 'Kanya', western: 'Virgo', iast: 'Kanyā', devanagari: 'कन्या', lord: 'Budha', lordIdx: 3, element: 'Earth', varna: 'Vaishya', vashya: 'Manava', glyph: '♍' },
  { idx: 6, en: 'Tula', western: 'Libra', iast: 'Tulā', devanagari: 'तुला', lord: 'Shukra', lordIdx: 5, element: 'Air', varna: 'Shudra', vashya: 'Manava', glyph: '♎' },
  { idx: 7, en: 'Vrischika', western: 'Scorpio', iast: 'Vṛścika', devanagari: 'वृश्चिक', lord: 'Mangala', lordIdx: 2, element: 'Water', varna: 'Brahmin', vashya: 'Keeta', glyph: '♏' },
  { idx: 8, en: 'Dhanu', western: 'Sagittarius', iast: 'Dhanu', devanagari: 'धनु', lord: 'Guru', lordIdx: 4, element: 'Fire', varna: 'Kshatriya', vashya: 'Manava', glyph: '♐' },
  { idx: 9, en: 'Makara', western: 'Capricorn', iast: 'Makara', devanagari: 'मकर', lord: 'Shani', lordIdx: 6, element: 'Earth', varna: 'Vaishya', vashya: 'Jalachara', glyph: '♑' },
  { idx: 10, en: 'Kumbha', western: 'Aquarius', iast: 'Kumbha', devanagari: 'कुम्भ', lord: 'Shani', lordIdx: 6, element: 'Air', varna: 'Shudra', vashya: 'Manava', glyph: '♒' },
  { idx: 11, en: 'Meena', western: 'Pisces', iast: 'Mīna', devanagari: 'मीन', lord: 'Guru', lordIdx: 4, element: 'Water', varna: 'Brahmin', vashya: 'Jalachara', glyph: '♓' },
];

// 30 Tithis
export const TITHI_NAMES: {
  idx: number;
  paksha: 'Shukla' | 'Krishna';
  tithiNum: number;
  en: string;
  iast: string;
  devanagari: string;
  nature: 'Nanda' | 'Bhadra' | 'Jaya' | 'Rikta' | 'Poorna';
  deity: string;
}[] = [
  // Shukla Paksha (0..14)
  { idx: 0, paksha: 'Shukla', tithiNum: 1, en: 'Pratipada', iast: 'Pratipadā', devanagari: 'प्रतिपदा', nature: 'Nanda', deity: 'Agni' },
  { idx: 1, paksha: 'Shukla', tithiNum: 2, en: 'Dwitiya', iast: 'Dvitīyā', devanagari: 'द्वितीया', nature: 'Bhadra', deity: 'Brahma' },
  { idx: 2, paksha: 'Shukla', tithiNum: 3, en: 'Tritiya', iast: 'Tṛtīyā', devanagari: 'तृतीया', nature: 'Jaya', deity: 'Gauri' },
  { idx: 3, paksha: 'Shukla', tithiNum: 4, en: 'Chaturthi', iast: 'Caturthī', devanagari: 'चतुर्थी', nature: 'Rikta', deity: 'Ganesha' },
  { idx: 4, paksha: 'Shukla', tithiNum: 5, en: 'Panchami', iast: 'Pañcamī', devanagari: 'पञ्चमी', nature: 'Poorna', deity: 'Nagas' },
  { idx: 5, paksha: 'Shukla', tithiNum: 6, en: 'Shashthi', iast: 'Ṣaṣṭhī', devanagari: 'षष्ठी', nature: 'Nanda', deity: 'Kartikeya' },
  { idx: 6, paksha: 'Shukla', tithiNum: 7, en: 'Saptami', iast: 'Saptamī', devanagari: 'सप्तमी', nature: 'Bhadra', deity: 'Surya' },
  { idx: 7, paksha: 'Shukla', tithiNum: 8, en: 'Ashtami', iast: 'Aṣṭamī', devanagari: 'अष्टमी', nature: 'Jaya', deity: 'Shiva' },
  { idx: 8, paksha: 'Shukla', tithiNum: 9, en: 'Navami', iast: 'Navamī', devanagari: 'नवमी', nature: 'Rikta', deity: 'Durga' },
  { idx: 9, paksha: 'Shukla', tithiNum: 10, en: 'Dashami', iast: 'Daśamī', devanagari: 'दशमी', nature: 'Poorna', deity: 'Yama' },
  { idx: 10, paksha: 'Shukla', tithiNum: 11, en: 'Ekadashi', iast: 'Ekādaśī', devanagari: 'एकादशी', nature: 'Nanda', deity: 'Vishvedevas' },
  { idx: 11, paksha: 'Shukla', tithiNum: 12, en: 'Dwadashi', iast: 'Dvādaśī', devanagari: 'द्वादशी', nature: 'Bhadra', deity: 'Vishnu' },
  { idx: 12, paksha: 'Shukla', tithiNum: 13, en: 'Trayodashi', iast: 'Trayodaśī', devanagari: 'त्रयोदशी', nature: 'Jaya', deity: 'Kamadeva' },
  { idx: 13, paksha: 'Shukla', tithiNum: 14, en: 'Chaturdashi', iast: 'Caturdaśī', devanagari: 'चतुर्दशी', nature: 'Rikta', deity: 'Shiva' },
  { idx: 14, paksha: 'Shukla', tithiNum: 15, en: 'Purnima', iast: 'Pūrṇimā', devanagari: 'पूर्णिमा', nature: 'Poorna', deity: 'Chandra' },

  // Krishna Paksha (15..29)
  { idx: 15, paksha: 'Krishna', tithiNum: 1, en: 'Pratipada', iast: 'Pratipadā', devanagari: 'प्रतिपदा', nature: 'Nanda', deity: 'Agni' },
  { idx: 16, paksha: 'Krishna', tithiNum: 2, en: 'Dwitiya', iast: 'Dvitīyā', devanagari: 'द्वितीया', nature: 'Bhadra', deity: 'Brahma' },
  { idx: 17, paksha: 'Krishna', tithiNum: 3, en: 'Tritiya', iast: 'Tṛtīyā', devanagari: 'तृतीया', nature: 'Jaya', deity: 'Gauri' },
  { idx: 18, paksha: 'Krishna', tithiNum: 4, en: 'Chaturthi', iast: 'Caturthī', devanagari: 'चतुर्थी', nature: 'Rikta', deity: 'Ganesha' },
  { idx: 19, paksha: 'Krishna', tithiNum: 5, en: 'Panchami', iast: 'Pañcamī', devanagari: 'पञ्चमी', nature: 'Poorna', deity: 'Nagas' },
  { idx: 20, paksha: 'Krishna', tithiNum: 6, en: 'Shashthi', iast: 'Ṣaṣṭhī', devanagari: 'षष्ठी', nature: 'Nanda', deity: 'Kartikeya' },
  { idx: 21, paksha: 'Krishna', tithiNum: 7, en: 'Saptami', iast: 'Saptamī', devanagari: 'सप्तमी', nature: 'Bhadra', deity: 'Surya' },
  { idx: 22, paksha: 'Krishna', tithiNum: 8, en: 'Ashtami', iast: 'Aṣṭamī', devanagari: 'अष्टमी', nature: 'Jaya', deity: 'Shiva' },
  { idx: 23, paksha: 'Krishna', tithiNum: 9, en: 'Navami', iast: 'Navamī', devanagari: 'नवमी', nature: 'Rikta', deity: 'Durga' },
  { idx: 24, paksha: 'Krishna', tithiNum: 10, en: 'Dashami', iast: 'Daśamī', devanagari: 'दशमी', nature: 'Poorna', deity: 'Yama' },
  { idx: 25, paksha: 'Krishna', tithiNum: 11, en: 'Ekadashi', iast: 'Ekādaśī', devanagari: 'एकादशी', nature: 'Nanda', deity: 'Vishvedevas' },
  { idx: 26, paksha: 'Krishna', tithiNum: 12, en: 'Dwadashi', iast: 'Dvādaśī', devanagari: 'द्वादशी', nature: 'Bhadra', deity: 'Vishnu' },
  { idx: 27, paksha: 'Krishna', tithiNum: 13, en: 'Trayodashi', iast: 'Trayodaśī', devanagari: 'त्रयोदशी', nature: 'Jaya', deity: 'Kamadeva' },
  { idx: 28, paksha: 'Krishna', tithiNum: 14, en: 'Chaturdashi', iast: 'Caturdaśī', devanagari: 'चतुर्दशी', nature: 'Rikta', deity: 'Shiva' },
  { idx: 29, paksha: 'Krishna', tithiNum: 15, en: 'Amavasya', iast: 'Amāvāsyā', devanagari: 'अमावास्या', nature: 'Poorna', deity: 'Pitris' },
];

// 27 Yogas
export const YOGAS: {
  idx: number;
  en: string;
  iast: string;
  devanagari: string;
  isAuspicious: boolean;
}[] = [
  { idx: 0, en: 'Vishkambha', iast: 'Viṣkambha', devanagari: 'विष्कम्भ', isAuspicious: false },
  { idx: 1, en: 'Priti', iast: 'Prīti', devanagari: 'प्रीति', isAuspicious: true },
  { idx: 2, en: 'Ayushman', iast: 'Āyuṣmat', devanagari: 'आयुष्मत्', isAuspicious: true },
  { idx: 3, en: 'Saubhagya', iast: 'Saubhāgya', devanagari: 'सौभाग्य', isAuspicious: true },
  { idx: 4, en: 'Shobhana', iast: 'Śobhana', devanagari: 'शोभन', isAuspicious: true },
  { idx: 5, en: 'Atiganda', iast: 'Atigaṇḍa', devanagari: 'अतिगण्ड', isAuspicious: false },
  { idx: 6, en: 'Sukarma', iast: 'Sukarma', devanagari: 'सुकर्म', isAuspicious: true },
  { idx: 7, en: 'Dhriti', iast: 'Dhṛti', devanagari: 'धृति', isAuspicious: true },
  { idx: 8, en: 'Shula', iast: 'Śūla', devanagari: 'शूल', isAuspicious: false },
  { idx: 9, en: 'Ganda', iast: 'Gaṇḍa', devanagari: 'गण्ड', isAuspicious: false },
  { idx: 10, en: 'Vriddhi', iast: 'Vṛddhi', devanagari: 'वृद्धि', isAuspicious: true },
  { idx: 11, en: 'Dhruva', iast: 'Dhruva', devanagari: 'ध्रुव', isAuspicious: true },
  { idx: 12, en: 'Vyaghata', iast: 'Vyāghāta', devanagari: 'व्याघात', isAuspicious: false },
  { idx: 13, en: 'Harshana', iast: 'Harṣaṇa', devanagari: 'हर्षण', isAuspicious: true },
  { idx: 14, en: 'Vajra', iast: 'Vajra', devanagari: 'वज्र', isAuspicious: false },
  { idx: 15, en: 'Siddhi', iast: 'Siddhi', devanagari: 'सिद्धि', isAuspicious: true },
  { idx: 16, en: 'Vyatipata', iast: 'Vyatīpāta', devanagari: 'व्यतीपात', isAuspicious: false },
  { idx: 17, en: 'Variyan', iast: 'Varīyas', devanagari: 'वरीयस्', isAuspicious: true },
  { idx: 18, en: 'Parigha', iast: 'Parigha', devanagari: 'परिघ', isAuspicious: false },
  { idx: 19, en: 'Shiva', iast: 'Śiva', devanagari: 'शिव', isAuspicious: true },
  { idx: 20, en: 'Siddha', iast: 'Siddha', devanagari: 'सिद्ध', isAuspicious: true },
  { idx: 21, en: 'Sadhya', iast: 'Sādhya', devanagari: 'साध्य', isAuspicious: true },
  { idx: 22, en: 'Shubha', iast: 'Śubha', devanagari: 'शुभ', isAuspicious: true },
  { idx: 23, en: 'Shukla', iast: 'Śukla', devanagari: 'शुक्ल', isAuspicious: true },
  { idx: 24, en: 'Brahma', iast: 'Brahma', devanagari: 'ब्रह्म', isAuspicious: true },
  { idx: 25, en: 'Indra', iast: 'Indra', devanagari: 'इन्द्र', isAuspicious: true },
  { idx: 26, en: 'Vaidhriti', iast: 'Vaidhṛti', devanagari: 'वैधृति', isAuspicious: false },
];

// 11 Karanas (7 repeating movable + 4 fixed)
export const KARANAS: {
  idx: number;
  en: string;
  iast: string;
  devanagari: string;
  isFixed: boolean;
  isBhadra: boolean;
}[] = [
  // Movable (Chara)
  { idx: 0, en: 'Bava', iast: 'Bava', devanagari: 'बव', isFixed: false, isBhadra: false },
  { idx: 1, en: 'Balava', iast: 'Bālava', devanagari: 'बालव', isFixed: false, isBhadra: false },
  { idx: 2, en: 'Kaulava', iast: 'Kaulava', devanagari: 'कौलव', isFixed: false, isBhadra: false },
  { idx: 3, en: 'Taitila', iast: 'Taitila', devanagari: 'तैतिल', isFixed: false, isBhadra: false },
  { idx: 4, en: 'Garija', iast: 'Garaja', devanagari: 'गरज', isFixed: false, isBhadra: false },
  { idx: 5, en: 'Vanija', iast: 'Vaṇija', devanagari: 'वणिज', isFixed: false, isBhadra: false },
  { idx: 6, en: 'Vishti', iast: 'Viṣṭi (Bhadrā)', devanagari: 'विष्टि (भद्रा)', isFixed: false, isBhadra: true },

  // Fixed (Sthira)
  { idx: 7, en: 'Shakuni', iast: 'Śakuni', devanagari: 'शकुनि', isFixed: true, isBhadra: false },
  { idx: 8, en: 'Chatushpada', iast: 'Catuṣpāda', devanagari: 'चतुष्पाद', isFixed: true, isBhadra: false },
  { idx: 9, en: 'Naga', iast: 'Nāga', devanagari: 'नाग', isFixed: true, isBhadra: false },
  { idx: 10, en: 'Kintughna', iast: 'Kiṃstughna', devanagari: 'किंस्तुघ्न', isFixed: true, isBhadra: false },
];

// 7 Vaaras (Weekdays in Classical Sanskrit)
export const VAARAS: {
  idx: number; // 0=Sunday
  en: string;
  sanskritShort: string;
  fullSanskrit: string;
  iast: string;
  devanagari: string;
  lord: string;
  lordIdx: number;
  deity: string;
}[] = [
  { idx: 0, en: 'Bhanu', sanskritShort: 'Bhanu', fullSanskrit: 'Bhānuvāsara', iast: 'Bhānuvāsara', devanagari: 'भानुवार', lord: 'Surya', lordIdx: 0, deity: 'Surya' },
  { idx: 1, en: 'Indu', sanskritShort: 'Indu', fullSanskrit: 'Induvāsara', iast: 'Induvāsara', devanagari: 'इन्दुवार', lord: 'Chandra', lordIdx: 1, deity: 'Chandra' },
  { idx: 2, en: 'Bhauma', sanskritShort: 'Bhauma', fullSanskrit: 'Bhaumavāsara', iast: 'Bhaumavāsara', devanagari: 'भौमवार', lord: 'Mangala', lordIdx: 2, deity: 'Mangala' },
  { idx: 3, en: 'Saumya', sanskritShort: 'Saumya', fullSanskrit: 'Saumyavāsara', iast: 'Saumyavāsara', devanagari: 'सौम्यवार', lord: 'Budha', lordIdx: 3, deity: 'Budha' },
  { idx: 4, en: 'Guru', sanskritShort: 'Guru', fullSanskrit: 'Guruvāsara', iast: 'Guruvāsara', devanagari: 'गुरुवार', lord: 'Guru', lordIdx: 4, deity: 'Guru' },
  { idx: 5, en: 'Bhargava', sanskritShort: 'Bhargava', fullSanskrit: 'Bhārgavavāsara', iast: 'Bhārgavavāsara', devanagari: 'भार्गववार', lord: 'Shukra', lordIdx: 5, deity: 'Shukra' },
  { idx: 6, en: 'Sthira', sanskritShort: 'Sthira', fullSanskrit: 'Sthiravāsara', iast: 'Sthiravāsara', devanagari: 'स्थिरवार', lord: 'Shani', lordIdx: 6, deity: 'Shani' },
];

// Lunar Months (Masa)
export const MASAS: {
  idx: number;
  en: string;
  iast: string;
  devanagari: string;
}[] = [
  { idx: 0, en: 'Chaitra', iast: 'Caitra', devanagari: 'चैत्र' },
  { idx: 1, en: 'Vaishakha', iast: 'Vaiśākha', devanagari: 'वैशाख' },
  { idx: 2, en: 'Jyeshtha', iast: 'Jyeṣṭha', devanagari: 'ज्येष्ठ' },
  { idx: 3, en: 'Ashadha', iast: 'Āṣāḍha', devanagari: 'आषाढ' },
  { idx: 4, en: 'Shravana', iast: 'Śrāvaṇa', devanagari: 'श्रावण' },
  { idx: 5, en: 'Bhadrapada', iast: 'Bhādrapada', devanagari: 'भाद्रपद' },
  { idx: 6, en: 'Ashvina', iast: 'Āśvina', devanagari: 'आश्विन' },
  { idx: 7, en: 'Kartika', iast: 'Kārtika', devanagari: 'कार्तिक' },
  { idx: 8, en: 'Margashirsha', iast: 'Mārgaśīrṣa', devanagari: 'मार्गशीर्ष' },
  { idx: 9, en: 'Pausha', iast: 'Pauṣa', devanagari: 'पौष' },
  { idx: 10, en: 'Magha', iast: 'Māgha', devanagari: 'माघ' },
  { idx: 11, en: 'Phalguna', iast: 'Phālguna', devanagari: 'फाल्गुन' },
];

// 60 Samvatsaras (Jovian Years cycle)
export const SAMVATSARAS: string[] = [
  'Prabhava', 'Vibhava', 'Shukla', 'Pramoda', 'Prajapati', 'Angirasa', 'Shrimukha', 'Bhava', 'Yuva', 'Dhatri',
  'Ishvara', 'Bahudhanya', 'Pramathi', 'Vikrama', 'Vrishaprajapati', 'Chitrabhanu', 'Subhanu', 'Tarana', 'Parthiva', 'Vyaya',
  'Sarvajit', 'Sarvadhari', 'Virodhi', 'Vikrita', 'Khara', 'Nandana', 'Vijaya', 'Jaya', 'Manmatha', 'Durmukha',
  'Hemalamba', 'Vilamba', 'Vikari', 'Sharvari', 'Plava', 'Shubhakrit', 'Sobhakrit', 'Krodhi', 'Vishvavasu', 'Parabhava',
  'Plavanga', 'Kilaka', 'Saumya', 'Sadharana', 'Virodhikrit', 'Paridhavi', 'Pramadicha', 'Ananda', 'Rakshasa', 'Nala',
  'Pingala', 'Kalayukta', 'Siddharthi', 'Raudri', 'Durmati', 'Dundubhi', 'Rudhirodgari', 'Raktakshi', 'Krodhana', 'Kshaya'
];

// 6 Ritus
export const RITUS: { name: string; iast: string; devanagari: string }[] = [
  { name: 'Vasanta (Spring)', iast: 'Vasanta', devanagari: 'वसन्त' },
  { name: 'Grishma (Summer)', iast: 'Grīṣma', devanagari: 'ग्रीष्म' },
  { name: 'Varsha (Monsoon)', iast: 'Varṣā', devanagari: 'वर्षा' },
  { name: 'Sharad (Autumn)', iast: 'Śarad', devanagari: 'शरद्' },
  { name: 'Hemanta (Pre-Winter)', iast: 'Hemanta', devanagari: 'हेमन्त' },
  { name: 'Shishira (Winter)', iast: 'Śiśira', devanagari: 'शिशिर' },
];

// 9 Grahas mapping (Indian names primary)
export const GRAHAS: {
  id: number;
  en: string;
  western: string;
  iast: string;
  devanagari: string;
  glyph: string;
  color: string;
}[] = [
  { id: 0, en: 'Surya', western: 'Sun', iast: 'Sūrya', devanagari: 'सूर्य', glyph: '☉', color: '#f59e0b' },
  { id: 1, en: 'Chandra', western: 'Moon', iast: 'Candra', devanagari: 'चन्द्र', glyph: '☽', color: '#93c5fd' },
  { id: 2, en: 'Mangala', western: 'Mars', iast: 'Maṅgala', devanagari: 'मङ्गल', glyph: '♂', color: '#ef4444' },
  { id: 3, en: 'Budha', western: 'Mercury', iast: 'Budha', devanagari: 'बुध', glyph: '☿', color: '#10b981' },
  { id: 4, en: 'Guru', western: 'Jupiter', iast: 'Guru', devanagari: 'गुरु', glyph: '♃', color: '#eab308' },
  { id: 5, en: 'Shukra', western: 'Venus', iast: 'Śukra', devanagari: 'शुक्र', glyph: '♀', color: '#ec4899' },
  { id: 6, en: 'Shani', western: 'Saturn', iast: 'Śani', devanagari: 'शनि', glyph: '♄', color: '#6366f1' },
  { id: 7, en: 'Rahu', western: 'North Node', iast: 'Rāhu', devanagari: 'राहु', glyph: '☊', color: '#64748b' },
  { id: 8, en: 'Ketu', western: 'South Node', iast: 'Ketu', devanagari: 'केतु', glyph: '☋', color: '#78716c' },
  { id: 12, en: 'Maandi', western: 'Gulika', iast: 'Māndi', devanagari: 'मान्दि', glyph: '⚵', color: '#a855f7' },
];

// Vimshottari Dasha Years: total 120 years
export const VIMSHOTTARI_DASHA_LORDS: {
  lord: string;
  years: number;
  grahaId: number;
}[] = [
  { lord: 'Ketu', years: 7, grahaId: 8 },
  { lord: 'Shukra', years: 20, grahaId: 5 },
  { lord: 'Surya', years: 6, grahaId: 0 },
  { lord: 'Chandra', years: 10, grahaId: 1 },
  { lord: 'Mangala', years: 7, grahaId: 2 },
  { lord: 'Rahu', years: 18, grahaId: 7 },
  { lord: 'Guru', years: 16, grahaId: 4 },
  { lord: 'Shani', years: 19, grahaId: 6 },
  { lord: 'Budha', years: 17, grahaId: 3 },
];

// Hora Order (Chaldean order of planetary hours)
export const HORA_ORDER: number[] = [0, 5, 3, 1, 6, 4, 2]; // Surya, Shukra, Budha, Chandra, Shani, Guru, Mangala

// 8 Choghadiyas & day/night start indices
export const CHOGHADIYAS: {
  name: string;
  nature: 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';
  isAuspicious: boolean;
  ruler: string;
}[] = [
  { name: 'Udveg', nature: 'Udveg', isAuspicious: false, ruler: 'Surya' },
  { name: 'Char', nature: 'Char', isAuspicious: true, ruler: 'Shukra' },
  { name: 'Labh', nature: 'Labh', isAuspicious: true, ruler: 'Budha' },
  { name: 'Amrit', nature: 'Amrit', isAuspicious: true, ruler: 'Chandra' },
  { name: 'Kaal', nature: 'Kaal', isAuspicious: false, ruler: 'Shani' },
  { name: 'Shubh', nature: 'Shubh', isAuspicious: true, ruler: 'Guru' },
  { name: 'Rog', nature: 'Rog', isAuspicious: false, ruler: 'Mangala' },
];

export const CHOGHADIYA_DAY_START: Record<number, number> = {
  0: 0, // Bhanu: Udveg
  1: 3, // Indu: Amrit
  2: 6, // Bhauma: Rog
  3: 2, // Saumya: Labh
  4: 5, // Guru: Shubh
  5: 1, // Bhargava: Char
  6: 4, // Sthira: Kaal
};

export const CHOGHADIYA_NIGHT_START: Record<number, number> = {
  0: 5, // Bhanu: Shubh
  1: 1, // Indu: Char
  2: 4, // Bhauma: Kaal
  3: 0, // Saumya: Udveg
  4: 3, // Guru: Amrit
  5: 6, // Bhargava: Rog
  6: 2, // Sthira: Labh
};

// Exaltation sign & exact degrees
export const EXALTATION: Record<number, { sign: number; degree: number; debilitationSign: number }> = {
  0: { sign: 0, degree: 10, debilitationSign: 6 }, // Surya: Mesha 10°, Tula deb
  1: { sign: 1, degree: 3, debilitationSign: 7 },  // Chandra: Vrishabha 3°, Vrischika deb
  2: { sign: 9, degree: 28, debilitationSign: 3 }, // Mangala: Makara 28°, Karka deb
  3: { sign: 5, degree: 15, debilitationSign: 11 },// Budha: Kanya 15°, Meena deb
  4: { sign: 3, degree: 5, debilitationSign: 9 },  // Guru: Karka 5°, Makara deb
  5: { sign: 11, degree: 27, debilitationSign: 5 },// Shukra: Meena 27°, Kanya deb
  6: { sign: 6, degree: 20, debilitationSign: 0 }, // Shani: Tula 20°, Mesha deb
  7: { sign: 1, degree: 20, debilitationSign: 7 }, // Rahu: Vrishabha, Vrischika deb
  8: { sign: 7, degree: 20, debilitationSign: 1 }, // Ketu: Vrischika, Vrishabha deb
};

// Own Signs
export const OWN_SIGNS: Record<number, number[]> = {
  0: [4],       // Surya: Simha
  1: [3],       // Chandra: Karka
  2: [0, 7],    // Mangala: Mesha, Vrischika
  3: [2, 5],    // Budha: Mithuna, Kanya
  4: [8, 11],   // Guru: Dhanu, Meena
  5: [1, 6],    // Shukra: Vrishabha, Tula
  6: [9, 10],   // Shani: Makara, Kumbha
  7: [10],      // Rahu (co-ruler Kumbha)
  8: [7],       // Ketu (co-ruler Vrischika)
};

// Classical Naisargika Sambandha (Natural Relationships - BPHS Ch. 3)
export const NATURAL_FRIENDS: Record<number, { friends: number[]; enemies: number[]; neutrals: number[] }> = {
  0: { friends: [1, 2, 4], enemies: [5, 6, 7, 8], neutrals: [3] },          // Surya (Friends: Chandra, Mangala, Guru; Enemies: Shukra, Shani, Rahu, Ketu)
  1: { friends: [0, 3], enemies: [7, 8], neutrals: [2, 4, 5, 6] },          // Chandra (Friends: Surya, Budha; Enemies: Rahu, Ketu; Neutrals: Mangala, Guru, Shukra, Shani)
  2: { friends: [0, 1, 4], enemies: [3, 7], neutrals: [5, 6, 8] },          // Mangala (Friends: Surya, Chandra, Guru; Enemies: Budha, Rahu)
  3: { friends: [0, 5, 7], enemies: [1], neutrals: [2, 4, 6, 8] },          // Budha (Friends: Surya, Shukra, Rahu; Enemies: Chandra)
  4: { friends: [0, 1, 2], enemies: [3, 5], neutrals: [6, 7, 8] },          // Guru (Friends: Surya, Chandra, Mangala; Enemies: Budha, Shukra!)
  5: { friends: [3, 6, 7, 8], enemies: [0, 1, 4], neutrals: [2] },          // Shukra (Friends: Budha, Shani, Rahu, Ketu; Enemies: Surya, Chandra, Guru!)
  6: { friends: [3, 5, 7], enemies: [0, 1, 2], neutrals: [4, 8] },          // Shani (Friends: Budha, Shukra, Rahu; Enemies: Surya, Chandra, Mangala)
  7: { friends: [3, 5, 6], enemies: [0, 1, 2], neutrals: [4, 8] },          // Rahu (Friends: Budha, Shukra, Shani; Enemies: Surya, Chandra, Mangala)
  8: { friends: [2, 5, 6], enemies: [0, 1], neutrals: [3, 4, 7] },          // Ketu (Friends: Mangala, Shukra, Shani; Enemies: Surya, Chandra)
};

// Ghataka Chakra (Inauspicious elements by Moon sign)
export const GHATAKA_CHAKRA: Record<number, { rashi: string; tithis: string; vaara: string; nakshatra: string; prahara: number }> = {
  0: { rashi: 'Mesha', tithis: '1, 6, 11', vaara: 'Bhanu (Bhanuvara)', nakshatra: 'Magha', prahara: 1 },
  1: { rashi: 'Vrishabha', tithis: '5, 10, 15', vaara: 'Sthira (Shanivara)', nakshatra: 'Hasta', prahara: 2 },
  2: { rashi: 'Mithuna', tithis: '2, 7, 12', vaara: 'Indu (Somavara)', nakshatra: 'Swati', prahara: 3 },
  3: { rashi: 'Karka', tithis: '2, 7, 12', vaara: 'Saumya (Budhavara)', nakshatra: 'Anuradha', prahara: 4 },
  4: { rashi: 'Simha', tithis: '3, 8, 13', vaara: 'Guru (Guruvara)', nakshatra: 'Mula', prahara: 1 },
  5: { rashi: 'Kanya', tithis: '5, 10, 15', vaara: 'Sthira (Shanivara)', nakshatra: 'Shravana', prahara: 2 },
  6: { rashi: 'Tula', tithis: '4, 9, 14', vaara: 'Guru (Guruvara)', nakshatra: 'Shatabhisha', prahara: 3 },
  7: { rashi: 'Vrischika', tithis: '5, 10, 15', vaara: 'Bhargava (Shukravara)', nakshatra: 'Revati', prahara: 4 },
  8: { rashi: 'Dhanu', tithis: '3, 8, 13', vaara: 'Bhargava (Shukravara)', nakshatra: 'Bharani', prahara: 1 },
  9: { rashi: 'Makara', tithis: '4, 9, 14', vaara: 'Bhauma (Mangalavara)', nakshatra: 'Rohini', prahara: 2 },
  10: { rashi: 'Kumbha', tithis: '4, 9, 14', vaara: 'Guru (Guruvara)', nakshatra: 'Ardra', prahara: 3 },
  11: { rashi: 'Meena', tithis: '1, 6, 11', vaara: 'Bhargava (Shukravara)', nakshatra: 'Ashlesha', prahara: 4 },
};
