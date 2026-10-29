import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Flame, 
  Info,
  Clock
} from 'lucide-react';
import { CityInfo, AyanamshaMode, FestivalItem, Language, MonthSystem, CalendarSystem, PanchangaDay } from '../types/kalayantra';
import { calculatePanchanga } from '../engine/panchanga';
import { formatCityTime, formatDateDDMMYYYY } from '../engine/astronomy';

interface KaladarshanaViewProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  city: CityInfo;
  ayanamsha: AyanamshaMode;
  monthSystem?: MonthSystem;
  calendarSystem?: CalendarSystem;
  language: Language;
}

export const KaladarshanaView: React.FC<KaladarshanaViewProps> = ({
  currentDate,
  onSelectDate,
  city,
  ayanamsha,
  monthSystem = 'amavasyanta',
  calendarSystem = 'vikram_samvat',
  language,
}) => {
  // Anchor date for Hindu month determination
  const [anchorDate, setAnchorDate] = useState<Date>(currentDate);
  const [inspectedDay, setInspectedDay] = useState<Date | null>(currentDate);

  // Sync anchorDate with currentDate prop if changed externally
  useEffect(() => {
    setAnchorDate(currentDate);
    setInspectedDay(currentDate);
  }, [currentDate]);

  // Classical Sanskrit Vaara column headers with Bhanu (Sunday) as Day 0
  const weekDayHeaders = [
    { sanskrit: 'Bhanu', en: 'Sun', devanagari: 'भानु' },
    { sanskrit: 'Indu', en: 'Mon', devanagari: 'इन्दु' },
    { sanskrit: 'Bhauma', en: 'Tue', devanagari: 'भौम' },
    { sanskrit: 'Saumya', en: 'Wed', devanagari: 'सौम्य' },
    { sanskrit: 'Guru', en: 'Thu', devanagari: 'गुरु' },
    { sanskrit: 'Bhargava', en: 'Fri', devanagari: 'भार्गव' },
    { sanskrit: 'Sthira', en: 'Sat', devanagari: 'स्थिर' },
  ];

  // Anchor Panchanga to identify the current Hindu Month and Year
  const anchorPanchanga = useMemo(() => {
    return calculatePanchanga(anchorDate, city, 'udaya', ayanamsha, monthSystem, calendarSystem);
  }, [anchorDate, city, ayanamsha, monthSystem, calendarSystem]);

  // Generate days strictly partitioned by Hindu Month (Amavasyanta, Purnimanta, or Saura)
  const { monthDays, monthTitle, subTitle } = useMemo(() => {
    const days: { dayNum: number; date: Date; panchanga: PanchangaDay }[] = [];

    let title = '';
    let sub = '';

    if (calendarSystem === 'saura') {
      // 1. Saura (Solar Calendar): Month runs while Sun is in anchor's Saura Masa
      const targetSauraIdx = anchorPanchanga.solar.sauraMasaIdx;
      title = `${anchorPanchanga.solar.sauraMasa}`;
      sub = `Saura Calendar • Śaka ${anchorPanchanga.years.shaka} (${anchorPanchanga.years.samvatsara} Saṃvatsara)`;

      // Step backward to find the 1st day of this Saura month
      let firstDate = new Date(anchorDate);
      for (let i = 0; i < 35; i++) {
        const prev = new Date(firstDate.getTime() - 86400000);
        const p = calculatePanchanga(prev, city, 'udaya', ayanamsha, monthSystem, calendarSystem);
        if (p.solar.sauraMasaIdx !== targetSauraIdx) {
          break;
        }
        firstDate = prev;
      }

      // Collect forward while in target Saura Masa
      let cur = new Date(firstDate);
      let dayCount = 1;
      for (let i = 0; i < 35; i++) {
        const p = calculatePanchanga(cur, city, 'udaya', ayanamsha, monthSystem, calendarSystem);
        if (p.solar.sauraMasaIdx !== targetSauraIdx) {
          break;
        }
        days.push({
          dayNum: p.solar.dayOfMonth || dayCount,
          date: new Date(cur),
          panchanga: p,
        });
        cur = new Date(cur.getTime() + 86400000);
        dayCount++;
      }
    } else if (monthSystem === 'purnimanta') {
      // 2. Purnimanta: Month runs Krishna Pratipada to Shukla Purnima
      const targetMonthIdx = anchorPanchanga.lunarMonthIdx;
      title = `${anchorPanchanga.lunarMonth} Māsa`;
      sub = `Pūrṇimānta • Vikram Saṃvat ${anchorPanchanga.years.vikram} (${anchorPanchanga.years.samvatsara} Saṃvatsara)`;

      // Step backward to find start of this Purnimanta month
      let firstDate = new Date(anchorDate);
      for (let i = 0; i < 35; i++) {
        const prev = new Date(firstDate.getTime() - 86400000);
        const p = calculatePanchanga(prev, city, 'udaya', ayanamsha, 'purnimanta', calendarSystem);
        if (p.lunarMonthIdx !== targetMonthIdx) {
          break;
        }
        firstDate = prev;
      }

      // Collect forward all days of this Purnimanta month
      let cur = new Date(firstDate);
      let dayCount = 1;
      for (let i = 0; i < 35; i++) {
        const p = calculatePanchanga(cur, city, 'udaya', ayanamsha, 'purnimanta', calendarSystem);
        if (p.lunarMonthIdx !== targetMonthIdx) {
          break;
        }
        days.push({
          dayNum: dayCount,
          date: new Date(cur),
          panchanga: p,
        });
        cur = new Date(cur.getTime() + 86400000);
        dayCount++;
      }
    } else {
      // 3. Amavasyanta (Default Lunar): Month runs Shukla Pratipada to Krishna Amavasya
      const targetMonthIdx = anchorPanchanga.lunarMonthIdx;
      title = `${anchorPanchanga.lunarMonth} Māsa`;
      const yearStr = calendarSystem === 'vikram_samvat' 
        ? `Vikram Saṃvat ${anchorPanchanga.years.vikram}` 
        : calendarSystem === 'vikram_kartak'
        ? `Vikram Kārtak ${anchorPanchanga.years.vikramKartak}`
        : `Śaka ${anchorPanchanga.years.shaka}`;
      sub = `Amāvāsyānta • ${yearStr} (${anchorPanchanga.years.samvatsara} Saṃvatsara)`;

      // Step backward to find Shukla Pratipada of this lunar month
      let firstDate = new Date(anchorDate);
      for (let i = 0; i < 35; i++) {
        const prev = new Date(firstDate.getTime() - 86400000);
        const p = calculatePanchanga(prev, city, 'udaya', ayanamsha, 'amavasyanta', calendarSystem);
        if (p.lunarMonthIdx !== targetMonthIdx) {
          break;
        }
        firstDate = prev;
      }

      // Collect forward all days of this Amavasyanta month
      let cur = new Date(firstDate);
      let dayCount = 1;
      for (let i = 0; i < 35; i++) {
        const p = calculatePanchanga(cur, city, 'udaya', ayanamsha, 'amavasyanta', calendarSystem);
        if (p.lunarMonthIdx !== targetMonthIdx) {
          break;
        }
        days.push({
          dayNum: dayCount,
          date: new Date(cur),
          panchanga: p,
        });
        cur = new Date(cur.getTime() + 86400000);
        dayCount++;
      }
    }

    // Grid padding before the first weekday
    const firstDayOfWeek = days.length > 0 ? days[0].date.getDay() : 0; // 0=Bhanu/Sunday
    const paddedList: ({ dayNum: number; date: Date; panchanga: PanchangaDay } | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      paddedList.push(null);
    }
    for (const d of days) {
      paddedList.push(d);
    }

    return { monthDays: paddedList, monthTitle: title, subTitle: sub };
  }, [anchorDate, anchorPanchanga, city, ayanamsha, monthSystem, calendarSystem]);

  const handlePrevMonth = () => {
    // Step back approximately one Hindu month (~29.5 days)
    setAnchorDate(prev => new Date(prev.getTime() - 29.5 * 86400000));
  };

  const handleNextMonth = () => {
    // Step forward approximately one Hindu month (~29.5 days)
    setAnchorDate(prev => new Date(prev.getTime() + 29.5 * 86400000));
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setAnchorDate(now);
    setInspectedDay(now);
    onSelectDate(now);
  };

  const inspectedPanchanga = useMemo(() => {
    if (!inspectedDay) return null;
    return calculatePanchanga(inspectedDay, city, 'udaya', ayanamsha, monthSystem, calendarSystem);
  }, [inspectedDay, city, ayanamsha, monthSystem, calendarSystem]);

  return (
    <div className="space-y-6">
      {/* 1. Hindu Month Navigation Banner & Legend */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded transition-colors"
              title="Previous Hindu Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-3 min-w-[200px] text-center">
              <span className="font-heading font-bold text-base sm:text-lg text-amber-200 block">
                {monthTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-sans block">
                {subTitle}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded transition-colors"
              title="Next Hindu Month"
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

      {/* 2. Main Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden">
          {/* Weekday Headers: Sanskrit Primary with Bhanu for Sunday */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {weekDayHeaders.map((w, idx) => (
              <div 
                key={w.sanskrit} 
                className={`py-1.5 px-1 rounded flex flex-col items-center justify-center ${
                  idx === 0 ? 'text-amber-400 bg-amber-500/10 font-bold' : 'text-slate-300'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wide font-heading">{w.sanskrit}</span>
                <span className="text-[10px] text-slate-500 font-mono">({w.en})</span>
              </div>
            ))}
          </div>

          {/* Month Grid Cells: Panchanga Tithi Primary, Gregorian Date in Brackets Secondary */}
          <div className="grid grid-cols-7 gap-1.5">
            {monthDays.map((item, idx) => {
              if (!item) {
                return (
                  <div 
                    key={`empty-${idx}`} 
                    className="min-h-[96px] bg-slate-950/20 rounded-xl border border-transparent"
                  />
                );
              }

              const { dayNum, date, panchanga } = item;
              const isSelected = inspectedDay?.toDateString() === date.toDateString();
              const isToday = new Date().toDateString() === date.toDateString();
              const pakshaAbbr = panchanga.tithi.paksha === 'Shukla' ? 'Śuk' : 'Kṛṣ';
              const gregDateFormatted = formatDateDDMMYYYY(date);

              return (
                <button
                  key={`day-${gregDateFormatted}-${dayNum}`}
                  onClick={() => {
                    setInspectedDay(date);
                    onSelectDate(date);
                  }}
                  className={`min-h-[96px] p-2 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                      : isToday
                      ? 'bg-slate-800/90 border-amber-500/50 hover:border-slate-500'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar: Highlighted Panchanga Tithi Primary & Gregorian Date in Brackets Secondary */}
                  <div className="flex items-center justify-between w-full">
                    {/* Highlighted Primary Panchang Tithi Date */}
                    <span className="text-[11px] sm:text-xs font-bold text-amber-200 bg-amber-500/25 border border-amber-500/40 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <span className="text-[10px] text-amber-300/90 font-medium">{pakshaAbbr}</span>
                      <span className="font-extrabold text-amber-100">{panchanga.tithi.tithiInPaksha}</span>
                    </span>

                    {/* Gregorian Date in Brackets (DD-MM-YYYY) */}
                    <span className={`text-[10px] font-mono font-medium px-1 rounded ${
                      isToday 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' 
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`} title={`Gregorian date: ${gregDateFormatted}`}>
                      ({gregDateFormatted.slice(0, 5)})
                    </span>
                  </div>

                  {/* Primary Centerpiece: Panchanga Tithi Name */}
                  <div className="my-0.5">
                    <div className="text-xs sm:text-[13px] font-bold text-slate-100 group-hover:text-amber-200 transition-colors truncate">
                      {panchanga.tithi.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                      <span>{panchanga.nakshatra.name}</span>
                      {panchanga.tithi.isVriddhi && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold" title="Vṛddhi Tithi">
                          V
                        </span>
                      )}
                      {panchanga.tithi.isKshaya && (
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded font-bold" title="Kṣaya Tithi">
                          K
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Event Dots */}
                  <div className="flex items-center gap-1 mt-auto overflow-hidden">
                    {panchanga.festivals.slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: f.color }}
                        title={`${f.name} (${gregDateFormatted})`}
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
                <h3 className="font-heading text-lg font-bold text-slate-100 mt-1 font-mono">
                  {formatDateDDMMYYYY(inspectedPanchanga.date)} <span className="text-sm font-sans font-normal text-slate-300">({inspectedPanchanga.vaara.name})</span>
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
                    Observances on this Day ({formatDateDDMMYYYY(inspectedPanchanga.date)}):
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {inspectedPanchanga.festivals.map((fest) => (
                      <div 
                        key={fest.id}
                        className="p-2.5 rounded-xl border bg-slate-950/60 text-xs"
                        style={{ borderColor: `${fest.color}40` }}
                      >
                        <div className="flex items-center justify-between gap-1.5 font-bold text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: fest.color }} />
                            <span>{fest.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-300">
                            ({formatDateDDMMYYYY(inspectedPanchanga.date)})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{fest.description}</p>
                        <div className="text-[10px] text-amber-400/90 mt-1">Rule: {fest.rule}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  No major scriptural fast or annual observance on this day ({formatDateDDMMYYYY(inspectedPanchanga.date)}).
                </div>
              )}

              {/* Panchanga Snapshot */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Tithi:</span>
                  <span className="text-slate-100 font-medium">
                    {inspectedPanchanga.tithi.paksha} {inspectedPanchanga.tithi.name} ({inspectedPanchanga.tithi.nature})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Nakshatra:</span>
                  <span className="text-slate-100 font-medium">
                    {inspectedPanchanga.nakshatra.name} (Pāda {inspectedPanchanga.nakshatra.pada})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Vāra (Weekday):</span>
                  <span className="text-amber-200 font-medium">{inspectedPanchanga.vaara.name} ({inspectedPanchanga.vaara.lord})</span>
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
