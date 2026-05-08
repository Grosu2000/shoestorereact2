import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

// Blacklist токенів (в майбутньому можна зберігати в Redis)
const tokenBlacklist = new Set<string>();

export const addToBlacklist = (token: string) => {
  tokenBlacklist.add(token);
  // Автоматичне очищення через 7 днів
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 7 * 24 * 60 * 60 * 1000);
};

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Доступ заборонено. Токен не надано',
      });
    }

    // Перевірка в blacklist
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        success: false,
        error: 'Токен недійсний. Будь ласка, увійдіть знову',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Токен застарів. Будь ласка, увійдіть знову',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Невірний токен',
      });
    }
    res.status(401).json({
      success: false,
      error: 'Помилка автентифікації',
    });
  }
};

// Middleware для перевірки ролі адміністратора
export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Доступ заборонено. Потрібні права адміністратора',
    });
  }
  next();
};