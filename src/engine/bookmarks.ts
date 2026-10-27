/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedBookmark, BookmarkType } from '../types/bookmarks';

export const BOOKMARKS_STORAGE_KEY = 'kalayantra_saved_bookmarks';
export const BOOKMARKS_UPDATED_EVENT = 'kalayantra_bookmarks_updated';

// In-memory fallback for environments without localStorage (e.g. Node tests)
let memoryStore: SavedBookmark[] | null = null;

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function notifyUpdate(): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(BOOKMARKS_UPDATED_EVENT));
    } catch {
      // Ignore if event dispatch fails
    }
  }
}

/**
 * Retrieve all saved bookmarks from storage
 */
export function getAllBookmarks(): SavedBookmark[] {
  if (hasLocalStorage()) {
    try {
      const data = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading bookmarks from localStorage:', e);
    }
    return [];
  }

  return memoryStore ? [...memoryStore] : [];
}

/**
 * Persist bookmarks array to storage
 */
function setAllBookmarks(bookmarks: SavedBookmark[]): void {
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Error saving bookmarks to localStorage:', e);
    }
  } else {
    memoryStore = [...bookmarks];
  }
  notifyUpdate();
}

/**
 * Get a specific bookmark by its ID
 */
export function getBookmarkById(id: string): SavedBookmark | undefined {
  const bookmarks = getAllBookmarks();
  return bookmarks.find((b) => b.id === id);
}

/**
 * Save a new bookmark or update existing
 */
