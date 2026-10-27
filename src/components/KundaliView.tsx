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
import { RASHIS, GHATAKA_CHAKRA } from '../engine/kosha';

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

  return (
    <div className="space-y-6">
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

              {/* HOUSE LABELS & GRAHAS */}
              {/* House 1 (Top Center Diamond) */}
              <text x="200" y="85" textAnchor="middle" className="text-[11px] font-bold fill-amber-400">
                {getRashiForBhava(1) + 1}
              </text>
              <text x="200" y="115" textAnchor="middle" className="text-[11px] font-semibold fill-slate-100">
                {getGrahasInBhava(1).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* House 2 (Top Left Triangle) */}
              <text x="125" y="45" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(2) + 1}
              </text>
              <text x="110" y="75" textAnchor="middle" className="text-[10px] fill-slate-100">
                {getGrahasInBhava(2).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* House 3 (Far Left Top Triangle) */}
              <text x="45" y="125" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(3) + 1}
              </text>
              <text x="75" y="110" textAnchor="middle" className="text-[10px] fill-slate-100">
                {getGrahasInBhava(3).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* House 4 (Left Diamond) */}
              <text x="85" y="200" textAnchor="middle" className="text-[11px] font-bold fill-amber-400">
                {getRashiForBhava(4) + 1}
              </text>
              <text x="115" y="200" textAnchor="middle" className="text-[11px] font-semibold fill-slate-100">
                {getGrahasInBhava(4).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* House 5 (Far Left Bottom Triangle) */}
              <text x="45" y="275" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(5) + 1}
              </text>
              <text x="75" y="290" textAnchor="middle" className="text-[10px] fill-slate-100">
                {getGrahasInBhava(5).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* House 6 (Bottom Left Triangle) */}
              <text x="125" y="355" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(6) + 1}
              </text>
              <text x="110" y="325" textAnchor="middle" className="text-[10px] fill-slate-100">
                {getGrahasInBhava(6).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* House 7 (Bottom Center Diamond) */}
              <text x="200" y="315" textAnchor="middle" className="text-[11px] font-bold fill-amber-400">
                {getRashiForBhava(7) + 1}
              </text>
              <text x="200" y="285" textAnchor="middle" className="text-[11px] font-semibold fill-slate-100">
                {getGrahasInBhava(7).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* House 8 (Bottom Right Triangle) */}
              <text x="275" y="355" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(8) + 1}
              </text>
              <text x="290" y="325" textAnchor="middle" className="text-[10px] fill-slate-100">
                {getGrahasInBhava(8).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* House 9 (Far Right Bottom Triangle) */}
              <text x="355" y="275" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(9) + 1}
              </text>
              <text x="325" y="290" textAnchor="middle" className="text-[10px] fill-slate-100">
                {getGrahasInBhava(9).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* House 10 (Right Diamond) */}
              <text x="315" y="200" textAnchor="middle" className="text-[11px] font-bold fill-amber-400">
                {getRashiForBhava(10) + 1}
              </text>
              <text x="285" y="200" textAnchor="middle" className="text-[11px] font-semibold fill-slate-100">
                {getGrahasInBhava(10).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* House 11 (Far Right Top Triangle) */}
              <text x="355" y="125" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(11) + 1}
              </text>
              <text x="325" y="110" textAnchor="middle" className="text-[10px] fill-slate-100">
                {getGrahasInBhava(11).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* House 12 (Top Right Triangle) */}
              <text x="275" y="45" textAnchor="middle" className="text-[10px] font-bold fill-amber-400">
                {getRashiForBhava(12) + 1}
              </text>
              <text x="290" y="75" textAnchor="middle" className="text-[10px] fill-slate-100">
                {getGrahasInBhava(12).map(g => `${g.glyph} ${g.name.slice(0, 2)}`).join(' ')}
              </text>

              {/* Center Lagna Indicator */}
              <text x="200" y="205" textAnchor="middle" className="text-[11px] font-bold fill-amber-500/80 uppercase">
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
                  Row 1: Pisces(11), Aries(0), Taurus(1), Gemini(2)
                  Row 2: Aquarius(10), [Center], Cancer(3)
                  Row 3: Capricorn(9), [Center], Leo(4)
                  Row 4: Sagittarius(8), Scorpio(7), Libra(6), Virgo(5)
              */}
              {[
                { rashi: 11, x: 57, y: 55, name: 'Pisces' },
                { rashi: 0, x: 152, y: 55, name: 'Aries' },
                { rashi: 1, x: 247, y: 55, name: 'Taurus' },
                { rashi: 2, x: 342, y: 55, name: 'Gemini' },
                { rashi: 3, x: 342, y: 150, name: 'Cancer' },
                { rashi: 4, x: 342, y: 245, name: 'Leo' },
                { rashi: 5, x: 342, y: 340, name: 'Virgo' },
                { rashi: 6, x: 247, y: 340, name: 'Libra' },
                { rashi: 7, x: 152, y: 340, name: 'Scorpio' },
                { rashi: 8, x: 57, y: 340, name: 'Sagittarius' },
                { rashi: 9, x: 57, y: 245, name: 'Capricorn' },
                { rashi: 10, x: 57, y: 150, name: 'Aquarius' },
              ].map(box => {
                const isLagna = box.rashi === chartData.lagnaRashiIdx;
                const grahasHere = chartData.grahas.filter(g => g.rashiIdx === box.rashi);

                return (
                  <g key={box.rashi}>
                    <text x={box.x} y={box.y - 30} textAnchor="middle" className="text-[9px] fill-amber-500/80 uppercase font-semibold">
                      {box.name.slice(0, 3)}
                    </text>
                    {isLagna && (
                      <text x={box.x} y={box.y - 12} textAnchor="middle" className="text-[10px] font-bold fill-red-400">
                        [ASC]
                      </text>
                    )}
                    <text x={box.x} y={box.y + 12} textAnchor="middle" className="text-[10px] font-medium fill-slate-100">
                      {grahasHere.map(g => g.glyph + ' ' + g.name.slice(0, 2)).join(' ')}
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
              <rect x="10" y="10" width="380" height="380" fill="#0f172a" stroke="#d97706" strokeWidth="2.5" />
              <line x1="10" y1="10" x2="390" y2="390" stroke="#d97706" strokeWidth="1.5" />
              <line x1="390" y1="10" x2="10" y2="390" stroke="#d97706" strokeWidth="1.5" />
              <polygon points="10,200 200,10 390,200 200,390" fill="none" stroke="#d97706" strokeWidth="1.5" />
              <line x1="105" y1="10" x2="105" y2="390" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="295" y1="10" x2="295" y2="390" stroke="#d97706" strokeWidth="1" strokeDasharray="3 3" />
              <text x="200" y="205" textAnchor="middle" className="text-sm font-heading font-bold fill-amber-300">
                {chartData.chartTitle} (East)
              </text>
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
