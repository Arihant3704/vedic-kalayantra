/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Calendar, 
  Share2, 
  Search, 
  ArrowRight, 
  Download, 
  Upload, 
  Edit3, 
  Check, 
  X, 
  Sparkles,
  Compass,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Plus
} from 'lucide-react';
import { SavedBookmark, BookmarkType } from '../types/bookmarks';
import { 
  getAllBookmarks, 
  deleteBookmark, 
  updateBookmarkNotes, 
  filterBookmarks, 
  exportBookmarksJSON, 
  importBookmarksJSON, 
  clearAllBookmarks,
  seedDefaultBookmarks,
  BOOKMARKS_UPDATED_EVENT 
} from '../engine/bookmarks';

interface SavedViewProps {
  onNavigateToPanchanga: (date: Date, cityName?: string) => void;
  onNavigateToGochara: (date: Date) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  onNavigateToPanchanga,
  onNavigateToGochara,
}) => {
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'panchanga' | 'transit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Note editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  // Status message for import/export
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load bookmarks on mount & listen for event
  const refreshBookmarks = () => {
    const list = getAllBookmarks();
    setBookmarks(list);
  };

  useEffect(() => {
    refreshBookmarks();

    const handleUpdate = () => {
      refreshBookmarks();
    };

    window.addEventListener(BOOKMARKS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(BOOKMARKS_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  // Filtered bookmarks list
  const filteredList = useMemo(() => {
    return filterBookmarks(bookmarks, activeFilter, searchQuery);
  }, [bookmarks, activeFilter, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    const total = bookmarks.length;
    const panchanga = bookmarks.filter((b) => b.type === 'panchanga').length;
    const transit = bookmarks.filter((b) => b.type === 'transit').length;
    return { total, panchanga, transit };
  }, [bookmarks]);

  // Delete handler
  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Remove "${title}" from saved bookmarks?`)) {
      deleteBookmark(id);
      refreshBookmarks();
      showToast(`Removed "${title}"`);
    }
  };

  // Start editing note
  const startEditNote = (bookmark: SavedBookmark) => {
    setEditingId(bookmark.id);
    setEditNoteText(bookmark.notes || '');
  };

  // Save note
  const saveNote = (id: string) => {
    updateBookmarkNotes(id, editNoteText.trim());
    setEditingId(null);
    refreshBookmarks();
    showToast('Notes updated successfully');
  };

  // Export JSON
  const handleExport = () => {
    try {
      const jsonStr = exportBookmarksJSON(bookmarks);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kalayantra-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Bookmarks exported to JSON file');
    } catch (e) {
      console.error(e);
      showToast('Export failed');
    }
  };

  // Trigger import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importBookmarksJSON(content);
        if (res.success) {
          refreshBookmarks();
          showToast(`Successfully imported ${res.importedCount} bookmark(s)`);
        } else {
          showToast(`Import error: ${res.error || 'Failed to parse file'}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Load sample seeds
  const handleLoadSamples = () => {
    seedDefaultBookmarks();
    refreshBookmarks();
    showToast('Loaded sample auspicious dates and transit events');
  };

  // Clear all
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all saved bookmarks? This cannot be undone.')) {
      clearAllBookmarks();
      refreshBookmarks();
      showToast('All bookmarks cleared');
    }
  };

  // Jump to Panchanga
  const handleJumpToPanchanga = (bm: SavedBookmark) => {
    const [year, month, day] = bm.dateISO.split('-').map(Number);
    // construct date in local midnight
    const d = new Date(year, month - 1, day, 12, 0, 0);
    onNavigateToPanchanga(d, bm.cityName);
  };

  // Jump to Gochara
  const handleJumpToGochara = (bm: SavedBookmark) => {
    const [year, month, day] = bm.dateISO.split('-').map(Number);
    const d = new Date(year, month - 1, day, 12, 0, 0);
    onNavigateToGochara(d);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-semibold shadow-2xl flex items-center gap-2 text-sm border border-amber-300 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden file input for import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Saṅgraha (संग्रह)
              </span>
              <span className="text-xs text-slate-400">Personal Astrology Vault</span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-amber-100 flex items-center gap-2">
              Saved Dates & Planetary Transits
            </h2>

            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Quickly revisit marked Panchanga days, major planetary ingress milestones (Sāḍhe Sātī, Jupiter transits), and your personal research notes.
            </p>
          </div>

          {/* Quick Stats Pill Counters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 min-w-[90px] text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</div>
              <div className="text-lg font-bold text-amber-200">{counts.total}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 min-w-[90px] text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Panchanga</div>
              <div className="text-lg font-bold text-amber-400">{counts.panchanga}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 min-w-[90px] text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Transits</div>
              <div className="text-lg font-bold text-emerald-400">{counts.transit}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Filters, Search & Import/Export */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            All Items ({counts.total})
          </button>
          <button
            onClick={() => setActiveFilter('panchanga')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'panchanga'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Panchanga Dates ({counts.panchanga})</span>
          </button>
          <button
            onClick={() => setActiveFilter('transit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'transit'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Transits & Gocara ({counts.transit})</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, tithi, graha, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExport}
              disabled={bookmarks.length === 0}
              title="Export saved bookmarks as JSON"
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleImportClick}
              title="Import bookmarks from JSON"
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            {bookmarks.length > 0 && (
              <button
                onClick={handleClearAll}
                title="Clear all saved bookmarks"
                className="p-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 hover:text-rose-100 rounded-xl border border-rose-500/30 text-xs transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookmarks List */}
      {filteredList.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 sm:p-12 text-center shadow-lg">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
            <Bookmark className="w-7 h-7" />
          </div>

          <h3 className="font-heading text-lg font-bold text-slate-200">
            {bookmarks.length === 0 ? 'No Saved Items Yet' : 'No Matching Items Found'}
          </h3>

          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            {bookmarks.length === 0
              ? 'You can bookmark any Panchanga day using the "Bookmark Date" button in the Panchanga view, or save planetary transit influences from the Gocara view.'
              : `No bookmarks match "${searchQuery}". Try searching for another term or clear the filter.`}
          </p>

          {bookmarks.length === 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleLoadSamples}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 cursor-pointer transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Auspicious Sample Bookmarks</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredList.map((bm) => {
            const isPanchanga = bm.type === 'panchanga';
            const isEditing = editingId === bm.id;

            return (
              <div
                key={bm.id}
                className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-xl ${
                  isPanchanga
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                    : 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                }`}
              >
                <div>
                  {/* Top Bar: Type badge + Date + Delete */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${
                          isPanchanga
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isPanchanga ? <Calendar className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                        {isPanchanga ? 'Panchanga Date' : 'Transit Event'}
                      </span>

                      {bm.cityName && (
                        <span className="text-[11px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
                          {bm.cityName}
                        </span>
                      )}

                      <span className="text-xs font-mono text-amber-300/90 font-medium">
                        {bm.dateISO && /^\d{4}-\d{2}-\d{2}$/.test(bm.dateISO)
                          ? `${bm.dateISO.split('-')[2]}-${bm.dateISO.split('-')[1]}-${bm.dateISO.split('-')[0]}`
                          : bm.displayDate}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(bm.id, bm.title)}
                      title="Remove bookmark"
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-heading text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    {bm.title}
                  </h3>

                  {bm.subtitle && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {bm.subtitle}
                    </p>
                  )}

                  {/* Panchanga Specific 5-Limbs Details */}
                  {isPanchanga && bm.panchangaDetails && (
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Tithi</span>
                          <span className="font-medium text-amber-200">
                            {bm.panchangaDetails.tithiName} ({bm.panchangaDetails.paksha})
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Nakṣatra</span>
                          <span className="font-medium text-slate-200">
                            {bm.panchangaDetails.nakshatraName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Vāra / Day</span>
                          <span className="font-medium text-slate-200">
                            {bm.panchangaDetails.vaaraName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Māsa (Month)</span>
                          <span className="font-medium text-slate-200">
                            {bm.panchangaDetails.lunarMonth}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Yoga</span>
                          <span className="font-medium text-slate-200">
                            {bm.panchangaDetails.yogaName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Karaṇa</span>
                          <span className="font-medium text-slate-200">
                            {bm.panchangaDetails.karanaName}
                          </span>
                        </div>
                      </div>

                      {/* Festivals if any */}
                      {bm.panchangaDetails.festivals && bm.panchangaDetails.festivals.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-amber-400 font-bold uppercase">Festivals:</span>
                          {bm.panchangaDetails.festivals.map((fest, idx) => (
                            <span 
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium"
                            >
                              {fest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transit Specific Details */}
                  {!isPanchanga && bm.transitDetails && (
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 font-bold text-xs">
                            {bm.transitDetails.grahaGlyph || '✦'}
                          </span>
                          <span className="font-bold text-slate-100 text-sm">
                            {bm.transitDetails.grahaName}
                          </span>
                          {bm.transitDetails.isRetrograde && (
                            <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold">
                              Retrograde
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                            bm.transitDetails.isBeneficTransit
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {bm.transitDetails.isBeneficTransit ? 'Benefic Influence' : 'Mixed Influence'}
                        </span>
                      </div>

                      <div className="text-slate-300 font-medium">
                        Transiting <strong className="text-amber-300">{bm.transitDetails.transitRashi}</strong>
                        {bm.transitDetails.degreeFormatted && ` at ${bm.transitDetails.degreeFormatted}`}
                      </div>

                      {(bm.transitDetails.houseFromMoon || bm.transitDetails.houseFromLagna) && (
                        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                          {bm.transitDetails.houseFromMoon && (
                            <span>From Moon: <strong className="text-amber-300">House {bm.transitDetails.houseFromMoon}</strong></span>
                          )}
                          {bm.transitDetails.houseFromMoon && bm.transitDetails.houseFromLagna && <span>•</span>}
                          {bm.transitDetails.houseFromLagna && (
                            <span>From Lagna: <strong className="text-slate-200">House {bm.transitDetails.houseFromLagna}</strong></span>
                          )}
                        </div>
                      )}

                      {bm.transitDetails.transitEffect && (
                        <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          {bm.transitDetails.transitEffect}
                        </p>
                      )}

                      {bm.transitDetails.remedy && (
                        <div className="text-[11px] text-slate-400">
                          <span className="text-amber-400 font-semibold">Classical Remedy: </span>
                          {bm.transitDetails.remedy}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Personal Notes Section */}
                  <div className="mt-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editNoteText}
                          onChange={(e) => setEditNoteText(e.target.value)}
                          placeholder="Add your personal notes, sankalpa, ritual observances, or muhurta comments..."
                          rows={3}
                          className="w-full bg-slate-950 border border-amber-500/40 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveNote(bm.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg cursor-pointer transition shadow"
                          >
                            <Check className="w-3 h-3" />
                            <span>Save Note</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative">
                        {bm.notes ? (
                          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-2.5 text-xs text-slate-300 flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span className="italic leading-relaxed">{bm.notes}</span>
                            </div>
                            <button
                              onClick={() => startEditNote(bm)}
                              title="Edit Note"
                              className="opacity-70 group-hover:opacity-100 text-slate-400 hover:text-amber-300 p-0.5 cursor-pointer transition shrink-0"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditNote(bm)}
                            className="text-[11px] text-slate-500 hover:text-amber-300/90 flex items-center gap-1.5 cursor-pointer transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add personal note...</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Jump Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">
                    Saved on {new Date(bm.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {isPanchanga ? (
                      <button
                        onClick={() => handleJumpToPanchanga(bm)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer"
                      >
                        <span>Open in Panchanga</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleJumpToPanchanga(bm)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
                          title="View Panchanga for transit date"
                        >
                          <Calendar className="w-3 h-3" />
                          <span className="hidden sm:inline">Panchanga</span>
                        </button>
                        <button
                          onClick={() => handleJumpToGochara(bm)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                        >
                          <span>Open in Gocara</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
