import { jsPDF } from 'jspdf';
import { PanchangaDay, Language } from '../types/kalayantra';
import { formatCityTime } from './astronomy';
import { calculateMuhurtas } from './muhurta';

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
}

/**
 * Generates an authoritative, beautifully styled Vedic Panchanga Report in PDF format.
 */
export function generatePanchangaPDF(options: ExportPanchangaPdfOptions): jsPDF {
  const { panchanga } = options;
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

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2); // 182mm

  const formatTime = (d?: Date | null) => {
    if (!d) return '--:--';
    return formatCityTime(d, city.tz, false);
  };

  // Color Palette Definitions
  const colorGold = [180, 130, 40] as const; // #B48228
  const colorDeepNavy = [15, 23, 42] as const; // Slate 900
  const colorSlateBg = [248, 250, 252] as const; // Slate 50
  const colorBorder = [226, 232, 240] as const; // Slate 200
  const colorTextPrimary = [30, 41, 59] as const; // Slate 800
  const colorTextMuted = [100, 116, 139] as const; // Slate 500
  const colorBannerBg = [254, 243, 199] as const; // Amber 100
  const colorGreen = [22, 101, 52] as const; // Auspicious Green
  const colorRed = [153, 27, 27] as const; // Inauspicious Red

  let y = 14;

  // Outer Page Frame / Ornamental Border
  doc.setDrawColor(217, 180, 100);
  doc.setLineWidth(0.8);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin * 2) + 8);
  doc.setDrawColor(241, 219, 163);
  doc.setLineWidth(0.3);
  doc.rect(margin - 2.5, margin - 2.5, contentWidth + 5, pageHeight - (margin * 2) + 5);

  // Top Header Banner
  doc.setFillColor(...colorDeepNavy);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');

  // Title
  doc.setTextColor(255, 215, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('KALAYANTRA  -  VEDIC PANCHANGA REPORT', margin + 6, y + 8);

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const subtitle = `Comprehensive Daily Astrological Almanac & Ephemeris | Date: ${panchanga.dateStr}`;
  doc.text(subtitle, margin + 6, y + 14);

  // Top Right Tag: Calculation Mode & Ayanamsha
  doc.setTextColor(255, 235, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const modeLabel = mode === 'udaya' ? 'Anchored to Sunrise (Udaya)' : 'Real-time (Current)';
  const ayanaLabel = `Ayanamsha: ${ayanamshaMode.toUpperCase()} (${ayanamshaValue.toFixed(4)} deg)`;
  doc.text(modeLabel, pageWidth - margin - 6, y + 8, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(ayanaLabel, pageWidth - margin - 6, y + 14, { align: 'right' });

  y += 28;

  // 1. Location & Calendar System Bar (2 columns)
  const locColW = (contentWidth - 4) / 2;
  doc.setFillColor(...colorSlateBg);
  doc.setDrawColor(...colorBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, locColW, 25, 1.5, 1.5, 'FD');
  doc.roundedRect(margin + locColW + 4, y, locColW, 25, 1.5, 1.5, 'FD');

  // Left Box: Geographic Location
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...colorGold);
  doc.text('GEOGRAPHIC HORIZON', margin + 4, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colorTextPrimary);
  doc.text(sanitizeForPdf(city.name), margin + 4, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...colorTextMuted);
  doc.text(sanitizeForPdf(city.stateCountry), margin + 4, y + 15);
  const coordsStr = `Lat: ${city.lat >= 0 ? city.lat.toFixed(4) + ' N' : Math.abs(city.lat).toFixed(4) + ' S'} | Lon: ${city.lon >= 0 ? city.lon.toFixed(4) + ' E' : Math.abs(city.lon).toFixed(4) + ' W'} | Elev: ${city.alt}m`;
  doc.text(coordsStr, margin + 4, y + 19.5);
  const tzSign = city.tz >= 0 ? '+' : '-';
  const tzAbsH = Math.floor(Math.abs(city.tz));
  const tzAbsM = Math.round((Math.abs(city.tz) - tzAbsH) * 60);
  const tzString = `Timezone: UTC ${tzSign}${String(tzAbsH).padStart(2, '0')}:${String(tzAbsM).padStart(2, '0')}`;
  doc.text(tzString, margin + 4, y + 23);

  // Right Box: Vedic Calendar Epochs
  const rx = margin + locColW + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...colorGold);
  doc.text('VEDIC SAMVAT & SOLAR CALENDAR', rx + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colorTextPrimary);

  doc.text(`Vikrama Samvat:`, rx + 4, y + 10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(String(solar.vikramaSamvat), rx + 32, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Shaka Samvat:`, rx + 48, y + 10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${solar.shakaYear} (${sanitizeForPdf(solar.samvatsara)})`, rx + 74, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Lunar Month:`, rx + 4, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sanitizeForPdf(panchanga.lunarMonth)} (${tithi.paksha} Paksha)`, rx + 26, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.text(`Solar Month (Rashi):`, rx + 4, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sanitizeForPdf(solar.sauraMasa)} (Day ${solar.dayOfMonth})`, rx + 34, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.text(`Ayana & Ritu:`, rx + 4, y + 24.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${solar.ayana} | ${sanitizeForPdf(solar.ritu)}`, rx + 26, y + 24.5);

  y += 29;

  // 2. The Five Limbs of Panchanga (Full width table/cards)
  doc.setFillColor(...colorDeepNavy);
  doc.roundedRect(margin, y, contentWidth, 6.5, 1, 1, 'F');
  doc.setTextColor(255, 235, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PANCHANGA: THE FIVE VEDIC LIMBS (PANCA-ANGA)', margin + 4, y + 4.5);

  y += 8.5;

  // 5 Limbs cards: Tithi, Nakshatra, Yoga, Karana, Vaara
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

  const limbHeight = 11.5;
  limbCards.forEach((card, index) => {
    const cardY = y + (index * (limbHeight + 1.5));
    // Alternate light background
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.setDrawColor(...colorBorder);
    doc.setLineWidth(0.25);
    doc.roundedRect(margin, cardY, contentWidth, limbHeight, 1, 1, 'FD');

    // Left Accent bar
    doc.setFillColor(...colorGold);
    doc.rect(margin, cardY, 2, limbHeight, 'F');

    // Limb Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorGold);
    doc.text(card.limb, margin + 4, cardY + 3.8);

    // Primary Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...colorTextPrimary);
    doc.text(card.primary, margin + 52, cardY + 3.8);

    // Timing
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorTextMuted);
    doc.text(card.secondary, margin + 4, cardY + 8.2);

    // Extra details (right-aligned or continuation)
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    if (card.extra.includes('WARNING')) {
      doc.setTextColor(...colorRed);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(71, 85, 105);
    }
    doc.text(card.extra, pageWidth - margin - 3, cardY + 8.2, { align: 'right' });
  });

  y += (limbCards.length * (limbHeight + 1.5)) + 4;

  // 3. Astronomical Ephemeris & Vedic Timekeeping (2 Columns)
  const ephColW = (contentWidth - 4) / 2;

  // Left Column: Surya & Chandra Timings
  doc.setFillColor(...colorDeepNavy);
  doc.roundedRect(margin, y, ephColW, 6.5, 1, 1, 'F');
  doc.setTextColor(255, 235, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SURYA & CANDRA (CELESTIAL EPHEMERIS)', margin + 4, y + 4.5);

  // Right Column: Traditional Ghatika & Prahara Clock
  doc.setFillColor(...colorDeepNavy);
  doc.roundedRect(margin + ephColW + 4, y, ephColW, 6.5, 1, 1, 'F');
  doc.setTextColor(255, 235, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('VEDIC TIMEKEEPING (GHATIKA & PRAHARA)', margin + ephColW + 8, y + 4.5);

  y += 8.5;

  const rowBoxH = 42;
  // Left Box Content
  doc.setFillColor(...colorSlateBg);
  doc.setDrawColor(...colorBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, ephColW, rowBoxH, 1.5, 1.5, 'FD');

  const sunData = [
    ['Sunrise (Surya Udaya):', formatTime(sunMoon.sunrise), 'Sunset (Surya Asta):', formatTime(sunMoon.sunset)],
    ['Solar Noon (Madhyahna):', formatTime(sunMoon.noon), 'Dawn (Civil Twilight):', formatTime(sunMoon.dawn)],
    ['Moonrise (Chandra Udaya):', formatTime(sunMoon.moonrise), 'Moonset (Chandra Asta):', formatTime(sunMoon.moonset)],
    ['Moon Phase:', sanitizeForPdf(sunMoon.moonPhase), 'Illumination:', `${sunMoon.moonIlluminationPercent}%`],
    ['Day Length (Dinamana):', `${Math.floor(sunMoon.dayLengthMinutes / 60)}h ${Math.round(sunMoon.dayLengthMinutes % 60)}m`, 'Night Length:', `${Math.floor(sunMoon.nightLengthMinutes / 60)}h ${Math.round(sunMoon.nightLengthMinutes % 60)}m`]
  ];

  let epY = y + 5;
  sunData.forEach(([label1, val1, label2, val2]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorTextMuted);
    doc.text(label1, margin + 4, epY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorTextPrimary);
    doc.text(val1, margin + 42, epY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorTextMuted);
    doc.text(label2, margin + 48, epY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorTextPrimary);
    doc.text(val2, margin + 78, epY);

    epY += 7.5;
  });

  // Right Box Content: Vedic Traditional Clock
  const rClockX = margin + ephColW + 4;
  doc.setFillColor(...colorSlateBg);
  doc.setDrawColor(...colorBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(rClockX, y, ephColW, rowBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colorGold);
  doc.text('CURRENT VEDIC ELAPSED TIME', rClockX + 4, y + 6);

  // Big Clock Display Box
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(rClockX + 4, y + 8.5, ephColW - 8, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text(traditionalTime.ghadiString, rClockX + (ephColW / 2), y + 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(146, 64, 14);
  doc.text('(1 Ghati = 24 mins | 1 Vipal = 24 secs | 1 Tatpara = 0.4 secs)', rClockX + (ephColW / 2), y + 19.5, { align: 'center' });

  let rClockY = y + 27;
  const vTimeRows = [
    ['Prahara (Quarter of Day):', `Prahara ${traditionalTime.prahara} of 4 (${traditionalTime.isDay ? 'Day / Dina' : 'Night / Ratri'})`],
    ['Day Span (Dinamana):', `${traditionalTime.dinamanaGhadis} Ghadis (approx ${(traditionalTime.dinamanaGhadis * 24 / 60).toFixed(1)} hrs)`],
    ['Night Span (Ratrimana):', `${traditionalTime.ratrimanaGhadis} Ghadis (approx ${(traditionalTime.ratrimanaGhadis * 24 / 60).toFixed(1)} hrs)`],
  ];

  vTimeRows.forEach(([lbl, val]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorTextMuted);
    doc.text(lbl, rClockX + 4, rClockY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorTextPrimary);
    doc.text(val, rClockX + 40, rClockY);
    rClockY += 5.5;
  });

  y += rowBoxH + 4;

  // 4. Auspicious & Inauspicious Muhurtas Table
  doc.setFillColor(...colorDeepNavy);
  doc.roundedRect(margin, y, contentWidth, 6.5, 1, 1, 'F');
  doc.setTextColor(255, 235, 180);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('MUHURTAS: AUSPICIOUS & INAUSPICIOUS TIMINGS', margin + 4, y + 4.5);

  y += 8.5;

  const muhurtas = calculateMuhurtas(new Date(), sunMoon, vaara.idx);

  // Group Muhurtas: Auspicious vs Inauspicious
  const auspicious = muhurtas.filter(m => m.type === 'auspicious');
  const inauspicious = muhurtas.filter(m => m.type === 'inauspicious');

  const muhColW = (contentWidth - 4) / 2;
  const muhBoxH = 48;

  // Auspicious Box (Left)
  doc.setFillColor(...colorSlateBg);
  doc.setDrawColor(...colorBorder);
  doc.roundedRect(margin, y, muhColW, muhBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colorGreen);
  doc.text('SHUBH MUHURTAS (AUSPICIOUS)', margin + 4, y + 5);

  let aY = y + 10;
  auspicious.forEach(m => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorTextPrimary);
    doc.text(sanitizeForPdf(m.name), margin + 4, aY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorGreen);
    const timeSpan = `${formatTime(m.startTime)} - ${formatTime(m.endTime)}`;
    doc.text(timeSpan, margin + muhColW - 4, aY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...colorTextMuted);
    const shortDesc = doc.splitTextToSize(sanitizeForPdf(m.description), muhColW - 8);
    doc.text(shortDesc[0] ?? '', margin + 4, aY + 3.8);

    aY += 9;
  });

  // Inauspicious Box (Right)
  const inausX = margin + muhColW + 4;
  doc.setFillColor(...colorSlateBg);
  doc.setDrawColor(...colorBorder);
  doc.roundedRect(inausX, y, muhColW, muhBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colorRed);
  doc.text('ASHUBH KALAS (INAUSPICIOUS - AVOID)', inausX + 4, y + 5);

  let inY = y + 10;
  inauspicious.forEach(m => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorTextPrimary);
    doc.text(sanitizeForPdf(m.name), inausX + 4, inY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorRed);
    const timeSpan = `${formatTime(m.startTime)} - ${formatTime(m.endTime)}`;
    doc.text(timeSpan, inausX + muhColW - 4, inY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...colorTextMuted);
    const shortDesc = doc.splitTextToSize(sanitizeForPdf(m.description), muhColW - 8);
    doc.text(shortDesc[0] ?? '', inausX + 4, inY + 3.8);

    inY += 9;
  });

  y += muhBoxH + 4;

  // 5. Active Festivals & Observances (if any) or Astrological Notes
  if (festivals.length > 0) {
    doc.setFillColor(...colorBannerBg);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.text('ACTIVE FESTIVALS & VRATAS:', margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorTextPrimary);
    const festNames = festivals.map(f => `${sanitizeForPdf(f.name)} (${f.type})`).join('  |  ');
    const festLines = doc.splitTextToSize(festNames, contentWidth - 8);
    doc.text(festLines, margin + 4, y + 9);

    y += 16;
  } else {
    // Elegant Note Box
    doc.setFillColor(...colorSlateBg);
    doc.setDrawColor(...colorBorder);
    doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(...colorTextMuted);
    doc.text('Note: All times are computed using rigorous spherical trigonometry and precise modern ephemerides. Tithi and Nakshatra transitions may span across consecutive Gregorian days.', margin + 4, y + 5.5);

    y += 11;
  }

  // Footer / Attributions
  doc.setDrawColor(...colorBorder);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - margin - 4, pageWidth - margin, pageHeight - margin - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...colorTextMuted);
  const footerLeft = `Kalayantra Vedic Chronometry System | Calculated at: ${new Date().toISOString()} | Ref: ${panchanga.dateStr}`;
  doc.text(footerLeft, margin, pageHeight - margin - 1);

  const footerRight = `Page 1 of 1 | Location: ${sanitizeForPdf(city.name)}`;
  doc.text(footerRight, pageWidth - margin, pageHeight - margin - 1, { align: 'right' });

  return doc;
}

/**
 * Convenience helper to generate and trigger in-browser download of the Panchanga PDF.
 */
export function downloadPanchangaPDF(panchanga: PanchangaDay, language: Language = 'en'): string {
  const doc = generatePanchangaPDF({ panchanga, language });
  const filename = `Kalayantra_Panchanga_${panchanga.dateStr.replace(/[^0-9-]/g, '_')}_${sanitizeForPdf(panchanga.city.name).replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
  return filename;
}
