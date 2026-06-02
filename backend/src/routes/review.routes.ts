import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  getAllReviews,
  approveReview,
  rejectReview,
  addReplyToReview,
  getReviewsStats,
} from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.get('/', getProductReviews);

router.post('/', authMiddleware, createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);
router.post('/:id/like', authMiddleware, likeReview);

export default router;

export const adminReviewRouter = Router();
adminReviewRouter.use(authMiddleware, adminMiddleware);
adminReviewRouter.get('/', getAllReviews);
adminReviewRouter.get('/stats', getReviewsStats);
adminReviewRouter.post('/:id/approve', approveReview);
adminReviewRouter.delete('/:id/reject', rejectReview);
adminReviewRouter.post('/:id/reply', addReplyToReview);