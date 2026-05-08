import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Валідація реєстрації
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Невірний формат email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Пароль повинен містити мінімум 8 символів')
    .matches(/[0-9]/)
    .withMessage('Пароль повинен містити хоча б одну цифру')
    .matches(/[a-zA-Z]/)
    .withMessage('Пароль повинен містити хоча б одну літеру'),
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Ім\'я повинно містити від 2 до 50 символів')
    .trim(),
];

// Валідація логіну
export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Невірний формат email'),
  body('password').notEmpty().withMessage('Пароль обов\'язковий'),
];

// Валідація створення продукту
export const validateProduct = [
  body('name').isLength({ min: 3, max: 100 }).trim().withMessage('Назва повинна містити від 3 до 100 символів'),
  body('price').isFloat({ min: 0 }).withMessage('Ціна повинна бути додатнім числом'),
  body('description').isLength({ min: 10, max: 2000 }).trim().withMessage('Опис повинен містити від 10 до 2000 символів'),
  body('category').notEmpty().withMessage('Категорія обов\'язкова'),
  body('brand').notEmpty().withMessage('Бренд обов\'язковий'),
];

// Middleware для перевірки помилок валідації
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: (err as any).path || (err as any).param || 'unknown',
        message: err.msg,
      })),
    });
  }
  next();
};