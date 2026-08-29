import express from 'express';
import { getRecoveryStrategies } from '../controllers/recoveryController.js';

const router = express.Router();

router.post('/optimize', getRecoveryStrategies);

export default router;
