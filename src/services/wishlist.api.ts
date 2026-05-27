import { api } from './api';
import type { Product } from '../types/product';

export const wishlistApi = {
  get: () => api.get<{ success: boolean; data: Product[] }>('/wishlist'),
  add: (productId: string) => api.post<{ success: boolean; message: string }>('/wishlist', { productId }),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
};