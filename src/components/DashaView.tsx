import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radio, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  Sparkles, 
  Calendar,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { calculateVimshottariTree } from '../engine/dasha';
import { DashaNode, CityInfo, AyanamshaMode } from '../types/kalayantra';
import { calculateGrahaSiderealPositions, formatDateDDMMYYYY } from '../engine/astronomy';
import { BUILTIN_CITIES } from '../engine/kosha';

interface DashaViewProps {
  birthDate: Date;
  moonLongitude: number;
  currentDate: Date;
  selectedCity?: CityInfo;
  ayanamsha?: AyanamshaMode;
}

export const DashaView: React.FC<DashaViewProps> = ({
  birthDate,
  moonLongitude,
  currentDate,
  selectedCity,
  ayanamsha = 'lahiri',
}) => {
  // Birth Date & Time state
  const [birthDateTime, setBirthDateTime] = useState<Date>(birthDate);
  // Target / Evaluation Date & Time state
  const [targetDateTime, setTargetDateTime] = useState<Date>(currentDate);

  // Sync if props change
  useEffect(() => {
    setBirthDateTime(birthDate);
  }, [birthDate]);

  useEffect(() => {
    setTargetDateTime(currentDate);
  }, [currentDate]);

  // Compute exact sidereal Moon longitude based on birth date and birth time
  const computedMoonLon = useMemo(() => {
    try {
      const city = selectedCity || BUILTIN_CITIES[0];
      const { grahas } = calculateGrahaSiderealPositions(birthDateTime, city, ayanamsha);
      const moon = (grahas as Record<number, { lon: number }>)[1];
      if (moon && typeof moon.lon === 'number') {
        return moon.lon;
      }
    } catch (e) {
      // fallback
    }
    return moonLongitude;
  }, [birthDateTime, selectedCity, ayanamsha, moonLongitude]);

  const dashaData = useMemo(() => {
    return calculateVimshottariTree(birthDateTime, computedMoonLon, targetDateTime);
  }, [birthDateTime, computedMoonLon, targetDateTime]);

  const [expandedMaha, setExpandedMaha] = useState<string | null>(dashaData.currentMahaDasha);
  const [expandedAntar, setExpandedAntar] = useState<string | null>(dashaData.currentAntarDasha);

  // Keep expanded periods synced when target changes
  useEffect(() => {
    setExpandedMaha(dashaData.currentMahaDasha);
    setExpandedAntar(dashaData.currentAntarDasha);
  }, [dashaData.currentMahaDasha, dashaData.currentAntarDasha]);

  const formatDate = (d: Date) => {
    return formatDateDDMMYYYY(d);
  };

  const toggleMaha = (lord: string) => {
    setExpandedMaha(prev => prev === lord ? null : lord);
  };

  const toggleAntar = (lordKey: string) => {
    setExpandedAntar(prev => prev === lordKey ? null : lordKey);
  };

  // Birth Time helper functions
  const birthHours = birthDateTime.getHours();
  const birthMinutes = birthDateTime.getMinutes();
  const birthSeconds = birthDateTime.getSeconds();

  const updateBirthTime = (newH: number, newM: number, newS: number) => {
    const next = new Date(birthDateTime);
    next.setHours(newH, newM, newS, 0);
    setBirthDateTime(next);
  };

  const stepBirthMinutes = (offsetMins: number) => {
    const next = new Date(birthDateTime.getTime() + offsetMins * 60000);
    setBirthDateTime(next);
  };

  // Target Time helper functions
  const targetHours = targetDateTime.getHours();
  const targetMinutes = targetDateTime.getMinutes();

  const stepTargetDays = (offsetDays: number) => {
    const next = new Date(targetDateTime.getTime() + offsetDays * 86400000);
    setTargetDateTime(next);
  };

  const stepTargetHours = (offsetHours: number) => {
    const next = new Date(targetDateTime.getTime() + offsetHours * 3600000);
    setTargetDateTime(next);
  };

  return (
    <div className="space-y-6">
      {/* 0. Birth Time & Target Evaluation Time Controls */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Birth Date & Time Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Birth Moment (Janma Kāla):</span>
          </div>

          {/* Birth Date */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="date"
              value={birthDateTime.toISOString().split('T')[0]}
              onChange={(e) => {
                if (!e.target.value) return;
                const [y, m, d] = e.target.value.split('-').map(Number);
                const next = new Date(birthDateTime);
                next.setFullYear(y, m - 1, d);
                setBirthDateTime(next);
              }}
              className="bg-transparent text-slate-200 focus:outline-none font-mono cursor-pointer"
            />
            <span className="text-[11px] text-amber-300 font-mono font-medium ml-1">
              ({formatDateDDMMYYYY(birthDateTime)})
            </span>
          </div>

          {/* Birth Time HH:MM:SS */}
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono">
            <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Time:</span>
            <input
              type="number"
              min="0"
              max="23"
              value={birthHours.toString().padStart(2, '0')}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateBirthTime(isNaN(val) ? 0 : Math.min(23, Math.max(0, val)), birthMinutes, birthSeconds);
              }}
              className="w-7 bg-transparent text-center focus:bg-slate-800 rounded focus:outline-none text-amber-300 font-bold"
              title="Birth Hour (00-23)"
            />
            <span className="text-slate-500">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={birthMinutes.toString().padStart(2, '0')}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateBirthTime(birthHours, isNaN(val) ? 0 : Math.min(59, Math.max(0, val)), birthSeconds);
              }}
              className="w-7 bg-transparent text-center focus:bg-slate-800 rounded focus:outline-none text-amber-200"
              title="Birth Minute (00-59)"
            />
            <span className="text-slate-500">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={birthSeconds.toString().padStart(2, '0')}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateBirthTime(birthHours, birthMinutes, isNaN(val) ? 0 : Math.min(59, Math.max(0, val)));
              }}
              className="w-7 bg-transparent text-center focus:bg-slate-800 rounded focus:outline-none text-slate-400"
              title="Birth Second (00-59)"
            />
          </div>

          {/* Birth Steppers */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => stepBirthMinutes(-60)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              title="Back 1 hour"
            >
              -1h
            </button>
            <button
              type="button"
              onClick={() => stepBirthMinutes(-10)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              title="Back 10 minutes"
            >
              -10m
            </button>
            <button
              type="button"
              onClick={() => stepBirthMinutes(10)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              title="Forward 10 minutes"
            >
              +10m
            </button>
            <button
              type="button"
              onClick={() => stepBirthMinutes(60)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              title="Forward 1 hour"
            >
              +1h
            </button>
          </div>
        </div>

        {/* Target Evaluation Date & Time Picker */}
        <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
            <Timer className="w-3.5 h-3.5 text-blue-400" />
            <span>Target:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-700 rounded-lg px-2 py-1 text-xs">
            <input
              type="date"
              value={targetDateTime.toISOString().split('T')[0]}
              onChange={(e) => {
                if (!e.target.value) return;
                const [y, m, d] = e.target.value.split('-').map(Number);
                const next = new Date(targetDateTime);
                next.setFullYear(y, m - 1, d);
                setTargetDateTime(next);
              }}
              className="bg-transparent text-slate-200 focus:outline-none font-mono cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => stepTargetDays(-1)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              title="Back 1 day"
            >
              -1d
            </button>
            <button
              type="button"
              onClick={() => stepTargetDays(1)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              title="Forward 1 day"
            >
              +1d
            </button>
            <button
              type="button"
              onClick={() => setTargetDateTime(new Date())}
              className="px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold"
              title="Reset to current time"
            >
              Now
            </button>
          </div>
        </div>
      </div>

      {/* 1. Active Running Dasha Highlight Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-purple-500/20 text-purple-300 font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/40 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Active Running Period
              </span>
              <span className="text-xs text-slate-400">
                Vimśottarī 120-Year Cycle
              </span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <span className="text-amber-300">{dashaData.currentMahaDasha}</span>
              <span className="text-slate-500 font-normal">›</span>
              <span className="text-blue-300">{dashaData.currentAntarDasha}</span>
              <span className="text-slate-500 font-normal">›</span>
              <span className="text-purple-300">{dashaData.currentPratyantarDasha}</span>
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Birth Star: <strong className="text-slate-200">{dashaData.janmaNakshatra}</strong> • Balance at Birth: <strong className="text-amber-300">{dashaData.balanceYears} Years of {dashaData.balanceLord} Daśā</strong>
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 px-4 min-w-[220px] text-xs">
            <div className="text-slate-400 mb-1">Target Evaluation Date:</div>
            <div className="font-semibold text-slate-100 font-mono text-sm">
              {formatDate(targetDateTime)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Sub-periods calculated to exact day precision
            </div>
          </div>
        </div>
      </div>

      {/* 2. Expandable 3-Level Dasha Tree Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800 text-xs">
          <div className="font-heading font-semibold text-sm text-slate-100">
            Vimśottarī Daśā Timeline (Tap to expand Antardaśā & Pratyantardaśā)
          </div>
          <div className="text-slate-400">
            120-Year Full Cycle
          </div>
        </div>

        <div className="space-y-2">
          {dashaData.mahadashas.map((maha) => {
            const isMahaOpen = expandedMaha === maha.lord;
            return (
              <div 
                key={maha.lord}
                className={`rounded-xl border transition-all ${
                  maha.isCurrent 
                    ? 'border-amber-500/60 bg-slate-950/70 shadow-md' 
                    : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                {/* Mahadasha Row */}
                <div 
                  onClick={() => toggleMaha(maha.lord)}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-slate-200">
                      {isMahaOpen ? <ChevronDown className="w-4 h-4 text-amber-400" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-slate-100">
                          {maha.lord} Mahādaśā
                        </span>
                        {maha.isCurrent && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded-full font-bold uppercase tracking-wider border border-amber-500/40">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Span: {maha.durationDays} days (~{(maha.durationDays / 365.25).toFixed(1)} years)
                      </div>
                    </div>
                  </div>

                  {/* Dates & Progress */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right font-mono">
                      <div className="text-slate-200 font-medium">{formatDate(maha.startDate)}</div>
                      <div className="text-slate-400 text-[11px]">to {formatDate(maha.endDate)}</div>
                    </div>

                    {maha.isCurrent && (
                      <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all"
                          style={{ width: `${maha.progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-level: Antardashas */}
                {isMahaOpen && maha.children && (
                  <div className="px-4 pb-3 pt-1 border-t border-slate-800/60 space-y-1.5 bg-slate-900/40">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider my-1">
                      Antardaśās under {maha.lord}
                    </div>

                    {maha.children.map((antar) => {
                      const antarKey = `${maha.lord}-${antar.lord}`;
                      const isAntarOpen = expandedAntar === antarKey;

                      return (
                        <div 
                          key={antarKey}
                          className={`rounded-lg border text-xs transition-colors ${
                            antar.isCurrent
                              ? 'bg-blue-950/40 border-blue-500/50'
                              : 'bg-slate-900/60 border-slate-800/60 hover:bg-slate-850'
                          }`}
                        >
                          {/* Antardasha Header */}
                          <div 
                            onClick={() => toggleAntar(antarKey)}
                            className="p-2.5 flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">
                                {isAntarOpen ? <ChevronDown className="w-3.5 h-3.5 text-blue-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </span>
                              <span className="font-semibold text-slate-200">
                                {maha.lord} / {antar.lord}
                              </span>
                              {antar.isCurrent && (
                                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-bold uppercase">
                                  Running Antar
                                </span>
                              )}
                            </div>

                            <div className="font-mono text-slate-300 text-[11px]">
                              {formatDate(antar.startDate)} – {formatDate(antar.endDate)}
                            </div>
                          </div>

                          {/* Level 3: Pratyantardashas */}
                          {isAntarOpen && antar.children && (
                            <div className="p-2.5 pt-1 border-t border-slate-800/60 bg-slate-950/50 space-y-1">
                              <div className="text-[9px] text-slate-500 uppercase font-semibold">
                                Pratyantardaśās:
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px]">
                                {antar.children.map((praty) => (
                                  <div 
                                    key={praty.lord}
                                    className={`p-1.5 rounded border ${
                                      praty.isCurrent
                                        ? 'bg-purple-950/50 border-purple-500 text-purple-200 font-bold'
                                        : 'bg-slate-900/40 border-slate-800/40 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex justify-between">
                                      <span>{praty.lord}</span>
                                      {praty.isCurrent && <span className="text-[9px] text-purple-300 uppercase">Now</span>}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500">
                                      {formatDate(praty.startDate)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
