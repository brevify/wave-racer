import React from 'react';
import { TideDataResponse, TideItem } from '../types';

interface TideChartProps {
  tides: TideDataResponse | null;
  error?: string;
}

export const TideChart: React.FC<TideChartProps> = ({ tides, error }) => {
  const todayList = tides?.today || [];

  if (error || todayList.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="text-amber-400 font-semibold mb-1">Coastal Tide Data Service Notice</div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {error || 'NEA live coastal tide feed returned empty or is synchronizing. Please check back shortly.'}
        </p>
      </div>
    );
  }

  // Find next upcoming tide
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-base font-bold text-slate-100 tracking-tight">
            Singapore Coastal Tide Schedule
          </h4>
          <p className="text-xs text-slate-400">
            Real-time hydrostatic readings from National Environment Agency Singapore (NEA)
          </p>
        </div>
        <div className="text-xs text-cyan-400 font-mono bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-lg shrink-0 self-start sm:self-auto">
          Live Marine Station: Singapore Strait
        </div>
      </div>

      {/* Tide Timeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {todayList.map((item: TideItem, idx: number) => {
          const [h, m] = item.tide_time.split(':').map(Number);
          const tideMinutes = h * 60 + m;
          const isPassed = tideMinutes < currentMinutes;
          const isHigh = item.tide_type === 'high';

          return (
            <div
              key={item.id || idx}
              className={`p-3.5 rounded-xl border transition-all ${
                isPassed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-950 border-cyan-500/30 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-slate-400 font-medium">
                  {item.tide_time.slice(0, 5)} hrs
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isHigh
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {item.tide_type}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-100">
                  {item.height_metres}
                </span>
                <span className="text-xs text-slate-400 font-medium">metres</span>
              </div>

              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                <span>{isHigh ? 'Peak Water' : 'Slack / Shallows'}</span>
                {isPassed ? (
                  <span className="text-slate-500">Passed</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Upcoming</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
