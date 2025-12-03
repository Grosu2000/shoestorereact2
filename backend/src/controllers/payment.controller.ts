import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

// Створення платежу LiqPay
export const createLiqPayPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { orderId, amount, description } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Не авторизовано' 
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        paymentStatus: { not: 'PAID' }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Замовлення не знайдено або вже оплачене'
      });
    }

    const publicKey = process.env.LIQPAY_PUBLIC_KEY!;
    const privateKey = process.env.LIQPAY_PRIVATE_KEY!;

    const data = {
      public_key: publicKey,
      version: '3',
      action: 'pay',
      amount: amount,
      currency: 'UAH',
      description: description || `Замовлення #${order.orderNumber}`,
      order_id: orderId,
      result_url: `${process.env.FRONTEND_URL}/orders/${orderId}`,
      server_url: `${process.env.BACKEND_URL}/api/payment/callback`,
      language: 'uk',
      sandbox: process.env.NODE_ENV === 'development' ? '1' : '0'
    };

    const dataBase64 = Buffer.from(JSON.stringify(data)).toString('base64');
    
    const signatureString = privateKey + dataBase64 + privateKey;
    const signature = crypto.createHash('sha1').update(signatureString).digest('base64');

    await prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentStatus: 'PROCESSING',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        data: dataBase64,
        signature,
        orderId,
        amount
      }
    });

  } catch (error: any) {
    console.error('Create LiqPay payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка створення платежу'
    });
  }
};

// Callback від LiqPay
export const liqPayCallback = async (req: Request, res: Response) => {
  try {
    const { data, signature } = req.body;
    
    if (!data || !signature) {
      return res.status(400).json({ error: 'Missing data or signature' });
    }

    const privateKey = process.env.LIQPAY_PRIVATE_KEY!;
    
    const expectedSignature = crypto
      .createHash('sha1')
      .update(privateKey + data + privateKey)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString());
    
    console.log('LiqPay callback received:', decodedData);

    const updateData: any = {
      paymentData: decodedData,
      updatedAt: new Date()
    };

    if (decodedData.status === 'success') {
      updateData.status = 'PROCESSING';
      updateData.paymentStatus = 'PAID';
    } else if (decodedData.status === 'failure') {
      updateData.status = 'CANCELLED';
      updateData.paymentStatus = 'FAILED';
    }

    await prisma.order.update({
      where: { id: decodedData.order_id },
      data: updateData
    });

    res.json({ success: true });

  } catch (error: any) {
    console.error('LiqPay callback error:', error);
    res.status(500).json({ error: error.message || 'Callback processing failed' });
  }
};

// Перевірка статусу платежу
export const checkPaymentStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Не авторизовано' 
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Замовлення не знайдено'
      });
    }

    res.json({
      success: true,
      data: {
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    });

  } catch (error: any) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Помилка перевірки статусу'
    });
  }
};