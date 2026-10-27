import React from 'react';
import { ActiveToast } from '../types/notifications';
import { Bell, Sparkles, AlertTriangle, Compass, X, ArrowRight, Volume2 } from 'lucide-react';

interface NotificationToastContainerProps {
  toasts: ActiveToast[];
  onDismiss: (id: string) => void;
  onNavigate?: (tab: 'muhurta' | 'gochara' | 'panchanga') => void;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  toasts,
  onDismiss,
  onNavigate,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isAuspicious = toast.type === 'shubha' || toast.type === 'choghadiya';
        const isAshubha = toast.type === 'ashubha';
        const isTransit = toast.type === 'transit';

        const borderClass = isAshubha
          ? 'border-red-500/60 bg-gradient-to-br from-red-950/95 via-slate-900/95 to-slate-950/95 text-red-200'
          : isTransit
          ? 'border-indigo-500/60 bg-gradient-to-br from-indigo-950/95 via-slate-900/95 to-slate-950/95 text-indigo-200'
          : 'border-amber-500/60 bg-gradient-to-br from-amber-950/95 via-slate-900/95 to-slate-950/95 text-amber-200';

        const iconBg = isAshubha
          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
          : isTransit
          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl p-3.5 shadow-2xl backdrop-blur-md border ${borderClass} transition-all duration-300 animate-in slide-in-from-top-3 fade-in`}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                  {isAshubha ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : isTransit ? (
                    <Compass className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/40">
                      {isAshubha ? 'Caution Window' : isTransit ? 'Gochara Transit' : 'Auspicious Muhūrta'}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-amber-400 inline" />
                      {toast.timeFormatted}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold font-heading text-slate-100 mt-0.5 truncate">
                    {toast.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                    {toast.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 shrink-0 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {toast.actionTab && onNavigate && (
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 truncate pr-2">
                  {toast.description ? toast.description.slice(0, 50) + '...' : ''}
                </span>
                <button
                  onClick={() => {
                    onNavigate(toast.actionTab!);
                    onDismiss(toast.id);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-100 transition-colors shrink-0"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
