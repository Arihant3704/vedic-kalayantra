import React, { useState, useEffect, useMemo } from 'react';
import { 
  AyanamshaMode, 
  CityInfo, 
  Language, 
  PanchangaDay, 
  PanchangaMode 
} from './types/kalayantra';
import { DEFAULT_CITY } from './engine/kosha';
import { calculatePanchanga } from './engine/panchanga';
import { Navbar, AppTab } from './components/Navbar';
import { HeaderControls } from './components/HeaderControls';
import { PanchangaView } from './components/PanchangaView';
import { KaladarshanaView } from './components/KaladarshanaView';
import { HoraMuhurtaView } from './components/HoraMuhurtaView';
import { KundaliView } from './components/KundaliView';
import { DashaView } from './components/DashaView';
import { GocharaView } from './components/GocharaView';
import { AshtakootaView } from './components/AshtakootaView';
import { KalaBodhaView } from './components/KalaBodhaView';
import { KalaVidyaView } from './components/KalaVidyaView';
import { FestivalDirectoryView } from './components/FestivalDirectoryView';
import { MyTithisView } from './components/MyTithisView';

export default function App() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [liveTime, setLiveTime] = useState<Date>(new Date());
  const [selectedCity, setSelectedCity] = useState<CityInfo>(DEFAULT_CITY);
  const [mode, setMode] = useState<PanchangaMode>('udaya');
  const [ayanamsha, setAyanamsha] = useState<AyanamshaMode>('lahiri');
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<AppTab>('panchanga');

  // Keep live time ticking every 10 seconds for real-time Horas / Muhurtas
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Compute daily Panchanga
  const panchanga: PanchangaDay = useMemo(() => {
    return calculatePanchanga(currentDate, selectedCity, mode, ayanamsha);
  }, [currentDate, selectedCity, mode, ayanamsha]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Branding Navigation */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Global Location, Date & Calculation Controls */}
      <HeaderControls
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        mode={mode}
        onModeChange={setMode}
        ayanamsha={ayanamsha}
        onAyanamshaChange={setAyanamsha}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'panchanga' && (
          <PanchangaView panchanga={panchanga} language={language} />
        )}

        {activeTab === 'kaladarshana' && (
          <KaladarshanaView
            currentDate={currentDate}
            onSelectDate={(d) => {
              setCurrentDate(d);
            }}
            city={selectedCity}
            ayanamsha={ayanamsha}
            language={language}
          />
        )}

        {activeTab === 'muhurta' && (
          <HoraMuhurtaView panchanga={panchanga} currentTime={liveTime} />
        )}

        {activeTab === 'kundali' && (
          <KundaliView
            currentDate={currentDate}
            selectedCity={selectedCity}
            ayanamsha={ayanamsha}
          />
        )}

        {activeTab === 'dasha' && (
          <DashaView
            birthDate={currentDate}
            moonLongitude={panchanga.nakshatra.degreeInPada + (panchanga.nakshatra.idx * (360 / 27))}
            currentDate={liveTime}
          />
        )}

        {activeTab === 'gochara' && (
          <GocharaView
            currentDate={currentDate}
            selectedCity={selectedCity}
            ayanamsha={ayanamsha}
            natalMoonRashi={Math.floor(panchanga.nakshatra.idx / 2.25) % 12}
            natalLagnaRashi={panchanga.solar.sauraMasaIdx}
          />
        )}

        {activeTab === 'ashtakoota' && (
          <AshtakootaView />
        )}

        {activeTab === 'bodha' && (
          <KalaBodhaView
            currentDate={currentDate}
            selectedCity={selectedCity}
            ayanamsha={ayanamsha}
          />
        )}

        {activeTab === 'vidya' && (
          <KalaVidyaView />
        )}

        {activeTab === 'festivals' && (
          <FestivalDirectoryView />
        )}

        {activeTab === 'mytithis' && (
          <MyTithisView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-slate-300">Kālayantra (कालयन्त्र)</span>
            <span>•</span>
            <span>Offline-First High-Precision Hindu Panchanga Engine</span>
          </div>

          <div className="font-indic text-amber-500/80 text-xs">
            ॥ यतो धर्मस्ततो जयः ॥
          </div>

          <div>
            Powered by Swiss Ephemeris / Astronomical Algorithms & Dharmaśāstra Rules
          </div>
        </div>
      </footer>
    </div>
  );
}
