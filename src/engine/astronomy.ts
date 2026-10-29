import * as Astronomy from 'astronomy-engine';
import { AyanamshaMode, CityInfo, TraditionalTime, SunMoonTiming } from '../types/kalayantra';

export const J2000_JD = 2451545.0;

/**
 * Convert JS Date to Julian Day (UTC)
 */
export function getJulianDay(date: Date): number {
  const time = Astronomy.MakeTime(date);
  return J2000_JD + time.ut;
}

/**
 * Accurate Sidereal Ayanamsha in degrees
 */
export function getAyanamsha(jdOrDaysSinceJ2000: number, mode: AyanamshaMode = 'lahiri'): number {
  if (mode === 'tropical') {
    return 0.0;
  }
  // If value is full Julian Day (> 2000000), subtract J2000_JD (2451545.0)
  const daysSinceJ2000 = jdOrDaysSinceJ2000 > 1000000 ? jdOrDaysSinceJ2000 - J2000_JD : jdOrDaysSinceJ2000;
  const t = daysSinceJ2000 / 36525.0; // centuries since J2000.0
  const lahiriBase = 23.8570917 + 1.3969713 * t + 0.0003086 * t * t;

  switch (mode) {
    case 'krishnamurti':
      return lahiriBase - 0.096944; // KP is ~5' 49" behind Lahiri
    case 'raman':
      return 22.463889 + 1.3969713 * t; // B.V. Raman ayanamsha
    case 'fagan_bradley':
      return lahiriBase + 0.9000;
    case 'true_citra':
      return lahiriBase + 0.0125;
    case 'lahiri':
    default:
      return lahiriBase;
  }
}

/**
 * Normalize an angle into [0, 360)
 */
export function normalize360(deg: number): number {
  let val = deg % 360.0;
  if (val < 0) val += 360.0;
  return val;
}

/**
 * Format degree into standard D° M' S"
 */
