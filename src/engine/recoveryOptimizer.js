// Recovery Strategy Optimizer & Multi-Agent Engine

export function generateRecoveryStrategies(disruptionState, resilienceBudget = { maxCostPct: 4, costWeight: 30, speedWeight: 40, resilienceWeight: 30 }) {
  const { metrics, affectedNode, severityPct } = disruptionState;
  const revAtRisk = metrics?.totalRevenueAtRiskCr || 18.7;

  // Base Strategies with deterministic scaling
  const strategies = [
    {
      id: "strat-cost-opt",
      name: "Strategy A",
      title: "Cost-Optimized Reallocation",
      tagline: "Minimum immediate capital expenditure with staggered factory ramp-up",
      badge: "Budget Friendly",
      badgeColor: "emerald",
      costCr: Math.round((revAtRisk * 0.165) * 10) / 10, // ~₹3.1 Cr
      costPercentageOfAnnual: 0.68,
      recoveryTimeDays: Math.max(7, Math.round(metrics.unassistedRecoveryDays * 0.58)), // ~11 days
      revenueProtectedPct: 71,
      revenueProtectedCr: Math.round((revAtRisk * 0.71) * 10) / 10,
      resilienceGain: 5,
      confidencePct: 88,
      riskLevel: "Moderate",
      primaryAgent: "Finance & Inventory Agent",
      recommendedSupplier: "Kyoto Microelectronics & Local Buffers",
      keyActions: [
        {
          id: "act-1",
          agent: "Inventory Agent",
          title: "Reallocate Global Buffer Stock",
          description: "Reroute 35,000 finished chip assemblies from Singapore buffer to Chennai Plant 1 via commercial air-cargo within 48h.",
          timeframe: "T+2 Days",
          costCr: 0.8,
        },
        {
          id: "act-2",
          agent: "Procurement Agent",
          title: "Contract Secondary Production In Kyoto",
          description: "Execute standard-tier contract addendum with Kyoto Microelectronics for 30,000 units/mo with zero rush premium.",
          timeframe: "T+5 Days",
          costCr: 1.5,
        },
        {
          id: "act-3",
          agent: "Logistics Agent",
          title: "Optimize Standard Cargo Freight",
          description: "Consolidate maritime shipments via Colombo transshipment hub at baseline contractual rates.",
          timeframe: "T+10 Days",
          costCr: 0.8,
        },
      ],
      aiExplanation: {
        summary: "Strategy A minimizes immediate out-of-pocket procurement surcharges by prioritizing existing warehouse safety stock and standard-lead-time secondary sourcing.",
        pros: ["Lowest cost outlay (+₹3.1 Cr)", "Preserves gross margins", "Zero expedited freight penalties"],
        tradeoffs: ["Longer recovery timeline (11 days)", "Lower revenue protection (71%)", "Risk of minor delay penalties with Stuttgart Automotive"],
        whySelected: "Best suited for fiscal quarters under tight margin pressure where customer delivery tolerance permits up to 12 days flexibility.",
      }
    },
    {
      id: "strat-speed-opt",
      name: "Strategy B",
      title: "Speed-Optimized Rapid Airlift",
      tagline: "Ultra-fast air corridor deployment & priority foundry preemption",
      badge: "Fastest Recovery",
      badgeColor: "brand",
      costCr: Math.round((revAtRisk * 0.256) * 10) / 10, // ~₹4.8 Cr
      costPercentageOfAnnual: 1.06,
      recoveryTimeDays: Math.max(4, Math.round(metrics.unassistedRecoveryDays * 0.26)), // ~5 days
      revenueProtectedPct: 94,
      revenueProtectedCr: Math.round((revAtRisk * 0.94) * 10) / 10,
      resilienceGain: 7,
      confidencePct: 93,
      riskLevel: "Low",
      primaryAgent: "Logistics & Supplier Agent",
      recommendedSupplier: "Apex Silicon (Phoenix) + Dedicated Air Bridge",
      keyActions: [
        {
          id: "act-1",
          agent: "Logistics Agent",
          title: "Charter Dedicated Cargo Airlift",
          description: "Commission 2x Boeing 777-F charter flights from Phoenix & Kyoto directly to Chennai Airport, bypassing maritime bottlenecks.",
          timeframe: "T+24 Hours",
          costCr: 2.1,
        },
        {
          id: "act-2",
          agent: "Supplier Agent",
          title: "Preempt Apex Silicon Production Line",
          description: "Pay 12% expediting surge fee to Apex Silicon Solutions (Phoenix) to clear line 4 and supply 45,000 qualified ASICs immediately.",
          timeframe: "T+3 Days",
          costCr: 2.2,
        },
        {
          id: "act-3",
          agent: "Operations Agent",
          title: "Emergency 24/7 Factory Overtime",
          description: "Initiate triple-shift 24/7 assembly at Chennai Plant 1 with pre-tested replacement components.",
          timeframe: "T+4 Days",
          costCr: 0.5,
        },
      ],
      aiExplanation: {
        summary: "Strategy B prioritizes time-to-recovery above all else by booking dedicated air charters and paying supplier surge premiums to restore 94% revenue within 5 days.",
        pros: ["Recovers full production in just 5 days", "Protects 94% (₹17.6 Cr) of revenue", "Eliminates enterprise SLA breach penalties"],
        tradeoffs: ["Higher upfront expenditure (+₹4.8 Cr)", "Charter air freight consumes 44% of recovery budget"],
        whySelected: "Chosen when preserving tier-1 enterprise SLA commitments and market reputation is paramount.",
      }
    },
    {
      id: "strat-resilience-opt",
      name: "Strategy C",
      title: "Resilience-Optimized Multi-Sourcing",
      tagline: "Permanent multi-hub dual sourcing & dynamic autonomous routing",
      badge: "Highest Resilience",
      badgeColor: "amber",
      costCr: Math.round((revAtRisk * 0.288) * 10) / 10, // ~₹5.4 Cr
      costPercentageOfAnnual: 1.2,
      recoveryTimeDays: Math.max(3, Math.round(metrics.nexusRecoveryDays)), // ~3.2 days
      revenueProtectedPct: 96,
      revenueProtectedCr: Math.round((revAtRisk * 0.96) * 10) / 10,
      resilienceGain: 10,
      confidencePct: 96,
      riskLevel: "Very Low",
      primaryAgent: "Orchestrator & Risk Agent",
      recommendedSupplier: "Multi-Hub Tri-Sourcing (Kyoto + Phoenix + Munich)",
      keyActions: [
        {
          id: "act-1",
          agent: "Orchestrator Agent",
          title: "Activate Tri-Hub Split Sourcing",
          description: "Split component requisition: 40% Kyoto Microelectronics, 35% Apex Silicon USA, 25% Bavaria Sensorik Germany.",
          timeframe: "T+18 Hours",
          costCr: 2.4,
        },
        {
          id: "act-2",
          agent: "Negotiation Agent",
          title: "Execute Long-Term Capacity MOUs",
          description: "Negotiate volume rebate offset with secondary suppliers; secures guaranteed line availability for 6 months.",
          timeframe: "T+2 Days",
          costCr: 1.6,
        },
        {
          id: "act-3",
          agent: "Logistics Agent",
          title: "Multi-Modal Intermodal Route Diversification",
          description: "Route 50% through direct air cargo and 50% through high-speed sea feeder via Singapore hub.",
          timeframe: "T+3 Days",
          costCr: 1.4,
        },
      ],
      aiExplanation: {
        summary: "Strategy C delivers rapid recovery (3.2 days) while structurally upgrading the supply chain against future disruptions by permanently qualifying 3 independent regional sources.",
        pros: ["Fastest recovery speed (3.2 days)", "Protects 96% (₹18.0 Cr) of revenue", "Permanently boosts composite resilience from 81 to 91/100", "Eliminates single-point-of-failure vulnerabilities"],
        tradeoffs: ["Requires ₹5.4 Cr initial commitment", "Demands cross-border vendor onboarding coordination"],
        whySelected: "Recommended because the avoided long-term disruption loss (₹18.0 Cr protected) vastly exceeds the ₹5.4 Cr investment, yielding a net positive business ROI of +₹12.6 Cr.",
      }
    }
  ];

  // Dynamic ranking based on user weights & budget cap
  const totalWeight = ((resilienceBudget.costWeight || 0) + (resilienceBudget.speedWeight || 0) + (resilienceBudget.resilienceWeight || 0)) || 1;
  const wCost = (resilienceBudget.costWeight || 0) / totalWeight;
  const wSpeed = (resilienceBudget.speedWeight || 0) / totalWeight;
  const wRes = (resilienceBudget.resilienceWeight || 0) / totalWeight;

  const minCost = Math.min(...strategies.map(s => s.costCr));
  const maxCost = Math.max(...strategies.map(s => s.costCr));
  const minDays = Math.min(...strategies.map(s => s.recoveryTimeDays));
  const maxDays = Math.max(...strategies.map(s => s.recoveryTimeDays));
  const minRes = Math.min(...strategies.map(s => s.resilienceGain));
  const maxRes = Math.max(...strategies.map(s => s.resilienceGain));

  const scoredStrategies = strategies.map(strat => {
    // Relative sub-scores (0 to 100) where higher is better
    const costSubScore = maxCost === minCost ? 100 : ((maxCost - strat.costCr) / (maxCost - minCost)) * 100;
    const speedSubScore = maxDays === minDays ? 100 : ((maxDays - strat.recoveryTimeDays) / (maxDays - minDays)) * 100;
    const resSubScore = maxRes === minRes ? 100 : ((strat.resilienceGain - minRes) / (maxRes - minRes)) * 100;

    // Weighted base composite fit score (0 - 100)
    let compositeRankScore = (costSubScore * wCost) + (speedSubScore * wSpeed) + (resSubScore * wRes);

    // Budget Cap Enforcement:
    // If strategy percentage of annual budget exceeds user's Max Cost Cap slider, penalize score
    const withinBudget = strat.costPercentageOfAnnual <= (resilienceBudget.maxCostPct ?? 4.0);
    if (!withinBudget) {
      compositeRankScore = compositeRankScore * 0.45; // 55% penalty for exceeding budget cap
    }

    return {
      ...strat,
      compositeRankScore: Math.max(10, Math.min(99, Math.round(compositeRankScore))),
      withinBudget,
      costSubScore: Math.round(costSubScore),
      speedSubScore: Math.round(speedSubScore),
      resSubScore: Math.round(resSubScore),
    };
  });

  // Sort descending by composite score
  scoredStrategies.sort((a, b) => b.compositeRankScore - a.compositeRankScore);

  // Assign isRecommended to the highest scoring plan
  return scoredStrategies.map((strat, index) => ({
    ...strat,
    isRecommended: index === 0,
    rank: index + 1,
  }));
}
