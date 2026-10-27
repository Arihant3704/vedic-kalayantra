/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Calendar, 
  Clock, 
  Sparkles, 
  Compass, 
  HeartHandshake, 
  BookOpen, 
  Flame, 
  Bookmark, 
  BookmarkCheck,
  Share2, 
  Radio
} from 'lucide-react';
import { getAllBookmarks, BOOKMARKS_UPDATED_EVENT } from '../engine/bookmarks';

export type AppTab = 
  | 'panchanga' 
  | 'kaladarshana' 
  | 'muhurta' 
  | 'kundali' 
  | 'dasha' 
  | 'gochara' 
  | 'ashtakoota' 
  | 'bodha' 
  | 'vidya' 
  | 'festivals' 
  | 'mytithis'
  | 'saved';

interface NavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenNotifications?: () => void;
  activeAlertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  onTabChange, 
  onOpenNotifications,
  activeAlertsCount = 0 
}) => {
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      const bms = getAllBookmarks();
      setSavedCount(bms.length);
    };

    updateCount();
    window.addEventListener(BOOKMARKS_UPDATED_EVENT, updateCount);
    return () => {
      window.removeEventListener(BOOKMARKS_UPDATED_EVENT, updateCount);
    };
  }, []);

  const tabs: { id: AppTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'panchanga', label: 'Panchanga', icon: <Sun className="w-4 h-4" /> },
    { id: 'kaladarshana', label: 'Kaladarshana', icon: <Calendar className="w-4 h-4" />, badge: 'Calendar' },
    { id: 'muhurta', label: 'Hora & Muhūrta', icon: <Clock className="w-4 h-4" /> },
    { id: 'kundali', label: 'Kundalī & Vargas', icon: <Compass className="w-4 h-4" /> },
    { id: 'dasha', label: 'Vimshottari Daśā', icon: <Radio className="w-4 h-4" /> },
    { id: 'gochara', label: 'Gocara (Transits)', icon: <Share2 className="w-4 h-4" /> },
    { id: 'ashtakoota', label: 'Aṣṭakūṭa (Gun Milan)', icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'bodha', label: 'KālaBodha & Medhā', icon: <Sparkles className="w-4 h-4" />, badge: 'AI/Reasoning' },
    { id: 'vidya', label: 'KālaVidyā (Concepts)', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'festivals', label: 'Festivals & Vratas', icon: <Flame className="w-4 h-4" /> },
    { id: 'mytithis', label: 'My Tithis', icon: <Bookmark className="w-4 h-4" /> },
    { 
      id: 'saved', 
      label: 'Saved (संग्रह)', 
      icon: <BookmarkCheck className="w-4 h-4 text-amber-400" />, 
      badge: savedCount > 0 ? `${savedCount} Saved` : undefined 
    },
  ];

  return (
    <header className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 text-lg border border-amber-300">
            य
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg sm:text-xl font-bold tracking-wide text-amber-100">
                Kālayantra <span className="font-indic text-amber-400 text-base font-normal">(कालयन्त्र)</span>
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-widest font-semibold hidden md:inline">
                Offline Vedic Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Precise Panchanga, Dharmaśāstra Rules, Jyotiṣa Reasoning Graph & High-Precision Astronomy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-100 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Muhūrta & Transit Alert Center"
            >
              <span className="relative">
                <Clock className="w-4 h-4 text-amber-400" />
                {activeAlertsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                )}
                {activeAlertsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </span>
              <span className="hidden sm:inline">Alerts</span>
              {activeAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-bold">
                  {activeAlertsCount}
                </span>
              )}
            </button>
          )}

          <div className="hidden lg:block text-right">
            <div className="text-xs text-amber-300/80 font-indic font-medium">
              ॥ कालचक्रं प्रवर्त्तते ॥
            </div>
          </div>
        </div>
      </div>

      <nav className="border-t border-slate-800/80 px-2 sm:px-4 bg-slate-950/50 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-1.5 py-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-900/30 font-semibold'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-amber-400/80'}>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                    isActive ? 'bg-amber-900/80 text-amber-200' : 'bg-slate-800 text-amber-400/90'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
