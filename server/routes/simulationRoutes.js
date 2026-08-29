import express from 'express';
import { getScenarios, getScenarioById, runSimulation } from '../controllers/simulationController.js';

const router = express.Router();

router.get('/scenarios', getScenarios);
router.get('/scenarios/:id', getScenarioById);
router.post('/ripple', runSimulation);

export default router;
