import React, { useState, useEffect, useMemo } from 'react';
import { 
  AyanamshaMode, 
  CityInfo, 
  Language, 
  PanchangaDay, 
  PanchangaMode 
} from './types/kalayantra';
import { DEFAULT_CITY, BUILTIN_CITIES } from './engine/kosha';
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
import { SavedView } from './components/SavedView';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NotificationToastContainer } from './components/NotificationToast';
import { ActiveToast, ScheduledAlert } from './types/notifications';
import { 
  generateDailyAlerts, 
  findDueAlerts, 
  loadNotificationPreferences, 
  saveTriggeredAlertRecord, 
  dispatchWebNotification 
} from './engine/notifications';
import { playAlertChime } from './engine/audioAlert';

export default function App() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [liveTime, setLiveTime] = useState<Date>(new Date());
  const [selectedCity, setSelectedCity] = useState<CityInfo>(DEFAULT_CITY);
  const [mode, setMode] = useState<PanchangaMode>('udaya');
  const [ayanamsha, setAyanamsha] = useState<AyanamshaMode>('lahiri');
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<AppTab>('panchanga');

  // Notification state
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [activeToasts, setActiveToasts] = useState<ActiveToast[]>([]);
  const [triggeredIds, setTriggeredIds] = useState<Set<string>>(() => new Set<string>());
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(0);

  // Trigger toast helper
  const handleTriggerToast = (alert: ScheduledAlert) => {
    const timeFormatted = alert.targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const actionTab = alert.type === 'transit' ? 'gochara' : 'muhurta';

    const newToast: ActiveToast = {
      id: `${alert.id}_${Date.now()}`,
      title: alert.title,
      subtitle: alert.subtitle,
      type: alert.type,
      timeFormatted,
      description: alert.description,
      actionTab,
    };

    setActiveToasts((prev) => [newToast, ...prev.slice(0, 3)]);

    // Record in history
    saveTriggeredAlertRecord({
      id: newToast.id,
      alertId: alert.id,
      title: alert.title,
      subtitle: alert.subtitle,
      type: alert.type,
      timestamp: new Date().toISOString(),
      cityName: alert.cityName,
      read: false,
    });

    // Auto dismiss after 9s
    setTimeout(() => {
      setActiveToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 9000);
  };

  const handleDismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Background interval: keep live time ticking & monitor location-aware Muhurta & Transit alerts
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date();
      setLiveTime(now);

      const prefs = loadNotificationPreferences();
      if (!prefs.enabled) return;

      // Compute today's alerts for selected city and live time
      const todayAlerts = generateDailyAlerts(now, selectedCity, ayanamsha, prefs);

      // Count upcoming or currently active windows within the next 45 minutes
      const nowMs = now.getTime();
      const nearCount = todayAlerts.filter((a) => {
        const diffMs = a.targetTime.getTime() - nowMs;
        return diffMs >= -20 * 60000 && diffMs <= 60 * 60000;
      }).length;
      setActiveAlertsCount(nearCount);

      // Check for alerts that are due right now
      const due = findDueAlerts(todayAlerts, now, triggeredIds);

      if (due.length > 0) {
        due.forEach((alert) => {
          setTriggeredIds((prev) => new Set([...prev, alert.id]));

          if (prefs.sound) {
            playAlertChime(alert.type);
          }

          dispatchWebNotification(alert);

          if (prefs.inAppToasts) {
            handleTriggerToast(alert);
          }
        });
      }
    };

    // Initial check
    checkAlerts();

    const timer = setInterval(checkAlerts, 10000);
    return () => clearInterval(timer);
  }, [selectedCity, ayanamsha, triggeredIds]);

  // Compute daily Panchanga
  const panchanga: PanchangaDay = useMemo(() => {
    return calculatePanchanga(currentDate, selectedCity, mode, ayanamsha);
  }, [currentDate, selectedCity, mode, ayanamsha]);

  // Jump to Panchanga from Saved items
  const handleNavigateToPanchanga = (date: Date, cityName?: string) => {
    if (cityName) {
      const found = BUILTIN_CITIES.find(
        (c) => c.name.toLowerCase() === cityName.toLowerCase() ||
               c.stateCountry.toLowerCase().includes(cityName.toLowerCase())
      );
      if (found) {
        setSelectedCity(found);
      }
    }
    setCurrentDate(date);
    setActiveTab('panchanga');
  };

  // Jump to Gocara from Saved items
  const handleNavigateToGochara = (date: Date) => {
    setCurrentDate(date);
    setActiveTab('gochara');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Branding Navigation */}
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        activeAlertsCount={activeAlertsCount}
      />

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
          <HoraMuhurtaView 
            panchanga={panchanga} 
            currentTime={liveTime} 
            onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
          />
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

        {activeTab === 'saved' && (
          <SavedView
            onNavigateToPanchanga={handleNavigateToPanchanga}
            onNavigateToGochara={handleNavigateToGochara}
          />
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

      {/* Floating In-App Notification Toasts */}
      <NotificationToastContainer
        toasts={activeToasts}
        onDismiss={handleDismissToast}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Vedic Muhūrta & Transit Alert Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        city={selectedCity}
        ayanamsha={ayanamsha}
        currentDate={currentDate}
        onTriggerTestAlert={handleTriggerToast}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
