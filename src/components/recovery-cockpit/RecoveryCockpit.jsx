import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle, 
  MessageSquareCode, 
  ArrowRight, 
  Sliders, 
  DollarSign, 
  Zap, 
  Check, 
  ChevronRight,
  Info,
  Sparkles,
  Award
} from 'lucide-react';
import { generateRecoveryStrategies } from '../../engine/recoveryOptimizer';
import { nexusApi } from '../../api/nexusApi';

const CONTAINMENT_ACTIONS = [
  {
    id: 'activate-backup',
    title: 'Activate Secondary Supplier',
    hub: 'Kyoto Microelectronics & Apex Silicon',
    mitigation: '42% Risk Reduction',
    reductionFactor: 0.42,
    timeframe: 'Day 2 Injection',
    impact: 'Failover 40,000 monthly SoC units to qualified secondary foundries.',
    cost: '₹1.2 Cr Re-tooling Fee'
  },
  {
    id: 'reserve-buffer',
    title: 'Reserve Emergency Buffer',
    hub: 'Jurong Global Hub (Singapore)',
    mitigation: '24% Risk Reduction',
    reductionFactor: 0.24,
    timeframe: 'Day 2 Injection',
    impact: 'Lock 15,000 safety stock units exclusively for Tier-1 assembly lines.',
    cost: '₹45 Lakhs Holding Cost'
  },
  {
    id: 'prioritize-sla',
    title: 'Prioritize High-Margin SLAs',
    hub: 'Enterprise Cloud & Mobility',
    mitigation: '18% Risk Reduction',
    reductionFactor: 0.18,
    timeframe: 'Day 3 Injection',
    impact: 'Reallocate 85% of available inventory to Apex HyperScale to avert ₹65L/day penalty.',
    cost: '₹0 Penalty Avoided'
  },
  {
    id: 'expedite-freight',
    title: 'Expedite Charter Air Freight',
    hub: 'Frankfurt & Singapore Air Corridors',
    mitigation: '16% Risk Reduction',
    reductionFactor: 0.16,
    timeframe: 'Day 1 Injection',
    impact: 'Bypass congested ocean routes via dedicated Boeing 777F cargo flights.',
    cost: '₹85 Lakhs Air Charter'
  }
];

