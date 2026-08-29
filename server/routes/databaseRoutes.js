import express from 'express';
import { dbGetStats, dbGetRecentSimulations, dbGetMOUs, dbGetExecutiveReports } from '../db/database.js';

const router = express.Router();

// GET /api/db/stats
router.get('/stats', (req, res) => {
  try {
    const stats = dbGetStats();
    return res.json({ success: true, data: stats });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/db/simulations
router.get('/simulations', (req, res) => {
  try {
    const limit = Number(req.query.limit) || 15;
    const history = dbGetRecentSimulations(limit);
    return res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/db/mous
router.get('/mous', (req, res) => {
  try {
    const mous = dbGetMOUs();
    return res.json({ success: true, count: mous.length, data: mous });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/db/reports
router.get('/reports', (req, res) => {
  try {
    const limit = Number(req.query.limit) || 15;
    const reports = dbGetExecutiveReports(limit);
    return res.json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
