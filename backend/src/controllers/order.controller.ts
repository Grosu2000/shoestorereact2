import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Створення замовлення
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Не авторизовано' 
      });
    }

    const { 
      items, 
      shippingAddress, 
      deliveryMethod = 'nova-poshta', 
      paymentMethod = 'card', 
      total, 
      notes = '' 
    } = req.body;

    // Валідація
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Кошик порожній' 
      });
    }

    if (!shippingAddress || !total) {
      return res.status(400).json({ 
        success: false, 
        error: 'Відсутні обов\'язкові поля' 
      });
    }

    // Генерація номера замовлення
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Створення замовлення
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        items: items, // JSON поле
        shippingInfo: shippingAddress, // JSON поле
        total: parseFloat(total),
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod,
        deliveryMethod,
        notes
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        deliveryMethod: true,
        createdAt: true,
        items: true,
        shippingInfo: true,
        notes: true
      }
    });

    res.status(201).json({
      success: true,
      data: { order },
      message: 'Замовлення створено'
    });

  } catch (error: any) {
    console.error('Create order error:', error);
    
    // Обробка помилок Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false, 
        error: 'Помилка унікальності замовлення' 
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Помилка створення замовлення'
    });
  }
};

// Отримання всіх замовлень користувача
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Не авторизовано' 
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        deliveryMethod: true,
        createdAt: true,
        updatedAt: true,
        items: true,
        shippingInfo: true,
        paymentData: true,
        notes: true
      }
    });

    const total = await prisma.order.count({ 
      where: { userId } 
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка отримання замовлень'
    });
  }
};

// Отримання замовлення по ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Не авторизовано' 
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        deliveryMethod: true,
        createdAt: true,
        updatedAt: true,
        items: true,
        shippingInfo: true,
        paymentData: true,
        notes: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Замовлення не знайдено'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка отримання замовлення'
    });
  }
};

// Оновлення статусу замовлення
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Немає даних для оновлення'
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: { order },
      message: 'Статус замовлення оновлено'
    });

  } catch (error: any) {
    console.error('Update order status error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Замовлення не знайдено'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Помилка оновлення статусу'
    });
  }
};