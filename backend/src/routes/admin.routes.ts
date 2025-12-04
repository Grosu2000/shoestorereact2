import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; // Додано імпорт fs
import { 
  getAllOrders, 
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getDashboardStats
} from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// Налаштування multer для завантаження зображень
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    // Створюємо папку, якщо її немає
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Тільки зображення дозволені (jpeg, jpg, png, webp)!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Застосувати middleware авторизації та адміна до всіх маршрутів
router.use(authMiddleware, adminMiddleware);

// ========== СТАТИСТИКА ==========
router.get('/stats', getDashboardStats);

// ========== ЗАМОВЛЕННЯ ==========
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// ========== ТОВАРИ ==========
router.get('/products', getAllProducts);
router.post('/products', upload.array('images', 5), createProduct); // До 5 зображень
router.put('/products/:id', upload.array('images', 5), updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;