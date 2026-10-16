import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BeachSpot, ConditionEvaluation } from '../types';

interface OneMapViewerProps {
  beaches: BeachSpot[];
  selectedBeachId: string;
  onSelectBeach: (id: string) => void;
  evaluations: Record<string, ConditionEvaluation>;
  userLocation: { lat: number; lon: number } | null;
  onLocateMe: () => void;
  isLocating: boolean;
}

export const OneMapViewer: React.FC<OneMapViewerProps> = ({
  beaches,
  selectedBeachId,
  onSelectBeach,
  evaluations,
  userLocation,
  onLocateMe,
  isLocating,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Leaflet Map with OneMap Basemap
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Singapore center coordinates
    const map = L.map(mapContainerRef.current, {
      center: [1.3400, 103.8500],
      zoom: 11,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true,
    });

    // Sub-goal 2a: OneMap tiles endpoint
    // https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png
    const oneMapLayer = L.tileLayer(
      'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png',
      {
        detectRetina: true,
        maxZoom: 18,
        minZoom: 10,
        attribution:
          '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om.png" style="height:14px;width:14px;display:inline;vertical-align:middle;margin-right:4px;" alt="OneMap" /> <a href="https://www.onemap.gov.sg" target="_blank" rel="noopener noreferrer">OneMap</a> &copy; Singapore Land Authority',
      }
    );

    oneMapLayer.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update beach markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    beaches.forEach((beach) => {
      const evalData = evaluations[beach.id];
      const isSelected = beach.id === selectedBeachId;
      const score = evalData?.overallScore ?? 75;
      const windSpeed = evalData?.windSpeedKnots ?? 6;
      const windDeg = evalData?.windDirectionDeg ?? 90;

      // Color coding based on suitability
      let badgeBg = '#0284c7'; // cyan
      let ringColor = 'rgba(56, 189, 248, 0.4)';
      if (score >= 80) {
        badgeBg = '#059669'; // emerald
        ringColor = 'rgba(16, 185, 129, 0.4)';
      } else if (score >= 60) {
        badgeBg = '#0284c7'; // sky
        ringColor = 'rgba(14, 165, 233, 0.4)';
      } else if (score >= 45) {
        badgeBg = '#d97706'; // amber
        ringColor = 'rgba(245, 158, 11, 0.4)';
      } else {
        badgeBg = '#dc2626'; // rose
        ringColor = 'rgba(239, 68, 68, 0.4)';
      }

      const customIcon = L.divIcon({
        className: 'custom-marine-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translate(-50%, -50%);
            cursor: pointer;
          ">
            <div style="
              width: ${isSelected ? '38px' : '32px'};
              height: ${isSelected ? '38px' : '32px'};
              border-radius: 50%;
              background: ${badgeBg};
              border: ${isSelected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.85)'};
              box-shadow: 0 4px 12px ${ringColor}, 0 2px 4px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 700;
              font-size: ${isSelected ? '12px' : '11px'};
              font-family: 'JetBrains Mono', monospace;
              transition: all 0.2s ease;
            ">
              ${score}
            </div>
            <!-- Wind Arrow Pointer -->
            <div style="
              position: absolute;
              bottom: -6px;
              width: 14px;
              height: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              transform: rotate(${windDeg}deg);
              filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#38bdf8" stroke="#0f172a" stroke-width="2">
                <path d="M12 2L19 21L12 17L5 21L12 2Z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([beach.lat, beach.lon], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="min-width: 210px; padding: 4px 2px;">
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 700; font-size: 14px; color: #f8fafc;">${beach.name}</span>
            <span style="font-size: 11px; font-weight: 600; color: #38bdf8; font-family: monospace;">${score}/100</span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
            ${beach.area} · ${beach.shelterLevel}
          </div>
          <div style="background: rgba(30, 41, 59, 0.7); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: #e2e8f0; margin-bottom: 8px;">
            <div><strong>Wind:</strong> ${windSpeed} kts (${evalData?.windDirectionCompass || 'ESE'})</div>
            <div><strong>Tide:</strong> ${evalData?.tideHeightMetres ? evalData.tideHeightMetres + 'm' : 'Normal'} · ${evalData?.tideStage || 'Operating'}</div>
            <div><strong>WBGT:</strong> ${evalData?.heatStressWbgt || 31}°C (${evalData?.heatStressCategory || 'Moderate'})</div>
          </div>
          <button id="btn-select-${beach.id}" style="
            width: 100%;
            background: #0284c7;
            color: white;
            border: none;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
          ">
            View Coastal Conditions
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${beach.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectBeach(beach.id);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        onSelectBeach(beach.id);
      });

      marker.addTo(map);
      markersRef.current[beach.id] = marker;
    });
  }, [beaches, evaluations, selectedBeachId, onSelectBeach]);

  // Center map when selected beach changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedBeachId) return;

    const beach = beaches.find((b) => b.id === selectedBeachId);
    if (beach) {
      map.panTo([beach.lat, beach.lon], { animate: true, duration: 0.6 });
    }
  }, [selectedBeachId, beaches]);

  // User location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
          className: 'user-gps-marker',
          html: `
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #06b6d4;
              border: 3px solid #ffffff;
              box-shadow: 0 0 10px rgba(6, 182, 212, 0.8), 0 2px 4px rgba(0,0,0,0.5);
              animation: pulse 2s infinite;
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], {
          icon: userIcon,
        })
          .bindPopup('<strong>Your Current Location</strong><br/>Finding nearest suitable beach...')
          .addTo(map);
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lon]);
      }
    }
  }, [userLocation]);

  return (
    <div className="relative w-full h-[360px] md:h-[480px] lg:h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map viewport */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={onLocateMe}
          disabled={isLocating}
          title="Find Nearest Beach from your GPS"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900/90 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg border border-cyan-500/30 backdrop-blur-md shadow-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg
            className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.071-7.071l-1.414 1.414M8.343 15.657l-1.414 1.414m12.142 0l-1.414-1.414M8.343 8.343L6.929 6.929"
            />
          </svg>
          <span className="whitespace-nowrap">{isLocating ? 'Locating...' : 'Nearest Beach'}</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/95 border border-slate-800 backdrop-blur-md px-3 py-2 rounded-lg text-[11px] text-slate-300 shadow-lg pointer-events-auto">
        <div className="font-semibold text-slate-100 mb-1 flex items-center justify-between gap-4">
          <span>OneMap Basemap</span>
          <span className="text-[10px] text-slate-400 font-mono">LIVE TILES</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Prime (80+)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            Fair (60+)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Caution
          </span>
        </div>
      </div>
    </div>
  );
};
