import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus
} from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Захищені маршрути
router.post('/', authMiddleware, createOrder);
router.get('/user', authMiddleware, getUserOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/status', authMiddleware, updateOrderStatus);

export default router;