/**
 * kālayantra Local Notification & Muhurta Alert Engine
 * Offline-first, location-aware alert scheduling for Muhurtas and Planetary Transits.
 */

import { 
  NotificationPreferences, 
  ScheduledAlert, 
  TriggeredAlertRecord 
} from '../types/notifications';
import { AyanamshaMode, CityInfo } from '../types/kalayantra';
import { calculateSunMoonTiming, calculateGrahaSiderealPositions, normalize360 } from './astronomy';
import { calculateMuhurtas, calculateChoghadiyas } from './muhurta';
import { RASHIS } from './kosha';

export const NOTIFICATION_PREFS_KEY = 'kalayantra_notification_prefs_v1';
export const TRIGGERED_ALERTS_KEY = 'kalayantra_triggered_alerts_v1';
export const NOTIFICATION_EVENT = 'kalayantra_notification_event';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  sound: true,
  leadMinutes: 5, // 5 minutes advance notice before start
  muhurtas: {
    brahma: true,
    abhijit: true,
    vijaya: true,
    godhuli: true,
    rahuKaal: true,
    yamaganda: true,
    gulika: false,
    choghadiyaAmritShubh: true,
  },
  transits: {
    moonRashi: true,
    sunSankranti: true,
    majorPlanets: true,
  },
  inAppToasts: true,
};

/**
 * Load preferences from localStorage with fallback to defaults
 */
export function loadNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_PREFERENCES;
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...parsed,
      muhurtas: {
        ...DEFAULT_NOTIFICATION_PREFERENCES.muhurtas,
        ...(parsed.muhurtas || {}),
      },
      transits: {
        ...DEFAULT_NOTIFICATION_PREFERENCES.transits,
        ...(parsed.transits || {}),
      },
    };
  } catch (err) {
    console.error('Failed to load notification preferences:', err);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * Save preferences to localStorage
 */
export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save notification preferences:', err);
  }
}

/**
 * Load triggered alert history
 */
export function loadTriggeredAlerts(): TriggeredAlertRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRIGGERED_ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load triggered alert history:', err);
    return [];
  }
}

/**
 * Save triggered alert record
 */
export function saveTriggeredAlertRecord(record: TriggeredAlertRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadTriggeredAlerts();
    // Keep last 100 alerts
    const updated = [record, ...existing.filter(a => a.id !== record.id)].slice(0, 100);
    localStorage.setItem(TRIGGERED_ALERTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to record triggered alert:', err);
  }
}

/**
 * Clear alert history
 */
export function clearTriggeredAlerts(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TRIGGERED_ALERTS_KEY);
  } catch (err) {
    console.error('Failed to clear alert history:', err);
  }
}

/**
 * Search for Moon sign ingress (Chandra Gochara) occurring between startTime and endTime
 */
function findMoonIngress(
  start: Date, 
  end: Date, 
  city: CityInfo, 
  ayanamshaMode: AyanamshaMode
): { time: Date; fromRashiIdx: number; toRashiIdx: number } | null {
  const startPos = calculateGrahaSiderealPositions(start, city, ayanamshaMode);
  const moonStartRashi = Math.floor(startPos.grahas[1].lon / 30);

  // Sample every 45 minutes
  const stepMs = 45 * 60000;
  let curMs = start.getTime();
  const endMs = end.getTime();

  while (curMs < endMs) {
    const nextMs = Math.min(curMs + stepMs, endMs);
    const nextDate = new Date(nextMs);
    const nextPos = calculateGrahaSiderealPositions(nextDate, city, ayanamshaMode);
    const nextRashi = Math.floor(nextPos.grahas[1].lon / 30);

    if (nextRashi !== moonStartRashi) {
      // Bisect to 1 minute precision
      let low = curMs;
      let high = nextMs;
      for (let i = 0; i < 8; i++) {
        const mid = (low + high) / 2;
        const midPos = calculateGrahaSiderealPositions(new Date(mid), city, ayanamshaMode);
        const midRashi = Math.floor(midPos.grahas[1].lon / 30);
        if (midRashi === moonStartRashi) {
          low = mid;
        } else {
          high = mid;
        }
      }
      return {
        time: new Date(high),
        fromRashiIdx: moonStartRashi,
        toRashiIdx: nextRashi,
      };
    }
    curMs = nextMs;
  }
  return null;
}

/**
 * Search for Sun Sankranti occurring between startTime and endTime
 */
