import { BASELINE_RESILIENCE_METRICS } from '../../src/data/auraSupplyChainData.js';
import { RADAR_PROJECTIONS, STRUCTURAL_VULNERABILITIES } from '../../src/data/resilienceData.js';

/**
 * Calculates composite resilience score and dimensional breakdown
 */
export function getResilienceScore(activeStrategy = null, isDisrupted = false, severityPct = 0) {
  if (!isDisrupted && !activeStrategy) {
    return {
      overallScore: BASELINE_RESILIENCE_METRICS.overallScore,
      breakdown: BASELINE_RESILIENCE_METRICS.breakdown,
      status: "optimal",
      summary: "All 6 resilience vectors operational. Multi-regional redundancy active.",
    };
  }

  if (isDisrupted && !activeStrategy) {
    const penalty = Math.round(Number(severityPct) * 0.7);
    const degradedScore = Math.max(38, BASELINE_RESILIENCE_METRICS.overallScore - penalty);

    const degradedBreakdown = BASELINE_RESILIENCE_METRICS.breakdown.map(item => {
      let itemScore = item.score;
      if (item.dimension === "Supplier Diversity") itemScore = Math.max(35, item.score - Math.round(severityPct * 0.8));
      if (item.dimension === "Inventory Buffer") itemScore = Math.max(25, item.score - Math.round(severityPct * 0.9));
      if (item.dimension === "Recovery Velocity") itemScore = Math.max(40, item.score - Math.round(severityPct * 0.6));
      if (item.dimension === "Geographic Diversity") itemScore = Math.max(30, item.score - Math.round(severityPct * 0.7));

      return {
        ...item,
        score: itemScore,
        status: itemScore < 50 ? "critical" : itemScore < 70 ? "moderate" : "healthy",
      };
    });

    return {
      overallScore: degradedScore,
      breakdown: degradedBreakdown,
      status: "critical",
      summary: `Network resilience degraded to ${degradedScore}/100. Single-point supplier fracture cascading through manufacturing tiers.`,
    };
  }

  let boost = 0;
  if (activeStrategy?.id === "strat-cost-opt") boost = 5;
  if (activeStrategy?.id === "strat-speed-opt") boost = 7;
  if (activeStrategy?.id === "strat-resilience-opt") boost = 10;

  const recoveredScore = Math.min(96, Math.max(82, BASELINE_RESILIENCE_METRICS.overallScore + boost));

  const recoveredBreakdown = BASELINE_RESILIENCE_METRICS.breakdown.map(item => {
    let itemScore = Math.min(99, item.score + (activeStrategy.resilienceGain || 6));
    if (activeStrategy.id === "strat-resilience-opt" && item.dimension === "Supplier Diversity") itemScore = 94;
    if (activeStrategy.id === "strat-resilience-opt" && item.dimension === "Geographic Diversity") itemScore = 88;
    if (activeStrategy.id === "strat-speed-opt" && item.dimension === "Recovery Velocity") itemScore = 96;

    return {
      ...item,
      score: itemScore,
      status: "strong",
    };
  });

  return {
    overallScore: recoveredScore,
    breakdown: recoveredBreakdown,
    status: "fortified",
    summary: `Resilience restored to ${recoveredScore}/100 with ${activeStrategy.title}. Redundant supply corridors and expedited inventory allocations active.`,
  };
}

export function getRadarMetrics(budgetAllocations = { bufferStock: 1.2, supplierDiversification: 1.5, routeRedundancy: 0.8 }) {
  const lift = Math.round((budgetAllocations.bufferStock * 4) + (budgetAllocations.supplierDiversification * 5) + (budgetAllocations.routeRedundancy * 3));
  
  return {
    radarDimensions: RADAR_PROJECTIONS,
    vulnerabilities: STRUCTURAL_VULNERABILITIES,
    budgetAllocations,
    projectedResilienceLift: lift,
    projectedScore: Math.min(98, 64 + lift)
  };
}
