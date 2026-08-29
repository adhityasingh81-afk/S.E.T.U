import express from 'express';
import { login, getUsers } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.get('/users', getUsers);

export default router;
