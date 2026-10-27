import React, { useState, useEffect } from 'react';
import { 
  ScheduledAlert, 
  NotificationPreferences, 
  TriggeredAlertRecord 
} from '../types/notifications';
import { CityInfo, AyanamshaMode } from '../types/kalayantra';
import { 
  generateDailyAlerts, 
  loadNotificationPreferences, 
  saveNotificationPreferences, 
  loadTriggeredAlerts, 
  clearTriggeredAlerts, 
  requestNotificationPermission, 
  dispatchWebNotification 
} from '../engine/notifications';
import { playAlertChime } from '../engine/audioAlert';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX, 
  Clock, 
  CheckCircle2, 
  History, 
  MapPin, 
  X, 
  Play, 
  Trash2, 
  Sliders
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: CityInfo;
  ayanamsha: AyanamshaMode;
  currentDate: Date;
  onTriggerTestAlert: (alert: ScheduledAlert) => void;
  onNavigateTab?: (tab: 'muhurta' | 'gochara' | 'panchanga') => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  city,
  ayanamsha,
  currentDate,
  onTriggerTestAlert,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'settings' | 'history'>('schedule');
  const [prefs, setPrefs] = useState<NotificationPreferences>(loadNotificationPreferences());
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [filterType, setFilterType] = useState<'all' | 'shubha' | 'ashubha' | 'transit' | 'choghadiya'>('all');
  const [history, setHistory] = useState<TriggeredAlertRecord[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHistory(loadTriggeredAlerts());
      setPrefs(loadNotificationPreferences());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const alerts = generateDailyAlerts(currentDate, city, ayanamsha, prefs);
  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  const handleUpdatePrefs = (newPrefs: NotificationPreferences) => {
    setPrefs(newPrefs);
    saveNotificationPreferences(newPrefs);
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      playAlertChime('shubha');
    }
  };

  const handleClearHistory = () => {
    clearTriggeredAlerts();
    setHistory([]);
  };

  const handleSendSampleTest = () => {
    const sampleAlert: ScheduledAlert = {
      id: `test_sample_${Date.now()}`,
      title: 'Abhijit Muhūrta (Auspicious)',
      subtitle: `Sample Alert: Auspicious window active for ${city.name}`,
      type: 'shubha',
      targetTime: new Date(),
      triggerTime: new Date(),
      leadMinutes: prefs.leadMinutes,
      description: 'The midday Abhijit window removes inauspiciousness and bestows divine victory.',
      recommendation: 'Ideal for commencing prayers, projects, and contracts.',
      cityName: city.name,
      isCustom: true,
    };

    if (prefs.sound) {
      playAlertChime('shubha');
    }
    dispatchWebNotification(sampleAlert);
    onTriggerTestAlert(sampleAlert);
  };

  const getRelativeTimeBadge = (targetTime: Date) => {
    const diffMs = targetTime.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (Math.abs(diffMins) <= 20 && diffMins <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Now
        </span>
      );
    }
    if (diffMins > 0) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          In {timeStr}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
        Passed
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden"
        role="dialog"
        aria-labelledby="notification-center-title"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 id="notification-center-title" className="text-base sm:text-lg font-heading font-bold text-slate-100 flex items-center gap-2">
                Muhūrta & Transit Alert Center
                <span className="text-xs font-normal text-amber-400 font-indic">(मुहूर्त-सूचना)</span>
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>Calculated for <strong>{city.name}</strong> ({city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Alert Center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={prefs.enabled}
                onChange={(e) => handleUpdatePrefs({ ...prefs, enabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500 bg-slate-800 border-slate-700"
              />
              <span className={`font-semibold ${prefs.enabled ? 'text-amber-300' : 'text-slate-400'}`}>
                {prefs.enabled ? 'Alerts Active' : 'Alerts Paused'}
              </span>
            </label>

            <button
              onClick={() => {
                const nextSound = !prefs.sound;
                handleUpdatePrefs({ ...prefs, sound: nextSound });
                if (nextSound) playAlertChime('shubha');
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                prefs.sound
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {prefs.sound ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              <span>{prefs.sound ? 'Chime On' : 'Chime Off'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                <CheckCircle2 className="w-3 h-3" /> System Push
              </span>
            ) : permission === 'denied' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                In-App & Audio Mode
              </span>
            ) : (
              <button
                onClick={handleRequestPermission}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/50 hover:bg-indigo-600/40 text-indigo-200 text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Bell className="w-3 h-3 text-indigo-300" /> Enable Push
              </button>
            )}

            <button
              onClick={handleSendSampleTest}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-slate-950 font-semibold text-xs shadow-sm cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Test Alert</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Today's Schedule ({alerts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History ({history.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'schedule' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Filter:</span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'shubha', label: 'Auspicious' },
                  { id: 'ashubha', label: 'Caution' },
                  { id: 'choghadiya', label: 'Choghadiya' },
                  { id: 'transit', label: 'Transits' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id as typeof filterType)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      filterType === f.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No alerts match your filter criteria or notification preferences.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredAlerts.map((alert) => {
                    const isAshubha = alert.type === 'ashubha';
                    const isTransit = alert.type === 'transit';
                    const borderStyle = isAshubha
                      ? 'border-red-500/30 bg-red-950/10 hover:border-red-500/50'
                      : isTransit
                      ? 'border-indigo-500/30 bg-indigo-950/10 hover:border-indigo-500/50'
                      : 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50';

                    return (
                      <div
                        key={alert.id}
                        className={`rounded-xl p-3.5 border transition-all ${borderStyle} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold font-heading text-slate-100">
                              {alert.title}
                            </h4>
                            {getRelativeTimeBadge(alert.targetTime)}
                            <span className="text-[10px] text-slate-400 font-medium">
                              {alert.targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300">
                            {alert.description}
                          </p>

                          {alert.recommendation && (
                            <p className="text-[11px] text-amber-400/90 font-medium italic">
                              Tip: {alert.recommendation}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => {
                              if (prefs.sound) playAlertChime(alert.type);
                              onTriggerTestAlert(alert);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 text-amber-400 fill-current" /> Test
                          </button>

                          {onNavigateTab && (
                            <button
                              onClick={() => {
                                onNavigateTab(alert.type === 'transit' ? 'gochara' : 'muhurta');
                                onClose();
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Alert Lead Time (Advance Notice)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { value: 0, label: 'At start' },
                    { value: 5, label: '5m before' },
                    { value: 15, label: '15m before' },
                    { value: 30, label: '30m before' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleUpdatePrefs({ ...prefs, leadMinutes: option.value as typeof prefs.leadMinutes })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        prefs.leadMinutes === option.value
                          ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Auspicious Daily Windows (शुभ मुहूर्त)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'brahma', label: 'Brahma Muhūrta (Pre-dawn meditation)' },
                    { key: 'abhijit', label: 'Abhijit Muhūrta (Midday victory window)' },
                    { key: 'vijaya', label: 'Vijaya Muhūrta (Afternoon triumph)' },
                    { key: 'godhuli', label: 'Godhūli Muhūrta (Twilight peacefulness)' },
                    { key: 'choghadiyaAmritShubh', label: 'Amrit & Shubh Choghadiyas' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={prefs.muhurtas[item.key as keyof typeof prefs.muhurtas]}
                        onChange={(e) =>
                          handleUpdatePrefs({
                            ...prefs,
                            muhurtas: {
                              ...prefs.muhurtas,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 rounded text-amber-500 accent-amber-500 bg-slate-800 border-slate-700"
                      />
                      <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Caution & Inauspicious Periods (त्याज्य काल)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'rahuKaal', label: 'Rāhu Kāla (राहुकाल - Avoid beginnings)' },
                    { key: 'yamaganda', label: 'Yamagaṇḍa (यमगण्ड - Loss & delays)' },
                    { key: 'gulika', label: 'Gulika Kāla (गुलिक काल - Repetitions)' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={prefs.muhurtas[item.key as keyof typeof prefs.muhurtas]}
                        onChange={(e) =>
                          handleUpdatePrefs({
                            ...prefs,
                            muhurtas: {
                              ...prefs.muhurtas,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 rounded text-red-500 accent-red-500 bg-slate-800 border-slate-700"
                      />
                      <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Planetary Transits (गोचर प्रवेश)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { key: 'moonRashi', label: 'Chandra Gochara (Moon entering new Rashi)' },
                    { key: 'sunSankranti', label: 'Sūrya Saṅkrānti (Sun Solar Ingress)' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={prefs.transits[item.key as keyof typeof prefs.transits]}
                        onChange={(e) =>
                          handleUpdatePrefs({
                            ...prefs,
                            transits: {
                              ...prefs.transits,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 rounded text-indigo-500 accent-indigo-500 bg-slate-800 border-slate-700"
                      />
                      <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Triggered alerts for today's session
                </span>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No alerts have been triggered yet today.
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <h5 className="font-semibold text-slate-200">{record.title}</h5>
                        <p className="text-slate-400 text-[11px]">{record.subtitle}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Offline-first Vedic timer running in background</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