export function formatDegree(deg: number): string {
  const norm = normalize360(deg);
  const d = Math.floor(norm);
  const remMin = (norm - d) * 60;
  const m = Math.floor(remMin);
  const s = Math.round((remMin - m) * 60);
  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

/**
 * Format a Date object according to a specific timezone offset in hours
 */
export function formatCityTime(d?: Date | null, tzOffsetHours: number = 5.5, withSeconds: boolean = true): string {
  if (!d) return '—';
  const utcMs = d.getTime();
  const cityMs = utcMs + tzOffsetHours * 3600000;
  const cityDate = new Date(cityMs);
  let h = cityDate.getUTCHours();
  const m = cityDate.getUTCMinutes().toString().padStart(2, '0');
  const s = cityDate.getUTCSeconds().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  const hStr = h.toString().padStart(2, '0');
  return withSeconds ? `${hStr}:${m}:${s} ${ampm}` : `${hStr}:${m} ${ampm}`;
}

/**
 * Get accurate tropical ecliptic longitude of a celestial body using Astronomy engine
 */
export function getTropicalLongitude(body: Astronomy.Body, time: Astronomy.AstroTime): { lon: number; speed: number } {
  if (body === Astronomy.Body.Sun) {
    const sunPos = Astronomy.SunPosition(time);
    const dt = 1.0 / 24.0;
    const timeLater = time.AddDays(dt);
    const sunPosLater = Astronomy.SunPosition(timeLater);
    let speed = (sunPosLater.elon - sunPos.elon) / dt;
    if (speed < -180) speed += 360 / dt;
    return { lon: normalize360(sunPos.elon), speed };
  }

  const vec = Astronomy.GeoVector(body, time, true);
  const ecl = Astronomy.Ecliptic(vec);

  const dt = 1.0 / 24.0;
  const timeLater = time.AddDays(dt);
  const vecLater = Astronomy.GeoVector(body, timeLater, true);
  const eclLater = Astronomy.Ecliptic(vecLater);
  let speed = (eclLater.elon - ecl.elon) / dt;
  if (speed < -180) speed += 360 / dt;
  if (speed > 180) speed -= 360 / dt;

  return { lon: normalize360(ecl.elon), speed };
}

/**
 * Format a Date object in DD-MM-YYYY format
 */
export function formatDateDDMMYYYY(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Calculate accurate Mean Lunar Node (Rahu) longitude
 * In astronomy-engine, time.ut is the number of days elapsed since J2000.0 (JD 2451545.0)
 */
export function getMeanRahuLongitude(time: Astronomy.AstroTime): { lon: number; speed: number } {
  // IAU formula for mean longitude of lunar ascending node (Omega)
  const T = time.ut / 36525.0; // Julian centuries since J2000.0
  let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0;
  omega = normalize360(omega);
  const speed = -1934.136261 / 36525.0; // Retrograde ~ -0.05295 deg/day
  return { lon: omega, speed };
}

/**
 * Calculate Ascendant (Lagna) in sidereal degrees
 */
export function calculateLagna(date: Date, city: CityInfo, ayanamsha: number): { lon: number; rashiIdx: number; degreeInRashi: number } {
  const time = Astronomy.MakeTime(date);
  const observer = new Astronomy.Observer(city.lat, city.lon, city.alt);
  
  // Apparent Sidereal Time in hours at Greenwich
  const gstHours = Astronomy.SiderealTime(time);
  // Local Sidereal Time in degrees
  const lstDeg = normalize360(gstHours * 15.0 + city.lon);
  const lstRad = (lstDeg * Math.PI) / 180.0;
  
  // Obliquity of the Ecliptic (eps)
  const T = time.ut / 36525.0; // Julian centuries since J2000.0
  const epsDeg = 23.4392911 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600.0;
  const epsRad = (epsDeg * Math.PI) / 180.0;
  
  const phiRad = (city.lat * Math.PI) / 180.0;

  // Exact formula for tropical ascendant:
  // tan(lambda) = -cos(RAMC) / (sin(RAMC)*cos(eps) + tan(phi)*sin(eps))
  // where RAMC = lstRad
  const y = Math.cos(lstRad);
  const x = -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(phiRad) * Math.sin(epsRad));
  let tropLagnaRad = Math.atan2(y, x);
  let tropLagnaDeg = normalize360((tropLagnaRad * 180.0) / Math.PI);

  // Sidereal Lagna
  const siderealLagna = normalize360(tropLagnaDeg - ayanamsha);
  const rashiIdx = Math.floor(siderealLagna / 30.0);
  const degreeInRashi = siderealLagna % 30.0;

  return { lon: siderealLagna, rashiIdx, degreeInRashi };
}

/**
 * Calculate accurate Sun and Moon rise/set, twilights, and moon phase
 */
export function calculateSunMoonTiming(date: Date, city: CityInfo): SunMoonTiming {
  const observer = new Astronomy.Observer(city.lat, city.lon, city.alt);
  
  // Create start of day in local time
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const localDayStart = new Date(Date.UTC(y, m, d, 0, 0, 0));
  // Offset to UTC
  const utcDayStart = new Date(localDayStart.getTime() - city.tz * 3600000);
  const startTime = Astronomy.MakeTime(utcDayStart);

  // Search Sun rise and set for this day
  const sunriseResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, startTime, 1.5);
  const sunsetResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, startTime, 1.5);

  const sunrise = sunriseResult ? sunriseResult.date : new Date(utcDayStart.getTime() + 6 * 3600000);
  const sunset = sunsetResult ? sunsetResult.date : new Date(utcDayStart.getTime() + 18 * 3600000);

  // Search Moon rise and set
  const moonriseResult = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, startTime, 1.5);
  const moonsetResult = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, startTime, 1.5);

  const noon = new Date((sunrise.getTime() + sunset.getTime()) / 2);
  const midnight = new Date(sunset.getTime() + 6 * 3600000);

  // Dawn (Civil Twilight = Sun 6° below horizon) & Arunodaya (Vedic = 96 min before sunrise)
  const dawn = new Date(sunrise.getTime() - 96 * 60000);
  const dusk = new Date(sunset.getTime() + 48 * 60000);

  // Brahma Muhurta is 2 muhurtas (96 min) before sunrise to 1 muhurta (48 min) before sunrise
  const brahmaMuhurtaStart = new Date(sunrise.getTime() - 96 * 60000);
  const brahmaMuhurtaEnd = new Date(sunrise.getTime() - 48 * 60000);

  const dayLengthMinutes = Math.max(1, (sunset.getTime() - sunrise.getTime()) / 60000);
  const nightLengthMinutes = 1440 - dayLengthMinutes;

  // Moon phase & illumination
  const curTime = Astronomy.MakeTime(date);
  const moonPhaseDeg = Astronomy.MoonPhase(curTime);
  const illumResult = Astronomy.Illumination(Astronomy.Body.Moon, curTime);
  const moonIlluminationPercent = Math.round(illumResult.phase_fraction * 100);

  let moonPhase = 'Waxing Crescent';
  if (moonPhaseDeg < 15 || moonPhaseDeg > 345) moonPhase = 'New Moon (Amavasya)';
  else if (moonPhaseDeg < 75) moonPhase = 'Waxing Crescent';
  else if (moonPhaseDeg < 105) moonPhase = 'First Quarter';
  else if (moonPhaseDeg < 165) moonPhase = 'Waxing Gibbous';
  else if (moonPhaseDeg < 195) moonPhase = 'Full Moon (Purnima)';
  else if (moonPhaseDeg < 255) moonPhase = 'Waning Gibbous';
  else if (moonPhaseDeg < 285) moonPhase = 'Third Quarter';
  else moonPhase = 'Waning Crescent';

  return {
    sunrise,
    sunset,
    moonrise: moonriseResult ? moonriseResult.date : null,
    moonset: moonsetResult ? moonsetResult.date : null,
    noon,
    midnight,
    dawn,
    dusk,
    brahmaMuhurtaStart,
    brahmaMuhurtaEnd,
    dayLengthMinutes,
    nightLengthMinutes,
    moonPhase,
    moonIlluminationPercent,
  };
}

