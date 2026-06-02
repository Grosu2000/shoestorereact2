import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// ==================== ЗАМОВЛЕННЯ ====================

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, name: true } } }
    });
    const parsedOrders = orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      shippingInfo: typeof order.shippingInfo === 'string' ? JSON.parse(order.shippingInfo) : order.shippingInfo
    }));
    res.json({ success: true, data: { orders: parsedOrders } });
  } catch (error: any) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, error: 'Помилка отримання замовлень' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.update({ where: { id }, data: { status } });
    res.json({ success: true, data: { order }, message: 'Статус замовлення оновлено' });
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: 'Помилка оновлення статусу' });
  }
};

// ==================== ТОВАРИ (CRUD) ====================

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { products } });
  } catch (error: any) {
    console.error('Get all products error:', error);
    res.status(500).json({ success: false, error: 'Помилка отримання товарів' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log('Create product request body:', req.body);
    
    const { name, price, description, category, brand, sizes, colors, sizeColorMatrix, material, features } = req.body;

    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
    }

    const slug = name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-').replace(/--+/g, '-');

    let parsedSizes = [];
    try { parsedSizes = sizes ? JSON.parse(sizes) : []; } catch(e) { parsedSizes = []; }
    
    let parsedColors = [];
    try { parsedColors = colors ? JSON.parse(colors) : []; } catch(e) { parsedColors = []; }
    
    let parsedMatrix = {};
    try { parsedMatrix = sizeColorMatrix ? JSON.parse(sizeColorMatrix) : {}; } catch(e) { parsedMatrix = {}; }

    let totalStock = 0;
    Object.values(parsedMatrix).forEach((colorMap: any) => {
      Object.values(colorMap).forEach((stock: any) => { totalStock += stock || 0; });
    });

    let parsedFeatures = [];
    if (features && typeof features === 'string') {
      parsedFeatures = features.split(',').map((f: string) => f.trim()).filter(Boolean);
    }

    const product = await prisma.product.create({
      data: {
        name, slug, price: parseFloat(price), description, category, brand,
        sizes: parsedSizes, colors: parsedColors, sizeColorMatrix: parsedMatrix,
        stock: totalStock, inStock: totalStock > 0,
        material: material || '', features: parsedFeatures, images,
      }
    });

    res.status(201).json({ success: true, data: { product }, message: 'Товар успішно створено' });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, error: 'Помилка створення товару' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.brand) updateData.brand = req.body.brand;
    if (req.body.material) updateData.material = req.body.material;
    
    if (req.body.sizes) {
      try { updateData.sizes = JSON.parse(req.body.sizes); } catch(e) { updateData.sizes = []; }
    }
    if (req.body.colors) {
      try { updateData.colors = JSON.parse(req.body.colors); } catch(e) { updateData.colors = []; }
    }
    if (req.body.sizeColorMatrix) {
      try { 
        const matrix = JSON.parse(req.body.sizeColorMatrix);
        let totalStock = 0;
        Object.values(matrix).forEach((colorMap: any) => {
          Object.values(colorMap).forEach((stock: any) => { totalStock += stock || 0; });
        });
        updateData.sizeColorMatrix = matrix;
        updateData.stock = totalStock;
        updateData.inStock = totalStock > 0;
      } catch(e) {}
    }
    
    if (req.body.features && typeof req.body.features === 'string') {
      updateData.features = req.body.features.split(',').map((f: string) => f.trim()).filter(Boolean);
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImages = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
      const existingProduct = await prisma.product.findUnique({ where: { id }, select: { images: true } });
      updateData.images = [...(existingProduct?.images || []), ...newImages];
    }

    const product = await prisma.product.update({ where: { id }, data: updateData });
    res.json({ success: true, data: { product }, message: 'Товар успішно оновлено' });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: 'Помилка оновлення товару' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id }, select: { images: true } });
    if (product?.images) {
      product.images.forEach(image => {
        const imagePath = path.join(__dirname, '../../public', image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      });
    }
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Товар успішно видалено' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, error: 'Помилка видалення товару' });
  }
};

export const deleteProductImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const product = await prisma.product.findUnique({ where: { id }, select: { images: true } });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    const updatedImages = product.images.filter(img => img !== imageUrl);
    await prisma.product.update({ where: { id }, data: { images: updatedImages } });
    const filePath = path.join(__dirname, '../../public', imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete product image error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete image' });
  }
};

// ==================== СТАТИСТИКА ====================

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({ _sum: { total: true } });
    const totalProducts = await prisma.product.count();
    const totalUsers = await prisma.user.count();
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
    const processingOrders = await prisma.order.count({ where: { status: 'PROCESSING' } });
    const shippedOrders = await prisma.order.count({ where: { status: 'SHIPPED' } });
    const deliveredOrders = await prisma.order.count({ where: { status: 'DELIVERED' } });

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders, totalRevenue: totalRevenue._sum.total || 0,
          totalProducts, totalUsers,
          pendingOrders, processingOrders, shippedOrders, deliveredOrders
        }
      }
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Помилка отримання статистики' });
  }
};