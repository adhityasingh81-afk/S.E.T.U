// Composite Resilience Scoring Engine for North Eastern Region (NER)
// Calculates Regional Connectivity Index (RCI) and dimensional resilience breakdown
import { BASELINE_RESILIENCE_METRICS } from '../data/auraSupplyChainData.js';

/**
 * Calculates composite resilience score and dimensional breakdown
 * @param {object} activeStrategy - Active recovery strategy if applied
 * @param {boolean} isDisrupted - Whether an emergency disruption is active
 * @param {number} severityPct - Disruption severity percentage
 */
export function calculateResilienceScore(activeStrategy = null, isDisrupted = false, severityPct = 0) {
  if (!isDisrupted && !activeStrategy) {
    return {
      overallScore: BASELINE_RESILIENCE_METRICS.overallScore, // RCI: 80
      breakdown: BASELINE_RESILIENCE_METRICS.breakdown,
      status: "optimal",
      summary: "All 8 North Eastern state lifelines operational. Intermodal road, rail, and waterway corridors nominal.",
    };
  }

  // If disruption is active and no recovery plan applied
  if (isDisrupted && !activeStrategy) {
    const penalty = Math.round(severityPct * 0.52);
    const degradedScore = Math.max(38, BASELINE_RESILIENCE_METRICS.overallScore - penalty);

    const degradedBreakdown = BASELINE_RESILIENCE_METRICS.breakdown.map(item => {
      let itemScore = item.score;
      if (item.dimension === "All-Weather Route Diversity") itemScore = Math.max(28, item.score - Math.round(severityPct * 0.7));
      if (item.dimension === "Medical Cryogenic Reserves") itemScore = Math.max(22, item.score - Math.round(severityPct * 0.85));
      if (item.dimension === "High-Altitude Stockpile Autonomy") itemScore = Math.max(32, item.score - Math.round(severityPct * 0.6));
      if (item.dimension === "Terrain & Monsoon Adaptability") itemScore = Math.max(30, item.score - Math.round(severityPct * 0.65));

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
      summary: `Regional Connectivity Index (RCI) degraded to ${degradedScore}/100. Mountain landslide at NH-6 Sonapur Pass severing Tripura & Mizoram supplies.`,
    };
  }

  // If a recovery strategy is applied:
  let boost = 0;
  if (activeStrategy.id === "strat-cost-opt") boost = 6;
  if (activeStrategy.id === "strat-speed-opt") boost = 8;
  if (activeStrategy.id === "strat-resilience-opt") boost = 11;

  const recoveredScore = Math.min(97, Math.max(84, BASELINE_RESILIENCE_METRICS.overallScore + boost));

  const recoveredBreakdown = BASELINE_RESILIENCE_METRICS.breakdown.map(item => {
    let itemScore = Math.min(99, item.score + (activeStrategy.resilienceGain || 7));
    if (activeStrategy.id === "strat-resilience-opt" && item.dimension === "All-Weather Route Diversity") itemScore = 92;
    if (activeStrategy.id === "strat-resilience-opt" && item.dimension === "Multimodal Failover Readiness") itemScore = 98;
    if (activeStrategy.id === "strat-speed-opt" && item.dimension === "Disaster Recovery Velocity") itemScore = 97;
    if (activeStrategy.id === "strat-speed-opt" && item.dimension === "Medical Cryogenic Reserves") itemScore = 95;

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
    summary: `Regional Connectivity Index fortified to ${recoveredScore}/100 via ${activeStrategy.title}. Tri-modal rail, river, and BRO Bailey passage active.`,
  };
}
