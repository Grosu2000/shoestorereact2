import { api } from './api';

export interface LiqPayConfig {
  data: string;
  signature: string;
}

export const paymentApi = {
  
  createLiqPayPayment: (orderId: string, amount: number, description: string) =>
    api.post<LiqPayConfig>('/payment/create-payment', {
      orderId,
      amount,
      description,
    }),
  
  
  checkPaymentStatus: (orderId: string) =>
    api.get<{ status: string }>(`/payment/check/${orderId}`),
};