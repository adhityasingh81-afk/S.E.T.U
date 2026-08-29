import { generateStrategies } from '../services/recoveryService.js';
import { simulateRipple } from '../services/rippleService.js';

export function getRecoveryStrategies(req, res) {
  try {
    const { disruptionState, weights } = req.body;

    let activeState = disruptionState;
    if (!activeState) {
      activeState = simulateRipple('sup-taiwan-semi', 40, 45, 'Taiwan Seismic/Geopolitical');
    }

    const result = generateStrategies(activeState, weights);

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
