import express from 'express';
import { 
  getNodes, 
  getNodeById, 
  getRoutes, 
  getCompanyProfile 
} from '../controllers/networkController.js';

const router = express.Router();

router.get('/nodes', getNodes);
router.get('/nodes/:id', getNodeById);
router.get('/routes', getRoutes);
router.get('/company', getCompanyProfile);

export default router;
