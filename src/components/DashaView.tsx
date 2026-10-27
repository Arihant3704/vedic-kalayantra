import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  Sparkles, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { calculateVimshottariTree } from '../engine/dasha';
import { DashaNode } from '../types/kalayantra';

interface DashaViewProps {
  birthDate: Date;
  moonLongitude: number;
  currentDate: Date;
}

export const DashaView: React.FC<DashaViewProps> = ({
  birthDate,
  moonLongitude,
  currentDate,
}) => {
  const dashaData = useMemo(() => {
    return calculateVimshottariTree(birthDate, moonLongitude, currentDate);
  }, [birthDate, moonLongitude, currentDate]);

  const [expandedMaha, setExpandedMaha] = useState<string | null>(dashaData.currentMahaDasha);
  const [expandedAntar, setExpandedAntar] = useState<string | null>(dashaData.currentAntarDasha);

  const formatDate = (d: Date) => {
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const toggleMaha = (lord: string) => {
    setExpandedMaha(prev => prev === lord ? null : lord);
  };

  const toggleAntar = (lordKey: string) => {
    setExpandedAntar(prev => prev === lordKey ? null : lordKey);
  };

  return (
    <div className="space-y-6">
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
              {formatDate(currentDate)}
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