export function RecoveryCockpit({
  simulationResult,
  activeStrategy,
  onApplyStrategy,
  onNavigateToNegotiation,
  onNavigateToCounterfactual,
}) {
  const [resilienceBudget, setResilienceBudget] = useState({
    maxCostPct: 4.0,
    costWeight: 25,
    speedWeight: 45,
    resilienceWeight: 30,
  });

  const [activeContainment, setActiveContainment] = useState(['activate-backup', 'reserve-buffer']);
  const [selectedStrategyForDetails, setSelectedStrategyForDetails] = useState(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [strategies, setStrategies] = useState(() => generateRecoveryStrategies(simulationResult, resilienceBudget));

  const toggleContainment = (actionId) => {
    setActiveContainment(prev => 
      prev.includes(actionId) 
        ? prev.filter(id => id !== actionId) 
        : [...prev, actionId]
    );
  };

  const uncontainedExposure = simulationResult?.metrics?.uncontainedTotalRiskCr || simulationResult?.metrics?.totalRevenueAtRiskCr || 18.7;
  let totalMitigation = 0;
  activeContainment.forEach(id => {
    const found = CONTAINMENT_ACTIONS.find(a => a.id === id);
    if (found) totalMitigation += found.reductionFactor;
  });
  totalMitigation = Math.min(0.82, totalMitigation);

  const containedExposure = Math.round((uncontainedExposure * (1 - totalMitigation)) * 10) / 10;
  const capitalSaved = Math.round((uncontainedExposure - containedExposure) * 10) / 10;
  const containedSites = Math.max(2, Math.round(9 * (1 - totalMitigation)));

  // Sync recovery strategies with backend API
  React.useEffect(() => {
    let isMounted = true;
    nexusApi.getRecoveryStrategies(simulationResult, resilienceBudget)
      .then(res => {
        if (isMounted) {
          const list = Array.isArray(res) ? res : (res?.strategies || generateRecoveryStrategies(simulationResult, resilienceBudget));
          setStrategies(list);
        }
      })
      .catch(() => {
        if (isMounted) {
          setStrategies(generateRecoveryStrategies(simulationResult, resilienceBudget));
        }
      });

    return () => { isMounted = false; };
  }, [simulationResult, resilienceBudget]);

  const handleBudgetChange = (updates) => {
    setResilienceBudget(prev => ({ ...prev, ...updates }));
    setSelectedStrategyForDetails(null);
  };

  const currentSelected = selectedStrategyForDetails || strategies.find(s => s.isRecommended) || strategies[0];

  const handleApply = (strat) => {
    setIsApplying(true);
    setTimeout(() => {
      onApplyStrategy(strat);
      setIsApplying(false);
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Header Banner */}
      <div className="extej-card px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-orange-100 text-brand-600">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-brand-700 font-mono">
                Recovery Cockpit
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 font-sans">
                AI Multi-Agent Recovery Strategies
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExplanationModal(true)}
            className="btn-secondary-pill px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 text-brand-500" />
            <span>Explainable AI Rationale</span>
          </button>
        </div>
      </div>

      {/* Resilience Budget & Preferences Bar */}
      <div className="extej-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-500" />
            Resilience Budget & Optimization Priorities (F7)
          </span>
          <span className="text-[11px] font-semibold text-slate-400">Dynamically tunes strategy weights</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
          {/* Max Cost Allowance */}
          <div className="space-y-1 bg-[#f8fafc] p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between text-slate-700 font-bold">
              <span>Max Cost Cap:</span>
              <span className="font-mono text-brand-600">{resilienceBudget.maxCostPct}% ARR</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6"
              step="0.1"
              value={resilienceBudget.maxCostPct}
              onChange={(e) => handleBudgetChange({ maxCostPct: Number(e.target.value) })}
              className="w-full accent-brand-500 cursor-pointer"
            />
          </div>

          {/* Cost Weight */}
          <div className="space-y-1 bg-[#f8fafc] p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between text-slate-700 font-bold">
              <span>Cost Priority:</span>
              <span className="font-mono text-emerald-600">{resilienceBudget.costWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={resilienceBudget.costWeight}
              onChange={(e) => handleBudgetChange({ costWeight: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Speed Weight */}
          <div className="space-y-1 bg-[#f8fafc] p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between text-slate-700 font-bold">
              <span>Speed Priority:</span>
              <span className="font-mono text-amber-600">{resilienceBudget.speedWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={resilienceBudget.speedWeight}
              onChange={(e) => handleBudgetChange({ speedWeight: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Resilience Weight */}
          <div className="space-y-1 bg-[#f8fafc] p-3 rounded-xl border border-slate-200">
            <div className="flex justify-between text-slate-700 font-bold">
              <span>Resilience Weight:</span>
              <span className="font-mono text-sky-600">{resilienceBudget.resilienceWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={resilienceBudget.resilienceWeight}
              onChange={(e) => handleBudgetChange({ resilienceWeight: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3 Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {strategies.map((strategy) => {
          const isCurrentActive = activeStrategy?.id === strategy.id;
          const isSelected = currentSelected?.id === strategy.id;

          return (
            <div
              key={strategy.id}
              onClick={() => setSelectedStrategyForDetails(strategy)}
              className={`extej-card p-6 space-y-4 cursor-pointer transition-all relative ${
                strategy.isRecommended
                  ? 'border-brand-500 ring-2 ring-brand-500/30 bg-orange-50/15 shadow-md'
                  : isSelected
                  ? 'border-brand-400 ring-1 ring-brand-400/20 bg-orange-50/10'
                  : isCurrentActive
                  ? 'border-emerald-500/80 bg-emerald-50/20'
                  : 'hover:border-slate-300 bg-white'
              }`}
            >
              {strategy.isRecommended && (
                <div className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-brand-500 to-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md shadow-brand-500/20 animate-fade-in-up">
                  <Award className="w-3 h-3 text-amber-100" />
                  Recommended Plan
                </div>
              )}

              {/* Card Header */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-brand-600 font-mono">
                    {strategy.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      strategy.isRecommended ? 'bg-orange-100 text-brand-700 font-extrabold' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {strategy.badge}
                    </span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md font-mono ${
                      strategy.isRecommended ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {strategy.compositeRankScore}% Match
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 font-sans">
                  {strategy.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 font-medium">
                  {strategy.tagline}
                </p>

                {!strategy.withinBudget && (
                  <div className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center justify-between">
                    <span>⚠️ Exceeds {resilienceBudget.maxCostPct}% Cost Cap</span>
                    <span className="font-mono">({strategy.costPercentageOfAnnual}%)</span>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
                <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold">Cost Outlay:</span>
                  <span className="font-bold text-slate-800">+₹{strategy.costCr} Cr</span>
                </div>
                <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold">Recovery Time:</span>
                  <span className="font-bold text-amber-600">{strategy.recoveryTimeDays} Days</span>
                </div>
                <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold">Revenue Saved:</span>
                  <span className="font-bold text-emerald-600">{strategy.revenueProtectedPct}%</span>
                </div>
                <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 block font-sans font-semibold">Resilience Gain:</span>
                  <span className="font-bold text-sky-600">+{strategy.resilienceGain} Pts</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(strategy);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isCurrentActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'btn-orange-pill'
                  }`}
                >
                  {isCurrentActive ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                      <span>Active Plan Deployed</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Deploy {strategy.name}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Strategy Deep-Dive */}
      <div className="extej-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">
                Action Playbook: {currentSelected.name}
              </span>
              <span className="text-xs font-medium text-slate-400">({currentSelected.title})</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              Step-by-Step Autonomous Execution Playbook
            </h3>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onNavigateToNegotiation}
              className="btn-purple-pill px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>Simulate Negotiation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNavigateToCounterfactual}
              className="btn-secondary-pill px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100"
            >
              <span>Compare Counterfactual</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Steps List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentSelected.keyActions.map((action, i) => (
            <div key={action.id} className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-brand-600 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-brand-600 flex items-center justify-center font-mono text-[10px] font-bold">
                    0{i + 1}
                  </span>
                  {action.agent}
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {action.timeframe}
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-slate-800 font-sans">{action.title}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{action.description}</p>
              <div className="pt-1 text-[10px] text-slate-400 font-mono font-semibold border-t border-slate-200/60">
                Estimated Outlay: <span className="text-slate-800 font-bold">₹{action.costCr} Cr</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FRACTURE CONTAINMENT SANDBOX (In-Flight Autonomous Mitigation) */}
      <div className="extej-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900 font-sans">
                Fracture Containment & In-Flight Interventions
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                {activeContainment.length} Active Interventions
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Intervene during cascade propagation to lock emergency safety stock, route backup capacity, and avert SLA breaches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              +{Math.round(totalMitigation * 100)}% Risk Mitigated
            </span>
          </div>
        </div>

        {/* Live Before vs After Containment Telemetry Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Uncontained Risk
            </span>
            <div className="text-2xl font-black font-mono text-rose-400 line-through">
              ₹{uncontainedExposure} Cr
            </div>
            <span className="text-[10px] text-slate-400">Without in-flight actions</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Contained Risk (Live)
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400">
              ₹{containedExposure} Cr
            </div>
            <span className="text-[10px] text-slate-400">With {activeContainment.length} interventions</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Capital Safeguarded
            </span>
            <div className="text-2xl font-black font-mono text-amber-300">
              +₹{capitalSaved} Cr
            </div>
            <span className="text-[10px] text-slate-400">({Math.round(totalMitigation * 100)}% Protected)</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
              Contained Blast Radius
            </span>
            <div className="text-2xl font-black font-mono text-sky-300">
              {containedSites} <span className="text-sm font-semibold text-slate-300">Sites</span>
            </div>
            <span className="text-[10px] text-slate-400">Reduced from 9 sites</span>
          </div>
        </div>

        {/* Interactive Intervention Toggles */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700">Deployable Containment Actions</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {CONTAINMENT_ACTIONS.map((action) => {
              const isActive = activeContainment.includes(action.id);
              return (
                <div
                  key={action.id}
                  onClick={() => toggleContainment(action.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isActive
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-2 ring-emerald-200'
                      : 'bg-[#f8fafc] border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isActive ? '✓' : '+'}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 font-sans">
                        {action.title}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {action.mitigation}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium pl-7">
                      {action.impact}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pl-7 pt-1">
                      <span>{action.timeframe}</span>
                      <span>•</span>
                      <span>Cost: {action.cost}</span>
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isActive ? 'ACTIVE' : 'DEPLOY'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explainable AI Modal */}
      {showExplanationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="extej-card p-6 max-w-2xl w-full bg-white shadow-2xl space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-brand-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Explainable AI (XAI) Decision Rationale</h3>
                  <p className="text-xs text-slate-400">Auditable human-readable reasoning behind recommendations</p>
                </div>
              </div>
              <button 
                onClick={() => setShowExplanationModal(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/70 space-y-2">
                <span className="font-extrabold text-brand-700 uppercase tracking-wider text-[10px] block">
                  Why {currentSelected.name} ({currentSelected.title}) Was Selected
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {currentSelected.aiExplanation.summary}
                </p>
                <p className="text-slate-500 text-[11px] italic pt-1 border-t border-orange-200/50">
                  "{currentSelected.aiExplanation.whySelected}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 block">Identified Advantages</span>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside text-[11px]">
                    {currentSelected.aiExplanation.pros.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-800 block">Accepted Trade-offs</span>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside text-[11px]">
                    {currentSelected.aiExplanation.tradeoffs.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowExplanationModal(false)}
                className="btn-orange-pill px-5 py-2 text-xs font-bold"
              >
                Close Rationale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
