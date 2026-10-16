import React from 'react';
import { BeachSpot, ConditionEvaluation, WaterSportType } from '../types';

interface BeachSpotCardProps {
  beach: BeachSpot;
  evaluation?: ConditionEvaluation;
  distanceKm?: number;
  isSelected: boolean;
  onSelect: () => void;
  onExplorePartners: () => void;
}

const SPORT_NAMES: Record<WaterSportType, { label: string; icon: string }> = {
  fishing: { label: 'Fishing Charter', icon: '🎣' },
  jetski: { label: 'Jetski & Wakeboard', icon: '⚡' },
  yachting: { label: 'Yachting & Sailing', icon: '⛵' },
  kayak: { label: 'Kayak & SUP', icon: '🛶' },
  swimming: { label: 'Coastal Swimming', icon: '🏊' },
};

export const BeachSpotCard: React.FC<BeachSpotCardProps> = ({
  beach,
  evaluation,
  distanceKm,
  isSelected,
  onSelect,
  onExplorePartners,
}) => {
  const score = evaluation?.overallScore ?? 75;
  const status = evaluation?.overallStatus ?? 'Fair';

  // Determine accent color
  let scoreColor = 'text-sky-400 border-sky-500/30 bg-sky-950/40';
  let badgeColor = 'text-sky-300 bg-sky-950 border border-sky-800';
  if (score >= 80) {
    scoreColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
    badgeColor = 'text-emerald-300 bg-emerald-950 border border-emerald-800';
  } else if (score >= 60) {
    scoreColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40';
    badgeColor = 'text-cyan-300 bg-cyan-950 border border-cyan-800';
  } else if (score >= 45) {
    scoreColor = 'text-amber-400 border-amber-500/30 bg-amber-950/40';
    badgeColor = 'text-amber-300 bg-amber-950 border border-amber-800';
  } else {
    scoreColor = 'text-rose-400 border-rose-500/30 bg-rose-950/40';
    badgeColor = 'text-rose-300 bg-rose-950 border border-rose-800';
  }

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl p-5 transition-all duration-200 cursor-pointer border ${
        isSelected
          ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
          : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>{beach.area}</span>
            <span aria-hidden="true">·</span>
            <span>{beach.shelterLevel}</span>
            {distanceKm !== undefined && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-cyan-400 font-mono font-medium">{distanceKm} km away</span>
              </>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-100 tracking-tight leading-snug">
            {beach.name}
          </h3>
        </div>

        {/* Score Ring / Pill */}
        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border ${scoreColor}`}>
          <span className="text-xl font-bold font-mono tabular-nums leading-none">{score}</span>
          <span className="text-[9px] uppercase font-semibold text-slate-400 mt-0.5 tracking-wider">Score</span>
        </div>
      </div>

      {/* Brief Summary Prose */}
      <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
        {evaluation?.summaryProse || beach.description}
      </p>

      {/* 4 Core Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 px-3 bg-slate-950/70 rounded-xl border border-slate-800/80 mb-4">
        {/* Wind Speed */}
        <div>
          <div className="text-[10px] uppercase font-medium text-slate-400">Wind Speed</div>
          <div className="text-sm font-semibold text-slate-100 font-mono mt-0.5">
            {evaluation?.windSpeedKnots !== undefined ? `${evaluation.windSpeedKnots} kts` : '—'}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {evaluation?.windDirectionCompass} ({evaluation?.windDirectionDeg ?? 0}°)
          </div>
        </div>

        {/* Coastal Tide */}
        <div>
          <div className="text-[10px] uppercase font-medium text-slate-400">Coastal Tide</div>
          <div className="text-sm font-semibold text-slate-100 font-mono mt-0.5">
            {evaluation?.tideHeightMetres !== undefined ? `${evaluation.tideHeightMetres}m` : '—'}
          </div>
          <div className="text-[10px] text-cyan-400 truncate">
            {evaluation?.nextTideEvent
              ? `${evaluation.nextTideEvent.type.toUpperCase()} ${evaluation.nextTideEvent.time}`
              : evaluation?.tideStage || 'Tide Table'}
          </div>
        </div>

        {/* Heat Stress WBGT */}
        <div>
          <div className="text-[10px] uppercase font-medium text-slate-400">Heat Stress</div>
          <div className="text-sm font-semibold text-slate-100 font-mono mt-0.5">
            {evaluation?.heatStressWbgt !== undefined ? `${evaluation.heatStressWbgt}°C` : '—'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {evaluation?.heatStressCategory || 'WBGT Index'}
          </div>
        </div>

        {/* Coastal UV */}
        <div>
          <div className="text-[10px] uppercase font-medium text-slate-400">UV Index</div>
          <div className="text-sm font-semibold text-slate-100 font-mono mt-0.5">
            {evaluation?.uvIndex !== undefined ? evaluation.uvIndex : '—'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {evaluation?.uvCategory || 'Moderate'}
          </div>
        </div>
      </div>

      {/* Activity Breakdown Accordion/Grid */}
      <div className="space-y-1.5 mb-4">
        {beach.popularActivities.map((sport) => {
          const act = evaluation?.activityScores[sport];
          const info = SPORT_NAMES[sport];
          if (!act) return null;

          return (
            <div
              key={sport}
              className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-800/40 border border-slate-800/40"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{info.icon}</span>
                <span className="font-medium text-slate-200">{info.label}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[11px] text-slate-400">{act.status}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                    act.score >= 75
                      ? 'bg-emerald-950 text-emerald-400'
                      : act.score >= 55
                      ? 'bg-sky-950 text-sky-400'
                      : 'bg-amber-950 text-amber-400'
                  }`}
                >
                  {act.score}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExplorePartners();
          }}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
        >
          <span>Find Boats & Gear</span>
          <span>→</span>
        </button>

        <span className="text-[11px] text-slate-500 font-mono">
          Nearest: {beach.nearestStationName || 'S108'}
        </span>
      </div>
    </div>
  );
};
