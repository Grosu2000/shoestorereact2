// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

// Функція для генерації JWT токена
const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Валідація
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Будь ласка, заповніть всі поля' 
      });
    }

    // Перевірка чи користувач вже існує
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Користувач з таким email вже існує' 
      });
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створення користувача
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER'
      }
    });

    // Генерація токена
    const token = generateToken(user.id, user.email, user.role);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка сервера при реєстрації',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Валідація
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Будь ласка, введіть email та пароль' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Невірний email або пароль' 
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Невірний email або пароль' 
      });
    }

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка сервера при вході',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  // У JWT логаут робиться на клієнті (видалення токена)
  res.json({ 
    success: true, 
    message: 'Успішний вихід з системи' 
  });
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // authMiddleware додає user в req
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Не авторизовано' 
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Користувач не знайдений' 
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка сервера',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { name, email } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Не авторизовано' 
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) {
      // Перевірити чи email не зайнятий іншим користувачем
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: 'Цей email вже використовується' 
        });
      }
      updateData.email = email;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({
      success: true,
      data: { user },
      message: 'Профіль успішно оновлено'
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка сервера при оновленні профілю',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Не авторизовано' 
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Будь ласка, введіть поточний та новий пароль' 
      });
    }

    // Отримати користувача з паролем
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Користувач не знайдений' 
      });
    }

    // Перевірити поточний пароль
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Поточний пароль невірний' 
      });
    }

    // Хешувати новий пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    res.json({
      success: true,
      message: 'Пароль успішно змінено'
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка сервера при зміні пароля',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Токен недійсний' 
      });
    }
    
    res.json({
      success: true,
      data: { 
        valid: true, 
        user: {
          userId: user.userId,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    console.error('Verify token error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка сервера',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};