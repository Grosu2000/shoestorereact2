// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Токен не надано' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Токен не надано' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Додаємо дані користувача до запиту
    (req as any).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Токен закінчився' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Недійсний токен' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка автентифікації' 
    });
  }
};