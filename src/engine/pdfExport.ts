import { jsPDF } from 'jspdf';
import { PanchangaDay, Language } from '../types/kalayantra';
import { formatCityTime, calculateGrahaSiderealPositions, formatDegree } from './astronomy';
import { calculateMuhurtas, calculateChoghadiyas } from './muhurta';
import { GRAHAS, RASHIS } from './kosha';

/**
 * Safely transliterates / cleans strings for standard PDF core fonts (Helvetica / Times)
 * which only support standard ISO-8859-1 / ASCII characters.
 * Replaces Sanskrit IAST diacritics with clean, readable Latin equivalents so no glyphs fail.
 */
export function sanitizeForPdf(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/ā/g, 'a')
    .replace(/Ā/g, 'A')
    .replace(/ī/g, 'i')
    .replace(/Ī/g, 'I')
    .replace(/ū/g, 'u')
    .replace(/Ū/g, 'U')
    .replace(/ṛ/g, 'ri')
    .replace(/Ṛ/g, 'Ri')
    .replace(/ṝ/g, 'ri')
    .replace(/Ṝ/g, 'Ri')
    .replace(/ḷ/g, 'li')
    .replace(/Ḷ/g, 'Li')
    .replace(/ś/g, 'sh')
    .replace(/Ś/g, 'Sh')
    .replace(/ṣ/g, 'sh')
    .replace(/Ṣ/g, 'Sh')
    .replace(/ṅ/g, 'n')
    .replace(/Ṅ/g, 'N')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N')
    .replace(/ṇ/g, 'n')
    .replace(/Ṇ/g, 'N')
    .replace(/ṭ/g, 't')
    .replace(/Ṭ/g, 'T')
    .replace(/ḍ/g, 'd')
    .replace(/Ḍ/g, 'D')
    .replace(/ṃ/g, 'm')
    .replace(/Ṃ/g, 'M')
    .replace(/ḥ/g, 'h')
    .replace(/Ḥ/g, 'H')
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    // Remove Devanagari or any non-latin character that could render as unprintable in Helvetica
    .replace(/[\u0900-\u097F]/g, '')
    .trim();
}

export interface ExportPanchangaPdfOptions {
  panchanga: PanchangaDay;
  language?: Language;
  paperSize?: 'a4' | 'letter';
  includeGrahas?: boolean;
  includeChoghadiyas?: boolean;
  notes?: string;
}

/**
 * Generates an authoritative, beautifully structured Vedic Panchanga Report in PDF format.
 * Structured for print clarity, standard margins, and high-fidelity typography.
 */
