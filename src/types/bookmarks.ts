/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BookmarkType = 'panchanga' | 'transit';

export interface PanchangaBookmarkDetails {
  tithiName: string;
  tithiNumber?: number;
  paksha: 'Shukla' | 'Krishna';
  nakshatraName: string;
  yogaName: string;
  karanaName: string;
  vaaraName: string;
  lunarMonth: string;
  sauraMasa?: string;
  shakaYear?: number;
  samvatsara?: string;
  festivals?: string[];
  sunrise?: string;
  sunset?: string;
  isAuspiciousDay?: boolean;
}

export interface TransitBookmarkDetails {
  grahaName: string;
  grahaGlyph?: string;
  transitRashi: string;
  degreeFormatted?: string;
  isRetrograde?: boolean;
  isBeneficTransit?: boolean;
  houseFromMoon?: number;
  houseFromLagna?: number;
  transitEffect?: string;
  category: 'Sade Sati' | 'Ashtama Shani' | 'Kantaka Shani' | 'Guru Ingress' | 'Standard Transit';
  remedy?: string;
}

export interface SavedBookmark {
  id: string;
  type: BookmarkType;
  title: string;
  subtitle?: string;
  dateISO: string; // YYYY-MM-DD
  displayDate: string; // Human readable formatted date
  cityName?: string;
  cityLat?: number;
  cityLon?: number;
  cityTz?: number;
  notes?: string;
  tags?: string[];
  createdAt: string; // ISO string

  panchangaDetails?: PanchangaBookmarkDetails;
  transitDetails?: TransitBookmarkDetails;
}
