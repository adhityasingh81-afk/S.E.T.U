import { generateRecoveryStrategies } from '../../src/engine/recoveryOptimizer.js';

/**
 * Multi-Agent Pareto Recovery Strategy Optimizer
 */
export function generateStrategies(disruptionState, weights = { costWeight: 30, speedWeight: 40, resilienceWeight: 30 }) {
  return generateRecoveryStrategies(disruptionState, weights);
}
