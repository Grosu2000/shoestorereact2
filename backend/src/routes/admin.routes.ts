import { Router } from 'express';
import { adminMiddleware } from '../middleware/admin.middleware';
import { 
  getStats, 
  getUsers, 
  updateUserRole, 
  getOrders 
} from '../controllers/admin.controller';

const router = Router();

router.use(adminMiddleware);

router.get('/stats', getStats);

router.get('/users', getUsers);
router.patch('/users/:userId/role', updateUserRole);

router.get('/orders', getOrders);

export default router;