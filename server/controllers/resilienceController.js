import { getResilienceScore, getRadarMetrics } from '../services/resilienceService.js';

export function calculateScore(req, res) {
  try {
    const { activeStrategy, isDisrupted, severityPct } = req.body;

    const result = getResilienceScore(
      activeStrategy || null,
      isDisrupted !== undefined ? isDisrupted : false,
      severityPct || 0
    );

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getRadar(req, res) {
  try {
    const { budgetAllocations } = req.query;
    let parsedBudgets;
    if (budgetAllocations) {
      try {
        parsedBudgets = JSON.parse(budgetAllocations);
      } catch (e) {
        parsedBudgets = undefined;
      }
    }

    const result = getRadarMetrics(parsedBudgets);

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
