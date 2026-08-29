import express from 'express';
import { login, getUsers, updateProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.get('/users', getUsers);
router.put('/profile', updateProfile);

export default router;

