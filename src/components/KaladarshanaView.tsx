import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Flame, 
  Info,
  Clock
} from 'lucide-react';
import { CityInfo, AyanamshaMode, FestivalItem, Language } from '../types/kalayantra';
import { calculatePanchanga } from '../engine/panchanga';
import { formatCityTime } from '../engine/astronomy';

interface KaladarshanaViewProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  city: CityInfo;
  ayanamsha: AyanamshaMode;
  language: Language;
}

export const KaladarshanaView: React.FC<KaladarshanaViewProps> = ({
  currentDate,
  onSelectDate,
  city,
  ayanamsha,
  language,
}) => {
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth()); // 0..11
  const [inspectedDay, setInspectedDay] = useState<Date | null>(currentDate);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onSelectDate(now);
    setInspectedDay(now);
  };

  // Generate days in month
  const monthDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sunday

    const days = [];
    // Padding before 1st of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d, 12, 0, 0);
      const p = calculatePanchanga(date, city, 'udaya', ayanamsha);
      days.push({
        dayNum: d,
        date,
        panchanga: p,
      });
    }

    return days;
  }, [viewYear, viewMonth, city, ayanamsha]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const inspectedPanchanga = useMemo(() => {
    if (!inspectedDay) return null;
    return calculatePanchanga(inspectedDay, city, 'udaya', ayanamsha);
  }, [inspectedDay, city, ayanamsha]);

  const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Month Navigation & Legend */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-heading font-bold text-base sm:text-lg text-slate-100 px-3 min-w-[160px] text-center">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleCurrentMonth}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
          >
            Current Month
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Ekādaśī
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            Saṅkrānti
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            Saṅkaṣṭī
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            Pūrṇimā
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            Amāvāsyā
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Major Vrata
          </span>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {weekDayHeaders.map((w, idx) => (
              <div 
                key={w} 
                className={`text-xs font-bold py-1.5 uppercase tracking-wider rounded ${
                  idx === 0 ? 'text-amber-400 bg-amber-500/5' : 'text-slate-400'
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Month Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {monthDays.map((item, idx) => {
              if (!item) {
                return (
                  <div 
                    key={`empty-${idx}`} 
                    className="min-h-[82px] bg-slate-950/20 rounded-xl border border-transparent"
                  />
                );
              }

              const { dayNum, date, panchanga } = item;
              const isSelected = inspectedDay?.toDateString() === date.toDateString();
              const isToday = new Date().toDateString() === date.toDateString();
              const hasEvents = panchanga.festivals.length > 0;

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => {
                    setInspectedDay(date);
                    onSelectDate(date);
                  }}
                  className={`min-h-[86px] p-2 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                      : isToday
                      ? 'bg-slate-800/90 border-slate-600 hover:border-slate-500'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-mono text-sm font-bold ${
                      isToday ? 'text-amber-400' : isSelected ? 'text-amber-200' : 'text-slate-200'
                    }`}>
                      {dayNum}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[50px]">
                      {panchanga.tithi.paksha === 'Shukla' ? 'Śuk' : 'Kṛṣ'} {panchanga.tithi.tithiInPaksha}
                    </span>
                  </div>

                  {/* Middle: Short Tithi Name & Nakshatra */}
                  <div className="my-1">
                    <div className="text-[11px] font-medium text-slate-300 truncate">
                      {panchanga.tithi.name}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">
                      {panchanga.nakshatra.name}
                    </div>
                  </div>

                  {/* Event Dots */}
                  <div className="flex items-center gap-1 mt-auto overflow-hidden">
                    {panchanga.festivals.slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: f.color }}
                        title={f.name}
                      />
                    ))}
                    {panchanga.festivals.length > 3 && (
                      <span className="text-[8px] text-slate-400 font-bold">
                        +{panchanga.festivals.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Details Drawer / Inspector Card */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          {inspectedPanchanga ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  Day Inspector
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-100 mt-1">
                  {inspectedPanchanga.date.toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {inspectedPanchanga.lunarMonth} {inspectedPanchanga.tithi.paksha} {inspectedPanchanga.tithi.tithiInPaksha} • {inspectedPanchanga.solar.sauraMasa}
                </div>
              </div>

              {/* Day Events */}
              {inspectedPanchanga.festivals.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Observances on this Day:
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {inspectedPanchanga.festivals.map((fest) => (
                      <div 
                        key={fest.id}
                        className="p-2.5 rounded-xl border bg-slate-950/60 text-xs"
                        style={{ borderColor: `${fest.color}40` }}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: fest.color }} />
                          {fest.name}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{fest.description}</p>
                        <div className="text-[10px] text-amber-400/90 mt-1">Rule: {fest.rule}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  No major scriptural fast or annual observance on this day.
                </div>
              )}

              {/* Panchanga Snapshot */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Tithi:</span>
                  <span className="text-slate-100 font-medium">
                    {inspectedPanchanga.tithi.name} ({inspectedPanchanga.tithi.nature})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Nakshatra:</span>
                  <span className="text-slate-100 font-medium">
                    {inspectedPanchanga.nakshatra.name} (Pada {inspectedPanchanga.nakshatra.pada})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Yoga:</span>
                  <span className="text-slate-100 font-medium">{inspectedPanchanga.yoga.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Karana:</span>
                  <span className="text-slate-100 font-medium">{inspectedPanchanga.karana.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Sunrise / Sunset:</span>
                  <span className="text-slate-100 font-mono">
                    {formatCityTime(inspectedPanchanga.sunMoon.sunrise, city.tz, false)} / {formatCityTime(inspectedPanchanga.sunMoon.sunset, city.tz, false)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              Select a day from the calendar to inspect.
            </div>
          )}

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                if (inspectedDay) onSelectDate(inspectedDay);
              }}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-colors shadow-md"
            >
              Open in Core Panchanga
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
