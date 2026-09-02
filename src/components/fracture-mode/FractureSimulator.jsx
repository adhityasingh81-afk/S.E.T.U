import React, { useState, useEffect, useRef } from 'react';
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
  ArrowDown,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  ExternalLink,
  Target,
  Gauge,
  Package,
  Truck,
  Building,
  Radio,
  Share2,
  DollarSign,
  Boxes,
  HelpCircle,
  Activity,
  Volume2,
  VolumeX
} from 'lucide-react';
import { NODES } from '../../data/auraSupplyChainData';
import { CRISIS_SCENARIOS } from '../../data/scenariosData';
import { simulateRippleEffect } from '../../engine/rippleSimulation';

const FRACTURE_TYPES = [
  {
    id: 'capacity',
    title: 'Capacity',
    icon: Flame,
    color: 'rose',
    summary: '100% → 60%',
    description: 'Production cut'
  },
  {
    id: 'lead-time',
    title: 'Lead-Time',
    icon: Clock,
    color: 'amber',
    summary: '14d → 35d',
    description: 'Transit delay'
  },
  {
    id: 'cost',
    title: 'Cost',
    icon: DollarSign,
    color: 'sky',
    summary: '+70% Cost',
    description: 'Tariff shock'
  },
  {
    id: 'quality',
    title: 'Quality',
    icon: AlertTriangle,
    color: 'purple',
    summary: '2% → 15%',
    description: 'Defect surge'
  },
  {
    id: 'blackout',
    title: 'Blackout',
    icon: ShieldAlert,
    color: 'slate',
    summary: '100% → 0%',
    description: 'Total stop'
  }
];

