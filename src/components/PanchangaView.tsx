import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Download,
  FileText,
  Check,
  Loader2,
  Bookmark,
  BookmarkCheck,
  X,
  Edit3,
  Printer,
  Sliders
} from 'lucide-react';
import { Language, PanchangaDay } from '../types/kalayantra';
import { formatCityTime, formatDateDDMMYYYY } from '../engine/astronomy';
import { downloadPanchangaPDF, ExportPanchangaPdfOptions } from '../engine/pdfExport';
import { 
  isPanchangaBookmarked, 
  togglePanchangaBookmark, 
  getPanchangaBookmark, 
  updateBookmarkNotes, 
  BOOKMARKS_UPDATED_EVENT 
} from '../engine/bookmarks';

interface PanchangaViewProps {
  panchanga: PanchangaDay;
  language: Language;
}

export const PanchangaView: React.FC<PanchangaViewProps> = ({ panchanga, language }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfPaperSize, setPdfPaperSize] = useState<'a4' | 'letter'>('a4');
  const [pdfIncludeGrahas, setPdfIncludeGrahas] = useState(true);
  const [pdfIncludeChoghadiyas, setPdfIncludeChoghadiyas] = useState(true);
  const [pdfNotes, setPdfNotes] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [bookmarkFeedback, setBookmarkFeedback] = useState<string | null>(null);

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

  const dateISO = panchanga.date.toISOString().split('T')[0];

  // Sync bookmark status
  useEffect(() => {
    const checkStatus = () => {
      const exists = isPanchangaBookmarked(dateISO, city.name);
      setIsBookmarked(exists);
      if (exists) {
        const bm = getPanchangaBookmark(dateISO, city.name);
        setNoteInput(bm?.notes || '');
      } else {
        setNoteInput('');
      }
    };

    checkStatus();

    window.addEventListener(BOOKMARKS_UPDATED_EVENT, checkStatus);
    return () => {
      window.removeEventListener(BOOKMARKS_UPDATED_EVENT, checkStatus);
    };
  }, [dateISO, city.name]);

  const handleToggleBookmark = () => {
    const existing = getPanchangaBookmark(dateISO, city.name);
    if (existing) {
      // If already bookmarked, open modal to view/edit notes or remove
      setShowNoteModal(true);
      return;
    }

    // Build rich bookmark details
    const formattedDate = `${formatDateDDMMYYYY(panchanga.date)} (${panchanga.date.toLocaleDateString('en-US', { weekday: 'long' })})`;

    const festNames = festivals && festivals.length > 0 ? festivals.map((f) => f.name) : [];

    const res = togglePanchangaBookmark({
      type: 'panchanga',
      title: `${panchanga.lunarMonth} ${tithi.name} (${tithi.paksha} Pakṣa)`,
      subtitle: `${vaara.name} • ${nakshatra.name} Nakṣatra • ${yoga.name} Yoga`,
      dateISO,
      displayDate: formattedDate,
      cityName: city.name,
      cityLat: city.lat,
      cityLon: city.lon,
      cityTz: city.tz,
      notes: '',
      tags: ['Panchanga', tithi.paksha, ...festNames.slice(0, 2)],
      panchangaDetails: {
        tithiName: tithi.name,
        tithiNumber: tithi.tithiInPaksha,
        paksha: tithi.paksha,
        nakshatraName: nakshatra.name,
        yogaName: yoga.name,
        karanaName: karana.name,
        vaaraName: vaara.name,
        lunarMonth: panchanga.lunarMonth,
        sauraMasa: solar.sauraMasa,
        shakaYear: solar.shakaYear,
        samvatsara: solar.samvatsara,
        festivals: festNames,
        sunrise: formatCityTime(sunMoon.sunrise, city.tz, true),
        sunset: formatCityTime(sunMoon.sunset, city.tz, true),
      },
    });

    setIsBookmarked(res.bookmarked);
    setBookmarkFeedback('Date bookmarked to Saved view!');
    setTimeout(() => setBookmarkFeedback(null), 3000);
  };

  const handleSaveNotes = () => {
    const bm = getPanchangaBookmark(dateISO, city.name);
    if (bm) {
      updateBookmarkNotes(bm.id, noteInput.trim());
      setShowNoteModal(false);
      setBookmarkFeedback('Notes updated in Saved view!');
      setTimeout(() => setBookmarkFeedback(null), 3000);
    }
  };

  const handleRemoveBookmark = () => {
    const bm = getPanchangaBookmark(dateISO, city.name);
    if (bm) {
      togglePanchangaBookmark({
        type: 'panchanga',
        title: bm.title,
        dateISO,
        displayDate: bm.displayDate,
        cityName: city.name,
      });
      setShowNoteModal(false);
      setIsBookmarked(false);
      setBookmarkFeedback('Removed date from Saved view');
      setTimeout(() => setBookmarkFeedback(null), 3000);
    }
  };

  const formatTime = (d?: Date | null) => {
    return formatCityTime(d, city.tz, true);
  };

  const handleDownloadPDF = async (customOpts?: Partial<ExportPanchangaPdfOptions>) => {
    try {
      setIsExporting(true);
      setTimeout(() => {
        downloadPanchangaPDF(panchanga, language, customOpts);
        setIsExporting(false);
        setDownloadSuccess(true);
        setShowPdfModal(false);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }, 50);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setIsExporting(false);
    }
  };

  const handlePrintBrowser = () => {
    setShowPdfModal(false);
    setTimeout(() => {
      window.print();
    }, 100);
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
                {panchanga.lunarMonth} Māsa ({panchanga.monthSystem === 'amavasyanta' ? 'Amāvāsyānta' : 'Pūrṇimānta'})
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
              {tithi.isVriddhi && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 animate-pulse">
                  Vṛddhi Tithi (वृद्धि)
                </span>
              )}
              {tithi.isKshaya && (
                <span className="text-xs bg-rose-500/20 text-rose-300 font-bold px-2.5 py-0.5 rounded-full border border-rose-500/40">
                  Kṣaya: {tithi.kshayaTithiName} (क्षय)
                </span>
              )}
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-amber-100 flex flex-wrap items-center gap-2">
              <span>{panchanga.lunarMonth} {tithi.paksha} {tithi.name}</span>
              <span className="text-sm font-normal text-slate-400">({solar.sauraMasa}, Day {solar.dayOfMonth} • <span className="font-mono text-amber-300 font-semibold">{formatDateDDMMYYYY(panchanga.date)}</span>)</span>
            </h2>

            {/* Display All Three Epoch Years: Shaka, Vikram, Kali & Selected Samvatsara */}
            <div className="text-xs text-slate-400 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/80">
              <span>
                Śaka Year: <strong className="text-amber-200">{panchanga.years?.shaka ?? solar.shakaYear}</strong>
              </span>
              <span>•</span>
              <span>
                Vikrama Saṃvat: <strong className="text-amber-200">{panchanga.years?.vikram ?? solar.vikramaSamvat}</strong>
                {panchanga.calendarSystem === 'vikram_kartak' && (
                  <span className="text-[11px] text-slate-400 ml-1">(Kārtakadi: {panchanga.years?.vikramKartak})</span>
                )}
              </span>
              <span>•</span>
              <span>
                Kali Yuga: <strong className="text-amber-200">{panchanga.years?.kali ?? solar.kaliYear}</strong>
              </span>
              <span>•</span>
              <span>
                Saṃvatsara: <strong className="text-amber-300">{panchanga.years?.samvatsara ?? solar.samvatsara}</strong>
              </span>
              <span>•</span>
              <span>
                Ayanāṃśa: <strong className="text-slate-300">{ayanamshaMode} ({ayanamshaValue.toFixed(4)}°)</strong>
              </span>
            </div>
          </div>

            {/* Right Section: Traditional Clock, Download PDF & Bookmark Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Traditional Ghatika & Prahara Clock Box */}
              <div className="bg-slate-950/70 border border-amber-500/20 rounded-xl p-3 sm:px-4 flex items-center gap-4 min-w-[210px]">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
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

              <div className="flex items-center gap-2">
                {/* Download as PDF Action Button Group */}
                <div className="flex items-center rounded-xl shadow-md overflow-hidden border border-amber-300">
                  <button
                    onClick={() => handleDownloadPDF({ 
                      paperSize: pdfPaperSize, 
                      includeGrahas: pdfIncludeGrahas, 
                      includeChoghadiyas: pdfIncludeChoghadiyas, 
                      notes: pdfNotes 
                    })}
                    disabled={isExporting}
                    title="Download daily Vedic Panchanga astrological almanac as a PDF document"
                    className={`flex items-center justify-center gap-2 px-3.5 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none whitespace-nowrap ${
                      downloadSuccess
                        ? 'bg-emerald-600 text-white'
                        : isExporting
                        ? 'bg-amber-600/50 text-amber-100 opacity-80 cursor-wait'
                        : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 active:scale-[0.98]'
                    }`}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Preparing PDF...</span>
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>PDF Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-slate-950" />
                        <span>Download as PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowPdfModal(true)}
                    title="Configure PDF format, paper size, and print options"
                    className="px-2.5 py-3 sm:py-3.5 bg-amber-600 hover:bg-amber-500 text-slate-950 border-l border-amber-400/60 transition-colors cursor-pointer flex items-center justify-center"
                    aria-label="PDF export and print options"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>

                {/* Bookmark Date Action Button */}
                <button
                  onClick={handleToggleBookmark}
                  title={isBookmarked ? "This date is in your Saved items (click to view/edit notes or remove)" : "Bookmark this Panchanga date to your Saved items"}
                  className={`flex items-center justify-center gap-2 px-3.5 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md border cursor-pointer select-none whitespace-nowrap ${
                    isBookmarked
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 shadow-amber-500/10'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700 hover:border-slate-600 shadow-slate-950/40 active:scale-[0.98]'
                  }`}
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      <span>Bookmark Date</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Toast if any */}
        {bookmarkFeedback && (
          <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-semibold shadow-2xl flex items-center gap-2 text-sm border border-amber-300 animate-in fade-in slide-in-from-bottom-2">
            <BookmarkCheck className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>{bookmarkFeedback}</span>
          </div>
        )}

        {/* Note / Edit Modal for Panchanga Bookmark */}
        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-300 font-heading font-bold text-base">
                  <Bookmark className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Saved Date Notes</span>
                </div>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-200">
                  {panchanga.lunarMonth} {tithi.name} ({tithi.paksha} Pakṣa)
                </div>
                <div className="text-[11px] text-amber-300/80 font-mono mt-0.5">
                  {panchanga.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} • {city.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Personal Notes / Sankalpa / Observations
                </label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Auspicious day chosen for housewarming ceremony, vratas, or special planetary pooja..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={handleRemoveBookmark}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove from Saved</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNoteModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-xs rounded-xl shadow cursor-pointer hover:from-amber-400 hover:to-amber-500 transition"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Structured PDF Export & Print Options Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl shadow-black/80 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-heading text-slate-100 flex items-center gap-1.5">
                      Download as PDF & Print
                      <span className="text-xs font-normal text-amber-400 font-indic">(पञ्चाङ्ग-मुद्रण)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Export structured Vedic report for {panchanga.dateStr} • {city.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-slate-200">{panchanga.lunarMonth} Māsa • {tithi.paksha} Pakṣa</span>
                  <span>Śaka {solar.shakaYear} ({solar.samvatsara})</span>
                </div>
                <div className="text-slate-300 font-medium">
                  {tithi.name} • {nakshatra.name} (Pada {nakshatra.pada}) • {yoga.name} • {vaara.name}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>Sunrise: {formatTime(sunMoon.sunrise)}</span>
                  <span>•</span>
                  <span>Sunset: {formatTime(sunMoon.sunset)}</span>
                  <span>•</span>
                  <span>Ayanāṃśa: {ayanamshaMode}</span>
                </div>
              </div>

              {/* Format Options */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-300 block mb-1.5">
                    Paper Size & Margins
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPdfPaperSize('a4')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        pdfPaperSize === 'a4'
                          ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-semibold text-xs">A4 (Standard)</div>
                      <div className="text-[10px] text-slate-400">210 × 297 mm • International standard</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfPaperSize('letter')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        pdfPaperSize === 'letter'
                          ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-semibold text-xs">US Letter</div>
                      <div className="text-[10px] text-slate-400">8.5 × 11 in • North America standard</div>
                    </button>
                  </div>
                </div>

                {/* Additional Sections to Include */}
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-300 block">
                    Report Content & Sections
                  </label>
                  
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Page 1: Five Limbs (Pañcāṅga), Horizons, Vedic Clock & Muhūrtas</span>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-200">
                      <input
                        type="checkbox"
                        checked={pdfIncludeGrahas}
                        onChange={(e) => setPdfIncludeGrahas(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 accent-amber-500 bg-slate-800 border-slate-700"
                      />
                      <div>
                        <div className="font-semibold">Include Planetary Ephemeris (Graha Spaṣṭa)</div>
                        <div className="text-[11px] text-slate-400">
                          Exact sidereal degrees, zodiac signs, motion speed & retrograde status for all 9 Grahas
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-200">
                      <input
                        type="checkbox"
                        checked={pdfIncludeChoghadiyas}
                        onChange={(e) => setPdfIncludeChoghadiyas(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 accent-amber-500 bg-slate-800 border-slate-700"
                      />
                      <div>
                        <div className="font-semibold">Include Day & Night Choghaḍiyā Cycles</div>
                        <div className="text-[11px] text-slate-400">
                          All 16 daytime and nighttime 8-fold Choghadiya Muhurtas with auspiciousness
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Custom User Notes */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-300 block mb-1">
                    Custom Notes / Saṅkalpa (Optional)
                  </label>
                  <textarea
                    value={pdfNotes}
                    onChange={(e) => setPdfNotes(e.target.value)}
                    placeholder="e.g., Special family Sankalpa, temple vrata, or personal notes to print on the report..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={handlePrintBrowser}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print via Browser</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPdfModal(false)}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPDF({
                      paperSize: pdfPaperSize,
                      includeGrahas: pdfIncludeGrahas,
                      includeChoghadiyas: pdfIncludeChoghadiyas,
                      notes: pdfNotes.trim(),
                    })}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer select-none"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-slate-950" />
                        <span>Download as PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
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
                    <span className="text-[11px] font-mono text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                      {formatDateDDMMYYYY(panchanga.date)}
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

      {/* Kshaya & Vriddhi Tithi Astrological Notice */}
      {(tithi.isVriddhi || tithi.isKshaya) && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-md ${
          tithi.isVriddhi 
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${tithi.isVriddhi ? 'text-emerald-400' : 'text-rose-400'}`} />
          <div className="text-xs space-y-1">
            <div className="font-bold text-sm font-heading flex items-center gap-2">
              <span>{tithi.isVriddhi ? 'Vṛddhi Tithi (वृद्धि तिथि — Repeated Lunar Day)' : 'Kṣaya Tithi (क्षय तिथि — Omitted Lunar Day)'}</span>
            </div>
            {tithi.isVriddhi && (
              <p className="text-slate-300">
                Today's tithi ({tithi.paksha} {tithi.name}) prevails across two consecutive sunrises. The same tithi is observed on consecutive civil days according to Udaya-vyāpinī Siddhānta.
              </p>
            )}
            {tithi.isKshaya && (
              <p className="text-slate-300">
                A lunar tithi <strong className="text-rose-300 font-semibold">{tithi.kshayaTithiName}</strong> started after today's sunrise and terminates before tomorrow's sunrise without touching any sunrise (omitted civil day).
                {tithi.kshayaEndTime && (
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    Kṣaya tithi ends at: <span className="font-mono text-slate-200">{formatTime(tithi.kshayaEndTime)}</span>
                  </span>
                )}
              </p>
            )}
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
              <div className="font-heading text-lg font-bold text-slate-100 mt-1 flex items-center gap-1.5">
                <span>{tithi.name}</span>
                {tithi.isVriddhi && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Vṛddhi
                  </span>
                )}
              </div>
              {tithi.isKshaya && (
                <div className="text-[10px] text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30 mt-1">
                  Kṣaya: {tithi.kshayaTithiName}
                </div>
              )}
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

      {/* Surya Nakshatra & Lagna (Solar Constellation & Ascendant) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400">
          <span>Key Astrological Coordinates (Sūrya Nakṣatra & Lagna)</span>
          <span className="text-slate-400 font-normal lowercase">
            Vedic Zodiac Markers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Surya Nakshatra */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-colors flex items-center justify-between shadow-md">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 mb-1">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="font-semibold uppercase tracking-wider">Sūrya Nakṣatra (Solar Constellation)</span>
              </div>
              <div className="font-heading text-lg font-bold text-slate-100 mt-1">
                {panchanga.suryaNakshatra?.name || 'Ashwini'}
                <span className="text-xs font-normal text-amber-300 ml-2">
                  (Pāda {panchanga.suryaNakshatra?.pada || 1})
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>Lord: <strong className="text-slate-200">{panchanga.suryaNakshatra?.lord || 'Ketu'}</strong></span>
                <span>•</span>
                <span>Deity: <span className="text-slate-300">{panchanga.suryaNakshatra?.deity || 'Ashvins'}</span></span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono">
                Nak #{((panchanga.suryaNakshatra?.idx ?? 0) + 1)}/27
              </span>
            </div>
          </div>

          {/* Lagna (Ascendant) */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-colors flex items-center justify-between shadow-md">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 mb-1">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="font-semibold uppercase tracking-wider">Lagna (Udaya Lagna / Ascendant)</span>
              </div>
              <div className="font-heading text-lg font-bold text-slate-100 mt-1">
                {panchanga.lagna?.rashi || 'Mesha'}
                <span className="text-xs font-mono font-normal text-amber-300 ml-2">
                  {panchanga.lagna?.formattedDegree || '0° 00\''}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>Lagna Lord: <strong className="text-slate-200">{panchanga.lagna?.lord || 'Mangala'}</strong></span>
                <span>•</span>
                <span>Observation: <span className="text-slate-300">{mode === 'udaya' ? 'Sunrise Lagna' : 'Current Lagna'}</span></span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg font-semibold">
                Rāśi #{((panchanga.lagna?.rashiIdx ?? 0) + 1)}/12
              </span>
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
