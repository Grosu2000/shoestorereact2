import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Захист всіх wishlsit маршрутів авторизацією
router.use(authMiddleware);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;