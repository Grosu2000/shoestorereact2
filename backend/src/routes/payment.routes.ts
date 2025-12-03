import { Router } from 'express';
import { 
  createLiqPayPayment, 
  liqPayCallback,
  checkPaymentStatus 
} from '../controllers/payment.controller'; // ← Імпорт з payment.controller
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Захищені маршрути
router.post('/create-payment', authMiddleware, createLiqPayPayment);
router.get('/status/:orderId', authMiddleware, checkPaymentStatus);

// Публічний callback від LiqPay
router.post('/callback', liqPayCallback);

export default router;