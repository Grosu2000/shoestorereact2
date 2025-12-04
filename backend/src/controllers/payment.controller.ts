import { Request, Response } from 'express';
import CryptoJS from 'crypto-js';
import crypto from 'crypto';

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, description } = req.body;
    
    
    const publicKey = process.env.LIQPAY_PUBLIC_KEY || 'sandbox_i1912973827';
    const privateKey = process.env.LIQPAY_PRIVATE_KEY || 'sandbox_SmU4xHiGYyskRKaVFBZXla2vAUg1UdLBdgv8Dcrb';
    
    
    const paymentData = {
      public_key: publicKey,
      version: '3',
      action: 'pay',
      amount: amount,
      currency: 'UAH',
      description: description || `Оплата замовлення #${orderId}`,
      order_id: orderId,
      sandbox: 1, 
      result_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-success/${orderId}`,
      server_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payment/callback`
    };
    
    
    const data = Buffer.from(JSON.stringify(paymentData)).toString('base64');
    
    
    const signatureString = privateKey + data + privateKey;
    const signature = crypto.createHash('sha1').update(signatureString).digest('base64');
    
    res.json({
      success: true,
      data: { data, signature }
    });
  } catch (error: any) {
    console.error('Create payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка створення платежу' 
    });
  }
};

export const paymentCallback = async (req: Request, res: Response) => {
  try {
    const { data, signature } = req.body;
    
    
    console.log('LiqPay callback received:', { data, signature });
    
    
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString());
    console.log('Decoded callback data:', decodedData);
    
    
    
    
    res.json({ success: true, message: 'Callback received' });
  } catch (error: any) {
    console.error('Payment callback error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка обробки callback' 
    });
  }
};

export const checkPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    
    
    
    
    res.json({
      success: true,
      data: { 
        status: 'pending', 
        orderId 
      }
    });
  } catch (error: any) {
    console.error('Check payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Помилка перевірки платежу' 
    });
  }
};