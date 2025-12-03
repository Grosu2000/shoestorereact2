import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

// Тимчасові тестові дані
const mockOrders = [
  {
    id: '1',
    userId: 'user1',
    items: [
      {
        product: {
          id: '1',
          name: 'Кросівки Nike Air Max',
          price: 2499,
          image: '/images/products/nike-air-max.jpg',
          brand: 'Nike',
          sizes: ['39', '40', '41'],
          colors: ['Чорний', 'Білий'],
          inStock: true,
          stockQuantity: 15,
          rating: 4.5,
          reviewCount: 128,
          description: 'Комфортні кросівки для щоденного носіння',
          category: 'Кросівки',
          features: [],
          material: 'Шкіра',
          releaseYear: 2024,
          country: 'Вʼєтнам',
          createdAt: '2024-01-15',
          images: ['/images/products/nike-air-max.jpg']
        },
        quantity: 1,
        selectedSize: '42',
        selectedColor: 'Чорний'
      }
    ],
    total: 2499,
    status: 'delivered' as const,
    shippingAddress: {
      firstName: 'Іван',
      lastName: 'Петренко',
      email: 'ivan@example.com',
      phone: '+380123456789',
      address: 'м. Київ, вул. Примерна, 123',
      city: 'Київ',
      postalCode: '01001'
    },
    paymentMethod: 'card',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-22'
  },
  {
    id: '2',
    userId: 'user1',
    items: [
      {
        product: {
          id: '2',
          name: 'Кросівки Adidas Ultraboost',
          price: 3299,
          image: '/images/products/adidas-ultraboost.jpg',
          brand: 'Adidas',
          sizes: ['40', '41', '42'],
          colors: ['Білий', 'Синій'],
          inStock: true,
          stockQuantity: 8,
          rating: 4.8,
          reviewCount: 95,
          description: 'Технологічні кросівки для бігу',
          category: 'Кросівки',
          features: [],
          material: 'Сітка',
          releaseYear: 2024,
          country: 'Китай',
          createdAt: '2024-02-10',
          images: ['/images/products/adidas-ultraboost.jpg']
        },
        quantity: 2,
        selectedSize: '41',
        selectedColor: 'Білий'
      }
    ],
    total: 6598,
    status: 'processing' as const,
    shippingAddress: {
      firstName: 'Іван',
      lastName: 'Петренко',
      email: 'ivan@example.com',
      phone: '+380123456789',
      address: 'м. Київ, вул. Примерна, 123',
      city: 'Київ',
      postalCode: '01001'
    },
    paymentMethod: 'liqpay',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15'
  }
];

export const OrderHistoryPage: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Очікує підтвердження';
      case 'processing': return 'В обробці';
      case 'shipped': return 'Відправлено';
      case 'delivered': return 'Доставлено';
      case 'cancelled': return 'Скасовано';
      default: return status;
    }
  };

  if (mockOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Історія замовлень</h1>
            <p className="text-gray-600 mb-8">У вас ще немає замовлень</p>
            <Link to="/products">
              <Button size="lg">
                Перейти до покупок
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Історія замовлень</h1>

        <div className="space-y-6">
          {mockOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Замовлення #{order.id}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Дата замовлення: {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Спосіб оплати: {order.paymentMethod === 'card' ? 'Банківська карта' : 
                                     order.paymentMethod === 'cash' ? 'Готівка' : 
                                     order.paymentMethod === 'liqpay' ? 'LiqPay' : order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {order.total} грн
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Товари:</h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.selectedSize} • {item.selectedColor} • {item.quantity} шт.
                          </p>
                          <p className="text-sm text-gray-600">{item.product.brand}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {item.product.price * item.quantity} грн
                        </p>
                        <p className="text-sm text-gray-600">{item.product.price} грн/шт</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Адреса доставки: {order.shippingAddress.city}, {order.shippingAddress.address}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Деталі замовлення
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};