/**
 * Calculate traditional Ghadi, Vipal, Tatpara and Prahara timekeeping
 */
export function getTraditionalTime(currentTime: Date, sunrise: Date, sunset: Date): TraditionalTime {
  const isDay = currentTime >= sunrise && currentTime < sunset;
  let elapsedMinutes: number;
  let spanMinutes: number;

  if (isDay) {
    elapsedMinutes = Math.max(0, (currentTime.getTime() - sunrise.getTime()) / 60000);
    spanMinutes = (sunset.getTime() - sunrise.getTime()) / 60000;
  } else {
    // Night
    if (currentTime >= sunset) {
      elapsedMinutes = (currentTime.getTime() - sunset.getTime()) / 60000;
    } else {
      // Past midnight before sunrise
      elapsedMinutes = (currentTime.getTime() - sunset.getTime() + 86400000) / 60000;
    }
    spanMinutes = 1440 - ((sunset.getTime() - sunrise.getTime()) / 60000);
  }

  // 1 Ghadi (Ghatika) = 24 solar minutes
  // In classical Jyotisha: Dinamana Ghadis = dayLengthMinutes / 24
  const dinamanaGhadis = ((sunset.getTime() - sunrise.getTime()) / 60000) / 24.0;
  const ratrimanaGhadis = 60.0 - dinamanaGhadis;

  const totalGhadis = elapsedMinutes / 24.0;
  const ghadi = Math.floor(totalGhadis);
  const vipalTotal = (totalGhadis - ghadi) * 60.0;
  const vipal = Math.floor(vipalTotal);
  const tatpara = Math.floor((vipalTotal - vipal) * 60.0);

  // Prahara: 1/4 of Day (Day 1..4) or 1/4 of Night (Night 1..4)
  const praharaFraction = Math.min(0.999, elapsedMinutes / Math.max(1, spanMinutes));
  const prahara = Math.floor(praharaFraction * 4) + 1;

  return {
    ghadi,
    vipal,
    tatpara,
    prahara,
    isDay,
    dinamanaGhadis: Math.round(dinamanaGhadis * 10) / 10,
    ratrimanaGhadis: Math.round(ratrimanaGhadis * 10) / 10,
    ghadiString: `${ghadi}g ${vipal}v ${tatpara}t`,
  };
}

/**
 * Compute sidereal positions of all major Grahas
 */