export function saveBookmark(
  item: Omit<SavedBookmark, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): SavedBookmark {
  const bookmarks = getAllBookmarks();
  const now = new Date().toISOString();

  // If already exists with matching ID, update it
  if (item.id) {
    const existingIndex = bookmarks.findIndex((b) => b.id === item.id);
    if (existingIndex >= 0) {
      const updated: SavedBookmark = {
        ...bookmarks[existingIndex],
        ...item,
        id: item.id,
        createdAt: bookmarks[existingIndex].createdAt || now,
      };
      bookmarks[existingIndex] = updated;
      setAllBookmarks(bookmarks);
      return updated;
    }
  }

  // Generate unique id
  const newId = item.id || `bm-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const newBookmark: SavedBookmark = {
    ...item,
    id: newId,
    createdAt: item.createdAt || now,
  };

  // Add to beginning of list
  const updatedList = [newBookmark, ...bookmarks];
  setAllBookmarks(updatedList);
  return newBookmark;
}

/**
 * Delete a bookmark by ID
 */
export function deleteBookmark(id: string): boolean {
  const bookmarks = getAllBookmarks();
  const filtered = bookmarks.filter((b) => b.id !== id);
  if (filtered.length !== bookmarks.length) {
    setAllBookmarks(filtered);
    return true;
  }
  return false;
}

/**
 * Update the user notes for a bookmark
 */
export function updateBookmarkNotes(id: string, notes: string): boolean {
  const bookmarks = getAllBookmarks();
  const target = bookmarks.find((b) => b.id === id);
  if (target) {
    target.notes = notes;
    setAllBookmarks(bookmarks);
    return true;
  }
  return false;
}

/**
 * Check if a specific Panchanga date (and optional city) is bookmarked
 */
export function isPanchangaBookmarked(dateISO: string, cityName?: string): boolean {
  return !!getPanchangaBookmark(dateISO, cityName);
}

/**
 * Retrieve the Panchanga bookmark for a given date
 */
export function getPanchangaBookmark(dateISO: string, cityName?: string): SavedBookmark | undefined {
  const bookmarks = getAllBookmarks();
  return bookmarks.find((b) => {
    if (b.type !== 'panchanga') return false;
    if (b.dateISO !== dateISO) return false;
    if (cityName && b.cityName && b.cityName.toLowerCase() !== cityName.toLowerCase()) {
      return false;
    }
    return true;
  });
}

/**
 * Check if a planetary transit is bookmarked
 */
export function isTransitBookmarked(grahaName: string, dateISO: string, transitRashi?: string): boolean {
  return !!getTransitBookmark(grahaName, dateISO, transitRashi);
}

/**
 * Retrieve a transit bookmark
 */
export function getTransitBookmark(grahaName: string, dateISO: string, transitRashi?: string): SavedBookmark | undefined {
  const bookmarks = getAllBookmarks();
  return bookmarks.find((b) => {
    if (b.type !== 'transit') return false;
    if (b.transitDetails?.grahaName.toLowerCase() !== grahaName.toLowerCase()) return false;
    if (b.dateISO !== dateISO) return false;
    if (transitRashi && b.transitDetails?.transitRashi !== transitRashi) return false;
    return true;
  });
}

/**
 * Toggle Panchanga bookmark (add if missing, remove if exists)
 */
export function togglePanchangaBookmark(
  item: Omit<SavedBookmark, 'id' | 'createdAt'>
): { bookmarked: boolean; bookmark?: SavedBookmark } {
  const existing = getPanchangaBookmark(item.dateISO, item.cityName);
  if (existing) {
    deleteBookmark(existing.id);
    return { bookmarked: false };
  } else {
    const created = saveBookmark(item);
    return { bookmarked: true, bookmark: created };
  }
}

/**
 * Toggle Transit bookmark (add if missing, remove if exists)
 */
export function toggleTransitBookmark(
  item: Omit<SavedBookmark, 'id' | 'createdAt'>
): { bookmarked: boolean; bookmark?: SavedBookmark } {
  const graha = item.transitDetails?.grahaName || '';
  const rashi = item.transitDetails?.transitRashi;
  const existing = getTransitBookmark(graha, item.dateISO, rashi);
  if (existing) {
    deleteBookmark(existing.id);
    return { bookmarked: false };
  } else {
    const created = saveBookmark(item);
    return { bookmarked: true, bookmark: created };
  }
}

/**
 * Filter bookmarks by type and text query
 */
export function filterBookmarks(
  bookmarks: SavedBookmark[],
  typeFilter: 'all' | 'panchanga' | 'transit' = 'all',
  searchQuery: string = ''
): SavedBookmark[] {
  let result = bookmarks;

  if (typeFilter !== 'all') {
    result = result.filter((b) => b.type === typeFilter);
  }

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter((b) => {
      const matchTitle = b.title.toLowerCase().includes(query);
      const matchSubtitle = b.subtitle?.toLowerCase().includes(query);
      const matchDate = b.dateISO.includes(query) || b.displayDate.toLowerCase().includes(query);
      const matchCity = b.cityName?.toLowerCase().includes(query);
      const matchNotes = b.notes?.toLowerCase().includes(query);
      const matchTithi = b.panchangaDetails?.tithiName.toLowerCase().includes(query);
      const matchNakshatra = b.panchangaDetails?.nakshatraName.toLowerCase().includes(query);
      const matchYoga = b.panchangaDetails?.yogaName.toLowerCase().includes(query);
      const matchGraha = b.transitDetails?.grahaName.toLowerCase().includes(query);
      const matchRashi = b.transitDetails?.transitRashi.toLowerCase().includes(query);
      const matchCategory = b.transitDetails?.category.toLowerCase().includes(query);
      const matchFestivals = b.panchangaDetails?.festivals?.some((f) => f.toLowerCase().includes(query));

      return (
        matchTitle ||
        matchSubtitle ||
        matchDate ||
        matchCity ||
        matchNotes ||
        matchTithi ||
        matchNakshatra ||
        matchYoga ||
        matchGraha ||
        matchRashi ||
        matchCategory ||
        matchFestivals
      );
    });
  }

  return result;
}

/**
 * Export bookmarks as formatted JSON string
 */
export function exportBookmarksJSON(bookmarks?: SavedBookmark[]): string {
  const data = bookmarks || getAllBookmarks();
  return JSON.stringify(
    {
      app: 'Kālayantra',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      count: data.length,
      bookmarks: data,
    },
    null,
    2
  );
}

/**
 * Import bookmarks from JSON string
 */
export function importBookmarksJSON(
  jsonString: string
): { success: boolean; importedCount: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const list: SavedBookmark[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.bookmarks)
      ? parsed.bookmarks
      : [];

    if (!Array.isArray(list) || list.length === 0) {
      return { success: false, importedCount: 0, error: 'No valid bookmarks found in file.' };
    }

    const current = getAllBookmarks();
    const currentIds = new Set(current.map((b) => b.id));
    let count = 0;

    for (const item of list) {
      if (item && item.type && item.title && item.dateISO) {
        if (!currentIds.has(item.id)) {
          current.unshift(item);
          currentIds.add(item.id);
          count++;
        }
      }
    }

    setAllBookmarks(current);
    return { success: true, importedCount: count };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, importedCount: 0, error: `Invalid JSON format: ${message}` };
  }
}

/**
 * Clear all bookmarks
 */
export function clearAllBookmarks(): void {
  setAllBookmarks([]);
}

/**
 * Seed sample auspicious bookmarks for first-time onboarding or discovery
 */
export function seedDefaultBookmarks(): SavedBookmark[] {
  const seed: SavedBookmark[] = [
    {
      id: 'seed-bm-1',
      type: 'panchanga',
      title: 'Kārtika Pūrṇimā & Devadīpāvalī',
      subtitle: 'Holy Full Moon Day of Illumination & Sacred Bathing',
      dateISO: '2026-11-24',
      displayDate: 'Tuesday, 24 Nov 2026',
      cityName: 'Varanasi',
      notes: 'Plan Ganga ghat deepotsava and special temple archana. Deepa daana at twilight.',
      tags: ['Festival', 'Purnima', 'Snana'],
      createdAt: new Date().toISOString(),
      panchangaDetails: {
        tithiName: 'Pūrṇimā',
        paksha: 'Shukla',
        nakshatraName: 'Kṛttikā',
        yogaName: 'Śiva',
        karanaName: 'Bava',
        vaaraName: 'Maṅgalavāra (Tuesday)',
        lunarMonth: 'Kārtika',
        festivals: ['Devadīpāvalī', 'Kārtika Pūrṇimā', 'Tripuri Pūrṇimā'],
        isAuspiciousDay: true,
      },
    },
    {
      id: 'seed-bm-2',
      type: 'transit',
      title: 'Guru Ingress into Mithuna (Gemini)',
      subtitle: 'Jupiter entering Gemini — intellectual & philosophical resurgence',
      dateISO: '2026-06-02',
      displayDate: 'Tuesday, 02 Jun 2026',
      cityName: 'New Delhi',
      notes: 'Marked for major education and research project inauguration.',
      tags: ['Guru', 'Gocara', 'Ingress'],
      createdAt: new Date().toISOString(),
      transitDetails: {
        grahaName: 'Guru (Jupiter)',
        grahaGlyph: '♃',
        transitRashi: 'Mithuna (Gemini)',
        degreeFormatted: `00° 12' 40"`,
        isRetrograde: false,
        isBeneficTransit: true,
        houseFromMoon: 9,
        houseFromLagna: 1,
        transitEffect: 'Expansion of dharmic knowledge, higher wisdom, fortunate teachers and scholars.',
        category: 'Guru Ingress',
        remedy: 'Recite Guru Paduka Stotram, offer yellow flowers and saffron water.',
      },
    },
    {
      id: 'seed-bm-3',
      type: 'panchanga',
      title: 'Vaikuṇṭha Ekādaśī & Mokṣadā',
      subtitle: 'Supreme fasting day opening the portals of Paramapada',
      dateISO: '2026-12-20',
      displayDate: 'Sunday, 20 Dec 2026',
      cityName: 'Tirupati',
      notes: 'Complete fasting (Nirjala/Phalahara) and Gita Jayanti chanting.',
      tags: ['Ekadashi', 'Vrata', 'Vishnu'],
      createdAt: new Date().toISOString(),
      panchangaDetails: {
        tithiName: 'Mokṣadā Ekādaśī',
        paksha: 'Shukla',
        nakshatraName: 'Bharani',
        yogaName: 'Sadhya',
        karanaName: 'Vanija',
        vaaraName: 'Ravivāra (Sunday)',
        lunarMonth: 'Mārgaśīrṣa',
        festivals: ['Vaikuṇṭha Ekādaśī', 'Gītā Jayantī'],
        isAuspiciousDay: true,
      },
    },
  ];

  setAllBookmarks(seed);
  return seed;
}
