import express from 'express';
import { 
  getSuppliers, 
  getSupplierById, 
  advanceNegotiation, 
  createMOU 
} from '../controllers/negotiationController.js';

const router = express.Router();

router.get('/suppliers', getSuppliers);
router.get('/suppliers/:supplierId', getSupplierById);
router.post('/advance', advanceNegotiation);
router.post('/mou', createMOU);

export default router;
