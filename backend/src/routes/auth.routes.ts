import { Router } from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Публічні маршрути
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Захищені маршрути (потрібен токен)
router.get('/me', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.get('/verify', authMiddleware, verifyToken);

export default router;