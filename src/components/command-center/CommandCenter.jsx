import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  AlertTriangle,
  ChevronDown,
  CloudRain,
  ShieldCheck,
  Truck,
  HeartPulse,
  Fuel,
  Wheat,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CRISIS_SCENARIOS } from '../../data/scenariosData';
import { FindMyRouteSection } from './FindMyRouteSection';

const TIMEFRAME_DATA = {
  '1D': [
    { label: '00:00', health: 98, revProtected: 21.4, baseline: 80, note: 'Nominal Corridors' },
    { label: '03:00', health: 97, revProtected: 21.4, baseline: 80, note: 'Pre-Monsoon Rainfall' },
    { label: '06:00', health: 95, revProtected: 21.0, baseline: 79, note: 'Precipitation 84mm/hr' },
    { label: '09:00', health: 42, revProtected: 5.2, baseline: 48, note: '⚡ NH-6 Sonapur Landslide' },
    { label: '12:00', health: 58, revProtected: 8.8, baseline: 54, note: 'NFR Rail Diversion Initialized' },
    { label: '15:00', health: 74, revProtected: 15.2, baseline: 65, note: 'BRO Bailey Bridge Mobilized' },
    { label: '18:00', health: 86, revProtected: 18.9, baseline: 74, note: 'NW-2 River Barges En Route' },
    { label: '21:00', health: 93, revProtected: 20.4, baseline: 78, note: 'Tripura O2 Supply Restored' },
    { label: '23:59', health: 97, revProtected: 21.4, baseline: 81, note: 'Corridor Flow Fortified' },
  ],
  '7D': [
    { label: 'Day 1 (Mon)', health: 96, revProtected: 21.4, baseline: 80, note: 'Nominal Inter-State Flow' },
    { label: 'Day 2 (Tue)', health: 95, revProtected: 21.2, baseline: 79, note: 'Stable District Stockpiles' },
    { label: 'Day 3 (Wed)', health: 40, revProtected: 4.5, baseline: 46, note: '⚡ 75% Sonapur Corridor Cut' },
    { label: 'Day 4 (Thu)', health: 65, revProtected: 11.2, baseline: 58, note: 'Operation Setu Air Bridge Active' },
    { label: 'Day 5 (Fri)', health: 80, revProtected: 17.1, baseline: 70, note: 'BRO Bailey Bridge Assembly' },
    { label: 'Day 6 (Sat)', health: 90, revProtected: 20.1, baseline: 77, note: 'Single-Lane Convoy Cleared' },
    { label: 'Day 7 (Sun)', health: 96, revProtected: 21.4, baseline: 81, note: 'RCI Target Restored' },
  ],
  '1M': [
    { label: 'Week 1', health: 96, revProtected: 85.6, baseline: 80, note: 'Dry Season Baseline' },
    { label: 'Week 2', health: 52, revProtected: 38.2, baseline: 50, note: '⚡ Peak Monsoon Influx' },
    { label: 'Week 3', health: 84, revProtected: 72.8, baseline: 72, note: 'Autonomous Tri-Modal Rerouting' },
    { label: 'Week 4', health: 97, revProtected: 85.6, baseline: 82, note: 'All-Weather Corridor Open' },
  ],
  '3M': [
    { label: 'Month 1 (Jun)', health: 94, revProtected: 128.0, baseline: 80, note: 'Early Monsoon Rains' },
    { label: 'Month 2 (Jul)', health: 58, revProtected: 78.5, baseline: 52, note: '⚡ Peak River & Hill Floods' },
    { label: 'Month 3 (Aug)', health: 95, revProtected: 125.8, baseline: 82, note: 'Fortified Multi-Modal Network' },
  ],
  '6M': [
    { label: 'Mar', health: 88, revProtected: 64.0, baseline: 78, note: 'Pre-Monsoon Preparedness' },
    { label: 'Apr', health: 91, revProtected: 66.2, baseline: 80, note: 'FCI Buffer Expansion' },
    { label: 'May', health: 94, revProtected: 68.1, baseline: 81, note: 'Nominal Operations' },
    { label: 'Jun', health: 55, revProtected: 36.0, baseline: 51, note: '⚡ Severe Hill Landslides' },
    { label: 'Jul', health: 86, revProtected: 62.4, baseline: 74, note: 'Multi-Agency Recovery' },
    { label: 'Aug', health: 96, revProtected: 69.2, baseline: 83, note: 'Permanent Sela Pass Siding' },
  ],
  '1Y': [
    { label: 'Q1 2026', health: 86, revProtected: 128.5, baseline: 77, note: 'Historic Pre-Setu Baseline' },
    { label: 'Q2 2026', health: 90, revProtected: 132.0, baseline: 80, note: 'Doppler Warning Integration' },
    { label: 'Q3 2026', health: 93, revProtected: 135.7, baseline: 81, note: 'Active Monsoon Protocol' },
    { label: 'Q4 2026', health: 97, revProtected: 140.4, baseline: 84, note: '8-State Fortified Network' },
  ],
  'ALL': [
    { label: '2023', health: 68, revProtected: 340.0, baseline: 65, note: 'Legacy Road-Only Bottlenecks' },
    { label: '2024', health: 74, revProtected: 410.0, baseline: 72, note: 'Lumding-Badarpur Broad Gauge' },
    { label: '2025', health: 82, revProtected: 490.0, baseline: 78, note: 'NW-2 River Barge Trials' },
    { label: '2026 (NEXUS)', health: 96, revProtected: 650.0, baseline: 84, note: 'Autonomous AI Lifeline Platform' },
  ]
};