export function FractureSimulator({
  onRunSimulation,
  activeScenario,
  simulationResult,
  onNavigateToRecovery,
  isDisrupted
}) {
  const [selectedNodeId, setSelectedNodeId] = useState(activeScenario?.affectedNodeId || simulationResult?.affectedNodeId || 'sup-taiwan-semi');
  const [severityPct, setSeverityPct] = useState(activeScenario?.severityPct || 40);
  const [durationDays, setDurationDays] = useState(activeScenario?.durationDays || 45);
  const [eventType, setEventType] = useState(activeScenario?.eventType || 'Supplier Capacity Cut / Geopolitical');
  const [fractureType, setFractureType] = useState('capacity');
  const [activeRightTab, setActiveRightTab] = useState('timeline'); // 'timeline' | 'blast-radius'
  const [selectedTimelineNodeId, setSelectedTimelineNodeId] = useState('node-t0');
  const [isSimulating, setIsSimulating] = useState(false);
  const [justSimulated, setJustSimulated] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const revenueCardRef = useRef(null);

  // Sync external scenario/simulation node selection
  useEffect(() => {
    if (activeScenario?.affectedNodeId) {
      setSelectedNodeId(activeScenario.affectedNodeId);
    } else if (simulationResult?.affectedNodeId) {
      setSelectedNodeId(simulationResult.affectedNodeId);
    }
  }, [activeScenario?.affectedNodeId, simulationResult?.affectedNodeId]);

  // Compute local calculation
  const localCalculation = simulateRippleEffect(
    selectedNodeId,
    severityPct,
    durationDays,
    eventType,
    fractureType,
    []
  );

  const currentResult = localCalculation;
  const amplification = currentResult?.amplification || {};
  const whatBreaksFirst = currentResult?.whatBreaksFirst || [];
  const blastRadius = currentResult?.blastRadius || {};
  const cascadeNodes = currentResult?.cascadeNodes || currentResult?.propagationTimeline || [];

  // Selected timeline node drilldown
  const activeTimelineNode = cascadeNodes.find(n => n.id === selectedTimelineNodeId) || cascadeNodes[0];

  const targetNode = NODES.find(n => n.id === selectedNodeId) || NODES[0];
  const targetNodeName = targetNode ? targetNode.name.split('(')[0].trim() : 'Taiwan Micro Foundry';
  const riskAmountCr = currentResult?.metrics?.totalRevenueAtRiskCr || 18.7;

  // Voice Mode: Text-to-Speech Announcement
  const triggerVoiceAnnouncement = (nodeName, riskAmount) => {
    if (!voiceMode) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Fracture simulation initiated at ${nodeName}, estimated revenue risk - ${riskAmount} crore`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Premium')));
      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTriggerSim = (shouldScroll = false) => {
    setIsSimulating(true);
    setJustSimulated(true);

    // Speak Voice Announcement
    triggerVoiceAnnouncement(targetNodeName, riskAmountCr);

    // Run simulation callback
    onRunSimulation(selectedNodeId, severityPct, durationDays, eventType, fractureType, []);

    // Smoothly scroll up to the highlighted revenue risk exposure
    if (shouldScroll && revenueCardRef.current) {
      revenueCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  useEffect(() => {
    if (justSimulated) {
      const timer = setTimeout(() => setJustSimulated(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [justSimulated]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in-up">
      {/* Header Banner */}
      <div className="extej-card px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-orange-100 text-brand-600 shadow-xs">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-brand-700 font-mono">
                Fracture Mode
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 font-sans">
                Disruption Propagation & Ripple Effect Simulator
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Mode Toggle / Indicator */}
          <button
            onClick={() => {
              if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              } else if (voiceMode) {
                triggerVoiceAnnouncement(targetNodeName, riskAmountCr);
              } else {
                setVoiceMode(true);
              }
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-full border flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-orange-500 text-white border-orange-600 shadow-sm animate-pulse'
                : voiceMode
                ? 'bg-orange-50 text-brand-700 border-orange-200 hover:bg-orange-100'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title={voiceMode ? 'Voice Mode Active (Click to replay announcement)' : 'Enable Voice Mode'}
          >
            {voiceMode ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isSpeaking ? 'Announcing...' : voiceMode ? 'Voice Mode' : 'Voice Off'}
            </span>
          </button>

          <button
            onClick={() => handleTriggerSim(true)}
            disabled={isSimulating}
            className={`btn-orange-pill px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all ${
              justSimulated ? 'ring-4 ring-orange-300' : ''
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Propagating Ripple...' : 'Simulate Fracture'}</span>
          </button>
        </div>
      </div>

      {/* TWO-COLUMN NOTEBOOK-STYLE VERTICAL SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================== */}
        {/* LEFT COLUMN (5 Cols): Controls, Amplifier, What Breaks First */}
        {/* ========================================== */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Card 1: Disruption Parameter Controls */}
          <div className="extej-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-sans">
                <Sliders className="w-4 h-4 text-brand-500" />
                Disruption Parameters
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">Notebook Controls</span>
            </div>

            {/* Target Node Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Target Disruption Node</label>
              <select
                value={selectedNodeId}
                onChange={(e) => setSelectedNodeId(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-brand-500 shadow-xs"
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

            {/* Multi-Dimensional Fracture Modalities (5 Types) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Damage Modality (Fracture Type)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {FRACTURE_TYPES.map((ft) => {
                  const Icon = ft.icon;
                  const isSelected = fractureType === ft.id;
                  return (
                    <button
                      key={ft.id}
                      onClick={() => setFractureType(ft.id)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1 ${
                        isSelected
                          ? 'bg-orange-50 border-brand-500 shadow-xs ring-2 ring-orange-200'
                          : 'bg-[#f8fafc] border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-600' : 'text-slate-500'}`} />
                      <span className="text-[10px] font-bold text-slate-800 leading-tight">
                        {ft.title}
                      </span>
                      <span className="text-[9px] font-mono font-extrabold text-brand-600">
                        {ft.summary}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Scenario Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Scenario Presets</label>
              <div className="grid grid-cols-1 gap-1.5">
                {CRISIS_SCENARIOS.slice(0, 3).map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setSelectedNodeId(sc.affectedNodeId);
                      setSeverityPct(sc.severityPct);
                      setDurationDays(sc.durationDays);
                      setEventType(sc.eventType);
                    }}
                    className={`px-3 py-2 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                      selectedNodeId === sc.affectedNodeId && severityPct === sc.severityPct
                        ? 'bg-orange-50 border-brand-500 text-brand-900 font-bold shadow-xs'
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
                <span>100% (Blackout)</span>
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-700 font-bold">Disruption Duration:</span>
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

            {/* Orange Simulate Fracture Button with Voice & Auto-Scroll */}
            <button
              onClick={() => handleTriggerSim(true)}
              disabled={isSimulating}
              className={`w-full btn-orange-pill py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] transition-all ${
                justSimulated ? 'ring-4 ring-orange-300' : ''
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Propagating Ripple...' : 'Simulate Fracture'}</span>
              <Volume2 className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>

          {/* Card 2: Criticality Amplifier */}
          <div className="extej-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Criticality Amplifier
                </h3>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                × {amplification.multiplier || 2.4} Multiplier
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-baseline font-mono font-bold">
                <span className="text-slate-600">Initial Disruption:</span>
                <span className="text-brand-600">{severityPct}% Cut</span>
              </div>
              <div className="flex justify-between items-baseline font-mono font-bold">
                <span className="text-slate-600">Network Multiplier:</span>
                <span className="text-amber-600">× {amplification.multiplier || 2.4}</span>
              </div>
              <div className="pt-1.5 border-t border-orange-200 flex justify-between items-baseline font-mono font-black text-sm">
                <span className="text-slate-800">Effective Shock:</span>
                <span className="text-rose-600">{amplification.effectiveNetworkDamagePct || 96}% Damage</span>
              </div>
            </div>

            {/* Factor Progress Bars */}
            <div className="space-y-2 text-xs pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Supplier Criticality</span>
                  <span className="font-mono text-brand-600 font-bold">{amplification.criticalityScore || 96}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${amplification.criticalityScore || 96}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Backup Availability</span>
                  <span className="font-mono text-amber-600 font-bold">{amplification.backupScore || 32}% (Scarce)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${amplification.backupScore || 32}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Inventory Buffer Runway</span>
                  <span className="font-mono text-rose-600 font-bold">{amplification.bufferScore || 31}% (14 Days)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${amplification.bufferScore || 31}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Geographic Concentration</span>
                  <span className="font-mono text-purple-600 font-bold">{amplification.geoConcentrationScore || 88}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${amplification.geoConcentrationScore || 88}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: "What Breaks First?" Forecast */}
          <div className="extej-card p-6 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  "What Breaks First?" Forecast
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                CHRONOLOGICAL
              </span>
            </div>

            <div className="space-y-2.5">
              {whatBreaksFirst.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                        {item.order}
                      </span>
                      <h4 className="font-extrabold text-slate-900 font-sans">
                        {item.name.split('(')[0]}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium pl-6">
                      {item.impact}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="font-mono font-bold text-rose-600 text-xs block">
                      {item.estimatedDays}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      ({item.hours}h)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN (7 Cols): Impact Meter + Direct CTA + Vertical Timeline & Blast Radius */}
        {/* ========================================== */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* TOP RIGHT HERO CARD: Revenue Exposure Meter + DIRECT QUICK-ACCESS RECOVERY BUTTON */}
          <div 
            ref={revenueCardRef}
            className={`extej-card p-6 space-y-4 transition-all duration-500 relative overflow-hidden ${
              justSimulated 
                ? 'ring-4 ring-orange-500/90 shadow-2xl scale-[1.01] bg-gradient-to-br from-orange-50/70 via-white to-rose-50/40 animate-shockwave-pulse' 
                : 'hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-rose-100 text-rose-600">
                      <Activity className="w-3.5 h-3.5" />
                    </span>
                    Total Revenue Risk Exposure
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-mono">
                    {durationDays}d Horizon
                  </span>
                  {justSimulated && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      Updated Exposure
                    </span>
                  )}
                  {isSpeaking && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                      <Volume2 className="w-3 h-3 text-brand-600" />
                      Announcing
                    </span>
                  )}
                </div>

                <div className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight font-sans">
                  ₹{riskAmountCr} <span className="text-base text-rose-500 font-bold">Cr</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Daily loss rate: <strong className="text-slate-800 font-mono">₹{currentResult?.metrics?.dailyLossRateCr || 1.25} Cr/day</strong> • Downtime: <strong className="text-amber-600 font-mono">{currentResult?.metrics?.unassistedRecoveryDays || 27} Days</strong>
                </p>
              </div>

              {/* DIRECT QUICK ACCESS BUTTON RIGHT BESIDE THE TOTAL REVENUE METER */}
              <div className="self-start sm:self-center shrink-0">
                <button
                  onClick={onNavigateToRecovery}
                  className="btn-purple-pill px-4 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] transition-transform"
                >
                  <Compass className="w-4 h-4" />
                  <span>Open Recovery Cockpit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick 3 Summary Metrics in Grid */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-slate-100">
                <span className="text-[10px] text-slate-400 font-sans font-semibold block">Factory Drop:</span>
                <span className="font-bold text-rose-600">-{100 - (currentResult?.metrics?.factoryProductionAfter || 38)}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-slate-100">
                <span className="text-[10px] text-slate-400 font-sans font-semibold block">Runway Left:</span>
                <span className="font-bold text-amber-600">{currentResult?.metrics?.inventoryDepletionDays || 8} Days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-slate-100">
                <span className="text-[10px] text-slate-400 font-sans font-semibold block">SLA Fill Rate:</span>
                <span className="font-bold text-slate-800">{currentResult?.metrics?.customerFulfillmentAfter || 42.5}%</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANE TABS: Vertical Connected Timeline vs Blast Radius Tree */}
          <div className="extej-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveRightTab('timeline')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRightTab === 'timeline'
                      ? 'btn-orange-pill text-white shadow-xs'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Cascade Timeline (Vertical)</span>
                </button>

                <button
                  onClick={() => setActiveRightTab('blast-radius')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRightTab === 'blast-radius'
                      ? 'btn-orange-pill text-white shadow-xs'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Blast Radius Tree ({blastRadius.totalSitesAffected || 9})</span>
                </button>
              </div>

              <span className="text-[10px] font-mono font-bold text-slate-400 hidden sm:inline-block">
                TIME PROGRESSION ↓
              </span>
            </div>

            {/* TAB 1: VERTICAL CONNECTED NODE / LINKED LIST TIMELINE */}
            {activeRightTab === 'timeline' && (
              <div className="space-y-4">
                {/* Vertical Timeline Container with Connecting Flow Line */}
                <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-1 before:timeline-laser-flow before:rounded-full">
                  {cascadeNodes.map((item, idx) => {
                    const isSelected = selectedTimelineNodeId === item.id;
                    const isTerminal = item.isTerminalRed || idx === cascadeNodes.length - 1;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedTimelineNodeId(item.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative ${
                          isSelected
                            ? isTerminal
                              ? 'bg-rose-50 border-rose-500 shadow-md ring-2 ring-rose-200'
                              : 'bg-orange-50 border-brand-500 shadow-md ring-2 ring-orange-200'
                            : isTerminal
                              ? 'bg-rose-50/40 border-rose-300 hover:border-rose-400'
                              : 'bg-[#f8fafc] border-slate-200 hover:border-brand-300 hover:bg-white'
                        }`}
                      >
                        {/* Left Indicator Pin on the Vertical Flow Line */}
                        <div className={`absolute -left-[30px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${
                          isTerminal
                            ? 'bg-rose-600 text-white ring-4 ring-rose-100 animate-pulse'
                            : item.color === 'amber'
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                            : 'bg-rose-500 text-white ring-4 ring-rose-100'
                        }`}>
                          {idx === 0 ? '🔴' : idx === 1 ? '🟠' : idx === 2 ? '🟡' : idx === 3 ? '🔴' : '🔴'}
                        </div>

                        {/* Node Content */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black font-sans ${isTerminal ? 'text-rose-950 font-extrabold' : 'text-slate-900'}`}>
                              {item.title}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              isTerminal ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {item.timeframe}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              ({item.timeLabel})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Metric Before -> After Pill */}
                        <div className={`shrink-0 sm:text-right px-3.5 py-2 rounded-xl border shadow-2xs ${
                          isTerminal ? 'bg-white border-rose-200' : 'bg-white border-slate-200'
                        }`}>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">
                            {item.metricName}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold mt-0.5">
                            <span className="text-slate-400 line-through text-[10px]">{item.beforeVal}</span>
                            <ArrowRight className="w-3 h-3 text-rose-500" />
                            <span className={`font-extrabold ${isTerminal ? 'text-rose-600 text-sm' : 'text-slate-800'}`}>
                              {item.afterVal}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* EXPANDED DRILLDOWN DETAILS FOR SELECTED NODE */}
                {activeTimelineNode && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-xs space-y-3 animate-fade-in-up mt-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-brand-500" />
                        <span className="font-extrabold text-slate-900">
                          {activeTimelineNode.timeframe} Detailed Breakdown • {activeTimelineNode.nodeName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        {activeTimelineNode.badgeText}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Root Cause Dynamics
                        </span>
                        <p className="text-slate-700 font-medium leading-relaxed">
                          {activeTimelineNode.rootCause}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block flex items-center gap-1">
                          <Zap className="w-3 h-3 text-brand-500" />
                          Recommended Mitigation Trigger
                        </span>
                        <p className="text-slate-800 font-semibold leading-relaxed">
                          {activeTimelineNode.mitigationAction}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: BLAST RADIUS & MULTI-TIER HIERARCHY */}
            {activeRightTab === 'blast-radius' && (
              <div className="space-y-4">
                {/* TIER 1 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Tier 1: Directly Impacted (Epicenter & Manufacturing)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {blastRadius.tier1Direct?.map(node => (
                      <div key={node.id} className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-xs space-y-1">
                        <div className="font-extrabold text-slate-900 truncate">{node.name}</div>
                        <div className="text-rose-600 font-mono font-bold">{node.impairedPct}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{node.runway}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TIER 2 */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Tier 2: Secondary Impact (Logistics & Distribution Warehouses)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {blastRadius.tier2Secondary?.map(node => (
                      <div key={node.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-xs space-y-1">
                        <div className="font-extrabold text-slate-900 truncate">{node.name}</div>
                        <div className="text-amber-700 font-mono font-bold">{node.impairedPct}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{node.runway}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TIER 3 */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Tier 3: Tertiary Impact (Enterprise Clients & SLAs)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {blastRadius.tier3Tertiary?.map(node => (
                      <div key={node.id} className="p-3 rounded-xl bg-sky-50/50 border border-sky-200 text-xs space-y-1">
                        <div className="font-extrabold text-slate-900 truncate">{node.name}</div>
                        <div className="text-rose-600 font-mono font-bold">{node.impairedPct}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{node.runway}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
