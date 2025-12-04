import { api } from './api';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

export const adminApi = {
  
  getStats: () => 
    api.get<{ 
      stats: DashboardStats; 
      recentOrders: any[]; 
      lowStockProducts: any[] 
    }>('/admin/stats'),
  
  
  getAllOrders: () => 
    api.get<{ orders: any[] }>('/admin/orders'),
  
  updateOrderStatus: (id: string, status: string) => 
    api.put<{ order: any }>(`/admin/orders/${id}/status`, { status }),
  
  
  getAllProducts: () => 
    api.get<{ products: any[] }>('/admin/products'),
  
  createProduct: (data: FormData) => 
    api.post<{ product: any }>('/admin/products', data),
  
  updateProduct: (id: string, data: FormData) => 
    api.put<{ product: any }>(`/admin/products/${id}`, data),
  
  deleteProduct: (id: string) => 
    api.delete(`/admin/products/${id}`),
};