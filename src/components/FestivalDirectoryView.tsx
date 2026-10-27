import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Search, 
  Filter, 
  Calendar, 
  ShieldCheck, 
  Info,
  Clock
} from 'lucide-react';
import { FESTIVAL_METADATA } from '../engine/kosha';

export const FestivalDirectoryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const festivalsList = useMemo(() => {
    return Object.keys(FESTIVAL_METADATA).map(key => {
      const f = FESTIVAL_METADATA[key];
      return {
        id: key,
        nameEn: f.en || key,
        nameIast: f.iast || key,
        nameDevanagari: f.devanagari || '',
        type: f.type || 'Festival',
        color: f.color || '#10b981',
        priority: f.priority || 5,
        description: f.description || '',
        rule: f.rule || 'Tithi prevailing at Sunrise',
      };
    });
  }, []);

  const types = Array.from(new Set(festivalsList.map(f => f.type))).sort();

  const filtered = useMemo(() => {
    return festivalsList.filter(f => {
      const matchesType = selectedType === 'all' || f.type.toLowerCase() === selectedType.toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || (
        f.nameEn.toLowerCase().includes(q) ||
        f.nameIast.toLowerCase().includes(q) ||
        f.nameDevanagari.includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.rule.toLowerCase().includes(q)
      );
      return matchesType && matchesSearch;
    }).sort((a, b) => b.priority - a.priority);
  }, [festivalsList, selectedType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Dharmaśāstra Festivals & Vratas
          </span>
          <span className="text-xs text-slate-400">
            Authentic Festival Determination Rules & Priority Catalog
          </span>
        </div>

        <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-100">
          Classical Hindu Festival & Vrata Shastra Rules
        </h2>

        <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
          In Vedic Dharmaśāstra (Nirṇaya Sindhu, Dharma Sindhu), festivals are anchored not merely to Gregorian dates, but to the precise prevailing moment of the Tithi at special celestial markers (Aruṇodaya, Sunrise, Madhyāhna, Pradoṣa, Moonrise, or Niśītha).
        </p>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search festivals by name, vrata rule, deity (e.g. 'Ekadashi', 'Diwali', 'Janmashtami', 'Pradosha')..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Types ({festivalsList.length})
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                selectedType === t
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Festival Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((fest) => (
          <div
            key={fest.id}
            className="bg-slate-900/90 border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors hover:bg-slate-850"
            style={{ borderColor: `${fest.color}40` }}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: fest.color }} />
                    <h3 className="font-heading font-bold text-sm text-slate-100">{fest.nameEn}</h3>
                  </div>
                  {fest.nameDevanagari && (
                    <div className="font-indic text-amber-400/90 text-xs mt-0.5 pl-4.5">
                      {fest.nameDevanagari} ({fest.nameIast})
                    </div>
                  )}
                </div>

                <span 
                  className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider flex-shrink-0"
                  style={{ backgroundColor: `${fest.color}20`, color: fest.color }}
                >
                  {fest.type}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {fest.description}
              </p>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 text-[11px] bg-slate-950/60 p-2 rounded-lg">
              <span className="text-amber-400 font-semibold block text-[10px] uppercase tracking-wider">
                Classical Solver Rule
              </span>
              <span className="text-slate-300 font-mono text-[11px]">{fest.rule}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
