import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Train,
  MapPin,
  RefreshCw,
  Eye,
  Radio,
  Compass
} from 'lucide-react';
import { PRECACHED_REAL_ROUTES, fetchOsrmRoadPath } from '../../services/realRouteService';

// Official Watermark-Free Tile Layer Configurations (No API Key Required)
const TILE_LAYERS = {
  osm: {
    name: 'OpenStreetMap (Official)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19
  },
  esriStreets: {
    name: 'Highways & Towns (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; National Geographic, DeLorme, NAVTEQ',
    subdomains: ['server', 'services'],
    maxZoom: 18
  },
  satellite: {
    name: 'Satellite Topo',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping',
    subdomains: ['server', 'services'],
    maxZoom: 18
  },
  topo: {
    name: 'Topographic Relief',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 17
  }
};

export function RouteMapCanvas({
  origin,
  destination,
  routeData,
  isDisrupted = true,
  onAuthorizeSafeConvoy = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const layersGroupRef = useRef(null);

  const [activeTileType, setActiveTileType] = useState('osm'); // Default to official clean OpenStreetMap
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'safe' | 'blocked'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingRealRoute, setIsLoadingRealRoute] = useState(false);

  // Corridor Key
  const corridorKey = `${origin?.id}-${destination?.id}`;

  // State for Real GPS Road Coordinates
  const [activeAffectedCoords, setActiveAffectedCoords] = useState(() => {
    return PRECACHED_REAL_ROUTES[corridorKey]?.affected || PRECACHED_REAL_ROUTES['guwahati-agartala'].affected;
  });

  const [activeSafeCoords, setActiveSafeCoords] = useState(() => {
    return PRECACHED_REAL_ROUTES[corridorKey]?.safe || PRECACHED_REAL_ROUTES['guwahati-agartala'].safe;
  });

  // Fetch or Load Real Road Geometry
  useEffect(() => {
    const cached = PRECACHED_REAL_ROUTES[corridorKey];
    if (cached && cached.affected && cached.safe) {
      setActiveAffectedCoords(cached.affected);
      setActiveSafeCoords(cached.safe);
      return;
    }

    // Dynamic fetch from OpenStreetMap OSRM routing engine for un-cached pairs
    let isCancelled = false;
    async function loadDynamicRoadRoutes() {
      setIsLoadingRealRoute(true);
      const origLat = origin?.lat || 26.18;
      const origLng = origin?.lng || 91.78;
      const destLat = destination?.lat || 23.83;
      const destLng = destination?.lng || 91.28;

      try {
        // 1. Affected Road via Sonapur Pass Chokepoint
        const affectedWaypoints = [
          [origLat, origLng],
          [25.45, 92.20], // Jowai
          [25.105, 92.365], // Sonapur Tunnel Pass
          [destLat, destLng]
        ];
        const affectedGeo = await fetchOsrmRoadPath(affectedWaypoints);

        // 2. Safe Road via Lumding Railhead Bypass
        const safeWaypoints = [
          [origLat, origLng],
          [25.75, 93.17], // Lumding Railhead
          [24.90, 92.55], // Badarpur
          [destLat, destLng]
        ];
        const safeGeo = await fetchOsrmRoadPath(safeWaypoints);

        if (!isCancelled) {
          if (affectedGeo && affectedGeo.length > 5) {
            setActiveAffectedCoords(affectedGeo);
          }
          if (safeGeo && safeGeo.length > 5) {
            setActiveSafeCoords(safeGeo);
          }
        }
      } catch (err) {
        console.warn('Could not fetch dynamic OSRM route:', err);
      } finally {
        if (!isCancelled) setIsLoadingRealRoute(false);
      }
    }

    loadDynamicRoadRoutes();
    return () => {
      isCancelled = true;
    };
  }, [corridorKey, origin, destination]);

  // Strategic Chokepoint & Siding Points
  const chokepoint = useMemo(() => ({
    lat: 25.105,
    lng: 92.365,
    name: 'NH-6 Sonapur Tunnel Mountain Pass (KM 142.6)',
    reason: 'Active 250m mudslide and road subsidence',
    stranded: '34 Cryogenic & POL Tankers Stranded'
  }), []);

  const safeBypassPoint = useMemo(() => ({
    lat: 25.75,
    lng: 93.17,
    name: 'Lumding NFR Railhead Siding',
    benefit: 'Ro-Ro Rail Lifeline • Bypasses Sonapur Pass'
  }), []);

  // Initialize and update Leaflet map with real road geometry
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCenter = [
      ((origin?.lat || 26.18) + (destination?.lat || 23.83)) / 2,
      ((origin?.lng || 91.78) + (destination?.lng || 91.28)) / 2
    ];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 8,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Controls
    L.control.attribution({ position: 'bottomright' }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Active Watermark-free Tile Layer
    const tileConfig = TILE_LAYERS[activeTileType] || TILE_LAYERS.osm;
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains || 'abc',
      maxZoom: tileConfig.maxZoom
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Layer Group
    const layerGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layerGroup;

    // 1. RENDER REAL AFFECTED HIGHWAY ROUTE (RED POLYLINE SNAPPED TO ROAD)
    if ((filterMode === 'all' || filterMode === 'blocked') && activeAffectedCoords.length > 0) {
      // Glow underlay
      L.polyline(activeAffectedCoords, {
        color: '#b91c1c',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      // Main dashed red hazard road
      const affectedLine = L.polyline(activeAffectedCoords, {
        color: '#ef4444',
        weight: 5,
        dashArray: '8, 8',
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      affectedLine.bindPopup(`
        <div style="font-family: inherit; padding: 12px; max-width: 270px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="background: #e11d48; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              Blocked Mountain Highway
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #e11d48;">Risk: 89/100</span>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.3;">
            NH-6 Mountain Lifeline via Sonapur Pass
          </div>
          <div style="font-size: 11px; color: #b91c1c; margin-top: 4px; font-weight: 700;">
            ⚠️ Active 250m Landslide at Sonapur Tunnel
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Transit: 52.0 Hours (+38h Delay) • 34 Tankers Stranded
          </div>
        </div>
      `);
    }

    // 2. RENDER REAL SAFE ROUTE (GREEN POLYLINE SNAPPED TO REAL ROADS & RAILWAYS)
    if ((filterMode === 'all' || filterMode === 'safe') && activeSafeCoords.length > 0) {
      // Outer emerald halo
      L.polyline(activeSafeCoords, {
        color: '#065f46',
        weight: 10,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      // Solid emerald green road polyline
      const safeLine = L.polyline(activeSafeCoords, {
        color: '#10b981',
        weight: 5.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      // Moving animated flow pulse overlay
      L.polyline(activeSafeCoords, {
        color: '#ffffff',
        weight: 2.5,
        opacity: 0.9,
        className: 'leaflet-animated-flow',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      safeLine.bindPopup(`
        <div style="font-family: inherit; padding: 12px; max-width: 280px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="background: #10b981; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              100% Operational
            </span>
            <span style="font-size: 11px; font-weight: 800; color: #059669;">⚡ 37.5 Hours Saved</span>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.3;">
            NFR Multi-Modal Failover: Ro-Ro Rail + Escorted Highway
          </div>
          <div style="font-size: 11px; color: #047857; margin-top: 4px; font-weight: 600;">
            ✓ Follows 4-Lane NH-27 & Mountain Rail Tunnel, avoiding Sonapur landslide gorge
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Est. Delivery: 14.5 Hours • 98.5% Guaranteed Reliability
          </div>
        </div>
      `);
    }

    // 3. ORIGIN MARKER (ORANGE PIN AT EXACT GPS)
    const originIcon = L.divIcon({
      className: 'custom-leaflet-origin-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: #ea580c; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #ea580c; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.35);"></div>
          <div style="position: absolute; top: -24px; background: #ea580c; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 6px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
            📍 ${origin?.name || 'Origin Gateway'}
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker([origin?.lat || 26.18, origin?.lng || 91.78], { icon: originIcon })
      .addTo(layerGroup)
      .bindPopup(`<b>Origin Hub:</b> ${origin?.name}<br/><span style="color:#64748b;font-size:11px;">State: ${origin?.state}</span>`);

    // 4. DESTINATION MARKER (EMERALD TARGET PIN AT EXACT GPS)
    const destIcon = L.divIcon({
      className: 'custom-leaflet-dest-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: #10b981; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 20px; height: 20px; border-radius: 50%; background: #059669; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.35);"></div>
          <div style="position: absolute; top: -24px; background: #059669; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 6px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
            🎯 ${destination?.name || 'Destination Hub'}
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker([destination?.lat || 23.83, destination?.lng || 91.28], { icon: destIcon })
      .addTo(layerGroup)
      .bindPopup(`<b>Destination Lifeline:</b> ${destination?.name}<br/><span style="color:#64748b;font-size:11px;">Target: ${destination?.criticalNeed || 'Emergency Lifeline'}</span>`);

    // 5. EXACT CHOKEPOINT HAZARD PIN AT SONAPUR PASS (KM 142.6 ON NH-6)
    if (filterMode === 'all' || filterMode === 'blocked') {
      const hazardIcon = L.divIcon({
        className: 'custom-leaflet-hazard-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: #ef4444; opacity: 0.5; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #dc2626; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px; font-weight: 900; box-shadow: 0 4px 10px rgba(220,38,38,0.5);">
              !
            </div>
            <div style="margin-top: 4px; background: #450a0a; color: #fecdd3; border: 1.5px solid #ef4444; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 6px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.35);">
              ⛔ LANDSLIDE: SONAPUR TUNNEL (KM 142.6)
            </div>
          </div>
        `,
        iconSize: [140, 42],
        iconAnchor: [70, 11]
      });

      L.marker([chokepoint.lat, chokepoint.lng], { icon: hazardIcon })
        .addTo(layerGroup)
        .bindPopup(`
          <div style="padding: 10px; font-family: inherit;">
            <div style="color: #e11d48; font-weight: 900; font-size: 12px; margin-bottom: 4px;">
              ⛔ ACTIVE LANDSLIDE BLOCKADE
            </div>
            <div style="font-weight: 700; font-size: 12px; color: #0f172a;">
              ${chokepoint.name}
            </div>
            <p style="font-size: 11px; color: #64748b; margin-top: 4px;">
              ${chokepoint.reason}. Road subsided by 4.2m. Single-lane Bailey bridge under assembly by BRO.
            </p>
            <div style="font-size: 11px; font-weight: 800; color: #b91c1c; margin-top: 6px;">
              ⚠️ ${chokepoint.stranded}
            </div>
          </div>
        `);
    }

    // 6. EXACT RAILHEAD SIDING PIN AT LUMDING JUNCTION
    if (filterMode === 'all' || filterMode === 'safe') {
      const railIcon = L.divIcon({
        className: 'custom-leaflet-rail-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #0284c7; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px; font-weight: bold; box-shadow: 0 4px 8px rgba(2,132,199,0.4);">
              🚆
            </div>
            <div style="margin-top: 3px; background: #064e3b; color: #a7f3d0; border: 1px solid #10b981; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
              🚆 Lumding Ro-Ro Rail Lifeline
            </div>
          </div>
        `,
        iconSize: [120, 38],
        iconAnchor: [60, 11]
      });

      L.marker([safeBypassPoint.lat, safeBypassPoint.lng], { icon: railIcon })
        .addTo(layerGroup)
        .bindPopup(`
          <div style="padding: 10px; font-family: inherit;">
            <div style="color: #059669; font-weight: 900; font-size: 12px; margin-bottom: 4px;">
              🚆 NFR BROAD-GAUGE RO-RO RAIL SIDING
            </div>
            <div style="font-weight: 700; font-size: 12px; color: #0f172a;">
              ${safeBypassPoint.name}
            </div>
            <p style="font-size: 11px; color: #64748b; margin-top: 4px;">
              14 Dedicated Flat-Car Ro-Ro Rakes active. Transfers road tankers to rail through the Barail Mountain Tunnel, completely bypassing the Sonapur mudslide.
            </p>
          </div>
        `);
    }

    // Auto-Fit Bounds to cover the entire real road route with comfortable margins
    const allPoints = [...activeAffectedCoords, ...activeSafeCoords];
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [origin, destination, activeAffectedCoords, activeSafeCoords, chokepoint, safeBypassPoint, activeTileType, filterMode]);

  // Handle Layer Switching
  const handleSwitchTileLayer = (type) => {
    setActiveTileType(type);
  };

  // Re-center and fit bounds
  const handleFitRouteBounds = () => {
    if (!mapInstanceRef.current) return;
    const allPoints = [...activeAffectedCoords, ...activeSafeCoords];
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-300 shadow-xl overflow-hidden relative bg-slate-100 transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'w-full'
    }`}>
      {/* Top Map Header & Controls Bar */}
      <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-20 relative">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-orange-100 text-brand-600 border border-orange-200">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wide text-slate-900">
                Real Road & Rail Alignment Navigator
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                OFFICIAL ROAD GEOMETRY
              </span>
              {isLoadingRealRoute && (
                <span className="text-[10px] text-brand-600 font-bold flex items-center gap-1 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Snapping to real road GPS...
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Follows actual highways (NH-6, NH-27) & railway tracks with exact turn-by-turn road curves.
            </p>
          </div>
        </div>

        {/* Action Controls: Tile Switcher & Filter */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto text-xs">
          {/* Tile Layer Selector (No Watermark!) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
            {Object.entries(TILE_LAYERS).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSwitchTileLayer(key)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTileType === key
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {config.name}
              </button>
            ))}
          </div>

          {/* Route Filter Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('safe')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === 'safe' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Safe Only</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('blocked')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === 'blocked' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Blocked Only</span>
            </button>
          </div>

          {/* Recenter Bounds */}
          <button
            type="button"
            onClick={handleFitRouteBounds}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs transition-all cursor-pointer"
            title="Fit Real Route to Screen"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Actual Interactive Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        id="find-my-route-leaflet-map"
        className={`w-full ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[440px] sm:h-[490px]'} relative z-10`}
      />

      {/* Bottom Simplified Status Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 z-20 relative">
        <div className="flex items-center space-x-3 w-full sm:w-auto text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-extrabold text-rose-700">
              🛑 NH-6 MOUNTAIN ROAD BLOCKED (SONAPUR PASS)
            </span>
          </div>
          <span className="text-slate-400">➔</span>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-extrabold text-emerald-700">
              🟢 NFR RO-RO RAIL FAILOVER CLEAR (LUMDING BYPASS)
            </span>
          </div>
        </div>

        {onAuthorizeSafeConvoy && (
          <button
            type="button"
            onClick={onAuthorizeSafeConvoy}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Truck className="w-4 h-4" />
            <span>Authorize Convoy via Safe Route</span>
          </button>
        )}
      </div>
    </div>
  );
}
