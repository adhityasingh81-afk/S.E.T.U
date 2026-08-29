import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  ShieldCheck, 
  X,
  TrendingDown,
  Clock,
  Compass,
  Sparkles
} from 'lucide-react';
import { nexusApi } from '../../api/nexusApi';

export function ExecutiveReportModal({
  isOpen,
  onClose,
  activeScenario,
  isDisrupted,
  activeStrategy,
  simulationResult,
  resilienceScore
}) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      nexusApi.generateExecutiveReport({
        activeScenario,
        simulationResult,
        activeStrategy,
        resilienceScore
      }).then(data => {
        setReportData(data);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [isOpen, activeScenario, simulationResult, activeStrategy, resilienceScore]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="extej-card p-6 max-w-3xl w-full bg-white shadow-2xl space-y-6 my-8 animate-fade-in-up text-slate-800">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-100 text-brand-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-sans">
                Executive Crisis Response & Resilience Briefing
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {reportData?.reportId ? `${reportData.reportId} • ` : ''}Prepared for Executive Leadership & Operations Committee • Date: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary-pill px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="space-y-4 text-xs">
          {/* Executive Header Box */}
          <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 flex flex-col sm:flex-row justify-between gap-3 font-sans">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Enterprise Account</span>
              <h4 className="text-sm font-extrabold text-slate-900">AURA Devices Inc. (Global High-Tech Electronics)</h4>
              <p className="text-[11px] text-slate-500 font-medium">Annual Turnover: ₹450 Cr • 15 Global Manufacturing & Fulfillment Hubs</p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Resilience Index</span>
              <span className="text-xl font-extrabold text-brand-600 font-mono">{resilienceScore?.overallScore || 81} / 100</span>
            </div>
          </div>

          {/* Section 1: Disruption Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              1. Incident Diagnosis & Propagation Exposure
            </h4>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <p className="text-slate-700 leading-relaxed font-medium">
                {isDisrupted 
                  ? `Active Disruption identified at ${activeScenario?.affectedNodeName || 'Taiwan Micro Foundry'} resulting in a ${activeScenario?.severityPct || 40}% operational throughput loss.` 
                  : 'All global manufacturing nodes currently operating within nominal baseline parameters.'}
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 font-mono text-[11px]">
                <div>Revenue at Risk: <strong className="text-rose-600">₹{simulationResult?.metrics?.totalRevenueAtRiskCr || 18.7} Cr</strong></div>
                <div>Baseline Recovery: <strong className="text-amber-600">{simulationResult?.metrics?.unassistedRecoveryDays || 19.0} Days</strong></div>
                <div>Safety Runway: <strong className="text-slate-800">{simulationResult?.metrics?.inventoryDepletionDays || 9} Days</strong></div>
              </div>
            </div>
          </div>

          {/* Section 2: Active Recovery Recommendation */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              2. Autonomous Recovery Strategy & Action Protocol
            </h4>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              {activeStrategy ? (
                <>
                  <div className="flex justify-between items-center font-sans font-bold text-slate-900">
                    <span>Approved Plan: {activeStrategy.name} ({activeStrategy.title})</span>
                    <span className="text-emerald-600 font-mono">Recovery: {activeStrategy.recoveryTimeDays} Days (83% Faster)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                    {activeStrategy.aiExplanation?.summary}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-mono">
                    <div>Capital Outlay: <strong className="text-slate-800">+₹{activeStrategy.costCr} Cr</strong></div>
                    <div>Protected Revenue: <strong className="text-emerald-600">₹{activeStrategy.revenueProtectedCr} Cr ({activeStrategy.revenueProtectedPct}%)</strong></div>
                  </div>
                </>
              ) : (
                <p className="text-slate-500 italic">
                  Recommended Plan: Strategy C (Resilience-Optimized Multi-Sourcing). Provides +₹12.5 Cr Net Preserved Value.
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Governance */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 block">Responsible AI & Human Oversight Certification:</span>
            <p>
              This briefing distinguishes deterministic mathematical simulation from autonomous AI recommendations. Commercial supplier commitments require authorized procurement sign-off prior to enterprise ERP transmission.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="btn-orange-pill px-5 py-2 text-xs font-bold"
          >
            Close Executive Brief
          </button>
        </div>
      </div>
    </div>
  );
}
