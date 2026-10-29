import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, 
  Layers, 
  Save, 
  FolderOpen, 
  Trash2, 
  Sparkles, 
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { 
  AyanamshaMode, 
  ChartStyle, 
  CityInfo, 
  DivisionalChartId, 
  KundaliChartData 
} from '../types/kalayantra';
import { calculateKundali } from '../engine/kundali';
import { RASHIS, GHATAKA_CHAKRA, GRAHAS, NATURAL_FRIENDS } from '../engine/kosha';
import { formatDateDDMMYYYY } from '../engine/astronomy';

interface KundaliViewProps {
  currentDate: Date;
  selectedCity: CityInfo;
  ayanamsha: AyanamshaMode;
}

interface SavedProfile {
  id: string;
  name: string;
  birthDateIso: string;
  cityName: string;
  lat: number;
  lon: number;
  tz: number;
  alt: number;
}

export const KundaliView: React.FC<KundaliViewProps> = ({
  currentDate,
  selectedCity,
  ayanamsha,
}) => {
  const [chartStyle, setChartStyle] = useState<ChartStyle>('north');
  const [selectedVarga, setSelectedVarga] = useState<DivisionalChartId>('D1');
  const [birthDateTime, setBirthDateTime] = useState<Date>(currentDate);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Sync with prop when prop date changes unless explicitly detached
  useEffect(() => {
    setBirthDateTime(currentDate);
  }, [currentDate]);

  // Load saved profiles from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem('kalayantra_saved_kundalis');
      if (data) {
        setSavedProfiles(JSON.parse(data));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSaveProfile = () => {
    if (!profileNameInput.trim()) return;
    const newProfile: SavedProfile = {
      id: Date.now().toString(),
      name: profileNameInput.trim(),
      birthDateIso: birthDateTime.toISOString(),
      cityName: selectedCity.name,
      lat: selectedCity.lat,
      lon: selectedCity.lon,
      tz: selectedCity.tz,
      alt: selectedCity.alt,
    };
    const updated = [...savedProfiles, newProfile];
    setSavedProfiles(updated);
    try {
      localStorage.setItem('kalayantra_saved_kundalis', JSON.stringify(updated));
    } catch (e) {}
    setProfileNameInput('');
    setShowSaveModal(false);
  };

  const handleLoadProfile = (prof: SavedProfile) => {
    setBirthDateTime(new Date(prof.birthDateIso));
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedProfiles.filter(p => p.id !== id);
    setSavedProfiles(updated);
    try {
      localStorage.setItem('kalayantra_saved_kundalis', JSON.stringify(updated));
    } catch (e) {}
  };

  const chartData: KundaliChartData = useMemo(() => {
    return calculateKundali(birthDateTime, selectedCity, selectedVarga, ayanamsha);
  }, [birthDateTime, selectedCity, selectedVarga, ayanamsha]);

  // Get Moon Rashi for Ghataka Chakra
  const moonGraha = chartData.grahas.find(g => g.id === 1);
  const moonRashi = moonGraha ? moonGraha.rashiIdx : 0;
  const ghataka = GHATAKA_CHAKRA[moonRashi] || GHATAKA_CHAKRA[0];

  const vargaOptions: { id: DivisionalChartId; label: string }[] = [
    { id: 'D1', label: 'D1 — Rāśi' },
    { id: 'D9', label: 'D9 — Navāṃśa' },
    { id: 'D10', label: 'D10 — Daśāṃśa' },
    { id: 'D7', label: 'D7 — Saptāṃśa' },
    { id: 'D2', label: 'D2 — Horā' },
    { id: 'D3', label: 'D3 — Drekkāṇa' },
    { id: 'D4', label: 'D4 — Caturthāṃśa' },
    { id: 'D12', label: 'D12 — Dvādaśāṃśa' },
    { id: 'D16', label: 'D16 — Ṣoḍaśāṃśa' },
    { id: 'D20', label: 'D20 — Viṃśāṃśa' },
    { id: 'D24', label: 'D24 — Caturviṃśāṃśa' },
    { id: 'D27', label: 'D27 — Saptaviṃśāṃśa' },
    { id: 'D30', label: 'D30 — Triṃśāṃśa' },
    { id: 'D60', label: 'D60 — Ṣaṣṭyāṃśa' },
  ];

  // Helper: map bhava number 1..12 to list of grahas
  const getGrahasInBhava = (bhavaNum: number) => {
    return chartData.grahas.filter(g => g.bhava === bhavaNum);
  };

  // Helper: get Rashi index for Bhava (1..12)
  const getRashiForBhava = (bhavaNum: number) => {
    return (chartData.lagnaRashiIdx + (bhavaNum - 1)) % 12;
  };

  // Full Indian Jyotish planet name (Surya, Chandra, Mangala, Budha, Guru, Shukra, Shani, Rahu, Ketu)
  const getGrahaFullName = (g: { name: string; isRetrograde?: boolean; isCombust?: boolean }) => {
    let s = g.name;
    if (g.isRetrograde) s += ' (R)';
    if (g.isCombust) s += ' (C)';
    return s;
  };

  const getGrahaAbbr = (g: { id: number; name: string }) => {
    const map: Record<number, string> = {
      0: 'Su', 1: 'Ch', 2: 'Ma', 3: 'Bu', 4: 'Gu', 5: 'Sk', 6: 'Sa', 7: 'Ra', 8: 'Ke', 12: 'Md'
    };
    return map[g.id] || g.name.slice(0, 2);
  };

  // Birth Time & Date Handlers
  const hours = birthDateTime.getHours();
  const minutes = birthDateTime.getMinutes();
  const seconds = birthDateTime.getSeconds();

  const yyyy = birthDateTime.getFullYear();
  const mm = (birthDateTime.getMonth() + 1).toString().padStart(2, '0');
  const dd = birthDateTime.getDate().toString().padStart(2, '0');
  const dateInputVal = `${yyyy}-${mm}-${dd}`;

  const updateBirthTime = (newH: number, newM: number, newS: number) => {
    const d = new Date(birthDateTime);
    d.setHours(newH, newM, newS);
    setBirthDateTime(d);
  };

  const updateBirthDate = (isoStr: string) => {
    if (!isoStr) return;
    const [y, m, d] = isoStr.split('-').map(Number);
    const next = new Date(birthDateTime);
    next.setFullYear(y, m - 1, d);
    setBirthDateTime(next);
  };

  const stepMinutes = (delta: number) => {
    setBirthDateTime(new Date(birthDateTime.getTime() + delta * 60000));
  };

  return (
    <div className="space-y-6">
      {/* Birth Date & Exact Birth Time Configuration Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Left: Birth Jātaka Heading */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-sm text-slate-100">
                  Birth Date & Precise Time (जन्म-समय)
                </h3>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {selectedCity.name} (TZ: +{selectedCity.tz})
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Adjust exact hour, minute, and second of birth to calibrate precise Lagna (Ascendant) and all 12 Bhavas.
              </p>
            </div>
          </div>

          {/* Right: Date & Time Pickers & Stepper Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Input */}
            <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-700/80 px-3 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-amber-400" />
              <input
                type="date"
                value={dateInputVal}
                onChange={(e) => updateBirthDate(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                title="Select Birth Date"
              />
              <span className="text-[11px] text-amber-300 font-mono font-medium hidden sm:inline">
                ({formatDateDDMMYYYY(birthDateTime)})
              </span>
            </div>

            {/* Time (HH:MM:SS) Inputs */}
            <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-700/80 px-3 py-1.5 rounded-xl">
              <Clock className="w-4 h-4 text-amber-400 mr-1" />
              <div className="flex items-center font-mono text-xs font-bold text-slate-200">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours.toString().padStart(2, '0')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateBirthTime(isNaN(val) ? 0 : Math.min(23, Math.max(0, val)), minutes, seconds);
                  }}
                  className="w-7 bg-transparent text-center focus:bg-slate-800 rounded focus:outline-none text-amber-200"
                  title="Birth Hour (00-23)"
                />
                <span className="text-slate-500">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes.toString().padStart(2, '0')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateBirthTime(hours, isNaN(val) ? 0 : Math.min(59, Math.max(0, val)), seconds);
                  }}
                  className="w-7 bg-transparent text-center focus:bg-slate-800 rounded focus:outline-none text-amber-200"
                  title="Birth Minute (00-59)"
                />
                <span className="text-slate-500">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds.toString().padStart(2, '0')}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateBirthTime(hours, minutes, isNaN(val) ? 0 : Math.min(59, Math.max(0, val)));
                  }}
                  className="w-7 bg-transparent text-center focus:bg-slate-800 rounded focus:outline-none text-slate-400"
                  title="Birth Second (00-59)"
                />
              </div>
            </div>

            {/* Steppers & Presets */}
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => stepMinutes(-60)}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
                title="Back 1 hour"
              >
                -1h
              </button>
              <button
                type="button"
                onClick={() => stepMinutes(-10)}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
                title="Back 10 minutes"
              >
                -10m
              </button>
              <button
                type="button"
                onClick={() => stepMinutes(10)}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
                title="Forward 10 minutes"
              >
                +10m
              </button>
              <button
                type="button"
                onClick={() => stepMinutes(60)}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
                title="Forward 1 hour"
              >
                +1h
              </button>
              <button
                type="button"
                onClick={() => setBirthDateTime(new Date())}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors font-semibold text-[11px]"
                title="Reset to current live time"
              >
                Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Header Toolbar: Chart Style, Varga Selector, Profile Management */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Varga Select */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">Divisional Chart (Varga):</span>
          <select
            value={selectedVarga}
            onChange={(e) => setSelectedVarga(e.target.value as DivisionalChartId)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 font-semibold focus:outline-none focus:border-amber-500"
          >
            {vargaOptions.map(v => (
              <option key={v.id} value={v.id} className="bg-slate-900 text-slate-100">
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Chart Style (North, South, East) */}
        <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setChartStyle('north')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              chartStyle === 'north' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            North Indian (Diamond)
          </button>
          <button
            onClick={() => setChartStyle('south')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              chartStyle === 'south' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            South Indian (Box)
          </button>
          <button
            onClick={() => setChartStyle('east')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              chartStyle === 'east' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            East Indian
          </button>
        </div>

        {/* Right: Saved Profiles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            Save Kundalī
          </button>

          {savedProfiles.length > 0 && (
            <div className="relative group">
              <button className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                Load ({savedProfiles.length})
              </button>
              <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 hidden group-hover:block z-50">
                {savedProfiles.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleLoadProfile(p)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-amber-200">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.cityName}</div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteProfile(p.id, e)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Chart Visual Surface & Lagna Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart SVG Container */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-2xl flex flex-col items-center justify-center min-h-[460px]">
          <div className="w-full flex items-center justify-between mb-3 text-xs">
            <span className="font-heading font-bold text-amber-300 text-sm">{chartData.chartTitle}</span>
            <span className="text-slate-400">
              Lagna: <strong className="text-slate-200">{RASHIS[chartData.lagnaRashiIdx].en} ({chartData.lagnaDegreeFormatted})</strong>
            </span>
          </div>

          {/* NORTH INDIAN DIAMOND CHART SVG */}
          {chartStyle === 'north' && (
            <svg 
              viewBox="0 0 400 400" 
              className="w-full max-w-[420px] aspect-square text-slate-200 select-none drop-shadow-md"
            >
              {/* Outer boundary */}
              <rect x="10" y="10" width="380" height="380" fill="#0f172a" stroke="#d97706" strokeWidth="2.5" />
              {/* Main Diagonals */}
              <line x1="10" y1="10" x2="390" y2="390" stroke="#d97706" strokeWidth="1.5" />
              <line x1="390" y1="10" x2="10" y2="390" stroke="#d97706" strokeWidth="1.5" />
              {/* Inner Diamond */}
              <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="#d97706" strokeWidth="1.8" />

              {/* HOUSE LABELS & GRAHAS (FULL NAMES) */}
              {/* House 1 (Top Center Diamond) */}
              <text x="200" y="70" textAnchor="middle" className="text-[11px] font-bold fill-amber-400">
                {getRashiForBhava(1) + 1}
              </text>
              <text x="200" y="92" textAnchor="middle" className="text-[10px] font-semibold fill-slate-100">
                {getGrahasInBhava(1).map((g, idx) => (
                  <tspan key={g.id} x="200" dy={idx === 0 ? "0" : "13"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* House 2 (Top Left Triangle) */}
              <text x="125" y="45" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(2) + 1}
              </text>
              <text x="115" y="68" textAnchor="middle" className="text-[9.5px] fill-slate-100">
                {getGrahasInBhava(2).map((g, idx) => (
                  <tspan key={g.id} x="115" dy={idx === 0 ? "0" : "12"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* House 3 (Far Left Top Triangle) */}
              <text x="45" y="125" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(3) + 1}
              </text>
              <text x="68" y="112" textAnchor="middle" className="text-[9.5px] fill-slate-100">
                {getGrahasInBhava(3).map((g, idx) => (
                  <tspan key={g.id} x="68" dy={idx === 0 ? "0" : "12"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* House 4 (Left Diamond) */}
              <text x="80" y="190" textAnchor="middle" className="text-[11px] font-bold fill-amber-400">
                {getRashiForBhava(4) + 1}
              </text>
              <text x="105" y="206" textAnchor="middle" className="text-[10px] font-semibold fill-slate-100">
                {getGrahasInBhava(4).map((g, idx) => (
                  <tspan key={g.id} x="105" dy={idx === 0 ? "0" : "13"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* House 5 (Far Left Bottom Triangle) */}
              <text x="45" y="275" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(5) + 1}
              </text>
              <text x="68" y="295" textAnchor="middle" className="text-[9.5px] fill-slate-100">
                {getGrahasInBhava(5).map((g, idx) => (
                  <tspan key={g.id} x="68" dy={idx === 0 ? "0" : "12"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* House 6 (Bottom Left Triangle) */}
              <text x="125" y="355" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(6) + 1}
              </text>
              <text x="115" y="330" textAnchor="middle" className="text-[9.5px] fill-slate-100">
                {getGrahasInBhava(6).map((g, idx) => (
                  <tspan key={g.id} x="115" dy={idx === 0 ? "0" : "12"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* House 7 (Bottom Center Diamond) */}
              <text x="200" y="330" textAnchor="middle" className="text-[11px] font-bold fill-amber-400">
                {getRashiForBhava(7) + 1}
              </text>
              <text x="200" y="295" textAnchor="middle" className="text-[10px] font-semibold fill-slate-100">
                {getGrahasInBhava(7).map((g, idx) => (
                  <tspan key={g.id} x="200" dy={idx === 0 ? "0" : "13"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* House 8 (Bottom Right Triangle) */}
              <text x="275" y="355" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(8) + 1}
              </text>
              <text x="285" y="330" textAnchor="middle" className="text-[9.5px] fill-slate-100">
                {getGrahasInBhava(8).map((g, idx) => (
                  <tspan key={g.id} x="285" dy={idx === 0 ? "0" : "12"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* House 9 (Far Right Bottom Triangle) */}
              <text x="355" y="275" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(9) + 1}
              </text>
              <text x="330" y="295" textAnchor="middle" className="text-[9.5px] fill-slate-100">
                {getGrahasInBhava(9).map((g, idx) => (
                  <tspan key={g.id} x="330" dy={idx === 0 ? "0" : "12"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* House 10 (Right Diamond) */}
              <text x="320" y="190" textAnchor="middle" className="text-[11px] font-bold fill-amber-400">
                {getRashiForBhava(10) + 1}
              </text>
              <text x="295" y="206" textAnchor="middle" className="text-[10px] font-semibold fill-slate-100">
                {getGrahasInBhava(10).map((g, idx) => (
                  <tspan key={g.id} x="295" dy={idx === 0 ? "0" : "13"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* House 11 (Far Right Top Triangle) */}
              <text x="355" y="125" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(11) + 1}
              </text>
              <text x="330" y="112" textAnchor="middle" className="text-[9.5px] fill-slate-100">
                {getGrahasInBhava(11).map((g, idx) => (
                  <tspan key={g.id} x="330" dy={idx === 0 ? "0" : "12"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* House 12 (Top Right Triangle) */}
              <text x="275" y="45" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(12) + 1}
              </text>
              <text x="285" y="68" textAnchor="middle" className="text-[9.5px] fill-slate-100">
                {getGrahasInBhava(12).map((g, idx) => (
                  <tspan key={g.id} x="285" dy={idx === 0 ? "0" : "12"}>
                    {g.glyph} {getGrahaFullName(g)}
                  </tspan>
                ))}
              </text>

              {/* Center Lagna Indicator */}
              <text x="200" y="204" textAnchor="middle" className="text-[11px] font-bold fill-amber-500/80 uppercase">
                Lagna (ASC)
              </text>
            </svg>
          )}

          {/* SOUTH INDIAN 12-BOX GRID SVG */}
          {chartStyle === 'south' && (
            <svg 
              viewBox="0 0 400 400" 
              className="w-full max-w-[420px] aspect-square text-slate-200 select-none drop-shadow-md"
            >
              {/* Outer boundary */}
              <rect x="10" y="10" width="380" height="380" fill="#0f172a" stroke="#d97706" strokeWidth="2.5" />
              {/* 4x4 Grid lines */}
              <line x1="105" y1="10" x2="105" y2="390" stroke="#d97706" strokeWidth="1.5" />
              <line x1="200" y1="10" x2="200" y2="105" stroke="#d97706" strokeWidth="1.5" />
              <line x1="200" y1="295" x2="200" y2="390" stroke="#d97706" strokeWidth="1.5" />
              <line x1="295" y1="10" x2="295" y2="390" stroke="#d97706" strokeWidth="1.5" />

              <line x1="10" y1="105" x2="390" y2="105" stroke="#d97706" strokeWidth="1.5" />
              <line x1="10" y1="200" x2="105" y2="200" stroke="#d97706" strokeWidth="1.5" />
              <line x1="295" y1="200" x2="390" y2="200" stroke="#d97706" strokeWidth="1.5" />
              <line x1="10" y1="295" x2="390" y2="295" stroke="#d97706" strokeWidth="1.5" />

              {/* Center Box */}
              <rect x="105" y="105" width="190" height="190" fill="#090d16" stroke="#d97706" strokeWidth="1.5" />
              <text x="200" y="195" textAnchor="middle" className="text-sm font-heading font-bold fill-amber-300">
                {chartData.chartTitle}
              </text>
              <text x="200" y="215" textAnchor="middle" className="text-[11px] fill-slate-400">
                South Indian Style
              </text>

              {/* Fixed Rashi boxes in South Indian Chart:
                  Row 1: Meena(11), Mesha(0), Vrishabha(1), Mithuna(2)
                  Row 2: Kumbha(10), [Center], Karka(3)
                  Row 3: Makara(9), [Center], Simha(4)
                  Row 4: Dhanu(8), Vrischika(7), Tula(6), Kanya(5)
              */}
              {[
                { rashi: 11, x: 57, y: 55, name: 'Meena' },
                { rashi: 0, x: 152, y: 55, name: 'Mesha' },
                { rashi: 1, x: 247, y: 55, name: 'Vrishabha' },
                { rashi: 2, x: 342, y: 55, name: 'Mithuna' },
                { rashi: 3, x: 342, y: 150, name: 'Karka' },
                { rashi: 4, x: 342, y: 245, name: 'Simha' },
                { rashi: 5, x: 342, y: 340, name: 'Kanya' },
                { rashi: 6, x: 247, y: 340, name: 'Tula' },
                { rashi: 7, x: 152, y: 340, name: 'Vrischika' },
                { rashi: 8, x: 57, y: 340, name: 'Dhanu' },
                { rashi: 9, x: 57, y: 245, name: 'Makara' },
                { rashi: 10, x: 57, y: 150, name: 'Kumbha' },
              ].map(box => {
                const isLagna = box.rashi === chartData.lagnaRashiIdx;
                const grahasHere = chartData.grahas.filter(g => g.rashiIdx === box.rashi);

                return (
                  <g key={box.rashi}>
                    <text x={box.x} y={box.y - 28} textAnchor="middle" className="text-[10px] fill-amber-400 font-bold uppercase tracking-tight">
                      {box.name}
                    </text>
                    {isLagna && (
                      <text x={box.x} y={box.y - 14} textAnchor="middle" className="text-[10px] font-bold fill-red-400">
                        [ASC]
                      </text>
                    )}
                    <text x={box.x} y={isLagna ? box.y : box.y - 8} textAnchor="middle" className="text-[9.5px] font-medium fill-slate-100">
                      {grahasHere.map((g, idx) => (
                        <tspan key={g.id} x={box.x} dy={idx === 0 ? "0" : "12"}>
                          {g.glyph} {getGrahaFullName(g)}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* EAST INDIAN CHART SVG */}
          {chartStyle === 'east' && (
            <svg 
              viewBox="0 0 400 400" 
              className="w-full max-w-[420px] aspect-square text-slate-200 select-none drop-shadow-md"
            >
              {/* Outer boundary */}
              <rect x="10" y="10" width="380" height="380" fill="#0f172a" stroke="#d97706" strokeWidth="2.5" />
              {/* Main Diagonals */}
              <line x1="10" y1="10" x2="390" y2="390" stroke="#d97706" strokeWidth="1.5" />
              <line x1="390" y1="10" x2="10" y2="390" stroke="#d97706" strokeWidth="1.5" />
              {/* Inner Diamond */}
              <polygon points="200,10 390,200 200,390 10,200" fill="none" stroke="#d97706" strokeWidth="1.8" />

              {/* Center Emblem */}
              <circle cx="200" cy="200" r="16" fill="#090d16" stroke="#d97706" strokeWidth="1.2" />
              <text x="200" y="204" textAnchor="middle" className="text-[9px] font-heading font-bold fill-amber-300">
                East
              </text>

              {/* Fixed 12 Rashi compartments in East Indian (anti-clockwise from top diamond):
                  1: Mesha (0) - Top diamond (200, 100)
                  2: Vrishabha (1) - Top-left upper triangle (110, 48)
                  3: Mithuna (2) - Top-left lower triangle (52, 105)
                  4: Karka (3) - Left diamond (105, 200)
                  5: Simha (4) - Bottom-left upper triangle (52, 295)
                  6: Kanya (5) - Bottom-left lower triangle (110, 350)
                  7: Tula (6) - Bottom diamond (200, 295)
                  8: Vrischika (7) - Bottom-right lower triangle (290, 350)
                  9: Dhanu (8) - Bottom-right upper triangle (348, 295)
                  10: Makara (9) - Right diamond (295, 200)
                  11: Kumbha (10) - Top-right lower triangle (348, 105)
                  12: Meena (11) - Top-right upper triangle (290, 48)
              */}
              {[
                { rashi: 0, x: 200, y: 100, name: 'Mesha' },
                { rashi: 1, x: 110, y: 48, name: 'Vrishabha' },
                { rashi: 2, x: 52, y: 105, name: 'Mithuna' },
                { rashi: 3, x: 105, y: 200, name: 'Karka' },
                { rashi: 4, x: 52, y: 295, name: 'Simha' },
                { rashi: 5, x: 110, y: 350, name: 'Kanya' },
                { rashi: 6, x: 200, y: 295, name: 'Tula' },
                { rashi: 7, x: 290, y: 350, name: 'Vrischika' },
                { rashi: 8, x: 348, y: 295, name: 'Dhanu' },
                { rashi: 9, x: 295, y: 200, name: 'Makara' },
                { rashi: 10, x: 348, y: 105, name: 'Kumbha' },
                { rashi: 11, x: 290, y: 48, name: 'Meena' },
              ].map(box => {
                const isLagna = box.rashi === chartData.lagnaRashiIdx;
                const grahasHere = chartData.grahas.filter(g => g.rashiIdx === box.rashi);

                return (
                  <g key={box.rashi}>
                    <text x={box.x} y={box.y - 20} textAnchor="middle" className="text-[10px] fill-amber-400 font-bold">
                      {box.name}
                    </text>
                    {isLagna && (
                      <text x={box.x} y={box.y - 8} textAnchor="middle" className="text-[10px] font-bold fill-red-400">
                        [ASC]
                      </text>
                    )}
                    <text x={box.x} y={isLagna ? box.y + 6 : box.y - 4} textAnchor="middle" className="text-[9.5px] font-medium fill-slate-100">
                      {grahasHere.map((g, idx) => (
                        <tspan key={g.id} x={box.x} dy={idx === 0 ? "0" : "12"}>
                          {g.glyph} {getGrahaFullName(g)}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Right: Ghataka Chakra & Quick Astro Indicators */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Ghataka Chakra */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Ghaṭaka Cakra (Inauspicious Factors)</span>
            </div>
            <div className="text-xs text-slate-300 mb-3 leading-relaxed">
              Based on Janma Candra in <strong className="text-amber-200">{RASHIS[moonRashi].en}</strong>. Classical Jyotiṣa cautions against initiating crucial ventures when these lunar status elements coincide:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Ghat Month</span>
                <span className="font-semibold text-slate-100">{ghataka.rashi}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Ghat Tithis</span>
                <span className="font-semibold text-rose-300">{ghataka.tithis}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Ghat Weekday</span>
                <span className="font-semibold text-rose-300">{ghataka.vaara}</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Ghat Star</span>
                <span className="font-semibold text-rose-300">{ghataka.nakshatra}</span>
              </div>
            </div>
          </div>

          {/* Lagna & Planetary Dignity Summary */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl text-xs space-y-2">
            <div className="font-heading font-bold text-slate-100 text-sm mb-1">
              Ascendant (Lagna) Dignity
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Rising Sign (Lagna):</span>
              <span className="font-semibold text-amber-200">
                {RASHIS[chartData.lagnaRashiIdx].en} ({RASHIS[chartData.lagnaRashiIdx].iast})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Degree:</span>
              <span className="font-mono text-slate-200">{chartData.lagnaDegreeFormatted}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Constellation:</span>
              <span className="text-slate-200">{chartData.lagnaNakshatra} (Pāda {chartData.lagnaPada})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Lagna Lord:</span>
              <span className="font-semibold text-slate-200">{RASHIS[chartData.lagnaRashiIdx].lord}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Graha Planetary Table with Dignities & Jaimini Karakas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <h3 className="font-heading font-semibold text-sm text-slate-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Graha Ephemeris & Dignity Positions ({selectedVarga})</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {chartData.grahas.length} Planetary Bodies Evaluated
          </span>
        </div>

        <table className="w-full text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Graha</th>
              <th className="py-2.5 px-3">Zodiac Sign (Rāśi)</th>
              <th className="py-2.5 px-3">Degree</th>
              <th className="py-2.5 px-3">Bhāva</th>
              <th className="py-2.5 px-3">Nakṣatra & Pāda</th>
              <th className="py-2.5 px-3">Dignity / Status</th>
              <th className="py-2.5 px-3">Jaimini Kāraka</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {chartData.grahas.map((g) => (
              <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold">
                    {g.glyph}
                  </span>
                  <span>{g.name}</span>
                  {g.isRetrograde && (
                    <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded font-bold" title="Vakri (Retrograde)">
                      R
                    </span>
                  )}
                  {g.isCombust && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold" title="Asta (Combust)">
                      C
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-slate-200">
                  {g.rashiName} ({RASHIS[g.rashiIdx].glyph})
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-300">{g.degreeFormatted}</td>
                <td className="py-2.5 px-3 font-semibold text-amber-300">Bhāva {g.bhava}</td>
                <td className="py-2.5 px-3 text-slate-300">
                  {g.nakshatraName} <span className="text-slate-500">(P{g.pada})</span>
                </td>
                <td className="py-2.5 px-3">
                  <span 
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block"
                    style={{ backgroundColor: `${g.dignityColor}20`, color: g.dignityColor }}
                  >
                    {g.dignity}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-300">
                  {g.charaKaraka ? (
                    <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[11px] text-amber-200 border border-slate-700">
                      {g.charaKaraka}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Graha Maitrī Cakra (Natural & Panchadha Planetary Relationships) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-heading font-semibold text-sm text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Graha Maitrī Cakra (Planetary Friendship & Enmity Matrix)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Based on classical Bṛhat Parāśara Horā Śāstra (BPHS Ch. 3) — Naisargika (Natural) & Pañcadhā Maitrī (5-fold Compound).
            </p>
          </div>
          <div className="text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg">
            Guru & Shukra = Classical Enemies (Śatru)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Graha</th>
                <th className="py-2.5 px-3">Naisargika Mitra (Friends)</th>
                <th className="py-2.5 px-3">Naisargika Śatru (Enemies)</th>
                <th className="py-2.5 px-3">Naisargika Sama (Neutrals)</th>
                <th className="py-2.5 px-3">Tātkālika Mitra (in this Chart)</th>
                <th className="py-2.5 px-3">Guru & Śukra Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {GRAHAS.slice(0, 9).map((g) => {
                const rel = NATURAL_FRIENDS[g.id];
                if (!rel) return null;

                const friends = rel.friends.map(id => GRAHAS.find(gr => gr.id === id)?.en || id).join(', ');
                const enemies = rel.enemies.map(id => GRAHAS.find(gr => gr.id === id)?.en || id).join(', ');
                const neutrals = rel.neutrals.map(id => GRAHAS.find(gr => gr.id === id)?.en || id).join(', ');

                // Current chart resident rashi for this graha
                const thisGrahaPos = chartData.grahas.find(gr => gr.id === g.id);
                const thisRashi = thisGrahaPos?.rashiIdx;

                // Compute temporary friends in this chart
                const tempFriendsList = GRAHAS.slice(0, 9)
                  .filter(other => other.id !== g.id)
                  .filter(other => {
                    const otherPos = chartData.grahas.find(gr => gr.id === other.id);
                    if (thisRashi === undefined || otherPos?.rashiIdx === undefined) return false;
                    const dist = (otherPos.rashiIdx - thisRashi + 12) % 12;
                    return [1, 2, 3, 9, 10, 11].includes(dist);
                  })
                  .map(other => other.en);

                // Guru & Shukra relationship callout
                let guruShukraNote = '—';
                if (g.id === 4) {
                  // Guru
                  guruShukraNote = 'Considers Shukra an Enemy (Śatru)';
                } else if (g.id === 5) {
                  // Shukra
                  guruShukraNote = 'Considers Guru an Enemy (Śatru)';
                }

                return (
                  <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold">
                        {g.glyph}
                      </span>
                      <span>{g.en}</span>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-300 font-medium">{friends || 'None'}</td>
                    <td className="py-2.5 px-3 text-rose-300 font-medium">{enemies || 'None'}</td>
                    <td className="py-2.5 px-3 text-slate-400">{neutrals || 'None'}</td>
                    <td className="py-2.5 px-3 text-blue-300">{tempFriendsList.join(', ') || 'None'}</td>
                    <td className="py-2.5 px-3">
                      {guruShukraNote !== '—' ? (
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                          {guruShukraNote}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Kundali Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="font-heading font-bold text-base text-slate-100 mb-2">Save Kundalī Chart</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter a name for this profile (e.g. My Chart, Person Name) to reload instantly from browser storage.
            </p>
            <input
              type="text"
              value={profileNameInput}
              onChange={(e) => setProfileNameInput(e.target.value)}
              placeholder="Profile name..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
