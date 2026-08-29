import express from 'express';
import { calculateScore, getRadar } from '../controllers/resilienceController.js';

const router = express.Router();

router.post('/score', calculateScore);
router.get('/radar', getRadar);

export default router;
