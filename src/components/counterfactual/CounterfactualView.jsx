import React from 'react';
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Award, 
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export function CounterfactualView({ simulationResult, onApplyStrategy, onNavigateToRecovery }) {
  const comparisonData = [
    {
      name: "No Action",
      key: "no-action",
      recoveryDays: 19.0,
      revenueLostCr: 18.7,
      revenueSavedCr: 0.0,
      customersAffectedK: 184,
      extraCostCr: 0.0,
      resilienceScore: 51,
      netRoiCr: -18.7,
      badge: "Severe Breach",
      badgeColor: "rose",
    },
    {
      name: "Strategy A (Cost)",
      key: "strat-a",
      recoveryDays: 11.0,
      revenueLostCr: 5.4,
      revenueSavedCr: 13.3,
      customersAffectedK: 53,
      extraCostCr: 3.1,
      resilienceScore: 86,
      netRoiCr: 10.2,
      badge: "Budget Focus",
      badgeColor: "emerald",
    },
    {
      name: "Strategy B (Speed)",
      key: "strat-b",
      recoveryDays: 5.0,
      revenueLostCr: 1.1,
      revenueSavedCr: 17.6,
      customersAffectedK: 11,
      extraCostCr: 4.8,
      resilienceScore: 88,
      netRoiCr: 12.8,
      badge: "Rapid Airlift",
      badgeColor: "brand",
    },
    {
      name: "Strategy C (Resilience)",
      key: "strat-c",
      recoveryDays: 3.2,
      revenueLostCr: 0.8,
      revenueSavedCr: 17.9,
      customersAffectedK: 8,
      extraCostCr: 5.4,
      resilienceScore: 91,
      netRoiCr: 12.5,
      badge: "Recommended",
      badgeColor: "amber",
    },
  ];

  const chartData = comparisonData.map(d => ({
    name: d.name.split('(')[0],
    "Revenue Lost (₹ Cr)": d.revenueLostCr,
    "Extra Cost (₹ Cr)": d.extraCostCr,
    "Net Value Saved (₹ Cr)": d.revenueSavedCr,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      {/* Header Banner */}
      <div className="extej-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-orange-100 text-brand-600">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-brand-700">
                Counterfactual Analysis
              </span>
              <span className="text-xs text-slate-400 font-semibold">Business Outcome Projections</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5 font-sans">
              Comparative Scenario Decision Matrix
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Auditable financial and operational outcomes across inaction vs. autonomous AI recovery plans.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="extej-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            Full Multi-Scenario Outcome Comparison
          </h3>
          <span className="text-xs text-slate-400 font-semibold">AURA Devices • Taiwan 40% Disruption Model</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-500 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Scenario Option</th>
                <th className="py-3.5 px-4">Recovery Time</th>
                <th className="py-3.5 px-4">Revenue Lost</th>
                <th className="py-3.5 px-4">Customers Affected</th>
                <th className="py-3.5 px-4">Recovery Cost</th>
                <th className="py-3.5 px-4">Post Resilience</th>
                <th className="py-3.5 px-4 text-right">Net Business ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {comparisonData.map((row) => {
                const isNoAction = row.key === 'no-action';
                const isRecommended = row.key === 'strat-c';

                return (
                  <tr
                    key={row.key}
                    className={`transition-colors ${
                      isRecommended
                        ? 'bg-orange-50/50 hover:bg-orange-50'
                        : isNoAction
                        ? 'bg-rose-50/40 hover:bg-rose-50/60'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-4 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{row.name}</span>
                        {isRecommended && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-brand-500 text-white shadow-xs">
                            Recommended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`py-4 px-4 font-extrabold ${isNoAction ? 'text-rose-600' : 'text-amber-600'}`}>
                      {row.recoveryDays} Days
                    </td>
                    <td className={`py-4 px-4 font-extrabold ${isNoAction ? 'text-rose-600 text-sm' : 'text-slate-700'}`}>
                      ₹{row.revenueLostCr} Cr
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-semibold">
                      {row.customersAffectedK}k Units
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-semibold">
                      +₹{row.extraCostCr} Cr
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        row.resilienceScore > 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {row.resilienceScore}/100
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-extrabold ${
                        row.netRoiCr > 0 ? 'text-emerald-600 text-sm' : 'text-rose-600'
                      }`}>
                        {row.netRoiCr > 0 ? `+₹${row.netRoiCr} Cr` : `-₹${Math.abs(row.netRoiCr)} Cr`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Chart Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 extej-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              Financial Impact Breakdown (₹ Crores)
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Net Value Preserved vs Cost Outlay</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }} />
                <Bar dataKey="Revenue Lost (₹ Cr)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Extra Cost (₹ Cr)" fill="#ff7a1a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Net Value Saved (₹ Cr)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 extej-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Key Executive Takeaway</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900">
              Strategy C Yields +₹12.5 Cr Net Value
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Doing nothing incurs <strong>₹18.7 Cr</strong> in unrecoverable enterprise revenue loss and client penalties. Deploying <strong>Strategy C</strong> costs <strong>₹5.4 Cr</strong> but salvages <strong>₹17.9 Cr</strong> in sales while compressing recovery from 19 days to 3.2 days.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={onNavigateToRecovery}
              className="w-full btn-orange-pill py-3 px-4 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <span>Review Plan in Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