function findSunSankranti(
  start: Date, 
  end: Date, 
  city: CityInfo, 
  ayanamshaMode: AyanamshaMode
): { time: Date; fromRashiIdx: number; toRashiIdx: number } | null {
  const startPos = calculateGrahaSiderealPositions(start, city, ayanamshaMode);
  const sunStartRashi = Math.floor(startPos.grahas[0].lon / 30);

  const endPos = calculateGrahaSiderealPositions(end, city, ayanamshaMode);
  const sunEndRashi = Math.floor(endPos.grahas[0].lon / 30);

  if (sunStartRashi === sunEndRashi) return null;

  // Bisect between start and end
  let low = start.getTime();
  let high = end.getTime();
  for (let i = 0; i < 12; i++) {
    const mid = (low + high) / 2;
    const midPos = calculateGrahaSiderealPositions(new Date(mid), city, ayanamshaMode);
    const midRashi = Math.floor(midPos.grahas[0].lon / 30);
    if (midRashi === sunStartRashi) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return {
    time: new Date(high),
    fromRashiIdx: sunStartRashi,
    toRashiIdx: sunEndRashi,
  };
}

/**
 * Generate all scheduled alerts for a given date, location, and user preferences.
 */
export function generateDailyAlerts(
  targetDate: Date,
  city: CityInfo,
  ayanamshaMode: AyanamshaMode = 'lahiri',
  prefs: NotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES
): ScheduledAlert[] {
  if (!prefs.enabled) return [];

  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();
  const d = targetDate.getDate();
  const dayStart = new Date(y, m, d, 0, 0, 0);
  const dayEnd = new Date(y, m, d, 23, 59, 59);

  const timing = calculateSunMoonTiming(dayStart, city);
  const vaaraIdx = dayStart.getDay(); // 0=Sun..6=Sat
  const leadMs = prefs.leadMinutes * 60000;
  const dateKey = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const cityKey = city.name.toLowerCase().replace(/[^a-z0-9]/g, '');

  const alerts: ScheduledAlert[] = [];

  // 1. Classical Muhurtas
  const muhurtas = calculateMuhurtas(targetDate, timing, vaaraIdx);

  for (const mSlot of muhurtas) {
    const nameLower = mSlot.name.toLowerCase();
    let include = false;

    if (nameLower.includes('brahma') && prefs.muhurtas.brahma) include = true;
    else if (nameLower.includes('abhijit') && prefs.muhurtas.abhijit) include = true;
    else if (nameLower.includes('vijaya') && prefs.muhurtas.vijaya) include = true;
    else if (nameLower.includes('godhuli') && prefs.muhurtas.godhuli) include = true;
    else if (nameLower.includes('rāhu') && prefs.muhurtas.rahuKaal) include = true;
    else if (nameLower.includes('yamagaṇḍa') && prefs.muhurtas.yamaganda) include = true;
    else if (nameLower.includes('gulika') && prefs.muhurtas.gulika) include = true;

    if (include) {
      const type = mSlot.type === 'auspicious' ? 'shubha' : mSlot.type === 'inauspicious' ? 'ashubha' : 'neutral';
      const triggerTime = new Date(mSlot.startTime.getTime() - leadMs);
      const slotSlug = nameLower.replace(/[^a-z0-9]/g, '_');

      alerts.push({
        id: `${dateKey}_${cityKey}_muhurta_${slotSlug}`,
        title: mSlot.name,
        subtitle: prefs.leadMinutes > 0 
          ? `Starting in ${prefs.leadMinutes} min at ${mSlot.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : `Active starting at ${mSlot.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type,
        targetTime: mSlot.startTime,
        triggerTime,
        leadMinutes: prefs.leadMinutes,
        description: mSlot.description,
        recommendation: type === 'ashubha' ? 'Avoid starting journeys, deals, or major beginnings.' : 'Auspicious window for prayers, studies, or beginnings.',
        cityName: city.name,
      });
    }
  }

  // 2. Choghadiya Auspicious Windows (Amrit, Shubh)
  if (prefs.muhurtas.choghadiyaAmritShubh) {
    const chog = calculateChoghadiyas(targetDate, timing, vaaraIdx);
    const candidateSlots = [...chog.day, ...chog.night].filter(
      s => s.name === 'Amrit' || s.name === 'Shubh'
    );

    for (const slot of candidateSlots) {
      const triggerTime = new Date(slot.startTime.getTime() - leadMs);
      const slotTimeStr = slot.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dayOrNight = slot.isDay ? 'Day' : 'Night';

      alerts.push({
        id: `${dateKey}_${cityKey}_chog_${slot.name.toLowerCase()}_${slot.idx}`,
        title: `${slot.name} Choghadiya (${dayOrNight})`,
        subtitle: prefs.leadMinutes > 0
          ? `Auspicious window begins in ${prefs.leadMinutes}m at ${slotTimeStr}`
          : `Auspicious window begins at ${slotTimeStr}`,
        type: 'choghadiya',
        targetTime: slot.startTime,
        triggerTime,
        leadMinutes: prefs.leadMinutes,
        description: `${slot.name} (${slot.nature}) is an auspicious Choghadiya suitable for starting journeys, commercial transactions, and sacred celebrations.`,
        recommendation: 'Highly favorable for productive work, meetings, and purchases.',
        cityName: city.name,
      });
    }
  }

  // 3. Planetary Transit Alerts
  // Moon Ingress
  if (prefs.transits.moonRashi) {
    const moonIngress = findMoonIngress(dayStart, dayEnd, city, ayanamshaMode);
    if (moonIngress) {
      const fromRashi = RASHIS[moonIngress.fromRashiIdx]?.en || `Rashi ${moonIngress.fromRashiIdx + 1}`;
      const toRashi = RASHIS[moonIngress.toRashiIdx]?.en || `Rashi ${moonIngress.toRashiIdx + 1}`;
      const toRashiSa = RASHIS[moonIngress.toRashiIdx]?.devanagari || '';
      const triggerTime = new Date(moonIngress.time.getTime() - leadMs);
      const timeStr = moonIngress.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      alerts.push({
        id: `${dateKey}_${cityKey}_transit_moon_${moonIngress.toRashiIdx}`,
        title: `Chandra Gochara: Moon in ${toRashi} ${toRashiSa ? `(${toRashiSa})` : ''}`,
        subtitle: prefs.leadMinutes > 0
          ? `Moon transit from ${fromRashi} into ${toRashi} in ${prefs.leadMinutes}m at ${timeStr}`
          : `Moon enters ${toRashi} at ${timeStr}`,
        type: 'transit',
        targetTime: moonIngress.time,
        triggerTime,
        leadMinutes: prefs.leadMinutes,
        description: `Moon completes its stay in ${fromRashi} and enters sidereal ${toRashi}. Gochara impacts emotional state, mental focus, and favorable houses from natal Moon.`,
        recommendation: `Check Gochara tab for houses transit impact relative to your Janma Rashi.`,
        cityName: city.name,
      });
    }
  }

  // Sun Sankranti
  if (prefs.transits.sunSankranti) {
    const sunSankranti = findSunSankranti(dayStart, dayEnd, city, ayanamshaMode);
    if (sunSankranti) {
      const toRashi = RASHIS[sunSankranti.toRashiIdx]?.en || `Rashi ${sunSankranti.toRashiIdx + 1}`;
      const toRashiSa = RASHIS[sunSankranti.toRashiIdx]?.devanagari || '';
      const triggerTime = new Date(sunSankranti.time.getTime() - leadMs);
      const timeStr = sunSankranti.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      alerts.push({
        id: `${dateKey}_${cityKey}_transit_sun_${sunSankranti.toRashiIdx}`,
        title: `Sūrya Saṅkrānti: Sun enters ${toRashi} ${toRashiSa ? `(${toRashiSa})` : ''}`,
        subtitle: `Solar transit occurs at ${timeStr} for ${city.name}`,
        type: 'transit',
        targetTime: sunSankranti.time,
        triggerTime,
        leadMinutes: prefs.leadMinutes,
        description: `The Sun transits into the sign of ${toRashi}, marking the start of a new Solar month (Saura Masa). Auspicious for Surya arghya, charity, and pitru tarpana.`,
        recommendation: 'Perform solar japa, meditation, and dana during the sacred Punya Kala.',
        cityName: city.name,
      });
    }
  }

  // Sort chronologically by trigger time
  return alerts.sort((a, b) => a.triggerTime.getTime() - b.triggerTime.getTime());
}

/**
 * Filter alerts that are currently due to be triggered.
 * Triggered if currentTime >= triggerTime and not yet processed, within a 15-minute validity window.
 */
export function findDueAlerts(
  scheduledAlerts: ScheduledAlert[],
  currentTime: Date,
  triggeredIds: Set<string>
): ScheduledAlert[] {
  const nowMs = currentTime.getTime();
  const maxDelayMs = 15 * 60000; // Do not fire if more than 15 minutes past target time

  return scheduledAlerts.filter(alert => {
    if (triggeredIds.has(alert.id)) return false;
    const triggerMs = alert.triggerTime.getTime();
    const targetMs = alert.targetTime.getTime();

    // Is it past trigger time, but not expired?
    return nowMs >= triggerMs && nowMs <= targetMs + maxDelayMs;
  });
}

/**
 * Request Web Notification permissions from the browser
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return 'denied';
  }
}

/**
 * Dispatch native Web Notification if permitted
 */
export function dispatchWebNotification(alert: ScheduledAlert): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const icon = '/favicon.ico';
    const tag = alert.id;
    new Notification(`Kālayantra Alert: ${alert.title}`, {
      body: `${alert.subtitle}\n${alert.description}`,
      icon,
      tag,
      badge: icon,
    });
    return true;
  } catch (err) {
    console.warn('Web notification dispatch failed:', err);
    return false;
  }
}
