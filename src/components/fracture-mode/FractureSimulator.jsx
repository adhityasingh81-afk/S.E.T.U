import React, { useState } from 'react';
import { 
  Flame, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  ShieldAlert,
  Compass,
  ArrowDown
} from 'lucide-react';
import { NODES } from '../../data/auraSupplyChainData';
import { CRISIS_SCENARIOS } from '../../data/scenariosData';

export function FractureSimulator({
  onRunSimulation,
  activeScenario,
  simulationResult,
  onNavigateToRecovery,
  isDisrupted
}) {
  const [selectedNodeId, setSelectedNodeId] = useState(activeScenario?.affectedNodeId || 'sup-taiwan-semi');
  const [severityPct, setSeverityPct] = useState(activeScenario?.severityPct || 40);
  const [durationDays, setDurationDays] = useState(activeScenario?.durationDays || 45);
  const [eventType, setEventType] = useState(activeScenario?.eventType || 'Supplier Capacity Cut');
  const [isSimulating, setIsSimulating] = useState(false);

  const eventTypes = [
    'Supplier Capacity Cut / Geopolitical',
    'Semiconductor Shortage (40%)',
    'Port & Maritime Corridor Blockade',
    'Natural Disaster / Seismic Activity',
    'Raw Material & Lithium Export Embargo',
    'Factory Power Grid Failure',
    'Cyberattack & Logistics Ransomware',
  ];

  const handleTriggerSim = () => {
    setIsSimulating(true);
    setTimeout(() => {
      onRunSimulation(selectedNodeId, severityPct, durationDays, eventType);
      setIsSimulating(false);
    }, 400);
  };

  const currentResult = simulationResult;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Header Banner */}
      <div className="extej-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-orange-100 text-brand-600">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-brand-700">
                Fracture Mode
              </span>
              <span className="text-xs text-slate-400 font-semibold">Deterministic Ripple Engine</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5 font-sans">
              Disruption Propagation & Ripple Effect Simulator
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Stress-test network resilience by simulating supply bottlenecks, corridor outages, and demand shocks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerSim}
            disabled={isSimulating}
            className="btn-orange-pill px-5 py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Propagating Ripple...' : 'Simulate Fracture'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Disruption Parameter Controls */}
        <div className="lg:col-span-5 extej-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-500" />
              Disruption Parameters
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Interactive Controls</span>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Scenario Presets</label>
            <div className="grid grid-cols-1 gap-2">
              {CRISIS_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedNodeId(sc.affectedNodeId);
                    setSeverityPct(sc.severityPct);
                    setDurationDays(sc.durationDays);
                    setEventType(sc.eventType);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                    selectedNodeId === sc.affectedNodeId && severityPct === sc.severityPct
                      ? 'bg-orange-50 border-brand-500 text-brand-900 font-bold shadow-sm'
                      : 'bg-[#f8fafc] border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{sc.title.split('(')[0]}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold shrink-0">
                    {sc.severityPct}% • {sc.durationDays}d
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Node Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Target Disruption Node</label>
            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
            >
              <optgroup label="Tier-1 & 2 Suppliers">
                {NODES.filter(n => n.type === 'supplier').map(n => (
                  <option key={n.id} value={n.id}>{n.name} ({n.region})</option>
                ))}
              </optgroup>
              <optgroup label="Manufacturing Factories">
                {NODES.filter(n => n.type === 'factory').map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </optgroup>
              <optgroup label="Regional Gateways">
                {NODES.filter(n => n.type === 'warehouse').map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Event Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Event Classification</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
            >
              {eventTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Severity Slider */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-bold">Severity / Capacity Cut:</span>
              <span className="font-mono font-extrabold text-brand-600 text-sm">{severityPct}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={severityPct}
              onChange={(e) => setSeverityPct(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>10% (Minor)</span>
              <span>50% (Severe)</span>
              <span>100% (Total Stop)</span>
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-700 font-bold">Estimated Disruption Duration:</span>
              <span className="font-mono font-extrabold text-amber-600 text-sm">{durationDays} Days</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>5 Days</span>
              <span>45 Days</span>
              <span>120 Days</span>
            </div>
          </div>

          <button
            onClick={handleTriggerSim}
            className="w-full btn-secondary-pill py-2.5 text-xs font-bold"
          >
            Apply & Recalculate Ripple
          </button>
        </div>

        {/* Right 7 Cols: Step-by-Step Ripple Propagation Stepper */}
        <div className="lg:col-span-7 extej-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                Downstream Ripple Cascade (Chain Reaction)
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic calculation of multi-tier operational propagation
              </p>
            </div>
            <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Total Risk: ₹{currentResult?.metrics?.totalRevenueAtRiskCr || 18.7} Cr
            </span>
          </div>

          {/* Stepper Chain */}
          <div className="space-y-3 relative">
            {currentResult?.propagationTimeline?.map((item) => (
              <div
                key={item.step}
                className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-mono font-bold text-slate-700 shrink-0 shadow-sm">
                    0{item.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 font-sans">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200/70">
                        {item.timeframe}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Metric Before -> After Pill */}
                <div className="shrink-0 sm:text-right bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 block font-semibold">{item.metricName}</span>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold mt-0.5">
                    <span className="text-slate-400 line-through">{item.beforeVal}</span>
                    <ArrowRight className="w-3 h-3 text-rose-500" />
                    <span className="text-rose-600 font-extrabold">{item.afterVal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Direct CTA to Recovery Cockpit */}
          <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-brand-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-600" />
                Autonomous Resolution Ready
              </span>
              <p className="text-[11px] text-slate-600 font-medium">
                NEXUS has synthesized 3 recovery configurations to safeguard enterprise revenue.
              </p>
            </div>

            <button
              onClick={onNavigateToRecovery}
              className="btn-orange-pill px-4 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5"
            >
              <span>Recovery Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
