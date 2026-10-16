import React from 'react';
import { EndpointStatus } from '../types';

interface DataDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: Record<string, EndpointStatus>;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DataDiagnosticsModal: React.FC<DataDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  diagnostics,
  onRefresh,
  isRefreshing,
}) => {
  if (!isOpen) return null;

  const endpointsList = Object.values(diagnostics);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 text-sm cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-0.5">
              API Connection Inspector
            </div>
            <h3 className="text-lg font-bold">Government Data Feed Status</h3>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>↻</span>
            <span>{isRefreshing ? 'Fetching...' : 'Re-verify'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          WaveReady enforces strict real-data integrity. When sensor feeds are refused, slow, or empty,
          the system displays explicit plain words without fabricated sample rows.
        </p>

        {/* Endpoints List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {endpointsList.map((ep) => {
            let statusBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                HEALTHY
              </span>
            );

            if (ep.status === 'slow') {
              statusBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                  SLOW CONNECTION
                </span>
              );
            } else if (ep.status === 'refused') {
              statusBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                  CONNECTION REFUSED
                </span>
              );
            } else if (ep.status === 'empty') {
              statusBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  EMPTY DATA
                </span>
              );
            } else if (ep.status === 'loading') {
              statusBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                  CHECKING...
                </span>
              );
            }

            return (
              <div
                key={ep.endpoint}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-200">{ep.name}</span>
                  {statusBadge}
                </div>

                <div className="text-[11px] text-slate-400 font-mono truncate">
                  Proxy route: <span className="text-cyan-400">{ep.internalPath}</span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono truncate">
                  Target provider: {ep.sourceUrl}
                </div>

                {/* Plain Words Message */}
                <div
                  className={`p-2 rounded-lg text-[11px] leading-relaxed ${
                    ep.status === 'refused'
                      ? 'bg-rose-950/40 text-rose-300 border border-rose-900/40'
                      : ep.status === 'slow'
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-900/40'
                      : ep.status === 'empty'
                      ? 'bg-slate-900 text-slate-400'
                      : 'bg-emerald-950/30 text-emerald-300'
                  }`}
                >
                  {ep.message}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Latency: {ep.latencyMs ? `${ep.latencyMs}ms` : '—'}</span>
                  <span>HTTP {ep.statusCode || 200}</span>
                  <span>Checked: {ep.lastUpdated || 'Just now'}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
