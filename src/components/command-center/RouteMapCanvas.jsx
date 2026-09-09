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
  Radio
} from 'lucide-react';

// Tile Layer Configurations
const TILE_LAYERS = {
  voyager: {
    name: 'Detailed Streets',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  satellite: {
    name: 'Satellite Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  },
  dark: {
    name: 'Tactical Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
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

  const [activeTileType, setActiveTileType] = useState('voyager'); // 'voyager' | 'satellite' | 'dark'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'safe' | 'blocked'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate Realistic GPS Waypoints for the Selected Corridor
  const { affectedCoords, safeCoords, chokepoint, safeBypassPoint } = useMemo(() => {
    const origLat = origin?.lat || 26.18;
    const origLng = origin?.lng || 91.78;
    const destLat = destination?.lat || 23.83;
    const destLng = destination?.lng || 91.28;

    // Check if Corridor touches the East Jaintia Hills / Sonapur Pass (Tripura, Mizoram, Barak Valley)
    const isSouthNER = destination?.id === 'agartala' || destination?.id === 'silchar' || destination?.id === 'aizawl';

    // 1. AFFECTED ROUTE (Mountain Highway NH-6 via Sonapur Pass)
    let affected = [];
    if (origin?.id === 'siliguri') {
      affected.push(
        [26.72, 88.42], // Siliguri Gateway
        [26.54, 88.72], // Jalpaiguri
        [26.49, 89.53], // Alipurduar
        [26.48, 90.56], // Bongaigaon
        [26.18, 91.78]  // Guwahati Hub
      );
    } else {
      affected.push([origLat, origLng]);
    }

    if (isSouthNER) {
      affected.push(
        [26.10, 91.86], // Jorabat Junction
        [25.90, 91.88], // Nongpoh
        [25.68, 91.95], // Shillong Bypass
        [25.55, 92.05], // Mawryngkneng
        [25.45, 92.20], // Jowai
        [25.32, 92.35], // Ladrymbai
        [25.30, 92.37], // Khliehriat
        [25.105, 92.365], // Sonapur Tunnel Pass (CRITICAL BLOCKED CHOKEPOINT)
        [25.02, 92.40], // Malidor
        [24.95, 92.56]  // Kalain
      );

      if (destination?.id === 'silchar') {
        affected.push([24.83, 92.80]);
      } else if (destination?.id === 'aizawl') {
        affected.push(
          [24.83, 92.80], // Silchar
          [24.22, 92.68], // Kolasib Incline (Mudslide)
          [23.73, 92.71]  // Aizawl
        );
      } else {
        // Agartala
        affected.push(
          [24.87, 92.36], // Karimganj
          [24.52, 92.23], // Churaibari (Tripura Border)
          [24.37, 92.16], // Dharmanagar
          [24.16, 92.03], // Kumarghat
          [23.92, 91.85], // Ambassa
          [destLat, destLng] // Agartala Hub
        );
      }
    } else {
      // Generic route
      affected.push(
        [(origLat + destLat) / 2 + 0.15, (origLng + destLng) / 2 - 0.25],
        [(origLat + destLat) / 2 - 0.05, (origLng + destLng) / 2 - 0.1],
        [destLat, destLng]
      );
    }

    // 2. SAFE ALTERNATIVE ROUTE (NFR Ro-Ro Rail Lifeline via Lumding + Escorted Corridor)
    let safe = [];
    if (origin?.id === 'siliguri') {
      safe.push(
        [26.72, 88.42], // Siliguri Railhead
        [26.65, 89.85], // New Cooch Behar Siding
        [26.50, 90.50], // New Bongaigaon
        [26.16, 91.68], // Pandu Inland River Port / Guwahati
        [26.18, 91.78]  // Guwahati Gateway
      );
    } else {
      safe.push([origLat, origLng]);
    }

    if (isSouthNER) {
      safe.push(
        [26.12, 92.21], // Jagiroad (4-Lane NH-27)
        [26.34, 92.68], // Nagaon Bypass
        [26.00, 92.86], // Hojai
        [25.92, 93.00], // Lanka
        [25.75, 93.17], // Lumding Railhead Siding (SWITCH TO RO-RO RAIL)
        [25.30, 93.16], // Maibang Mountain Tunnel Rail
        [25.17, 93.02], // Haflong Broad-Gauge Railhead
        [25.02, 92.86], // Harangajao
        [24.90, 92.55]  // Badarpur Freight Terminal
      );

      if (destination?.id === 'silchar') {
        safe.push([24.83, 92.80]);
      } else if (destination?.id === 'aizawl') {
        safe.push(
          [24.18, 92.53], // Bairabi Railhead (Mizoram Frontier)
          [23.73, 92.71]  // Aizawl Central Depot (Police Escorted Convoy)
        );
      } else {
        // Agartala
        safe.push(
          [24.87, 92.36], // Karimganj Bypass
          [24.52, 92.23], // Churaibari Green Corridor
          [23.92, 91.85], // Ambassa
          [destLat, destLng] // Agartala Hub
        );
      }
    } else {
      safe.push(
        [(origLat + destLat) / 2 + 0.25, (origLng + destLng) / 2 + 0.3],
        [(origLat + destLat) / 2 + 0.1, (origLng + destLng) / 2 + 0.2],
        [destLat, destLng]
      );
    }

    return {
      affectedCoords: affected,
      safeCoords: safe,
      chokepoint: {
        lat: 25.105,
        lng: 92.365,
        name: 'Sonapur Mountain Pass (KM 142.6)',
        reason: 'Active 250m mudslide and road subsidence',
        stranded: '34 Cryogenic & POL Tankers Stranded'
      },
      safeBypassPoint: {
        lat: 25.75,
        lng: 93.17,
        name: 'Lumding NFR Railhead Siding',
        benefit: 'Ro-Ro Rail Lifeline • Bypasses Sonapur Pass'
      }
    };
  }, [origin, destination]);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy prior map instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Create Leaflet Map Instance
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

    // Add Attribution Control at bottom right
    L.control.attribution({ position: 'bottomright' }).addTo(map);

    // Add Zoom Control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add Active Tile Layer
    const tileConfig = TILE_LAYERS[activeTileType];
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains || 'abc',
      maxZoom: tileConfig.maxZoom
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Layer Group for Routes and Markers
    const layerGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layerGroup;

    // 1. RENDER AFFECTED ROUTE (RED POLYLINE)
    if (filterMode === 'all' || filterMode === 'blocked') {
      // Glow underlay
      L.polyline(affectedCoords, {
        color: '#b91c1c',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      // Main dashed hazard polyline
      const affectedLine = L.polyline(affectedCoords, {
        color: '#ef4444',
        weight: 5,
        dashArray: '8, 8',
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      affectedLine.bindPopup(`
        <div style="font-family: inherit; padding: 12px; max-width: 260px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="background: #e11d48; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              Blocked Highway
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

    // 2. RENDER SAFE ALTERNATIVE ROUTE (GREEN POLYLINE)
    if (filterMode === 'all' || filterMode === 'safe') {
      // Outer glow
      L.polyline(safeCoords, {
        color: '#065f46',
        weight: 10,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      // Solid emerald polyline
      const safeLine = L.polyline(safeCoords, {
        color: '#10b981',
        weight: 5.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      // Moving dashed pulse overlay
      L.polyline(safeCoords, {
        color: '#ffffff',
        weight: 2.5,
        opacity: 0.9,
        className: 'leaflet-animated-flow',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      safeLine.bindPopup(`
        <div style="font-family: inherit; padding: 12px; max-width: 270px;">
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
            ✓ Bypasses Sonapur Pass landslide gorge via Lumding Railhead
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Est. Delivery: 14.5 Hours • 98.5% Guaranteed Reliability
          </div>
        </div>
      `);
    }

    // 3. ORIGIN MARKER (ORANGE PULSING PIN)
    const originIcon = L.divIcon({
      className: 'custom-leaflet-origin-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #ea580c; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
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

    // 4. DESTINATION MARKER (EMERALD TARGET PIN)
    const destIcon = L.divIcon({
      className: 'custom-leaflet-dest-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: #10b981; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
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

    // 5. CHOKEPOINT HAZARD MARKER (SONAPUR TUNNEL PASS)
    if (filterMode === 'all' || filterMode === 'blocked') {
      const hazardIcon = L.divIcon({
        className: 'custom-leaflet-hazard-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: #ef4444; opacity: 0.45; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #dc2626; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px; font-weight: 900; box-shadow: 0 4px 10px rgba(220,38,38,0.5);">
              !
            </div>
            <div style="margin-top: 4px; background: #450a0a; color: #fecdd3; border: 1px solid #ef4444; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
              ⛔ LANDSLIDE: SONAPUR (KM 142.6)
            </div>
          </div>
        `,
        iconSize: [120, 40],
        iconAnchor: [60, 11]
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
              ${chokepoint.reason}. Single-lane Bailey bridge under assembly by BRO Project Pushpak.
            </p>
            <div style="font-size: 11px; font-weight: 800; color: #b91c1c; margin-top: 6px;">
              ⚠️ ${chokepoint.stranded}
            </div>
          </div>
        `);
    }

    // 6. SAFE RAILHEAD SWITCH SIDING MARKER (LUMDING)
    if (filterMode === 'all' || filterMode === 'safe') {
      const railIcon = L.divIcon({
        className: 'custom-leaflet-rail-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #0284c7; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 10px; font-weight: bold; box-shadow: 0 4px 8px rgba(2,132,199,0.4);">
              🚆
            </div>
            <div style="margin-top: 3px; background: #064e3b; color: #a7f3d0; border: 1px solid #10b981; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
              🚆 Lumding Ro-Ro Rail Lifeline
            </div>
          </div>
        `,
        iconSize: [110, 36],
        iconAnchor: [55, 10]
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
              14 Dedicated Flat-Car Ro-Ro Rakes active. Transfers road tankers to steel rail through Barail Mountain Tunnel, completely bypassing the Sonapur mudslide.
            </p>
          </div>
        `);
    }

    // Auto Fit Map Bounds to show entire route with padding
    const allPoints = [...affectedCoords, ...safeCoords];
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 11 });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [origin, destination, affectedCoords, safeCoords, chokepoint, safeBypassPoint, activeTileType, filterMode]);

  // Handle Layer Switching
  const handleSwitchTileLayer = (type) => {
    setActiveTileType(type);
  };

  // Re-center and fit route bounds
  const handleFitRouteBounds = () => {
    if (!mapInstanceRef.current) return;
    const allPoints = [...affectedCoords, ...safeCoords];
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-300 shadow-xl overflow-hidden relative bg-slate-900 transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'w-full'
    }`}>
      {/* Top Map Header & Controls Bar */}
      <div className="p-3 sm:p-4 bg-white/95 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md z-20 relative">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-orange-100 text-brand-600 border border-orange-200">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wide text-slate-900">
                Live Interactive Corridor Map
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                REAL-TIME TELEMETRY
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Zoom, pan & click any route or waypoint to inspect live chokepoints and rail bypasses.
            </p>
          </div>
        </div>

        {/* Action Controls: Tile Switcher & Filter */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto text-xs">
          {/* Tile Layer Selector */}
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
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('safe')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === 'safe' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Safe Only</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('blocked')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
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
            title="Fit Route to Screen"
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
        className={`w-full ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[430px] sm:h-[480px]'} relative z-10`}
      />

      {/* Bottom Simplified Status Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 z-20 relative">
        <div className="flex items-center space-x-3 w-full sm:w-auto text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-extrabold text-rose-700">
              🛑 NH-6 HIGHWAY SEVERED AT SONAPUR PASS
            </span>
          </div>
          <span className="text-slate-400">➔</span>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-extrabold text-emerald-700">
              🟢 NFR RO-RO RAIL FAILOVER CLEAR
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
