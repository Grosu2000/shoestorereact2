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

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
  };
}

export const reviewApi = {
  getProductReviews: (productId: string) =>
    api.get<ReviewsResponse>(`/products/${productId}/reviews`),

  createReview: (productId: string, data: { rating: number; comment: string }) =>
    api.post<{ success: boolean; data: Review; message: string }>(
      `/products/${productId}/reviews`,
      data
    ),

  updateReview: (reviewId: string, data: { rating: number; comment: string }) =>
    api.put<{ success: boolean; data: Review }>(`/reviews/${reviewId}`, data),

  deleteReview: (reviewId: string) =>
    api.delete(`/reviews/${reviewId}`),

  likeReview: (reviewId: string, type: 'like' | 'dislike') =>
    api.post<{ success: boolean; data: { likes: number; dislikes: number } }>(
      `/reviews/${reviewId}/like`,
      { type }
    ),
};