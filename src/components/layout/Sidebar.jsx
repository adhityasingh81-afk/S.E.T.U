import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Flame, 
  Compass, 
  MessageSquareCode, 
  GitCompare, 
  SlidersHorizontal,
  ChevronRight,
  Building2
} from 'lucide-react';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isDisrupted, 
  activeScenario, 
  metrics,
  resilienceScore,
  activeStrategy 
}) {
  const sections = [
    {
      title: "PAGES",
      items: [
        {
          id: 'command-center',
          label: 'Command Center',
          icon: LayoutDashboard,
        },
        {
          id: 'digital-twin',
          label: 'Digital Twin',
          icon: Network,
          count: '15',
        },
        {
          id: 'fracture-mode',
          label: 'Fracture Mode',
          icon: Flame,
          count: isDisrupted ? '!' : null,
        },
        {
          id: 'recovery-cockpit',
          label: 'Recovery Cockpit',
          icon: Compass,
        },
        {
          id: 'negotiation-room',
          label: 'Negotiation Room',
          icon: MessageSquareCode,
        },
        {
          id: 'counterfactual',
          label: 'Counterfactual & ROI',
          icon: GitCompare,
        },
      ]
    },
    {
      title: "AI DECISION ENGINES",
      items: [
        {
          id: 'resilience-planner',
          label: 'Resilience Planner',
          icon: SlidersHorizontal,
        },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] select-none shadow-[2px_0_12px_rgba(0,0,0,0.015)]">
      {/* Brand Header */}
      <div className="p-4 pt-5 pb-3 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 p-0.5 shadow-md shadow-brand-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
            {/* Geometric logo like Extej */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand-500">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900 font-sans flex items-center gap-1.5">
            NEXUS
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-orange-100 text-brand-600 font-mono">
              AI
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Self-Healing Supply Chain</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="p-3.5 space-y-6 flex-1 overflow-y-auto">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group ${
                    isActive
                      ? 'nav-item-active'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`} />
                    <span className="text-xs font-bold font-sans tracking-tight">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.count != null && (
                      <span className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-md ${
                        item.id === 'fracture-mode' && isDisrupted
                          ? 'bg-rose-500 text-white font-extrabold px-2 py-0.5 animate-pulse shadow-sm'
                          : isActive
                          ? 'bg-white/20 text-white'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Summary Widget */}
      <div className="p-3.5 border-t border-slate-100 bg-[#fbfcfd]">
        <div className="p-3 rounded-2xl bg-white border border-slate-200/70 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-brand-500" />
              AURA Network
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-brand-600 font-bold border border-orange-200/50">
              ₹450 Cr ARR
            </span>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Risk Exposure:</span>
              <span className={`font-bold font-mono ${isDisrupted && !activeStrategy ? 'text-rose-600' : 'text-slate-700'}`}>
                {isDisrupted && !activeStrategy ? `₹${metrics?.totalRevenueAtRiskCr || 18.7} Cr` : activeStrategy ? `₹${(18.7 - activeStrategy.revenueProtectedCr).toFixed(1)} Cr` : '₹0.0 Cr'}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Recovery Speed:</span>
              <span className="font-bold font-mono text-emerald-600">
                {activeStrategy ? `${activeStrategy.recoveryTimeDays} Days` : isDisrupted ? `${metrics?.unassistedRecoveryDays || 19} Days` : '3.2 Days'}
              </span>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
              <span>Resilience Index</span>
              <span className="font-bold text-slate-800">{resilienceScore?.overallScore || 81}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  (resilienceScore?.overallScore || 81) > 75 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-rose-500'
                }`}
                style={{ width: `${resilienceScore?.overallScore || 81}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
