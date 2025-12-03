import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// Реєстрація
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

    // Перевірка, чи користувач вже існує
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
        name,
        password: hashedPassword,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Генерація JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Реєстрація успішна'
    });

  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка реєстрації'
    });
  }
};

// Логін
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

    // Пошук користувача
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Невірний email або пароль'
      });
    }

    // Перевірка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Невірний email або пароль'
      });
    }

    // Генерація JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Видаляємо пароль з відповіді
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Вхід успішний'
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка входу'
    });
  }
};

// Отримати профіль користувача
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Отримати користувача
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
        error: 'Користувача не знайдено'
      });
    }

    // Отримати статистику замовлень
    const orderStats = await prisma.order.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: { total: true }
    });

    // Отримати останні замовлення
    const recentOrders = await prisma.order.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        ...user,
        orderCount: orderStats._count.id || 0,
        totalSpent: orderStats._sum.total || 0,
        recentOrders
      }
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка завантаження профілю'
    });
  }
};

// Оновити профіль
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Валідація
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Ім\'я обов\'язкове'
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email обов\'язковий'
      });
    }

    // Перевірити, чи email вже використовується
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email вже використовується'
        });
      }
    }

    // Оновити користувача
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        name: name.trim(),
        email: email.trim()
      },
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
      data: updatedUser,
      message: 'Профіль успішно оновлено'
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка оновлення профілю'
    });
  }
};

// Змінити пароль
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Валідація
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Будь ласка, заповніть всі поля'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Новий пароль має містити щонайменше 6 символів'
      });
    }

    // Отримати користувача з паролем
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Користувача не знайдено'
      });
    }

    // Перевірити поточний пароль
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Поточний пароль невірний'
      });
    }

    // Хешування нового пароля
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Оновити пароль
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
      error: error.message || 'Помилка зміни пароля'
    });
  }
};

// Вихід (просто повертає успіх)
export const logout = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Вихід успішний'
  });
};

// Перевірка токена (для middleware)
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Користувача не знайдено'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error: any) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка перевірки токена'
    });
  }
};