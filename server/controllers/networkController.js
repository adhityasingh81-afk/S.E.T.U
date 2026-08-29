import { NODES, LOGISTICS_ROUTES, COMPANY_PROFILE } from '../../src/data/auraSupplyChainData.js';

export function getNodes(req, res) {
  try {
    const { type, tier } = req.query;
    let filtered = [...NODES];
    if (type) {
      filtered = filtered.filter(n => n.type === type);
    }
    if (tier) {
      filtered = filtered.filter(n => n.tier === Number(tier));
    }
    return res.json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getNodeById(req, res) {
  try {
    const { id } = req.params;
    const node = NODES.find(n => n.id === id);
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
    return res.json({ success: true, count: LOGISTICS_ROUTES.length, data: LOGISTICS_ROUTES });
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