export function generatePanchangaPDF(options: ExportPanchangaPdfOptions): jsPDF {
  const { 
    panchanga, 
    paperSize = 'a4', 
    includeGrahas = false, 
    includeChoghadiyas = false,
    notes = '' 
  } = options;

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

  const isLetter = paperSize === 'letter';
  const pageWidth = isLetter ? 215.9 : 210;
  const pageHeight = isLetter ? 279.4 : 297;
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: paperSize,
    compress: true
  });

  const totalPages = (includeGrahas || includeChoghadiyas) ? 2 : 1;

  const formatTime = (d?: Date | null) => {
    if (!d) return '--:--';
    return formatCityTime(d, city.tz, false);
  };

  // Color Palette Definitions (Print friendly, deep contrast)
  const colorGold = [170, 115, 20] as const; // #AA7314
  const colorDeepNavy = [15, 23, 42] as const; // Slate 900
  const colorSlateBg = [248, 250, 252] as const; // Slate 50
  const colorBorder = [226, 232, 240] as const; // Slate 200
  const colorTextPrimary = [15, 23, 42] as const; // Slate 900
  const colorTextMuted = [80, 95, 115] as const; // Slate 600
  const colorBannerBg = [254, 243, 199] as const; // Amber 100
  const colorGreen = [21, 128, 61] as const; // Green 700
  const colorRed = [185, 28, 28] as const; // Red 700

  // ==========================================
  // PAGE 1: DAILY VEDIC PANCHANGA & HORIZONS
  // ==========================================
  let y = margin;

  // Outer Page Frame / Ornamental Border
  doc.setDrawColor(217, 180, 100);
  doc.setLineWidth(0.6);
  doc.rect(margin - 3, margin - 3, contentWidth + 6, pageHeight - (margin * 2) + 6);
  doc.setDrawColor(241, 219, 163);
  doc.setLineWidth(0.25);
  doc.rect(margin - 1.8, margin - 1.8, contentWidth + 3.6, pageHeight - (margin * 2) + 3.6);

  // Top Header Banner
  doc.setFillColor(...colorDeepNavy);
  doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'F');

  // Title
  doc.setTextColor(255, 215, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text('KALAYANTRA  -  VEDIC PANCHANGA REPORT', margin + 5, y + 7.5);

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const subtitle = `Authoritative Astrological Ephemeris & Panchanga Almanac | Date: ${panchanga.dateStr}`;
  doc.text(subtitle, margin + 5, y + 13);

  // Top Right Tag: Calculation Mode & Ayanamsha
  doc.setTextColor(255, 235, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const modeLabel = mode === 'udaya' ? 'Anchored to Sunrise (Udaya)' : 'Real-time (Current)';
  const ayanaLabel = `Ayanamsha: ${ayanamshaMode.toUpperCase()} (${ayanamshaValue.toFixed(4)} deg)`;
  doc.text(modeLabel, pageWidth - margin - 5, y + 7.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(ayanaLabel, pageWidth - margin - 5, y + 13, { align: 'right' });

  y += 24.5;

  // 1. Location & Calendar System Bar (2 columns)
  const locColW = (contentWidth - 4) / 2;
  const box1H = 22;
  doc.setFillColor(...colorSlateBg);
  doc.setDrawColor(...colorBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, locColW, box1H, 1, 1, 'FD');
  doc.roundedRect(margin + locColW + 4, y, locColW, box1H, 1, 1, 'FD');

  // Left Box: Geographic Location
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colorGold);
  doc.text('GEOGRAPHIC HORIZON', margin + 3.5, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...colorTextPrimary);
  doc.text(sanitizeForPdf(city.name), margin + 3.5, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...colorTextMuted);
  doc.text(sanitizeForPdf(city.stateCountry), margin + 3.5, y + 13.5);
  const coordsStr = `Lat: ${city.lat >= 0 ? city.lat.toFixed(2) + ' N' : Math.abs(city.lat).toFixed(2) + ' S'} | Lon: ${city.lon >= 0 ? city.lon.toFixed(2) + ' E' : Math.abs(city.lon).toFixed(2) + ' W'} | Elev: ${city.alt}m`;
  doc.text(coordsStr, margin + 3.5, y + 17.5);
  const tzSign = city.tz >= 0 ? '+' : '-';
  const tzAbsH = Math.floor(Math.abs(city.tz));
  const tzAbsM = Math.round((Math.abs(city.tz) - tzAbsH) * 60);
  const tzString = `Timezone: UTC ${tzSign}${String(tzAbsH).padStart(2, '0')}:${String(tzAbsM).padStart(2, '0')}`;
  doc.text(tzString, margin + 3.5, y + 20.5);

  // Right Box: Vedic Calendar Epochs
  const rx = margin + locColW + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colorGold);
  doc.text('VEDIC SAMVAT & SOLAR CALENDAR', rx + 3.5, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorTextPrimary);

  doc.text(`Vikrama Samvat:`, rx + 3.5, y + 9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(String(solar.vikramaSamvat), rx + 28, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Shaka Samvat:`, rx + 44, y + 9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${solar.shakaYear} (${sanitizeForPdf(solar.samvatsara)})`, rx + 66, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Lunar Month:`, rx + 3.5, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sanitizeForPdf(panchanga.lunarMonth)} (${tithi.paksha} Paksha)`, rx + 23, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.text(`Solar Month (Rashi):`, rx + 3.5, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sanitizeForPdf(solar.sauraMasa)} (Day ${solar.dayOfMonth})`, rx + 31, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(`Ayana & Ritu:`, rx + 3.5, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(`${solar.ayana} | ${sanitizeForPdf(solar.ritu)}`, rx + 23, y + 21);

  y += box1H + 3.5;

  // 2. The Five Limbs of Panchanga (Full width table/cards)
  doc.setFillColor(...colorDeepNavy);
  doc.roundedRect(margin, y, contentWidth, 5.5, 1, 1, 'F');
  doc.setTextColor(255, 235, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PANCHANGA: THE FIVE VEDIC LIMBS (PANCA-ANGA)', margin + 3.5, y + 3.8);

  y += 7;

  const limbCards = [
    {
      limb: '1. TITHI (Lunar Day)',
      primary: `${tithi.paksha} ${sanitizeForPdf(tithi.name)} (#${tithi.tithiInPaksha})`,
      secondary: `End Time: ${formatTime(tithi.endTime)} (${tithi.percentElapsed ?? 0}% completed)`,
      extra: `Deity: ${sanitizeForPdf(tithi.deity)} | Nature: ${tithi.nature}`
    },
    {
      limb: '2. NAKSHATRA (Asterism)',
      primary: `${sanitizeForPdf(nakshatra.name)} (Pada ${nakshatra.pada}/4)`,
      secondary: `End Time: ${formatTime(nakshatra.endTime)} (${nakshatra.percentElapsed ?? 0}% completed)`,
      extra: `Lord: ${sanitizeForPdf(nakshatra.lord)} | Deity: ${sanitizeForPdf(nakshatra.deity)} | Gana: ${nakshatra.gana}`
    },
    {
      limb: '3. YOGA (Solar-Lunar Angle)',
      primary: `${sanitizeForPdf(yoga.name)} (${yoga.isAuspicious ? 'Auspicious / Shubh' : 'Inauspicious / Ashubh'})`,
      secondary: `End Time: ${formatTime(yoga.endTime)} (${yoga.percentElapsed ?? 0}% completed)`,
      extra: `Index: ${yoga.idx + 1} of 27 Nitya Yogas`
    },
    {
      limb: '4. KARANA (Half Lunar Day)',
      primary: `${sanitizeForPdf(karana.name)} (${karana.isFixed ? 'Fixed / Sthira' : 'Movable / Chara'})`,
      secondary: `End Time: ${formatTime(karana.endTime)} (${karana.percentElapsed ?? 0}% completed)`,
      extra: karana.isBhadra ? 'WARNING: Vishti Karana (Bhadra) - Avoid auspicious initiatives' : `Unique Karana Index: #${karana.uniqueIdx + 1}`
    },
    {
      limb: '5. VAARA (Solar Weekday)',
      primary: `${sanitizeForPdf(vaara.name)} (Day ${vaara.idx + 1}/7)`,
      secondary: `Starts at Sunrise: ${formatTime(sunMoon.sunrise)}`,
      extra: `Ruling Planet: ${sanitizeForPdf(vaara.lord)} | Presiding Lord: ${sanitizeForPdf(vaara.deity)}`
    }
  ];

  const limbHeight = 10;
  limbCards.forEach((card, index) => {
    const cardY = y + (index * (limbHeight + 1.2));
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.setDrawColor(...colorBorder);
    doc.setLineWidth(0.25);
    doc.roundedRect(margin, cardY, contentWidth, limbHeight, 0.8, 0.8, 'FD');

    // Left Accent bar
    doc.setFillColor(...colorGold);
    doc.rect(margin, cardY, 1.8, limbHeight, 'F');

    // Limb Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...colorGold);
    doc.text(card.limb, margin + 3.5, cardY + 3.5);

    // Primary Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...colorTextPrimary);
    doc.text(card.primary, margin + 48, cardY + 3.5);

    // Timing
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colorTextMuted);
    doc.text(card.secondary, margin + 3.5, cardY + 7.5);

    // Extra details
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.8);
    if (card.extra.includes('WARNING')) {
      doc.setTextColor(...colorRed);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(71, 85, 105);
    }
    doc.text(card.extra, pageWidth - margin - 3, cardY + 7.5, { align: 'right' });
  });

  y += (limbCards.length * (limbHeight + 1.2)) + 3.5;

  // 3. Astronomical Ephemeris & Vedic Timekeeping (2 Columns)
  const ephColW = (contentWidth - 4) / 2;

  // Left Column Header
  doc.setFillColor(...colorDeepNavy);
  doc.roundedRect(margin, y, ephColW, 5.5, 1, 1, 'F');
  doc.setTextColor(255, 235, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('SURYA & CANDRA (CELESTIAL EPHEMERIS)', margin + 3.5, y + 3.8);

  // Right Column Header
  doc.setFillColor(...colorDeepNavy);
  doc.roundedRect(margin + ephColW + 4, y, ephColW, 5.5, 1, 1, 'F');
  doc.setTextColor(255, 235, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('VEDIC TIMEKEEPING (GHATIKA & PRAHARA)', margin + ephColW + 7.5, y + 3.8);

  y += 7;

  const rowBoxH = 36;
  // Left Box Content
  doc.setFillColor(...colorSlateBg);
  doc.setDrawColor(...colorBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, ephColW, rowBoxH, 1, 1, 'FD');

  const sunData = [
    ['Sunrise (Surya Udaya):', formatTime(sunMoon.sunrise), 'Sunset (Surya Asta):', formatTime(sunMoon.sunset)],
    ['Solar Noon (Madhyahna):', formatTime(sunMoon.noon), 'Dawn (Civil Twilight):', formatTime(sunMoon.dawn)],
    ['Moonrise (Chandra Udaya):', formatTime(sunMoon.moonrise), 'Moonset (Chandra Asta):', formatTime(sunMoon.moonset)],
    ['Moon Phase:', sanitizeForPdf(sunMoon.moonPhase), 'Illumination:', `${sunMoon.moonIlluminationPercent}%`],
    ['Day Length (Dinamana):', `${Math.floor(sunMoon.dayLengthMinutes / 60)}h ${Math.round(sunMoon.dayLengthMinutes % 60)}m`, 'Night Length:', `${Math.floor(sunMoon.nightLengthMinutes / 60)}h ${Math.round(sunMoon.nightLengthMinutes % 60)}m`]
  ];

  let epY = y + 4.5;
  sunData.forEach(([label1, val1, label2, val2]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colorTextMuted);
    doc.text(label1, margin + 3.5, epY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorTextPrimary);
    doc.text(val1, margin + 38, epY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorTextMuted);
    doc.text(label2, margin + 45, epY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorTextPrimary);
    doc.text(val2, margin + 74, epY);

    epY += 6.5;
  });

  // Right Box Content: Vedic Traditional Clock
  const rClockX = margin + ephColW + 4;
  doc.setFillColor(...colorSlateBg);
  doc.setDrawColor(...colorBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(rClockX, y, ephColW, rowBoxH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorGold);
  doc.text('CURRENT VEDIC ELAPSED TIME', rClockX + 3.5, y + 4.5);

  // Big Clock Display Box
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(rClockX + 3.5, y + 6.5, ephColW - 7, 12, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(180, 83, 9);
  doc.text(traditionalTime.ghadiString, rClockX + (ephColW / 2), y + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(146, 64, 14);
  doc.text('(1 Ghati = 24 mins | 1 Vipal = 24 secs | 1 Tatpara = 0.4 secs)', rClockX + (ephColW / 2), y + 16, { align: 'center' });

  let rClockY = y + 22.5;
  const vTimeRows = [
    ['Prahara (Quarter of Day):', `Prahara ${traditionalTime.prahara} of 4 (${traditionalTime.isDay ? 'Day / Dina' : 'Night / Ratri'})`],
    ['Day Span (Dinamana):', `${traditionalTime.dinamanaGhadis} Ghadis (~${(traditionalTime.dinamanaGhadis * 24 / 60).toFixed(1)} hrs)`],
    ['Night Span (Ratrimana):', `${traditionalTime.ratrimanaGhadis} Ghadis (~${(traditionalTime.ratrimanaGhadis * 24 / 60).toFixed(1)} hrs)`],
  ];

  vTimeRows.forEach(([lbl, val]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colorTextMuted);
    doc.text(lbl, rClockX + 3.5, rClockY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorTextPrimary);
    doc.text(val, rClockX + 38, rClockY);
    rClockY += 4.5;
  });

  y += rowBoxH + 3.5;

  // 4. Auspicious & Inauspicious Muhurtas Table
  doc.setFillColor(...colorDeepNavy);
  doc.roundedRect(margin, y, contentWidth, 5.5, 1, 1, 'F');
  doc.setTextColor(255, 235, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('MUHURTAS: AUSPICIOUS & INAUSPICIOUS TIMINGS', margin + 3.5, y + 3.8);

  y += 7;

  const muhurtas = calculateMuhurtas(new Date(), sunMoon, vaara.idx);
  const auspicious = muhurtas.filter(m => m.type === 'auspicious');
  const inauspicious = muhurtas.filter(m => m.type === 'inauspicious');

  const muhColW = (contentWidth - 4) / 2;
  const muhBoxH = 40;

  // Auspicious Box (Left)
  doc.setFillColor(...colorSlateBg);
  doc.setDrawColor(...colorBorder);
  doc.roundedRect(margin, y, muhColW, muhBoxH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorGreen);
  doc.text('SHUBH MUHURTAS (AUSPICIOUS)', margin + 3.5, y + 4.5);

  let aY = y + 8.5;
  auspicious.slice(0, 4).forEach(m => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...colorTextPrimary);
    doc.text(sanitizeForPdf(m.name), margin + 3.5, aY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...colorGreen);
    const timeSpan = `${formatTime(m.startTime)} - ${formatTime(m.endTime)}`;
    doc.text(timeSpan, margin + muhColW - 3.5, aY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(...colorTextMuted);
    const shortDesc = doc.splitTextToSize(sanitizeForPdf(m.description), muhColW - 7);
    doc.text(shortDesc[0] ?? '', margin + 3.5, aY + 3.2);

    aY += 7.5;
  });

  // Inauspicious Box (Right)
  const inausX = margin + muhColW + 4;
  doc.setFillColor(...colorSlateBg);
  doc.setDrawColor(...colorBorder);
  doc.roundedRect(inausX, y, muhColW, muhBoxH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorRed);
  doc.text('ASHUBH KALAS (INAUSPICIOUS - AVOID)', inausX + 3.5, y + 4.5);

  let inY = y + 8.5;
  inauspicious.slice(0, 4).forEach(m => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...colorTextPrimary);
    doc.text(sanitizeForPdf(m.name), inausX + 3.5, inY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...colorRed);
    const timeSpan = `${formatTime(m.startTime)} - ${formatTime(m.endTime)}`;
    doc.text(timeSpan, inausX + muhColW - 3.5, inY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(...colorTextMuted);
    const shortDesc = doc.splitTextToSize(sanitizeForPdf(m.description), muhColW - 7);
    doc.text(shortDesc[0] ?? '', inausX + 3.5, inY + 3.2);

    inY += 7.5;
  });

  y += muhBoxH + 3.5;

  // 5. Active Festivals & Observances / User Notes
  if (festivals.length > 0) {
    doc.setFillColor(...colorBannerBg);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, contentWidth, 12, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text('ACTIVE FESTIVALS & VRATAS:', margin + 3.5, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colorTextPrimary);
    const festNames = festivals.map(f => `${sanitizeForPdf(f.name)} (${f.type})`).join('  |  ');
    const festLines = doc.splitTextToSize(festNames, contentWidth - 7);
    doc.text(festLines[0] ?? '', margin + 3.5, y + 8);

    y += 14;
  } else if (notes) {
    doc.setFillColor(...colorSlateBg);
    doc.setDrawColor(...colorBorder);
    doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...colorGold);
    doc.text('USER NOTES:', margin + 3.5, y + 4);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(...colorTextPrimary);
    const noteLines = doc.splitTextToSize(sanitizeForPdf(notes), contentWidth - 7);
    doc.text(noteLines[0] ?? '', margin + 3.5, y + 7.5);

    y += 12;
  } else {
    doc.setFillColor(...colorSlateBg);
    doc.setDrawColor(...colorBorder);
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(...colorTextMuted);
    doc.text('Note: Timings computed using rigorous spherical trigonometry and precise modern ephemerides. Tithi and Nakshatra transitions may span across consecutive Gregorian days.', margin + 3.5, y + 5);

    y += 10;
  }

  // Footer on Page 1
  doc.setDrawColor(...colorBorder);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - margin - 3.5, pageWidth - margin, pageHeight - margin - 3.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...colorTextMuted);
  const footerLeft = `Kalayantra Vedic Chronometry System | Date: ${panchanga.dateStr} | Horizon: ${sanitizeForPdf(city.name)}`;
  doc.text(footerLeft, margin, pageHeight - margin - 1);

  const footerRight = `Page 1 of ${totalPages} | High-Precision Vedic Ephemeris`;
  doc.text(footerRight, pageWidth - margin, pageHeight - margin - 1, { align: 'right' });

  // ==========================================
  // PAGE 2: PLANETARY POSITIONS & CHOGHADIYAS
  // ==========================================
  if (includeGrahas || includeChoghadiyas) {
    doc.addPage(paperSize, 'portrait');
    let p2Y = margin;

    // Outer Page Frame for Page 2
    doc.setDrawColor(217, 180, 100);
    doc.setLineWidth(0.6);
    doc.rect(margin - 3, margin - 3, contentWidth + 6, pageHeight - (margin * 2) + 6);
    doc.setDrawColor(241, 219, 163);
    doc.setLineWidth(0.25);
    doc.rect(margin - 1.8, margin - 1.8, contentWidth + 3.6, pageHeight - (margin * 2) + 3.6);

    // Header Banner Page 2
    doc.setFillColor(...colorDeepNavy);
    doc.roundedRect(margin, p2Y, contentWidth, 18, 1.5, 1.5, 'F');

    doc.setTextColor(255, 215, 120);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('KALAYANTRA  -  GRAHA SPASHTA & CHOGHADIYA TIMINGS', margin + 5, p2Y + 7);

    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Sidereal Planetary Longitudes & Choghadiya Muhurtas for ${sanitizeForPdf(city.name)} (${panchanga.dateStr})`, margin + 5, p2Y + 12.5);

    p2Y += 21;

    // 1. Graha Spashta Table (Planetary Positions)
    if (includeGrahas) {
      doc.setFillColor(...colorDeepNavy);
      doc.roundedRect(margin, p2Y, contentWidth, 5.5, 1, 1, 'F');
      doc.setTextColor(255, 235, 180);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.text('GRAHA SPASHTA: SIDEREAL PLANETARY LONGITUDES & MOTIONS', margin + 3.5, p2Y + 3.8);

      p2Y += 7;

      const grahaData = calculateGrahaSiderealPositions(panchanga.date, city, ayanamshaMode);
      const grahaRows = [
        { id: 0, name: 'Surya (Sun)', lord: 'Shiva' },
        { id: 1, name: 'Chandra (Moon)', lord: 'Parvati' },
        { id: 2, name: 'Mangala (Mars)', lord: 'Kartikeya' },
        { id: 3, name: 'Budha (Mercury)', lord: 'Vishnu' },
        { id: 4, name: 'Guru (Jupiter)', lord: 'Brahma' },
        { id: 5, name: 'Shukra (Venus)', lord: 'Indrani' },
        { id: 6, name: 'Shani (Saturn)', lord: 'Yama' },
        { id: 7, name: 'Rahu (North Node)', lord: 'Durga' },
        { id: 8, name: 'Ketu (South Node)', lord: 'Chitragupta' },
      ];

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(...colorBorder);
      doc.rect(margin, p2Y, contentWidth, 6, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(...colorTextPrimary);
      doc.text('GRAHA (PLANET)', margin + 3.5, p2Y + 4);
      doc.text('SIDEREAL LONGITUDE', margin + 48, p2Y + 4);
      doc.text('RASHI (ZODIAC SIGN)', margin + 90, p2Y + 4);
      doc.text('MOTION / SPEED', margin + 130, p2Y + 4);
      doc.text('STATE', pageWidth - margin - 5, p2Y + 4, { align: 'right' });

      p2Y += 6;

      grahaRows.forEach((row, idx) => {
        const pInfo = grahaData.grahas[row.id as keyof typeof grahaData.grahas];
        const lon = pInfo ? pInfo.lon : 0;
        const speed = pInfo ? pInfo.speed : 0;
        const isRetro = pInfo ? pInfo.isRetrograde : false;
        const rashiIdx = Math.floor(lon / 30);
        const degInRashi = lon % 30;
        const rashiName = RASHIS[rashiIdx]?.en || `Rashi ${rashiIdx + 1}`;

        doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
        doc.rect(margin, p2Y, contentWidth, 6, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(...colorTextPrimary);
        doc.text(row.name, margin + 3.5, p2Y + 4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colorTextMuted);
        doc.text(formatDegree(degInRashi), margin + 48, p2Y + 4);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colorGold);
        doc.text(`${rashiName} (${rashiIdx + 1})`, margin + 90, p2Y + 4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colorTextMuted);
        doc.text(`${speed >= 0 ? '+' : ''}${speed.toFixed(3)} deg/day`, margin + 130, p2Y + 4);

        if (isRetro) {
          doc.setTextColor(...colorRed);
          doc.setFont('helvetica', 'bold');
          doc.text('Vakri (Retrograde)', pageWidth - margin - 5, p2Y + 4, { align: 'right' });
        } else {
          doc.setTextColor(...colorGreen);
          doc.setFont('helvetica', 'normal');
          doc.text('Marga (Direct)', pageWidth - margin - 5, p2Y + 4, { align: 'right' });
        }

        p2Y += 6;
      });

      p2Y += 6;
    }

    // 2. Choghadiya Muhurtas Table (Day & Night)
    if (includeChoghadiyas) {
      doc.setFillColor(...colorDeepNavy);
      doc.roundedRect(margin, p2Y, contentWidth, 5.5, 1, 1, 'F');
      doc.setTextColor(255, 235, 180);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.text('CHOGHADIYA MUHURTA CYCLES (DAY & NIGHT 8-FOLD PARTITIONS)', margin + 3.5, p2Y + 3.8);

      p2Y += 7;

      const chog = calculateChoghadiyas(new Date(), sunMoon, vaara.idx);
      const chogColW = (contentWidth - 4) / 2;

      // Day Choghadiyas (Left)
      doc.setFillColor(...colorSlateBg);
      doc.setDrawColor(...colorBorder);
      doc.roundedRect(margin, p2Y, chogColW, 58, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...colorGold);
      doc.text('DAY CHOGHADIYAS (DINA)', margin + 3.5, p2Y + 4.5);

      let dY = p2Y + 8;
      chog.day.forEach((slot) => {
        doc.setFont('helvetica', slot.isAuspicious ? 'bold' : 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(slot.isAuspicious ? colorGreen[0] : colorTextPrimary[0], slot.isAuspicious ? colorGreen[1] : colorTextPrimary[1], slot.isAuspicious ? colorGreen[2] : colorTextPrimary[2]);
        doc.text(`${slot.idx + 1}. ${slot.name} (${slot.nature})`, margin + 3.5, dY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colorTextMuted);
        const timeStr = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
        doc.text(timeStr, margin + chogColW - 3.5, dY, { align: 'right' });
        dY += 6.2;
      });

      // Night Choghadiyas (Right)
      const nX = margin + chogColW + 4;
      doc.setFillColor(...colorSlateBg);
      doc.setDrawColor(...colorBorder);
      doc.roundedRect(nX, p2Y, chogColW, 58, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...colorGold);
      doc.text('NIGHT CHOGHADIYAS (RATRI)', nX + 3.5, p2Y + 4.5);

      let nY = p2Y + 8;
      chog.night.forEach((slot) => {
        doc.setFont('helvetica', slot.isAuspicious ? 'bold' : 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(slot.isAuspicious ? colorGreen[0] : colorTextPrimary[0], slot.isAuspicious ? colorGreen[1] : colorTextPrimary[1], slot.isAuspicious ? colorGreen[2] : colorTextPrimary[2]);
        doc.text(`${slot.idx + 1}. ${slot.name} (${slot.nature})`, nX + 3.5, nY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colorTextMuted);
        const timeStr = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
        doc.text(timeStr, nX + chogColW - 3.5, nY, { align: 'right' });
        nY += 6.2;
      });
    }

    // Footer on Page 2
    doc.setDrawColor(...colorBorder);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - margin - 3.5, pageWidth - margin, pageHeight - margin - 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...colorTextMuted);
    const footerLeft = `Kalayantra Vedic Chronometry System | Date: ${panchanga.dateStr} | Horizon: ${sanitizeForPdf(city.name)}`;
    doc.text(footerLeft, margin, pageHeight - margin - 1);

    const footerRight = `Page 2 of ${totalPages} | High-Precision Vedic Ephemeris`;
    doc.text(footerRight, pageWidth - margin, pageHeight - margin - 1, { align: 'right' });
  }

  return doc;
}

/**
 * Convenience helper to generate and trigger in-browser download of the Panchanga PDF.
 */
export function downloadPanchangaPDF(
  panchanga: PanchangaDay, 
  language: Language = 'en',
  options?: Partial<ExportPanchangaPdfOptions>
): string {
  const doc = generatePanchangaPDF({ panchanga, language, ...options });
  const filename = `Kalayantra_Panchanga_${panchanga.dateStr.replace(/[^0-9-]/g, '_')}_${sanitizeForPdf(panchanga.city.name).replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
  return filename;
}
