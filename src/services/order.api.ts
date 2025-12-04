
import { api } from './api';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: 'nova-poshta' | 'ukr-poshta' | 'courier';
  paymentMethod: 'card' | 'cash' | 'liqpay';
  total: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shippingInfo: ShippingAddress;
  paymentMethod: string;
  deliveryMethod: string;
  createdAt: string;
  updatedAt: string;
}

export const orderApi = {
  create: (data: CreateOrderData) => 
    api.post<{ order: Order }>('/orders', data),
  
  getMyOrders: () => 
    api.get<{ orders: Order[] }>('/orders/my-orders'),
  
  getById: (id: string) => 
    api.get<{ order: Order }>(`/orders/${id}`),
  
  updateStatus: (id: string, status: Order['status']) => 
    api.put<{ order: Order }>(`/orders/${id}/status`, { status }),
  
  cancelOrder: (id: string) => 
    api.put<{ order: Order }>(`/orders/${id}/status`, { status: 'CANCELLED' }),
};