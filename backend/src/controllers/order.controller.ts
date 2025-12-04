import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log('Creating order with data:', req.body);
    
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Не авторизовано' 
      });
    }

    const { items, shippingAddress, deliveryMethod, paymentMethod, total, notes } = req.body;

    
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        items: JSON.parse(JSON.stringify(items || [])),
        shippingInfo: JSON.parse(JSON.stringify(shippingAddress || {})),
        total: parseFloat(total) || 0,
        deliveryMethod: deliveryMethod || 'nova-poshta',
        paymentMethod: paymentMethod || 'cash',
        notes: notes || '',
        status: paymentMethod === 'cash' ? 'PENDING' : 'PROCESSING',
        paymentStatus: 'PENDING'
      }
    });

    console.log('Order created successfully:', order.id);

    
    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    res.status(201).json({
      success: true,
      data: { 
        order: {
          ...order,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
          shippingInfo: typeof order.shippingInfo === 'string' ? JSON.parse(order.shippingInfo) : order.shippingInfo
        } 
      },
      message: 'Замовлення створено успішно'
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка створення замовлення',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    
    const parsedOrders = orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      shippingInfo: typeof order.shippingInfo === 'string' ? JSON.parse(order.shippingInfo) : order.shippingInfo
    }));

    res.json({
      success: true,
      data: { orders: parsedOrders }
    });
  } catch (error: any) {
    console.error('Get user orders error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка отримання замовлень' 
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const order = await prisma.order.findFirst({
      where: { 
        id,
        userId
      }
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Замовлення не знайдено' 
      });
    }

    
    const parsedOrder = {
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      shippingInfo: typeof order.shippingInfo === 'string' ? JSON.parse(order.shippingInfo) : order.shippingInfo
    };

    res.json({
      success: true,
      data: { order: parsedOrder }
    });
  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка отримання замовлення' 
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user?.userId;

    const order = await prisma.order.update({
      where: { 
        id,
        userId
      },
      data: { status }
    });

    res.json({
      success: true,
      data: { order },
      message: 'Статус замовлення оновлено'
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка оновлення статусу' 
    });
  }
};