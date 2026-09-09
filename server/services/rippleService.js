import { simulateRippleEffect } from '../../src/engine/rippleSimulation.js';

/**
 * Propagates a disruption through the multi-tier supply network
 */
export function simulateRipple(
  affectedNodeId = 'wh-sonapur-pass', 
  severityPct = 75, 
  durationDays = 14, 
  eventType = "Mountain Landslide & Road Corridor Severance",
  fractureType = 'capacity',
  activeContainmentIds = []
) {
  return simulateRippleEffect(
    affectedNodeId,
    severityPct,
    durationDays,
    eventType,
    fractureType,
    activeContainmentIds
  );
}
