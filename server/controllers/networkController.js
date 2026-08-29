import { COMPANY_PROFILE } from '../../src/data/auraSupplyChainData.js';
import { dbGetNodes, dbGetNodeById, dbGetRoutes } from '../db/database.js';

export function getNodes(req, res) {
  try {
    const { type, tier } = req.query;
    const nodes = dbGetNodes({ type, tier });
    return res.json({ success: true, count: nodes.length, data: nodes });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getNodeById(req, res) {
  try {
    const { id } = req.params;
    const node = dbGetNodeById(id);
    if (!node) {
      return res.status(404).json({ success: false, error: 'Node not found' });
    }
    return res.json({ success: true, data: node });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getRoutes(req, res) {
  try {
    const routes = dbGetRoutes();
    return res.json({ success: true, count: routes.length, data: routes });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getCompanyProfile(req, res) {
  try {
    return res.json({ success: true, data: COMPANY_PROFILE });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

