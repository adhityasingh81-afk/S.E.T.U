import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2, 
  Activity, 
  Layers, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  BarChart3,
  Sliders,
  Sparkles,
  ChevronDown,
  Plus,
  ArrowRightLeft,
  Send,
  CreditCard,
  Building,
  Check
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CRISIS_SCENARIOS } from '../../data/scenariosData';

const TIMEFRAME_DATA = {
  '1D': [
    { label: '00:00', health: 98, revProtected: 18.7, baseline: 82, note: 'Nominal Operations' },
    { label: '03:00', health: 97, revProtected: 18.7, baseline: 81, note: 'Normal Flow' },
    { label: '06:00', health: 95, revProtected: 18.5, baseline: 80, note: 'Pre-Disruption' },
    { label: '09:00', health: 58, revProtected: 4.8, baseline: 52, note: '⚡ TSMC 40% Fracture Dip' },
    { label: '12:00', health: 64, revProtected: 7.2, baseline: 56, note: 'AI Auto-Triaging Buffer' },
    { label: '15:00', health: 76, revProtected: 13.5, baseline: 64, note: 'Kyoto Dual-Route Routing' },
    { label: '18:00', health: 88, revProtected: 16.8, baseline: 72, note: 'Assembly Output Stabilized' },
    { label: '21:00', health: 94, revProtected: 18.1, baseline: 78, note: 'SLA Risk Neutralized' },
    { label: '23:59', health: 97, revProtected: 18.7, baseline: 81, note: 'Full Recovery Achieved' },
  ],
  '7D': [
    { label: 'Day 1 (Mon)', health: 96, revProtected: 18.7, baseline: 80, note: 'Nominal Global Flow' },
    { label: 'Day 2 (Tue)', health: 95, revProtected: 18.6, baseline: 79, note: 'Stable Inventory Runway' },
    { label: 'Day 3 (Wed)', health: 54, revProtected: 3.9, baseline: 50, note: '⚡ 40% Seismic Bottleneck' },
    { label: 'Day 4 (Thu)', health: 68, revProtected: 9.8, baseline: 61, note: 'Kyoto Sourcing Activated' },
    { label: 'Day 5 (Fri)', health: 82, revProtected: 15.4, baseline: 72, note: 'Emergency Air Freight Inbound' },
    { label: 'Day 6 (Sat)', health: 91, revProtected: 17.9, baseline: 78, note: 'Chennai Production Restored' },
    { label: 'Day 7 (Sun)', health: 96, revProtected: 18.7, baseline: 81, note: 'Resilience Target Met' },
  ],
  '1M': [
    { label: 'Week 1', health: 96, revProtected: 74.8, baseline: 81, note: 'Nominal Baseline' },
    { label: 'Week 2', health: 61, revProtected: 32.4, baseline: 54, note: '⚡ Disruption Ingestion' },
    { label: 'Week 3', health: 86, revProtected: 64.2, baseline: 73, note: 'Autonomous Reconfiguration' },
    { label: 'Week 4', health: 97, revProtected: 74.8, baseline: 82, note: 'Fortified Multi-Sourcing' },
  ],
  '3M': [
    { label: 'Month 1 (Jun)', health: 94, revProtected: 112.0, baseline: 80, note: 'Standard Multi-Tier Flow' },
    { label: 'Month 2 (Jul)', health: 66, revProtected: 71.5, baseline: 58, note: '⚡ Peak Disruption Shock' },
    { label: 'Month 3 (Aug)', health: 95, revProtected: 110.8, baseline: 82, note: 'Pareto Hardened Posture' },
  ],
  '6M': [
    { label: 'Mar', health: 88, revProtected: 56.0, baseline: 78, note: 'Q1 Close' },
    { label: 'Apr', health: 91, revProtected: 58.2, baseline: 80, note: 'Runway Expansion' },
    { label: 'May', health: 94, revProtected: 60.1, baseline: 81, note: 'Nominal Operations' },
    { label: 'Jun', health: 62, revProtected: 31.0, baseline: 55, note: '⚡ Mid-Year Disruption' },
    { label: 'Jul', health: 88, revProtected: 55.4, baseline: 75, note: 'Autonomous Mitigation' },
    { label: 'Aug', health: 96, revProtected: 61.2, baseline: 83, note: 'Hardened State' },
  ],
  '1Y': [
    { label: 'Q1 2026', health: 86, revProtected: 112.5, baseline: 77, note: 'Historic Baseline' },
    { label: 'Q2 2026', health: 90, revProtected: 116.0, baseline: 80, note: 'Process Hardening' },
    { label: 'Q3 2026', health: 93, revProtected: 118.7, baseline: 81, note: 'Current Active Posture' },
    { label: 'Q4 2026', health: 96, revProtected: 122.4, baseline: 84, note: 'Projected Fortified Index' },
  ],
  'ALL': [
    { label: '2023', health: 76, revProtected: 310.0, baseline: 70, note: 'Legacy Single-Sourcing' },
    { label: '2024', health: 81, revProtected: 360.0, baseline: 76, note: 'Regional Hub Expansion' },
    { label: '2025', health: 86, revProtected: 410.0, baseline: 80, note: 'Digital Twin Deployment' },
    { label: '2026 (NEXUS)', health: 96, revProtected: 450.0, baseline: 83, note: 'Autonomous Self-Healing' },
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
    ? (metrics?.totalRevenueAtRiskCr || 18.7)
    : activeStrategy 
    ? Math.max(0, Math.round((18.7 - activeStrategy.revenueProtectedCr) * 10) / 10)
    : 0.0;

  const recoveryDays = activeStrategy 
    ? activeStrategy.recoveryTimeDays 
    : isDisrupted 
    ? (metrics?.unassistedRecoveryDays || 19.0)
    : 3.2;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
            Command Center
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            AURA Devices Global Supply Chain • Autonomous Resilience & Financial Telemetry
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
              <span>Simulate Taiwan Fracture (40%)</span>
            </button>
          )}
        </div>
      </div>

      {/* TOP 3 HERO CARDS (Matching Extej Screenshot Top Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CARD 1: Supply Chain Capital & Risk Exposure */}
        <div className="extej-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-orange-100 text-brand-500">
                  <Activity className="w-3.5 h-3.5" />
                </span>
                Revenue at Risk Exposure
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
                ? (currency === 'INR' ? `₹${(18.7 - activeStrategy.revenueProtectedCr).toFixed(1)} Cr` : `$${((18.7 - activeStrategy.revenueProtectedCr) * 0.12).toFixed(1)} M`)
                : '₹0.00 Cr'}
            </div>

            {/* Multi-segment Color Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                <div className="h-full bg-brand-500 rounded-l-full" style={{ width: '42%' }} title="Silicon Shortage: 42%"></div>
                <div className="h-full bg-sky-500" style={{ width: '28%' }} title="Factory Slowdown: 28%"></div>
                <div className="h-full bg-emerald-500" style={{ width: '18%' }} title="Logistics Freight: 18%"></div>
                <div className="h-full bg-purple-500 rounded-r-full" style={{ width: '12%' }} title="SLA Penalties: 12%"></div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-[11px] font-semibold pt-1 text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span> Silicon (42%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span> Plants (28%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Buffer (18%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span> SLA (12%)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Disruption Exposure Shift</span>
            <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {isDisrupted && !activeStrategy ? '+14.5% Risk Spike' : '+96.2% Protected'}
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
                Active Fracture Node
              </span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                TSMC Tier-1
              </span>
            </div>

            {/* Giant Metric */}
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans flex items-baseline gap-2">
                40.0% <span className="text-base text-slate-400 font-semibold font-sans">Cap Cut</span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Taiwan Micro Foundry (Hsinchu) • 45-Day Seismic Lock
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-600 font-medium">
              <span>Chennai Plant Output Shock</span>
              <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">-38% Flow</span>
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

        {/* CARD 3: Recovery Velocity & Composite Resilience */}
        <div className="extej-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-600">
                  <Zap className="w-3.5 h-3.5" />
                </span>
                Recovery Velocity Index
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                83% Speedup
              </span>
            </div>

            {/* Giant Metric */}
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans flex items-baseline gap-2">
                {recoveryDays} <span className="text-base text-slate-400 font-semibold font-sans">Days</span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                NEXUS Autonomous Recovery vs 19.0 Days Baseline
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-600 font-medium">
              <span>Composite Resilience</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {resilienceScore?.overallScore || 81}/100 Score
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('digital-twin')}
              className="btn-secondary-pill py-2 text-xs font-bold text-center cursor-pointer"
            >
              Map View
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

      {/* MIDDLE SECTION: Live Dynamic Time-Series Chart */}
      <div className="extej-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 font-sans">
                Supply Network Health & Recovery Curve
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-brand-700 font-mono">
                {timeRange} Horizon
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Real-time resilience telemetry & automated multi-hub self-healing trajectory
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
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                domain={[30, 100]} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-3 text-slate-400 font-semibold">
                          <span>{dataPoint.label}</span>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-mono">
                            {timeRange}
                          </span>
                        </div>
                        <div className="font-extrabold text-brand-600 font-sans text-base">
                          Resilience Index: {dataPoint.health}%
                        </div>
                        <div className="text-slate-700 font-medium">
                          Protected Capital: <strong className="font-mono text-emerald-600">₹{dataPoint.revProtected} Cr</strong>
                        </div>
                        {dataPoint.note && (
                          <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                            {dataPoint.note}
                          </div>
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
                stroke="#ff6b00"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#extejOrangeGrad)"
                dot={{ r: 3.5, fill: '#ff6b00', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6.5, fill: '#ff5500', stroke: '#ffffff', strokeWidth: 3 }}
                animationDuration={450}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BOTTOM SECTION: "My Strategic Hub Cards" */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 font-sans">
            Strategic Facility & Sourcing Hubs
          </h3>
          <button
            onClick={() => onNavigateToTab('digital-twin')}
            className="btn-orange-pill px-3.5 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>View All 15 Hubs</span>
          </button>
        </div>

        {/* 3 Facility Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div 
            onClick={() => onNavigateToTab('digital-twin')}
            className="facility-card-orange p-5 rounded-2xl space-y-4 relative shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center -space-x-2">
                <div className="w-6 h-6 rounded-full bg-rose-500 opacity-90"></div>
                <div className="w-6 h-6 rounded-full bg-amber-400 opacity-90"></div>
              </div>
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[11px] font-bold">
                ✓
              </span>
            </div>

            <div className="font-mono text-base font-bold text-slate-800 tracking-wider">
              HUB-7740 9921 4410 0192
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-orange-200/50">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400">Facility Director</span>
                <span className="font-bold text-slate-800">KARTHIK SUBRAMANIAN</span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-wider text-slate-400">Class</span>
                <span className="font-bold text-brand-600 font-mono">CHENNAI PLANT 1</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => onNavigateToTab('digital-twin')}
            className="facility-card-bg p-5 rounded-2xl border border-slate-200/80 space-y-4 relative shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center -space-x-2">
                <div className="w-6 h-6 rounded-full bg-rose-500 opacity-90"></div>
                <div className="w-6 h-6 rounded-full bg-amber-400 opacity-90"></div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                ACTIVE
              </span>
            </div>

            <div className="font-mono text-base font-bold text-slate-800 tracking-wider">
              HUB-4444 3333 2222 1111
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400">Facility Director</span>
                <span className="font-bold text-slate-800">SARAH JENKINS</span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-wider text-slate-400">Class</span>
                <span className="font-bold text-slate-700 font-mono">APEX SILICON USA</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => onNavigateToTab('digital-twin')}
            className="facility-card-bg p-5 rounded-2xl border border-slate-200/80 space-y-4 relative shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center -space-x-2">
                <div className="w-6 h-6 rounded-full bg-rose-500 opacity-90"></div>
                <div className="w-6 h-6 rounded-full bg-amber-400 opacity-90"></div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                FORTIFIED
              </span>
            </div>

            <div className="font-mono text-base font-bold text-slate-800 tracking-wider">
              HUB-1111 2222 3333 4444
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400">Facility Director</span>
                <span className="font-bold text-slate-800">CHERYL NG</span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-wider text-slate-400">Class</span>
                <span className="font-bold text-slate-700 font-mono">SINGAPORE HUB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
