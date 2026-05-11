import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
} from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../validators/auth.validator';

const router = Router({ mergeParams: true });

// Публічний маршрут
router.get('/', getProductReviews);

// Захищені маршрути
router.post(
  '/',
  authMiddleware,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Рейтинг має бути від 1 до 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Коментар не більше 1000 символів'),
  handleValidationErrors,
  createReview
);

router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);
router.post('/:id/like', authMiddleware, likeReview);

export default router;