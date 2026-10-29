import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Compass, 
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Search,
  Crosshair
} from 'lucide-react';
import { 
  AyanamshaMode, 
  CityInfo, 
  Language, 
  PanchangaMode,
  MonthSystem,
  CalendarSystem
} from '../types/kalayantra';
import { BUILTIN_CITIES } from '../engine/kosha';
import { formatDateDDMMYYYY } from '../engine/astronomy';

interface HeaderControlsProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  selectedCity: CityInfo;
  onCityChange: (city: CityInfo) => void;
  mode: PanchangaMode;
  onModeChange: (mode: PanchangaMode) => void;
  ayanamsha: AyanamshaMode;
  onAyanamshaChange: (ayanamsha: AyanamshaMode) => void;
  monthSystem: MonthSystem;
  onMonthSystemChange: (monthSys: MonthSystem) => void;
  calendarSystem: CalendarSystem;
  onCalendarSystemChange: (calSys: CalendarSystem) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  currentDate,
  onDateChange,
  selectedCity,
  onCityChange,
  mode,
  onModeChange,
  ayanamsha,
  onAyanamshaChange,
  monthSystem,
  onMonthSystemChange,
  calendarSystem,
  onCalendarSystemChange,
  language,
  onLanguageChange,
}) => {
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [customLat, setCustomLat] = useState(selectedCity.lat.toString());
  const [customLon, setCustomLon] = useState(selectedCity.lon.toString());
  const [customTz, setCustomTz] = useState(selectedCity.tz.toString());
  const [customName, setCustomName] = useState(selectedCity.name);

  const filteredCities = BUILTIN_CITIES.filter(c => 
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.stateCountry.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 15);

  const handleStepDay = (delta: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + delta);
    onDateChange(next);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleApplyCustomCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    const tz = parseFloat(customTz);
    if (!isNaN(lat) && !isNaN(lon) && !isNaN(tz)) {
      onCityChange({
        name: customName || 'Custom Location',
        stateCountry: 'User Defined Coordinates',
        lat,
        lon,
        tz,
        alt: 0,
      });
      setShowCityModal(false);
    }
  };

  const handleDetectGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lon = parseFloat(pos.coords.longitude.toFixed(4));
          const tz = -new Date().getTimezoneOffset() / 60;
          onCityChange({
            name: 'My GPS Location',
            stateCountry: 'Current Position',
            lat,
            lon,
            tz,
            alt: Math.round(pos.coords.altitude || 0),
          });
          setShowCityModal(false);
        },
        () => {
          // Fallback gracefully
        }
      );
    }
  };

  const yyyy = currentDate.getFullYear();
  const mm = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const dd = currentDate.getDate().toString().padStart(2, '0');
  const dateInputVal = `${yyyy}-${mm}-${dd}`;

  return (
    <div className="bg-slate-900/90 border-b border-amber-500/20 px-4 py-3 text-sm backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Location & Coordinates */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCityModal(true)}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-amber-500/40 px-3 py-1.5 rounded-lg text-slate-200 transition-colors shadow-sm cursor-pointer"
            title="Change City or Coordinates"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="font-medium text-amber-200">{selectedCity.name}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              ({selectedCity.lat.toFixed(2)}°, {selectedCity.lon.toFixed(2)}° | TZ: +{selectedCity.tz})
            </span>
          </button>
        </div>

        {/* Center: Date Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 p-1 rounded-lg">
          <button
            onClick={() => handleStepDay(-1)}
            className="p-1 text-slate-300 hover:text-amber-300 hover:bg-slate-700 rounded transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={dateInputVal}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split('-').map(Number);
                  const newD = new Date(currentDate);
                  newD.setFullYear(y, m - 1, d);
                  onDateChange(newD);
                }
              }}
              className="bg-transparent text-slate-100 font-medium text-xs focus:outline-none cursor-pointer"
            />
            <span className="text-[11px] text-amber-300 font-mono font-bold hidden sm:inline">
              ({formatDateDDMMYYYY(currentDate)})
            </span>
          </div>

          <button
            onClick={() => handleStepDay(1)}
            className="p-1 text-slate-300 hover:text-amber-300 hover:bg-slate-700 rounded transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="flex items-center gap-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-2 py-1 rounded border border-amber-500/30 transition-colors ml-1 font-medium"
            title="Jump to Today"
          >
            <RotateCcw className="w-3 h-3" />
            Today
          </button>
        </div>

        {/* Right: Calculations Modes, Ayanamsha & Language */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => onModeChange('udaya')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                mode === 'udaya' 
                  ? 'bg-amber-600/90 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Traditional Sunrise-anchored Panchanga (Udaya-vyāpinī)"
            >
              Udaya (Sunrise)
            </button>
            <button
              onClick={() => onModeChange('current')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                mode === 'current' 
                  ? 'bg-amber-600/90 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Real-time prevailing astronomical elements"
            >
              Current
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={ayanamsha}
              onChange={(e) => onAyanamshaChange(e.target.value as AyanamshaMode)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="lahiri" className="bg-slate-900 text-slate-100">Lahiri (Chitra Paksha)</option>
              <option value="krishnamurti" className="bg-slate-900 text-slate-100">Krishnamurti (KP)</option>
              <option value="raman" className="bg-slate-900 text-slate-100">B.V. Raman</option>
              <option value="tropical" className="bg-slate-900 text-slate-100">Tropical (Sayana 0°)</option>
              <option value="true_citra" className="bg-slate-900 text-slate-100">True Chitra</option>
              <option value="fagan_bradley" className="bg-slate-900 text-slate-100">Fagan-Bradley</option>
            </select>
          </div>

          {/* Month Reckoning System: Amavasyanta vs Purnimanta */}
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1" title="Lunar Month Reckoning: Amāvāsyānta (South/West) vs Pūrṇimānta (North)">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Māsa:</span>
            <select
              value={monthSystem}
              onChange={(e) => onMonthSystemChange(e.target.value as MonthSystem)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="amavasyanta" className="bg-slate-900 text-slate-100">Amāvāsyānta (अमावास्यान्त)</option>
              <option value="purnimanta" className="bg-slate-900 text-slate-100">Pūrṇimānta (पूर्णिमान्त)</option>
            </select>
          </div>

          {/* Four Calendrical Systems */}
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1" title="Calendrical Era System: Vikram Samvat, Vikram Kartak, Shalivahana Shaka, Saura">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Era:</span>
            <select
              value={calendarSystem}
              onChange={(e) => onCalendarSystemChange(e.target.value as CalendarSystem)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="vikram_samvat" className="bg-slate-900 text-slate-100">Vikram Samvat (Chaitradi)</option>
              <option value="vikram_kartak" className="bg-slate-900 text-slate-100">Vikram Kartak (Kartikadi)</option>
              <option value="shaka_samvat" className="bg-slate-900 text-slate-100">Shalivahana Shaka</option>
              <option value="saura" className="bg-slate-900 text-slate-100">Saura (Solar / सौर)</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-slate-100">English</option>
              <option value="iast" className="bg-slate-900 text-slate-100">IAST</option>
              <option value="devanagari" className="bg-slate-900 text-slate-100">संस्कृत (देवनागरी)</option>
            </select>
          </div>
        </div>
      </div>

      {/* City & GPS Modal */}
      {showCityModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-semibold text-base text-slate-100">Select City & Geographic Coordinates</h3>
              </div>
              <button 
                onClick={() => setShowCityModal(false)}
                className="text-slate-400 hover:text-slate-100 text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Search over 240+ cities (e.g. Ujjain, Varanasi, London)..."
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={handleDetectGPS}
                  className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  title="Detect current coordinates using device GPS"
                >
                  <Crosshair className="w-4 h-4" />
                  GPS
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Major Cities</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {filteredCities.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        onCityChange(c);
                        setShowCityModal(false);
                      }}
                      className={`text-left p-2 rounded-lg border text-xs transition-colors ${
                        selectedCity.name === c.name
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-200'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{c.stateCountry}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-400 mb-2">Custom Coordinates</div>
                <form onSubmit={handleApplyCustomCoords} className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Latitude (°N)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Longitude (°E)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={customLon}
                      onChange={(e) => setCustomLon(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Timezone (UTC)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={customTz}
                      onChange={(e) => setCustomTz(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-4 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCityModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md"
                    >
                      Apply Coordinates
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
