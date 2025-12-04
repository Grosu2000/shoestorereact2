import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  createPayment, 
  paymentCallback, 
  checkPayment 
} from '../controllers/payment.controller';

const router = Router();

// Захищені маршрути
router.post('/create-payment', authMiddleware, createPayment);
router.get('/check/:orderId', authMiddleware, checkPayment);

// Public callback для LiqPay
router.post('/callback', paymentCallback);

export default router;