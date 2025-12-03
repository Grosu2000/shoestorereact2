import { Router } from 'express';
import { 
  getAllOrders, 
  getOrderDetails, 
  updateOrder, 
  getOrderStats 
} from '../controllers/admin.controller'; 

const router = Router();

router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetails);
router.put('/orders/:id', updateOrder);
router.get('/stats', getOrderStats);

export default router;