import React from 'react';
import { 
  Sun, 
  Moon, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  CalendarDays,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Language, PanchangaDay } from '../types/kalayantra';
import { formatCityTime } from '../engine/astronomy';

interface PanchangaViewProps {
  panchanga: PanchangaDay;
  language: Language;
}

export const PanchangaView: React.FC<PanchangaViewProps> = ({ panchanga, language }) => {
  const { 
    tithi, 
    nakshatra, 
    yoga, 
    karana, 
    vaara, 
    solar, 
    sunMoon, 
    traditionalTime, 
    festivals, 
    city,
    ayanamshaMode,
    ayanamshaValue,
    mode 
  } = panchanga;

  const formatTime = (d?: Date | null) => {
    return formatCityTime(d, city.tz, true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner: Vedic Year, Month & Traditional Clock */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-amber-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/40">
                {panchanga.lunarMonth} Māsa
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                {tithi.paksha} Pakṣa
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                {solar.ayana}
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                {solar.ritu}
              </span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-amber-100 flex items-center gap-2">
              <span>{panchanga.lunarMonth} {tithi.name}</span>
              <span className="text-sm font-normal text-slate-400">({solar.sauraMasa}, Day {solar.dayOfMonth})</span>
            </h2>

            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Śaka: <strong className="text-slate-200">{solar.shakaYear} ({solar.samvatsara})</strong></span>
              <span>•</span>
              <span>Vikrama Saṃvat: <strong className="text-slate-200">{solar.vikramaSamvat}</strong></span>
              <span>•</span>
              <span>Ayanāṃśa: <strong className="text-amber-300">{ayanamshaMode} ({ayanamshaValue.toFixed(4)}°)</strong></span>
            </div>
          </div>

          {/* Traditional Ghatika & Prahara Clock Box */}
          <div className="bg-slate-950/70 border border-amber-500/20 rounded-xl p-3 sm:px-4 flex items-center gap-4 min-w-[240px]">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Traditional Vedic Time</div>
              <div className="font-mono text-base font-bold text-amber-200">
                {traditionalTime.ghadiString}
              </div>
              <div className="text-[11px] text-slate-400">
                Prahara {traditionalTime.prahara} of 4 ({traditionalTime.isDay ? 'Dina' : 'Rātri'}) • {traditionalTime.dinamanaGhadis}g Day
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Festivals & Observances */}
      {festivals.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Festivals & Dharmaśāstra Observances</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {festivals.map((fest) => (
              <div 
                key={fest.id}
                className="bg-slate-900/90 border rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-md"
                style={{ borderColor: `${fest.color}40` }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: fest.color }}
                    />
                    <h3 className="font-heading font-bold text-sm text-slate-100">{fest.name}</h3>
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase"
                      style={{ backgroundColor: `${fest.color}20`, color: fest.color }}
                    >
                      {fest.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{fest.description}</p>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="font-semibold text-amber-400/90">Rule:</span>
                    <span>{fest.rule}</span>
                  </div>
                  {fest.paranaTime && (
                    <div className="mt-1 text-[11px] text-blue-300 font-medium">
                      Pāraṇa: {fest.paranaTime}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. The Five Core Limbs (Pañca-Aṅga) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400">
          <span>Five Limbs of the Day (Pañcāṅga)</span>
          <span className="text-slate-400 font-normal lowercase">
            {mode === 'udaya' ? 'calculated at sunrise' : 'real-time current'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Tithi */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-colors flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">1. Tithi (Lunar Day)</span>
                <span className="text-[11px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                  {tithi.paksha} {tithi.tithiInPaksha}
                </span>
              </div>
              <div className="font-heading text-lg font-bold text-slate-100 mt-1">
                {tithi.name}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Deity: <strong className="text-slate-200">{tithi.deity}</strong>
              </div>
              <div className="text-xs text-slate-400">
                Nature: <span className="text-amber-300">{tithi.nature}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Ends:</span>
                <span className="text-slate-200 font-mono font-medium">{formatTime(tithi.endTime)}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${tithi.percentElapsed || 50}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Nakshatra */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-colors flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">2. Nakṣatra (Star)</span>
                <span className="text-[11px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                  Pāda {nakshatra.pada}
                </span>
              </div>
              <div className="font-heading text-lg font-bold text-slate-100 mt-1">
                {nakshatra.name}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Lord: <strong className="text-slate-200">{nakshatra.lord}</strong>
              </div>
              <div className="text-xs text-slate-400">
                Deity: <span className="text-slate-200">{nakshatra.deity}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {nakshatra.gana} • {nakshatra.nadi} • {nakshatra.yoni}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Ends:</span>
                <span className="text-slate-200 font-mono font-medium">{formatTime(nakshatra.endTime)}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${nakshatra.percentElapsed || 50}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Yoga */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-colors flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">3. Yoga (Lunisolar)</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                  yoga.isAuspicious ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {yoga.isAuspicious ? 'Śubha' : 'Aśubha'}
                </span>
              </div>
              <div className="font-heading text-lg font-bold text-slate-100 mt-1">
                {yoga.name}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Nature: <span className={yoga.isAuspicious ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>
                  {yoga.isAuspicious ? 'Auspicious' : 'Inauspicious'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Ends:</span>
                <span className="text-slate-200 font-mono font-medium">{formatTime(yoga.endTime)}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${yoga.percentElapsed || 50}%` }}
                />
              </div>
            </div>
          </div>

          {/* 4. Karana */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-colors flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">4. Karaṇa (Half Tithi)</span>
                <span className="text-[11px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                  {karana.isFixed ? 'Fixed' : 'Movable'}
                </span>
              </div>
              <div className="font-heading text-lg font-bold text-slate-100 mt-1 flex items-center gap-1.5">
                <span>{karana.name}</span>
                {karana.isBhadra && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1 rounded border border-rose-500/40" title="Vishti is Bhadra (Inauspicious for auspicious commencements)">
                    Bhadrā
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Classification: <span className="text-slate-200">{karana.isFixed ? 'Sthira (Fixed)' : 'Cara (Movable)'}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Ends:</span>
                <span className="text-slate-200 font-mono font-medium">{formatTime(karana.endTime)}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${karana.percentElapsed || 50}%` }}
                />
              </div>
            </div>
          </div>

          {/* 5. Vaara */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-colors flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold uppercase tracking-wider">5. Vāra (Weekday)</span>
                <span className="text-[11px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                  Day {vaara.idx + 1}/7
                </span>
              </div>
              <div className="font-heading text-lg font-bold text-slate-100 mt-1">
                {vaara.name}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Ruling Planet: <strong className="text-amber-300">{vaara.lord}</strong>
              </div>
              <div className="text-xs text-slate-400">
                Presiding Lord: <span className="text-slate-200">{vaara.deity}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              Starts at Sunrise ({formatTime(sunMoon.sunrise)})
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sun & Moon Celestial Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sun Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <h3 className="font-heading font-semibold text-sm text-slate-200">Sūrya (Solar Horizon)</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Day Span: {Math.floor(sunMoon.dayLengthMinutes / 60)}h {Math.round(sunMoon.dayLengthMinutes % 60)}m
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Sunrise (Udaya)</div>
              <div className="text-base font-bold text-amber-300 font-mono mt-0.5">{formatTime(sunMoon.sunrise)}</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Madhyāhna (Noon)</div>
              <div className="text-base font-bold text-amber-300 font-mono mt-0.5">{formatTime(sunMoon.noon)}</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Sunset (Asta)</div>
              <div className="text-base font-bold text-amber-300 font-mono mt-0.5">{formatTime(sunMoon.sunset)}</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Aruṇodaya</div>
              <div className="text-base font-bold text-amber-300 font-mono mt-0.5">{formatTime(sunMoon.dawn)}</div>
            </div>
          </div>
        </div>

        {/* Moon Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-blue-400" />
              <h3 className="font-heading font-semibold text-sm text-slate-200">Candra (Lunar Horizon)</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Illumination: <strong className="text-blue-300">{sunMoon.moonIlluminationPercent}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Moonrise</div>
              <div className="text-base font-bold text-blue-300 font-mono mt-0.5">{formatTime(sunMoon.moonrise)}</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Moonset</div>
              <div className="text-base font-bold text-blue-300 font-mono mt-0.5">{formatTime(sunMoon.moonset)}</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Niśītha (Midnight)</div>
              <div className="text-base font-bold text-blue-300 font-mono mt-0.5">{formatTime(sunMoon.midnight)}</div>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
              <div className="text-slate-400 text-[10px] uppercase font-semibold">Moon Phase</div>
              <div className="text-xs font-semibold text-blue-200 truncate mt-1">{sunMoon.moonPhase}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
