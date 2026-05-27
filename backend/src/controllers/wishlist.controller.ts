import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getWishlist = async (req: Request, res: Response) => {
  try {
    console.log('[WISHLIST] GET request received');
    const userId = (req as any).user?.userId;
    console.log('[WISHLIST] userId from token:', userId);
    
    if (!userId) {
      console.log('[WISHLIST] No userId, returning 401');
      return res.status(401).json({ success: false, error: 'Не авторизовано' });
    }

    console.log('[WISHLIST] Querying database...');
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log('[WISHLIST] Found items count:', items.length);

    return res.status(200).json({ success: true, data: items.map(item => item.product) });
  } catch (error) {
    console.error('[WISHLIST ERROR]', error);
    return res.status(500).json({ success: false, error: 'Помилка отримання списку', details: String(error) });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    console.log('[WISHLIST] POST request received');
    console.log('[WISHLIST] Request body:', req.body);
    
    const userId = (req as any).user?.userId;
    console.log('[WISHLIST] userId from token:', userId);
    
    const { productId } = req.body;
    console.log('[WISHLIST] productId:', productId);

    if (!userId) {
      console.log('[WISHLIST] No userId, returning 401');
      return res.status(401).json({ success: false, error: 'Не авторизовано' });
    }

    if (!productId) {
      console.log('[WISHLIST] No productId, returning 400');
      return res.status(400).json({ success: false, error: 'productId обов\'язковий' });
    }

    console.log('[WISHLIST] Checking if already exists...');
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } }
    });

    if (existing) {
      console.log('[WISHLIST] Item already exists');
      return res.status(400).json({ success: false, error: 'Товар вже у списку' });
    }

    console.log('[WISHLIST] Creating wishlist item...');
    await prisma.wishlistItem.create({
      data: { userId, productId }
    });

    console.log('[WISHLIST] Created successfully');
    return res.status(201).json({ success: true, message: 'Товар додано до списку бажаних' });
  } catch (error) {
    console.error('[WISHLIST ADD ERROR]', error);
    return res.status(500).json({ success: false, error: 'Помилка додавання', details: String(error) });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    console.log('[WISHLIST] DELETE request received');
    const userId = (req as any).user?.userId;
    const { productId } = req.params;
    console.log('[WISHLIST] userId:', userId, 'productId:', productId);

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Не авторизовано' });
    }

    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } }
    });

    console.log('[WISHLIST] Deleted successfully');
    return res.json({ success: true, message: 'Товар видалено зі списку бажаних' });
  } catch (error) {
    console.error('[WISHLIST DELETE ERROR]', error);
    return res.status(500).json({ success: false, error: 'Помилка видалення' });
  }
};