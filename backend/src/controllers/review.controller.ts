import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Отримати всі відгуки для товару
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Отримуємо середній рейтинг
    const ratingData = await prisma.review.aggregate({
      where: { productId },
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
          likes: r.likes,
          dislikes: r.dislikes,
          isVerifiedPurchase: r.isVerifiedPurchase,
          createdAt: r.createdAt,
        })),
        averageRating: ratingData._avg.rating || 0,
        totalReviews: ratingData._count.rating,
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка отримання відгуків',
    });
  }
};

// Створити відгук
export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Необхідно авторизуватися',
      });
    }

    // Перевіряємо, чи купував користувач цей товар
    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: 'DELIVERED',
      },
      select: { items: true },
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
      },
    });

    // Оновлюємо середній рейтинг товару
    const ratingData = await prisma.review.aggregate({
      where: { productId },
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

    // Отримуємо інформацію про користувача
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    res.status(201).json({
      success: true,
      data: {
        id: review.id,
        productId: review.productId,
        userId: review.userId,
        userName: user?.name || 'Користувач',
        rating: review.rating,
        comment: review.comment,
        likes: review.likes,
        dislikes: review.dislikes,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt,
      },
      message: 'Відгук додано',
    });
  } catch (error: any) {
    console.error('Create review error:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Ви вже залишили відгук на цей товар',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Помилка створення відгуку',
    });
  }
};

// Оновити відгук
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = (req as any).user?.userId;

    const existingReview = await prisma.review.findFirst({
      where: { id, userId },
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        error: 'Відгук не знайдено',
      });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { rating, comment },
    });

    // Оновлюємо рейтинг товару
    const ratingData = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: ratingData._avg.rating || 0,
        reviewCount: ratingData._count.rating,
      },
    });

    res.json({
      success: true,
      data: review,
      message: 'Відгук оновлено',
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка оновлення відгуку',
    });
  }
};

// Видалити відгук
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    const existingReview = await prisma.review.findFirst({
      where: userRole === 'ADMIN' ? { id } : { id, userId },
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        error: 'Відгук не знайдено',
      });
    }

    const productId = existingReview.productId;

    await prisma.review.delete({ where: { id } });

    // Оновлюємо рейтинг товару
    const ratingData = await prisma.review.aggregate({
      where: { productId },
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

    res.json({
      success: true,
      message: 'Відгук видалено',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка видалення відгуку',
    });
  }
};

// Лайк/Дизлайк відгуку
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

    res.json({
      success: true,
      data: { likes: review.likes, dislikes: review.dislikes },
    });
  } catch (error) {
    console.error('Like review error:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка',
    });
  }
};