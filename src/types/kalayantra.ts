/**
 * Core type definitions for Kālayantra (कालयन्त्र)
 */

export type Language = 'en' | 'iast' | 'devanagari';

export type AyanamshaMode = 'lahiri' | 'krishnamurti' | 'raman' | 'true_citra' | 'fagan_bradley' | 'tropical';

export type PanchangaMode = 'udaya' | 'current'; // Sunrise anchored vs Real-time

export type MonthSystem = 'amavasyanta' | 'purnimanta';

export type ChartStyle = 'north' | 'south' | 'east';

export type DivisionalChartId = 
  | 'D1' | 'D2' | 'D3' | 'D4' | 'D7' | 'D9' 
  | 'D10' | 'D12' | 'D16' | 'D20' | 'D24' 
  | 'D27' | 'D30' | 'D60';

export interface CityInfo {
  name: string;
  nameDevanagari?: string;
  stateCountry: string;
  lat: number;
  lon: number;
  tz: number; // UTC offset in hours (e.g. 5.5 for IST)
  alt: number; // meters
}

export interface TrilingualName {
  en: string;
  iast: string;
  devanagari: string;
}

export interface TithiInfo {
  idx: number; // 0..29
  name: string;
  paksha: 'Shukla' | 'Krishna';
  tithiInPaksha: number; // 1..15
  deity: string;
  nature: 'Nanda' | 'Bhadra' | 'Jaya' | 'Rikta' | 'Poorna';
  endTime?: Date;
  percentElapsed?: number;
  isKshaya?: boolean;
  isVriddhi?: boolean;
}

export interface NakshatraInfo {
  idx: number; // 0..26
  name: string;
  pada: number; // 1..4
  degreeInPada: number;
  lord: string;
  deity: string;
  symbol: string;
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  nadi: 'Adi' | 'Madhya' | 'Antya';
  yoni: string;
  endTime?: Date;
  percentElapsed?: number;
}

export interface YogaInfo {
  idx: number; // 0..26
  name: string;
  isAuspicious: boolean;
  endTime?: Date;
  percentElapsed?: number;
}

export interface KaranaInfo {
  idx: number; // 0..59 sequence or 0..10 unique
  uniqueIdx: number; // 0..10
  name: string;
  isFixed: boolean;
  isBhadra: boolean; // Vishti karana is Bhadra
  endTime?: Date;
  percentElapsed?: number;
}

export interface VaaraInfo {
  idx: number; // 0=Sunday..6=Saturday or Monday=0..Sunday=6
  name: string;
  lord: string;
  deity: string;
}

export interface SunMoonTiming {
  sunrise: Date;
  sunset: Date;
  moonrise: Date | null;
  moonset: Date | null;
  noon: Date;
  midnight: Date;
  dawn: Date; // Civil twilight / Arunodaya
  dusk: Date;
  brahmaMuhurtaStart: Date;
  brahmaMuhurtaEnd: Date;
  dayLengthMinutes: number;
  nightLengthMinutes: number;
  moonPhase: string;
  moonIlluminationPercent: number;
}

export interface TraditionalTime {
  ghadi: number;
  vipal: number;
  tatpara: number;
  prahara: number; // 1..4 of day, 1..4 of night
  isDay: boolean;
  dinamanaGhadis: number;
  ratrimanaGhadis: number;
  ghadiString: string;
}

export interface SolarDateInfo {
  sauraMasa: string;
  sauraMasaIdx: number;
  dayOfMonth: number;
  shakaYear: number;
  vikramaSamvat: number;
  samvatsara: string;
  ayana: 'Uttarayana' | 'Dakshinayana';
  ritu: string;
}

export interface FestivalItem {
  id: string;
  name: string;
  type: 'Ekadashi' | 'Sankranti' | 'Purnima' | 'Amavasya' | 'Vrata' | 'Jayanti' | 'Festival' | 'MyTithi';
  color: string;
  priority: number; // higher = more important
  description: string;
  rule: string;
  sourceText?: string;
  paranaTime?: string;
  isCustom?: boolean;
}

export interface PanchangaDay {
  date: Date;
  dateStr: string; // DD-MM-YYYY
  mode: PanchangaMode;
  ayanamshaMode: AyanamshaMode;
  ayanamshaValue: number;
  city: CityInfo;
  tithi: TithiInfo;
  nakshatra: NakshatraInfo;
  yoga: YogaInfo;
  karana: KaranaInfo;
  vaara: VaaraInfo;
  lunarMonth: string;
  lunarMonthIdx: number;
  isAdhikaMasa: boolean;
  paksha: 'Shukla' | 'Krishna';
  solar: SolarDateInfo;
  sunMoon: SunMoonTiming;
  traditionalTime: TraditionalTime;
  festivals: FestivalItem[];
}

