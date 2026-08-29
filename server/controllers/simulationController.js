import { simulateRipple } from '../services/rippleService.js';
import { CRISIS_SCENARIOS } from '../../src/data/scenariosData.js';

export function getScenarios(req, res) {
  try {
    return res.json({
      success: true,
      count: CRISIS_SCENARIOS.length,
      data: CRISIS_SCENARIOS
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getScenarioById(req, res) {
  try {
    const { id } = req.params;
    const scenario = CRISIS_SCENARIOS.find(s => s.id === id);
    if (!scenario) {
      return res.status(404).json({ success: false, error: 'Scenario not found' });
    }
    return res.json({ success: true, data: scenario });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function runSimulation(req, res) {
  try {
    const { affectedNodeId, severityPct, durationDays, eventType } = req.body;
    
    if (!affectedNodeId) {
      return res.status(400).json({ success: false, error: 'affectedNodeId is required' });
    }

    const result = simulateRipple(
      affectedNodeId,
      severityPct !== undefined ? severityPct : 40,
      durationDays !== undefined ? durationDays : 45,
      eventType || 'Supplier Capacity Drop'
    );

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
