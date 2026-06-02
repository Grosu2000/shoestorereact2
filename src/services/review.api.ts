import { api } from './api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  reply?: string;
  likes: number;
  dislikes: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

export const reviewApi = {
  getByProduct: (productId: string, page: number = 1) =>
    api.get<ReviewsResponse>(`/products/${productId}/reviews?page=${page}`),

  create: (productId: string, data: { rating: number; comment: string }) =>
    api.post<{ success: boolean; data: Review; message: string }>(`/products/${productId}/reviews`, data),

  like: (reviewId: string, type: 'like' | 'dislike') =>
    api.post<{ success: boolean; data: { likes: number; dislikes: number } }>(`/reviews/${reviewId}/like`, { type }),
};