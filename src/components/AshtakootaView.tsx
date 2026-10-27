import React, { useState, useMemo } from 'react';
import { 
  HeartHandshake, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  Info,
  XCircle
} from 'lucide-react';
import { NAKSHATRAS } from '../engine/kosha';
import { calculateAshtakoota } from '../engine/ashtakoota';

export const AshtakootaView: React.FC = () => {
  const [groomNakIdx, setGroomNakIdx] = useState<number>(0); // Ashwini
  const [groomPada, setGroomPada] = useState<number>(1);
  const [brideNakIdx, setBrideNakIdx] = useState<number>(3); // Rohini
  const [bridePada, setBridePada] = useState<number>(2);

  const result = useMemo(() => {
    return calculateAshtakoota(groomNakIdx, groomPada, brideNakIdx, bridePada);
  }, [groomNakIdx, groomPada, brideNakIdx, bridePada]);

  const { totalScore, maxScore, verdict, kootas, doshas, cancellations, recommendation } = result;

  const scorePercent = Math.round((totalScore / maxScore) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Bride & Groom Input Selectors */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <HeartHandshake className="w-4 h-4 text-amber-400" />
          <span>Aṣṭakūṭa 36-Point Compatibility Calculator (Guṇa Milāna)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Groom Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center justify-between">
              <span>Groom (Vara) Birth Star</span>
              <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-normal">
                Rāśi: {result.groomRashi}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-400 text-[10px] uppercase mb-1">Nakṣatra</label>
                <select
                  value={groomNakIdx}
                  onChange={(e) => setGroomNakIdx(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {NAKSHATRAS.map(n => (
                    <option key={`g-${n.idx}`} value={n.idx} className="bg-slate-900 text-slate-100">
                      {n.idx + 1}. {n.en} ({n.lord})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase mb-1">Pāda</label>
                <select
                  value={groomPada}
                  onChange={(e) => setGroomPada(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {[1, 2, 3, 4].map(p => (
                    <option key={`gp-${p}`} value={p} className="bg-slate-900 text-slate-100">
                      Pāda {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bride Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center justify-between">
              <span>Bride (Kanyā) Birth Star</span>
              <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-normal">
                Rāśi: {result.brideRashi}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-400 text-[10px] uppercase mb-1">Nakṣatra</label>
                <select
                  value={brideNakIdx}
                  onChange={(e) => setBrideNakIdx(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {NAKSHATRAS.map(n => (
                    <option key={`b-${n.idx}`} value={n.idx} className="bg-slate-900 text-slate-100">
                      {n.idx + 1}. {n.en} ({n.lord})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase mb-1">Pāda</label>
                <select
                  value={bridePada}
                  onChange={(e) => setBridePada(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {[1, 2, 3, 4].map(p => (
                    <option key={`bp-${p}`} value={p} className="bg-slate-900 text-slate-100">
                      Pāda {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Score Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Big Score Ring */}
          <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-amber-500/60 flex flex-col items-center justify-center shadow-lg shadow-amber-500/10">
            <span className="font-heading text-2xl font-black text-amber-200">{totalScore}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">of 36 Pts</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                verdict === 'Excellent' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                verdict === 'Good' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                verdict === 'Average' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {verdict} Compatibility
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Threshold: 18+ Pts
              </span>
            </div>

            <h3 className="font-heading text-lg font-bold text-slate-100 mt-1">
              Guṇa Milāna Assessment
            </h3>

            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              {recommendation}
            </p>
          </div>
        </div>

        {/* Progress Bar with 18-point threshold marker */}
        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Pass Threshold: 18 / 36</span>
            <span className="text-amber-300 font-bold">{scorePercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all ${
                totalScore >= 28 ? 'bg-emerald-500' : totalScore >= 18 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${scorePercent}%` }}
            />
            {/* 18-point line at 50% */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/60" title="18-point pass threshold" />
          </div>
        </div>
      </div>

      {/* 3. Dosha & Cancellation Alerts */}
      {(doshas.length > 0 || cancellations.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doshas.length > 0 && (
            <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Active Doṣa Flags ({doshas.length})</span>
              </div>
              <ul className="space-y-1 text-xs text-rose-200/90 list-disc list-inside">
                {doshas.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {cancellations.length > 0 && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Classical Doṣa Cancellations ({cancellations.length})</span>
              </div>
              <ul className="space-y-1 text-xs text-emerald-200/90 list-disc list-inside">
                {cancellations.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 4. Eight Kootas Scorecard Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800 text-xs">
          <span className="font-heading font-semibold text-sm text-slate-100">
            Aṣṭakūṭa Detailed Factor Breakdown
          </span>
          <span className="text-slate-400">
            Total 8 Factors (1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 = 36 Pts)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {kootas.map((k) => {
            const isFull = k.obtainedPoints === k.maxPoints;
            const isZero = k.obtainedPoints === 0;

            return (
              <div 
                key={k.koota}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                  k.isCancelled 
                    ? 'bg-slate-950/80 border-emerald-500/40' 
                    : isZero 
                    ? 'bg-slate-950/80 border-rose-500/40' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-heading font-bold text-sm text-slate-100">{k.koota}</span>
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {k.obtainedPoints} / {k.maxPoints} pts
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {k.description}
                  </p>
                </div>

                {k.cancellationReason && (
                  <div className="mt-2 text-[10px] text-emerald-300 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                    ✓ {k.cancellationReason}
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
