import React, { useMemo } from 'react';
import { 
  Clock, 
  Sun, 
  Moon, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  AlertTriangle,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { PanchangaDay } from '../types/kalayantra';
import { calculateHoras, calculateChoghadiyas, calculateMuhurtas } from '../engine/muhurta';
import { formatCityTime } from '../engine/astronomy';

interface HoraMuhurtaViewProps {
  panchanga: PanchangaDay;
  currentTime: Date;
  onOpenNotificationCenter?: () => void;
}

export const HoraMuhurtaView: React.FC<HoraMuhurtaViewProps> = ({ 
  panchanga, 
  currentTime,
  onOpenNotificationCenter 
}) => {
  const { sunMoon, vaara, city } = panchanga;

  const horas = useMemo(() => {
    return calculateHoras(currentTime, sunMoon, vaara.idx);
  }, [currentTime, sunMoon, vaara.idx]);

  const choghadiyas = useMemo(() => {
    return calculateChoghadiyas(currentTime, sunMoon, vaara.idx);
  }, [currentTime, sunMoon, vaara.idx]);

  const muhurtas = useMemo(() => {
    return calculateMuhurtas(currentTime, sunMoon, vaara.idx);
  }, [currentTime, sunMoon, vaara.idx]);

  const currentHora = horas.find(h => h.isCurrent);
  const currentChoghadiya = [...choghadiyas.day, ...choghadiyas.night].find(c => c.isCurrent);
  const currentMuhurta = muhurtas.find(m => m.isCurrent);

  const formatT = (d: Date) => formatCityTime(d, city.tz, false);

  const getChogColor = (nature: string) => {
    switch (nature) {
      case 'Amrit':
      case 'Shubh':
      case 'Labh':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Char':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Udveg':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Rog':
      case 'Kaal':
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {onOpenNotificationCenter && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/40 border border-amber-500/30 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-100 flex items-center gap-1.5">
                Local Muhūrta & Choghadiyā Alerts
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Live for {city.name}
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Receive local browser notifications & sacred temple chime alerts before Abhijit, Brahma Muhūrta, and Rāhu Kāla.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenNotificationCenter}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <span>Configure Alerts & Chimes</span>
          </button>
        </div>
      )}

      {/* 1. Live Active Windows Highlight Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Hora */}
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Horā Lord</div>
            <div className="font-heading text-lg font-bold text-amber-200">
              {currentHora?.lord || 'Sun'} Horā
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {currentHora ? `${formatT(currentHora.startTime)} – ${formatT(currentHora.endTime)}` : 'Active'}
            </div>
          </div>
          <span className="absolute top-2 right-2 text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
            Active Now
          </span>
        </div>

        {/* Active Choghadiya */}
        <div className="bg-slate-900/90 border border-blue-500/40 rounded-2xl p-4 shadow-xl flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Choghaḍiyā</div>
            <div className="font-heading text-lg font-bold text-blue-200">
              {currentChoghadiya?.name || 'Amrit'} ({currentChoghadiya?.isAuspicious ? 'Śubha' : 'Aśubha'})
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {currentChoghadiya ? `${formatT(currentChoghadiya.startTime)} – ${formatT(currentChoghadiya.endTime)}` : 'Active'}
            </div>
          </div>
          <span className="absolute top-2 right-2 text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
            Active Now
          </span>
        </div>

        {/* Active Muhurta Alert */}
        <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-4 shadow-xl flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Muhūrta</div>
            <div className="font-heading text-lg font-bold text-purple-200 truncate max-w-[170px]">
              {currentMuhurta?.name || 'Standard Period'}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {currentMuhurta ? `${formatT(currentMuhurta.startTime)} – ${formatT(currentMuhurta.endTime)}` : 'Normal period'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Classical Auspicious & Inauspicious Muhurtas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Classical Vedic Muhūrta Windows</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {muhurtas.map((m) => {
            const isGood = m.type === 'auspicious';
            const isBad = m.type === 'inauspicious';

            return (
              <div 
                key={m.name}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  m.isCurrent
                    ? 'ring-2 ring-amber-400 bg-slate-900/95 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-heading font-bold text-sm text-slate-100">{m.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                      isGood 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : isBad 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {m.type}
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-amber-200">
                    {formatT(m.startTime)} – {formatT(m.endTime)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                {m.isCurrent && (
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping" />
                    Currently in progress
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Choghadiyas (8 Day + 8 Night) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400">
          <span>16 Choghaḍiyā Cycles (Day & Night)</span>
        </div>

        {/* Day Choghadiyas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Day Choghaḍiyā (Dina: Sunrise to Sunset)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {choghadiyas.day.map((c) => (
              <div 
                key={`day-chog-${c.idx}`}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  c.isCurrent ? 'ring-2 ring-amber-400 bg-slate-950 shadow-md' : 'bg-slate-950/60'
                } ${getChogColor(c.nature)}`}
              >
                <div className="font-bold text-xs">{c.name}</div>
                <div className="text-[10px] font-mono opacity-80 mt-1">
                  {formatT(c.startTime)}
                </div>
                <div className="text-[10px] font-mono opacity-80">
                  {formatT(c.endTime)}
                </div>
                {c.isCurrent && (
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-1.5 rounded">
                    Now
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Night Choghadiyas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-xs font-semibold text-slate-200">
            <Moon className="w-4 h-4 text-blue-400" />
            <span>Night Choghaḍiyā (Rātri: Sunset to Next Sunrise)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {choghadiyas.night.map((c) => (
              <div 
                key={`night-chog-${c.idx}`}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  c.isCurrent ? 'ring-2 ring-blue-400 bg-slate-950 shadow-md' : 'bg-slate-950/60'
                } ${getChogColor(c.nature)}`}
              >
                <div className="font-bold text-xs">{c.name}</div>
                <div className="text-[10px] font-mono opacity-80 mt-1">
                  {formatT(c.startTime)}
                </div>
                <div className="text-[10px] font-mono opacity-80">
                  {formatT(c.endTime)}
                </div>
                {c.isCurrent && (
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider bg-blue-500 text-slate-950 px-1.5 rounded">
                    Now
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. 24 Planetary Horas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400">
          <span>24 Planetary Horā Timeline</span>
          <span className="text-slate-400 font-normal lowercase">Chaldean planetary order</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {horas.map((h) => (
              <div 
                key={`hora-${h.idx}`}
                className={`p-2.5 rounded-xl border transition-all ${
                  h.isCurrent 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-400' 
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-400">#{h.idx + 1} {h.isDay ? '☀️' : '🌙'}</span>
                  <span className="font-heading font-bold text-slate-100">{h.lord}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {formatT(h.startTime)} – {formatT(h.endTime)}
                </div>
                {h.isCurrent && (
                  <div className="text-[9px] font-bold text-amber-300 uppercase tracking-wider mt-1">
                    ● Current
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
