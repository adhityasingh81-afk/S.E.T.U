import { COMPANY_PROFILE } from '../../src/data/auraSupplyChainData.js';

/**
 * Multi-Agent Pareto Recovery Strategy Optimizer
 */
export function generateStrategies(disruptionState, weights = { costWeight: 30, speedWeight: 40, resilienceWeight: 30 }) {
  const { metrics, affectedNode, severityPct = 40 } = disruptionState || {};
  const revAtRisk = metrics?.totalRevenueAtRiskCr || 18.7;
  const unassistedDays = metrics?.unassistedRecoveryDays || 27;

  const strategies = [
    {
      id: "strat-cost-opt",
      name: "Strategy A",
      title: "Cost-Optimized Reallocation",
      tagline: "Minimum immediate capital expenditure with staggered factory ramp-up",
      badge: "Budget Friendly",
      badgeColor: "emerald",
      costCr: Math.round((revAtRisk * 0.165) * 10) / 10,
      costPercentageOfAnnual: 0.68,
      recoveryTimeDays: Math.max(7, Math.round(unassistedDays * 0.58)),
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
      costCr: Math.round((revAtRisk * 0.256) * 10) / 10,
      costPercentageOfAnnual: 1.06,
      recoveryTimeDays: Math.max(4, Math.round(unassistedDays * 0.26)),
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
        summary: "Strategy B prioritizes SLA integrity and zero line-stoppages by deploying dedicated charter airfreight and paying priority foundry rush allocation fees.",
        pros: ["Recovers full production in 5 days (83% faster)", "Safeguards 94% of revenue (₹17.9 Cr protected)", "Prevents SLA contractual default penalties"],
        tradeoffs: ["Higher immediate capital outlay (+₹4.8 Cr)", "Elevated short-term carbon intensity due to air transport"],
        whySelected: "Recommended default for tier-1 customer relationships where SLA breach penalties exceed ₹2.5 Cr/week.",
      }
    },
    {
      id: "strat-resilience-opt",
      name: "Strategy C",
      title: "Resilience-First Dual-Sourcing",
      tagline: "Long-term network hardening with 50-50 permanent supplier split",
      badge: "High Resilience",
      badgeColor: "indigo",
      costCr: Math.round((revAtRisk * 0.208) * 10) / 10,
      costPercentageOfAnnual: 0.86,
      recoveryTimeDays: Math.max(6, Math.round(unassistedDays * 0.38)),
      revenueProtectedPct: 86,
      revenueProtectedCr: Math.round((revAtRisk * 0.86) * 10) / 10,
      resilienceGain: 12,
      confidencePct: 91,
      riskLevel: "Low",
      primaryAgent: "Strategic Sourcing Agent",
      recommendedSupplier: "Kyoto Microelectronics & Munich Sensoric",
      keyActions: [
        {
          id: "act-1",
          agent: "Strategic Sourcing Agent",
          title: "Formalize 50/50 Dual Sourcing",
          description: "Restructure procurement contracts into permanent 50/50 dual allocation across Taiwan and Kyoto with mirrored qualification.",
          timeframe: "T+3 Days",
          costCr: 1.6,
        },
        {
          id: "act-2",
          agent: "Inventory Agent",
          title: "Establish Chennai Regional Safety Buffer",
          description: "Establish dedicated 45-day safety stock buffer at Chennai Free Trade Zone warehouse.",
          timeframe: "T+7 Days",
          costCr: 1.4,
        },
        {
          id: "act-3",
          agent: "Logistics Agent",
          title: "Contract Dual-Corridor Logistics",
          description: "Lock in secondary multimodal air-sea route via Singapore Gateway with pre-cleared customs lanes.",
          timeframe: "T+12 Days",
          costCr: 0.9,
        },
      ],
      aiExplanation: {
        summary: "Strategy C balances rapid recovery with permanent network hardening, ensuring the supply chain will be completely immune to future single-source disruptions.",
        pros: ["Highest long-term resilience gain (+12 points)", "Permanent elimination of single-source vulnerability", "Protects 86% revenue with balanced cost"],
        tradeoffs: ["Requires ongoing supplier relationship management across dual vendors"],
        whySelected: "Ideal for executive teams aiming to achieve ISO 22301 supply chain continuity compliance.",
      }
    }
  ];

  // Calculate weighted Pareto score for each strategy
  const { costWeight = 30, speedWeight = 40, resilienceWeight = 30 } = weights;
  const scoredStrategies = strategies.map(s => {
    const costScore = Math.max(0, 100 - (s.costCr / revAtRisk) * 200);
    const speedScore = Math.max(0, 100 - (s.recoveryTimeDays / unassistedDays) * 100);
    const resilienceScore = s.revenueProtectedPct + s.resilienceGain * 2;

    const compositeScore = Math.round(
      (costScore * (costWeight / 100)) +
      (speedScore * (speedWeight / 100)) +
      (resilienceScore * (resilienceWeight / 100))
    );

    return {
      ...s,
      compositeScore,
      paretoRank: 0
    };
  });

  scoredStrategies.sort((a, b) => b.compositeScore - a.compositeScore);
  scoredStrategies.forEach((s, idx) => {
    s.paretoRank = idx + 1;
  });

  return {
    strategies: scoredStrategies,
    recommendedStrategyId: scoredStrategies[0].id,
    appliedWeights: weights,
    evaluatedAt: new Date().toISOString()
  };
}
