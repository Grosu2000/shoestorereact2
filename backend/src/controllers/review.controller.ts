import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Отримати всі відгуки для товару (тільки схвалені)
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId, isApproved: true },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.review.count({ where: { productId, isApproved: true } })
    ]);

    const ratingData = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    res.json({
      success: true,
      data: {
        reviews: reviews.map(r => ({
          id: r.id,
          productId: r.productId,
          userId: r.userId,
          userName: r.user.name,
          rating: r.rating,
          comment: r.comment,
          reply: r.reply,
          likes: r.likes,
          dislikes: r.dislikes,
          isVerifiedPurchase: r.isVerifiedPurchase,
          createdAt: r.createdAt,
        })),
        averageRating: ratingData._avg.rating || 0,
        totalReviews: ratingData._count.rating,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, error: 'Помилка отримання відгуків' });
  }
};

// Створити відгук (потребує схвалення)
export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Необхідно авторизуватися' });
    }

    // Перевіряємо, чи купував користувач цей товар
    const orders = await prisma.order.findMany({
      where: { userId, status: 'DELIVERED' },
    });

    let hasPurchased = false;
    for (const order of orders) {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      if (Array.isArray(items) && items.some((item: any) => item.productId === productId)) {
        hasPurchased = true;
        break;
      }
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        comment,
        isVerifiedPurchase: hasPurchased,
        isApproved: false, // Потребує схвалення адміном
      },
    });

    res.status(201).json({
      success: true,
      data: review,
      message: 'Відгук надіслано на модерацію',
    });
  } catch (error: any) {
    console.error('Create review error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Ви вже залишили відгук на цей товар' });
    }
    res.status(500).json({ success: false, error: 'Помилка створення відгуку' });
  }
};

// Оновити рейтинг товару
const updateProductRating = async (productId: string) => {
  const ratingData = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: ratingData._avg.rating || 0,
      reviewCount: ratingData._count.rating,
    },
  });
};

// ========== АДМІН МОДЕРАЦІЯ ==========

// Отримати всі відгуки (для адміна)
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status === 'pending') where.isApproved = false;
    if (status === 'approved') where.isApproved = true;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, images: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.review.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        reviews: reviews.map(r => ({
          id: r.id,
          productId: r.productId,
          productName: r.product.name,
          productImage: r.product.images?.[0] || null,
          userId: r.userId,
          userName: r.user.name,
          userEmail: r.user.email,
          rating: r.rating,
          comment: r.comment,
          reply: r.reply,
          likes: r.likes,
          dislikes: r.dislikes,
          isVerifiedPurchase: r.isVerifiedPurchase,
          isApproved: r.isApproved,
          createdAt: r.createdAt,
        })),
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ success: false, error: 'Помилка отримання відгуків' });
  }
};

// Схвалити відгук
export const approveReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: true },
    });
    await updateProductRating(review.productId);
    res.json({ success: true, message: 'Відгук схвалено' });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ success: false, error: 'Помилка схвалення відгуку' });
  }
};

// Відхилити/видалити відгук
export const rejectReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ success: false, error: 'Відгук не знайдено' });
    
    const productId = review.productId;
    await prisma.review.delete({ where: { id } });
    await updateProductRating(productId);
    res.json({ success: true, message: 'Відгук видалено' });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({ success: false, error: 'Помилка видалення відгуку' });
  }
};

// Додати відповідь адміна на відгук
export const addReplyToReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const review = await prisma.review.update({
      where: { id },
      data: { reply },
    });
    res.json({ success: true, data: review, message: 'Відповідь додано' });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ success: false, error: 'Помилка додавання відповіді' });
  }
};

// Отримати статистику відгуків для адміна
export const getReviewsStats = async (req: Request, res: Response) => {
  try {
    const total = await prisma.review.count();
    const pending = await prisma.review.count({ where: { isApproved: false } });
    const approved = await prisma.review.count({ where: { isApproved: true } });
    const averageRating = await prisma.review.aggregate({ _avg: { rating: true }, where: { isApproved: true } });
    res.json({ success: true, data: { total, pending, approved, averageRating: averageRating._avg.rating || 0 } });
  } catch (error) {
    console.error('Get reviews stats error:', error);
    res.status(500).json({ success: false, error: 'Помилка отримання статистики' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = (req as any).user?.userId;

    const existingReview = await prisma.review.findFirst({
      where: { id, userId },
    });

    if (!existingReview) {
      return res.status(404).json({ success: false, error: 'Відгук не знайдено' });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { rating, comment },
    });

    await updateProductRating(review.productId);

    res.json({ success: true, data: review, message: 'Відгук оновлено' });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, error: 'Помилка оновлення відгуку' });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    const existingReview = await prisma.review.findFirst({
      where: userRole === 'ADMIN' ? { id } : { id, userId },
    });

    if (!existingReview) {
      return res.status(404).json({ success: false, error: 'Відгук не знайдено' });
    }

    const productId = existingReview.productId;
    await prisma.review.delete({ where: { id } });
    await updateProductRating(productId);

    res.json({ success: true, message: 'Відгук видалено' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, error: 'Помилка видалення відгуку' });
  }
};

export const likeReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(type === 'like' ? { likes: { increment: 1 } } : { dislikes: { increment: 1 } }),
      },
    });

    res.json({ success: true, data: { likes: review.likes, dislikes: review.dislikes } });
  } catch (error) {
    console.error('Like review error:', error);
    res.status(500).json({ success: false, error: 'Помилка' });
  }
};