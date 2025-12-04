import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Не авторизовано' 
      });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        error: 'Доступ заборонено. Потрібні права адміністратора' 
      });
    }

    next();
  } catch (error: any) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка перевірки прав доступу' 
    });
  }
};