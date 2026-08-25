// Composite Resilience Scoring Engine
import { BASELINE_RESILIENCE_METRICS } from '../data/auraSupplyChainData';

/**
 * Calculates composite resilience score and dimensional breakdown
 * @param {object} scenarioState - Current active scenario or recovery strategy
 */
export function calculateResilienceScore(activeStrategy = null, isDisrupted = false, severityPct = 0) {
  if (!isDisrupted && !activeStrategy) {
    return {
      overallScore: BASELINE_RESILIENCE_METRICS.overallScore,
      breakdown: BASELINE_RESILIENCE_METRICS.breakdown,
      status: "optimal",
      summary: "All 6 resilience vectors operational. Multi-regional redundancy active.",
    };
  }

  // If disruption is active and no recovery plan applied
  if (isDisrupted && !activeStrategy) {
    const penalty = Math.round(severityPct * 0.7);
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

  // If a recovery strategy is applied:
  let boost = 0;
  if (activeStrategy.id === "strat-cost-opt") boost = 5;
  if (activeStrategy.id === "strat-speed-opt") boost = 7;
  if (activeStrategy.id === "strat-resilience-opt") boost = 10;

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
