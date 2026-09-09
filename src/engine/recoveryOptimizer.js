// Recovery Strategy Optimizer & Multi-Agent Engine for North Eastern Region (NER)
// Formulates Pareto-optimal disaster recovery pathways across Rail, River, Air, and Highway corridors

export function generateRecoveryStrategies(disruptionState, resilienceBudget = { maxCostPct: 4, costWeight: 30, speedWeight: 40, resilienceWeight: 30 }) {
  const { metrics = {}, affectedNode, severityPct = 75 } = disruptionState || {};
  const revAtRisk = metrics?.totalRevenueAtRiskCr || 21.4;
  const unassistedDays = metrics?.unassistedRecoveryDays || 18.0;
  const nexusDays = metrics?.nexusRecoveryDays || 3.4;

  // Base Strategies with deterministic scaling
  const strategies = [
    {
      id: "strat-cost-opt",
      name: "Strategy A",
      title: "Cost-Optimized Intermodal Failover (Rail + Waterway)",
      tagline: "Minimum capital expenditure utilizing NFR rail freight and NW-2 Brahmaputra cargo barges",
      badge: "Budget Friendly",
      badgeColor: "emerald",
      costCr: Math.round((revAtRisk * 0.155) * 10) / 10, // ~₹3.3 Cr
      costPercentageOfAnnual: 0.51,
      recoveryTimeDays: Math.max(6, Math.round(unassistedDays * 0.52)), // ~9 days
      revenueProtectedPct: 74,
      revenueProtectedCr: Math.round((revAtRisk * 0.74) * 10) / 10,
      resilienceGain: 6,
      confidencePct: 89,
      riskLevel: "Moderate",
      primaryAgent: "Intermodal Transport Agent",
      recommendedSupplier: "NFR Maligaon & IWAI Pandu River Port",
      keyActions: [
        {
          id: "act-1",
          agent: "Rail Operations Agent",
          title: "Mobilize Lumding-Badarpur Freight Shuttle",
          description: "Reroute 40,000 units of essential foodgrains and POL fuel via NFR Lumding-Badarpur railhead directly to Agartala Siding.",
          timeframe: "T+36 Hours",
          costCr: 1.1,
        },
        {
          id: "act-2",
          agent: "Waterways Agent",
          title: "Activate NW-2 River Cargo Barges",
          description: "Dispatch 4 self-propelled 200-tonne river barges from Pandu Port to Dhubri/Jogighopa along National Waterway 2.",
          timeframe: "T+48 Hours",
          costCr: 0.9,
        },
        {
          id: "act-3",
          agent: "Civil Supplies Agent",
          title: "Stagger District Ration Quotas",
          description: "Authorize district collectors in Tripura and Mizoram to draw from FCI buffer granaries at standard issue price.",
          timeframe: "T+4 Days",
          costCr: 1.3,
        },
      ],
      aiExplanation: {
        summary: "Strategy A prioritizes high-capacity rail and river assets over expensive airlifts, minimizing emergency exchequer outlay while guaranteeing steady bulk food and fuel delivery.",
        pros: ["Lowest fiscal cost (+₹3.3 Cr)", "High bulk capacity (85k units via rail/river)", "Zero road corridor congestion"],
        tradeoffs: ["Longer recovery duration (9 days)", "Requires secondary truck transshipment at Badarpur railhead"],
        whySelected: "Best suited for sustained monsoon crises where bulk foodgrains and fuel must be maintained on a strict state disaster relief budget.",
      }
    },
    {
      id: "strat-speed-opt",
      name: "Strategy B",
      title: "Speed-Optimized Tactical Air Bridge (IAF + Pawan Hans)",
      tagline: "Rapid-deployment air bridge using C-130J Hercules & Mi-17V5 helicopters for life-critical supplies",
      badge: "Fastest Recovery",
      badgeColor: "brand",
      costCr: Math.round((revAtRisk * 0.265) * 10) / 10, // ~₹5.7 Cr
      costPercentageOfAnnual: 0.88,
      recoveryTimeDays: Math.max(2, Math.round(unassistedDays * 0.22)), // ~3.9 days
      revenueProtectedPct: 88,
      revenueProtectedCr: Math.round((revAtRisk * 0.88) * 10) / 10,
      resilienceGain: 8,
      confidencePct: 94,
      riskLevel: "Low Operational Risk",
      primaryAgent: "Emergency Aviation Agent",
      recommendedSupplier: "Eastern Air Command (Borjhar) & Pawan Hans",
      keyActions: [
        {
          id: "act-1",
          agent: "Aviation Logistics Agent",
          title: "Launch Operation Setu Tactical Air Bridge",
          description: "Clear 6 sorties of IAF C-130J Hercules from Borjhar Air Base to Agartala and Lengpui carrying 18,000 cryogenic oxygen cylinders.",
          timeframe: "T+6 Hours",
          costCr: 2.8,
        },
        {
          id: "act-2",
          agent: "Helicopter Operations Agent",
          title: "Deploy Pawan Hans Hill Shuttles",
          description: "Establish helicopter airlift corridors to isolated hill hospital helipads in Aizawl, Lunglei, and Churachandpur.",
          timeframe: "T+12 Hours",
          costCr: 1.6,
        },
        {
          id: "act-3",
          agent: "Medical Taskforce Agent",
          title: "Pre-Position Mobile Oxygen Concentrators",
          description: "Distribute 250 high-flow oxygen concentrators to primary health centers facing road cutoff.",
          timeframe: "T+24 Hours",
          costCr: 1.3,
        },
      ],
      aiExplanation: {
        summary: "Strategy B bypasses blocked mountain roads entirely via airborne delivery, completely eliminating patient hypoxia risks in Tripura and Mizoram hospitals within 24 hours.",
        pros: ["Fastest lifeline restoration (3.9 days)", "Instant hospital oxygen replenishment", "Completely immune to ongoing mudslides"],
        tradeoffs: ["Higher operating cost (+₹5.7 Cr)", "Payload limited compared to rail freight"],
        whySelected: "Imperative when hospital cryogenic oxygen buffers drop below 48 hours and human lives are in immediate jeopardy.",
      }
    },
    {
      id: "strat-resilience-opt",
      name: "Strategy C",
      title: "Balanced Lifeline Corridor Resilience (Tri-Modal Split)",
      tagline: "BRO emergency Bailey bridge launch combined with NFR rail shuttles & diplomatic transit",
      badge: "Highest Resilience",
      badgeColor: "indigo",
      costCr: Math.round((revAtRisk * 0.21) * 10) / 10, // ~₹4.5 Cr
      costPercentageOfAnnual: 0.69,
      recoveryTimeDays: Math.max(3, Math.round(nexusDays)), // ~3.4 days
      revenueProtectedPct: 97,
      revenueProtectedCr: Math.round((revAtRisk * 0.97) * 10) / 10,
      resilienceGain: 11,
      confidencePct: 97,
      riskLevel: "Very Low",
      primaryAgent: "Orchestrator & Civil Defense Agent",
      recommendedSupplier: "BRO Project Pushpak + NFR Freight + IOCL NE",
      keyActions: [
        {
          id: "act-1",
          agent: "Border Roads Agent",
          title: "Launch Sonapur Double-Single Bailey Bridge",
          description: "Deploy 120-ft military Bailey bridge across Sonapur collapse zone with round-the-clock excavator relays to open single-lane convoy passage.",
          timeframe: "T+36 Hours",
          costCr: 1.9,
        },
        {
          id: "act-2",
          agent: "Rail & Waterway Agent",
          title: "Activate Parallel Rail-Barge Relief Feeder",
          description: "Route 35,000 units via NFR Lumding rakes while BRO clears the highway, guaranteeing uninterrupted hospital supply.",
          timeframe: "T+2 Days",
          costCr: 1.4,
        },
        {
          id: "act-3",
          agent: "Energy Security Agent",
          title: "Clear MEA Dawki-Tamabil Fuel Transit",
          description: "Dispatch 40 bonded IOCL fuel tankers via the diplomatic Bangladesh transit protocol corridor.",
          timeframe: "T+44 Hours",
          costCr: 1.2,
        },
      ],
      aiExplanation: {
        summary: "Strategy C simultaneously restores physical highway access via BRO Bailey engineering while keeping rail and river relief pipelines running, creating lasting structural resilience.",
        pros: ["Optimal recovery speed (3.4 days)", "Protects 97% (₹20.8 Cr) of regional economic value", "Restores all-weather highway access for civil traffic", "Permanently boosts Regional Connectivity Index (RCI) from 68 to 88/100"],
        tradeoffs: ["Requires close inter-agency synchronization (BRO, Railways, State Police)"],
        whySelected: "Recommended because the avoided disaster loss (₹20.8 Cr protected) delivers the highest risk-adjusted benefit, completely resolving the isolation crisis.",
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
    const withinBudget = strat.costPercentageOfAnnual <= (resilienceBudget.maxCostPct ?? 4.0);
    if (!withinBudget) {
      compositeRankScore = compositeRankScore * 0.45; // 55% penalty for exceeding budget cap
    }

    const finalScore = Math.max(10, Math.min(99, Math.round(compositeRankScore)));
    return {
      ...strat,
      compositeRankScore: finalScore,
      compositeScore: finalScore,
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
