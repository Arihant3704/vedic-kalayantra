import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Clock, 
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { CityInfo, AyanamshaMode, KundaliChartData } from '../types/kalayantra';
import { calculateKundali } from '../engine/kundali';
import { analyzeChart, answerQuestion, analyzeBirthTimeSensitivity } from '../engine/bodha';

interface KalaBodhaViewProps {
  currentDate: Date;
  selectedCity: CityInfo;
  ayanamsha: AyanamshaMode;
}

export const KalaBodhaView: React.FC<KalaBodhaViewProps> = ({
  currentDate,
  selectedCity,
  ayanamsha,
}) => {
  const [questionInput, setQuestionInput] = useState('');
  const [qnaHistory, setQnaHistory] = useState<{ q: string; a: string }[]>([]);

  const chartData: KundaliChartData = useMemo(() => {
    return calculateKundali(currentDate, selectedCity, 'D1', ayanamsha);
  }, [currentDate, selectedCity, ayanamsha]);

  const bodha = useMemo(() => {
    return analyzeChart(chartData);
  }, [chartData]);

  const sensitivity = useMemo(() => {
    return analyzeBirthTimeSensitivity(currentDate, selectedCity, 'D1');
  }, [currentDate, selectedCity]);

  const handleAsk = (queryText?: string) => {
    const q = queryText || questionInput;
    if (!q.trim()) return;
    const ans = answerQuestion(q, chartData, bodha);
    setQnaHistory(prev => [{ q, a: ans }, ...prev]);
    if (!queryText) setQuestionInput('');
  };

  const sampleQuestions = [
    'Where is Shani?',
    'Is Guru strong?',
    'Which yogas are present?',
    'What does Mangala aspect?',
    'Analyze the Lagna',
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            KālaBodha & KālaMedhā Reasoning Graph
          </span>
          <span className="text-xs text-slate-400">
            Explainable Jyotiṣa Intelligence & Shastra Citations
          </span>
        </div>

        <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-100">
          Structured Evidence Graph & Explainable Reading
        </h2>

        <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
          {bodha.summaryNarrative}
        </p>
      </div>

      {/* 2. Interactive Natural-Language Q&A Workbench */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
          <div className="font-heading font-semibold text-sm text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>KālaMedhā Conversational Chart Query</span>
          </div>
          <span className="text-slate-400 font-mono">100% Offline Rule Solver</span>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Ask anything about this chart (e.g. 'Where is Shani?', 'Is Guru strong?', 'Yogas?')..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
          />
          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Ask
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-400">Suggestions:</span>
          {sampleQuestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(s)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {qnaHistory.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-800 max-h-60 overflow-y-auto pr-1">
            {qnaHistory.map((item, idx) => (
              <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <span>Q:</span> {item.q}
                </div>
                <div className="text-slate-200 leading-relaxed pl-3 border-l-2 border-amber-500/40">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Classical 13-Yoga Evidence Graph */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
          <div className="font-heading font-semibold text-sm text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Classical Planetary Yogas ({bodha.yogas.length})</span>
          </div>
          <span className="text-slate-400 font-mono">Evidence Graph Model</span>
        </div>

        {bodha.yogas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bodha.yogas.map((yoga) => (
              <div 
                key={yoga.id}
                className="bg-slate-950/60 border border-amber-500/20 hover:border-amber-500/40 rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-bold text-sm text-amber-200">{yoga.name}</h3>
                    <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-semibold border border-amber-500/30 uppercase">
                      {yoga.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {yoga.description}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <strong className="text-slate-300">Factors:</strong> {yoga.factors.join(', ')}
                    </div>
                    <div>
                      <strong className="text-amber-400/90">Rule:</strong> {yoga.rule}
                    </div>
                    <div className="text-[10px] text-slate-500 italic">
                      Source: {yoga.sourceText}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            No major classical yogas detected under strict classical criteria for this chart.
          </div>
        )}
      </div>

      {/* 4. Explainable Planetary Strength Rankings */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
          <div className="font-heading font-semibold text-sm text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Explainable Planetary Strength Rankings</span>
          </div>
          <span className="text-slate-400 font-mono">Ranked by Positional & Directional Bala</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bodha.strengths.map((s) => (
            <div 
              key={s.graha}
              className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-300 flex items-center justify-center font-bold text-xs">
                      #{s.rank}
                    </span>
                    <span className="font-heading font-bold text-sm text-slate-100">{s.graha}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    s.status === 'Strong' ? 'bg-emerald-500/20 text-emerald-300' :
                    s.status === 'Moderate' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {s.score}/100 ({s.status})
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full ${
                      s.status === 'Strong' ? 'bg-emerald-500' : s.status === 'Moderate' ? 'bg-blue-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>

                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  {s.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Birth-Time Uncertainty & Sensitivity Analyzer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
          <div className="font-heading font-semibold text-sm text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Birth-Time Sensitivity & Uncertainty Report</span>
          </div>
          <span className="text-slate-400 font-mono">Assessing ±5m, ±15m, ±30m boundary shifts</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Because birth times recorded on hospital certificates often have a ±5 to 15-minute margin of uncertainty, this tool evaluates whether the Ascendant (D1 Lagna) or Navāṃśa (D9 Lagna) shift signs within that window.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2 px-3">Time Shift</th>
                <th className="py-2 px-3">D1 Lagna Sign</th>
                <th className="py-2 px-3">D9 Navāṃśa Sign</th>
                <th className="py-2 px-3">Stability Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="bg-amber-500/10 font-semibold">
                <td className="py-2 px-3 text-amber-300">0 min (Recorded)</td>
                <td className="py-2 px-3 text-slate-100">{sensitivity.baseLagna}</td>
                <td className="py-2 px-3 text-slate-100">{sensitivity.baseNavamsha}</td>
                <td className="py-2 px-3 text-emerald-400">Baseline</td>
              </tr>
              {sensitivity.shifts.map((s, idx) => {
                const shifted = s.hasLagnaShift || s.hasNavamshaShift;
                return (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-slate-300">
                      {s.offsetMinutes > 0 ? `+${s.offsetMinutes}` : s.offsetMinutes} mins
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      {s.lagnaRashi} {s.hasLagnaShift && <span className="text-rose-400 font-bold ml-1">(Shift)</span>}
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      {s.navamshaRashi} {s.hasNavamshaShift && <span className="text-amber-400 font-bold ml-1">(Shift)</span>}
                    </td>
                    <td className="py-2 px-3">
                      {shifted ? (
                        <span className="text-amber-400 font-sans text-[11px]">Sensitive boundary</span>
                      ) : (
                        <span className="text-emerald-400 font-sans text-[11px]">Stable (Identical)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
