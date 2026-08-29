import { 
  getSuppliersList, 
  getSupplierDetails, 
  processNegotiationRound, 
  generateMOUDocument 
} from '../services/negotiationService.js';

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
    return res.json({ success: true, data: mou });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
