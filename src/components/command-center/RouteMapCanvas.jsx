import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Train,
  Truck,
  Ship,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Zap,
  Maximize2,
  RefreshCw,
  Info
} from 'lucide-react';

// Geographic Coordinates for Strategic Corridors across North Eastern Region
export const STRATEGIC_MAP_NODES = {
  siliguri: { id: 'siliguri', name: 'Siliguri Gateway', code: 'SGU', state: 'West Bengal', lat: 26.72, lng: 88.42, type: 'gateway' },
  guwahati: { id: 'guwahati', name: 'Guwahati Command Hub', code: 'GAU', state: 'Assam', lat: 26.18, lng: 91.78, type: 'hub' },
  shillong: { id: 'shillong', name: 'Shillong Depot', code: 'SHL', state: 'Meghalaya', lat: 25.57, lng: 91.89, type: 'junction' },
  jowai: { id: 'jowai', name: 'Jowai Bypass', code: 'JOW', state: 'Meghalaya', lat: 25.45, lng: 92.20, type: 'waypoint' },
  sonapur: { id: 'sonapur', name: 'Sonapur Tunnel Pass', code: 'SNP', state: 'Meghalaya', lat: 25.10, lng: 92.36, type: 'chokepoint' },
  badarpur: { id: 'badarpur', name: 'Badarpur Junction', code: 'BDP', state: 'Assam', lat: 24.90, lng: 92.55, type: 'railhead' },
  silchar: { id: 'silchar', name: 'Silchar Relief Depot', code: 'IXS', state: 'Assam', lat: 24.83, lng: 92.80, type: 'depot' },
  lumding: { id: 'lumding', name: 'Lumding Rail Terminal', code: 'LMG', state: 'Assam', lat: 25.75, lng: 93.17, type: 'railhead' },
  dimapur: { id: 'dimapur', name: 'Dimapur Railhead', code: 'DMU', state: 'Nagaland', lat: 25.90, lng: 93.73, type: 'railhead' },
  pandu: { id: 'pandu', name: 'Pandu River Port', code: 'PAN', state: 'Assam', lat: 26.16, lng: 91.68, type: 'port' },
  tezpur: { id: 'tezpur', name: 'Tezpur Forward Base', code: 'TEZ', state: 'Assam', lat: 26.65, lng: 92.80, type: 'base' },
  bairabi: { id: 'bairabi', name: 'Bairabi Railhead', code: 'BRB', state: 'Mizoram', lat: 24.18, lng: 92.53, type: 'railhead' },
  kolasib: { id: 'kolasib', name: 'Kolasib Incline', code: 'KOL', state: 'Mizoram', lat: 24.22, lng: 92.68, type: 'waypoint' },
  agartala: { id: 'agartala', name: 'Agartala Healthcare Hub', code: 'AGR', state: 'Tripura', lat: 23.83, lng: 91.28, type: 'destination' },
  aizawl: { id: 'aizawl', name: 'Aizawl Essential Depot', code: 'AIZ', state: 'Mizoram', lat: 23.73, lng: 92.71, type: 'destination' },
  imphal: { id: 'imphal', name: 'Imphal Consignment Hub', code: 'IMF', state: 'Manipur', lat: 24.81, lng: 93.94, type: 'destination' },
  kohima: { id: 'kohima', name: 'Kohima Stockpile Center', code: 'KOH', state: 'Nagaland', lat: 25.67, lng: 94.11, type: 'destination' },
  itanagar: { id: 'itanagar', name: 'Itanagar Lifeline Center', code: 'ITN', state: 'Arunachal', lat: 27.08, lng: 93.60, type: 'destination' },
  tawang: { id: 'tawang', name: 'Tawang Forward Post', code: 'TWN', state: 'Arunachal', lat: 27.58, lng: 91.86, type: 'destination' }
};

// Projection helper for SVG canvas (860 x 440 viewBox)
export function projectGeo(lat, lng, width = 860, height = 440) {
  const minLng = 88.0;
  const maxLng = 94.8;
  const minLat = 23.2;
  const maxLat = 27.9;
  const padX = 42;
  const padY = 36;

  const x = padX + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padX);
  const y = height - padY - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padY);
  return { x: Math.round(x), y: Math.round(y) };
}

