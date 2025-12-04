import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();


export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
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
    console.error('Get all orders error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка отримання замовлень' 
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      data: { order },
      message: 'Статус замовлення оновлено'
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка оновлення статусу' 
    });
  }
};


export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log('Create product request body:', req.body);
    console.log('Files:', req.files);
    
    const { 
      name, 
      price, 
      description, 
      category, 
      brand, 
      sizes, 
      colors, 
      stock, 
      material, 
      features 
    } = req.body;

    let images: string[] = [];
    
    if (req.files && Array.isArray(req.files)) {
      images = (req.files as Express.Multer.File[]).map(file => 
        `/uploads/${file.filename}`
      );
    }

    const slug = name.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');

    const parsedSizes = sizes ? JSON.parse(sizes) : [];
    const parsedColors = colors ? colors.split(',').map((c: string) => c.trim()) : [];
    const parsedFeatures = features ? features.split(',').map((f: string) => f.trim()) : [];

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        price: parseFloat(price),
        description,
        category,
        brand,
        sizes: parsedSizes,
        colors: parsedColors,
        stock: parseInt(stock) || 0,
        material: material || '',
        features: parsedFeatures,
        images,
        inStock: parseInt(stock) > 0
      }
    });

    console.log('Product created:', product.id);

    res.status(201).json({
      success: true,
      data: { product },
      message: 'Товар успішно створено'
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка створення товару',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = req.body;

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) {
      updateData.stock = parseInt(updateData.stock);
      updateData.inStock = updateData.stock > 0;
    }
    if (updateData.sizes) updateData.sizes = JSON.parse(updateData.sizes);
    if (updateData.colors) updateData.colors = updateData.colors.split(',').map((c: string) => c.trim());
    if (updateData.features) updateData.features = updateData.features.split(',').map((f: string) => f.trim());

    if (req.files && Array.isArray(req.files)) {
      const newImages = (req.files as Express.Multer.File[]).map(file => 
        `/uploads/${file.filename}`
      );
      
      const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: { images: true }
      });
      
      const currentImages = existingProduct?.images || [];
      updateData.images = [...currentImages, ...newImages];
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: { product },
      message: 'Товар успішно оновлено'
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка оновлення товару' 
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { images: true }
    });

    if (product?.images) {
      product.images.forEach(image => {
        const imagePath = path.join(__dirname, '../../public', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Товар успішно видалено'
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка видалення товару' 
    });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { products }
    });
  } catch (error: any) {
    console.error('Get all products error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка отримання товарів' 
    });
  }
};


export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true }
    });
    const totalProducts = await prisma.product.count();
    const totalUsers = await prisma.user.count();

    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    });
    const processingOrders = await prisma.order.count({
      where: { status: 'PROCESSING' }
    });
    const shippedOrders = await prisma.order.count({
      where: { status: 'SHIPPED' }
    });
    const deliveredOrders = await prisma.order.count({
      where: { status: 'DELIVERED' }
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 10 } },
      take: 5
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalRevenue: totalRevenue._sum.total || 0,
          totalProducts,
          totalUsers,
          pendingOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders
        },
        recentOrders: recentOrders.map(order => ({
          ...order,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
          shippingInfo: typeof order.shippingInfo === 'string' ? JSON.parse(order.shippingInfo) : order.shippingInfo
        })),
        lowStockProducts
      }
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка отримання статистики' 
    });
  }
};