export function CommandCenter({
  resilienceScore,
  isDisrupted,
  activeScenario,
  metrics,
  activeStrategy,
  onLaunchScenario,
  onNavigateToTab,
  onResetNetwork
}) {
  const [timeRange, setTimeRange] = useState('1D');
  const [currency, setCurrency] = useState('INR');

  // Dynamic time-series data based on user selection
  const activeChartData = TIMEFRAME_DATA[timeRange] || TIMEFRAME_DATA['1D'];

  const revenueAtRisk = isDisrupted && !activeStrategy 
    ? (metrics?.totalRevenueAtRiskCr || 21.4)
    : activeStrategy 
    ? Math.max(0, Math.round((21.4 - activeStrategy.revenueProtectedCr) * 10) / 10)
    : 0.0;

  const recoveryDays = activeStrategy 
    ? activeStrategy.recoveryTimeDays 
    : isDisrupted 
    ? (metrics?.unassistedRecoveryDays || 18.0)
    : 3.4;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
            MDoNER Executive Command Center
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Ministry of Development of North Eastern Region • Regional Connectivity & Lifeline Logistics Telemetry
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isDisrupted && !activeStrategy ? (
            <button
              onClick={() => onNavigateToTab('recovery-cockpit')}
              className="btn-orange-pill px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Zap className="w-4 h-4" />
              <span>Deploy Autonomous Recovery</span>
            </button>
          ) : (
            <button
              onClick={() => onLaunchScenario(CRISIS_SCENARIOS[0])}
              className="btn-orange-pill px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Zap className="w-4 h-4" />
              <span>Simulate NH-6 Sonapur Landslide (75%)</span>
            </button>
          )}
        </div>
      </div>

      {/* TOP 3 HERO CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CARD 1: Regional Relief Value at Risk */}
        <div className="extej-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-orange-100 text-brand-500">
                  <Activity className="w-3.5 h-3.5" />
                </span>
                Economic & Relief Value at Risk
              </span>
              <div 
                onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <span>{currency === 'INR' ? 'INR (₹ Cr)' : 'USD ($ M)'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Giant Metric */}
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
              {isDisrupted && !activeStrategy 
                ? (currency === 'INR' ? `₹${revenueAtRisk} Cr` : `$${(revenueAtRisk * 0.12).toFixed(1)} M`)
                : activeStrategy 
                ? (currency === 'INR' ? `₹${(21.4 - activeStrategy.revenueProtectedCr).toFixed(1)} Cr` : `$${((21.4 - activeStrategy.revenueProtectedCr) * 0.12).toFixed(1)} M`)
                : '₹0.00 Cr'}
            </div>

            {/* Multi-segment Color Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                <div className="h-full bg-brand-500 rounded-l-full" style={{ width: '42%' }} title="Medical O2 & Pharma: 42%"></div>
                <div className="h-full bg-sky-500" style={{ width: '28%' }} title="POL Fuels & Diesel: 28%"></div>
                <div className="h-full bg-emerald-500" style={{ width: '18%' }} title="PDS Foodgrains: 18%"></div>
                <div className="h-full bg-purple-500 rounded-r-full" style={{ width: '12%' }} title="Civil Commerce: 12%"></div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-[11px] font-semibold pt-1 text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span> Med O2 (42%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span> Fuel (28%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Grains (18%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span> Trade (12%)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Corridor Vulnerability Shift</span>
            <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {isDisrupted && !activeStrategy ? '+18.2% Risk Surge' : '+97.0% Protected'}
            </span>
          </div>
        </div>

        {/* CARD 2: Active Disruption Hub */}
        <div className="extej-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-amber-100 text-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </span>
                Active Mountain Chokepoint
              </span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                NH-6 Lifeline
              </span>
            </div>

            {/* Giant Metric */}
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans flex items-baseline gap-2">
                75.0% <span className="text-base text-slate-400 font-semibold font-sans">Flow Cut</span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Sonapur Mountain Pass (Meghalaya) • 14-Day Landslide Severance
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-600 font-medium">
              <span>Agartala & Aizawl Access Shock</span>
              <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">-75% Highway Transit</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('fracture-mode')}
              className="btn-orange-pill py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
            >
              Simulate
            </button>
            <button
              onClick={() => onNavigateToTab('recovery-cockpit')}
              className="btn-orange-pill py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
            >
              Deploy
            </button>
            <button
              onClick={() => onNavigateToTab('negotiation-room')}
              className="btn-orange-pill py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
            >
              Negotiate
            </button>
          </div>
        </div>

        {/* CARD 3: Regional Connectivity Index (RCI) */}
        <div className="extej-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-600">
                  <Zap className="w-3.5 h-3.5" />
                </span>
                Regional Connectivity Index (RCI)
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                82% Speedup
              </span>
            </div>

            {/* Giant Metric */}
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans flex items-baseline gap-2">
                {recoveryDays} <span className="text-base text-slate-400 font-semibold font-sans">Days</span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                NEXUS Autonomous Recovery vs 18.0 Days Unassisted
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-600 font-medium">
              <span>8-State Composite Index</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {resilienceScore?.overallScore || 80}/100 Score
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('digital-twin')}
              className="btn-secondary-pill py-2 text-xs font-bold text-center cursor-pointer"
            >
              NER Map
            </button>
            <button
              onClick={() => onNavigateToTab('counterfactual')}
              className="btn-secondary-pill py-2 text-xs font-bold text-center cursor-pointer"
            >
              ROI Matrix
            </button>
            <button
              onClick={() => onNavigateToTab('resilience-planner')}
              className="btn-orange-pill py-2 text-xs font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
            >
              Hardening
            </button>
          </div>
        </div>
      </div>

      {/* SPECIALIZED NER FEATURE 1: DOPPLER RADAR & MONSOON LANDSLIDE ALERT BANNER */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isDisrupted 
          ? 'bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-rose-200 shadow-sm'
          : 'bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 border-sky-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDisrupted ? 'bg-rose-500 text-white animate-pulse' : 'bg-sky-600 text-white'}`}>
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700 font-mono">
                  {isDisrupted ? 'CRITICAL DISRUPTION IN PROGRESS' : 'REAL-TIME WEATHER & CORRIDOR ADVISORY'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-200 text-rose-900">
                  NH-6 Sonapur Pass
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {isDisrupted 
                  ? 'Heavy Orographic Cloudburst (84mm/hr) • 180m Slope Liquefaction at Sonapur Tunnel • Road Transit Suspended to Tripura & Mizoram'
                  : 'Monsoon Telemetry Nominal • Green Corridor Protocols active across all 8 North Eastern States'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToTab('digital-twin')}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Inspect Pass Geometry</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-500" />
            </button>
          </div>
        </div>
      </div>

      {/* SPECIALIZED NER FEATURE 2: 8-STATE ESSENTIAL STOCKPILE DEPLETION MONITOR */}
      <div className="extej-card p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-extrabold text-slate-900 font-sans">
              Critical Lifeline Depletion & Stockpile Autonomy Monitor
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Real-Time Telemetry • 8 State Capitals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gauge 1: Medical Oxygen */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                Cryogenic Medical O2 (LMO)
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                isDisrupted ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isDisrupted ? '2.2d Runway Left' : '14d Healthy Buffer'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isDisrupted ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: isDisrupted ? '18%' : '78%' }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Agartala & Aizawl Medical Colleges</span>
              <span className="font-bold text-slate-800">{isDisrupted ? '1,800 Cylinders' : '8,400 Cylinders'}</span>
            </div>
          </div>

          {/* Gauge 2: POL Fuel & High-Altitude Diesel */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-amber-500" />
                High-Altitude POL Fuel & Diesel
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                isDisrupted ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isDisrupted ? '3.6d Emergency Runway' : '28d Strategic Buffer'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isDisrupted ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: isDisrupted ? '26%' : '84%' }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>District Hospitals & Water Pumping</span>
              <span className="font-bold text-slate-800">{isDisrupted ? '240k Litres' : '1.2M Litres'}</span>
            </div>
          </div>

          {/* Gauge 3: PDS Essential Foodgrains */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5 text-emerald-600" />
                PDS Fortified Foodgrains (FCI)
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {isDisrupted ? '8.5d Buffer Active' : '35d Granary Buffer'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: isDisrupted ? '48%' : '90%' }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>FCI Siding Stockpiles</span>
              <span className="font-bold text-slate-800">{isDisrupted ? '42k Tonnes' : '88k Tonnes'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Find My Route (Corridor & Lifeline Risk Navigator) & RCI Trajectory */}
      <FindMyRouteSection
        isDisrupted={isDisrupted}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        activeChartData={activeChartData}
      />
    </div>
  );
}