export function calculateGrahaSiderealPositions(
  date: Date,
  city: CityInfo,
  ayanamshaMode: AyanamshaMode = 'lahiri'
) {
  const time = Astronomy.MakeTime(date);
  const jd = time.ut;
  const ayanamsha = getAyanamsha(jd, ayanamshaMode);

  const sunData = getTropicalLongitude(Astronomy.Body.Sun, time);
  const moonData = getTropicalLongitude(Astronomy.Body.Moon, time);
  const marsData = getTropicalLongitude(Astronomy.Body.Mars, time);
  const mercuryData = getTropicalLongitude(Astronomy.Body.Mercury, time);
  const jupiterData = getTropicalLongitude(Astronomy.Body.Jupiter, time);
  const venusData = getTropicalLongitude(Astronomy.Body.Venus, time);
  const saturnData = getTropicalLongitude(Astronomy.Body.Saturn, time);
  const rahuData = getMeanRahuLongitude(time);

  const siderealSun = normalize360(sunData.lon - ayanamsha);
  const siderealMoon = normalize360(moonData.lon - ayanamsha);
  const siderealMars = normalize360(marsData.lon - ayanamsha);
  const siderealMercury = normalize360(mercuryData.lon - ayanamsha);
  const siderealJupiter = normalize360(jupiterData.lon - ayanamsha);
  const siderealVenus = normalize360(venusData.lon - ayanamsha);
  const siderealSaturn = normalize360(saturnData.lon - ayanamsha);
  const siderealRahu = normalize360(rahuData.lon - ayanamsha);
  const siderealKetu = normalize360(siderealRahu + 180.0);

  // Maandi / Gulika calculation: calculated from Saturn's portion of day or night
  const timing = calculateSunMoonTiming(date, city);
  const isDay = date >= timing.sunrise && date < timing.sunset;
  const dayOfWeek = date.getDay(); // 0=Sunday..6=Saturday
  // Maandi rising part of day: Sunday: 26 ghadis, Mon: 22, Tue: 18, Wed: 14, Thu: 10, Fri: 6, Sat: 2
  const maandiDayGhadis: Record<number, number> = { 0: 26, 1: 22, 2: 18, 3: 14, 4: 10, 5: 6, 6: 2 };
  const maandiGhadis = maandiDayGhadis[dayOfWeek] || 14;
  const maandiTime = new Date(timing.sunrise.getTime() + maandiGhadis * 24 * 60000);
  const maandiLagna = calculateLagna(maandiTime, city, ayanamsha);

  return {
    jd,
    ayanamsha,
    grahas: {
      0: { lon: siderealSun, speed: sunData.speed, isRetrograde: false },
      1: { lon: siderealMoon, speed: moonData.speed, isRetrograde: false },
      2: { lon: siderealMars, speed: marsData.speed, isRetrograde: marsData.speed < 0 },
      3: { lon: siderealMercury, speed: mercuryData.speed, isRetrograde: mercuryData.speed < 0 },
      4: { lon: siderealJupiter, speed: jupiterData.speed, isRetrograde: jupiterData.speed < 0 },
      5: { lon: siderealVenus, speed: venusData.speed, isRetrograde: venusData.speed < 0 },
      6: { lon: siderealSaturn, speed: saturnData.speed, isRetrograde: saturnData.speed < 0 },
      7: { lon: siderealRahu, speed: rahuData.speed, isRetrograde: true },
      8: { lon: siderealKetu, speed: rahuData.speed, isRetrograde: true },
      12: { lon: maandiLagna.lon, speed: 0, isRetrograde: false },
    },
  };
}

/**
 * Transition moment finder for Panchanga elements (Tithi, Nakshatra, Yoga, Karana)
 * Uses high-precision bisection search across the day.
 */
export function findElementTransition(
  startDate: Date,
  evalFn: (d: Date) => number,
  maxHoursAhead: number = 30
): { endTime: Date; percentElapsed: number } {
  const currentVal = evalFn(startDate);
  let low = startDate.getTime();
  let high = startDate.getTime() + maxHoursAhead * 3600000;

  // Verify transition occurs within maxHoursAhead
  if (evalFn(new Date(high)) === currentVal) {
    // If element doesn't end within window, estimate progress linearly
    return { endTime: new Date(high), percentElapsed: 50 };
  }

  // Bisection search within 1 minute precision (60,000 ms)
  while (high - low > 60000) {
    const mid = Math.floor((low + high) / 2);
    if (evalFn(new Date(mid)) === currentVal) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const endTime = new Date(high);
  // Estimate start time by searching backwards up to 30 hours
  let backLow = startDate.getTime() - 30 * 3600000;
  let backHigh = startDate.getTime();
  if (evalFn(new Date(backLow)) !== currentVal) {
    while (backHigh - backLow > 60000) {
      const mid = Math.floor((backLow + backHigh) / 2);
      if (evalFn(new Date(mid)) === currentVal) {
        backHigh = mid;
      } else {
        backLow = mid;
      }
    }
  }
  const startTime = new Date(backHigh);
  const totalDuration = Math.max(1, endTime.getTime() - startTime.getTime());
  const elapsed = Math.max(0, Math.min(totalDuration, startDate.getTime() - startTime.getTime()));
  const percentElapsed = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  return { endTime, percentElapsed };
}