export function RouteMapCanvas({
  origin,
  destination,
  routeData,
  isDisrupted = true,
  onAuthorizeSafeConvoy = null
}) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeSegmentFilter, setActiveSegmentFilter] = useState('all'); // 'all' | 'safe' | 'blocked'

  // Calculate projected positions for Origin and Destination
  const originPos = useMemo(() => {
    const node = STRATEGIC_MAP_NODES[origin?.id] || { lat: origin?.lat || 26.18, lng: origin?.lng || 91.78 };
    return projectGeo(node.lat, node.lng);
  }, [origin]);

  const destPos = useMemo(() => {
    const node = STRATEGIC_MAP_NODES[destination?.id] || { lat: destination?.lat || 23.83, lng: destination?.lng || 91.28 };
    return projectGeo(node.lat, node.lng);
  }, [destination]);

  // Key Strategic Waypoint Positions
  const posGuwahati = projectGeo(STRATEGIC_MAP_NODES.guwahati.lat, STRATEGIC_MAP_NODES.guwahati.lng);
  const posSiliguri = projectGeo(STRATEGIC_MAP_NODES.siliguri.lat, STRATEGIC_MAP_NODES.siliguri.lng);
  const posShillong = projectGeo(STRATEGIC_MAP_NODES.shillong.lat, STRATEGIC_MAP_NODES.shillong.lng);
  const posJowai = projectGeo(STRATEGIC_MAP_NODES.jowai.lat, STRATEGIC_MAP_NODES.jowai.lng);
  const posSonapur = projectGeo(STRATEGIC_MAP_NODES.sonapur.lat, STRATEGIC_MAP_NODES.sonapur.lng);
  const posLumding = projectGeo(STRATEGIC_MAP_NODES.lumding.lat, STRATEGIC_MAP_NODES.lumding.lng);
  const posBadarpur = projectGeo(STRATEGIC_MAP_NODES.badarpur.lat, STRATEGIC_MAP_NODES.badarpur.lng);
  const posSilchar = projectGeo(STRATEGIC_MAP_NODES.silchar.lat, STRATEGIC_MAP_NODES.silchar.lng);
  const posBairabi = projectGeo(STRATEGIC_MAP_NODES.bairabi.lat, STRATEGIC_MAP_NODES.bairabi.lng);
  const posTezpur = projectGeo(STRATEGIC_MAP_NODES.tezpur.lat, STRATEGIC_MAP_NODES.tezpur.lng);
  const posDimapur = projectGeo(STRATEGIC_MAP_NODES.dimapur.lat, STRATEGIC_MAP_NODES.dimapur.lng);

  // Construct the Affected Path string (Red)
  const affectedPathD = useMemo(() => {
    // If starting from Siliguri, first travel to Guwahati
    let startSegment = '';
    if (origin?.id === 'siliguri') {
      startSegment = `M ${originPos.x} ${originPos.y} Q ${posGuwahati.x - 180} ${posGuwahati.y - 15} ${posGuwahati.x} ${posGuwahati.y} `;
    } else {
      startSegment = `M ${originPos.x} ${originPos.y} `;
    }

    // Connect from Guwahati/Origin -> Shillong/Jowai -> Sonapur Chokepoint -> Destination
    if (destination?.id === 'silchar') {
      return `${startSegment} L ${posJowai.x} ${posJowai.y} L ${posSonapur.x} ${posSonapur.y} L ${destPos.x} ${destPos.y}`;
    }

    if (destination?.id === 'aizawl') {
      return `${startSegment} L ${posJowai.x} ${posJowai.y} L ${posSonapur.x} ${posSonapur.y} L ${posSilchar.x} ${posSilchar.y} L ${destPos.x} ${destPos.y}`;
    }

    // Default corridor (e.g. Agartala or generic south)
    return `${startSegment} L ${posJowai.x} ${posJowai.y} L ${posSonapur.x} ${posSonapur.y} Q ${posSonapur.x + 10} ${posSonapur.y + 45} ${destPos.x} ${destPos.y}`;
  }, [origin?.id, destination?.id, originPos, destPos, posGuwahati, posJowai, posSonapur, posSilchar]);

  // Construct the Safe Alternative Path string (Green)
  const safePathD = useMemo(() => {
    let startSegment = '';
    if (origin?.id === 'siliguri') {
      // Siliguri -> Rail bypass to Pandu/Lumding
      startSegment = `M ${originPos.x} ${originPos.y} Q ${posTezpur.x - 220} ${posTezpur.y - 25} ${posLumding.x} ${posLumding.y} `;
    } else {
      // Guwahati / Hub -> Lumding 4-Lane NH-27
      startSegment = `M ${originPos.x} ${originPos.y} Q ${posGuwahati.x + 90} ${posGuwahati.y + 15} ${posLumding.x} ${posLumding.y} `;
    }

    if (destination?.id === 'silchar') {
      // Lumding -> Hill Rail -> Silchar
      return `${startSegment} Q ${posLumding.x - 25} ${posLumding.y + 40} ${destPos.x} ${destPos.y}`;
    }

    if (destination?.id === 'aizawl') {
      // Lumding -> Bairabi railhead -> Aizawl
      return `${startSegment} L ${posBairabi.x} ${posBairabi.y} L ${destPos.x} ${destPos.y}`;
    }

    // Default (e.g. Agartala via Badarpur Railhead)
    return `${startSegment} L ${posBadarpur.x} ${posBadarpur.y} Q ${posBadarpur.x - 30} ${posBadarpur.y + 45} ${destPos.x} ${destPos.y}`;
  }, [origin?.id, destination?.id, originPos, destPos, posGuwahati, posTezpur, posLumding, posBadarpur, posSilchar, posBairabi]);

  // Chokepoint Position (Default Sonapur Tunnel)
  const chokepointPos = posSonapur;

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800/90 shadow-2xl overflow-hidden relative">
      {/* Tactical Radar Map Header */}
      <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Active Corridor GIS Schematic
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                LIVE SATELLITE TELEMETRY
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Visual route comparison: <span className="text-rose-400 font-bold">Red = Blocked Mountain Highway</span> vs <span className="text-emerald-400 font-bold">Green = Operational Rail/Bypass</span>
            </p>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveSegmentFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeSegmentFilter === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Corridors
          </button>
          <button
            type="button"
            onClick={() => setActiveSegmentFilter('safe')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeSegmentFilter === 'safe'
                ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-600'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Safe Route</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSegmentFilter('blocked')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeSegmentFilter === 'blocked'
                ? 'bg-rose-950/70 text-rose-300 border border-rose-600'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Blocked</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/8.5] max-h-[440px] bg-[#070d1d] select-none">
        <svg
          viewBox="0 0 860 440"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Emerald Glow for Safe Route */}
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.75" />
            </filter>

            {/* Red Glow for Blocked Route */}
            <filter id="redHazardGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ef4444" floodOpacity="0.85" />
            </filter>

            {/* River Glow */}
            <filter id="waterGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#0284c7" floodOpacity="0.5" />
            </filter>

            {/* Linear Gradients */}
            <linearGradient id="safeRouteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="hazardRouteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>

          {/* 1. Tactical Background Grid */}
          <g opacity="0.12">
            {[80, 160, 240, 320, 400, 480, 560, 640, 720, 800].map(x => (
              <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2="440" stroke="#94a3b8" strokeDasharray="3 3" />
            ))}
            {[60, 120, 180, 240, 300, 360, 420].map(y => (
              <line key={`gy-${y}`} x1="0" y1={y} x2="860" y2={y} stroke="#94a3b8" strokeDasharray="3 3" />
            ))}
          </g>

          {/* 2. Soft Terrain Mountain Ridge Shading (East Jaintia & Barail Range) */}
          <g opacity="0.18">
            <path
              d="M 460 210 Q 520 230 580 250 T 660 270 L 650 320 Q 560 300 480 270 Z"
              fill="#fb923c"
            />
            <text x="500" y="275" fill="#f97316" fontSize="9" fontWeight="bold" opacity="0.6" letterSpacing="1">
              EAST JAINTIA HILLS (MONSOON SLIP ZONE)
            </text>
          </g>

          {/* 3. NW-2 Brahmaputra River Flotilla Arterial Path */}
          <g filter="url(#waterGlow)">
            <path
              d="M 120 185 Q 260 175 440 165 T 620 135 T 780 110"
              fill="none"
              stroke="#0284c7"
              strokeWidth="4"
              strokeOpacity="0.45"
              strokeLinecap="round"
            />
            <path
              d="M 120 185 Q 260 175 440 165 T 620 135 T 780 110"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="12 8"
              strokeOpacity="0.7"
            />
            <text x="280" y="158" fill="#38bdf8" fontSize="8" fontWeight="600" opacity="0.6" letterSpacing="0.8">
              NW-2 BRAHMAPUTRA RIVER WATERWAY
            </text>
          </g>

          {/* 4. Strategic State Boundaries / Labels */}
          <g fill="#64748b" fontSize="8" fontWeight="bold" opacity="0.4" letterSpacing="1.2">
            <text x="75" y="65">WEST BENGAL</text>
            <text x="460" y="90">ASSAM VALLEY</text>
            <text x="420" y="235">MEGHALAYA</text>
            <text x="350" y="360">TRIPURA</text>
            <text x="560" y="415">MIZORAM</text>
            <text x="720" y="270">MANIPUR</text>
            <text x="715" y="165">NAGALAND</text>
            <text x="630" y="55">ARUNACHAL PRADESH</text>
          </g>

          {/* 5. AFFECTED ROUTE (RED DASHED HAZARD LINE) */}
          {(activeSegmentFilter === 'all' || activeSegmentFilter === 'blocked') && (
            <g filter="url(#redHazardGlow)">
              {/* Thick red background glow path */}
              <path
                d={affectedPathD}
                fill="none"
                stroke="#991b1b"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
              />
              {/* Foreground pulsating dashed red path */}
              <path
                d={affectedPathD}
                fill="none"
                stroke="url(#hazardRouteGradient)"
                strokeWidth="4.5"
                strokeDasharray="7 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-route-hazard"
              />
            </g>
          )}

          {/* 6. SAFE ALTERNATIVE ROUTE (RADIANT EMERALD CONDUIT) */}
          {(activeSegmentFilter === 'all' || activeSegmentFilter === 'safe') && (
            <g filter="url(#emeraldGlow)">
              {/* Outer halo */}
              <path
                d={safePathD}
                fill="none"
                stroke="#065f46"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
              {/* Solid emerald line */}
              <path
                d={safePathD}
                fill="none"
                stroke="url(#safeRouteGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Animated moving pulse dots */}
              <path
                d={safePathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="10 14"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-route-flow"
              />
            </g>
          )}

          {/* 7. STRATEGIC JUNCTION NODES & MARKERS */}
          {Object.values(STRATEGIC_MAP_NODES).map(node => {
            const pos = projectGeo(node.lat, node.lng);
            const isOrigin = node.id === origin?.id;
            const isDest = node.id === destination?.id;
            const isChokepoint = node.id === 'sonapur';
            const isRailhead = node.type === 'railhead';

            // Only render key relevant nodes to avoid clutter
            const isKeyNode = isOrigin || isDest || isChokepoint || isRailhead ||
              node.id === 'guwahati' || node.id === 'lumding' || node.id === 'badarpur' || node.id === 'silchar' || node.id === 'jowai';

            if (!isKeyNode) return null;

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node Dot / Halo */}
                {isOrigin ? (
                  // Origin Node: Bright Amber/Orange Ping
                  <g>
                    <circle cx={pos.x} cy={pos.y} r="14" fill="#f97316" opacity="0.25" className="animate-ping" />
                    <circle cx={pos.x} cy={pos.y} r="7" fill="#ea580c" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx={pos.x} cy={pos.y} r="3" fill="#ffffff" />
                  </g>
                ) : isDest ? (
                  // Destination Node: Bright Emerald Goal Target
                  <g>
                    <circle cx={pos.x} cy={pos.y} r="16" fill="#10b981" opacity="0.3" className="animate-ping" />
                    <circle cx={pos.x} cy={pos.y} r="8" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx={pos.x} cy={pos.y} r="3.5" fill="#ffffff" />
                  </g>
                ) : isChokepoint ? (
                  // Chokepoint (Sonapur): Flashing Red Warning Hazard
                  <g>
                    <circle cx={pos.x} cy={pos.y} r="18" fill="#ef4444" opacity="0.4" className="animate-ping" />
                    <circle cx={pos.x} cy={pos.y} r="7" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                    <line x1={pos.x - 3} y1={pos.y} x2={pos.x + 3} y2={pos.y} stroke="#ffffff" strokeWidth="2" />
                  </g>
                ) : isRailhead ? (
                  // Railhead Hub: Blue/Cyan Siding Dot
                  <g>
                    <circle cx={pos.x} cy={pos.y} r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                  </g>
                ) : (
                  // Regular Waypoint
                  <circle cx={pos.x} cy={pos.y} r="3.5" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />
                )}

                {/* Node Label */}
                <text
                  x={pos.x}
                  y={isOrigin || isDest ? pos.y - 12 : pos.y + 13}
                  textAnchor="middle"
                  fill={isOrigin ? '#fb923c' : isDest ? '#34d399' : isChokepoint ? '#f87171' : '#cbd5e1'}
                  fontSize={isOrigin || isDest ? "10" : "8"}
                  fontWeight={isOrigin || isDest || isChokepoint ? "bold" : "600"}
                  className="pointer-events-none drop-shadow-md"
                >
                  {node.name}
                </text>
              </g>
            );
          })}

          {/* 8. PROMINENT CHOKEPOINT HAZARD CALLOUT (Sonapur Tunnel) */}
          {(activeSegmentFilter === 'all' || activeSegmentFilter === 'blocked') && (
            <g transform={`translate(${chokepointPos.x + 12}, ${chokepointPos.y - 32})`} className="animate-pulse">
              <rect
                x="0"
                y="0"
                width="190"
                height="44"
                rx="8"
                fill="#450a0a"
                stroke="#ef4444"
                strokeWidth="1.5"
                opacity="0.95"
              />
              <text x="8" y="16" fill="#fca5a5" fontSize="9" fontWeight="900" letterSpacing="0.5">
                ⛔ ACTIVE LANDSLIDE CHOKEPOINT
              </text>
              <text x="8" y="29" fill="#ffffff" fontSize="8" fontWeight="600">
                Sonapur Tunnel (KM 142.6) • 250m Mudslide
              </text>
              <text x="8" y="39" fill="#f87171" fontSize="7.5" fontWeight="bold">
                ⚠️ 34 Cryogenic/POL Tankers Stranded
              </text>
            </g>
          )}

          {/* 9. PROMINENT SAFE RAIL BYPASS CALLOUT (Lumding Rail Siding) */}
          {(activeSegmentFilter === 'all' || activeSegmentFilter === 'safe') && (
            <g transform={`translate(${posLumding.x - 90}, ${posLumding.y + 18})`}>
              <rect
                x="0"
                y="0"
                width="180"
                height="38"
                rx="8"
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth="1.5"
                opacity="0.95"
              />
              <text x="8" y="15" fill="#6ee7b7" fontSize="9" fontWeight="900" letterSpacing="0.5">
                🚆 NFR RO-RO RAIL FAILOVER
              </text>
              <text x="8" y="27" fill="#ffffff" fontSize="8" fontWeight="600">
                100% Operational • Bypasses Sonapur Pass
              </text>
              <text x="8" y="35" fill="#34d399" fontSize="7.5" fontWeight="bold">
                ⚡ {routeData?.safeRoute?.timeSaved || '37.5 Hours Saved'}
              </text>
            </g>
          )}

          {/* 10. MAP LEGEND (Fixed Top-Right) */}
          <g transform="translate(640, 14)">
            <rect
              x="0"
              y="0"
              width="206"
              height="80"
              rx="10"
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="1"
              opacity="0.92"
            />
            <text x="12" y="17" fill="#94a3b8" fontSize="8.5" fontWeight="bold" letterSpacing="0.8">
              MAP ROUTE LEGEND
            </text>

            {/* Red Line Item */}
            <line x1="12" y1="31" x2="36" y2="31" stroke="#ef4444" strokeWidth="3" strokeDasharray="4 3" />
            <circle cx="24" cy="31" r="2.5" fill="#dc2626" />
            <text x="44" y="34" fill="#fca5a5" fontSize="8" fontWeight="bold">
              Blocked / Affected Highway
            </text>

            {/* Green Line Item */}
            <line x1="12" y1="48" x2="36" y2="48" stroke="#10b981" strokeWidth="4" />
            <circle cx="24" cy="48" r="2" fill="#ffffff" />
            <text x="44" y="51" fill="#6ee7b7" fontSize="8" fontWeight="bold">
              Safe Bypass Conduit (100% Clear)
            </text>

            {/* Railhead Item */}
            <circle cx="24" cy="65" r="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            <text x="44" y="68" fill="#93c5fd" fontSize="8" fontWeight="600">
              Multi-Modal Railhead / River Port
            </text>
          </g>
        </svg>

        {/* Hovered Node Tooltip Overlay */}
        {hoveredNode && (
          <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs shadow-xl pointer-events-none backdrop-blur-md">
            <div className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-orange-400" />
              <span>{hoveredNode.name} ({hoveredNode.code})</span>
            </div>
            <div className="text-[10px] text-slate-300">
              <span>{hoveredNode.state}</span> • <span className="font-mono">Lat {hoveredNode.lat}°, Lng {hoveredNode.lng}°</span>
            </div>
          </div>
        )}
      </div>

      {/* Simplified Status Bar directly under the Map */}
      <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-black text-rose-400">
              HIGHWAY BLOCKED
            </span>
          </div>
          <span className="text-slate-600">➔</span>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-black text-emerald-400">
              SAFE RO-RO RAIL BYPASS ACTIVE
            </span>
          </div>
        </div>

        {onAuthorizeSafeConvoy && (
          <button
            type="button"
            onClick={onAuthorizeSafeConvoy}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:scale-105"
          >
            <Truck className="w-4 h-4" />
            <span>Authorize Convoy on Safe Route</span>
          </button>
        )}
      </div>
    </div>
  );
}
