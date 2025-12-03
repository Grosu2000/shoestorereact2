import { api } from './api';
import type { Product } from '../types/product';

export const productService = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (data: Omit<Product, 'id' | 'createdAt'>) => api.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  search: (query: string) => api.get<Product[]>(`/products/search?q=${query}`),
};