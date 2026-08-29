import express from 'express';
import { generateExecutiveReport } from '../controllers/reportController.js';

const router = express.Router();

router.post('/executive', generateExecutiveReport);

export default router;
