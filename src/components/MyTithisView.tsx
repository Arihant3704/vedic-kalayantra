import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Calendar, 
  Clock, 
  Bell, 
  CheckCircle2,
  Heart
} from 'lucide-react';
import { MyTithiItem } from '../types/kalayantra';
import { TITHI_NAMES, MASAS } from '../engine/kosha';

export const MyTithisView: React.FC = () => {
  const [tithis, setTithis] = useState<MyTithiItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [tithiIdx, setTithiIdx] = useState(0);
  const [paksha, setPaksha] = useState<'Shukla' | 'Krishna'>('Shukla');
  const [lunarMonthIdx, setLunarMonthIdx] = useState<number | undefined>(undefined);
  const [targetTime, setTargetTime] = useState<'Brahma Muhurta' | 'Sunrise' | 'Noon' | 'Evening'>('Sunrise');
  const [notes, setNotes] = useState('');
  const [isAnniversary, setIsAnniversary] = useState(false);
  const [baseYear, setBaseYear] = useState<number | undefined>(undefined);

  // Load from local storage
  useEffect(() => {
    try {
      const data = localStorage.getItem('kalayantra_my_tithis');
      if (data) {
        setTithis(JSON.parse(data));
      } else {
        // Seed with standard helpful examples
        const seed: MyTithiItem[] = [
          {
            id: 'seed-1',
            title: 'Sankalpa Fasting Day',
            tithiIdx: 10, // Ekadashi
            paksha: 'Shukla',
            targetTime: 'Brahma Muhurta',
            notes: 'Personal vrata dedicated to silent contemplation and fasting.',
            isAnniversary: false,
          },
          {
            id: 'seed-2',
            title: 'Family Pitru Memorial Tithi',
            tithiIdx: 29, // Amavasya
            paksha: 'Krishna',
            targetTime: 'Noon',
            notes: 'Tarpan offerings and charity to Vedic scholars.',
            isAnniversary: true,
            baseYear: 2018,
          }
        ];
        setTithis(seed);
        localStorage.setItem('kalayantra_my_tithis', JSON.stringify(seed));
      }
    } catch (e) {}
  }, []);

  const saveToStorage = (updated: MyTithiItem[]) => {
    setTithis(updated);
    try {
      localStorage.setItem('kalayantra_my_tithis', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAddTithi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: MyTithiItem = {
      id: Date.now().toString(),
      title: title.trim(),
      tithiIdx,
      paksha,
      lunarMonthIdx: lunarMonthIdx !== undefined && !isNaN(lunarMonthIdx) ? Number(lunarMonthIdx) : undefined,
      targetTime,
      notes,
      isAnniversary,
      baseYear: baseYear ? Number(baseYear) : undefined,
    };

    saveToStorage([...tithis, newItem]);
    setTitle('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    saveToStorage(tithis.filter(t => t.id !== id));
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tithis, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `kalayantra_my_tithis_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const imported = JSON.parse(evt.target?.result as string);
          if (Array.isArray(imported)) {
            saveToStorage(imported);
            alert(`Successfully imported ${imported.length} personal tithis.`);
          }
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                Personal Traditional Observances
              </span>
              <span className="text-xs text-slate-400">
                Lunisolar Recurring Reminders
              </span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-100">
              My Tithis & Recurring Vratas
            </h2>

            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Track your Janma Tithi (birth anniversary by lunar day), Pitru Śrāddha, Guru Pūjā, or personal monthly fasting vows. These appear automatically in the Kaladarśana calendar!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Tithi
            </button>
            <button
              onClick={handleExportJson}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs transition-colors"
              title="Export to JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <label 
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs transition-colors cursor-pointer"
              title="Import from JSON"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 2. Add Tithi Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-heading font-bold text-base text-slate-100 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                Add Personal Tithi or Vrata
              </h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-100 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTithi} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Title / Event Name *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Self Janma Tithi, Father Shradh, Monthly Sankalpa..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Pakṣa</label>
                  <select
                    value={paksha}
                    onChange={(e) => setPaksha(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Shukla">Śukla Pakṣa (Waxing)</option>
                    <option value="Krishna">Kṛṣṇa Pakṣa (Waning)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Tithi (1 to 15)</label>
                  <select
                    value={tithiIdx}
                    onChange={(e) => setTithiIdx(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {TITHI_NAMES.filter(t => t.paksha === paksha).map(t => (
                      <option key={t.idx} value={t.idx}>
                        {t.tithiNum}. {t.en} ({t.devanagari})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Lunar Month (Optional)</label>
                  <select
                    value={lunarMonthIdx !== undefined ? lunarMonthIdx : 'all'}
                    onChange={(e) => setLunarMonthIdx(e.target.value === 'all' ? undefined : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Every Month (Recurring)</option>
                    {MASAS.map(m => (
                      <option key={m.idx} value={m.idx}>
                        {m.en} ({m.devanagari})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Target Timing</label>
                  <select
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Brahma Muhurta">Brahma Muhūrta (Pre-dawn)</option>
                    <option value="Sunrise">Sunrise (Udaya)</option>
                    <option value="Noon">Madhyāhna (Noon)</option>
                    <option value="Evening">Pradoṣa (Evening)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Notes & Intentions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special mantras, charity items, or sankalpa details..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md"
                >
                  Save Tithi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Tithis List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tithis.map((t) => {
          const tithiData = TITHI_NAMES[t.tithiIdx] || TITHI_NAMES[0];
          const monthText = t.lunarMonthIdx !== undefined ? MASAS[t.lunarMonthIdx]?.en : 'Every Lunar Month';

          return (
            <div
              key={t.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 shadow-md flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
                    <h3 className="font-heading font-bold text-sm text-slate-100">{t.title}</h3>
                  </div>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-amber-300 font-medium mb-1">
                  {t.paksha} {tithiData.en} ({tithiData.devanagari})
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2 mb-2">
                  <span>{monthText}</span>
                  <span>•</span>
                  <span>Timing: {t.targetTime}</span>
                </div>

                {t.notes && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                    {t.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Synced to Calendar
                </span>
                <span>ID: {t.id.slice(-4)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
