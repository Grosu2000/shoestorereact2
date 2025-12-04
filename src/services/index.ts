// src/services/index.ts
export { api } from './api';

// Експортуємо з order.api
export { orderApi } from './order.api';
export type { 
  Order, 
  OrderItem, 
  ShippingAddress, 
  CreateOrderData 
} from './order.api';

// Експортуємо з payment.api
export { paymentApi } from './payment.api';
export type { LiqPayConfig } from './payment.api';