import { api } from './api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  likes: number;
  dislikes: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export const reviewApi = {
  getByProduct: (productId: string) =>
    api.get<{ data: { reviews: Review[]; averageRating: number; totalReviews: number } }>(`/products/${productId}/reviews`),

  create: (productId: string, data: { rating: number; comment: string }) =>
    api.post<{ data: Review }>(`/products/${productId}/reviews`, data),

  update: (reviewId: string, data: { rating: number; comment: string }) =>
    api.put<{ data: Review }>(`/reviews/${reviewId}`, data),

  delete: (reviewId: string) =>
    api.delete(`/reviews/${reviewId}`),

  like: (reviewId: string, type: 'like' | 'dislike') =>
    api.post<{ data: { likes: number; dislikes: number } }>(`/reviews/${reviewId}/like`, { type }),
};