import { 
  getSuppliersList, 
  getSupplierDetails, 
  processNegotiationRound, 
  generateMOUDocument 
} from '../services/negotiationService.js';
import { dbSaveMOU, dbGetMOUs } from '../db/database.js';

export function getSuppliers(req, res) {
  try {
    const suppliers = getSuppliersList();
    return res.json({ success: true, data: suppliers });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getSupplierById(req, res) {
  try {
    const { supplierId } = req.params;
    const supplier = getSupplierDetails(supplierId);
    return res.json({ success: true, data: supplier });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function advanceNegotiation(req, res) {
  try {
    const { supplierId, currentStep, userProposal } = req.body;
    const result = processNegotiationRound(supplierId || 'sup-phoenix-semi', currentStep || 1, userProposal);
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function createMOU(req, res) {
  try {
    const { supplierId, customTerms } = req.body;
    const mou = generateMOUDocument(supplierId || 'sup-phoenix-semi', customTerms || {});
    
    // Persist MOU in SQLite database
    try {
      dbSaveMOU(mou);
    } catch (dbErr) {
      console.warn('MOU database save notice:', dbErr.message);
    }

    return res.json({ success: true, data: mou });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getMOUsHistory(req, res) {
  try {
    const mous = dbGetMOUs();
    return res.json({ success: true, count: mous.length, data: mous });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

