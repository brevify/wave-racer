import React from 'react';

interface FooterProps {
  onOpenDiagnostics: () => void;
  onOpenSubscription: () => void;
  lastUpdated?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDiagnostics,
  onOpenSubscription,
  lastUpdated,
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12 px-4 sm:px-8 mt-16">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <div>
            <div className="flex items-center gap-2 text-white font-extrabold text-lg mb-1">
              <span className="text-cyan-400">🌊</span>
              <span>WaveReady</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Singapore marine intelligence and booking engine for offshore fishing charters,
              yacht racing, jetskiing, and coastal water sports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={onOpenDiagnostics}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Diagnostic Feeds Inspector
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={onOpenSubscription}
              className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Charter Peace-of-Mind Guarantee
            </button>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500 font-mono">
              Last Telemetry Sync: {lastUpdated || 'Live'}
            </span>
          </div>
        </div>

        {/* Mandatory Data Attribution - Sub-goal 6 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="font-medium text-slate-400">
            Data: NEA, Data.gov.sg, METEO
          </div>

          <div className="text-[11px]">
            &copy; {new Date().getFullYear()} WaveReady Technologies. OneMap &copy; Singapore Land Authority. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
