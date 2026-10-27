import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Code, 
  Bookmark, 
  Tag, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { VIDYA_CATEGORIES, searchVidya } from '../engine/vidya';
import { VidyaConcept } from '../types/kalayantra';

export const KalaVidyaView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);

  const concepts = useMemo(() => {
    return searchVidya(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            KālaVidyā Vedic Astronomical Knowledge Base
          </span>
          <span className="text-xs text-slate-400">
            Curated Mathematical Formulas & Classical Shastric Authorities
          </span>
        </div>

        <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-100">
          "Your Panchanga is unexplainable until it cites its sources."
        </h2>

        <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
          KālaVidyā ships the curated foundational formulas, astronomical algorithms, worked mathematical examples, and classical citations behind every calculation in Kālayantra.
        </p>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 48+ Vedic concepts, formulas, keywords, deities (e.g. 'tithi', 'ayanamsha', 'muhurta', 'ashtakoota')..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
            }`}
          >
            All Categories ({VIDYA_CATEGORIES.length})
          </button>
          {VIDYA_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Concepts Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Showing {concepts.length} concepts</span>
          <span>Tap any card to view detailed formula & worked example</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {concepts.map((concept) => {
            const isOpen = activeConceptId === concept.id;
            return (
              <div
                key={concept.id}
                onClick={() => setActiveConceptId(isOpen ? null : concept.id)}
                className={`bg-slate-900/90 border rounded-2xl p-4 transition-all cursor-pointer shadow-md ${
                  isOpen 
                    ? 'border-amber-500/60 ring-1 ring-amber-400/40 bg-slate-900' 
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-base text-slate-100">
                        {concept.title.en}
                      </h3>
                      <span className="font-indic text-amber-400 text-sm">
                        ({concept.title.devanagari})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 italic font-serif mt-0.5">
                      {concept.title.iast}
                    </div>
                  </div>

                  <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-semibold uppercase tracking-wider border border-slate-700 flex-shrink-0">
                    {concept.category}
                  </span>
                </div>

                {/* Meaning */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {concept.meaning}
                </p>

                {/* Formula Snippet */}
                {concept.formula && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-amber-200/90 mb-3 overflow-x-auto">
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 font-sans mb-1 font-bold">
                      Algorithm Formula
                    </div>
                    <code>{concept.formula}</code>
                  </div>
                )}

                {/* Expanded Worked Example & Classical Source */}
                {isOpen && (
                  <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs animate-in fade-in duration-150">
                    {concept.example && (
                      <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Worked Example</div>
                        <div className="text-slate-300 text-[11px] leading-relaxed">
                          {concept.example}
                        </div>
                      </div>
                    )}

                    {concept.source && (
                      <div className="text-[11px] text-amber-400/90 font-medium">
                        <strong className="text-slate-400">Classical Authority:</strong> {concept.source}
                      </div>
                    )}

                    {concept.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {concept.keywords.map((k, i) => (
                          <span key={i} className="text-[10px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded">
                            #{k}
                          </span>
                        ))}
                      </div>
                    )}
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
