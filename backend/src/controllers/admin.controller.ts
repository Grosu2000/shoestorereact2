import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Отримання всіх замовлень (для адміна)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentStatus,
      startDate,
      endDate 
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    // Фільтри
    const where: any = {};
    
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Отримання замовлень - ВИКОРИСТОВУЄМО SELECT
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
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
        items: true,           // JSON поле
        shippingInfo: true,    // JSON поле
        notes: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error: any) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка отримання замовлень'
    });
  }
};

// Отримання деталей замовлення (для адміна)
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        deliveryMethod: true,
        paymentData: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        items: true,
        shippingInfo: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
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
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка отримання деталей замовлення'
    });
  }
};

// Оновлення замовлення (для адміна)
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, deliveryMethod, notes } = req.body;

    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (deliveryMethod) updateData.deliveryMethod = deliveryMethod;
    if (notes !== undefined) updateData.notes = notes;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Немає даних для оновлення'
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: { order },
      message: 'Замовлення оновлено'
    });

  } catch (error: any) {
    console.error('Update order error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Замовлення не знайдено'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Помилка оновлення замовлення'
    });
  }
};

// Статистика замовлень (для адміна)
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const totalOrders = await prisma.order.count({ where });
    
    const totalRevenueResult = await prisma.order.aggregate({
      where,
      _sum: { total: true }
    });

    const recentOrders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenueResult._sum.total || 0,
        recentOrders
      }
    });

  } catch (error: any) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка отримання статистики'
    });
  }
};