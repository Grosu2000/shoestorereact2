import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

// Функція очищення об'єкта від XSS
const sanitizeObject = (obj: any): any => {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    return xss(obj.trim());
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

// Middleware для очищення вхідних даних
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};