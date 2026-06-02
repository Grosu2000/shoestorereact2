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

export interface GetProductReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  reply: string | null;
  likes: number;
  dislikes: number;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}


export const reviewApi = {
  getByProduct: (productId: string, page: number = 1) => {
  const url = `/products/${productId}/reviews?page=${page}&_=${Date.now()}`;
  return fetch(url, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  }).then(res => res.json());
},

  create: (productId: string, data: { rating: number; comment: string }) =>
    api.post<{ success: boolean; data: Review; message: string }>(`/products/${productId}/reviews`, data),

  like: (reviewId: string, type: 'like' | 'dislike') =>
    api.post<{ success: boolean; data: { likes: number; dislikes: number } }>(`/reviews/${reviewId}/like`, { type }),

  // Адмін методи
  getAllForAdmin: (status?: string) =>
    api.get<{ success: boolean; data: { reviews: AdminReview[]; pagination: any } }>(`/admin/reviews${status ? `?status=${status}` : ''}`),

  approve: (reviewId: string) =>
    api.post<{ success: boolean; message: string }>(`/admin/reviews/${reviewId}/approve`, {}),

  reject: (reviewId: string) =>
    api.delete(`/admin/reviews/${reviewId}/reject`),

  addReply: (reviewId: string, reply: string) =>
    api.post<{ success: boolean; message: string }>(`/admin/reviews/${reviewId}/reply`, { reply }),
};