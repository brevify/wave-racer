import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { SINGAPORE_BEACHES } from './data/singaporeBeaches';
import { PARTNER_VENDORS } from './data/partners';
import {
  BeachSpot,
  ConditionEvaluation,
  WaterSportType,
} from './types';
import {
  fetchAllLiveMarineData,
  LiveConditionsBundle,
} from './services/apiClient';
import {
  calculateDistanceKm,
  evaluateBeachCondition,
} from './utils/suitability';
import { OneMapViewer } from './components/OneMapViewer';
import { BeachSpotCard } from './components/BeachSpotCard';
import { TideChart } from './components/TideChart';
import { PartnersSection } from './components/PartnersSection';
import { SubscriptionModal } from './components/SubscriptionModal';
import { DataDiagnosticsModal } from './components/DataDiagnosticsModal';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TalkToUsForum } from './components/TalkToUsForum';

export default function App() {
  const [dataBundle, setDataBundle] = useState<LiveConditionsBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedBeachId, setSelectedBeachId] = useState<string>('lazarus-islands');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'suitability' | 'distance'>('suitability');

  // Modals
  const [isSubModalOpen, setIsSubModalOpen] = useState<boolean>(false);
  const [isDiagModalOpen, setIsDiagModalOpen] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // Mobile navigation tab
  const [mobileTab, setMobileTab] = useState<'map' | 'beaches' | 'tides' | 'partners' | 'talk'>('map');

  // Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locatingError, setLocatingError] = useState<string | null>(null);

  // Fetch live marine data
  const loadMarineData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const bundle = await fetchAllLiveMarineData();
      setDataBundle(bundle);
    } catch (err: unknown) {
      console.error('Failed to load marine feeds:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMarineData();
  }, [loadMarineData]);

  // Handle Geolocation to find nearest beach
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocatingError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocatingError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setUserLocation(coords);
        setIsLocating(false);
        setSortBy('distance');

        // Automatically find nearest beach
        let nearestBeach = SINGAPORE_BEACHES[0];
        let minDistance = Infinity;

        SINGAPORE_BEACHES.forEach((b) => {
          const dist = calculateDistanceKm(coords.lat, coords.lon, b.lat, b.lon);
          if (dist < minDistance) {
            minDistance = dist;
            nearestBeach = b;
          }
        });

        setSelectedBeachId(nearestBeach.id);
      },
      (error) => {
        setIsLocating(false);
        setLocatingError(
          `Location access error: ${error.message}. Please permit GPS permissions in your browser.`
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Evaluate conditions for each beach
  const evaluations: Record<string, ConditionEvaluation> = useMemo(() => {
    const res: Record<string, ConditionEvaluation> = {};
    SINGAPORE_BEACHES.forEach((beach) => {
      res[beach.id] = evaluateBeachCondition(
        beach,
        dataBundle?.tides ?? null,
        dataBundle?.uv ?? null,
        dataBundle?.heatStress ?? null,
        dataBundle?.windSpeed ?? null,
        dataBundle?.windDirection ?? null
      );
    });
    return res;
  }, [dataBundle]);

  // Selected beach details
  const selectedBeach = useMemo(() => {
    return (
      SINGAPORE_BEACHES.find((b) => b.id === selectedBeachId) ||
      SINGAPORE_BEACHES[0]
    );
  }, [selectedBeachId]);

  const selectedEvaluation = evaluations[selectedBeach.id];

  // Distances map
  const distances = useMemo(() => {
    if (!userLocation) return {};
    const map: Record<string, number> = {};
    SINGAPORE_BEACHES.forEach((b) => {
      map[b.id] = calculateDistanceKm(userLocation.lat, userLocation.lon, b.lat, b.lon);
    });
    return map;
  }, [userLocation]);

  // Filtered and sorted beaches list
  const filteredBeaches = useMemo(() => {
    let list = [...SINGAPORE_BEACHES];

    // Filter by sport
    if (selectedSport !== 'all') {
      list = list.filter((b) =>
        b.popularActivities.includes(selectedSport as WaterSportType)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'distance' && userLocation) {
        const distA = distances[a.id] ?? 999;
        const distB = distances[b.id] ?? 999;
        return distA - distB;
      }
      const scoreA = evaluations[a.id]?.overallScore ?? 0;
      const scoreB = evaluations[b.id]?.overallScore ?? 0;
      return scoreB - scoreA;
    });

    return list;
  }, [selectedSport, sortBy, userLocation, distances, evaluations]);

  // Check if any feed is refused or slow for the alert bar (Sub-goal 4)
  const feedAlerts = useMemo(() => {
    if (!dataBundle) return [];
    const alerts: string[] = [];

    Object.values(dataBundle.diagnostics).forEach((d) => {
      if (d.status === 'refused') {
        alerts.push(
          `${d.name} connection was refused by the external provider. Telemetry from this sensor is temporarily unavailable.`
        );
      } else if (d.status === 'empty') {
        alerts.push(
          `${d.name} returned an empty payload from the government source.`
        );
      } else if (d.status === 'slow') {
        alerts.push(
          `${d.name} connection is experiencing latency (${((d.latencyMs || 0) / 1000).toFixed(1)}s).`
        );
      }
    });

    return alerts;
  }, [dataBundle]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMobileTab = (tab: 'map' | 'beaches' | 'tides' | 'partners' | 'talk') => {
    setMobileTab(tab);
    if (tab === 'map') scrollToSection('map-section');
    else if (tab === 'beaches') scrollToSection('beaches-list');
    else if (tab === 'tides') scrollToSection('tides-section');
    else if (tab === 'partners') scrollToSection('partners');
    else if (tab === 'talk') scrollToSection('talk-to-us');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased pb-16 md:pb-0">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenSubscription={() => setIsSubModalOpen(true)}
        onOpenDiagnostics={() => setIsDiagModalOpen(true)}
        onScrollToSection={scrollToSection}
        hasErrorsOrSlow={feedAlerts.length > 0}
        isSubscribed={isSubscribed}
      />

      {/* Sub-goal 4: Plain Words Warning Banners when feeds are slow, empty or refused */}
      {feedAlerts.length > 0 && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-400">Notice:</span>
              <span>{feedAlerts[0]}</span>
            </div>
            <button
              onClick={() => setIsDiagModalOpen(true)}
              className="text-amber-300 underline font-semibold hover:text-white cursor-pointer whitespace-nowrap text-[11px]"
            >
              Inspect Data Feeds ({feedAlerts.length})
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Hero Section */}
        <section id="hero" className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wide">
                <span>Singapore Marine Intelligence</span>
                <span aria-hidden="true">·</span>
                <span>Live NEA & Data.gov.sg Feeds</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-balance leading-tight">
                Find the Best Beach for Water Sports & Fishing Charters
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Real-time coastal tides, wind speed, wind direction, UV index, and heat stress
                synthesized for high-end anglers, yacht skippers, and water sports enthusiasts across Singapore.
              </p>

              {/* Quick Actions & Live Stats */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-400/20 flex items-center gap-2"
                >
                  <svg className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{isLocating ? 'Locating Your Beach...' : 'Find Nearest Beach'}</span>
                </button>

                <button
                  onClick={() => setIsSubModalOpen(true)}
                  className="px-5 py-3 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  Charter Peace-of-Mind ($10/mo)
                </button>

                <button
                  onClick={() => loadMarineData(true)}
                  disabled={refreshing}
                  className="px-3.5 py-3 text-xs font-medium text-slate-400 hover:text-cyan-300 bg-slate-950/60 rounded-xl border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Refresh Live Sensor Data"
                >
                  <span className={refreshing ? 'animate-spin' : ''}>↻</span>
                  <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
                </button>
              </div>

              {locatingError && (
                <div className="text-xs text-amber-400 pt-1 font-mono">
                  {locatingError}
                </div>
              )}
            </div>

            {/* Hero Quick Highlight Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-5 shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="font-semibold text-cyan-400">#1 Top Rated Coastal Spot</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {evaluations['lazarus-islands']?.overallScore || 88}/100 Prime
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">
                  Lazarus & St John’s Islands
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  Southern Islands offshore anchorage with turquoise lagoon waters. Ideal for pelagic sportfishing and catamaran cruising.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Wind Condition</span>
                    <span className="font-bold font-mono text-slate-100">
                      {evaluations['lazarus-islands']?.windSpeedKnots ?? 6} kts {evaluations['lazarus-islands']?.windDirectionCompass ?? 'ESE'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Coastal Tide</span>
                    <span className="font-bold font-mono text-slate-100">
                      {evaluations['lazarus-islands']?.tideHeightMetres ?? 2.5}m {evaluations['lazarus-islands']?.nextTideEvent?.type.toUpperCase() || 'HIGH'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedBeachId('lazarus-islands');
                    scrollToSection('selected-spot');
                  }}
                  className="w-full mt-3 py-2 text-xs font-semibold text-cyan-400 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 transition-colors cursor-pointer text-center"
                >
                  Inspect Southern Islands Telemetry →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sub-goal 2: Map Section with OneMap Tiles */}
        <section id="map-section" className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-0.5">
                Official Basemap
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
                Singapore Coastal Beach Map
              </h2>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Tiles: OneMap Singapore SLA</span>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setIsDiagModalOpen(true)}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                Sensor Status
              </button>
            </div>
          </div>

          <OneMapViewer
            beaches={SINGAPORE_BEACHES}
            selectedBeachId={selectedBeachId}
            onSelectBeach={(id) => {
              setSelectedBeachId(id);
              scrollToSection('selected-spot');
            }}
            evaluations={evaluations}
            userLocation={userLocation}
            onLocateMe={handleLocateMe}
            isLocating={isLocating}
          />
        </section>

        {/* Selected Beach Detailed Diagnostic Panel */}
        <section id="selected-spot" className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>{selectedBeach.area}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedBeach.shelterLevel}</span>
                {distances[selectedBeach.id] !== undefined && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-cyan-400 font-mono font-medium">
                      {distances[selectedBeach.id]} km from you
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {selectedBeach.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {selectedEvaluation?.summaryProse || selectedBeach.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 text-center min-w-[100px]">
                <div className="text-3xl font-extrabold font-mono text-cyan-400 tabular-nums">
                  {selectedEvaluation?.overallScore ?? 75}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                  {selectedEvaluation?.overallStatus || 'Fair'} Window
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Live Government Telemetry */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-slate-800">
            {/* 1. Wind Direction & Speed */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Live Wind Sensor
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                {selectedEvaluation?.windSpeedKnots !== undefined ? `${selectedEvaluation.windSpeedKnots} kts` : '—'}
              </div>
              <div className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
                <span>Direction:</span>
                <span className="font-semibold font-mono">
                  {selectedEvaluation?.windDirectionCompass} ({selectedEvaluation?.windDirectionDeg ?? 0}°)
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Source: data.gov.sg real-time
              </div>
            </div>

            {/* 2. Coastal Tide */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Coastal Tide
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                {selectedEvaluation?.tideHeightMetres !== undefined ? `${selectedEvaluation.tideHeightMetres}m` : '—'}
              </div>
              <div className="text-xs text-emerald-400 mt-1">
                {selectedEvaluation?.nextTideEvent
                  ? `Next: ${selectedEvaluation.nextTideEvent.type.toUpperCase()} at ${selectedEvaluation.nextTideEvent.time}`
                  : selectedEvaluation?.tideStage || 'Tide Schedule'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Source: NEA Hydrographic
              </div>
            </div>

            {/* 3. Heat Stress (WBGT) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Heat Stress (WBGT)
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                {selectedEvaluation?.heatStressWbgt !== undefined ? `${selectedEvaluation.heatStressWbgt}°C` : '—'}
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Risk: <span className="font-semibold">{selectedEvaluation?.heatStressCategory || 'Moderate'}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Source: NEA Heat Stress API
              </div>
            </div>

            {/* 4. UV Index */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Solar UV Index
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                {selectedEvaluation?.uvIndex !== undefined ? selectedEvaluation.uvIndex : '—'}
              </div>
              <div className="text-xs text-amber-300 mt-1">
                Band: <span className="font-semibold">{selectedEvaluation?.uvCategory || 'Moderate'}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Source: NEA UV Service
              </div>
            </div>
          </div>

          {/* Activity Readiness Ratings for this beach */}
          <div className="pt-6">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
              Water Sport Readiness Ratings
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(selectedEvaluation?.activityScores || {}).map(([key, act]) => {
                const names: Record<string, string> = {
                  fishing: '🎣 Offshore Fishing Charter',
                  jetski: '⚡ Jetski & Wakeboarding',
                  yachting: '⛵ Yachting & Regatta Sailing',
                  kayak: '🛶 Kayaking & Stand-Up Paddle',
                  swimming: '🏊 Coastal Beach Swimming',
                };

                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-200">{names[key] || key}</span>
                      <span className="font-mono text-cyan-400 font-bold tabular-nums">
                        {act.score}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{act.status}</div>
                    <div className="text-[11px] text-slate-500 leading-snug">{act.advice}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sub-goal 3: Coastal Tides Timeline */}
        <section id="tides-section">
          <TideChart tides={dataBundle?.tides ?? null} />
        </section>

        {/* Beach Spots Directory & Filter */}
        <section id="beaches-list" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-0.5">
                Singapore Coastal Locations
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                All Coastal Water Sports Spots
              </h2>
            </div>

            {/* Filter and Sorting Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Sport Selector */}
              <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedSport('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                    selectedSport === 'all'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedSport('fishing')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                    selectedSport === 'fishing'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fishing
                </button>
                <button
                  onClick={() => setSelectedSport('yachting')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                    selectedSport === 'yachting'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Yacht
                </button>
                <button
                  onClick={() => setSelectedSport('jetski')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                    selectedSport === 'jetski'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Jetski
                </button>
                <button
                  onClick={() => setSelectedSport('kayak')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                    selectedSport === 'kayak'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paddle
                </button>
              </div>

              {/* Sort By Toggle */}
              <button
                onClick={() => setSortBy(sortBy === 'suitability' ? 'distance' : 'suitability')}
                className="px-3 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors cursor-pointer"
              >
                Sort: {sortBy === 'suitability' ? 'Suitability Score' : 'Nearest Distance'}
              </button>
            </div>
          </div>

          {/* Beach Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredBeaches.map((beach) => (
              <BeachSpotCard
                key={beach.id}
                beach={beach}
                evaluation={evaluations[beach.id]}
                distanceKm={distances[beach.id]}
                isSelected={beach.id === selectedBeachId}
                onSelect={() => {
                  setSelectedBeachId(beach.id);
                  scrollToSection('selected-spot');
                }}
                onExplorePartners={() => {
                  setSelectedBeachId(beach.id);
                  scrollToSection('partners');
                }}
              />
            ))}
          </div>
        </section>

        {/* Sub-goal 5: Partners Section (Boat Rentals & Water Sports Equipment) */}
        <PartnersSection
          partners={PARTNER_VENDORS}
          selectedBeachId={selectedBeachId}
          onSelectBeach={(id) => setSelectedBeachId(id)}
        />

        {/* Talk to Us Tab & Disqus Forum */}
        <TalkToUsForum />
      </main>

      {/* Sub-goal 6: Footer with mandatory attribution */}
      <Footer
        onOpenDiagnostics={() => setIsDiagModalOpen(true)}
        onOpenSubscription={() => setIsSubModalOpen(true)}
        lastUpdated={dataBundle?.lastFetchedAt}
      />

      {/* Mobile Bottom Navigation Tab Bar */}
      <MobileBottomNav
        activeTab={mobileTab}
        onTabChange={handleMobileTab}
        onOpenSubscription={() => setIsSubModalOpen(true)}
      />

      {/* Subscription Modal (1 Month Free Trial + $10/mo or $100/yr) */}
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSubscribed={() => setIsSubscribed(true)}
        isSubscribed={isSubscribed}
      />

      {/* Data Diagnostics Inspector Modal (Sub-goal 4) */}
      {dataBundle && (
        <DataDiagnosticsModal
          isOpen={isDiagModalOpen}
          onClose={() => setIsDiagModalOpen(false)}
          diagnostics={dataBundle.diagnostics}
          onRefresh={() => loadMarineData(true)}
          isRefreshing={refreshing}
        />
      )}
    </div>
  );
}