export interface HoraSlot {
  idx: number; // 0..23
  startTime: Date;
  endTime: Date;
  lord: string;
  isDay: boolean;
  isCurrent: boolean;
}

export interface ChoghadiyaSlot {
  idx: number; // 0..7
  name: string;
  nature: 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';
  isAuspicious: boolean;
  startTime: Date;
  endTime: Date;
  isDay: boolean;
  isCurrent: boolean;
}

export interface MuhurtaSlot {
  name: string;
  type: 'auspicious' | 'inauspicious' | 'neutral';
  startTime: Date;
  endTime: Date;
  description: string;
  isCurrent: boolean;
}

export interface GrahaPosition {
  id: number; // 0=Sun, 1=Moon, 2=Mars, 3=Mercury, 4=Jupiter, 5=Venus, 6=Saturn, 7=Rahu, 8=Ketu, 12=Maandi
  name: string;
  glyph: string;
  longitude: number; // 0..360
  rashiIdx: number; // 0..11
  rashiName: string;
  degreeInRashi: number; // 0..30
  degreeFormatted: string;
  nakshatraIdx: number;
  nakshatraName: string;
  pada: number;
  bhava: number; // 1..12
  speed: number;
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: 'Exalted' | 'Moolatrikona' | 'Own Sign' | 'Great Friend' | 'Friend' | 'Neutral' | 'Enemy' | 'Great Enemy' | 'Debilitated';
  dignityColor: string;
  charaKaraka?: string; // AK, AmK, BK, etc.
}

export interface BhavaDetail {
  bhava: number; // 1..12
  rashiIdx: number;
  rashiName: string;
  grahas: GrahaPosition[];
}

export interface KundaliChartData {
  chartId: DivisionalChartId;
  chartTitle: string;
  lagnaLongitude: number;
  lagnaRashiIdx: number;
  lagnaDegreeFormatted: string;
  lagnaNakshatra: string;
  lagnaPada: number;
  grahas: GrahaPosition[];
  bhavas: BhavaDetail[];
}

export interface DashaNode {
  level: 1 | 2 | 3; // Mahadasha, Antardasha, Pratyantardasha
  lord: string;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  isCurrent: boolean;
  progressPercent: number;
  children?: DashaNode[];
}

export interface AshtakootaScore {
  koota: 'Varna' | 'Vashya' | 'Tara' | 'Yoni' | 'Graha Maitri' | 'Gana' | 'Bhakoot' | 'Nadi';
  maxPoints: number;
  obtainedPoints: number;
  description: string;
  hasDosha: boolean;
  isCancelled: boolean;
  cancellationReason?: string;
}

export interface AshtakootaResult {
  groomNakshatra: string;
  groomPada: number;
  groomRashi: string;
  brideNakshatra: string;
  bridePada: number;
  brideRashi: string;
  totalScore: number;
  maxScore: 36;
  verdict: 'Excellent' | 'Good' | 'Average' | 'Not Recommended';
  kootas: AshtakootaScore[];
  doshas: string[];
  cancellations: string[];
  recommendation: string;
}

export interface YogaEvidence {
  id: string;
  name: string;
  type: 'Raja' | 'Dhana' | 'Mahapurusha' | 'Auspicious' | 'Inauspicious' | 'Vipareeta';
  description: string;
  grahasInvolved: string[];
  factors: string[];
  rule: string;
  sourceText: string;
}

export interface GrahaStrengthFact {
  graha: string;
  score: number; // e.g. 0..100
  rank: number;
  status: 'Strong' | 'Moderate' | 'Weak';
  reasons: string[];
  drishtiAspects: string[];
  inYogas: string[];
}

export interface BodhaAnalysis {
  lagnaAnalysis: string;
  yogas: YogaEvidence[];
  strengths: GrahaStrengthFact[];
  planetaryWars: string[]; // Graha Yuddha
  drishtis: { from: string; toSigns: string[]; toGrahas: string[]; rule: string }[];
  summaryNarrative: string;
}

export interface VidyaConcept {
  id: string;
  category: string;
  title: TrilingualName;
  summary: TrilingualName;
  meaning: string;
  formula: string;
  example: string;
  source: string;
  keywords: string[];
  crossRefs: string[];
}

export interface MyTithiItem {
  id: string;
  title: string;
  tithiIdx: number; // 0..29
  paksha: 'Shukla' | 'Krishna';
  lunarMonthIdx?: number; // optional, null = every month
  nakshatraIdx?: number; // optional
  targetTime: 'Brahma Muhurta' | 'Sunrise' | 'Noon' | 'Evening';
  notes: string;
  isAnniversary: boolean;
  baseYear?: number;
}
