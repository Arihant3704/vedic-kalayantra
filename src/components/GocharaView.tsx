import React, { useMemo } from 'react';
import { 
  Share2, 
  CheckCircle, 
  AlertTriangle, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { CityInfo, AyanamshaMode, KundaliChartData } from '../types/kalayantra';
import { calculateGochara } from '../engine/gochara';
import { calculateKundali } from '../engine/kundali';
import { RASHIS } from '../engine/kosha';

interface GocharaViewProps {
  currentDate: Date;
  selectedCity: CityInfo;
  ayanamsha: AyanamshaMode;
  natalMoonRashi?: number;
  natalLagnaRashi?: number;
}

export const GocharaView: React.FC<GocharaViewProps> = ({
  currentDate,
  selectedCity,
  ayanamsha,
  natalMoonRashi: propMoonRashi,
  natalLagnaRashi: propLagnaRashi,
}) => {
  const transitChart: KundaliChartData = useMemo(() => {
    return calculateKundali(currentDate, selectedCity, 'D1', ayanamsha);
  }, [currentDate, selectedCity, ayanamsha]);

  const moonRashi = propMoonRashi !== undefined ? propMoonRashi : transitChart.grahas.find(g => g.id === 1)?.rashiIdx ?? 0;
  const lagnaRashi = propLagnaRashi !== undefined ? propLagnaRashi : transitChart.lagnaRashiIdx;

  const gocharaResult = useMemo(() => {
    return calculateGochara(moonRashi, lagnaRashi, transitChart.grahas);
  }, [moonRashi, lagnaRashi, transitChart]);

  const { sadeSati, ashtamaShani, kantakaShani, guruBenefic, grahas } = gocharaResult;

  return (
    <div className="space-y-6">
      {/* 1. Sade Sati & Special Transits Hero */}
      <div className={`rounded-2xl p-5 border shadow-xl relative overflow-hidden ${
        sadeSati.isActive 
          ? 'bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border-rose-500/40' 
          : 'bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border-emerald-500/40'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                sadeSati.isActive 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {sadeSati.isActive ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {sadeSati.isActive ? `Sāḍhe Sātī Active: ${sadeSati.phase}` : 'No Active Sāḍhe Sātī'}
              </span>
              <span className="text-xs text-slate-400">
                Natal Moon in <strong className="text-slate-200">{RASHIS[moonRashi].en}</strong>
              </span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-100">
              {sadeSati.isActive ? `Śani Sāḍhe Sātī — ${sadeSati.phase}` : 'Saturn Transit in Auspicious / Neutral House'}
            </h2>

            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {sadeSati.description}
            </p>

            <div className="mt-3 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-slate-300 inline-block">
              <span className="text-amber-400 font-semibold">Classical Remedy: </span>
              {sadeSati.remedy}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 min-w-[200px]">
            <div className={`p-2.5 rounded-xl border text-xs ${
              ashtamaShani 
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-200' 
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="font-bold">Aṣṭama Śani (8th House)</div>
              <div className="text-[11px]">{ashtamaShani ? 'Active Challenge' : 'Not Active'}</div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs ${
              kantakaShani 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' 
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="font-bold">Kaṇṭaka Śani (4th/10th)</div>
              <div className="text-[11px]">{kantakaShani ? 'Active Transit' : 'Not Active'}</div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs ${
              guruBenefic 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' 
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="font-bold">Guru Gocara (Jupiter)</div>
              <div className="text-[11px]">{guruBenefic ? 'Benefic Ingress' : 'Mixed Ingress'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Planetary Transits Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <h3 className="font-heading font-semibold text-sm text-slate-100 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>Real-Time Planetary Transit Influences (Gocara)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Evaluated from Janma Rāśi ({RASHIS[moonRashi].en})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {grahas.map((g) => (
            <div 
              key={g.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                g.isBeneficTransit 
                  ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/50' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
                      {g.glyph}
                    </span>
                    <span>{g.name}</span>
                    {g.isRetrograde && (
                      <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded font-bold">
                        R
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                    g.isBeneficTransit 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {g.isBeneficTransit ? 'Benefic' : 'Mixed'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-medium">
                  Transiting {g.transitRashiName} ({g.degreeFormatted})
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>From Moon: <strong className="text-amber-300">House {g.houseFromMoon}</strong></span>
                  <span>•</span>
                  <span>From Lagna: <strong className="text-slate-200">House {g.houseFromLagna}</strong></span>
                </div>

                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {g.transitEffect}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
