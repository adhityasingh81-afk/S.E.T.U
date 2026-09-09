import React, { useState, useMemo } from 'react';
import {
  Navigation,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowLeftRight,
  Clock,
  Truck,
  Train,
  Ship,
  Compass,
  Sparkles,
  Activity,
  RefreshCw,
  Send,
  Check,
  ChevronDown,
  Info,
  Radio,
  ExternalLink
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Preset strategic origins across North Eastern Region
export const ROUTE_ORIGINS = [
  { id: 'guwahati', name: 'Guwahati Strategic Logistics Command', state: 'Assam', code: 'GAU', lat: 26.18, lng: 91.78, hubType: 'Central Mega-Hub' },
  { id: 'siliguri', name: 'Siliguri Multi-Modal Gateway (Chicken\'s Neck)', state: 'West Bengal', code: 'SGU', lat: 26.72, lng: 88.42, hubType: 'Mainland Inbound' },
  { id: 'shillong', name: 'Shillong Regional Logistics Center', state: 'Meghalaya', code: 'SHL', lat: 25.57, lng: 91.89, hubType: 'Regional Depot' },
  { id: 'lumding', name: 'Lumding Railway Freight Siding', state: 'Assam', code: 'LMG', lat: 25.75, lng: 93.17, hubType: 'Railhead Terminal' },
  { id: 'pandu', name: 'Pandu Inland Port (National Waterway 2)', state: 'Assam', code: 'PAN', lat: 26.16, lng: 91.68, hubType: 'Inland River Port' },
  { id: 'tezpur', name: 'Tezpur Forward Logistics Base', state: 'Assam', code: 'TEZ', lat: 26.65, lng: 92.80, hubType: 'Forward Base' },
  { id: 'dimapur', name: 'Dimapur Strategic Railhead & Depot', state: 'Nagaland', code: 'DMU', lat: 25.90, lng: 93.73, hubType: 'Railhead Feeder' },
];

// Preset strategic destinations across North Eastern Region
export const ROUTE_DESTINATIONS = [
  { id: 'agartala', name: 'Agartala Integrated Healthcare & Food Hub', state: 'Tripura', code: 'AGR', lat: 23.83, lng: 91.28, criticalNeed: 'Medical Oxygen & Foodgrains' },
  { id: 'aizawl', name: 'Aizawl Essential Supplies Depot', state: 'Mizoram', code: 'AIZ', lat: 23.73, lng: 92.71, criticalNeed: 'POL Fuel & Critical Pharma' },
  { id: 'silchar', name: 'Silchar Medical & Relief Depot (Barak Valley)', state: 'Assam', code: 'IXS', lat: 24.83, lng: 92.80, criticalNeed: 'PDS Rice & Emergency Fuel' },
  { id: 'imphal', name: 'Imphal Valley Essential Consignment Hub', state: 'Manipur', code: 'IMF', lat: 24.81, lng: 93.94, criticalNeed: 'Life-Saving Drugs & Wheat' },
  { id: 'kohima', name: 'Kohima Civil Stockpile Directorate', state: 'Nagaland', code: 'KOH', lat: 25.67, lng: 94.11, criticalNeed: 'High-Altitude Diesel & Rations' },
  { id: 'itanagar', name: 'Itanagar Capital Lifeline Center', state: 'Arunachal Pradesh', code: 'ITN', lat: 27.08, lng: 93.60, criticalNeed: 'Vaccine Cold-Chain & Fuel' },
  { id: 'tawang', name: 'Tawang High-Altitude Forward Lifeline', state: 'Arunachal Pradesh', code: 'TWN', lat: 27.58, lng: 91.86, criticalNeed: 'Winter Stockpile & POL' },
];

// Intelligent Corridor Knowledge Engine
const CORRIDOR_INTELLIGENCE = {
  'guwahati-agartala': {
    distanceKm: 580,
    cargoCategory: 'Cryogenic Liquid Medical Oxygen & POL Fuel',
    affectedRoute: {
      name: 'NH-6 Mountain Lifeline via East Jaintia Hills (Sonapur Pass)',
      status: 'CRITICAL SEVERANCE',
      statusType: 'danger',
      riskScore: 89,
      estTime: '52.0 Hours (+38h Delay)',
      delayNotice: 'Active 250m mudslide and rockfall at Sonapur Tunnel (KM 142.6)',
      blockadeReason: 'Severe monsoon slope failure; road surface subsided by 4.2 meters. Single-lane Bailey bridge under assembly by BRO Project Pushpak.',
      strandedCount: '34 Cryogenic & POL Tankers Stranded',
      weatherAlert: '84 mm/hr IMD Doppler Rainfall Alert across Jaintia Ridge',
      segments: [
        { from: 'Guwahati Command', to: 'Jowai Bypass', status: 'clear', distance: '82 km', mode: '4-Lane Highway' },
        { from: 'Jowai', to: 'Sonapur Tunnel Pass', status: 'blocked', distance: '34 km', mode: 'Mudslide Chokepoint' },
        { from: 'Sonapur', to: 'Churaibari (Tripura Border)', status: 'congested', distance: '148 km', mode: 'Gridlocked Mountain Highway' },
        { from: 'Churaibari', to: 'Agartala Healthcare Hub', status: 'nominal', distance: '166 km', mode: 'State Arterial Highway' },
      ],
      advisory: 'PROHIBITED: District Magistrate has halted non-emergency heavy vehicles. Cryogenic oxygen pressure hazard imminent if unvented for >36 hours.'
    },
    safeRoute: {
      name: 'NFR Multi-Modal Failover: Lumding–Badarpur Ro-Ro Rail + Escorted Highway',
      status: 'CLEAR & OPERATIONAL',
      statusType: 'success',
      riskScore: 14,
      estTime: '14.5 Hours Direct Delivery',
      timeSaved: '37.5 Hours Saved',
      reliabilityScore: '98.5%',
      capacityDetails: '14 Dedicated Flat-Car Ro-Ro Rakes + 4 NW-2 River Barges at Pandu',
      clearanceAuthority: 'BRO Task Force & ASDMA Green Corridor Authorized',
      segments: [
        { from: 'Guwahati Gateway', to: 'Lumding Railway Siding', status: 'clear', distance: '180 km', mode: '4-Lane NH-27 Expressway' },
        { from: 'Lumding Junction', to: 'Badarpur Freight Terminal', status: 'clear', distance: '170 km', mode: 'NFR Broad-Gauge Mountain Tunnel Rail' },
        { from: 'Badarpur Railhead', to: 'Agartala Capital Hub', status: 'clear', distance: '190 km', mode: 'State Police Escorted Relief Corridor' },
      ],
      advantages: [
        'Bypasses the entire landslide-prone Sonapur Pass gorge',
        'Guaranteed continuous rail transit with zero road-congestion exposure',
        'Cold-chain cryogenic temperature and telemetry monitored by NFR Maligaon'
      ]
    }
  },

  'guwahati-aizawl': {
    distanceKm: 470,
    cargoCategory: 'High-Altitude POL Fuel & Critical Pharmaceuticals',
    affectedRoute: {
      name: 'NH-6 / NH-306 Southern Mountain Trunk via Kolasib',
      status: 'HEAVY DISRUPTION',
      statusType: 'danger',
      riskScore: 82,
      estTime: '44.0 Hours (+26h Delay)',
      delayNotice: 'Twin mudslips near Sonapur Tunnel and Kolasib border incline',
      blockadeReason: 'Slope saturation and heavy slush between Vairengte and Kolasib. 18-wheeler articulated fuel tankers cannot negotiate hairpin curves.',
      strandedCount: '22 POL Tankers Queued at Meghalaya-Mizoram Border',
      weatherAlert: 'Sustained precipitation 72 mm/hr (ISRO Bhuvan Alert)',
      segments: [
        { from: 'Guwahati Gateway', to: 'Sonapur Pass', status: 'blocked', distance: '116 km', mode: 'Landslide Chokepoint' },
        { from: 'Sonapur', to: 'Silchar Junction', status: 'congested', distance: '135 km', mode: 'Single-Lane Convoy' },
        { from: 'Silchar', to: 'Kolasib Incline', status: 'caution', distance: '90 km', mode: 'Slippery Slope Ascent' },
        { from: 'Kolasib', to: 'Aizawl Depot', status: 'nominal', distance: '85 km', mode: 'Mountain Highway' },
      ],
      advisory: 'CAUTION: Heavy POL tankers restricted during night hours due to slope slippage.'
    },
    safeRoute: {
      name: 'NFR Lumding–Bairabi Railhead Failover + Mizoram State Convoy',
      status: 'CLEAR & OPERATIONAL',
      statusType: 'success',
      riskScore: 16,
      estTime: '16.0 Hours Direct Delivery',
      timeSaved: '28.0 Hours Saved',
      reliabilityScore: '96.8%',
      capacityDetails: 'Direct Railhead Transit to Bairabi Siding (Mizoram Frontier)',
      clearanceAuthority: 'Mizoram Disaster Management & NFR Cleared',
      segments: [
        { from: 'Guwahati Gateway', to: 'Lumding Junction', status: 'clear', distance: '180 km', mode: 'NH-27 4-Lane Expressway' },
        { from: 'Lumding', to: 'Bairabi Railhead (Mizoram)', status: 'clear', distance: '210 km', mode: 'Broad-Gauge Freight Rake' },
        { from: 'Bairabi', to: 'Aizawl Central Depot', status: 'clear', distance: '80 km', mode: 'State Police Escorted Convoy' },
      ],
      advantages: [
        'Transfers 80% of transit distance from vulnerable hill roads to steel rail',
        'Direct fuel offloading at Bairabi rail siding without Sonapur exposure',
        'Prevents capital fuel rationing in Aizawl district hospitals'
      ]
    }
  },

  'guwahati-silchar': {
    distanceKm: 310,
    cargoCategory: 'PDS Foodgrains, Rice & Emergency Medical Kits',
    affectedRoute: {
      name: 'NH-6 Mountain Highway via Khasi & Jaintia Ridge',
      status: 'CRITICAL SEVERANCE',
      statusType: 'danger',
      riskScore: 86,
      estTime: '36.0 Hours (+24h Hold)',
      delayNotice: 'Sonapur Pass bridge approach collapsed; river inundation near Lubha bridge',
      blockadeReason: 'Lubha river flash flood water levels overflowing 1.2m above bridge deck. BRO teams deployed with heavy excavators.',
      strandedCount: '45 Civil Supplies Trucks Parked at Khliehriat',
      weatherAlert: 'Extreme flash flood alert across Barak Basin',
      segments: [
        { from: 'Guwahati Gateway', to: 'Shillong Bypass', status: 'clear', distance: '70 km', mode: 'Highway' },
        { from: 'Shillong', to: 'Sonapur Pass', status: 'blocked', distance: '65 km', mode: 'Flooded / Landslide Cut' },
        { from: 'Sonapur Pass', to: 'Silchar Medical Depot', status: 'congested', distance: '110 km', mode: 'Slow Moving Traffic' },
      ],
      advisory: 'DIVERT: Civil supplies must be rerouted immediately to preserve valley food reserves.'
    },
    safeRoute: {
      name: 'Lumding-Silchar Mountain Broad-Gauge Rail Lifeline (Hill Section)',
      status: 'CLEAR & OPERATIONAL',
      statusType: 'success',
      riskScore: 18,
      estTime: '11.0 Hours Rail Express Transit',
      timeSaved: '25.0 Hours Saved',
      reliabilityScore: '97.2%',
      capacityDetails: 'High-Capacity 42-Wagon BCNHL Foodgrain Rakes',
      clearanceAuthority: 'Railway Safety Commissioner & ASDMA Cleared',
      segments: [
        { from: 'Guwahati Gateway', to: 'Lumding Railway Terminal', status: 'clear', distance: '180 km', mode: '4-Lane Expressway' },
        { from: 'Lumding', to: 'Silchar Station Siding', status: 'clear', distance: '130 km', mode: 'NFR Mountain Tunnel Rail Line' },
      ],
      advantages: [
        'Hill rail section is fully operational with concrete rock-sheds protecting track',
        'Direct delivery into Silchar FCI depot siding without road transshipment',
        'Saves ₹1.8 Cr in stranded inventory holding charges'
      ]
    }
  },

  'siliguri-agartala': {
    distanceKm: 980,
    cargoCategory: 'Heavy Mainland Manufacturing & Inbound Relief Consignments',
    affectedRoute: {
      name: 'Continental Corridor via NH-27, NH-6 & Chicken\'s Neck',
      status: 'SEVERE BOTTLENECK',
      statusType: 'danger',
      riskScore: 91,
      estTime: '76.0 Hours (+44h Delay)',
      delayNotice: 'Chokepoints at Dalkhola crossing, Brahmaputra bridge, and Sonapur pass',
      blockadeReason: 'Cumulative multi-state transit bottlenecks compounded by the East Jaintia Hills landslide severance.',
      strandedCount: '58 Long-Haul Semi-Trailers Queued',
      weatherAlert: 'Active monsoon weather across West Bengal and Meghalaya',
      segments: [
        { from: 'Siliguri Gateway', to: 'Guwahati Hub', status: 'congested', distance: '440 km', mode: 'NH-27 Highway' },
        { from: 'Guwahati Hub', to: 'Sonapur Pass', status: 'blocked', distance: '116 km', mode: 'Severed Tunnel' },
        { from: 'Sonapur Pass', to: 'Agartala Hub', status: 'congested', distance: '314 km', mode: 'Mountain Highway' },
      ],
      advisory: 'REROUTE: Multimodal river-rail failover recommended at Siliguri Gateway.'
    },
    safeRoute: {
      name: 'Tri-Modal Failover: NW-2 River Flotilla + NFR Dedicated Freight Shuttle',
      status: 'CLEAR & OPERATIONAL',
      statusType: 'success',
      riskScore: 19,
      estTime: '28.0 Hours Combined Multimodal Delivery',
      timeSaved: '48.0 Hours Saved',
      reliabilityScore: '95.4%',
      capacityDetails: 'NW-2 200-Tonne Self-Propelled Barges + Lumding Ro-Ro Rail Rakes',
      clearanceAuthority: 'IWAI Pandu & Ministry of Ports, Shipping & Waterways',
      segments: [
        { from: 'Siliguri Railhead', to: 'Pandu River Port', status: 'clear', distance: '420 km', mode: 'Direct Rail Rake' },
        { from: 'Pandu Port', to: 'Lumding Junction', status: 'clear', distance: '180 km', mode: 'Express Freight Siding' },
        { from: 'Lumding Junction', to: 'Agartala Healthcare Siding', status: 'clear', distance: '380 km', mode: 'NFR Green Corridor' },
      ],
      advantages: [
        'Completely bypasses highway choke points across 3 states',
        'Conserves 42,000 liters of convoy diesel fuel',
        'Preserves critical medical cold-chain shelf-life'
      ]
    }
  }
};

export function FindMyRouteSection({ isDisrupted, timeRange, setTimeRange, activeChartData }) {
  // Active View Mode: 'route' (Find My Route) vs 'chart' (Network RCI Trajectory)
  const [activeViewMode, setActiveViewMode] = useState('route');

  // Route Planning State
  const [selectedOriginId, setSelectedOriginId] = useState('guwahati');
  const [selectedDestId, setSelectedDestId] = useState('agartala');
  const [cargoType, setCargoType] = useState('Cryogenic Liquid Medical Oxygen (LMO)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  // Selected Objects
  const origin = useMemo(() => ROUTE_ORIGINS.find(o => o.id === selectedOriginId) || ROUTE_ORIGINS[0], [selectedOriginId]);
  const destination = useMemo(() => ROUTE_DESTINATIONS.find(d => d.id === selectedDestId) || ROUTE_DESTINATIONS[0], [selectedDestId]);

  // Swap Origin and Destination
  const handleSwap = () => {
    // Find matching swap if exists
    const matchingOriginAsDest = ROUTE_DESTINATIONS.find(d => d.id === selectedOriginId);
    const matchingDestAsOrigin = ROUTE_ORIGINS.find(o => o.id === selectedDestId);

    if (matchingDestAsOrigin && matchingOriginAsDest) {
      setSelectedOriginId(matchingDestAsOrigin.id);
      setSelectedDestId(matchingOriginAsDest.id);
    } else {
      // Rotate to next destination for dynamic exploration
      const nextDestIdx = (ROUTE_DESTINATIONS.findIndex(d => d.id === selectedDestId) + 1) % ROUTE_DESTINATIONS.length;
      setSelectedDestId(ROUTE_DESTINATIONS[nextDestIdx].id);
    }
    setDispatchedSuccess(false);
  };

  // Compute Active Route Intelligence
  const currentRouteData = useMemo(() => {
    const key = `${selectedOriginId}-${selectedDestId}`;
    if (CORRIDOR_INTELLIGENCE[key]) {
      return CORRIDOR_INTELLIGENCE[key];
    }

    // Dynamic Generic Corridor Evaluation for any arbitrary pair
    const approxDist = Math.round(
      Math.sqrt(
        Math.pow((destination.lat - origin.lat) * 111, 2) +
        Math.pow((destination.lng - origin.lng) * 105, 2)
      ) * 1.35
    );

    const isSonapurCorridor = (selectedOriginId === 'guwahati' || selectedOriginId === 'siliguri' || selectedOriginId === 'shillong') &&
      (selectedDestId === 'agartala' || selectedDestId === 'aizawl' || selectedDestId === 'silchar');

    if (isSonapurCorridor && isDisrupted) {
      return CORRIDOR_INTELLIGENCE['guwahati-agartala'];
    }

    return {
      distanceKm: approxDist,
      cargoCategory: cargoType,
      affectedRoute: {
        name: `Primary Mountain Highway Route (${origin.code} ➔ ${destination.code})`,
        status: isDisrupted ? 'SEVERELY RESTRICTED' : 'CAUTION: MOUNTAIN DELAY',
        statusType: 'danger',
        riskScore: isDisrupted ? 78 : 62,
        estTime: `${Math.round(approxDist / 22)} Hours (+18h Delay)`,
        delayNotice: `Monsoon hill saturation & heavy convoy congestion along ${origin.name} outer arterial link`,
        blockadeReason: `Narrow mountain pass curves and slow-moving multi-axle vehicle queues reduce transit speeds to <15 km/h.`,
        strandedCount: `${isDisrupted ? '28' : '12'} Convoys Impacted`,
        weatherAlert: 'Moderate to Heavy Rainfall Doppler Alert across transit ridge',
        segments: [
          { from: origin.name, to: 'Transit Ridge Incline', status: 'clear', distance: `${Math.round(approxDist * 0.35)} km`, mode: 'Highway' },
          { from: 'Transit Ridge', to: 'Mountain Chokepoint', status: isDisrupted ? 'blocked' : 'caution', distance: `${Math.round(approxDist * 0.25)} km`, mode: 'Vulnerable Cut' },
          { from: 'Mountain Chokepoint', to: destination.name, status: 'congested', distance: `${Math.round(approxDist * 0.4)} km`, mode: 'Arterial Road' },
        ],
        advisory: 'Advisory in effect: Check with BRO Highway Patrol before dispatching heavy axle loads.'
      },
      safeRoute: {
        name: `Dedicated Multi-Modal Bypass Corridor via NFR Mountain Rail & Arterial Bypass`,
        status: 'CLEAR & OPERATIONAL',
        statusType: 'success',
        riskScore: 15,
        estTime: `${Math.round(approxDist / 38)} Hours Direct Delivery`,
        timeSaved: '16.5 Hours Saved',
        reliabilityScore: '97.4%',
        capacityDetails: 'Dedicated Rail Rakes & Priority Green-Corridor Truck Lanes',
        clearanceAuthority: 'State Civil Supplies & Regional Disaster Management Cleared',
        segments: [
          { from: origin.name, to: 'Regional Rail Terminal', status: 'clear', distance: `${Math.round(approxDist * 0.3)} km`, mode: 'Express Link' },
          { from: 'Rail Terminal', to: 'Forward Stockpile Feeder', status: 'clear', distance: `${Math.round(approxDist * 0.45)} km`, mode: 'Rail Transit' },
          { from: 'Forward Feeder', to: destination.name, status: 'clear', distance: `${Math.round(approxDist * 0.25)} km`, mode: 'Escorted Convoy' },
        ],
        advantages: [
          'Guaranteed clearance along fortified all-weather bypass infrastructure',
          'Avoids active mountain landslide zones and river flood spillways',
          'Live AIS-140 GPS telematics feed provided directly to destination health desk'
        ]
      }
    };
  }, [selectedOriginId, selectedDestId, origin, destination, isDisrupted, cargoType]);

  const handleAnalyzeRoute = () => {
    setIsAnalyzing(true);
    setDispatchedSuccess(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasSearched(true);
    }, 450);
  };

  const handleDispatchSafeConvoy = () => {
    setDispatchedSuccess(true);
    setTimeout(() => setDispatchedSuccess(false), 5000);
  };

  return (
    <div className="extej-card p-6 space-y-6">
      {/* Top Header & Interactive Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 rounded-lg bg-orange-100 text-brand-600">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 font-sans tracking-tight">
              Find My Route • Strategic Corridor Risk & Lifeline Navigator
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time corridor routing intelligence: analyzes landslides, bridge cuts, river navigability & road blockades to tell you which route is affected and which is safe.
          </p>
        </div>

        {/* View Mode Toggle: [Find My Route] vs [RCI Trajectory] */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveViewMode('route')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeViewMode === 'route'
                ? 'btn-orange-pill text-white shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Find My Route</span>
          </button>
          <button
            onClick={() => setActiveViewMode('chart')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeViewMode === 'chart'
                ? 'btn-orange-pill text-white shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry Trajectory</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FIND MY ROUTE (HERO FEATURE) */}
      {activeViewMode === 'route' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Origin & Destination Interactive Search Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/70 via-slate-50 to-orange-50/70 border border-orange-200/80 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* ORIGIN SELECTOR */}
              <div className="flex-1 space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>From Where (Origin Gateway)</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedOriginId}
                    onChange={(e) => {
                      setSelectedOriginId(e.target.value);
                      setDispatchedSuccess(false);
                    }}
                    className="w-full bg-white border border-slate-300 hover:border-brand-400 text-slate-900 font-bold text-xs rounded-xl px-3.5 py-2.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-all"
                  >
                    {ROUTE_ORIGINS.map((orig) => (
                      <option key={orig.id} value={orig.id}>
                        {orig.name} ({orig.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SWAP BUTTON */}
              <div className="self-center pt-2 lg:pt-5">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-2.5 rounded-full bg-white hover:bg-orange-100 text-slate-600 hover:text-brand-600 border border-slate-200 hover:border-brand-300 shadow-xs transition-all hover:scale-110 cursor-pointer"
                  title="Swap Origin and Destination"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* DESTINATION SELECTOR */}
              <div className="flex-1 space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>To Where (Destination Lifeline Depot)</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedDestId}
                    onChange={(e) => {
                      setSelectedDestId(e.target.value);
                      setDispatchedSuccess(false);
                    }}
                    className="w-full bg-white border border-slate-300 hover:border-emerald-400 text-slate-900 font-bold text-xs rounded-xl px-3.5 py-2.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all"
                  >
                    {ROUTE_DESTINATIONS.map((dest) => (
                      <option key={dest.id} value={dest.id}>
                        {dest.name} ({dest.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PRIMARY ACTION BUTTON: FIND MY ROUTE */}
              <div className="self-stretch lg:self-end pt-2 lg:pt-0">
                <button
                  type="button"
                  onClick={handleAnalyzeRoute}
                  disabled={isAnalyzing}
                  className="w-full lg:w-auto px-6 py-2.5 rounded-xl btn-orange-pill text-white font-extrabold text-xs tracking-wide uppercase flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-60"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing Corridors...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-4 h-4" />
                      <span>Find Safe Route</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Popular Corridors Quick-Select Tags */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
              <span className="font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-600" />
                Quick Strategic Corridors:
              </span>
              {[
                { label: 'Guwahati ➔ Agartala (Tripura)', origin: 'guwahati', dest: 'agartala' },
                { label: 'Guwahati ➔ Aizawl (Mizoram)', origin: 'guwahati', dest: 'aizawl' },
                { label: 'Guwahati ➔ Silchar (Barak Valley)', origin: 'guwahati', dest: 'silchar' },
                { label: 'Siliguri ➔ Agartala (Continental)', origin: 'siliguri', dest: 'agartala' },
              ].map((corridor) => (
                <button
                  key={corridor.label}
                  type="button"
                  onClick={() => {
                    setSelectedOriginId(corridor.origin);
                    setSelectedDestId(corridor.dest);
                    setDispatchedSuccess(false);
                  }}
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedOriginId === corridor.origin && selectedDestId === corridor.dest
                      ? 'bg-brand-500 text-white border-brand-600 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-brand-700 border-slate-200'
                  }`}
                >
                  {corridor.label}
                </button>
              ))}
            </div>
          </div>

          {/* DISPATCH CONFIRMATION TOAST */}
          {dispatchedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg flex items-center justify-between gap-3 animate-fade-in-up">
              <div className="flex items-center gap-2.5 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>
                  Convoy Dispatch Authorized! Safe Multi-Modal Transit Order locked for {destination.name}. Green Corridor clearance broadcast to state police nodal desks.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDispatchedSuccess(false)}
                className="text-xs font-bold underline cursor-pointer hover:opacity-80"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ROUTE COMPARISON RESULTS: AFFECTED ROUTE vs SAFE ROUTE */}
          {hasSearched && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-brand-600" />
                  Corridor Comparison: {origin.code} ➔ {destination.code} (~{currentRouteData.distanceKm} km)
                </span>
                <span className="text-slate-500 font-medium">
                  Identified 1 Affected Chokepoint Route • 1 Safe Multi-Modal Alternative
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 1. 🛑 AFFECTED ROUTE CARD */}
                <div className="p-5 rounded-2xl bg-rose-50/40 border-2 border-rose-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Badge & Title */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1 shadow-xs">
                        <ShieldAlert className="w-3 h-3" />
                        <span>{currentRouteData.affectedRoute.status}</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                        Risk: {currentRouteData.affectedRoute.riskScore}/100
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        {currentRouteData.affectedRoute.name}
                      </h4>
                      <p className="text-xs font-extrabold text-rose-700 mt-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{currentRouteData.affectedRoute.delayNotice}</span>
                      </p>
                    </div>

                    {/* Hazard Breakdown Box */}
                    <div className="p-3 rounded-xl bg-white border border-rose-200 text-xs space-y-2">
                      <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                        {currentRouteData.affectedRoute.blockadeReason}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-100 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Transit Duration</span>
                          <span className="font-mono font-bold text-rose-700">{currentRouteData.affectedRoute.estTime}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Stranded Assets</span>
                          <span className="font-mono font-bold text-slate-800">{currentRouteData.affectedRoute.strandedCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Corridor Segments with Status Pills */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Waypoints & Road Segment Health:
                      </span>
                      <div className="space-y-1.5 text-xs">
                        {currentRouteData.affectedRoute.segments.map((seg, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg border flex items-center justify-between ${
                              seg.status === 'blocked'
                                ? 'bg-rose-100/70 border-rose-300 text-rose-950 font-bold'
                                : seg.status === 'congested'
                                ? 'bg-amber-50 border-amber-200 text-amber-900 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                seg.status === 'blocked' ? 'bg-rose-600 animate-ping' : seg.status === 'congested' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <span className="text-[11px]">{seg.from} ➔ {seg.to}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">{seg.distance} ({seg.mode})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Warning Footer Notice */}
                  <div className="p-3 rounded-xl bg-rose-100/60 border border-rose-200 text-[11px] text-rose-900 font-medium">
                    ⚠️ <strong>Advisory:</strong> {currentRouteData.affectedRoute.advisory}
                  </div>
                </div>

                {/* 2. 🟢 SAFE / ALTERNATIVE ROUTE CARD */}
                <div className="p-5 rounded-2xl bg-emerald-50/40 border-2 border-emerald-300 shadow-sm space-y-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-200/30 rounded-full blur-xl pointer-events-none" />

                  <div className="space-y-3">
                    {/* Badge & Title */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{currentRouteData.safeRoute.status}</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        {currentRouteData.safeRoute.timeSaved}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        {currentRouteData.safeRoute.name}
                      </h4>
                      <p className="text-xs font-extrabold text-emerald-700 mt-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Est. Transit: {currentRouteData.safeRoute.estTime} • {currentRouteData.safeRoute.reliabilityScore} Reliability</span>
                      </p>
                    </div>

                    {/* Operational Advantages Box */}
                    <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Clearance Protocol</span>
                          <span className="font-bold text-slate-800">{currentRouteData.safeRoute.clearanceAuthority}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Allocated Capacity</span>
                          <span className="font-bold text-slate-800">{currentRouteData.safeRoute.capacityDetails}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-emerald-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                          Autonomous Failover Advantages:
                        </span>
                        <ul className="space-y-1 text-[11px] text-slate-700">
                          {currentRouteData.safeRoute.advantages.map((adv, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Safe Corridor Segments */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Safe Segment Routing Breakdown:
                      </span>
                      <div className="space-y-1.5 text-xs">
                        {currentRouteData.safeRoute.segments.map((seg, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-emerald-100/50 border border-emerald-200/80 text-emerald-950 font-semibold flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              <span className="text-[11px]">{seg.from} ➔ {seg.to}</span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-800 font-bold">{seg.distance} ({seg.mode})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Action Button */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={handleDispatchSafeConvoy}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer hover:scale-[1.01]"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Authorize Convoy via Safe Route</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span className="flex items-center gap-1">
                        <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                        Continuous GPS AIS-140 feed active
                      </span>
                      <span className="font-mono font-bold text-slate-700">Ref: SETU-NFR-REROUTE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: REGIONAL LIFELINE HEALTH & RCI TRAJECTORY CHART (TOGGLEABLE) */}
      {activeViewMode === 'chart' && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800 font-sans">
                  Regional Lifeline Network Health & RCI Trajectory
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-brand-700 font-mono">
                  {timeRange} Horizon
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Real-time regional connectivity telemetry & autonomous multi-modal self-healing trajectory
              </p>
            </div>

            {/* Timeframe Filter Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              {['1D', '7D', '1M', '3M', '6M', '1Y', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeRange(tf)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeRange === tf
                      ? 'btn-orange-pill text-white shadow-sm'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Canvas with Smooth Orange Curve & Gradient */}
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="extejOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7a1a" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ff5500" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[30, 100]} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1">
                          <p className="font-extrabold text-slate-800">{label}</p>
                          <p className="text-brand-600 font-bold">RCI Health: {data.health}%</p>
                          <p className="text-slate-500">Relief Protected: ₹{data.revProtected} Cr</p>
                          {data.note && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-brand-700">
                              {data.note}
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="health" 
                  stroke="#ff7a1a" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#extejOrangeGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
