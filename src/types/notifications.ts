/**
 * Notification and Alert types for Kālayantra
 */

export type AlertType = 'shubha' | 'ashubha' | 'neutral' | 'transit' | 'choghadiya';

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  leadMinutes: 0 | 5 | 15 | 30;
  muhurtas: {
    brahma: boolean;
    abhijit: boolean;
    vijaya: boolean;
    godhuli: boolean;
    rahuKaal: boolean;
    yamaganda: boolean;
    gulika: boolean;
    choghadiyaAmritShubh: boolean;
  };
  transits: {
    moonRashi: boolean;
    sunSankranti: boolean;
    majorPlanets: boolean;
  };
  inAppToasts: boolean;
}

export interface ScheduledAlert {
  id: string;
  title: string;
  subtitle: string;
  type: AlertType;
  targetTime: Date;
  triggerTime: Date;
  leadMinutes: number;
  description: string;
  recommendation?: string;
  cityName: string;
  isCustom?: boolean;
}

export interface TriggeredAlertRecord {
  id: string;
  alertId: string;
  title: string;
  subtitle: string;
  type: AlertType;
  timestamp: string; // ISO string
  cityName: string;
  read: boolean;
}

export interface ActiveToast {
  id: string;
  title: string;
  subtitle: string;
  type: AlertType;
  timeFormatted: string;
  description: string;
  actionTab?: 'muhurta' | 'gochara' | 'panchanga';
}
