import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  Layers, 
  Globe, 
  Sparkles,
  Check
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { STRUCTURAL_VULNERABILITIES, RADAR_PROJECTIONS } from '../../data/resilienceData';
import { nexusApi } from '../../api/nexusApi';

export function ResiliencePlanner() {
  const [approvedUpgrades, setApprovedUpgrades] = useState(['vuln-buffer-safety']);
  const [radarData, setRadarData] = useState(RADAR_PROJECTIONS);

  // Sync radar projections with backend API
  React.useEffect(() => {
    let isMounted = true;
    nexusApi.getResilienceRadar()
      .then(res => {
        if (isMounted && res?.radarDimensions) {
          setRadarData(res.radarDimensions);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const toggleUpgrade = (id) => {
    if (approvedUpgrades.includes(id)) {
      setApprovedUpgrades(approvedUpgrades.filter(item => item !== id));
    } else {
      setApprovedUpgrades([...approvedUpgrades, id]);
    }
  };

  const totalCapexCr = STRUCTURAL_VULNERABILITIES
    .filter(v => approvedUpgrades.includes(v.id))
    .reduce((sum, v) => sum + v.capexInvestmentCr, 0);

  const totalAvoidedLossCr = STRUCTURAL_VULNERABILITIES
    .filter(v => approvedUpgrades.includes(v.id))
    .reduce((sum, v) => sum + v.avoidedDisruptionLossCr, 0);

  const netProjectedBenefitCr = Math.round((totalAvoidedLossCr - totalCapexCr) * 10) / 10;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Header Banner */}
      <div className="extej-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-orange-100 text-brand-600">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-brand-700">
                Resilience Planner (F11)
              </span>
              <span className="text-xs text-slate-400 font-semibold">Proactive Structural Hardening</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5 font-sans">
              Structural Vulnerability Analysis & Prevention ROI
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Identify systemic supply-chain single points of failure before crises strike and calculate capital ROI on preemptive hardening.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#f8fafc] px-4 py-2.5 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Committed Upgrades</span>
            <span className="font-extrabold text-brand-600 font-mono">{approvedUpgrades.length} / 3 Programs</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Net ROI Gain</span>
            <span className="font-extrabold text-emerald-600 font-mono">+₹{netProjectedBenefitCr} Cr</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Vulnerabilities */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand-500" />
              Detected Structural Weaknesses & Strategic Interventions
            </h3>
          </div>

          <div className="space-y-4">
            {STRUCTURAL_VULNERABILITIES.map((vuln) => {
              const isApproved = approvedUpgrades.includes(vuln.id);
              return (
                <div
                  key={vuln.id}
                  className={`extej-card p-5 space-y-3.5 transition-all border ${
                    isApproved ? 'border-brand-500 ring-2 ring-brand-500/10 bg-orange-50/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          {vuln.severity}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">{vuln.category}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1 font-sans">{vuln.title}</h4>
                    </div>

                    <button
                      onClick={() => toggleUpgrade(vuln.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                        isApproved
                          ? 'btn-orange-pill'
                          : 'btn-secondary-pill'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Approved in Plan</span>
                        </>
                      ) : (
                        <span>+ Include in Q3 Budget</span>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 bg-[#f8fafc] p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                    🔍 <strong>Current Vulnerability:</strong> {vuln.currentFinding}
                  </p>

                  <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 text-xs space-y-1">
                    <span className="text-brand-800 font-bold block">💡 Recommended Preventative Action:</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed font-medium">{vuln.recommendation}</p>
                  </div>

                  {/* ROI Financial Strip */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs font-mono">
                    <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-sans block font-semibold">Capex Required:</span>
                      <span className="font-bold text-slate-800">₹{vuln.capexInvestmentCr} Cr</span>
                    </div>
                    <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-sans block font-semibold">Loss Avoided:</span>
                      <span className="font-bold text-amber-600">₹{vuln.avoidedDisruptionLossCr} Cr</span>
                    </div>
                    <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-sans block font-semibold">Net Value Add:</span>
                      <span className="font-bold text-emerald-600">+₹{vuln.netBenefitCr} Cr</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Radar Comparison */}
        <div className="lg:col-span-5 extej-card p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                Before vs. Projected Resilience Radar
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Composite upgrade from 81/100 to 93/100 upon capital execution
              </p>
            </div>

            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#cbd5e1" />
                  <Radar
                    name="Current Baseline (81)"
                    dataKey="current"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="Projected Fortified (93)"
                    dataKey="projected"
                    stroke="#ff6b00"
                    fill="#ff6b00"
                    fillOpacity={0.4}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Total Budget Summary Box */}
            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Total Capex Allocation:</span>
                <span className="font-bold font-mono text-slate-900">₹{totalCapexCr.toFixed(2)} Cr</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Total Expected Loss Avoidance:</span>
                <span className="font-bold font-mono text-amber-600">₹{totalAvoidedLossCr.toFixed(2)} Cr</span>
              </div>
              <div className="h-px bg-slate-200 my-1"></div>
              <div className="flex justify-between items-center font-bold">
                <span className="text-emerald-700">Net Business Enterprise ROI:</span>
                <span className="text-emerald-700 font-mono text-base font-extrabold">+₹{netProjectedBenefitCr} Cr</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert(`Board Resolution Package for ₹${totalCapexCr.toFixed(2)} Cr Capex export successfully generated.`)}
              className="w-full btn-orange-pill py-3 px-4 text-xs font-bold shadow-md"
            >
              Export Board-Ready Capital Allocation Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
