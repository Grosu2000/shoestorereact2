import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { orderApi } from '../services/order.api';
import type { Order, OrderItem } from '../services/order.api';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      navigate('/');
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderApi.getById(orderId!);
      setOrder(response.order);
    } catch (error: any) {
      showToast('Помилка завантаження замовлення', 'error');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Завантаження інформації про замовлення...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {/* Іконка успіху */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Замовлення успішно створено!
          </h1>
          
          {order && (
            <>
              <p className="text-gray-600 mb-6">
                Номер вашого замовлення: <span className="font-semibold text-gray-900">{order.orderNumber}</span>
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Деталі замовлення:</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Сума:</span>
                    <span className="font-semibold">{order.total.toFixed(2)} грн</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Спосіб доставки:</span>
                    <span className="font-semibold">
                      {order.deliveryMethod === 'nova-poshta' ? 'Нова Пошта' :
                       order.deliveryMethod === 'ukr-poshta' ? 'Укрпошта' : 'Кур\'єр'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Спосіб оплати:</span>
                    <span className="font-semibold">
                      {order.paymentMethod === 'cash' ? 'Готівка при отриманні' :
                       order.paymentMethod === 'liqpay' ? 'LiqPay' : 'Банківська карта'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Статус:</span>
                    <span className={`font-semibold ${
                      order.status === 'PENDING' ? 'text-yellow-600' :
                      order.status === 'PROCESSING' ? 'text-blue-600' :
                      order.status === 'SHIPPED' ? 'text-purple-600' :
                      order.status === 'DELIVERED' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {order.status === 'PENDING' ? 'Очікує підтвердження' :
                       order.status === 'PROCESSING' ? 'В обробці' :
                       order.status === 'SHIPPED' ? 'Відправлено' :
                       order.status === 'DELIVERED' ? 'Доставлено' : 'Скасовано'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders" className="sm:w-auto w-full">
              <Button size="lg" className="w-full sm:w-auto">
                Переглянути всі замовлення
              </Button>
            </Link>
            <Link to="/products" className="sm:w-auto w-full">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Продовжити покупки
              </Button>
            </Link>
          </div>

          <p className="text-gray-500 text-sm mt-8">
            Дякуємо за покупку! Інформацію про статус замовлення ви можете переглядати в особистому кабінеті.
          </p>
        </div>
      </div>
    </div>
  );
};