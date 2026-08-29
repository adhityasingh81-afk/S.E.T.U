import { simulateRipple } from '../services/rippleService.js';
import { dbGetScenarios, dbGetScenarioById, dbSaveSimulation } from '../db/database.js';

export function getScenarios(req, res) {
  try {
    const scenarios = dbGetScenarios();
    return res.json({
      success: true,
      count: scenarios.length,
      data: scenarios
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getScenarioById(req, res) {
  try {
    const { id } = req.params;
    const scenario = dbGetScenarioById(id);
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

    // Persist simulation result to database
    try {
      dbSaveSimulation(result);
    } catch (dbErr) {
      console.warn('Simulation database persistence notice:', dbErr.message);
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

