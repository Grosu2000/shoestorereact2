import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus 
} from '../controllers/order.controller';

const router = Router();


router.post('/', authMiddleware, createOrder);
router.get('/my-orders', authMiddleware, getUserOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/status', authMiddleware, updateOrderStatus);

export default router;